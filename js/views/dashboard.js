import { store } from '../store.js';
import { auth } from '../auth.js';
import { formatCurrency, formatDate, getWeekRange } from '../utils.js';
import { Modal } from '../modal.js';

export function Dashboard() {
    const user = auth.getUser();
    const canViewAllSales = store.hasPermissionSync(user, 'sales.view_all');
    
    // Get Data based on Role
    const allSales = store.getSales();
    const mySales = allSales.filter(s => s.employeeId === user.id);
    const displaySales = canViewAllSales ? allSales : mySales;

    // --- CALCULS ---
    const totalRevenue = displaySales.reduce((sum, s) => sum + Number(s.price), 0);
    const totalSalesCount = displaySales.length;
    
    // User requested Margin as Revenue for personal stats
    const myRevenue = mySales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);

    // Revenue Split Logic (dynamic from settings, fallback 60/40)
    let companySplit = 0.60;
    let gradeRates = {};
    let rolePrimes = {};
    
    try {
        const s = localStorage.getItem('db_payroll_settings');
        if (s) {
            const obj = JSON.parse(s);
            if (obj) {
                if (obj.company_split !== undefined) companySplit = Number(obj.company_split) || 0.60;
                if (obj.grade_rates) gradeRates = obj.grade_rates || {};
                if (obj.role_primes) rolePrimes = obj.role_primes || {};
            }
        }
    } catch (e) {
        console.error("Error loading settings:", e);
    }
    
    const timeEntries = store.getTimeEntries();

    const getRoleRate = (role) => {
        const effectiveRole = role === 'mecano' ? 'mecano_confirme' : role;
        const pct = Number(rolePrimes && rolePrimes[effectiveRole]);
        if (isFinite(pct) && pct >= 0) return pct / 100;
        return 0.20; // Default commission rate if not found
    };

    const calculateTotalPay = (emp, empSales) => {
        // 1. Commission based on MARGIN (Price - Cost)
        const revenue = empSales.reduce((sum, s) => {
            return sum + (Number(s.price) - Number(s.cost || 0));
        }, 0);
        
        // Use Role specific rate instead of company split
        const commission = revenue * getRoleRate(emp.role);

        // 2. Fixed Salary
        const empEntries = timeEntries.filter(t => t.employee_id === emp.id && t.clock_out);
        const totalMs = empEntries.reduce((acc, t) => {
            const pausedMs = Number(t.pause_total_ms || 0);
            const start = new Date(t.clock_in);
            const end = new Date(t.clock_out);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return acc;
            
            const diff = (end - start) - (isNaN(pausedMs) ? 0 : pausedMs);
            return acc + Math.max(0, diff);
        }, 0);
        const totalHours = totalMs / 3600000;
        
        let rate = emp.custom_rate;
        if (rate === undefined || rate === null) rate = gradeRates[emp.role] || 0;
        const r = Number(rate);
        const fixedSalary = totalHours * (isNaN(r) ? 0 : r);

        const total = commission + fixedSalary;
        return isNaN(total) ? 0 : total;
    };

    const companyRevenue = totalRevenue * companySplit;
    const commissionTotal = calculateTotalPay(store.getEmployees().find(e => e.id === user.id) || { id: user.id, role: user.role }, mySales);

    // Admin specific stats
    const employeesCount = store.getEmployees().length;
    
    // Date Range for Ranking (Synchronized with Payroll: Saturday to Saturday)
    const { start: startOfWeek, end: endOfWeek } = getWeekRange();

    // Recent Sales List (Last 5)
    const recentSales = displaySales.slice().reverse().slice(0, 5);

    // --- WEEKLY STATS (Current Week) ---
    // Uses the same Saturday-Saturday logic as Payroll
    const weeklySales = displaySales.filter(s => {
        const d = new Date(s.date);
        return d >= startOfWeek && d <= endOfWeek;
    });
    
    // For employees, we want to show MARGIN (Revenue - Cost), not Revenue
    // If Admin, we show Total Revenue usually, or profit if desired.
    // The user asked "que la marge soit afficher partout pas que dans mes intervention meme sur le tableau ded bord"
    // This implies for employees dashboard.
    
    let weeklyRevenue = 0;
    if (!canViewAllSales) {
        // Employee Mode: Sum (Price - Cost)
        weeklyRevenue = weeklySales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);
    } else {
        // Admin Mode: Keep Total Revenue (Price) as usual, or change to Margin? 
        // Usually Admin wants to see Turnover (CA). User context suggests "employée".
        // Let's keep Admin as CA (Price) and Employee as Margin.
        weeklyRevenue = weeklySales.reduce((sum, s) => sum + Number(s.price), 0);
    }

    const weeklyCount = weeklySales.length;
    
    // Calculate weekly commission for current user
    // Commission is based on Total Price (Revenue) usually, NOT Margin.
    // Assuming prime stays on CA (Price), but display is Margin.
    const weeklyCommission = (() => {
        if (!canViewAllSales) { // Only relevant for personal dashboard
             const me = store.getEmployees().find(e => e.id === user.id) || { id: user.id, role: user.role };
             return calculateTotalPay(me, weeklySales);
        }
        return 0;
    })();

    // Get Warnings for current user
    let userWarnings = [];
    const me = store.getEmployees().find(e => e.id === user.id);
    if (me && me.warnings) {
         if (typeof me.warnings === 'string') {
             try { userWarnings = JSON.parse(me.warnings); } catch(e) {}
         } else {
             userWarnings = me.warnings;
         }
    }

    const sortedUserWarnings = (userWarnings || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastWarning = sortedUserWarnings[0] || null;
    const lastWarningReason = lastWarning ? String(lastWarning.reason || '').replace(/</g, '&lt;') : '';
    const lastWarningWhen = lastWarning && lastWarning.date
        ? new Date(lastWarning.date).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '';
    const warningCount = sortedUserWarnings.length;
    const warningTone = warningCount >= 3 ? 'danger' : warningCount === 2 ? 'warning' : 'caution';
    const warnBorder = warningTone === 'danger' ? 'border-red-500/50 shadow-red-900/20' : warningTone === 'warning' ? 'border-orange-500/50 shadow-orange-900/20' : 'border-yellow-500/50 shadow-yellow-900/20';
    const warnGlow = warningTone === 'danger' ? 'from-red-500/20 to-red-900/20' : warningTone === 'warning' ? 'from-orange-500/20 to-orange-900/20' : 'from-yellow-500/20 to-yellow-900/20';

    if (!canViewAllSales) {
        window.showMyWarnings = () => {
            if (!sortedUserWarnings || !sortedUserWarnings.length) return;
            const message = `
                <div class="space-y-4">
                    <div class="text-sm text-slate-300">Historique de tes avertissements.</div>
                    <div class="space-y-3">
                        ${sortedUserWarnings.map((w, idx) => {
                            const n = idx + 1;
                            const pill = n >= 3 ? 'bg-red-500/10 text-red-300 border-red-500/20' : n === 2 ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
                            const when = w.date ? new Date(w.date).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
                            return `
                                <div class="bg-slate-900/40 border border-slate-700 rounded-xl p-4">
                                    <div class="flex items-start justify-between gap-3">
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-2">
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${pill}">#${n}</span>
                                                <div class="text-sm font-semibold text-white break-words">${String(w.reason || '').replace(/</g, '&lt;')}</div>
                                            </div>
                                            <div class="mt-1 text-xs text-slate-400">
                                                <span class="text-slate-500">Par</span> <span class="text-slate-300 font-medium">${String(w.author || '—').replace(/</g, '&lt;')}</span>
                                                <span class="text-slate-600">•</span>
                                                <span class="font-mono">${when}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            Modal.show({
                title: 'Avertissements',
                message,
                type: 'danger',
                size: 'lg',
                confirmText: 'Fermer',
                cancelText: null,
                onConfirm: () => {}
            });
        };
    }

    // Helper for KPI Cards
    const KpiCard = (title, value, icon, colorClass, gradientFrom, gradientTo, subValue = null) => `
        <div class="relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 group hover:border-white/10 transition-all duration-300">
            <!-- Background Glow Removed for performance/minimalism -->
            
            <div class="relative z-10 flex justify-between items-start">
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">${title}</p>
                    <h3 class="text-3xl font-extrabold text-white tracking-tight">${canViewAllSales ? value : formatCurrency(displaySales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0))}</h3>
                    ${subValue ? `<p class="text-xs font-medium ${colorClass} mt-1">${subValue}</p>` : ''}
                </div>
                <div class="p-3 rounded-xl bg-slate-800/50 border border-white/5 text-${colorClass.split(' ')[0]}-400 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    ${icon}
                </div>
            </div>
        </div>
    `;

    // Get Active Employees
    const activeEmployees = store.getEmployees().filter(e => {
        const entry = timeEntries.find(t => t.employee_id === e.id && !t.clock_out);
        return !!entry;
    }).map(e => {
        const entry = timeEntries.find(t => t.employee_id === e.id && !t.clock_out);
        return { ...e, entry };
    });

    return `
        <div class="space-y-8 animate-fade-in pb-20">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-2">
                        <i data-lucide="layout-dashboard" class="w-3 h-3"></i>
                        <span>${canViewAllSales ? 'Pilotage Atelier' : 'Espace Personnel'}</span>
                    </div>
                    <h1 class="text-4xl font-black text-white tracking-tight">Tableau de Bord</h1>
                    <p class="text-slate-400 mt-1 flex items-center gap-2">
                        Bienvenue, <span class="text-white font-semibold">${user.firstName}</span>. Voici le résumé de l'activité.
                    </p>
                </div>
                <button onclick="window.location.hash = '#sales/new'" class="group relative px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div class="relative flex items-center gap-2">
                        <span>Nouvelle Prestation</span>
                        <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </button>
            </div>

            <!-- KPIs Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${canViewAllSales ? `
                    ${KpiCard("Ma Marge Générée", formatCurrency(myRevenue), '<i data-lucide="wallet" class="w-5 h-5"></i>', 'text-cyan-400', 'cyan-500', 'sky-500')}
                    ${KpiCard("CA Global", formatCurrency(totalRevenue), '<i data-lucide="dollar-sign" class="w-5 h-5"></i>', 'text-blue-400', 'blue-500', 'indigo-500')}
                    ${KpiCard(`Revenu Garage (${Math.round(companySplit * 100)}%)`, formatCurrency(companyRevenue), '<i data-lucide="building-2" class="w-5 h-5"></i>', 'text-green-400', 'green-500', 'emerald-500')}
                    ${KpiCard("Employés Actifs", employeesCount, '<i data-lucide="users" class="w-5 h-5"></i>', 'text-purple-400', 'purple-500', 'fuchsia-500')}
                ` : `
                    <!-- Personal Weekly Stats (Highlighted) -->
                    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 p-6 group hover:border-blue-500/50 transition-all duration-300 md:col-span-2">
                        <div class="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div class="relative z-10 flex justify-between items-center h-full">
                            <div>
                                <p class="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <i data-lucide="calendar-clock" class="w-3 h-3"></i> Cette Semaine
                                </p>
                                <div class="flex items-baseline gap-3">
                                    <h3 class="text-4xl font-black text-white tracking-tight">${formatCurrency(weeklyRevenue)}</h3>
                                    <span class="text-sm font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">${weeklyCount} prestations</span>
                                </div>
                                <p class="text-xs font-medium text-slate-400 mt-2">Salaire estimé: <span class="text-green-400 font-bold">${formatCurrency(weeklyCommission)}</span></p>
                            </div>
                            <div class="hidden sm:block p-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                                <i data-lucide="trending-up" class="w-8 h-8"></i>
                            </div>
                        </div>
                    </div>

                    ${KpiCard("Total Cumulé", formatCurrency(totalRevenue), '<i data-lucide="dollar-sign" class="w-5 h-5"></i>', 'text-slate-400', 'slate-500', 'gray-500', `Depuis le début`)}
                    
                    ${warningCount > 0 ? `
                        <div onclick="window.showMyWarnings && window.showMyWarnings()" class="relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-md border ${warnBorder} p-6 group cursor-pointer hover:scale-[1.02] transition-all duration-300">
                            <div class="absolute inset-0 bg-gradient-to-br ${warnGlow} opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div class="relative z-10 flex justify-between items-start">
                                <div>
                                    <p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Avertissements</p>
                                    <h3 class="text-3xl font-extrabold text-white tracking-tight">${warningCount}</h3>
                                    <p class="text-xs text-slate-300 mt-1 opacity-80 group-hover:opacity-100">Cliquez pour voir le détail</p>
                                </div>
                                <div class="p-3 rounded-xl bg-slate-900/50 border border-white/10 text-white shadow-lg">
                                    <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                                </div>
                            </div>
                        </div>
                    ` : KpiCard("Avertissements", "0", '<i data-lucide="shield-check" class="w-5 h-5"></i>', 'text-green-400', 'green-500', 'emerald-500', 'Tout est parfait')}
                `}
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Recent Sales List -->
                <div class="lg:col-span-2 flex flex-col gap-6">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <i data-lucide="history" class="w-5 h-5 text-blue-500"></i>
                            Dernières Interventions
                        </h3>
                        ${canViewAllSales ? `<a href="#admin-sales" class="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors">Voir tout</a>` : ''}
                    </div>

                    <div class="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        ${recentSales.length === 0 ? `
                            <div class="p-12 text-center">
                                <div class="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 mx-auto flex items-center justify-center mb-4">
                                    <i data-lucide="clipboard-list" class="w-8 h-8 text-slate-500"></i>
                                </div>
                                <h4 class="text-white font-bold text-lg mb-1">Aucune intervention</h4>
                                <p class="text-slate-500 text-sm">Commencez par enregistrer une nouvelle prestation.</p>
                            </div>
                        ` : `
                            <div class="divide-y divide-white/5">
                                ${recentSales.map(s => `
                                    <div class="group p-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                                                <i data-lucide="wrench" class="w-5 h-5"></i>
                                            </div>
                                            <div>
                                                <div class="flex items-baseline gap-2">
                                                    <h4 class="text-sm font-bold text-white">${s.vehicleModel}</h4>
                                                    <span class="text-xs text-slate-500 font-mono">${formatDate(s.date)}</span>
                                                </div>
                                                <div class="text-xs text-slate-400 mt-0.5">
                                                    <span class="text-blue-400 font-medium">${s.serviceType}</span>
                                                    <span class="text-slate-600 mx-1">•</span>
                                                    Client: <span class="text-slate-300">${s.clientName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="flex items-center gap-4">
                                            ${canViewAllSales ? `
                                                <span class="text-sm font-bold text-white bg-slate-800/50 px-3 py-1 rounded-lg border border-white/5 font-mono">
                                                    ${formatCurrency(s.price)}
                                                </span>
                                            ` : `
                                                <div class="flex flex-col items-end">
                                                    <span class="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 font-mono">
                                                        ${formatCurrency(Number(s.price) - Number(s.cost || 0))}
                                                    </span>
                                                    <span class="text-[10px] text-slate-500 mt-1 mr-1 font-mono">
                                                        ${(s.serviceType === 'Réparation' || Number(s.cost || 0) === 0) ? '100%' : 'Prix ÷ 1.8'}
                                                    </span>
                                                </div>
                                            `}
                                            
                                            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                                <button onclick="window.location.hash = '#sales/edit/${s.id}'" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                                                    <i data-lucide="pencil" class="w-4 h-4"></i>
                                                </button>
                                                ${store.hasPermissionSync(user, 'sales.manage') ? `
                                                <button onclick="deleteSale('${s.id}')" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                </button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>

                <!-- Active Employees List (New) -->
                ${canViewAllSales ? `
                <div class="flex flex-col gap-6">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <div class="relative">
                                <span class="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <i data-lucide="users" class="w-5 h-5 text-purple-500"></i>
                            </div>
                            En Service (${activeEmployees.length})
                        </h3>
                        <a href="#employees" class="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider transition-colors">Gérer</a>
                    </div>

                    <div class="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl flex-1">
                        ${activeEmployees.length === 0 ? `
                            <div class="p-8 text-center h-full flex flex-col items-center justify-center">
                                <div class="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-3">
                                    <i data-lucide="moon" class="w-6 h-6 text-slate-500"></i>
                                </div>
                                <p class="text-slate-500 text-sm">Aucun employé en service.</p>
                            </div>
                        ` : `
                            <div class="divide-y divide-white/5">
                                ${activeEmployees.map(e => {
                                    const since = new Date(e.entry.clock_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                    const isPaused = e.entry.paused;
                                    return `
                                    <div class="p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                                        <div class="relative w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                                            ${e.photo ? `<img src="${e.photo}" class="w-full h-full object-cover rounded-xl" />` : `<i data-lucide="user" class="w-5 h-5"></i>`}
                                            <span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${isPaused ? 'bg-yellow-400' : 'bg-green-400'}"></span>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <div class="flex items-center justify-between">
                                                <h4 class="text-sm font-bold text-white truncate">${e.first_name} ${e.last_name}</h4>
                                                <span class="text-[10px] font-mono ${isPaused ? 'text-yellow-400' : 'text-green-400'} bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/5">
                                                    ${since}
                                                </span>
                                            </div>
                                            <p class="text-xs text-slate-500 truncate mt-0.5">
                                                ${e.role} ${isPaused ? '• <span class="text-yellow-500">En pause</span>' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>
                </div>
                ` : ''}

            </div>
        </div>
    `;
}
