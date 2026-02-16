import { auth } from './auth.js';
import { store } from './store.js';
import { APP_VERSION } from './config.js';

export function renderLayout(content) {
    const user = auth.getUser();
    
    if (!user) return content; // Login page has no layout

    let activeHash = '#dashboard';
    try {
        const raw = window.location.hash || '';
        const base = raw.split('?')[0] || '';
        activeHash = base || '#dashboard';
        if (activeHash === '#') activeHash = '#dashboard';
    } catch (e) {
        activeHash = '#dashboard';
    }

    let adminOpen = false;
    let sidebarSearch = '';
    try {
        adminOpen = localStorage.getItem('sidebar_admin_open') === '1';
        sidebarSearch = sessionStorage.getItem('sidebar_search') || '';
    } catch (e) {
        adminOpen = false;
        sidebarSearch = '';
    }

    const canEmployeesView = store.hasPermissionSync(user, 'employees.view');
    const canEmployeesManage = store.hasPermissionSync(user, 'employees.manage');
    const canPayroll = store.hasPermissionSync(user, 'payroll.manage');
    const canSalesAll = store.hasPermissionSync(user, 'sales.view_all');
    const canSalesManage = store.hasPermissionSync(user, 'sales.manage');
    const canStats = canSalesAll;
    const canArchives = store.hasPermissionSync(user, 'archives.manage') || store.hasPermissionSync(user, 'archives.view');
    const canConfigure = store.hasPermissionSync(user, 'config.manage');
    const canRecruitment = store.hasPermissionSync(user, 'recruitment.manage');
    const canContracts = store.hasPermissionSync(user, 'contracts.view') || store.hasPermissionSync(user, 'contracts.manage');

    const showAdmin =
        canEmployeesView || canPayroll || canSalesAll || canStats || canArchives || canConfigure || canRecruitment;

    const adminCount = [
        canEmployeesView,
        canPayroll,
        canSalesAll,
        canStats,
        canArchives,
        canRecruitment,
        canConfigure
    ].filter(Boolean).length;

    const sidebarWidthClass = 'w-64';
    const navItemCompactClass = '';
    const labelCompactClass = '';
    const sidebarTextCompactClass = '';

    return `
        <div class="flex h-screen bg-slate-900 overflow-hidden text-white">
            <!-- Mobile Overlay -->
            <div id="mobile-overlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden glass transition-opacity"></div>

            <!-- Sidebar -->
            <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 ${sidebarWidthClass} bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 transform -translate-x-full lg:translate-x-0 lg:static glass">
                <div class="h-1 w-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc]"></div>
                <div class="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        ${(() => {
                            try {
                                // Try to get from sync settings first, fallback to local storage legacy
                                let url = null;
                                try {
                                    const settings = JSON.parse(localStorage.getItem('webhook_settings'));
                                    if (settings && settings.brand_logo_url) url = settings.brand_logo_url;
                                } catch(e) {}
                                if (!url) url = localStorage.getItem('brand_logo_url');
                                
                                if (url) {
                                    return `<div class="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                                        <img src="${url}" alt="logo" class="w-10 h-10 object-contain rounded-md">
                                    </div>`;
                                }
                            } catch (e) {}
                            return `<div class="p-2 rounded-xl bg-slate-900 border border-slate-800"><i data-lucide="wrench" class="w-6 h-6 text-white"></i></div>`;
                        })()}
                        <div class="js-sidebar-text ${sidebarTextCompactClass}">
                            <h1 class="text-xl font-bold tracking-tight uppercase">DriveLine Customs</h1>
                            <p class="text-[10px] text-slate-400 uppercase tracking-widest">Atelier & Mécanique</p>
                        </div>
                    </div>
                    <!-- Close button for mobile -->
                    <button onclick="toggleSidebar()" class="lg:hidden text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <div class="p-6 border-b border-slate-800">
                    <div class="flex items-center gap-3 p-2 -m-2 rounded-xl transition-colors group">
                        <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-300 border border-slate-700 group-hover:border-slate-500 transition-colors">
                            ${user.firstName[0]}${user.lastName[0]}
                        </div>
                        <div class="js-sidebar-text ${sidebarTextCompactClass}">
                            <p class="font-medium text-sm text-white group-hover:text-blue-400 transition-colors">${user.firstName} ${user.lastName}</p>
                            <p class="text-xs text-slate-400 capitalize">${user.role === 'patron' ? "Patron" : user.role === 'co_patron' ? "Co-Patron" : user.role === 'responsable' ? "Responsable" : user.role === 'chef_atelier' ? "Chef d'Atelier" : user.role === 'mecano_confirme' ? "Mécano Confirmé" : user.role === 'mecano_junior' ? "Mécano Junior" : user.role === 'mecano_test' ? "Mécano Test" : user.role === 'mecano' ? "Mécano Confirmé" : "Employé"}</p>
                        </div>
                    </div>
                    
                    ${''}
                </div>

                <div class="js-sidebar-text px-4 pt-4 ${sidebarTextCompactClass}">
                    <!-- Search Removed -->
                </div>

                <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
                    <a data-nav-label="Tableau de Bord" data-nav-group="main" href="#dashboard" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#dashboard' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                        <i data-lucide="layout-dashboard" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                        <span class="js-nav-label ${labelCompactClass}">Tableau de Bord</span>
                    </a>
                    
                    <a data-nav-label="Pointeuse" data-nav-group="main" href="#pointeuse" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#pointeuse' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-all group">
                        <i data-lucide="clock" class="w-5 h-5 ${activeHash === '#pointeuse' ? 'text-white' : 'group-hover:text-blue-500'} transition-colors"></i>
                        <span class="js-nav-label ${labelCompactClass}">Pointeuse</span>
                    </a>

                    ${''}

                    <a data-nav-label="Mes Interventions" data-nav-group="main" href="#sales" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#sales' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                        <i data-lucide="wrench" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                        <span class="js-nav-label ${labelCompactClass}">Mes Interventions</span>
                    </a>

                    ${canSalesManage ? `
                    <a data-nav-label="Calculateur Custom" data-nav-group="main" href="#calculator" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#calculator' ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                        <i data-lucide="palette" class="w-5 h-5 group-hover:text-pink-500 transition-colors"></i>
                        <span class="js-nav-label ${labelCompactClass}">Calculateur Custom</span>
                    </a>
                    ` : ''}

                    <!-- Absence navigation removed -->

                    ${canContracts ? `
                    <a data-nav-label="Contrat RP" data-nav-group="main" href="#contracts-rp" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#contracts-rp' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                        <i data-lucide="file-text" class="w-5 h-5 group-hover:text-cyan-500 transition-colors"></i>
                        <span class="js-nav-label ${labelCompactClass}">Contrat RP</span>
                    </a>
                    ` : ''}

                    ${showAdmin ? `
                        <div class="pt-6 pb-2">
                            <button id="sidebar-admin-toggle" type="button" class="w-full flex items-center justify-between px-4 py-2 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-white/5 transition-colors">
                                <span class="flex items-center gap-2">
                                    <span>Administration</span>
                                    <span class="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">${adminCount}</span>
                                </span>
                                <i id="sidebar-admin-chevron" data-lucide="chevron-down" class="w-4 h-4 text-slate-500 transition-transform ${adminOpen ? 'rotate-180' : ''}"></i>
                            </button>
                        </div>
                        <div id="sidebar-admin-group" class="${adminOpen ? '' : 'hidden'} space-y-1">

                        ${canEmployeesView ? `
                        <a data-nav-label="Employés & Compta" data-nav-group="admin" href="#employees" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#employees' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                            <i data-lucide="users" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${labelCompactClass}">Employés & Compta</span>
                        </a>
                        ` : ''}

                        ${canPayroll ? `
                        <a data-nav-label="Fiches de Paie" data-nav-group="admin" href="#payroll" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#payroll' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                            <i data-lucide="banknote" class="w-5 h-5 group-hover:text-green-500 transition-colors"></i>
                            <span class="js-nav-label ${labelCompactClass}">Fiches de Paie</span>
                        </a>

                        ${''}
                        ` : ''}

                        ${canSalesAll ? `
                        <a data-nav-label="Historique Atelier" data-nav-group="admin" href="#admin-sales" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#admin-sales' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                            <i data-lucide="history" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${labelCompactClass}">Historique Atelier</span>
                        </a>
                        
                        <a data-nav-label="Annuaire Plaques" data-nav-group="admin" href="#plates" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#plates' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                            <i data-lucide="book" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${labelCompactClass}">Annuaire Plaques</span>
                        </a>
                        ` : ''}

                        ${canStats ? `
                        <a data-nav-label="Statistiques Globales" data-nav-group="admin" href="#admin-stats" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#admin-stats' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                            <i data-lucide="bar-chart-3" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${labelCompactClass}">Statistiques Globales</span>
                        </a>
                        ` : ''}

                        ${canArchives ? `
                        <a data-nav-label="Archives Comptables" data-nav-group="admin" href="#archives" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#archives' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                            <i data-lucide="archive" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${labelCompactClass}">Archives Comptables</span>
                        </a>
                        ` : ''}

                        ${canRecruitment ? `
                        <a data-nav-label="Recrutement" data-nav-group="admin" href="#admin-recruitment" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#admin-recruitment' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                            <i data-lucide="file-text" class="w-5 h-5 group-hover:text-purple-500 transition-colors"></i>
                            <span class="js-nav-label ${labelCompactClass}">Recrutement</span>
                        </a>
                        ` : ''}

                        ${canConfigure ? `
                        <a data-nav-label="Configuration" data-nav-group="admin" href="#admin-config" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${navItemCompactClass} ${activeHash === '#admin-config' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} transition-colors group">
                            <i data-lucide="settings" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${labelCompactClass}">Configuration</span>
                        </a>
                        ` : ''}
                        </div>
                    ` : ''}
                </nav>

                <div class="p-4 border-t border-slate-800 space-y-2">
                    <button id="logout-btn" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                        <span class="js-nav-label">Déconnexion</span>
                    </button>
                </div>
            </aside>

            <!-- Main Content Wrapper -->
            <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900 relative">
                
                <!-- Background Image Overlay (Subtle mechanic vibe) -->
                <div class="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>

                <div class="h-1 w-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc] lg:hidden"></div>
                <header class="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between lg:hidden z-30 relative glass">
                    <button onclick="toggleSidebar()" class="text-slate-400 focus:outline-none p-2 hover:bg-slate-800 rounded-lg">
                        <i data-lucide="menu" class="w-6 h-6"></i>
                    </button>
                    <span class="font-bold text-lg text-white">DriveLine Customs v${APP_VERSION}</span>
                    <div class="w-10"></div>
                </header>

                <!-- Main Content -->
                <main class="flex-1 overflow-auto p-4 md:p-8 relative scroll-smooth z-10">
                    ${content}
                </main>
            </div>
        </div>
    `;
}
