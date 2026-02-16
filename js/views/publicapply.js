import { store } from '../store.js';
import { Toast } from '../toast.js';

export function PublicApply() {
    setTimeout(initApplyForm, 50);

    return `
        <div class="h-screen bg-slate-950 p-4 font-sans relative overflow-y-auto overflow-x-hidden">
            <!-- Background Decorations -->
            <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div class="w-full max-w-3xl relative z-10 mx-auto py-8">
                
                <!-- Brand Header -->
                <div class="text-center mb-8 animate-fade-in-down">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl mb-4 group relative overflow-hidden">
                        <div class="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <i data-lucide="wrench" class="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform duration-300"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-white tracking-tight mb-1">DriveLine Customs</h1>
                    <p class="text-slate-400 text-sm">Rejoignez l'équipe d'élite</p>
                </div>

                <!-- Form Card -->
                <div id="apply-card" class="w-full bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in-up">
                    
                    <!-- Card Header -->
                    <div class="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <i data-lucide="file-signature" class="w-5 h-5 text-blue-400"></i>
                                Formulaire de Recrutement
                            </h2>
                            <p class="text-slate-400 text-xs mt-1">Complétez soigneusement tous les champs ci-dessous.</p>
                        </div>
                        <div id="status-badge" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wide transition-colors shadow-lg shadow-green-900/20">
                            <span id="status-dot" class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                            <span id="status-text">Ouvert</span>
                        </div>
                    </div>

                    <div class="p-8">
                        <form id="apply-form" class="space-y-8">
                            
                            <!-- Section 1: Identité -->
                            <div class="space-y-4">
                                <h3 class="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <span class="w-8 h-px bg-blue-500/50"></span>
                                    Identité & Discord
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="group">
                                        <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Nom Prénom (RP)</label>
                                        <div class="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                            <div class="pl-4 pr-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                                <i data-lucide="id-card" class="w-4 h-4"></i>
                                            </div>
                                            <input type="text" name="fullName" required 
                                                class="w-full bg-transparent border-none py-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 font-medium"
                                                placeholder="Ex: John Doe">
                                        </div>
                                    </div>
                                    <div class="group">
                                        <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Âge (HRP)</label>
                                        <div class="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                            <div class="pl-4 pr-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                                <i data-lucide="calendar" class="w-4 h-4"></i>
                                            </div>
                                            <input type="number" name="age" required min="14" max="99"
                                                class="w-full bg-transparent border-none py-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 font-medium"
                                                placeholder="18">
                                        </div>
                                    </div>

                                    <div class="group">
                                        <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">ID Unique (PMA)</label>
                                        <div class="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                            <div class="pl-4 pr-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                                <i data-lucide="fingerprint" class="w-4 h-4"></i>
                                            </div>
                                            <input type="text" name="uniqueId" required 
                                                class="w-full bg-transparent border-none py-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 font-medium"
                                                placeholder="Ex: 12345">
                                        </div>
                                    </div>

                                    <div class="group">
                                        <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Numéro Téléphone IG</label>
                                        <div class="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                            <div class="pl-4 pr-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                                <i data-lucide="phone" class="w-4 h-4"></i>
                                            </div>
                                            <input type="text" name="phoneIg" required 
                                                class="w-full bg-transparent border-none py-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 font-medium"
                                                placeholder="Ex: 555-0123">
                                        </div>
                                    </div>
                                    <div class="group">
                                        <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Pseudo Discord</label>
                                        <div class="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                            <div class="pl-4 pr-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                                <i data-lucide="at-sign" class="w-4 h-4"></i>
                                            </div>
                                            <input type="text" name="discordId" required 
                                                class="w-full bg-transparent border-none py-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 font-medium"
                                                placeholder="ex: johndoe">
                                        </div>
                                    </div>
                                    <div class="group">
                                        <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">ID Discord</label>
                                        <div class="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                            <div class="pl-4 pr-3 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                                <i data-lucide="hash" class="w-4 h-4"></i>
                                            </div>
                                            <input type="text" name="discordUid" pattern="[0-9]+"
                                                class="w-full bg-transparent border-none py-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 font-medium"
                                                placeholder="Ex: 3456789012345678">
                                        </div>
                                        <p class="text-[10px] text-slate-500 mt-1.5 flex items-start gap-1.5 px-1 opacity-60 hover:opacity-100 transition-opacity">
                                            <i data-lucide="info" class="w-3 h-3 mt-0.5 flex-shrink-0"></i>
                                            <span>Mode dév > Clic droit profil > Copier l'identifiant.</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 3: Profil Pro -->
                            <div class="space-y-4">
                                <h3 class="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <span class="w-8 h-px bg-blue-500/50"></span>
                                    Expérience & Motivations
                                </h3>
                                
                                <div class="group">
                                    <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Expérience Mécano / RP</label>
                                    <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                        <textarea name="experience" required rows="3"
                                            class="w-full bg-transparent border-none p-4 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 resize-none leading-relaxed"
                                            placeholder="Détaillez vos expériences passées (autres serveurs, entreprises, etc.)..."></textarea>
                                    </div>
                                </div>

                                <div class="group">
                                    <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Motivations</label>
                                    <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                        <textarea name="motivation" required rows="4"
                                            class="w-full bg-transparent border-none p-4 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 resize-none leading-relaxed"
                                            placeholder="Pourquoi voulez-vous rejoindre DriveLine Customs ? Qu'apporterez-vous à l'entreprise ?"></textarea>
                                    </div>
                                </div>

                                <div class="group">
                                    <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Disponibilités</label>
                                    <div class="flex items-start bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                        <div class="pl-4 pt-4 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                            <i data-lucide="clock" class="w-4 h-4"></i>
                                        </div>
                                        <textarea name="availability" required rows="2"
                                            class="w-full bg-transparent border-none p-4 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 resize-none leading-relaxed"
                                            placeholder="Ex: Soirs de semaine 20h-00h, Week-end après-midi..."></textarea>
                                    </div>
                                </div>

                                <!-- Captcha -->
                                <div class="group pt-2">
                                    <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Sécurité (Anti-Robot)</label>
                                    <div class="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                        <div class="pl-4 pr-3 text-blue-400 font-mono font-bold text-lg select-none tracking-widest" id="captcha-label">
                                            ...
                                        </div>
                                        <input type="number" id="captcha-input" required 
                                            class="w-full bg-transparent border-none py-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 font-medium"
                                            placeholder="Résultat du calcul">
                                        <button type="button" id="refresh-captcha" class="pr-4 pl-2 text-slate-500 hover:text-white transition-colors" title="Nouveau calcul">
                                            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer Actions -->
                            <div class="pt-6 flex items-center justify-between border-t border-white/5">
                                <a href="#" class="group flex items-center gap-2 text-slate-500 hover:text-white text-xs font-medium transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                                    <i data-lucide="arrow-left" class="w-3 h-3 group-hover:-translate-x-0.5 transition-transform"></i>
                                    Retour
                                </a>
                                
                                <button type="submit" 
                                    class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5">
                                    <span>Envoyer ma candidature</span>
                                    <i data-lucide="send" class="w-4 h-4"></i>
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
                
                <p class="text-center text-slate-600 text-xs mt-6">
                    &copy; 2026 DriveLine Customs. Tous droits réservés.
                </p>
            </div>
        </div>
    `;
}

function initApplyForm() {
    // Initialiser les icônes immédiatement
    lucide.createIcons();

    const form = document.getElementById('apply-form');
    if (!form) return;

    // --- CHECK RECRUITMENT STATUS ---
    store.fetchWebhookSettings().then(settings => {
        const isOpen = settings?.recruitment_open ?? true;
        const badge = document.getElementById('status-badge');
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');
        
        if (!isOpen) {
            // Update Badge
            if (badge) badge.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wide transition-colors";
            if (dot) dot.className = "w-2 h-2 rounded-full bg-red-500";
            if (text) text.textContent = "Fermé";
            
            // Disable Form
            const elements = form.querySelectorAll('input, textarea, button');
            elements.forEach(el => {
                el.disabled = true;
                el.classList.add('opacity-50', 'cursor-not-allowed');
            });
            
            // Overlay message
            const msg = document.createElement('div');
            msg.className = "mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center font-medium backdrop-blur-sm";
            msg.innerHTML = "<p class='flex items-center justify-center gap-2'><i data-lucide='lock' class='w-4 h-4'></i> Les sessions de recrutement sont actuellement fermées.</p>";
            form.prepend(msg);
            lucide.createIcons();
        }
    });

    // --- CAPTCHA LOGIC ---
    let captchaResult = 0;
    
    function generateCaptcha() {
        const n1 = Math.floor(Math.random() * 10) + 1; // 1-10
        const n2 = Math.floor(Math.random() * 10) + 1; // 1-10
        captchaResult = n1 + n2;
        
        const label = document.getElementById('captcha-label');
        const input = document.getElementById('captcha-input');
        
        if (label) label.textContent = `${n1} + ${n2} =`;
        if (input) input.value = '';
    }
    
    // Init Captcha
    generateCaptcha();
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-captcha');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const icon = refreshBtn.querySelector('i');
            if (icon) icon.classList.add('animate-spin');
            setTimeout(() => icon && icon.classList.remove('animate-spin'), 500);
            generateCaptcha();
        });
    }
    // ---------------------

    // Validation ID Discord en temps réel
    const uidInput = form.querySelector('input[name="discordUid"]');
    if(uidInput) {
        uidInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check Captcha
        const captchaInput = document.getElementById('captcha-input');
        if (!captchaInput || parseInt(captchaInput.value) !== captchaResult) {
            Toast.show("Calcul de sécurité incorrect. Réessayez.", "error");
            captchaInput.parentElement.classList.add('ring-2', 'ring-red-500', 'animate-shake');
            setTimeout(() => captchaInput.parentElement.classList.remove('ring-2', 'ring-red-500', 'animate-shake'), 500);
            captchaInput.value = '';
            captchaInput.focus();
            generateCaptcha(); // Regenerate to prevent brute force
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;
        
        // Loading state
        btn.disabled = true;
        btn.classList.add('opacity-75', 'cursor-not-allowed');
        btn.innerHTML = `
            <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
            </span>
        `;

        const formData = new FormData(form);
        const data = {
            fullName: formData.get('fullName'),
            discordId: formData.get('discordId'),
            discordUid: formData.get('discordUid'),
            uniqueId: formData.get('uniqueId'),
            phoneIg: formData.get('phoneIg'),
            age: formData.get('age'),
            experience: formData.get('experience'),
            motivation: formData.get('motivation'),
            availability: formData.get('availability')
        };

        try {
            const saved = await store.submitApplication(data);
            
            // Success State Animation
            const container = document.getElementById('apply-card') || form.parentElement;
            const successHtml = `
                <div class="flex flex-col items-center justify-center p-12 text-center animate-fade-in min-h-[500px]">
                    <div class="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-bounce-short shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <i data-lucide="check" class="w-12 h-12 text-green-500"></i>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-3 tracking-tight">Candidature Reçue !</h3>
                    <p class="text-slate-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                        Merci <span class="text-blue-400 font-semibold">${data.fullName}</span>, votre dossier a été transmis à la direction.
                    </p>
                    
                    <div class="mb-8 text-sm text-slate-300 w-full max-w-sm">
                         <div class="bg-slate-800/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                            <div class="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                                <span class="text-slate-500 text-xs uppercase font-bold">N° Dossier</span>
                                <span class="font-mono text-white font-bold bg-slate-700/50 px-2 py-1 rounded text-xs">${saved?.id || '—'}</span>
                            </div>
                            <ul class="text-left space-y-2.5">
                                <li class="flex justify-between text-sm"><span class="text-slate-500">Nom RP</span> <span class="text-slate-200 font-medium">${data.fullName}</span></li>
                                <li class="flex justify-between text-sm"><span class="text-slate-500">Discord</span> <span class="text-slate-200 font-medium">${data.discordId}</span></li>
                            </ul>
                        </div>
                    </div>

                    <a href="#" class="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all border border-white/5 hover:border-white/10 flex items-center gap-2 group">
                        <i data-lucide="home" class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"></i>
                        Retour à l'accueil
                    </a>
                </div>
            `;
            if (container) {
                container.innerHTML = successHtml;
                if (window.lucide) lucide.createIcons();
            }
            setTimeout(() => { window.location.hash = '#login'; }, 6000);

        } catch (err) {
            console.error(err);
            Toast.show("Erreur lors de l'envoi : " + err.message, "error");
            btn.disabled = false;
            btn.classList.remove('opacity-75', 'cursor-not-allowed');
            btn.innerHTML = originalContent;
            lucide.createIcons();
        }
    });
}
