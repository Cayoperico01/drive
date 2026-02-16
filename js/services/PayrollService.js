import { supabase } from '../supabaseClient.js';

export const PayrollService = {
    _settings: null,

    async fetchSettings() {
        let { data, error } = await supabase.from('payroll_settings').select('*').eq('id', 1).single();
        
        if (error && error.code === 'PGRST116') {
            // Create defaults with realistic RP economy values
            const defaults = {
                id: 1,
                commission_rate: 0.20,
                grade_rates: {
                    'mecano_test': 500,
                    'mecano_junior': 1500,
                    'mecano_confirme': 2000,
                    'chef_atelier': 2500,
                    'responsable': 3000,
                    'co_patron': 4000,
                    'patron': 5000
                },
                role_primes: { 'mecano_confirme': 20, 'mecano_junior': 20, 'chef_atelier': 20, 'patron': 60, 'co_patron': 60, 'responsable': 60 }
            };
            const { data: newData } = await supabase.from('payroll_settings').insert(defaults).select().single();
            data = newData;
        }

        if (data) {
            // Ensure role_primes has defaults
            const defaultPrimes = { 'mecano_confirme': 20, 'mecano_junior': 20, 'chef_atelier': 20, 'patron': 60, 'co_patron': 60, 'responsable': 60 };
            const defaultRates = {
                'mecano_test': 500,
                'mecano_junior': 1500,
                'mecano_confirme': 2000,
                'chef_atelier': 2500,
                'responsable': 3000,
                'co_patron': 4000,
                'patron': 5000
            };
            data.role_primes = { ...defaultPrimes, ...(data.role_primes || {}) };
            data.grade_rates = { ...defaultRates, ...(data.grade_rates || {}) };
        }
        
        this._settings = data;
        localStorage.setItem('db_payroll_settings', JSON.stringify(data));
        return data;
    },

    getSettings() {
        if (this._settings) return this._settings;
        try {
            return JSON.parse(localStorage.getItem('db_payroll_settings'));
        } catch (e) { return null; }
    },

    async saveSettings(settings) {
        const current = this.getSettings() || {};
        const updateData = {
            id: 1,
            commission_rate: settings.commission_rate ?? current.commission_rate,
            grade_rates: settings.grade_rates ?? current.grade_rates,
            role_primes: settings.role_primes ?? current.role_primes,
            company_split: settings.company_split,
            safe_balance: settings.safe_balance
        };

        const { data, error } = await supabase.from('payroll_settings').upsert(updateData).select().single();
        if (error) throw error;
        
        this._settings = data;
        localStorage.setItem('db_payroll_settings', JSON.stringify(data));
        return data;
    },

    // --- CALCULATION ENGINE ---

    calculateTotalPay(employee, empSales, timeEntries, includeActive = false) {
        const settings = this.getSettings() || { role_primes: {} };
        const rolePrimes = settings.role_primes || {};
        const gradeRates = settings.grade_rates || {};

        // Filter Sales for this employee (Safety check)
        const filteredSales = empSales.filter(s => String(s.employeeId) === String(employee.id));

        const totalMargin = filteredSales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);
        
        const effectiveRole = employee.role === 'mecano' ? 'mecano_confirme' : employee.role;
        const primePct = Number(rolePrimes[effectiveRole]);
        const commissionRate = (isFinite(primePct) && primePct >= 0) ? primePct / 100 : 0.20;
        
        const commission = totalMargin * commissionRate;

        // 2. Fixed Salary (Hours based)
        const empEntries = timeEntries.filter(t => {
            if (String(t.employee_id) !== String(employee.id)) return false;
            if (includeActive) return true;
            return !!t.clock_out;
        });

        const totalMs = empEntries.reduce((acc, t) => {
            const pausedMs = Number(t.pause_total_ms || 0);
            const start = new Date(t.clock_in);
            const end = t.clock_out ? new Date(t.clock_out) : (includeActive ? new Date() : start); // If not including active, diff is 0
            const diff = (end - start) - pausedMs;
            return acc + Math.max(0, diff);
        }, 0);
        const totalHours = totalMs / 3600000;

        let hourlyRate = employee.custom_rate;
        if (hourlyRate === undefined || hourlyRate === null) {
            hourlyRate = gradeRates[effectiveRole] || 0;
        }
        const fixedSalary = totalHours * Number(hourlyRate || 0);

        return {
            employeeId: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            role: employee.role,
            totalHours,
            hourlyRate: Number(hourlyRate || 0),
            commissionRate,
            totalSales: totalMargin,
            commission,
            fixedSalary,
            totalDue: fixedSalary + commission
        };
    },

    async updateSafeBalance(amount) {
        const { error } = await supabase.rpc('increment_safe_balance', { amount: Number(amount) });
        if (error) {
            console.warn("RPC safe balance failed, manual update");
            const s = await this.fetchSettings();
            const newBal = (Number(s.safe_balance) || 0) + Number(amount);
            await this.saveSettings({ safe_balance: newBal });
        }
    }
};
