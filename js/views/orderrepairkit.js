import { store } from '../store.js';
import { Toast } from '../toast.js';

export function OrderRepairKit() {
    // 1. Fetch stock (async but we can use a placeholder and update)
    setTimeout(async () => {
        try {
            const config = await store.fetchRepairKitConfig();
            const stock = config.stock;
            const price = config.price;

            const stockEl = document.getElementById('stock-display');
            if (stockEl) {
                stockEl.innerText = `Stock disponible : ${stock}`;
                stockEl.classList.remove('hidden');
                
                // Disable form if out of stock
                if (stock <= 0) {
                    const btn = document.querySelector('button[type="submit"]');
                    if (btn) {
                        btn.disabled = true;
                        btn.innerText = "Rupture de stock";
                        btn.classList.add('opacity-50', 'cursor-not-allowed');
                    }
                }
            }

            const priceEl = document.getElementById('unit-price-display');
            if (priceEl) {
                priceEl.innerText = `${new Intl.NumberFormat('fr-FR').format(price)} $`;
            }

            const form = document.getElementById('order-kit-form');
            if (form) form.dataset.price = price;

        } catch (e) { console.error(e); }
    }, 100);

    return `
        <div class="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white relative overflow-hidden">
            <!-- Background Elements -->
            <div class="absolute inset-0 z-0 bg-gradient-to-br from-[#dd3bcc]/10 via-black/30 to-[#4bb4d3]/10"></div>
            <div class="absolute -left-24 -top-24 w-80 h-80 rounded-full blur-3xl bg-[#dd3bcc]/20"></div>
            <div class="absolute -right-24 -bottom-24 w-80 h-80 rounded-full blur-3xl bg-[#4bb4d3]/20"></div>

            <div class="relative z-10 w-full max-w-lg p-6 animate-fade-in">
                <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl">
                    
                    <div class="text-center mb-6">
                        <div class="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4 shadow-lg shadow-orange-500/10">
                            <i data-lucide="package" class="w-8 h-8 text-orange-500"></i>
                        </div>
                        <h1 class="text-2xl font-extrabold text-white tracking-tight">Commande de Kits</h1>
                        <p class="text-slate-400 mt-2 text-sm">Prix unitaire : <span id="unit-price-display" class="text-white font-bold">... $</span></p>
                        <div id="stock-display" class="hidden mt-2 inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-orange-300">
                            Chargement du stock...
                        </div>
                    </div>

                    <form id="order-kit-form" class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nom & Prénom</label>
                                <div class="relative group">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i data-lucide="user" class="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                                    </div>
                                    <input type="text" name="clientName" required
                                        class="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm" 
                                        placeholder="Ex: John Doe">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Téléphone</label>
                                <div class="relative group">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i data-lucide="phone" class="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                                    </div>
                                    <input type="text" name="phone" required
                                        class="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm" 
                                        placeholder="Ex: 555-0199">
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Disponibilités (pour récupération)</label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i data-lucide="clock" class="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                                </div>
                                <input type="text" name="availability" required
                                    class="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm" 
                                    placeholder="Ex: Ce soir après 21h, demain aprem...">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Quantité souhaitée</label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i data-lucide="layers" class="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                                </div>
                                <input type="number" name="quantity" id="inp-qty" min="1" required
                                    class="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-bold" 
                                    placeholder="Ex: 5">
                            </div>
                        </div>

                        <!-- Total Price Display -->
                        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex justify-between items-center">
                            <span class="text-slate-400 text-sm">Total estimé :</span>
                            <span id="total-price" class="text-xl font-bold text-white">0 $</span>
                        </div>

                        <button type="submit" 
                            class="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-900/20 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            <span class="inline-flex items-center gap-2">
                                <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                                <span>Confirmer la commande</span>
                            </span>
                        </button>
                    </form>

                    <div class="mt-6 pt-6 border-t border-slate-800 text-center">
                        <a href="#login" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            <i data-lucide="arrow-left" class="w-4 h-4"></i>
                            Retour à l'accueil
                        </a>
                    </div>

                </div>
            </div>
        </div>
    `;
}

// Logic to attach listeners (called by app.js)
export function initOrderRepairKit() {
    const form = document.getElementById('order-kit-form');
    if (form) {
        // Price Calculation Logic
        const qtyInput = document.getElementById('inp-qty');
        const totalDisplay = document.getElementById('total-price');
        
        const getPrice = () => {
             return parseFloat(form.dataset.price) || 2500;
        };

        if (qtyInput && totalDisplay) {
            qtyInput.addEventListener('input', () => {
                const qty = parseInt(qtyInput.value) || 0;
                const price = getPrice();
                const total = qty * price;
                totalDisplay.innerText = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total).replace('$', '') + ' $';
                totalDisplay.classList.toggle('text-orange-400', qty > 0);
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalContent = btn.innerHTML;
            
            try {
                btn.disabled = true;
                btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>`;
                if (window.lucide) lucide.createIcons();

                const formData = new FormData(form);
                const name = formData.get('clientName');
                const qty = parseInt(formData.get('quantity'));
                const phone = formData.get('phone');
                const availability = formData.get('availability');

                if (!name || qty <= 0 || !phone || !availability) throw new Error("Veuillez remplir tous les champs.");

                await store.createRepairKitOrder(name, qty, phone, availability);

                const price = getPrice();
                Toast.show(`Commande envoyée ! Total: ${qty * price} $`, 'success');
                form.reset();
                if (totalDisplay) totalDisplay.innerText = "0 $";
                
                // Optional: Redirect back after delay
                setTimeout(() => window.location.hash = '#login', 3000);

            } catch (err) {
                console.error(err);
                Toast.show("Erreur: " + err.message, "error");
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalContent;
                if (window.lucide) lucide.createIcons();
            }
        });
    }
}
