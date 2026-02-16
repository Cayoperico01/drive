import { store } from '../store.js';
import { formatCurrency } from '../utils.js';
import { Toast } from '../toast.js';
import { Modal } from '../modal.js';
import { auth } from '../auth.js';

export function AdminStats() {
    // Show all sales (Global Stats)
    const sales = store.getSales();
    const employees = store.getEmployees();

    // --- CALCULS ---
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.price), 0);
    const totalSales = sales.length;
    
    // Revenue Split logic
    let companySplit = 0.60;
    try {
        const s = localStorage.getItem('db_payroll_settings');
        if (s) {
            const obj = JSON.parse(s);
            if (obj && obj.company_split !== undefined) companySplit = Number(obj.company_split) || 0.60;
        }
    } catch (e) {}
    const companyRevenue = totalRevenue * companySplit;
    const activeEmployeesCount = employees.length;

    return `
        <div class="space-y-6 animate-fade-in pb-8">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <div>
                    <h2 class="text-3xl font-bold text-blue-500 flex items-center gap-3">
                        Statistiques
                        <span class="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Vue Globale</span>
                    </h2>
                    <p class="text-slate-400 mt-2 flex items-center gap-2 text-sm">
                        <i data-lucide="bar-chart-2" class="w-4 h-4"></i>
                        Analyse détaillée des performances de l'atelier
                    </p>
                </div>
                
                <button id="btn-reset-week" class="group relative px-5 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all">
                    <div class="flex items-center gap-2 font-bold text-sm">
                        <i data-lucide="trash-2" class="w-4 h-4 group-hover:rotate-12 transition-transform"></i>
                        <span>Réinitialiser la Semaine</span>
                    </div>
                </button>
            </div>

            <!-- KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- CA Total -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
                            <h3 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">${formatCurrency(totalRevenue)}</h3>
                        </div>
                        <div class="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <i data-lucide="dollar-sign" class="w-6 h-6 text-blue-500"></i>
                        </div>
                    </div>
                    <div class="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
                        <div class="bg-blue-500 h-full rounded-full" style="width: 100%"></div>
                    </div>
                </div>

                <!-- Part Garage -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <p class="text-[11px] font-bold text-green-400 uppercase tracking-wider">Revenu Garage</p>
                                <span class="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">${Math.round(companySplit * 100)}%</span>
                            </div>
                            <h3 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">${formatCurrency(companyRevenue)}</h3>
                        </div>
                        <div class="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                            <i data-lucide="building-2" class="w-6 h-6 text-green-500"></i>
                        </div>
                    </div>
                    <div class="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
                        <div class="bg-green-500 h-full rounded-full" style="width: ${Math.round(companySplit * 100)}%"></div>
                    </div>
                </div>

                <!-- Interventions -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">Interventions</p>
                            <h3 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">${totalSales}</h3>
                        </div>
                        <div class="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <i data-lucide="wrench" class="w-6 h-6 text-orange-500"></i>
                        </div>
                    </div>
                    <div class="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
                        <div class="bg-orange-500 h-full rounded-full" style="width: 75%"></div>
                    </div>
                </div>

                <!-- Employés Actifs -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1">Effectif Actif</p>
                            <h3 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">${activeEmployeesCount}</h3>
                        </div>
                        <div class="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <i data-lucide="users" class="w-6 h-6 text-purple-500"></i>
                        </div>
                    </div>
                    <div class="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
                        <div class="bg-purple-500 h-full rounded-full" style="width: 50%"></div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Main Chart (Employees) -->
                <div class="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-slate-700/50 rounded-lg">
                            <i data-lucide="bar-chart" class="w-5 h-5 text-white"></i>
                        </div>
                        <h3 class="font-bold text-white text-lg">Performance par Employé</h3>
                    </div>
                    <div class="relative h-80 w-full">
                         <canvas id="chart-employees"></canvas>
                    </div>
                </div>

                <!-- Secondary Chart (Types) -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-slate-700/50 rounded-lg">
                            <i data-lucide="pie-chart" class="w-5 h-5 text-white"></i>
                        </div>
                        <h3 class="font-bold text-white text-lg">Prestations</h3>
                    </div>
                    <div class="h-80 flex items-center justify-center relative w-full">
                        <canvas id="chart-types"></canvas>
                    </div>
                </div>
            </div>

            <!-- Detailed Tables -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Top Performers -->
                <div class="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-slate-700 bg-slate-800/50">
                        <h3 class="font-bold text-white text-lg flex items-center gap-2">
                            <i data-lucide="trophy" class="w-5 h-5 text-yellow-500"></i>
                            Classement
                        </h3>
                    </div>
                    <div class="overflow-x-auto flex-1">
                        <table class="w-full text-left text-sm whitespace-nowrap">
                            <thead class="bg-slate-900/30 text-slate-400 font-bold text-xs uppercase border-b border-slate-700">
                                <tr>
                                    <th class="p-4 w-16 text-center">Rang</th>
                                    <th class="p-4">Mécano</th>
                                    <th class="p-4 text-center">Interventions</th>
                                    <th class="p-4 text-right">Marge Générée</th>
                                    <th class="p-4 w-24"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-700/50" id="table-employees-body">
                                <!-- Content -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Service Breakdown -->
                <div class="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-slate-700 bg-slate-800/50">
                        <h3 class="font-bold text-white text-lg flex items-center gap-2">
                            <i data-lucide="list" class="w-5 h-5 text-blue-500"></i>
                            Détail par Prestation
                        </h3>
                    </div>
                    <div class="overflow-x-auto flex-1">
                        <table class="w-full text-left text-sm whitespace-nowrap">
                            <thead class="bg-slate-900/30 text-slate-400 font-bold text-xs uppercase border-b border-slate-700">
                                <tr>
                                    <th class="p-4">Type</th>
                                    <th class="p-4 text-center">Volume</th>
                                    <th class="p-4 text-right">CA Total</th>
                                    <th class="p-4 text-right">Moyenne</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-700/50" id="table-types-body">
                                <!-- Content -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initAdminStatsCharts() {
    // 0. Attach Listeners
    const resetBtn = document.getElementById('btn-reset-week');
    if (resetBtn) {
        store.hasPermission(auth.getUser(), 'time_entries.reset').then(canReset => {
            if (!canReset) {
                resetBtn.classList.add('opacity-40', 'cursor-not-allowed');
                resetBtn.disabled = true;
                return;
            }
            resetBtn.addEventListener('click', () => {
                Modal.show({
                    title: 'Réinitialisation de la Semaine',
                    message: "ATTENTION : Cette action est irréversible !\n\nCela va archiver le CA actuel puis effacer TOUTES les interventions et TOUS les pointages de la semaine.\n\nÊtes-vous sûr de vouloir commencer une nouvelle semaine ?",
                    type: 'danger',
                    confirmText: 'CONFIRMER LA SUPPRESSION',
                    inputExpected: 'CONFIRMER',
                    onConfirm: async () => {
                        try {
                            await store.archiveAndReset();
                            Toast.show("Semaine clôturée et réinitialisée avec succès !", "success");
                            setTimeout(() => window.location.reload(), 1000);
                        } catch (err) {
                            Toast.show("Erreur lors de la réinitialisation : " + err.message, "error");
                        }
                    }
                });
            });
        }).catch(() => {
            resetBtn.classList.add('opacity-40', 'cursor-not-allowed');
            resetBtn.disabled = true;
        });
    }

    // Show all sales (Global Stats)
    const sales = store.getSales();
    const employees = store.getEmployees();

    // 2. Stats par Employé (pour le classement et les barres)
    let companySplit = 0.60;
    try {
        const s = localStorage.getItem('db_payroll_settings');
        if (s) {
            const obj = JSON.parse(s);
            if (obj && obj.company_split !== undefined) companySplit = Number(obj.company_split) || 0.60;
        }
    } catch (e) {}

    const statsByEmployee = employees.map(emp => {
        const empSales = sales.filter(s => s.employeeId === emp.id);
        // Revenue (Margin) for Employee Ranking
        const revenue = empSales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);
        return {
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            salesCount: empSales.length,
            revenue: revenue,
            companyPart: revenue * companySplit
        };
    }).sort((a, b) => b.revenue - a.revenue); // Tri par Marge décroissante

    // Calculate max revenue for progress bars
    const maxRevenue = statsByEmployee.length > 0 ? statsByEmployee[0].revenue : 1;

    // 3. Stats par Type de Bien
    const statsByType = sales.reduce((acc, s) => {
        const type = s.serviceType || s.type || 'Autre';
        if (!acc[type]) {
            acc[type] = { type: type, count: 0, revenue: 0 };
        }
        acc[type].count++;
        acc[type].revenue += Number(s.price);
        return acc;
    }, {});
    
    const sortedStatsByType = Object.values(statsByType).sort((a, b) => b.revenue - a.revenue);

    
    const tableEmpBody = document.getElementById('table-employees-body');
    if(tableEmpBody) {
        tableEmpBody.innerHTML = statsByEmployee.map((emp, index) => {
            const percent = maxRevenue > 0 ? (emp.revenue / maxRevenue) * 100 : 0;
            
            // Rank Badge
            let rankBadge = `<span class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 text-slate-400 font-bold mx-auto text-xs border border-slate-600">${index + 1}</span>`;
            if (index === 0) rankBadge = `<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 font-bold mx-auto border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]"><i data-lucide="trophy" class="w-4 h-4"></i></div>`;
            if (index === 1) rankBadge = `<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-300/10 text-slate-300 font-bold mx-auto border border-slate-300/20"><i data-lucide="medal" class="w-4 h-4"></i></div>`;
            if (index === 2) rankBadge = `<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 font-bold mx-auto border border-orange-500/20"><i data-lucide="medal" class="w-4 h-4"></i></div>`;

            return `
            <tr class="hover:bg-slate-700/30 transition-colors group">
                <td class="p-4">
                    ${rankBadge}
                </td>
                <td class="p-4">
                    <div class="font-medium text-white">${emp.name}</div>
                </td>
                <td class="p-4 text-center">
                    <span class="inline-block px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">${emp.salesCount}</span>
                </td>
                <td class="p-4 text-right font-bold text-white">${formatCurrency(emp.revenue)}</td>
                <td class="p-4">
                    <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${percent}%"></div>
                    </div>
                </td>
            </tr>
        `}).join('');
    }

    const tableTypeBody = document.getElementById('table-types-body');
    if(tableTypeBody) {
        tableTypeBody.innerHTML = sortedStatsByType.map((t, i) => {
            const colors = ['text-blue-400 border-blue-500/20 bg-blue-500/10', 'text-purple-400 border-purple-500/20 bg-purple-500/10', 'text-orange-400 border-orange-500/20 bg-orange-500/10'];
            const style = colors[i % colors.length] || 'text-slate-400 border-slate-500/20 bg-slate-500/10';
            
            return `
            <tr class="hover:bg-slate-700/30 transition-colors">
                <td class="p-4">
                    <span class="px-3 py-1.5 ${style} border rounded-lg text-xs font-bold inline-flex items-center gap-2">
                        ${t.type}
                    </span>
                </td>
                <td class="p-4 text-center text-slate-400 font-mono">${t.count}</td>
                <td class="p-4 text-right font-bold text-green-400">${formatCurrency(t.revenue)}</td>
                <td class="p-4 text-right text-slate-500 text-xs">${formatCurrency(t.revenue / t.count)} / u</td>
            </tr>
        `}).join('');
    }


    // 1. Chart Employees
    const ctxEmp = document.getElementById('chart-employees');
    if(ctxEmp) {
        if (window.myChartEmployees) window.myChartEmployees.destroy();

        window.myChartEmployees = new Chart(ctxEmp, {
            type: 'bar',
            data: {
                labels: statsByEmployee.slice(0, 8).map(e => e.name), // Top 8
                datasets: [{
                    label: "Marge Générée (€)",
                    data: statsByEmployee.slice(0, 8).map(e => e.revenue),
                    backgroundColor: '#3b82f6',
                    hoverBackgroundColor: '#60a5fa',
                    borderRadius: 6,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(51, 65, 85, 0.2)', drawBorder: false },
                        ticks: { color: '#64748b', font: { family: "'Inter', sans-serif" } },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b', font: { family: "'Inter', sans-serif" } },
                        border: { display: false }
                    }
                }
            }
        });
    }

    // 2. Chart Types
    const ctxType = document.getElementById('chart-types');
    if(ctxType) {
        if (window.myChartTypes) window.myChartTypes.destroy();

        window.myChartTypes = new Chart(ctxType, {
            type: 'doughnut',
            data: {
                labels: sortedStatsByType.map(t => t.type),
                datasets: [{
                    data: sortedStatsByType.map(t => t.count),
                    backgroundColor: ['#3b82f6', '#a855f7', '#f97316', '#10b981', '#ef4444', '#64748b'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: { 
                    legend: { 
                        position: 'right',
                        labels: { 
                            color: '#94a3b8', 
                            font: { family: "'Inter', sans-serif", size: 11 },
                            boxWidth: 8,
                            usePointStyle: true,
                            padding: 15
                        }
                    } 
                }
            }
        });
    }
    
    lucide.createIcons();
}
