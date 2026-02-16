import { store } from '../store.js';
import { formatCurrency } from '../utils.js';
import { Toast } from '../toast.js';
import { auth } from '../auth.js';
import { Modal } from '../modal.js';

export function Payroll() {
    setTimeout(initPayroll, 50);

    return `
        <div class="space-y-8 animate-fade-in pb-20">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-end gap-6 pb-2">
                <div>
                    <h2 class="text-3xl font-bold text-white flex items-center gap-3">
                        <div class="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                            <i data-lucide="banknote" class="w-8 h-8 text-green-500"></i>
                        </div>
                        Fiches de Paie
                    </h2>
                    <p class="text-slate-400 mt-2 ml-1" id="payroll-period-label">Gestion des salaires et commissions</p>
                </div>
                
                <div id="payroll-actions" class="flex gap-3">
                    <!-- Actions will be injected here -->
                </div>
            </div>

            <!-- Configuration Zone -->
            <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                
                <div class="flex items-center gap-3 mb-6 relative z-10">
                    <div class="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <i data-lucide="percent" class="w-4 h-4 text-blue-400"></i>
                    </div>
                    <h3 class="font-bold text-white text-sm uppercase tracking-wider">Configuration des Primes (%)</h3>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
                    <!-- Patron -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="shield" class="w-3 h-3"></i> Patron
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-patron" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- Co-Patron -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="badge-check" class="w-3 h-3"></i> Co-Patron
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-co-patron" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- Responsable -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="star" class="w-3 h-3"></i> Responsable
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-responsable" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- Chef Atelier -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="crown" class="w-3 h-3"></i> Chef Atelier
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-chef" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- Mécano Confirmé -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="wrench" class="w-3 h-3"></i> Confirmé
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-mecano-confirme" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- Mécano Junior -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="wrench" class="w-3 h-3"></i> Junior
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-mecano-junior" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- Mécano Test -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="wrench" class="w-3 h-3"></i> Test
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-mecano-test" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button id="btn-save-role-primes" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        Sauvegarder la configuration
                    </button>
                </div>
            </div>

<!-- Safe Management moved to #safe-management -->

            <!-- KPIs -->
            <div id="payroll-kpis"></div>

            <!-- Filters Bar -->
            <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-2 flex flex-col md:flex-row gap-2 items-center">
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <div class="relative flex-1 md:flex-none">
                        <input type="date" id="payroll-date-start" class="w-full md:w-auto bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                    </div>
                    <span class="text-slate-500 font-bold">-</span>
                    <div class="relative flex-1 md:flex-none">
                        <input type="date" id="payroll-date-end" class="w-full md:w-auto bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                    </div>
                </div>

                <div class="relative flex-1 w-full md:w-auto">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"></i>
                    <input type="text" id="payroll-search" autocomplete="off" placeholder="Rechercher un employé..." class="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                </div>
                
                <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <select id="payroll-filter-role" class="flex-1 md:flex-none px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-blue-500">
                        <option value="all">Tous rôles</option>
                        <option value="patron">Patron</option>
                        <option value="co_patron">Co-Patron</option>
                        <option value="chef_atelier">Chef Atelier</option>
                        <option value="mecano_confirme">Mécano Confirmé</option>
                        <option value="mecano_junior">Mécano Junior</option>
                        <option value="mecano_test">Mécano Test</option>
                    </select>

                    <div class="h-8 w-px bg-slate-700 mx-1 self-center hidden md:block"></div>

                    <label class="cursor-pointer select-none whitespace-nowrap">
                        <input id="payroll-only-hours" type="checkbox" class="peer sr-only">
                        <div class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 text-sm peer-checked:bg-blue-500/10 peer-checked:text-blue-400 peer-checked:border-blue-500/50 transition-all flex items-center gap-2 hover:bg-slate-700">
                            <i data-lucide="clock" class="w-4 h-4"></i>
                            <span class="hidden sm:inline">Heures > 0</span>
                            <span class="sm:hidden">Heures</span>
                        </div>
                    </label>
                    <label class="cursor-pointer select-none whitespace-nowrap">
                        <input id="payroll-only-overrides" type="checkbox" class="peer sr-only">
                        <div class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 text-sm peer-checked:bg-yellow-500/10 peer-checked:text-yellow-400 peer-checked:border-yellow-500/50 transition-all flex items-center gap-2 hover:bg-slate-700">
                            <i data-lucide="alert-circle" class="w-4 h-4"></i>
                            <span class="hidden sm:inline">Surchargés</span>
                            <span class="sm:hidden">Surch.</span>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Payroll Table -->
            <div class="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr class="border-b border-slate-800 bg-slate-900/80">
                                <th class="p-4 pl-6 font-bold text-slate-400 uppercase text-xs tracking-wider">Employé</th>
                                <th class="p-4 text-center font-bold text-slate-400 uppercase text-xs tracking-wider">Rôle</th>
                                <th class="p-4 text-center font-bold text-slate-400 uppercase text-xs tracking-wider">Prestations</th>
                                <th class="p-4 text-right font-bold text-slate-400 uppercase text-xs tracking-wider">Marge Générée</th>
                                <th class="p-4 text-center font-bold text-slate-400 uppercase text-xs tracking-wider">% Com.</th>
                                <th class="p-4 text-right font-bold text-slate-400 uppercase text-xs tracking-wider">Prime</th>
                                <th class="p-4 text-center font-bold text-slate-400 uppercase text-xs tracking-wider">Heures</th>
                                <th class="p-4 text-right font-bold text-slate-400 uppercase text-xs tracking-wider w-32">Taux H.</th>
                                <th class="p-4 text-right font-bold text-slate-400 uppercase text-xs tracking-wider">Fixe</th>
                                <th class="p-4 text-right pr-6 font-bold text-slate-400 uppercase text-xs tracking-wider">Total Net</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/50" id="payroll-body">
                            <tr>
                                <td colspan="10" class="p-12 text-center">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-slate-900/80 font-bold text-white border-t border-slate-800">
                            <tr>
                                <td colspan="3" class="p-4 text-right uppercase text-[10px] tracking-widest text-slate-500">Totaux</td>
                                <td class="p-4 text-right font-mono text-slate-300" id="total-revenue">0 $</td>
                                <td></td>
                                <td class="p-4 text-right font-mono text-blue-300" id="total-comm">0 $</td>
                                <td></td>
                                <td></td>
                                <td class="p-4 text-right font-mono text-slate-300" id="total-fixed">0 $</td>
                                <td class="p-4 text-right pr-6 text-xl font-mono" id="total-pay">
                                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">0 $</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <div class="flex items-start gap-3 p-4 bg-blue-900/10 border border-blue-900/20 rounded-xl text-blue-300 text-sm">
                <i data-lucide="info" class="w-5 h-5 mt-0.5 flex-shrink-0"></i>
                <div>
                    <p class="font-bold mb-1">Fonctionnement du calcul</p>
                    <ul class="list-disc list-inside space-y-1 text-blue-200/70 text-xs">
                        <li>La prime est calculée selon le <strong>rôle</strong> (pourcentage configurable).</li>
                        <li>Le salaire fixe correspond aux heures de la semaine × taux horaire.</li>
                        <li>Tu peux mettre un taux horaire personnalisé pour un employé dans le tableau (surcharge).</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

async function initPayroll() {
    const tbody = document.getElementById('payroll-body');
    
    const currentUser = auth.getUser();
    const canEditConfig = await store.hasPermission(currentUser, 'payroll.manage');

    const inputPrimeMecanoConfirme = document.getElementById('prime-mecano-confirme');
    const inputPrimeMecanoJunior = document.getElementById('prime-mecano-junior');
    const inputPrimeMecanoTest = document.getElementById('prime-mecano-test');
    const inputPrimeChef = document.getElementById('prime-chef');
    const inputPrimeResponsable = document.getElementById('prime-responsable');
    const inputPrimePatron = document.getElementById('prime-patron');
    const inputPrimeCoPatron = document.getElementById('prime-co-patron');
    const btnSaveRolePrimes = document.getElementById('btn-save-role-primes');
    const kpisEl = document.getElementById('payroll-kpis');
    const searchInput = document.getElementById('payroll-search');
    const roleFilter = document.getElementById('payroll-filter-role');
    const onlyHoursChk = document.getElementById('payroll-only-hours');
    const onlyOverridesChk = document.getElementById('payroll-only-overrides');
    const inputDateStart = document.getElementById('payroll-date-start');
    const inputDateEnd = document.getElementById('payroll-date-end');

    // Disable inputs if not allowed
    if (!canEditConfig) {
        if(inputPrimeMecanoConfirme) inputPrimeMecanoConfirme.disabled = true;
        if(inputPrimeMecanoJunior) inputPrimeMecanoJunior.disabled = true;
        if(inputPrimeMecanoTest) inputPrimeMecanoTest.disabled = true;
        if(inputPrimeChef) inputPrimeChef.disabled = true;
        if(inputPrimeResponsable) inputPrimeResponsable.disabled = true;
        if(inputPrimePatron) inputPrimePatron.disabled = true;
        if(inputPrimeCoPatron) inputPrimeCoPatron.disabled = true;
        if(btnSaveRolePrimes) btnSaveRolePrimes.style.display = 'none';
    }
    
    if (!tbody) return;

    // Helper for date inputs
    const formatDateInput = (d) => {
        if (!d) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    try {
        const employees = await store.fetchEmployees();
        const sales = await store.fetchSales();
        const timeEntries = await store.fetchTimeEntries();
        
        // --- LOAD SETTINGS FROM DB (OR FALLBACK TO LOCAL) ---
        const dbSettings = await store.fetchPayrollSettings();
        
        // Sync Date Filter Inputs
        const currentFilter = store.getDateFilter();
        let filterStart = currentFilter?.start || null;
        let filterEnd = currentFilter?.end || null;

        if (inputDateStart) inputDateStart.value = filterStart ? formatDateInput(filterStart) : '';
        if (inputDateEnd) inputDateEnd.value = filterEnd ? formatDateInput(filterEnd) : '';

        const updateDateFilter = () => {
            let s = null;
            let e = null;
            
            if (inputDateStart.value) {
                s = new Date(inputDateStart.value);
                s.setHours(0,0,0,0);
            }
            if (inputDateEnd.value) {
                e = new Date(inputDateEnd.value);
                e.setHours(23,59,59,999);
            }
            
            filterStart = s;
            filterEnd = e;
            store.setDateFilter(s, e);
            render();
        };

        if (inputDateStart) inputDateStart.addEventListener('change', updateDateFilter);
        if (inputDateEnd) inputDateEnd.addEventListener('change', updateDateFilter);

        let commissionRate = 0.20; // Legacy fallback
        let gradeRates = { 
            'mecano_test': 500,
            'mecano_junior': 1500,
            'mecano_confirme': 2000,
            'chef_atelier': 2500,
            'responsable': 3000,
            'co_patron': 4000,
            'patron': 5000
        };
        let rolePrimes = { 'mecano_confirme': 20, 'mecano_junior': 20, 'mecano_test': 5, 'chef_atelier': 20, 'responsable': 20, 'patron': 60, 'co_patron': 60 };

        if (dbSettings) {
            if (dbSettings.commission_rate !== undefined) commissionRate = Number(dbSettings.commission_rate);
            if (dbSettings.grade_rates) {
                const looksHourly = (() => {
                    try { return Object.values(dbSettings.grade_rates || {}).some(v => Number(v) > 100); } catch (e) { return false; }
                })();
                if (looksHourly) gradeRates = dbSettings.grade_rates;
                else rolePrimes = dbSettings.grade_rates;
            }
            if (dbSettings.role_primes) rolePrimes = dbSettings.role_primes;
        } else {
            // Fallback to local storage (legacy support)
            commissionRate = store.getCommissionRate();
            gradeRates = store.getGradeRates();
            try {
                const cached = localStorage.getItem('db_payroll_role_primes');
                if (cached) rolePrimes = JSON.parse(cached);
            } catch (e) {}
        }

        try {
            if (gradeRates && typeof gradeRates === 'object') {
                if (gradeRates.mecano !== undefined) {
                    if (gradeRates.mecano_confirme === undefined) gradeRates.mecano_confirme = gradeRates.mecano;
                    if (gradeRates.mecano_junior === undefined) gradeRates.mecano_junior = gradeRates.mecano;
                    delete gradeRates.mecano;
                }
            }
        } catch (e) {}
        try {
            if (rolePrimes && typeof rolePrimes === 'object') {
                if (rolePrimes.mecano !== undefined) {
                    if (rolePrimes.mecano_confirme === undefined) rolePrimes.mecano_confirme = rolePrimes.mecano;
                    if (rolePrimes.mecano_junior === undefined) rolePrimes.mecano_junior = rolePrimes.mecano;
                    delete rolePrimes.mecano;
                }
            }
        } catch (e) {}

        const looksLikeOldHourlyRates = (() => {
            try { return Object.values(rolePrimes || {}).some(v => Number(v) > 100); } catch (e) { return false; }
        })();
        if (looksLikeOldHourlyRates) {
            rolePrimes = { 'mecano_confirme': 20, 'mecano_junior': 20, 'mecano_test': 5, 'chef_atelier': 20, 'responsable': 20, 'patron': 60, 'co_patron': 60 };
        }

        if (inputPrimeChef) inputPrimeChef.value = Number(rolePrimes['chef_atelier'] ?? 0);
        if (inputPrimeResponsable) inputPrimeResponsable.value = Number(rolePrimes['responsable'] ?? 20);
        if (inputPrimePatron) inputPrimePatron.value = Number(rolePrimes['patron'] ?? 0);
        if (inputPrimeCoPatron) inputPrimeCoPatron.value = Number(rolePrimes['co_patron'] ?? rolePrimes['patron'] ?? 0);
        if (inputPrimeMecanoConfirme) inputPrimeMecanoConfirme.value = Number(rolePrimes['mecano_confirme'] ?? 0);
        if (inputPrimeMecanoJunior) inputPrimeMecanoJunior.value = Number(rolePrimes['mecano_junior'] ?? 0);
        if (inputPrimeMecanoTest) inputPrimeMecanoTest.value = Number(rolePrimes['mecano_test'] ?? 0);

        if (btnSaveRolePrimes) {
            btnSaveRolePrimes.addEventListener('click', async () => {
                const clamp = (n) => {
                    const v = Number(n);
                    if (!isFinite(v)) return 0;
                    return Math.max(0, Math.min(100, v));
                };
                const next = {
                    'mecano_confirme': clamp(inputPrimeMecanoConfirme?.value),
                    'mecano_junior': clamp(inputPrimeMecanoJunior?.value),
                    'mecano_test': clamp(inputPrimeMecanoTest?.value),
                    'chef_atelier': clamp(inputPrimeChef?.value),
                    'responsable': clamp(inputPrimeResponsable?.value),
                    'patron': clamp(inputPrimePatron?.value),
                    'co_patron': clamp(inputPrimeCoPatron?.value)
                };
                try {
                    rolePrimes = next;
                    await store.savePayrollSettings(commissionRate, gradeRates, undefined, undefined, next);
                    render();
                    Toast.show("Configuration primes sauvegardée", "success");
                } catch (err) {
                    Toast.show("Erreur sauvegarde : " + err.message, "error");
                }
            });
        }

        // --- SAFE MANAGEMENT LOGIC MOVED TO SafeManagement.js ---

        let filterSearch = '';
        let filterRole = 'all';
        let filterOnlyHours = false;
        let filterOnlyOverrides = false;
        try {
            filterSearch = localStorage.getItem('payroll_search') || '';
            filterRole = localStorage.getItem('payroll_filter_role') || 'all';
            filterOnlyHours = localStorage.getItem('payroll_only_hours') === '1';
            filterOnlyOverrides = localStorage.getItem('payroll_only_overrides') === '1';
        } catch (e) {}

        if (searchInput) {
            searchInput.value = filterSearch;
            searchInput.addEventListener('input', (e) => {
                filterSearch = e.target.value || '';
                try { localStorage.setItem('payroll_search', filterSearch); } catch (e) {}
                render();
            });
        }
        if (roleFilter) {
            roleFilter.value = filterRole;
            roleFilter.addEventListener('change', () => {
                filterRole = roleFilter.value || 'all';
                try { localStorage.setItem('payroll_filter_role', filterRole); } catch (e) {}
                render();
            });
        }
        if (onlyHoursChk) {
            onlyHoursChk.checked = filterOnlyHours;
            onlyHoursChk.addEventListener('change', () => {
                filterOnlyHours = !!onlyHoursChk.checked;
                try { localStorage.setItem('payroll_only_hours', filterOnlyHours ? '1' : '0'); } catch (e) {}
                render();
            });
        }
        if (onlyOverridesChk) {
            onlyOverridesChk.checked = filterOnlyOverrides;
            onlyOverridesChk.addEventListener('change', () => {
                filterOnlyOverrides = !!onlyOverridesChk.checked;
                try { localStorage.setItem('payroll_only_overrides', filterOnlyOverrides ? '1' : '0'); } catch (e) {}
                render();
            });
        }

        const render = () => {
            // Check for date filter
            const dateFilter = store.getDateFilter();
            let filterStart = null;
            let filterEnd = null;
            if (dateFilter) {
                filterStart = dateFilter.start;
                filterEnd = dateFilter.end;
            }

            // Update Header Date
            const periodLabel = document.getElementById('payroll-period-label');
            if (periodLabel) {
                if (filterStart && filterEnd) {
                    periodLabel.innerHTML = `Période du <span class="text-white font-bold">${filterStart.toLocaleDateString('fr-FR')}</span> au <span class="text-white font-bold">${filterEnd.toLocaleDateString('fr-FR')}</span>`;
                } else {
                    periodLabel.textContent = "Période en cours (Tout l'historique non archivé)";
                }
            }

            // Inject Archive Button
            const actionsContainer = document.getElementById('payroll-actions');
            if (actionsContainer && !actionsContainer.hasChildNodes()) {
                store.hasPermission(currentUser, 'archives.manage').then(canArchive => {
                    if (canArchive) {
                        const btn = document.createElement('button');
                        btn.className = "px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2";
                        btn.innerHTML = `<i data-lucide="archive" class="w-4 h-4"></i> Clôturer & Archiver`;
                        btn.onclick = () => {
                            let msg = "Cette action va archiver les données et réinitialiser les compteurs.";
                            if (filterStart && filterEnd) {
                                msg += `\n\nPériode : ${filterStart.toLocaleDateString('fr-FR')} au ${filterEnd.toLocaleDateString('fr-FR')}`;
                                msg += `\nSeules les données de cette période seront archivées et supprimées.`;
                            } else {
                                msg += `\n\nATTENTION : Aucune période sélectionnée. TOUT l'historique actuel sera archivé.`;
                            }

                            Modal.show({
                                title: '📦 CLÔTURER LA PÉRIODE',
                                message: msg,
                                type: 'info',
                                confirmText: 'ARCHIVER',
                                inputExpected: 'CLOTURE',
                                onConfirm: async () => {
                                    try {
                                        await store.archiveAndReset(filterStart, filterEnd);
                                        Toast.show('Période clôturée et archivée avec succès !', 'success');
                                        // Clear filter after archive to show fresh state? Or keep it?
                                        // Usually better to refresh page or clear filter
                                        setTimeout(() => window.location.reload(), 1500);
                                    } catch (err) {
                                        Toast.show("Erreur lors de l'archivage : " + err.message, "error");
                                    }
                                }
                            });
                        };
                        actionsContainer.appendChild(btn);
                        if (window.lucide) lucide.createIcons();
                    }
                });
            }

            let sumFixed = 0;
            let sumComm = 0;
            let sumTotal = 0;
            let sumHours = 0;
            let sumRevenue = 0;

            const getRoleRate = (role) => {
                const pct = Number(rolePrimes && rolePrimes[role]);
                if (isFinite(pct) && pct >= 0) return pct / 100;
                return commissionRate;
            };

            const term = String(filterSearch || '').trim().toLowerCase();
            const rows = [];
            const normalizeRole = (r) => r === 'mecano' ? 'mecano_confirme' : r;
            const rolePriority = {
                'patron': 1,
                'co_patron': 2,
                'responsable': 3,
                'chef_atelier': 4,
                'mecano_confirme': 6,
                'mecano_junior': 7,
                'mecano_test': 8
            };
            const sorted = employees.slice().sort((a, b) => (rolePriority[normalizeRole(a.role)] || 99) - (rolePriority[normalizeRole(b.role)] || 99));

            for (const emp of sorted) {
                const effectiveRole = normalizeRole(emp.role);
                const name = `${emp.first_name || ''} ${emp.last_name || ''}`.trim().toLowerCase();
                if (term && !name.includes(term)) continue;
                if (filterRole !== 'all' && String(effectiveRole || '') !== String(filterRole)) continue;

                let rate = emp.custom_rate;
                if (rate === null || rate === undefined) {
                    const localOverrides = store.getPayrollRates();
                    if (localOverrides[emp.id] !== undefined) {
                        rate = localOverrides[emp.id];
                    }
                }

                const gradeRate = gradeRates[effectiveRole] !== undefined
                    ? gradeRates[effectiveRole]
                    : effectiveRole === 'mecano_confirme' || effectiveRole === 'mecano_junior'
                        ? (gradeRates['mecano_confirme'] || 0)
                        : effectiveRole === 'co_patron'
                            ? (gradeRates['patron'] || 0)
                            : 0;
                if (rate === undefined || rate === null) {
                    rate = gradeRate;
                }

                // Show ALL time entries for this employee present in DB
                const empEntries = timeEntries.filter(t => {
                    const matchId = String(t.employee_id) === String(emp.id);
                    if (!matchId || !t.clock_out) return false;
                    
                    // Date Filter
                    if (filterStart && filterEnd) {
                        const d = new Date(t.clock_out);
                        if (d < filterStart || d > filterEnd) return false;
                    }
                    return true;
                });
                const totalMs = empEntries.reduce((acc, t) => {
                    const pausedMs = Number(t.pause_total_ms || 0);
                    return acc + Math.max(0, (new Date(t.clock_out) - new Date(t.clock_in)) - pausedMs);
                }, 0);
                const totalHours = totalMs / 3600000;

                // Show ALL sales for this employee present in DB
                const empSales = sales.filter(s => {
                    if (String(s.employeeId) !== String(emp.id)) return false;
                    
                    // Date Filter
                    if (filterStart && filterEnd) {
                        const d = new Date(s.date);
                        if (d < filterStart || d > filterEnd) return false;
                    }
                    return true;
                });
                // Calculate Revenue based on MARGIN (Price - Cost)
                const revenue = empSales.reduce((acc, s) => acc + (Number(s.price) - Number(s.cost || 0)), 0);
                const commission = revenue * getRoleRate(effectiveRole);

                const fixedPay = totalHours * rate;
                const totalPay = fixedPay + commission;

                const localOverridesForRow = store.getPayrollRates();
                const hasOverride = Number(rate) !== Number(gradeRate) || (localOverridesForRow[emp.id] !== undefined);
                if (filterOnlyHours && totalHours <= 0) continue;
                if (filterOnlyOverrides && !hasOverride) continue;

                sumFixed += fixedPay;
                sumComm += commission;
                sumTotal += totalPay;
                sumHours += totalHours;
                sumRevenue += revenue;

                const h = Math.floor(totalHours);
                const m = Math.round((totalHours - h) * 60);

                let roleBadge = '';
                if (effectiveRole === 'patron') roleBadge = '<span class="px-2 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase">Patron</span>';
                else if (effectiveRole === 'co_patron') roleBadge = '<span class="px-2 py-1 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">Co-Patron</span>';
                else if (effectiveRole === 'chef_atelier') roleBadge = '<span class="px-2 py-1 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 uppercase">Chef Atelier</span>';
                else if (effectiveRole === 'mecano_confirme') roleBadge = '<span class="px-2 py-1 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300 border border-slate-600/50 uppercase">Mécano Conf.</span>';
                else if (effectiveRole === 'mecano_junior') roleBadge = '<span class="px-2 py-1 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300 border border-slate-600/50 uppercase">Mécano Junior</span>';
                else if (effectiveRole === 'mecano_test') roleBadge = '<span class="px-2 py-1 rounded text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/50 uppercase">Mécano Test</span>';
                else if (effectiveRole === 'responsable') roleBadge = '<span class="px-2 py-1 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">Responsable</span>';
                else roleBadge = '<span class="px-2 py-1 rounded text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/50 uppercase">Employé</span>';

                const inputClass = hasOverride
                    ? "border-yellow-500/50 text-yellow-400 font-bold bg-yellow-500/5"
                    : "border-slate-700 text-white hover:border-blue-500/50 focus:border-blue-500";

                rows.push(`
                    <tr class="hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 last:border-0 group">
                        <td class="p-4 pl-6">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700 group-hover:border-slate-600 transition-colors">
                                    ${emp.photo ? `<img src="${emp.photo}" class="w-full h-full object-cover rounded-xl" />` : `${emp.first_name[0]}${emp.last_name[0]}`}
                                </div>
                                <div>
                                    <div class="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">${emp.first_name} ${emp.last_name}</div>
                                    <div class="text-[10px] text-slate-500 font-mono">@${emp.username}</div>
                                </div>
                            </div>
                        </td>
                        <td class="p-4 text-center">
                            ${roleBadge}
                        </td>
                        <td class="p-4 text-center">
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 font-bold text-sm">
                                <i data-lucide="wrench" class="w-3 h-3 text-slate-500"></i>
                                ${empSales.length}
                            </div>
                        </td>
                        <td class="p-4 text-right font-mono text-slate-300 text-sm font-bold">
                            ${formatCurrency(revenue)}
                        </td>
                        <td class="p-4 text-center font-mono text-xs text-slate-500">
                            ${(getRoleRate(effectiveRole) * 100).toFixed(0)}%
                        </td>
                        <td class="p-4 text-right font-mono text-blue-400 text-sm font-bold">
                            ${formatCurrency(commission)}
                        </td>
                        <td class="p-4 text-center">
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700 group-hover:bg-slate-800 transition-colors">
                                <i data-lucide="clock" class="w-3 h-3 text-slate-500"></i>
                                <span class="font-mono text-slate-300 text-sm font-bold">${h}h <span class="text-xs text-slate-500">${m.toString().padStart(2, '0')}</span></span>
                            </div>
                        </td>
                        <td class="p-4 text-right">
                            <div class="relative inline-block w-24">
                                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                                <input type="number"
                                    onchange="updateRate('${emp.id}', this.value)"
                                    value="${rate}"
                                    class="w-full bg-slate-900 border rounded-lg px-2 py-1.5 pl-5 text-right outline-none text-sm font-mono transition-all ${inputClass}"
                                >
                            </div>
                        </td>
                        <td class="p-4 text-right font-mono text-slate-400 text-sm">
                            ${formatCurrency(fixedPay)}
                        </td>
                        <td class="p-4 pr-6 text-right font-bold text-green-400 font-mono text-base">
                            ${formatCurrency(totalPay)}
                        </td>
                    </tr>
                `);
            }

            tbody.innerHTML = rows.length ? rows.join('') : `
                <tr>
                    <td colspan="10" class="p-16 text-center text-slate-500">
                        <div class="flex flex-col items-center justify-center gap-4">
                            <div class="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                <i data-lucide="search-x" class="w-8 h-8 opacity-50"></i>
                            </div>
                            <div>
                                <p class="font-bold text-lg text-slate-400">Aucun résultat</p>
                                <p class="text-sm text-slate-600 mt-1">
                                    ${employees.length === 0 ? "Aucun employé n'a été trouvé dans la base de données." : "Modifiez vos filtres pour voir les résultats."}
                                </p>
                            </div>
                            ${(filterOnlyHours || filterOnlyOverrides || filterSearch || filterRole !== 'all') ? `
                                <button id="btn-clear-filters" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 mt-2 group">
                                    <i data-lucide="x" class="w-4 h-4 group-hover:rotate-90 transition-transform"></i>
                                    Effacer les filtres
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;

            // Attach clear filters listener
            setTimeout(() => {
                const btn = document.getElementById('btn-clear-filters');
                if (btn) {
                    btn.addEventListener('click', () => {
                        if (searchInput) searchInput.value = '';
                        if (roleFilter) roleFilter.value = 'all';
                        if (onlyHoursChk) onlyHoursChk.checked = false;
                        if (onlyOverridesChk) onlyOverridesChk.checked = false;
                        
                        filterSearch = '';
                        filterRole = 'all';
                        filterOnlyHours = false;
                        filterOnlyOverrides = false;
                        
                        try {
                            localStorage.setItem('payroll_search', '');
                            localStorage.setItem('payroll_filter_role', 'all');
                            localStorage.setItem('payroll_only_hours', '0');
                            localStorage.setItem('payroll_only_overrides', '0');
                        } catch(e) {}
                        
                        render();
                    });
                }
            }, 0);

            document.getElementById('total-fixed').textContent = formatCurrency(sumFixed);
            document.getElementById('total-comm').textContent = formatCurrency(sumComm);
            document.getElementById('total-pay').textContent = formatCurrency(sumTotal);

            if (kpisEl) {
                const avgRate = sumHours > 0 ? (sumFixed / sumHours) : 0;
                const avgPrimePct = sumRevenue > 0 ? (sumComm / sumRevenue) * 100 : 0;
                const netProfit = sumRevenue - sumTotal;
                const profitMargin = sumRevenue > 0 ? (netProfit / sumRevenue) * 100 : 0;
                const profitColor = netProfit >= 0 ? "text-emerald-400" : "text-rose-400";
                const profitBg = netProfit >= 0 ? "from-emerald-500/20 to-teal-500/5" : "from-rose-500/20 to-red-500/5";

                kpisEl.innerHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="clock" class="w-12 h-12 text-blue-400"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Heures (semaine)</div>
                            <div class="text-2xl font-black text-white tracking-tight">${sumHours.toFixed(1)}<span class="text-sm font-bold text-slate-500 ml-1">h</span></div>
                            <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">Moy. taux: ${formatCurrency(avgRate)}</div>
                        </div>
                        
                        <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="wallet" class="w-12 h-12 text-purple-400"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Marge Totale (semaine)</div>
                            <div class="text-2xl font-black text-white tracking-tight">${formatCurrency(sumRevenue)}</div>
                            <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">Prime moy.: ${avgPrimePct.toFixed(1)}%</div>
                        </div>
                        
                        <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="banknote" class="w-12 h-12 text-blue-400"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Salaires fixes</div>
                            <div class="text-2xl font-black text-white tracking-tight">${formatCurrency(sumFixed)}</div>
                            <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">Base heures × taux</div>
                        </div>
                        
                        <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="dollar-sign" class="w-12 h-12 text-orange-400"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total à payer</div>
                            <div class="text-2xl font-black text-orange-400 tracking-tight">${formatCurrency(sumTotal)}</div>
                            <div class="mt-2 text-xs font-medium text-slate-400">Dont primes: <span class="text-orange-300 font-bold">${formatCurrency(sumComm)}</span></div>
                        </div>

                        <div class="bg-gradient-to-br ${profitBg} rounded-xl border border-slate-700 p-4 relative overflow-hidden group shadow-lg">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="piggy-bank" class="w-12 h-12 ${profitColor}"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reste Entreprise</div>
                            <div class="text-2xl font-black ${profitColor} tracking-tight">${formatCurrency(netProfit)}</div>
                            <div class="mt-2 text-xs font-medium text-slate-400">Marge brute: <span class="${profitColor} font-bold">${profitMargin.toFixed(1)}%</span></div>
                        </div>
                    </div>
                `;
            }

            if (window.lucide) lucide.createIcons();
        };

        // Initial Render
        render();

        // Expose update function (Saves to DB now)
        window.updateRate = async (empId, value) => {
            const rate = parseFloat(value) || 0;
            
            const emp = employees.find(e => e.id === empId);
            const gradeRate = gradeRates[emp?.role] !== undefined
                ? gradeRates[emp.role]
                : emp?.role === 'mecano_confirme' || emp?.role === 'mecano_junior'
                    ? (gradeRates['mecano_confirme'] || 0)
                    : emp?.role === 'co_patron'
                        ? (gradeRates['patron'] || 0)
                        : 0;
            let rateToSave = rate <= 0 ? null : rate;
            if (rateToSave !== null && Number(rateToSave) === Number(gradeRate)) {
                rateToSave = null;
            }

            // Save to DB
            try {
                await store.saveEmployeeCustomRate(empId, rateToSave);
                // Also update local object for immediate feedback
                if (emp) emp.custom_rate = rateToSave;
                
                render();
                if (rateToSave === null) {
                    Toast.show("Taux aligné sur le rôle", "info");
                } else {
                    Toast.show("Taux personnalisé sauvegardé", "success");
                }
            } catch (err) {
                Toast.show("Erreur sauvegarde : " + err.message, "error");
            }
        };

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-500">Erreur de chargement: ${err.message}</td></tr>`;
    }
}
