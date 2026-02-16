import { supabase } from './supabaseClient.js';
import { Discord } from './discord.js';
import { AuthService } from './services/AuthService.js';
import { EmployeeService } from './services/EmployeeService.js';
import { SalesService } from './services/SalesService.js';
import { TimeService } from './services/TimeService.js';
import { PayrollService } from './services/PayrollService.js';
import { ArchiveService } from './services/ArchiveService.js';
import { InventoryService } from './services/InventoryService.js';
import { RecruitmentService } from './services/RecruitmentService.js';
import { MiscService } from './services/MiscService.js';
import { ConfigService } from './services/ConfigService.js';
import { FinanceService } from './services/FinanceService.js';

export const store = {
    // --- AUTH DELEGATION ---
    async login(username, password) { return AuthService.login(username, password); },
    logout() { AuthService.logout(); },
    getCurrentUser() { return AuthService.getCurrentUser(); },
    _isLockActive(lock) { return AuthService._isLockActive(lock); },
    formatLockMeta(lock) { return AuthService.formatLockMeta(lock); },
    async fetchEmployeeAccountLock(id) { return AuthService.fetchEmployeeAccountLock(id); },
    
    isLockActiveForPermissions(perms) {
        if (!perms || !perms.lock) return false;
        return AuthService._isLockActive(perms.lock);
    },
    
    // --- PERMISSIONS (Kept here for now or moved to AuthService) ---
    getPermissionCatalog() {
        return [
            { key: 'employees.view', label: 'Voir les employés', roles: ['patron', 'co_patron', 'responsable'] },
            { key: 'employees.add', label: 'Ajouter des employés', roles: ['patron'] },
            { key: 'employees.manage', label: 'Gérer les employés', roles: ['patron'] },
            { key: 'employees.warnings', label: 'Gérer les avertissements', roles: ['patron', 'co_patron', 'responsable', 'chef_atelier'] },
            { key: 'sales.view_all', label: 'Voir toutes les factures', roles: ['patron', 'co_patron', 'responsable'] },
            { key: 'sales.manage', label: 'Gérer les factures', roles: ['patron'] },
            { key: 'sales.delete', label: 'Supprimer des factures', roles: ['patron'] },
            { key: 'sales.create', label: 'Créer des factures', roles: ['patron', 'co_patron', 'responsable', 'chef_atelier', 'mecano_confirme', 'mecano_junior', 'mecano_test'] },
            { key: 'stats.view', label: 'Voir les statistiques', roles: ['patron', 'co_patron', 'responsable'] },
            { key: 'pointeuse.view_all', label: 'Voir la pointeuse globale', roles: ['patron', 'co_patron', 'responsable', 'chef_atelier'] },
            { key: 'pointeuse.use', label: 'Utiliser la pointeuse', roles: ['patron', 'co_patron', 'responsable', 'chef_atelier', 'mecano_confirme', 'mecano_junior', 'mecano_test'] },
            { key: 'archives.view', label: 'Voir les archives', roles: ['patron', 'co_patron', 'responsable'] },
            { key: 'archives.manage', label: 'Gérer les archives', roles: ['patron', 'co_patron', 'responsable'] },
            { key: 'payroll.manage', label: 'Gérer la paie', roles: ['patron'] },
            { key: 'config.manage', label: 'Configuration', roles: ['patron'] },
            { key: 'contracts.view', label: 'Voir les contrats', roles: ['patron', 'co_patron', 'responsable'] },
            { key: 'contracts.manage', label: 'Gérer les contrats', roles: ['patron', 'co_patron'] },
            { key: 'time_entries.reset', label: 'Réinitialiser des pointages', roles: ['patron', 'co_patron', 'responsable'] },
            { key: 'recruitment.manage', label: 'Gérer le recrutement', roles: ['patron', 'co_patron', 'responsable'] },
            { key: 'training.manage', label: 'Gérer la formation', roles: ['patron', 'co_patron', 'responsable', 'chef_atelier'] }
        ];
    },

    async hasPermission(userOrId, key) {
        const user = typeof userOrId === 'string' ? await EmployeeService.getEmployeeById(userOrId) : userOrId;
        if (!user) return false;
        if (user.role === 'patron') return true;

        // Check locks
        if (user.accountLock && AuthService._isLockActive(user.accountLock)) return false;

        // Check DB perms
        const perms = await EmployeeService.fetchEmployeePermissions(user.id);
        if (perms && perms[key] !== undefined) return perms[key];

        // Check Role Defaults
        const catalog = this.getPermissionCatalog();
        const def = catalog.find(p => p.key === key);
        if (def && def.roles.includes(user.role)) return true;

        return false;
    },

    hasPermissionSync(user, key) {
        if (!user) return false;
        if (user.role === 'patron') return true;
        if (user.accountLock && AuthService._isLockActive(user.accountLock)) return false;

        const perms = EmployeeService.getCachedPermissions(user.id);
        if (perms && perms[key] !== undefined) return perms[key];

        const catalog = this.getPermissionCatalog();
        const def = catalog.find(p => p.key === key);
        if (def && def.roles.includes(user.role)) return true;
        return false;
    },

    async ensurePermission(userOrId, key, msg) {
        const allowed = await this.hasPermission(userOrId, key);
        if (!allowed) throw new Error(msg || 'Accès refusé.');
    },

    // --- CONFIG & WEBHOOKS ---
    async fetchWebhookSettings() { return ConfigService.fetchWebhookSettings(); },
    async saveWebhookSettings(salesUrl, servicesUrl, msgId, recUrl, brandUrl, patchUrl, kitUrl, kitRole) {
        return ConfigService.saveWebhookSettings(salesUrl, servicesUrl, msgId, recUrl, brandUrl, patchUrl, kitUrl, kitRole);
    },
    async setRecruitmentStatus(isOpen) { return ConfigService.setRecruitmentStatus(isOpen); },
    async setRecruitmentTargetCount(c) { return ConfigService.setRecruitmentTargetCount(c); },
    getRecruitmentTargetCount() { return ConfigService.getRecruitmentTargetCount(); },

    // --- FINANCE (Payouts, Taxes) ---
    async getLastArchiveDate() { return FinanceService.getLastArchiveDate(); },
    async fetchPayoutsSince(date) { return FinanceService.fetchPayoutsSince(date); },
    async recordPayout(eid, amount, start, end) { return FinanceService.recordPayout(eid, amount, start, end); },
    async fetchTaxPayments() { return FinanceService.fetchTaxPayments(); },
    async recordTaxPayment(data, uid) { return FinanceService.recordTaxPayment(data, uid); },

    // --- EMPLOYEES ---
    getEmployees() { return EmployeeService.getEmployees(); },
    async fetchEmployees() { return EmployeeService.fetchEmployees(); },
    async getEmployeeById(id) { return EmployeeService.getEmployeeById(id); },
    getEmployeeByIdSync(id) { return EmployeeService.getEmployees().find(e => e.id === id); },
    async saveEmployee(emp) { return EmployeeService.saveEmployee(emp); },
    async deleteEmployee(id) { return EmployeeService.deleteEmployee(id); },

    async computeEmployeeDue(employeeId) {
        const emp = await this.getEmployeeById(employeeId);
        if (!emp) throw new Error('Employé introuvable');
        
        const sales = await this.fetchSales();
        const time = await this.fetchTimeEntries();
        await this.fetchPayrollSettings();

        // Filter for this employee
        const empSales = sales.filter(s => String(s.employeeId) === String(employeeId));
        // For firing, we might want ALL time entries, or just current period?
        // Old logic: "active sessions included".
        // TimeService doesn't have a "fetch ALL including active" method easily exposed?
        // Actually fetchTimeEntries returns everything.
        // We just need to calculate it.
        
        return this.calculateTotalPay(emp, empSales, time, true);
    },

    async fireEmployee(employeeId, reason) {
        const emp = await this.getEmployeeById(employeeId);
        if (!emp) throw new Error("Employé introuvable");

        let due = null;
        try { due = await this.computeEmployeeDue(employeeId); } catch(e) { console.warn(e); }

        // 1. Delete Time Entries
        const { error: tErr } = await supabase.from('time_entries').delete().eq('employee_id', employeeId);
        if (tErr) console.error("Error deleting time entries", tErr);

        // 2. Delete Sales
        const { error: sErr } = await supabase.from('sales').delete().eq('employee_id', employeeId);
        if (sErr) console.error("Error deleting sales", sErr);

        // 3. Delete Employee
        await this.deleteEmployee(employeeId);

        // 4. Log
        Discord.logEmployeeFired(emp, reason, due);
    },

    async fetchEmployeePermissions(id) { return EmployeeService.fetchEmployeePermissions(id); },
    getCachedEmployeePermissions(id) { return EmployeeService.getCachedPermissions(id); },
    async saveEmployeePermissions(id, perms) { return EmployeeService.saveEmployeePermissions(id, perms); },
    async saveEmployeeCustomRate(id, rate) { return EmployeeService.saveEmployeeCustomRate(id, rate); },
    async savePayrollRate(id, rate) { return EmployeeService.saveEmployeeCustomRate(id, rate); },
    async lockAccount(id, reason, endDate) { return EmployeeService.lockAccount(id, reason, endDate); },
    async unlockAccount(id) { return EmployeeService.unlockAccount(id); },
    async updateLastActivity(id) { return EmployeeService.updateLastActivity(id); },
    async resetContractSignature(id) { return EmployeeService.resetContractSignature(id); },
    async fetchEmploymentContract(id) { return EmployeeService.fetchEmploymentContract(id); },
    async fetchAllEmploymentContracts() { return EmployeeService.fetchAllEmploymentContracts(); },
    async signEmploymentContract(payload) { return EmployeeService.signEmploymentContract(payload); },
    async fetchEmployeeProfile(id) { return EmployeeService.fetchEmployeeProfile(id); },
    async setEmployeeAccountLock(id, lockMeta) { return EmployeeService.setEmployeeAccountLock(id, lockMeta); },
    async clearEmployeeAccountLock(id) { return EmployeeService.clearEmployeeAccountLock(id); },
    async resetEmploymentContract(id) { return EmployeeService.resetContractSignature(id); },
    async addWarning(id, warning) { return EmployeeService.addWarning(id, warning); },
    async deleteWarning(id, wid) { return EmployeeService.deleteWarning(id, wid); },
    async updateEmployee(id, patch) { return EmployeeService.updateEmployee(id, patch); },
    async syncLastLoginWithActivity() { return EmployeeService.syncLastLoginWithActivity(); },

    // --- SALES ---
    getSales() { return SalesService.getSales(); },
    async fetchSales() { return SalesService.fetchSales(); },
    async fetchSalesPage(page, pageSize, filters) { return SalesService.fetchSalesPage(page, pageSize, filters); },
    async getSaleById(id) { return SalesService.getSaleById(id); },
    async saveSale(sale) { return SalesService.saveSale(sale); },
    async deleteSale(id) { return SalesService.deleteSale(id); },

    // --- TIME ---
    getTimeEntries() { return TimeService.getTimeEntries(); },
    async fetchTimeEntries() { return TimeService.fetchTimeEntries(); },
    async getActiveTimeEntry(id) { return TimeService.getActiveTimeEntry(id); },
    async clockIn(id) { 
        const emp = await this.getEmployeeById(id);
        return TimeService.clockIn(id, emp ? `${emp.first_name} ${emp.last_name}` : null); 
    },
    async clockOut(id) { 
        const emp = await this.getEmployeeById(id);
        return TimeService.clockOut(id, emp ? `${emp.first_name} ${emp.last_name}` : null); 
    },
    async pauseService(id) { return TimeService.pauseService(id); },
    async resumeService(id) { return TimeService.resumeService(id); },
    async autoCloseGhostServices(h) { return TimeService.autoCloseGhostServices(h); },
    async checkAndSanctionInactivity(h) { return TimeService.checkAndSanctionInactivity(h); },

    // --- PAYROLL ---
    async fetchPayrollSettings() { return PayrollService.fetchSettings(); },
    async savePayrollSettings(settings) { return PayrollService.saveSettings(settings); },
    calculateTotalPay(emp, sales, time) { return PayrollService.calculateTotalPay(emp, sales, time); },
    async syncGlobalSafeBalance() { 
        // Triggered by sales save usually
        // We can just broadcast or let the UI pull
        return 0; 
    },


    // --- ARCHIVES ---
    async fetchArchives() { return ArchiveService.fetchArchives(); },
    async deleteArchive(id) { return ArchiveService.deleteArchive(id); },
    async archiveAndReset(start, end) { return ArchiveService.archiveAndReset(start, end); },
    async updateArchivePaymentStatus(aid, eid, paid) { return ArchiveService.updatePaymentStatus(aid, eid, paid); },
    async resetWeek() { return ArchiveService.archiveAndReset(); }, // Alias

    // --- MISC ---
    async fetchRepairKitConfig() { return InventoryService.fetchRepairKitConfig(); },
    async createRepairKitOrder(name, qty, phone, avail) { return InventoryService.createOrder(name, qty, phone, avail); },
    async fetchRepairKitOrders() { return InventoryService.fetchOrders(); },
    
    async submitApplication(app) { return RecruitmentService.submitApplication(app); },
    async fetchApplications() { return RecruitmentService.fetchApplications(); },
    async updateApplicationStatus(id, status, reason) { return RecruitmentService.updateStatus(id, status, reason); },
    async deleteApplication(id) { return RecruitmentService.deleteApplication(id); },

    async createEmployeeFromApplication(app) {
        try {
            // Permission guard
            try {
                const me = this.getCurrentUser();
                await this.ensurePermission(me, 'employees.add', 'Accès refusé.');
            } catch (e) {
                throw e;
            }
            // If only an ID is passed, fetch full application
            let application = app;
            if (!application || !application.full_name) {
                const id = typeof app === 'string' ? app : app?.id;
                if (!id) throw new Error('Application introuvable');
                const rows = await RecruitmentService.fetchApplications();
                application = rows.find(r => String(r.id) === String(id));
                if (!application) throw new Error('Application introuvable');
            }

            // If an employee already exists for this discord, return it
            let existing = null;
            try {
                const discordId = application.discord_user_id || application.discord_id;
                if (discordId) {
                    const { data: existRows } = await supabase.from('employees').select('*').eq('discord_id', discordId).limit(1);
                    if (existRows && existRows.length) existing = existRows[0];
                }
            } catch (e) {}
            if (existing) {
                return { created: false, employee: existing, credentials: null };
            }

            const fullName = String(application.full_name || '').trim() || 'Candidat';
            const parts = fullName.split(/\s+/);
            const firstName = parts[0] || 'Candidat';
            const lastName = parts.slice(1).join(' ') || '';

            let username = null;
            let password = null;
            try {
                const r = await fetch('/api/credentials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'create', firstName })
                });
                if (r.ok) {
                    const j = await r.json();
                    if (j && j.ok) {
                        username = j.username;
                        password = j.password;
                    }
                }
            } catch (e) {}
            if (!username || !password) {
                const proper = (s) => {
                    const t = String(s || '').trim();
                    return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : 'User';
                };
                const base = proper(firstName) || 'User';
                username = base;
                password = base;
            }

            // Default role and permissions
            const role = 'mecano_test';
            const employeePayload = {
                firstName,
                lastName,
                phone: application.phone_ig || '',
                role,
                username,
                password,
                photo: null,
                discordId: application.discord_user_id || application.discord_id || null
            };

            let emp = null;
            try {
                emp = await EmployeeService.saveEmployee(employeePayload);
            } catch (e) {
                if (String(e?.message || '').toLowerCase().includes('unique') || String(e?.code || '').toLowerCase().includes('23505')) {
                    username = `${username}${Math.random().toString(36).slice(2, 4)}`;
                    emp = await EmployeeService.saveEmployee({ ...employeePayload, username });
                } else {
                    throw e;
                }
            }
            try {
                const defaultPerms = this.getRoleDefaultPermissions(role);
                await EmployeeService.saveEmployeePermissions(emp.id, defaultPerms);
            } catch (e) {}

            return { created: true, employee: emp, credentials: { username, password } };
        } catch (e) {
            console.error('createEmployeeFromApplication failed:', e);
            throw e;
        }
    },

    async fetchContracts() { return MiscService.fetchContracts(); },
    async saveContract(c) { return MiscService.saveContract(c); },
    async deleteContract(id) { return MiscService.deleteContract(id); },

    async fetchTombolaEntries() { return MiscService.fetchTombolaEntries(); },
    async addTombolaEntry(n, t) { return MiscService.addTombolaEntry(n, t); },
    async clearTombolaEntries() { return MiscService.clearTombola(); },

    async fetchTuningCatalog() { return MiscService.fetchTuningCatalog(); },
    async getTuningCatalog() { return MiscService.fetchTuningCatalog(); },
    async saveTuningItem(i) { return MiscService.saveTuningItem(i); },
    async deleteTuningItem(id) { return MiscService.deleteTuningItem(id); },

    async sendAnnouncement(msg, author) { return MiscService.sendAnnouncement(msg, author); },
    subscribeToAnnouncements(cb) { return MiscService.subscribeToAnnouncements(cb); },

    // --- STORAGE ---
    async uploadFile(file, folder = 'invoices') {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${folder}/${Date.now()}_${cleanName}`;
        const { error } = await supabase.storage.from('documents').upload(filePath, file);
        if (error) throw error;
        const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
        return data.publicUrl;
    },

    // --- HELPERS (Legacy & UI State) ---
    getDateFilter() {
        try {
            const start = localStorage.getItem('emp_filter_date_start');
            const end = localStorage.getItem('emp_filter_date_end');
            if (start && end) return { start: new Date(start), end: new Date(end) };
        } catch (e) {}
        return null;
    },
    setDateFilter(start, end) {
        try {
            if (start) localStorage.setItem('emp_filter_date_start', start.toISOString());
            else localStorage.removeItem('emp_filter_date_start');
            if (end) localStorage.setItem('emp_filter_date_end', end.toISOString());
            else localStorage.removeItem('emp_filter_date_end');
        } catch (e) {}
    },
    getPayrollRates() {
        try { return JSON.parse(localStorage.getItem('payroll_rates') || '{}'); } catch (e) { return {}; }
    },
    getCommissionRate() {
        try { return parseFloat(localStorage.getItem('commission_rate') || '0.20'); } catch (e) { return 0.20; }
    },
    getGradeRates() {
        try { return JSON.parse(localStorage.getItem('grade_rates') || '{}'); } catch (e) { return {}; }
    },
    getRoleDefaultPermissions(role) {
        const catalog = this.getPermissionCatalog();
        const perms = {};
        for (const p of catalog) {
            perms[p.key] = Array.isArray(p.roles) ? p.roles.includes(role) : false;
        }
        return perms;
    }
};
