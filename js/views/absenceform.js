import { store } from '../store.js';
import { auth } from '../auth.js';
import { Toast } from '../toast.js';

export function AbsenceForm() {
    const user = auth.getUser();
    
    setTimeout(() => {
        const form = document.getElementById('absence-form');
        if (form) {
            // Set min date to today
            const today = new Date().toISOString().split('T')[0];
            const startInput = document.getElementById('absence-start');
            const endInput = document.getElementById('absence-end');
            
            if (startInput) startInput.min = today;
            if (endInput) endInput.min = today;

            if (startInput && endInput) {
                startInput.addEventListener('change', () => {
                    endInput.min = startInput.value;
                });
            }

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById('absence-submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Envoi...';
                if (window.lucide) lucide.createIcons();

                const formData = new FormData(e.target);
                const start = formData.get('start');
                const end = formData.get('end');
                const reason = formData.get('reason');

                if (!start || !end || !reason) {
                    Toast.show("Veuillez remplir tous les champs.", "warning");
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Déclarer l\'absence';
                    if (window.lucide) lucide.createIcons();
                    return;
                }

                try {
                    await store.declareAbsence(user.id, { start, end, reason });
                    Toast.show("Absence déclarée et compte bloqué pour la période.", "success");
                    window.location.hash = '#dashboard';
                } catch (err) {
                    console.error(err);
                    Toast.show("Erreur lors de la déclaration : " + err.message, "error");
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Déclarer l\'absence';
                    if (window.lucide) lucide.createIcons();
                }
            });
        }
    }, 100);

    return `
        <div class="max-w-2xl mx-auto animate-fade-in">
            <div class="mb-6 flex items-center gap-4">
                <a href="#dashboard" class="text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="arrow-left" class="w-6 h-6"></i>
                </a>
                <h2 class="text-2xl font-bold text-white">Déclarer une Absence</h2>
            </div>

            <div class="bg-slate-900/70 glass rounded-2xl shadow-lg border border-slate-700 p-7 md:p-8">
                <div class="h-1 w-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 mb-7"></div>
                
                <div class="mb-6 p-4 rounded-xl bg-blue-900/20 border border-blue-700/30 flex items-start gap-3">
                    <i data-lucide="info" class="w-5 h-5 text-blue-400 mt-0.5"></i>
                    <div class="text-sm text-blue-200/80">
                        <p class="font-bold text-blue-300 mb-1">Information importante</p>
                        Déclarer une absence bloquera automatiquement votre compte (création de factures et pointeuse) pour la période indiquée. Une notification sera envoyée à la direction.
                    </div>
                </div>

                <form id="absence-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Date de début</label>
                            <input type="date" id="absence-start" name="start" required class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500 p-3">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Date de fin</label>
                            <input type="date" id="absence-end" name="end" required class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500 p-3">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">Motif de l'absence</label>
                        <textarea name="reason" rows="3" required placeholder="Ex: Vacances, Maladie, Urgence familiale..." class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500 p-3"></textarea>
                    </div>

                    <div class="flex justify-end pt-4">
                        <button id="absence-submit-btn" type="submit" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2">
                            <i data-lucide="send" class="w-4 h-4"></i>
                            Déclarer l'absence
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
