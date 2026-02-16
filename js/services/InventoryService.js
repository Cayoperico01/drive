import { supabase } from '../supabaseClient.js';
import { Discord } from '../discord.js';

export const InventoryService = {
    async fetchRepairKitConfig() {
        const { data, error } = await supabase.from('inventory_settings').select('repair_kit_stock, repair_kit_price').eq('id', 1).single();
        if (error) return { stock: 0, price: 2500 };
        return {
            stock: data?.repair_kit_stock || 0,
            price: Number(data?.repair_kit_price) || 2500
        };
    },

    async updateStock(newStock) {
        const { error } = await supabase.rpc('update_repair_kit_stock', { new_stock: Number(newStock) });
        if (error) {
            console.warn("RPC update_repair_kit_stock failed, fallback");
            await supabase.from('inventory_settings').upsert({ id: 1, repair_kit_stock: newStock });
        }
    },

    async createOrder(clientName, quantity, phone, availability) {
        const { data, error } = await supabase.from('repair_kit_orders').insert({
            client_name: clientName,
            quantity,
            phone,
            availability,
            status: 'pending'
        }).select().single();
        if (error) throw error;
        
        // Side effects
        const config = await this.fetchRepairKitConfig();
        const price = config.price;
        const total = quantity * price;
        
        // Update Safe (Circular dependency? We need PayrollService or similar)
        // Ideally we'd emit an event or use a mediator. For now, we'll import PayrollService dynamically or duplicate the safe logic.
        // We'll use RPC for safe update which is stateless.
        await supabase.rpc('increment_safe_balance', { amount: total });
        
        // Update Stock
        await this.updateStock(config.stock - quantity);
        
        // Discord
        Discord.sendLog('services', '📦 Commande Kits', `${clientName} x${quantity} (${total}$)`, 15105570);
        
        return data;
    },

    async fetchOrders() {
        const { data } = await supabase.from('repair_kit_orders').select('*').order('created_at', { ascending: false });
        return data || [];
    }
};
