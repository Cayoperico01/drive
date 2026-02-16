import { store } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';
import { Toast } from '../toast.js';

export function AdminSales() {
    // Initial empty state, data loaded via fetchSalesPage
    let currentData = [];
    let totalCount = 0;
    
    // --- TEMPLATE ---
    setTimeout(() => {
        const searchInput = document.getElementById('search-sales');
        const empFilter = document.getElementById('filter-employee');
        const typeFilter = document.getElementById('filter-type');
        const tableBody = document.getElementById('sales-table-body');
        const countLabel = document.getElementById('sales-count');
        const pageSizeSel = document.getElementById('page-size');
        const prevBtn = document.getElementById('pager-prev');
        const nextBtn = document.getElementById('pager-next');
        const pageInfo = document.getElementById('pager-info');
        const statsContainer = document.getElementById('sales-stats-container');

        let currentPage = 1;
        let pageSize = 10;
        let lastFilters = {};

        function getServiceColor(type) {
            const t = (type || '').toLowerCase();
            if (t.includes('custom') || t.includes('tuning')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            if (t.includes('repa') || t.includes('réparation')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            if (t.includes('import')) return 'bg-green-500/10 text-green-400 border-green-500/20';
            if (t.includes('peinture')) return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
            return 'bg-slate-700 text-slate-300 border-slate-600';
        }

        async function loadSales() {
            // Show loading state in table
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="7" class="p-12 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-r-transparent"></div></td></tr>';
            }

            const user = store.getCurrentUser();
            const canDelete = store.hasPermissionSync(user, 'sales.delete');
            
            const term = searchInput ? searchInput.value.toLowerCase() : '';
            const empId = empFilter ? empFilter.value : 'all';
            const type = typeFilter ? typeFilter.value : 'all';

            lastFilters = { term, employeeId: empId, type };

            try {
                const result = await store.fetchSalesPage(currentPage, pageSize, lastFilters);
                currentData = result.data;
                totalCount = result.total;
                renderTable(canDelete);
                updateStats(currentData); // Note: Stats are now only on current page data or need separate agg query
            } catch (e) {
                console.error(e);
                if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-red-500">Erreur de chargement</td></tr>';
            }
        }

        function updateStats(data) {
            if (!statsContainer) return;
            // Warning: These stats are only for the CURRENT PAGE in server-side pagination mode
            // To get global stats, we would need a separate API call like fetchSalesStats()
            // For now, let's just sum the current page to avoid misleading "0"
            
            const totalRevenue = data.reduce((acc, s) => acc + Number(s.price), 0);
            const avgPrice = data.length ? (totalRevenue / data.length) : 0;
            
            statsContainer.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CA (Page)</div>
                        <div class="mt-1 text-2xl font-extrabold text-white">${formatCurrency(totalRevenue)}</div>
                        <div class="mt-1 text-xs text-slate-500">Sur cette page</div>
                    </div>
                    <div class="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interventions</div>
                        <div class="mt-1 text-2xl font-extrabold text-white">${totalCount}</div>
                        <div class="mt-1 text-xs text-slate-500">Total trouvé</div>
                    </div>
                    <div class="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Panier Moyen</div>
                        <div class="mt-1 text-2xl font-extrabold text-blue-400">${formatCurrency(avgPrice)}</div>
                        <div class="mt-1 text-xs text-slate-500">Sur cette page</div>
                    </div>
                </div>
            `;
        }

        function renderTable(canDelete, isPatron) {
            if (!tableBody) return;

            // Update Count
            if (countLabel) countLabel.textContent = `${totalCount} interventions trouvées`;

            // Pager Logic
            const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
            if (currentPage > totalPages) currentPage = totalPages;
            
            if (pageInfo) pageInfo.textContent = `Page ${currentPage}/${totalPages}`;
            if (prevBtn) prevBtn.disabled = currentPage <= 1;
            if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

            if (currentData.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-slate-500">Aucune intervention trouvée.</td></tr>';
                return;
            }

            tableBody.innerHTML = currentData.map(s => {
                const emp = store.getEmployeeByIdSync(s.employeeId);
                const empInitials = emp ? `${emp.first_name[0]}${emp.last_name[0]}` : '??';
                const empName = emp ? `${emp.first_name} ${emp.last_name}` : 'Inconnu';
                
                return `
                <tr class="hover:bg-slate-700/30 transition-colors border-b border-slate-700/50 last:border-0 group">
                    <td class="p-4">
                        <div class="font-bold text-slate-200 text-sm">${s.vehicleModel}</div>
                        <div class="text-xs text-slate-500 mt-0.5">${s.clientName || 'Client Inconnu'} ${s.clientPhone ? `• ${s.clientPhone}` : ''}</div>
                    </td>
                    <td class="p-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${getServiceColor(s.serviceType)}">
                            ${s.serviceType}
                        </span>
                    </td>
                    <td class="p-4 font-mono font-bold text-white">${formatCurrency(s.price)}</td>
                    <td class="p-4 font-mono font-bold ${Number(s.price) - Number(s.cost || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}">
                        ${isPatron ? formatCurrency(Number(s.price) - Number(s.cost || 0)) : formatCurrency(Number(s.price) - Number(s.cost || 0))}
                    </td>
                    <td class="p-4">
                        <div class="flex items-center gap-2" title="${empName}">
                            <div class="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                                ${empInitials}
                            </div>
                            <span class="text-sm text-slate-400 hidden lg:inline">${empName}</span>
                        </div>
                    </td>
                    <td class="p-4 text-sm text-slate-500">
                        <div class="flex flex-col">
                            <span class="text-slate-300 font-medium">${new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                            <span class="text-xs text-slate-500">${new Date(s.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            ${s.invoiceUrl ? `
                                <a href="${s.invoiceUrl}" target="_blank" class="p-2 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors" title="Voir facture"><i data-lucide="file-text" class="w-4 h-4"></i></a>
                            ` : `
                                <button onclick="window.location.hash = '#invoice/${s.id}'" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Générer facture"><i data-lucide="receipt" class="w-4 h-4"></i></button>
                            `}
                            ${s.photoUrl ? `
                                <a href="${s.photoUrl}" target="_blank" class="p-2 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors" title="Voir photo"><i data-lucide="image" class="w-4 h-4"></i></a>
                            ` : ''}
                            
                            <div class="w-px h-4 bg-slate-700 mx-1"></div>

                            <button onclick="window.location.hash = '#sales/edit/${s.id}'" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            ${canDelete ? `
                            <button onclick="deleteSale('${s.id}')" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `}).join('');
            
            // Re-init icons for new content
            if(window.lucide) lucide.createIcons();
        }

        // Attach Listeners
        if(searchInput) {
            // Debounce search
            let timeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => { currentPage = 1; loadSales(); }, 500);
            });

            empFilter.addEventListener('change', () => { currentPage = 1; loadSales(); });
            typeFilter.addEventListener('change', () => { currentPage = 1; loadSales(); });
            // sort logic removed from UI for now as DB sort is complex to wire up quickly, kept default date desc
            
            pageSizeSel.addEventListener('change', () => { pageSize = Number(pageSizeSel.value); currentPage = 1; loadSales(); });
            prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; loadSales(); } });
            nextBtn.addEventListener('click', () => { currentPage++; loadSales(); });

            // Initial render
            const q = window.location.hash.match(/employee=([^&]+)/);
            if (q && empFilter) {
                empFilter.value = q[1];
            }
            const newBtn = document.getElementById('new-sale-btn');
            const setNewBtn = () => {
                const empId = empFilter ? empFilter.value : 'all';
                if (newBtn) {
                    newBtn.onclick = () => {
                        window.location.hash = empId && empId !== 'all' ? `#sales/new?employee=${empId}` : '#sales/new';
                    };
                }
            };
            setNewBtn();
            if (empFilter) empFilter.addEventListener('change', setNewBtn);
            
            const exportBtn = document.getElementById('export-csv-btn');
            if (exportBtn) {
                exportBtn.onclick = async () => {
                    // Export ALL matching filters, not just current page
                    Toast.show("Préparation de l'export...", "info");
                    try {
                        // Fetch all pages (conceptually) or use a special export endpoint
                        // For now, let's fetch a large page
                        const result = await store.fetchSalesPage(1, 1000, lastFilters);
                        const csvContent = store.exportSalesToCSV(result.data);
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement("a");
                        const url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", `export_atelier_${new Date().toISOString().slice(0,10)}.csv`);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        Toast.show("Export terminé", "success");
                    } catch(e) {
                        Toast.show("Erreur export", "error");
                    }
                };
            }

            loadSales();
        }
    }, 100);

    // Initial Static Render
    const employees = store.getEmployees();
    // We don't have all sales loaded initially, so we can't compute unique types easily.
    // Use hardcoded or cached types for now.
    const uniqueTypes = ['Réparation', 'Customisation', 'Import', 'Peinture', 'Entretien']; 

    return `
        <div class="space-y-6 animate-fade-in">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 class="text-3xl font-bold text-white">Historique Atelier</h2>
                    <p class="text-slate-400 mt-1" id="sales-count">${totalCount} interventions trouvées</p>
                </div>
                <div class="flex gap-2">
                    <button id="new-sale-btn" onclick="window.location.hash = '#sales/new'" class="bg-blue-600 has-sheen hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm shadow-blue-600/20 transition-all">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span>Nouvelle Prestation</span>
                    </button>
                    <button id="export-csv-btn" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Export CSV</span>
                    </button>
                </div>
            </div>

            <!-- Stats Cards (Injected via JS) -->
            <div id="sales-stats-container"></div>

            <!-- Filters Bar -->
            <div class="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col xl:flex-row gap-4">
                <div class="flex-1 relative">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"></i>
                    <input type="text" id="search-sales" autocomplete="off" placeholder="Rechercher client, véhicule..." class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm">
                </div>
                
                <div class="flex flex-wrap gap-2">
                    <select id="filter-employee" class="px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm max-w-[200px]">
                        <option value="all">Tous les employés</option>
                        ${employees.map(e => `<option value="${e.id}">${e.first_name} ${e.last_name}</option>`).join('')}
                    </select>

                    <select id="filter-type" class="px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm max-w-[150px]">
                        <option value="all">Tous les types</option>
                        ${uniqueTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                    
                    <div class="w-px h-10 bg-slate-700 mx-2 hidden xl:block"></div>

                    <select id="sort-by" class="px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm">
                        <option value="date">Date</option>
                        <option value="price">Prix</option>
                        <option value="client">Client</option>
                    </select>
                    <button id="sort-dir" class="px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-colors">Desc</button>
                    <select id="page-size" class="px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white text-sm">
                        <option value="10">10 / page</option>
                        <option value="25">25 / page</option>
                        <option value="50">50 / page</option>
                    </select>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead class="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th class="p-4 pl-4">Véhicule</th>
                                <th class="p-4">Prestation</th>
                                <th class="p-4">Prix</th>
                                <th class="p-4">Marge</th>
                                <th class="p-4">Mécano</th>
                                <th class="p-4">Date</th>
                                <th class="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="sales-table-body" class="divide-y divide-slate-700/50">
                            <tr>
                                <td colspan="7" class="p-12 text-center">
                                    <div class="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                                        ${[...Array(5)].map(() => `
                                            <div class="flex gap-4">
                                                <div class="h-10 w-32 bg-slate-700/30 rounded animate-pulse"></div>
                                                <div class="h-10 w-24 bg-slate-700/30 rounded animate-pulse"></div>
                                                <div class="h-10 flex-1 bg-slate-700/30 rounded animate-pulse"></div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-900/30">
                    <div id="pager-info" class="text-sm text-slate-400">Page 1/1</div>
                    <div class="flex items-center gap-2">
                        <button id="pager-prev" class="px-4 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white disabled:opacity-50 hover:bg-slate-600 transition-colors text-sm font-medium">Précédent</button>
                        <button id="pager-next" class="px-4 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white disabled:opacity-50 hover:bg-slate-600 transition-colors text-sm font-medium">Suivant</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}