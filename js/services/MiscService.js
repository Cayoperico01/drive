import { supabase } from '../supabaseClient.js';

export const MiscService = {
    // Contracts
    async fetchContracts() {
        const { data } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
        return data || [];
    },
    async saveContract(contract) {
        const { data, error } = await supabase.from('contracts').upsert(contract).select().single();
        if (error) throw error;
        return data;
    },
    async deleteContract(id) {
        await supabase.from('contracts').delete().eq('id', id);
    },

    // Tombola
    async fetchTombolaEntries() {
        const { data } = await supabase.from('tombola_entries').select('*');
        return data || [];
    },
    async addTombolaEntry(name, tickets) {
        await supabase.from('tombola_entries').insert({ name, tickets });
    },
    async clearTombola() {
        await supabase.from('tombola_entries').delete().neq('id', '0');
    },

    // Tuning
    async fetchTuningCatalog() {
        const { data } = await supabase.from('tuning_catalog').select('*');
        return data || [];
    },
    async saveTuningItem(item) {
        const { data, error } = await supabase.from('tuning_catalog').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deleteTuningItem(id) {
        await supabase.from('tuning_catalog').delete().eq('id', id);
    },

    // Announcements
    async sendAnnouncement(message, authorName) {
        const { error } = await supabase.from('announcements').insert({
            content: message,
            author_name: authorName || 'Système'
        });
        if (error) throw error;
    },

    subscribeToAnnouncements(onMessage) {
        return supabase.channel('public:announcements')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
                onMessage(payload.new);
            })
            .subscribe();
    }
};
