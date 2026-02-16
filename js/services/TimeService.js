import { supabase } from '../supabaseClient.js';
import { Discord } from '../discord.js';
import { EmployeeService } from './EmployeeService.js';

export const TimeService = {
    _timeEntries: [],

    async fetchTimeEntries() {
        const { data, error } = await supabase.from('time_entries').select('*').order('clock_in', { ascending: false });
        if (error) {
            console.error('Error fetching time entries:', error);
            return [];
        }
        this._timeEntries = data;
        return data;
    },

    async _broadcastStatus() {
        try {
            const entries = await this.fetchTimeEntries();
            const employees = await EmployeeService.fetchEmployees();
            await Discord.updateServiceStatus(entries, employees);
        } catch (e) {
            console.error("Failed to broadcast Discord status", e);
        }
    },

    getTimeEntries() {
        return this._timeEntries;
    },

    async getActiveTimeEntry(employeeId) {
        const { data, error } = await supabase
            .from('time_entries')
            .select('*')
            .eq('employee_id', employeeId)
            .is('clock_out', null)
            .single();
        if (error && error.code !== 'PGRST116') return null;
        return data;
    },

    async clockIn(employeeId, employeeName) {
        const active = await this.getActiveTimeEntry(employeeId);
        if (active) throw new Error("Déjà en service !");

        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const { data, error } = await supabase.from('time_entries').insert({
            id,
            employee_id: employeeId,
            clock_in: new Date().toISOString()
        }).select().single();

        if (error) throw error;
        
        // Update presence
        supabase.from('employees').update({ 
            last_login: new Date().toISOString(),
            last_activity: new Date().toISOString()
        }).eq('id', employeeId).then(() => {});

        // Discord update
        setTimeout(() => this._broadcastStatus(), 500);

        return data;
    },

    async clockOut(employeeId, employeeName) {
        const active = await this.getActiveTimeEntry(employeeId);
        if (!active) throw new Error("Pas de service en cours !");

        const now = new Date();
        const { data, error } = await supabase.from('time_entries').update({
            clock_out: now.toISOString()
        }).eq('id', active.id).select().single();

        if (error) throw error;

        // Discord update
        setTimeout(() => this._broadcastStatus(), 500);
        
        return data;
    },

    async pauseService(employeeId) {
        const active = await this.getActiveTimeEntry(employeeId);
        if (!active) throw new Error("Pas de service en cours !");
        
        const now = new Date();
        const { data, error } = await supabase.from('time_entries').update({
            paused: true,
            pause_started: now.toISOString()
        }).eq('id', active.id).select().single();
        
        if (error) throw error;
        
        setTimeout(() => this._broadcastStatus(), 500);
        return data;
    },

    async resumeService(employeeId) {
        const active = await this.getActiveTimeEntry(employeeId);
        if (!active) throw new Error("Pas de service en cours !");
        if (!active.paused) throw new Error("Le service n'est pas en pause !");
        
        const now = new Date();
        const pauseStart = new Date(active.pause_started);
        const pauseDuration = now - pauseStart;
        const totalPause = (Number(active.pause_total_ms) || 0) + pauseDuration;
        
        const { data, error } = await supabase.from('time_entries').update({
            paused: false,
            pause_started: null,
            pause_total_ms: totalPause
        }).eq('id', active.id).select().single();
        
        if (error) throw error;
        
        setTimeout(() => this._broadcastStatus(), 500);
        return data;
    },

    async autoCloseGhostServices(thresholdHours = 12) {
        const { data: entries } = await supabase.from('time_entries').select('*').is('clock_out', null);
        if (!entries || !entries.length) return { count: 0 };

        const now = new Date();
        const ghosts = entries.filter(e => {
            const diff = (now - new Date(e.clock_in)) / 3600000;
            return diff >= thresholdHours;
        });

        if (!ghosts.length) return { count: 0 };

        const updates = ghosts.map(g => {
            const cappedOut = new Date(new Date(g.clock_in).getTime() + (thresholdHours * 3600000));
            return supabase.from('time_entries').update({ clock_out: cappedOut.toISOString() }).eq('id', g.id);
        });

        await Promise.all(updates);
        return { count: ghosts.length, employees: ghosts.map(g => g.employee_id) };
    },

    async updateLastActivity(employeeId) {
        await supabase.from('employees').update({ last_activity: new Date().toISOString() }).eq('id', employeeId);
    },

    async checkAndSanctionInactivity(thresholdHours = 2) {
        // 1. Get Active Entries (Working, not paused)
        const { data: entries } = await supabase.from('time_entries').select('*').is('clock_out', null).is('paused', false);
        if (!entries || !entries.length) return { count: 0 };

        // 2. Get Employees
        const ids = entries.map(e => e.employee_id);
        const { data: employees } = await supabase.from('employees').select('id, last_activity, first_name, last_name, warnings').in('id', ids);

        // 3. Get Recent Sales (activity check)
        const earliest = entries.reduce((min, e) => {
            const d = new Date(e.clock_in);
            return d < min ? d : min;
        }, new Date());
        
        const { data: recentSales } = await supabase.from('sales')
            .select('employee_id, date')
            .in('employee_id', ids)
            .gte('date', earliest.toISOString());

        const now = new Date();
        const inactive = [];

        for (const emp of employees) {
            const entry = entries.find(e => e.employee_id === emp.id);
            if (!entry) continue;

            let lastActivity = emp.last_activity ? new Date(emp.last_activity) : new Date(0);
            
            // Check Sales
            const empSales = recentSales.filter(s => s.employee_id === emp.id);
            if (empSales.length > 0) {
                const lastSale = empSales.reduce((max, s) => new Date(s.date) > max ? new Date(s.date) : max, new Date(0));
                if (lastSale > lastActivity) lastActivity = lastSale;
            }

            // Check Clock In
            const clockIn = new Date(entry.clock_in);
            if (clockIn > lastActivity) lastActivity = clockIn;

            const diff = (now - lastActivity) / 3600000;

            if (diff >= thresholdHours) {
                // Sanction
                let clockOut = lastActivity;
                if (lastActivity < clockIn) clockOut = clockIn;

                await supabase.from('time_entries').update({ clock_out: clockOut.toISOString() }).eq('id', entry.id);

                const newWarning = {
                    id: Date.now().toString(36),
                    type: 'avertissement',
                    reason: `Inactivité > ${thresholdHours}h. Fin de service forcée.`,
                    date: now.toISOString(),
                    given_by: 'Système Anti-AFK'
                };
                
                const warnings = [...(emp.warnings || []), newWarning];
                await supabase.from('employees').update({ warnings }).eq('id', emp.id);

                Discord.logSanction(`${emp.first_name} ${emp.last_name}`, "Système", "Avertissement Auto", newWarning.reason);
                inactive.push(`${emp.first_name} ${emp.last_name}`);
            }
        }
        return { count: inactive.length, names: inactive };
    }
};
