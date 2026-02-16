import { supabase } from '../supabaseClient.js';
import { PayrollService } from './PayrollService.js';
import { SalesService } from './SalesService.js';
import { TimeService } from './TimeService.js';
import { EmployeeService } from './EmployeeService.js';


export const ArchiveService = {
    _archives: [],
    _hiddenArchives: new Set(),

    async fetchArchives() {
        this._loadHidden();
        const { data, error } = await supabase.from('weekly_archives').select('*').order('archived_at', { ascending: false });
        if (error) {
            console.error('Error fetching archives:', error);
            return [];
        }
        this._archives = data.filter(a => !this._hiddenArchives.has(String(a.id)));
        return this._archives;
    },

    async deleteArchive(id) {
        const { error } = await supabase.from('weekly_archives').delete().eq('id', id);
        if (error) {
            console.error('Error deleting archive:', error);
            this._hideId(id);
        }
    },

    async archiveAndReset(startDate = null, endDate = null) {
        // 1. Fetch ALL necessary data
        const employees = await EmployeeService.fetchEmployees();
        const sales = await SalesService.fetchSales();
        const timeEntries = await TimeService.fetchTimeEntries();
        await PayrollService.fetchSettings();

        // 2. Filter data if dates provided (partial archive)
        let targetSales = sales;
        let targetTime = timeEntries;

        if (startDate && endDate) {
            const startMs = startDate.getTime();
            const endMs = endDate.getTime();
            targetSales = sales.filter(s => {
                const d = new Date(s.date).getTime();
                return d >= startMs && d <= endMs;
            });
            targetTime = timeEntries.filter(t => {
                if (!t.clock_out) return false;
                const d = new Date(t.clock_out).getTime();
                return d >= startMs && d <= endMs;
            });
        }

        // 3. Calculate Payroll Snapshot
        const payrollDetails = employees.map(emp => {
            return PayrollService.calculateTotalPay(emp, targetSales, targetTime);
        }).filter(d => d.totalDue > 0 || d.totalHours > 0 || d.totalSales > 0);

        // 4. Aggregate Stats
        // Use MARGIN (Price - Cost) for the global stat 'total_revenue' as requested by user
        const totalRevenue = targetSales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);
        const totalPayroll = payrollDetails.reduce((sum, d) => sum + d.totalDue, 0);

        // 5. Create Archive Record
        const now = new Date();
        const label = (startDate && endDate) 
            ? `Période du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`
            : `Semaine du ${now.toLocaleDateString('fr-FR')}`;

        const archiveId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const { error: errArchive } = await supabase.from('weekly_archives').insert({
            id: archiveId,
            total_revenue: totalRevenue,
            total_sales_count: targetSales.length,
            period_label: label,
            total_payroll: totalPayroll,
            archived_at: now.toISOString(),
            payroll_details: payrollDetails
        });

        if (errArchive) throw errArchive;

        // 6. DELETE Archived Data (Reset)
        // We only delete what was archived.
        // Safety: We use the IDs of the items we just aggregated.
        
        const saleIds = targetSales.map(s => s.id);
        const timeIds = targetTime.map(t => t.id);

        if (saleIds.length > 0) {
            const { error: errS } = await supabase.from('sales').delete().in('id', saleIds);
            if (errS) console.error("Error cleaning up archived sales:", errS);
        }

        if (timeIds.length > 0) {
            const { error: errT } = await supabase.from('time_entries').delete().in('id', timeIds);
            if (errT) console.error("Error cleaning up archived time entries:", errT);
        }

        return true;
    },

    async updatePaymentStatus(archiveId, employeeId, isPaid) {
        const { data: archive } = await supabase.from('weekly_archives').select('*').eq('id', archiveId).single();
        if (!archive) throw new Error("Archive introuvable");

        let details = archive.payroll_details;
        if (typeof details === 'string') try { details = JSON.parse(details); } catch(e) {}

        const idx = details.findIndex(d => String(d.employeeId) === String(employeeId));
        if (idx !== -1) {
            details[idx].paid = isPaid;
            await supabase.from('weekly_archives').update({ payroll_details: details }).eq('id', archiveId);
        }
    },

    // Hidden Helpers
    _loadHidden() {
        try {
            const hidden = JSON.parse(localStorage.getItem('hidden_archives') || '[]');
            this._hiddenArchives = new Set(hidden);
        } catch (e) {}
    },
    _hideId(id) {
        this._hiddenArchives.add(String(id));
        localStorage.setItem('hidden_archives', JSON.stringify(Array.from(this._hiddenArchives)));
    }
};
