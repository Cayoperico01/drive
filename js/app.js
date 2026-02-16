import { auth } from './auth.js';
import { store } from './store.js';
import { generateId, formatCurrency } from './utils.js';
import { renderLayout } from './layout.js';
// import { initAutoArchiver } from './autoArchive.js'; // Auto Archive
import { Login } from './views/login.js';
import { Dashboard } from './views/dashboard.js';
import { MySales } from './views/mysales.js';
import { AdminStats, initAdminStatsCharts } from './views/adminstats.js';
import { AdminConfig } from './views/adminconfig.js';
import { AdminSales } from './views/adminsales.js';

import { Archives } from './views/archives.js';
import { Payroll } from './views/payroll.js';
import { EmployeesList, EmployeeForm } from './views/employees.js';
import { SalesForm } from './views/salesform.js';

import { Pointeuse } from './views/pointeuse.js';
import { Invoice } from './views/invoice.js';
import { PublicApply } from './views/publicapply.js';
import { AdminRecruitment } from './views/adminrecruitment.js';
import { ContractsRP } from './views/contractsrp.js';
import { Blocked } from './views/blocked.js';
import { Profile } from './views/profile.js';
import { PlateDirectory } from './views/platedirectory.js';
import { TuningCalculator } from './views/tuningcalculator.js';
import { Toast } from './toast.js';
import { Modal } from './modal.js';
import { SignContract } from './views/signcontract.js';
import { OrderRepairKit, initOrderRepairKit } from './views/orderrepairkit.js';

const app = document.getElementById('app');

// Router
const routes = {
    '': { component: Dashboard, auth: true },
    '#login': { component: Login, auth: false },
    '#order-kit': { component: OrderRepairKit, auth: false },
    '#blocked': { component: Blocked, auth: false },
    '#apply': { component: PublicApply, auth: false },
    '#sign-contract': { component: SignContract, auth: true },
    '#dashboard': { component: Dashboard, auth: true },
    // Tombola route removed
    '#calculator': { component: TuningCalculator, auth: true, permission: 'sales.manage' },
    '#plates': { component: PlateDirectory, auth: true },
    '#profile': { component: Profile, auth: true },
    '#sales': { component: MySales, auth: true },
    '#sales/new': { component: SalesForm, auth: true },
    '#contracts-rp': { component: ContractsRP, auth: true, permission: 'contracts.view' },
    '#admin-sales': { component: AdminSales, auth: true, permission: 'sales.view_all' },
    '#admin-stats': { component: AdminStats, auth: true, permission: 'sales.view_all' },
    '#admin-recruitment': { component: AdminRecruitment, auth: true, permission: 'recruitment.manage' },
    '#payroll': { component: Payroll, auth: true, permission: 'payroll.manage' },
    // Gestion Coffre route removed
    '#employees': { component: EmployeesList, auth: true, permission: 'employees.view' },
    '#archives': { component: Archives, auth: true, permission: 'archives.manage' },
    '#admin-config': { component: AdminConfig, auth: true, permission: 'config.manage' },
    '#employees/new': { component: EmployeeForm, auth: true, permission: 'employees.add' },
    '#pointeuse': { component: Pointeuse, auth: true },
    // Absence route removed

};

async function navigate() {
    try {
        if (!auth.isAuthenticated() && window.__accountLockInterval) {
            clearInterval(window.__accountLockInterval);
            window.__accountLockInterval = null;
        }
    } catch (e) {}

    // Ensure permissions are loaded if user is logged in (handles page reload)
    if (auth.isAuthenticated()) {
        const user = auth.getUser();
        if (user && !store.getCachedEmployeePermissions(user.id)) {
             try { await store.fetchEmployeePermissions(user.id); } catch (e) {}
        }
    }

    let hash = window.location.hash || '';
    const [baseHash] = hash.split('?');

    if (auth.isAuthenticated()) {
        const user = auth.getUser();
        try {
            const lockMeta = await store.fetchEmployeeAccountLock(user.id);
            const permMeta = await store.fetchEmployeePermissions(user.id);
            const effective = store._isLockActive(lockMeta) ? lockMeta : (store.isLockActiveForPermissions(permMeta) ? (permMeta && permMeta.lock ? permMeta.lock : null) : null);
            if (store._isLockActive(effective)) {
                try { sessionStorage.setItem('imo_account_lock', JSON.stringify(effective || {})); } catch (e) {}
                store.logout();
                window.location.hash = '#blocked';
                return;
            }

            // Check Employment Contract
            if (window.location.hash !== '#sign-contract' && window.location.hash !== '#login' && window.location.hash !== '#blocked') {
                const signed = sessionStorage.getItem('contract_signed_' + user.id);
                if (signed !== 'true') {
                    try {
                        const contract = await store.fetchEmploymentContract(user.id);
                        if (!contract) {
                            window.location.hash = '#sign-contract';
                            return;
                        } else {
                            sessionStorage.setItem('contract_signed_' + user.id, 'true');
                        }
                    } catch (e) {
                        // If error (e.g. table missing), we don't block to avoid bricking the app
                        console.error("Contract check failed", e);
                    }
                }
            }
        } catch (e) {
            store.logout();
            window.location.hash = '#login';
            return;
        }

        try {
            if (window.__accountLockInterval) clearInterval(window.__accountLockInterval);
        } catch (e) {}
        window.__accountLockInterval = setInterval(async () => {
            try {
                const u = auth.getUser();
                if (!u) return;
                const lm = await store.fetchEmployeeAccountLock(u.id);
                let effective = lm;
                if (!store._isLockActive(effective)) {
                    const p = await store.fetchEmployeePermissions(u.id);
                    effective = store.isLockActiveForPermissions(p) ? (p && p.lock ? p.lock : null) : null;
                }
                if (store._isLockActive(effective)) {
                    try { sessionStorage.setItem('imo_account_lock', JSON.stringify(effective || {})); } catch (e) {}
                    store.logout();
                    window.location.hash = '#blocked';
                }
            } catch (e) {}
        }, 20000);
    }

    if (baseHash === '#login' && auth.isAuthenticated()) {
        window.location.hash = '#dashboard';
        return;
    }
    
    // Dynamic Route Handling
    let route = routes[baseHash];
    let component = null;
    let authRequired = true;
    let requiredPermission = null;
    

    if (route) {
        component = route.component;
        authRequired = route.auth;
        requiredPermission = route.permission || null;
        
    } else if (baseHash.startsWith('#employees/edit/')) {
        const id = baseHash.split('/edit/')[1];
        // Fetch employee data first
        const emp = await store.getEmployeeById(id);
        if (!emp) {
            Toast.show("Employé introuvable", "error");
            window.location.hash = '#employees';
            return;
        }
        component = () => EmployeeForm(emp);
        authRequired = true;
        requiredPermission = 'employees.manage';
        
    } else if (baseHash.startsWith('#sales/edit/')) {
        const id = baseHash.split('/edit/')[1];
        const sale = await store.getSaleById(id);
        if (!sale) {
            Toast.show("Intervention introuvable", "error");
            window.location.hash = '#dashboard';
            return;
        }
        component = () => SalesForm(sale);
        authRequired = true;
        
    } else if (baseHash.startsWith('#invoice/')) {
        const id = baseHash.split('/invoice/')[1];
        let sale = await store.getSaleById(id);
        
        if (store.getEmployees().length === 0) {
            try { await store.fetchEmployees(); } catch (e) {}
        }
        if (!sale) {
            Toast.show("Facture introuvable", "error");
            window.location.hash = '#dashboard';
            return;
        }
        component = () => Invoice(sale);
        authRequired = true;
        

    } else {
        // Fallback or 404
        window.location.hash = auth.isAuthenticated() ? '#dashboard' : '#login';
        return;
    }

    // Auth Guard
    if (authRequired && !auth.isAuthenticated()) {
        window.location.hash = '#login';
        return;
    }

    if (requiredPermission) {
        const user = auth.getUser();
        const allowedSync = store.hasPermissionSync(user, requiredPermission);
        const allowed = allowedSync ? true : await store.hasPermission(user, requiredPermission);
        if (!allowed) {
            Toast.show("Accès refusé.", "error");
            window.location.hash = '#dashboard';
            return;
        }
    }

    

    // Show Loading State (safe)
    {
        const existingSpinner = document.getElementById('loading-spinner');
        if (!existingSpinner && !app.innerHTML.trim()) {
            // Only full screen spinner on first load
            const spinner = `
            <div id="loading-spinner" class="flex items-center justify-center h-full">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>`;
            try { app.innerHTML = renderLayout(spinner); } catch (e) { app.innerHTML = spinner; }
        } else if (!existingSpinner) {
            // On subsequent navigations, maybe show a top progress bar or small overlay
            // For now, let's keep content but maybe add a class to indicate loading if needed
            // Or just do nothing and let content swap instantly when ready
        }
    }

    try {
        // Data Fetching based on route
        let content = '';

        if (baseHash === '#employees') {
            await store.fetchSales(); // Need sales for calculation
            const employees = await store.fetchEmployees();
            content = EmployeesList(employees);
        } else if (baseHash === '#dashboard' || baseHash === '') {
            await Promise.all([
                store.fetchSales(), 
                store.fetchPayrollSettings(),
                store.fetchEmployees(),
                store.fetchWebhookSettings(),
                store.fetchTimeEntries()
            ]);
            content = Dashboard();
        } else if (baseHash === '#sales') {
            await Promise.all([
                 // fetchSalesPage will be called inside component, but MySales still uses full list logic
                 // For now, keep loading full list for MySales or refactor MySales too
                 store.fetchSales(), 
                 store.fetchPayrollSettings()
            ]);
            content = MySales();
        } else if (baseHash === '#admin-sales') {
            // Optimization: Do NOT load all sales here. AdminSales component will load via pagination.
            // Just load employees for the filters.
            await store.fetchEmployees();
            content = AdminSales();

        } else if (baseHash === '#admin-stats') {
            await Promise.all([store.fetchSales(), store.fetchEmployees(), store.fetchPayrollSettings()]);
            content = AdminStats();
        } else if (baseHash === '#admin-config') {
            try {
                content = AdminConfig();
            } catch (err) {
                console.error("Error executing AdminConfig:", err);
                content = `<div class="text-red-500 p-8">Erreur de chargement du module Configuration: ${err.message}</div>`;
            }
        } else if (baseHash === '#archives') {
            content = Archives();
        } else if (baseHash.startsWith('#pointeuse')) {

            // Handle deep links from Discord buttons
            try {
                const params = parseHashParams();
                if (params.action) {
                    const user = auth.getUser();
                    if (!user) {
                        Toast.show("Connecte-toi pour exécuter l'action.", "warning");
                        window.location.hash = '#login';
                    } else {
                        if (params.action === 'clock_in') {
                            await store.clockIn(user.id);
                            Toast.show("Arriver: service démarré", "success");
                        } else if (params.action === 'clock_out') {
                            await store.clockOut(user.id);
                            Toast.show("Sortir: service terminé", "success");
                        } else if (params.action === 'pause') {
                            await store.pauseService(user.id);
                            Toast.show("Pause activée", "info");
                            await Discord.updateServiceStatus();
                        } else if (params.action === 'resume') {
                            await store.resumeService(user.id);
                            Toast.show("Reprise du service", "success");
                            await Discord.updateServiceStatus();
                        }
                        // Clean the hash to avoid re-trigger on refresh
                        setTimeout(() => { window.location.hash = '#pointeuse'; }, 150);
                    }
                }
            } catch (e) {
                console.warn("Deep link action error:", e);
            }
            content = Pointeuse();
        } else {
            // Static components or those that don't need pre-fetched lists
            const result = component();
            if (result instanceof Promise) {
                content = await result;
            } else {
                content = result;
            }
        }

        try { app.innerHTML = renderLayout(content); } catch (e) { app.innerHTML = content; }
        if (window.lucide) lucide.createIcons();
        attachListeners(hash);

        if (hash === '#admin-stats') {
            initAdminStatsCharts();
        } else if (hash === '#order-kit') {
            initOrderRepairKit();
        }

    } catch (error) {
        console.error("Navigation error:", error);
        app.innerHTML = renderLayout(`
            <div class="text-center p-8 text-red-600">
                <h2 class="text-xl font-bold">Une erreur est survenue</h2>
                <p>${error.message}</p>
                <button onclick="window.location.reload()" class="mt-4 bg-orange-500 text-white px-4 py-2 rounded">Réessayer</button>
            </div>
        `);
    }
}

function parseHashParams() {
    const h = window.location.hash || '';
    const qIndex = h.indexOf('?');
    if (qIndex < 0) return {};
    const query = h.slice(qIndex + 1);
    const params = {};
    query.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return params;
}

function attachListeners(hash) {
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
        });
    }

    const adminToggle = document.getElementById('sidebar-admin-toggle');
    const adminGroup = document.getElementById('sidebar-admin-group');
    const adminChevron = document.getElementById('sidebar-admin-chevron');
    const applyAdminOpen = (open, persist = true) => {
        if (!adminGroup) return;
        adminGroup.classList.toggle('hidden', !open);
        if (adminChevron) adminChevron.classList.toggle('rotate-180', open);
        if (persist) {
            try { localStorage.setItem('sidebar_admin_open', open ? '1' : '0'); } catch (e) {}
        }
    };
    if (adminToggle && adminGroup) {
        adminToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = !adminGroup.classList.contains('hidden');
            applyAdminOpen(!isOpen, true);
        });
    }

    try { localStorage.removeItem('sidebar_compact'); } catch (e) {}

    const sidebarSearch = document.getElementById('sidebar-search');
    const filterNav = (termRaw) => {
        const term = String(termRaw || '').trim().toLowerCase();
        const links = Array.from(document.querySelectorAll('#sidebar a[data-nav-label]'));
        if (links.length === 0) return;
        let anyAdminMatch = false;
        links.forEach(a => {
            const label = String(a.getAttribute('data-nav-label') || '').toLowerCase();
            const match = !term || label.includes(term);
            a.style.display = match ? '' : 'none';
            if (match && (a.getAttribute('data-nav-group') || '') === 'admin') anyAdminMatch = true;
        });
        if (!term) {
            const persisted = (() => {
                try { return localStorage.getItem('sidebar_admin_open') === '1'; } catch (e) { return false; }
            })();
            applyAdminOpen(persisted, false);
        } else if (adminGroup && adminToggle) {
            applyAdminOpen(anyAdminMatch, false);
        }
    };
    if (sidebarSearch) {
        sidebarSearch.addEventListener('input', () => {
            try { sessionStorage.setItem('sidebar_search', sidebarSearch.value || ''); } catch (e) {}
            filterNav(sidebarSearch.value);
        });
        filterNav(sidebarSearch.value);
    }

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const userInput = document.getElementById('username');
        try {
            const last = localStorage.getItem('last_username');
            if (userInput && last) userInput.value = last;
            if (userInput) userInput.focus();
        } catch (e) {}
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const remember = document.getElementById('remember-me')?.checked;
            if (remember) localStorage.setItem('remember_login', '1'); else localStorage.removeItem('remember_login');
            try {
                if (submitBtn) { 
                    submitBtn.disabled = true; 
                    submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Connexion...</span></span>'; 
                    if (window.lucide) lucide.createIcons();
                }
                const user = await store.login(formData.get('username'), formData.get('password'));
                if (user) {
                    try { localStorage.setItem('last_username', String(formData.get('username') || '')); } catch (e) {}
                    window.location.hash = '#dashboard';
                } else {
                    document.getElementById('login-error').classList.remove('hidden');
                }
            } catch (err) {
                console.error(err);
                if (err && err.code === 'ACCOUNT_LOCKED') {
                    try { sessionStorage.setItem('imo_account_lock', JSON.stringify(err.lockMeta || {})); } catch (e) {}
                    window.location.hash = '#blocked';
                    return;
                }
                Toast.show("Erreur de connexion", "error");
            } finally {
                if (submitBtn) { 
                    submitBtn.disabled = false; 
                    submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><i data-lucide="log-in" class="w-4 h-4"></i><span>Se connecter</span></span>'; 
                    if (window.lucide) lucide.createIcons();
                }
            }
        });
        const pwdInput = document.getElementById('password');
        const userErr = document.getElementById('username-error');
        const pwdErr = document.getElementById('password-error');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        function validateLogin() {
            const u = userInput ? userInput.value.trim() : '';
            const p = pwdInput ? pwdInput.value : '';
            const uValid = u.length >= 3;
            const pValid = p.length >= 1;
            if (userErr) userErr.classList.toggle('hidden', uValid);
            if (pwdErr) pwdErr.classList.toggle('hidden', pValid);
            if (userInput) {
                userInput.classList.toggle('border-red-600', !uValid);
                userInput.classList.toggle('border-slate-700', uValid);
            }
            if (pwdInput) {
                pwdInput.classList.toggle('border-red-600', !pValid);
                pwdInput.classList.toggle('border-slate-700', pValid);
            }
            if (submitBtn) submitBtn.disabled = !(uValid && pValid);
        }
        if (userInput) {
            userInput.addEventListener('input', validateLogin);
            userInput.addEventListener('blur', validateLogin);
        }
        const toggleBtn = document.getElementById('btn-toggle-password');
        if (toggleBtn && pwdInput) {
            toggleBtn.addEventListener('click', () => {
                const newType = pwdInput.type === 'password' ? 'text' : 'password';
                pwdInput.type = newType;
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', newType === 'password' ? 'eye' : 'eye-off');
                    lucide.createIcons();
                }
            });
        }
        if (pwdInput) {
            const capsWarn = document.getElementById('caps-warning');
            pwdInput.addEventListener('keyup', (ev) => {
                if (!capsWarn) return;
                const caps = ev.getModifierState && ev.getModifierState('CapsLock');
                capsWarn.classList.toggle('hidden', !caps);
            });
            pwdInput.addEventListener('input', validateLogin);
            pwdInput.addEventListener('blur', validateLogin);
            validateLogin();
        }
        const help = document.getElementById('login-help');
        if (help) {
            help.addEventListener('click', (ev) => {
                ev.preventDefault();
                Modal.show({
                    title: 'Besoin d\'aide ?',
                    message: '<div class="space-y-2"><p class="text-slate-300">Si tu rencontres un problème de connexion, vérifie ton identifiant et ton mot de passe ou contacte l\'administrateur.</p><p class="text-slate-400 text-sm">Discord: #support • Email: support@driveline.local</p></div>',
                    type: 'info',
                    confirmText: 'Fermer',
                    cancelText: null
                });
            });
        }
    }

    // Sales Form (Now Interventions)
    const salesForm = document.getElementById('sales-form');
    if (salesForm) {
        const normalizePlate = (v) => {
            return String(v || '')
                .toUpperCase()
                .replace(/\s+/g, '')
                .replace(/[^A-Z0-9\-]/g, '')
                .slice(0, 16);
        };
        const plateInput = salesForm.querySelector('input[name="plate"]') || salesForm.querySelector('input[name="vehicleModel"]');
        if (plateInput) {
            plateInput.addEventListener('input', () => {
                plateInput.value = normalizePlate(plateInput.value);
            });
        }
        const serviceTypeSelect = salesForm.querySelector('select[name="serviceType"]');
        if (serviceTypeSelect) {
            // no listener needed anymore
        }
        salesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            // UI Loading State
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Envoi en cours...`;
            if (window.lucide) lucide.createIcons();

            const formData = new FormData(e.target);
            const user = auth.getUser();
            const id = formData.get('id');

            try {
                const canCreate = user && await store.hasPermission(user, 'sales.create');
                if (!canCreate) {
                    Toast.show("Compte bloqué: impossible d'enregistrer une intervention.", 'error');
                    return;
                }
            } catch (e) {
                Toast.show("Impossible de vérifier les permissions.", 'error');
                return;
            }

            try {
                // Basic validation
                const serviceType = (formData.get('serviceType') || '').toString().trim();
                let plate = normalizePlate((formData.get('plate') || formData.get('vehicleModel') || '').trim());
                
                // Handle disabled plate input for 'Réparation'
                if (!plate && serviceType === 'Réparation') {
                    const plateInputEl = salesForm.querySelector('input[name="plate"]');
                    if (plateInputEl && plateInputEl.value) {
                         plate = normalizePlate(plateInputEl.value);
                    }
                    if (!plate) plate = 'REPARATION';
                }

                let priceStr = (formData.get('price') || '').toString().trim().replace(',', '.');
                const priceNum = Number(priceStr);

                // --- SPECIAL HANDLING: VENTE KIT (Safe Only, No Employee Stats) ---
                if (plate === 'VENTEKIT') {
                    await store.createRepairKitSale({
                        price: priceNum,
                        clientName: formData.get('clientName'),
                        clientPhone: formData.get('clientPhone')
                    });
                    Toast.show('Vente Kit enregistrée (Stock MAJ, hors stats employées)', 'success');
                    window.location.hash = '#dashboard';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    return;
                }
                // ------------------------------------------------------------------

                if (!plate || plate.length < 3) {
                    Toast.show("Veuillez renseigner une plaque valide.", "warning");
                    return;
                }
                if (!serviceType) {
                    Toast.show("Veuillez sélectionner le type de prestation.", "warning");
                    return;
                }
                if (!priceStr || !isFinite(priceNum) || priceNum <= 0) {
                    Toast.show("Veuillez renseigner un prix valide.", "warning");
                    return;
                }

                // Upload Files
                let invoiceUrl = formData.get('existingInvoiceUrl') || null;
                let photoUrl = formData.get('existingPhotoUrl') || null;

                const invoiceFile = formData.get('invoiceFile');
                if (invoiceFile && invoiceFile.size > 0) {
                    invoiceUrl = await store.uploadFile(invoiceFile, 'invoices');
                }

                const photoFile = formData.get('photoFile');
                if (photoFile && photoFile.size > 0) {
                    photoUrl = await store.uploadFile(photoFile, 'photos');
                }
                
                const empParamMatch = (window.location.hash || '').match(/employee=([^&]+)/);
                const employeeFromForm = formData.get('employeeId');
                const canAssign = user && await store.hasPermission(user, 'sales.manage');
                const targetEmployeeId = canAssign
                    ? (employeeFromForm || (empParamMatch ? empParamMatch[1] : user.id))
                    : user.id;
                const saleData = {
                    id: id || generateId(),
                    employeeId: targetEmployeeId,
                    date: new Date().toISOString(),
                    clientName: null,
                    clientPhone: null,
                    vehicleModel: plate,
                    plate: plate,
                    serviceType: serviceType,
                    price: priceNum,
                    cost: Number(formData.get('cost') || 0),
                    invoiceUrl: invoiceUrl,
                    photoUrl: photoUrl
                };
            
                await store.saveSale(saleData);
                Toast.show(id ? 'Intervention modifiée avec succès !' : 'Intervention enregistrée avec succès !');

                if (canAssign) {
                    const redirectEmpId = targetEmployeeId;
                    window.location.hash = `#admin-sales?employee=${redirectEmpId}`;
                } else {
                    window.location.hash = '#dashboard';
                }
            } catch (err) {
                Toast.show("Erreur lors de l'enregistrement : " + err.message, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    const contractForm = document.getElementById('contract-form');
    if (contractForm) {
        // handled inside view
    }

    // Global Functions for inline clicks
    window.deleteSale = async (id) => {
        Modal.show({
            title: 'Supprimer l\'intervention',
            message: 'Êtes-vous sûr de vouloir supprimer cette intervention ?',
            type: 'danger',
            confirmText: 'Supprimer',
            onConfirm: async () => {
                try {
                    await store.deleteSale(id);
                    Toast.show('Intervention supprimée !');
                    // Refresh current view if needed
                    if (window.location.hash === '#admin-sales' || window.location.hash === '#sales') {
                        navigate();
                    }
                } catch (err) {
                    Toast.show("Erreur lors de la suppression : " + err.message, "error");
                }
            }
        });
    };

    window.deleteEmployee = async (id) => {
        Modal.show({
            title: 'Supprimer l\'employé',
            message: 'Êtes-vous sûr de vouloir supprimer cet employé ?',
            type: 'danger',
            confirmText: 'Supprimer',
            onConfirm: async () => {
                try {
                    await store.deleteEmployee(id);
                    Toast.show("Employé supprimé");
                    setTimeout(() => navigate(), 1000); // Re-render
                } catch (err) {
                    Toast.show("Erreur suppression : " + err.message, "error");
                }
            }
        });
    };

    // Toggle Sidebar for Mobile
    window.toggleSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (sidebar && overlay) {
            const isClosed = sidebar.classList.contains('-translate-x-full');
            if (isClosed) {
                // Open
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
                setTimeout(() => overlay.classList.remove('opacity-0'), 10); // Fade in
            } else {
                // Close
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300); // Wait for fade out
            }
        }
    };

    // Toggle Compact Mode (Zen Mode)
    // Removed upon user request
    window.toggleCompactMode = () => {
        // no-op or removed
    };

    // Safe display updater removed
}

// Init
// initPayrollNotifier(); // Start 45min loop
// initAutoArchiver(); // Start the auto-archive background check

// Global error handler to catch "contract check failed" promises
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.includes('employment_contracts')) {
        console.warn("Ignored missing contracts table error to keep app alive.");
        event.preventDefault(); // Prevent crash
    }
});

// Subscribe to global announcements
try {
    store.subscribeToAnnouncements((announcement) => {
        // Play notification sound if available?
        // const audio = new Audio('/assets/sounds/notification.mp3'); audio.play().catch(()=>{});
        
        Modal.show({
            title: '📢 ANNONCE GÉNÉRALE',
            message: `
                <div class="text-center">
                    <div class="text-lg text-white font-medium mb-4 leading-relaxed">${announcement.content}</div>
                    <div class="text-xs text-slate-500 uppercase font-bold">
                        Par ${announcement.author_name || 'Direction'} • ${new Date(announcement.created_at).toLocaleTimeString()}
                    </div>
                </div>
            `,
            type: 'info',
            confirmText: 'Bien reçu',
            width: 'max-w-xl'
        });
    });
} catch (e) {
    console.error("Announcement subscription error:", e);
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);

// --- GLOBAL ACTIVITY TRACKER ---
let _lastActivityUpdate = 0;
const _throttleTime = 300000; // 5 minutes

const updateActivity = async () => {
    const now = Date.now();
    if (now - _lastActivityUpdate > _throttleTime) {
        _lastActivityUpdate = now;
        try {
            const user = auth.getUser();
            if (user) {
                await store.updateLastActivity(user.id);
            }
        } catch (e) {
            console.warn("Activity update failed", e);
        }
    }
};

// Listen for interactions
['mousedown', 'keydown', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, updateActivity, { passive: true });
});

 
