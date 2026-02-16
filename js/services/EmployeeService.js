import { supabase } from '../supabaseClient.js';
import { AuthService } from './AuthService.js';

export const EmployeeService = {
    _employees: [],
    _hiddenEmployees: new Set(),
    _permissionsCache: new Map(),

    async fetchEmployees() {
        this._loadHidden();
        let query = supabase.from('employees').select('id, first_name, last_name, phone, role, username, password, photo, custom_rate, created_at, warnings, discord_id, account_lock, last_login');
        
        const { data, error } = await query;
        if (error) {
            console.error('Error fetching employees:', error);
            return [];
        }

        this._employees = data
            .filter(e => !this._hiddenEmployees.has(String(e.id)))
            .map(e => ({ ...e, role: AuthService._normalizeRole(e.role) }));
            
        return this._employees;
    },

    getEmployees() {
        return this._employees;
    },

    async getEmployeeById(id) {
        const cached = this._employees.find(e => e.id === id);
        if (cached) return cached;
        
        const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
        if (error) return null;
        return { ...data, role: AuthService._normalizeRole(data.role) };
    },

    async saveEmployee(employee) {
        const payload = {
            first_name: employee.firstName,
            last_name: employee.lastName,
            phone: employee.phone,
            role: AuthService._normalizeRole(employee.role),
            username: employee.username,
            photo: employee.photo,
            discord_id: employee.discordId
        };
        
        if (employee.password) payload.password = employee.password;
        
        // ID handling logic (Insert vs Update)
        let query;
        if (employee.id && this._employees.find(e => e.id === employee.id)) {
            query = supabase.from('employees').update(payload).eq('id', employee.id);
        } else {
            payload.id = employee.id || crypto.randomUUID(); // Use modern UUID if possible or fallback
            if (!payload.password) throw new Error("Mot de passe requis pour création");
            query = supabase.from('employees').insert(payload);
        }

        const { data, error } = await query.select().single();
        if (error) throw error;

        const normalized = { ...data, role: AuthService._normalizeRole(data.role) };
        const idx = this._employees.findIndex(e => e.id === data.id);
        if (idx >= 0) this._employees[idx] = normalized;
        else this._employees.push(normalized);

        return normalized;
    },

    async deleteEmployee(id) {
        const { error } = await supabase.from('employees').delete().eq('id', id);
        if (error) {
            console.error("Delete failed, hiding locally", error);
            this._hideId(id);
        }
        this._employees = this._employees.filter(e => e.id !== id);
    },

    // Permissions
    async fetchEmployeePermissions(employeeId) {
        try {
            const { data, error } = await supabase.from('employee_permissions').select('permissions').eq('employee_id', employeeId).single();
            // PGRST116 = No rows found (normal for new employees)
            if (error && error.code !== 'PGRST116') {
                console.warn('Error fetching permissions:', error);
            }
            const perms = data?.permissions || {};
            this._permissionsCache.set(String(employeeId), perms);
            return perms;
        } catch (e) {
            console.error("Crash fetching permissions:", e);
            return {};
        }
    },

    async saveEmployeePermissions(employeeId, permissions) {
        const { error } = await supabase.from('employee_permissions').upsert({ employee_id: employeeId, permissions }).select();
        if (error) throw error;
        this._permissionsCache.set(String(employeeId), permissions);
        return true;
    },

    async saveEmployeeCustomRate(employeeId, rate) {
        const { error } = await supabase.from('employees').update({ custom_rate: rate }).eq('id', employeeId);
        if (error) throw error;
        
        // Update local cache
        const emp = this._employees.find(e => e.id === employeeId);
        if (emp) emp.custom_rate = rate;
    },

    getCachedPermissions(employeeId) {
        return this._permissionsCache.get(String(employeeId));
    },

    async fetchEmploymentContract(employeeId) {
        const { data, error } = await supabase.from('employment_contracts').select('*').eq('employee_id', employeeId).single();
        if (error) return null; // Table might not exist or no contract
        return data;
    },

    async fetchAllEmploymentContracts() {
        const { data, error } = await supabase.from('employment_contracts').select('*').order('signed_at', { ascending: false });
        if (error) return [];
        return data || [];
    },

    async signEmploymentContract(payload) {
        const toInsert = {
            employee_id: payload.employee_id,
            signature: payload.signature,
            content_html: payload.content_html,
            role_at_signature: payload.role_at_signature,
            signed_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from('employment_contracts').insert(toInsert).select().single();
        if (error) throw error;
        return data;
    },

    // Hidden Helpers
    _loadHidden() {
        try {
            const hidden = JSON.parse(localStorage.getItem('hidden_employees') || '[]');
            this._hiddenEmployees = new Set(hidden);
        } catch (e) {}
    },
    _hideId(id) {
        this._hiddenEmployees.add(String(id));
        localStorage.setItem('hidden_employees', JSON.stringify(Array.from(this._hiddenEmployees)));
    },

    // --- ACTIONS ---
    async lockAccount(id, reason, endDate) {
        const payload = {
            account_lock: {
                reason,
                start: new Date().toISOString(),
                end: new Date(endDate).toISOString(),
                by: AuthService.getCurrentUser()?.id || 'admin'
            }
        };
        const { error } = await supabase.from('employees').update(payload).eq('id', id);
        if (error) throw error;
    },

    async unlockAccount(id) {
         const { error } = await supabase.from('employees').update({ account_lock: null }).eq('id', id);
         if (error) throw error;
    },

    async setEmployeeAccountLock(id, lockMeta) {
         const payload = { account_lock: lockMeta };
         const { error } = await supabase.from('employees').update(payload).eq('id', id);
         if (error) throw error;
    },

    async clearEmployeeAccountLock(id) {
         const { error } = await supabase.from('employees').update({ account_lock: null }).eq('id', id);
         if (error) throw error;
    },

    async updateLastActivity(id) {
         await supabase.from('employees').update({ last_activity: new Date().toISOString() }).eq('id', id);
    },

    async resetContractSignature(id) {
         const { error } = await supabase.from('employment_contracts').delete().eq('employee_id', id);
         if (error) throw error;
    },

    async updateEmployee(id, patch) {
         const { data, error } = await supabase.from('employees').update(patch).eq('id', id).select().single();
         if (error) throw error;
         const normalized = { ...data, role: AuthService._normalizeRole(data.role) };
         const idx = this._employees.findIndex(e => e.id === data.id);
         if (idx >= 0) this._employees[idx] = normalized;
         else this._employees.push(normalized);
         return normalized;
    },

    async addWarning(employeeId, warning) {
         const { data: emp } = await supabase.from('employees').select('warnings, first_name, last_name').eq('id', employeeId).single();
         const list = Array.isArray(emp?.warnings) ? emp.warnings : [];
         const newWarning = {
             id: Date.now().toString(36),
             reason: String(warning.reason || '').trim(),
             author: String(warning.author || 'Système'),
             date: new Date().toISOString()
         };
         const next = [...list, newWarning];
         const { error } = await supabase.from('employees').update({ warnings: next }).eq('id', employeeId);
         if (error) throw error;
         const idx = this._employees.findIndex(e => e.id === employeeId);
         if (idx >= 0) this._employees[idx] = { ...this._employees[idx], warnings: next };
         return newWarning;
    },

    async deleteWarning(employeeId, warningId) {
         const { data: emp } = await supabase.from('employees').select('warnings').eq('id', employeeId).single();
         const list = Array.isArray(emp?.warnings) ? emp.warnings : [];
         const next = list.filter(w => String(w.id) !== String(warningId));
         const { error } = await supabase.from('employees').update({ warnings: next }).eq('id', employeeId);
         if (error) throw error;
         const idx = this._employees.findIndex(e => e.id === employeeId);
         if (idx >= 0) this._employees[idx] = { ...this._employees[idx], warnings: next };
         return true;
    },

    async fetchEmployeeProfile(employeeId) {
         // Try to correlate recruitment application by discord_id or full name
         const emp = await this.getEmployeeById(employeeId);
         if (!emp) return null;
         let rec = null;
         if (emp.discord_id) {
             const { data, error } = await supabase
                 .from('recruitment_applications')
                 .select('*')
                 .or(`discord_user_id.eq.${emp.discord_id},discord_id.eq.${emp.discord_id}`)
                 .order('created_at', { ascending: false })
                 .limit(1)
                 .single();
             if (!error && data) rec = data;
         }
         if (!rec) {
             const fullName = `${emp.first_name} ${emp.last_name}`.trim();
             const { data, error: e2 } = await supabase
                 .from('recruitment_applications')
                 .select('*')
                 .ilike('full_name', fullName)
                 .order('created_at', { ascending: false })
                 .limit(1)
                 .single();
             if (!e2 && data) rec = data;
         }
         if (!rec) return null;
         return {
             age: rec.age,
             discord_handle: rec.discord_id || rec.discord_user_id || null,
             unique_id: rec.unique_id,
             phone_ig: rec.phone_ig,
             availability: rec.availability,
             experience: rec.experience,
             motivation: rec.motivation
         };
    },

    async syncLastLoginWithActivity() {
         const { data: rows } = await supabase.from('employees').select('id, last_login, last_activity');
         if (!rows || !rows.length) return 0;
         const targets = rows.filter(r => !!r.last_login && (!r.last_activity || new Date(r.last_activity) < new Date(r.last_login)));
         if (!targets.length) return 0;
         await Promise.all(targets.map(t => 
             supabase.from('employees').update({ last_activity: t.last_login }).eq('id', t.id)
         ));
         return targets.length;
    }
};
