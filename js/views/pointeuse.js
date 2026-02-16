import { store } from '../store.js';
import { auth } from '../auth.js';
import { formatDate, getWeekRange } from '../utils.js';
import { Toast } from '../toast.js';
import { Modal } from '../modal.js';

export function Pointeuse() {
    setTimeout(initPointeuseLogic, 50);

    return `
        <div class="space-y-10 animate-fade-in pb-20">
            <!-- Header Clock Section -->
            <div class="relative flex flex-col items-center justify-center py-10">
                <!-- Decorative Glows -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div class="relative z-10 text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900/50 border border-white/10 shadow-2xl mb-6 backdrop-blur-md">
                        <i data-lucide="clock" class="w-8 h-8 text-blue-400"></i>
                    </div>
                    <h2 class="text-4xl font-black text-white tracking-tight mb-2">Pointeuse Atelier</h2>
                    <p class="text-slate-400 text-sm">Gérez votre temps de service en temps réel</p>
                    
                    <div class="mt-8 flex flex-col items-center">
                        <div class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 font-mono tracking-tighter" id="live-clock">--:--</div>
                        <div class="text-slate-500 font-medium uppercase tracking-widest text-xs mt-2" id="live-date">-- -- --</div>
                    </div>

                    <!-- Stats Badges -->
                    <div class="mt-8 flex items-center justify-center gap-4 flex-wrap">
                        <div class="px-4 py-2 rounded-xl bg-slate-900/50 border border-white/5 backdrop-blur-sm flex items-center gap-3">
                            <div class="flex items-center gap-2">
                                <span class="relative flex h-2 w-2">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span class="text-xs font-bold text-slate-300 uppercase">En service</span>
                            </div>
                            <span id="p-count-active" class="text-lg font-bold text-white">0</span>
                        </div>
                        <div class="px-4 py-2 rounded-xl bg-slate-900/50 border border-white/5 backdrop-blur-sm flex items-center gap-3">
                            <div class="flex items-center gap-2">
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                <span class="text-xs font-bold text-slate-300 uppercase">En pause</span>
                            </div>
                            <span id="p-count-paused" class="text-lg font-bold text-white">0</span>
                        </div>
                        <!-- My Weekly Hours Badge -->
                        <div id="p-my-hours-badge" class="px-4 py-2 rounded-xl bg-blue-900/30 border border-blue-500/20 backdrop-blur-sm flex items-center gap-3 hidden">
                            <div class="flex items-center gap-2">
                                <i data-lucide="calendar-clock" class="w-3 h-3 text-blue-400"></i>
                                <span class="text-xs font-bold text-blue-300 uppercase">Ma Semaine</span>
                            </div>
                            <span id="p-my-hours-val" class="text-lg font-bold text-white">0h</span>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="mt-8" id="p-filter-bar">
                        <div class="inline-flex p-1 rounded-xl bg-slate-900/80 border border-white/5 backdrop-blur-md">
                            <button id="p-filter-all" class="px-6 py-2 rounded-lg text-sm font-bold transition-all text-white bg-white/10 shadow-sm">Tous</button>
                            <button id="p-filter-me" class="px-6 py-2 rounded-lg text-sm font-bold transition-all text-slate-400 hover:text-white hover:bg-white/5">Moi</button>
                        </div>
                    </div>

                    <!-- Search -->
                    <div class="mt-6 w-full max-w-sm hidden relative group" id="p-search-bar">
                        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors"></i>
                        <input type="text" id="p-search" autocomplete="off" placeholder="Rechercher un employé..." 
                            class="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-xl">
                    </div>
                </div>
            </div>

            <!-- Employees Grid -->
            <div id="pointeuse-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                <div class="col-span-full py-12 text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-r-transparent"></div>
                </div>
            </div>

            <!-- Recent History -->
            <div class="max-w-5xl mx-auto px-4">
                <div class="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                    <button id="p-history-toggle" type="button" class="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group">
                        <div class="flex items-center gap-3">
                            <div class="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white transition-colors">
                                <i data-lucide="history" class="w-5 h-5"></i>
                            </div>
                            <div class="text-left">
                                <div class="font-bold text-white text-sm">Historique d'activité</div>
                                <div class="text-xs text-slate-500">Voir les mouvements récents</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span id="p-history-state" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Masqué</span>
                            <i id="p-history-chevron" data-lucide="chevron-down" class="w-4 h-4 text-slate-500 transition-transform duration-300"></i>
                        </div>
                    </button>
                    
                    <div id="p-history-wrapper" class="hidden border-t border-white/5 bg-slate-900/20">
                        <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                            <!-- Column 1 -->
                            <div class="p-6">
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                    <h3 class="font-bold text-white text-xs uppercase tracking-wider">Prises de service</h3>
                                </div>
                                <div id="history-active" class="space-y-3"></div>
                            </div>
                            <!-- Column 2 -->
                            <div class="p-6">
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <h3 class="font-bold text-white text-xs uppercase tracking-wider">Mises en pause</h3>
                                </div>
                                <div id="history-paused" class="space-y-3"></div>
                            </div>
                            <!-- Column 3 -->
                            <div class="p-6">
                                <div class="flex items-center gap-2 mb-4">
                                    <div class="w-2 h-2 rounded-full bg-slate-500"></div>
                                    <h3 class="font-bold text-white text-xs uppercase tracking-wider">Fins de service</h3>
                                </div>
                                <div id="history-completed" class="space-y-3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function initPointeuseLogic() {
    // 0. Check Lock (Removed)
    
    // 1. Live Clock
    const updateClock = () => {
        const now = new Date();
        const clockEl = document.getElementById('live-clock');
        const dateEl = document.getElementById('live-date');
        
        if(clockEl) clockEl.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        if(dateEl) dateEl.textContent = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    };
    updateClock();
    try {
        if (window.__pClockInterval) clearInterval(window.__pClockInterval);
    } catch (e) {}
    window.__pClockInterval = setInterval(updateClock, 30000);

    // 2. Fetch Data
    const grid = document.getElementById('pointeuse-grid');
    const historyActive = document.getElementById('history-active');
    const historyPaused = document.getElementById('history-paused');
    const historyCompleted = document.getElementById('history-completed');
    const historyWrapper = document.getElementById('p-history-wrapper');
    const historyToggle = document.getElementById('p-history-toggle');
    const historyState = document.getElementById('p-history-state');
    const historyChevron = document.getElementById('p-history-chevron');
    const countActiveEl = document.getElementById('p-count-active');
    const countPausedEl = document.getElementById('p-count-paused');
    
    if(!grid) return;

    try {
        const employeesAll = await store.fetchEmployees();
        const timeEntries = await store.fetchTimeEntries(); // All entries
        const currentUser = auth.getUser();
        const canViewAll = store.hasPermissionSync(currentUser, 'pointeuse.view_all');

        const savedFilter = (localStorage.getItem('p_filter') || (canViewAll ? 'all' : 'me'));
        const showAll = canViewAll && savedFilter === 'all';
        const rawSearch = canViewAll ? (localStorage.getItem('p_search') || '') : '';
        const searchTerm = String(rawSearch || '').trim().toLowerCase();

        let employeesForGrid = (!showAll && currentUser)
            ? employeesAll.filter(e => e.id === currentUser.id)
            : employeesAll;
        const fb = document.getElementById('p-filter-bar');
        if (fb && canViewAll) {
            // Ensure Clean Button exists
            let cleanBtn = document.getElementById('p-scan-afk');
            if (!cleanBtn) {
                const div = document.createElement('div');
                div.className = "mt-4 flex justify-center";
                div.innerHTML = `
                    <button id="p-scan-afk" onclick="handleScanAFK()" class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-all">
                        <i data-lucide="shield-alert" class="w-4 h-4"></i>
                        Scanner Inactifs (> 2h)
                    </button>
                `;
                fb.appendChild(div);
            }

            const allBtn = document.getElementById('p-filter-all');
            const meBtn = document.getElementById('p-filter-me');
            if (allBtn && meBtn) {
                // Update styling based on active filter
                if (savedFilter === 'all') {
                    allBtn.className = 'px-6 py-2 rounded-lg text-sm font-bold transition-all text-white bg-white/10 shadow-sm';
                    meBtn.className = 'px-6 py-2 rounded-lg text-sm font-bold transition-all text-slate-400 hover:text-white hover:bg-white/5';
                } else {
                    allBtn.className = 'px-6 py-2 rounded-lg text-sm font-bold transition-all text-slate-400 hover:text-white hover:bg-white/5';
                    meBtn.className = 'px-6 py-2 rounded-lg text-sm font-bold transition-all text-white bg-white/10 shadow-sm';
                }
                
                allBtn.onclick = () => { localStorage.setItem('p_filter', 'all'); initPointeuseLogic(); };
                meBtn.onclick = () => { localStorage.setItem('p_filter', 'me'); initPointeuseLogic(); };
            }
        } else {
            const fbEl = document.getElementById('p-filter-bar');
            if (fbEl) fbEl.style.display = 'none';
        }

        const searchBar = document.getElementById('p-search-bar');
        const searchInput = document.getElementById('p-search');
        if (searchBar && searchInput && canViewAll) {
            searchBar.classList.remove('hidden');
            searchInput.value = rawSearch || '';
            searchInput.oninput = (e) => {
                localStorage.setItem('p_search', e.target.value || '');
                initPointeuseLogic();
            };
        } else if (searchBar) {
            searchBar.classList.add('hidden');
        }

        if (searchTerm && showAll) {
            employeesForGrid = employeesForGrid.filter(e => {
                const name = `${e.first_name || ''} ${e.last_name || ''}`.trim().toLowerCase();
                return name.includes(searchTerm);
            });
        }
        
        // Render Grid
        renderGrid(grid, employeesForGrid, timeEntries, canViewAll);

        const historyPref = localStorage.getItem('p_history') || 'collapsed';
        const expanded = historyPref === 'expanded';
        if (historyWrapper) historyWrapper.classList.toggle('hidden', !expanded);
        if (historyState) historyState.textContent = expanded ? 'Affiché' : 'Masqué';
        if (historyChevron) historyChevron.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
        if (historyToggle) {
            historyToggle.onclick = () => {
                const next = (localStorage.getItem('p_history') || 'collapsed') === 'expanded' ? 'collapsed' : 'expanded';
                localStorage.setItem('p_history', next);
                initPointeuseLogic();
            };
        }
        if (expanded) {
            renderStatus(historyActive, historyPaused, historyCompleted, timeEntries, employeesAll);
        }
        try {
            const activeCount = timeEntries.filter(t => !t.clock_out && !t.paused).length;
            const pausedCount = timeEntries.filter(t => !t.clock_out && t.paused).length;
            if (countActiveEl) countActiveEl.textContent = String(activeCount);
            if (countPausedEl) countPausedEl.textContent = String(pausedCount);

            // Calculate My Weekly Hours
            if (currentUser) {
                const badge = document.getElementById('p-my-hours-badge');
                const valEl = document.getElementById('p-my-hours-val');
                if (badge && valEl) {
                    badge.classList.remove('hidden');
                    
                    // Get Start of Week (Saturday to Saturday)
                    const { start: startOfWeek } = getWeekRange();

                    const myEntries = timeEntries.filter(t => 
                        String(t.employee_id) === String(currentUser.id) && 
                        new Date(t.clock_in) >= startOfWeek
                    );

                    let totalMs = 0;
                    myEntries.forEach(t => {
                        if (t.clock_out) {
                            totalMs += (new Date(t.clock_out) - new Date(t.clock_in)) - (t.pause_total_ms || 0);
                        } else {
                            // Currently active
                            const currentEnd = new Date();
                            let currentPause = 0;
                            if (t.paused && t.pause_started) {
                                currentPause = currentEnd - new Date(t.pause_started);
                            }
                            totalMs += (currentEnd - new Date(t.clock_in)) - (t.pause_total_ms || 0) - currentPause;
                        }
                    });
                    
                    valEl.textContent = formatDurationMs(totalMs);
                }
            }
        } catch (e) {}

    } catch (err) {
        console.error("CRASH POINTEUSE:", err);
        grid.innerHTML = `<div class="col-span-full text-red-500 text-center">Erreur de chargement des données: ${err.message}</div>`;
    }
    try {
        if (window.__pRefreshInterval) clearInterval(window.__pRefreshInterval);
    } catch (e) {}
    window.__pRefreshInterval = setInterval(initPointeuseLogic, 60000);
}

function formatDurationMs(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h <= 0) return `${m}m`;
    return `${h}h ${String(m).padStart(2, '0')}m`;
}

function updatePointeuseCards() {
    const cards = document.querySelectorAll('[data-p-card="1"]');
    const now = new Date();
    const thresholdHours = parseInt(localStorage.getItem('inactivity_threshold_hours') || '2', 10);
    for (const el of cards) {
        const empId = el.getAttribute('data-emp-id') || '';
        const clockIn = el.getAttribute('data-clock-in') || '';
        const paused = el.getAttribute('data-paused') === '1';
        const pauseStarted = el.getAttribute('data-pause-started') || '';
        const pauseTotalMs = Number(el.getAttribute('data-pause-total') || 0);

        const statusEl = empId ? document.getElementById(`p-status-${empId}`) : null;
        const dotEl = empId ? document.getElementById(`p-dot-${empId}`) : null;
        const avatarEl = empId ? document.getElementById(`p-avatar-${empId}`) : null;
        const inactiveEl = empId ? document.getElementById(`p-inactive-${empId}`) : null;

        if (!clockIn || !statusEl) continue;
        const start = new Date(clockIn);
        const since = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        let currentPauseAdd = 0;
        if (paused && pauseStarted) {
            const ps = new Date(pauseStarted);
            currentPauseAdd = Math.max(0, now - ps);
        }
        const workMs = Math.max(0, now - start - pauseTotalMs - currentPauseAdd);
        const workLabel = formatDurationMs(workMs);

        if (paused) {
            const pSince = pauseStarted ? new Date(pauseStarted).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : since;
            const pMs = pauseStarted ? Math.max(0, now - new Date(pauseStarted)) : 0;
            statusEl.className = 'text-xs text-yellow-400 flex items-center gap-1.5 bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-400/20 w-fit';
            statusEl.innerHTML = `<i data-lucide="coffee" class="w-3 h-3"></i><span class="font-bold">En pause</span><span class="text-yellow-400/70 font-mono">(${formatDurationMs(pMs)})</span>`;
            
            if (dotEl) dotEl.className = 'absolute top-0 right-0 w-3 h-3 rounded-full bg-yellow-400 border-2 border-slate-800 shadow-sm z-10';
            if (avatarEl) avatarEl.className = 'w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-orange-500/20';
            if (inactiveEl) inactiveEl.classList.add('hidden');
        } else {
            statusEl.className = 'text-xs text-green-400 flex items-center gap-1.5 bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20 w-fit';
            statusEl.innerHTML = `<i data-lucide="timer" class="w-3 h-3"></i><span class="font-bold">En service</span><span class="text-green-400/70 font-mono">(${workLabel})</span>`;
            
            if (dotEl) dotEl.className = 'absolute top-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-800 shadow-sm z-10 animate-pulse';
            if (avatarEl) avatarEl.className = 'w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-green-500/20';
            if (inactiveEl) {
                const lastActivity = el.getAttribute('data-last-activity') || '';
                let last = start;
                if (lastActivity) {
                    const d = new Date(lastActivity);
                    if (!isNaN(d.getTime())) last = d;
                }
                const inactive = (now - last) >= thresholdHours * 3600000;
                if (inactive) inactiveEl.classList.remove('hidden');
                else inactiveEl.classList.add('hidden');
            }
        }
    }
}

function renderGrid(container, employees, timeEntries, isAdmin) {
    const byEmp = new Map();
    for (const t of timeEntries) {
        if (t && t.employee_id != null && !t.clock_out) byEmp.set(String(t.employee_id), t);
    }

    const sortedEmployees = employees.slice().sort((a, b) => {
        const at = byEmp.get(String(a.id)) || null;
        const bt = byEmp.get(String(b.id)) || null;
        const aPaused = !!(at && at.paused);
        const bPaused = !!(bt && bt.paused);
        const aActive = !!at;
        const bActive = !!bt;
        const aRank = aActive ? (aPaused ? 1 : 0) : 2;
        const bRank = bActive ? (bPaused ? 1 : 0) : 2;
        if (aRank !== bRank) return aRank - bRank;
        const an = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
        const bn = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
        if (an < bn) return -1;
        if (an > bn) return 1;
        return 0;
    });

    container.innerHTML = sortedEmployees.map(emp => {
        const activeEntry = byEmp.get(String(emp.id)) || null;
        const isActive = !!activeEntry;
        const isPaused = !!(activeEntry && activeEntry.paused);
        
        let durationText = "";
        let clockInIso = '';
        let pauseStartedIso = '';
        let pauseTotal = 0;
        let lastActivityIso = '';
        if (isActive) {
            const start = new Date(activeEntry.clock_in);
            const now = new Date();

            clockInIso = activeEntry.clock_in || '';
            pauseStartedIso = activeEntry.pause_started || '';
            pauseTotal = Number(activeEntry.pause_total_ms || 0);

            let currentPauseAdd = 0;
            if (activeEntry.paused && activeEntry.pause_started) {
                const pauseStart = new Date(activeEntry.pause_started);
                currentPauseAdd = Math.max(0, now - pauseStart);
            }
            const workMs = Math.max(0, now - start - pauseTotal - currentPauseAdd);
            const since = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            durationText = isPaused
                ? `En pause • depuis ${since}`
                : `En service • ${formatDurationMs(workMs)} • depuis ${since}`;

            try {
                if (!isPaused) {
                    const sales = store.getSales().filter(s => String(s.employeeId) === String(emp.id));
                    const recent = sales.filter(s => new Date(s.date) >= new Date(activeEntry.clock_in)).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                    if (recent) lastActivityIso = new Date(recent.date).toISOString();
                }
            } catch (e) {}
        }

        // Action Button Logic
        const isSelf = emp.id === auth.getUser()?.id;
        let buttonHtml = '';
        
        if (!isAdmin && !isSelf) {
            buttonHtml = `<div class="h-10 flex items-center justify-center text-slate-500 text-xs italic bg-slate-800/50 rounded-lg border border-white/5">${isActive ? 'En service' : 'Hors service'}</div>`;
        } else {
            buttonHtml = `
                <div class="grid grid-cols-${!isActive ? '1' : '2'} gap-3">
                    ${
                        !isActive
                        ? `
                            <button 
                                onclick="handleClockIn('${emp.id}')"
                                class="py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0">
                                <i data-lucide="log-in" class="w-4 h-4"></i> ${isAdmin && !isSelf ? 'FORCER ARRIVÉE' : 'ARRIVER'}
                            </button>
                        `
                        : isPaused
                        ? `
                            <button 
                                onclick="handleResume('${emp.id}')"
                                class="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20">
                                <i data-lucide="play" class="w-4 h-4"></i> REPRENDRE
                            </button>
                            <button 
                                onclick="handleClockOut('${emp.id}')"
                                class="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                                <i data-lucide="log-out" class="w-4 h-4"></i> SORTIR
                            </button>
                        `
                        : `
                            <button 
                                onclick="handlePause('${emp.id}')"
                                class="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20">
                                <i data-lucide="coffee" class="w-4 h-4"></i> PAUSE
                            </button>
                            <button 
                                onclick="handleClockOut('${emp.id}')"
                                class="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                                <i data-lucide="log-out" class="w-4 h-4"></i> ${isAdmin && !isSelf ? 'FORCER' : 'SORTIR'}
                            </button>
                        `
                    }
                </div>
            `;
        }

        let inactiveBadge = '';
        if (isActive && !isPaused) {
            try {
                const sales = store.getSales().filter(s => String(s.employeeId) === String(emp.id));
                let lastActivity = activeEntry.clock_in ? new Date(activeEntry.clock_in) : new Date();
                if (sales && sales.length) {
                    const recent = sales.filter(s => new Date(s.date) >= new Date(activeEntry.clock_in)).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                    if (recent) lastActivity = new Date(recent.date);
                }
                const hrs = parseInt(localStorage.getItem('inactivity_threshold_hours') || '2', 10);
                if ((new Date() - lastActivity) >= hrs * 3600000) {
                    inactiveBadge = `<span id="p-inactive-${emp.id}" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-500/10 text-orange-300 border border-orange-500/20 mt-2 animate-pulse"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Inactif</span>`;
                } else {
                    inactiveBadge = `<span id="p-inactive-${emp.id}" class="hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-500/10 text-orange-300 border border-orange-500/20 mt-2 animate-pulse"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Inactif</span>`;
                }
            } catch (e) {}
        }

        return `
            <div data-p-card="1" data-emp-id="${emp.id}" data-clock-in="${clockInIso}" data-paused="${isPaused ? '1' : '0'}" data-pause-started="${pauseStartedIso}" data-pause-total="${pauseTotal}" data-last-activity="${lastActivityIso}" 
                class="relative bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border ${isActive ? (isPaused ? 'border-yellow-500/30' : 'border-green-500/30') : 'border-white/5'} transition-all hover:border-white/10 group overflow-hidden">
                
                ${isActive ? `
                    <div class="absolute inset-0 bg-gradient-to-br ${isPaused ? 'from-yellow-500/5 to-transparent' : 'from-green-500/5 to-transparent'} pointer-events-none"></div>
                ` : ''}

                <div class="relative z-10 flex items-start gap-4 mb-6">
                    <div class="relative">
                        <div id="p-avatar-${emp.id}" class="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center text-xl font-bold transition-all">
                            ${emp.first_name[0]}${emp.last_name[0]}
                        </div>
                        <span id="p-dot-${emp.id}" class="absolute top-0 right-0 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-800 shadow-sm z-10 hidden"></span>
                    </div>
                    
                    <div class="flex-1 min-w-0 pt-1">
                        <h3 class="font-bold text-white text-lg truncate leading-tight">${emp.first_name} ${emp.last_name}</h3>
                        <div id="p-status-${emp.id}" class="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                            <i data-lucide="moon" class="w-3 h-3"></i> Hors service
                        </div>
                        ${inactiveBadge}
                    </div>
                </div>

                <div class="relative z-10">
                    ${buttonHtml}
                </div>
            </div>
        `;
    }).join('');

    if(window.lucide) lucide.createIcons();
    updatePointeuseCards();
    try {
        if (window.__pCardInterval) clearInterval(window.__pCardInterval);
    } catch (e) {}
    window.__pCardInterval = setInterval(updatePointeuseCards, 15000);
}

function renderStatus(containerActive, containerPaused, containerCompleted, timeEntries, employees) {
    const activeWorking = timeEntries.filter(t => !t.clock_out && !t.paused);
    const paused = timeEntries.filter(t => !t.clock_out && !!t.paused);
    const completed = timeEntries.filter(t => !!t.clock_out).sort((a, b) => new Date(b.clock_out) - new Date(a.clock_out)).slice(0, 8);

    const HistoryItem = (empId, title, sub, iconClass, bgClass, borderClass) => {
        const emp = employees.find(e => e.id === empId);
        const name = emp ? `${emp.first_name} ${emp.last_name}` : 'Inconnu';
        const initials = name.split(' ').map(n => n[0]).join('');
        
        return `
            <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-white/5 transition-colors group">
                <div class="w-8 h-8 rounded-lg ${bgClass} ${borderClass} border flex items-center justify-center text-xs font-bold shadow-sm">
                    ${initials}
                </div>
                <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-200 truncate">${name}</p>
                    <div class="flex items-center gap-1.5 text-[10px] text-slate-500">
                        ${iconClass}
                        <span>${title}</span>
                        <span class="text-slate-600">•</span>
                        <span class="font-mono">${sub}</span>
                    </div>
                </div>
            </div>
        `;
    };

    if (containerActive) {
        if (activeWorking.length === 0) {
            containerActive.innerHTML = '<p class="text-slate-500 text-xs italic p-2">Aucun employé en service.</p>';
        } else {
            containerActive.innerHTML = activeWorking.map(entry => {
                const start = new Date(entry.clock_in).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                return HistoryItem(entry.employee_id, "Depuis " + start, new Date(entry.clock_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), '<i data-lucide="timer" class="w-3 h-3 text-green-400"></i>', 'bg-green-500/10 text-green-400', 'border-green-500/20');
            }).join('');
        }
    }

    if (containerPaused) {
        if (paused.length === 0) {
            containerPaused.innerHTML = '<p class="text-slate-500 text-xs italic p-2">Aucun employé en pause.</p>';
        } else {
            containerPaused.innerHTML = paused.map(entry => {
                const start = (entry.pause_started ? new Date(entry.pause_started) : new Date()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                return HistoryItem(entry.employee_id, "Pause à " + start, new Date(entry.clock_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), '<i data-lucide="coffee" class="w-3 h-3 text-yellow-400"></i>', 'bg-yellow-500/10 text-yellow-400', 'border-yellow-500/20');
            }).join('');
        }
    }

    if (containerCompleted) {
        if (completed.length === 0) {
            containerCompleted.innerHTML = '<p class="text-slate-500 text-xs italic p-2">Aucune sortie récente.</p>';
        } else {
            containerCompleted.innerHTML = completed.map(entry => {
                const diffMs = new Date(entry.clock_out) - new Date(entry.clock_in);
                const h = Math.floor(diffMs / 3600000);
                const m = Math.floor((diffMs % 3600000) / 60000);
                const duration = `${h > 0 ? h + 'h ' : ''}${m}m`;
                const end = new Date(entry.clock_out).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                return HistoryItem(entry.employee_id, `Fin à ${end}`, `Durée: ${duration}`, '<i data-lucide="log-out" class="w-3 h-3 text-slate-400"></i>', 'bg-slate-800 text-slate-400', 'border-slate-600/30');
            }).join('');
        }
    }
    
    if(window.lucide) lucide.createIcons();
}

window.handleClockIn = async (empId) => {
    try {
        if (window.__pA && window.__pA[empId]) return;
        window.__pA = window.__pA || {};
        window.__pA[empId] = true;
        await store.clockIn(empId);
        Toast.show("Prise de service enregistrée", "success");
        initPointeuseLogic();
    } catch (err) {
        Toast.show(err.message, "error");
    } finally {
        if (window.__pA) delete window.__pA[empId];
    }
};
window.handleCleanGhosts = async () => {
    if (!confirm("Voulez-vous vraiment clore automatiquement tous les services ouverts depuis plus de 12 heures ?\n\nIls seront plafonnés à 12h de service.")) return;
    
    try {
        const res = await store.autoCloseGhostServices(12);
        if (res.count > 0) {
            Toast.show(`${res.count} services fantômes ont été clos.`, "success");
            initPointeuseLogic();
        } else {
            Toast.show("Aucun service fantôme détecté.", "info");
        }
    } catch (err) {
        console.error(err);
        Toast.show("Erreur: " + err.message, "error");
    }
};
window.handleScanAFK = async () => {
    Modal.show({
        title: 'Scanner Inactifs (Anti-AFK)',
        message: `
            <div class="space-y-4">
                <p class="text-slate-300">Cette action va scanner tous les employés actuellement en service.</p>
                <div class="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <h4 class="text-orange-400 font-bold text-sm mb-2 flex items-center gap-2">
                        <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                        Critères & Sanctions
                    </h4>
                    <ul class="text-sm text-slate-400 list-disc list-inside space-y-1">
                        <li>Inactivité détectée > <strong>2 heures</strong></li>
                        <li>Fin de service <strong>ajustée à la dernière action</strong> (les heures AFK ne comptent pas)</li>
                        <li>Ajout d'un <strong>Avertissement</strong> au dossier</li>
                    </ul>
                </div>
                <p class="text-slate-400 text-xs italic">
                    Les employés en <strong>Pause</strong> ne sont PAS concernés par ce scan.
                </p>
            </div>
        `,
        type: 'danger',
        confirmText: 'Lancer le Scan',
        onConfirm: async () => {
            try {
                const res = await store.checkAndSanctionInactivity(2);
                if (res.count > 0) {
                    Toast.show(`${res.count} employés sanctionnés pour inactivité.`, "success");
                    initPointeuseLogic();
                } else {
                    Toast.show("Scan terminé : Aucune inactivité détectée.", "success");
                }
            } catch (err) {
                console.error(err);
                Toast.show("Erreur lors du scan: " + err.message, "error");
            }
        }
    });
};
window.handleClockOut = async (empId) => {
    try {
        if (window.__pA && window.__pA[empId]) return;
        window.__pA = window.__pA || {};
        window.__pA[empId] = true;
        await store.clockOut(empId);
        Toast.show("Sortie enregistrée", "success");
        initPointeuseLogic();
    } catch (err) {
        Toast.show(err.message, "error");
    } finally {
        if (window.__pA) delete window.__pA[empId];
    }
};
window.handlePause = async (empId) => {
    try {
        if (window.__pA && window.__pA[empId]) return;
        window.__pA = window.__pA || {};
        window.__pA[empId] = true;
        await store.pauseService(empId);
        Toast.show("Pause activée", "info");
        initPointeuseLogic();
    } catch (err) {
        Toast.show(err.message, "error");
    } finally {
        if (window.__pA) delete window.__pA[empId];
    }
};
window.handleResume = async (empId) => {
    try {
        if (window.__pA && window.__pA[empId]) return;
        window.__pA = window.__pA || {};
        window.__pA[empId] = true;
        await store.resumeService(empId);
        Toast.show("Reprise du service", "success");
        initPointeuseLogic();
    } catch (err) {
        Toast.show(err.message, "error");
    } finally {
        if (window.__pA) delete window.__pA[empId];
    }
};
