import { supabase } from '../supabaseClient.js';
import { Discord } from '../discord.js';

export const RecruitmentService = {
    async submitApplication(appData) {
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const { data, error } = await supabase.from('recruitment_applications').insert({
            id,
            full_name: appData.fullName,
            discord_id: appData.discordId,
            discord_user_id: appData.discordUid,
            unique_id: appData.uniqueId,
            phone_ig: appData.phoneIg,
            age: parseInt(appData.age),
            experience: appData.experience,
            motivation: appData.motivation,
            availability: appData.availability,
            status: 'pending'
        }).select().single();

        if (error) throw error;
        
        Discord.logApplication({ ...appData, id }, "N/A");
        return data;
    },

    async fetchApplications() {
        const { data } = await supabase.from('recruitment_applications').select('*').order('created_at', { ascending: false });
        return data || [];
    },

    async updateStatus(id, status, reason) {
        const payload = { status };
        if (status === 'rejected' && reason && String(reason).trim()) {
            payload.rejection_reason = String(reason).trim();
        }
        let data = null;
        try {
            const res = await supabase.from('recruitment_applications').update(payload).eq('id', id).select().single();
            if (res.error) throw res.error;
            data = res.data;
        } catch (e) {
            // Fallback if column rejection_reason doesn't exist
            const msg = String(e?.message || '');
            if (msg.includes('column') && msg.includes('rejection_reason')) {
                const res2 = await supabase.from('recruitment_applications').update({ status }).eq('id', id).select().single();
                if (res2.error) throw res2.error;
                data = res2.data;
            } else {
                throw e;
            }
        }
        
        const target = data.discord_user_id || data.discord_id;
        const reasonToSend = payload.rejection_reason || '';
        Discord.notifyRecruitmentDecision(status, data.full_name, target, reasonToSend);
        
        return data;
    },

    async deleteApplication(id) {
        await supabase.from('recruitment_applications').delete().eq('id', id);
    }
};
