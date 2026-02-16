import { supabase } from '../supabaseClient.js';

export const FinanceService = {
    async getLastArchiveDate() {
        const { data, error } = await supabase.from('weekly_archives').select('archived_at').order('archived_at', { ascending: false }).limit(1).single();
        if (error || !data) return null;
        return new Date(data.archived_at);
    },

    async fetchPayoutsSince(date) {
        let query = supabase.from('payouts').select('*');
        if (date) query = query.gte('created_at', date.toISOString());
        const { data } = await query;
        return data || [];
    },

    async recordPayout(employeeId, amount, start, end) {
        const { data, error } = await supabase.from('payouts').insert({
            employee_id: employeeId,
            amount,
            period_start: start,
            period_end: end
        }).select().single();
        if (error) throw error;
        return data;
    },

    async fetchTaxPayments() {
        const { data } = await supabase.from('tax_payments').select('*, paid_by_user:paid_by(first_name, last_name)').order('paid_at', { ascending: false });
        return data || [];
    },

    async recordTaxPayment(paymentData, userId) {
        const { data, error } = await supabase.from('tax_payments').insert({
            amount: paymentData.amount,
            rate: paymentData.rate,
            taxable_base: paymentData.taxable_base,
            period_start: paymentData.period_start,
            period_end: new Date().toISOString(),
            paid_at: new Date().toISOString(),
            paid_by: userId
        }).select().single();
        if (error) throw error;
        return data;
    }
};
