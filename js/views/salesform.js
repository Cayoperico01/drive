import { store } from '../store.js';
import { auth } from '../auth.js';
import { formatCurrency } from '../utils.js';

const getParam = (name) => {
    const match = (window.location.hash || '').match(new RegExp(`${name}=([^&]+)`));
    return match ? decodeURIComponent(match[1]) : null;
};

export async function SalesForm(intervention) {
    let isEdit = !!intervention;
    const employeeParam = getParam('employee');
    const priceParam = getParam('price');
    const costParam = getParam('cost');

    const user = auth.getUser();
    const canCreate = await store.hasPermission(user, 'sales.create');
    // Only patron can see cost and margin
    const isAdmin = user && user.role === 'patron';

    let currentSafeBalance = 0;

    // --- TICKET DATA FETCH ---
    let ticketItems = [];
    let ticketAdjustment = 0;
    let ticketDate = null;
    
    // Only fetch ticket if we are in "New" mode and have price/cost params (likely from calculator)
    if (!isEdit && (priceParam || costParam)) {
        try {
            const lastCalc = localStorage.getItem('last_tuning_calc');
            if (lastCalc) {
                const parsed = JSON.parse(lastCalc);
                // Check freshness (15 mins)
                if (new Date() - new Date(parsed.date) < 15 * 60 * 1000) {
                    if (parsed.items && Array.isArray(parsed.items)) {
                        ticketItems = parsed.items;
                        ticketAdjustment = parsed.adjustment || 0;
                        ticketDate = parsed.date;
                    }
                }
            }
        } catch(e) { console.error("Error reading ticket", e); }
    }

    setTimeout(() => {
        const typeSelect = document.getElementById('sales-service-type');
        const plateInput = document.getElementById('sales-plate');
        const priceInput = document.querySelector('input[name="price"]');
        const costInput = document.querySelector('input[name="cost"]');
        const marginDisplay = document.getElementById('sales-margin-display');
        const marginInput = document.getElementById('sales-margin-input');
        const optionsDiv = document.getElementById('reparation-options');
        
        // Safe projection elements disabled
        const safeImpactDisplay = null;
        const safeTotalDisplay = null;
        
        // Flag to prevent recursive updates
        let isUpdating = false;

        const updateMargin = (shouldRecalculateCost = true) => {
            if (isUpdating) return;
            isUpdating = true;

            const p = parseFloat(priceInput.value) || 0;
            const currentType = typeSelect ? typeSelect.value : '';
            const isReparation = currentType === 'Réparation' || currentType === 'Reparation';
            
            // --- 1. CALCULATE COST (Unified Logic) ---
            let calculatedCost = 0;

            // A. Standard Rule (Price / 1.8)
            if (p > 0) {
                 if (!isReparation) {
                    calculatedCost = p / 1.8;
                } else {
                    calculatedCost = 0;
                }
            }
            
            // B. Custom Cost / Calculator Logic
            const isCustomMode = !!costParam && parseFloat(costParam) > 0;
            const currentStoredCost = parseFloat(costInput ? costInput.value : 0) || 0;

            if (isCustomMode) {
                if (currentStoredCost > 0) calculatedCost = currentStoredCost;
                else if (parseFloat(costParam) > 0) calculatedCost = parseFloat(costParam);
            } 
            else {
                if (!shouldRecalculateCost && currentStoredCost > 0) calculatedCost = currentStoredCost;
            }

            // --- 2. UPDATE UI & INPUTS ---

            // Update Cost Input
            if (costInput) {
                const shouldUpdateInput = (shouldRecalculateCost && !isCustomMode) || (!costInput.value || parseFloat(costInput.value) === 0);
                if (shouldUpdateInput) {
                     costInput.value = calculatedCost.toFixed(2);
                }
            }

            // Calculate Margin
            const finalCost = parseFloat(costInput ? costInput.value : 0) || 0;
            const m = p - finalCost;

            // Display Logic
            if (marginDisplay) {
                marginDisplay.textContent = formatCurrency(m);
                marginDisplay.className = `text-xl font-mono font-bold ${m >= 0 ? 'text-emerald-500' : 'text-red-500'}`;
            }
            if (marginInput) {
                marginInput.value = m.toFixed(2);
                marginInput.className = `block w-full rounded-xl border-slate-600 bg-slate-800 font-bold placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500 p-3 ${m >= 0 ? 'text-emerald-400' : 'text-red-400'}`;
            }
            
            // Update Safe Projection
            if (safeImpactDisplay && safeTotalDisplay) {
                safeImpactDisplay.textContent = (m >= 0 ? '+' : '') + formatCurrency(m);
                safeImpactDisplay.className = m >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold';
                
                let projected = currentSafeBalance;
                if (isEdit) {
                    // If edit, we remove old margin and add new margin
                    const oldPrice = parseFloat(data.price) || 0;
                    const oldCost = parseFloat(data.cost) || 0;
                    const oldMargin = oldPrice - oldCost;
                    projected = currentSafeBalance - oldMargin + m;
                } else {
                    // If new, CurrentDBBalance does NOT include this sale
                    projected = currentSafeBalance + m;
                }
                safeTotalDisplay.textContent = formatCurrency(projected);
            }

            isUpdating = false;
        };

        const updateCostFromMargin = () => {
            if (isUpdating || !costInput || !priceInput || !marginInput) return;
            isUpdating = true;

            const p = parseFloat(priceInput.value) || 0;
            const m = parseFloat(marginInput.value) || 0;
            const newCost = p - m;

            costInput.value = newCost.toFixed(2);
            
            isUpdating = false;
        };

        const btnMagic = document.getElementById('btn-magic-margin');
        if (btnMagic) {
            btnMagic.addEventListener('click', () => {
                try {
                    const lastCalc = localStorage.getItem('last_tuning_calc');
                    if (lastCalc) {
                        const { price, cost, date } = JSON.parse(lastCalc);
                        if (new Date() - new Date(date) < 5 * 60 * 1000) {
                            if (priceInput) priceInput.value = price;
                            if (costInput) costInput.value = cost;
                            updateMargin(false);
                            Toast.show("Synchronisé avec le Calculateur !", "success");
                            return;
                        }
                    }
                    
                    // Fallback to standard 1.8 if no recent calc found
                    const p = parseFloat(priceInput.value) || 0;
                    if (p > 0) {
                        const cost = p / 1.8;
                        if (costInput) {
                            costInput.value = cost.toFixed(2);
                            updateMargin(false);
                            Toast.show("Coût standard (1.8) appliqué (Pas de calcul récent trouvé)", "info");
                        }
                    } else {
                        Toast.show("Entrez d'abord un prix ou utilisez le calculateur.", "warning");
                    }
                } catch(e) {
                    console.error(e);
                     const p = parseFloat(priceInput.value) || 0;
                    if (p > 0) {
                        const cost = p / 1.8;
                        if (costInput) {
                            costInput.value = cost.toFixed(2);
                            updateMargin(false); 
                            Toast.show("Coût standard (1.8) appliqué !", "success");
                        }
                    }
                }
            });
        }

        if (priceInput) priceInput.addEventListener('input', () => updateMargin(true));
        // If user manually edits cost, we treat it as "do not recalculate cost automatically anymore"
        if (costInput) costInput.addEventListener('input', () => updateMargin(false));
        if (marginInput) marginInput.addEventListener('input', updateCostFromMargin);

        if (typeSelect && plateInput) {
            const updateState = () => {
                const isReparation = typeSelect.value === 'Réparation';
                plateInput.disabled = isReparation;
                if (isReparation) {
                    if (plateInput.value !== 'REPARATION') plateInput.dataset.old = plateInput.value;
                    plateInput.value = 'REPARATION';
                    if (optionsDiv) optionsDiv.classList.remove('hidden');
                } else {
                    if (plateInput.value === 'REPARATION') plateInput.value = plateInput.dataset.old || '';
                    if (optionsDiv) optionsDiv.classList.add('hidden');
                }
                updateMargin(true); // Re-calculate when type changes
            };
            
            typeSelect.addEventListener('change', updateState);
            // Apply immediately if value is already selected (edit mode)
            if (typeSelect.value === 'Réparation') updateState();

            // Attach listeners to preset buttons
            if (optionsDiv && priceInput) {
                const qtyInput = document.getElementById('repair-qty');
                const minusBtn = document.getElementById('qty-minus');
                const plusBtn = document.getElementById('qty-plus');
                let selectedUnitPrice = 0;
                let activeBtn = null;

                const updatePrice = () => {
                    const qty = qtyInput ? (parseFloat(qtyInput.value) || 1) : 1;
                    if (selectedUnitPrice > 0) {
                        priceInput.value = selectedUnitPrice * qty;
                        updateMargin(true);
                    }
                };

                const updateQty = (delta) => {
                    if (!qtyInput) return;
                    let val = parseInt(qtyInput.value) || 1;
                    val += delta;
                    if (val < 1) val = 1;
                    qtyInput.value = val;
                    updatePrice();
                };

                if (minusBtn) minusBtn.onclick = () => updateQty(-1);
                if (plusBtn) plusBtn.onclick = () => updateQty(1);
                if (qtyInput) qtyInput.oninput = () => updatePrice();

                // Manual price input clears selection
                priceInput.oninput = () => {
                    selectedUnitPrice = 0;
                    if (activeBtn) {
                        activeBtn.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-slate-900');
                        activeBtn = null;
                    }
                    updateMargin(true);
                };

                optionsDiv.querySelectorAll('button[data-price]').forEach(btn => {
                    btn.onclick = () => {
                        // Reset previous active
                        if (activeBtn) {
                            activeBtn.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-slate-900');
                        }
                        
                        // Set new active
                        activeBtn = btn;
                        activeBtn.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-slate-900');
                        
                        selectedUnitPrice = parseFloat(btn.dataset.price);
                        updatePrice();

                        // Handle Special Plates (like VENTE KIT)
                        if (btn.dataset.plate) {
                            plateInput.value = btn.dataset.plate;
                            // Ensure cost is 0 for kits
                            if (costInput) {
                                costInput.value = '0';
                                updateMargin(false); // Update margin without recalculating cost
                            }
                        } else {
                            // Reset to standard if needed
                            if (plateInput.value !== 'REPARATION') {
                                plateInput.value = 'REPARATION';
                                updateMargin(true);
                            }
                        }
                    };
                });
            }
        }
        
        // Initial margin update
        updateMargin(!costParam);

        // --- TICKET LOGIC ---
        if (ticketItems.length > 0) {
            const ticketContainer = document.getElementById('ticket-container');
            
            if (ticketContainer) {
                const renderTicket = () => {
                    const totalClient = ticketItems.reduce((acc, i) => acc + Number(i.price), 0) + ticketAdjustment;
                    // Approximate cost if not available
                    const totalCost = ticketItems.reduce((acc, i) => acc + (Number(i.cost) || 0), 0); 
                    const profit = totalClient - totalCost;

                    ticketContainer.innerHTML = `
                        <div class="bg-white rounded-3xl shadow-2xl overflow-hidden text-slate-900 transform transition-all">
                            <!-- Receipt Header -->
                            <div class="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                <h3 class="font-bold text-slate-800 flex items-center gap-3 text-lg">
                                    <div class="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                        <i data-lucide="receipt" class="w-5 h-5 text-indigo-600"></i>
                                    </div>
                                    Ticket
                                </h3>
                                <span class="text-xs font-mono font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">${new Date(ticketDate).toLocaleDateString()}</span>
                            </div>
                            
                            <!-- Receipt Items -->
                            <div class="p-5 max-h-[500px] overflow-y-auto bg-slate-50/50 space-y-3 custom-scrollbar">
                                ${ticketItems.length === 0 && ticketAdjustment === 0 ? 
                                    `<div class="text-center text-slate-400 italic py-8 text-sm">Aucun article</div>` : 
                                    ticketItems.map((item, idx) => `
                                    <div class="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                        <div class="text-sm">
                                            <div class="font-bold text-slate-700">${item.name}</div>
                                            <div class="text-xs text-slate-400">${item.category || 'Autre'}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-mono font-bold text-slate-800">${formatCurrency(item.price)}</div>
                                            <button type="button" data-idx="${idx}" class="btn-remove-item text-[10px] text-red-400 hover:text-red-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Retirer</button>
                                        </div>
                                    </div>
                                `).join('')}
                                
                                ${ticketAdjustment > 0 ? `
                                <div class="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm border-l-4 border-l-indigo-500">
                                    <div class="text-sm">
                                        <div class="font-bold text-indigo-900">Ajustement / Main d'oeuvre</div>
                                        <div class="text-xs text-indigo-500">Pour atteindre l'objectif</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-mono font-bold text-indigo-700">${formatCurrency(ticketAdjustment)}</div>
                                        <div class="text-xs text-indigo-400 italic">Marge 100%</div>
                                    </div>
                                </div>
                                ` : ''}
                            </div>

                            <!-- Receipt Footer -->
                            <div class="bg-white border-t border-slate-200 p-6 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10">
                                <div class="flex justify-between items-end">
                                    <span class="text-slate-500 font-medium text-sm mb-1">Total Client</span>
                                    <span class="font-bold font-mono text-3xl tracking-tight text-slate-800">${formatCurrency(totalClient)}</span>
                                </div>
                                
                                <div class="pt-3 border-t border-slate-100 space-y-2">
                                    <div class="flex justify-between text-xs text-slate-400">
                                        <span>Coût Entreprise</span>
                                        <span class="font-mono">${formatCurrency(totalCost)}</span>
                                    </div>
                                    <div class="flex justify-between text-sm items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                        <span class="text-emerald-700 font-bold flex items-center gap-2">
                                            <i data-lucide="trending-up" class="w-4 h-4"></i> Marge
                                        </span>
                                        <span class="font-bold font-mono text-emerald-700 text-lg">${formatCurrency(profit)}</span>
                                    </div>
                                </div>

                                <button type="button" id="btn-ticket-generate" class="w-full group relative overflow-hidden py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 mt-4">
                                    <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    <span>Générer Facture</span>
                                    <i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    
                    if (window.lucide) lucide.createIcons();

                    // Bind Remove Events
                    ticketContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const idx = parseInt(e.target.dataset.idx);
                            const removed = ticketItems[idx];
                            ticketItems.splice(idx, 1);
                            
                            // Update Form Inputs
                            const currentPrice = parseFloat(priceInput.value) || 0;
                            const currentCost = parseFloat(costInput ? costInput.value : 0) || 0;
                            
                            const newPrice = Math.max(0, currentPrice - removed.price);
                            const itemCost = removed.cost || 0; 
                            const newCost = Math.max(0, currentCost - itemCost);
                            
                            priceInput.value = newPrice.toFixed(2);
                            if (costInput) costInput.value = newCost.toFixed(2);
                            
                            const event = new Event('input');
                            priceInput.dispatchEvent(event);
                            
                            renderTicket();
                        });
                    });

                    // Bind Generate Button
                    const genBtn = document.getElementById('btn-ticket-generate');
                    if (genBtn) {
                        genBtn.addEventListener('click', () => {
                            const submitBtn = document.getElementById('sales-submit-btn');
                            if (submitBtn) submitBtn.click();
                        });
                    }
                };
                
                renderTicket();
            }
        }
    }, 100);

    // Map snake_case from DB to camelCase for the form
    const data = isEdit ? {
        id: intervention.id,
        clientName: intervention.clientName || intervention.client_name,
        clientPhone: intervention.clientPhone || intervention.client_phone,
        plate: intervention.plate || intervention.vehicleModel || intervention.vehicle_model || intervention.propertyName,
        serviceType: intervention.serviceType || intervention.service_type || intervention.type,
        price: intervention.price,
        cost: intervention.cost || 0,
        invoiceUrl: intervention.invoiceUrl || intervention.invoice_url || intervention.contractUrl,
        photoUrl: intervention.photoUrl || intervention.photo_url || intervention.locationUrl
    } : {
        clientName: '',
        clientPhone: '',
        plate: '',
        serviceType: '',
        price: priceParam || '',
        cost: costParam || '',
        invoiceUrl: null,
        photoUrl: null
    };

    return `
        <div class="max-w-7xl mx-auto animate-fade-in">
            <div class="mb-6 flex items-center gap-4">
                <a href="#dashboard" class="text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="arrow-left" class="w-6 h-6"></i>
                </a>
                <h2 class="text-2xl font-bold text-white">${isEdit ? 'Modifier l\'Intervention' : 'Enregistrer une Intervention'}</h2>
            </div>

            <div class="grid grid-cols-1 ${ticketItems.length > 0 ? 'lg:grid-cols-3 gap-8 items-start' : ''}">
                
                <!-- LEFT COLUMN: FORM -->
                <div class="${ticketItems.length > 0 ? 'lg:col-span-2' : ''} bg-slate-900/70 glass rounded-2xl shadow-lg border border-slate-700 p-7 md:p-8">
                    <div class="h-1 w-full rounded-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc] mb-7"></div>
                    <form id="sales-form" class="space-y-8">
                        ${isEdit ? `<input type="hidden" name="id" value="${data.id}">` : ''}
                        ${employeeParam ? `<input type="hidden" name="employeeId" value="${employeeParam}">` : ''}
                        <input type="hidden" name="invoiceUrl" value="${data.invoiceUrl || ''}">
                        
                        <div>
                            <div class="flex items-start justify-between gap-4 mb-5">
                                <div>
                                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                                        <i data-lucide="clipboard-list" class="w-5 h-5 text-blue-500"></i>
                                        Détails de l'Intervention
                                    </h3>
                                    <p class="text-sm text-slate-400 mt-1">Renseigne la plaque, le type et le montant.</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-slate-300 mb-1">Plaque du véhicule</label>
                                    <input id="sales-plate" type="text" name="plate" value="${data.plate || ''}" required autocomplete="off" placeholder="Ex: AB-123-CD" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 p-3">
                                    <div class="mt-2 text-xs text-slate-500">Obligatoire (auto-majuscule).</div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-1">Type de Prestation</label>
                                    <select id="sales-service-type" name="serviceType" required class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-blue-500 focus:ring-blue-500 p-3">
                                        <option value="" disabled ${!data.serviceType ? 'selected' : ''}>Sélectionner...</option>
                                        <option value="Réparation" ${data.serviceType === 'Réparation' ? 'selected' : ''}>Réparation</option>
                                        <option value="Customisation" ${data.serviceType === 'Customisation' ? 'selected' : ''}>Customisation</option>
                                    </select>
                                </div>
                                
                                <!-- PRICE & COST & MARGIN -->
                                <div class="md:col-span-2 grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-emerald-400 mb-1">Total Facture ($)</label>
                                        <div class="relative">
                                            <input type="number" name="price" value="${data.price}" required autocomplete="off" min="0" step="0.01" placeholder="0.00" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500 p-3 pr-10">
                                            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold">$</div>
                                        </div>
                                    </div>
                                    ${isAdmin ? `
                                    <div>
                                        <label class="block text-sm font-medium text-slate-500 mb-1">Coût Garage ($)</label>
                                        <div class="relative">
                                            <input type="number" name="cost" id="sales-cost-input" value="${data.cost}" step="0.01" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500 p-3 pr-14">
                                            <button type="button" id="btn-magic-margin" class="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md transition-all flex items-center justify-center border border-white/10" title="Calculer Marge Standard (1.8)">
                                                <i data-lucide="wand-2" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-emerald-500 mb-1">Marge Nette ($)</label>
                                        <input type="number" id="sales-margin-input" step="0.01" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-emerald-400 font-bold placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500 p-3">
                                    </div>
                                    ` : `
                                    <input type="hidden" name="cost" value="${data.cost}">
                                    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 flex flex-col justify-center items-center">
                                        <span class="text-xs font-bold text-slate-500 uppercase">Votre Marge</span>
                                        <span id="sales-margin-display" class="text-xl font-mono font-bold text-slate-500">0.00 $</span>
                                    </div>
                                    `}
                                </div>

                                ${''}

                                <!-- Preset Buttons for Reparation -->
                                <div id="reparation-options" class="hidden md:col-span-2 mt-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 animate-fade-in">
                                    <div class="flex items-center justify-between mb-4">
                                        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <i data-lucide="zap" class="w-3 h-3 text-yellow-500"></i> Tarifs Rapides
                                        </label>
                                        <div class="flex items-center bg-slate-700 rounded-lg p-1 border border-slate-600">
                                            <button type="button" id="qty-minus" class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 rounded-md transition-colors"><i data-lucide="minus" class="w-4 h-4"></i></button>
                                            <input type="number" id="repair-qty" value="1" min="1" class="w-12 text-center bg-transparent border-none text-white font-bold focus:ring-0 p-0 appearance-none" />
                                            <button type="button" id="qty-plus" class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 rounded-md transition-colors"><i data-lucide="plus" class="w-4 h-4"></i></button>
                                        </div>
                                    </div>
                                    <div class="space-y-4">
                                        <div>
                                            <span class="text-[10px] font-bold text-slate-500 mb-2 block uppercase tracking-wide">Standard</span>
                                            <div class="flex gap-2">
                                                <button type="button" data-price="500" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-xs font-bold rounded-lg transition-all border border-slate-600 shadow-sm hover:shadow-md">500 $</button>
                                                <button type="button" data-price="1000" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-xs font-bold rounded-lg transition-all border border-slate-600 shadow-sm hover:shadow-md">1000 $</button>
                                                <button type="button" data-price="2000" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-xs font-bold rounded-lg transition-all border border-slate-600 shadow-sm hover:shadow-md">2000 $</button>
                                            </div>
                                        </div>
                                        <!-- Special kit shortcut removed -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4 gap-3">
                            <button type="button" onclick="window.history.back()" class="px-6 py-2 border border-slate-600 rounded-lg text-slate-300 font-medium hover:bg-slate-700 transition-colors">
                                Annuler
                            </button>
                            <button id="sales-submit-btn" type="submit" ${!canCreate ? 'disabled' : ''} class="bg-blue-600 has-sheen hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                <i data-lucide="check" class="w-4 h-4"></i>
                                ${isEdit ? 'Modifier' : 'Valider'}
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- RIGHT COLUMN: TICKET -->
                ${ticketItems.length > 0 ? `
                <div class="lg:col-span-1 sticky top-6">
                    <div id="ticket-container">
                        <!-- Content Injected via JS -->
                        <div class="bg-slate-800 rounded-2xl p-8 text-center animate-pulse">
                            <i data-lucide="loader-2" class="w-8 h-8 mx-auto text-blue-500 animate-spin"></i>
                        </div>
                    </div>
                </div>
                ` : ''}

            </div>
        </div>
    `;
}
