
import { store } from '../store.js';
import { auth } from '../auth.js';
import { formatCurrency } from '../utils.js';
import { Toast } from '../toast.js';
import { Modal } from '../modal.js';

export function TuningCalculator() {
    
    const user = auth.getUser();
    // Only patron can manage (add/delete) and see costs
    const isAdmin = user && user.role === 'patron';

    // Categories configuration
    const CATEGORIES = {
        // COULEURS
        'paint': { label: 'Peinture', icon: 'palette', color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
        'rouge': { label: 'Rouge', icon: 'palette', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        'bleu': { label: 'Bleu', icon: 'palette', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        'vert': { label: 'Vert', icon: 'palette', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        'jaune': { label: 'Jaune', icon: 'palette', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        'orange': { label: 'Orange', icon: 'palette', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        'violet': { label: 'Violet', icon: 'palette', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        'rose': { label: 'Rose', icon: 'palette', color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
        'blanc': { label: 'Blanc', icon: 'palette', color: 'text-slate-100', bg: 'bg-slate-100/10', border: 'border-slate-100/20' },
        'noir': { label: 'Noir', icon: 'palette', color: 'text-slate-400', bg: 'bg-black/40', border: 'border-slate-600' },
        'gris': { label: 'Gris', icon: 'palette', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
        'marron': { label: 'Marron', icon: 'palette', color: 'text-amber-700', bg: 'bg-amber-700/10', border: 'border-amber-700/20' },
        'metal': { label: 'Métal', icon: 'sparkles', color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/20' },
        'mat': { label: 'Mat', icon: 'layers', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
        'chrome': { label: 'Chrome', icon: 'sparkles', color: 'text-cyan-200', bg: 'bg-cyan-200/10', border: 'border-cyan-200/20' },
        'or': { label: 'Or', icon: 'sparkles', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        'nacre': { label: 'Nacré', icon: 'sparkles', color: 'text-pink-300', bg: 'bg-pink-300/10', border: 'border-pink-300/20' },

        // PIECES
        'engine': { label: 'Moteur', icon: 'zap', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
        'brakes': { label: 'Freins', icon: 'disc', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
        'transmission': { label: 'Transmission', icon: 'git-merge', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
        'suspension': { label: 'Suspension', icon: 'move-vertical', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
        'turbo': { label: 'Turbo', icon: 'wind', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
        'body': { label: 'Carrosserie', icon: 'car', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
        'wheels': { label: 'Roues', icon: 'circle', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
        'interior': { label: 'Intérieur', icon: 'armchair', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
        'lights': { label: 'Éclairage', icon: 'lightbulb', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        'other': { label: 'Autre', icon: 'box', color: 'text-slate-300', bg: 'bg-slate-700/50', border: 'border-slate-600' }
    };

    const TABS = {
        'all': { label: 'Tout', icon: 'grid' },
        'paint': { 
            label: 'Peintures', 
            icon: 'palette', 
            categories: ['paint', 'rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet', 'rose', 'blanc', 'noir', 'gris', 'marron', 'metal', 'mat', 'chrome', 'or', 'nacre'] 
        },
        'performance': { 
            label: 'Performance', 
            icon: 'gauge', 
            categories: ['engine', 'brakes', 'transmission', 'suspension', 'turbo'] 
        },
        'aesthetic': { 
            label: 'Esthétique', 
            icon: 'car', 
            categories: ['wheels', 'interior', 'body', 'lights', 'other'] 
        }
    };

    // State
    let state = {
        catalog: [],
        activeItems: new Set(),
        searchTerm: '',
        activeTab: 'all',
        targetPrice: null
    };

    // --- HTML TEMPLATE ---
    const html = `
        <div id="tuning-calculator-root" class="space-y-6 animate-fade-in pb-24 max-w-7xl mx-auto">
            
            <!-- TOP BAR: ACTIONS & TOTALS -->
            <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 flex flex-col lg:flex-row justify-between items-center gap-6 sticky top-4 z-30 backdrop-blur-md bg-slate-900/90">
                <div class="flex items-center gap-5 w-full lg:w-auto">
                    <div class="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-300">
                        <i data-lucide="calculator" class="w-8 h-8 text-white"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-white leading-none tracking-tight">Calculateur</h2>
                        <div class="flex gap-6 text-sm mt-2 items-center">
                            <span class="text-slate-400 font-medium">Total: <span id="header-total" class="text-white font-mono font-bold text-lg ml-1">$0</span></span>
                            ${isAdmin ? `<span class="text-emerald-500 font-medium flex items-center gap-1">Profit: <span id="header-profit" class="font-mono font-bold text-lg">$0</span></span>` : ''}
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                    <!-- MAGIC WAND -->
                    <div class="group flex items-center bg-slate-800/50 rounded-xl border border-slate-700 p-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                        <input type="number" id="magic-input" placeholder="Budget..." class="bg-transparent border-none text-white text-sm w-28 px-3 py-1.5 outline-none text-right font-mono placeholder-slate-500" />
                        <button data-action="magic-calc" class="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/20" title="Calcul Automatique">
                            <i data-lucide="wand-2" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <div class="h-8 w-px bg-slate-700 mx-1 hidden sm:block"></div>

                    <button data-action="refresh" class="p-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all hover:scale-105" title="Rafraîchir">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                    
                    ${isAdmin ? `
                    <button data-action="open-add-modal" class="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span class="hidden sm:inline">Ajouter</span>
                    </button>` : ''}
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <!-- LEFT: CATALOG -->
                <div class="lg:col-span-8 space-y-6">
                    <!-- TABS -->
                    <div class="flex flex-wrap gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800 w-fit" id="catalog-tabs">
                        ${Object.entries(TABS).map(([key, tab]) => `
                            <button data-action="switch-tab" data-tab="${key}" 
                                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${key === state.activeTab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-800'}">
                                <i data-lucide="${tab.icon}" class="w-4 h-4"></i>
                                ${tab.label}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Search & Filter -->
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i data-lucide="search" class="w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors"></i>
                        </div>
                        <input type="text" id="catalog-search" placeholder="Rechercher une pièce, couleur..." 
                            class="block w-full rounded-2xl border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 py-4 pl-12 pr-4 shadow-sm transition-all text-sm" />
                    </div>

                    <!-- Catalog List -->
                    <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden min-h-[500px]">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-bold">
                                    <tr>
                                        <th class="p-5 w-16 text-center">
                                            <i data-lucide="check-square" class="w-4 h-4 mx-auto opacity-50"></i>
                                        </th>
                                        <th class="p-5">Article</th>
                                        <th class="p-5 hidden sm:table-cell">Catégorie</th>
                                        <th class="p-5 text-right">Prix Client</th>
                                        ${isAdmin ? '<th class="p-5 text-right hidden sm:table-cell text-slate-500">Coût</th>' : ''}
                                        ${isAdmin ? '<th class="p-5 w-12"></th>' : ''}
                                    </tr>
                                </thead>
                                <tbody id="catalog-list" class="divide-y divide-slate-800">
                                    <tr><td colspan="${isAdmin ? 6 : 4}" class="p-12 text-center"><div class="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: RECEIPT -->
                <div class="lg:col-span-4 space-y-6">
                    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden text-slate-900 transform transition-all sticky top-32">
                        <!-- Receipt Header -->
                        <div class="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                            <h3 class="font-bold text-slate-800 flex items-center gap-3 text-lg">
                                <div class="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <i data-lucide="receipt" class="w-5 h-5 text-indigo-600"></i>
                                </div>
                                Ticket
                            </h3>
                            <span class="text-xs font-mono font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-100" id="receipt-date">--/--</span>
                        </div>
                        
                        <!-- Receipt Items -->
                        <div class="p-5 min-h-[300px] max-h-[600px] overflow-y-auto bg-slate-50/50 space-y-3 custom-scrollbar" id="receipt-items">
                            <div class="flex flex-col items-center justify-center h-full py-12 text-slate-400 space-y-3 opacity-60">
                                <i data-lucide="shopping-cart" class="w-12 h-12 stroke-1"></i>
                                <span class="italic text-sm">Aucun article sélectionné</span>
                            </div>
                        </div>

                        <!-- Receipt Footer -->
                        <div class="bg-white border-t border-slate-200 p-6 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10">
                            <div class="flex justify-between items-end">
                                <span class="text-slate-500 font-medium text-sm mb-1">Total Client</span>
                                <span class="font-bold font-mono text-3xl tracking-tight text-slate-800" id="receipt-total">$0.00</span>
                            </div>
                            
                            ${isAdmin ? `
                            <div class="pt-3 border-t border-slate-100 space-y-2">
                                <div class="flex justify-between text-xs text-slate-400">
                                    <span>Coût Entreprise</span>
                                    <span class="font-mono" id="receipt-cost">$0.00</span>
                                </div>
                                <div class="flex justify-between text-sm items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                    <span class="text-emerald-700 font-bold flex items-center gap-2">
                                        <i data-lucide="trending-up" class="w-4 h-4"></i> Marge
                                    </span>
                                    <span class="font-bold font-mono text-emerald-700 text-lg" id="receipt-profit">$0.00</span>
                                </div>
                            </div>` : ''}

                            <button data-action="create-invoice" class="w-full group relative overflow-hidden py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 mt-4">
                                <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                <span>Générer Facture</span>
                                <i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <!-- MODAL ADD -->
            <div id="modal-add" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 hidden flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                    <div class="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <h3 class="font-bold text-white text-lg">Ajouter un article</h3>
                        <button data-action="close-modal" class="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <div class="p-8 space-y-6">
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom de l'article</label>
                            <input type="text" id="inp-name" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600" placeholder="Ex: Peinture Rouge Sang" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Catégorie</label>
                            <div class="relative">
                                <select id="inp-cat" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                                    <optgroup label="Peintures">
                                        <option value="paint">Peinture</option>
                                    </optgroup>
                                    <optgroup label="Performance">
                                        ${TABS.performance.categories.map(k => `<option value="${k}">${CATEGORIES[k].label}</option>`).join('')}
                                    </optgroup>
                                    <optgroup label="Esthétique">
                                        ${TABS.aesthetic.categories.map(k => `<option value="${k}">${CATEGORIES[k].label}</option>`).join('')}
                                    </optgroup>
                                </select>
                                <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none"></i>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <label class="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Prix Client</label>
                                <div class="relative">
                                    <input type="number" id="inp-price" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder-slate-600" placeholder="0" />
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Coût Garage</label>
                                <div class="relative">
                                    <input type="number" id="inp-cost" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none placeholder-slate-600" placeholder="0" />
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">$</span>
                                </div>
                            </div>
                        </div>
                        <button data-action="save-item" class="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Enregistrer l'article
                        </button>
                    </div>
                </div>
            </div>

        </div>
    `;

    // --- LOGIC ---

    async function loadCatalog() {
        try {
            const data = await store.getTuningCatalog();
            state.catalog = data || [];
            renderCatalog();
            updateReceipt();
        } catch (e) {
            console.error(e);
            Toast.show('Erreur de chargement', 'error');
        }
    }

    function renderCatalog() {
        const tbody = document.getElementById('catalog-list');
        const tabsContainer = document.getElementById('catalog-tabs');
        if (!tbody) return;

        // Re-render tabs if needed (to update active state)
        if (tabsContainer) {
            tabsContainer.innerHTML = Object.entries(TABS).map(([key, tab]) => `
                <button data-action="switch-tab" data-tab="${key}" 
                    class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${key === state.activeTab ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'}">
                    <i data-lucide="${tab.icon}" class="w-4 h-4"></i>
                    ${tab.label}
                </button>
            `).join('');
        }

        const term = state.searchTerm.toLowerCase();
        
        let filtered = state.catalog.filter(item => {
            // Text Search
            const matchesSearch = item.name.toLowerCase().includes(term) || 
                                (CATEGORIES[item.category]?.label || '').toLowerCase().includes(term);
            
            // Tab Filter
            let matchesTab = true;
            if (state.activeTab !== 'all') {
                const allowedCategories = TABS[state.activeTab].categories;
                matchesTab = allowedCategories.includes(item.category);
            }

            return matchesSearch && matchesTab;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${isAdmin ? 6 : 4}" class="p-8 text-center text-slate-500 italic">Aucun résultat.</td></tr>`;
            return;
        }

        // Sort: Active first, then Category, then Name
        filtered.sort((a, b) => {
            const aActive = state.activeItems.has(a.id);
            const bActive = state.activeItems.has(b.id);
            if (aActive !== bActive) return bActive - aActive;
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return a.name.localeCompare(b.name);
        });

        tbody.innerHTML = filtered.map(item => {
            const cat = CATEGORIES[item.category] || CATEGORIES.other;
            const isActive = state.activeItems.has(item.id);
            
            return `
                <tr class="group border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer ${isActive ? 'bg-blue-900/10' : ''}" 
                    data-action="toggle-item" data-id="${item.id}">
                    <td class="p-4 text-center">
                        <div class="w-5 h-5 mx-auto rounded border ${isActive ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-slate-800'} flex items-center justify-center transition-colors">
                            ${isActive ? '<i data-lucide="check" class="w-3.5 h-3.5 text-white"></i>' : ''}
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="font-bold text-white">${item.name}</div>
                        <div class="sm:hidden text-xs text-slate-400 mt-1">${cat.label}</div>
                    </td>
                    <td class="p-4 hidden sm:table-cell">
                        <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${cat.bg} ${cat.color} ${cat.border}">
                            <i data-lucide="${cat.icon}" class="w-3 h-3"></i>
                            ${cat.label}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        <div class="font-mono font-bold text-emerald-400">${formatCurrency(item.price)}</div>
                    </td>
                    ${isAdmin ? `
                    <td class="p-4 text-right hidden sm:table-cell">
                        <div class="font-mono text-slate-500 text-sm">${formatCurrency(item.cost)}</div>
                    </td>
                    <td class="p-4 text-center">
                        <button type="button" data-action="delete-item" data-id="${item.id}" class="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors z-10 relative">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </td>` : ''}
                </tr>
            `;
        }).join('');
        
        if(window.lucide) lucide.createIcons();
    }

    function updateReceipt() {
        const container = document.getElementById('receipt-items');
        const elTotal = document.getElementById('receipt-total');
        const elCost = document.getElementById('receipt-cost');
        const elProfit = document.getElementById('receipt-profit');
        const elHeaderTotal = document.getElementById('header-total');
        const elHeaderProfit = document.getElementById('header-profit');

        if (!container) return;

        // Get active items objects
        const items = state.catalog.filter(i => state.activeItems.has(i.id));
        
        // Calculate totals from items
        let itemsTotal = 0, cost = 0;
        items.forEach(i => {
            itemsTotal += Number(i.price);
            cost += Number(i.cost);
        });

        // Determine Final Total (use targetPrice if set and greater than itemsTotal)
        let finalTotal = itemsTotal;
        let adjustment = 0;

        if (state.targetPrice && state.targetPrice > itemsTotal) {
            finalTotal = state.targetPrice;
            adjustment = state.targetPrice - itemsTotal;
        } else {
            // If items exceed target or no target, reset target (optional, but safer)
            // state.targetPrice = null; // Let's keep it sticky unless manual action clears it
        }

        const profit = finalTotal - cost;

        // Update UI Text
        if (elTotal) elTotal.textContent = formatCurrency(finalTotal);
        if (elCost) elCost.textContent = formatCurrency(cost);
        if (elProfit) elProfit.textContent = formatCurrency(profit);
        if (elHeaderTotal) elHeaderTotal.textContent = formatCurrency(finalTotal);
        if (elHeaderProfit) elHeaderProfit.textContent = formatCurrency(profit);

        // Render List
        if (items.length === 0 && adjustment === 0) {
            container.innerHTML = `<div class="text-center text-slate-400 italic py-8 text-sm">Aucun article sélectionné</div>`;
        } else {
            let html = items.map(item => `
                <div class="flex justify-between items-center p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div class="text-sm">
                        <div class="font-bold text-slate-700">${item.name}</div>
                        <div class="text-xs text-slate-400">${CATEGORIES[item.category]?.label || 'Autre'}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-mono font-bold text-slate-800">${formatCurrency(item.price)}</div>
                        <button data-action="remove-receipt-item" data-id="${item.id}" class="text-xs text-red-400 hover:text-red-600 hover:underline">Retirer</button>
                    </div>
                </div>
            `).join('');

            // Append Adjustment Item if needed
            if (adjustment > 0) {
                html += `
                <div class="flex justify-between items-center p-2 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm border-l-4 border-l-indigo-500">
                    <div class="text-sm">
                        <div class="font-bold text-indigo-900">Ajustement / Main d'oeuvre</div>
                        <div class="text-xs text-indigo-500">Pour atteindre l'objectif</div>
                    </div>
                    <div class="text-right">
                        <div class="font-mono font-bold text-indigo-700">${formatCurrency(adjustment)}</div>
                        <div class="text-[10px] text-indigo-400 italic">Marge 100%</div>
                    </div>
                </div>
                `;
            }

            container.innerHTML = html;
        }
        
        document.getElementById('receipt-date').textContent = new Date().toLocaleDateString();
    }

    // --- ACTIONS ---

    async function handleAddItem() {
        const nameInput = document.getElementById('inp-name');
        const catInput = document.getElementById('inp-cat');
        const priceInput = document.getElementById('inp-price');
        const costInput = document.getElementById('inp-cost');
        const btn = document.querySelector('[data-action="save-item"]');

        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value);
        const cost = parseFloat(costInput.value) || 0;

        if (!name || isNaN(price)) {
            Toast.show('Nom et prix requis', 'warning');
            return;
        }

        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="animate-spin" data-lucide="loader-2"></i>';
            if (window.lucide) lucide.createIcons();

            await store.saveTuningItem({
                id: null,
                name,
                category: catInput.value,
                price,
                cost
            });

            // Clear inputs
            nameInput.value = '';
            priceInput.value = '';
            costInput.value = '';
            document.getElementById('modal-add').classList.add('hidden');
            
            Toast.show('Article ajouté');
            await loadCatalog();
        } catch (e) {
            console.error(e);
            Toast.show('Erreur lors de la sauvegarde', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Enregistrer';
        }
    }

    async function handleDeleteItem(id) {
        Modal.show({
            title: 'Supprimer l\'article',
            message: 'Voulez-vous vraiment supprimer cet article du catalogue ?',
            type: 'danger',
            confirmText: 'Supprimer',
            onConfirm: async () => {
                try {
                    await store.deleteTuningItem(id);
                    state.activeItems.delete(id);
                    state.catalog = state.catalog.filter(i => i.id !== id);
                    renderCatalog();
                    updateReceipt();
                    Toast.show('Article supprimé');
                } catch (e) {
                    console.error(e);
                    Toast.show('Impossible de supprimer', 'error');
                }
            }
        });
    }

    function handleMagicWand() {
        const input = document.getElementById('magic-input');
        const target = parseFloat(input.value);
        
        if (!target || target <= 0) {
            Toast.show('Veuillez entrer un montant valide', 'warning');
            return;
        }

        state.activeItems.clear();
        state.targetPrice = target; // Set target price
        
        // Greedy algorithm to find best match
        // Sort items by price desc
        const sorted = [...state.catalog].sort((a, b) => b.price - a.price);
        let currentSum = 0;

        for (const item of sorted) {
            if (currentSum + item.price <= target) {
                state.activeItems.add(item.id);
                currentSum += item.price;
            }
        }

        renderCatalog();
        updateReceipt();

        const diff = target - currentSum;
        if (diff > 0) {
             Toast.show(`Cible atteinte : ${formatCurrency(target)} (dont ${formatCurrency(diff)} ajustement)`);
        } else {
             Toast.show(`Cible atteinte : ${formatCurrency(currentSum)}`);
        }
    }

    // --- INITIALIZATION ---

    function init() {
        const root = document.getElementById('tuning-calculator-root');
        if (!root) {
            // Poll if not found yet (should happen rarely with this setup)
            setTimeout(init, 50);
            return;
        }

        // Prevent double init
        if (root.dataset.initialized) return;
        root.dataset.initialized = "true";

        // Load data
        loadCatalog();

        // Attach GLOBAL event listener (Delegation)
        root.addEventListener('click', (e) => {
            // 1. Handle Delete Button (High Priority)
            const deleteBtn = e.target.closest('[data-action="delete-item"]');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteItem(deleteBtn.dataset.id);
                return;
            }

            // 2. Handle Backdrop Click (Close Modal)
            if (e.target.id === 'modal-add') {
                document.getElementById('modal-add').classList.add('hidden');
                return;
            }

            // 3. Handle Other Actions
            const actionBtn = e.target.closest('[data-action]');
            if (!actionBtn) return;

            const action = actionBtn.dataset.action;
            const id = actionBtn.dataset.id;
            const tab = actionBtn.dataset.tab;

            // Handle actions
            if (action === 'switch-tab') {
                state.activeTab = tab;
                renderCatalog();
            }
            else if (action === 'toggle-item') {
                if (state.activeItems.has(id)) state.activeItems.delete(id);
                else state.activeItems.add(id);
                renderCatalog();
                updateReceipt();
            }
            else if (action === 'remove-receipt-item') {
                state.activeItems.delete(id);
                renderCatalog();
                updateReceipt();
            }
            else if (action === 'open-add-modal') {
                document.getElementById('modal-add').classList.remove('hidden');
            }
            else if (action === 'close-modal') {
                document.getElementById('modal-add').classList.add('hidden');
            }
            else if (action === 'save-item') {
                handleAddItem();
            }
            else if (action === 'magic-calc') {
                handleMagicWand();
            }
            else if (action === 'refresh') {
                state.activeItems.clear();
                state.targetPrice = null;
                loadCatalog();
                Toast.show('Rafraîchi');
            }
            else if (action === 'create-invoice') {
                if (state.activeItems.size === 0 && !state.targetPrice) {
                    Toast.show('Aucun article sélectionné', 'warning');
                    return;
                }

                // Calculate totals
                let itemsTotal = 0, cost = 0;
                const items = state.catalog.filter(i => state.activeItems.has(i.id));
                items.forEach(i => {
                    itemsTotal += Number(i.price);
                    cost += Number(i.cost);
                });

                let finalTotal = itemsTotal;
                let adjustment = 0;
                if (state.targetPrice && state.targetPrice > itemsTotal) {
                    finalTotal = state.targetPrice;
                    adjustment = state.targetPrice - itemsTotal;
                }

                // Save to localStorage for sync
                localStorage.setItem('last_tuning_calc', JSON.stringify({
                    price: finalTotal,
                    cost: cost,
                    items: items.map(i => ({ name: i.name, category: i.category, price: i.price })),
                    adjustment: adjustment,
                    date: new Date()
                }));

                window.location.hash = `#sales/new?price=${finalTotal}&cost=${cost}`;
                Toast.show(`Redirection vers la facture...`);
            }
        });

        // Search Listener
        const searchInput = document.getElementById('catalog-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                state.searchTerm = e.target.value;
                renderCatalog();
            });
        }
    }

    // Start Init
    setTimeout(init, 0);

    return html;
}
