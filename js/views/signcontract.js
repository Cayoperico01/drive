import { store } from '../store.js';
import { Toast } from '../toast.js';

export async function SignContract() {
    const user = store.getCurrentUser();
    if (!user) return '';

    const contractHtml = generateContractTemplate(user);

    setTimeout(() => {
        const form = document.getElementById('sign-contract-form');
        const signatureInput = document.getElementById('signature-input');
        const acceptCheck = document.getElementById('accept-check');
        const submitBtn = document.getElementById('btn-sign');

        if (form) {
            const validate = () => {
                const name = (signatureInput.value || '').trim().toLowerCase();
                const expected = `${user.firstName} ${user.lastName}`.toLowerCase();
                // Loose matching to avoid frustration
                const validName = name.length > 3; 
                submitBtn.disabled = !acceptCheck.checked || !validName;
            };

            signatureInput.addEventListener('input', validate);
            acceptCheck.addEventListener('change', validate);

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin w-4 h-4 mr-2"></i> Signature en cours...';
                if (window.lucide) lucide.createIcons();

                try {
                    await store.signEmploymentContract({
                        employee_id: user.id,
                        signature: signatureInput.value.trim(),
                        content_html: contractHtml,
                        role_at_signature: user.role
                    });
                    
                    Toast.show("Contrat signé avec succès ! Bienvenue.", "success");
                    
                    // Force reload to update permissions/status if needed, or just navigate
                    window.location.hash = '#dashboard';
                    // Optional: reload page to clear any cached state
                    // window.location.reload(); 
                } catch (err) {
                    console.error(err);
                    Toast.show("Erreur lors de la signature.", "error");
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Signer le contrat';
                }
            });
        }
    }, 100);

    return `
        <div class="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div class="max-w-4xl w-full bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                <!-- Contract Preview (Scrollable) -->
                <div class="flex-1 p-8 md:p-12 overflow-y-auto max-h-[80vh] bg-slate-50 border-r border-slate-200">
                    <div class="prose prose-slate prose-sm max-w-none">
                        ${contractHtml}
                    </div>
                </div>

                <!-- Action Panel -->
                <div class="w-full md:w-80 bg-white p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200 z-10 shadow-xl">
                    <div class="mb-6 text-center">
                        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                            <i data-lucide="pen-tool" class="w-8 h-8"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">Signature Requise</h2>
                        <p class="text-sm text-slate-500 mt-2">Veuillez lire et signer votre contrat pour accéder à l'intranet.</p>
                    </div>

                    <form id="sign-contract-form" class="space-y-6">
                        <div class="space-y-3">
                            <label class="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input type="checkbox" id="accept-check" class="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                                <span class="text-sm text-slate-600 select-none">Je déclare avoir lu et accepté les termes du présent contrat de travail.</span>
                            </label>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider">Signature électronique</label>
                            <input type="text" id="signature-input" placeholder="Tapez votre Prénom et Nom" 
                                class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-serif text-lg italic text-slate-800 placeholder:not-italic placeholder:text-slate-400 placeholder:font-sans transition-all">
                            <p class="text-xs text-slate-400">Pour valider, tapez : <span class="font-bold text-slate-600">${user.firstName} ${user.lastName}</span></p>
                        </div>

                        <button type="submit" id="btn-sign" disabled class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                            <i data-lucide="file-signature" class="w-5 h-5"></i>
                            <span>Signer le contrat</span>
                        </button>
                    </form>
                    
                    <div class="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button onclick="store.logout(); window.location.reload();" class="text-xs text-red-500 hover:text-red-700 font-medium hover:underline">
                            Se déconnecter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateContractTemplate(user) {
    const d = new Date().toLocaleDateString('fr-FR');
    const roleLabel = formatRole(user.role);
    
    // Calculate prime percentage dynamically based on role logic
    let rolePrimes = { 'mecano_confirme': 15, 'mecano_junior': 15, 'chef_atelier': 15, 'patron': 0, 'co_patron': 0 };
    try {
        const cached = localStorage.getItem('db_payroll_role_primes');
        if (cached) rolePrimes = JSON.parse(cached);
    } catch (e) {}

    const getPrimePctForRole = (role) => {
        const effectiveRole = role === 'mecano' ? 'mecano_confirme' : role;
        const v = Number(rolePrimes && rolePrimes[effectiveRole]);
        if (isFinite(v) && v >= 0) return Math.max(0, Math.min(100, Math.round(v)));
        return 15; // Default fallback updated
    };
    
    const commissionRate = getPrimePctForRole(user.role);

    return `
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold uppercase tracking-widest text-slate-900 mb-2">Contrat de Travail</h1>
            <div class="text-xs font-bold text-slate-400 uppercase">DriveLine Customs • Los Santos</div>
        </div>

        <div class="mb-8 text-xs font-mono text-slate-500 flex justify-between border-b border-slate-200 pb-2">
            <span>Date: ${d}</span>
            <span>Réf: EMP-${user.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <p class="mb-4"><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
        
        <p class="mb-4">
            <strong>L'Entreprise DriveLine Customs</strong>, dont le siège social est situé à Los Santos, représentée par la Direction.<br>
            Ci-après dénommée "l'Employeur",
        </p>

        <p class="mb-6">
            <strong>ET</strong><br><br>
            <strong>M./Mme ${user.firstName} ${user.lastName}</strong><br>
            Ci-après dénommé(e) "le Salarié",
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 1 - Engagement et Fonctions</h3>
        <p class="mb-4">
            Le Salarié est engagé en qualité de <strong>${roleLabel}</strong>. 
            Il s'engage à consacrer son activité professionnelle au service de l'entreprise et à respecter les directives données par la hiérarchie.
        </p>
        <p class="mb-4">
            Ses missions principales incluent :
            <ul class="list-disc pl-5 space-y-1 mt-2">
                <li>Réalisation des prestations mécaniques et d'entretien.</li>
                <li>Accueil et conseil de la clientèle.</li>
                <li>Respect des procédures de sécurité et d'hygiène.</li>
                <li>Maintien de la propreté des locaux et du matériel.</li>
            </ul>
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 2 - Rémunération</h3>
        <p class="mb-4">
            En contrepartie de son travail, le Salarié percevra une rémunération composée de :
            <ul class="list-disc pl-5 space-y-1 mt-2">
                <li>Un taux horaire de <strong>500$ / heure</strong> de service effectif (pointage).</li>
                <li>Une commission sur le chiffre d'affaires généré, selon le barème en vigueur (actuellement <strong>${commissionRate}%</strong> pour votre poste).</li>
                <li>Des primes éventuelles selon les performances et décisions de la direction.</li>
            </ul>
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 3 - Horaires de Travail</h3>
        <p class="mb-4">
            Les horaires de travail sont flexibles et définis selon les besoins de l'activité. 
            Le Salarié doit impérativement utiliser le système de pointage pour enregistrer ses heures de prise et fin de service. 
            Toute heure non pointée ne pourra être rémunérée.
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 4 - Confidentialité et Loyauté</h3>
        <p class="mb-4">
            Le Salarié est tenu à une obligation de discrétion absolue concernant les informations confidentielles de l'entreprise et de ses clients. 
            Il s'engage à ne pas détourner la clientèle à son profit ou au profit d'un tiers.
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 5 - Règlement Intérieur</h3>
        <p class="mb-4">
            Le Salarié déclare avoir pris connaissance du règlement intérieur de l'entreprise et s'engage à le respecter. 
            Tout manquement pourra faire l'objet de sanctions disciplinaires pouvant aller jusqu'au licenciement.
        </p>
        
        <div class="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between items-end">
            <div class="text-center w-1/3">
                <div class="text-xs font-bold uppercase text-slate-400 mb-4">Pour l'Employeur</div>
                <div class="font-serif font-bold text-lg text-slate-900">La Direction</div>
            </div>
            <div class="text-center w-1/3">
                <div class="text-xs font-bold uppercase text-slate-400 mb-4">Le Salarié</div>
                <div class="font-serif italic text-slate-500">(Signature électronique en attente)</div>
            </div>
        </div>
    `;
}

function formatRole(role) {
    const map = {
        'patron': 'Patron',
        'co_patron': 'Co-Patron',
        'chef_atelier': 'Chef d\'Atelier',
        'mecano_confirme': 'Mécano Confirmé',
        'mecano_junior': 'Mécano Junior',
        'responsable_rh': 'Responsable RH'
    };
    return map[role] || role;
}

function getRoleBaseRate(role) {
    // Hardcoded fallbacks if DB settings not loaded, pure display
    const map = {
        'patron': 0,
        'co_patron': 0,
        'chef_atelier': 0,
        'mecano_confirme': 0,
        'mecano_junior': 0
    };
    return map[role] || 0;
}
