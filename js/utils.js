export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getLastSaturday = (d) => {
    const date = new Date(d);
    const t = new Date(date);
    while(t.getDay() !== 6) {
        t.setDate(t.getDate() - 1);
    }
    t.setHours(0, 0, 0, 0);
    return t;
};

export const getWeekRange = () => {
    // Modification demande utilisateur : Retrait du reset automatique du samedi.
    // La plage couvre désormais une période très large.
    // Le reset se fait uniquement via l'action manuelle "Clôturer / Archiver".
    const start = new Date(0); // 01/01/1970
    const end = new Date();
    end.setFullYear(end.getFullYear() + 100); // Futur lointain
    return { start, end };
};

export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const estimateAiLikelihood = (text) => {
    const raw = String(text || '');
    const t = raw.trim();
    if (!t) return { score: 0, level: 'faible', signals: [] };

    const normalized = t
        .replace(/\s+/g, ' ')
        .replace(/[“”«»]/g, '"')
        .replace(/[’]/g, "'")
        .trim();

    const words = normalized.split(' ').filter(Boolean);
    const wordCount = words.length;
    const charCount = normalized.length;

    const lower = normalized.toLowerCase();
    const sentences = normalized.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const avgSentenceWords = sentences.length ? (wordCount / sentences.length) : wordCount;
    const sentenceWordCounts = sentences.map(s => s.split(/\s+/).filter(Boolean).length).filter(n => n > 0);
    const mean = sentenceWordCounts.length ? (sentenceWordCounts.reduce((a, b) => a + b, 0) / sentenceWordCounts.length) : avgSentenceWords;
    const variance = sentenceWordCounts.length
        ? (sentenceWordCounts.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / sentenceWordCounts.length)
        : 0;
    const stddev = Math.sqrt(variance);

    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-zàâäçéèêëîïôöùûüÿœ'-]/gi, ''))).size;
    const uniqueRatio = wordCount ? uniqueWords / wordCount : 0;

    const punctuationCount = (normalized.match(/[,:;!?]/g) || []).length;
    const punctuationRatio = charCount ? punctuationCount / charCount : 0;

    const signals = [];
    let score = 0;

    if (wordCount < 25) {
        return { score: 0, level: 'faible', signals: ['Texte trop court'] };
    }

    if (charCount >= 700) { score += 10; signals.push('Texte très long'); }
    if (wordCount >= 220) { score += 10; signals.push('Beaucoup de mots'); }
    else if (wordCount >= 160) { score += 6; signals.push('Texte long'); }
    if (avgSentenceWords >= 24) { score += 12; signals.push('Phrases très longues'); }
    else if (avgSentenceWords >= 19) { score += 6; signals.push('Phrases longues'); }
    if (sentenceWordCounts.length >= 4 && stddev <= 4.5 && wordCount >= 120) { score += 12; signals.push('Phrases très régulières'); }
    if (uniqueRatio >= 0.72 && wordCount >= 140) { score += 10; signals.push('Vocabulaire très varié'); }
    if (punctuationRatio >= 0.040) { score += 8; signals.push('Ponctuation très régulière'); }
    else if (punctuationRatio >= 0.032) { score += 4; signals.push('Ponctuation régulière'); }

    const templatePhrases = [
        'en tant que',
        'je suis passionné',
        'je suis passionnée',
        "je serais ravi",
        "je serais ravie",
        "je serais heureux",
        "je serais heureuse",
        "je suis enthousiaste",
        "je suis motivé",
        "je suis motivée",
        "je m'engage",
        "je m’engage",
        'je comprends les attentes',
        'je comprends les règles',
        'je suis prêt à',
        'je suis prête à',
        'je reste à votre disposition',
        'dans le cadre de',
        'je souhaite vous rejoindre',
        'je souhaite rejoindre',
        'je vous remercie',
        'dans l\'attente de votre retour',
        'merci de votre attention',
        'veuillez agréer',
        'cordialement',
        'en résumé',
        'pour conclure',
        'en conclusion'
    ];
    const foundTemplates = templatePhrases.filter(p => lower.includes(p));
    if (foundTemplates.length >= 2) {
        score += 26;
        signals.push('Phrases très “template”');
    } else if (foundTemplates.length === 1) {
        score += 12;
        signals.push('Une phrase “template”');
    }

    const connectors = [
        'de plus',
        'par ailleurs',
        'en outre',
        'ainsi',
        'cependant',
        'toutefois',
        'dans ce contexte',
        'en effet',
        'dans un premier temps',
        'dans un second temps',
        'dans un premier lieu',
        'dans un second lieu'
    ];
    const connectorHits = connectors.reduce((acc, c) => acc + (lower.split(c).length - 1), 0);
    if (connectorHits >= 5) { score += 14; signals.push('Beaucoup de connecteurs logiques'); }
    else if (connectorHits >= 3) { score += 8; signals.push('Connecteurs logiques'); }

    const lines = t.split('\n').map(l => l.trim());
    const bulletLines = lines.filter(l => /^([-*•]|(\d+[\).]))\s+/.test(l)).length;
    if (bulletLines >= 5) { score += 10; signals.push('Structure en liste'); }
    else if (bulletLines >= 3) { score += 6; signals.push('Structure en liste'); }

    const headingLike = lines.filter(l => /^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒ][A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒ\s'-]{3,}$/.test(l)).length;
    if (headingLike >= 2) { score += 6; signals.push('Texte très structuré'); }

    const repeatedLines = t.split('\n').map(l => l.trim()).filter(Boolean);
    const dupLineCount = repeatedLines.length - new Set(repeatedLines).size;
    if (dupLineCount >= 2) { score += 6; signals.push('Lignes répétées'); }

    const digitsCount = (normalized.match(/\d/g) || []).length;
    const timeHits = (normalized.match(/\b(\d{1,2}h(\d{2})?|\d{1,2}:\d{2})\b/g) || []).length;
    const dayHits = (normalized.match(/\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|week-end|weekend)\b/gi) || []).length;
    const hasConcreteDetails = digitsCount >= 8 || timeHits >= 1 || dayHits >= 1 || /\b(rp|fivem|gta|discord|whitelist|ticket|wl)\b/i.test(normalized);
    if (!hasConcreteDetails && wordCount >= 110) { score += 12; signals.push('Peu de détails concrets'); }
    if (hasConcreteDetails) { score -= 10; signals.push('Détails concrets présents'); }

    const slangHits = (normalized.match(/\b(mdr|ptdr|jpp|tkt|wesh|fréro|frere|bg|stp|svp)\b/gi) || []).length;
    if (slangHits >= 2) { score -= 10; signals.push('Style très spontané'); }
    else if (slangHits === 1) { score -= 6; signals.push('Style spontané'); }

    const emojiHits = (normalized.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
    if (emojiHits >= 3) { score -= 8; signals.push('Beaucoup d’emojis'); }

    const capsWords = words.filter(w => /^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒ]{3,}$/.test(w)).length;
    if (capsWords >= 6) { score -= 6; signals.push('Beaucoup de MAJUSCULES'); }

    if (wordCount < 70) score = score * 0.75;
    else if (wordCount < 110) score = score * 0.9;

    score = Math.max(0, Math.min(100, Math.round(score)));
    const level = score >= 65 ? 'élevé' : score >= 35 ? 'moyen' : 'faible';

    const finalSignals = [];
    for (const s of signals) {
        if (!finalSignals.includes(s)) finalSignals.push(s);
        if (finalSignals.length >= 6) break;
    }

    return { score, level, signals: finalSignals };
};
