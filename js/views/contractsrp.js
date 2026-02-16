import { store } from '../store.js';
import { Toast } from '../toast.js';
import { generateId, formatDate } from '../utils.js';

let currentMode = 'list'; // 'list', 'edit', 'view'
let currentContract = null; // Object for edit/view

export function ContractsRP() {
    setTimeout(initContractsRP, 50);
    return `
        <div id="contracts-root" class="space-y-8 animate-fade-in pb-20 min-h-screen">
            <!-- Loading -->
            <div class="flex items-center justify-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        </div>
    `;
}

async function initContractsRP() {
    const user = store.getCurrentUser();
    const canManage = await store.hasPermission(user, 'contracts.manage');
    
    // If user lands here and is not manager, default to list.
    // If manager, also default to list usually better UX.
    currentMode = 'list';
    currentContract = null;
    
    await render();
}

async function render() {
    const root = document.getElementById('contracts-root');
    if (!root) return;

    if (currentMode === 'list') {
        root.innerHTML = await renderList();
        bindListEvents();
    } else if (currentMode === 'edit') {
        root.innerHTML = renderEditor(currentContract);
        bindEditorEvents(currentContract);
        // Render preview immediately
        renderPreview(currentContract || getState()); 
    } else if (currentMode === 'view') {
        root.innerHTML = renderViewer(currentContract);
        bindViewerEvents();
        
        // Reconstruct state for preview
        const viewState = {
            simple_title: currentContract.title,
            simple_fournisseur: currentContract.fournisseur,
            simple_partenaire: currentContract.partenaire,
            simple_date: currentContract.date,
            ...currentContract.content_json
        };
        renderPreview(viewState);
    }
    if(window.lucide) lucide.createIcons();
}

// --- LIST VIEW ---

async function renderList() {
    const user = store.getCurrentUser();
    const canManage = await store.hasPermission(user, 'contracts.manage');
    const contracts = await store.fetchContracts();

    return `
        <div class="space-y-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 class="text-3xl font-black text-white uppercase tracking-tight">Contrats Partenaires</h1>
                    <p class="text-slate-400 mt-1">Gérez et consultez les contrats commerciaux de l'entreprise.</p>
                </div>
                ${canManage ? `
                <button id="btn-new-contract" class="px-5 py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg hover:shadow-red-600/20 transition-all flex items-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Nouveau</span>
                </button>
                ` : ''}
            </div>

            ${contracts.length === 0 ? `
                <div class="bg-zinc-900 border border-white/5 p-12 text-center rounded-lg">
                    <p class="text-slate-500">Aucun contrat enregistré.</p>
                </div>
            ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    ${contracts.map(c => renderContractCard(c, canManage)).join('')}
                </div>
            `}
        </div>
    `;
}

function renderContractCard(c, canManage) {
    // Reconstruct minimal state for preview
    const state = {
        simple_title: c.title,
        simple_fournisseur: c.fournisseur,
        simple_partenaire: c.partenaire,
        simple_date: c.date,
        ...c.content_json
    };
    
    const title = c.title || 'Contrat Commercial';
    const fournisseur = c.fournisseur || 'Fournisseur';
    const partenaire = c.partenaire || 'Partenaire';

    return `
        <div class="flex flex-col bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-500/30 transition-all duration-300 group h-[350px]">
            <!-- Header Info -->
            <div class="p-4 border-b border-white/5 bg-slate-900/50 z-10 relative">
                <div class="flex items-start justify-between gap-4">
                    <div class="overflow-hidden flex-1">
                        <h3 class="font-bold text-white text-sm truncate" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
                        <div class="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                            <span class="truncate max-w-[45%] font-medium">${escapeHtml(fournisseur)}</span>
                            <i data-lucide="arrow-right" class="w-3 h-3 text-slate-600 flex-shrink-0"></i>
                            <span class="truncate max-w-[45%] font-medium text-blue-300">${escapeHtml(partenaire)}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                         ${canManage ? `
                        <button data-id="${c.id}" class="btn-delete w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors" title="Supprimer">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                        <button data-id="${c.id}" class="btn-edit w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors" title="Modifier">
                            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Preview Thumbnail -->
            <div class="relative flex-1 bg-slate-950/50 overflow-hidden flex items-start justify-center pt-6 cursor-pointer btn-view-overlay" data-id="${c.id}">
                <!-- Shadow/Glow behind paper -->
                <div class="absolute top-0 w-full h-full bg-gradient-to-b from-slate-900/0 to-slate-900/80 z-10 pointer-events-none"></div>
                
                <!-- The Paper -->
                <div class="bg-white shadow-2xl origin-top transform scale-[0.38] w-[210mm] h-[297mm] transition-transform duration-500 group-hover:scale-[0.40] group-hover:translate-y-[-5px]">
                     <div class="w-full h-full overflow-hidden select-none pointer-events-none p-[20mm]">
                        ${generatePreviewHTML(state)}
                     </div>
                </div>
                
                <!-- Hover Action Overlay -->
                <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-20">
                    <button class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                        <span>Ouvrir le contrat</span>
                    </button>
                </div>
            </div>

            <!-- Footer Date -->
            <div class="px-4 py-3 border-t border-white/5 bg-slate-900/80 flex items-center justify-between text-[10px] text-slate-500 font-mono z-10">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Signé le ${formatDate(c.date)}</span>
                </div>
                <span class="opacity-50">REF: ${c.id.slice(0,6).toUpperCase()}</span>
            </div>
        </div>
    `;
}

// Modify event binding to handle overlay clicks
function bindListEvents() {
    const newBtn = document.getElementById('btn-new-contract');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            currentMode = 'edit';
            currentContract = null;
            render();
        });
    }

    const openView = async (id) => {
        const list = await store.fetchContracts();
        currentContract = list.find(c => c.id === id);
        currentMode = 'view';
        render();
    };

    document.querySelectorAll('.btn-view, .btn-view-overlay').forEach(btn => {
        btn.addEventListener('click', () => openView(btn.dataset.id));
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent overlay click
            const id = btn.dataset.id;
            const list = await store.fetchContracts();
            const c = list.find(c => c.id === id);
            if (c) {
                currentContract = {
                    simple_title: c.title,
                    simple_fournisseur: c.fournisseur,
                    simple_partenaire: c.partenaire,
                    simple_date: c.date,
                    ...c.content_json,
                    id: c.id
                };
            }
            currentMode = 'edit';
            render();
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent overlay click
            if (confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
                const id = btn.dataset.id;
                try {
                    await store.deleteContract(id);
                    Toast.show('Contrat supprimé', 'success');
                    render();
                } catch (e) {
                    Toast.show('Erreur lors de la suppression', 'error');
                }
            }
        });
    });
}



// --- EDITOR VIEW ---

function renderEditor(contractData) {
    const state = contractData || loadState(); // Use passed data or local storage draft
    // Pre-fill fields
    const safeState = { ...getState(), ...state };

    return `
        <div class="space-y-6">
            <div class="flex items-center gap-4">
                <button id="btn-back" class="p-2 rounded-xl border border-white/10 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </button>
                <h2 class="text-2xl font-bold text-white">${contractData && contractData.id ? 'Modifier le contrat' : 'Nouveau contrat'}</h2>
                <div class="ml-auto flex gap-2">
                    <button id="rp-save" class="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-900/20 flex items-center gap-2">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        <span>Sauvegarder</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <!-- Form -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-bold text-white flex items-center gap-2">
                                <i data-lucide="settings-2" class="w-5 h-5 text-blue-500"></i>
                                Configuration
                            </h3>
                            <button id="rp-generate" class="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 transition-colors">
                                <i data-lucide="refresh-cw" class="w-3 h-3"></i> Aperçu
                            </button>
                        </div>

                        <div id="simple-fields" class="space-y-5">
                            ${renderInput('simple_title', 'Titre du document', safeState.simple_title, 'type')}
                            ${renderInput('simple_logo_url', 'Logo (URL)', safeState.simple_logo_url, 'image')}
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${renderInput('simple_fournisseur', 'Fournisseur', safeState.simple_fournisseur, 'store')}
                                ${renderInput('simple_partenaire', 'Partenaire', safeState.simple_partenaire, 'users')}
                            </div>
                            ${renderTextarea('simple_eng_fournisseur', 'Engagements du Fournisseur', safeState.simple_eng_fournisseur)}
                            ${renderTextarea('simple_eng_partenaire', 'Engagements du Partenaire', safeState.simple_eng_partenaire)}
                            ${renderInput('simple_duree', 'Durée & Validité', safeState.simple_duree, 'clock')}
                            <div class="grid grid-cols-2 gap-4">
                                ${renderInput('simple_fait_a', 'Fait à', safeState.simple_fait_a, 'map-pin')}
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                                    <div class="relative group">
                                        <input id="simple_date" type="date" value="${safeState.simple_date || ''}" class="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all [color-scheme:dark]">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Preview -->
                <div class="lg:col-span-3">
                    <div class="sticky top-6">
                        <div class="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 md:p-8 shadow-2xl relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                            <div class="overflow-x-auto pb-4 custom-scrollbar">
                                <div id="rp-preview" class="bg-white text-slate-900 shadow-2xl mx-auto relative" style="width: 210mm; min-height: 297mm; padding: 20mm; transform-origin: top center;">
                                    <!-- Preview content injected by JS -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderInput(id, label, value, icon) {
    return `
        <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">${label}</label>
            <div class="relative group">
                <i data-lucide="${icon}" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors"></i>
                <input id="${id}" value="${escapeHtml(value)}" class="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all">
            </div>
        </div>
    `;
}

function renderTextarea(id, label, value) {
    return `
        <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">${label}</label>
            <div class="relative">
                <textarea id="${id}" rows="4" class="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-y">${escapeHtml(value)}</textarea>
            </div>
        </div>
    `;
}

function bindEditorEvents(contractData) {
    const state = { ...getState(), ...contractData, ...(contractData ? {} : loadState()) };
    
    // Bind inputs
    const ids = [
        'simple_title','simple_logo_url','simple_fournisseur','simple_partenaire','simple_eng_fournisseur','simple_eng_partenaire','simple_duree','simple_fait_a','simple_date'
    ];
    
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            state[id] = el.value;
            renderPreview(state);
            // Auto-save draft to local storage if it's a new contract
            if (!contractData || !contractData.id) {
                saveState(state);
            }
        });
    });

    document.getElementById('btn-back').addEventListener('click', () => {
        currentMode = 'list';
        render();
    });

    document.getElementById('rp-save').addEventListener('click', async () => {
        const missing = validateRequired(state);
        if (missing.length) {
            Toast.show('Veuillez remplir le fournisseur et le partenaire', 'error');
            return;
        }

        try {
            const dbModel = {
                id: (contractData && contractData.id) || generateId(),
                title: state.simple_title,
                fournisseur: state.simple_fournisseur,
                partenaire: state.simple_partenaire,
                date: state.simple_date,
                created_by: store.getCurrentUser().id,
                content_json: {
                    simple_logo_url: state.simple_logo_url,
                    simple_eng_fournisseur: state.simple_eng_fournisseur,
                    simple_eng_partenaire: state.simple_eng_partenaire,
                    simple_duree: state.simple_duree,
                    simple_fait_a: state.simple_fait_a
                }
            };
            await store.saveContract(dbModel);
            Toast.show('Contrat sauvegardé', 'success');
            // Clear draft if new
            if (!contractData || !contractData.id) {
                try { localStorage.removeItem('contracts_rp_state'); } catch(e) {}
            }
            currentMode = 'list';
            render();
        } catch (e) {
            console.error(e);
            Toast.show('Erreur lors de la sauvegarde', 'error');
        }
    });

    document.getElementById('rp-generate')?.addEventListener('click', () => renderPreview(state));
}


// --- VIEWER VIEW ---

function renderViewer(dbContract) {
    if (!dbContract) return `<div>Contrat introuvable</div>`;
    
    // Construct state for preview
    const state = {
        simple_title: dbContract.title,
        simple_fournisseur: dbContract.fournisseur,
        simple_partenaire: dbContract.partenaire,
        simple_date: dbContract.date,
        ...dbContract.content_json
    };

    return `
        <div class="space-y-6">
            <div class="flex items-center gap-4">
                <button id="btn-back-view" class="p-2 rounded-xl border border-white/10 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </button>
                <h2 class="text-2xl font-bold text-white">${escapeHtml(state.simple_title)}</h2>
                <div class="ml-auto flex gap-2">
                    <button id="rp-pdf-view" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 flex items-center gap-2">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        <span>Télécharger PDF</span>
                    </button>
                </div>
            </div>

            <div class="flex justify-center">
                <div class="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 md:p-8 shadow-2xl relative overflow-hidden max-w-4xl w-full">
                    <div class="overflow-x-auto pb-4 custom-scrollbar flex justify-center">
                        <div id="rp-preview" class="bg-white text-slate-900 shadow-2xl relative shrink-0" style="width: 210mm; min-height: 297mm; padding: 20mm; transform-origin: top center;">
                            <!-- Preview content injected by JS -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function bindViewerEvents() {
    document.getElementById('btn-back-view').addEventListener('click', () => {
        currentMode = 'list';
        render();
    });
    
    document.getElementById('rp-pdf-view').addEventListener('click', () => {
         // We need to re-construct state from currentContract to download
         if (currentContract) {
             const state = {
                simple_title: currentContract.title,
                simple_fournisseur: currentContract.fournisseur,
                simple_partenaire: currentContract.partenaire,
                simple_date: currentContract.date,
                ...currentContract.content_json,
                id: currentContract.id
            };
            downloadPDF(state);
         }
    });
}


// --- SHARED HELPERS ---

function generatePreviewHTML(state) {
    const headerLogo = state.simple_logo_url || localStorage.getItem('brand_logo_url');
    const headerTitle = state.simple_title || 'CONTRAT DE PARTENARIAT COMMERCIAL';
    const d = new Date();
    const dateStr = state.simple_date ? fmtDate(state.simple_date) : d.toLocaleDateString('fr-FR');
    const ville = state.simple_fait_a || '';
    
    const iso = state.simple_date ? String(state.simple_date) : new Date().toISOString().slice(0, 10);
    const ref = `REF-${iso.replace(/-/g, '')}-${slug(state.simple_fournisseur || 'PARTNER').substring(0, 4)}`.toUpperCase();

    const fRaw = String(state.simple_fournisseur || '').trim();
    const pRaw = String(state.simple_partenaire || '').trim();
    const fHtml = fRaw ? escapeHtml(fRaw) : '<span class="text-slate-400 italic font-sans bg-slate-50 px-2 py-0.5 rounded">Nom du Fournisseur</span>';
    const pHtml = pRaw ? escapeHtml(pRaw) : '<span class="text-slate-400 italic font-sans bg-slate-50 px-2 py-0.5 rounded">Nom du Partenaire</span>';
    
    const engF = lines(state.simple_eng_fournisseur);
    const engP = lines(state.simple_eng_partenaire);
    const duree = state.simple_duree || "Le contrat prend effet dès sa signature et reste valide jusqu’à résiliation par accord mutuel ou en cas de non-respect des engagements.";

    return `
        <div id="rp-header" class="flex flex-col items-center gap-4 mb-10">
            <div id="rp-logo" class="h-24 w-auto object-contain">${headerLogo ? `<img src="${headerLogo}" alt="logo" class="h-full w-auto object-contain mx-auto">` : ''}</div>
            <div class="text-center space-y-1">
                <h3 id="rp-title" class="text-2xl font-extrabold tracking-widest uppercase text-slate-900 font-serif border-b-2 border-slate-900 pb-2 mb-2 inline-block">${escapeHtml(headerTitle)}</h3>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Document Officiel • DriveLine Customs</div>
            </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 mb-8 font-mono border-b border-slate-100 pb-4">
            <span class="flex items-center gap-2">
                ${ville ? `<span class="font-bold text-slate-700">${escapeHtml(ville)}</span>` : ''}
                ${ville ? '<span class="mx-2 text-slate-300">|</span>' : ''}
                <span>${dateStr}</span>
            </span>
            <span class="bg-slate-100 px-2 py-1 rounded">${ref}</span>
        </div>

        <div class="space-y-6 font-serif text-[14px] leading-relaxed text-slate-700">
            <div class="rounded-xl border-2 border-slate-100 bg-slate-50/50 p-6 mb-8">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center font-sans">ENTRE LES SOUSSIGNÉS</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-slate-200 hidden md:block"></div>
                    <div class="text-center">
                        <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans mb-1">Fournisseur</div>
                        <div class="text-xl font-bold text-slate-900 font-serif">${fHtml}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans mb-1">Partenaire</div>
                        <div class="text-xl font-bold text-slate-900 font-serif">${pHtml}</div>
                    </div>
                </div>
            </div>

            <div class="group">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 font-sans">1</div>
                    <div class="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">Objet du contrat</div>
                </div>
                <div class="pl-9 text-justify">
                    Le présent contrat formalise un partenariat commercial reposant sur un échange de services et/ou de fournitures entre les Parties.
                </div>
            </div>

            <div class="group">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 font-sans">2</div>
                    <div class="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">Engagements du Fournisseur</div>
                </div>
                <div class="pl-9">
                    ${engF.length ? 
                        `<ul class="space-y-2">${engF.map(li=>`<li class="flex items-start gap-2"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span><span>${escapeHtml(li)}</span></li>`).join('')}</ul>` 
                        : '<div class="text-slate-400 italic font-sans bg-slate-50 p-3 rounded-lg border border-slate-100 text-center text-xs">Aucun engagement défini pour le moment.</div>'}
                </div>
            </div>

            <div class="group">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 font-sans">3</div>
                    <div class="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">Engagements du Partenaire</div>
                </div>
                <div class="pl-9">
                    ${engP.length ? 
                        `<ul class="space-y-2">${engP.map(li=>`<li class="flex items-start gap-2"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span><span>${escapeHtml(li)}</span></li>`).join('')}</ul>` 
                        : '<div class="text-slate-400 italic font-sans bg-slate-50 p-3 rounded-lg border border-slate-100 text-center text-xs">Aucun engagement défini pour le moment.</div>'}
                </div>
            </div>

            <div class="group">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 font-sans">4</div>
                    <div class="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">Durée & Résiliation</div>
                </div>
                <div class="pl-9 text-justify">
                    ${escapeHtml(duree)}
                </div>
            </div>
        </div>

        <div class="mt-auto pt-10 border-t-2 border-slate-100">
            <div class="grid grid-cols-2 gap-8">
                <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 h-32 flex flex-col relative">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans mb-1">Pour le Fournisseur</div>
                    <div class="font-bold text-slate-900 font-serif text-sm">${fHtml}</div>
                </div>
                <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 h-32 flex flex-col relative">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans mb-1">Pour le Partenaire</div>
                    <div class="font-bold text-slate-900 font-serif text-sm">${pHtml}</div>
                </div>
            </div>
            <div class="text-center mt-6">
                <div class="inline-block px-4 py-2 bg-slate-100 rounded-full text-[10px] text-slate-500 font-sans font-medium">
                    Fait à <span class="text-slate-900 font-bold">${escapeHtml(state.simple_fait_a || '.......')}</span>, le <span class="text-slate-900 font-bold">${dateStr}</span>
                </div>
            </div>
        </div>
    `;
}

function renderPreview(state) {
    const el = document.getElementById('rp-preview');
    if (!el) return;
    el.innerHTML = generatePreviewHTML(state);
}

// Reuse utils
function getState() {
    return {
        simple_title: 'CONTRAT DE PARTENARIAT COMMERCIAL',
        simple_logo_url: '',
        simple_fournisseur: '',
        simple_partenaire: 'DriveLine Customs',
        simple_eng_fournisseur: '',
        simple_eng_partenaire: '',
        simple_duree: '',
        simple_fait_a: '',
        simple_date: new Date().toISOString().slice(0, 10)
    };
}
function loadState() {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem('contracts_rp_state')); } catch (e) {}
    return { ...getState(), ...stored };
}
function saveState(state) {
    try { localStorage.setItem('contracts_rp_state', JSON.stringify(state)); } catch (e) {}
}
function validateRequired(state) {
    const missing = [];
    if (!String(state.simple_fournisseur || '').trim()) missing.push('simple_fournisseur');
    if (!String(state.simple_partenaire || '').trim()) missing.push('simple_partenaire');
    return missing;
}
function fmtDate(d) { try { return new Date(d).toLocaleDateString('fr-FR'); } catch(e) { return d; } }
function escapeHtml(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function lines(t) { return (t || '').split(/\r?\n/).map(x=>x.trim()).filter(Boolean); }
function slug(s) {
    return String(s || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]+/g, '').slice(0, 32) || 'contrat';
}

async function downloadPDF(state) {
    const el = document.getElementById('rp-preview');
    if (!el || !window.jspdf || !window.html2canvas) return;
    try {
        const scale = 2;
        const canvas = await window.html2canvas(el, { scale, backgroundColor: '#ffffff', logging: false });
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p','mm','a4');
        const imgWidthMm = 210;
        const pageHeightMm = 297;
        const mmPerPixel = imgWidthMm / canvas.width;
        const pagePixelHeight = Math.floor(pageHeightMm / mmPerPixel);
        let y = 0;
        let pageIndex = 0;
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = canvas.width;
        while (y < canvas.height) {
            const sliceHeight = Math.min(pagePixelHeight, canvas.height - y);
            ctx.canvas.height = sliceHeight;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, ctx.canvas.width, sliceHeight);
            ctx.drawImage(canvas, 0, y, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
            if (pageIndex > 0) pdf.addPage();
            pdf.addImage(ctx.canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imgWidthMm, sliceHeight * mmPerPixel);
            y += sliceHeight;
            pageIndex++;
        }
        const nameA = slug(state.simple_fournisseur || 'Fournisseur');
        const nameB = slug(state.simple_partenaire || 'Partenaire');
        pdf.save(`Contrat_${nameA}_${nameB}.pdf`);
        Toast.show('PDF téléchargé', 'success');
    } catch(err) {
        console.error(err);
        Toast.show('Erreur PDF', 'error');
    }
}
