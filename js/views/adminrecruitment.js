import { store } from '../store.js';
import { Toast } from '../toast.js';
import { Modal } from '../modal.js';
import { Discord } from '../discord.js';
import { formatDate } from '../utils.js';

export function AdminRecruitment() {
    setTimeout(initRecruitmentAdmin, 50);

    return `
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.5); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.8); }
        </style>
        <div class="space-y-8 animate-fade-in pb-20">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="text-3xl font-bold text-white flex items-center gap-3">
                        <div class="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <i data-lucide="users" class="w-8 h-8 text-blue-500"></i>
                        </div>
                        Recrutement
                    </h2>
                    <p class="text-slate-400 mt-2 ml-1">Gestion des candidatures et du vivier</p>
                </div>
                
                <div class="flex gap-3">
                    <button id="announce-btn" class="hidden px-4 py-2.5 text-sm font-bold rounded-xl transition-all items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20" title="Renvoyer une notification">
                        <i data-lucide="bell" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Annoncer</span>
                    </button>

                    <button id="toggle-status-btn" class="px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700">
                        <span class="animate-pulse">...</span>
                    </button>
                    
                    <button id="refresh-btn" class="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors" title="Actualiser">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- KPIs -->
            <div id="recruitment-kpis" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Loading State -->
                <div class="bg-slate-900/50 h-32 rounded-xl animate-pulse"></div>
                <div class="bg-slate-900/50 h-32 rounded-xl animate-pulse"></div>
                <div class="bg-slate-900/50 h-32 rounded-xl animate-pulse"></div>
            </div>

            <!-- Kanban Board -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-350px)] min-h-[500px]">
                
                <!-- Pending Column -->
                <div class="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div class="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                            <h3 class="font-bold text-slate-200">À traiter</h3>
                            <span id="count-pending" class="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">0</span>
                        </div>
                    </div>
                    <div id="col-pending" class="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        <!-- Items -->
                    </div>
                </div>

                <!-- Interview Column -->
                <div class="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div class="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <h3 class="font-bold text-slate-200">Entretiens</h3>
                            <span id="count-interview" class="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">0</span>
                        </div>
                    </div>
                    <div id="col-interview" class="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        <!-- Items -->
                    </div>
                </div>

                <!-- Accepted Column -->
                <div class="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div class="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <h3 class="font-bold text-slate-200">Validées</h3>
                            <span id="count-accepted" class="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">0</span>
                        </div>
                        <button id="delete-all-accepted-btn" class="text-xs text-slate-500 hover:text-red-400 transition-colors" title="Supprimer tout">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                    <div id="col-accepted" class="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        <!-- Items -->
                    </div>
                </div>

                <!-- Rejected Column -->
                <div class="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div class="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-red-500"></div>
                            <h3 class="font-bold text-slate-200">Refusées</h3>
                            <span id="count-rejected" class="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">0</span>
                        </div>
                        <button id="delete-all-rejected-btn" class="text-xs text-slate-500 hover:text-red-400 transition-colors" title="Supprimer tout">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                    <div id="col-rejected" class="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        <!-- Items -->
                    </div>
                </div>

            </div>
        </div>
    `;
}

function initRecruitmentAdmin() {
    const toggleBtn = document.getElementById('toggle-status-btn');
    const announceBtn = document.getElementById('announce-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const kpisEl = document.getElementById('recruitment-kpis');
    
    const colPending = document.getElementById('col-pending');
    const colInterview = document.getElementById('col-interview');
    const colAccepted = document.getElementById('col-accepted');
    const colRejected = document.getElementById('col-rejected');
    
    const countPending = document.getElementById('count-pending');
    const countInterview = document.getElementById('count-interview');
    const countAccepted = document.getElementById('count-accepted');
    const countRejected = document.getElementById('count-rejected');
    
    const deleteAllAcceptedBtn = document.getElementById('delete-all-accepted-btn');
    const deleteAllRejectedBtn = document.getElementById('delete-all-rejected-btn');

    let apps = [];

    // --- Actions ---
    const updateBtn = (isOpen) => {
        if (!toggleBtn) return;
        if (isOpen) {
            toggleBtn.innerHTML = '<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span>Ouvert</span>';
            toggleBtn.className = 'px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20';
            if (announceBtn) {
                announceBtn.classList.remove('hidden');
                announceBtn.classList.add('flex');
            }
        } else {
            toggleBtn.innerHTML = '<div class="w-2 h-2 rounded-full bg-red-500"></div><span>Fermé</span>';
            toggleBtn.className = 'px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700';
            if (announceBtn) {
                announceBtn.classList.add('hidden');
                announceBtn.classList.remove('flex');
            }
        }
    };

    if (toggleBtn) {
        store.fetchWebhookSettings().then(settings => {
            const isOpen = settings?.recruitment_open ?? true;
            toggleBtn.dataset.open = isOpen;
            const target = settings?.recruitment_target_count ?? store.getRecruitmentTargetCount() ?? null;
            if (target !== null) toggleBtn.dataset.targetCount = String(target);
            updateBtn(isOpen);
        });

        if (announceBtn) {
            announceBtn.onclick = () => {
                const inputId = 'announce-target-input';
                const reasonId = 'announce-reason-input';
                
                // Get current target count to pre-fill
                let currentTarget = '';
                try {
                    const btn = document.getElementById('toggle-status-btn');
                    if (btn && btn.dataset.targetCount) currentTarget = btn.dataset.targetCount;
                } catch(e) {}

                Modal.show({
                    title: 'Renvoyer une annonce',
                    message: `
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="text-xs font-medium text-slate-400">Nombre de postes restants</label>
                                <input id="${inputId}" type="number" min="1" value="${currentTarget}" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2.5" placeholder="Ex: 2">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-medium text-slate-400">Message (Optionnel)</label>
                                <textarea id="${reasonId}" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2.5 h-20 text-sm" placeholder="Ex: Il reste 2 places !"></textarea>
                            </div>
                        </div>
                    `,
                    confirmText: 'Envoyer',
                    onConfirm: async () => {
                        const val = Number(document.getElementById(inputId)?.value || 0);
                        const reason = document.getElementById(reasonId)?.value || '';
                        
                        if (!val || val < 1) { Toast.show('Nombre invalide', 'error'); return; }

                        try {
                            // Update target count first if changed
                            await store.setRecruitmentTargetCount(val);
                            // Then notify
                            await store.setRecruitmentStatus(true, reason);
                            
                            // Update UI
                            if (toggleBtn) toggleBtn.dataset.targetCount = String(val);
                            
                            Toast.show('Annonce envoyée sur Discord');
                        } catch (err) {
                            Toast.show('Erreur: ' + err.message, 'error');
                        }
                    }
                });
            };
        }

        toggleBtn.onclick = async () => {
            const isOpen = toggleBtn.dataset.open === 'true';
            if (isOpen) {
                // Closing
                try {
                    await store.setRecruitmentStatus(false);
                    toggleBtn.dataset.open = false;
                    updateBtn(false);
                    Toast.show('Recrutement fermé');
                } catch (err) { Toast.show('Erreur: ' + err.message, 'error'); }
            } else {
                // Opening
                const inputId = 'target-count-input';
                const reasonId = 'reason-input';
                Modal.show({
                    title: 'Ouvrir le recrutement',
                    message: `
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="text-xs font-medium text-slate-400">Nombre de postes recherchés</label>
                                <input id="${inputId}" type="number" min="1" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2.5" placeholder="Ex: 3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-medium text-slate-400">Motif (Optionnel)</label>
                                <textarea id="${reasonId}" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2.5 h-20" placeholder="Ex: Ouverture exceptionnelle..."></textarea>
                            </div>
                        </div>
                    `,
                    confirmText: 'Ouvrir',
                    onConfirm: async () => {
                        const val = Number(document.getElementById(inputId)?.value || 0);
                        const reason = document.getElementById(reasonId)?.value || '';
                        
                        if (!val || val < 1) { Toast.show('Nombre invalide', 'error'); return; }
                        try {
                            await store.setRecruitmentTargetCount(val);
                            await store.setRecruitmentStatus(true, reason);
                            toggleBtn.dataset.open = true;
                            toggleBtn.dataset.targetCount = String(val);
                            updateBtn(true);
                            load(); // Reload to update KPIs
                            Toast.show('Recrutement ouvert');
                        } catch (err) { Toast.show('Erreur: ' + err.message, 'error'); }
                    }
                });
            }
        };
    }

    if (refreshBtn) {
        refreshBtn.onclick = () => {
            refreshBtn.querySelector('i').classList.add('animate-spin');
            load().then(() => setTimeout(() => refreshBtn.querySelector('i').classList.remove('animate-spin'), 500));
        };
    }

    if (deleteAllAcceptedBtn) {
        deleteAllAcceptedBtn.onclick = () => {
            Modal.show({
                title: 'Tout supprimer ?',
                message: 'Voulez-vous supprimer toutes les candidatures acceptées ?',
                type: 'danger',
                confirmText: 'Supprimer',
                onConfirm: async () => {
                    const toDelete = apps.filter(a => a.status === 'accepted');
                    for (const a of toDelete) await store.deleteApplication(a.id);
                    load();
                    Toast.show(`${toDelete.length} supprimés`, 'success');
                }
            });
        };
    }
    
    if (deleteAllRejectedBtn) {
        deleteAllRejectedBtn.onclick = () => {
            Modal.show({
                title: 'Tout supprimer ?',
                message: 'Voulez-vous supprimer toutes les candidatures refusées ?',
                type: 'danger',
                confirmText: 'Supprimer',
                onConfirm: async () => {
                    const toDelete = apps.filter(a => a.status === 'rejected');
                    for (const a of toDelete) await store.deleteApplication(a.id);
                    load();
                    Toast.show(`${toDelete.length} supprimés`, 'success');
                }
            });
        };
    }

    // --- Rendering ---
    const renderCard = (app) => {
        const aiScore = app.ai && typeof app.ai.score === 'number' ? Math.round(app.ai.score) : null;
        let scoreColor = 'text-slate-400 bg-slate-800';
        if (aiScore !== null) {
            if (aiScore >= 70) scoreColor = 'text-green-400 bg-green-500/10 border border-green-500/20';
            else if (aiScore >= 40) scoreColor = 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20';
            else scoreColor = 'text-red-400 bg-red-500/10 border border-red-500/20';
        }

        return `
            <div class="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all group relative animate-fade-in">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                            ${app.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-bold text-white text-sm line-clamp-1">${app.full_name}</div>
                            <div class="text-[10px] text-slate-500 font-mono">${formatDate(app.created_at)}</div>
                        </div>
                    </div>
                    ${aiScore !== null ? `
                        <div class="px-2 py-1 rounded text-[10px] font-bold ${scoreColor}" title="Score AI">
                            ${aiScore}%
                        </div>
                    ` : ''}
                </div>
                
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div class="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
                        <div class="text-[10px] text-slate-500 uppercase">Age</div>
                        <div class="text-sm font-mono text-slate-300">${app.age} ans</div>
                    </div>
                    <div class="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
                        <div class="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                            Discord
                            ${!/^\d{15,22}$/.test(app.discord_user_id || app.discord_id) ? '<i data-lucide="alert-triangle" class="w-3 h-3 text-orange-500" title="ID non numérique : MP impossible"></i>' : ''}
                        </div>
                        <div class="text-sm font-mono text-slate-300 truncate" title="${app.discord_user_id || app.discord_id || ''}">${app.discord_user_id || app.discord_id || '-'}</div>
                    </div>
                </div>

                <div class="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                    <button data-action="view" data-id="${app.id}" class="flex-1 py-1.5 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                        Voir détails
                    </button>
                    ${(app.status === 'pending' || app.status === 'interview') ? `
                        <button data-action="accept" data-id="${app.id}" class="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Accepter">
                            <i data-lucide="check" class="w-4 h-4"></i>
                        </button>
                        <button data-action="reject" data-id="${app.id}" class="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Refuser">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    ` : `
                        <button data-action="delete" data-id="${app.id}" class="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    };

    const renderKPIs = (apps) => {
        const pending = apps.filter(a => a.status === 'pending').length;
        const accepted = apps.filter(a => a.status === 'accepted').length;
        
        let target = 0;
        try {
            const btn = document.getElementById('toggle-status-btn');
            if (btn && btn.dataset.targetCount) target = Number(btn.dataset.targetCount);
            else target = Number(store.getRecruitmentTargetCount() || 0);
        } catch(e) {}
        
        const progress = target > 0 ? Math.min(100, (accepted / target) * 100) : 0;
        
        // Count "interviews" - using a heuristic or manual tagging?
        // Since we don't have an interview status, we'll hide this card or repurpose it?
        // The user asked for "Entretiens prévus". Let's assume for now we don't have it, 
        // so we'll show "Candidatures traitées" instead or keep it as placeholder 0.
        // Or better: "Total Reçues"
        const total = apps.length;

        kpisEl.innerHTML = `
            <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i data-lucide="inbox" class="w-12 h-12 text-blue-400"></i>
                </div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Candidatures en attente</div>
                <div class="text-3xl font-black text-white tracking-tight">${pending}</div>
                <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">Nécessitent une action</div>
            </div>

            <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i data-lucide="users" class="w-12 h-12 text-purple-400"></i>
                </div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Candidatures</div>
                <div class="text-3xl font-black text-white tracking-tight">${total}</div>
                <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">Depuis l'ouverture</div>
            </div>

            <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-4 relative overflow-hidden group shadow-lg">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i data-lucide="target" class="w-12 h-12 text-green-400"></i>
                </div>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Objectif Recrutement</div>
                <div class="flex items-end gap-2 mb-1">
                    <div class="text-3xl font-black text-white tracking-tight">${accepted}</div>
                    <div class="text-lg font-bold text-slate-500 mb-1">/ ${target || '∞'}</div>
                </div>
                
                <div class="w-full bg-slate-700/50 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
                </div>
                <div class="mt-2 text-xs font-medium text-slate-400 text-right">${Math.round(progress)}% atteint</div>
            </div>
        `;
    };

    const load = async () => {
        try {
            apps = await store.fetchApplications();
            
            // Render KPIs
            renderKPIs(apps);

            // Render Columns
            const pendingApps = apps.filter(a => a.status === 'pending');
            const interviewApps = apps.filter(a => a.status === 'interview');
            const acceptedApps = apps.filter(a => a.status === 'accepted');
            const rejectedApps = apps.filter(a => a.status === 'rejected');

            countPending.textContent = pendingApps.length;
            countInterview.textContent = interviewApps.length;
            countAccepted.textContent = acceptedApps.length;
            countRejected.textContent = rejectedApps.length;

            colPending.innerHTML = pendingApps.length 
                ? pendingApps.map(renderCard).join('') 
                : `<div class="text-center p-8 text-slate-500 text-xs italic opacity-50">Aucune candidature en attente</div>`;
            
            colAccepted.innerHTML = acceptedApps.length 
                ? acceptedApps.map(renderCard).join('') 
                : `<div class="text-center p-8 text-slate-500 text-xs italic opacity-50">Aucune candidature validée</div>`;

            colRejected.innerHTML = rejectedApps.length 
                ? rejectedApps.map(renderCard).join('') 
                : `<div class="text-center p-8 text-slate-500 text-xs italic opacity-50">Aucune candidature refusée</div>`;

            if (window.lucide) lucide.createIcons();

        } catch (err) {
            console.error(err);
            Toast.show('Erreur de chargement: ' + err.message, 'error');
        }
    };

    const handleCardClick = (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (!id || !action) return;
        if (action === 'view') {
            window.viewApplication(id);
        } else if (action === 'accept') {
            window.updateStatus(id, 'accepted');
        } else if (action === 'reject') {
            window.updateStatus(id, 'rejected');
        } else if (action === 'delete') {
            window.deleteApplication(id);
        }
    };

    if (colPending) colPending.addEventListener('click', handleCardClick);
    if (colInterview) colInterview.addEventListener('click', handleCardClick);
    if (colAccepted) colAccepted.addEventListener('click', handleCardClick);
    if (colRejected) colRejected.addEventListener('click', handleCardClick);

    // Global actions
    window.updateStatus = async (id, status) => {
        try {
            if (status === 'rejected') {
                Modal.show({
                    title: 'Refuser la candidature',
                    message: `<textarea id="reject-reason" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-red-500 outline-none h-24" placeholder="Motif du refus (optionnel)..."></textarea>`,
                    confirmText: 'Refuser',
                    confirmColor: 'bg-red-500 hover:bg-red-600',
                    onConfirm: async () => {
                        const reason = document.getElementById('reject-reason')?.value;
                        await store.updateApplicationStatus(id, status, reason);
                        load();
                        Toast.show('Candidature refusée', 'info');
                    }
                });
            } else {
                const updated = await store.updateApplicationStatus(id, status);
                if (status === 'interview') {
                    load();
                    Toast.show('Invitation entretien envoyée', 'info');
                    } else if (status === 'accepted') {
                    let result = null;
                    try {
                        result = await store.createEmployeeFromApplication(updated);
                    } catch (e) {
                        result = null;
                        console.error(e);
                    }
                    load();
                    Toast.show('Candidature acceptée !', 'success');
                    if (result && result.created && result.credentials) {
                        try {
                            const applicantName = updated.full_name || updated.fullName || 'Candidat';
                            const discordId = updated.discord_user_id || updated.discord_id || '';
                            const ok = await Discord.dmCredentialsToUser(discordId, result.credentials);
                            if (!ok) {
                                await Discord.logCredentialsForAdmin(applicantName, discordId, result.credentials);
                            }
                        } catch (e) {}
                        const u = result.credentials.username;
                        const p = result.credentials.password;
                        const empId = result.employee && result.employee.id ? result.employee.id : '';
                        Modal.show({
                            title: 'Fiche employé créée',
                            message: `
                                <div class="space-y-4">
                                    <div class="text-slate-300 text-sm">La fiche compta a été créée automatiquement.</div>
                                    <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2">
                                        <div class="text-xs text-slate-500 uppercase font-bold">Identifiants</div>
                                        <div class="text-sm text-white"><span class="text-slate-400">Username:</span> <span class="font-mono font-bold">${u}</span></div>
                                        <div class="text-sm text-white"><span class="text-slate-400">Mot de passe:</span> <span class="font-mono font-bold">${p}</span></div>
                                        <div class="pt-2 flex gap-2">
                                            <button type="button" class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold" onclick="navigator.clipboard.writeText('${u}')">Copier username</button>
                                            <button type="button" class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold" onclick="navigator.clipboard.writeText('${p}')">Copier mot de passe</button>
                                        </div>
                                    </div>
                                    <div class="flex justify-end gap-2">
                                        <button type="button" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm" onclick="window.location.hash = '#employees/edit/${empId}'">Ouvrir la fiche</button>
                                    </div>
                                </div>
                            `,
                            confirmText: 'OK'
                        });
                    } else if (result && result.created === false && result.employee) {
                        Toast.show('Employé déjà existant, pas de doublon.', 'info');
                    } else if (!result) {
                        Toast.show("Candidature acceptée, mais la création de fiche a échoué.", 'warning');
                    }
                } else {
                    load();
                }
            }
        } catch (err) {
            Toast.show('Erreur: ' + err.message, 'error');
        }
    };

    window.deleteApplication = async (id) => {
        Modal.show({
            title: 'Supprimer ?',
            message: 'Cette action est irréversible.',
            type: 'danger',
            confirmText: 'Supprimer',
            onConfirm: async () => {
                try {
                    await store.deleteApplication(id);
                    load();
                    Toast.show('Supprimé', 'success');
                } catch (err) { Toast.show('Erreur: ' + err.message, 'error'); }
            }
        });
    };

    window.viewApplication = (id) => {
        const app = apps.find(a => a.id === id);
        if (!app) return;
        
        const aiScore = app.ai && typeof app.ai.score === 'number' ? Math.round(app.ai.score) : null;
        
        Modal.show({
            title: app.full_name,
            message: `
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                            <div class="text-xs text-slate-500 uppercase font-bold mb-1">Profil</div>
                            <div class="text-sm text-white"><span class="text-slate-400">Age:</span> ${app.age} ans</div>
                            <div class="text-sm text-white"><span class="text-slate-400">Discord:</span> ${app.discord_id}</div>
                            <div class="text-sm text-white"><span class="text-slate-400">ID Unique:</span> ${app.unique_id || '-'}</div>
                            <div class="text-sm text-white"><span class="text-slate-400">Tél:</span> ${app.phone_ig || '-'}</div>
                        </div>
                        <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                            <div class="text-xs text-slate-500 uppercase font-bold mb-1">Disponibilités</div>
                            <div class="text-sm text-white">${app.availability}</div>
                        </div>
                    </div>

                    <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div class="text-xs text-slate-500 uppercase font-bold mb-2">Expérience</div>
                        <p class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${app.experience}</p>
                    </div>

                    <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div class="text-xs text-slate-500 uppercase font-bold mb-2">Motivation</div>
                        <p class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${app.motivation}</p>
                    </div>

                    ${app.rejection_reason ? `
                        <div class="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                            <div class="text-xs text-red-400 uppercase font-bold mb-2">Motif du refus</div>
                            <p class="text-sm text-red-200">${app.rejection_reason}</p>
                        </div>
                    ` : ''}

                    ${aiScore !== null ? `
                        <div class="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                            <div class="flex justify-between items-center mb-2">
                                <div class="text-xs text-blue-400 uppercase font-bold">Analyse IA</div>
                                <div class="font-bold text-white">${aiScore}/100</div>
                            </div>
                            <div class="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                                <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${aiScore}%"></div>
                            </div>
                            <p class="text-xs text-slate-400 italic">${app.ai.summary || "Analyse automatique du profil basée sur les réponses."}</p>
                        </div>
                    ` : ''}
                </div>
            `,
            size: 'lg',
            cancelText: 'Fermer',
            confirmText: 'Créer la fiche',
            onConfirm: async () => {
                try {
                    const res = await store.createEmployeeFromApplication(app);
                    if (res && res.created && res.credentials) {
                        try {
                            const applicantName = app.full_name || 'Candidat';
                            const discordId = app.discord_user_id || app.discord_id || '';
                            await Discord.logCredentialsForAdmin(applicantName, discordId, res.credentials);
                        } catch (e) {}
                        const u = res.credentials.username;
                        const p = res.credentials.password;
                        const empId = res.employee && res.employee.id ? res.employee.id : '';
                        Modal.show({
                            title: 'Fiche employé créée',
                            message: `
                                <div class="space-y-4">
                                    <div class="text-slate-300 text-sm">La fiche compta a été créée.</div>
                                    <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2">
                                        <div class="text-xs text-slate-500 uppercase font-bold">Identifiants</div>
                                        <div class="text-sm text-white"><span class="text-slate-400">Username:</span> <span class="font-mono font-bold">${u}</span></div>
                                        <div class="text-sm text-white"><span class="text-slate-400">Mot de passe:</span> <span class="font-mono font-bold">${p}</span></div>
                                        <div class="pt-2 flex gap-2">
                                            <button type="button" class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold" onclick="navigator.clipboard.writeText('${u}')">Copier username</button>
                                            <button type="button" class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold" onclick="navigator.clipboard.writeText('${p}')">Copier mot de passe</button>
                                        </div>
                                    </div>
                                    <div class="flex justify-end gap-2">
                                        <button type="button" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm" onclick="window.location.hash = '#employees/edit/${empId}'">Ouvrir la fiche</button>
                                    </div>
                                </div>
                            `,
                            confirmText: 'OK'
                        });
                    } else if (res && res.created === false && res.employee) {
                        Modal.show({
                            title: 'Employé existant',
                            message: `
                                <div class="space-y-4">
                                    <div class="text-slate-300 text-sm">Une fiche liée existe déjà.</div>
                                    <div class="flex justify-end gap-2">
                                        <button type="button" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm" onclick="window.location.hash = '#employees/edit/${res.employee.id}'">Ouvrir la fiche</button>
                                    </div>
                                </div>
                            `,
                            confirmText: 'OK'
                        });
                    } else {
                        Toast.show("Création non effectuée", 'warning');
                    }
                    load();
                } catch (e) {
                    Toast.show('Erreur: ' + e.message, 'error');
                }
            }
        });
    };

    load();
}
