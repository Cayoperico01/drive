import { store } from './store.js';
import { supabase } from './supabaseClient.js';

export const Discord = {
    async _getSettings() {
        try {
            const s = localStorage.getItem('webhook_settings');
            if (s) return JSON.parse(s);
        } catch (e) {}
        try {
            const settings = await store.fetchWebhookSettings();
            return settings || {};
        } catch (e) {
            return {};
        }
    },
    

    getSalesWebhookUrl() {
        try {
            const s = localStorage.getItem('webhook_settings');
            if (s) return JSON.parse(s).sales_webhook_url || '';
        } catch (e) {}
        return '';
    },

    setSalesWebhookUrl(url) {
        try {
            const s = localStorage.getItem('webhook_settings');
            const obj = s ? JSON.parse(s) : {};
            obj.sales_webhook_url = url || '';
            localStorage.setItem('webhook_settings', JSON.stringify(obj));
        } catch (e) {}
    },

    getServicesWebhookUrl() {
        try {
            const s = localStorage.getItem('webhook_settings');
            if (s) return JSON.parse(s).services_webhook_url || '';
        } catch (e) {}
        return '';
    },

    setServicesWebhookUrl(url) {
        try {
            const s = localStorage.getItem('webhook_settings');
            const obj = s ? JSON.parse(s) : {};
            obj.services_webhook_url = url || '';
            localStorage.setItem('webhook_settings', JSON.stringify(obj));
        } catch (e) {}
    },

    getRecruitmentWebhookUrl() {
        try {
            const s = localStorage.getItem('webhook_settings');
            if (s) return JSON.parse(s).recruitment_webhook_url || '';
        } catch (e) {}
        return '';
    },

    setRecruitmentWebhookUrl(url) {
        try {
            const s = localStorage.getItem('webhook_settings');
            const obj = s ? JSON.parse(s) : {};
            obj.recruitment_webhook_url = url || '';
            localStorage.setItem('webhook_settings', JSON.stringify(obj));
        } catch (e) {}
    },

    async ensureServiceStatusMessage() {
        const settings = await this._getSettings();
        const url = settings.services_webhook_url || this.getServicesWebhookUrl();
        if (!url) return null;
        let messageId = settings.services_status_message_id || '';
        // If no message id, create one
        if (!messageId) {
            const payload = {
                embeds: [{
                    title: "🔎 Utilisateur(s) en service - (0)",
                    description: "Aucun utilisateur n'est en service... :(",
                    color: 3447003
                }]
            };
            try {
                const resp = await fetch(url + '?wait=true', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const json = await resp.json();
                messageId = json?.id || '';
            } catch (e) {
                console.error('Erreur création message status Discord:', e);
                return null;
            }
            if (messageId) {
                // Persist gracefully: if DB write fails (RLS), still continue using localStorage
                try {
                    await store.saveWebhookSettings(settings.sales_webhook_url, url, messageId);
                } catch (e) {
                    console.warn('Impossible d’enregistrer le messageId en base (RLS probable). Utilisation du cache local uniquement.');
                }
                try {
                    const obj = Object.assign({}, settings, { services_status_message_id: messageId, services_webhook_url: url });
                    localStorage.setItem('webhook_settings', JSON.stringify(obj));
                } catch (e) {}
            }
        }
        return { url, messageId };
    },

    async updateServiceStatus() {
        const info = await this.ensureServiceStatusMessage();
        if (!info) return;
        const { url, messageId } = info;
        try {
            // Build current active list
            let timeEntries = await store.fetchTimeEntries();
            const employees = store.getEmployees().length ? store.getEmployees() : await store.fetchEmployees();
            let active = timeEntries.filter(t => !t.clock_out);
            if (active.length === 0) {
                const { data } = await supabase
                    .from('time_entries')
                    .select('employee_id, clock_in, clock_out')
                    .is('clock_out', null);
                active = data || [];
            }
            const count = active.length;
            const names = active.map(a => {
                const emp = employees.find(e => e.id === a.employee_id);
                return emp ? `${emp.first_name} ${emp.last_name}` : a.employee_id;
            });
            const desc = count > 0 
                ? names.map(n => `• ${n}`).join('\n')
                : "Aucun utilisateur n'est en service... :(";
            const embed = {
                title: `🔎 Utilisateur(s) en service - (${count})`,
                description: desc,
                color: count > 0 ? 5763719 : 15105570,
                footer: { text: "Mise à jour • " + new Date().toLocaleString('fr-FR') }
            };
            let base = '';
            try {
                base = localStorage.getItem('app_base_url') || '';
                if (!base && typeof window !== 'undefined' && window.location && /^https?:\/\//.test(window.location.origin)) {
                    base = window.location.origin;
                }
            } catch (e) {}
            const components = base ? [{
                type: 1,
                components: [
                    { type: 2, style: 5, label: 'Arriver', url: `${base}/#pointeuse?action=clock_in` },
                    { type: 2, style: 5, label: 'Pause', url: `${base}/#pointeuse?action=pause` },
                    { type: 2, style: 5, label: 'Reprendre', url: `${base}/#pointeuse?action=resume` },
                    { type: 2, style: 5, label: 'Sortir', url: `${base}/#pointeuse?action=clock_out` }
                ]
            }] : [];
            const editUrl = url.replace(/\/$/, '') + `/messages/${messageId}`;
            await fetch(editUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed], components })
            });
        } catch (e) {
            console.error('Erreur mise à jour status Discord:', e);
        }
    },

    async sendLog(type, title, description, color = 3447003, fields = [], overrideUrl = '', content = '', allowedMentions = null) {
        let url = '';
        if (overrideUrl) url = overrideUrl;
        try {
            if (!url) {
                const settings = await store.fetchWebhookSettings();
                if (type === 'sales') {
                    url = (settings && settings.sales_webhook_url) || this.getSalesWebhookUrl();
                } else if (type === 'services') {
                    url = (settings && settings.services_webhook_url) || this.getServicesWebhookUrl();
                }
            }
        } catch (e) {}
        
        // Fallbacks hardcoded
        if (!url && type === 'services') url = "https://discord.com/api/webhooks/1458256143049560189/zDR_SHsoYBvJX6qQHVy7yvvu51wOUhlBF9bwTeTWlFm9PJxrCpJLEo0Tmq_Rd2JBZpO3";

        if (!url) return;

        const payload = {
            username: "DriveLine Customs Bot",
            avatar_url: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=2070&auto=format&fit=crop",
            content: content || '',
            allowed_mentions: allowedMentions || { parse: [] },
            embeds: [{
                title: title,
                description: description,
                color: color,
                fields: fields,
                footer: {
                    text: "DriveLine Management System • " + new Date().toLocaleString('fr-FR')
                }
            }]
        };

        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error(`Erreur lors de l'envoi du log Discord (${type}):`, error);
        }
    },

    logSale(sale, employeeName) {
        this.sendLog(
            'sales',
            "💰 Nouvelle Facture",
            `**${employeeName}** a enregistré une prestation.`,
            5763719,
            [
                { name: "Client", value: sale.clientName, inline: true },
                { name: "Véhicule", value: sale.vehicleModel, inline: true },
                { name: "Prestation", value: sale.serviceType, inline: true },
                { name: "Montant", value: `${sale.price} $`, inline: true }
            ]
        );
    },

    logClockIn(employeeName) {
        setTimeout(() => this.updateServiceStatus(), 400);
    },

    logClockOut(employeeName, duration) {
        setTimeout(() => this.updateServiceStatus(), 400);
    },

    async logApplication(applicant, ai) {
        const isObj = applicant && typeof applicant === 'object';
        const applicantName = isObj ? (applicant.fullName || applicant.full_name || 'Candidat') : String(applicant || 'Candidat');

        const fields = [];
        if (isObj && applicant.id) fields.push({ name: 'Dossier', value: String(applicant.id).substring(0, 100), inline: true });
        if (isObj && applicant.age !== undefined && applicant.age !== null && String(applicant.age).trim()) {
            fields.push({ name: 'Âge', value: String(applicant.age).substring(0, 30), inline: true });
        }
        if (isObj && applicant.uniqueId) {
            fields.push({ name: 'ID Unique', value: String(applicant.uniqueId), inline: true });
        }
        if (isObj && applicant.phoneIg) {
            fields.push({ name: 'Tél IG', value: String(applicant.phoneIg), inline: true });
        }
        if (isObj) {
            const handle = String(applicant.discordId ?? applicant.discord_id ?? '').trim();
            const uid = String(applicant.discordUid ?? applicant.discord_user_id ?? '').trim();
            const discordValue = [handle, uid ? `(${uid})` : ''].filter(Boolean).join(' ');
            if (discordValue) fields.push({ name: 'Discord', value: discordValue.substring(0, 1024), inline: true });
        }
        if (ai && typeof ai.score === 'number') {
            const sig = Array.isArray(ai.signals) ? ai.signals.slice(0, 5) : [];
            const details = sig.length ? `\n${sig.map(s => `• ${s}`).join('\n')}` : '';
            fields.push({
                name: 'IA (heuristique)',
                value: `Score: ${Math.round(ai.score)}/100 • Niveau: ${ai.level || '—'}${details}`.substring(0, 1024),
                inline: false
            });
        }

        let overrideUrl = '';
        try {
            const settings = await store.fetchWebhookSettings();
            const servicesUrl = (settings && settings.services_webhook_url) ? String(settings.services_webhook_url) : '';
            const recruitmentUrl = (settings && settings.recruitment_webhook_url) ? String(settings.recruitment_webhook_url) : '';
            overrideUrl = servicesUrl || recruitmentUrl;
        } catch (e) {}
        if (!overrideUrl) {
            try {
                overrideUrl = this.getServicesWebhookUrl() || this.getRecruitmentWebhookUrl() || '';
            } catch (e) {}
        }

        try {
            const roleId = '1455996633992134912';
            this.sendLog(
                'services',
                "📝 Nouvelle Candidature",
                `**${applicantName}** vient de postuler chez DriveLine Customs.`,
                10181046,
                fields,
                overrideUrl,
                `<@&${roleId}>`,
                { roles: [roleId] }
            );
        } catch (e) {
            console.warn('Erreur log candidature Discord:', e);
        }
    },

    logRejection(applicantName, discordId) {
        this.sendLog(
            'services',
            "⛔ Candidature Refusée",
            `La candidature de **${applicantName}** (<@${discordId}>) a été refusée.`,
            15548997,
            []
        );
    },

    async logEmployeeFired(employee, reason, due) {
        const url = "https://discord.com/api/webhooks/1461010616356704392/CRIDnTY7JnGdhGGdKFnplW8yANQqR45SXPM-UzuUKeiNBmHSPvSbBRbWVlecUVC2zbt6";
        if (!url) return;

        const discordId = employee.discord_id || employee.discordId || '';
        const hasNumericId = /^\d{15,20}$/.test(String(discordId));
        const mention = discordId ? (hasNumericId ? `<@${discordId}>` : String(discordId)) : 'Non renseigné';
        const name = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.username || 'Employé';
        const role = employee.role || 'N/A';
        const keepRoleId = "1455996639964696761";
        const removeRoleIds = ["1456003578790678560", "1455996638232449218"];
        const currentUser = store.getCurrentUser();
        const firedBy = currentUser 
            ? `${currentUser.firstName || currentUser.first_name || ''} ${currentUser.lastName || currentUser.last_name || ''}`.trim() || currentUser.username 
            : 'Système';

        const fields = [
            { name: 'Nom', value: name, inline: true },
            { name: 'Rôle', value: role, inline: true }
        ];

        if (discordId) {
            fields.push({ name: 'Discord', value: hasNumericId ? `<@${discordId}> (${discordId})` : String(discordId), inline: true });
        }

        if (reason && reason.length) {
            fields.push({ name: 'Motif', value: reason.substring(0, 1024), inline: false });
        }

        if (due && typeof due.totalDue === 'number') {
            const fmt = (n) => `${Math.round(n).toLocaleString('fr-FR')} $`;
            fields.push({ name: 'Montant dû', value: fmt(due.totalDue), inline: true });
            fields.push({ name: 'Détail', value: `Heures: ${due.totalHours.toFixed(1)}h × ${fmt(due.hourlyRate)}\nVentes: ${fmt(due.totalSales)} • Com: ${fmt(due.commission)}`, inline: false });
        }
        fields.push({ name: 'Rôles à retirer', value: removeRoleIds.map(r => `<@&${r}>`).join('\n'), inline: false });
        fields.push({ name: 'Rôle à conserver', value: `<@&${keepRoleId}>`, inline: true });
        fields.push({ name: 'Licencié par', value: firedBy, inline: true });
        fields.push({ name: 'Date', value: new Date().toLocaleString('fr-FR'), inline: true });

        const payload = {
            username: "DriveLine Customs Bot",
            content: hasNumericId ? `<@${discordId}>` : '',
            allowed_mentions: hasNumericId ? { users: [String(discordId)] } : { parse: [] },
            embeds: [{
                title: '🔴 Employé viré',
                description: `L'employé **${name}** a été retiré de l'équipe et de la comptabilité.\nID Discord: ${mention}`,
                color: 15548997,
                fields,
                footer: { text: "DriveLine Management System • " + new Date().toLocaleString('fr-FR') },
                timestamp: new Date().toISOString()
            }]
        };

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error("Erreur envoi webhook licenciement:", e);
        }
    },

    async notifyRecruitmentDecision(status, applicantName, discordHandleOrId, reason, credentials = null) {
        let url = this.getRecruitmentWebhookUrl();
        
        // Fallback hardcoded if not set in config
        if (!url) {
            url = "https://discord.com/api/webhooks/1462768022522695833/DgYzNSYRiVSk5rfho0Ym3-fLHCAytv3bsVqF9ICNLhzcTD3sC6UsROv5mWhUN6fpZQn5";
        }

        if (!url) return;

        let brandLogoUrl = '';
        try {
            const v = localStorage.getItem('brand_logo_url') || '';
            if (v && /^https?:\/\//.test(v)) brandLogoUrl = v;
        } catch (e) {}

        const isNumericId = /^\d{15,20}$/.test(String(discordHandleOrId));
        const mention = isNumericId ? `<@${discordHandleOrId}>` : `@${discordHandleOrId}`;
        const color = status === 'accepted' ? 5763719 : 15548997;
        const title = status === 'accepted' ? 'Candidature acceptée' : 'Candidature refusée';

        const seed = String(discordHandleOrId || applicantName).replace(/[^a-zA-Z0-9]/g, '') || 'candidate';
        const avatarUrl = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundType=gradient&fontWeight=700`;

        const intro = status === 'accepted'
            ? `Bonne nouvelle: ta candidature a été acceptée.`
            : `Ta candidature n'a pas été retenue.`;

        let channelId = '1458257475773010152';
        try {
            const stored = localStorage.getItem('discord_response_channel_id');
            if (stored && /^\d+$/.test(stored)) channelId = stored;
        } catch(e) {}

        const channelMention = `<#${channelId}>`;
        const stepsText = status === 'accepted'
            ? `Prochaines étapes:\n- Présente-toi dans ${channelMention}\n- Contacte le RH\n- Crée un ticket "Autres" pour la suite\n\n**IMPORTANT:** Tes identifiants pour l'intranet t'ont été envoyés en Message Privé (si tes MP sont ouverts).`
            : `Merci pour ta candidature. Tu peux retenter plus tard si une session rouvre.`;

        const fields = [
            { name: 'Candidat', value: applicantName || '—', inline: true },
            { name: 'Discord', value: mention || '—', inline: true },
            { name: 'Décision', value: status === 'accepted' ? 'Acceptée' : 'Refusée', inline: true },
            { name: 'Date', value: new Date().toLocaleString('fr-FR'), inline: true }
        ];
        if (status === 'accepted') {
            fields.push({ name: 'Salon', value: channelMention, inline: true });
        }
        if (status === 'rejected') {
            const cleanReason = (reason || '').trim();
            if (cleanReason) {
                fields.push({ name: 'Motif', value: cleanReason.substring(0, 1024), inline: false });
            }
        }

        const payload = {
            username: "DriveLine Customs Bot",
            content: isNumericId ? mention : "",
            allowed_mentions: isNumericId ? { users: [String(discordHandleOrId)] } : { parse: [] },
            embeds: [{
                title,
                description: `${mention}\n\n${intro}\n\n${status === 'accepted' ? '' : stepsText}`.trim(),
                color,
                author: { name: applicantName, icon_url: brandLogoUrl || avatarUrl },
                thumbnail: { url: avatarUrl },
                fields,
                footer: { text: "DriveLine Management System • " + new Date().toLocaleString('fr-FR') },
                timestamp: new Date().toISOString()
            }]
        };

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (status === 'accepted' && isNumericId && credentials) {
                const ok = await this.dmCredentialsToUser(discordHandleOrId, credentials);
                if (!ok) await this.logCredentialsForAdmin(applicantName, discordHandleOrId, credentials);
            }


        } catch (e) {
            console.error('Erreur envoi webhook recrutement:', e);
        }
    },

    async dmCredentialsToUser(discordId, credentials) {
        try {
            if (!/^\d{15,22}$/.test(String(discordId))) return false;
            let base = '';
            try {
                base = localStorage.getItem('app_base_url') || '';
                if (!base && typeof window !== 'undefined' && window.location && /^https?:\/\//.test(window.location.origin)) {
                    base = window.location.origin;
                }
            } catch (e) {}
            const parts = [];
            if (base) parts.push(`Lien: ${base}`);
            parts.push(`Utilisateur: ${credentials.username}`);
            parts.push(`Mot de passe: ${credentials.password}`);
            const content = `Bienvenue chez DriveLine Customs.\nVoici tes identifiants temporaires:\n${parts.join('\n')}\nChange-les dès ta première connexion.`;
            const r = await fetch('/api/discord-dm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: String(discordId), content })
            });
            if (!r.ok) return false;
            const j = await r.json().catch(() => ({}));
            return !!j.ok;
        } catch (e) {
            return false;
        }
    },

    

    async logCredentialsForAdmin(applicantName, discordId, credentials) {
        // Send to a private admin channel (Services/Logs) so admins can grab them
        // Using the "Services" webhook which is likely private/internal logs
        
        // We'll reuse sendLog's logic but force it to the "Services" webhook which is for internal logs
        let targetUrl = this.getServicesWebhookUrl();
        if (!targetUrl) targetUrl = "https://discord.com/api/webhooks/1458256143049560189/zDR_SHsoYBvJX6qQHVy7yvvu51wOUhlBF9bwTeTWlFm9PJxrCpJLEo0Tmq_Rd2JBZpO3";

        const base = localStorage.getItem('app_base_url') || 'https://mecano-lsc.netlify.app';

        const payload = {
            username: "DriveLine Secure Bot",
            embeds: [{
                title: "🔐 Identifiants générés",
                description: `Voici les accès pour **${applicantName}** (<@${discordId}>).\n**Merci de lui transmettre en MP.**`,
                color: 3066993,
                fields: [
                    { name: "Lien", value: base, inline: false },
                    { name: "Utilisateur", value: `\`${credentials.username}\``, inline: true },
                    { name: "Mot de passe", value: `|| \`${credentials.password}\` ||`, inline: true }
                ],
                footer: { text: "Visible uniquement par le staff" }
            }]
        };

        try {
            await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error("Erreur log credentials", e);
        }
    },

    async sendRecruitmentStatus(isOpen, reason = '') {
        const url = "https://discord.com/api/webhooks/1456057459788611656/DDdTMVDpybXk3I9ewazbokyBKdcHnHvTaIH8AjwzAcE7oslNtJrFpdoOe2QSjJC3xvx-";
        const roleId = "1455996639964696761";

        const color = isOpen ? 5763719 : 15548997;
        const title = isOpen ? "📢 SESSIONS DE RECRUTEMENT OUVERTES" : "🔒 SESSIONS DE RECRUTEMENT FERMÉES";

        let target = null;
        try {
            const localTarget = store.getRecruitmentTargetCount();
            if (localTarget !== null && !isNaN(Number(localTarget))) target = Number(localTarget);
        } catch (e) {}

        let base = '';
        try {
            base = localStorage.getItem('app_base_url') || '';
            if (!base && typeof window !== 'undefined' && window.location && /^https?:\/\//.test(window.location.origin)) {
                base = window.location.origin;
            }
        } catch (e) {}

        const openDescription = target && target > 0
            ? `Les candidatures sont ouvertes. Postes à pourvoir: ${target}.`
            : "Les candidatures sont désormais ouvertes ! Rejoignez l'équipe DriveLine Customs.";

        const closeDescription = "Les sessions de recrutement sont fermées. Merci de réessayer plus tard.";

        const ansiLines = isOpen
            ? [
                "\u001b[1;32mSTATUT\u001b[0m: OUVERT",
                target && target > 0 ? `\u001b[1;36mPOSTES\u001b[0m: ${target}` : "\u001b[1;36mPOSTES\u001b[0m: Selon besoins",
                base ? "\u001b[1;35mACTION\u001b[0m: Formulaire + Ticket RH" : "\u001b[1;35mACTION\u001b[0m: Ticket RH"
            ]
            : [
                "\u001b[1;31mSTATUT\u001b[0m: FERMÉ"
            ];
        const ansiBlock = `\n\n\
\u0060\u0060\u0060ansi\n${ansiLines.join('\n')}\n\u0060\u0060\u0060`;

        const fields = [];
        if (isOpen) {
            fields.push({ name: 'Postes recherchés', value: target && target > 0 ? String(target) : 'Selon besoins', inline: true });
        } else {
            fields.push({ name: 'Statut', value: 'Fermé', inline: true });
        }

        if (reason && reason.trim()) {
            fields.push({ name: 'Message', value: reason.trim(), inline: false });
        }

        if (isOpen) {
            fields.push({ name: 'Comment postuler', value: `[Clique ici pour remplir le formulaire](https://mecano-lsc.netlify.app/#apply)\nUne fois fait, crée un ticket dans <#1455996671606653155>.`, inline: false });
        }

        const components = isOpen ? [{
            type: 1,
            components: [
                { type: 2, style: 5, label: 'Postuler', url: 'https://mecano-lsc.netlify.app/#apply' }
            ]
        }] : [];

        const payload = {
            username: "DriveLine Customs Bot",
            content: `<@&${roleId}>`,
            allowed_mentions: { roles: [roleId] },
            embeds: [{
                title,
                description: (isOpen ? openDescription : closeDescription) + ansiBlock,
                color,
                fields,
                footer: { text: "DriveLine Management System • " + new Date().toLocaleString('fr-FR') },
                timestamp: new Date().toISOString()
            }],
            components
        };

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error('Erreur envoi notification status recrutement:', e);
        }
    },

    // sendPatchNote removed

    async logAbsence(employeeName, start, end, reason) {
        const url = "https://discord.com/api/webhooks/1463289920260018198/Q9mR44ebuOO2Yw34SSdlom0WvpfrIRTuXrJd7oFPf7r20eYWjdTSU8Gq5SYi7dWht2bb";
        const roleId = "1455996633992134912";

        const fields = [
            { name: 'Employé', value: employeeName, inline: true },
            { name: 'Période', value: `Du ${new Date(start).toLocaleDateString('fr-FR')} au ${new Date(end).toLocaleDateString('fr-FR')}`, inline: true },
            { name: 'Motif', value: reason, inline: false }
        ];

        const payload = {
            username: "DriveLine Customs Bot",
            content: `<@&${roleId}>`,
            allowed_mentions: { roles: [roleId] },
            embeds: [{
                title: "📅 Déclaration d'Absence",
                description: `Une nouvelle absence a été déclarée. Le compte de l'employé a été automatiquement verrouillé pour la période.`,
                color: 10181046, // Purple
                fields: fields,
                footer: { text: "DriveLine Management System • " + new Date().toLocaleString('fr-FR') },
                timestamp: new Date().toISOString()
            }]
        };

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error('Erreur envoi webhook absence:', e);
        }
    }
};
