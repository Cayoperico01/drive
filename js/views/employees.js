import { formatDate, formatCurrency, generateId, getWeekRange } from '../utils.js';
import { store } from '../store.js';
import { Modal } from '../modal.js';
import { Toast } from '../toast.js';

export function EmployeesList(employees) {
    
    const currentUser = store.getCurrentUser();
    const canManageEmployees = store.hasPermissionSync(currentUser, 'employees.manage');
    const canAddEmployees = store.hasPermissionSync(currentUser, 'employees.add');
    const canViewHistory = store.hasPermissionSync(currentUser, 'sales.view_all');
    // Suppression strictement réservée au rôle 'patron' via permission centralisée
    const canDeleteEmployees = store.hasPermissionSync(currentUser, 'employees.delete');
    const currentUserId = currentUser?.id || null;
    const preventSelfUnlock = !!currentUserId && currentUser?.role !== 'patron';
    
    let signedContractsMap = {};

    // Script de recherche dynamique
    setTimeout(async () => {
        // Fetch contracts
        try {
            const list = await store.fetchAllEmploymentContracts();
            list.forEach(c => {
                signedContractsMap[c.employee_id] = c;
            });
            // Initial render might happen before this, so trigger update
            const grid = document.getElementById('employees-grid');
            if (grid) {
                // We need to re-render. 
                // However, renderGridHtml depends on 'employees' which is in scope.
                // We can just re-call applyFilters() which calls renderGridHtml implicitly via the logic?
                // No, applyFilters hides/shows cards. It doesn't rebuild HTML.
                // We must rebuild HTML.
                grid.innerHTML = renderGridHtml(employees);
                if (window.lucide) lucide.createIcons();
                applyFilters(); // Re-apply visibility
                initLocks();
                attachLockHandlers();
            }
        } catch (e) { console.error(e); }

        const searchInput = document.getElementById('search-employee');
        const gridContainer = document.getElementById('employees-grid');
        const statusSel = document.getElementById('emp-filter-status');
        const roleSel = document.getElementById('emp-filter-role');
        const flagSel = document.getElementById('emp-filter-flag');
        const sortBySel = document.getElementById('emp-sort-by');
        const sortDirBtn = document.getElementById('emp-sort-dir');
        const resetBtn = document.getElementById('emp-filters-reset');
        
        // Date Filter Logic
        const dateStartInput = document.getElementById('emp-filter-date-start');
        const dateEndInput = document.getElementById('emp-filter-date-end');

        const formatDateInput = (d) => {
            if (!d) return '';
            const date = new Date(d);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        if (dateStartInput && dateEndInput) {
            // Set initial values
            dateStartInput.value = filterStart ? formatDateInput(filterStart) : '';
            dateEndInput.value = filterEnd ? formatDateInput(filterEnd) : '';

            const updateDateFilter = () => {
                if (dateStartInput.value) {
                    const s = new Date(dateStartInput.value);
                    s.setHours(0,0,0,0);
                    filterStart = s;
                } else {
                    filterStart = null;
                }

                if (dateEndInput.value) {
                    const e = new Date(dateEndInput.value);
                    e.setHours(23,59,59,999);
                    filterEnd = e;
                } else {
                    filterEnd = null;
                }

                // Sync to store
                store.setDateFilter(filterStart, filterEnd);

                // Re-render grid
                const grid = document.getElementById('employees-grid');
                if (grid) {
                    grid.innerHTML = renderGridHtml(employees);
                    if (window.lucide) lucide.createIcons();
                    
                    // Re-apply existing filters/sorts
                    applySort();
                    applyFilters();
                    updateKpis();
                    initLocks();
                    attachLockHandlers();
                }
            };

            dateStartInput.addEventListener('change', updateDateFilter);
            dateEndInput.addEventListener('change', updateDateFilter);
        }

        const kpiTotal = document.getElementById('emp-kpi-total');
        const kpiActive = document.getElementById('emp-kpi-active');
        const kpiPaused = document.getElementById('emp-kpi-paused');
        const kpiInactive = document.getElementById('emp-kpi-inactive');
        const kpiLocked = document.getElementById('emp-kpi-locked');

        let initLocks = () => {};
        let attachLockHandlers = () => {};

        const getCards = () => Array.from(gridContainer?.getElementsByClassName('employee-card') || []);

        if (gridContainer) {
            gridContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.js-view-contract');
                if (btn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const empId = btn.dataset.id;
                    const contract = signedContractsMap[empId];
                    if (contract) {
                        Modal.show({
                            title: `Contrat de Travail`,
                            message: `
                                <div class="bg-white text-slate-900 p-8 rounded-lg max-h-[60vh] overflow-y-auto shadow-inner border border-slate-200">
                                    <div class="prose prose-sm max-w-none mb-6">
                                        ${contract.content_html}
                                    </div>
                                    <div class="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono bg-slate-50 p-4 rounded-lg">
                                        <div>
                                            <div class="font-bold text-slate-700 uppercase mb-1">Signature Électronique</div>
                                            <div class="font-serif italic text-lg text-blue-900">${contract.signature}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-bold text-slate-700 uppercase mb-1">Date de signature</div>
                                            <div>${new Date(contract.signed_at).toLocaleString('fr-FR')}</div>
                                        </div>
                                    </div>
                                </div>
                            `,
                            confirmText: 'Fermer',
                            type: 'info',
                            width: 'max-w-4xl'
                        });
                    }
                }
            });
        }

        const updateKpis = () => {
            const cards = getCards();
            const total = cards.length;
            const active = cards.filter(c => c.dataset.presence === 'active').length;
            const paused = cards.filter(c => c.dataset.presence === 'paused').length;
            const inactive = cards.filter(c => c.dataset.inactive === '1').length;
            const locked = cards.filter(c => c.dataset.locked === '1').length;
            if (kpiTotal) kpiTotal.textContent = String(total);
            if (kpiActive) kpiActive.textContent = String(active);
            if (kpiPaused) kpiPaused.textContent = String(paused);
            if (kpiInactive) kpiInactive.textContent = String(inactive);
            if (kpiLocked) kpiLocked.textContent = String(locked);
        };

        const applySort = () => {
            if (!gridContainer) return;
            const cards = getCards();
            const sortBy = sortBySel?.value || (localStorage.getItem('emp_sort_by') || 'rev');
            const sortDir = sortDirBtn?.dataset?.dir || (localStorage.getItem('emp_sort_dir') || 'desc');

            const dir = sortDir === 'asc' ? 1 : -1;
            const getNum = (c, key) => Number(c.dataset[key] || 0);
            const getStr = (c, key) => String(c.dataset[key] || '').toLowerCase();

            cards.sort((a, b) => {
                if (sortBy === 'name') {
                    const av = getStr(a, 'name');
                    const bv = getStr(b, 'name');
                    if (av < bv) return -1 * dir;
                    if (av > bv) return 1 * dir;
                    return 0;
                }
                if (sortBy === 'created') {
                    return (getNum(a, 'created') - getNum(b, 'created')) * dir;
                }
                if (sortBy === 'warnings') {
                    return (getNum(a, 'warnings') - getNum(b, 'warnings')) * dir;
                }
                if (sortBy === 'weekly') {
                    return (getNum(a, 'weekly') - getNum(b, 'weekly')) * dir;
                }
                return (getNum(a, 'rev') - getNum(b, 'rev')) * dir;
            });

            for (const c of cards) gridContainer.appendChild(c);
        };

        const applyFilters = () => {
            const term = (searchInput?.value || '').toLowerCase();
            const status = statusSel?.value || (localStorage.getItem('emp_filter_status') || 'all');
            const role = roleSel?.value || (localStorage.getItem('emp_filter_role') || 'all');
            const flag = flagSel?.value || (localStorage.getItem('emp_filter_flag') || 'all');
            const cards = getCards();

            for (const card of cards) {
                const name = (card.dataset.name || '').toLowerCase();
                const matchesSearch = !term || name.includes(term);
                const matchesStatus = status === 'all' ? true : (card.dataset.presence === status);
                const matchesRole = role === 'all' ? true : (card.dataset.role === role);
                const matchesFlag = flag === 'all'
                    ? true
                    : flag === 'inactive'
                        ? card.dataset.inactive === '1'
                        : flag === 'locked'
                            ? card.dataset.locked === '1'
                        : flag === 'warnings'
                            ? Number(card.dataset.warnings || 0) > 0
                            : true;

                card.style.display = (matchesSearch && matchesStatus && matchesRole && matchesFlag) ? 'flex' : 'none';
            }
            updateKpis();
        };

        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                localStorage.setItem('emp_search', e.target.value || '');
                applyFilters();
            });
            try {
                const saved = localStorage.getItem('emp_search') || '';
                if (saved) searchInput.value = saved;
            } catch (e) {}
            applyFilters();
        }

        if (statusSel) {
            try { 
                const saved = localStorage.getItem('emp_filter_status') || 'all';
                statusSel.value = saved;
                
                // Tabs UI
                const updateTabs = () => {
                    const val = statusSel.value;
                    const tabs = document.querySelectorAll('#emp-status-tabs button');
                    tabs.forEach(btn => {
                        const isAct = btn.dataset.val === val;
                        btn.className = isAct 
                            ? "px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-blue-600 text-white shadow-lg shadow-blue-900/20 whitespace-nowrap" 
                            : "px-3 py-1.5 rounded-md text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-700/50 whitespace-nowrap";
                    });
                };
                updateTabs();

                const tabsContainer = document.getElementById('emp-status-tabs');
                if (tabsContainer) {
                    tabsContainer.addEventListener('click', (e) => {
                        if (e.target.tagName === 'BUTTON') {
                            const val = e.target.dataset.val;
                            statusSel.value = val;
                            localStorage.setItem('emp_filter_status', val);
                            updateTabs();
                            applyFilters();
                        }
                    });
                }
            } catch (e) {}
        }
        if (roleSel) {
            try { roleSel.value = localStorage.getItem('emp_filter_role') || 'all'; } catch (e) {}
            roleSel.onchange = () => {
                localStorage.setItem('emp_filter_role', roleSel.value);
                applyFilters();
            };
        }
        if (flagSel) {
            try { flagSel.value = localStorage.getItem('emp_filter_flag') || 'all'; } catch (e) {}
            flagSel.onchange = () => {
                localStorage.setItem('emp_filter_flag', flagSel.value);
                applyFilters();
            };
        }
        if (sortBySel) {
            try { sortBySel.value = localStorage.getItem('emp_sort_by') || 'rev'; } catch (e) {}
            sortBySel.onchange = () => {
                localStorage.setItem('emp_sort_by', sortBySel.value);
                applySort();
            };
        }
        if (sortDirBtn) {
            const applyDirLabel = () => {
                const dir = sortDirBtn.dataset.dir || 'desc';
                sortDirBtn.textContent = dir === 'asc' ? 'Asc' : 'Desc';
            };
            try { sortDirBtn.dataset.dir = localStorage.getItem('emp_sort_dir') || 'desc'; } catch (e) {}
            applyDirLabel();
            sortDirBtn.onclick = () => {
                const next = (sortDirBtn.dataset.dir || 'desc') === 'asc' ? 'desc' : 'asc';
                sortDirBtn.dataset.dir = next;
                localStorage.setItem('emp_sort_dir', next);
                applyDirLabel();
                applySort();
            };
        }
        if (resetBtn) {
            resetBtn.onclick = () => {
                try {
                    localStorage.removeItem('emp_search');
                    localStorage.removeItem('emp_filter_status');
                    localStorage.removeItem('emp_filter_role');
                    localStorage.removeItem('emp_filter_flag');
                    localStorage.removeItem('emp_sort_by');
                    localStorage.removeItem('emp_sort_dir');
                } catch (e) {}
                if (searchInput) searchInput.value = '';
                if (statusSel) statusSel.value = 'all';
                if (roleSel) roleSel.value = 'all';
                if (flagSel) flagSel.value = 'all';
                if (sortBySel) sortBySel.value = 'rev';
                if (sortDirBtn) sortDirBtn.dataset.dir = 'desc';

                // Reset Dates
                if (dateStartInput && dateEndInput) {
                    filterStart = new Date(startOfWeek);
                    filterEnd = new Date(endOfWeek);
                    dateStartInput.value = formatDateInput(filterStart);
                    dateEndInput.value = formatDateInput(filterEnd);
                    
                    const grid = document.getElementById('employees-grid');
                    if (grid) {
                        grid.innerHTML = renderGridHtml(employees);
                        if (window.lucide) lucide.createIcons();
                        initLocks();
                        attachLockHandlers();
                        updateKpis();
                    }
                }

                applySort();
                applyFilters();
            };
        }

        const refreshBtn = document.getElementById('emp-refresh-btn');
        if (refreshBtn) {
            refreshBtn.onclick = async () => {
                refreshBtn.classList.add('animate-spin');
                try {
                    // Fetch new data
                    const [newEmps, newSales, newEntries] = await Promise.all([
                        store.fetchEmployees(),
                        store.fetchSales(),
                        store.fetchTimeEntries()
                    ]);
                    
                    // Update local variables
                    employees = newEmps;
                    sales = newSales;
                    timeEntries = newEntries;
                    
                    const grid = document.getElementById('employees-grid');
                    if (grid) {
                        grid.innerHTML = renderGridHtml(employees);
                        if (window.lucide) lucide.createIcons();
                        
                        // Re-apply filters
                        applySort();
                        applyFilters();
                        updateKpis();
                        initLocks();
                        attachLockHandlers();
                    }
                    Toast.show("Liste actualisée");
                } catch(e) {
                    console.error(e);
                    Toast.show("Erreur lors de l'actualisation", 'error');
                } finally {
                    refreshBtn.classList.remove('animate-spin');
                }
            };
        }

        const refreshPresence = async () => {
            try {
                await store.fetchTimeEntries();
                const timeEntries = store._timeEntries || [];
                document.querySelectorAll('.employee-card').forEach(card => {
                    const empId = card.dataset.id;
                    const statusEl = card.querySelector('.js-status');
                    const badgesEl = card.querySelector('.js-badges');
                    if (!empId || !statusEl || !badgesEl) return;
                    const activeEntry = timeEntries.find(t => t.employee_id === empId && !t.clock_out);
                    const isActive = !!activeEntry;
                    const isPaused = !!(activeEntry && activeEntry.paused);
                    card.dataset.presence = isActive ? (isPaused ? 'paused' : 'active') : 'absent';
                    let statusLabel = 'Absent';
                    let statusDot = 'bg-slate-600';
                    let statusTextClass = 'text-slate-500';
                    let statusIcon = 'slash';
                    let sinceText = '';
                    if (isActive && isPaused) {
                        statusLabel = 'En pause';
                        statusDot = 'bg-yellow-400';
                        statusTextClass = 'text-yellow-400';
                        statusIcon = 'pause-circle';
                        if (activeEntry.pause_started) {
                            const t = new Date(activeEntry.pause_started);
                            sinceText = `depuis ${t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                        }
                    } else if (isActive) {
                        statusLabel = 'En service';
                        statusDot = 'bg-green-500';
                        statusTextClass = 'text-green-400';
                        statusIcon = 'play-circle';
                        const t = new Date(activeEntry.clock_in);
                        sinceText = `depuis ${t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                    }
                    statusEl.innerHTML = `
                        <span class="w-2 h-2 rounded-full ${statusDot}"></span>
                        <span class="${statusTextClass} font-medium flex items-center gap-1">
                            <i data-lucide="${statusIcon}" class="w-3 h-3"></i>
                            ${statusLabel} ${sinceText ? `<span class="text-slate-400 font-normal ml-1">${sinceText}</span>` : ''}
                        </span>
                    `;
                    const now = new Date();
                    let inactiveBadge = '';
                    if (isActive && !isPaused) {
                        const empSales = store.getSales().filter(s => s.employeeId === empId);
                        const lastSaleSinceClockIn = empSales
                            .filter(s => new Date(s.date) >= new Date(activeEntry.clock_in))
                            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        
                        // Determine last activity time: either last sale time or clock-in time
                        let lastActivityTime = new Date(activeEntry.clock_in);
                        if (lastSaleSinceClockIn) {
                            lastActivityTime = new Date(lastSaleSinceClockIn.date);
                        }

                        const timeSinceLastActivity = now - lastActivityTime;
                        const inactivityHours = parseInt(localStorage.getItem('inactivity_threshold_hours') || '2', 10);
                        
                        if (timeSinceLastActivity >= inactivityHours * 3600000 && !isPaused) {
                            inactiveBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-900/20 text-orange-300 border border-orange-700/40 js-inactive"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Inactif</span>`;
                        }
                    }
                    card.dataset.inactive = inactiveBadge ? '1' : '0';
                    const existing = Array.from(badgesEl.children).filter(el => !el.classList.contains('js-inactive'));
                    badgesEl.innerHTML = `${inactiveBadge}${existing.map(el => el.outerHTML).join('')}`;
                });
                if (window.lucide) lucide.createIcons();
                applyFilters();
            } catch (e) {}
        };
        refreshPresence();
        applySort();
        updateKpis();

        if (canManageEmployees) {
            const updateLockUi = (empId, locked, lockMeta) => {
                const btn = document.querySelector(`.js-lock-emp[data-id="${empId}"]`);
                if (!btn) return;
                const meta = lockMeta && typeof lockMeta === 'object' ? store.formatLockMeta(lockMeta) : null;
                btn.setAttribute('data-locked', locked ? '1' : '0');
                btn.setAttribute('title', locked ? (meta ? meta.title : 'Compte bloqué') : 'Bloquer le compte');
                btn.classList.toggle('text-red-400', locked);
                btn.classList.toggle('hover:text-red-300', locked);
                btn.classList.toggle('text-slate-400', !locked);
                btn.classList.toggle('hover:text-white', !locked);
                const icon = btn.querySelector('i');
                if (icon) icon.setAttribute('data-lucide', locked ? 'lock' : 'unlock');

                const bannerContainer = document.querySelector(`.js-lock-banner[data-id="${empId}"]`);
                if (bannerContainer) {
                    if (locked) {
                        const reason = meta && meta.reason ? `<p class="text-xs text-red-300 truncate">${meta.reason}</p>` : '';
                        const period = meta && meta.period ? `<p class="text-[10px] text-red-300/70 mt-0.5">${meta.period}</p>` : '';
                        bannerContainer.innerHTML = `
                            <div class="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                                <i data-lucide="lock" class="w-3 h-3 text-red-400 mt-0.5 shrink-0"></i>
                                <div class="min-w-0">
                                    <p class="text-[10px] font-bold text-red-400 uppercase">Bloqué</p>
                                    ${reason}
                                    ${period}
                                </div>
                            </div>
                        `;
                    } else {
                        bannerContainer.innerHTML = '';
                    }
                }

                const card = document.querySelector(`.employee-card[data-id="${empId}"]`);
                if (card) card.dataset.locked = locked ? '1' : '0';

                if (window.lucide) lucide.createIcons();
                updateKpis();
                applyFilters();
            };

            initLocks = () => {};

            attachLockHandlers = () => {
                document.querySelectorAll('.js-lock-emp').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const empId = btn.getAttribute('data-id');
                        if (!empId) return;

                        if (preventSelfUnlock && String(empId) === String(currentUserId)) {
                            Toast.show("Tu ne peux pas modifier ton propre blocage.", 'error');
                            return;
                        }

                        const isLocked = btn.getAttribute('data-locked') === '1';
                        const nextLocked = !isLocked;

                        try {
                            if (nextLocked) {
                                const empName = (() => {
                                    const emp = store.getEmployees().find(x => String(x.id) === String(empId));
                                    return emp ? `${emp.first_name} ${emp.last_name}` : 'cet employé';
                                })();

                                Modal.show({
                                    title: 'Bloquer un compte employé',
                                    type: 'danger',
                                    confirmText: 'Bloquer',
                                    cancelText: 'Annuler',
                                    message: `
                                        <div class="space-y-4">
                                            <div class="text-slate-300">Tu vas bloquer <span class="font-bold text-white">${empName}</span>. Aucun accès ne sera possible pendant la période.</div>
                                            <div>
                                                <label class="block text-sm font-medium text-slate-300 mb-1">Motif (obligatoire)</label>
                                                <input id="lock-reason" type="text" autocomplete="off" placeholder="Ex: Suspension disciplinaire" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-red-500 focus:ring-red-500 p-3" />
                                            </div>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label class="block text-sm font-medium text-slate-300 mb-1">Début (obligatoire)</label>
                                                    <input id="lock-start" type="date" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-red-500 focus:ring-red-500 p-3" />
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-slate-300 mb-1">Fin (obligatoire)</label>
                                                    <input id="lock-end" type="date" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-red-500 focus:ring-red-500 p-3" />
                                                </div>
                                            </div>
                                        </div>
                                    `,
                                    onConfirm: async () => {
                                        const reason = (document.getElementById('lock-reason')?.value || '').trim();
                                        const start = document.getElementById('lock-start')?.value || '';
                                        const end = document.getElementById('lock-end')?.value || '';

                                        if (reason.length < 3) throw new Error('Motif trop court.');
                                        if (!start || !end) throw new Error('Dates de début et de fin obligatoires.');
                                        if (String(end) < String(start)) throw new Error('La date de fin doit être après la date de début.');

                                        const lockData = { reason, start, end };
                                        await store.setEmployeeAccountLock(empId, lockData);
                                        updateLockUi(empId, true, lockData);
                                        Toast.show('Compte bloqué.', 'success');
                                    }
                                });

                                setTimeout(() => {
                                    const start = document.getElementById('lock-start');
                                    const end = document.getElementById('lock-end');
                                    if (start && !start.value) {
                                        const d = new Date();
                                        const yyyy = d.getFullYear();
                                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                                        const dd = String(d.getDate()).padStart(2, '0');
                                        start.value = `${yyyy}-${mm}-${dd}`;
                                    }
                                    if (end && !end.value && start && start.value) {
                                        end.value = start.value;
                                    }
                                }, 0);
                            } else {
                                await store.clearEmployeeAccountLock(empId);
                                updateLockUi(empId, false, null);
                                Toast.show('Compte débloqué.', 'success');
                            }
                        } catch (err) {
                            console.error(err);
                            Toast.show(err && err.message ? err.message : "Impossible de modifier le blocage.", 'error');
                        }
                    });
                });
            };

            initLocks();
            attachLockHandlers();
            
            const attachContractHandlers = () => {
                document.querySelectorAll('.js-reset-contract').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const empId = btn.getAttribute('data-id');
                        if (!empId) return;

                        const empName = (() => {
                            const emp = store.getEmployees().find(x => String(x.id) === String(empId));
                            return emp ? `${emp.first_name} ${emp.last_name}` : 'cet employé';
                        })();

                        Modal.show({
                            title: 'Supprimer et Renvoyer le contrat',
                            type: 'danger',
                            confirmText: 'Supprimer et Renvoyer',
                            cancelText: 'Annuler',
                            message: `
                                <div class="space-y-4">
                                    <div class="text-slate-300">
                                        Voulez-vous vraiment supprimer le contrat de <span class="font-bold text-white">${empName}</span> ?
                                    </div>
                                    <p class="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                                        L'ancien contrat sera définitivement supprimé. L'employé devra signer un nouveau contrat lors de sa prochaine connexion.
                                    </p>
                                </div>
                            `,
                            onConfirm: async () => {
                                try {
                                    await store.resetEmploymentContract(empId);
                                    
                                    // Update local state immediately
                                    if (signedContractsMap && signedContractsMap[empId]) {
                                        delete signedContractsMap[empId];
                                    }

                                    Toast.show('Contrat supprimé. Une nouvelle signature sera demandée.', 'success');
                                    
                                    // Refresh UI
                                    if (refreshBtn) refreshBtn.click();
                                    else applyFilters(); // Fallback
                                } catch (err) {
                                    console.error(err);
                                    Toast.show("Erreur lors de la réinitialisation du contrat", 'error');
                                }
                            }
                        });
                    });
                });
            };
            attachContractHandlers();
        }

        if (canDeleteEmployees) {
            const attachDeleteHandlers = () => {
                document.querySelectorAll('.js-delete-emp').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const empId = btn.getAttribute('data-id');
                        if (!empId) return;

                        if (currentUserId && String(empId) === String(currentUserId)) {
                            Toast.show("Impossible de supprimer ta propre fiche.", 'error');
                            return;
                        }

                        const emp = store.getEmployees().find(x => String(x.id) === String(empId)) || null;
                        const empName = emp ? `${emp.first_name} ${emp.last_name}` : 'cet employé';
                        const isPatron = emp && String(emp.role || '') === 'patron';
                        if (isPatron) {
                            Toast.show("Impossible de supprimer la fiche Patron.", 'error');
                            return;
                        }

                        Modal.show({
                            title: 'Supprimer la fiche employé ?',
                            type: 'danger',
                            confirmText: 'Supprimer',
                            cancelText: 'Annuler',
                            message: `
                                <div class="space-y-3">
                                    <div class="text-slate-300 text-sm">Tu es sur le point de supprimer définitivement <span class="font-bold text-white">${empName}</span>.</div>
                                    <div class="text-xs text-slate-500">Cette action est irréversible.</div>
                                </div>
                            `,
                            onConfirm: async () => {
                                await store.deleteEmployee(empId);
                                const card = document.querySelector(`.employee-card[data-id="${empId}"]`);
                                if (card) card.remove();
                                updateKpis();
                                applyFilters();
                                Toast.show('Fiche supprimée.', 'success');
                            }
                        });
                    });
                });
            };

            attachDeleteHandlers();
        }

        const btnBlockAll = document.getElementById('btn-block-all');
        if (btnBlockAll) {
            btnBlockAll.addEventListener('click', () => {
                 const allEmps = store.getEmployees();
                 const targets = allEmps.filter(e => e.role !== 'patron');
                 const count = targets.length;
                 
                 Modal.show({
                    title: 'Verrouillage Global',
                    message: `
                        <div class="space-y-4">
                            <p class="text-slate-300">Vous êtes sur le point de bloquer l'accès à <span class="font-bold text-white">${count} employés</span> (tous sauf Patron).</p>
                            
                            <div class="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Motif du blocage</label>
                                <input type="text" id="mass-lock-reason" value="Fermeture Administrative" class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:border-red-500 outline-none">
                            </div>

                            <div class="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex gap-3 items-start">
                                <i data-lucide="alert-triangle" class="w-5 h-5 text-red-400 shrink-0"></i>
                                <div>
                                    <p class="text-xs text-red-300 font-bold uppercase mb-0.5">Action Immédiate</p>
                                    <p class="text-xs text-red-200/80">Les employés seront déconnectés et ne pourront plus accéder à l'application.</p>
                                </div>
                            </div>
                        </div>
                    `,
                    type: 'danger',
                    confirmText: 'Tout Bloquer',
                    cancelText: 'Annuler',
                    onConfirm: async () => {
                        const reason = document.getElementById('mass-lock-reason')?.value || 'Fermeture Administrative';
                        const today = new Date().toISOString().split('T')[0];
                        const d = new Date();
                        d.setFullYear(d.getFullYear() + 1);
                        const endDate = d.toISOString().split('T')[0];

                        const lockData = {
                            reason: reason,
                            start: today,
                            end: endDate
                        };

                        try {
                            btnBlockAll.disabled = true;
                            const originalContent = btnBlockAll.innerHTML;
                            btnBlockAll.innerHTML = `<span class="inline-block animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full"></span>`;
                            
                            const promises = targets.map(emp => store.setEmployeeAccountLock(emp.id, lockData));
                            await Promise.all(promises);
                            
                            Toast.show(`${count} comptes bloqués avec succès.`, 'success');
                            
                            // Restore button state
                            btnBlockAll.innerHTML = originalContent;
                            btnBlockAll.disabled = false;

                            if (refreshBtn) {
                                refreshBtn.click();
                            } else {
                                window.location.reload();
                            }
                        } catch (e) {
                            console.error(e);
                            Toast.show("Erreur lors du blocage global", 'error');
                            btnBlockAll.disabled = false;
                            btnBlockAll.innerHTML = `<i data-lucide="lock" class="w-4 h-4"></i><span class="hidden md:inline">Tout Bloquer</span>`;
                            if (window.lucide) lucide.createIcons();
                        }
                    }
                 });
            });
        }

        const btnUnlockAll = document.getElementById('btn-unlock-all');
        if (btnUnlockAll) {
            btnUnlockAll.addEventListener('click', () => {
                 const allEmps = store.getEmployees();
                 const targets = allEmps.filter(e => e.role !== 'patron');
                 const count = targets.length;
                 
                 Modal.show({
                    title: 'Déverrouillage Global',
                    message: `
                        <div class="space-y-4">
                            <p class="text-slate-300">Vous êtes sur le point de débloquer l'accès à <span class="font-bold text-white">${count} employés</span> (tous sauf Patron).</p>
                            
                            <div class="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex gap-3 items-start">
                                <i data-lucide="unlock" class="w-5 h-5 text-green-400 shrink-0"></i>
                                <div>
                                    <p class="text-xs text-green-300 font-bold uppercase mb-0.5">Rétablissement d'accès</p>
                                    <p class="text-xs text-green-200/80">Les employés pourront à nouveau se connecter à l'application.</p>
                                </div>
                            </div>
                        </div>
                    `,
                    type: 'success', // or 'info' but success fits unlock
                    confirmText: 'Tout Débloquer',
                    cancelText: 'Annuler',
                    onConfirm: async () => {
                        try {
                            btnUnlockAll.disabled = true;
                            const originalContent = btnUnlockAll.innerHTML;
                            btnUnlockAll.innerHTML = `<span class="inline-block animate-spin h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full"></span>`;
                            
                            const promises = targets.map(emp => store.clearEmployeeAccountLock(emp.id));
                            await Promise.all(promises);
                            
                            Toast.show(`${count} comptes débloqués avec succès.`, 'success');
                            
                            // Restore button state
                            btnUnlockAll.innerHTML = originalContent;
                            btnUnlockAll.disabled = false;

                            if (refreshBtn) {
                                refreshBtn.click();
                            } else {
                                window.location.reload();
                            }
                        } catch (e) {
                            console.error(e);
                            Toast.show("Erreur lors du déblocage global", 'error');
                            btnUnlockAll.disabled = false;
                            btnUnlockAll.innerHTML = `<i data-lucide="unlock" class="w-4 h-4"></i><span class="hidden md:inline">Tout Débloquer</span>`;
                            if (window.lucide) lucide.createIcons();
                        }
                    }
                 });
            });
        }

        const btnResetContracts = document.getElementById('btn-reset-contracts');
        if (btnResetContracts) {
            btnResetContracts.addEventListener('click', () => {
                const allEmps = store.getEmployees();
                // Include everyone, even Patron
                const targets = allEmps;
                
                // Create modal content with checklist
                const checklistHtml = targets.map(emp => `
                    <label class="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 cursor-pointer transition-colors group">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" name="reset_target" value="${emp.id}" class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/20">
                            <div>
                                <div class="text-sm font-bold text-white">${emp.first_name} ${emp.last_name}</div>
                                <div class="text-xs text-slate-500">${emp.role}</div>
                            </div>
                        </div>
                        ${signedContractsMap[emp.id] ? 
                            '<span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Déjà signé</span>' : 
                            '<span class="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded">Pas de contrat</span>'}
                    </label>
                `).join('');

                Modal.show({
                    title: 'Renvoyer les contrats',
                    width: 'max-w-2xl',
                    message: `
                        <div class="space-y-4">
                            <p class="text-slate-300">Sélectionnez les employés qui devront <strong>resigner leur contrat</strong> à leur prochaine connexion.</p>
                            
                            <div class="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-700">
                                <span>${targets.length} employés éligibles</span>
                                <button type="button" id="select-all-reset" class="text-blue-400 hover:text-blue-300">Tout sélectionner</button>
                            </div>

                            <div class="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                ${checklistHtml}
                            </div>

                            <div class="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex gap-3 items-start">
                                <i data-lucide="info" class="w-5 h-5 text-blue-400 shrink-0 mt-0.5"></i>
                                <div>
                                    <p class="text-xs text-blue-300 font-bold uppercase mb-0.5">Note</p>
                                    <p class="text-xs text-blue-200/80">Cette action supprimera l'ancien contrat (s'il existe) et forcera l'affichage de la page de signature à la prochaine connexion.</p>
                                </div>
                            </div>
                        </div>
                    `,
                    confirmText: 'Envoyer les contrats',
                    type: 'info',
                    onConfirm: async () => {
                        const checkboxes = document.querySelectorAll('input[name="reset_target"]:checked');
                        const selectedIds = Array.from(checkboxes).map(cb => cb.value);
                        
                        if (selectedIds.length === 0) {
                            Toast.show("Aucun employé sélectionné", "warning");
                            return; // Keep modal open ideally, but Modal closes on confirm. User has to reopen.
                        }

                        try {
                            btnResetContracts.disabled = true;
                            btnResetContracts.innerHTML = `<span class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>`;
                            
                            // Delete existing contracts for selected users
                            // Assuming we have a delete endpoint or we loop.
                            // store.deleteEmploymentContract(empId) needs to be implemented or we use raw delete.
                            // Since we don't have deleteEmploymentContract in store yet, let's add it or use raw supabase if available in store context (it is not directly).
                            // We will add `resetEmploymentContract` to store.
                            
                            const promises = selectedIds.map(id => store.resetEmploymentContract(id));
                            await Promise.all(promises);
                            
                            // Update local state
                            selectedIds.forEach(id => {
                                if (signedContractsMap[id]) delete signedContractsMap[id];
                            });

                            Toast.show(`${selectedIds.length} contrats réinitialisés avec succès.`, "success");
                            
                            // Refresh grid
                            if (refreshBtn) refreshBtn.click();
                            else applyFilters(); // Fallback
                            
                        } catch (e) {
                            console.error(e);
                            Toast.show("Erreur lors de l'envoi des contrats", "error");
                        } finally {
                            btnResetContracts.disabled = false;
                            btnResetContracts.innerHTML = `<i data-lucide="file-signature" class="w-4 h-4"></i><span>Renvoyer les contrats</span>`;
                            if (window.lucide) lucide.createIcons();
                        }
                    }
                });

                // Attach "Select All" logic after modal renders
                setTimeout(() => {
                    const selectAllBtn = document.getElementById('select-all-reset');
                    if (selectAllBtn) {
                        selectAllBtn.addEventListener('click', () => {
                            const allCbs = document.querySelectorAll('input[name="reset_target"]');
                            const allChecked = Array.from(allCbs).every(cb => cb.checked);
                            allCbs.forEach(cb => cb.checked = !allChecked);
                            selectAllBtn.textContent = !allChecked ? 'Tout désélectionner' : 'Tout sélectionner';
                        });
                    }
                }, 100);
            });
        }

        const btnSyncActivity = document.getElementById('btn-sync-activity');
        if (btnSyncActivity) {
            btnSyncActivity.addEventListener('click', async () => {
                try {
                    btnSyncActivity.disabled = true;
                    const originalContent = btnSyncActivity.innerHTML;
                    btnSyncActivity.innerHTML = `<span class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>`;
                    
                    const count = await store.syncLastLoginWithActivity();
                    
                    Toast.show(`${count} fiches mises à jour avec la dernière activité.`, 'success');
                    
                    // Refresh grid
                    if (refreshBtn) refreshBtn.click();
                    else window.location.reload();
                    
                } catch (e) {
                    console.error(e);
                    Toast.show("Erreur lors de la synchronisation", "error");
                } finally {
                    btnSyncActivity.disabled = false;
                    btnSyncActivity.innerHTML = `<i data-lucide="activity" class="w-4 h-4"></i><span class="hidden md:inline">Sync. Activité</span>`;
                    if (window.lucide) lucide.createIcons();
                }
            });
        }

    }, 100);

    // Helper for weekly range (Saturday to next Saturday)
    const { start: startOfWeek, end: endOfWeek } = getWeekRange();
    
    // Mutable date range for filtering (init from Store or default to current week)
    let filterStart = new Date(startOfWeek);
    let filterEnd = new Date(endOfWeek);
    
    const storedDateFilter = store.getDateFilter();
    if (storedDateFilter) {
        filterStart = storedDateFilter.start;
        filterEnd = storedDateFilter.end;
    } else {
        store.setDateFilter(filterStart, filterEnd);
    }

    // Calculate Stats for each employee (FILTERED SCOPE)
    let sales = store.getSales(); 
    let timeEntries = store.getTimeEntries(); // Use getter to ensure array

    const getRev = (id) => sales
        .filter(s => {
            const d = new Date(s.date);
            if (filterStart && filterEnd) {
                return s.employeeId === id && d >= filterStart && d <= filterEnd;
            }
            return s.employeeId === id;
        })
        .reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);

    const getWeeklyHours = (empId) => {
        const weeklyMs = timeEntries
            .filter(t => {
                const d = new Date(t.clock_in);
                if (filterStart && filterEnd) {
                    return t.employee_id === empId && t.clock_out && d >= filterStart && d <= filterEnd;
                }
                return t.employee_id === empId && t.clock_out;
            })
            .reduce((acc, t) => {
                const pausedMs = Number(t.pause_total_ms || 0);
                const delta = Math.max(0, (new Date(t.clock_out) - new Date(t.clock_in)) - pausedMs);
                return acc + delta;
            }, 0);
        return weeklyMs / 3600000;
    };

    const getWarningsCount = (emp) => {
        const warnings = emp.warnings || [];
        return Array.isArray(warnings) ? warnings.length : 0;
    };

    const sortBy = (() => {
        try { return localStorage.getItem('emp_sort_by') || 'rev'; } catch (e) { return 'rev'; }
    })();
    const sortDir = (() => {
        try { return localStorage.getItem('emp_sort_dir') || 'desc'; } catch (e) { return 'desc'; }
    })();
    const dir = sortDir === 'asc' ? 1 : -1;

    let rolePrimes = { 'mecano_confirme': 20, 'mecano_junior': 20, 'chef_atelier': 20, 'patron': 60, 'co_patron': 60 };
    try {
        const s = localStorage.getItem('db_payroll_settings');
        if (s) {
            const obj = JSON.parse(s);
            if (obj && obj.role_primes && typeof obj.role_primes === 'object') {
                rolePrimes = obj.role_primes;
            } else if (obj && obj.grade_rates && typeof obj.grade_rates === 'object') {
                const looksHourly = Object.values(obj.grade_rates || {}).some(v => Number(v) > 100);
                if (!looksHourly) rolePrimes = obj.grade_rates;
            }
        }
    } catch (e) {}
    if (!rolePrimes || typeof rolePrimes !== 'object') {
        rolePrimes = { 'mecano_confirme': 20, 'mecano_junior': 20, 'chef_atelier': 20, 'patron': 60, 'co_patron': 60 };
    }
    try {
        const cached = localStorage.getItem('db_payroll_role_primes');
        if (cached) rolePrimes = JSON.parse(cached);
    } catch (e) {}
    try {
        const looksLikeOldHourlyRates = Object.values(rolePrimes || {}).some(v => Number(v) > 100);
        if (looksLikeOldHourlyRates) {
            rolePrimes = { 'mecano_confirme': 20, 'mecano_junior': 20, 'chef_atelier': 20, 'patron': 60, 'co_patron': 60 };
        }
    } catch (e) {}
    const getPrimePctForRole = (role) => {
        const effectiveRole = role === 'mecano' ? 'mecano_confirme' : role;
        const v = Number(rolePrimes && rolePrimes[effectiveRole]);
        if (isFinite(v) && v >= 0) return Math.max(0, Math.min(100, Math.round(v)));
        return 20;
    };

    const renderCard = (emp, currentTopIds) => {
        // Calculate stats
        const empSales = sales.filter(s => {
            const d = new Date(s.date);
            if (filterStart && filterEnd) {
                return s.employeeId === emp.id && d >= filterStart && d <= filterEnd;
            }
            return s.employeeId === emp.id;
        });
        // User requested "Chiffre d'Affaire" to be Total Margin
        const totalGenerated = empSales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);
        // Sync with Payroll: Commission is based on MARGIN (Price - Cost)
        const totalMargin = empSales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);
        
        const primePct = getPrimePctForRole(emp.role);
        const prime = totalMargin * (primePct / 100);

        // Presence status
        const activeEntry = timeEntries.find(t => t.employee_id === emp.id && !t.clock_out);
        const isActive = !!activeEntry;
        const isPaused = !!(activeEntry && activeEntry.paused);
        
        let statusBadge = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400"><span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Absent</span>`;
        
        if (isActive && isPaused) {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> En pause</span>`;
        } else if (isActive) {
            statusBadge = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> En service</span>`;
        }

        const weeklyHours = getWeeklyHours(emp.id);
        const warningsCount = getWarningsCount(emp);
        
        // Warning Text
        let warningLabel = '';
        if (warningsCount > 0) {
            warningLabel = `<span class="text-yellow-500 text-[10px] font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3"></i> ${warningsCount} Avertissement${warningsCount > 1 ? 's' : ''}</span>`;
        }

        // Badges
        const badges = [];
        if (currentTopIds.includes(emp.id)) {
            badges.push(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"><i data-lucide="trophy" class="w-3 h-3"></i> Top vendeur</span>`);
        }
        if (warningsCount === 0) {
            badges.push(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><i data-lucide="clock" class="w-3 h-3"></i> Ponctuel</span>`);
        }

        const contract = signedContractsMap[emp.id];
        if (contract) {
            badges.push(`<button type="button" class="js-view-contract inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors" data-id="${emp.id}" title="Cliquez pour voir le contrat"><i data-lucide="file-check" class="w-3 h-3"></i> Contrat OK</button>`);
        } else {
            badges.push(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20"><i data-lucide="file-warning" class="w-3 h-3"></i> Contrat manquant</span>`);
        }

        const lockMeta = emp.account_lock || null;
        const isLocked = store._isLockActive(lockMeta);
        const meta = isLocked ? store.formatLockMeta(lockMeta) : null;
        const preventSelfDelete = !!currentUserId && String(emp.id) === String(currentUserId);
        const preventPatronDelete = String(emp.role || '') === 'patron';
        
        let lockBannerHtml = '';
        if (isLocked) {
            lockBannerHtml = `
                <div class="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <i data-lucide="lock" class="w-3 h-3 text-red-400 mt-0.5 shrink-0"></i>
                    <div class="min-w-0">
                        <p class="text-[10px] font-bold text-red-400 uppercase">Bloqué</p>
                        ${meta && meta.reason ? `<p class="text-xs text-red-300 truncate">${meta.reason}</p>` : ''}
                        ${meta && meta.period ? `<p class="text-[10px] text-red-300/70 mt-0.5">${meta.period}</p>` : ''}
                    </div>
                </div>
            `;
        }
        const lockBanner = `<div class="js-lock-banner" data-id="${emp.id}">${lockBannerHtml}</div>`;

        return `
        <div class="employee-card group relative bg-slate-900/50 rounded-xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/20 animate-fade-in" 
            data-name="${emp.first_name} ${emp.last_name}" 
            data-id="${emp.id}" 
            data-role="${emp.role || ''}" 
            data-presence="${isActive ? (isPaused ? 'paused' : 'active') : 'absent'}" 
            data-inactive="0" 
            data-locked="${isLocked ? '1' : '0'}" 
            data-rev="${Number(totalGenerated) || 0}" 
            data-weekly="${Number(weeklyHours) || 0}" 
            data-warnings="${Number(warningsCount) || 0}" 
            data-created="${emp.created_at ? new Date(emp.created_at).getTime() : 0}">
            
            <!-- Top Actions -->
            <div class="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-auto md:pointer-events-none md:group-hover:pointer-events-auto">
                ${canViewHistory ? `
                <button onclick="window.location.hash = '#admin-sales?employee=${emp.id}'" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors" title="Voir l'historique">
                    <i data-lucide="history" class="w-3.5 h-3.5"></i>
                </button>
                ` : ''}
                ${canManageEmployees ? `
                <button type="button" class="js-lock-emp p-1.5 rounded-lg bg-slate-800 ${isLocked ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-white'} hover:bg-slate-700 border border-slate-700 transition-colors" data-id="${emp.id}" data-locked="${isLocked ? '1' : '0'}" title="${isLocked ? (meta ? meta.title : 'Compte bloqué') : 'Bloquer le compte'}" ${preventSelfUnlock && String(emp.id) === String(currentUserId) ? 'disabled' : ''}>
                    <i data-lucide="${isLocked ? 'lock' : 'unlock'}" class="w-3.5 h-3.5"></i>
                </button>
                ` : ''}

                ${(currentUser?.role === 'patron' || currentUser?.role === 'co_patron' || currentUser?.role === 'responsable') ? `
                <button type="button" class="js-reset-contract p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-orange-400 hover:bg-slate-700 border border-slate-700 transition-colors" data-id="${emp.id}" title="Supprimer et Renvoyer le contrat">
                    <i data-lucide="file-x" class="w-3.5 h-3.5"></i>
                </button>
                ` : ''}

                <button onclick="window.location.hash = '#employees/edit/${emp.id}'" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                </button>
            </div>

            <!-- User Info -->
            <div class="flex items-start gap-4 mb-4">
                <div class="relative w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-400 border border-slate-700 shrink-0">
                    ${emp.photo ? `<img src="${emp.photo}" class="w-full h-full object-cover rounded-xl" />` : `<i data-lucide="user" class="w-6 h-6"></i>`}
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="text-base font-bold text-white truncate leading-tight">
                            ${emp.first_name} ${emp.last_name}
                        </h3>
                        ${warningLabel}
                    </div>
                    <p class="text-xs text-slate-500 mb-1.5">
                        ${emp.role === 'patron' ? 'Patron' : emp.role === 'co_patron' ? 'Co-Patron' : emp.role === 'responsable' ? 'Responsable' : emp.role === 'chef_atelier' ? 'Chef d\'Atelier' : emp.role === 'mecano_confirme' ? 'Mécano Confirmé' : emp.role === 'mecano_junior' ? 'Mécano Junior' : emp.role === 'mecano_test' ? 'Mécano Test' : 'Employé'}
                    </p>
                    <div class="flex items-center gap-2 flex-wrap">
                        <div class="js-status">${statusBadge}</div>
                        <span class="text-[10px] text-slate-600 flex items-center gap-1">
                            <i data-lucide="calendar" class="w-3 h-3"></i>
                            Arrivé le ${emp.created_at ? new Date(emp.created_at).toLocaleDateString('fr-FR') : '--'}
                        </span>
                        ${(() => {
                            if (!emp.last_login) return `<span class="text-[10px] text-slate-500 flex items-center gap-1 italic"><i data-lucide="help-circle" class="w-3 h-3"></i> Jamais connecté</span>`;
                            const d = new Date(emp.last_login);
                            const now = new Date();
                            const diffDays = (now - d) / (1000 * 60 * 60 * 24);
                            let color = 'text-slate-500';
                            if (diffDays > 30) color = 'text-red-400 font-bold';
                            else if (diffDays > 7) color = 'text-orange-400';
                            return `<span class="text-[10px] ${color} flex items-center gap-1" title="Dernière connexion"><i data-lucide="log-in" class="w-3 h-3"></i> Vu le ${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>`;
                        })()}
                    </div>
                    ${badges.length > 0 ? `<div class="flex flex-wrap gap-1.5 mt-2">${badges.join('')}</div>` : ''}
                </div>
            </div>

            <!-- Blocked Banner -->
            ${lockBanner}

            <!-- Stats Footer -->
            <div class="mt-auto pt-4 border-t border-slate-800/50">
                <div>
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Total Généré (Période)</p>
                    <p class="text-xl font-bold text-white tracking-tight">${formatCurrency(totalGenerated)}</p>
                </div>
                <div class="mt-1">
                    <p class="text-xs font-medium text-orange-500/90 flex items-center gap-1.5">
                        <i data-lucide="flame" class="w-3 h-3"></i>
                        Prime (${primePct}%): <span class="text-orange-400">${formatCurrency(prime)}</span>
                    </p>
                </div>

            </div>
        </div>
        `;
    };

    const renderGridHtml = (currentEmployees) => {
        if (currentEmployees.length === 0) {
            return `
                <div class="col-span-full py-12 text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                        <i data-lucide="search-x" class="w-8 h-8 text-slate-600"></i>
                    </div>
                    <p class="text-slate-400 font-medium">Aucun employé trouvé</p>
                </div>
            `;
        }
        const currentTopIds = [...currentEmployees].sort((a, b) => getRev(b.id) - getRev(a.id)).slice(0, 3).map(e => e.id);
        return currentEmployees.map(emp => renderCard(emp, currentTopIds)).join('');
    };

    const sortedEmployees = [...employees].sort((a, b) => {
        if (sortBy === 'name') {
            const an = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
            const bn = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
            if (an < bn) return -1 * dir;
            if (an > bn) return 1 * dir;
            return 0;
        }
        if (sortBy === 'created') {
            const av = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bv = b.created_at ? new Date(b.created_at).getTime() : 0;
            return (av - bv) * dir;
        }
        if (sortBy === 'warnings') {
            return (getWarningsCount(a) - getWarningsCount(b)) * dir;
        }
        if (sortBy === 'weekly') {
            return (getWeeklyHours(a.id) - getWeeklyHours(b.id)) * dir;
        }
        return (getRev(a.id) - getRev(b.id)) * dir;
    });

    const topIds = [...employees].sort((a, b) => getRev(b.id) - getRev(a.id)).slice(0, 3).map(e => e.id);
    return `
        <div class="space-y-8 animate-fade-in">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 class="text-3xl font-bold text-white">Gestion des Employés</h2>
                    <p class="text-slate-400 mt-1">Gérez l'équipe et consultez les performances individuelles</p>
                </div>
                <div class="flex gap-3">
                    ${currentUser?.role === 'patron' ? `
                    <button id="btn-block-all" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95">
                        <i data-lucide="lock" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Tout Bloquer</span>
                    </button>
                    <button id="btn-unlock-all" class="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95">
                        <i data-lucide="unlock" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Tout Débloquer</span>
                    </button>
                    ` : ''}
                    ${canAddEmployees ? `
                    <button onclick="window.location.hash = '#employees/new'" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                        <i data-lucide="user-plus" class="w-4 h-4"></i>
                        <span>Ajouter un Employé</span>
                    </button>
                    ` : ''}
                    ${(currentUser?.role === 'patron' || currentUser?.role === 'co_patron' || currentUser?.role === 'responsable') ? `
                    <button id="btn-reset-contracts" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                        <i data-lucide="file-signature" class="w-4 h-4"></i>
                        <span>Renvoyer les contrats</span>
                    </button>
                    <button id="btn-sync-activity" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95" title="Synchroniser la dernière connexion avec la fin de service">
                        <i data-lucide="activity" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Sync. Activité</span>
                    </button>
                    ` : ''}
                </div>
            </div>

            <!-- Stats Dashboard -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Équipe</p>
                        <div class="p-1.5 bg-slate-800 text-slate-400 rounded-lg group-hover:text-white transition-colors">
                            <i data-lucide="users" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-white" id="emp-kpi-total">${employees.length}</h3>
                </div>
                
                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">En service</p>
                        <div class="p-1.5 bg-green-500/10 text-green-500 rounded-lg group-hover:bg-green-500/20 transition-colors">
                            <i data-lucide="play-circle" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-green-400" id="emp-kpi-active">0</h3>
                </div>

                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">En pause</p>
                        <div class="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                            <i data-lucide="pause-circle" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-yellow-400" id="emp-kpi-paused">0</h3>
                </div>

                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inactifs</p>
                        <div class="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-orange-400" id="emp-kpi-inactive">0</h3>
                </div>

                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bloqués</p>
                        <div class="p-1.5 bg-red-500/10 text-red-500 rounded-lg group-hover:bg-red-500/20 transition-colors">
                            <i data-lucide="lock" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-red-400" id="emp-kpi-locked">0</h3>
                </div>
            </div>

            <!-- Filters Bar -->
            <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-2 flex flex-col md:flex-row gap-2">
                <div class="relative flex-1">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"></i>
                    <input type="text" id="search-employee" autocomplete="off" placeholder="Rechercher un employé..." class="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                </div>
                
                <div class="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <input type="date" id="emp-filter-date-start" class="bg-transparent border-none text-white text-xs w-28 focus:ring-0 px-1" title="Date de début">
                    <span class="text-slate-500">-</span>
                    <input type="date" id="emp-filter-date-end" class="bg-transparent border-none text-white text-xs w-28 focus:ring-0 px-1" title="Date de fin">
                </div>

                <input type="hidden" id="emp-filter-status" value="all">
                <div class="flex bg-slate-800 rounded-lg p-1 border border-slate-700 overflow-x-auto" id="emp-status-tabs">
                    <button type="button" data-val="all" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">Tous</button>
                    <button type="button" data-val="active" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">En service</button>
                    <button type="button" data-val="paused" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">En pause</button>
                    <button type="button" data-val="absent" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">Absent</button>
                </div>

                <select id="emp-filter-role" class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-blue-500">
                    <option value="all">Tous rôles</option>
                    <option value="patron">Patron</option>
                    <option value="co_patron">Co-Patron</option>
                    <option value="responsable">Responsable</option>
                    <option value="chef_atelier">Chef d'Atelier</option>
                    <option value="mecano_confirme">Mécano Confirmé</option>
                    <option value="mecano_junior">Mécano Junior</option>
                    <option value="mecano_test">Mécano Test</option>
                </select>

                <select id="emp-filter-flag" class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-blue-500">
                    <option value="all">Tous</option>
                    <option value="inactive">Inactifs</option>
                    <option value="locked">Bloqués</option>
                    <option value="warnings">Avertissements</option>
                </select>

                <div class="h-8 w-px bg-slate-700 mx-1 self-center hidden md:block"></div>

                <div class="flex gap-2">
                    <select id="emp-sort-by" class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-blue-500">
                        <option value="rev">Tri: CA</option>
                        <option value="name">Tri: Nom</option>
                        <option value="weekly">Tri: Heures</option>
                        <option value="warnings">Tri: Avertissements</option>
                        <option value="created">Tri: Ancienneté</option>
                    </select>
                    <button id="emp-sort-dir" type="button" class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors">Desc</button>
                    <button id="emp-refresh-btn" type="button" class="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Actualiser la liste">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                    </button>
                    <button id="emp-filters-reset" type="button" class="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Réinitialiser les filtres">
                        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <!-- Grid Cards -->
            <div id="employees-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${sortedEmployees.length === 0 ? `
                    <div class="col-span-full py-12 text-center">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                            <i data-lucide="search-x" class="w-8 h-8 text-slate-600"></i>
                        </div>
                        <p class="text-slate-400 font-medium">Aucun employé trouvé</p>
                    </div>
                ` : sortedEmployees.map(emp => {
                    // Calculate stats
                    const empSales = sales.filter(s => {
                        const d = new Date(s.date);
                        return s.employeeId === emp.id && d >= filterStart && d <= filterEnd;
                    });
                    // User requested "Chiffre d'Affaire" to be Total Margin
                    const totalGenerated = empSales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);
                    // Sync with Payroll: Commission is based on MARGIN (Price - Cost)
                    const totalMargin = empSales.reduce((sum, s) => sum + (Number(s.price) - Number(s.cost || 0)), 0);

                    const primePct = getPrimePctForRole(emp.role);
                    const prime = totalMargin * (primePct / 100);

                    // Presence status
                    const activeEntry = timeEntries.find(t => t.employee_id === emp.id && !t.clock_out);
                    const isActive = !!activeEntry;
                    const isPaused = !!(activeEntry && activeEntry.paused);
                    
                    let statusBadge = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400"><span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Absent</span>`;
                    
                    if (isActive && isPaused) {
                        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> En pause</span>`;
                    } else if (isActive) {
                        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> En service</span>`;
                    }

                    const weeklyHours = getWeeklyHours(emp.id);
                    const warningsCount = getWarningsCount(emp);
                    
                    // Warning Text
                    let warningLabel = '';
                    if (warningsCount > 0) {
                        warningLabel = `<span class="text-yellow-500 text-[10px] font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3"></i> ${warningsCount} Avertissement${warningsCount > 1 ? 's' : ''}</span>`;
                    }

                    // Badges
                    const badges = [];
                    if (topIds.includes(emp.id)) {
                        badges.push(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"><i data-lucide="trophy" class="w-3 h-3"></i> Top vendeur</span>`);
                    }
                    if (warningsCount === 0) {
                        badges.push(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><i data-lucide="clock" class="w-3 h-3"></i> Ponctuel</span>`);
                    }

                    const lockMeta = emp.account_lock || null;
                    const isLocked = store._isLockActive(lockMeta);
                    const meta = isLocked ? store.formatLockMeta(lockMeta) : null;
                    let lockBanner = '';
                    if (isLocked) {
                        lockBanner = `
                            <div class="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                                <i data-lucide="lock" class="w-3 h-3 text-red-400 mt-0.5 shrink-0"></i>
                                <div class="min-w-0">
                                    <p class="text-[10px] font-bold text-red-400 uppercase">Bloqué</p>
                                    ${meta && meta.reason ? `<p class="text-xs text-red-300 truncate">${meta.reason}</p>` : ''}
                                    ${meta && meta.period ? `<p class="text-[10px] text-red-300/70 mt-0.5">${meta.period}</p>` : ''}
                                </div>
                            </div>
                        `;
                    }

                    return `
                    <div class="employee-card group relative bg-slate-900/50 rounded-xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/20" 
                        data-name="${emp.first_name} ${emp.last_name}" 
                        data-id="${emp.id}" 
                        data-role="${emp.role || ''}" 
                        data-presence="${isActive ? (isPaused ? 'paused' : 'active') : 'absent'}" 
                        data-inactive="0" 
                        data-locked="${isLocked ? '1' : '0'}" 
                        data-rev="${Number(totalGenerated) || 0}" 
                        data-weekly="${Number(weeklyHours) || 0}" 
                        data-warnings="${Number(warningsCount) || 0}" 
                        data-created="${emp.created_at ? new Date(emp.created_at).getTime() : 0}">
                        
                        <!-- Top Actions -->
                        <div class="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                            ${canViewHistory ? `
                            <button onclick="window.location.hash = '#admin-sales?employee=${emp.id}'" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors" title="Voir l'historique">
                                <i data-lucide="history" class="w-3.5 h-3.5"></i>
                            </button>
                            ` : ''}
                            ${canManageEmployees ? `
                            <button type="button" class="js-lock-emp p-1.5 rounded-lg bg-slate-800 ${isLocked ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-white'} hover:bg-slate-700 border border-slate-700 transition-colors" data-id="${emp.id}" data-locked="${isLocked ? '1' : '0'}" title="${isLocked ? (meta ? meta.title : 'Compte bloqué') : 'Bloquer le compte'}" ${preventSelfUnlock && String(emp.id) === String(currentUserId) ? 'disabled' : ''}>
                                <i data-lucide="${isLocked ? 'lock' : 'unlock'}" class="w-3.5 h-3.5"></i>
                            </button>
                            ` : ''}
                            <button onclick="window.location.hash = '#employees/edit/${emp.id}'" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors">
                                <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>

                        <!-- User Info -->
                        <div class="flex items-start gap-4 mb-4">
                            <div class="relative w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-400 border border-slate-700 shrink-0">
                                ${emp.photo ? `<img src="${emp.photo}" class="w-full h-full object-cover rounded-xl" />` : `<i data-lucide="user" class="w-6 h-6"></i>`}
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <h3 class="text-base font-bold text-white truncate leading-tight">
                                        ${emp.first_name} ${emp.last_name}
                                    </h3>
                                    ${warningLabel}
                                </div>
                                <p class="text-xs text-slate-500 mb-1.5">
                                    ${emp.role === 'patron' ? 'Patron' : emp.role === 'co_patron' ? 'Co-Patron' : emp.role === 'responsable' ? 'Responsable' : emp.role === 'chef_atelier' ? 'Chef d\'Atelier' : emp.role === 'mecano_confirme' ? 'Mécano Confirmé' : emp.role === 'mecano_junior' ? 'Mécano Junior' : emp.role === 'mecano_test' ? 'Mécano Test' : 'Employé'}
                                </p>
                                <div class="flex items-center gap-2 flex-wrap">
                                    <div class="js-status">${statusBadge}</div>
                                    <span class="text-[10px] text-slate-600 flex items-center gap-1">
                                        <i data-lucide="calendar" class="w-3 h-3"></i>
                                        Arrivé le ${emp.created_at ? new Date(emp.created_at).toLocaleDateString('fr-FR') : '--'}
                                    </span>
                                    ${(() => {
                                        if (!emp.last_login) return `<span class="text-[10px] text-slate-500 flex items-center gap-1 italic"><i data-lucide="help-circle" class="w-3 h-3"></i> Jamais connecté</span>`;
                                        const d = new Date(emp.last_login);
                                        const now = new Date();
                                        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
                                        let color = 'text-slate-500';
                                        if (diffDays > 30) color = 'text-red-400 font-bold';
                                        else if (diffDays > 7) color = 'text-orange-400';
                                        return `<span class="text-[10px] ${color} flex items-center gap-1" title="Dernière connexion"><i data-lucide="log-in" class="w-3 h-3"></i> Vu le ${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>`;
                                    })()}
                                </div>
                                ${badges.length > 0 ? `<div class="flex flex-wrap gap-1.5 mt-2">${badges.join('')}</div>` : ''}
                            </div>
                        </div>

                        <!-- Blocked Banner -->
                        ${lockBanner}

                        <!-- Stats Footer -->
                        <div class="mt-auto pt-4 border-t border-slate-800/50">
                            <div>
                                <p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Total Généré (Période)</p>
                                <p class="text-xl font-bold text-white tracking-tight">${formatCurrency(totalGenerated)}</p>
                            </div>
                            <div class="mt-1">
                                <p class="text-xs font-medium text-orange-500/90 flex items-center gap-1.5">
                                    <i data-lucide="flame" class="w-3 h-3"></i>
                                    Prime (${primePct}%): <span class="text-orange-400">${formatCurrency(prime)}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        </div>
    `;
}

export function EmployeeForm(employee) {
    const isEdit = !!employee;
    const data = isEdit ? employee : {
        first_name: '',
        last_name: '',
        phone: '',
        role: 'mecano_confirme',
        username: '',
        password: '',
        discord_id: ''
    };

    // Warnings data
    const warnings = data.warnings || [];
    const currentUser = store.getCurrentUser();
    const canManageWarnings = currentUser && store.hasPermissionSync(currentUser, 'employees.warnings');
    const isPatron = store.hasPermissionSync(currentUser, 'employees.delete');
    
    setTimeout(async () => {
        // Current password toggle logic
        const currentPassDisplay = document.getElementById('current-password-display');
        const toggleCurrentPass = document.getElementById('toggle-current-password');
        
        if (currentPassDisplay && toggleCurrentPass) {
            const realPass = currentPassDisplay.dataset.password;
            let visible = false;
            
            const toggle = () => {
                visible = !visible;
                currentPassDisplay.textContent = visible ? realPass : '••••••••';
            };
            
            currentPassDisplay.addEventListener('click', toggle);
            toggleCurrentPass.addEventListener('click', toggle);
        }

        const form = document.getElementById('employee-form');
        if(form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const empData = Object.fromEntries(formData.entries());
                let id = empData.id;
                if (!id && isEdit) {
                    Toast.show("Erreur: identifiant employé manquant.", 'error');
                    return;
                }
                if (!id) id = generateId();
                empData.id = id;

                try {
                // Guard by permission: add vs manage
                try {
                    if (isEdit) {
                        await store.ensurePermission(store.getCurrentUser(), 'employees.manage', "Accès refusé.");
                    } else {
                        await store.ensurePermission(store.getCurrentUser(), 'employees.add', "Accès refusé.");
                    }
                } catch (permErr) {
                    Toast.show("Accès refusé.", 'error');
                    return;
                }
                // If editing, check if role changed to clear payroll override
                // Need to fetch original BEFORE saving
                if (id) {
                    const originalEmp = await store.getEmployeeById(id);
                    if (originalEmp && originalEmp.role !== empData.role) {
                        store.savePayrollRate(id, null); // Clear override
                    }
                }

                await store.saveEmployee({
                    id,
                    firstName: empData.firstName,
                    lastName: empData.lastName,
                    phone: empData.phone,
                    role: empData.role,
                    username: empData.username,
                    password: empData.password,
                    discordId: empData.discordId,
                    photo: null
                });

                // Save Permissions
                try {
                    const catalog = store.getPermissionCatalog();
                    const newPerms = {};
                    catalog.forEach(p => {
                        const cb = document.getElementById(`perm_${p.key}`);
                        if (cb) newPerms[p.key] = cb.checked;
                    });

                    await store.saveEmployeePermissions(id, newPerms);
                } catch (e) {
                    console.error("Error saving permissions:", e);
                    Toast.show("Erreur lors de la sauvegarde des permissions", 'warning');
                }

                Toast.show(isEdit ? 'Employé modifié avec succès !' : 'Employé créé avec succès !', 'success');
                window.location.hash = '#employees';
            } catch (err) {
                let msg = (err && err.message) ? err.message : String(err);
                const code = err && err.code ? String(err.code) : '';
                const details = err && err.details ? String(err.details) : '';

                const looksLikeRoleConstraint =
                    code === '23514'
                    || /employees_role_valid/i.test(msg)
                    || /violates check constraint/i.test(msg)
                    || /role/i.test(details);

                const looksLikeUniqueConstraint =
                    code === '23505'
                    || /duplicate key value/i.test(msg)
                    || /unique constraint/i.test(msg);

                if (looksLikeUniqueConstraint) {
                    msg = "Ce nom d'utilisateur est déjà pris.";
                } else if (details && !/\[object Object\]/.test(details)) {
                    msg = details;
                }
                
                Toast.show('Erreur: ' + msg, 'error');
            }
            });
        }

        if (isEdit && data && data.id) {
            try {
                const profile = await store.fetchEmployeeProfile(data.id);
                if (profile) {
                    const box = document.getElementById('recruitment-profile');
                    const content = document.getElementById('recruitment-profile-content');
                    if (box && content) {
                        const safe = (v) => (v == null ? '' : String(v));
                        const lines = [
                            profile.age != null ? `<div class="text-sm text-white"><span class="text-slate-400">Âge:</span> ${safe(profile.age)} ans</div>` : '',
                            profile.discord_handle ? `<div class="text-sm text-white"><span class="text-slate-400">Discord:</span> ${safe(profile.discord_handle)}</div>` : '',
                            profile.unique_id ? `<div class="text-sm text-white"><span class="text-slate-400">ID Unique (PMA):</span> ${safe(profile.unique_id)}</div>` : '',
                            profile.phone_ig ? `<div class="text-sm text-white"><span class="text-slate-400">Tél IG (Candidature):</span> ${safe(profile.phone_ig)}</div>` : '',
                            profile.availability ? `<div class="mt-3"><div class="text-xs text-slate-500 uppercase font-bold mb-1">Disponibilités</div><div class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${safe(profile.availability)}</div></div>` : '',
                            profile.experience ? `<div class="mt-3"><div class="text-xs text-slate-500 uppercase font-bold mb-1">Expérience</div><div class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${safe(profile.experience)}</div></div>` : '',
                            profile.motivation ? `<div class="mt-3"><div class="text-xs text-slate-500 uppercase font-bold mb-1">Motivation</div><div class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${safe(profile.motivation)}</div></div>` : ''
                        ].filter(Boolean).join('');
                        content.innerHTML = lines || `<div class="text-sm text-slate-500 italic">Aucune information de candidature.</div>`;
                        box.classList.remove('hidden');
                        if (window.lucide) lucide.createIcons();
                    }
                }
            } catch (e) {}
        }

        const pwdInput = document.getElementById('employee-password');
        const toggleBtn = document.getElementById('btn-toggle-employee-password');
        if (toggleBtn && pwdInput) {
            toggleBtn.addEventListener('click', () => {
                const newType = pwdInput.type === 'password' ? 'text' : 'password';
                pwdInput.type = newType;
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', newType === 'password' ? 'eye' : 'eye-off');
                    if (window.lucide) lucide.createIcons();
                }
            });
        }

        
        
        
        // Warning handlers
        if (canManageWarnings && isEdit) {
            const addWarningBtn = document.getElementById('add-warning-btn');
            const warningInput = document.getElementById('warning-reason');
            const warningsList = document.getElementById('warnings-list');
            const warningsCountEl = document.getElementById('warnings-count');
            const warningCounter = document.getElementById('warning-counter');
            const searchInput = document.getElementById('warnings-search');

            const refreshCount = () => {
                if (!warningsCountEl || !warningsList) return;
                const count = warningsList.querySelectorAll('.js-warning-item').length;
                warningsCountEl.textContent = `${count} ${count === 1 ? 'avertissement' : 'avertissements'}`;
                warningsCountEl.className = `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${count >= 3 ? 'bg-red-500/10 text-red-400 border-red-500/20' : count === 2 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : count === 1 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`;
            };

            const refreshNumbers = () => {
                if (!warningsList) return;
                warningsList.querySelectorAll('.js-warning-item').forEach((el, idx) => {
                    const n = idx + 1;
                    const side = n >= 3 ? 'border-red-500/40' : n === 2 ? 'border-orange-500/40' : 'border-yellow-500/40';
                    const pill = n >= 3 ? 'bg-red-500/10 text-red-300 border-red-500/20' : n === 2 ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
                    el.classList.remove('border-red-500/40', 'border-orange-500/40', 'border-yellow-500/40');
                    el.classList.add(side);
                    const badge = el.querySelector('.js-warning-num');
                    if (badge) {
                        badge.textContent = `#${n}`;
                        badge.className = `js-warning-num inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${pill}`;
                    }
                });
            };

            const updateAddState = () => {
                if (!warningInput || !addWarningBtn || !warningCounter) return;
                const reason = String(warningInput.value || '');
                const len = reason.trim().length;
                warningCounter.textContent = `${Math.min(reason.length, 220)}/220`;
                addWarningBtn.disabled = len < 3;
            };

            const attachDeleteHandler = (btn) => {
                 btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    Modal.show({
                        title: 'Supprimer l\'avertissement',
                        message: 'Êtes-vous sûr de vouloir supprimer cet avertissement ?',
                        type: 'danger',
                        confirmText: 'Supprimer',
                        onConfirm: async () => {
                            try {
                                await store.deleteWarning(data.id, id);
                                const el = document.getElementById(`warning-${id}`);
                                if (el) el.remove();
                                
                                if (warningsList && (!warningsList.children.length || (warningsList.children.length === 1 && warningsList.querySelector('#no-warnings-msg')))) {
                                     // Check if really empty
                                     if (!warningsList.querySelector('#no-warnings-msg') && warningsList.children.length === 0) {
                                         warningsList.innerHTML = '<p id="no-warnings-msg" class="text-sm text-slate-500 italic">Aucun avertissement.</p>';
                                     }
                                }
                                Toast.show('Avertissement supprimé');
                                refreshCount();
                                refreshNumbers();
                            } catch (e) {
                                console.error(e);
                                Toast.show('Erreur lors de la suppression', 'error');
                            }
                        }
                    });
                });
            };
            
            if (addWarningBtn && warningInput) {
                updateAddState();
                warningInput.addEventListener('input', updateAddState);
                warningInput.addEventListener('keydown', (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        addWarningBtn.click();
                    }
                });

                document.querySelectorAll('.js-warning-template').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const text = btn.getAttribute('data-text') || '';
                        if (!text) return;
                        const current = String(warningInput.value || '').trim();
                        warningInput.value = current ? `${current} – ${text}` : text;
                        updateAddState();
                        warningInput.focus();
                    });
                });

                addWarningBtn.addEventListener('click', async () => {
                    const reason = warningInput.value.trim();
                    if (reason.length < 3) {
                        Toast.show('Motif trop court (min 3 caractères)', 'error');
                        return;
                    }
                    
                    try {
                        addWarningBtn.disabled = true;
                        const newWarning = await store.addWarning(data.id, {
                            reason: reason,
                            author: `${currentUser.firstName} ${currentUser.lastName}`
                        });
                        
                        // Remove empty msg
                        const emptyMsg = document.getElementById('no-warnings-msg');
                        if (emptyMsg) emptyMsg.remove();

                        // Create HTML
                        const div = document.createElement('div');
                        div.id = `warning-${newWarning.id}`;
                        div.className = 'js-warning-item bg-slate-900/50 rounded-xl p-4 border border-yellow-500/40 flex justify-between items-start gap-4 animate-fade-in';
                        div.setAttribute('data-text', `${String(newWarning.reason || '').toLowerCase()} ${String(newWarning.author || '').toLowerCase()}`);
                        div.innerHTML = `
                            <div class="min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="js-warning-num inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-yellow-500/10 text-yellow-300 border-yellow-500/20">#1</span>
                                    <span class="text-sm text-white font-semibold break-words">${newWarning.reason}</span>
                                </div>
                                <div class="text-xs text-slate-400">
                                    <span class="text-slate-500">Par</span> <span class="font-medium text-slate-300">${newWarning.author}</span>
                                    <span class="text-slate-600">•</span>
                                    <span class="font-mono">${new Date(newWarning.date).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <button type="button" data-id="${newWarning.id}" class="delete-warning-btn p-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        `;
                        
                        warningsList.prepend(div);
                        if (window.lucide) lucide.createIcons();
                        
                        // Attach handler
                        const newBtn = div.querySelector('.delete-warning-btn');
                        attachDeleteHandler(newBtn);

                        warningInput.value = '';
                        updateAddState();
                        refreshCount();
                        refreshNumbers();
                        Toast.show('Avertissement ajouté');
                    } catch (e) {
                        console.error(e);
                        Toast.show('Erreur lors de l\'ajout de l\'avertissement', 'error');
                    } finally {
                        updateAddState();
                    }
                });
            }

            if (searchInput && warningsList) {
                searchInput.addEventListener('input', () => {
                    const q = String(searchInput.value || '').trim().toLowerCase();
                    warningsList.querySelectorAll('.js-warning-item').forEach(el => {
                        const hay = el.getAttribute('data-text') || '';
                        el.classList.toggle('hidden', q && !hay.includes(q));
                    });
                });
            }
            
            // Attach to existing
            document.querySelectorAll('.delete-warning-btn').forEach(attachDeleteHandler);
            refreshCount();
            refreshNumbers();
        }

        if (isEdit) {
            const fireBtn = document.getElementById('fire-employee-btn');
            const fireReasonInput = document.getElementById('fire-reason-input');
            if (fireBtn) {
                fireBtn.addEventListener('click', () => {
                    Modal.show({
                        title: "Virer l'employé",
                        message: "Êtes-vous sûr de vouloir virer cet employé ? Toutes ses interventions et pointages seront supprimés.",
                        type: 'danger',
                        confirmText: 'Virer',
                        onConfirm: async () => {
                            try {
                                const reason = fireReasonInput ? fireReasonInput.value.trim() : '';
                                await store.fireEmployee(data.id, reason);
                                Toast.show("Employé viré et compta supprimée");
                                window.location.hash = '#employees';
                            } catch (e) {
                                console.error(e);
                                Toast.show("Erreur lors du licenciement", 'error');
                            }
                        }
                    });
                });
            }

            if (isPatron) {
                const deleteBtn = document.getElementById('delete-employee-btn-form');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        // Prevent self-delete
                        if (currentUser && String(currentUser.id) === String(data.id)) {
                            Toast.show("Impossible de supprimer ta propre fiche.", 'error');
                            return;
                        }
                        
                        Modal.show({
                            title: 'Supprimer définitivement ?',
                            message: `
                                <div class="space-y-2">
                                    <p class="text-slate-300">Tu es sur le point de supprimer définitivement la fiche de <span class="font-bold text-white">${data.first_name} ${data.last_name}</span>.</p>
                                    <p class="text-xs text-red-400 font-bold uppercase"><i data-lucide="alert-triangle" class="w-3 h-3 inline mr-1"></i> Irréversible</p>
                                </div>
                            `,
                            type: 'danger',
                            confirmText: 'Supprimer',
                            onConfirm: async () => {
                                try {
                                    await store.deleteEmployee(data.id);
                                    Toast.show("Fiche employée supprimée.", 'success');
                                    window.location.hash = '#employees';
                                } catch (e) {
                                    console.error(e);
                                    Toast.show("Erreur : " + e.message, 'error');
                                }
                            }
                        });
                    });
                }
            }
        }

        // Permission Editor Logic
        const permContainer = document.getElementById('permissions-container');
        const togglePermsBtn = document.getElementById('toggle-permissions-btn');
        const permsPanel = document.getElementById('permissions-panel');
        
        if (togglePermsBtn && permsPanel) {
            togglePermsBtn.addEventListener('click', () => {
                permsPanel.classList.toggle('hidden');
            });
        }

        if (permContainer) {
            const catalog = store.getPermissionCatalog();
            const roleSelect = document.querySelector('select[name="role"]');
            
            let currentOverrides = {};

            const renderPerms = () => {
                if (!roleSelect) return;
                const selectedRole = roleSelect.value;
                const defaults = store.getRoleDefaultPermissions(selectedRole);
                
                permContainer.innerHTML = catalog.map(p => {
                    const isDefault = !!defaults[p.key];
                    let isChecked = isDefault;
                    let isOverridden = false;
                    
                    if (currentOverrides && Object.prototype.hasOwnProperty.call(currentOverrides, p.key)) {
                        isChecked = !!currentOverrides[p.key];
                        isOverridden = isChecked !== isDefault;
                    }
                    
                    return `
                        <div class="bg-slate-800/50 rounded-lg p-3 border ${isOverridden ? 'border-purple-500/30 bg-purple-500/5' : 'border-slate-700'} flex items-start gap-3 transition-colors hover:border-slate-600">
                            <div class="pt-0.5">
                                <input type="checkbox" name="perm_${p.key}" id="perm_${p.key}" ${isChecked ? 'checked' : ''} class="rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500 w-4 h-4 cursor-pointer">
                            </div>
                            <div class="flex-1">
                                <label for="perm_${p.key}" class="block text-sm font-medium text-white cursor-pointer select-none flex items-center gap-2">
                                    ${p.label || p.key}
                                    ${isOverridden ? '<span class="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">Modifié</span>' : ''}
                                </label>
                                <p class="text-xs text-slate-400 mt-0.5 leading-relaxed">${p.description || ''}</p>
                                ${isDefault && !isOverridden ? '<span class="text-[10px] text-slate-500 mt-1 block flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Inclus dans le rôle</span>' : ''}
                                ${!isDefault && !isOverridden ? '<span class="text-[10px] text-slate-600 mt-1 block">Non inclus par défaut</span>' : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                
                if (window.lucide) lucide.createIcons();
            };

            if (roleSelect) {
                roleSelect.addEventListener('change', renderPerms);
            }
            renderPerms();

            // Async fetch
            if (isEdit && data.id) {
                store.fetchEmployeePermissions(data.id).then(perms => {
                    currentOverrides = perms || {};
                    renderPerms();
                }).catch(e => console.error(e));
            }
        }
    }, 100);

    return `
        <div class="max-w-3xl mx-auto animate-fade-in">
            <div class="mb-6 flex items-center gap-4">
                <a href="#employees" class="text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="arrow-left" class="w-6 h-6"></i>
                </a>
                <h2 class="text-2xl font-bold text-white">${isEdit ? 'Modifier l\'employé' : 'Ajouter un employé'}</h2>
            </div>

            <div class="bg-slate-900/70 glass rounded-2xl shadow-lg border border-slate-700 p-7 md:p-8">
                <div class="h-1 w-full rounded-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc] mb-7"></div>
                <form id="employee-form" class="space-y-6">
                    ${isEdit ? `<input type="hidden" name="id" value="${data.id}">` : ''}
                    
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Prénom</label>
                            <input type="text" name="firstName" value="${data.first_name || data.firstName || ''}" required autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Nom</label>
                            <input type="text" name="lastName" value="${data.last_name || data.lastName || ''}" required autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Téléphone</label>
                            <input type="tel" name="phone" value="${data.phone || ''}" autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">ID Unique (PMA)</label>
                            <div class="relative">
                                <input type="text" name="unique_id" value="${data.unique_id || ''}" placeholder="Ex: 12345" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 font-mono">
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">Rôle</label>
                        <select name="role" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                            <option value="patron" ${data.role === 'patron' ? 'selected' : ''}>Patron</option>
                            <option value="co_patron" ${data.role === 'co_patron' ? 'selected' : ''}>Co-Patron</option>
                            <option value="responsable" ${data.role === 'responsable' ? 'selected' : ''}>Responsable</option>
                            <option value="chef_atelier" ${data.role === 'chef_atelier' ? 'selected' : ''}>Chef d'Atelier</option>
                            <option value="mecano_confirme" ${data.role === 'mecano_confirme' ? 'selected' : ''}>Mécano Confirmé</option>
                            <option value="mecano_junior" ${data.role === 'mecano_junior' ? 'selected' : ''}>Mécano Junior</option>
                            <option value="mecano_test" ${data.role === 'mecano_test' ? 'selected' : ''}>Mécano Test</option>
                        </select>
                        <div class="mt-2 flex justify-end">
                            <button type="button" id="toggle-permissions-btn" class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                <i data-lucide="shield" class="w-3 h-3"></i>
                                Gérer les permissions spéciales
                            </button>
                        </div>
                        
                        <div id="permissions-panel" class="hidden mt-4 bg-slate-900/40 rounded-xl p-4 border border-slate-700/50 animate-fade-in">
                             <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-700/50">
                                <i data-lucide="lock" class="w-4 h-4 text-purple-400"></i>
                                <h4 class="text-sm font-bold text-white">Permissions spéciales</h4>
                                <span class="text-[10px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">Surcharge le rôle</span>
                             </div>
                             <div id="permissions-container" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div class="col-span-full text-center py-4">
                                    <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-slate-500 border-t-transparent"></div>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div class="border-t border-slate-700/70 pt-6 mt-6">
                        <h3 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <i data-lucide="key-round" class="w-4 h-4 text-blue-400"></i>
                            Identifiants de connexion
                        </h3>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-1">Nom d'utilisateur</label>
                                <input type="text" name="username" value="${data.username}" required autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
                                <div class="relative">
                                    <input type="password" id="employee-password" name="password" value="" ${isEdit ? '' : 'required'} autocomplete="off" placeholder="${isEdit ? 'Laisser vide pour conserver' : ''}" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 pr-12">
                                    <button type="button" id="btn-toggle-employee-password" class="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-200 focus:outline-none">
                                        <i data-lucide="eye" class="h-5 w-5"></i>
                                    </button>
                                </div>
                                ${isEdit && data.password ? `
                                <div class="mt-2 text-xs text-slate-400 flex items-center gap-2">
                                    <span>Mot de passe actuel :</span>
                                    <span id="current-password-display" data-password="${data.password.replace(/"/g, '&quot;')}" class="font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700 cursor-pointer hover:text-white transition-colors">••••••••</span>
                                    <i data-lucide="eye" class="w-3 h-3 cursor-pointer hover:text-white" id="toggle-current-password"></i>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-slate-300 mb-1">ID Discord</label>
                            <input type="text" name="discordId" value="${data.discord_id || ''}" autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3" placeholder="Ex: 123456789012345678">
                        </div>
                    </div>

                    <div id="recruitment-profile" class="hidden border-t border-slate-700/70 pt-6 mt-6">
                        <h3 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <i data-lucide="file-text" class="w-4 h-4 text-purple-400"></i>
                            Informations de candidature
                        </h3>
                        <div id="recruitment-profile-content" class="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4"></div>
                    </div>
                    
                    

                    ${canManageWarnings && isEdit ? `
                    <div class="border-t border-slate-700 pt-6 mt-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-sm font-medium text-red-400 flex items-center gap-2">
                            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                            Avertissements & Sanctions
                            </h3>
                            <span id="warnings-count" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${warnings.length >= 3 ? 'bg-red-500/10 text-red-400 border-red-500/20' : warnings.length === 2 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : warnings.length === 1 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}">
                                ${warnings.length} ${warnings.length === 1 ? 'avertissement' : 'avertissements'}
                            </span>
                        </div>
                        
                        <!-- Add Warning -->
                        <div class="bg-slate-900/40 border border-slate-700 rounded-xl p-4 mb-6">
                            <div class="flex items-start gap-3">
                                <div class="mt-0.5 p-2 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20">
                                    <i data-lucide="file-warning" class="w-4 h-4"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Motif</label>
                                    <textarea id="warning-reason" rows="2" maxlength="220" placeholder="Ex: Retard répété, comportement inadapté, non-respect des consignes..." class="w-full rounded-lg border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500 sm:text-sm p-2.5 resize-none"></textarea>
                                    <div class="mt-2 flex items-center justify-between gap-3">
                                        <div class="flex flex-wrap gap-2">
                                            ${[
                                                'Retard répété',
                                                'Absence non justifiée',
                                                'Non-respect des consignes',
                                                'Manque de professionnalisme',
                                                'Comportement inadapté'
                                            ].map(t => `
                                                <button type="button" class="js-warning-template px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs" data-text="${t}">${t}</button>
                                            `).join('')}
                                        </div>
                                        <div class="flex items-center gap-3 flex-shrink-0">
                                            <span id="warning-counter" class="text-xs text-slate-400 font-mono">0/220</span>
                                            <button type="button" id="add-warning-btn" class="px-4 py-2 rounded-lg font-bold text-sm bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                                                Ajouter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- List Warnings -->
                        <div class="flex items-center justify-between mb-3">
                            <div class="text-xs text-slate-500">Historique</div>
                            <input id="warnings-search" type="text" placeholder="Rechercher..." class="w-48 rounded-lg border-slate-700 bg-slate-900 text-slate-200 placeholder-slate-500 text-xs p-2">
                        </div>
                        <div id="warnings-list" class="space-y-3">
                            ${warnings.length === 0 ? '<p id="no-warnings-msg" class="text-sm text-slate-500 italic">Aucun avertissement.</p>' : ''}
                            ${warnings
                                .slice()
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map((w, idx) => {
                                    const n = idx + 1;
                                    const side = n >= 3 ? 'border-red-500/40' : n === 2 ? 'border-orange-500/40' : 'border-yellow-500/40';
                                    const pill = n >= 3 ? 'bg-red-500/10 text-red-300 border-red-500/20' : n === 2 ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
                                    return `
                                    <div id="warning-${w.id}" class="js-warning-item bg-slate-900/50 rounded-xl p-4 border ${side} flex justify-between items-start gap-4" data-text="${String(w.reason || '').toLowerCase().replace(/"/g, '&quot;')} ${String(w.author || '').toLowerCase().replace(/"/g, '&quot;')}">
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="js-warning-num inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${pill}">#${n}</span>
                                                <span class="text-sm text-white font-semibold break-words">${w.reason}</span>
                                            </div>
                                            <div class="text-xs text-slate-400">
                                                <span class="text-slate-500">Par</span> <span class="font-medium text-slate-300">${w.author}</span>
                                                <span class="text-slate-600">•</span>
                                                <span class="font-mono">${new Date(w.date).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <button type="button" data-id="${w.id}" class="delete-warning-btn p-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                    `;
                                }).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <div class="flex justify-between pt-6 gap-3">
                        <div class="flex items-center gap-3">
                            ${canManageWarnings && isEdit ? `
                            <div class="flex items-center gap-2">
                                <input type="text" id="fire-reason-input" placeholder="Motif du licenciement..." class="px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500 text-sm w-48 md:w-64">
                            </div>
                            <button type="button" id="fire-employee-btn" class="px-4 py-2 border border-red-600 text-red-400 rounded-lg font-medium hover:bg-red-600/10 transition-colors flex items-center gap-2">
                                <i data-lucide="user-x" class="w-4 h-4"></i>
                                Virer
                            </button>
                            ` : ''}

                            ${isPatron && isEdit ? `
                            <button type="button" id="delete-employee-btn-form" class="px-4 py-2 border border-red-800 bg-red-900/10 text-red-500 rounded-lg font-medium hover:bg-red-800 hover:text-white transition-colors flex items-center gap-2" title="Supprimer définitivement la fiche (Patron)">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                            ` : ''}
                        </div>

                        <div class="flex gap-3">
                            <button type="button" onclick="window.history.back()" class="px-6 py-2 border border-slate-700 rounded-xl text-slate-300 font-semibold hover:bg-slate-800 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                                <i data-lucide="save" class="w-4 h-4"></i>
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
}
