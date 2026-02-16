import { store } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';
import { Toast } from '../toast.js';

export function PlateDirectory() {
    // State
    let allSales = [];
    let uniquePlates = [];
    let filteredPlates = [];
    
    // --- TEMPLATE ---
    setTimeout(() => {
        const searchInput = document.getElementById('search-plate');
        const tableBody = document.getElementById('plates-table-body');
        const countLabel = document.getElementById('plates-count');
        const modal = document.getElementById('plate-history-modal');
        const modalContent = document.getElementById('plate-history-content');
        const closeModalBtn = document.getElementById('close-modal-btn');

        async function loadData() {
            // Show loading
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="6" class="p-12 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-r-transparent"></div></td></tr>';

            try {
                // 1. Fetch Active Sales
                // Fetch all sales to aggregate data (limit 2000 for performance safety)
                const result = await store.fetchSalesPage(1, 2000, {}); 
                allSales = result.data;
                
                // Archived sales removed as requested (useless without plates)
                
                processPlates();
                renderTable();
            } catch (e) {
                console.error(e);
                if (tableBody) tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500">Erreur de chargement</td></tr>';
            }
        }

        function processPlates() {
            const map = new Map();

            allSales.forEach(s => {
                const plate = (s.plate || 'INCONNU').toUpperCase().trim();
                if (!plate || plate === 'INCONNU') return;

                if (!map.has(plate)) {
                    map.set(plate, {
                        plate: plate,
                        vehicle: s.vehicleModel || 'Inconnu',
                        client: s.clientName || 'Inconnu',
                        phone: s.clientPhone || '',
                        visits: 0,
                        totalSpent: 0,
                        lastVisit: new Date(0),
                        history: []
                    });
                }

                const entry = map.get(plate);
                entry.visits++;
                entry.totalSpent += Number(s.price || 0);
                const date = new Date(s.date);
                if (date > entry.lastVisit) {
                    entry.lastVisit = date;
                    // Update vehicle/client info to most recent
                    if (s.vehicleModel) entry.vehicle = s.vehicleModel;
                    if (s.clientName) entry.client = s.clientName;
                    if (s.clientPhone) entry.phone = s.clientPhone;
                }
                entry.history.push(s);
            });

            uniquePlates = Array.from(map.values()).sort((a, b) => b.lastVisit - a.lastVisit);
            filteredPlates = uniquePlates;
        }

        function renderTable() {
            if (!tableBody) return;

            // Stats Update
            if (document.getElementById('stat-unique-count')) {
                document.getElementById('stat-unique-count').textContent = uniquePlates.length;
                const totalAll = uniquePlates.reduce((acc, p) => acc + p.totalSpent, 0);
                document.getElementById('stat-total-spent').textContent = formatCurrency(totalAll);
                
                const topP = uniquePlates.reduce((prev, current) => (prev.totalSpent > current.totalSpent) ? prev : current, {client: '--', totalSpent: 0});
                document.getElementById('stat-top-client').textContent = topP.client;
                document.getElementById('stat-top-client-amt').textContent = formatCurrency(topP.totalSpent);
            }

            const term = searchInput ? searchInput.value.toLowerCase() : '';
            filteredPlates = uniquePlates.filter(p => 
                p.plate.toLowerCase().includes(term) || 
                p.client.toLowerCase().includes(term) ||
                p.vehicle.toLowerCase().includes(term)
            );

            if (countLabel) countLabel.textContent = `${filteredPlates.length} véhicules répertoriés`;

            if (filteredPlates.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" class="p-12 text-center text-slate-500 italic">Aucun véhicule trouvé dans les archives.</td></tr>';
                return;
            }

            tableBody.innerHTML = filteredPlates.map(p => `
                <tr class="hover:bg-slate-700/40 transition-all border-b border-slate-700/50 last:border-0 group cursor-pointer" onclick="window.viewPlateHistory('${p.plate}')">
                    <td class="p-5 pl-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors">
                                <i data-lucide="car-front" class="w-5 h-5"></i>
                            </div>
                            <div class="font-bold text-white text-base font-mono bg-slate-900/50 px-2.5 py-1 rounded border border-slate-700 group-hover:border-blue-500/50 transition-colors">${p.plate}</div>
                        </div>
                    </td>
                    <td class="p-5">
                        <div class="font-bold text-slate-200">${p.vehicle}</div>
                    </td>
                    <td class="p-5">
                        <div class="font-medium text-white">${p.client}</div>
                        ${p.phone ? `<div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><i data-lucide="phone" class="w-3 h-3"></i> ${p.phone}</div>` : ''}
                    </td>
                    <td class="p-5 text-center">
                        <div class="inline-flex flex-col items-center">
                            <span class="text-lg font-bold text-white">${p.visits}</span>
                            <span class="text-[10px] uppercase text-slate-500 font-bold">Visites</span>
                        </div>
                    </td>
                    <td class="p-5">
                        <div class="font-bold text-emerald-400 text-base">${formatCurrency(p.totalSpent)}</div>
                        <div class="w-24 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-emerald-500" style="width: ${Math.min(100, (p.totalSpent / 50000) * 100)}%"></div>
                        </div>
                    </td>
                    <td class="p-5 text-sm text-slate-400">
                        ${p.lastVisit.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'})}
                    </td>
                    <td class="p-5 text-right pr-6">
                        <button class="p-2 rounded-lg bg-slate-700 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                            <i data-lucide="chevron-right" class="w-5 h-5"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            
            if(window.lucide) lucide.createIcons();
        }

        // Global function to open modal
        window.viewPlateHistory = (plate) => {
            const p = uniquePlates.find(x => x.plate === plate);
            if (!p) return;

            // Sort history by date desc
            const sortedHistory = p.history.sort((a, b) => new Date(b.date) - new Date(a.date));

            modalContent.innerHTML = `
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <div class="flex items-center gap-3 mb-1">
                            <h3 class="text-2xl font-bold text-white font-mono">${p.plate}</h3>
                            <span class="px-2 py-1 rounded bg-slate-700 text-xs text-slate-300 border border-slate-600">${p.vehicle}</span>
                        </div>
                        <p class="text-slate-400 text-sm">Propriétaire: <span class="text-white">${p.client}</span> ${p.phone ? `(${p.phone})` : ''}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Dépensé</p>
                        <p class="text-2xl font-bold text-emerald-400">${formatCurrency(p.totalSpent)}</p>
                    </div>
                </div>

                <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    ${sortedHistory.map(h => {
                        const emp = store.getEmployeeByIdSync(h.employeeId);
                        const empName = emp ? `${emp.first_name} ${emp.last_name}` : 'Inconnu';
                        
                        return `
                        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                            <div class="flex justify-between items-start mb-2">
                                <div class="font-bold text-white text-sm">${h.serviceType}</div>
                                <div class="text-emerald-400 font-bold font-mono text-sm">${formatCurrency(h.price)}</div>
                            </div>
                            <div class="flex justify-between items-end text-xs text-slate-500">
                                <div>
                                    <p>Par <span class="text-slate-400">${empName}</span></p>
                                    <p class="mt-0.5">${new Date(h.date).toLocaleDateString('fr-FR')} à ${new Date(h.date).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</p>
                                </div>
                                <div>
                                    ${h.invoiceUrl ? `<a href="${h.invoiceUrl}" target="_blank" class="text-blue-400 hover:underline flex items-center gap-1"><i data-lucide="external-link" class="w-3 h-3"></i> Facture</a>` : ''}
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            modal.classList.remove('hidden');
            if(window.lucide) lucide.createIcons();
        };

        if (searchInput) {
            searchInput.addEventListener('input', () => renderTable());
        }

        if (closeModalBtn) {
            closeModalBtn.onclick = () => {
                modal.classList.add('hidden');
            };
        }

        // Close on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        }

        loadData();

    }, 100);

    return `
        <div class="space-y-6 animate-fade-in pb-12">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
                <div class="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div class="relative z-10">
                    <h2 class="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <span class="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                            <i data-lucide="book" class="w-6 h-6"></i>
                        </span>
                        Annuaire Plaques
                    </h2>
                    <p class="text-slate-400 mt-2 font-medium" id="plates-count">Chargement des données...</p>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg group hover:border-blue-500/30 transition-colors">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Véhicules Uniques</p>
                            <h3 class="text-2xl font-bold text-white mt-1" id="stat-unique-count">--</h3>
                        </div>
                        <div class="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <i data-lucide="car" class="w-5 h-5"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg group hover:border-emerald-500/30 transition-colors">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dépensé (Global)</p>
                            <h3 class="text-2xl font-bold text-emerald-400 mt-1" id="stat-total-spent">--</h3>
                        </div>
                        <div class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <i data-lucide="dollar-sign" class="w-5 h-5"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg group hover:border-purple-500/30 transition-colors">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Client</p>
                            <h3 class="text-lg font-bold text-white mt-1 truncate max-w-[150px]" id="stat-top-client">--</h3>
                            <p class="text-xs text-purple-400" id="stat-top-client-amt">--</p>
                        </div>
                        <div class="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <i data-lucide="crown" class="w-5 h-5"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search Bar -->
            <div class="bg-slate-800 p-1 rounded-xl shadow-lg border border-slate-700 max-w-2xl mx-auto transform transition-all focus-within:scale-[1.02] focus-within:ring-2 focus-within:ring-blue-500/50">
                <div class="relative flex items-center">
                    <i data-lucide="search" class="absolute left-4 w-5 h-5 text-slate-400"></i>
                    <input type="text" id="search-plate" autocomplete="off" placeholder="Rechercher une plaque, un client, un modèle..." class="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-slate-500 outline-none text-base font-medium">
                    <div class="absolute right-3 hidden md:flex items-center gap-2 pointer-events-none">
                        <kbd class="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-600 bg-slate-700 px-1.5 font-mono text-[10px] font-medium text-slate-400">CTRL+F</kbd>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead class="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th class="p-5 pl-6">Plaque</th>
                                <th class="p-5">Véhicule</th>
                                <th class="p-5">Dernier Proprio.</th>
                                <th class="p-5 text-center">Fidélité</th>
                                <th class="p-5">Total Investi</th>
                                <th class="p-5">Dernière Venue</th>
                                <th class="p-5 text-right pr-6"></th>
                            </tr>
                        </thead>
                        <tbody id="plates-table-body" class="divide-y divide-slate-700/50 bg-slate-800/50">
                            <!-- JS Content -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- History Modal -->
        <div id="plate-history-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
            <div class="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl transform transition-all scale-100">
                <div class="p-6 relative">
                    <button id="close-modal-btn" class="absolute right-4 top-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                    <div id="plate-history-content">
                        <!-- JS Injected -->
                    </div>
                </div>
            </div>
        </div>
    `;
}
