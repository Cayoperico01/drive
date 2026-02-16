export function Blocked() {
    let meta = null;
    try {
        const raw = sessionStorage.getItem('imo_account_lock');
        meta = raw ? JSON.parse(raw) : null;
    } catch (e) {
        meta = null;
    }

    const reason = meta && meta.reason != null ? String(meta.reason).trim() : '';
    const start = meta && meta.start != null ? String(meta.start).trim() : '';
    const end = meta && meta.end != null ? String(meta.end).trim() : '';

    const fmtDate = (v) => {
        const s = String(v || '').trim();
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!m) return s || '--';
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        const dt = new Date(Date.UTC(y, mo, d, 0, 0, 0, 0));
        return dt.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const period = (start && end) ? `${fmtDate(start)} → ${fmtDate(end)}` : '';

    const isExpired = (() => {
        const m = String(end || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!m) return false;
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        const endMs = Date.UTC(y, mo, d, 23, 59, 59, 999);
        return Date.now() > endMs;
    })();

    return `
        <div class="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-10 animate-fade-in">
            <div class="w-full max-w-xl bg-slate-900/70 glass rounded-2xl border border-red-500/20 p-8 shadow-lg shadow-black/30">
                <div class="flex items-start gap-4">
                    <div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                        <i data-lucide="lock" class="w-6 h-6"></i>
                    </div>
                    <div class="min-w-0">
                        <h2 class="text-2xl font-extrabold text-white tracking-tight">Compte bloqué</h2>
                        <p class="text-slate-300 mt-1">${isExpired ? 'La période de blocage semble terminée. Reconnecte-toi.' : 'Aucun accès n’est autorisé pendant la période de blocage.'}</p>
                        <div class="mt-5 space-y-2">
                            <div class="text-sm text-slate-300"><span class="text-slate-400">Statut :</span> <span class="font-bold text-red-300">${isExpired ? 'Bloqué (fin passée)' : 'Bloqué'}</span></div>
                            <div class="text-sm text-slate-300 ${period ? '' : 'hidden'}"><span class="text-slate-400">Période :</span> <span class="font-mono">${period}</span></div>
                            <div class="text-sm text-slate-300 ${reason ? '' : 'hidden'}"><span class="text-slate-400">Motif :</span> <span class="font-semibold">${reason}</span></div>
                        </div>
                        <div class="mt-8 flex justify-end gap-3">
                            <button type="button" onclick="try{sessionStorage.removeItem('imo_account_lock')}catch(e){}; window.location.hash='#login';" class="px-6 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors font-semibold">
                                Retour à la connexion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

