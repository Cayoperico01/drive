import { supabase } from '../supabaseClient.js';

export const ConfigService = {
    async fetchWebhookSettings() {
        let { data, error } = await supabase.from('webhook_settings').select('*').eq('id', 1).single();
        
        if (error && error.code === 'PGRST116') {
            // Create defaults
            const defaults = { id: 1, sales_webhook_url: '', services_webhook_url: '' };
            try {
                const { data: created } = await supabase.from('webhook_settings').insert(defaults).select().single();
                data = created;
            } catch (e) {
                console.error("Error creating webhook settings:", e);
            }
        }
        
        if (data) {
            try {
                localStorage.setItem('webhook_settings', JSON.stringify(data));
                if (data.brand_logo_url) localStorage.setItem('brand_logo_url', data.brand_logo_url);
            } catch (e) {}
        }
        return data || {};
    },

    async saveWebhookSettings(salesUrl, servicesUrl, servicesStatusMessageId, recruitmentUrl, brandLogoUrl, patchNoteUrl, kitWebhookUrl, kitRoleId) {
        const updateData = { id: 1 };
        if (salesUrl !== undefined) updateData.sales_webhook_url = salesUrl;
        if (servicesUrl !== undefined) updateData.services_webhook_url = servicesUrl;
        if (servicesStatusMessageId !== undefined) updateData.services_status_message_id = servicesStatusMessageId;
        if (recruitmentUrl !== undefined) updateData.recruitment_webhook_url = recruitmentUrl;
        if (brandLogoUrl !== undefined) updateData.brand_logo_url = brandLogoUrl;
        if (patchNoteUrl !== undefined) updateData.patch_note_webhook_url = patchNoteUrl;
        if (kitWebhookUrl !== undefined) updateData.kit_webhook_url = kitWebhookUrl;
        if (kitRoleId !== undefined) updateData.kit_role_id = kitRoleId;

        const { data, error } = await supabase.from('webhook_settings').upsert(updateData).select().single();
        if (error) throw error;

        try {
            localStorage.setItem('webhook_settings', JSON.stringify(data));
            if (data.brand_logo_url) localStorage.setItem('brand_logo_url', data.brand_logo_url);
        } catch (e) {}
        return data;
    },

    async setRecruitmentStatus(isOpen) {
        const { data, error } = await supabase.from('webhook_settings').upsert({ id: 1, recruitment_open: isOpen }).select().single();
        if (error) throw error;
        
        try {
            const current = JSON.parse(localStorage.getItem('webhook_settings') || '{}');
            current.recruitment_open = isOpen;
            localStorage.setItem('webhook_settings', JSON.stringify(current));
        } catch (e) {}
        return data;
    },

    async setRecruitmentTargetCount(count) {
        const { data, error } = await supabase.from('webhook_settings').upsert({ id: 1, recruitment_target_count: Number(count) }).select().single();
        if (error) throw error;
        return data;
    },

    getRecruitmentTargetCount() {
        try {
            const s = localStorage.getItem('webhook_settings');
            return s ? Number(JSON.parse(s).recruitment_target_count) : null;
        } catch (e) { return null; }
    }
};
