import { supabase } from '../supabaseClient.js';
import { generateId } from '../utils.js';

export const AuthService = {
    _currentUser: null,
    _accountLockCache: new Map(),

    _isOwnerRole(role) {
        return role === 'patron';
    },

    _normalizeRole(role) {
        if (!role) return '';
        const r = String(role).trim();
        if (r.toLowerCase() === 'responsable') return 'responsable';
        return r === 'mecano' ? 'mecano_confirme' : r;
    },

    getCurrentUser() {
        if (this._currentUser) return this._currentUser;
        const sessionStr = localStorage.getItem('imo_session');
        if (!sessionStr) return null;
        const session = JSON.parse(sessionStr);
        if (session.expiresAt < Date.now()) {
            this.logout();
            return null;
        }
        this._currentUser = session.user ? { ...session.user, role: this._normalizeRole(session.user.role) } : null;
        return this._currentUser;
    },

    async login(username, password) {
        const { data, error } = await supabase.rpc('authenticate_employee', { p_username: username, p_password: password });
        if (error) {
            const msg = error && error.message ? String(error.message) : '';
            if (msg === 'ACCOUNT_LOCKED') {
                const details = error.details ? String(error.details) : '';
                let meta = null;
                try { meta = details ? JSON.parse(details) : null; } catch (e) {}
                const err = new Error('Compte bloqué.');
                err.code = 'ACCOUNT_LOCKED';
                err.lockMeta = meta;
                throw err;
            }
            return null;
        }
        if (!data || !data.length) return null;

        const row = data[0];
        const user = {
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            role: this._normalizeRole(row.role),
            username: row.username,
            accountLock: row.account_lock || null
        };

        // Check locks
        let effectiveLock = user.accountLock;
        if (!this._isLockActive(effectiveLock)) {
            try { effectiveLock = await this.fetchEmployeeAccountLock(user.id); } catch (e) {}
        }
        if (this._isLockActive(effectiveLock)) {
            const err = new Error('Compte bloqué.');
            err.code = 'ACCOUNT_LOCKED';
            err.lockMeta = effectiveLock;
            throw err;
        }

        // Check permission locks
        // Note: Ideally we'd move fetchEmployeePermissions here but to avoid circular deps we might need to inject EmployeeService or handle it in Store
        // For now, we'll implement a basic check or rely on the Store to orchestrate.
        // We will implement basic permission fetching here as it's auth related.
        
        // Save session
        const remember = localStorage.getItem('remember_login') === '1';
        const days = remember ? 7 : 1;
        localStorage.setItem('imo_session', JSON.stringify({
            user: user,
            expiresAt: Date.now() + 3600000 * 24 * days
        }));
        this._currentUser = user;
        
        // Fire and forget last login update
        supabase.from('employees').update({ last_login: new Date().toISOString() }).eq('id', user.id).then(() => {});

        return user;
    },

    logout() {
        localStorage.removeItem('imo_session');
        this._currentUser = null;
        this._accountLockCache.clear();
    },

    // Lock Logic
    _isLockActive(lockMeta) {
        if (!lockMeta || typeof lockMeta !== 'object') return false;
        const reason = lockMeta.reason ? String(lockMeta.reason).trim() : '';
        if (!reason) return false;
        
        const now = Date.now();
        const startRaw = lockMeta.start;
        const endRaw = lockMeta.end;
        
        if (!startRaw || !endRaw) return false;
        
        const parseDate = (v) => {
            if (!v) return null;
            const d = new Date(v);
            return isNaN(d.getTime()) ? null : d.getTime();
        };

        const startMs = parseDate(startRaw);
        let endMs = parseDate(endRaw);
        
        // Adjust end date to end of day if it looks like YYYY-MM-DD
        if (String(endRaw).match(/^\d{4}-\d{2}-\d{2}$/)) {
            endMs += 24 * 3600 * 1000 - 1; 
        }

        return now >= startMs && now <= endMs;
    },

    async fetchEmployeeAccountLock(employeeId) {
        const cacheKey = String(employeeId);
        const cached = this._accountLockCache.get(cacheKey);
        if (cached && (Date.now() - cached.fetchedAt < 15000)) return cached.lockMeta;

        const { data, error } = await supabase.from('employees').select('account_lock').eq('id', employeeId).single();
        if (error) return null;
        
        this._accountLockCache.set(cacheKey, { lockMeta: data.account_lock, fetchedAt: Date.now() });
        return data.account_lock;
    },

    formatLockMeta(lockMeta) {
        if (!lockMeta || typeof lockMeta !== 'object') return null;
        
        const fmt = (v) => {
            if (!v) return '?';
            const d = new Date(v);
            return isNaN(d.getTime()) ? '?' : d.toLocaleDateString('fr-FR');
        };

        const start = fmt(lockMeta.start);
        const end = fmt(lockMeta.end);
        const reason = lockMeta.reason ? String(lockMeta.reason).trim() : 'Aucun motif';
        
        return {
            title: `Bloqué: ${reason} (${start} → ${end})`,
            reason,
            start,
            end,
            period: `${start} au ${end}`
        };
    }
};
