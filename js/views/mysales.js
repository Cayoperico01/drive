import { store } from '../store.js';
import { auth } from '../auth.js';
import { formatCurrency, formatDate } from '../utils.js';

export function MySales() {
    const user = auth.getUser();
    
    // --- Prime Logic ---
    let rolePrimes = { 'mecano_confirme': 20, 'mecano_junior': 20, 'chef_atelier': 20, 'patron': 60, 'co_patron': 60 };
    try {
        const s = localStorage.getItem('db_payroll_settings');
        if (s) {
            const obj = JSON.parse(s);
            if (obj && obj.role_primes && typeof obj.role_primes === 'object') {
                rolePrimes = obj.role_primes;
            } else if (obj && obj.grade_rates && typeof obj.grade_rates === 'object') {
                const looksHourly = Object.values(obj.grade_rates || {}).some(v => Number(v) > 100);
                if (!looksHourly) rolePrimes = obj.grade_rates;
            }
        }
    } catch (e) {}
    
    const getPrimePctForRole = (role) => {
        const effectiveRole = role === 'mecano' ? 'mecano_confirme' : role;
        const v = Number(rolePrimes && rolePrimes[effectiveRole]);
        if (isFinite(v) && v >= 0) return Math.max(0, Math.min(100, Math.round(v)));
        return 20;
    };
    // -------------------

    const getMySales = () => {
        const allSales = store.getSales();
        return allSales.filter(s => s.employeeId === user.id);
    };

    setTimeout(() => {
        const searchInput = document.getElementById('search-my-sales');
        const tableBody = document.getElementById('my-sales-table-body');
        const countLabel = document.getElementById('my-sales-count');
        const statsEl = document.getElementById('my-sales-stats');
        // const periodSel = document.getElementById('my-period'); // Removed
        const missingInvoiceChk = document.getElementById('my-missing-invoice');
        let sortBy = 'date';
        let sortDir = 'desc';
        let period = localStorage.getItem('my_sales_period') || 'all';
        if (!['7d', '30d', 'all'].includes(period)) period = 'all';

        let missingInvoice = localStorage.getItem('my_sales_missing_invoice') === '1';

        let allMySales = [];

        const loadData = async () => {
            const active = store.getSales().filter(s => s.employeeId === user.id && s.plate !== 'VENTE KIT');
            let archived = [];
            try {
                const archives = await store.fetchArchives();
                if (archives && Array.isArray(archives)) {
                    archives.forEach(arch => {
                        let details = arch.payroll_details;
                        if (typeof details === 'string') {
                            try { details = JSON.parse(details); } catch(e) { details = []; }
                        }
                        if (Array.isArray(details)) {
                            const myD = details.find(d => d.employeeId === user.id);
                            if (myD && Array.isArray(myD.sales)) {
                                myD.sales.forEach(s => {
                                    archived.push({ ...s, isArchived: true, archiveLabel: arch.period_label });
                                });
                            }
                        }
                    });
                }
            } catch(e) {
                console.error("Failed to load archives", e);
            }
            allMySales = [...active, ...archived];
            render();
        };

        document.querySelectorAll('.js-period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                period = e.target.dataset.period;
                localStorage.setItem('my_sales_period', period);
                render();
            });
        });
        
        if (missingInvoiceChk) {
            missingInvoiceChk.checked = missingInvoice;
            missingInvoiceChk.addEventListener('change', () => {
                missingInvoice = missingInvoiceChk.checked;
                localStorage.setItem('my_sales_missing_invoice', missingInvoice ? '1' : '0');
                render();
            });
        }

        function render() {
            // Update buttons active state
            document.querySelectorAll('.js-period-btn').forEach(btn => {
                const isLimit = btn.dataset.period === period;
                if (isLimit) {
                    btn.classList.remove('text-slate-400', 'hover:text-white');
                    btn.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
                } else {
                    btn.classList.add('text-slate-400', 'hover:text-white');
                    btn.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
                }
            });

            const term = (searchInput?.value || '').toLowerCase();
            const mySales = allMySales;
            const now = new Date();
            const fromDate = (() => {
                if (period === 'today') {
                    const d = new Date(now);
                    d.setHours(0, 0, 0, 0);
                    return d;
                }
                if (period === '7d') return new Date(now.getTime() - 7 * 24 * 3600000);
                if (period === '30d') return new Date(now.getTime() - 30 * 24 * 3600000);
                return null;
            })();

            let filtered = mySales.filter(s => {
                const a = (s.clientName || '').toLowerCase();
                const b = (s.vehicleModel || '').toLowerCase();
                const matchesSearch = a.includes(term) || b.includes(term);
                const matchesPeriod = fromDate ? (new Date(s.date) >= fromDate) : true;
                const matchesInvoice = missingInvoice ? !s.invoiceUrl : true;
                return matchesSearch && matchesPeriod && matchesInvoice;
            });
            filtered = filtered.sort((a, b) => {
                let av, bv;
                if (sortBy === 'price') { 
                    av = Number(a.price) - Number(a.cost || 0); 
                    bv = Number(b.price) - Number(b.cost || 0); 
                }
                else { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
                if (av < bv) return sortDir === 'asc' ? -1 : 1;
                if (av > bv) return sortDir === 'asc' ? 1 : -1;
                return 0;
            });
            if (countLabel) countLabel.textContent = `${filtered.length} interventions`;

            if (statsEl) {
                // Commission based on MARGIN (Price - Cost)
                const total = filtered.reduce((acc, s) => acc + (Number(s.price) - Number(s.cost || 0)), 0);
                
                // Calculate Prime
                const allEmps = store.getEmployees();
                const currentEmp = allEmps.find(e => e.id === user.id) || user;
                const primePct = getPrimePctForRole(currentEmp.role);
                const prime = total * (primePct / 100);
                
                const StatCard = (title, value, sub, icon, color) => `
                    <div class="relative overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 group hover:border-white/10 transition-all">
                        <div class="absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent pointer-events-none"></div>
                        <div class="relative z-10 flex justify-between items-start">
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${title}</p>
                                <h3 class="text-2xl font-black text-white">${value}</h3>
                                <p class="text-[10px] text-${color}-400 font-medium mt-1">${sub}</p>
                            </div>
                            <div class="p-2.5 rounded-lg bg-slate-800/50 border border-white/5 text-${color}-400 shadow-sm">
                                ${icon}
                            </div>
                        </div>
                    </div>
                `;

                statsEl.innerHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${StatCard('Total Généré (Marge)', formatCurrency(total), period === 'today' ? 'Aujourd’hui' : period === '7d' ? '7 derniers jours' : period === '30d' ? '30 derniers jours' : 'Total cumulé', '<i data-lucide="wallet" class="w-5 h-5"></i>', 'blue')}
                        ${StatCard('Prime Estimée', formatCurrency(prime), `${primePct}% de la Marge`, '<i data-lucide="flame" class="w-5 h-5"></i>', 'orange')}
                    </div>
                `;
                if (window.lucide) lucide.createIcons();
            }

            if (!tableBody) return;
            if (filtered.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="p-12">
                            <div class="flex flex-col items-center justify-center text-center">
                                <div class="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-4 animate-pulse">
                                    <i data-lucide="search-x" class="w-8 h-8"></i>
                                </div>
                                <div class="text-white font-bold text-lg">Aucun résultat</div>
                                <div class="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Aucune intervention ne correspond à vos filtres actuels. Essayez de modifier la recherche.</div>
                                <button onclick="window.location.hash = '#sales/new'" class="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                                    <i data-lucide="plus" class="w-4 h-4"></i>
                                    Nouvelle prestation
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                if (window.lucide) lucide.createIcons();
                return;
            }
            tableBody.innerHTML = filtered.map(s => `
                <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            ${s.isArchived ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20" title="Archivé: ${s.archiveLabel || ''}">ARCHIVE</span>` : ''}
                            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <i data-lucide="car" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <div class="font-bold text-white">${s.vehicleModel || 'Véhicule Inconnu'}</div>
                                <div class="text-xs text-slate-500 font-mono">${s.plate || '—'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="font-medium text-slate-300">${s.serviceType || 'Service Inconnu'}</div>
                        <div class="text-xs text-slate-500">${s.clientName || 'Client Inconnu'}</div>
                    </td>
                    <td class="p-4 font-bold text-white font-mono">${formatCurrency(s.price)}</td>
                    <td class="p-4 font-bold font-mono ${Number(s.price) - Number(s.cost || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}">${formatCurrency(Number(s.price) - Number(s.cost || 0))}</td>
                    <td class="p-4 text-xs text-slate-500 font-mono">${formatDate(s.date)}</td>
                    <td class="p-4">
                        <div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            ${s.invoiceUrl ? `
                                <a href="${s.invoiceUrl}" target="_blank" class="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Voir facture"><i data-lucide="file-text" class="w-4 h-4"></i></a>
                                <button class="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Copier lien" onclick="navigator.clipboard.writeText('${s.invoiceUrl}')"><i data-lucide="copy" class="w-4 h-4"></i></button>
                            ` : `
                                <button onclick="window.location.hash = '#invoice/${s.id}'" class="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors animate-pulse" title="Créer facture"><i data-lucide="receipt" class="w-4 h-4"></i></button>
                            `}
                            ${s.photoUrl ? `
                                <a href="${s.photoUrl}" target="_blank" class="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors" title="Voir photo"><i data-lucide="image" class="w-4 h-4"></i></a>
                            ` : ''}
                            ${!s.isArchived ? `
                            <div class="w-px h-4 bg-white/10 mx-1"></div>
                            <button onclick="window.location.hash = '#sales/edit/${s.id}'" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            ${store.hasPermissionSync(store.getCurrentUser(), 'sales.delete') ? `
                            <button onclick="deleteSale('${s.id}')" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                            ` : ''}
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
            if (window.lucide) lucide.createIcons();
        }
        if (searchInput) {
            const sortBySel = document.getElementById('my-sort-by');
            const sortDirBtn = document.getElementById('my-sort-dir');
            searchInput.addEventListener('input', render);
            if (sortBySel) sortBySel.addEventListener('change', () => { sortBy = sortBySel.value; render(); });
            if (sortDirBtn) sortDirBtn.addEventListener('click', () => { 
                sortDir = sortDir === 'asc' ? 'desc' : 'asc'; 
                // Rotate icon
                const icon = sortDirBtn.querySelector('i');
                if(icon) icon.style.transform = sortDir === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)';
                render(); 
            });
            loadData();
        }
    }, 100);

    return `
        <div class="space-y-8 animate-fade-in pb-20">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-2">
                        <i data-lucide="archive" class="w-3 h-3"></i>
                        <span>Historique</span>
                    </div>
                    <h1 class="text-4xl font-black text-white tracking-tight">Mes Interventions</h1>
                    <p class="text-slate-400 mt-1" id="my-sales-count">Chargement...</p>
                </div>
                <button onclick="window.location.hash = '#sales/new'" class="group relative px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div class="relative flex items-center gap-2">
                        <span>Nouvelle Prestation</span>
                        <i data-lucide="plus" class="w-4 h-4 group-hover:rotate-90 transition-transform"></i>
                    </div>
                </button>
            </div>

            <!-- Stats Overview -->
            <div id="my-sales-stats"></div>

            <!-- Filters Bar -->
            <div class="bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 flex flex-col lg:flex-row gap-3 shadow-lg">
                <div class="flex-1 relative group">
                    <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors"></i>
                    <input type="text" id="search-my-sales" autocomplete="off" placeholder="Rechercher par client, véhicule..." 
                        class="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all">
                </div>
                
                <div class="flex gap-2 overflow-x-auto pb-1 lg:pb-0 items-center">
                    <div class="flex bg-slate-800/50 rounded-xl p-1 border border-white/5">
                        <button class="js-period-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white" data-period="7d">7j</button>
                        <button class="js-period-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white" data-period="30d">30j</button>
                        <button class="js-period-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white" data-period="all">Tout</button>
                    </div>
                    
                    <div class="h-10 w-px bg-white/10 mx-1 self-center"></div>

                    <select id="my-sort-by" class="px-4 py-2.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-blue-500/50 cursor-pointer">
                        <option value="date">Date</option>
                        <option value="price">Marge</option>
                    </select>
                    
                    <button id="my-sort-dir" class="px-3 py-2.5 rounded-xl border border-white/5 bg-slate-800/50 text-white hover:bg-slate-700 transition-colors" title="Inverser l'ordre">
                        <i data-lucide="arrow-down-up" class="w-4 h-4"></i>
                    </button>
                </div>

                <label class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-sm cursor-pointer hover:bg-slate-800/80 transition-colors select-none">
                    <input id="my-missing-invoice" type="checkbox" class="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500/50 bg-slate-700">
                    <span class="whitespace-nowrap font-medium">Sans facture</span>
                </label>
            </div>

            <!-- Results Table -->
            <div class="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr class="border-b border-white/5 bg-white/[0.02]">
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Véhicule</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Prestation</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Prix</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Marge</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Date</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="my-sales-table-body" class="divide-y divide-white/5">
                            <tr>
                                <td colspan="6" class="p-8">
                                    <div class="grid grid-cols-1 gap-4 opacity-50">
                                        ${[...Array(3)].map(() => `
                                            <div class="h-12 bg-slate-800/50 rounded-xl animate-pulse"></div>
                                        `).join('')}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}
