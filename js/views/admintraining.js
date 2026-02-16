import { Toast } from '../toast.js';
import { generateId } from '../utils.js';
import { auth } from '../auth.js';
import { Modal } from '../modal.js';
import { store } from '../store.js';

let trainingItems = [];
let trainingFilter = 'all';
let trainingSearch = '';
 
export function AdminTraining() {
    setTimeout(initTrainingAdmin, 50);
    return `
        <div class="space-y-8 animate-fade-in">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 class="text-3xl font-bold text-white">Formations</h2>
                    <p class="text-slate-400 mt-1">Catalogue des formations à faire passer aux nouvelles recrues</p>
                </div>
                <button id="add-training-btn" class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Ajouter une formation</span>
                </button>
            </div>
 
            <div class="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div class="p-4 border-b border-slate-700 space-y-3">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <i data-lucide="graduation-cap" class="w-5 h-5 text-purple-400"></i>
                            <span class="text-sm text-slate-300">Catalogue</span>
                        </div>
                        <span class="text-xs text-slate-400">Visible et modifiable par la Chef formatrice</span>
                    </div>
                    <div class="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                        <div class="inline-flex rounded-full bg-slate-900/60 border border-slate-700/80 p-1 w-full md:w-auto">
                            <button id="training-filter-all" type="button" class="flex-1 md:flex-none px-3 py-1.5 text-xs rounded-full bg-slate-700 text-slate-100 font-medium shadow-sm">Toutes</button>
                            <button id="training-filter-mandatory" type="button" class="flex-1 md:flex-none px-3 py-1.5 text-xs rounded-full text-slate-300 hover:text-white hover:bg-slate-700/70 transition-colors">Obligatoires</button>
                        </div>
                        <div class="flex items-center gap-2 w-full md:w-72">
                            <div class="flex-1 relative">
                                <span class="absolute inset-y-0 left-3 flex items-center text-slate-500 pointer-events-none">
                                    <i data-lucide="search" class="w-4 h-4"></i>
                                </span>
                                <input id="training-search" type="text" placeholder="Rechercher une formation..." class="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500">
                            </div>
                        </div>
                    </div>
                    <div id="training-summary" class="flex flex-wrap items-center gap-3 text-[11px] text-slate-400"></div>
                </div>
                <div id="training-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    <div class="col-span-full text-center text-slate-400">Chargement…</div>
                </div>
            </div>
        </div>
    `;
}
 
async function fetchTrainings() {
    try {
        const items = await store.fetchTrainingCourses();
        return items || [];
    } catch (e) {
        return [];
    }
}
 
function renderList(container, items) {
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="col-span-full">
                <div class="flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
                    <div class="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-purple-300">
                        <i data-lucide="graduation-cap" class="w-6 h-6"></i>
                    </div>
                    <div class="text-sm">Aucune formation configurée.</div>
                    <div class="text-xs text-slate-500">Clique sur “Ajouter une formation” pour créer ton premier module.</div>
                </div>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }
    container.innerHTML = items.map((item, index) => `
        <div class="training-card bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col hover:border-slate-600 transition-all group cursor-pointer select-none" data-id="${item.id}" draggable="true" data-index="${index}">
            <div class="flex justify-between items-start gap-3">
                <div class="flex items-center gap-4">
                    <div class="flex flex-col items-center gap-2">
                        <button type="button" class="p-1.5 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-400 hover:text-purple-300 hover:border-purple-500 transition-colors cursor-grab training-drag-handle" title="Déplacer (Drag & Drop)">
                            <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                        </button>
                        <div class="flex flex-col gap-1">
                            <button type="button" class="p-1 rounded bg-slate-900/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors training-move-up" title="Monter" ${index === 0 ? 'disabled style="opacity:0.3; pointer-events:none;"' : ''}>
                                <i data-lucide="chevron-up" class="w-3 h-3"></i>
                            </button>
                            <button type="button" class="p-1 rounded bg-slate-900/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors training-move-down" title="Descendre" ${index === items.length - 1 ? 'disabled style="opacity:0.3; pointer-events:none;"' : ''}>
                                <i data-lucide="chevron-down" class="w-3 h-3"></i>
                            </button>
                        </div>
                        <span class="text-[10px] text-slate-500 font-mono">#${index + 1}</span>
                    </div>
                    <div class="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-300 border border-slate-600">
                        <i data-lucide="graduation-cap" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-white flex items-center flex-wrap">
                            ${item.title}
                            ${item.mandatory ? '<span class="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-900/20 text-purple-300 border border-purple-700/40">Obligatoire</span>' : ''}
                        </h4>
                        <p class="text-xs text-slate-400 flex items-center gap-1">
                            <i data-lucide="clock" class="w-3 h-3"></i>
                            Durée estimée: ${item.duration || '—'}
                        </p>
                        <div class="mt-2">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-slate-700/70 bg-slate-900/60 text-slate-300">Cliquez pour voir les détails</span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" onclick="editTraining('${item.id}')" title="Modifier">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                    </button>
                    <button type="button" class="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors" onclick="deleteTraining('${item.id}')" title="Supprimer">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between relative overflow-hidden group hover:border-slate-600 transition-all">
                    <div class="flex justify-between items-start z-10">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Durée</p>
                        <div class="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
                            <i data-lucide="hourglass" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-white z-10">${item.duration || '—'}</h3>
                    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                </div>
                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between relative overflow-hidden group hover:border-slate-600 transition-all">
                    <div class="flex justify-between items-start z-10">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</p>
                        <div class="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
                            <i data-lucide="book-open" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold ${item.mandatory ? 'text-purple-300' : 'text-slate-300'} z-10">${item.mandatory ? 'Obligatoire' : 'Optionnelle'}</h3>
                    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                </div>
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
    const handler = async (e) => {
        const btn = e.target.closest('button');
        if (btn) {
            if (btn.classList.contains('training-move-up') || btn.classList.contains('training-move-down')) {
                e.preventDefault();
                e.stopPropagation();
                if (trainingFilter !== 'all' || (trainingSearch || '').trim() !== '') {
                    Toast.show('Réorganisation possible uniquement en vue "Toutes" sans filtre.', 'info');
                    return;
                }
                const card = btn.closest('.training-card');
                if (!card) return;
                const id = card.dataset.id;
                const index = trainingItems.findIndex(i => i.id === id);
                if (index === -1) return;
                
                let newIndex = index;
                if (btn.classList.contains('training-move-up')) {
                    newIndex = index - 1;
                } else {
                    newIndex = index + 1;
                }
                
                if (newIndex < 0 || newIndex >= trainingItems.length) return;
                
                const [moved] = trainingItems.splice(index, 1);
                trainingItems.splice(newIndex, 0, moved);
                
                applyTrainingFiltersAndRender();
                try {
                    await persistTrainingOrder();
                } catch (err) {
                    const msg = (err && err.message) ? err.message : String(err);
                    if (msg.toLowerCase().includes('position') && msg.toLowerCase().includes('column')) {
                        Toast.show('Colonne "position" manquante. Lancez le script SQL "fix_training_position.sql".', 'error', 10000);
                    } else {
                        Toast.show('Erreur sauvegarde ordre: ' + msg, 'error', 5000);
                    }
                }
                return;
            }
            return;
        }
        const card = e.target.closest('.training-card');
        if (!card) return;
        const id = card.dataset.id;
        const item = items.find(i => i.id === id);
        if (item) showDetails(item);
    };
    container.removeEventListener('click', container._trainingClickHandler || (() => {}));
    container._trainingClickHandler = handler;
    container.addEventListener('click', handler);

    let draggingId = null;
    Array.from(container.querySelectorAll('.training-card')).forEach(card => {
        const handle = card.querySelector('.training-drag-handle') || card;
        card.addEventListener('dragstart', (e) => {
            if (trainingFilter !== 'all' || (trainingSearch || '').trim() !== '') {
                e.preventDefault();
                Toast.show('Réorganisation possible uniquement en vue "Toutes" sans filtre.', 'info');
                return;
            }
            draggingId = card.dataset.id;
            card.classList.add('opacity-60', 'ring-2', 'ring-purple-500');
            e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', () => {
            draggingId = null;
            card.classList.remove('opacity-60', 'ring-2', 'ring-purple-500');
        });
        card.addEventListener('dragover', (e) => {
            if (!draggingId) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        card.addEventListener('drop', async (e) => {
            if (!draggingId) return;
            e.preventDefault();
            const targetId = card.dataset.id;
            if (!targetId || targetId === draggingId) return;
            reorderTrainingItems(draggingId, targetId);
            applyTrainingFiltersAndRender();
            try {
                await persistTrainingOrder();
            } catch (err) {
                const msg = (err && err.message) ? err.message : String(err);
                if (msg.toLowerCase().includes('position') && msg.toLowerCase().includes('column')) {
                    Toast.show('Colonne "position" manquante. Lancez le script SQL "fix_training_position.sql".', 'error', 10000);
                } else {
                    Toast.show('Erreur lors de la sauvegarde de l\'ordre : ' + msg, 'error', 5000);
                }
            }
        });
        if (handle && handle !== card) {
            handle.addEventListener('mousedown', () => {
                card.draggable = true;
            });
        }
    });
}

function updateTrainingSummary(allItems, visibleItems) {
    const el = document.getElementById('training-summary');
    if (!el) return;
    const total = allItems.length;
    const mandatoryCount = allItems.filter(i => i.mandatory).length;
    const optionalCount = total - mandatoryCount;
    const visibleCount = visibleItems.length;
    if (total === 0) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300">
            <i data-lucide="library" class="w-3 h-3 text-purple-300"></i>
            ${visibleCount}/${total} formations visibles
        </span>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/40 border border-slate-700/60 text-slate-400">
            <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            ${mandatoryCount} obligatoires
        </span>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/40 border border-slate-700/60 text-slate-400">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            ${optionalCount} optionnelles
        </span>
    `;
    if (window.lucide) lucide.createIcons();
}

function applyTrainingFiltersAndRender() {
    const list = document.getElementById('training-list');
    if (!list) return;
    let filtered = trainingItems.slice();
    if (trainingFilter === 'mandatory') {
        filtered = filtered.filter(i => i.mandatory);
    }
    const q = trainingSearch.trim().toLowerCase();
    if (q) {
        filtered = filtered.filter(i => {
            const title = (i.title || '').toLowerCase();
            const rawDesc = i.description || '';
            const desc = rawDesc.replace(/<[^>]+>/g, '').toLowerCase();
            return title.includes(q) || desc.includes(q);
        });
    }
    updateTrainingSummary(trainingItems, filtered);
    renderList(list, filtered);
}

function reorderTrainingItems(fromId, toId) {
    if (!Array.isArray(trainingItems)) return;
    const fromIndex = trainingItems.findIndex(i => i.id === fromId);
    const toIndex = trainingItems.findIndex(i => i.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = trainingItems.splice(fromIndex, 1);
    trainingItems.splice(toIndex, 0, moved);
}

async function persistTrainingOrder() {
    const order = trainingItems.map((item, index) => ({
        id: item.id,
        title: item.title,
        position: index
    }));
    await store.saveTrainingOrder(order);
}
 
function showDetails(item) {
    const html = `
        <div class="space-y-3">
            <div class="text-sm leading-relaxed text-slate-200">${item.description || ''}</div>
            <p class="text-slate-400 text-sm">Durée estimée: ${item.duration || '—'}</p>
            ${item.mandatory ? '<p class="text-blue-300 text-xs">Formation obligatoire pour les nouvelles recrues.</p>' : ''}
        </div>
    `;
    Modal.show({
        title: item.title,
        message: html,
        type: 'info',
        confirmText: 'Fermer',
        cancelText: null,
        size: 'lg'
    });
}
 
function showEditor(existing) {
    const container = document.createElement('div');
    container.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6';
    container.innerHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" id="tr-backdrop"></div>
        <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <i data-lucide="${existing ? 'pencil' : 'plus'}" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white leading-tight">${existing ? 'Modifier la formation' : 'Nouvelle formation'}</h3>
                        <p class="text-xs text-slate-400">Remplissez les informations ci-dessous</p>
                    </div>
                </div>
                <button type="button" id="tr-close" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <!-- Title -->
                <div class="space-y-1.5">
                    <label class="text-sm font-medium text-slate-300 flex items-center gap-2">
                        Titre de la formation <span class="text-red-400">*</span>
                    </label>
                    <div class="relative group">
                        <input id="tr-title" type="text" 
                            class="w-full bg-slate-950/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                            placeholder="Ex: Prise de service, Sécurité..."
                            value="${existing?.title || ''}">
                        <i data-lucide="type" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors"></i>
                    </div>
                </div>

                <!-- Description Editor -->
                <div class="space-y-1.5">
                    <label class="text-sm font-medium text-slate-300 flex items-center gap-2">
                        Contenu & Description
                    </label>
                    <div class="border border-slate-700 rounded-xl overflow-hidden bg-slate-950/30 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
                        <!-- Toolbar -->
                        <div class="flex items-center gap-1 p-2 border-b border-slate-700/50 bg-slate-800/30 overflow-x-auto">
                            <div class="flex items-center bg-slate-900/50 rounded-lg p-0.5 border border-slate-700/50">
                                <button type="button" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" data-cmd="bold" title="Gras (Ctrl+B)"><i data-lucide="bold" class="w-4 h-4"></i></button>
                                <button type="button" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" data-cmd="italic" title="Italique (Ctrl+I)"><i data-lucide="italic" class="w-4 h-4"></i></button>
                                <button type="button" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" data-cmd="underline" title="Souligné (Ctrl+U)"><i data-lucide="underline" class="w-4 h-4"></i></button>
                            </div>
                            <div class="w-px h-5 bg-slate-700/50 mx-1"></div>
                            <div class="flex items-center bg-slate-900/50 rounded-lg p-0.5 border border-slate-700/50">
                                <button type="button" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" data-cmd="insertUnorderedList" title="Liste à puces"><i data-lucide="list" class="w-4 h-4"></i></button>
                                <button type="button" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" data-cmd="removeFormat" title="Effacer le formatage"><i data-lucide="eraser" class="w-4 h-4"></i></button>
                            </div>
                            <div class="flex-1"></div>
                            <div class="flex items-center gap-2 px-2 border-l border-slate-700/50">
                                <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Couleur</span>
                                <input type="color" id="tr-color" class="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0" value="#ffffff" title="Couleur du texte">
                            </div>
                        </div>
                        <!-- Editor Area -->
                        <div id="tr-desc-editor" 
                            class="p-4 min-h-[150px] text-sm text-slate-200 outline-none prose prose-invert max-w-none" 
                            contenteditable="true" 
                            placeholder="Détaillez le contenu de la formation ici...">${existing?.description || ''}</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <!-- Duration -->
                    <div class="space-y-1.5">
                        <label class="text-sm font-medium text-slate-300 flex items-center gap-2">
                            Durée estimée <span class="text-red-400">*</span>
                        </label>
                        <div class="relative group">
                            <input id="tr-duration" type="text" 
                                class="w-full bg-slate-950/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                                placeholder="Ex: 1h30, 45 min..."
                                value="${existing?.duration || ''}">
                            <i data-lucide="clock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors"></i>
                        </div>
                    </div>

                    <!-- Mandatory Toggle -->
                    <div class="space-y-1.5">
                         <label class="text-sm font-medium text-slate-300 flex items-center gap-2">
                            Type de formation
                        </label>
                        <label class="flex items-center gap-3 p-2.5 rounded-xl border border-slate-700 bg-slate-950/30 cursor-pointer hover:border-slate-600 transition-all group h-[46px]">
                            <div class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="tr-mandatory" class="sr-only peer" ${existing?.mandatory ? 'checked' : ''}>
                                <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            </div>
                            <div class="flex flex-col justify-center">
                                <span class="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">Obligatoire</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
                <button id="tr-cancel" class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                    Annuler
                </button>
                <button id="tr-save" class="px-6 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2">
                    <i data-lucide="save" class="w-4 h-4"></i>
                    Sauvegarder
                </button>
            </div>
        </div>
        <style>
            [contenteditable]:empty:before {
                content: attr(placeholder);
                color: #64748b;
                pointer-events: none;
                display: block;
            }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        </style>
    `;
    document.body.appendChild(container);
    const remove = () => {
        container.querySelector('div.relative').classList.remove('zoom-in-95', 'fade-in');
        container.querySelector('div.relative').classList.add('zoom-out-95', 'fade-out');
        setTimeout(() => container.remove(), 200);
    };
    
    container.querySelector('#tr-cancel').onclick = remove;
    const closeBtn = container.querySelector('#tr-close');
    if (closeBtn) closeBtn.onclick = remove;
    if (window.lucide) lucide.createIcons();
    
    const editor = container.querySelector('#tr-desc-editor');
    const toolbarButtons = Array.from(container.querySelectorAll('[data-cmd]'));
    const colorInput = container.querySelector('#tr-color');
    
    editor.setAttribute('role', 'textbox');
    editor.setAttribute('aria-multiline', 'true');
    editor.style.caretColor = '#a855f7'; // purple-500

    let savedRange = null;
    const saveSelection = () => {
        const sel = window.getSelection();
        if (!sel) return;
        if (sel.rangeCount > 0) {
            const r = sel.getRangeAt(0);
            if (editor.contains(r.commonAncestorContainer)) savedRange = r.cloneRange();
        }
    };
    const restoreSelection = () => {
        if (!savedRange) return;
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange);
    };
    const ensureCaret = () => {
        const sel = window.getSelection();
        if (savedRange && sel) {
            restoreSelection();
            return;
        }
        const range = document.createRange();
        if ((editor.textContent || '').length === 0) {
            // No text node needed for pure CSS placeholder, but helps with focus
        }
        range.selectNodeContents(editor);
        range.collapse(false);
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
        savedRange = range.cloneRange();
    };
    
    const updateToolbarState = () => {
        try {
            const isBold = document.queryCommandState('bold');
            const isItalic = document.queryCommandState('italic');
            const isUnderline = document.queryCommandState('underline');
            const isList = document.queryCommandState('insertUnorderedList');
            const setActive = (btn, active) => {
                if(active) {
                    btn.classList.add('bg-slate-700', 'text-white');
                    btn.classList.remove('text-slate-400');
                } else {
                    btn.classList.remove('bg-slate-700', 'text-white');
                    btn.classList.add('text-slate-400');
                }
            };
            const map = {
                bold: isBold,
                italic: isItalic,
                underline: isUnderline,
                insertUnorderedList: isList
            };
            toolbarButtons.forEach(btn => {
                const cmd = btn.getAttribute('data-cmd');
                setActive(btn, !!map[cmd]);
            });
            if (colorInput) {
                let v = document.queryCommandValue('foreColor');
                if (typeof v === 'string' && v.startsWith('rgb')) {
                    const m = v.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    if (m) {
                        const r = Number(m[1]), g = Number(m[2]), b = Number(m[3]);
                        const hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
                        colorInput.value = hex;
                    }
                }
            }
        } catch (e) {}
    };

    editor.addEventListener('keyup', () => { saveSelection(); updateToolbarState(); });
    editor.addEventListener('mouseup', () => { saveSelection(); updateToolbarState(); });
    editor.addEventListener('blur', () => { saveSelection(); });
    editor.addEventListener('focus', () => { saveSelection(); });
    editor.addEventListener('input', () => { saveSelection(); });
    
    setTimeout(() => {
        editor.focus();
        ensureCaret();
    }, 50);

    container.querySelectorAll('[data-cmd]').forEach(btn => {
        const handler = (e) => {
            const cmd = btn.getAttribute('data-cmd');
            e.preventDefault();
            editor.focus();
            ensureCaret();
            document.execCommand(cmd, false, null);
            saveSelection();
            updateToolbarState();
        };
        btn.addEventListener('mousedown', handler);
        btn.addEventListener('click', (e) => e.preventDefault());
    });

    if (colorInput) {
        colorInput.addEventListener('mousedown', (e) => {
            e.preventDefault();
            saveSelection();
        });
        colorInput.addEventListener('input', (e) => {
            editor.focus();
            ensureCaret();
            document.execCommand('foreColor', false, e.target.value);
            saveSelection();
            updateToolbarState();
        });
    }

    editor.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'b') { e.preventDefault(); document.execCommand('bold'); updateToolbarState(); }
            if (e.key.toLowerCase() === 'i') { e.preventDefault(); document.execCommand('italic'); updateToolbarState(); }
            if (e.key.toLowerCase() === 'u') { e.preventDefault(); document.execCommand('underline'); updateToolbarState(); }
        }
    });
    container.querySelector('#tr-save').onclick = async () => {
        const title = container.querySelector('#tr-title').value.trim();
        const duration = container.querySelector('#tr-duration').value.trim();
        
        if (!title) {
            Toast.show('Le titre est requis', 'error');
            container.querySelector('#tr-title').focus();
            return;
        }
        if (!duration) {
            Toast.show('La durée est requise', 'error');
            container.querySelector('#tr-duration').focus();
            return;
        }

        const desc = editor.innerHTML.trim();
        const mandatory = container.querySelector('#tr-mandatory').checked;
        const id = existing?.id || generateId();
        
        const saveBtn = container.querySelector('#tr-save');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Sauvegarde...';
        if(window.lucide) lucide.createIcons();

        try {
            await store.saveTrainingCourse({ id, title, description: desc, duration, mandatory });
            trainingItems = await fetchTrainings();
            applyTrainingFiltersAndRender();
            Toast.show('Formation sauvegardée avec succès', 'success');
            remove();
        } catch (e) {
            const msg = (e && e.message) ? e.message : String(e);
            Toast.show('Erreur sauvegarde: ' + msg, 'error', 5000);
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
            if(window.lucide) lucide.createIcons();
        }
    };
}
 
async function initTrainingAdmin() {
    const user = auth.getUser();
    const canTraining = store.hasPermissionSync(user, 'training.manage');
    if (!canTraining) {
        Toast.show("Accès refusé.", "error");
        window.location.hash = '#dashboard';
        return;
    }
    const list = document.getElementById('training-list');
    const addBtn = document.getElementById('add-training-btn');
    trainingItems = await fetchTrainings();
    trainingFilter = 'all';
    trainingSearch = '';
    applyTrainingFiltersAndRender();
    const filterAll = document.getElementById('training-filter-all');
    const filterMandatory = document.getElementById('training-filter-mandatory');
    const searchInput = document.getElementById('training-search');
    if (filterAll && filterMandatory) {
        filterAll.onclick = () => {
            trainingFilter = 'all';
            filterAll.classList.add('bg-slate-700', 'text-slate-100', 'shadow-sm');
            filterMandatory.classList.remove('bg-slate-700', 'text-slate-100', 'shadow-sm');
            filterMandatory.classList.add('text-slate-300');
            applyTrainingFiltersAndRender();
        };
        filterMandatory.onclick = () => {
            trainingFilter = 'mandatory';
            filterMandatory.classList.add('bg-slate-700', 'text-slate-100', 'shadow-sm');
            filterAll.classList.remove('bg-slate-700', 'text-slate-100', 'shadow-sm');
            filterAll.classList.add('text-slate-300');
            applyTrainingFiltersAndRender();
        };
    }
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value || '';
            trainingSearch = value;
            applyTrainingFiltersAndRender();
        });
    }
    addBtn.onclick = () => showEditor(null);
    window.editTraining = (id) => {
        (async () => {
            const items = await fetchTrainings();
            const item = items.find(i => i.id === id);
            showEditor(item || null);
        })();
    };
    window.deleteTraining = (id) => {
        (async () => {
            try {
                await store.deleteTrainingCourse(id);
            } catch (e) {
                const msg = (e && e.message) ? e.message : String(e);
                Toast.show('Erreur suppression: ' + msg, 'error', 5000);
                return;
            }
            trainingItems = await fetchTrainings();
            applyTrainingFiltersAndRender();
            Toast.show('Formation supprimée', 'success');
        })();
    };
    if (window.lucide) lucide.createIcons();
}
