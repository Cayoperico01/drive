import { store } from '../store.js';

export async function Login() {
    let brandLogoUrl = null;
    try {
        // 1. Try Local Storage first (fast)
        try {
            const settings = JSON.parse(localStorage.getItem('webhook_settings'));
            if (settings && settings.brand_logo_url) brandLogoUrl = settings.brand_logo_url;
        } catch(e) {}
        
        if (!brandLogoUrl) brandLogoUrl = localStorage.getItem('brand_logo_url');

        // 2. If not found, fetch from Server (async)
        if (!brandLogoUrl) {
            const settings = await store.fetchWebhookSettings();
            if (settings && settings.brand_logo_url) brandLogoUrl = settings.brand_logo_url;
        }
    } catch (e) {
        console.warn("Error loading brand logo:", e);
    }

    const renderLogo = (sizeClass = "w-20 h-20", containerClass = "bg-blue-600/20 p-3 border-blue-500/30") => {
        if (brandLogoUrl) {
            return `<div class="${containerClass} rounded-2xl inline-block mb-6 border shadow-lg">
                <img src="${brandLogoUrl}" alt="logo" class="${sizeClass} object-contain rounded-lg">
            </div>`;
        }
        return `<div class="${containerClass} rounded-2xl inline-block mb-6 border shadow-lg"><i data-lucide="wrench" class="w-12 h-12 text-blue-400"></i></div>`;
    };

    const renderMobileLogo = () => {
        if (brandLogoUrl) {
            return `<div class="bg-blue-600 p-1 rounded-lg"><img src="${brandLogoUrl}" alt="logo" class="w-8 h-8 object-contain rounded"></div><span class="text-xl font-bold text-white">DriveLine</span>`;
        }
        return `<div class="bg-blue-600 p-2 rounded-lg"><i data-lucide="wrench" class="w-6 h-6 text-white"></i></div><span class="text-xl font-bold text-white">DriveLine</span>`;
    };

    return `
        <div class="login-page min-h-screen w-full flex bg-slate-900 text-white">
            
            <!-- Left Side: Image / Brand -->
            <div class="hidden lg:flex lg:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
                <div class="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=2070&auto=format&fit=crop" 
                         alt="DriveLine Customs" 
                         class="w-full h-full object-cover opacity-45 mix-blend-overlay">
                </div>
                <div class="absolute inset-0 z-0 bg-gradient-to-br from-[#dd3bcc]/20 via-black/30 to-[#4bb4d3]/20"></div>
                <div class="absolute inset-0 z-0 opacity-40 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.07)_0,rgba(255,255,255,0.07)_1px,transparent_1px,transparent_12px)]"></div>
                <div class="absolute -left-24 -top-24 w-80 h-80 rounded-full blur-3xl bg-[#dd3bcc]/20"></div>
                <div class="absolute -right-24 -bottom-24 w-80 h-80 rounded-full blur-3xl bg-[#4bb4d3]/20"></div>

                <div class="relative z-10 p-12 text-white max-w-xl">
                    ${renderLogo()}
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700 text-[11px] text-slate-300 font-semibold tracking-wide mb-6 glass">
                        <span class="inline-block w-2 h-2 rounded-full bg-[#dd3bcc]"></span>
                        <span class="inline-block w-2 h-2 rounded-full bg-[#4bb4d3]"></span>
                        <span>Garage OS • Atelier • Compta • Pointeuse</span>
                    </div>
                    <h1 class="text-5xl font-extrabold mb-5 tracking-tight">DriveLine Customs</h1>
                    <p class="text-lg text-slate-300 leading-relaxed max-w-lg">
                        Pilote l'atelier en temps réel: interventions, pointages, paie et performance. Un cockpit clair, rapide et solide.
                    </p>

                    <div class="mt-10 grid grid-cols-2 gap-4">
                        <div class="flex items-center gap-3 rounded-2xl bg-slate-900/55 border border-slate-800 p-4 glass">
                            <div class="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20"><i data-lucide="wrench" class="w-5 h-5 text-blue-400"></i></div>
                            <div>
                                <div class="text-sm font-bold text-white">Interventions</div>
                                <div class="text-xs text-slate-400">suivi clair</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 rounded-2xl bg-slate-900/55 border border-slate-800 p-4 glass">
                            <div class="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20"><i data-lucide="clock" class="w-5 h-5 text-blue-400"></i></div>
                            <div>
                                <div class="text-sm font-bold text-white">Pointeuse</div>
                                <div class="text-xs text-slate-400">présences live</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 rounded-2xl bg-slate-900/55 border border-slate-800 p-4 glass">
                            <div class="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20"><i data-lucide="banknote" class="w-5 h-5 text-blue-400"></i></div>
                            <div>
                                <div class="text-sm font-bold text-white">Paie</div>
                                <div class="text-xs text-slate-400">réglages rapides</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 rounded-2xl bg-slate-900/55 border border-slate-800 p-4 glass">
                            <div class="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20"><i data-lucide="bar-chart-3" class="w-5 h-5 text-blue-400"></i></div>
                            <div>
                                <div class="text-sm font-bold text-white">Stats</div>
                                <div class="text-xs text-slate-400">performances</div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Decorative Elements -->
                <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>

            <!-- Right Side: Login Form -->
            <div class="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative">
                <!-- Mobile Logo (visible only on small screens) -->
                <div class="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    ${renderMobileLogo()}
                </div>

                <div class="w-full max-w-md">
                    <div class="rounded-3xl bg-slate-900/70 border border-slate-700 shadow-lg p-7 lg:p-8 glass">
                        <div class="h-1 w-full rounded-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc] mb-7"></div>
                        <div class="text-center lg:text-left">
                            <h2 class="text-3xl font-extrabold text-white tracking-tight">Bienvenue</h2>
                            <p class="mt-2 text-slate-300">Connectez-vous pour accéder à l'atelier.</p>
                        </div>

                        <form id="login-form" class="space-y-6 mt-8">
                        <div class="space-y-5">
                            <div>
                                <label for="username" class="block text-sm font-medium text-slate-300 mb-1.5">Identifiant</label>
                                <div class="relative group">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i data-lucide="user" class="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                    </div>
                                    <input type="text" name="username" id="username" required autocomplete="off"
                                        class="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm" 
                                        placeholder="Entrez votre identifiant">
                                </div>
                                <p id="username-error" class="hidden mt-1 text-xs text-red-400">Identifiant requis (3 caractères minimum).</p>
                            </div>

                            <div>
                                <label for="password" class="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
                                <div class="relative group">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i data-lucide="lock" class="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                    </div>
                                    <input type="password" name="password" id="password" required autocomplete="off"
                                        class="block w-full pl-10 pr-12 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm" 
                                        placeholder="••••••••">
                                    <button type="button" id="btn-toggle-password" class="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-200 focus:outline-none">
                                        <i data-lucide="eye" class="h-5 w-5"></i>
                                    </button>
                                </div>
                                <div id="caps-warning" class="hidden text-xs mt-2 text-yellow-400">Vérifie: MAJ activée</div>
                                <p id="password-error" class="hidden mt-1 text-xs text-red-400">Mot de passe requis.</p>
                            </div>
                        </div>

                        <div class="flex items-center justify-between">
                            <label class="inline-flex items-center gap-2 text-sm text-slate-300">
                                <input type="checkbox" id="remember-me" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                                Se souvenir de moi
                            </label>
                        </div>

                        <div id="login-error" class="hidden rounded-lg bg-red-900/20 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <i data-lucide="x-circle" class="h-5 w-5 text-red-400"></i>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-red-200">Erreur de connexion</h3>
                                    <div class="mt-2 text-sm text-red-300">
                                        Identifiant ou mot de passe incorrect.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" 
                            class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 has-sheen hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            <span class="inline-flex items-center gap-2"><i data-lucide="log-in" class="w-4 h-4"></i><span>Se connecter</span></span>
                        </button>

                        <div class="relative py-4">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-slate-700"></div>
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="px-2 bg-slate-900 text-slate-500">Ou</span>
                            </div>
                        </div>

                        <a href="#apply" 
                            class="w-full flex justify-center py-3 px-4 border border-slate-700 rounded-xl shadow-sm text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                            <span class="inline-flex items-center gap-2">
                                <i data-lucide="file-text" class="w-4 h-4"></i>
                                <span>Postuler chez DriveLine</span>
                            </span>
                        </a>

                        <a href="#order-kit" 
                            class="w-full flex justify-center py-3 px-4 border border-orange-500/30 bg-orange-500/5 rounded-xl shadow-sm text-sm font-bold text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 transition-all">
                            <span class="inline-flex items-center gap-2">
                                <i data-lucide="package" class="w-4 h-4"></i>
                                <span>Commander Kit Réparation</span>
                            </span>
                        </a>
                        </form>
                    </div>

                    <p class="text-center text-xs text-slate-500 mt-8">
                        &copy; ${new Date().getFullYear()} DriveLine Customs. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    `;
}
