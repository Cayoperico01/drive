import { store } from './store.js';

export const auth = {
    login(username, password) {
        return store.login(username, password);
    },

    logout() {
        store.logout();
        window.location.reload();
    },

    getUser() {
        return store.getCurrentUser();
    },

    isAuthenticated() {
        return !!this.getUser();
    },

    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'patron';
    },
    
    isTrainer() {
        const user = this.getUser();
        return user && user.role === 'chef_formatrice';
    },

    isRH() {
        const user = this.getUser();
        return user && user.role === 'responsable_rh';
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            // Redirect to login if not authenticated (handled by router usually, but safe check here)
            return false;
        }
        return true;
    }
};
