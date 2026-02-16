import { store } from '../store.js';
import { formatCurrency, formatDate } from '../utils.js';
import { Toast } from '../toast.js';

export function Profile() {
    setTimeout(initProfile, 50);

    return `
        <div class="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <!-- Header -->
            <div class="relative bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 overflow-hidden shadow-2xl">
                <div class="absolute top-0 right-0 p-8 opacity-10">
                    <i data-lucide="user-circle" class="w-64 h-64 text-blue-500 transform rotate-12 translate-x-12 -translate-y-12"></i>
                </div>
                
                <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div class="relative group">
                        <div class="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl font-bold text-slate-500 shadow-xl" id="profile-avatar">
                            --
                        </div>
                        <div class="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-slate-800"></div>
                    </div>
                    
                    <div class="flex-1 text-center md:text-left">
                        <h2 class="text-4xl font-black text-white tracking-tight mb-2" id="profile-name">Chargement...</h2>
                        <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                            <span class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-bold uppercase tracking-wider" id="profile-role">--</span>
                            <span class="px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600 text-sm flex items-center gap-2">
                                <i data-lucide="calendar" class="w-3 h-3"></i>
                                Arrivé le <span id="profile-date">--</span>
                            </span>
                        </div>
                        
                        <div class="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div class="bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700">
                                <p class="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Généré</p>
                                <p class="text-2xl font-mono font-bold text-white" id="profile-total-revenue">--</p>
                            </div>
                            <div class="bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700">
                                <p class="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Prime</p>
                                <p class="text-2xl font-mono font-bold text-emerald-400" id="profile-total-commission">--</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Left Column: Personal Info & Settings -->
                <div class="space-y-6">
                    <!-- Informations -->
                    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                        <div class="p-6 border-b border-slate-700 bg-slate-900/30">
                            <h3 class="font-bold text-white flex items-center gap-2">
                                <i data-lucide="info" class="w-5 h-5 text-blue-400"></i>
                                Mes Informations
                            </h3>
                        </div>
                        <div class="p-6 space-y-4">
                            <div>
                                <label class="text-xs text-slate-500 uppercase font-bold block mb-1">Numéro de téléphone</label>
                                <div class="flex gap-2">
                                    <input type="text" id="profile-phone" class="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" placeholder="Non renseigné">
                                    <button id="save-phone-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                        <i data-lucide="save" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                            

                            <div class="pt-4 border-t border-slate-700">
                                <label class="text-xs text-slate-500 uppercase font-bold block mb-1">Préférences</label>
                                <div class="flex items-center justify-between py-2">
                                    <span class="text-sm text-slate-300">Mode Sombre</span>
                                    <div class="w-10 h-5 bg-blue-600 rounded-full relative cursor-not-allowed opacity-50">
                                        <div class="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Security -->
                    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                        <div class="p-6 border-b border-slate-700 bg-slate-900/30">
                            <h3 class="font-bold text-white flex items-center gap-2">
                                <i data-lucide="shield" class="w-5 h-5 text-red-400"></i>
                                Sécurité
                            </h3>
                        </div>
                        <div class="p-6">
                            <button id="logout-btn-profile" class="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg px-4 py-3 font-bold transition-all flex items-center justify-center gap-2 group">
                                <i data-lucide="log-out" class="w-5 h-5 group-hover:-translate-x-1 transition-transform"></i>
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Stats & History -->
                <div class="lg:col-span-2 space-y-6">
                    
                    <!-- Weekly Progress -->
                    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg p-6">
                        <h3 class="font-bold text-white mb-6 flex items-center gap-2">
                            <i data-lucide="trending-up" class="w-5 h-5 text-emerald-400"></i>
                            Performance Semaine en cours
                        </h3>
                        
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                                <div class="text-xs text-slate-400 mb-1">Ventes</div>
                                <div class="text-2xl font-bold text-white" id="week-sales-count">0</div>
                            </div>
                            <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                                <div class="text-xs text-slate-400 mb-1">Commissions</div>
                                <div class="text-2xl font-bold text-emerald-400" id="week-commission">0 $</div>
                            </div>
                        </div>

                        <!-- Mini Chart Placeholder -->
                        <div class="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                            <div class="h-full bg-blue-500 w-[0%] transition-all duration-1000" id="week-progress-bar"></div>
                        </div>
                        <div class="flex items-center justify-between text-xs text-slate-500">
                            <span>Progression</span>
                            <div class="flex items-center gap-2 group">
                                <span>Objectif: <span id="week-goal-display" class="font-bold text-slate-400">10 000 $</span></span>
                                <button id="edit-goal-btn" class="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300">
                                    <i data-lucide="pencil" class="w-3 h-3"></i>
                                </button>
                            </div>
                        </div>
                        <div id="goal-edit-container" class="hidden mt-2 flex items-center gap-2">
                            <input type="number" id="week-goal-input" class="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none" placeholder="Montant">
                            <button id="save-goal-btn" class="text-green-400 hover:text-green-300"><i data-lucide="check" class="w-4 h-4"></i></button>
                            <button id="cancel-goal-btn" class="text-red-400 hover:text-red-300"><i data-lucide="x" class="w-4 h-4"></i></button>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                        <div class="p-6 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
                            <h3 class="font-bold text-white flex items-center gap-2">
                                <i data-lucide="history" class="w-5 h-5 text-purple-400"></i>
                                Dernières Activités
                            </h3>
                            <button onclick="window.location.hash='#mysales'" class="text-xs text-blue-400 hover:text-blue-300 font-medium">Tout voir</button>
                        </div>
                        <div class="divide-y divide-slate-700/50" id="profile-activity-list">
                            <div class="p-8 text-center text-slate-500">
                                <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-500 border-r-transparent mb-2"></div>
                                <p>Chargement...</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
}

async function initProfile() {
    let user = store.getCurrentUser();
    if (!user) return; // Should redirect

    // Ensure we have full data (phone, iban, etc.)
    let fullEmp = store.getEmployees().find(e => e.id === user.id);
    if (!fullEmp) {
        try {
            await store.fetchEmployees();
            fullEmp = store.getEmployees().find(e => e.id === user.id);
        } catch (e) {
            console.error("Failed to fetch employee details", e);
        }
    }
    
    if (fullEmp) {
        user = { ...user, ...fullEmp };
    }

    // Normalize properties (session uses camelCase, DB uses snake_case)
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    const role = user.role || '';
    const phone = user.phone || '';
    const iban = user.iban || '';
    const createdAt = user.created_at || new Date().toISOString();

    // DOM Elements
    const avatarEl = document.getElementById('profile-avatar');
    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    const dateEl = document.getElementById('profile-date');
    const totalRevEl = document.getElementById('profile-total-revenue');
    const totalComEl = document.getElementById('profile-total-commission');
    const phoneInput = document.getElementById('profile-phone');
    const ibanInput = document.getElementById('profile-iban');
    const savePhoneBtn = document.getElementById('save-phone-btn');
    const logoutBtn = document.getElementById('logout-btn-profile');
    const activityList = document.getElementById('profile-activity-list');
    
    const weekSalesEl = document.getElementById('week-sales-count');
    const weekComEl = document.getElementById('week-commission');
    const weekProgEl = document.getElementById('week-progress-bar');
    const weekGoalDisplay = document.getElementById('week-goal-display');
    const editGoalBtn = document.getElementById('edit-goal-btn');
    const goalEditContainer = document.getElementById('goal-edit-container');
    const weekGoalInput = document.getElementById('week-goal-input');
    const saveGoalBtn = document.getElementById('save-goal-btn');
    const cancelGoalBtn = document.getElementById('cancel-goal-btn');

    // Fill Basic Info
    if (nameEl) nameEl.textContent = `${firstName} ${lastName}`;
    if (avatarEl) avatarEl.textContent = `${firstName[0] || ''}${lastName[0] || ''}`;
    if (roleEl) roleEl.textContent = role.replace('_', ' ');
    if (dateEl) dateEl.textContent = new Date(createdAt).toLocaleDateString('fr-FR');
    if (phoneInput) phoneInput.value = phone;
    if (ibanInput) ibanInput.value = iban;

    // Logout Action
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            // Import dynamically to avoid circular dep if needed, or use window global if exposed
            // Assuming auth is not globally exposed, we might need to dispatch event or use store
            // Quick hack: clear localstorage and reload
            localStorage.removeItem('sb-auth-token');
            localStorage.removeItem('user');
            window.location.reload();
        };
    }

    // Save Phone Action
    if (savePhoneBtn) {
        savePhoneBtn.onclick = async () => {
            const newPhone = phoneInput.value.trim();
            try {
                // Call store update method (needs to be implemented or use generic update)
                // For now, let's simulate or call updateEmployee if allowed on self
                // Assuming store.updateEmployee exists and allows self-update of phone
                await store.updateEmployee(user.id, { phone: newPhone });
                Toast.show("Numéro de téléphone mis à jour", "success");
            } catch (e) {
                console.error(e);
                Toast.show("Erreur lors de la mise à jour", "error");
            }
        };
    }

    // Fetch Stats
    try {
        // We need all sales for this user to calc totals
        // Ideally we should have a specific API for stats to avoid fetching everything
        // For now, fetch all sales (cached in store hopefully or fetch fresh)
        // Since we refactored fetchSales to be paginated, we might not have everything in memory!
        // We need a specific call for user stats.
        
        // Ensure time entries are loaded for salary calculation
        await store.fetchTimeEntries();

        // Temporary: fetch filtered sales for user (large page)
        const { data: userSales } = await store.fetchSalesPage(1, 1000, { employeeId: user.id });
        
        // User requested Margin as Revenue
        const totalRev = userSales.reduce((acc, s) => acc + (Number(s.price) - Number(s.cost || 0)), 0);
        const totalCom = store.calculateTotalPay(user, userSales);

        if (totalRevEl) totalRevEl.textContent = formatCurrency(totalRev);
        if (totalComEl) totalComEl.textContent = formatCurrency(totalCom);

        // Weekly Stats
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(now.setDate(diff));
        startOfWeek.setHours(0,0,0,0);

        const weeklySales = userSales.filter(s => new Date(s.date) >= startOfWeek);
        const weekRev = weeklySales.reduce((acc, s) => acc + (Number(s.price) - Number(s.cost || 0)), 0);
        const weekCom = store.calculateTotalPay(user, weeklySales);

        if (weekSalesEl) weekSalesEl.textContent = weeklySales.length;
        if (weekComEl) weekComEl.textContent = formatCurrency(weekCom);
        
        // Progress Goal Handling
        const storageKey = `user_weekly_goal_${user.id}`;
        let goal = 10000;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) goal = Number(saved);
        } catch(e) {}

        const updateProgress = () => {
            const progress = Math.min(100, (weekCom / goal) * 100);
            if (weekProgEl) {
                weekProgEl.style.width = `${progress}%`;
                
                // Dynamic Color Logic
                // Remove existing color/shadow classes
                const baseClasses = "h-full transition-all duration-1000 rounded-full";
                let colorClasses = "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"; // Default < 25%

                if (progress >= 100) {
                    colorClasses = "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]";
                } else if (progress >= 75) {
                    colorClasses = "bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]";
                } else if (progress >= 50) {
                    colorClasses = "bg-gradient-to-r from-yellow-500 to-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]";
                } else if (progress >= 25) {
                    colorClasses = "bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]";
                }

                weekProgEl.className = `${baseClasses} ${colorClasses}`;
            }
            if (weekGoalDisplay) weekGoalDisplay.textContent = formatCurrency(goal);
        };
        updateProgress();

        // Goal Edit Logic
        if (editGoalBtn) {
            editGoalBtn.onclick = () => {
                if (goalEditContainer) goalEditContainer.classList.remove('hidden');
                if (weekGoalInput) {
                    weekGoalInput.value = goal;
                    weekGoalInput.focus();
                }
            };
        }
        if (cancelGoalBtn) {
            cancelGoalBtn.onclick = () => {
                if (goalEditContainer) goalEditContainer.classList.add('hidden');
            };
        }
        if (saveGoalBtn) {
            saveGoalBtn.onclick = () => {
                const val = Number(weekGoalInput.value);
                if (isFinite(val) && val > 0) {
                    goal = val;
                    localStorage.setItem(storageKey, String(goal));
                    updateProgress();
                    if (goalEditContainer) goalEditContainer.classList.add('hidden');
                    Toast.show("Objectif mis à jour !");
                } else {
                    Toast.show("Montant invalide", "warning");
                }
            };
        }

        // Recent Activity
        if (activityList) {
            const recent = userSales.slice(0, 5);
            if (recent.length === 0) {
                activityList.innerHTML = `<div class="p-8 text-center text-slate-500">Aucune activité récente</div>`;
            } else {
                activityList.innerHTML = recent.map(s => `
                    <div class="p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300">
                                <i data-lucide="wrench" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <p class="font-bold text-white text-sm">${s.vehicleModel}</p>
                                <p class="text-xs text-slate-500">${new Date(s.date).toLocaleDateString('fr-FR')} • ${s.serviceType}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-mono font-bold text-white">${formatCurrency(s.price)}</p>
                            <p class="text-xs text-emerald-400 font-mono">+${formatCurrency((Number(s.price) - Number(s.cost || 0)) * (user.commission_rate || 0.15))}</p>
                        </div>
                    </div>
                `).join('');
            }
        }

    } catch (err) {
        console.error("Profile load error", err);
    }

    if (window.lucide) lucide.createIcons();
}