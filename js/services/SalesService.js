import { supabase } from '../supabaseClient.js';

export const SalesService = {
    _sales: [],
    _hiddenSales: new Set(),

    async fetchSales() {
        this._loadHidden();
        const { data, error } = await supabase.from('sales').select('*');
        if (error) {
            console.error('Error fetching sales:', error);
            return [];
        }
        this._sales = data
            .filter(s => !this._hiddenSales.has(String(s.id)))
            .map(this._mapSaleFromDB);
        return this._sales;
    },

    async fetchSalesPage(page, pageSize, filters = {}) {
        this._loadHidden();
        
        let query = supabase.from('sales').select('*', { count: 'exact' });

        // Filters
        if (filters.employeeId && filters.employeeId !== 'all') {
            query = query.eq('employee_id', filters.employeeId);
        }
        if (filters.type && filters.type !== 'all') {
            query = query.ilike('service_type', `%${filters.type}%`);
        }
        if (filters.term) {
            const t = filters.term.toLowerCase();
            // Search in client name OR vehicle model OR plate
            query = query.or(`client_name.ilike.%${t}%,vehicle_model.ilike.%${t}%,plate.ilike.%${t}%`);
        }

        // Sorting (Default Date Desc)
        query = query.order('date', { ascending: false });

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, count, error } = await query.range(from, to);
        
        if (error) throw error;

        const mapped = data
            .filter(s => !this._hiddenSales.has(String(s.id)))
            .map(this._mapSaleFromDB);

        return {
            data: mapped,
            total: count || 0
        };
    },

    getSales() {
        return this._sales;
    },

    async getSaleById(id) {
        if (this._hiddenSales.has(String(id))) return null;
        let sale = this._sales.find(s => s.id === id);
        if (sale) return sale;
        
        const { data, error } = await supabase.from('sales').select('*').eq('id', id).single();
        if (error) return null;
        return this._mapSaleFromDB(data);
    },

    async saveSale(sale) {
        const dbSale = {
            id: sale.id,
            employee_id: sale.employeeId,
            date: sale.date,
            client_name: sale.clientName,
            client_phone: sale.clientPhone,
            vehicle_model: sale.vehicleModel || sale.plate,
            plate: sale.plate || sale.vehicleModel,
            service_type: sale.serviceType,
            price: sale.price,
            cost: sale.cost || 0,
            invoice_url: sale.invoiceUrl,
            photo_url: sale.photoUrl,
            contract_full_perf: sale.contractFullPerf === true,
            contract_full_custom: sale.contractFullCustom === true
        };

        const { data, error } = await supabase.from('sales').upsert(dbSale).select().single();
        if (error) throw error;

        const saved = this._mapSaleFromDB(data);
        const idx = this._sales.findIndex(s => s.id === saved.id);
        if (idx >= 0) this._sales[idx] = saved;
        else this._sales.push(saved);
        
        return saved;
    },

    async deleteSale(id) {
        const { error } = await supabase.from('sales').delete().eq('id', id);
        if (error) {
            console.error('Error deleting sale:', error);
            this._hideId(id);
        }
        this._sales = this._sales.filter(s => s.id !== id);
    },

    _mapSaleFromDB(dbSale) {
        return {
            id: dbSale.id,
            employeeId: dbSale.employee_id,
            date: dbSale.date,
            clientName: dbSale.client_name,
            clientPhone: dbSale.client_phone,
            vehicleModel: dbSale.vehicle_model || dbSale.property_name,
            plate: dbSale.plate || dbSale.vehicle_model,
            serviceType: dbSale.service_type || dbSale.type,
            price: Number(dbSale.price),
            cost: Number(dbSale.cost || 0),
            invoiceUrl: dbSale.invoice_url,
            photoUrl: dbSale.photo_url,
            contractFullPerf: dbSale.contract_full_perf === true,
            contractFullCustom: dbSale.contract_full_custom === true
        };
    },

    _loadHidden() {
        try {
            const hidden = JSON.parse(localStorage.getItem('hidden_sales') || '[]');
            this._hiddenSales = new Set(hidden);
        } catch (e) {}
    },

    _hideId(id) {
        this._hiddenSales.add(String(id));
        localStorage.setItem('hidden_sales', JSON.stringify(Array.from(this._hiddenSales)));
    }
};
