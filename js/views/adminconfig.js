import { Toast } from '../toast.js';
import { store } from '../store.js';
import { Modal } from '../modal.js';
import { auth } from '../auth.js';
import { Discord } from '../discord.js';

export function AdminConfig() {
    // Initial load
    setTimeout(async () => {
        try {
            const [webhookSettings, payrollSettings, repairKitConfig] = await Promise.all([
                store.fetchWebhookSettings(),
                store.fetchPayrollSettings(),
                store.fetchRepairKitConfig()
            ]);

            // Repair Kit Config
            const inpStock = document.getElementById('repair-kit-stock');
            if (inpStock) inpStock.value = repairKitConfig.stock;
            const inpPrice = document.getElementById('repair-kit-price');
            if (inpPrice) inpPrice.value = repairKitConfig.price;
            
            const inpKitUrl = document.getElementById('kit-webhook-url');
            if (inpKitUrl) inpKitUrl.value = webhookSettings?.kit_webhook_url || '';
            const inpKitRole = document.getElementById('kit-role-id');
            if (inpKitRole) inpKitRole.value = webhookSettings?.kit_role_id || '';

            // Webhook Settings
            const inpRec = document.getElementById('recruitment-webhook-url');
            if (inpRec) inpRec.value = webhookSettings?.recruitment_webhook_url || 'https://discord.com/api/webhooks/1462768022522695833/DgYzNSYRiVSk5rfho0Ym3-fLHCAytv3bsVqF9ICNLhzcTD3sC6UsROv5mWhUN6fpZQn5';
            
            const inpServices = document.getElementById('services-webhook-url');
            if (inpServices) inpServices.value = webhookSettings?.services_webhook_url || 'https://discord.com/api/webhooks/1458256143049560189/zDR_SHsoYBvJX6qQHVy7yvvu51wOUhlBF9bwTeTWlFm9PJxrCpJLEo0Tmq_Rd2JBZpO3';
            
            const inpAppChannel = document.getElementById('application-channel-id');
            if (inpAppChannel) inpAppChannel.value = localStorage.getItem('discord_application_channel_id') || '1455996687339229460';

            const inpResponseChannel = document.getElementById('response-channel-id');
            if (inpResponseChannel) inpResponseChannel.value = localStorage.getItem('discord_response_channel_id') || '1458257475773010152';

            

            const inpLogo = document.getElementById('brand-logo-url');
            if (inpLogo) inpLogo.value = webhookSettings?.brand_logo_url || localStorage.getItem('brand_logo_url') || '';

            const inpBaseUrl = document.getElementById('app-base-url');
            if (inpBaseUrl) inpBaseUrl.value = localStorage.getItem('app_base_url') || window.location.origin;

            const inpRecTarget = document.getElementById('recruitment-target');
            if (inpRecTarget) inpRecTarget.value = webhookSettings?.recruitment_target_count || '';

            // Patch note UI supprimé

            // Payroll Settings
            const inpSplit = document.getElementById('company-split');
            if (inpSplit && payrollSettings) {
                const split = Number(payrollSettings.company_split ?? 0.60) * 100;
                inpSplit.value = split;
            }
            
            // Role Primes (Commissions)
            const defaultPrimes = {
                'mecano_test': 15,
                'mecano_junior': 30,
                'mecano_confirme': 40,
                'chef_atelier': 50,
                'responsable': 60,
                'co_patron': 80,
                'patron': 80
            };
            const currentPrimes = payrollSettings?.role_primes || defaultPrimes;
            const currentRates = payrollSettings?.grade_rates || {};
            
            Object.keys(defaultPrimes).forEach(role => {
                const el = document.getElementById(`prime-${role}`);
                if (el) el.value = currentPrimes[role] !== undefined ? currentPrimes[role] : defaultPrimes[role];
                
                const elRate = document.getElementById(`rate-${role}`);
                if (elRate) elRate.value = currentRates[role] !== undefined ? currentRates[role] : 0;
            });
            // Sync co_patron with patron input for UI simplicity if needed, or separate
            const elPatron = document.getElementById('prime-patron');
            const elRatePatron = document.getElementById('rate-patron');
            
            if(elPatron) {
                 // Use patron value for input
                 elPatron.value = currentPrimes['patron'] || defaultPrimes['patron'];
                 // Handle sync on change
                 elPatron.addEventListener('input', () => {
                     const val = elPatron.value;
                     const elCo = document.getElementById('prime-co_patron');
                     if(elCo) elCo.value = val;
                 });
            }
            if(elRatePatron) {
                elRatePatron.value = currentRates['patron'] || 0;
                elRatePatron.addEventListener('input', () => {
                    const val = elRatePatron.value;
                    const elCo = document.getElementById('rate-co_patron');
                    if(elCo) elCo.value = val;
                });
            }

            const elCo = document.getElementById('prime-co_patron');
            if(elCo) elCo.value = currentPrimes['co_patron'] || defaultPrimes['co_patron'];
            
            const elRateCo = document.getElementById('rate-co_patron');
            if(elRateCo) elRateCo.value = currentRates['co_patron'] || 0;


        } catch (e) {
            console.error("Erreur chargement config:", e);
        }

        const inputInactivity = document.getElementById('inactivity-threshold');
        try {
            const inactivity = localStorage.getItem('inactivity_threshold_hours') || '2';
            if (inputInactivity) inputInactivity.value = inactivity;
        } catch (e) {}

        // Patch note UI supprimé

        const form = document.getElementById('config-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const brandLogoUrl = document.getElementById('brand-logo-url')?.value || '';
                const appBaseUrl = document.getElementById('app-base-url')?.value || '';
                const inactivity = document.getElementById('inactivity-threshold')?.value || '2';
                
                // Webhooks
                const servicesWebhookUrl = document.getElementById('services-webhook-url')?.value || '';
                const recruitmentWebhookUrl = document.getElementById('recruitment-webhook-url')?.value || '';
                const patchNoteWebhookUrl = '';
                const responseChannelId = document.getElementById('response-channel-id')?.value || '';
                const applicationChannelId = document.getElementById('application-channel-id')?.value || '';
                
                
                const recruitmentTarget = document.getElementById('recruitment-target')?.value || '0';
                const companySplitVal = document.getElementById('company-split')?.value || '60';
                const repairKitStock = document.getElementById('repair-kit-stock')?.value || '0';
                const repairKitPrice = document.getElementById('repair-kit-price')?.value || '2500';
                const kitWebhookUrl = document.getElementById('kit-webhook-url')?.value || '';
                const kitRoleId = document.getElementById('kit-role-id')?.value || '';

                // Collect Primes & Rates
                const rolePrimes = {};
                const gradeRates = {};
                
                ['mecano_test', 'mecano_junior', 'mecano_confirme', 'chef_atelier', 'responsable', 'co_patron', 'patron'].forEach(role => {
                    const el = document.getElementById(`prime-${role}`);
                    if (el) rolePrimes[role] = Number(el.value);
                    
                    const elRate = document.getElementById(`rate-${role}`);
                    if (elRate) gradeRates[role] = Number(elRate.value);
                });

                try {
                    const appendToPatchNote = () => {};

                    // 1. Local Storage
                    const oldInactivity = localStorage.getItem('inactivity_threshold_hours');
                    if (oldInactivity !== inactivity) appendToPatchNote(`Seuil inactivité : ${oldInactivity}h → ${inactivity}h`);
                    
                    localStorage.setItem('inactivity_threshold_hours', inactivity);
                    localStorage.setItem('app_base_url', appBaseUrl);
                    localStorage.setItem('brand_logo_url', brandLogoUrl);
                    localStorage.setItem('discord_response_channel_id', responseChannelId);
                    localStorage.setItem('discord_application_channel_id', applicationChannelId);
                    
                    
                    // 2. Webhook Settings (DB)
                    let savedWebhooks = true;
                    try {
                        const s = await store.fetchWebhookSettings();
                        const salesUrl = s?.sales_webhook_url || '';
                        const msgId = s?.services_status_message_id;
                        
                        // Detect changes for Patch Note
                        if (recruitmentTarget !== String(s?.recruitment_target_count || '0')) {
                            appendToPatchNote(`Objectif Recrutement : ${s?.recruitment_target_count || 0} → ${recruitmentTarget}`);
                        }

                        await store.saveWebhookSettings(salesUrl, servicesWebhookUrl, msgId, recruitmentWebhookUrl, brandLogoUrl, patchNoteWebhookUrl, kitWebhookUrl, kitRoleId);
                        await store.setRecruitmentTargetCount(recruitmentTarget);
                    } catch (e) {
                        savedWebhooks = false;
                        console.error('Erreur sauvegarde Webhooks DB:', e);
                    }

                    // 3. Payroll Settings (DB)
                    let savedPayroll = true;
                    try {
                        const currentSettings = await store.fetchPayrollSettings();
                        const oldSplit = Number(currentSettings.company_split ?? 0.60) * 100;
                        if (String(oldSplit) !== String(companySplitVal)) {
                            appendToPatchNote(`Part Entreprise : ${oldSplit}% → ${companySplitVal}%`);
                        }

                        const splitDecimal = Number(companySplitVal) / 100;
                        await store.savePayrollSettings(undefined, gradeRates, splitDecimal, undefined, rolePrimes);
                        
                        // Check changes for primes/rates to log in patch note
                        const oldPrimes = currentSettings.role_primes || {};
                        const oldRates = currentSettings.grade_rates || {};
                        let primeChanged = false;
                        
                        for (const [r, v] of Object.entries(rolePrimes)) {
                            if (oldPrimes[r] !== v) {
                                primeChanged = true;
                                break;
                            }
                        }
                        if (!primeChanged) {
                             for (const [r, v] of Object.entries(gradeRates)) {
                                if (oldRates[r] !== v) {
                                    primeChanged = true;
                                    break;
                                }
                            }
                        }
                        
                        if (primeChanged) appendToPatchNote("Mise à jour des commissions et taux horaires");

                    } catch (e) {
                        savedPayroll = false;
                        console.error('Erreur sauvegarde Payroll DB:', e);
                    }

                    // 4. Inventory Settings (DB)
                    let savedInventory = true;
                    try {
                        const oldConfig = await store.fetchRepairKitConfig();
                        // Patch note supprimé
                        await store.updateRepairKitConfig(Number(repairKitStock), Number(repairKitPrice));
                    } catch (e) {
                        savedInventory = false;
                        console.error('Erreur sauvegarde Inventaire DB:', e);
                    }

                    if (savedWebhooks && savedPayroll && savedInventory) {
                        Toast.show('Configuration sauvegardée !', 'success');
                    } else {
                        Toast.show("Sauvegarde partielle (DB inaccessible).", 'warning');
                    }
                } catch (err) {
                    const msg = (err && err.message) ? err.message : String(err);
                    Toast.show("Erreur de sauvegarde : " + msg, "error");
                }
            });
        }
        
        // Archive Button
        const archiveBtn = document.getElementById('btn-archive-week');
        if (archiveBtn) {
            Promise.all([
                store.hasPermission(auth.getUser(), 'archives.manage'),
                store.hasPermission(auth.getUser(), 'time_entries.reset')
            ]).then(([canArchive, canReset]) => {
                if (!canArchive || !canReset) {
                    archiveBtn.classList.add('opacity-40', 'cursor-not-allowed');
                    archiveBtn.disabled = true;
                    return;
                }
                archiveBtn.addEventListener('click', () => {
                    Modal.show({
                        title: '📦 CLÔTURER LA SEMAINE',
                        message: 'Cette action va :\n1. Calculer le CA total de la semaine.\n2. L\'archiver dans l\'historique.\n3. VIDER toutes les factures et pointages actuels.\n\nLes employés ne sont PAS supprimés.',
                        type: 'info',
                        confirmText: 'ARCHIVER & VIDER',
                        inputExpected: 'CLOTURE',
                        onConfirm: async () => {
                            try {
                                await store.archiveAndReset();
                                Toast.show('Semaine clôturée et archivée avec succès !', 'success');
                                setTimeout(() => window.location.hash = '#archives', 1500);
                            } catch (err) {
                                Toast.show("Erreur lors de l'archivage : " + err.message, "error");
                            }
                        }
                    });
                });
            }).catch(() => {
                archiveBtn.classList.add('opacity-40', 'cursor-not-allowed');
                archiveBtn.disabled = true;
            });
        }

        const resetAllBtn = document.getElementById('btn-reset-all');
        if (resetAllBtn) {
            store.hasPermission(auth.getUser(), 'time_entries.reset').then(canReset => {
                if (!canReset) {
                    resetAllBtn.classList.add('opacity-40', 'cursor-not-allowed');
                    resetAllBtn.disabled = true;
                    return;
                }
                resetAllBtn.addEventListener('click', () => {
                    Modal.show({
                        title: '⚠️ RÉINITIALISATION POINTEUSE',
                        message: 'Vous êtes sur le point de supprimer TOUS les historiques de pointages.\n\nLes comptes employés NE SERONT PAS supprimés.\nCette action est irréversible.',
                        type: 'danger',
                        confirmText: 'VIDER POINTEUSE',
                        inputExpected: 'CONFIRMER',
                        onConfirm: async () => {
                            try {
                                await store.resetTimeEntries();
                                Toast.show('Pointeuse réinitialisée avec succès.', 'success');
                                setTimeout(() => window.location.reload(), 1500);
                            } catch (err) {
                                const msg = (err && err.message) ? err.message : String(err);
                                Toast.show("Erreur lors du reset : " + msg, "error");
                            }
                        }
                    });
                });
            }).catch(() => {
                resetAllBtn.classList.add('opacity-40', 'cursor-not-allowed');
                resetAllBtn.disabled = true;
            });
        }

        // Announcement Logic
        const btnAnnounce = document.getElementById('btn-send-announcement');
        const inpAnnounce = document.getElementById('announcement-input');
        const btnAnnounceTemplateKits = document.getElementById('btn-announce-template-kits');

        if (btnAnnounceTemplateKits && inpAnnounce) {
            btnAnnounceTemplateKits.addEventListener('click', () => {
                inpAnnounce.value = "🔧 **Commande de Kits** : Pour commander vos kits de réparation, merci d'utiliser le nouveau formulaire disponible sur la page de connexion (sous \"Postuler\"). Remplissez vos infos et nous vous recontacterons ! 📦";
            });
        }

        if (btnAnnounce && inpAnnounce) {
            btnAnnounce.addEventListener('click', async () => {
                const msg = inpAnnounce.value.trim();
                if (!msg) return Toast.show("Message vide", "warning");
                
                try {
                    btnAnnounce.disabled = true;
                    btnAnnounce.innerHTML = '<i data-lucide="loader-2" class="animate-spin w-4 h-4"></i>';
                    
                    await store.sendAnnouncement(msg);
                    
                    Toast.show("Annonce envoyée à tous les employés !", "success");
                    inpAnnounce.value = '';
                } catch (e) {
                    console.error(e);
                    Toast.show("Erreur lors de l'envoi", "error");
                } finally {
                    btnAnnounce.disabled = false;
                    btnAnnounce.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i><span>Envoyer</span>';
                    if (window.lucide) lucide.createIcons();
                }
            });
        }

        // Patch Note Generator removed

        
    }, 100);

    return `
        <div class="max-w-4xl mx-auto animate-fade-in pb-20">
            <div class="mb-8 flex items-end justify-between">
                <div>
                    <h2 class="text-3xl font-extrabold text-white flex items-center gap-3">
                        <div class="p-2 bg-slate-800 rounded-xl border border-slate-700">
                            <i data-lucide="settings" class="w-8 h-8 text-slate-400"></i>
                        </div>
                        Configuration
                    </h2>
                    <p class="text-slate-400 mt-2 ml-1">Paramètres globaux du système DriveLine</p>
                </div>
            </div>

            <form id="config-form" class="space-y-6">
                
                <!-- 1. General & Visual -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <i data-lucide="image" class="w-5 h-5 text-blue-500"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Apparence</h3>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Logo Entreprise (URL)</label>
                                <input type="url" id="brand-logo-url" placeholder="https://..." class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-3 transition-all">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL de l'Application</label>
                                <input type="url" id="app-base-url" placeholder="https://..." class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-3 transition-all">
                            </div>
                        </div>
                    </div>

                    <!-- Commissions Settings -->
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                <i data-lucide="percent" class="w-5 h-5 text-green-500"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Commissions (Primes)</h3>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mécano Test</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-mecano_test" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-mecano_test" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mécano Junior</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-mecano_junior" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-mecano_junior" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mécano Confirmé</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-mecano_confirme" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-mecano_confirme" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chef d'Atelier</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-chef_atelier" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-chef_atelier" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Responsable</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-responsable" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-responsable" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Patron / Co-Patron</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-patron" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-patron" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                                <input type="hidden" id="prime-co_patron">
                                <input type="hidden" id="rate-co_patron">
                            </div>
                        </div>
                        <p class="text-[10px] text-slate-500 mt-3 italic">
                            Ces pourcentages s'appliquent sur la <strong>Marge</strong> (Prix - Coût).
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <i data-lucide="timer" class="w-5 h-5 text-purple-400"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Activité & Stock</h3>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Seuil d'inactivité (Badge)</label>
                                <select id="inactivity-threshold" class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm p-3 transition-all cursor-pointer">
                                    <option value="1">1 Heure</option>
                                    <option value="2">2 Heures</option>
                                    <option value="3">3 Heures</option>
                                    <option value="5">5 Heures</option>
                                    <option value="24">24 Heures</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 text-orange-400">Gestion Kits de Réparation</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Physique</label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i data-lucide="package" class="h-4 w-4 text-orange-500"></i>
                                            </div>
                                            <input type="number" id="repair-kit-stock" min="0" placeholder="0" class="block w-full pl-9 rounded-xl border-slate-700 bg-slate-800/50 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm p-3 transition-all font-mono">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prix Unitaire ($)</label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i data-lucide="dollar-sign" class="h-4 w-4 text-green-500"></i>
                                            </div>
                                            <input type="number" id="repair-kit-price" min="0" placeholder="2500" class="block w-full pl-9 rounded-xl border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-3 transition-all font-mono">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-4 space-y-3 pt-4 border-t border-slate-800">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Webhook Commande (Optionnel)</label>
                                        <input type="password" id="kit-webhook-url" placeholder="https://discord.com/api/webhooks/..." class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs p-2.5 transition-all font-mono">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">ID Rôle à Ping (Optionnel)</label>
                                        <input type="text" id="kit-role-id" placeholder="Ex: 1455996639964696761" class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs p-2.5 transition-all font-mono">
                                    </div>
                                </div>

                                <p class="text-[10px] text-slate-500 mt-1">Gérez le stock physique et la configuration des notifications.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 1.5 Announcements -->
                <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                            <i data-lucide="megaphone" class="w-5 h-5 text-pink-500"></i>
                        </div>
                        <h3 class="font-bold text-white text-sm uppercase tracking-wider">Diffusion d'Annonce</h3>
                    </div>

                    <div class="flex flex-col gap-4">
                        <textarea id="announcement-input" rows="3" placeholder="Message à diffuser à toute l'entreprise..." class="w-full rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder-slate-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm p-3 transition-all font-medium"></textarea>
                        
                        <div class="flex justify-between items-center">
                            <button type="button" id="btn-announce-template-kits" class="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 px-3 py-2 rounded-lg border border-pink-500/20 transition-all">
                                <i data-lucide="package" class="w-3 h-3"></i>
                                Template: Kits
                            </button>
                            
                            <button type="button" id="btn-send-announcement" class="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-pink-900/20 hover:shadow-pink-500/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap self-end">
                                <i data-lucide="send" class="w-4 h-4"></i>
                                <span>Envoyer</span>
                            </button>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-500 mt-2">
                        Le message s'affichera instantanément sur l'écran de tous les employés connectés.
                    </p>
                </div>

                <!-- 2. Discord Integration -->
                <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    
                    <div class="flex items-center gap-3 mb-6 relative z-10">
                        <div class="p-2 bg-[#5865F2]/10 rounded-lg border border-[#5865F2]/20">
                            <i data-lucide="webhook" class="w-5 h-5 text-[#5865F2]"></i>
                        </div>
                        <h3 class="font-bold text-white text-sm uppercase tracking-wider">Intégration Discord</h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <!-- Recruitment New -->
                        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                                <h4 class="font-bold text-slate-200 text-sm">Nouvelles Candidatures</h4>
                            </div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Webhook URL</label>
                            <input type="password" id="services-webhook-url" placeholder="https://discord.com/api/webhooks/..." class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-xs p-2.5 transition-all font-mono">
                            <div class="mt-3">
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">ID Salon (Optionnel)</label>
                                <input type="text" id="application-channel-id" placeholder="Ex: 1455996687339229460" class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-xs p-2.5 transition-all font-mono">
                            </div>
                            <p class="text-[10px] text-slate-500 mt-2">
                                Notification lorsqu'un formulaire est envoyé depuis le site.
                            </p>
                        </div>

                        <!-- Recruitment Response -->
                        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-2 h-2 rounded-full bg-green-400"></div>
                                <h4 class="font-bold text-slate-200 text-sm">Réponses aux Candidats</h4>
                            </div>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Webhook URL</label>
                                    <input type="password" id="recruitment-webhook-url" placeholder="https://discord.com/api/webhooks/..." class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-xs p-2.5 transition-all font-mono">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">ID Salon "Présentation" (Mention)</label>
                                    <input type="text" id="response-channel-id" placeholder="Ex: 1458257475773010152" class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-xs p-2.5 transition-all font-mono">
                                </div>
                            </div>
                        </div>

                        ${''}

                        <!-- Patch Note block removed -->
                    </div>
                </div>

                <!-- Patch Note Generator removed -->

                <!-- 3. Actions & Danger Zone -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <!-- Weekly Closing -->
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <i data-lucide="archive" class="w-5 h-5 text-orange-400"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Clôture Semaine</h3>
                        </div>
                        
                        <div class="bg-orange-900/10 rounded-xl p-4 border border-orange-900/20 mb-4">
                            <p class="text-xs text-orange-200/80 leading-relaxed">
                                Archive le chiffre d'affaires, calcule les salaires et vide les compteurs pour la semaine suivante.
                            </p>
                        </div>
                        
                        <button type="button" id="btn-archive-week" class="w-full bg-slate-800 hover:bg-orange-600/20 hover:text-orange-400 hover:border-orange-500/30 border border-slate-700 text-slate-300 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group">
                            <i data-lucide="archive" class="w-4 h-4 group-hover:scale-110 transition-transform"></i>
                            Clôturer la semaine
                        </button>
                        

                    </div>

                    <!-- Reset -->
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                <i data-lucide="alert-triangle" class="w-5 h-5 text-red-400"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Zone de Danger</h3>
                        </div>

                        <div class="bg-red-900/10 rounded-xl p-4 border border-red-900/20 mb-4">
                            <p class="text-xs text-red-200/80 leading-relaxed">
                                Réinitialise uniquement les heures de la pointeuse sans archiver. Irréversible.
                            </p>
                        </div>

                        <button type="button" id="btn-reset-all" class="w-full bg-slate-800 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/30 border border-slate-700 text-slate-300 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group">
                            <i data-lucide="trash-2" class="w-4 h-4 group-hover:scale-110 transition-transform"></i>
                            Vider la pointeuse
                        </button>
                    </div>

                </div>

                <!-- Floating Save Bar -->
                <div class="sticky bottom-4 z-20 flex justify-end">
                    <div class="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-2 pl-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <span class="text-xs text-slate-400 font-medium hidden sm:block">Modifications en attente...</span>
                        <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i>
                            Sauvegarder tout
                        </button>
                    </div>
                </div>

            </form>
        </div>
    `;
}
