var ut="https://pjbhcyhjqapcqrprwkyq.supabase.co",pt="sb_publishable_uEehclX0zJSGFJC9RvLMnA_WcS0kPem",mt="2.0.1";var D=window.supabase.createClient(ut,pt);var _e={async _getSettings(){try{let e=localStorage.getItem("webhook_settings");if(e)return JSON.parse(e)}catch{}try{return await u.fetchWebhookSettings()||{}}catch{return{}}},getSalesWebhookUrl(){try{let e=localStorage.getItem("webhook_settings");if(e)return JSON.parse(e).sales_webhook_url||""}catch{}return""},setSalesWebhookUrl(e){try{let t=localStorage.getItem("webhook_settings"),s=t?JSON.parse(t):{};s.sales_webhook_url=e||"",localStorage.setItem("webhook_settings",JSON.stringify(s))}catch{}},getServicesWebhookUrl(){try{let e=localStorage.getItem("webhook_settings");if(e)return JSON.parse(e).services_webhook_url||""}catch{}return""},setServicesWebhookUrl(e){try{let t=localStorage.getItem("webhook_settings"),s=t?JSON.parse(t):{};s.services_webhook_url=e||"",localStorage.setItem("webhook_settings",JSON.stringify(s))}catch{}},getRecruitmentWebhookUrl(){try{let e=localStorage.getItem("webhook_settings");if(e)return JSON.parse(e).recruitment_webhook_url||""}catch{}return""},setRecruitmentWebhookUrl(e){try{let t=localStorage.getItem("webhook_settings"),s=t?JSON.parse(t):{};s.recruitment_webhook_url=e||"",localStorage.setItem("webhook_settings",JSON.stringify(s))}catch{}},async ensureServiceStatusMessage(){let e=await this._getSettings(),t=e.services_webhook_url||this.getServicesWebhookUrl();if(!t)return null;let s=e.services_status_message_id||"";if(!s){let a={embeds:[{title:"\u{1F50E} Utilisateur(s) en service - (0)",description:"Aucun utilisateur n'est en service... :(",color:3447003}]};try{s=(await(await fetch(t+"?wait=true",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)})).json())?.id||""}catch(r){return console.error("Erreur cr\xE9ation message status Discord:",r),null}if(s){try{await u.saveWebhookSettings(e.sales_webhook_url,t,s)}catch{console.warn("Impossible d\u2019enregistrer le messageId en base (RLS probable). Utilisation du cache local uniquement.")}try{let r=Object.assign({},e,{services_status_message_id:s,services_webhook_url:t});localStorage.setItem("webhook_settings",JSON.stringify(r))}catch{}}}return{url:t,messageId:s}},async updateServiceStatus(){let e=await this.ensureServiceStatusMessage();if(!e)return;let{url:t,messageId:s}=e;try{let a=await u.fetchTimeEntries(),r=u.getEmployees().length?u.getEmployees():await u.fetchEmployees(),o=a.filter(n=>!n.clock_out);if(o.length===0){let{data:n}=await D.from("time_entries").select("employee_id, clock_in, clock_out").is("clock_out",null);o=n||[]}let l=o.length,i=o.map(n=>{let v=r.find(f=>f.id===n.employee_id);return v?`${v.first_name} ${v.last_name}`:n.employee_id}),c=l>0?i.map(n=>`\u2022 ${n}`).join(`
`):"Aucun utilisateur n'est en service... :(",g={title:`\u{1F50E} Utilisateur(s) en service - (${l})`,description:c,color:l>0?5763719:15105570,footer:{text:"Mise \xE0 jour \u2022 "+new Date().toLocaleString("fr-FR")}},w="";try{w=localStorage.getItem("app_base_url")||"",!w&&typeof window<"u"&&window.location&&/^https?:\/\//.test(window.location.origin)&&(w=window.location.origin)}catch{}let m=w?[{type:1,components:[{type:2,style:5,label:"Arriver",url:`${w}/#pointeuse?action=clock_in`},{type:2,style:5,label:"Pause",url:`${w}/#pointeuse?action=pause`},{type:2,style:5,label:"Reprendre",url:`${w}/#pointeuse?action=resume`},{type:2,style:5,label:"Sortir",url:`${w}/#pointeuse?action=clock_out`}]}]:[],d=t.replace(/\/$/,"")+`/messages/${s}`;await fetch(d,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({embeds:[g],components:m})})}catch(a){console.error("Erreur mise \xE0 jour status Discord:",a)}},async sendLog(e,t,s,a=3447003,r=[],o="",l="",i=null){let c="";o&&(c=o);try{if(!c){let w=await u.fetchWebhookSettings();e==="sales"?c=w&&w.sales_webhook_url||this.getSalesWebhookUrl():e==="services"&&(c=w&&w.services_webhook_url||this.getServicesWebhookUrl())}}catch{}if(!c&&e==="services"&&(c="https://discord.com/api/webhooks/1458256143049560189/zDR_SHsoYBvJX6qQHVy7yvvu51wOUhlBF9bwTeTWlFm9PJxrCpJLEo0Tmq_Rd2JBZpO3"),!c)return;let g={username:"DriveLine Customs Bot",avatar_url:"https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=2070&auto=format&fit=crop",content:l||"",allowed_mentions:i||{parse:[]},embeds:[{title:t,description:s,color:a,fields:r,footer:{text:"DriveLine Management System \u2022 "+new Date().toLocaleString("fr-FR")}}]};try{await fetch(c,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(g)})}catch(w){console.error(`Erreur lors de l'envoi du log Discord (${e}):`,w)}},logSale(e,t){this.sendLog("sales","\u{1F4B0} Nouvelle Facture",`**${t}** a enregistr\xE9 une prestation.`,5763719,[{name:"Client",value:e.clientName,inline:!0},{name:"V\xE9hicule",value:e.vehicleModel,inline:!0},{name:"Prestation",value:e.serviceType,inline:!0},{name:"Montant",value:`${e.price} $`,inline:!0}])},logClockIn(e){setTimeout(()=>this.updateServiceStatus(),400)},logClockOut(e,t){setTimeout(()=>this.updateServiceStatus(),400)},async logApplication(e,t){let s=e&&typeof e=="object",a=s?e.fullName||e.full_name||"Candidat":String(e||"Candidat"),r=[];if(s&&e.id&&r.push({name:"Dossier",value:String(e.id).substring(0,100),inline:!0}),s&&e.age!==void 0&&e.age!==null&&String(e.age).trim()&&r.push({name:"\xC2ge",value:String(e.age).substring(0,30),inline:!0}),s&&e.uniqueId&&r.push({name:"ID Unique",value:String(e.uniqueId),inline:!0}),s&&e.phoneIg&&r.push({name:"T\xE9l IG",value:String(e.phoneIg),inline:!0}),s){let l=String(e.discordId??e.discord_id??"").trim(),i=String(e.discordUid??e.discord_user_id??"").trim(),c=[l,i?`(${i})`:""].filter(Boolean).join(" ");c&&r.push({name:"Discord",value:c.substring(0,1024),inline:!0})}if(t&&typeof t.score=="number"){let l=Array.isArray(t.signals)?t.signals.slice(0,5):[],i=l.length?`
${l.map(c=>`\u2022 ${c}`).join(`
`)}`:"";r.push({name:"IA (heuristique)",value:`Score: ${Math.round(t.score)}/100 \u2022 Niveau: ${t.level||"\u2014"}${i}`.substring(0,1024),inline:!1})}let o="";try{let l=await u.fetchWebhookSettings(),i=l&&l.services_webhook_url?String(l.services_webhook_url):"",c=l&&l.recruitment_webhook_url?String(l.recruitment_webhook_url):"";o=i||c}catch{}if(!o)try{o=this.getServicesWebhookUrl()||this.getRecruitmentWebhookUrl()||""}catch{}try{let l="1455996633992134912";this.sendLog("services","\u{1F4DD} Nouvelle Candidature",`**${a}** vient de postuler chez DriveLine Customs.`,10181046,r,o,`<@&${l}>`,{roles:[l]})}catch(l){console.warn("Erreur log candidature Discord:",l)}},logRejection(e,t){this.sendLog("services","\u26D4 Candidature Refus\xE9e",`La candidature de **${e}** (<@${t}>) a \xE9t\xE9 refus\xE9e.`,15548997,[])},async logEmployeeFired(e,t,s){let a="https://discord.com/api/webhooks/1461010616356704392/CRIDnTY7JnGdhGGdKFnplW8yANQqR45SXPM-UzuUKeiNBmHSPvSbBRbWVlecUVC2zbt6";if(!a)return;let r=e.discord_id||e.discordId||"",o=/^\d{15,20}$/.test(String(r)),l=r?o?`<@${r}>`:String(r):"Non renseign\xE9",i=`${e.first_name||""} ${e.last_name||""}`.trim()||e.username||"Employ\xE9",c=e.role||"N/A",g="1455996639964696761",w=["1456003578790678560","1455996638232449218"],m=u.getCurrentUser(),d=m?`${m.firstName||m.first_name||""} ${m.lastName||m.last_name||""}`.trim()||m.username:"Syst\xE8me",n=[{name:"Nom",value:i,inline:!0},{name:"R\xF4le",value:c,inline:!0}];if(r&&n.push({name:"Discord",value:o?`<@${r}> (${r})`:String(r),inline:!0}),t&&t.length&&n.push({name:"Motif",value:t.substring(0,1024),inline:!1}),s&&typeof s.totalDue=="number"){let f=y=>`${Math.round(y).toLocaleString("fr-FR")} $`;n.push({name:"Montant d\xFB",value:f(s.totalDue),inline:!0}),n.push({name:"D\xE9tail",value:`Heures: ${s.totalHours.toFixed(1)}h \xD7 ${f(s.hourlyRate)}
Ventes: ${f(s.totalSales)} \u2022 Com: ${f(s.commission)}`,inline:!1})}n.push({name:"R\xF4les \xE0 retirer",value:w.map(f=>`<@&${f}>`).join(`
`),inline:!1}),n.push({name:"R\xF4le \xE0 conserver",value:`<@&${g}>`,inline:!0}),n.push({name:"Licenci\xE9 par",value:d,inline:!0}),n.push({name:"Date",value:new Date().toLocaleString("fr-FR"),inline:!0});let v={username:"DriveLine Customs Bot",content:o?`<@${r}>`:"",allowed_mentions:o?{users:[String(r)]}:{parse:[]},embeds:[{title:"\u{1F534} Employ\xE9 vir\xE9",description:`L'employ\xE9 **${i}** a \xE9t\xE9 retir\xE9 de l'\xE9quipe et de la comptabilit\xE9.
ID Discord: ${l}`,color:15548997,fields:n,footer:{text:"DriveLine Management System \u2022 "+new Date().toLocaleString("fr-FR")},timestamp:new Date().toISOString()}]};try{await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(v)})}catch(f){console.error("Erreur envoi webhook licenciement:",f)}},async notifyRecruitmentDecision(e,t,s,a,r=null){let o=this.getRecruitmentWebhookUrl();if(o||(o="https://discord.com/api/webhooks/1462768022522695833/DgYzNSYRiVSk5rfho0Ym3-fLHCAytv3bsVqF9ICNLhzcTD3sC6UsROv5mWhUN6fpZQn5"),!o)return;let l="";try{let p=localStorage.getItem("brand_logo_url")||"";p&&/^https?:\/\//.test(p)&&(l=p)}catch{}let i=/^\d{15,20}$/.test(String(s)),c=i?`<@${s}>`:`@${s}`,g=e==="accepted"?5763719:15548997,w=e==="accepted"?"Candidature accept\xE9e":"Candidature refus\xE9e",m=String(s||t).replace(/[^a-zA-Z0-9]/g,"")||"candidate",d=`https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(m)}&backgroundType=gradient&fontWeight=700`,n=e==="accepted"?"Bonne nouvelle: ta candidature a \xE9t\xE9 accept\xE9e.":"Ta candidature n'a pas \xE9t\xE9 retenue.",v="1458257475773010152";try{let p=localStorage.getItem("discord_response_channel_id");p&&/^\d+$/.test(p)&&(v=p)}catch{}let f=`<#${v}>`,y=e==="accepted"?`Prochaines \xE9tapes:
- Pr\xE9sente-toi dans ${f}
- Contacte le RH
- Cr\xE9e un ticket "Autres" pour la suite

**IMPORTANT:** Tes identifiants pour l'intranet t'ont \xE9t\xE9 envoy\xE9s en Message Priv\xE9 (si tes MP sont ouverts).`:"Merci pour ta candidature. Tu peux retenter plus tard si une session rouvre.",h=[{name:"Candidat",value:t||"\u2014",inline:!0},{name:"Discord",value:c||"\u2014",inline:!0},{name:"D\xE9cision",value:e==="accepted"?"Accept\xE9e":"Refus\xE9e",inline:!0},{name:"Date",value:new Date().toLocaleString("fr-FR"),inline:!0}];if(e==="accepted"&&h.push({name:"Salon",value:f,inline:!0}),e==="rejected"){let p=(a||"").trim();p&&h.push({name:"Motif",value:p.substring(0,1024),inline:!1})}let b={username:"DriveLine Customs Bot",content:i?c:"",allowed_mentions:i?{users:[String(s)]}:{parse:[]},embeds:[{title:w,description:`${c}

${n}

${e==="accepted"?"":y}`.trim(),color:g,author:{name:t,icon_url:l||d},thumbnail:{url:d},fields:h,footer:{text:"DriveLine Management System \u2022 "+new Date().toLocaleString("fr-FR")},timestamp:new Date().toISOString()}]};try{await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}),e==="accepted"&&i&&r&&await this.logCredentialsForAdmin(t,s,r)}catch(p){console.error("Erreur envoi webhook recrutement:",p)}},async logCredentialsForAdmin(e,t,s){let a="https://discord.com/api/webhooks/1463293608244154448/7_L3hF8k9j8hF8k9j8hF8k9j8hF8k9j8hF8k9j8hF8k9j8hF8k9j8hF8k9j8hF8k9j8",r=this.getServicesWebhookUrl();r||(r="https://discord.com/api/webhooks/1458256143049560189/zDR_SHsoYBvJX6qQHVy7yvvu51wOUhlBF9bwTeTWlFm9PJxrCpJLEo0Tmq_Rd2JBZpO3");let o=localStorage.getItem("app_base_url")||"https://mecano-lsc.netlify.app",l={username:"DriveLine Secure Bot",embeds:[{title:"\u{1F510} Identifiants g\xE9n\xE9r\xE9s",description:`Voici les acc\xE8s pour **${e}** (<@${t}>).
**Merci de lui transmettre en MP.**`,color:3066993,fields:[{name:"Lien",value:o,inline:!1},{name:"Utilisateur",value:`\`${s.username}\``,inline:!0},{name:"Mot de passe",value:`|| \`${s.password}\` ||`,inline:!0}],footer:{text:"Visible uniquement par le staff"}}]};try{await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)})}catch(i){console.error("Erreur log credentials",i)}},async sendRecruitmentStatus(e,t=""){let s="https://discord.com/api/webhooks/1456057459788611656/DDdTMVDpybXk3I9ewazbokyBKdcHnHvTaIH8AjwzAcE7oslNtJrFpdoOe2QSjJC3xvx-",a="1455996639964696761",r=e?5763719:15548997,o=e?"\u{1F4E2} SESSIONS DE RECRUTEMENT OUVERTES":"\u{1F512} SESSIONS DE RECRUTEMENT FERM\xC9ES",l=null;try{let f=u.getRecruitmentTargetCount();f!==null&&!isNaN(Number(f))&&(l=Number(f))}catch{}let i="";try{i=localStorage.getItem("app_base_url")||"",!i&&typeof window<"u"&&window.location&&/^https?:\/\//.test(window.location.origin)&&(i=window.location.origin)}catch{}let c=l&&l>0?`Les candidatures sont ouvertes. Postes \xE0 pourvoir: ${l}.`:"Les candidatures sont d\xE9sormais ouvertes ! Rejoignez l'\xE9quipe DriveLine Customs.",g="Les sessions de recrutement sont ferm\xE9es. Merci de r\xE9essayer plus tard.",m=`

\`\`\`ansi
${(e?["\x1B[1;32mSTATUT\x1B[0m: OUVERT",l&&l>0?`\x1B[1;36mPOSTES\x1B[0m: ${l}`:"\x1B[1;36mPOSTES\x1B[0m: Selon besoins",i?"\x1B[1;35mACTION\x1B[0m: Formulaire + Ticket RH":"\x1B[1;35mACTION\x1B[0m: Ticket RH"]:["\x1B[1;31mSTATUT\x1B[0m: FERM\xC9"]).join(`
`)}
\`\`\``,d=[];e?d.push({name:"Postes recherch\xE9s",value:l&&l>0?String(l):"Selon besoins",inline:!0}):d.push({name:"Statut",value:"Ferm\xE9",inline:!0}),t&&t.trim()&&d.push({name:"Message",value:t.trim(),inline:!1}),e&&d.push({name:"Comment postuler",value:`[Clique ici pour remplir le formulaire](https://mecano-lsc.netlify.app/#apply)
Une fois fait, cr\xE9e un ticket dans <#1455996671606653155>.`,inline:!1});let n=e?[{type:1,components:[{type:2,style:5,label:"Postuler",url:"https://mecano-lsc.netlify.app/#apply"}]}]:[],v={username:"DriveLine Customs Bot",content:`<@&${a}>`,allowed_mentions:{roles:[a]},embeds:[{title:o,description:(e?c:g)+m,color:r,fields:d,footer:{text:"DriveLine Management System \u2022 "+new Date().toLocaleString("fr-FR")},timestamp:new Date().toISOString()}],components:n};try{await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(v)})}catch(f){console.error("Erreur envoi notification status recrutement:",f)}},async sendPatchNote(e,t,s,a=""){let r=a;if(!r)try{r=(await u.fetchWebhookSettings())?.patch_note_webhook_url||""}catch{}if(!r){console.warn("Pas de webhook Patch Note configur\xE9.");return}let o="1455996638232449218",l="1455996639964696761",i={username:"DriveLine Update",content:`<@&${o}> <@&${l}> Une nouvelle mise \xE0 jour est disponible !`,allowed_mentions:{roles:[o,l]},embeds:[{title:`\u{1F680} ${e} ${s?`(${s})`:""}`,description:t,color:3066993,footer:{text:"DriveLine Management System \u2022 "+new Date().toLocaleString("fr-FR")},timestamp:new Date().toISOString()}]};try{await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)})}catch(c){throw console.error("Erreur envoi Patch Note:",c),c}},async logAbsence(e,t,s,a){let r="https://discord.com/api/webhooks/1463289920260018198/Q9mR44ebuOO2Yw34SSdlom0WvpfrIRTuXrJd7oFPf7r20eYWjdTSU8Gq5SYi7dWht2bb",o="1455996633992134912",l=[{name:"Employ\xE9",value:e,inline:!0},{name:"P\xE9riode",value:`Du ${new Date(t).toLocaleDateString("fr-FR")} au ${new Date(s).toLocaleDateString("fr-FR")}`,inline:!0},{name:"Motif",value:a,inline:!1}],i={username:"DriveLine Customs Bot",content:`<@&${o}>`,allowed_mentions:{roles:[o]},embeds:[{title:"\u{1F4C5} D\xE9claration d'Absence",description:"Une nouvelle absence a \xE9t\xE9 d\xE9clar\xE9e. Le compte de l'employ\xE9 a \xE9t\xE9 automatiquement verrouill\xE9 pour la p\xE9riode.",color:10181046,fields:l,footer:{text:"DriveLine Management System \u2022 "+new Date().toLocaleString("fr-FR")},timestamp:new Date().toISOString()}]};try{await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)})}catch(c){console.error("Erreur envoi webhook absence:",c)}}};var B=e=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD"}).format(e),$e=e=>new Date(e).toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});var je=()=>{let e=new Date(0),t=new Date;return t.setFullYear(t.getFullYear()+100),{start:e,end:t}},Ce=()=>Date.now().toString(36)+Math.random().toString(36).substr(2),Ye=e=>{let s=String(e||"").trim();if(!s)return{score:0,level:"faible",signals:[]};let a=s.replace(/\s+/g," ").replace(/[“”«»]/g,'"').replace(/[’]/g,"'").trim(),r=a.split(" ").filter(Boolean),o=r.length,l=a.length,i=a.toLowerCase(),c=a.split(/[.!?]+/).map(j=>j.trim()).filter(Boolean),g=c.length?o/c.length:o,w=c.map(j=>j.split(/\s+/).filter(Boolean).length).filter(j=>j>0),m=w.length?w.reduce((j,F)=>j+F,0)/w.length:g,d=w.length?w.reduce((j,F)=>j+Math.pow(F-m,2),0)/w.length:0,n=Math.sqrt(d),v=new Set(r.map(j=>j.toLowerCase().replace(/[^a-zàâäçéèêëîïôöùûüÿœ'-]/gi,""))).size,f=o?v/o:0,y=(a.match(/[,:;!?]/g)||[]).length,h=l?y/l:0,b=[],p=0;if(o<25)return{score:0,level:"faible",signals:["Texte trop court"]};l>=700&&(p+=10,b.push("Texte tr\xE8s long")),o>=220?(p+=10,b.push("Beaucoup de mots")):o>=160&&(p+=6,b.push("Texte long")),g>=24?(p+=12,b.push("Phrases tr\xE8s longues")):g>=19&&(p+=6,b.push("Phrases longues")),w.length>=4&&n<=4.5&&o>=120&&(p+=12,b.push("Phrases tr\xE8s r\xE9guli\xE8res")),f>=.72&&o>=140&&(p+=10,b.push("Vocabulaire tr\xE8s vari\xE9")),h>=.04?(p+=8,b.push("Ponctuation tr\xE8s r\xE9guli\xE8re")):h>=.032&&(p+=4,b.push("Ponctuation r\xE9guli\xE8re"));let x=["en tant que","je suis passionn\xE9","je suis passionn\xE9e","je serais ravi","je serais ravie","je serais heureux","je serais heureuse","je suis enthousiaste","je suis motiv\xE9","je suis motiv\xE9e","je m'engage","je m\u2019engage","je comprends les attentes","je comprends les r\xE8gles","je suis pr\xEAt \xE0","je suis pr\xEAte \xE0","je reste \xE0 votre disposition","dans le cadre de","je souhaite vous rejoindre","je souhaite rejoindre","je vous remercie","dans l'attente de votre retour","merci de votre attention","veuillez agr\xE9er","cordialement","en r\xE9sum\xE9","pour conclure","en conclusion"].filter(j=>i.includes(j));x.length>=2?(p+=26,b.push("Phrases tr\xE8s \u201Ctemplate\u201D")):x.length===1&&(p+=12,b.push("Une phrase \u201Ctemplate\u201D"));let T=["de plus","par ailleurs","en outre","ainsi","cependant","toutefois","dans ce contexte","en effet","dans un premier temps","dans un second temps","dans un premier lieu","dans un second lieu"].reduce((j,F)=>j+(i.split(F).length-1),0);T>=5?(p+=14,b.push("Beaucoup de connecteurs logiques")):T>=3&&(p+=8,b.push("Connecteurs logiques"));let P=s.split(`
`).map(j=>j.trim()),C=P.filter(j=>/^([-*•]|(\d+[\).]))\s+/.test(j)).length;C>=5?(p+=10,b.push("Structure en liste")):C>=3&&(p+=6,b.push("Structure en liste")),P.filter(j=>/^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒ][A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒ\s'-]{3,}$/.test(j)).length>=2&&(p+=6,b.push("Texte tr\xE8s structur\xE9"));let _=s.split(`
`).map(j=>j.trim()).filter(Boolean);_.length-new Set(_).size>=2&&(p+=6,b.push("Lignes r\xE9p\xE9t\xE9es"));let A=(a.match(/\d/g)||[]).length,H=(a.match(/\b(\d{1,2}h(\d{2})?|\d{1,2}:\d{2})\b/g)||[]).length,q=(a.match(/\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|week-end|weekend)\b/gi)||[]).length,M=A>=8||H>=1||q>=1||/\b(rp|fivem|gta|discord|whitelist|ticket|wl)\b/i.test(a);!M&&o>=110&&(p+=12,b.push("Peu de d\xE9tails concrets")),M&&(p-=10,b.push("D\xE9tails concrets pr\xE9sents"));let V=(a.match(/\b(mdr|ptdr|jpp|tkt|wesh|fréro|frere|bg|stp|svp)\b/gi)||[]).length;V>=2?(p-=10,b.push("Style tr\xE8s spontan\xE9")):V===1&&(p-=6,b.push("Style spontan\xE9")),(a.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu)||[]).length>=3&&(p-=8,b.push("Beaucoup d\u2019emojis")),r.filter(j=>/^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒ]{3,}$/.test(j)).length>=6&&(p-=6,b.push("Beaucoup de MAJUSCULES")),o<70?p=p*.75:o<110&&(p=p*.9),p=Math.max(0,Math.min(100,Math.round(p)));let $=p>=65?"\xE9lev\xE9":p>=35?"moyen":"faible",L=[];for(let j of b)if(L.includes(j)||L.push(j),L.length>=6)break;return{score:p,level:$,signals:L}};var u={_employees:[],_sales:[],_timeEntries:[],_concessionChecks:[],_currentUser:null,_hidden:{employees:new Set,sales:new Set,archives:new Set},_permissionCatalog:[],_employeePermissions:new Map,_accountLockCache:new Map,_isOwnerRole(e){return e==="patron"},_normalizeRole(e){if(!e)return"";let t=String(e).trim();return t.toLowerCase()==="responsable"?"responsable":t==="mecano"?"mecano_confirme":t},_assertCanDelete(e,t){if(e&&(e.role==="co_patron"||e.role==="responsable"))throw new Error(t||"Suppression interdite pour ce r\xF4le.")},_markPermissionsFromDb(e){let t=e&&typeof e=="object"?e:{};try{Object.defineProperty(t,"__fromDb",{value:!0,enumerable:!1,configurable:!0})}catch{}return t},_loadHidden(){try{let e=JSON.parse(localStorage.getItem("hidden_employees")||"[]"),t=JSON.parse(localStorage.getItem("hidden_sales")||"[]"),s=JSON.parse(localStorage.getItem("hidden_archives")||"[]");this._hidden.employees=new Set(e),this._hidden.sales=new Set(t),this._hidden.archives=new Set(s)}catch{}},_saveHidden(){try{localStorage.setItem("hidden_employees",JSON.stringify(Array.from(this._hidden.employees))),localStorage.setItem("hidden_sales",JSON.stringify(Array.from(this._hidden.sales))),localStorage.setItem("hidden_archives",JSON.stringify(Array.from(this._hidden.archives)))}catch{}},_hideId(e,t){(!this._hidden.employees||!this._hidden.sales)&&this._loadHidden(),this._hidden[e].add(String(t)),this._saveHidden()},getPermissionCatalog(){if(this._permissionCatalog&&this._permissionCatalog.length)return this._permissionCatalog;let e=[{key:"employees.view",label:"Voir les employ\xE9s",description:"Acc\xE8s \xE0 la liste des employ\xE9s",roles:["patron","co_patron","responsable"]},{key:"employees.manage",label:"G\xE9rer les employ\xE9s",description:"Cr\xE9er, modifier et supprimer des employ\xE9s",roles:["patron"]},{key:"employees.warnings",label:"G\xE9rer les avertissements",description:"Ajouter et supprimer des avertissements",roles:["patron","responsable"]},{key:"sales.view_all",label:"Voir toutes les factures",description:"Voir l'historique complet des factures",roles:["patron","co_patron","responsable"]},{key:"sales.manage",label:"G\xE9rer les factures",description:"Supprimer et modifier n'importe quelle facture",roles:["patron"]},{key:"sales.delete",label:"Supprimer des factures",description:"Droit de suppression d\xE9finitif",roles:["patron"]},{key:"employees.delete",label:"Supprimer des employ\xE9s",description:"Droit de suppression d\xE9finitif",roles:["patron"]},{key:"sales.create",label:"Cr\xE9er des factures",description:"Enregistrer des prestations et factures",roles:["patron","co_patron","responsable","chef_atelier","mecano_confirme","mecano_junior","mecano_test"]},{key:"stats.view",label:"Voir les statistiques",description:"Acc\xE8s aux graphiques et KPIs globaux",roles:["patron","co_patron","responsable"]},{key:"pointeuse.view_all",label:"Voir la pointeuse globale",description:"Voir qui est en service actuellement",roles:["patron","co_patron","responsable","chef_atelier"]},{key:"pointeuse.use",label:"Utiliser la pointeuse",description:"Se mettre en service/fin de service",roles:["patron","co_patron","responsable","chef_atelier","mecano_confirme","mecano_junior","mecano_test"]},{key:"time_entries.reset",label:"Reset pointages",description:"R\xE9initialiser tous les temps de service",roles:["patron"]},{key:"archives.view",label:"Voir les archives",description:"Acc\xE8s en lecture seule aux archives",roles:["patron","co_patron","responsable"]},{key:"archives.manage",label:"G\xE9rer les archives",description:"Supprimer et restaurer des archives",roles:["patron"]},{key:"payroll.manage",label:"G\xE9rer la paie",description:"Acc\xE8s aux r\xE9glages de salaires et primes",roles:["patron"]},{key:"recruitment.manage",label:"G\xE9rer le recrutement",description:"Voir et traiter les candidatures",roles:["patron","responsable"]},{key:"concession.view",label:"Voir la concession",description:"Acc\xE8s au tableau de bord concession",roles:["patron","co_patron","responsable","chef_atelier"]},{key:"concession.create",label:"G\xE9rer la concession",description:"Ajouter/modifier des v\xE9hicules concession",roles:["patron","chef_atelier","responsable"]},{key:"concession.delete",label:"Supprimer concession",description:"Supprimer des v\xE9hicules concession",roles:["patron"]},{key:"contracts.manage",label:"G\xE9rer les contrats",description:"Acc\xE8s \xE0 la gestion des contrats",roles:["patron","co_patron","responsable"]},{key:"contracts.view",label:"Voir les contrats",description:"Acc\xE8s \xE0 la liste des contrats partenaires",roles:["patron","co_patron","responsable","chef_atelier","mecano_confirme","mecano_junior","mecano_test"]},{key:"absence.declare",label:"D\xE9clarer absence",description:"D\xE9clarer ses absences et cong\xE9s",roles:["patron","co_patron","responsable","chef_atelier","mecano_confirme","mecano_junior","mecano_test"]},{key:"config.manage",label:"Configuration",description:"Acc\xE8s aux r\xE9glages syst\xE8me (webhooks, etc)",roles:["patron"]}];return this._permissionCatalog=e,e},getRoleDefaultPermissions(e){let t=this.getPermissionCatalog();e=this._normalizeRole(e);let s={};return t.forEach(a=>{(!a.roles||a.roles.includes(e))&&(s[a.key]=!0)}),s},getCachedEmployeePermissions(e){return this._employeePermissions||(this._employeePermissions=new Map),this._employeePermissions.get(String(e))||null},_isLockActive(e){if(!e||typeof e!="object")return!1;let t=Object.prototype.hasOwnProperty.call(e,"reason")?String(e.reason||"").trim():"",s=Object.prototype.hasOwnProperty.call(e,"start")?e.start:null,a=Object.prototype.hasOwnProperty.call(e,"end")?e.end:null;if(!t||!s||!a)return!1;let r=m=>{if(m==null)return null;let n=String(m).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!n)return null;let v=Number(n[1]),f=Number(n[2]),y=Number(n[3]);return!isFinite(v)||!isFinite(f)||!isFinite(y)?null:Date.UTC(v,f-1,y,0,0,0,0)},o=m=>{if(m==null)return null;let d=r(m);if(d!=null)return d;try{let v=new Date(m).getTime();return isNaN(v)?null:v}catch{return null}},l=o(s),i=o(a);if(l==null||i==null)return!1;let c=r(a),g=c!=null?c+24*3600*1e3-1:i,w=Date.now();return w>=l&&w<=g},isLockActiveForPermissions(e){let t=e&&typeof e=="object"?e.lock:null;return this._isLockActive(t)},formatLockMeta(e){let t={reason:"",period:"",title:""};if(!e||typeof e!="object")return t;let s=Object.prototype.hasOwnProperty.call(e,"reason")?e.reason:"",a=s==null?"":String(s).trim();if(!a)return t;let r=w=>{if(!w)return"";let m=String(w).trim(),d=m.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(d){let n=Number(d[1]),v=Number(d[2])-1,f=Number(d[3]);return new Date(Date.UTC(n,v,f,0,0,0,0)).toLocaleDateString("fr-FR",{year:"numeric",month:"2-digit",day:"2-digit"})}try{let n=new Date(w);return isNaN(n.getTime())?m:n.toLocaleDateString("fr-FR",{year:"numeric",month:"2-digit",day:"2-digit"})}catch{return m}},o=Object.prototype.hasOwnProperty.call(e,"start")?e.start:null,l=Object.prototype.hasOwnProperty.call(e,"end")?e.end:null,i=r(o),c=r(l),g=i&&c?`${i} \u2192 ${c}`:"";return t.reason=a,t.period=g,t.title=g?`Compte bloqu\xE9 (${g})
Motif: ${a}`:`Compte bloqu\xE9
Motif: ${a}`,t},async _buildLockErrorMessageForUser(e,t){let s=t||"Compte bloqu\xE9.";try{let a=await this.fetchEmployeeAccountLock(e);if(!this._isLockActive(a))return s;let r=this.formatLockMeta(a),o=s;return r.reason&&(o+=` Motif: ${r.reason}.`),r.period&&(o+=` (${r.period})`),o}catch{return s}},async ensurePermission(e,t,s){let a=typeof e=="string"?await this.getEmployeeById(e):e;if(!a)throw new Error(s||"Acc\xE8s refus\xE9.");if(this._isOwnerRole(a.role))return;let r=a.account_lock||a.accountLock||null,o=this._isLockActive(r)?r:await this.fetchEmployeeAccountLock(a.id);if(this._isLockActive(o)){let i=await this._buildLockErrorMessageForUser(a.id,"Compte bloqu\xE9.");throw new Error(i)}if(!await this.hasPermission(a,t))throw new Error(s||"Acc\xE8s refus\xE9.")},hasPermissionSync(e,t){let s=typeof e=="string"?this.getEmployees().find(i=>String(i.id)===String(e))||null:e;if(!s)return!1;if(this._isOwnerRole(s.role))return!0;let r=s.account_lock||s.accountLock||null;if(!this._isLockActive(r))try{let i=this._accountLockCache&&this._accountLockCache.get&&this._accountLockCache.get(String(s.id))||null;i&&typeof i=="object"&&i.lockMeta&&(r=i.lockMeta)}catch{}if(this._isLockActive(r))return!1;let o=this.getCachedEmployeePermissions(s.id);if(o&&o.__fromDb===!0&&Object.prototype.hasOwnProperty.call(o,t))return!!o[t];let l=this.getRoleDefaultPermissions(s.role||"");return Object.prototype.hasOwnProperty.call(l,t)?!!l[t]:!1},async fetchEmployeePermissions(e){let t={};try{let{data:a,error:r}=await D.from("employee_permissions").select("permissions").eq("employee_id",e).single();!r&&a&&a.permissions&&typeof a.permissions=="object"&&(t=a.permissions)}catch{t={}}this._employeePermissions||(this._employeePermissions=new Map);let s=this._markPermissionsFromDb(t);return this._employeePermissions.set(String(e),s),s},async saveEmployeePermissions(e,t){let s=this.getCurrentUser(),a=String(e)===String(s.id),r=t&&t.lock&&Object.keys(t).length>0;if((!a||!r)&&s&&!this._isOwnerRole(s.role)&&(await this.ensurePermission(s,"employees.manage","Acc\xE8s refus\xE9 \xE0 la modification des permissions."),a&&!r))throw new Error("Impossible de modifier ses propres permissions (sauf absence).");let o=t&&typeof t=="object"?t:{},l={employee_id:e,permissions:o},{error:i}=await D.from("employee_permissions").upsert(l,{onConflict:"employee_id"});if(i)throw console.error("Error saving employee permissions:",i),i;return this._employeePermissions||(this._employeePermissions=new Map),this._employeePermissions.set(String(e),this._markPermissionsFromDb(o)),!0},async fetchEmployeeAccountLock(e){this._accountLockCache||(this._accountLockCache=new Map);let t=String(e),s=this._accountLockCache.get(t)||null;if(s&&typeof s=="object"&&Date.now()-Number(s.fetchedAt||0)<15e3)return s.lockMeta||null;try{let{data:a,error:r}=await D.from("employees").select("account_lock").eq("id",e).single();if(r)return null;let o=a&&typeof a=="object"?a.account_lock:null,l=this._employees.find(i=>String(i.id)===String(e));return l&&(l.account_lock=o),this._accountLockCache.set(t,{lockMeta:o,fetchedAt:Date.now()}),o}catch{return null}},async setEmployeeLock(e,t){let a={...await this.fetchEmployeePermissions(e)};return t?a.lock=t:delete a.lock,await this.saveEmployeePermissions(e,a)},async setEmployeeAccountLock(e,t){let s=this.getCurrentUser();(!s||!this._isOwnerRole(s.role))&&await this.ensurePermission(s,"employees.manage","Acc\xE8s refus\xE9 au blocage de comptes.");let a=s&&s.id!=null?String(s.id):"";if(a&&String(e)===a)throw new Error("Impossible de bloquer son propre compte.");let r=await this.getEmployeeById(e);if(r&&this._isOwnerRole(r.role))throw new Error("Impossible de bloquer le compte Patron.");let o=t&&typeof t=="object"?{reason:String(t.reason||"").trim(),start:t.start||null,end:t.end||null,created_by:a||null,created_at:new Date().toISOString()}:null;if(!o||!o.reason||!o.start||!o.end)throw new Error("Motif, date de d\xE9but et date de fin obligatoires.");let l=null;try{let c=await D.from("employees").update({account_lock:o}).eq("id",e).select("id, account_lock").single();if(l=c.data||null,c.error){let g=String(c.error.message||"").toLowerCase();if(c.error.code==="42703"||g.includes("account_lock")||g.includes("does not exist"))return await this.setEmployeeLock(e,o),!0;throw c.error}}catch(c){let g=String(c&&c.message?c.message:c).toLowerCase();if(g.includes("account_lock")&&g.includes("does not exist"))return await this.setEmployeeLock(e,o),!0;throw c}let i=this._employees.find(c=>String(c.id)===String(e));return i&&(i.account_lock=l?l.account_lock:o),this._accountLockCache&&this._accountLockCache.set(String(e),{lockMeta:l?l.account_lock:o,fetchedAt:Date.now()}),!0},async clearEmployeeAccountLock(e){let t=this.getCurrentUser();(!t||!this._isOwnerRole(t.role))&&await this.ensurePermission(t,"employees.manage","Acc\xE8s refus\xE9 au d\xE9blocage de comptes.");let s=t&&t.id!=null?String(t.id):"";if(s&&String(e)===s)throw new Error("Impossible de d\xE9bloquer son propre compte.");let a=null;try{let o=await D.from("employees").update({account_lock:null}).eq("id",e).select("id, account_lock").single();if(a=o.data||null,o.error){let l=String(o.error.message||"").toLowerCase();if(!(o.error.code==="42703"||l.includes("account_lock")||l.includes("does not exist")))throw o.error}}catch(o){let l=String(o&&o.message?o.message:o).toLowerCase();if(!l.includes("account_lock")||!l.includes("does not exist"))throw o}try{await this.setEmployeeLock(e,null)}catch(o){console.warn("Failed to clear permission lock (absence):",o)}let r=this._employees.find(o=>String(o.id)===String(e));return r&&(r.account_lock=null),this._accountLockCache&&this._accountLockCache.delete(String(e)),!0},async hasPermission(e,t){let s=typeof e=="string"?await this.getEmployeeById(e):e;if(!s)return!1;if(this._isOwnerRole(s.role))return!0;let a=s.account_lock||s.accountLock||null;if(this._isLockActive(a))return!1;let r=this.getCachedEmployeePermissions(s.id),o=await this.fetchEmployeePermissions(s.id);if(this.isLockActiveForPermissions(o))return!1;if(o&&Object.prototype.hasOwnProperty.call(o,t))return!!o[t];let l=this.getRoleDefaultPermissions(s.role||"");return Object.prototype.hasOwnProperty.call(l,t)?!!l[t]:!1},async declareAbsence(e,{start:t,end:s,reason:a}){let r=await this.getEmployeeById(e);if(!r)throw new Error("Employ\xE9 introuvable");let o=await this.fetchEmployeePermissions(e),l=Object.assign({},o||{});l.lock={reason:`Absence : ${a}`,start:t,end:s,updated_at:new Date().toISOString()},await this.saveEmployeePermissions(e,l);let i=`${r.first_name} ${r.last_name}`;return _e.logAbsence(i,t,s,a),!0},getEmployees(){return this._employees},getEmployeeByIdSync(e){return this._employees.find(t=>t.id===e)},async fetchEmployees(){this._loadHidden();let e=await D.from("employees").select("id, first_name, last_name, phone, role, username, password, photo, custom_rate, created_at, warnings, discord_id, account_lock, last_login");if(e&&e.error){let a=String(e.error.message||"");(a.toLowerCase().includes("account_lock")||a.toLowerCase().includes("last_login"))&&(e=await D.from("employees").select("id, first_name, last_name, phone, role, username, password, photo, custom_rate, created_at, warnings, discord_id"))}let{data:t,error:s}=e||{};return s?(console.error("Error fetching employees:",s),[]):(this._employees=t.filter(a=>!this._hidden.employees.has(String(a.id))&&!this._hidden.employees.has(String(a.username))).map(a=>({...a,role:this._normalizeRole(a.role)})),this._employees)},async getEmployeeById(e){if(this._loadHidden(),this._hidden.employees.has(String(e)))return null;let t=this._employees.find(o=>o.id===e);if(t)return t;let s=await D.from("employees").select("id, first_name, last_name, phone, role, username, password, photo, custom_rate, created_at, warnings, discord_id, account_lock, last_login").eq("id",e).single();if(s&&s.error){let o=String(s.error.message||"");o.toLowerCase().includes("account_lock")&&o.toLowerCase().includes("does not exist")&&(s=await D.from("employees").select("id, first_name, last_name, phone, role, username, password, photo, custom_rate, created_at, warnings, discord_id, last_login").eq("id",e).single())}let{data:a,error:r}=s||{};return r?null:{...a,role:this._normalizeRole(a.role)}},async saveEmployee(e){let t=this.getCurrentUser();t&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"employees.manage","Acc\xE8s refus\xE9 \xE0 la gestion des employ\xE9s.");let s=e.id,a={first_name:e.firstName,last_name:e.lastName,phone:e.phone,role:this._normalizeRole(e.role),username:e.username,password:e.password,photo:e.photo,discord_id:e.discordId},r=!!(a.password&&String(a.password).trim()!=="");r||delete a.password;let{data:o,error:l}=await D.from("employees").update(a).eq("id",s).select().single();if(!l&&o){try{let g=this._employees.findIndex(w=>String(w.id)===String(o.id));g>=0?this._employees[g]={...o,role:this._normalizeRole(o.role)}:this._employees.push({...o,role:this._normalizeRole(o.role)})}catch{}return o}if(l&&l.code!=="PGRST116")throw console.error("Error updating employee:",l),l;if(!r)throw new Error("Mot de passe requis pour cr\xE9er un employ\xE9.");let{data:i,error:c}=await D.from("employees").insert({id:s,...a}).select().single();if(c)throw console.error("Error saving employee:",c),c;try{let g=this._employees.findIndex(m=>String(m.id)===String(i.id)),w={...i,role:this._normalizeRole(i.role)};g>=0?this._employees[g]=w:this._employees.push(w)}catch{}return i},async deleteEmployee(e){let t=this.getCurrentUser();if(this._assertCanDelete(t,"Suppression d'employ\xE9 interdite."),t&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"employees.manage","Acc\xE8s refus\xE9 \xE0 la suppression d'employ\xE9s."),t&&t.id!=null&&String(t.id)===String(e))throw new Error("Impossible de supprimer son propre compte.");let s=this._employees.find(o=>String(o.id)===String(e)||o.username===e);if(!s)try{s=await this.getEmployeeById(e)}catch{s=null}if(s&&this._isOwnerRole(s.role))throw new Error("Impossible de supprimer le compte Patron.");let a=D.from("employees").delete();s&&s.id?a=a.eq("id",s.id):a=a.eq("username",e);let{error:r}=await a;r&&(console.error("Error deleting employee:",r),this._hideId("employees",s?.id||e)),this._employees=this._employees.filter(o=>String(o.id)!==String(e)&&o.username!==e)},async fireEmployee(e,t){let s=await this.getEmployeeById(e),a=s?s.id:e,r=null;try{r=await this.computeEmployeeDue(a)}catch(o){console.warn("Unable to compute due before firing:",o)}try{await D.from("time_entries").delete().eq("employee_id",a)}catch(o){console.error("Error deleting time entries for employee:",o)}try{await D.from("sales").delete().eq("employee_id",a)}catch(o){console.error("Error deleting sales for employee:",o)}if(await this.deleteEmployee(a),s)try{await _e.logEmployeeFired(s,t,r)}catch(o){console.error("Error sending Discord fire log:",o)}},async computeEmployeeDue(e){let[t,s,a,r]=await Promise.all([this.fetchEmployees(),this.fetchSales(),this.fetchTimeEntries(),this.fetchPayrollSettings()]),o=t.find(k=>String(k.id)===String(e));if(!o)throw new Error("Employ\xE9 introuvable");let l=r?.role_primes||{};(!l||Object.keys(l).length===0)&&(l={mecano_confirme:20,mecano_junior:20,mecano_test:5,chef_atelier:20,patron:60,co_patron:60,responsable:60});let i=o.role==="mecano"?"mecano_confirme":o.role,c=Number(l[i]),g=isFinite(c)&&c>=0?c/100:.2,m=s.filter(k=>String(k.employeeId)===String(e)).reduce((k,x)=>k+(Number(x.price)-Number(x.cost||0)),0),d=m*g,f=a.filter(k=>String(k.employee_id)===String(e)).reduce((k,x)=>{let E=Number(x.pause_total_ms||0),T=new Date(x.clock_in),C=(x.clock_out?new Date(x.clock_out):new Date)-T-E;return k+Math.max(0,C)},0)/36e5,y=r?.grade_rates||{},h=o.custom_rate;h==null&&(h=y[i]||0);let b=f*Number(h),p=b+d;return{employeeId:e,name:`${o.first_name} ${o.last_name}`,role:o.role,totalHours:f,hourlyRate:Number(h),totalSales:m,commission:d,fixedSalary:b,totalDue:p}},getSales(){return this._sales},calculateTotalPay(e,t,s=null){s||(s=this.getTimeEntries());let a=null;try{a=JSON.parse(localStorage.getItem("db_payroll_settings"))}catch{}let r=a?.role_primes||{},o=a?.grade_rates||{};(!r||Object.keys(r).length===0)&&(r={mecano_confirme:20,mecano_junior:20,mecano_test:5,chef_atelier:20,patron:60,co_patron:60,responsable:60});let l=t.reduce((h,b)=>h+(Number(b.price)-Number(b.cost||0)),0),i=e.role==="mecano"?"mecano_confirme":e.role,c=Number(r[i]),g=isFinite(c)&&c>=0?c/100:.2,w=l*g,n=s.filter(h=>h.employee_id===e.id&&h.clock_out).reduce((h,b)=>{let p=Number(b.pause_total_ms||0),k=new Date(b.clock_in),x=new Date(b.clock_out);if(isNaN(k.getTime())||isNaN(x.getTime()))return h;let E=x-k-(isNaN(p)?0:p);return h+Math.max(0,E)},0)/36e5,v=e.custom_rate;v==null&&(v=o[i]||0);let f=n*Number(v||0),y=w+f;return isFinite(y)?y:0},getDateFilter(){try{let e=localStorage.getItem("emp_filter_date_start"),t=localStorage.getItem("emp_filter_date_end");if(e&&t)return{start:new Date(e),end:new Date(t)}}catch{}return null},setDateFilter(e,t){try{e?localStorage.setItem("emp_filter_date_start",e.toISOString()):localStorage.removeItem("emp_filter_date_start"),t?localStorage.setItem("emp_filter_date_end",t.toISOString()):localStorage.removeItem("emp_filter_date_end")}catch{}},exportSalesToCSV(e){if(!e||!e.length)return"";let t=["Date","Employ\xE9","V\xE9hicule","Immatriculation","Type","Prix","Client","Facture URL"],s=e.map(a=>{let r=this.getEmployeeByIdSync(a.employeeId),o=r?`${r.first_name} ${r.last_name}`:"Inconnu";return[new Date(a.date).toLocaleDateString("fr-FR"),o,a.vehicleModel||"",a.plate||"",a.serviceType||"",a.price||0,a.clientName||"",a.invoiceUrl||""].map(l=>`"${String(l).replace(/"/g,'""')}"`).join(",")});return[t.join(","),...s].join(`
`)},async fetchSalesPage(e=1,t=50,s={}){this._loadHidden();let a=D.from("sales").select("*",{count:"exact"});s.employeeId&&s.employeeId!=="all"&&(a=a.eq("employee_id",s.employeeId)),s.type&&s.type!=="all"&&(a=a.eq("service_type",s.type)),s.term&&(a=a.or(`vehicle_model.ilike.%${s.term}%,client_name.ilike.%${s.term}%`));let r=(e-1)*t,o=r+t-1;a=a.order("date",{ascending:!1}).range(r,o);let{data:l,error:i,count:c}=await a;return i?(console.error("Error fetching sales page:",i),{data:[],total:0}):{data:l.filter(w=>!this._hidden.sales.has(String(w.id))).map(this._mapSaleFromDB),total:c}},async fetchSales(){this._loadHidden();let{data:e,error:t}=await D.from("sales").select("*");return t?(console.error("Error fetching sales:",t),[]):(this._sales=e.filter(s=>!this._hidden.sales.has(String(s.id))).map(this._mapSaleFromDB),this._sales)},async getSaleById(e){if(this._loadHidden(),this._hidden.sales.has(String(e)))return null;let t=this._sales.find(r=>r.id===e);if(t)return t;let{data:s,error:a}=await D.from("sales").select("*").eq("id",e).single();return a?null:this._mapSaleFromDB(s)},async saveSale(e){let t=this.getCurrentUser();t&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"sales.create");let s={id:e.id,employee_id:e.employeeId,date:e.date,client_name:e.clientName,client_phone:e.clientPhone,vehicle_model:e.vehicleModel||e.plate,plate:e.plate||e.vehicleModel,service_type:e.serviceType,price:e.price,cost:e.cost,invoice_url:e.invoiceUrl,photo_url:e.photoUrl,contract_full_perf:e.contractFullPerf===!0,contract_full_custom:e.contractFullCustom===!0},a=!1;try{this._sales.find(i=>i.id===e.id)||await this.getSaleById(e.id)||(a=!0)}catch{a=!0}let r,o;{let i=await D.from("sales").upsert(s).select().single();r=i.data,o=i.error}if(o&&(o.code==="42703"||String(o.message||"").toLowerCase().includes("does not exist"))){let i={id:s.id,employee_id:s.employee_id,date:s.date,client_name:s.client_name,client_phone:s.client_phone,vehicle_model:s.vehicle_model,service_type:s.service_type,price:s.price,invoice_url:s.invoice_url,photo_url:s.photo_url},c=await D.from("sales").upsert(i).select().single();r=c.data,o=c.error}if(o)throw console.error("Error saving sale:",o),o;let l=this._mapSaleFromDB(r);try{let i=this._sales.findIndex(c=>String(c.id)===String(l.id));i>=0?this._sales[i]=l:this._sales.push(l)}catch{}return this.syncGlobalSafeBalance().catch(i=>console.warn("Background safe sync failed",i)),l},async deleteSale(e){let t=this.getCurrentUser();if(this._assertCanDelete(t,"Suppression de facture interdite pour Co-Patron."),t&&!this._isOwnerRole(t.role)){let a=null;try{a=this._sales.find(l=>String(l.id)===String(e))||null}catch{}if(!a)try{a=await this.getSaleById(e)}catch{a=null}let r=a?a.employeeId??a.employee_id:null;r!=null&&String(r)===String(t.id)||await this.ensurePermission(t,"sales.manage","Acc\xE8s refus\xE9 \xE0 la suppression de facture.")}let{error:s}=await D.from("sales").delete().eq("id",e);s&&(console.error("Error deleting sale:",s),this._hideId("sales",e)),this._sales=this._sales.filter(a=>a.id!==e),this.syncGlobalSafeBalance().catch(a=>console.warn("Background safe sync failed",a))},getTimeEntries(){return this._timeEntries||[]},async fetchTimeEntries(){let{data:e,error:t}=await D.from("time_entries").select("*").order("clock_in",{ascending:!1});return t?(console.error("Error fetching time entries:",t),[]):(this._timeEntries=e,e)},async getActiveTimeEntry(e){let{data:t,error:s}=await D.from("time_entries").select("*").eq("employee_id",e).is("clock_out",null).single();return s&&s.code!=="PGRST116"&&console.error("Error fetching active time entry:",s),t||null},async clockIn(e){let t=this.getCurrentUser();if(t&&String(t.id)===String(e)&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"pointeuse.use"),await this.getActiveTimeEntry(e))throw new Error("D\xE9j\xE0 en service !");let a=Date.now().toString(36)+Math.random().toString(36).substr(2),{data:r,error:o}=await D.from("time_entries").insert({id:a,employee_id:e,clock_in:new Date().toISOString()}).select().single();if(o)throw console.error("Error clocking in:",o),o;let l=this.getEmployeeByIdSync(e);return l&&(_e.logClockIn(`${l.first_name} ${l.last_name}`),D.from("employees").update({last_login:new Date().toISOString(),last_activity:new Date().toISOString()}).eq("id",e).then(({error:i})=>{i&&console.warn("Failed to update last_login on clock-in",i)})),r},async clockOut(e){let t=this.getCurrentUser();t&&!this._isOwnerRole(t.role)&&String(t.id)!==String(e)&&await this.ensurePermission(t,"pointeuse.view_all","Acc\xE8s refus\xE9 \xE0 la pointeuse d'un autre employ\xE9.");let s=await this.getActiveTimeEntry(e);if(!s)throw new Error("Pas de service en cours !");let a=new Date().toISOString(),{data:r,error:o}=await D.from("time_entries").update({clock_out:a}).eq("id",s.id).select().single();if(o)throw console.error("Error clocking out:",o),o;let l=this.getEmployeeByIdSync(e);if(l){let i=new Date(s.clock_in),g=new Date-i,w=Math.floor(g/36e5),m=Math.floor(g%36e5/6e4),d=`${w}h ${m}m`;_e.logClockOut(`${l.first_name} ${l.last_name}`,d),D.from("employees").update({last_login:a}).eq("id",e).then(({error:n})=>{n&&console.warn("Failed to update last_login on clock-out",n)})}return r},async pauseService(e){let t=this.getCurrentUser();t&&!this._isOwnerRole(t.role)&&String(t.id)!==String(e)&&await this.ensurePermission(t,"pointeuse.view_all","Acc\xE8s refus\xE9 \xE0 la pointeuse d'un autre employ\xE9.");let s=await this.getActiveTimeEntry(e);if(!s)throw new Error("Pas de service en cours !");if(s.paused)throw new Error("D\xE9j\xE0 en pause !");let{data:a,error:r}=await D.from("time_entries").update({paused:!0,pause_started:new Date().toISOString()}).eq("id",s.id).select().single();if(r){let o=r&&r.message?r.message:String(r);throw o.toLowerCase().includes("column")&&o.toLowerCase().includes("does not exist")?new Error("Colonnes de pause manquantes. Ex\xE9cutez sql/update_schema_time_entries_pause.sql dans Supabase."):r}return a},async resumeService(e){let t=this.getCurrentUser();t&&!this._isOwnerRole(t.role)&&String(t.id)!==String(e)&&await this.ensurePermission(t,"pointeuse.view_all","Acc\xE8s refus\xE9 \xE0 la pointeuse d'un autre employ\xE9.");let s=await this.getActiveTimeEntry(e);if(!s)throw new Error("Pas de service en cours !");if(!s.paused)throw new Error("Pas en pause !");let a=new Date(s.pause_started),o=Math.max(0,new Date-a),l=Number(s.pause_total_ms||0)+o,{data:i,error:c}=await D.from("time_entries").update({paused:!1,pause_total_ms:l,pause_started:null}).eq("id",s.id).select().single();if(c){let g=c&&c.message?c.message:String(c);throw g.toLowerCase().includes("column")&&g.toLowerCase().includes("does not exist")?new Error("Colonnes de pause manquantes. Ex\xE9cutez sql/update_schema_time_entries_pause.sql dans Supabase."):c}return i},async autoCloseGhostServices(e=12){let t=this.getCurrentUser();t&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"pointeuse.view_all","Action r\xE9serv\xE9e aux admins.");let{data:s,error:a}=await D.from("time_entries").select("*").is("clock_out",null);if(a)throw a;let r=new Date,o=s.filter(i=>{let c=new Date(i.clock_in);return(r-c)/36e5>=e});if(o.length===0)return{count:0};let l=o.map(i=>{let c=new Date(i.clock_in),g=new Date(c.getTime()+e*36e5);return D.from("time_entries").update({clock_out:g.toISOString()}).eq("id",i.id)});return await Promise.all(l),{count:o.length,employees:o.map(i=>i.employee_id)}},async updateLastActivity(e){await D.from("employees").update({last_activity:new Date().toISOString()}).eq("id",e)},async checkAndSanctionInactivity(e=2){let t=this.getCurrentUser();t&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"pointeuse.view_all","Action r\xE9serv\xE9e aux admins.");let{data:s,error:a}=await D.from("time_entries").select("*").is("clock_out",null).is("paused",!1);if(a)throw a;if(!s||s.length===0)return{count:0};let r=s.map(d=>d.employee_id),{data:o,error:l}=await D.from("employees").select("id, last_activity, first_name, last_name, warnings").in("id",r);if(l)throw l;let i=s.reduce((d,n)=>{let v=new Date(n.clock_in);return v<d?v:d},new Date),{data:c}=await D.from("sales").select("employee_id, date").in("employee_id",r).gte("date",i.toISOString()),g=new Date,w=[],m=[];for(let d of o){let n=s.find(b=>b.employee_id===d.id);if(!n)continue;let v=d.last_activity?new Date(d.last_activity):new Date(0);if(c){let b=c.filter(p=>p.employee_id===d.id);if(b.length>0){let p=b.reduce((k,x)=>new Date(x.date)>k?new Date(x.date):k,new Date(0));p>v&&(v=p)}}let f=new Date(n.clock_in);if(f>v&&(v=f),(g-v)/36e5>=e){let b=v;v<f&&(b=f);let p=b.toISOString();m.push(D.from("time_entries").update({clock_out:p}).eq("id",n.id));let k={id:Date.now().toString(36),type:"avertissement",reason:`Inactivit\xE9 prolong\xE9e d\xE9tect\xE9e (> ${e}h sans interaction). Fin de service ajust\xE9e \xE0 la derni\xE8re activit\xE9.`,date:new Date().toISOString(),given_by:"Syst\xE8me Anti-AFK"},E=[...d.warnings||[],k];m.push(D.from("employees").update({warnings:E}).eq("id",d.id)),_e.logSanction(`${d.first_name} ${d.last_name}`,"Syst\xE8me","Avertissement Automatique",`Inactivit\xE9 > ${e}h. Fin de service forc\xE9e.`),w.push(`${d.first_name} ${d.last_name}`)}}return await Promise.all(m),{count:w.length,names:w}},async resetWeek(){let e=this.getCurrentUser();this._assertCanDelete(e,"Action interdite pour Co-Patron."),e&&!this._isOwnerRole(e.role)&&await this.ensurePermission(e,"payroll.manage","Acc\xE8s refus\xE9 au reset de la semaine.");let{error:t}=await D.rpc("reset_week");if(t)throw console.error("Error resetting week:",t),t;return!0},async resetTimeEntries(){let e=this.getCurrentUser();this._assertCanDelete(e,"Action interdite pour Co-Patron."),e&&!this._isOwnerRole(e.role)&&await this.ensurePermission(e,"time_entries.reset","Acc\xE8s refus\xE9 \xE0 la r\xE9initialisation des pointages.");let{error:t}=await D.from("time_entries").delete().neq("id","0");if(t)throw t;return!0},async fetchArchives(){this._loadHidden();let{data:e,error:t}=await D.from("weekly_archives").select("*").order("archived_at",{ascending:!1});return t?(console.error("Error fetching archives:",t),[]):e.filter(s=>!this._hidden.archives?.has(String(s.id)))},async deleteArchive(e){let t=this.getCurrentUser();this._assertCanDelete(t,"Suppression interdite pour Co-Patron."),t&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"archives.manage","Acc\xE8s refus\xE9 \xE0 la suppression d\u2019archives.");let{error:s}=await D.from("weekly_archives").delete().eq("id",e);s&&(console.error("Error deleting archive:",s),this._hidden.archives||(this._hidden.archives=new Set),this._hideId("archives",e))},async archiveAndReset(e=null,t=null){let s=await this.fetchSales(),a=await this.fetchEmployees(),r=await this.fetchTimeEntries(),o=await this.fetchPayrollSettings();if(e&&t){let b=e.getTime(),p=t.getTime();s=s.filter(k=>{let x=new Date(k.date).getTime();return x>=b&&x<=p}),r=r.filter(k=>{if(!k.clock_out)return!1;let x=new Date(k.clock_out).getTime();return x>=b&&x<=p})}let l=s.reduce((b,p)=>b+Number(p.price),0),i=s.length,c=this._calculatePayrollDetails(a,s,r,o),g=c.reduce((b,p)=>b+(p.totalDue||0),0),m=`Semaine du ${new Date().toLocaleDateString("fr-FR")}`;e&&t&&(m=`P\xE9riode du ${e.toLocaleDateString("fr-FR")} au ${t.toLocaleDateString("fr-FR")}`);let d=Date.now().toString(36)+Math.random().toString(36).substr(2),{error:n}=await D.from("weekly_archives").insert({id:d,total_revenue:l,total_sales_count:i,period_label:m,total_payroll:g,archived_at:new Date().toISOString(),payroll_details:c});if(n)throw n;let v=D.from("sales").delete().neq("id","0");e&&t&&(v=v.gte("date",e.toISOString()).lte("date",t.toISOString()));let{error:f}=await v;if(f)throw f;let y=D.from("time_entries").delete().neq("id","0");e&&t&&(y=y.gte("clock_out",e.toISOString()).lte("clock_out",t.toISOString()));let{error:h}=await y;if(h)throw h;return!0},async updateArchivePaymentStatus(e,t,s){let{data:a,error:r}=await D.from("weekly_archives").select("*").eq("id",e).single();if(r||!a)throw new Error("Archive introuvable");let o=a.payroll_details||[];if(typeof o=="string")try{o=JSON.parse(o)}catch{o=[]}let l=o.findIndex(i=>i.employeeId===t);if(l!==-1){o[l].paid=s;let{error:i}=await D.from("weekly_archives").update({payroll_details:o}).eq("id",e);if(i)throw i}return!0},async syncLastLoginWithActivity(){let[e,t]=await Promise.all([this.fetchEmployees(),this.fetchTimeEntries()]),s=[],a=0;for(let r of e){let o=t.filter(c=>c.employee_id===r.id&&c.clock_out);if(o.length===0)continue;o.sort((c,g)=>new Date(g.clock_out)-new Date(c.clock_out));let l=new Date(o[0].clock_out),i=r.last_login?new Date(r.last_login):new Date(0);l>i&&s.push((async()=>{let{error:c}=await D.from("employees").update({last_login:l.toISOString()}).eq("id",r.id);c||a++})())}return await Promise.all(s),await this.fetchEmployees(),a},async addWarning(e,t){let s=await this.getEmployeeById(e);if(!s)throw new Error("Employ\xE9 introuvable");let a=s.warnings||[];if(typeof a=="string")try{a=JSON.parse(a)}catch{a=[]}let r={id:Date.now().toString(36)+Math.random().toString(36).substr(2),date:new Date().toISOString(),reason:t.reason,author:t.author},o=[...a,r],{error:l}=await D.from("employees").update({warnings:o}).eq("id",e);if(l)throw l;let i=this._employees.find(c=>c.id===e);return i&&(i.warnings=o),r},async deleteWarning(e,t){let s=this.getCurrentUser();this._assertCanDelete(s,"Suppression d'avertissement interdite."),s&&!this._isOwnerRole(s.role)&&await this.ensurePermission(s,"employees.warnings","Acc\xE8s refus\xE9 \xE0 la suppression d'avertissements.");let a=await this.getEmployeeById(e);if(!a)throw new Error("Employ\xE9 introuvable");let r=a.warnings||[];if(typeof r=="string")try{r=JSON.parse(r)}catch{r=[]}let o=r.filter(c=>c.id!==t),{error:l}=await D.from("employees").update({warnings:o}).eq("id",e);if(l)throw l;let i=this._employees.find(c=>c.id===e);return i&&(i.warnings=o),!0},async uploadFile(e,t="invoices"){let s=e.name.replace(/[^a-zA-Z0-9.-]/g,"_"),a=`${Date.now()}_${s}`,r=`${t}/${a}`,{data:o,error:l}=await D.storage.from("documents").upload(r,e);if(l)throw(l&&l.message?l.message:String(l)).toLowerCase().includes("row-level security")?new Error("Stockage 'documents' refuse l'upload (RLS). Ex\xE9cutez storage_policies_documents.sql dans Supabase."):l;let{data:i}=D.storage.from("documents").getPublicUrl(r);return i.publicUrl},async login(e,t){let{data:s,error:a}=await D.rpc("authenticate_employee",{p_username:e,p_password:t});if(a){let g=a&&a.message?String(a.message):"",w=a&&a.details?String(a.details):"";if(g==="ACCOUNT_LOCKED"){let m=null;try{m=w?JSON.parse(w):null}catch{m=null}let d=new Error("Compte bloqu\xE9.");throw d.code="ACCOUNT_LOCKED",d.lockMeta=m,d}return null}if(!s||!Array.isArray(s)||s.length===0)return null;let r=s[0],o={id:r.id,firstName:r.first_name,lastName:r.last_name,role:this._normalizeRole(r.role),username:r.username,accountLock:r.account_lock||null},l=o.accountLock;if(!this._isLockActive(l))try{l=await this.fetchEmployeeAccountLock(o.id)}catch{}if(this._isLockActive(l)){let g=new Error("Compte bloqu\xE9.");throw g.code="ACCOUNT_LOCKED",g.lockMeta=l,g}let i=null;try{i=await this.fetchEmployeePermissions(o.id)}catch{i=null}if(this.isLockActiveForPermissions(i)){let g=i&&typeof i=="object"?i.lock:null,w=new Error("Compte bloqu\xE9.");throw w.code="ACCOUNT_LOCKED",w.lockMeta=g,w}D.from("employees").update({last_login:new Date().toISOString()}).eq("id",o.id).then(({error:g})=>{g&&console.warn("Failed to update last_login",g)});let c=1;try{c=localStorage.getItem("remember_login")==="1"?7:1}catch{}return localStorage.setItem("imo_session",JSON.stringify({user:o,expiresAt:Date.now()+36e5*24*c})),this._currentUser=o,o},logout(){localStorage.removeItem("imo_session"),this._currentUser=null;try{this._accountLockCache=new Map}catch{}},getCurrentUser(){if(this._currentUser)return this._currentUser;let e=localStorage.getItem("imo_session");if(!e)return null;let t=JSON.parse(e);return t.expiresAt<Date.now()?(this.logout(),null):(this._currentUser=t.user?{...t.user,role:this._normalizeRole(t.user.role)}:null,this._currentUser)},_calculatePayrollDetails(e,t,s,a){let r=a.grade_rates||{},o=a.role_primes||{};!Object.values(r).some(w=>Number(w)>100)&&(!a.role_primes||Object.keys(a.role_primes).length===0)&&(o=r,r={}),(!o||Object.keys(o).length===0)&&(o={mecano_confirme:20,mecano_junior:20,chef_atelier:20,patron:60,co_patron:60,responsable:60});let i=w=>{let d=Number(o[w==="mecano"?"mecano_confirme":w]);return isFinite(d)&&d>=0?d/100:.2},c=w=>{if(w.custom_rate!==void 0&&w.custom_rate!==null)return Number(w.custom_rate);let m=w.role==="mecano"?"mecano_confirme":w.role,d=r[m];return d===void 0&&(m==="mecano_confirme"||m==="mecano_junior"?d=r.mecano_confirme||0:m==="co_patron"?d=r.patron||0:d=0),Number(d)};return e.map(w=>{let m=t.filter(x=>x.employeeId===w.id),d=m.reduce((x,E)=>x+Number(E.price),0),f=s.filter(x=>x.employee_id===w.id&&x.clock_out).reduce((x,E)=>{let T=Number(E.pause_total_ms||0);return x+Math.max(0,new Date(E.clock_out)-new Date(E.clock_in)-T)},0)/36e5,y=c(w),h=i(w.role),b=f*y,p=d*h,k=b+p;return{employeeId:w.id,name:`${w.first_name} ${w.last_name}`,role:w.role,totalHours:f,hourlyRate:y,fixedSalary:b,totalSales:d,commission:p,totalDue:k,paid:!1,sales:m}}).filter(w=>w.totalDue>0||w.totalHours>0||w.totalSales>0)},_mapSaleFromDB(e){let t=e.plate||e.vehicle_model||e.property_name;return{id:e.id,employeeId:e.employee_id,date:e.date,clientName:e.client_name,clientPhone:e.client_phone,vehicleModel:e.vehicle_model||e.property_name,plate:t,serviceType:e.service_type||e.type,price:Number(e.price),cost:Number(e.cost||0),invoiceUrl:e.invoice_url||e.contract_url,photoUrl:e.photo_url||e.location_url,contractFullPerf:e.contract_full_perf===!0,contractFullCustom:e.contract_full_custom===!0}},async fetchPayrollSettings(){let{data:e,error:t}=await D.from("payroll_settings").select("*").eq("id",1).single();if(t&&t.code==="PGRST116"){let s={id:1,commission_rate:.2,grade_rates:{mecano_confirme:0,mecano_junior:0,mecano_test:0,chef_atelier:0,patron:0,co_patron:0,responsable:0},role_primes:{mecano_confirme:20,mecano_junior:20,mecano_test:5,chef_atelier:20,patron:60,co_patron:60,responsable:60}},a=null,r=null;try{let o=await D.from("payroll_settings").insert(s).select().single();if(a=o.data,r=o.error,r&&(r.code==="42703"||String(r.message||"").toLowerCase().includes("does not exist"))){let{role_primes:l,...i}=s,c=await D.from("payroll_settings").insert(i).select().single();if(a=c.data,r=c.error,!r)try{localStorage.setItem("db_payroll_role_primes",JSON.stringify(s.role_primes))}catch{}}}catch(o){r=o}if(r)return console.error("Error creating default payroll settings:",r),null;e=a}else if(t)return console.error("Error fetching payroll settings:",t),null;if(e&&e.role_primes===void 0)try{let s=localStorage.getItem("db_payroll_role_primes");s&&(e.role_primes=JSON.parse(s))}catch{}if(e){let s={mecano_confirme:20,mecano_junior:20,mecano_test:5,chef_atelier:20,patron:60,co_patron:60,responsable:60};e.role_primes={...s,...e.role_primes||{}}}return localStorage.setItem("db_payroll_settings",JSON.stringify(e)),e},async savePayrollSettings(e,t,s,a,r){let o={};try{let{data:g}=await D.from("payroll_settings").select("*").eq("id",1).single();g&&(o=g)}catch{}let l={id:1,commission_rate:e!==void 0?e:o.commission_rate,grade_rates:t!==void 0?t:o.grade_rates};s!==void 0&&(l.company_split=s),a!==void 0&&(l.safe_balance=a),r!==void 0?l.role_primes=r:o.role_primes!==void 0&&(l.role_primes=o.role_primes);let i=null,c=null;{let g=await D.from("payroll_settings").upsert(l).select().single();i=g.data,c=g.error}if(c&&(c.code==="42703"||String(c.message||"").toLowerCase().includes("does not exist"))){let{role_primes:g,...w}=l,m=await D.from("payroll_settings").upsert(w).select().single();if(i=m.data,c=m.error,!c&&r!==void 0)try{localStorage.setItem("db_payroll_role_primes",JSON.stringify(r))}catch{}}if(c)throw console.error("Error saving payroll settings:",c),c;return localStorage.setItem("db_payroll_settings",JSON.stringify(i)),i},async updateSafeBalance(e){let{data:t,error:s}=await D.rpc("increment_safe_balance",{amount:Number(e)});if(!s)return{safe_balance:t};console.warn("RPC increment_safe_balance failed, falling back to legacy method:",s);let{data:a,error:r}=await D.from("payroll_settings").select("safe_balance").eq("id",1).single();if(r)throw r;let o=(Number(a.safe_balance)||0)+Number(e),{data:l,error:i}=await D.from("payroll_settings").update({safe_balance:o}).eq("id",1).select().single();if(i)throw i;return l},async saveEmployeeCustomRate(e,t){let{error:s}=await D.from("employees").update({custom_rate:t}).eq("id",e);if(s)throw console.error("Error saving employee custom rate:",s),s},async getLastArchiveDate(){let{data:e,error:t}=await D.from("weekly_archives").select("archived_at").order("archived_at",{ascending:!1}).limit(1).single();return t||!e?null:new Date(e.archived_at)},async fetchPayoutsSince(e){let t=D.from("payouts").select("*");e&&(t=t.gte("created_at",e.toISOString()));let{data:s,error:a}=await t;return a?(console.warn("Error fetching payouts:",a),[]):s||[]},async recordPayout(e,t,s,a){let{data:r,error:o}=await D.from("payouts").insert({employee_id:e,amount:t,period_start:s,period_end:a}).select().single();if(o)throw console.error("Error recording payout:",o),o;return r},async fetchPayouts(e,t,s){let a=D.from("payouts").select("*");e&&(a=a.eq("employee_id",e)),t&&(a=a.gte("created_at",t.toISOString())),s&&(a=a.lte("created_at",s.toISOString()));let{data:r,error:o}=await a;return o?(console.warn("Error fetching payouts (table might not exist yet):",o),[]):r||[]},async fetchTaxPayments(){let{data:e,error:t}=await D.from("tax_payments").select("*, paid_by_user:paid_by(first_name, last_name)").order("paid_at",{ascending:!1});return t?(console.warn("Error fetching tax payments:",t),[]):e||[]},async recordTaxPayment(e){let t=this.getCurrentUser(),s={amount:e.amount,rate:e.rate,taxable_base:e.taxable_base,period_start:e.period_start,period_end:new Date().toISOString(),paid_at:new Date().toISOString(),paid_by:t?t.id:null},{data:a,error:r}=await D.from("tax_payments").insert(s).select().single();if(r)throw console.error("Error recording tax payment:",r),r;return a},async fetchWebhookSettings(){let{data:e,error:t}=await D.from("webhook_settings").select("*").eq("id",1).single();if(t&&t.code==="PGRST116")try{let{data:s,error:a}=await D.from("webhook_settings").insert({id:1,sales_webhook_url:"",services_webhook_url:"",recruitment_webhook_url:""}).select().single();if(a)throw a;e=s}catch{try{let{data:a,error:r}=await D.from("webhook_settings").insert({id:1,sales_webhook_url:"",services_webhook_url:""}).select().single();if(r)throw r;e=a}catch(a){return console.error("Error creating webhook settings:",a),null}}else if(t)return console.error("Error fetching webhook settings:",t),null;try{localStorage.setItem("webhook_settings",JSON.stringify(e)),e.brand_logo_url&&localStorage.setItem("brand_logo_url",e.brand_logo_url)}catch{}return e},async saveWebhookSettings(e,t,s,a,r,o,l,i){let c={id:1,sales_webhook_url:e||"",services_webhook_url:t||""};s!==void 0&&(c.services_status_message_id=s||""),a!==void 0&&(c.recruitment_webhook_url=a||""),r!==void 0&&(c.brand_logo_url=r||""),o!==void 0&&(c.patch_note_webhook_url=o||""),l!==void 0&&(c.kit_webhook_url=l||""),i!==void 0&&(c.kit_role_id=i||"");let{data:g,error:w}=await D.from("webhook_settings").upsert(c).select().single();if(w)throw console.error("Error saving webhook settings:",w),w;try{localStorage.setItem("webhook_settings",JSON.stringify(g)),g.brand_logo_url&&localStorage.setItem("brand_logo_url",g.brand_logo_url)}catch{}return g},async submitApplication(e){let t=Date.now().toString(36)+Math.random().toString(36).substr(2),s=Ye([e.experience,e.motivation,e.availability].filter(Boolean).join(`

`)),{data:a,error:r}=await D.from("recruitment_applications").insert({id:t,full_name:e.fullName,discord_id:e.discordId,discord_user_id:e.discordUid,unique_id:e.uniqueId,phone_ig:e.phoneIg,age:parseInt(e.age),experience:e.experience,motivation:e.motivation,availability:e.availability,status:"pending"}).select().single();if(r)throw console.error("Error submitting application:",r),r;try{_e.logApplication({...e,id:t},s)}catch(o){console.warn("Discord.logApplication a \xE9chou\xE9:",o)}return a},async fetchApplications(){let{data:e,error:t}=await D.from("recruitment_applications").select("*").order("created_at",{ascending:!1});return t?(console.error("Error fetching applications:",t),[]):(e||[]).map(s=>{let a=Ye([s.experience,s.motivation,s.availability].filter(Boolean).join(`

`));return{...s,ai:a}})},async updateApplicationStatus(e,t,s){let a={status:t};t==="rejected"&&s&&(a.rejection_reason=s);let{data:r,error:o}=await D.from("recruitment_applications").update(a).eq("id",e).select().single();if(o){try{let l=await D.from("recruitment_applications").update({status:t}).eq("id",e).select().single();r=l.data,o=l.error}catch(l){o=l}if(o)throw console.error("Error updating application status:",o),o}if(r)try{let l=r.discord_user_id||r.discord_id;await _e.notifyRecruitmentDecision(t,r.full_name,l,s)}catch(l){console.warn("Discord notification failed:",l)}return r},async fetchEmployeeProfile(e){try{let{data:t,error:s}=await D.from("employee_profiles").select("*").eq("employee_id",e).single();if(s&&s.code!=="PGRST116")throw s;return t}catch(t){return console.error("Fetch profile error:",t),null}},async fetchRepairKitConfig(){let{data:e,error:t}=await D.from("inventory_settings").select("repair_kit_stock, repair_kit_price").eq("id",1).single();return t?{stock:0,price:2500}:{stock:e?.repair_kit_stock||0,price:e?.repair_kit_price!==void 0?Number(e.repair_kit_price):2500}},async fetchRepairKitStock(){return(await this.fetchRepairKitConfig()).stock},async updateRepairKitStock(e){let{error:t}=await D.rpc("update_repair_kit_stock",{new_stock:Number(e)});if(t)return console.warn("RPC update_repair_kit_stock failed, falling back:",t),this.updateRepairKitConfig(e,void 0)},async updateRepairKitConfig(e,t){let s={id:1};e!==void 0&&(s.repair_kit_stock=e),t!==void 0&&(s.repair_kit_price=t);let{error:a}=await D.from("inventory_settings").upsert(s);if(a)throw a},async createRepairKitOrder(e,t,s,a,r="pending",o=!1){let{data:l,error:i}=await D.from("repair_kit_orders").insert({client_name:e,quantity:t,phone:s,availability:a,status:r}).select().single();if(i){if(i.code==="42703"||String(i.message).includes("does not exist"))return await this.createRepairKitOrderLegacy(e,t);throw i}try{let c=await this.fetchRepairKitConfig(),g=await this.fetchWebhookSettings(),w=c.price||2500,m=t*w;if(await this.updateSafeBalance(m),await this.updateRepairKitStock((c.stock||0)-t),!o){let d=g?.kit_webhook_url||g?.services_webhook_url||"",n=g?.kit_role_id||"",v=n?`<@&${n}>`:"",f=n?{roles:[n]}:null;_e.sendLog("services","\u{1F4E6} Commande de Kits R\xE9paration",`**Client:** ${e}
**Quantit\xE9:** ${t}
**Prix Unitaire:** ${w} $
**Prix Total:** ${m} $
**T\xE9l:** ${s||"N/A"}
**Dispo:** ${a||"N/A"}`,15105570,[],d,v,f)}}catch(c){console.error("Error in repair kit side effects",c)}return l},async createRepairKitOrderLegacy(e,t){let{data:s,error:a}=await D.from("repair_kit_orders").insert({client_name:e,quantity:t}).select().single();if(a)throw a;return s},async fetchRepairKitOrders(){let{data:e,error:t}=await D.from("repair_kit_orders").select("*").order("created_at",{ascending:!1});return t?(console.error("Error fetching repair kit orders:",t),[]):e||[]},async createRepairKitSale(e){let t=Number(e.price)||0,s=1;try{let a=await this.fetchRepairKitConfig(),r=Number(a.price)||2800;s=Math.round(t/r),s<1&&(s=1)}catch{}return this.createRepairKitOrder(e.clientName||"Vente Directe",s,e.clientPhone||"","Immediate","completed",!0)},async upsertEmployeeProfile(e){let t=e&&typeof e=="object"?e:null;if(!t||!t.employee_id)return!1;try{let{error:s}=await D.from("employee_profiles").upsert(t,{onConflict:"employee_id"});if(s){let a=String(s.message||"").toLowerCase();if(s.code==="42P01"||a.includes("does not exist"))return!1;throw s}return!0}catch(s){if(String(s&&s.message?s.message:s).toLowerCase().includes("does not exist"))return!1;throw s}},async createEmployeeFromApplication(e){let t=this.getCurrentUser();t&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"employees.manage","Acc\xE8s refus\xE9 \xE0 la cr\xE9ation d\u2019employ\xE9s.");let s=e&&typeof e=="object"?e:null;if(!s)throw new Error("Candidature introuvable.");if(!this._employees||this._employees.length===0)try{await this.fetchEmployees()}catch{}let a=s.discord_user_id||s.discordUid||s.discord_userId||"",r=s.discord_id||s.discordId||"",o=this._employees.find(h=>{let b=h&&h.discord_id!=null?String(h.discord_id):"";return!!(a&&b&&b===String(a))})||null;if(o)return{created:!1,employee:o,credentials:null};let l=String(s.full_name||s.fullName||"").trim(),i=l.split(/\s+/).filter(Boolean),c=i.length?i[0]:"Employ\xE9",g=i.length>1?i.slice(1).join(" "):"Recrue",w=h=>String(h||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,18),m=w(c);m||(m=w(l)||"user");let d=c.trim();d.length>0?d=d.charAt(0).toUpperCase()+d.slice(1):d=l.split(" ")[0]||"Password123";let n=Ce(),v={id:n,first_name:c,last_name:g,phone:s.phone_ig||s.phoneIg||null,role:"mecano_test",username:m,password:d,photo:null,discord_id:a||r||null},f=null,y=null;try{let h=await D.from("employees").insert(v).select().single();f=h.data,y=h.error}catch(h){y=h}if(y&&(y.code==="23505"||String(y.message).includes("unique"))){let h=Math.floor(Math.random()*1e3);v.username=`${m}${h}`;let b=await D.from("employees").insert(v).select().single();f=b.data,y=b.error}if(y)throw y;try{let h={...f,role:this._normalizeRole(f.role)};this._employees.push(h)}catch{}try{await this.upsertEmployeeProfile({employee_id:n,recruitment_application_id:s.id||null,age:s.age!=null?Number(s.age):null,discord_handle:r||null,discord_user_id:a||null,unique_id:s.unique_id||s.uniqueId||null,phone_ig:s.phone_ig||s.phoneIg||null,experience:s.experience||null,motivation:s.motivation||null,availability:s.availability||null})}catch{}return{created:!0,employee:f,credentials:{username:v.username,password:d}}},async setRecruitmentStatus(e,t=""){let{data:s,error:a}=await D.from("webhook_settings").update({recruitment_open:e}).eq("id",1).select().single(),r=s;if(a){console.warn("Could not update recruitment status, trying upsert...",a);let{data:o,error:l}=await D.from("webhook_settings").upsert({id:1,recruitment_open:e}).select().single();if(l)throw console.error("Error setting recruitment status:",l),l;r=o}try{let o=JSON.parse(localStorage.getItem("webhook_settings")||"{}");o.recruitment_open=e,localStorage.setItem("webhook_settings",JSON.stringify(o))}catch{}return _e.sendRecruitmentStatus(e,t),r},getRecruitmentTargetCount(){try{let e=localStorage.getItem("webhook_settings"),s=(e?JSON.parse(e):{}).recruitment_target_count;return s==null?null:Number(s)}catch{return null}},async setRecruitmentTargetCount(e){let{data:t,error:s}=await D.from("webhook_settings").update({recruitment_target_count:Number(e)}).eq("id",1).select().single();if(s){let a=await D.from("webhook_settings").upsert({id:1,recruitment_target_count:Number(e)}).select().single();t=a.data,s=a.error,s&&console.warn("Recruitment target save failed, storing locally")}try{let a=JSON.parse(localStorage.getItem("webhook_settings")||"{}");a.recruitment_target_count=Number(e),localStorage.setItem("webhook_settings",JSON.stringify(a))}catch{}return t||{recruitment_target_count:Number(e)}},async deleteAllApplications(){let e=this.getCurrentUser();this._assertCanDelete(e,"Suppression interdite pour Co-Patron."),e&&!this._isOwnerRole(e.role)&&await this.ensurePermission(e,"recruitment.manage","Acc\xE8s refus\xE9 \xE0 la suppression de candidatures.");let{error:t}=await D.from("recruitment_applications").delete().neq("id","0");if(t)throw console.error("Error deleting all applications:",t),t;return!0},async deleteApplication(e){let t=this.getCurrentUser();this._assertCanDelete(t,"Suppression interdite pour Co-Patron."),t&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"recruitment.manage","Acc\xE8s refus\xE9 \xE0 la suppression de candidatures.");let{error:s}=await D.from("recruitment_applications").delete().eq("id",e);if(s)throw console.error("Error deleting application:",s),s;return!0},async fetchContracts(){let{data:e,error:t}=await D.from("contracts").select("*").order("created_at",{ascending:!1});return t?(console.error("Error fetching contracts:",t),[]):e||[]},async saveContract(e){let t={id:e.id,title:e.title,fournisseur:e.fournisseur,partenaire:e.partenaire,date:e.date,content_json:e.content_json,created_by:e.created_by},{data:s,error:a}=await D.from("contracts").upsert(t).select().single();if(a)throw console.error("Error saving contract:",a),a;return s},async deleteContract(e){let t=this.getCurrentUser();this._assertCanDelete(t,"Suppression interdite pour Co-Patron."),t&&!this._isOwnerRole(t.role)&&await this.ensurePermission(t,"contracts.manage","Acc\xE8s refus\xE9 \xE0 la suppression de contrats.");let{error:s}=await D.from("contracts").delete().eq("id",e);if(s)throw console.error("Error deleting contract:",s),s;return!0},async fetchEmploymentContract(e){let{data:t,error:s}=await D.from("employment_contracts").select("*").eq("employee_id",e).order("signed_at",{ascending:!1}).limit(1).single();if(s){if(s.code!=="PGRST116"){let a=String(s.message||"").toLowerCase();!a.includes("relation")&&!a.includes("does not exist")&&console.error("Error fetching employment contract:",s)}return null}return t},async signEmploymentContract(e){let{data:t,error:s}=await D.from("employment_contracts").insert({employee_id:e.employee_id,signature:e.signature,content_html:e.content_html,role_at_signature:e.role_at_signature,signed_at:new Date().toISOString()}).select().single();if(s)throw console.error("Error signing contract:",s),s;return t},async fetchAllEmploymentContracts(){let{data:e,error:t}=await D.from("employment_contracts").select("*").order("signed_at",{ascending:!1});if(t){let s=String(t.message||"").toLowerCase();return!s.includes("relation")&&!s.includes("does not exist")&&console.error("Error fetching all employment contracts:",t),[]}return e},async resetEmploymentContract(e){let{error:t}=await D.from("employment_contracts").delete().eq("employee_id",e);if(t)throw console.error("Error resetting contract:",t),t;return!0},async sendAnnouncement(e){let t=this.getCurrentUser(),{error:s}=await D.from("announcements").insert({content:e,author_name:t?`${t.firstName} ${t.lastName}`:"Syst\xE8me"});if(s)throw s},subscribeToAnnouncements(e){return D.channel("public:announcements").on("postgres_changes",{event:"INSERT",schema:"public",table:"announcements"},t=>{e(t.new)}).subscribe()},getPayrollRates(){try{let e=localStorage.getItem("payroll_rates");return e?JSON.parse(e):{}}catch{return{}}},savePayrollRate(e,t){let s=this.getPayrollRates();t===null?delete s[e]:s[e]=t,localStorage.setItem("payroll_rates",JSON.stringify(s))},getCommissionRate(){try{let e=localStorage.getItem("commission_rate");return e?parseFloat(e):.2}catch{return .2}},saveCommissionRate(e){localStorage.setItem("commission_rate",e.toString())},getGradeRates(){try{let e=localStorage.getItem("grade_rates"),t=e?JSON.parse(e):null,s=t&&typeof t=="object"?t:{mecano_confirme:0,mecano_junior:0,mecano_test:0,chef_atelier:0,responsable_rh:0,patron:0,co_patron:0};return s.mecano!==void 0&&(s.mecano_confirme===void 0&&(s.mecano_confirme=s.mecano),s.mecano_junior===void 0&&(s.mecano_junior=s.mecano),delete s.mecano),s}catch{return{mecano_confirme:0,mecano_junior:0,mecano_test:0,chef_atelier:0,responsable_rh:0,patron:0,co_patron:0}}},saveGradeRate(e,t){let s=this.getGradeRates();s[e]=t,localStorage.setItem("grade_rates",JSON.stringify(s))},async calculateGlobalSafeBalance(){try{let[e,t,s,a]=await Promise.all([this.fetchPayrollSettings(),this.fetchSales(),this.fetchRepairKitOrders(),this.fetchRepairKitConfig()]),o=(e?.role_primes||{}).safe_config||{},l=parseFloat(o.manual_balance)||0,i=o.manual_balance_updated_at?new Date(o.manual_balance_updated_at):new Date(0),c=t.reduce((m,d)=>{if(new Date(d.date)>i){let v=parseFloat(d.price)||0,f=parseFloat(d.cost)||0;return m+(v-f)}return m},0),g=Number(a.price)||2500,w=s.reduce((m,d)=>new Date(d.created_at)>i&&d.status!=="cancelled"&&d.status!=="rejected"?m+Number(d.quantity)*g:m,0);return l+c+w}catch(e){return console.error("Error calculating global safe balance:",e),0}},async syncGlobalSafeBalance(){try{let e=await this.calculateGlobalSafeBalance(),{error:t}=await D.from("payroll_settings").update({safe_balance:e}).eq("id",1);return t&&console.warn("Failed to sync safe balance to DB:",t),e}catch(e){console.error("Error syncing safe balance:",e)}},async getTuningCatalog(){try{let{data:e,error:t}=await D.from("tuning_catalog").select("*").order("created_at",{ascending:!0});return t?(console.error("Error fetching tuning catalog:",t),[]):e||[]}catch{return[]}},async saveTuningItem(e){let t={name:e.name,category:e.category,price:e.price,cost:e.cost};e.id?t.id=e.id:t.id=Date.now().toString(36)+Math.random().toString(36).substr(2);let{data:s,error:a}=await D.from("tuning_catalog").upsert(t).select().single();if(a)throw a;return s},async deleteTuningItem(e){let{error:t}=await D.from("tuning_catalog").delete().eq("id",e);if(t)throw t;return!0},async fetchTombolaEntries(){let{data:e,error:t}=await D.from("tombola_entries").select("*").order("created_at",{ascending:!0});return t?(console.error("Error fetching tombola entries:",t),[]):e||[]},async addTombolaEntry(e,t){let{data:s,error:a}=await D.from("tombola_entries").insert({name:e,tickets:t}).select().single();if(a)throw a;return s},async updateTombolaEntryTickets(e,t){let{data:s,error:a}=await D.from("tombola_entries").update({tickets:t}).eq("id",e).select().single();if(a)throw a;return s},async clearTombolaEntries(){let{error:e}=await D.from("tombola_entries").delete().neq("id","00000000-0000-0000-0000-000000000000");if(e)throw e;return!0},async deleteTombolaEntry(e){let{error:t}=await D.from("tombola_entries").delete().eq("id",e);if(t)throw t;return!0}};var ie={login(e,t){return u.login(e,t)},logout(){u.logout(),window.location.reload()},getUser(){return u.getCurrentUser()},isAuthenticated(){return!!this.getUser()},isAdmin(){let e=this.getUser();return e&&e.role==="patron"},isTrainer(){let e=this.getUser();return e&&e.role==="chef_formatrice"},isRH(){let e=this.getUser();return e&&e.role==="responsable_rh"},requireAuth(){return!!this.isAuthenticated()}};function He(e){let t=ie.getUser();if(!t)return e;let s="#dashboard";try{s=(window.location.hash||"").split("?")[0]||""||"#dashboard",s==="#"&&(s="#dashboard")}catch{s="#dashboard"}let a=!1,r="";try{a=localStorage.getItem("sidebar_admin_open")==="1",r=sessionStorage.getItem("sidebar_search")||""}catch{a=!1,r=""}let o=u.hasPermissionSync(t,"employees.view"),l=u.hasPermissionSync(t,"employees.manage"),i=u.hasPermissionSync(t,"payroll.manage"),c=u.hasPermissionSync(t,"sales.view_all"),g=u.hasPermissionSync(t,"sales.manage"),w=c,m=u.hasPermissionSync(t,"archives.manage")||u.hasPermissionSync(t,"archives.view"),d=u.hasPermissionSync(t,"config.manage"),n=u.hasPermissionSync(t,"recruitment.manage"),v=u.hasPermissionSync(t,"contracts.view")||u.hasPermissionSync(t,"contracts.manage"),f=o||i||c||w||m||d||n,y=[o,i,c,w,m,n,d].filter(Boolean).length,h="w-64",b="",p="",k="";return`
        <div class="flex h-screen bg-slate-900 overflow-hidden text-white">
            <!-- Mobile Overlay -->
            <div id="mobile-overlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden glass transition-opacity"></div>

            <!-- Sidebar -->
            <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 ${h} bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 transform -translate-x-full lg:translate-x-0 lg:static glass">
                <div class="h-1 w-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc]"></div>
                <div class="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        ${(()=>{try{let x=null;try{let E=JSON.parse(localStorage.getItem("webhook_settings"));E&&E.brand_logo_url&&(x=E.brand_logo_url)}catch{}if(x||(x=localStorage.getItem("brand_logo_url")),x)return`<div class="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                                        <img src="${x}" alt="logo" class="w-10 h-10 object-contain rounded-md">
                                    </div>`}catch{}return'<div class="p-2 rounded-xl bg-slate-900 border border-slate-800"><i data-lucide="wrench" class="w-6 h-6 text-white"></i></div>'})()}
                        <div class="js-sidebar-text ${k}">
                            <h1 class="text-xl font-bold tracking-tight uppercase">DriveLine Customs</h1>
                            <p class="text-[10px] text-slate-400 uppercase tracking-widest">Atelier & M\xE9canique</p>
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
                            ${t.firstName[0]}${t.lastName[0]}
                        </div>
                        <div class="js-sidebar-text ${k}">
                            <p class="font-medium text-sm text-white group-hover:text-blue-400 transition-colors">${t.firstName} ${t.lastName}</p>
                            <p class="text-xs text-slate-400 capitalize">${t.role==="patron"?"Patron":t.role==="co_patron"?"Co-Patron":t.role==="responsable"?"Responsable":t.role==="chef_atelier"?"Chef d'Atelier":t.role==="mecano_confirme"?"M\xE9cano Confirm\xE9":t.role==="mecano_junior"?"M\xE9cano Junior":t.role==="mecano_test"?"M\xE9cano Test":t.role==="mecano"?"M\xE9cano Confirm\xE9":"Employ\xE9"}</p>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-slate-800/50">
                        <div class="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/10 rounded-xl p-3 flex items-center gap-3 group hover:border-emerald-500/30 transition-all">
                            <div class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <i data-lucide="coins" class="w-4 h-4"></i>
                            </div>
                            <div class="js-sidebar-text ${k}">
                                <p class="text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider mb-0.5">Solde Coffre</p>
                                <p id="sidebar-safe-balance" class="text-sm font-bold text-white font-mono tracking-tight">...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="js-sidebar-text px-4 pt-4 ${k}">
                    <!-- Search Removed -->
                </div>

                <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
                    <a data-nav-label="Tableau de Bord" data-nav-group="main" href="#dashboard" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#dashboard"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                        <i data-lucide="layout-dashboard" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                        <span class="js-nav-label ${p}">Tableau de Bord</span>
                    </a>
                    
                    <a data-nav-label="Pointeuse" data-nav-group="main" href="#pointeuse" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#pointeuse"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-all group">
                        <i data-lucide="clock" class="w-5 h-5 ${s==="#pointeuse"?"text-white":"group-hover:text-blue-500"} transition-colors"></i>
                        <span class="js-nav-label ${p}">Pointeuse</span>
                    </a>

                    ${f?`
                    <a data-nav-label="Tombola" data-nav-group="main" href="#tombola" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#tombola"?"bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-all group">
                        <i data-lucide="party-popper" class="w-5 h-5 ${s==="#tombola"?"text-white":"group-hover:text-orange-500"} transition-colors"></i>
                        <span class="js-nav-label ${p}">Tombola</span>
                    </a>
                    `:""}

                    <a data-nav-label="Mes Interventions" data-nav-group="main" href="#sales" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#sales"?"bg-blue-600 text-white shadow-lg shadow-blue-900/50":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                        <i data-lucide="wrench" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                        <span class="js-nav-label ${p}">Mes Interventions</span>
                    </a>

                    ${g?`
                    <a data-nav-label="Calculateur Custom" data-nav-group="main" href="#calculator" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#calculator"?"bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                        <i data-lucide="palette" class="w-5 h-5 group-hover:text-pink-500 transition-colors"></i>
                        <span class="js-nav-label ${p}">Calculateur Custom</span>
                    </a>
                    `:""}

                    <a data-nav-label="D\xE9clarer une absence" data-nav-group="main" href="#absence" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#absence"?"bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                        <i data-lucide="calendar-off" class="w-5 h-5 group-hover:text-purple-500 transition-colors"></i>
                        <span class="js-nav-label ${p}">D\xE9clarer une absence</span>
                    </a>

                    ${v?`
                    <a data-nav-label="Contrat RP" data-nav-group="main" href="#contracts-rp" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#contracts-rp"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                        <i data-lucide="file-text" class="w-5 h-5 group-hover:text-cyan-500 transition-colors"></i>
                        <span class="js-nav-label ${p}">Contrat RP</span>
                    </a>
                    `:""}

                    ${f?`
                        <div class="pt-6 pb-2">
                            <button id="sidebar-admin-toggle" type="button" class="w-full flex items-center justify-between px-4 py-2 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-white/5 transition-colors">
                                <span class="flex items-center gap-2">
                                    <span>Administration</span>
                                    <span class="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">${y}</span>
                                </span>
                                <i id="sidebar-admin-chevron" data-lucide="chevron-down" class="w-4 h-4 text-slate-500 transition-transform ${a?"rotate-180":""}"></i>
                            </button>
                        </div>
                        <div id="sidebar-admin-group" class="${a?"":"hidden"} space-y-1">

                        ${o?`
                        <a data-nav-label="Employ\xE9s & Compta" data-nav-group="admin" href="#employees" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#employees"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                            <i data-lucide="users" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${p}">Employ\xE9s & Compta</span>
                        </a>
                        `:""}

                        ${i?`
                        <a data-nav-label="Fiches de Paie" data-nav-group="admin" href="#payroll" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#payroll"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                            <i data-lucide="banknote" class="w-5 h-5 group-hover:text-green-500 transition-colors"></i>
                            <span class="js-nav-label ${p}">Fiches de Paie</span>
                        </a>

                        <a data-nav-label="Gestion Coffre" data-nav-group="admin" href="#safe-management" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#safe-management"?"bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                            <i data-lucide="landmark" class="w-5 h-5 group-hover:text-emerald-500 transition-colors"></i>
                            <span class="js-nav-label ${p}">Gestion Coffre</span>
                        </a>
                        `:""}

                        ${c?`
                        <a data-nav-label="Historique Atelier" data-nav-group="admin" href="#admin-sales" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#admin-sales"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                            <i data-lucide="history" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${p}">Historique Atelier</span>
                        </a>
                        
                        <a data-nav-label="Annuaire Plaques" data-nav-group="admin" href="#plates" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#plates"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                            <i data-lucide="book" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${p}">Annuaire Plaques</span>
                        </a>
                        `:""}

                        ${w?`
                        <a data-nav-label="Statistiques Globales" data-nav-group="admin" href="#admin-stats" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#admin-stats"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                            <i data-lucide="bar-chart-3" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${p}">Statistiques Globales</span>
                        </a>
                        `:""}

                        ${m?`
                        <a data-nav-label="Archives Comptables" data-nav-group="admin" href="#archives" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#archives"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                            <i data-lucide="archive" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${p}">Archives Comptables</span>
                        </a>
                        `:""}

                        ${n?`
                        <a data-nav-label="Recrutement" data-nav-group="admin" href="#admin-recruitment" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#admin-recruitment"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                            <i data-lucide="file-text" class="w-5 h-5 group-hover:text-purple-500 transition-colors"></i>
                            <span class="js-nav-label ${p}">Recrutement</span>
                        </a>
                        `:""}

                        ${d?`
                        <a data-nav-label="Configuration" data-nav-group="admin" href="#admin-config" onclick="toggleSidebar()" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${b} ${s==="#admin-config"?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/40":"text-slate-400 hover:bg-slate-800 hover:text-white"} transition-colors group">
                            <i data-lucide="settings" class="w-5 h-5 group-hover:text-blue-500 transition-colors"></i>
                            <span class="js-nav-label ${p}">Configuration</span>
                        </a>
                        `:""}
                        </div>
                    `:""}
                </nav>

                <div class="p-4 border-t border-slate-800 space-y-2">
                    <button id="logout-btn" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                        <span class="js-nav-label">D\xE9connexion</span>
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
                    <span class="font-bold text-lg text-white">DriveLine Customs v${mt}</span>
                    <div class="w-10"></div>
                </header>

                <!-- Main Content -->
                <main class="flex-1 overflow-auto p-4 md:p-8 relative scroll-smooth z-10">
                    ${e}
                </main>
            </div>
        </div>
    `}async function gt(){let e=null;try{try{let a=JSON.parse(localStorage.getItem("webhook_settings"));a&&a.brand_logo_url&&(e=a.brand_logo_url)}catch{}if(e||(e=localStorage.getItem("brand_logo_url")),!e){let a=await u.fetchWebhookSettings();a&&a.brand_logo_url&&(e=a.brand_logo_url)}}catch(a){console.warn("Error loading brand logo:",a)}let t=(a="w-20 h-20",r="bg-blue-600/20 p-3 border-blue-500/30")=>e?`<div class="${r} rounded-2xl inline-block mb-6 border shadow-lg">
                <img src="${e}" alt="logo" class="${a} object-contain rounded-lg">
            </div>`:`<div class="${r} rounded-2xl inline-block mb-6 border shadow-lg"><i data-lucide="wrench" class="w-12 h-12 text-blue-400"></i></div>`,s=()=>e?`<div class="bg-blue-600 p-1 rounded-lg"><img src="${e}" alt="logo" class="w-8 h-8 object-contain rounded"></div><span class="text-xl font-bold text-white">DriveLine</span>`:'<div class="bg-blue-600 p-2 rounded-lg"><i data-lucide="wrench" class="w-6 h-6 text-white"></i></div><span class="text-xl font-bold text-white">DriveLine</span>';return`
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
                    ${t()}
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700 text-[11px] text-slate-300 font-semibold tracking-wide mb-6 glass">
                        <span class="inline-block w-2 h-2 rounded-full bg-[#dd3bcc]"></span>
                        <span class="inline-block w-2 h-2 rounded-full bg-[#4bb4d3]"></span>
                        <span>Garage OS \u2022 Atelier \u2022 Compta \u2022 Pointeuse</span>
                    </div>
                    <h1 class="text-5xl font-extrabold mb-5 tracking-tight">DriveLine Customs</h1>
                    <p class="text-lg text-slate-300 leading-relaxed max-w-lg">
                        Pilote l'atelier en temps r\xE9el: interventions, pointages, paie et performance. Un cockpit clair, rapide et solide.
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
                                <div class="text-xs text-slate-400">pr\xE9sences live</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 rounded-2xl bg-slate-900/55 border border-slate-800 p-4 glass">
                            <div class="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20"><i data-lucide="banknote" class="w-5 h-5 text-blue-400"></i></div>
                            <div>
                                <div class="text-sm font-bold text-white">Paie</div>
                                <div class="text-xs text-slate-400">r\xE9glages rapides</div>
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
                    ${s()}
                </div>

                <div class="w-full max-w-md">
                    <div class="rounded-3xl bg-slate-900/70 border border-slate-700 shadow-lg p-7 lg:p-8 glass">
                        <div class="h-1 w-full rounded-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc] mb-7"></div>
                        <div class="text-center lg:text-left">
                            <h2 class="text-3xl font-extrabold text-white tracking-tight">Bienvenue</h2>
                            <p class="mt-2 text-slate-300">Connectez-vous pour acc\xE9der \xE0 l'atelier.</p>
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
                                <p id="username-error" class="hidden mt-1 text-xs text-red-400">Identifiant requis (3 caract\xE8res minimum).</p>
                            </div>

                            <div>
                                <label for="password" class="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
                                <div class="relative group">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i data-lucide="lock" class="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"></i>
                                    </div>
                                    <input type="password" name="password" id="password" required autocomplete="off"
                                        class="block w-full pl-10 pr-12 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm" 
                                        placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022">
                                    <button type="button" id="btn-toggle-password" class="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-200 focus:outline-none">
                                        <i data-lucide="eye" class="h-5 w-5"></i>
                                    </button>
                                </div>
                                <div id="caps-warning" class="hidden text-xs mt-2 text-yellow-400">V\xE9rifie: MAJ activ\xE9e</div>
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
                                <span>Commander Kit R\xE9paration</span>
                            </span>
                        </a>
                        </form>
                    </div>

                    <p class="text-center text-xs text-slate-500 mt-8">
                        &copy; ${new Date().getFullYear()} DriveLine Customs. Tous droits r\xE9serv\xE9s.
                    </p>
                </div>
            </div>
        </div>
    `}var se={init(){if(!document.getElementById("modal-container")){let e=document.createElement("div");e.id="modal-container",e.className="fixed inset-0 z-[60] hidden flex items-center justify-center",e.innerHTML=`
                <div class="absolute inset-0 bg-black/60 transition-opacity" id="modal-backdrop"></div>
                <div id="modal-content" class="relative bg-slate-900/80 glass rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md p-6 transform transition-all duration-150 scale-95 opacity-0 max-h-[90vh] overflow-y-auto">
                    <!-- Dynamic Content -->
                </div>
            `,document.body.appendChild(e)}},show({title:e,message:t,type:s="info",confirmText:a="Confirmer",cancelText:r="Annuler",onConfirm:o,inputExpected:l=null,size:i="md"}){this.init();let c=document.getElementById("modal-container"),g=document.getElementById("modal-content"),w=document.getElementById("modal-backdrop");g.classList.remove("max-w-md","max-w-lg","max-w-xl","max-w-2xl","max-w-3xl"),g.classList.add(`max-w-${i}`),c.classList.remove("hidden"),requestAnimationFrame(()=>{g.classList.remove("scale-95","opacity-0"),g.classList.add("scale-100","opacity-100")});let m="";s==="danger"?m=`<div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <i data-lucide="alert-triangle" class="h-6 w-6 text-red-500"></i>
            </div>`:m=`<div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <i data-lucide="info" class="h-6 w-6 text-blue-500"></i>
            </div>`;let d="";l&&(d=`
                <div class="mt-4">
                    <label class="block text-sm font-medium text-slate-400 mb-1">Tapez <span class="font-bold text-white select-all">${l}</span> pour confirmer :</label>
                    <input type="text" id="modal-input" class="block w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-red-500 focus:ring-red-500 sm:text-sm p-2.5" autocomplete="off">
                </div>
            `),g.innerHTML=`
            <div class="h-1 w-full rounded-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc] mb-5"></div>
            <div class="flex items-start gap-3 mb-3">
                ${m}
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold leading-6 text-white" id="modal-title">${e}</h3>
                </div>
                <button id="modal-close-icon" class="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
            <div id="modal-body" class="text-sm text-slate-300">
                ${t}
            </div>
            ${d}
            <div class="mt-6 flex justify-end gap-2">
                ${r?`
                <button type="button" id="modal-cancel-btn" class="inline-flex justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-700 hover:bg-slate-700 transition-colors">
                    ${r}
                </button>
                `:""}
                <button type="button" id="modal-confirm-btn" class="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm ${s==="danger"?"bg-red-600 hover:bg-red-500":"bg-blue-600 hover:bg-blue-700"} disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    ${a}
                </button>
            </div>
        `,window.lucide&&lucide.createIcons();let n=document.getElementById("modal-confirm-btn"),v=document.getElementById("modal-cancel-btn"),f=document.getElementById("modal-input");l&&f?(n.disabled=!0,f.addEventListener("input",b=>{b.target.value===l?n.disabled=!1:n.disabled=!0}),f.focus()):n.focus();let y=()=>{g.classList.remove("scale-100","opacity-100"),g.classList.add("scale-95","opacity-0"),setTimeout(()=>{c.classList.add("hidden")},200)};n.onclick=async b=>{if(b.preventDefault(),b.stopPropagation(),o){let p=o();if(p instanceof Promise){let k=n.innerText;n.disabled=!0,n.innerHTML='<div class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>';try{await p}catch(x){console.error(x)}finally{n.disabled=!1,n.innerText=k}}}y()};let h=document.getElementById("modal-close-icon");v&&(v.onclick=y),h&&(h.onclick=y),w.onclick=y}};function Ue(){let e=ie.getUser(),t=u.hasPermissionSync(e,"sales.view_all"),s=u.getSales(),a=s.filter($=>$.employeeId===e.id),r=t?s:a,o=r.reduce(($,L)=>$+Number(L.price),0),l=r.length,i=a.reduce(($,L)=>$+(Number(L.price)-Number(L.cost||0)),0),c=.6,g={},w={};try{let $=localStorage.getItem("db_payroll_settings");if($){let L=JSON.parse($);L&&(L.company_split!==void 0&&(c=Number(L.company_split)||.6),L.grade_rates&&(g=L.grade_rates||{}),L.role_primes&&(w=L.role_primes||{}))}}catch($){console.error("Error loading settings:",$)}let m=u.getTimeEntries(),d=$=>{let j=Number(w&&w[$==="mecano"?"mecano_confirme":$]);return isFinite(j)&&j>=0?j/100:.2},n=($,L)=>{let F=L.reduce((fe,ce)=>fe+(Number(ce.price)-Number(ce.cost||0)),0)*d($.role),Z=m.filter(fe=>fe.employee_id===$.id&&fe.clock_out).reduce((fe,ce)=>{let ge=Number(ce.pause_total_ms||0),he=new Date(ce.clock_in),me=new Date(ce.clock_out);if(isNaN(he.getTime())||isNaN(me.getTime()))return fe;let te=me-he-(isNaN(ge)?0:ge);return fe+Math.max(0,te)},0)/36e5,ee=$.custom_rate;ee==null&&(ee=g[$.role]||0);let de=Number(ee),re=Z*(isNaN(de)?0:de),ue=F+re;return isNaN(ue)?0:ue},v=o*c,f=n(u.getEmployees().find($=>$.id===e.id)||{id:e.id,role:e.role},a),y=u.getEmployees().length,{start:h,end:b}=je(),p=r.slice().reverse().slice(0,5),k=r.filter($=>{let L=new Date($.date);return L>=h&&L<=b}),x=0;t?x=k.reduce(($,L)=>$+Number(L.price),0):x=k.reduce(($,L)=>$+(Number(L.price)-Number(L.cost||0)),0);let E=k.length,T=(()=>{if(!t){let $=u.getEmployees().find(L=>L.id===e.id)||{id:e.id,role:e.role};return n($,k)}return 0})(),P=[],C=u.getEmployees().find($=>$.id===e.id);if(C&&C.warnings)if(typeof C.warnings=="string")try{P=JSON.parse(C.warnings)}catch{}else P=C.warnings;let R=(P||[]).slice().sort(($,L)=>new Date(L.date)-new Date($.date)),_=R[0]||null,I=_?String(_.reason||"").replace(/</g,"&lt;"):"",A=_&&_.date?new Date(_.date).toLocaleString("fr-FR",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"",H=R.length,q=H>=3?"danger":H===2?"warning":"caution",M=q==="danger"?"border-red-500/50 shadow-red-900/20":q==="warning"?"border-orange-500/50 shadow-orange-900/20":"border-yellow-500/50 shadow-yellow-900/20",V=q==="danger"?"from-red-500/20 to-red-900/20":q==="warning"?"from-orange-500/20 to-orange-900/20":"from-yellow-500/20 to-yellow-900/20";t||(window.showMyWarnings=()=>{if(!R||!R.length)return;let $=`
                <div class="space-y-4">
                    <div class="text-sm text-slate-300">Historique de tes avertissements.</div>
                    <div class="space-y-3">
                        ${R.map((L,j)=>{let F=j+1,X=F>=3?"bg-red-500/10 text-red-300 border-red-500/20":F===2?"bg-orange-500/10 text-orange-300 border-orange-500/20":"bg-yellow-500/10 text-yellow-300 border-yellow-500/20",O=L.date?new Date(L.date).toLocaleString("fr-FR",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"\u2014";return`
                                <div class="bg-slate-900/40 border border-slate-700 rounded-xl p-4">
                                    <div class="flex items-start justify-between gap-3">
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-2">
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${X}">#${F}</span>
                                                <div class="text-sm font-semibold text-white break-words">${String(L.reason||"").replace(/</g,"&lt;")}</div>
                                            </div>
                                            <div class="mt-1 text-xs text-slate-400">
                                                <span class="text-slate-500">Par</span> <span class="text-slate-300 font-medium">${String(L.author||"\u2014").replace(/</g,"&lt;")}</span>
                                                <span class="text-slate-600">\u2022</span>
                                                <span class="font-mono">${O}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `}).join("")}
                    </div>
                </div>
            `;se.show({title:"Avertissements",message:$,type:"danger",size:"lg",confirmText:"Fermer",cancelText:null,onConfirm:()=>{}})});let W=($,L,j,F,X,O,Z=null)=>`
        <div class="relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 group hover:border-white/10 transition-all duration-300">
            <!-- Background Glow Removed for performance/minimalism -->
            
            <div class="relative z-10 flex justify-between items-start">
                <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">${$}</p>
                    <h3 class="text-3xl font-extrabold text-white tracking-tight">${t?L:B(r.reduce((ee,de)=>ee+(Number(de.price)-Number(de.cost||0)),0))}</h3>
                    ${Z?`<p class="text-xs font-medium ${F} mt-1">${Z}</p>`:""}
                </div>
                <div class="p-3 rounded-xl bg-slate-800/50 border border-white/5 text-${F.split(" ")[0]}-400 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    ${j}
                </div>
            </div>
        </div>
    `,N=u.getEmployees().filter($=>!!m.find(j=>j.employee_id===$.id&&!j.clock_out)).map($=>{let L=m.find(j=>j.employee_id===$.id&&!j.clock_out);return{...$,entry:L}});return`
        <div class="space-y-8 animate-fade-in pb-20">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-2">
                        <i data-lucide="layout-dashboard" class="w-3 h-3"></i>
                        <span>${t?"Pilotage Atelier":"Espace Personnel"}</span>
                    </div>
                    <h1 class="text-4xl font-black text-white tracking-tight">Tableau de Bord</h1>
                    <p class="text-slate-400 mt-1 flex items-center gap-2">
                        Bienvenue, <span class="text-white font-semibold">${e.firstName}</span>. Voici le r\xE9sum\xE9 de l'activit\xE9.
                    </p>
                </div>
                <button onclick="window.location.hash = '#sales/new'" class="group relative px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div class="relative flex items-center gap-2">
                        <span>Nouvelle Prestation</span>
                        <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </button>
            </div>

            <!-- KPIs Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${t?`
                    ${W("Mon Chiffre d'Affaires",B(i),'<i data-lucide="wallet" class="w-5 h-5"></i>',"text-cyan-400","cyan-500","sky-500")}
                    ${W("CA Global",B(o),'<i data-lucide="dollar-sign" class="w-5 h-5"></i>',"text-blue-400","blue-500","indigo-500")}
                    ${W(`Revenu Garage (${Math.round(c*100)}%)`,B(v),'<i data-lucide="building-2" class="w-5 h-5"></i>',"text-green-400","green-500","emerald-500")}
                    ${W("Employ\xE9s Actifs",y,'<i data-lucide="users" class="w-5 h-5"></i>',"text-purple-400","purple-500","fuchsia-500")}
                `:`
                    <!-- Personal Weekly Stats (Highlighted) -->
                    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 p-6 group hover:border-blue-500/50 transition-all duration-300 md:col-span-2">
                        <div class="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div class="relative z-10 flex justify-between items-center h-full">
                            <div>
                                <p class="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <i data-lucide="calendar-clock" class="w-3 h-3"></i> Cette Semaine
                                </p>
                                <div class="flex items-baseline gap-3">
                                    <h3 class="text-4xl font-black text-white tracking-tight">${B(x)}</h3>
                                    <span class="text-sm font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">${E} prestations</span>
                                </div>
                                <p class="text-xs font-medium text-slate-400 mt-2">Salaire estim\xE9: <span class="text-green-400 font-bold">${B(T)}</span></p>
                            </div>
                            <div class="hidden sm:block p-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                                <i data-lucide="trending-up" class="w-8 h-8"></i>
                            </div>
                        </div>
                    </div>

                    ${W("Total Cumul\xE9",B(o),'<i data-lucide="dollar-sign" class="w-5 h-5"></i>',"text-slate-400","slate-500","gray-500","Depuis le d\xE9but")}
                    
                    ${H>0?`
                        <div onclick="window.showMyWarnings && window.showMyWarnings()" class="relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-md border ${M} p-6 group cursor-pointer hover:scale-[1.02] transition-all duration-300">
                            <div class="absolute inset-0 bg-gradient-to-br ${V} opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div class="relative z-10 flex justify-between items-start">
                                <div>
                                    <p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Avertissements</p>
                                    <h3 class="text-3xl font-extrabold text-white tracking-tight">${H}</h3>
                                    <p class="text-xs text-slate-300 mt-1 opacity-80 group-hover:opacity-100">Cliquez pour voir le d\xE9tail</p>
                                </div>
                                <div class="p-3 rounded-xl bg-slate-900/50 border border-white/10 text-white shadow-lg">
                                    <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                                </div>
                            </div>
                        </div>
                    `:W("Avertissements","0",'<i data-lucide="shield-check" class="w-5 h-5"></i>',"text-green-400","green-500","emerald-500","Tout est parfait")}
                `}
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Recent Sales List -->
                <div class="lg:col-span-2 flex flex-col gap-6">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <i data-lucide="history" class="w-5 h-5 text-blue-500"></i>
                            Derni\xE8res Interventions
                        </h3>
                        ${t?'<a href="#admin-sales" class="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors">Voir tout</a>':""}
                    </div>

                    <div class="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        ${p.length===0?`
                            <div class="p-12 text-center">
                                <div class="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 mx-auto flex items-center justify-center mb-4">
                                    <i data-lucide="clipboard-list" class="w-8 h-8 text-slate-500"></i>
                                </div>
                                <h4 class="text-white font-bold text-lg mb-1">Aucune intervention</h4>
                                <p class="text-slate-500 text-sm">Commencez par enregistrer une nouvelle prestation.</p>
                            </div>
                        `:`
                            <div class="divide-y divide-white/5">
                                ${p.map($=>`
                                    <div class="group p-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                                                <i data-lucide="wrench" class="w-5 h-5"></i>
                                            </div>
                                            <div>
                                                <div class="flex items-baseline gap-2">
                                                    <h4 class="text-sm font-bold text-white">${$.vehicleModel}</h4>
                                                    <span class="text-xs text-slate-500 font-mono">${$e($.date)}</span>
                                                </div>
                                                <div class="text-xs text-slate-400 mt-0.5">
                                                    <span class="text-blue-400 font-medium">${$.serviceType}</span>
                                                    <span class="text-slate-600 mx-1">\u2022</span>
                                                    Client: <span class="text-slate-300">${$.clientName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="flex items-center gap-4">
                                            ${t?`
                                                <span class="text-sm font-bold text-white bg-slate-800/50 px-3 py-1 rounded-lg border border-white/5 font-mono">
                                                    ${B($.price)}
                                                </span>
                                            `:`
                                                <div class="flex flex-col items-end">
                                                    <span class="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 font-mono">
                                                        ${B(Number($.price)-Number($.cost||0))}
                                                    </span>
                                                    <span class="text-[10px] text-slate-500 mt-1 mr-1 font-mono">
                                                        ${$.serviceType==="R\xE9paration"||Number($.cost||0)===0?"100%":"Prix \xF7 1.8"}
                                                    </span>
                                                </div>
                                            `}
                                            
                                            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                                <button onclick="window.location.hash = '#sales/edit/${$.id}'" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                                                    <i data-lucide="pencil" class="w-4 h-4"></i>
                                                </button>
                                                ${u.hasPermissionSync(e,"sales.manage")?`
                                                <button onclick="deleteSale('${$.id}')" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                </button>
                                                `:""}
                                            </div>
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        `}
                    </div>
                </div>

                <!-- Active Employees List (New) -->
                ${t?`
                <div class="flex flex-col gap-6">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-bold text-white flex items-center gap-2">
                            <div class="relative">
                                <span class="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <i data-lucide="users" class="w-5 h-5 text-purple-500"></i>
                            </div>
                            En Service (${N.length})
                        </h3>
                        <a href="#employees" class="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider transition-colors">G\xE9rer</a>
                    </div>

                    <div class="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl flex-1">
                        ${N.length===0?`
                            <div class="p-8 text-center h-full flex flex-col items-center justify-center">
                                <div class="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-3">
                                    <i data-lucide="moon" class="w-6 h-6 text-slate-500"></i>
                                </div>
                                <p class="text-slate-500 text-sm">Aucun employ\xE9 en service.</p>
                            </div>
                        `:`
                            <div class="divide-y divide-white/5">
                                ${N.map($=>{let L=new Date($.entry.clock_in).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),j=$.entry.paused;return`
                                    <div class="p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                                        <div class="relative w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                                            ${$.photo?`<img src="${$.photo}" class="w-full h-full object-cover rounded-xl" />`:'<i data-lucide="user" class="w-5 h-5"></i>'}
                                            <span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${j?"bg-yellow-400":"bg-green-400"}"></span>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <div class="flex items-center justify-between">
                                                <h4 class="text-sm font-bold text-white truncate">${$.first_name} ${$.last_name}</h4>
                                                <span class="text-[10px] font-mono ${j?"text-yellow-400":"text-green-400"} bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/5">
                                                    ${L}
                                                </span>
                                            </div>
                                            <p class="text-xs text-slate-500 truncate mt-0.5">
                                                ${$.role} ${j?'\u2022 <span class="text-yellow-500">En pause</span>':""}
                                            </p>
                                        </div>
                                    </div>
                                    `}).join("")}
                            </div>
                        `}
                    </div>
                </div>
                `:""}

            </div>
        </div>
    `}function Ze(){let e=ie.getUser(),t={mecano_confirme:20,mecano_junior:20,chef_atelier:20,patron:60,co_patron:60};try{let r=localStorage.getItem("db_payroll_settings");if(r){let o=JSON.parse(r);o&&o.role_primes&&typeof o.role_primes=="object"?t=o.role_primes:o&&o.grade_rates&&typeof o.grade_rates=="object"&&(Object.values(o.grade_rates||{}).some(i=>Number(i)>100)||(t=o.grade_rates))}}catch{}let s=r=>{let l=Number(t&&t[r==="mecano"?"mecano_confirme":r]);return isFinite(l)&&l>=0?Math.max(0,Math.min(100,Math.round(l))):20},a=()=>u.getSales().filter(o=>o.employeeId===e.id);return setTimeout(()=>{let r=document.getElementById("search-my-sales"),o=document.getElementById("my-sales-table-body"),l=document.getElementById("my-sales-count"),i=document.getElementById("my-sales-stats"),c=document.getElementById("my-missing-invoice"),g="date",w="desc",m=localStorage.getItem("my_sales_period")||"all";["7d","30d","all"].includes(m)||(m="all");let d=localStorage.getItem("my_sales_missing_invoice")==="1",n=[],v=async()=>{let y=u.getSales().filter(b=>b.employeeId===e.id&&b.plate!=="VENTE KIT"),h=[];try{let b=await u.fetchArchives();b&&Array.isArray(b)&&b.forEach(p=>{let k=p.payroll_details;if(typeof k=="string")try{k=JSON.parse(k)}catch{k=[]}if(Array.isArray(k)){let x=k.find(E=>E.employeeId===e.id);x&&Array.isArray(x.sales)&&x.sales.forEach(E=>{h.push({...E,isArchived:!0,archiveLabel:p.period_label})})}})}catch(b){console.error("Failed to load archives",b)}n=[...y,...h],f()};document.querySelectorAll(".js-period-btn").forEach(y=>{y.addEventListener("click",h=>{m=h.target.dataset.period,localStorage.setItem("my_sales_period",m),f()})}),c&&(c.checked=d,c.addEventListener("change",()=>{d=c.checked,localStorage.setItem("my_sales_missing_invoice",d?"1":"0"),f()}));function f(){document.querySelectorAll(".js-period-btn").forEach(x=>{x.dataset.period===m?(x.classList.remove("text-slate-400","hover:text-white"),x.classList.add("bg-blue-600","text-white","shadow-lg")):(x.classList.add("text-slate-400","hover:text-white"),x.classList.remove("bg-blue-600","text-white","shadow-lg"))});let y=(r?.value||"").toLowerCase(),h=n,b=new Date,p=(()=>{if(m==="today"){let x=new Date(b);return x.setHours(0,0,0,0),x}return m==="7d"?new Date(b.getTime()-7*24*36e5):m==="30d"?new Date(b.getTime()-30*24*36e5):null})(),k=h.filter(x=>{let E=(x.clientName||"").toLowerCase(),T=(x.vehicleModel||"").toLowerCase(),P=E.includes(y)||T.includes(y),C=p?new Date(x.date)>=p:!0,R=d?!x.invoiceUrl:!0;return P&&C&&R});if(k=k.sort((x,E)=>{let T,P;return g==="price"?(T=Number(x.price)-Number(x.cost||0),P=Number(E.price)-Number(E.cost||0)):(T=new Date(x.date).getTime(),P=new Date(E.date).getTime()),T<P?w==="asc"?-1:1:T>P?w==="asc"?1:-1:0}),l&&(l.textContent=`${k.length} interventions`),i){let x=k.reduce((_,I)=>_+(Number(I.price)-Number(I.cost||0)),0),T=u.getEmployees().find(_=>_.id===e.id)||e,P=s(T.role),C=x*(P/100),R=(_,I,A,H,q)=>`
                    <div class="relative overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 group hover:border-white/10 transition-all">
                        <div class="absolute inset-0 bg-gradient-to-br from-${q}-500/5 to-transparent pointer-events-none"></div>
                        <div class="relative z-10 flex justify-between items-start">
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${_}</p>
                                <h3 class="text-2xl font-black text-white">${I}</h3>
                                <p class="text-[10px] text-${q}-400 font-medium mt-1">${A}</p>
                            </div>
                            <div class="p-2.5 rounded-lg bg-slate-800/50 border border-white/5 text-${q}-400 shadow-sm">
                                ${H}
                            </div>
                        </div>
                    </div>
                `;i.innerHTML=`
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${R("Total G\xE9n\xE9r\xE9 (Marge)",B(x),m==="today"?"Aujourd\u2019hui":m==="7d"?"7 derniers jours":m==="30d"?"30 derniers jours":"Total cumul\xE9",'<i data-lucide="wallet" class="w-5 h-5"></i>',"blue")}
                        ${R("Prime Estim\xE9e",B(C),`${P}% de la Marge`,'<i data-lucide="flame" class="w-5 h-5"></i>',"orange")}
                    </div>
                `,window.lucide&&lucide.createIcons()}if(o){if(k.length===0){o.innerHTML=`
                    <tr>
                        <td colspan="6" class="p-12">
                            <div class="flex flex-col items-center justify-center text-center">
                                <div class="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-4 animate-pulse">
                                    <i data-lucide="search-x" class="w-8 h-8"></i>
                                </div>
                                <div class="text-white font-bold text-lg">Aucun r\xE9sultat</div>
                                <div class="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Aucune intervention ne correspond \xE0 vos filtres actuels. Essayez de modifier la recherche.</div>
                                <button onclick="window.location.hash = '#sales/new'" class="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                                    <i data-lucide="plus" class="w-4 h-4"></i>
                                    Nouvelle prestation
                                </button>
                            </div>
                        </td>
                    </tr>
                `,window.lucide&&lucide.createIcons();return}o.innerHTML=k.map(x=>`
                <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            ${x.isArchived?`<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20" title="Archiv\xE9: ${x.archiveLabel||""}">ARCHIVE</span>`:""}
                            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <i data-lucide="car" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <div class="font-bold text-white">${x.vehicleModel||"V\xE9hicule Inconnu"}</div>
                                <div class="text-xs text-slate-500 font-mono">${x.plate||"\u2014"}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="font-medium text-slate-300">${x.serviceType||"Service Inconnu"}</div>
                        <div class="text-xs text-slate-500">${x.clientName||"Client Inconnu"}</div>
                    </td>
                    <td class="p-4 font-bold text-white font-mono">${B(x.price)}</td>
                    <td class="p-4 font-bold font-mono ${Number(x.price)-Number(x.cost||0)>=0?"text-emerald-400":"text-red-400"}">${B(Number(x.price)-Number(x.cost||0))}</td>
                    <td class="p-4 text-xs text-slate-500 font-mono">${$e(x.date)}</td>
                    <td class="p-4">
                        <div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            ${x.invoiceUrl?`
                                <a href="${x.invoiceUrl}" target="_blank" class="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Voir facture"><i data-lucide="file-text" class="w-4 h-4"></i></a>
                                <button class="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Copier lien" onclick="navigator.clipboard.writeText('${x.invoiceUrl}')"><i data-lucide="copy" class="w-4 h-4"></i></button>
                            `:`
                                <button onclick="window.location.hash = '#invoice/${x.id}'" class="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors animate-pulse" title="Cr\xE9er facture"><i data-lucide="receipt" class="w-4 h-4"></i></button>
                            `}
                            ${x.photoUrl?`
                                <a href="${x.photoUrl}" target="_blank" class="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors" title="Voir photo"><i data-lucide="image" class="w-4 h-4"></i></a>
                            `:""}
                            ${x.isArchived?"":`
                            <div class="w-px h-4 bg-white/10 mx-1"></div>
                            <button onclick="window.location.hash = '#sales/edit/${x.id}'" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            ${u.hasPermissionSync(u.getCurrentUser(),"sales.delete")?`
                            <button onclick="deleteSale('${x.id}')" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                            `:""}
                            `}
                        </div>
                    </td>
                </tr>
            `).join(""),window.lucide&&lucide.createIcons()}}if(r){let y=document.getElementById("my-sort-by"),h=document.getElementById("my-sort-dir");r.addEventListener("input",f),y&&y.addEventListener("change",()=>{g=y.value,f()}),h&&h.addEventListener("click",()=>{w=w==="asc"?"desc":"asc";let b=h.querySelector("i");b&&(b.style.transform=w==="asc"?"rotate(180deg)":"rotate(0deg)"),f()}),v()}},100),`
        <div class="space-y-8 animate-fade-in pb-20">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-2">
                        <i data-lucide="archive" class="w-3 h-3"></i>
                        <span>Historique</span>
                    </div>
                    <h1 class="text-4xl font-black text-white tracking-tight">Mes Interventions</h1>
                    <p class="text-slate-400 mt-1" id="my-sales-count">Chargement...</p>
                </div>
                <button onclick="window.location.hash = '#sales/new'" class="group relative px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div class="relative flex items-center gap-2">
                        <span>Nouvelle Prestation</span>
                        <i data-lucide="plus" class="w-4 h-4 group-hover:rotate-90 transition-transform"></i>
                    </div>
                </button>
            </div>

            <!-- Stats Overview -->
            <div id="my-sales-stats"></div>

            <!-- Filters Bar -->
            <div class="bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 flex flex-col lg:flex-row gap-3 shadow-lg">
                <div class="flex-1 relative group">
                    <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors"></i>
                    <input type="text" id="search-my-sales" autocomplete="off" placeholder="Rechercher par client, v\xE9hicule..." 
                        class="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all">
                </div>
                
                <div class="flex gap-2 overflow-x-auto pb-1 lg:pb-0 items-center">
                    <div class="flex bg-slate-800/50 rounded-xl p-1 border border-white/5">
                        <button class="js-period-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white" data-period="7d">7j</button>
                        <button class="js-period-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white" data-period="30d">30j</button>
                        <button class="js-period-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white" data-period="all">Tout</button>
                    </div>
                    
                    <div class="h-10 w-px bg-white/10 mx-1 self-center"></div>

                    <select id="my-sort-by" class="px-4 py-2.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-sm focus:outline-none focus:border-blue-500/50 cursor-pointer">
                        <option value="date">Date</option>
                        <option value="price">Marge</option>
                    </select>
                    
                    <button id="my-sort-dir" class="px-3 py-2.5 rounded-xl border border-white/5 bg-slate-800/50 text-white hover:bg-slate-700 transition-colors" title="Inverser l'ordre">
                        <i data-lucide="arrow-down-up" class="w-4 h-4"></i>
                    </button>
                </div>

                <label class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-800/50 text-white text-sm cursor-pointer hover:bg-slate-800/80 transition-colors select-none">
                    <input id="my-missing-invoice" type="checkbox" class="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500/50 bg-slate-700">
                    <span class="whitespace-nowrap font-medium">Sans facture</span>
                </label>
            </div>

            <!-- Results Table -->
            <div class="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr class="border-b border-white/5 bg-white/[0.02]">
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">V\xE9hicule</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Prestation</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Prix</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Marge</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">Date</th>
                                <th class="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="my-sales-table-body" class="divide-y divide-white/5">
                            <tr>
                                <td colspan="6" class="p-8">
                                    <div class="grid grid-cols-1 gap-4 opacity-50">
                                        ${[...Array(3)].map(()=>`
                                            <div class="h-12 bg-slate-800/50 rounded-xl animate-pulse"></div>
                                        `).join("")}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `}var S={init(){let e=document.createElement("div");e.id="toast-container",e.className="fixed top-4 right-4 z-50 flex flex-col gap-3",document.body.appendChild(e)},show(e,t="success",s=3e3){document.getElementById("toast-container")||this.init();let r=(m,d)=>{try{let n=getComputedStyle(document.documentElement).getPropertyValue(m);return n&&String(n).trim()?String(n).trim():d}catch{return d}},o=document.createElement("div"),l=(m,d)=>{let n=m.replace("#",""),v=parseInt(n.substring(0,2),16),f=parseInt(n.substring(2,4),16),y=parseInt(n.substring(4,6),16);return`rgba(${v}, ${f}, ${y}, ${d})`},i=r("--brand-blue","#4bb4d3"),c=`<i data-lucide="check-circle" class="w-5 h-5" style="color:${i}"></i>`;t==="error"?(i="#ef4444",c=`<i data-lucide="alert-circle" class="w-5 h-5" style="color:${i}"></i>`):t==="info"?(i=r("--brand-blue","#4bb4d3"),c=`<i data-lucide="info" class="w-5 h-5" style="color:${i}"></i>`):t==="warning"&&(i="#f59e0b",c=`<i data-lucide="alert-triangle" class="w-5 h-5" style="color:${i}"></i>`),o.className="relative overflow-hidden rounded-xl shadow-lg px-4 py-3 min-w-[320px] backdrop-blur-sm border transform transition-all duration-300 translate-x-full opacity-0 flex items-center gap-3",o.style.borderColor=l(i,.35),o.style.background=r("--surface-1","rgba(11, 17, 28, 0.86)"),o.style.color="#fff";let g=document.createElement("span");g.className="absolute left-0 top-0 h-full",g.style.width="4px",g.style.background=`linear-gradient(180deg, ${r("--brand-pink","#dd3bcc")}, ${r("--brand-blue","#4bb4d3")})`;let w=document.createElement("span");w.className="absolute inset-0 pointer-events-none",w.style.background=`radial-gradient(600px 240px at 20% 0%, ${l(r("--brand-pink","#dd3bcc"),.18)} 0%, transparent 60%), radial-gradient(600px 240px at 85% 0%, ${l(r("--brand-blue","#4bb4d3"),.18)} 0%, transparent 60%)`,o.innerHTML=`
            ${c}
            <span class="font-medium text-sm">${e}</span>
        `,o.prepend(g),o.appendChild(w),document.getElementById("toast-container").appendChild(o),window.lucide&&lucide.createIcons(),requestAnimationFrame(()=>{o.classList.remove("translate-x-full","opacity-0")}),setTimeout(()=>{o.classList.add("translate-x-full","opacity-0"),setTimeout(()=>{o.remove()},300)},s)}};document.addEventListener("DOMContentLoaded",()=>S.init());window.Toast=S;function Qe(){let e=u.getSales(),t=u.getEmployees(),s=e.reduce((i,c)=>i+Number(c.price),0),a=e.length,r=.6;try{let i=localStorage.getItem("db_payroll_settings");if(i){let c=JSON.parse(i);c&&c.company_split!==void 0&&(r=Number(c.company_split)||.6)}}catch{}let o=s*r,l=t.length;return`
        <div class="space-y-6 animate-fade-in pb-8">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <div>
                    <h2 class="text-3xl font-bold text-blue-500 flex items-center gap-3">
                        Statistiques
                        <span class="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Vue Globale</span>
                    </h2>
                    <p class="text-slate-400 mt-2 flex items-center gap-2 text-sm">
                        <i data-lucide="bar-chart-2" class="w-4 h-4"></i>
                        Analyse d\xE9taill\xE9e des performances de l'atelier
                    </p>
                </div>
                
                <button id="btn-reset-week" class="group relative px-5 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all">
                    <div class="flex items-center gap-2 font-bold text-sm">
                        <i data-lucide="trash-2" class="w-4 h-4 group-hover:rotate-12 transition-transform"></i>
                        <span>R\xE9initialiser la Semaine</span>
                    </div>
                </button>
            </div>

            <!-- KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- CA Total -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
                            <h3 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">${B(s)}</h3>
                        </div>
                        <div class="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <i data-lucide="dollar-sign" class="w-6 h-6 text-blue-500"></i>
                        </div>
                    </div>
                    <div class="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
                        <div class="bg-blue-500 h-full rounded-full" style="width: 100%"></div>
                    </div>
                </div>

                <!-- Part Garage -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <p class="text-[11px] font-bold text-green-400 uppercase tracking-wider">Revenu Garage</p>
                                <span class="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">${Math.round(r*100)}%</span>
                            </div>
                            <h3 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">${B(o)}</h3>
                        </div>
                        <div class="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                            <i data-lucide="building-2" class="w-6 h-6 text-green-500"></i>
                        </div>
                    </div>
                    <div class="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
                        <div class="bg-green-500 h-full rounded-full" style="width: ${Math.round(r*100)}%"></div>
                    </div>
                </div>

                <!-- Interventions -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">Interventions</p>
                            <h3 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">${a}</h3>
                        </div>
                        <div class="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <i data-lucide="wrench" class="w-6 h-6 text-orange-500"></i>
                        </div>
                    </div>
                    <div class="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
                        <div class="bg-orange-500 h-full rounded-full" style="width: 75%"></div>
                    </div>
                </div>

                <!-- Employ\xE9s Actifs -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1">Effectif Actif</p>
                            <h3 class="text-2xl lg:text-3xl font-bold text-white tracking-tight">${l}</h3>
                        </div>
                        <div class="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <i data-lucide="users" class="w-6 h-6 text-purple-500"></i>
                        </div>
                    </div>
                    <div class="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden">
                        <div class="bg-purple-500 h-full rounded-full" style="width: 50%"></div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Main Chart (Employees) -->
                <div class="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-slate-700/50 rounded-lg">
                            <i data-lucide="bar-chart" class="w-5 h-5 text-white"></i>
                        </div>
                        <h3 class="font-bold text-white text-lg">Performance par Employ\xE9</h3>
                    </div>
                    <div class="relative h-80 w-full">
                         <canvas id="chart-employees"></canvas>
                    </div>
                </div>

                <!-- Secondary Chart (Types) -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-slate-700/50 rounded-lg">
                            <i data-lucide="pie-chart" class="w-5 h-5 text-white"></i>
                        </div>
                        <h3 class="font-bold text-white text-lg">Prestations</h3>
                    </div>
                    <div class="h-80 flex items-center justify-center relative w-full">
                        <canvas id="chart-types"></canvas>
                    </div>
                </div>
            </div>

            <!-- Detailed Tables -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Top Performers -->
                <div class="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-slate-700 bg-slate-800/50">
                        <h3 class="font-bold text-white text-lg flex items-center gap-2">
                            <i data-lucide="trophy" class="w-5 h-5 text-yellow-500"></i>
                            Classement
                        </h3>
                    </div>
                    <div class="overflow-x-auto flex-1">
                        <table class="w-full text-left text-sm whitespace-nowrap">
                            <thead class="bg-slate-900/30 text-slate-400 font-bold text-xs uppercase border-b border-slate-700">
                                <tr>
                                    <th class="p-4 w-16 text-center">Rang</th>
                                    <th class="p-4">M\xE9cano</th>
                                    <th class="p-4 text-center">Interventions</th>
                                    <th class="p-4 text-right">Marge G\xE9n\xE9r\xE9e</th>
                                    <th class="p-4 w-24"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-700/50" id="table-employees-body">
                                <!-- Content -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Service Breakdown -->
                <div class="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-slate-700 bg-slate-800/50">
                        <h3 class="font-bold text-white text-lg flex items-center gap-2">
                            <i data-lucide="list" class="w-5 h-5 text-blue-500"></i>
                            D\xE9tail par Prestation
                        </h3>
                    </div>
                    <div class="overflow-x-auto flex-1">
                        <table class="w-full text-left text-sm whitespace-nowrap">
                            <thead class="bg-slate-900/30 text-slate-400 font-bold text-xs uppercase border-b border-slate-700">
                                <tr>
                                    <th class="p-4">Type</th>
                                    <th class="p-4 text-center">Volume</th>
                                    <th class="p-4 text-right">CA Total</th>
                                    <th class="p-4 text-right">Moyenne</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-700/50" id="table-types-body">
                                <!-- Content -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `}function bt(){let e=document.getElementById("btn-reset-week");e&&u.hasPermission(ie.getUser(),"time_entries.reset").then(d=>{if(!d){e.classList.add("opacity-40","cursor-not-allowed"),e.disabled=!0;return}e.addEventListener("click",()=>{se.show({title:"R\xE9initialisation de la Semaine",message:`ATTENTION : Cette action est irr\xE9versible !

Cela va archiver le CA actuel puis effacer TOUTES les interventions et TOUS les pointages de la semaine.

\xCAtes-vous s\xFBr de vouloir commencer une nouvelle semaine ?`,type:"danger",confirmText:"CONFIRMER LA SUPPRESSION",inputExpected:"CONFIRMER",onConfirm:async()=>{try{await u.archiveAndReset(),S.show("Semaine cl\xF4tur\xE9e et r\xE9initialis\xE9e avec succ\xE8s !","success"),setTimeout(()=>window.location.reload(),1e3)}catch(n){S.show("Erreur lors de la r\xE9initialisation : "+n.message,"error")}}})})}).catch(()=>{e.classList.add("opacity-40","cursor-not-allowed"),e.disabled=!0});let t=u.getSales(),s=u.getEmployees(),a=.6;try{let d=localStorage.getItem("db_payroll_settings");if(d){let n=JSON.parse(d);n&&n.company_split!==void 0&&(a=Number(n.company_split)||.6)}}catch{}let r=s.map(d=>{let n=t.filter(f=>f.employeeId===d.id),v=n.reduce((f,y)=>f+(Number(y.price)-Number(y.cost||0)),0);return{id:d.id,name:`${d.first_name} ${d.last_name}`,salesCount:n.length,revenue:v,companyPart:v*a}}).sort((d,n)=>n.revenue-d.revenue),o=r.length>0?r[0].revenue:1,l=t.reduce((d,n)=>{let v=n.serviceType||n.type||"Autre";return d[v]||(d[v]={type:v,count:0,revenue:0}),d[v].count++,d[v].revenue+=Number(n.price),d},{}),i=Object.values(l).sort((d,n)=>n.revenue-d.revenue),c=document.getElementById("table-employees-body");c&&(c.innerHTML=r.map((d,n)=>{let v=o>0?d.revenue/o*100:0,f=`<span class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 text-slate-400 font-bold mx-auto text-xs border border-slate-600">${n+1}</span>`;return n===0&&(f='<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 font-bold mx-auto border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]"><i data-lucide="trophy" class="w-4 h-4"></i></div>'),n===1&&(f='<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-300/10 text-slate-300 font-bold mx-auto border border-slate-300/20"><i data-lucide="medal" class="w-4 h-4"></i></div>'),n===2&&(f='<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 font-bold mx-auto border border-orange-500/20"><i data-lucide="medal" class="w-4 h-4"></i></div>'),`
            <tr class="hover:bg-slate-700/30 transition-colors group">
                <td class="p-4">
                    ${f}
                </td>
                <td class="p-4">
                    <div class="font-medium text-white">${d.name}</div>
                </td>
                <td class="p-4 text-center">
                    <span class="inline-block px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">${d.salesCount}</span>
                </td>
                <td class="p-4 text-right font-bold text-white">${B(d.revenue)}</td>
                <td class="p-4">
                    <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${v}%"></div>
                    </div>
                </td>
            </tr>
        `}).join(""));let g=document.getElementById("table-types-body");g&&(g.innerHTML=i.map((d,n)=>{let v=["text-blue-400 border-blue-500/20 bg-blue-500/10","text-purple-400 border-purple-500/20 bg-purple-500/10","text-orange-400 border-orange-500/20 bg-orange-500/10"];return`
            <tr class="hover:bg-slate-700/30 transition-colors">
                <td class="p-4">
                    <span class="px-3 py-1.5 ${v[n%v.length]||"text-slate-400 border-slate-500/20 bg-slate-500/10"} border rounded-lg text-xs font-bold inline-flex items-center gap-2">
                        ${d.type}
                    </span>
                </td>
                <td class="p-4 text-center text-slate-400 font-mono">${d.count}</td>
                <td class="p-4 text-right font-bold text-green-400">${B(d.revenue)}</td>
                <td class="p-4 text-right text-slate-500 text-xs">${B(d.revenue/d.count)} / u</td>
            </tr>
        `}).join(""));let w=document.getElementById("chart-employees");w&&(window.myChartEmployees&&window.myChartEmployees.destroy(),window.myChartEmployees=new Chart(w,{type:"bar",data:{labels:r.slice(0,8).map(d=>d.name),datasets:[{label:"Marge G\xE9n\xE9r\xE9e (\u20AC)",data:r.slice(0,8).map(d=>d.revenue),backgroundColor:"#3b82f6",hoverBackgroundColor:"#60a5fa",borderRadius:6,barPercentage:.6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,grid:{color:"rgba(51, 65, 85, 0.2)",drawBorder:!1},ticks:{color:"#64748b",font:{family:"'Inter', sans-serif"}},border:{display:!1}},x:{grid:{display:!1},ticks:{color:"#64748b",font:{family:"'Inter', sans-serif"}},border:{display:!1}}}}}));let m=document.getElementById("chart-types");m&&(window.myChartTypes&&window.myChartTypes.destroy(),window.myChartTypes=new Chart(m,{type:"doughnut",data:{labels:i.map(d=>d.type),datasets:[{data:i.map(d=>d.count),backgroundColor:["#3b82f6","#a855f7","#f97316","#10b981","#ef4444","#64748b"],borderWidth:0,hoverOffset:4}]},options:{responsive:!0,maintainAspectRatio:!1,cutout:"80%",plugins:{legend:{position:"right",labels:{color:"#94a3b8",font:{family:"'Inter', sans-serif",size:11},boxWidth:8,usePointStyle:!0,padding:15}}}}})),lucide.createIcons()}function Xe(){return setTimeout(async()=>{try{let[n,v,f]=await Promise.all([u.fetchWebhookSettings(),u.fetchPayrollSettings(),u.fetchRepairKitConfig()]),y=document.getElementById("repair-kit-stock");y&&(y.value=f.stock);let h=document.getElementById("repair-kit-price");h&&(h.value=f.price);let b=document.getElementById("kit-webhook-url");b&&(b.value=n?.kit_webhook_url||"");let p=document.getElementById("kit-role-id");p&&(p.value=n?.kit_role_id||"");let k=document.getElementById("recruitment-webhook-url");k&&(k.value=n?.recruitment_webhook_url||"https://discord.com/api/webhooks/1462768022522695833/DgYzNSYRiVSk5rfho0Ym3-fLHCAytv3bsVqF9ICNLhzcTD3sC6UsROv5mWhUN6fpZQn5");let x=document.getElementById("services-webhook-url");x&&(x.value=n?.services_webhook_url||"https://discord.com/api/webhooks/1458256143049560189/zDR_SHsoYBvJX6qQHVy7yvvu51wOUhlBF9bwTeTWlFm9PJxrCpJLEo0Tmq_Rd2JBZpO3");let E=document.getElementById("application-channel-id");E&&(E.value=localStorage.getItem("discord_application_channel_id")||"1455996687339229460");let T=document.getElementById("response-channel-id");T&&(T.value=localStorage.getItem("discord_response_channel_id")||"1458257475773010152");let P=document.getElementById("discord-bot-token");P&&(P.value=n?.discord_bot_token||localStorage.getItem("discord_bot_token")||"");let C=document.getElementById("brand-logo-url");C&&(C.value=n?.brand_logo_url||localStorage.getItem("brand_logo_url")||"");let R=document.getElementById("app-base-url");R&&(R.value=localStorage.getItem("app_base_url")||window.location.origin);let _=document.getElementById("recruitment-target");_&&(_.value=n?.recruitment_target_count||"");let I=document.getElementById("patch-note-webhook-url");I&&(I.value=n?.patch_note_webhook_url||"");let A=document.getElementById("pn-title"),H=document.getElementById("pn-content");A&&(A.value=localStorage.getItem("pn_title_draft")||""),H&&(H.value=localStorage.getItem("pn_content_draft")||"");let q=document.getElementById("company-split");if(q&&v){let F=Number(v.company_split??.6)*100;q.value=F}let M={mecano_test:15,mecano_junior:30,mecano_confirme:40,chef_atelier:50,responsable:60,co_patron:80,patron:80},V=v?.role_primes||M,W=v?.grade_rates||{};Object.keys(M).forEach(F=>{let X=document.getElementById(`prime-${F}`);X&&(X.value=V[F]!==void 0?V[F]:M[F]);let O=document.getElementById(`rate-${F}`);O&&(O.value=W[F]!==void 0?W[F]:0)});let N=document.getElementById("prime-patron"),$=document.getElementById("rate-patron");N&&(N.value=V.patron||M.patron,N.addEventListener("input",()=>{let F=N.value,X=document.getElementById("prime-co_patron");X&&(X.value=F)})),$&&($.value=W.patron||0,$.addEventListener("input",()=>{let F=$.value,X=document.getElementById("rate-co_patron");X&&(X.value=F)}));let L=document.getElementById("prime-co_patron");L&&(L.value=V.co_patron||M.co_patron);let j=document.getElementById("rate-co_patron");j&&(j.value=W.co_patron||0)}catch(n){console.error("Erreur chargement config:",n)}let e=document.getElementById("inactivity-threshold");try{let n=localStorage.getItem("inactivity_threshold_hours")||"2";e&&(e.value=n)}catch{}let t=document.getElementById("pn-title"),s=document.getElementById("pn-content");t&&t.addEventListener("input",()=>{localStorage.setItem("pn_title_draft",t.value)}),s&&s.addEventListener("input",()=>{localStorage.setItem("pn_content_draft",s.value)});let a=document.getElementById("config-form");a&&a.addEventListener("submit",async n=>{n.preventDefault();let v=document.getElementById("brand-logo-url")?.value||"",f=document.getElementById("app-base-url")?.value||"",y=document.getElementById("inactivity-threshold")?.value||"2",h=document.getElementById("services-webhook-url")?.value||"",b=document.getElementById("recruitment-webhook-url")?.value||"",p=document.getElementById("patch-note-webhook-url")?.value||"",k=document.getElementById("response-channel-id")?.value||"",x=document.getElementById("application-channel-id")?.value||"",E=document.getElementById("discord-bot-token")?.value||"",T=document.getElementById("recruitment-target")?.value||"0",P=document.getElementById("company-split")?.value||"60",C=document.getElementById("repair-kit-stock")?.value||"0",R=document.getElementById("repair-kit-price")?.value||"2500",_=document.getElementById("kit-webhook-url")?.value||"",I=document.getElementById("kit-role-id")?.value||"",A={},H={};["mecano_test","mecano_junior","mecano_confirme","chef_atelier","responsable","co_patron","patron"].forEach(q=>{let M=document.getElementById(`prime-${q}`);M&&(A[q]=Number(M.value));let V=document.getElementById(`rate-${q}`);V&&(H[q]=Number(V.value))});try{let q=$=>{let L=localStorage.getItem("pn_content_draft")||"",j=new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),F=`\u2022 ${$}`;if(L.trim().endsWith(F))return;let X=L?`${L}
${F}`:F;if(localStorage.setItem("pn_content_draft",X),s&&(s.value=X),!localStorage.getItem("pn_title_draft")){let Z=`Mise \xE0 jour Config - ${new Date().toLocaleDateString("fr-FR")}`;localStorage.setItem("pn_title_draft",Z),t&&(t.value=Z)}},M=localStorage.getItem("inactivity_threshold_hours");M!==y&&q(`Seuil inactivit\xE9 : ${M}h \u2192 ${y}h`),localStorage.setItem("inactivity_threshold_hours",y),localStorage.setItem("app_base_url",f),localStorage.setItem("brand_logo_url",v),localStorage.setItem("discord_response_channel_id",k),localStorage.setItem("discord_application_channel_id",x),localStorage.setItem("discord_bot_token",E);let V=!0;try{let $=await u.fetchWebhookSettings(),L=$?.sales_webhook_url||"",j=$?.services_status_message_id;T!==String($?.recruitment_target_count||"0")&&q(`Objectif Recrutement : ${$?.recruitment_target_count||0} \u2192 ${T}`),await u.saveWebhookSettings(L,h,j,b,v,p,_,I,E),await u.setRecruitmentTargetCount(T)}catch($){V=!1,console.error("Erreur sauvegarde Webhooks DB:",$)}let W=!0;try{let $=await u.fetchPayrollSettings(),L=Number($.company_split??.6)*100;String(L)!==String(P)&&q(`Part Entreprise : ${L}% \u2192 ${P}%`);let j=Number(P)/100;await u.savePayrollSettings(void 0,H,j,void 0,A);let F=$.role_primes||{},X=$.grade_rates||{},O=!1;for(let[Z,ee]of Object.entries(A))if(F[Z]!==ee){O=!0;break}if(!O){for(let[Z,ee]of Object.entries(H))if(X[Z]!==ee){O=!0;break}}O&&q("Mise \xE0 jour des commissions et taux horaires")}catch($){W=!1,console.error("Erreur sauvegarde Payroll DB:",$)}let N=!0;try{let $=await u.fetchRepairKitConfig();String($.stock)!==String(C)&&q(`Stock Kits : ${$.stock} \u2192 ${C}`),String($.price)!==String(R)&&q(`Prix Kit : ${$.price}$ \u2192 ${R}$`),await u.updateRepairKitConfig(Number(C),Number(R))}catch($){N=!1,console.error("Erreur sauvegarde Inventaire DB:",$)}V&&W&&N?S.show("Configuration sauvegard\xE9e !","success"):S.show("Sauvegarde partielle (DB inaccessible).","warning")}catch(q){let M=q&&q.message?q.message:String(q);S.show("Erreur de sauvegarde : "+M,"error")}});let r=document.getElementById("btn-archive-week");r&&Promise.all([u.hasPermission(ie.getUser(),"archives.manage"),u.hasPermission(ie.getUser(),"time_entries.reset")]).then(([n,v])=>{if(!n||!v){r.classList.add("opacity-40","cursor-not-allowed"),r.disabled=!0;return}r.addEventListener("click",()=>{se.show({title:"\u{1F4E6} CL\xD4TURER LA SEMAINE",message:`Cette action va :
1. Calculer le CA total de la semaine.
2. L'archiver dans l'historique.
3. VIDER toutes les factures et pointages actuels.

Les employ\xE9s ne sont PAS supprim\xE9s.`,type:"info",confirmText:"ARCHIVER & VIDER",inputExpected:"CLOTURE",onConfirm:async()=>{try{await u.archiveAndReset(),S.show("Semaine cl\xF4tur\xE9e et archiv\xE9e avec succ\xE8s !","success"),setTimeout(()=>window.location.hash="#archives",1500)}catch(f){S.show("Erreur lors de l'archivage : "+f.message,"error")}}})})}).catch(()=>{r.classList.add("opacity-40","cursor-not-allowed"),r.disabled=!0});let o=document.getElementById("btn-reset-all");o&&u.hasPermission(ie.getUser(),"time_entries.reset").then(n=>{if(!n){o.classList.add("opacity-40","cursor-not-allowed"),o.disabled=!0;return}o.addEventListener("click",()=>{se.show({title:"\u26A0\uFE0F R\xC9INITIALISATION POINTEUSE",message:`Vous \xEAtes sur le point de supprimer TOUS les historiques de pointages.

Les comptes employ\xE9s NE SERONT PAS supprim\xE9s.
Cette action est irr\xE9versible.`,type:"danger",confirmText:"VIDER POINTEUSE",inputExpected:"CONFIRMER",onConfirm:async()=>{try{await u.resetTimeEntries(),S.show("Pointeuse r\xE9initialis\xE9e avec succ\xE8s.","success"),setTimeout(()=>window.location.reload(),1500)}catch(v){let f=v&&v.message?v.message:String(v);S.show("Erreur lors du reset : "+f,"error")}}})})}).catch(()=>{o.classList.add("opacity-40","cursor-not-allowed"),o.disabled=!0});let l=document.getElementById("btn-send-announcement"),i=document.getElementById("announcement-input"),c=document.getElementById("btn-announce-template-kits");c&&i&&c.addEventListener("click",()=>{i.value=`\u{1F527} **Commande de Kits** : Pour commander vos kits de r\xE9paration, merci d'utiliser le nouveau formulaire disponible sur la page de connexion (sous "Postuler"). Remplissez vos infos et nous vous recontacterons ! \u{1F4E6}`}),l&&i&&l.addEventListener("click",async()=>{let n=i.value.trim();if(!n)return S.show("Message vide","warning");try{l.disabled=!0,l.innerHTML='<i data-lucide="loader-2" class="animate-spin w-4 h-4"></i>',await u.sendAnnouncement(n),S.show("Annonce envoy\xE9e \xE0 tous les employ\xE9s !","success"),i.value=""}catch(v){console.error(v),S.show("Erreur lors de l'envoi","error")}finally{l.disabled=!1,l.innerHTML='<i data-lucide="send" class="w-4 h-4"></i><span>Envoyer</span>',window.lucide&&lucide.createIcons()}});let g=document.getElementById("btn-pn-send"),w=document.getElementById("btn-pn-template-invoice"),m=document.getElementById("pn-title"),d=document.getElementById("pn-content");if(w&&w.addEventListener("click",()=>{m&&(m.value="Mise \xE0 jour : Commandes & Patch Notes"),d&&(d.value=`**Nouveaut\xE9s du Jour**

\u{1F4E6} **Syst\xE8me de Commande de Kits**
\u2022 **Nouveau Formulaire Public** : Accessible depuis la page de connexion.
\u2022 **Calcul Automatique** : Prix affich\xE9 en temps r\xE9el (2 500 $/unit\xE9).
\u2022 **Suivi de Stock** : Affichage du stock disponible et blocage si rupture.
\u2022 **D\xE9tails Complets** : Ajout des champs T\xE9l\xE9phone et Disponibilit\xE9s.

\u{1F527} **Administration & Config**
\u2022 **Gestion du Stock** : Modification rapide du stock de kits depuis la config.
\u2022 **Logo Dynamique** : Chargement am\xE9lior\xE9 du logo entreprise.

\u{1F4DD} **G\xE9n\xE9rateur de Patch Note 2.0**
\u2022 **Sauvegarde Auto** : Vos brouillons sont sauvegard\xE9s en temps r\xE9el.
\u2022 **Suivi des Changements** : Les modifications de config s'ajoutent automatiquement ici.

\u{1F4B8} **Nouvelle Compta Automatis\xE9e**
\u2022 **Calcul Automatique** : La marge est d\xE9sormais synchronis\xE9e entre le formulaire et le calculateur.
\u2022 **Facturation Simplifi\xE9e** : Remplissez le montant et le type, le syst\xE8me calcule le reste.
\u2022 **S\xE9curit\xE9** : Les r\xF4les "Responsable" ne peuvent plus supprimer de factures.

*Pour les clients :*
Le lien de commande est disponible directement sous le bouton "Postuler".`),m.dispatchEvent(new Event("input")),d.dispatchEvent(new Event("input"))}),g){let n=document.getElementById("pn-target-channel"),v=document.getElementById("pn-custom-webhook-container");n&&v&&n.addEventListener("change",()=>{n.value==="custom"?v.classList.remove("hidden"):v.classList.add("hidden")}),g.addEventListener("click",async()=>{let f=m?.value||"",y=d?.value||"",h=n?n.value:"patch_note";if(!f||!y)return S.show("Veuillez remplir le titre et le contenu.","warning");try{g.disabled=!0,g.innerHTML='<i data-lucide="loader-2" class="animate-spin w-4 h-4"></i>';let b="";if(h==="custom"){if(b=document.getElementById("pn-custom-webhook")?.value||"",!b)throw new Error("Veuillez entrer une URL de Webhook valide.")}else{let p=await u.fetchWebhookSettings();switch(h){case"services":b=p?.services_webhook_url;break;case"recruitment":b=p?.recruitment_webhook_url;break;case"sales":b=p?.sales_webhook_url;break;case"kit":b=p?.kit_webhook_url;break;default:b=p?.patch_note_webhook_url;break}}if(!b)throw new Error("Aucun Webhook configur\xE9 pour ce canal.");await _e.sendPatchNote(f,y,null,b),S.show("Patch Note publi\xE9 avec succ\xE8s !","success"),m.value="",d.value=""}catch(b){console.error(b),S.show("Erreur lors de l'envoi : "+(b.message||"Inconnue"),"error")}finally{g.disabled=!1,g.innerHTML='<i data-lucide="send" class="w-4 h-4"></i><span>Publier sur Discord</span>',window.lucide&&lucide.createIcons()}})}},100),`
        <div class="max-w-4xl mx-auto animate-fade-in pb-20">
            <div class="mb-8 flex items-end justify-between">
                <div>
                    <h2 class="text-3xl font-extrabold text-white flex items-center gap-3">
                        <div class="p-2 bg-slate-800 rounded-xl border border-slate-700">
                            <i data-lucide="settings" class="w-8 h-8 text-slate-400"></i>
                        </div>
                        Configuration
                    </h2>
                    <p class="text-slate-400 mt-2 ml-1">Param\xE8tres globaux du syst\xE8me DriveLine</p>
                </div>
            </div>

            <form id="config-form" class="space-y-6">
                
                <!-- 1. General & Visual -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <i data-lucide="image" class="w-5 h-5 text-blue-500"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Apparence</h3>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Logo Entreprise (URL)</label>
                                <input type="url" id="brand-logo-url" placeholder="https://..." class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-3 transition-all">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL de l'Application</label>
                                <input type="url" id="app-base-url" placeholder="https://..." class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-3 transition-all">
                            </div>
                        </div>
                    </div>

                    <!-- Commissions Settings -->
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                <i data-lucide="percent" class="w-5 h-5 text-green-500"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Commissions (Primes)</h3>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">M\xE9cano Test</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-mecano_test" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-mecano_test" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">M\xE9cano Junior</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-mecano_junior" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-mecano_junior" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">M\xE9cano Confirm\xE9</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-mecano_confirme" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-mecano_confirme" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chef d'Atelier</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-chef_atelier" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-chef_atelier" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Responsable</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-responsable" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-responsable" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Patron / Co-Patron</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="relative">
                                        <input type="number" id="prime-patron" min="0" max="100" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="%">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">%</span>
                                    </div>
                                    <div class="relative">
                                        <input type="number" id="rate-patron" min="0" class="block w-full rounded-lg border-slate-700 bg-slate-800/50 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm p-2.5 pr-8 transition-all font-mono" placeholder="$">
                                        <span class="absolute right-3 top-2.5 text-slate-500 text-xs">$</span>
                                    </div>
                                </div>
                                <input type="hidden" id="prime-co_patron">
                                <input type="hidden" id="rate-co_patron">
                            </div>
                        </div>
                        <p class="text-[10px] text-slate-500 mt-3 italic">
                            Ces pourcentages s'appliquent sur la <strong>Marge</strong> (Prix - Co\xFBt).
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <i data-lucide="timer" class="w-5 h-5 text-purple-400"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Activit\xE9 & Stock</h3>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Seuil d'inactivit\xE9 (Badge)</label>
                                <select id="inactivity-threshold" class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm p-3 transition-all cursor-pointer">
                                    <option value="1">1 Heure</option>
                                    <option value="2">2 Heures</option>
                                    <option value="3">3 Heures</option>
                                    <option value="5">5 Heures</option>
                                    <option value="24">24 Heures</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 text-orange-400">Gestion Kits de R\xE9paration</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Physique</label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i data-lucide="package" class="h-4 w-4 text-orange-500"></i>
                                            </div>
                                            <input type="number" id="repair-kit-stock" min="0" placeholder="0" class="block w-full pl-9 rounded-xl border-slate-700 bg-slate-800/50 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm p-3 transition-all font-mono">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prix Unitaire ($)</label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i data-lucide="dollar-sign" class="h-4 w-4 text-green-500"></i>
                                            </div>
                                            <input type="number" id="repair-kit-price" min="0" placeholder="2500" class="block w-full pl-9 rounded-xl border-slate-700 bg-slate-800/50 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm p-3 transition-all font-mono">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mt-4 space-y-3 pt-4 border-t border-slate-800">
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Webhook Commande (Optionnel)</label>
                                        <input type="password" id="kit-webhook-url" placeholder="https://discord.com/api/webhooks/..." class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs p-2.5 transition-all font-mono">
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">ID R\xF4le \xE0 Ping (Optionnel)</label>
                                        <input type="text" id="kit-role-id" placeholder="Ex: 1455996639964696761" class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs p-2.5 transition-all font-mono">
                                    </div>
                                </div>

                                <p class="text-[10px] text-slate-500 mt-1">G\xE9rez le stock physique et la configuration des notifications.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 1.5 Announcements -->
                <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                            <i data-lucide="megaphone" class="w-5 h-5 text-pink-500"></i>
                        </div>
                        <h3 class="font-bold text-white text-sm uppercase tracking-wider">Diffusion d'Annonce</h3>
                    </div>

                    <div class="flex flex-col gap-4">
                        <textarea id="announcement-input" rows="3" placeholder="Message \xE0 diffuser \xE0 toute l'entreprise..." class="w-full rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder-slate-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm p-3 transition-all font-medium"></textarea>
                        
                        <div class="flex justify-between items-center">
                            <button type="button" id="btn-announce-template-kits" class="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 px-3 py-2 rounded-lg border border-pink-500/20 transition-all">
                                <i data-lucide="package" class="w-3 h-3"></i>
                                Template: Kits
                            </button>
                            
                            <button type="button" id="btn-send-announcement" class="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-pink-900/20 hover:shadow-pink-500/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap self-end">
                                <i data-lucide="send" class="w-4 h-4"></i>
                                <span>Envoyer</span>
                            </button>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-500 mt-2">
                        Le message s'affichera instantan\xE9ment sur l'\xE9cran de tous les employ\xE9s connect\xE9s.
                    </p>
                </div>

                <!-- 2. Discord Integration -->
                <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    
                    <div class="flex items-center gap-3 mb-6 relative z-10">
                        <div class="p-2 bg-[#5865F2]/10 rounded-lg border border-[#5865F2]/20">
                            <i data-lucide="webhook" class="w-5 h-5 text-[#5865F2]"></i>
                        </div>
                        <h3 class="font-bold text-white text-sm uppercase tracking-wider">Int\xE9gration Discord</h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <!-- Recruitment New -->
                        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                                <h4 class="font-bold text-slate-200 text-sm">Nouvelles Candidatures</h4>
                            </div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Webhook URL</label>
                            <input type="password" id="services-webhook-url" placeholder="https://discord.com/api/webhooks/..." class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-xs p-2.5 transition-all font-mono">
                            <div class="mt-3">
                                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">ID Salon (Optionnel)</label>
                                <input type="text" id="application-channel-id" placeholder="Ex: 1455996687339229460" class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-xs p-2.5 transition-all font-mono">
                            </div>
                            <p class="text-[10px] text-slate-500 mt-2">
                                Notification lorsqu'un formulaire est envoy\xE9 depuis le site.
                            </p>
                        </div>

                        <!-- Recruitment Response -->
                        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-2 h-2 rounded-full bg-green-400"></div>
                                <h4 class="font-bold text-slate-200 text-sm">R\xE9ponses aux Candidats</h4>
                            </div>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Webhook URL</label>
                                    <input type="password" id="recruitment-webhook-url" placeholder="https://discord.com/api/webhooks/..." class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-xs p-2.5 transition-all font-mono">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">ID Salon "Pr\xE9sentation" (Mention)</label>
                                    <input type="text" id="response-channel-id" placeholder="Ex: 1458257475773010152" class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-xs p-2.5 transition-all font-mono">
                                </div>
                            </div>
                        </div>

                        <!-- Patch Note -->
                        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
                                <h4 class="font-bold text-slate-200 text-sm">Patch Note Site</h4>
                            </div>
                            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Webhook URL</label>
                            <input type="password" id="patch-note-webhook-url" placeholder="https://discord.com/api/webhooks/..." class="block w-full rounded-lg border-slate-700 bg-slate-900 text-slate-300 placeholder-slate-600 focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] text-xs p-2.5 transition-all font-mono">
                            <p class="text-[10px] text-slate-500 mt-2">
                                Canal pour les annonces de mises \xE0 jour.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Patch Note Generator -->
                <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                    <div class="flex items-center gap-3 mb-5">
                        <div class="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <i data-lucide="zap" class="w-5 h-5 text-emerald-500"></i>
                        </div>
                        <h3 class="font-bold text-white text-sm uppercase tracking-wider">G\xE9n\xE9rateur de Patch Note</h3>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Canal de diffusion</label>
                            <select id="pn-target-channel" class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm p-3 transition-all cursor-pointer">
                                <option value="patch_note">\u{1F4E2} Patch Notes (D\xE9faut)</option>
                                <option value="services">\u{1F527} Services / Candidatures</option>
                                <option value="recruitment">\u{1F91D} R\xE9ponses Recrutement</option>
                                <option value="sales">\u{1F4B0} Factures / Ventes</option>
                                <option value="kit">\u{1F4E6} Commandes Kits</option>
                                <option value="custom">\u{1F310} Autre (URL Webhook)</option>
                            </select>
                            <div id="pn-custom-webhook-container" class="hidden mt-2 animate-fade-in">
                                <input type="password" id="pn-custom-webhook" placeholder="Collez l'URL du Webhook ici..." class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm p-3 transition-all font-mono">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Titre de la mise \xE0 jour</label>
                            <input type="text" id="pn-title" placeholder="Ex: Mise \xE0 jour v2.1" class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm p-3 transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Contenu</label>
                            <textarea id="pn-content" rows="6" placeholder="D\xE9tails des changements..." class="block w-full rounded-xl border-slate-700 bg-slate-800/50 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm p-3 transition-all font-mono"></textarea>
                        </div>
                        
                        <div class="flex flex-wrap gap-3 pt-2">
                            <button type="button" id="btn-pn-template-invoice" class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold border border-slate-700 transition-all flex items-center gap-2">
                                <i data-lucide="file-text" class="w-3 h-3"></i>
                                Template: Factures
                            </button>
                             <button type="button" id="btn-pn-send" class="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2">
                                <i data-lucide="send" class="w-4 h-4"></i>
                                <span>Publier sur Discord</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 3. Actions & Danger Zone -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <!-- Weekly Closing -->
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <i data-lucide="archive" class="w-5 h-5 text-orange-400"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Cl\xF4ture Semaine</h3>
                        </div>
                        
                        <div class="bg-orange-900/10 rounded-xl p-4 border border-orange-900/20 mb-4">
                            <p class="text-xs text-orange-200/80 leading-relaxed">
                                Archive le chiffre d'affaires, calcule les salaires et vide les compteurs pour la semaine suivante.
                            </p>
                        </div>
                        
                        <button type="button" id="btn-archive-week" class="w-full bg-slate-800 hover:bg-orange-600/20 hover:text-orange-400 hover:border-orange-500/30 border border-slate-700 text-slate-300 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group">
                            <i data-lucide="archive" class="w-4 h-4 group-hover:scale-110 transition-transform"></i>
                            Cl\xF4turer la semaine
                        </button>
                        

                    </div>

                    <!-- Reset -->
                    <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                <i data-lucide="alert-triangle" class="w-5 h-5 text-red-400"></i>
                            </div>
                            <h3 class="font-bold text-white text-sm uppercase tracking-wider">Zone de Danger</h3>
                        </div>

                        <div class="bg-red-900/10 rounded-xl p-4 border border-red-900/20 mb-4">
                            <p class="text-xs text-red-200/80 leading-relaxed">
                                R\xE9initialise uniquement les heures de la pointeuse sans archiver. Irr\xE9versible.
                            </p>
                        </div>

                        <button type="button" id="btn-reset-all" class="w-full bg-slate-800 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/30 border border-slate-700 text-slate-300 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group">
                            <i data-lucide="trash-2" class="w-4 h-4 group-hover:scale-110 transition-transform"></i>
                            Vider la pointeuse
                        </button>
                    </div>

                </div>

                <!-- Floating Save Bar -->
                <div class="sticky bottom-4 z-20 flex justify-end">
                    <div class="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-2 pl-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <span class="text-xs text-slate-400 font-medium hidden sm:block">Modifications en attente...</span>
                        <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i>
                            Sauvegarder tout
                        </button>
                    </div>
                </div>

            </form>
        </div>
    `}function et(){let e=[],t=0;setTimeout(()=>{let r=document.getElementById("search-sales"),o=document.getElementById("filter-employee"),l=document.getElementById("filter-type"),i=document.getElementById("sales-table-body"),c=document.getElementById("sales-count"),g=document.getElementById("page-size"),w=document.getElementById("pager-prev"),m=document.getElementById("pager-next"),d=document.getElementById("pager-info"),n=document.getElementById("sales-stats-container"),v=1,f=10,y={};function h(x){let E=(x||"").toLowerCase();return E.includes("custom")||E.includes("tuning")?"bg-purple-500/10 text-purple-400 border-purple-500/20":E.includes("repa")||E.includes("r\xE9paration")?"bg-blue-500/10 text-blue-400 border-blue-500/20":E.includes("import")?"bg-green-500/10 text-green-400 border-green-500/20":E.includes("peinture")?"bg-pink-500/10 text-pink-400 border-pink-500/20":"bg-slate-700 text-slate-300 border-slate-600"}async function b(){i&&(i.innerHTML='<tr><td colspan="7" class="p-12 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-r-transparent"></div></td></tr>');let x=u.getCurrentUser(),E=u.hasPermissionSync(x,"sales.delete"),T=r?r.value.toLowerCase():"",P=o?o.value:"all",C=l?l.value:"all";y={term:T,employeeId:P,type:C};try{let R=await u.fetchSalesPage(v,f,y);e=R.data,t=R.total,k(E),p(e)}catch(R){console.error(R),i&&(i.innerHTML='<tr><td colspan="7" class="p-8 text-center text-red-500">Erreur de chargement</td></tr>')}}function p(x){if(!n)return;let E=x.reduce((P,C)=>P+Number(C.price),0),T=x.length?E/x.length:0;n.innerHTML=`
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CA (Page)</div>
                        <div class="mt-1 text-2xl font-extrabold text-white">${B(E)}</div>
                        <div class="mt-1 text-xs text-slate-500">Sur cette page</div>
                    </div>
                    <div class="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interventions</div>
                        <div class="mt-1 text-2xl font-extrabold text-white">${t}</div>
                        <div class="mt-1 text-xs text-slate-500">Total trouv\xE9</div>
                    </div>
                    <div class="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Panier Moyen</div>
                        <div class="mt-1 text-2xl font-extrabold text-blue-400">${B(T)}</div>
                        <div class="mt-1 text-xs text-slate-500">Sur cette page</div>
                    </div>
                </div>
            `}function k(x,E){if(!i)return;c&&(c.textContent=`${t} interventions trouv\xE9es`);let T=Math.max(1,Math.ceil(t/f));if(v>T&&(v=T),d&&(d.textContent=`Page ${v}/${T}`),w&&(w.disabled=v<=1),m&&(m.disabled=v>=T),e.length===0){i.innerHTML='<tr><td colspan="7" class="p-8 text-center text-slate-500">Aucune intervention trouv\xE9e.</td></tr>';return}i.innerHTML=e.map(P=>{let C=u.getEmployeeByIdSync(P.employeeId),R=C?`${C.first_name[0]}${C.last_name[0]}`:"??",_=C?`${C.first_name} ${C.last_name}`:"Inconnu";return`
                <tr class="hover:bg-slate-700/30 transition-colors border-b border-slate-700/50 last:border-0 group">
                    <td class="p-4">
                        <div class="font-bold text-slate-200 text-sm">${P.vehicleModel}</div>
                        <div class="text-xs text-slate-500 mt-0.5">${P.clientName||"Client Inconnu"} ${P.clientPhone?`\u2022 ${P.clientPhone}`:""}</div>
                    </td>
                    <td class="p-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${h(P.serviceType)}">
                            ${P.serviceType}
                        </span>
                    </td>
                    <td class="p-4 font-mono font-bold text-white">${B(P.price)}</td>
                    <td class="p-4 font-mono font-bold ${Number(P.price)-Number(P.cost||0)>=0?"text-emerald-400":"text-red-400"}">
                        ${E?B(Number(P.price)-Number(P.cost||0)):B(Number(P.price)-Number(P.cost||0))}
                    </td>
                    <td class="p-4">
                        <div class="flex items-center gap-2" title="${_}">
                            <div class="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                                ${R}
                            </div>
                            <span class="text-sm text-slate-400 hidden lg:inline">${_}</span>
                        </div>
                    </td>
                    <td class="p-4 text-sm text-slate-500">
                        <div class="flex flex-col">
                            <span class="text-slate-300 font-medium">${new Date(P.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>
                            <span class="text-xs text-slate-500">${new Date(P.date).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            ${P.invoiceUrl?`
                                <a href="${P.invoiceUrl}" target="_blank" class="p-2 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors" title="Voir facture"><i data-lucide="file-text" class="w-4 h-4"></i></a>
                            `:`
                                <button onclick="window.location.hash = '#invoice/${P.id}'" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="G\xE9n\xE9rer facture"><i data-lucide="receipt" class="w-4 h-4"></i></button>
                            `}
                            ${P.photoUrl?`
                                <a href="${P.photoUrl}" target="_blank" class="p-2 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors" title="Voir photo"><i data-lucide="image" class="w-4 h-4"></i></a>
                            `:""}
                            
                            <div class="w-px h-4 bg-slate-700 mx-1"></div>

                            <button onclick="window.location.hash = '#sales/edit/${P.id}'" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            ${x?`
                            <button onclick="deleteSale('${P.id}')" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                            `:""}
                        </div>
                    </td>
                </tr>
            `}).join(""),window.lucide&&lucide.createIcons()}if(r){let x;r.addEventListener("input",()=>{clearTimeout(x),x=setTimeout(()=>{v=1,b()},500)}),o.addEventListener("change",()=>{v=1,b()}),l.addEventListener("change",()=>{v=1,b()}),g.addEventListener("change",()=>{f=Number(g.value),v=1,b()}),w.addEventListener("click",()=>{v>1&&(v--,b())}),m.addEventListener("click",()=>{v++,b()});let E=window.location.hash.match(/employee=([^&]+)/);E&&o&&(o.value=E[1]);let T=document.getElementById("new-sale-btn"),P=()=>{let R=o?o.value:"all";T&&(T.onclick=()=>{window.location.hash=R&&R!=="all"?`#sales/new?employee=${R}`:"#sales/new"})};P(),o&&o.addEventListener("change",P);let C=document.getElementById("export-csv-btn");C&&(C.onclick=async()=>{S.show("Pr\xE9paration de l'export...","info");try{let R=await u.fetchSalesPage(1,1e3,y),_=u.exportSalesToCSV(R.data),I=new Blob([_],{type:"text/csv;charset=utf-8;"}),A=document.createElement("a"),H=URL.createObjectURL(I);A.setAttribute("href",H),A.setAttribute("download",`export_atelier_${new Date().toISOString().slice(0,10)}.csv`),A.style.visibility="hidden",document.body.appendChild(A),A.click(),document.body.removeChild(A),S.show("Export termin\xE9","success")}catch{S.show("Erreur export","error")}}),b()}},100);let s=u.getEmployees(),a=["R\xE9paration","Customisation","Import","Peinture","Entretien"];return`
        <div class="space-y-6 animate-fade-in">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 class="text-3xl font-bold text-white">Historique Atelier</h2>
                    <p class="text-slate-400 mt-1" id="sales-count">${t} interventions trouv\xE9es</p>
                </div>
                <div class="flex gap-2">
                    <button id="new-sale-btn" onclick="window.location.hash = '#sales/new'" class="bg-blue-600 has-sheen hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm shadow-blue-600/20 transition-all">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span>Nouvelle Prestation</span>
                    </button>
                    <button id="export-csv-btn" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Export CSV</span>
                    </button>
                </div>
            </div>

            <!-- Stats Cards (Injected via JS) -->
            <div id="sales-stats-container"></div>

            <!-- Filters Bar -->
            <div class="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-col xl:flex-row gap-4">
                <div class="flex-1 relative">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"></i>
                    <input type="text" id="search-sales" autocomplete="off" placeholder="Rechercher client, v\xE9hicule..." class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm">
                </div>
                
                <div class="flex flex-wrap gap-2">
                    <select id="filter-employee" class="px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm max-w-[200px]">
                        <option value="all">Tous les employ\xE9s</option>
                        ${s.map(r=>`<option value="${r.id}">${r.first_name} ${r.last_name}</option>`).join("")}
                    </select>

                    <select id="filter-type" class="px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm max-w-[150px]">
                        <option value="all">Tous les types</option>
                        ${a.map(r=>`<option value="${r}">${r}</option>`).join("")}
                    </select>
                    
                    <div class="w-px h-10 bg-slate-700 mx-2 hidden xl:block"></div>

                    <select id="sort-by" class="px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm">
                        <option value="date">Date</option>
                        <option value="price">Prix</option>
                        <option value="client">Client</option>
                    </select>
                    <button id="sort-dir" class="px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-colors">Desc</button>
                    <select id="page-size" class="px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700 text-white text-sm">
                        <option value="10">10 / page</option>
                        <option value="25">25 / page</option>
                        <option value="50">50 / page</option>
                    </select>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead class="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th class="p-4 pl-4">V\xE9hicule</th>
                                <th class="p-4">Prestation</th>
                                <th class="p-4">Prix</th>
                                <th class="p-4">Marge</th>
                                <th class="p-4">M\xE9cano</th>
                                <th class="p-4">Date</th>
                                <th class="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="sales-table-body" class="divide-y divide-slate-700/50">
                            <tr>
                                <td colspan="7" class="p-12 text-center">
                                    <div class="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                                        ${[...Array(5)].map(()=>`
                                            <div class="flex gap-4">
                                                <div class="h-10 w-32 bg-slate-700/30 rounded animate-pulse"></div>
                                                <div class="h-10 w-24 bg-slate-700/30 rounded animate-pulse"></div>
                                                <div class="h-10 flex-1 bg-slate-700/30 rounded animate-pulse"></div>
                                            </div>
                                        `).join("")}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-900/30">
                    <div id="pager-info" class="text-sm text-slate-400">Page 1/1</div>
                    <div class="flex items-center gap-2">
                        <button id="pager-prev" class="px-4 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white disabled:opacity-50 hover:bg-slate-600 transition-colors text-sm font-medium">Pr\xE9c\xE9dent</button>
                        <button id="pager-next" class="px-4 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white disabled:opacity-50 hover:bg-slate-600 transition-colors text-sm font-medium">Suivant</button>
                    </div>
                </div>
            </div>
        </div>
    `}var De=[];function st(){return setTimeout(ft,50),`
        <div class="space-y-8 animate-fade-in">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 class="text-3xl font-bold text-white">Archives Comptables</h2>
                    <p class="text-slate-400 mt-1">Historique et \xE9volution du chiffre d'affaires</p>
                </div>
                <button id="export-archives-btn" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all">
                    <i data-lucide="download" class="w-4 h-4"></i>
                    <span class="hidden md:inline">Export CSV</span>
                </button>
            </div>

            <!-- 1. Global KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Total Historique -->
                <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-all">
                    <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <i data-lucide="layers" class="w-24 h-24 text-blue-500 transform rotate-12 translate-x-4 -translate-y-4"></i>
                    </div>
                    <div class="relative z-10">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                <i data-lucide="layers" class="w-5 h-5"></i>
                            </div>
                            <p class="text-xs font-bold text-blue-400 uppercase tracking-wider">Total Archiv\xE9</p>
                        </div>
                        <h3 class="text-3xl font-extrabold text-white tracking-tight" id="total-archived-revenue">...</h3>
                        <p class="text-xs text-slate-500 mt-2">Cumul historique</p>
                    </div>
                </div>

                <!-- Record Semaine -->
                <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-all">
                    <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <i data-lucide="trophy" class="w-24 h-24 text-yellow-500 transform rotate-12 translate-x-4 -translate-y-4"></i>
                    </div>
                    <div class="relative z-10">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
                                <i data-lucide="trophy" class="w-5 h-5"></i>
                            </div>
                            <p class="text-xs font-bold text-yellow-400 uppercase tracking-wider">Record Semaine</p>
                        </div>
                        <h3 class="text-3xl font-extrabold text-white tracking-tight" id="best-week-revenue">...</h3>
                        <p class="text-xs text-slate-500 mt-2" id="best-week-label">--</p>
                    </div>
                </div>

                <!-- Derni\xE8re Cl\xF4ture -->
                <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-all">
                    <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <i data-lucide="activity" class="w-24 h-24 text-emerald-500 transform rotate-12 translate-x-4 -translate-y-4"></i>
                    </div>
                    <div class="relative z-10">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                <i data-lucide="activity" class="w-5 h-5"></i>
                            </div>
                            <p class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Derni\xE8re Cl\xF4ture</p>
                        </div>
                        <h3 class="text-3xl font-extrabold text-white tracking-tight" id="last-week-revenue">...</h3>
                        <p class="text-xs text-slate-500 mt-2" id="last-week-diff">--</p>
                    </div>
                </div>
            </div>

            <!-- 2. Chart Section -->
            <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="font-bold text-white flex items-center gap-2">
                        <i data-lucide="trending-up" class="w-5 h-5 text-blue-500"></i>
                        \xC9volution du Chiffre d'Affaires
                    </h3>
                    <select class="bg-slate-900 border border-slate-600 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
                        <option>10 derni\xE8res semaines</option>
                    </select>
                </div>
                <div class="h-80 w-full relative">
                    <canvas id="archivesChart"></canvas>
                </div>
            </div>

            <!-- 3. Archives List -->
            <div class="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
                <div class="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h3 class="font-bold text-white">Historique D\xE9taill\xE9</h3>
                    <div class="flex gap-2">
                        <span class="text-xs text-slate-500 flex items-center gap-1">
                            <span class="w-2 h-2 rounded-full bg-green-400"></span> Pay\xE9
                        </span>
                        <span class="text-xs text-slate-500 flex items-center gap-1">
                            <span class="w-2 h-2 rounded-full bg-slate-600"></span> En attente
                        </span>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-400">
                        <thead class="bg-slate-900/50 text-xs uppercase font-bold text-slate-300">
                            <tr>
                                <th class="px-6 py-4">Semaine</th>
                                <th class="px-6 py-4">P\xE9riode</th>
                                <th class="px-6 py-4 text-center">Prestations</th>
                                <th class="px-6 py-4 text-right">Chiffre d'Affaires</th>
                                <th class="px-6 py-4 text-right">Total Net (Salaires)</th>
                                <th class="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="archives-list" class="divide-y divide-slate-700/50">
                            <tr>
                                <td colspan="6" class="px-6 py-12 text-center">
                                    <div class="flex flex-col items-center justify-center">
                                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                                        <span class="text-slate-500">Chargement de l'historique...</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `}async function ft(){let e=document.getElementById("archives-list"),t=document.getElementById("total-archived-revenue"),s=document.getElementById("best-week-revenue"),a=document.getElementById("best-week-label"),r=document.getElementById("last-week-revenue"),o=document.getElementById("last-week-diff");if(!e)return;let l=document.getElementById("export-archives-btn");l&&(l.onclick=()=>{if(!De||!De.length){S.show("Aucune archive \xE0 exporter","info");return}let i=["Semaine","Date Cl\xF4ture","Prestations","CA Total","Part Garage (60%)","Total Paies","Reste Garage"],c=De.map(n=>{let v=new Date(n.archived_at);return[`Semaine ${tt(v)}`,v.toLocaleDateString("fr-FR"),n.total_sales_count,n.total_revenue,n.total_revenue*.6,n.total_payroll||0,n.total_revenue*.6-(n.total_payroll||0)].map(y=>`"${String(y).replace(/"/g,'""')}"`).join(",")}),g=[i.join(","),...c].join(`
`),w=new Blob([g],{type:"text/csv;charset=utf-8;"}),m=document.createElement("a"),d=URL.createObjectURL(w);m.setAttribute("href",d),m.setAttribute("download",`archives_compta_${new Date().toISOString().slice(0,10)}.csv`),m.style.visibility="hidden",document.body.appendChild(m),m.click(),document.body.removeChild(m)});try{let i=await u.fetchArchives();if(De=i,i.length===0){e.innerHTML=`
                <tr>
                    <td colspan="6" class="px-6 py-16 text-center text-slate-500">
                        <div class="flex flex-col items-center justify-center">
                            <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <i data-lucide="archive" class="w-8 h-8 text-slate-600"></i>
                            </div>
                            <p class="font-medium text-slate-400">Aucune archive disponible</p>
                            <p class="text-xs text-slate-600 mt-1">Les cl\xF4tures de semaine appara\xEEtront ici</p>
                        </div>
                    </td>
                </tr>
            `,t&&(t.textContent=B(0)),s&&(s.textContent=B(0)),r&&(r.textContent=B(0));return}let c=i.reduce((h,b)=>h+Number(b.total_revenue),0);t&&(t.textContent=B(c));let g=[...i].sort((h,b)=>b.total_revenue-h.total_revenue)[0];s&&(s.textContent=B(g?g.total_revenue:0),a&&g&&(a.textContent=g.period_label||$e(g.archived_at))),i.sort((h,b)=>new Date(b.archived_at)-new Date(h.archived_at));let w=i[0],m=i[1];if(r&&(r.textContent=B(w?w.total_revenue:0)),o&&w&&m){let h=w.total_revenue-m.total_revenue,b=m.total_revenue>0?h/m.total_revenue*100:100,p=h>=0;o.innerHTML=`
                <span class="${p?"text-emerald-400":"text-red-400"} font-bold flex items-center gap-1">
                    <i data-lucide="${p?"trending-up":"trending-down"}" class="w-3 h-3"></i>
                    ${p?"+":""}${b.toFixed(1)}%
                </span> vs semaine pr\xE9c.
            `}else o&&(o.textContent="Premi\xE8re semaine enregistr\xE9e");try{Vt(i)}catch{}let d=u.getCurrentUser(),n=u.hasPermissionSync(d,"archives.manage");e.innerHTML=i.map(h=>{let b=new Date(h.archived_at),p=tt(b),k=g&&h.id===g.id;return`
            <tr class="hover:bg-slate-700/30 transition-colors group border-b border-slate-700/50 last:border-0">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-slate-300 border border-slate-600">
                            ${p}
                        </div>
                        ${k?'<span class="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 font-bold flex items-center gap-1"><i data-lucide="trophy" class="w-3 h-3"></i> TOP</span>':""}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="font-bold text-white text-sm">${h.period_label||"Semaine cl\xF4tur\xE9e"}</span>
                        <span class="text-xs text-slate-500 flex items-center gap-1">
                            <i data-lucide="calendar" class="w-3 h-3"></i>
                            Cl\xF4tur\xE9 le ${$e(h.archived_at)}
                        </span>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                        <i data-lucide="wrench" class="w-3 h-3"></i>
                        ${h.total_sales_count}
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="font-bold text-white text-base font-mono">${B(h.total_revenue)}</div>
                </td>
                <td class="px-6 py-4 text-right">
                     <span class="font-mono text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        ${B(h.payroll_details&&typeof h.payroll_details=="object"?Array.isArray(h.payroll_details)?h.payroll_details.reduce((x,E)=>x+(E.totalDue||0),0):0:typeof h.payroll_details=="string"?JSON.parse(h.payroll_details).reduce((x,E)=>x+(E.totalDue||0),0):0)}
                     </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button data-action="view-details" data-id="${h.id}" class="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600" title="D\xE9tails & Paiements">
                            <i data-lucide="list-checks" class="w-4 h-4"></i>
                        </button>
                        ${n?`
                        <button data-action="restore-archive" data-id="${h.id}" class="p-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20 hover:border-emerald-500/40" title="Restaurer (Annuler la cl\xF4ture)">
                            <i data-lucide="undo-2" class="w-4 h-4"></i>
                        </button>
                        <button data-action="delete-archive" data-id="${h.id}" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20" title="Supprimer">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                        `:""}
                    </div>
                </td>
            </tr>
        `}).join(""),window.lucide&&lucide.createIcons(),e.querySelectorAll('button[data-action="restore-archive"]').forEach(h=>{h.addEventListener("click",()=>{let b=h.getAttribute("data-id"),p=De.find(k=>k.id===b);p&&zt(p)})}),e.querySelectorAll('button[data-action="delete-archive"]').forEach(h=>{h.addEventListener("click",()=>{let b=h.getAttribute("data-id");se.show({title:"Supprimer l'archive",message:"Cette action est irr\xE9versible. Confirmer la suppression ?",type:"danger",confirmText:"Supprimer",onConfirm:async()=>{try{await u.deleteArchive(b),S.show("Archive supprim\xE9e","success"),ft()}catch(p){let k=p&&p.message?p.message:String(p);S.show("Erreur suppression : "+k,"error")}}})})}),e.querySelectorAll('button[data-action="view-details"]').forEach(h=>{h.addEventListener("click",()=>{let b=h.getAttribute("data-id"),p=De.find(k=>k.id===b);p&&Wt(p)})})}catch(i){console.error(i),e.innerHTML='<tr><td colspan="6" class="text-red-500 text-center py-4">Erreur de chargement</td></tr>'}}async function zt(e){se.show({title:"\u26A0\uFE0F RESTAURER LA SEMAINE",message:`Vous allez restaurer les compteurs de cette archive.

Attention : 
1. Les factures d\xE9taill\xE9es (clients, v\xE9hicules) ne peuvent pas \xEAtre r\xE9cup\xE9r\xE9es.
2. Seuls les montants (CA et Heures) seront r\xE9inject\xE9s pour chaque employ\xE9.
3. Cette archive sera supprim\xE9e apr\xE8s restauration.

Voulez-vous continuer ?`,type:"warning",confirmText:"RESTAURER",onConfirm:async()=>{try{let t=e.payroll_details||[];if(typeof t=="string")try{t=JSON.parse(t)}catch{t=[]}if(!t||t.length===0)throw new Error("Impossible de restaurer : d\xE9tails vides.");S.show("Restauration en cours...","info");for(let s of t)if(s.employeeId){if(s.totalSales>0){let a={id:Ce(),employeeId:s.employeeId,date:new Date().toISOString(),clientName:"Restauration Archive",clientPhone:"",vehicleModel:"Restauration",plate:"RESTORE",serviceType:"Autre",price:Number(s.totalSales),invoiceUrl:"",photoUrl:""};await u.saveSale(a)}if(s.totalHours>0){let a=new Date;a.setHours(8,0,0,0);let r=a.toISOString(),o=new Date(a);o.setTime(o.getTime()+s.totalHours*36e5);let l=o.toISOString()}}await u.deleteArchive(e.id),S.show("Restauration termin\xE9e (Revenus uniquement).","success"),setTimeout(()=>window.location.hash="#dashboard",1e3)}catch(t){console.error(t),S.show("Erreur lors de la restauration : "+t.message,"error")}}})}function Wt(e){let t=e.payroll_details||[];if(typeof t=="string")try{t=JSON.parse(t)}catch{t=[]}if(t.length===0){se.show({title:`D\xE9tails Paie - ${e.period_label||"Semaine"}`,message:`
                <div class="text-center py-8 text-slate-400">
                    <i data-lucide="archive" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                    <p class="mb-2">Aucun d\xE9tail de paie enregistr\xE9 pour cette archive.</p>
                    <p class="text-xs text-slate-500">Le suivi des paiements n'est disponible que pour les archives cr\xE9\xE9es apr\xE8s la mise \xE0 jour.</p>
                </div>
            `,confirmText:"Fermer",onConfirm:()=>{}}),window.lucide&&lucide.createIcons();return}t.sort((a,r)=>a.name.localeCompare(r.name));let s=`
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-400">
                        <thead class="bg-slate-900/50 text-xs uppercase font-medium text-slate-300">
                            <tr>
                                <th class="px-4 py-3">Employ\xE9</th>
                                <th class="px-4 py-3 text-right">Ventes</th>
                                <th class="px-4 py-3 text-right">Prime</th>
                                <th class="px-4 py-3 text-right">Total D\xFB</th>
                                <th class="px-4 py-3 text-center">Pay\xE9 ?</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-700/50">
                            ${t.map(a=>`
                                <tr class="hover:bg-slate-700/30">
                                    <td class="px-4 py-3 font-medium text-white">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                ${a.name.split(" ").map(r=>r[0]).join("")}
                                            </div>
                                            <div class="flex flex-col">
                                                <span>${a.name}</span>
                                                <span class="text-xs text-slate-500">${a.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-right font-mono text-slate-400">
                                        ${B(a.totalSales||0)}
                                    </td>
                                    <td class="px-4 py-3 text-right font-mono text-blue-400">
                                        ${B(a.commission||0)}
                                    </td>
                                    <td class="px-4 py-3 text-right text-green-400 font-bold font-mono">
                                        ${B(a.totalDue)}
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <input type="checkbox" 
                                            class="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700 cursor-pointer payment-checkbox transition-all"
                                            data-archive-id="${e.id}"
                                            data-employee-id="${a.employeeId}"
                                            data-amount="${a.totalDue}"
                                            ${a.paid?"checked":""}>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `;se.show({title:`D\xE9tails Paie - ${e.period_label||"Semaine"}`,message:s,size:"3xl",confirmText:"Fermer",onConfirm:()=>{}}),setTimeout(()=>{document.querySelectorAll(".payment-checkbox").forEach(r=>{r.addEventListener("change",async o=>{let l=o.target.getAttribute("data-archive-id"),i=o.target.getAttribute("data-employee-id"),c=parseFloat(o.target.getAttribute("data-amount"))||0,g=o.target.checked;try{await u.updateArchivePaymentStatus(l,i,g);let m=(await u.fetchPayrollSettings()).role_primes||{},d=m.safe_config||{},n=parseFloat(d.manual_balance)||0,v=g?n-c:n+c,f={...d,manual_balance:v},y={...m,safe_config:f};if(await u.savePayrollSettings(void 0,void 0,void 0,void 0,y),await u.syncGlobalSafeBalance(),g)try{await u.recordPayout(i,c,null,new Date)}catch(b){console.warn("Payout record failed",b)}let h=De.find(b=>b.id===l);if(h){let b=h.payroll_details;if(typeof b=="string"&&(b=JSON.parse(b)),Array.isArray(b)){let p=b.find(k=>k.employeeId===i);p&&(p.paid=g),typeof h.payroll_details=="string"&&(h.payroll_details=JSON.stringify(b))}}window.updateSafeDisplay&&window.updateSafeDisplay(),S.show(g?`Paiement effectu\xE9 (-${B(c)})`:`Paiement annul\xE9 (+${B(c)})`,"success")}catch(w){console.error(w),o.target.checked=!g,S.show("Erreur lors de la mise \xE0 jour","error")}})})},50)}function Vt(e){let t=document.getElementById("archivesChart");if(!t)return;let s=[...e].sort((i,c)=>new Date(i.archived_at)-new Date(c.archived_at)).slice(-10),a=s.map(i=>{let c=new Date(i.archived_at);return`Sem ${tt(c)}`}),r=s.map(i=>i.total_revenue);if(window.archivesChart&&typeof window.archivesChart.destroy=="function")try{window.archivesChart.destroy()}catch{}let l=t.getContext("2d").createLinearGradient(0,0,0,300);l.addColorStop(0,"rgba(59, 130, 246, 0.3)"),l.addColorStop(1,"rgba(59, 130, 246, 0.0)"),window.archivesChart=new Chart(t,{type:"line",data:{labels:a,datasets:[{label:"Chiffre d'Affaires",data:r,borderColor:"#3b82f6",backgroundColor:l,borderWidth:3,tension:.4,pointBackgroundColor:"#1e293b",pointBorderColor:"#3b82f6",pointBorderWidth:2,pointRadius:6,pointHoverRadius:8,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{backgroundColor:"#1e293b",titleColor:"#fff",bodyColor:"#cbd5e1",borderColor:"#334155",borderWidth:1,padding:12,cornerRadius:8,displayColors:!1,callbacks:{label:function(i){return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD"}).format(i.raw)}}}},scales:{y:{beginAtZero:!0,grid:{color:"#334155",drawBorder:!1,borderDash:[5,5]},ticks:{color:"#94a3b8",font:{family:"'JetBrains Mono', monospace"},callback:function(i){return"$"+i}}},x:{grid:{display:!1},ticks:{color:"#94a3b8",font:{family:"'Inter', sans-serif"}}}},interaction:{intersect:!1,mode:"index"}}})}function tt(e){e=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),e.setUTCDate(e.getUTCDate()+4-(e.getUTCDay()||7));var t=new Date(Date.UTC(e.getUTCFullYear(),0,1)),s=Math.ceil(((e-t)/864e5+1)/7);return s}function ht(){return setTimeout(Jt,50),`
        <div class="space-y-8 animate-fade-in pb-20">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-end gap-6 pb-2">
                <div>
                    <h2 class="text-3xl font-bold text-white flex items-center gap-3">
                        <div class="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                            <i data-lucide="banknote" class="w-8 h-8 text-green-500"></i>
                        </div>
                        Fiches de Paie
                    </h2>
                    <p class="text-slate-400 mt-2 ml-1" id="payroll-period-label">Gestion des salaires et commissions</p>
                </div>
                
                <div id="payroll-actions" class="flex gap-3">
                    <!-- Actions will be injected here -->
                </div>
            </div>

            <!-- Configuration Zone -->
            <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                
                <div class="flex items-center gap-3 mb-6 relative z-10">
                    <div class="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <i data-lucide="percent" class="w-4 h-4 text-blue-400"></i>
                    </div>
                    <h3 class="font-bold text-white text-sm uppercase tracking-wider">Configuration des Primes (%)</h3>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
                    <!-- Patron -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="shield" class="w-3 h-3"></i> Patron
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-patron" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- Co-Patron -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="badge-check" class="w-3 h-3"></i> Co-Patron
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-co-patron" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- Responsable -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="star" class="w-3 h-3"></i> Responsable
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-responsable" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- Chef Atelier -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="crown" class="w-3 h-3"></i> Chef Atelier
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-chef" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- M\xE9cano Confirm\xE9 -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="wrench" class="w-3 h-3"></i> Confirm\xE9
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-mecano-confirme" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- M\xE9cano Junior -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="wrench" class="w-3 h-3"></i> Junior
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-mecano-junior" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <!-- M\xE9cano Test -->
                    <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group">
                        <label class="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2 group-hover:text-blue-400 transition-colors">
                            <i data-lucide="wrench" class="w-3 h-3"></i> Test
                        </label>
                        <div class="relative">
                            <input type="number" id="prime-mecano-test" min="0" max="100" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center">
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">%</span>
                        </div>
                    </div>
                </div>

                <div class="mt-6 flex justify-end">
                    <button id="btn-save-role-primes" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        Sauvegarder la configuration
                    </button>
                </div>
            </div>

<!-- Safe Management moved to #safe-management -->

            <!-- KPIs -->
            <div id="payroll-kpis"></div>

            <!-- Filters Bar -->
            <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-2 flex flex-col md:flex-row gap-2 items-center">
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <div class="relative flex-1 md:flex-none">
                        <input type="date" id="payroll-date-start" class="w-full md:w-auto bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                    </div>
                    <span class="text-slate-500 font-bold">-</span>
                    <div class="relative flex-1 md:flex-none">
                        <input type="date" id="payroll-date-end" class="w-full md:w-auto bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                    </div>
                </div>

                <div class="relative flex-1 w-full md:w-auto">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"></i>
                    <input type="text" id="payroll-search" autocomplete="off" placeholder="Rechercher un employ\xE9..." class="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                </div>
                
                <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <select id="payroll-filter-role" class="flex-1 md:flex-none px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-blue-500">
                        <option value="all">Tous r\xF4les</option>
                        <option value="patron">Patron</option>
                        <option value="co_patron">Co-Patron</option>
                        <option value="chef_atelier">Chef Atelier</option>
                        <option value="mecano_confirme">M\xE9cano Confirm\xE9</option>
                        <option value="mecano_junior">M\xE9cano Junior</option>
                        <option value="mecano_test">M\xE9cano Test</option>
                    </select>

                    <div class="h-8 w-px bg-slate-700 mx-1 self-center hidden md:block"></div>

                    <label class="cursor-pointer select-none whitespace-nowrap">
                        <input id="payroll-only-hours" type="checkbox" class="peer sr-only">
                        <div class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 text-sm peer-checked:bg-blue-500/10 peer-checked:text-blue-400 peer-checked:border-blue-500/50 transition-all flex items-center gap-2 hover:bg-slate-700">
                            <i data-lucide="clock" class="w-4 h-4"></i>
                            <span class="hidden sm:inline">Heures > 0</span>
                            <span class="sm:hidden">Heures</span>
                        </div>
                    </label>
                    <label class="cursor-pointer select-none whitespace-nowrap">
                        <input id="payroll-only-overrides" type="checkbox" class="peer sr-only">
                        <div class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 text-sm peer-checked:bg-yellow-500/10 peer-checked:text-yellow-400 peer-checked:border-yellow-500/50 transition-all flex items-center gap-2 hover:bg-slate-700">
                            <i data-lucide="alert-circle" class="w-4 h-4"></i>
                            <span class="hidden sm:inline">Surcharg\xE9s</span>
                            <span class="sm:hidden">Surch.</span>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Payroll Table -->
            <div class="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr class="border-b border-slate-800 bg-slate-900/80">
                                <th class="p-4 pl-6 font-bold text-slate-400 uppercase text-xs tracking-wider">Employ\xE9</th>
                                <th class="p-4 text-center font-bold text-slate-400 uppercase text-xs tracking-wider">R\xF4le</th>
                                <th class="p-4 text-center font-bold text-slate-400 uppercase text-xs tracking-wider">Prestations</th>
                                <th class="p-4 text-right font-bold text-slate-400 uppercase text-xs tracking-wider">Marge G\xE9n\xE9r\xE9e</th>
                                <th class="p-4 text-center font-bold text-slate-400 uppercase text-xs tracking-wider">% Com.</th>
                                <th class="p-4 text-right font-bold text-slate-400 uppercase text-xs tracking-wider">Prime</th>
                                <th class="p-4 text-center font-bold text-slate-400 uppercase text-xs tracking-wider">Heures</th>
                                <th class="p-4 text-right font-bold text-slate-400 uppercase text-xs tracking-wider w-32">Taux H.</th>
                                <th class="p-4 text-right font-bold text-slate-400 uppercase text-xs tracking-wider">Fixe</th>
                                <th class="p-4 text-right pr-6 font-bold text-slate-400 uppercase text-xs tracking-wider">Total Net</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/50" id="payroll-body">
                            <tr>
                                <td colspan="10" class="p-12 text-center">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-slate-900/80 font-bold text-white border-t border-slate-800">
                            <tr>
                                <td colspan="3" class="p-4 text-right uppercase text-[10px] tracking-widest text-slate-500">Totaux</td>
                                <td class="p-4 text-right font-mono text-slate-300" id="total-revenue">0 $</td>
                                <td></td>
                                <td class="p-4 text-right font-mono text-blue-300" id="total-comm">0 $</td>
                                <td></td>
                                <td></td>
                                <td class="p-4 text-right font-mono text-slate-300" id="total-fixed">0 $</td>
                                <td class="p-4 text-right pr-6 text-xl font-mono" id="total-pay">
                                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">0 $</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <div class="flex items-start gap-3 p-4 bg-blue-900/10 border border-blue-900/20 rounded-xl text-blue-300 text-sm">
                <i data-lucide="info" class="w-5 h-5 mt-0.5 flex-shrink-0"></i>
                <div>
                    <p class="font-bold mb-1">Fonctionnement du calcul</p>
                    <ul class="list-disc list-inside space-y-1 text-blue-200/70 text-xs">
                        <li>La prime est calcul\xE9e selon le <strong>r\xF4le</strong> (pourcentage configurable).</li>
                        <li>Le salaire fixe correspond aux heures de la semaine \xD7 taux horaire.</li>
                        <li>Tu peux mettre un taux horaire personnalis\xE9 pour un employ\xE9 dans le tableau (surcharge).</li>
                    </ul>
                </div>
            </div>
        </div>
    `}async function Jt(){let e=document.getElementById("payroll-body"),t=ie.getUser(),s=await u.hasPermission(t,"payroll.manage"),a=document.getElementById("prime-mecano-confirme"),r=document.getElementById("prime-mecano-junior"),o=document.getElementById("prime-mecano-test"),l=document.getElementById("prime-chef"),i=document.getElementById("prime-responsable"),c=document.getElementById("prime-patron"),g=document.getElementById("prime-co-patron"),w=document.getElementById("btn-save-role-primes"),m=document.getElementById("payroll-kpis"),d=document.getElementById("payroll-search"),n=document.getElementById("payroll-filter-role"),v=document.getElementById("payroll-only-hours"),f=document.getElementById("payroll-only-overrides"),y=document.getElementById("payroll-date-start"),h=document.getElementById("payroll-date-end");if(s||(a&&(a.disabled=!0),r&&(r.disabled=!0),o&&(o.disabled=!0),l&&(l.disabled=!0),i&&(i.disabled=!0),c&&(c.disabled=!0),g&&(g.disabled=!0),w&&(w.style.display="none")),!e)return;let b=p=>{if(!p)return"";let k=p.getFullYear(),x=String(p.getMonth()+1).padStart(2,"0"),E=String(p.getDate()).padStart(2,"0");return`${k}-${x}-${E}`};try{let p=await u.fetchEmployees(),k=await u.fetchSales(),x=await u.fetchTimeEntries(),E=await u.fetchPayrollSettings(),T=u.getDateFilter(),P=T?.start||null,C=T?.end||null;y&&(y.value=P?b(P):""),h&&(h.value=C?b(C):"");let R=()=>{let $=null,L=null;y.value&&($=new Date(y.value),$.setHours(0,0,0,0)),h.value&&(L=new Date(h.value),L.setHours(23,59,59,999)),P=$,C=L,u.setDateFilter($,L),N()};y&&y.addEventListener("change",R),h&&h.addEventListener("change",R);let _=.2,I={mecano_confirme:1,mecano_junior:1,mecano_test:1,chef_atelier:1,responsable:1,patron:1,co_patron:1},A={mecano_confirme:20,mecano_junior:20,mecano_test:5,chef_atelier:20,responsable:20,patron:60,co_patron:60};if(E)E.commission_rate!==void 0&&(_=Number(E.commission_rate)),E.grade_rates&&((()=>{try{return Object.values(E.grade_rates||{}).some(L=>Number(L)>100)}catch{return!1}})()?I=E.grade_rates:A=E.grade_rates),E.role_primes&&(A=E.role_primes);else{_=u.getCommissionRate(),I=u.getGradeRates();try{let $=localStorage.getItem("db_payroll_role_primes");$&&(A=JSON.parse($))}catch{}}try{I&&typeof I=="object"&&I.mecano!==void 0&&(I.mecano_confirme===void 0&&(I.mecano_confirme=I.mecano),I.mecano_junior===void 0&&(I.mecano_junior=I.mecano),delete I.mecano)}catch{}try{A&&typeof A=="object"&&A.mecano!==void 0&&(A.mecano_confirme===void 0&&(A.mecano_confirme=A.mecano),A.mecano_junior===void 0&&(A.mecano_junior=A.mecano),delete A.mecano)}catch{}(()=>{try{return Object.values(A||{}).some($=>Number($)>100)}catch{return!1}})()&&(A={mecano_confirme:20,mecano_junior:20,mecano_test:5,chef_atelier:20,responsable:20,patron:60,co_patron:60}),l&&(l.value=Number(A.chef_atelier??0)),i&&(i.value=Number(A.responsable??20)),c&&(c.value=Number(A.patron??0)),g&&(g.value=Number(A.co_patron??A.patron??0)),a&&(a.value=Number(A.mecano_confirme??0)),r&&(r.value=Number(A.mecano_junior??0)),o&&(o.value=Number(A.mecano_test??0)),w&&w.addEventListener("click",async()=>{let $=j=>{let F=Number(j);return isFinite(F)?Math.max(0,Math.min(100,F)):0},L={mecano_confirme:$(a?.value),mecano_junior:$(r?.value),mecano_test:$(o?.value),chef_atelier:$(l?.value),responsable:$(i?.value),patron:$(c?.value),co_patron:$(g?.value)};try{A=L,await u.savePayrollSettings(_,I,void 0,void 0,L),N(),S.show("Configuration primes sauvegard\xE9e","success")}catch(j){S.show("Erreur sauvegarde : "+j.message,"error")}});let q="",M="all",V=!1,W=!1;try{q=localStorage.getItem("payroll_search")||"",M=localStorage.getItem("payroll_filter_role")||"all",V=localStorage.getItem("payroll_only_hours")==="1",W=localStorage.getItem("payroll_only_overrides")==="1"}catch{}d&&(d.value=q,d.addEventListener("input",$=>{q=$.target.value||"";try{localStorage.setItem("payroll_search",q)}catch{}N()})),n&&(n.value=M,n.addEventListener("change",()=>{M=n.value||"all";try{localStorage.setItem("payroll_filter_role",M)}catch{}N()})),v&&(v.checked=V,v.addEventListener("change",()=>{V=!!v.checked;try{localStorage.setItem("payroll_only_hours",V?"1":"0")}catch{}N()})),f&&(f.checked=W,f.addEventListener("change",()=>{W=!!f.checked;try{localStorage.setItem("payroll_only_overrides",W?"1":"0")}catch{}N()}));let N=()=>{let $=u.getDateFilter(),L=null,j=null;$&&(L=$.start,j=$.end);let F=document.getElementById("payroll-period-label");F&&(L&&j?F.innerHTML=`P\xE9riode du <span class="text-white font-bold">${L.toLocaleDateString("fr-FR")}</span> au <span class="text-white font-bold">${j.toLocaleDateString("fr-FR")}</span>`:F.textContent="P\xE9riode en cours (Tout l'historique non archiv\xE9)");let X=document.getElementById("payroll-actions");X&&!X.hasChildNodes()&&u.hasPermission(t,"archives.manage").then(te=>{if(te){let oe=document.createElement("button");oe.className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2",oe.innerHTML='<i data-lucide="archive" class="w-4 h-4"></i> Cl\xF4turer & Archiver',oe.onclick=()=>{let xe="Cette action va archiver les donn\xE9es et r\xE9initialiser les compteurs.";L&&j?(xe+=`

P\xE9riode : ${L.toLocaleDateString("fr-FR")} au ${j.toLocaleDateString("fr-FR")}`,xe+=`
Seules les donn\xE9es de cette p\xE9riode seront archiv\xE9es et supprim\xE9es.`):xe+=`

ATTENTION : Aucune p\xE9riode s\xE9lectionn\xE9e. TOUT l'historique actuel sera archiv\xE9.`,se.show({title:"\u{1F4E6} CL\xD4TURER LA P\xC9RIODE",message:xe,type:"info",confirmText:"ARCHIVER",inputExpected:"CLOTURE",onConfirm:async()=>{try{await u.archiveAndReset(L,j),S.show("P\xE9riode cl\xF4tur\xE9e et archiv\xE9e avec succ\xE8s !","success"),setTimeout(()=>window.location.reload(),1500)}catch(z){S.show("Erreur lors de l'archivage : "+z.message,"error")}}})},X.appendChild(oe),window.lucide&&lucide.createIcons()}});let O=0,Z=0,ee=0,de=0,re=0,ue=te=>{let oe=Number(A&&A[te]);return isFinite(oe)&&oe>=0?oe/100:_},fe=String(q||"").trim().toLowerCase(),ce=[],ge=te=>te==="mecano"?"mecano_confirme":te,he={patron:1,co_patron:2,responsable:3,chef_atelier:4,mecano_confirme:6,mecano_junior:7,mecano_test:8},me=p.slice().sort((te,oe)=>(he[ge(te.role)]||99)-(he[ge(oe.role)]||99));for(let te of me){let oe=ge(te.role),xe=`${te.first_name||""} ${te.last_name||""}`.trim().toLowerCase();if(fe&&!xe.includes(fe)||M!=="all"&&String(oe||"")!==String(M))continue;let z=te.custom_rate;if(z==null){let be=u.getPayrollRates();be[te.id]!==void 0&&(z=be[te.id])}let G=I[oe]!==void 0?I[oe]:oe==="mecano_confirme"||oe==="mecano_junior"?I.mecano_confirme||0:oe==="co_patron"&&I.patron||0;z==null&&(z=G);let J=x.filter(be=>{if(!(String(be.employee_id)===String(te.id))||!be.clock_out)return!1;if(L&&j){let Ae=new Date(be.clock_out);if(Ae<L||Ae>j)return!1}return!0}).reduce((be,Ee)=>{let Ae=Number(Ee.pause_total_ms||0);return be+Math.max(0,new Date(Ee.clock_out)-new Date(Ee.clock_in)-Ae)},0)/36e5,Y=k.filter(be=>{if(String(be.employeeId)!==String(te.id))return!1;if(L&&j){let Ee=new Date(be.date);if(Ee<L||Ee>j)return!1}return!0}),K=Y.reduce((be,Ee)=>be+(Number(Ee.price)-Number(Ee.cost||0)),0),le=K*ue(oe),ne=J*z,pe=ne+le,we=u.getPayrollRates(),ke=Number(z)!==Number(G)||we[te.id]!==void 0;if(V&&J<=0||W&&!ke)continue;O+=ne,Z+=le,ee+=pe,de+=J,re+=K;let Le=Math.floor(J),Fe=Math.round((J-Le)*60),Se="";oe==="patron"?Se='<span class="px-2 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase">Patron</span>':oe==="co_patron"?Se='<span class="px-2 py-1 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">Co-Patron</span>':oe==="chef_atelier"?Se='<span class="px-2 py-1 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 uppercase">Chef Atelier</span>':oe==="mecano_confirme"?Se='<span class="px-2 py-1 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300 border border-slate-600/50 uppercase">M\xE9cano Conf.</span>':oe==="mecano_junior"?Se='<span class="px-2 py-1 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300 border border-slate-600/50 uppercase">M\xE9cano Junior</span>':oe==="mecano_test"?Se='<span class="px-2 py-1 rounded text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/50 uppercase">M\xE9cano Test</span>':oe==="responsable"?Se='<span class="px-2 py-1 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">Responsable</span>':Se='<span class="px-2 py-1 rounded text-[10px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/50 uppercase">Employ\xE9</span>';let Ke=ke?"border-yellow-500/50 text-yellow-400 font-bold bg-yellow-500/5":"border-slate-700 text-white hover:border-blue-500/50 focus:border-blue-500";ce.push(`
                    <tr class="hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 last:border-0 group">
                        <td class="p-4 pl-6">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700 group-hover:border-slate-600 transition-colors">
                                    ${te.photo?`<img src="${te.photo}" class="w-full h-full object-cover rounded-xl" />`:`${te.first_name[0]}${te.last_name[0]}`}
                                </div>
                                <div>
                                    <div class="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">${te.first_name} ${te.last_name}</div>
                                    <div class="text-[10px] text-slate-500 font-mono">@${te.username}</div>
                                </div>
                            </div>
                        </td>
                        <td class="p-4 text-center">
                            ${Se}
                        </td>
                        <td class="p-4 text-center">
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 font-bold text-sm">
                                <i data-lucide="wrench" class="w-3 h-3 text-slate-500"></i>
                                ${Y.length}
                            </div>
                        </td>
                        <td class="p-4 text-right font-mono text-slate-300 text-sm font-bold">
                            ${B(K)}
                        </td>
                        <td class="p-4 text-center font-mono text-xs text-slate-500">
                            ${(ue(oe)*100).toFixed(0)}%
                        </td>
                        <td class="p-4 text-right font-mono text-blue-400 text-sm font-bold">
                            ${B(le)}
                        </td>
                        <td class="p-4 text-center">
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700 group-hover:bg-slate-800 transition-colors">
                                <i data-lucide="clock" class="w-3 h-3 text-slate-500"></i>
                                <span class="font-mono text-slate-300 text-sm font-bold">${Le}h <span class="text-xs text-slate-500">${Fe.toString().padStart(2,"0")}</span></span>
                            </div>
                        </td>
                        <td class="p-4 text-right">
                            <div class="relative inline-block w-24">
                                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                                <input type="number"
                                    onchange="updateRate('${te.id}', this.value)"
                                    value="${z}"
                                    class="w-full bg-slate-900 border rounded-lg px-2 py-1.5 pl-5 text-right outline-none text-sm font-mono transition-all ${Ke}"
                                >
                            </div>
                        </td>
                        <td class="p-4 text-right font-mono text-slate-400 text-sm">
                            ${B(ne)}
                        </td>
                        <td class="p-4 pr-6 text-right font-bold text-green-400 font-mono text-base">
                            ${B(pe)}
                        </td>
                    </tr>
                `)}if(e.innerHTML=ce.length?ce.join(""):`
                <tr>
                    <td colspan="10" class="p-16 text-center text-slate-500">
                        <div class="flex flex-col items-center justify-center gap-4">
                            <div class="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                <i data-lucide="search-x" class="w-8 h-8 opacity-50"></i>
                            </div>
                            <div>
                                <p class="font-bold text-lg text-slate-400">Aucun r\xE9sultat</p>
                                <p class="text-sm text-slate-600 mt-1">
                                    ${p.length===0?"Aucun employ\xE9 n'a \xE9t\xE9 trouv\xE9 dans la base de donn\xE9es.":"Modifiez vos filtres pour voir les r\xE9sultats."}
                                </p>
                            </div>
                            ${V||W||q||M!=="all"?`
                                <button id="btn-clear-filters" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 mt-2 group">
                                    <i data-lucide="x" class="w-4 h-4 group-hover:rotate-90 transition-transform"></i>
                                    Effacer les filtres
                                </button>
                            `:""}
                        </div>
                    </td>
                </tr>
            `,setTimeout(()=>{let te=document.getElementById("btn-clear-filters");te&&te.addEventListener("click",()=>{d&&(d.value=""),n&&(n.value="all"),v&&(v.checked=!1),f&&(f.checked=!1),q="",M="all",V=!1,W=!1;try{localStorage.setItem("payroll_search",""),localStorage.setItem("payroll_filter_role","all"),localStorage.setItem("payroll_only_hours","0"),localStorage.setItem("payroll_only_overrides","0")}catch{}N()})},0),document.getElementById("total-fixed").textContent=B(O),document.getElementById("total-comm").textContent=B(Z),document.getElementById("total-pay").textContent=B(ee),m){let te=de>0?O/de:0,oe=re>0?Z/re*100:0,xe=re-ee,z=re>0?xe/re*100:0,G=xe>=0?"text-emerald-400":"text-rose-400",Q=xe>=0?"from-emerald-500/20 to-teal-500/5":"from-rose-500/20 to-red-500/5";m.innerHTML=`
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="clock" class="w-12 h-12 text-blue-400"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Heures (semaine)</div>
                            <div class="text-2xl font-black text-white tracking-tight">${de.toFixed(1)}<span class="text-sm font-bold text-slate-500 ml-1">h</span></div>
                            <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">Moy. taux: ${B(te)}</div>
                        </div>
                        
                        <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="wallet" class="w-12 h-12 text-purple-400"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Marge Totale (semaine)</div>
                            <div class="text-2xl font-black text-white tracking-tight">${B(re)}</div>
                            <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">Prime moy.: ${oe.toFixed(1)}%</div>
                        </div>
                        
                        <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="banknote" class="w-12 h-12 text-blue-400"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Salaires fixes</div>
                            <div class="text-2xl font-black text-white tracking-tight">${B(O)}</div>
                            <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">Base heures \xD7 taux</div>
                        </div>
                        
                        <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="dollar-sign" class="w-12 h-12 text-orange-400"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total \xE0 payer</div>
                            <div class="text-2xl font-black text-orange-400 tracking-tight">${B(ee)}</div>
                            <div class="mt-2 text-xs font-medium text-slate-400">Dont primes: <span class="text-orange-300 font-bold">${B(Z)}</span></div>
                        </div>

                        <div class="bg-gradient-to-br ${Q} rounded-xl border border-slate-700 p-4 relative overflow-hidden group shadow-lg">
                            <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i data-lucide="piggy-bank" class="w-12 h-12 ${G}"></i>
                            </div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reste Entreprise</div>
                            <div class="text-2xl font-black ${G} tracking-tight">${B(xe)}</div>
                            <div class="mt-2 text-xs font-medium text-slate-400">Marge brute: <span class="${G} font-bold">${z.toFixed(1)}%</span></div>
                        </div>
                    </div>
                `}window.lucide&&lucide.createIcons()};N(),window.updateRate=async($,L)=>{let j=parseFloat(L)||0,F=p.find(Z=>Z.id===$),X=I[F?.role]!==void 0?I[F.role]:F?.role==="mecano_confirme"||F?.role==="mecano_junior"?I.mecano_confirme||0:F?.role==="co_patron"&&I.patron||0,O=j<=0?null:j;O!==null&&Number(O)===Number(X)&&(O=null);try{await u.saveEmployeeCustomRate($,O),F&&(F.custom_rate=O),N(),O===null?S.show("Taux align\xE9 sur le r\xF4le","info"):S.show("Taux personnalis\xE9 sauvegard\xE9","success")}catch(Z){S.show("Erreur sauvegarde : "+Z.message,"error")}}}catch(p){console.error(p),e.innerHTML=`<tr><td colspan="7" class="p-8 text-center text-red-500">Erreur de chargement: ${p.message}</td></tr>`}}function vt(){return setTimeout(at,50),`
        <div class="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto">
            <!-- Header Banner -->
            <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 shadow-2xl p-8 md:p-10">
                <div class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <div class="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
                                <i data-lucide="landmark" class="w-6 h-6 text-emerald-400"></i>
                            </div>
                            <h2 class="text-3xl font-black text-white tracking-tight">Gestion Coffre & Taxes</h2>
                        </div>
                        <p class="text-slate-400 text-sm max-w-xl">
                            Interface centralis\xE9e pour la gestion de la tr\xE9sorerie, le suivi du chiffre d'affaires et le calcul des pr\xE9l\xE8vements gouvernementaux.
                        </p>
                    </div>
                    
                    <div class="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center gap-5 min-w-[280px]">
                        <div class="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <i data-lucide="wallet" class="w-6 h-6 text-yellow-400"></i>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Solde Global Th\xE9orique</p>
                            <p id="header-global-balance" class="text-2xl font-black text-white font-mono tracking-tight">Chargement...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Grid -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                <!-- LEFT COLUMN: TAX CALCULATOR -->
                <div class="space-y-6">
                    <div class="flex items-center gap-3 px-2">
                        <div class="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700"></div>
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Zone Gouvernementale</span>
                        <div class="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700"></div>
                    </div>

                    <div class="bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-colors">
                        <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <i data-lucide="scale" class="w-32 h-32 text-white"></i>
                        </div>

                        <div class="flex items-center gap-4 mb-8 relative z-10">
                            <div class="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                <i data-lucide="calendar-clock" class="w-6 h-6 text-blue-400"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-white text-lg">Planification des Taxes</h3>
                                <p class="text-xs text-slate-400">Suivi et projection des pr\xE9l\xE8vements</p>
                            </div>
                        </div>

                        <div class="space-y-6 relative z-10">
                            
                            <!-- Configuration & Status -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <!-- Current Status -->
                                <div class="bg-slate-950/50 rounded-2xl border border-slate-800 p-4 space-y-4">
                                    <div class="flex items-center gap-2 mb-2">
                                        <div class="p-1.5 bg-emerald-500/10 rounded-lg">
                                            <i data-lucide="activity" class="w-4 h-4 text-emerald-400"></i>
                                        </div>
                                        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Cycle Actuel</h4>
                                    </div>
                                    
                                    <div class="space-y-1">
                                        <p class="text-[10px] font-bold text-slate-500 uppercase">Chiffre d'Affaire G\xE9n\xE9r\xE9</p>
                                        <p id="safe-auto-turnover" class="font-mono font-bold text-white text-lg">0.00 $</p>
                                    </div>
                                    
                                    <div class="pt-3 border-t border-slate-800/50 space-y-1">
                                        <p class="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                                            <span>Taxe Estim\xE9e</span>
                                            <span id="safe-tax-rate-display" class="text-blue-400">10%</span>
                                        </p>
                                        <p id="safe-estimated-tax" class="font-mono font-bold text-red-400 text-xl">0.00 $</p>
                                    </div>
                                </div>

                                <!-- Settings -->
                                <div class="bg-slate-950/50 rounded-2xl border border-slate-800 p-4 space-y-4">
                                     <div class="flex items-center gap-2 mb-2">
                                        <div class="p-1.5 bg-blue-500/10 rounded-lg">
                                            <i data-lucide="settings-2" class="w-4 h-4 text-blue-400"></i>
                                        </div>
                                        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Configuration</h4>
                                    </div>

                                    <div class="space-y-3">
                                        <div class="space-y-1">
                                            <label class="text-[10px] font-bold text-slate-500 uppercase">Derni\xE8re Taxe Pay\xE9e</label>
                                            <div class="flex gap-2">
                                                <div class="relative flex-1 group/input">
                                                    <input type="text" id="safe-last-taken-input" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-blue-500 outline-none transition-all pl-8">
                                                    <i data-lucide="calendar" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"></i>
                                                </div>
                                                <button id="btn-save-last-taken" class="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all active:scale-95 flex items-center justify-center" title="Sauvegarder la date">
                                                    <i data-lucide="save" class="w-3.5 h-3.5"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-2 gap-2">
                                            <div class="space-y-1">
                                                <label class="text-[10px] font-bold text-slate-500 uppercase">Taux (%)</label>
                                                <input type="number" id="safe-config-rate" value="10" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-blue-500 outline-none transition-all text-center">
                                            </div>
                                            <div class="space-y-1">
                                                <label class="text-[10px] font-bold text-slate-500 uppercase">Intervalle (H)</label>
                                                <input type="number" id="safe-config-interval" value="13" min="1" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-blue-500 outline-none transition-all text-center">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Planning -->
                            <div class="bg-slate-800/30 rounded-2xl border border-slate-800 p-5">
                                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <i data-lucide="calendar-days" class="w-4 h-4 text-orange-400"></i>
                                    Prochains Pr\xE9l\xE8vements
                                </h4>
                                <div id="tax-schedule-list" class="space-y-2">
                                    <!-- Schedule items generated by JS -->
                                    <div class="animate-pulse flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                        <div class="h-4 w-24 bg-slate-700 rounded"></div>
                                        <div class="h-4 w-16 bg-slate-700 rounded"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Action Button -->
                            <button id="btn-pay-tax" class="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-[0.98] flex items-center justify-center gap-3 group/btn">
                                <span class="bg-white/20 p-1 rounded-full">
                                    <i data-lucide="credit-card" class="w-4 h-4 group-hover/btn:scale-110 transition-transform"></i>
                                </span>
                                Payer la Taxe Maintenant
                            </button>
                            
                            <p class="text-[10px] text-center text-slate-500 px-4">
                                En cliquant sur "Payer", vous validez le cycle actuel.
                            </p>

                            <!-- History -->
                            <div class="bg-slate-800/30 rounded-2xl border border-slate-800 p-5 mt-6">
                                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <i data-lucide="history" class="w-4 h-4 text-slate-400"></i>
                                    Historique des Paiements
                                </h4>
                                <div id="tax-history-list" class="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                    <!-- History items generated by JS -->
                                    <div class="text-center py-4">
                                        <p class="text-xs text-slate-500">Aucun historique disponible</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT COLUMN: PHYSICAL SAFE -->
                <div class="space-y-6">
                     <div class="flex items-center gap-3 px-2">
                        <div class="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700"></div>
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Zone Tr\xE9sorerie (Jeu)</span>
                        <div class="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700"></div>
                    </div>

                    <div class="bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden group hover:border-yellow-900/30 transition-colors h-full flex flex-col">
                        <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <i data-lucide="coins" class="w-32 h-32 text-yellow-500"></i>
                        </div>

                        <div class="flex items-center gap-4 mb-8 relative z-10">
                            <div class="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                                <i data-lucide="safe" class="w-6 h-6 text-yellow-400"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-white text-lg">Coffre Physique</h3>
                                <p class="text-xs text-slate-400">Synchronisation avec l'argent en jeu</p>
                            </div>
                        </div>

                        <div class="flex-1 flex flex-col gap-6 relative z-10">
                            <!-- Status Card -->
                            <div class="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 text-center shadow-inner relative overflow-hidden">
                                <div class="absolute inset-0 bg-yellow-500/5 opacity-50"></div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Solde Th\xE9orique Actuel</p>
                                <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 font-mono tracking-tighter mb-2 relative z-10" id="calculated-safe-balance">
                                    0.00 $
                                </div>
                                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 relative z-10">
                                    <i data-lucide="trending-up" class="w-3 h-3 text-emerald-400"></i>
                                    <span id="calculated-safe-delta" class="text-xs font-bold text-emerald-400">+0.00 $</span>
                                    <span class="text-[10px] text-slate-500 uppercase">depuis maj</span>
                                </div>
                            </div>

                            <!-- Manual Update Section -->
                            <div class="bg-slate-800/30 rounded-2xl p-5 border border-slate-800">
                                <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <i data-lucide="refresh-cw" class="w-3 h-3 text-slate-400"></i>
                                    Mise \xE0 jour Manuelle
                                </h4>
                                
                                <div class="space-y-4">
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-400 uppercase">Nouveau Solde R\xE9el ($)</label>
                                        <div class="flex gap-3">
                                            <div class="relative flex-1 group/input">
                                                <input type="number" id="manual-safe-balance" placeholder="0.00" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold font-mono focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all shadow-inner">
                                            </div>
                                            <button id="btn-save-manual-safe" class="px-5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl transition-all shadow-lg shadow-yellow-900/20 active:scale-95 flex items-center justify-center">
                                                <i data-lucide="save" class="w-5 h-5"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-start gap-2 text-[10px] text-slate-400 bg-slate-900/50 p-2 rounded-lg">
                                        <i data-lucide="info" class="w-3 h-3 mt-0.5 text-blue-400"></i>
                                        <p>En sauvegardant, vous d\xE9finissez un nouveau point de d\xE9part. Les factures futures s'ajouteront \xE0 ce montant.</p>
                                    </div>
                                    
                                    <div class="text-right">
                                        <p class="text-[10px] text-slate-500">Derni\xE8re synchro: <span id="manual-safe-date" class="text-slate-300 font-medium">Jamais</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            <!-- Info Footer -->
            <div class="mt-8 text-center">
                 <p class="text-xs text-slate-500 max-w-2xl mx-auto">
                    Le syst\xE8me calcule automatiquement le b\xE9n\xE9fice net (Prix Client - Co\xFBt Garage) de chaque facture valid\xE9e et l'ajoute au coffre th\xE9orique.
                    Lors du paiement de la taxe, le compteur de chiffre d'affaire est r\xE9initialis\xE9.
                 </p>
            </div>
        </div>
    `}async function at(){let e=document.getElementById("safe-auto-turnover"),t=document.getElementById("safe-estimated-tax"),s=document.getElementById("safe-tax-rate-display"),a=document.getElementById("safe-last-taken-input"),r=document.getElementById("btn-save-last-taken"),o=document.getElementById("safe-config-rate"),l=document.getElementById("safe-config-interval"),i=document.getElementById("tax-schedule-list"),c=document.getElementById("tax-history-list"),g=document.getElementById("btn-pay-tax"),w=document.getElementById("manual-safe-balance"),m=document.getElementById("btn-save-manual-safe"),d=document.getElementById("manual-safe-date"),n=document.getElementById("calculated-safe-balance"),v=document.getElementById("header-global-balance"),f=document.getElementById("calculated-safe-delta");try{let[y,h,b,p,k]=await Promise.all([u.fetchPayrollSettings(),u.fetchSales(),u.fetchRepairKitOrders(),u.fetchRepairKitConfig(),u.fetchTaxPayments()]),x={};if(y&&y.role_primes)x=y.role_primes;else try{let N=localStorage.getItem("db_payroll_role_primes");N&&(x=JSON.parse(N))}catch{}let E=x.safe_config||{},T=E.tax_rate!==void 0?E.tax_rate:10,P=E.tax_interval!==void 0?E.tax_interval:13,C=E.last_taken?new Date(E.last_taken):null,R=parseFloat(E.manual_balance)||0,_=E.manual_balance_updated_at?new Date(E.manual_balance_updated_at):new Date(0),I=0;if(E.manual_balance_updated_at&&(h&&Array.isArray(h)&&(I+=h.reduce((N,$)=>{if(new Date($.date)>_){let j=parseFloat($.price)||0,F=parseFloat($.cost)||0;return N+(j-F)}return N},0)),b&&Array.isArray(b))){let N=Number(p.price)||2500;I+=b.reduce(($,L)=>new Date(L.created_at)>_&&L.status!=="cancelled"&&L.status!=="rejected"?$+Number(L.quantity)*N:$,0)}let A=R+I;o&&(o.value=T),l&&(l.value=P),s&&(s.textContent=`${T}%`);let H=null;a&&window.flatpickr&&(H=flatpickr(a,{enableTime:!0,dateFormat:"Y-m-d H:i",time_24hr:!0,locale:"fr",defaultDate:C||new Date,allowInput:!0,onClose:async N=>{N.length>0&&await W({last_taken:N[0].toISOString()})}})),r&&H&&r.addEventListener("click",async()=>{let N=H.selectedDates[0];if(N)await W({last_taken:N.toISOString()});else{let $=a.value,L=flatpickr.parseDate($,"Y-m-d H:i");L?await W({last_taken:L.toISOString()}):S.show("Date invalide","warning")}});let q=A,M=q*(T/100);e&&(e.textContent=B(q)),t&&(t.textContent=B(M));let V=e?.previousElementSibling;if(V&&(V.textContent="Solde du Coffre (Base Taxable)"),i){i.innerHTML="";let $=((j,F,X=3)=>{let O=[],Z=new Date(j);for(let ee=0;ee<X;ee++)Z=new Date(Z.getTime()+F*60*60*1e3),O.push(new Date(Z));return O})(C||new Date,P,4),L=new Date;$.forEach(j=>{let F=j.toDateString()===L.toDateString(),X=new Date(L.getTime()+864e5).toDateString()===j.toDateString(),O=j.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});F&&(O="Aujourd'hui"),X&&(O="Demain"),O=O.charAt(0).toUpperCase()+O.slice(1);let Z=`${String(j.getHours()).padStart(2,"0")}h${String(j.getMinutes()).padStart(2,"0")}`,ee=j-L,de=ee<0,re="";de?re='<span class="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">En Retard</span>':ee<36e5*P?re='<span class="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase">Prochain</span>':re='<span class="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded uppercase">\xC0 venir</span>';let ue=`
                    <div class="flex items-center justify-between p-3 rounded-lg ${de?"bg-red-500/5 border-red-500/20":"bg-slate-800/50 border-slate-700/50"} border">
                        <div class="flex items-center gap-3">
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-200">${O}</span>
                                <span class="text-[10px] text-slate-500">${j.toLocaleDateString("fr-FR")}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="font-mono font-bold text-white bg-slate-700 px-2 py-1 rounded text-xs">${Z}</span>
                            ${re}
                        </div>
                    </div>
                `;i.insertAdjacentHTML("beforeend",ue)})}c&&k&&k.length>0&&(c.innerHTML="",k.forEach(N=>{let $=new Date(N.paid_at),L=$.toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}),j=$.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),F=B(N.amount),X=N.paid_by_user?`${N.paid_by_user.first_name} ${N.paid_by_user.last_name}`:"Syst\xE8me",O=`
                    <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                        <div>
                            <p class="text-xs font-bold text-white">${F}</p>
                            <p class="text-[10px] text-slate-500 flex items-center gap-1">
                                <i data-lucide="calendar" class="w-3 h-3"></i>
                                ${L} ${j}
                            </p>
                        </div>
                        <div class="text-right">
                             <span class="text-[10px] font-bold text-blue-400 block">${X}</span>
                             <span class="text-[10px] text-slate-600 block">Base: ${B(N.taxable_base)} (${N.rate}%)</span>
                        </div>
                    </div>
                `;c.insertAdjacentHTML("beforeend",O)}));let W=async N=>{let $=x||{},j={...$.safe_config||{},...N},F={...$,safe_config:j};try{await u.savePayrollSettings(void 0,void 0,void 0,void 0,F),at(),S.show("Configuration mise \xE0 jour","success")}catch(X){console.error(X),S.show("Erreur sauvegarde config","error")}};o&&o.addEventListener("change",N=>{W({tax_rate:parseFloat(N.target.value)||0})}),l&&l.addEventListener("change",N=>{W({tax_interval:parseFloat(N.target.value)||13})}),g&&g.addEventListener("click",async()=>{if(!confirm(`Confirmer le paiement de la taxe ?
Cela enregistrera le montant actuel et r\xE9initialisera le cycle.`))return;let N=g.innerHTML;g.disabled=!0,g.innerHTML='<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Traitement...';try{await u.recordTaxPayment({amount:M,rate:T,taxable_base:q,period_start:C?C.toISOString():null}),await W({last_taken:new Date().toISOString()}),S.show("Paiement enregistr\xE9 avec succ\xE8s","success")}catch($){console.error($),S.show("Erreur lors du paiement","error"),g.disabled=!1,g.innerHTML=N}}),w&&(w.value=E.manual_balance||""),d&&(E.manual_balance_updated_at?d.textContent=new Date(E.manual_balance_updated_at).toLocaleString("fr-FR"):d.textContent="Jamais"),n&&(n.textContent=B(A)),v&&(v.textContent=B(A)),f&&(f.textContent=(I>=0?"+":"")+B(I),f.className=I>=0?"text-xs font-bold text-emerald-400":"text-xs font-bold text-red-400"),m&&m.addEventListener("click",async()=>{let N=parseFloat(w.value)||0,$=new Date().toISOString(),L=x;try{let O=await u.fetchPayrollSettings();O?.role_primes&&(L=O.role_primes)}catch{}let F={...L.safe_config||{},manual_balance:N,manual_balance_updated_at:$},X={...L,safe_config:F};try{await u.savePayrollSettings(void 0,void 0,void 0,void 0,X),await u.syncGlobalSafeBalance(),S.show("Coffre physique mis \xE0 jour","success"),window.updateSafeDisplay&&window.updateSafeDisplay(),at()}catch(O){S.show("Erreur sauvegarde : "+O.message,"error")}})}catch(y){console.error("Error initSafeManagement",y),S.show("Erreur de chargement: "+y.message,"error")}window.lucide&&lucide.createIcons()}function rt(e){let t=u.getCurrentUser(),s=u.hasPermissionSync(t,"employees.manage"),a=u.hasPermissionSync(t,"sales.view_all"),r=u.hasPermissionSync(t,"employees.delete"),o=t?.id||null,l=!!o&&t?.role!=="patron",i={};setTimeout(async()=>{try{(await u.fetchAllEmploymentContracts()).forEach(Q=>{i[Q.employee_id]=Q});let G=document.getElementById("employees-grid");G&&(G.innerHTML=P(e),window.lucide&&lucide.createIcons(),ce(),ee(),de())}catch(z){console.error(z)}let _=document.getElementById("search-employee"),I=document.getElementById("employees-grid"),A=document.getElementById("emp-filter-status"),H=document.getElementById("emp-filter-role"),q=document.getElementById("emp-filter-flag"),M=document.getElementById("emp-sort-by"),V=document.getElementById("emp-sort-dir"),W=document.getElementById("emp-filters-reset"),N=document.getElementById("emp-filter-date-start"),$=document.getElementById("emp-filter-date-end"),L=z=>{if(!z)return"";let G=new Date(z),Q=G.getFullYear(),U=String(G.getMonth()+1).padStart(2,"0"),J=String(G.getDate()).padStart(2,"0");return`${Q}-${U}-${J}`};if(N&&$){N.value=w?L(w):"",$.value=m?L(m):"";let z=()=>{if(N.value){let Q=new Date(N.value);Q.setHours(0,0,0,0),w=Q}else w=null;if($.value){let Q=new Date($.value);Q.setHours(23,59,59,999),m=Q}else m=null;u.setDateFilter(w,m);let G=document.getElementById("employees-grid");G&&(G.innerHTML=P(e),window.lucide&&lucide.createIcons(),fe(),ce(),ue(),ee(),de())};N.addEventListener("change",z),$.addEventListener("change",z)}let j=document.getElementById("emp-kpi-total"),F=document.getElementById("emp-kpi-active"),X=document.getElementById("emp-kpi-paused"),O=document.getElementById("emp-kpi-inactive"),Z=document.getElementById("emp-kpi-locked"),ee=()=>{},de=()=>{},re=()=>Array.from(I?.getElementsByClassName("employee-card")||[]);I&&I.addEventListener("click",z=>{let G=z.target.closest(".js-view-contract");if(G){z.preventDefault(),z.stopPropagation();let Q=G.dataset.id,U=i[Q];U&&se.show({title:"Contrat de Travail",message:`
                                <div class="bg-white text-slate-900 p-8 rounded-lg max-h-[60vh] overflow-y-auto shadow-inner border border-slate-200">
                                    <div class="prose prose-sm max-w-none mb-6">
                                        ${U.content_html}
                                    </div>
                                    <div class="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono bg-slate-50 p-4 rounded-lg">
                                        <div>
                                            <div class="font-bold text-slate-700 uppercase mb-1">Signature \xC9lectronique</div>
                                            <div class="font-serif italic text-lg text-blue-900">${U.signature}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-bold text-slate-700 uppercase mb-1">Date de signature</div>
                                            <div>${new Date(U.signed_at).toLocaleString("fr-FR")}</div>
                                        </div>
                                    </div>
                                </div>
                            `,confirmText:"Fermer",type:"info",width:"max-w-4xl"})}});let ue=()=>{let z=re(),G=z.length,Q=z.filter(K=>K.dataset.presence==="active").length,U=z.filter(K=>K.dataset.presence==="paused").length,J=z.filter(K=>K.dataset.inactive==="1").length,Y=z.filter(K=>K.dataset.locked==="1").length;j&&(j.textContent=String(G)),F&&(F.textContent=String(Q)),X&&(X.textContent=String(U)),O&&(O.textContent=String(J)),Z&&(Z.textContent=String(Y))},fe=()=>{if(!I)return;let z=re(),G=M?.value||localStorage.getItem("emp_sort_by")||"rev",U=(V?.dataset?.dir||localStorage.getItem("emp_sort_dir")||"desc")==="asc"?1:-1,J=(K,le)=>Number(K.dataset[le]||0),Y=(K,le)=>String(K.dataset[le]||"").toLowerCase();z.sort((K,le)=>{if(G==="name"){let ne=Y(K,"name"),pe=Y(le,"name");return ne<pe?-1*U:ne>pe?1*U:0}return G==="created"?(J(K,"created")-J(le,"created"))*U:G==="warnings"?(J(K,"warnings")-J(le,"warnings"))*U:G==="weekly"?(J(K,"weekly")-J(le,"weekly"))*U:(J(K,"rev")-J(le,"rev"))*U});for(let K of z)I.appendChild(K)},ce=()=>{let z=(_?.value||"").toLowerCase(),G=A?.value||localStorage.getItem("emp_filter_status")||"all",Q=H?.value||localStorage.getItem("emp_filter_role")||"all",U=q?.value||localStorage.getItem("emp_filter_flag")||"all",J=re();for(let Y of J){let K=(Y.dataset.name||"").toLowerCase(),le=!z||K.includes(z),ne=G==="all"?!0:Y.dataset.presence===G,pe=Q==="all"?!0:Y.dataset.role===Q,we=U==="all"?!0:U==="inactive"?Y.dataset.inactive==="1":U==="locked"?Y.dataset.locked==="1":U==="warnings"?Number(Y.dataset.warnings||0)>0:!0;Y.style.display=le&&ne&&pe&&we?"flex":"none"}ue()};if(_){_.addEventListener("input",z=>{localStorage.setItem("emp_search",z.target.value||""),ce()});try{let z=localStorage.getItem("emp_search")||"";z&&(_.value=z)}catch{}ce()}if(A)try{let z=localStorage.getItem("emp_filter_status")||"all";A.value=z;let G=()=>{let U=A.value;document.querySelectorAll("#emp-status-tabs button").forEach(Y=>{let K=Y.dataset.val===U;Y.className=K?"px-3 py-1.5 rounded-md text-xs font-bold transition-all bg-blue-600 text-white shadow-lg shadow-blue-900/20 whitespace-nowrap":"px-3 py-1.5 rounded-md text-xs font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-700/50 whitespace-nowrap"})};G();let Q=document.getElementById("emp-status-tabs");Q&&Q.addEventListener("click",U=>{if(U.target.tagName==="BUTTON"){let J=U.target.dataset.val;A.value=J,localStorage.setItem("emp_filter_status",J),G(),ce()}})}catch{}if(H){try{H.value=localStorage.getItem("emp_filter_role")||"all"}catch{}H.onchange=()=>{localStorage.setItem("emp_filter_role",H.value),ce()}}if(q){try{q.value=localStorage.getItem("emp_filter_flag")||"all"}catch{}q.onchange=()=>{localStorage.setItem("emp_filter_flag",q.value),ce()}}if(M){try{M.value=localStorage.getItem("emp_sort_by")||"rev"}catch{}M.onchange=()=>{localStorage.setItem("emp_sort_by",M.value),fe()}}if(V){let z=()=>{let G=V.dataset.dir||"desc";V.textContent=G==="asc"?"Asc":"Desc"};try{V.dataset.dir=localStorage.getItem("emp_sort_dir")||"desc"}catch{}z(),V.onclick=()=>{let G=(V.dataset.dir||"desc")==="asc"?"desc":"asc";V.dataset.dir=G,localStorage.setItem("emp_sort_dir",G),z(),fe()}}W&&(W.onclick=()=>{try{localStorage.removeItem("emp_search"),localStorage.removeItem("emp_filter_status"),localStorage.removeItem("emp_filter_role"),localStorage.removeItem("emp_filter_flag"),localStorage.removeItem("emp_sort_by"),localStorage.removeItem("emp_sort_dir")}catch{}if(_&&(_.value=""),A&&(A.value="all"),H&&(H.value="all"),q&&(q.value="all"),M&&(M.value="rev"),V&&(V.dataset.dir="desc"),N&&$){w=new Date(c),m=new Date(g),N.value=L(w),$.value=L(m);let z=document.getElementById("employees-grid");z&&(z.innerHTML=P(e),window.lucide&&lucide.createIcons(),ee(),de(),ue())}fe(),ce()});let ge=document.getElementById("emp-refresh-btn");if(ge&&(ge.onclick=async()=>{ge.classList.add("animate-spin");try{let[z,G,Q]=await Promise.all([u.fetchEmployees(),u.fetchSales(),u.fetchTimeEntries()]);e=z,n=G,v=Q;let U=document.getElementById("employees-grid");U&&(U.innerHTML=P(e),window.lucide&&lucide.createIcons(),fe(),ce(),ue(),ee(),de()),S.show("Liste actualis\xE9e")}catch(z){console.error(z),S.show("Erreur lors de l'actualisation","error")}finally{ge.classList.remove("animate-spin")}}),(async()=>{try{await u.fetchTimeEntries();let z=u._timeEntries||[];document.querySelectorAll(".employee-card").forEach(G=>{let Q=G.dataset.id,U=G.querySelector(".js-status"),J=G.querySelector(".js-badges");if(!Q||!U||!J)return;let Y=z.find(be=>be.employee_id===Q&&!be.clock_out),K=!!Y,le=!!(Y&&Y.paused);G.dataset.presence=K?le?"paused":"active":"absent";let ne="Absent",pe="bg-slate-600",we="text-slate-500",ke="slash",Le="";K&&le?(ne="En pause",pe="bg-yellow-400",we="text-yellow-400",ke="pause-circle",Y.pause_started&&(Le=`depuis ${new Date(Y.pause_started).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`)):K&&(ne="En service",pe="bg-green-500",we="text-green-400",ke="play-circle",Le=`depuis ${new Date(Y.clock_in).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`),U.innerHTML=`
                        <span class="w-2 h-2 rounded-full ${pe}"></span>
                        <span class="${we} font-medium flex items-center gap-1">
                            <i data-lucide="${ke}" class="w-3 h-3"></i>
                            ${ne} ${Le?`<span class="text-slate-400 font-normal ml-1">${Le}</span>`:""}
                        </span>
                    `;let Fe=new Date,Se="";if(K&&!le){let Ee=u.getSales().filter(Oe=>Oe.employeeId===Q).filter(Oe=>new Date(Oe.date)>=new Date(Y.clock_in)).sort((Oe,Ut)=>new Date(Ut.date)-new Date(Oe.date))[0],Ae=new Date(Y.clock_in);Ee&&(Ae=new Date(Ee.date));let Ot=Fe-Ae,Ht=parseInt(localStorage.getItem("inactivity_threshold_hours")||"2",10);Ot>=Ht*36e5&&!le&&(Se='<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-900/20 text-orange-300 border border-orange-700/40 js-inactive"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Inactif</span>')}G.dataset.inactive=Se?"1":"0";let Ke=Array.from(J.children).filter(be=>!be.classList.contains("js-inactive"));J.innerHTML=`${Se}${Ke.map(be=>be.outerHTML).join("")}`}),window.lucide&&lucide.createIcons(),ce()}catch{}})(),fe(),ue(),s){let z=(Q,U,J)=>{let Y=document.querySelector(`.js-lock-emp[data-id="${Q}"]`);if(!Y)return;let K=J&&typeof J=="object"?u.formatLockMeta(J):null;Y.setAttribute("data-locked",U?"1":"0"),Y.setAttribute("title",U?K?K.title:"Compte bloqu\xE9":"Bloquer le compte"),Y.classList.toggle("text-red-400",U),Y.classList.toggle("hover:text-red-300",U),Y.classList.toggle("text-slate-400",!U),Y.classList.toggle("hover:text-white",!U);let le=Y.querySelector("i");le&&le.setAttribute("data-lucide",U?"lock":"unlock");let ne=document.querySelector(`.js-lock-banner[data-id="${Q}"]`);if(ne)if(U){let we=K&&K.reason?`<p class="text-xs text-red-300 truncate">${K.reason}</p>`:"",ke=K&&K.period?`<p class="text-[10px] text-red-300/70 mt-0.5">${K.period}</p>`:"";ne.innerHTML=`
                            <div class="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                                <i data-lucide="lock" class="w-3 h-3 text-red-400 mt-0.5 shrink-0"></i>
                                <div class="min-w-0">
                                    <p class="text-[10px] font-bold text-red-400 uppercase">Bloqu\xE9</p>
                                    ${we}
                                    ${ke}
                                </div>
                            </div>
                        `}else ne.innerHTML="";let pe=document.querySelector(`.employee-card[data-id="${Q}"]`);pe&&(pe.dataset.locked=U?"1":"0"),window.lucide&&lucide.createIcons(),ue(),ce()};ee=()=>{},de=()=>{document.querySelectorAll(".js-lock-emp").forEach(Q=>{Q.addEventListener("click",async U=>{U.preventDefault(),U.stopPropagation();let J=Q.getAttribute("data-id");if(!J)return;if(l&&String(J)===String(o)){S.show("Tu ne peux pas modifier ton propre blocage.","error");return}let K=!(Q.getAttribute("data-locked")==="1");try{if(K){let le=(()=>{let ne=u.getEmployees().find(pe=>String(pe.id)===String(J));return ne?`${ne.first_name} ${ne.last_name}`:"cet employ\xE9"})();se.show({title:"Bloquer un compte employ\xE9",type:"danger",confirmText:"Bloquer",cancelText:"Annuler",message:`
                                        <div class="space-y-4">
                                            <div class="text-slate-300">Tu vas bloquer <span class="font-bold text-white">${le}</span>. Aucun acc\xE8s ne sera possible pendant la p\xE9riode.</div>
                                            <div>
                                                <label class="block text-sm font-medium text-slate-300 mb-1">Motif (obligatoire)</label>
                                                <input id="lock-reason" type="text" autocomplete="off" placeholder="Ex: Suspension disciplinaire" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-red-500 focus:ring-red-500 p-3" />
                                            </div>
                                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label class="block text-sm font-medium text-slate-300 mb-1">D\xE9but (obligatoire)</label>
                                                    <input id="lock-start" type="date" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-red-500 focus:ring-red-500 p-3" />
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-slate-300 mb-1">Fin (obligatoire)</label>
                                                    <input id="lock-end" type="date" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-red-500 focus:ring-red-500 p-3" />
                                                </div>
                                            </div>
                                        </div>
                                    `,onConfirm:async()=>{let ne=(document.getElementById("lock-reason")?.value||"").trim(),pe=document.getElementById("lock-start")?.value||"",we=document.getElementById("lock-end")?.value||"";if(ne.length<3)throw new Error("Motif trop court.");if(!pe||!we)throw new Error("Dates de d\xE9but et de fin obligatoires.");if(String(we)<String(pe))throw new Error("La date de fin doit \xEAtre apr\xE8s la date de d\xE9but.");let ke={reason:ne,start:pe,end:we};await u.setEmployeeAccountLock(J,ke),z(J,!0,ke),S.show("Compte bloqu\xE9.","success")}}),setTimeout(()=>{let ne=document.getElementById("lock-start"),pe=document.getElementById("lock-end");if(ne&&!ne.value){let we=new Date,ke=we.getFullYear(),Le=String(we.getMonth()+1).padStart(2,"0"),Fe=String(we.getDate()).padStart(2,"0");ne.value=`${ke}-${Le}-${Fe}`}pe&&!pe.value&&ne&&ne.value&&(pe.value=ne.value)},0)}else await u.clearEmployeeAccountLock(J),z(J,!1,null),S.show("Compte d\xE9bloqu\xE9.","success")}catch(le){console.error(le),S.show(le&&le.message?le.message:"Impossible de modifier le blocage.","error")}})})},ee(),de(),(()=>{document.querySelectorAll(".js-reset-contract").forEach(Q=>{Q.addEventListener("click",async U=>{U.preventDefault(),U.stopPropagation();let J=Q.getAttribute("data-id");if(!J)return;let Y=(()=>{let K=u.getEmployees().find(le=>String(le.id)===String(J));return K?`${K.first_name} ${K.last_name}`:"cet employ\xE9"})();se.show({title:"Supprimer et Renvoyer le contrat",type:"danger",confirmText:"Supprimer et Renvoyer",cancelText:"Annuler",message:`
                                <div class="space-y-4">
                                    <div class="text-slate-300">
                                        Voulez-vous vraiment supprimer le contrat de <span class="font-bold text-white">${Y}</span> ?
                                    </div>
                                    <p class="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                                        L'ancien contrat sera d\xE9finitivement supprim\xE9. L'employ\xE9 devra signer un nouveau contrat lors de sa prochaine connexion.
                                    </p>
                                </div>
                            `,onConfirm:async()=>{try{await u.resetEmploymentContract(J),i&&i[J]&&delete i[J],S.show("Contrat supprim\xE9. Une nouvelle signature sera demand\xE9e.","success"),ge?ge.click():ce()}catch(K){console.error(K),S.show("Erreur lors de la r\xE9initialisation du contrat","error")}}})})})})()}r&&document.querySelectorAll(".js-delete-emp").forEach(G=>{G.addEventListener("click",async Q=>{Q.preventDefault(),Q.stopPropagation();let U=G.getAttribute("data-id");if(!U)return;if(o&&String(U)===String(o)){S.show("Impossible de supprimer ta propre fiche.","error");return}let J=u.getEmployees().find(le=>String(le.id)===String(U))||null,Y=J?`${J.first_name} ${J.last_name}`:"cet employ\xE9";if(J&&String(J.role||"")==="patron"){S.show("Impossible de supprimer la fiche Patron.","error");return}se.show({title:"Supprimer la fiche employ\xE9 ?",type:"danger",confirmText:"Supprimer",cancelText:"Annuler",message:`
                                <div class="space-y-3">
                                    <div class="text-slate-300 text-sm">Tu es sur le point de supprimer d\xE9finitivement <span class="font-bold text-white">${Y}</span>.</div>
                                    <div class="text-xs text-slate-500">Cette action est irr\xE9versible.</div>
                                </div>
                            `,onConfirm:async()=>{await u.deleteEmployee(U);let le=document.querySelector(`.employee-card[data-id="${U}"]`);le&&le.remove(),ue(),ce(),S.show("Fiche supprim\xE9e.","success")}})})});let me=document.getElementById("btn-block-all");me&&me.addEventListener("click",()=>{let G=u.getEmployees().filter(U=>U.role!=="patron"),Q=G.length;se.show({title:"Verrouillage Global",message:`
                        <div class="space-y-4">
                            <p class="text-slate-300">Vous \xEAtes sur le point de bloquer l'acc\xE8s \xE0 <span class="font-bold text-white">${Q} employ\xE9s</span> (tous sauf Patron).</p>
                            
                            <div class="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Motif du blocage</label>
                                <input type="text" id="mass-lock-reason" value="Fermeture Administrative" class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:border-red-500 outline-none">
                            </div>

                            <div class="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex gap-3 items-start">
                                <i data-lucide="alert-triangle" class="w-5 h-5 text-red-400 shrink-0"></i>
                                <div>
                                    <p class="text-xs text-red-300 font-bold uppercase mb-0.5">Action Imm\xE9diate</p>
                                    <p class="text-xs text-red-200/80">Les employ\xE9s seront d\xE9connect\xE9s et ne pourront plus acc\xE9der \xE0 l'application.</p>
                                </div>
                            </div>
                        </div>
                    `,type:"danger",confirmText:"Tout Bloquer",cancelText:"Annuler",onConfirm:async()=>{let U=document.getElementById("mass-lock-reason")?.value||"Fermeture Administrative",J=new Date().toISOString().split("T")[0],Y=new Date;Y.setFullYear(Y.getFullYear()+1);let K=Y.toISOString().split("T")[0],le={reason:U,start:J,end:K};try{me.disabled=!0;let ne=me.innerHTML;me.innerHTML='<span class="inline-block animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full"></span>';let pe=G.map(we=>u.setEmployeeAccountLock(we.id,le));await Promise.all(pe),S.show(`${Q} comptes bloqu\xE9s avec succ\xE8s.`,"success"),me.innerHTML=ne,me.disabled=!1,ge?ge.click():window.location.reload()}catch(ne){console.error(ne),S.show("Erreur lors du blocage global","error"),me.disabled=!1,me.innerHTML='<i data-lucide="lock" class="w-4 h-4"></i><span class="hidden md:inline">Tout Bloquer</span>',window.lucide&&lucide.createIcons()}}})});let te=document.getElementById("btn-unlock-all");te&&te.addEventListener("click",()=>{let G=u.getEmployees().filter(U=>U.role!=="patron"),Q=G.length;se.show({title:"D\xE9verrouillage Global",message:`
                        <div class="space-y-4">
                            <p class="text-slate-300">Vous \xEAtes sur le point de d\xE9bloquer l'acc\xE8s \xE0 <span class="font-bold text-white">${Q} employ\xE9s</span> (tous sauf Patron).</p>
                            
                            <div class="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex gap-3 items-start">
                                <i data-lucide="unlock" class="w-5 h-5 text-green-400 shrink-0"></i>
                                <div>
                                    <p class="text-xs text-green-300 font-bold uppercase mb-0.5">R\xE9tablissement d'acc\xE8s</p>
                                    <p class="text-xs text-green-200/80">Les employ\xE9s pourront \xE0 nouveau se connecter \xE0 l'application.</p>
                                </div>
                            </div>
                        </div>
                    `,type:"success",confirmText:"Tout D\xE9bloquer",cancelText:"Annuler",onConfirm:async()=>{try{te.disabled=!0;let U=te.innerHTML;te.innerHTML='<span class="inline-block animate-spin h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full"></span>';let J=G.map(Y=>u.clearEmployeeAccountLock(Y.id));await Promise.all(J),S.show(`${Q} comptes d\xE9bloqu\xE9s avec succ\xE8s.`,"success"),te.innerHTML=U,te.disabled=!1,ge?ge.click():window.location.reload()}catch(U){console.error(U),S.show("Erreur lors du d\xE9blocage global","error"),te.disabled=!1,te.innerHTML='<i data-lucide="unlock" class="w-4 h-4"></i><span class="hidden md:inline">Tout D\xE9bloquer</span>',window.lucide&&lucide.createIcons()}}})});let oe=document.getElementById("btn-reset-contracts");oe&&oe.addEventListener("click",()=>{let G=u.getEmployees(),Q=G.map(U=>`
                    <label class="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 cursor-pointer transition-colors group">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" name="reset_target" value="${U.id}" class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/20">
                            <div>
                                <div class="text-sm font-bold text-white">${U.first_name} ${U.last_name}</div>
                                <div class="text-xs text-slate-500">${U.role}</div>
                            </div>
                        </div>
                        ${i[U.id]?'<span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">D\xE9j\xE0 sign\xE9</span>':'<span class="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded">Pas de contrat</span>'}
                    </label>
                `).join("");se.show({title:"Renvoyer les contrats",width:"max-w-2xl",message:`
                        <div class="space-y-4">
                            <p class="text-slate-300">S\xE9lectionnez les employ\xE9s qui devront <strong>resigner leur contrat</strong> \xE0 leur prochaine connexion.</p>
                            
                            <div class="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-700">
                                <span>${G.length} employ\xE9s \xE9ligibles</span>
                                <button type="button" id="select-all-reset" class="text-blue-400 hover:text-blue-300">Tout s\xE9lectionner</button>
                            </div>

                            <div class="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                ${Q}
                            </div>

                            <div class="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex gap-3 items-start">
                                <i data-lucide="info" class="w-5 h-5 text-blue-400 shrink-0 mt-0.5"></i>
                                <div>
                                    <p class="text-xs text-blue-300 font-bold uppercase mb-0.5">Note</p>
                                    <p class="text-xs text-blue-200/80">Cette action supprimera l'ancien contrat (s'il existe) et forcera l'affichage de la page de signature \xE0 la prochaine connexion.</p>
                                </div>
                            </div>
                        </div>
                    `,confirmText:"Envoyer les contrats",type:"info",onConfirm:async()=>{let U=document.querySelectorAll('input[name="reset_target"]:checked'),J=Array.from(U).map(Y=>Y.value);if(J.length===0){S.show("Aucun employ\xE9 s\xE9lectionn\xE9","warning");return}try{oe.disabled=!0,oe.innerHTML='<span class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>';let Y=J.map(K=>u.resetEmploymentContract(K));await Promise.all(Y),J.forEach(K=>{i[K]&&delete i[K]}),S.show(`${J.length} contrats r\xE9initialis\xE9s avec succ\xE8s.`,"success"),ge?ge.click():ce()}catch(Y){console.error(Y),S.show("Erreur lors de l'envoi des contrats","error")}finally{oe.disabled=!1,oe.innerHTML='<i data-lucide="file-signature" class="w-4 h-4"></i><span>Renvoyer les contrats</span>',window.lucide&&lucide.createIcons()}}}),setTimeout(()=>{let U=document.getElementById("select-all-reset");U&&U.addEventListener("click",()=>{let J=document.querySelectorAll('input[name="reset_target"]'),Y=Array.from(J).every(K=>K.checked);J.forEach(K=>K.checked=!Y),U.textContent=Y?"Tout s\xE9lectionner":"Tout d\xE9s\xE9lectionner"})},100)});let xe=document.getElementById("btn-sync-activity");xe&&xe.addEventListener("click",async()=>{try{xe.disabled=!0;let z=xe.innerHTML;xe.innerHTML='<span class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>';let G=await u.syncLastLoginWithActivity();S.show(`${G} fiches mises \xE0 jour avec la derni\xE8re activit\xE9.`,"success"),ge?ge.click():window.location.reload()}catch(z){console.error(z),S.show("Erreur lors de la synchronisation","error")}finally{xe.disabled=!1,xe.innerHTML='<i data-lucide="activity" class="w-4 h-4"></i><span class="hidden md:inline">Sync. Activit\xE9</span>',window.lucide&&lucide.createIcons()}})},100);let{start:c,end:g}=je(),w=new Date(c),m=new Date(g),d=u.getDateFilter();d?(w=d.start,m=d.end):u.setDateFilter(w,m);let n=u.getSales(),v=u.getTimeEntries(),f=_=>n.filter(I=>{let A=new Date(I.date);return w&&m?I.employeeId===_&&A>=w&&A<=m:I.employeeId===_}).reduce((I,A)=>I+(Number(A.price)-Number(A.cost||0)),0),y=_=>v.filter(A=>{let H=new Date(A.clock_in);return w&&m?A.employee_id===_&&A.clock_out&&H>=w&&H<=m:A.employee_id===_&&A.clock_out}).reduce((A,H)=>{let q=Number(H.pause_total_ms||0),M=Math.max(0,new Date(H.clock_out)-new Date(H.clock_in)-q);return A+M},0)/36e5,h=_=>{let I=_.warnings||[];return Array.isArray(I)?I.length:0},b=(()=>{try{return localStorage.getItem("emp_sort_by")||"rev"}catch{return"rev"}})(),k=(()=>{try{return localStorage.getItem("emp_sort_dir")||"desc"}catch{return"desc"}})()==="asc"?1:-1,x={mecano_confirme:20,mecano_junior:20,chef_atelier:20,patron:60,co_patron:60};try{let _=localStorage.getItem("db_payroll_settings");if(_){let I=JSON.parse(_);I&&I.role_primes&&typeof I.role_primes=="object"?x=I.role_primes:I&&I.grade_rates&&typeof I.grade_rates=="object"&&(Object.values(I.grade_rates||{}).some(H=>Number(H)>100)||(x=I.grade_rates))}}catch{}(!x||typeof x!="object")&&(x={mecano_confirme:20,mecano_junior:20,chef_atelier:20,patron:60,co_patron:60});try{let _=localStorage.getItem("db_payroll_role_primes");_&&(x=JSON.parse(_))}catch{}try{Object.values(x||{}).some(I=>Number(I)>100)&&(x={mecano_confirme:20,mecano_junior:20,chef_atelier:20,patron:60,co_patron:60})}catch{}let E=_=>{let A=Number(x&&x[_==="mecano"?"mecano_confirme":_]);return isFinite(A)&&A>=0?Math.max(0,Math.min(100,Math.round(A))):20},T=(_,I)=>{let A=n.filter(he=>{let me=new Date(he.date);return w&&m?he.employeeId===_.id&&me>=w&&me<=m:he.employeeId===_.id}),H=A.reduce((he,me)=>he+(Number(me.price)-Number(me.cost||0)),0),q=A.reduce((he,me)=>he+(Number(me.price)-Number(me.cost||0)),0),M=E(_.role),V=q*(M/100),W=v.find(he=>he.employee_id===_.id&&!he.clock_out),N=!!W,$=!!(W&&W.paused),L='<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400"><span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Absent</span>';N&&$?L='<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> En pause</span>':N&&(L='<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> En service</span>');let j=y(_.id),F=h(_),X="";F>0&&(X=`<span class="text-yellow-500 text-[10px] font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3"></i> ${F} Avertissement${F>1?"s":""}</span>`);let O=[];I.includes(_.id)&&O.push('<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"><i data-lucide="trophy" class="w-3 h-3"></i> Top vendeur</span>'),F===0&&O.push('<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><i data-lucide="clock" class="w-3 h-3"></i> Ponctuel</span>'),i[_.id]?O.push(`<button type="button" class="js-view-contract inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors" data-id="${_.id}" title="Cliquez pour voir le contrat"><i data-lucide="file-check" class="w-3 h-3"></i> Contrat OK</button>`):O.push('<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20"><i data-lucide="file-warning" class="w-3 h-3"></i> Contrat manquant</span>');let ee=_.account_lock||null,de=u._isLockActive(ee),re=de?u.formatLockMeta(ee):null,ue=!!o&&String(_.id)===String(o),fe=String(_.role||"")==="patron",ce="";de&&(ce=`
                <div class="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <i data-lucide="lock" class="w-3 h-3 text-red-400 mt-0.5 shrink-0"></i>
                    <div class="min-w-0">
                        <p class="text-[10px] font-bold text-red-400 uppercase">Bloqu\xE9</p>
                        ${re&&re.reason?`<p class="text-xs text-red-300 truncate">${re.reason}</p>`:""}
                        ${re&&re.period?`<p class="text-[10px] text-red-300/70 mt-0.5">${re.period}</p>`:""}
                    </div>
                </div>
            `);let ge=`<div class="js-lock-banner" data-id="${_.id}">${ce}</div>`;return`
        <div class="employee-card group relative bg-slate-900/50 rounded-xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/20 animate-fade-in" 
            data-name="${_.first_name} ${_.last_name}" 
            data-id="${_.id}" 
            data-role="${_.role||""}" 
            data-presence="${N?$?"paused":"active":"absent"}" 
            data-inactive="0" 
            data-locked="${de?"1":"0"}" 
            data-rev="${Number(H)||0}" 
            data-weekly="${Number(j)||0}" 
            data-warnings="${Number(F)||0}" 
            data-created="${_.created_at?new Date(_.created_at).getTime():0}">
            
            <!-- Top Actions -->
            <div class="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-auto md:pointer-events-none md:group-hover:pointer-events-auto">
                ${a?`
                <button onclick="window.location.hash = '#admin-sales?employee=${_.id}'" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors" title="Voir l'historique">
                    <i data-lucide="history" class="w-3.5 h-3.5"></i>
                </button>
                `:""}
                ${s?`
                <button type="button" class="js-lock-emp p-1.5 rounded-lg bg-slate-800 ${de?"text-red-400 hover:text-red-300":"text-slate-400 hover:text-white"} hover:bg-slate-700 border border-slate-700 transition-colors" data-id="${_.id}" data-locked="${de?"1":"0"}" title="${de?re?re.title:"Compte bloqu\xE9":"Bloquer le compte"}" ${l&&String(_.id)===String(o)?"disabled":""}>
                    <i data-lucide="${de?"lock":"unlock"}" class="w-3.5 h-3.5"></i>
                </button>
                `:""}

                ${t?.role==="patron"||t?.role==="co_patron"||t?.role==="responsable"?`
                <button type="button" class="js-reset-contract p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-orange-400 hover:bg-slate-700 border border-slate-700 transition-colors" data-id="${_.id}" title="Supprimer et Renvoyer le contrat">
                    <i data-lucide="file-x" class="w-3.5 h-3.5"></i>
                </button>
                `:""}

                <button onclick="window.location.hash = '#employees/edit/${_.id}'" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                </button>
            </div>

            <!-- User Info -->
            <div class="flex items-start gap-4 mb-4">
                <div class="relative w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-400 border border-slate-700 shrink-0">
                    ${_.photo?`<img src="${_.photo}" class="w-full h-full object-cover rounded-xl" />`:'<i data-lucide="user" class="w-6 h-6"></i>'}
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="text-base font-bold text-white truncate leading-tight">
                            ${_.first_name} ${_.last_name}
                        </h3>
                        ${X}
                    </div>
                    <p class="text-xs text-slate-500 mb-1.5">
                        ${_.role==="patron"?"Patron":_.role==="co_patron"?"Co-Patron":_.role==="responsable"?"Responsable":_.role==="chef_atelier"?"Chef d'Atelier":_.role==="mecano_confirme"?"M\xE9cano Confirm\xE9":_.role==="mecano_junior"?"M\xE9cano Junior":_.role==="mecano_test"?"M\xE9cano Test":"Employ\xE9"}
                    </p>
                    <div class="flex items-center gap-2 flex-wrap">
                        <div class="js-status">${L}</div>
                        <span class="text-[10px] text-slate-600 flex items-center gap-1">
                            <i data-lucide="calendar" class="w-3 h-3"></i>
                            Arriv\xE9 le ${_.created_at?new Date(_.created_at).toLocaleDateString("fr-FR"):"--"}
                        </span>
                        ${(()=>{if(!_.last_login)return'<span class="text-[10px] text-slate-500 flex items-center gap-1 italic"><i data-lucide="help-circle" class="w-3 h-3"></i> Jamais connect\xE9</span>';let he=new Date(_.last_login),te=(new Date-he)/(1e3*60*60*24),oe="text-slate-500";return te>30?oe="text-red-400 font-bold":te>7&&(oe="text-orange-400"),`<span class="text-[10px] ${oe} flex items-center gap-1" title="Derni\xE8re connexion"><i data-lucide="log-in" class="w-3 h-3"></i> Vu le ${he.toLocaleDateString("fr-FR")} \xE0 ${he.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>`})()}
                    </div>
                    ${O.length>0?`<div class="flex flex-wrap gap-1.5 mt-2">${O.join("")}</div>`:""}
                </div>
            </div>

            <!-- Blocked Banner -->
            ${ge}

            <!-- Stats Footer -->
            <div class="mt-auto pt-4 border-t border-slate-800/50">
                <div>
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Total G\xE9n\xE9r\xE9 (P\xE9riode)</p>
                    <p class="text-xl font-bold text-white tracking-tight">${B(H)}</p>
                </div>
                <div class="mt-1">
                    <p class="text-xs font-medium text-orange-500/90 flex items-center gap-1.5">
                        <i data-lucide="flame" class="w-3 h-3"></i>
                        Prime (${M}%): <span class="text-orange-400">${B(V)}</span>
                    </p>
                </div>

            </div>
        </div>
        `},P=_=>{if(_.length===0)return`
                <div class="col-span-full py-12 text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                        <i data-lucide="search-x" class="w-8 h-8 text-slate-600"></i>
                    </div>
                    <p class="text-slate-400 font-medium">Aucun employ\xE9 trouv\xE9</p>
                </div>
            `;let I=[..._].sort((A,H)=>f(H.id)-f(A.id)).slice(0,3).map(A=>A.id);return _.map(A=>T(A,I)).join("")},C=[...e].sort((_,I)=>{if(b==="name"){let A=`${_.first_name||""} ${_.last_name||""}`.trim().toLowerCase(),H=`${I.first_name||""} ${I.last_name||""}`.trim().toLowerCase();return A<H?-1*k:A>H?1*k:0}if(b==="created"){let A=_.created_at?new Date(_.created_at).getTime():0,H=I.created_at?new Date(I.created_at).getTime():0;return(A-H)*k}return b==="warnings"?(h(_)-h(I))*k:b==="weekly"?(y(_.id)-y(I.id))*k:(f(_.id)-f(I.id))*k}),R=[...e].sort((_,I)=>f(I.id)-f(_.id)).slice(0,3).map(_=>_.id);return`
        <div class="space-y-8 animate-fade-in">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 class="text-3xl font-bold text-white">Gestion des Employ\xE9s</h2>
                    <p class="text-slate-400 mt-1">G\xE9rez l'\xE9quipe et consultez les performances individuelles</p>
                </div>
                <div class="flex gap-3">
                    ${t?.role==="patron"?`
                    <button id="btn-block-all" class="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95">
                        <i data-lucide="lock" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Tout Bloquer</span>
                    </button>
                    <button id="btn-unlock-all" class="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95">
                        <i data-lucide="unlock" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Tout D\xE9bloquer</span>
                    </button>
                    `:""}
                    <button onclick="window.location.hash = '#employees/new'" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                        <i data-lucide="user-plus" class="w-4 h-4"></i>
                        <span>Ajouter un Employ\xE9</span>
                    </button>
                    ${t?.role==="patron"||t?.role==="co_patron"||t?.role==="responsable"?`
                    <button id="btn-reset-contracts" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                        <i data-lucide="file-signature" class="w-4 h-4"></i>
                        <span>Renvoyer les contrats</span>
                    </button>
                    <button id="btn-sync-activity" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all active:scale-95" title="Synchroniser la derni\xE8re connexion avec la fin de service">
                        <i data-lucide="activity" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Sync. Activit\xE9</span>
                    </button>
                    `:""}
                </div>
            </div>

            <!-- Stats Dashboard -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">\xC9quipe</p>
                        <div class="p-1.5 bg-slate-800 text-slate-400 rounded-lg group-hover:text-white transition-colors">
                            <i data-lucide="users" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-white" id="emp-kpi-total">${e.length}</h3>
                </div>
                
                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">En service</p>
                        <div class="p-1.5 bg-green-500/10 text-green-500 rounded-lg group-hover:bg-green-500/20 transition-colors">
                            <i data-lucide="play-circle" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-green-400" id="emp-kpi-active">0</h3>
                </div>

                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">En pause</p>
                        <div class="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                            <i data-lucide="pause-circle" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-yellow-400" id="emp-kpi-paused">0</h3>
                </div>

                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inactifs</p>
                        <div class="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-orange-400" id="emp-kpi-inactive">0</h3>
                </div>

                <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bloqu\xE9s</p>
                        <div class="p-1.5 bg-red-500/10 text-red-500 rounded-lg group-hover:bg-red-500/20 transition-colors">
                            <i data-lucide="lock" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-red-400" id="emp-kpi-locked">0</h3>
                </div>
            </div>

            <!-- Filters Bar -->
            <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-2 flex flex-col md:flex-row gap-2">
                <div class="relative flex-1">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"></i>
                    <input type="text" id="search-employee" autocomplete="off" placeholder="Rechercher un employ\xE9..." class="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                </div>
                
                <div class="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <input type="date" id="emp-filter-date-start" class="bg-transparent border-none text-white text-xs w-28 focus:ring-0 px-1" title="Date de d\xE9but">
                    <span class="text-slate-500">-</span>
                    <input type="date" id="emp-filter-date-end" class="bg-transparent border-none text-white text-xs w-28 focus:ring-0 px-1" title="Date de fin">
                </div>

                <input type="hidden" id="emp-filter-status" value="all">
                <div class="flex bg-slate-800 rounded-lg p-1 border border-slate-700 overflow-x-auto" id="emp-status-tabs">
                    <button type="button" data-val="all" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">Tous</button>
                    <button type="button" data-val="active" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">En service</button>
                    <button type="button" data-val="paused" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">En pause</button>
                    <button type="button" data-val="absent" class="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap">Absent</button>
                </div>

                <select id="emp-filter-role" class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-blue-500">
                    <option value="all">Tous r\xF4les</option>
                    <option value="patron">Patron</option>
                    <option value="co_patron">Co-Patron</option>
                    <option value="responsable">Responsable</option>
                    <option value="chef_atelier">Chef d'Atelier</option>
                    <option value="mecano_confirme">M\xE9cano Confirm\xE9</option>
                    <option value="mecano_junior">M\xE9cano Junior</option>
                    <option value="mecano_test">M\xE9cano Test</option>
                </select>

                <select id="emp-filter-flag" class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-blue-500">
                    <option value="all">Tous</option>
                    <option value="inactive">Inactifs</option>
                    <option value="locked">Bloqu\xE9s</option>
                    <option value="warnings">Avertissements</option>
                </select>

                <div class="h-8 w-px bg-slate-700 mx-1 self-center hidden md:block"></div>

                <div class="flex gap-2">
                    <select id="emp-sort-by" class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-blue-500">
                        <option value="rev">Tri: CA</option>
                        <option value="name">Tri: Nom</option>
                        <option value="weekly">Tri: Heures</option>
                        <option value="warnings">Tri: Avertissements</option>
                        <option value="created">Tri: Anciennet\xE9</option>
                    </select>
                    <button id="emp-sort-dir" type="button" class="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors">Desc</button>
                    <button id="emp-refresh-btn" type="button" class="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Actualiser la liste">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                    </button>
                    <button id="emp-filters-reset" type="button" class="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="R\xE9initialiser les filtres">
                        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <!-- Grid Cards -->
            <div id="employees-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${C.length===0?`
                    <div class="col-span-full py-12 text-center">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                            <i data-lucide="search-x" class="w-8 h-8 text-slate-600"></i>
                        </div>
                        <p class="text-slate-400 font-medium">Aucun employ\xE9 trouv\xE9</p>
                    </div>
                `:C.map(_=>{let I=n.filter(re=>{let ue=new Date(re.date);return re.employeeId===_.id&&ue>=w&&ue<=m}),A=I.reduce((re,ue)=>re+(Number(ue.price)-Number(ue.cost||0)),0),H=I.reduce((re,ue)=>re+(Number(ue.price)-Number(ue.cost||0)),0),q=E(_.role),M=H*(q/100),V=v.find(re=>re.employee_id===_.id&&!re.clock_out),W=!!V,N=!!(V&&V.paused),$='<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400"><span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Absent</span>';W&&N?$='<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> En pause</span>':W&&($='<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-400"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> En service</span>');let L=y(_.id),j=h(_),F="";j>0&&(F=`<span class="text-yellow-500 text-[10px] font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3"></i> ${j} Avertissement${j>1?"s":""}</span>`);let X=[];R.includes(_.id)&&X.push('<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"><i data-lucide="trophy" class="w-3 h-3"></i> Top vendeur</span>'),j===0&&X.push('<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><i data-lucide="clock" class="w-3 h-3"></i> Ponctuel</span>');let O=_.account_lock||null,Z=u._isLockActive(O),ee=Z?u.formatLockMeta(O):null,de="";return Z&&(de=`
                            <div class="mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                                <i data-lucide="lock" class="w-3 h-3 text-red-400 mt-0.5 shrink-0"></i>
                                <div class="min-w-0">
                                    <p class="text-[10px] font-bold text-red-400 uppercase">Bloqu\xE9</p>
                                    ${ee&&ee.reason?`<p class="text-xs text-red-300 truncate">${ee.reason}</p>`:""}
                                    ${ee&&ee.period?`<p class="text-[10px] text-red-300/70 mt-0.5">${ee.period}</p>`:""}
                                </div>
                            </div>
                        `),`
                    <div class="employee-card group relative bg-slate-900/50 rounded-xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/20" 
                        data-name="${_.first_name} ${_.last_name}" 
                        data-id="${_.id}" 
                        data-role="${_.role||""}" 
                        data-presence="${W?N?"paused":"active":"absent"}" 
                        data-inactive="0" 
                        data-locked="${Z?"1":"0"}" 
                        data-rev="${Number(A)||0}" 
                        data-weekly="${Number(L)||0}" 
                        data-warnings="${Number(j)||0}" 
                        data-created="${_.created_at?new Date(_.created_at).getTime():0}">
                        
                        <!-- Top Actions -->
                        <div class="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                            ${a?`
                            <button onclick="window.location.hash = '#admin-sales?employee=${_.id}'" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors" title="Voir l'historique">
                                <i data-lucide="history" class="w-3.5 h-3.5"></i>
                            </button>
                            `:""}
                            ${s?`
                            <button type="button" class="js-lock-emp p-1.5 rounded-lg bg-slate-800 ${Z?"text-red-400 hover:text-red-300":"text-slate-400 hover:text-white"} hover:bg-slate-700 border border-slate-700 transition-colors" data-id="${_.id}" data-locked="${Z?"1":"0"}" title="${Z?ee?ee.title:"Compte bloqu\xE9":"Bloquer le compte"}" ${l&&String(_.id)===String(o)?"disabled":""}>
                                <i data-lucide="${Z?"lock":"unlock"}" class="w-3.5 h-3.5"></i>
                            </button>
                            `:""}
                            <button onclick="window.location.hash = '#employees/edit/${_.id}'" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors">
                                <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                            </button>
                        </div>

                        <!-- User Info -->
                        <div class="flex items-start gap-4 mb-4">
                            <div class="relative w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-400 border border-slate-700 shrink-0">
                                ${_.photo?`<img src="${_.photo}" class="w-full h-full object-cover rounded-xl" />`:'<i data-lucide="user" class="w-6 h-6"></i>'}
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <h3 class="text-base font-bold text-white truncate leading-tight">
                                        ${_.first_name} ${_.last_name}
                                    </h3>
                                    ${F}
                                </div>
                                <p class="text-xs text-slate-500 mb-1.5">
                                    ${_.role==="patron"?"Patron":_.role==="co_patron"?"Co-Patron":_.role==="responsable"?"Responsable":_.role==="chef_atelier"?"Chef d'Atelier":_.role==="mecano_confirme"?"M\xE9cano Confirm\xE9":_.role==="mecano_junior"?"M\xE9cano Junior":_.role==="mecano_test"?"M\xE9cano Test":"Employ\xE9"}
                                </p>
                                <div class="flex items-center gap-2 flex-wrap">
                                    <div class="js-status">${$}</div>
                                    <span class="text-[10px] text-slate-600 flex items-center gap-1">
                                        <i data-lucide="calendar" class="w-3 h-3"></i>
                                        Arriv\xE9 le ${_.created_at?new Date(_.created_at).toLocaleDateString("fr-FR"):"--"}
                                    </span>
                                    ${(()=>{if(!_.last_login)return'<span class="text-[10px] text-slate-500 flex items-center gap-1 italic"><i data-lucide="help-circle" class="w-3 h-3"></i> Jamais connect\xE9</span>';let re=new Date(_.last_login),fe=(new Date-re)/(1e3*60*60*24),ce="text-slate-500";return fe>30?ce="text-red-400 font-bold":fe>7&&(ce="text-orange-400"),`<span class="text-[10px] ${ce} flex items-center gap-1" title="Derni\xE8re connexion"><i data-lucide="log-in" class="w-3 h-3"></i> Vu le ${re.toLocaleDateString("fr-FR")} \xE0 ${re.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>`})()}
                                </div>
                                ${X.length>0?`<div class="flex flex-wrap gap-1.5 mt-2">${X.join("")}</div>`:""}
                            </div>
                        </div>

                        <!-- Blocked Banner -->
                        ${de}

                        <!-- Stats Footer -->
                        <div class="mt-auto pt-4 border-t border-slate-800/50">
                            <div>
                                <p class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Total G\xE9n\xE9r\xE9 (P\xE9riode)</p>
                                <p class="text-xl font-bold text-white tracking-tight">${B(A)}</p>
                            </div>
                            <div class="mt-1">
                                <p class="text-xs font-medium text-orange-500/90 flex items-center gap-1.5">
                                    <i data-lucide="flame" class="w-3 h-3"></i>
                                    Prime (${q}%): <span class="text-orange-400">${B(M)}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                `}).join("")}
            </div>
        </div>
    `}function ot(e){let t=!!e,s=t?e:{first_name:"",last_name:"",phone:"",role:"mecano_confirme",username:"",password:"",discord_id:""},a=s.warnings||[],r=u.getCurrentUser(),o=r&&u.hasPermissionSync(r,"employees.warnings"),l=u.hasPermissionSync(r,"employees.delete");return setTimeout(async()=>{let i=document.getElementById("current-password-display"),c=document.getElementById("toggle-current-password");if(i&&c){let f=i.dataset.password,y=!1,h=()=>{y=!y,i.textContent=y?f:"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"};i.addEventListener("click",h),c.addEventListener("click",h)}let g=document.getElementById("employee-form");if(g&&g.addEventListener("submit",async f=>{f.preventDefault();let y=new FormData(f.target),h=Object.fromEntries(y.entries()),b=h.id;if(!b&&t){S.show("Erreur: identifiant employ\xE9 manquant.","error");return}b||(b=Ce()),h.id=b;try{if(b){let p=await u.getEmployeeById(b);p&&p.role!==h.role&&u.savePayrollRate(b,null)}await u.saveEmployee({id:b,firstName:h.firstName,lastName:h.lastName,phone:h.phone,role:h.role,username:h.username,password:h.password,discordId:h.discordId,photo:null});try{let p=u.getPermissionCatalog(),k={};p.forEach(x=>{let E=document.getElementById(`perm_${x.key}`);E&&(k[x.key]=E.checked)}),await u.saveEmployeePermissions(b,k)}catch(p){console.error("Error saving permissions:",p),S.show("Erreur lors de la sauvegarde des permissions","warning")}S.show(t?"Employ\xE9 modifi\xE9 avec succ\xE8s !":"Employ\xE9 cr\xE9\xE9 avec succ\xE8s !","success"),window.location.hash="#employees"}catch(p){let k=p&&p.message?p.message:String(p),x=p&&p.code?String(p.code):"",E=p&&p.details?String(p.details):"",T=x==="23514"||/employees_role_valid/i.test(k)||/violates check constraint/i.test(k)||/role/i.test(E);x==="23505"||/duplicate key value/i.test(k)||/unique constraint/i.test(k)?k="Ce nom d'utilisateur est d\xE9j\xE0 pris.":E&&!/\[object Object\]/.test(E)&&(k=E),S.show("Erreur: "+k,"error")}}),t&&s&&s.id)try{let f=await u.fetchEmployeeProfile(s.id);if(f){let y=document.getElementById("recruitment-profile"),h=document.getElementById("recruitment-profile-content");if(y&&h){let b=k=>k==null?"":String(k),p=[f.age!=null?`<div class="text-sm text-white"><span class="text-slate-400">\xC2ge:</span> ${b(f.age)} ans</div>`:"",f.discord_handle?`<div class="text-sm text-white"><span class="text-slate-400">Discord:</span> ${b(f.discord_handle)}</div>`:"",f.unique_id?`<div class="text-sm text-white"><span class="text-slate-400">ID Unique (PMA):</span> ${b(f.unique_id)}</div>`:"",f.phone_ig?`<div class="text-sm text-white"><span class="text-slate-400">T\xE9l IG (Candidature):</span> ${b(f.phone_ig)}</div>`:"",f.availability?`<div class="mt-3"><div class="text-xs text-slate-500 uppercase font-bold mb-1">Disponibilit\xE9s</div><div class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${b(f.availability)}</div></div>`:"",f.experience?`<div class="mt-3"><div class="text-xs text-slate-500 uppercase font-bold mb-1">Exp\xE9rience</div><div class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${b(f.experience)}</div></div>`:"",f.motivation?`<div class="mt-3"><div class="text-xs text-slate-500 uppercase font-bold mb-1">Motivation</div><div class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${b(f.motivation)}</div></div>`:""].filter(Boolean).join("");h.innerHTML=p||'<div class="text-sm text-slate-500 italic">Aucune information de candidature.</div>',y.classList.remove("hidden"),window.lucide&&lucide.createIcons()}}}catch{}let w=document.getElementById("employee-password"),m=document.getElementById("btn-toggle-employee-password");if(m&&w&&m.addEventListener("click",()=>{let f=w.type==="password"?"text":"password";w.type=f;let y=m.querySelector("i");y&&(y.setAttribute("data-lucide",f==="password"?"eye":"eye-off"),window.lucide&&lucide.createIcons())}),o&&t){let f=document.getElementById("add-warning-btn"),y=document.getElementById("warning-reason"),h=document.getElementById("warnings-list"),b=document.getElementById("warnings-count"),p=document.getElementById("warning-counter"),k=document.getElementById("warnings-search"),x=()=>{if(!b||!h)return;let C=h.querySelectorAll(".js-warning-item").length;b.textContent=`${C} ${C===1?"avertissement":"avertissements"}`,b.className=`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${C>=3?"bg-red-500/10 text-red-400 border-red-500/20":C===2?"bg-orange-500/10 text-orange-400 border-orange-500/20":C===1?"bg-yellow-500/10 text-yellow-400 border-yellow-500/20":"bg-slate-800 text-slate-400 border-slate-700"}`},E=()=>{h&&h.querySelectorAll(".js-warning-item").forEach((C,R)=>{let _=R+1,I=_>=3?"border-red-500/40":_===2?"border-orange-500/40":"border-yellow-500/40",A=_>=3?"bg-red-500/10 text-red-300 border-red-500/20":_===2?"bg-orange-500/10 text-orange-300 border-orange-500/20":"bg-yellow-500/10 text-yellow-300 border-yellow-500/20";C.classList.remove("border-red-500/40","border-orange-500/40","border-yellow-500/40"),C.classList.add(I);let H=C.querySelector(".js-warning-num");H&&(H.textContent=`#${_}`,H.className=`js-warning-num inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${A}`)})},T=()=>{if(!y||!f||!p)return;let C=String(y.value||""),R=C.trim().length;p.textContent=`${Math.min(C.length,220)}/220`,f.disabled=R<3},P=C=>{C.addEventListener("click",R=>{let _=R.currentTarget.dataset.id;se.show({title:"Supprimer l'avertissement",message:"\xCAtes-vous s\xFBr de vouloir supprimer cet avertissement ?",type:"danger",confirmText:"Supprimer",onConfirm:async()=>{try{await u.deleteWarning(s.id,_);let I=document.getElementById(`warning-${_}`);I&&I.remove(),h&&(!h.children.length||h.children.length===1&&h.querySelector("#no-warnings-msg"))&&!h.querySelector("#no-warnings-msg")&&h.children.length===0&&(h.innerHTML='<p id="no-warnings-msg" class="text-sm text-slate-500 italic">Aucun avertissement.</p>'),S.show("Avertissement supprim\xE9"),x(),E()}catch(I){console.error(I),S.show("Erreur lors de la suppression","error")}}})})};f&&y&&(T(),y.addEventListener("input",T),y.addEventListener("keydown",C=>{(C.ctrlKey||C.metaKey)&&C.key==="Enter"&&(C.preventDefault(),f.click())}),document.querySelectorAll(".js-warning-template").forEach(C=>{C.addEventListener("click",R=>{R.preventDefault();let _=C.getAttribute("data-text")||"";if(!_)return;let I=String(y.value||"").trim();y.value=I?`${I} \u2013 ${_}`:_,T(),y.focus()})}),f.addEventListener("click",async()=>{let C=y.value.trim();if(C.length<3){S.show("Motif trop court (min 3 caract\xE8res)","error");return}try{f.disabled=!0;let R=await u.addWarning(s.id,{reason:C,author:`${r.firstName} ${r.lastName}`}),_=document.getElementById("no-warnings-msg");_&&_.remove();let I=document.createElement("div");I.id=`warning-${R.id}`,I.className="js-warning-item bg-slate-900/50 rounded-xl p-4 border border-yellow-500/40 flex justify-between items-start gap-4 animate-fade-in",I.setAttribute("data-text",`${String(R.reason||"").toLowerCase()} ${String(R.author||"").toLowerCase()}`),I.innerHTML=`
                            <div class="min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="js-warning-num inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-yellow-500/10 text-yellow-300 border-yellow-500/20">#1</span>
                                    <span class="text-sm text-white font-semibold break-words">${R.reason}</span>
                                </div>
                                <div class="text-xs text-slate-400">
                                    <span class="text-slate-500">Par</span> <span class="font-medium text-slate-300">${R.author}</span>
                                    <span class="text-slate-600">\u2022</span>
                                    <span class="font-mono">${new Date(R.date).toLocaleString("fr-FR",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}</span>
                                </div>
                            </div>
                            <button type="button" data-id="${R.id}" class="delete-warning-btn p-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        `,h.prepend(I),window.lucide&&lucide.createIcons();let A=I.querySelector(".delete-warning-btn");P(A),y.value="",T(),x(),E(),S.show("Avertissement ajout\xE9")}catch(R){console.error(R),S.show("Erreur lors de l'ajout de l'avertissement","error")}finally{T()}})),k&&h&&k.addEventListener("input",()=>{let C=String(k.value||"").trim().toLowerCase();h.querySelectorAll(".js-warning-item").forEach(R=>{let _=R.getAttribute("data-text")||"";R.classList.toggle("hidden",C&&!_.includes(C))})}),document.querySelectorAll(".delete-warning-btn").forEach(P),x(),E()}if(t){let f=document.getElementById("fire-employee-btn"),y=document.getElementById("fire-reason-input");if(f&&f.addEventListener("click",()=>{se.show({title:"Virer l'employ\xE9",message:"\xCAtes-vous s\xFBr de vouloir virer cet employ\xE9 ? Toutes ses interventions et pointages seront supprim\xE9s.",type:"danger",confirmText:"Virer",onConfirm:async()=>{try{let h=y?y.value.trim():"";await u.fireEmployee(s.id,h),S.show("Employ\xE9 vir\xE9 et compta supprim\xE9e"),window.location.hash="#employees"}catch(h){console.error(h),S.show("Erreur lors du licenciement","error")}}})}),l){let h=document.getElementById("delete-employee-btn-form");h&&h.addEventListener("click",()=>{if(r&&String(r.id)===String(s.id)){S.show("Impossible de supprimer ta propre fiche.","error");return}se.show({title:"Supprimer d\xE9finitivement ?",message:`
                                <div class="space-y-2">
                                    <p class="text-slate-300">Tu es sur le point de supprimer d\xE9finitivement la fiche de <span class="font-bold text-white">${s.first_name} ${s.last_name}</span>.</p>
                                    <p class="text-xs text-red-400 font-bold uppercase"><i data-lucide="alert-triangle" class="w-3 h-3 inline mr-1"></i> Irr\xE9versible</p>
                                </div>
                            `,type:"danger",confirmText:"Supprimer",onConfirm:async()=>{try{await u.deleteEmployee(s.id),S.show("Fiche employ\xE9e supprim\xE9e.","success"),window.location.hash="#employees"}catch(b){console.error(b),S.show("Erreur : "+b.message,"error")}}})})}}let d=document.getElementById("permissions-container"),n=document.getElementById("toggle-permissions-btn"),v=document.getElementById("permissions-panel");if(n&&v&&n.addEventListener("click",()=>{v.classList.toggle("hidden")}),d){let f=u.getPermissionCatalog(),y=document.querySelector('select[name="role"]'),h={};if(t&&s.id)try{h=await u.fetchEmployeePermissions(s.id)}catch(p){console.error(p)}let b=()=>{if(!y)return;let p=y.value,k=u.getRoleDefaultPermissions(p);d.innerHTML=f.map(x=>{let E=!!k[x.key],T=E,P=!1;return h&&Object.prototype.hasOwnProperty.call(h,x.key)&&(T=!!h[x.key],P=T!==E),`
                        <div class="bg-slate-800/50 rounded-lg p-3 border ${P?"border-purple-500/30 bg-purple-500/5":"border-slate-700"} flex items-start gap-3 transition-colors hover:border-slate-600">
                            <div class="pt-0.5">
                                <input type="checkbox" name="perm_${x.key}" id="perm_${x.key}" ${T?"checked":""} class="rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500 w-4 h-4 cursor-pointer">
                            </div>
                            <div class="flex-1">
                                <label for="perm_${x.key}" class="block text-sm font-medium text-white cursor-pointer select-none flex items-center gap-2">
                                    ${x.label||x.key}
                                    ${P?'<span class="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">Modifi\xE9</span>':""}
                                </label>
                                <p class="text-xs text-slate-400 mt-0.5 leading-relaxed">${x.description||""}</p>
                                ${E&&!P?'<span class="text-[10px] text-slate-500 mt-1 block flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Inclus dans le r\xF4le</span>':""}
                                ${!E&&!P?'<span class="text-[10px] text-slate-600 mt-1 block">Non inclus par d\xE9faut</span>':""}
                            </div>
                        </div>
                    `}).join(""),window.lucide&&lucide.createIcons()};y&&y.addEventListener("change",b),b()}},100),`
        <div class="max-w-3xl mx-auto animate-fade-in">
            <div class="mb-6 flex items-center gap-4">
                <a href="#employees" class="text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="arrow-left" class="w-6 h-6"></i>
                </a>
                <h2 class="text-2xl font-bold text-white">${t?"Modifier l'employ\xE9":"Ajouter un employ\xE9"}</h2>
            </div>

            <div class="bg-slate-900/70 glass rounded-2xl shadow-lg border border-slate-700 p-7 md:p-8">
                <div class="h-1 w-full rounded-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc] mb-7"></div>
                <form id="employee-form" class="space-y-6">
                    ${t?`<input type="hidden" name="id" value="${s.id}">`:""}
                    
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Pr\xE9nom</label>
                            <input type="text" name="firstName" value="${s.first_name||s.firstName||""}" required autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Nom</label>
                            <input type="text" name="lastName" value="${s.last_name||s.lastName||""}" required autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">T\xE9l\xE9phone</label>
                            <input type="tel" name="phone" value="${s.phone||""}" autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">ID Unique (PMA)</label>
                            <div class="relative">
                                <input type="text" name="unique_id" value="${s.unique_id||""}" placeholder="Ex: 12345" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 font-mono">
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">R\xF4le</label>
                        <select name="role" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                            <option value="patron" ${s.role==="patron"?"selected":""}>Patron</option>
                            <option value="co_patron" ${s.role==="co_patron"?"selected":""}>Co-Patron</option>
                            <option value="responsable" ${s.role==="responsable"?"selected":""}>Responsable</option>
                            <option value="chef_atelier" ${s.role==="chef_atelier"?"selected":""}>Chef d'Atelier</option>
                            <option value="mecano_confirme" ${s.role==="mecano_confirme"?"selected":""}>M\xE9cano Confirm\xE9</option>
                            <option value="mecano_junior" ${s.role==="mecano_junior"?"selected":""}>M\xE9cano Junior</option>
                            <option value="mecano_test" ${s.role==="mecano_test"?"selected":""}>M\xE9cano Test</option>
                        </select>
                        <div class="mt-2 flex justify-end">
                            <button type="button" id="toggle-permissions-btn" class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                <i data-lucide="shield" class="w-3 h-3"></i>
                                G\xE9rer les permissions sp\xE9ciales
                            </button>
                        </div>
                        
                        <div id="permissions-panel" class="hidden mt-4 bg-slate-900/40 rounded-xl p-4 border border-slate-700/50 animate-fade-in">
                             <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-700/50">
                                <i data-lucide="lock" class="w-4 h-4 text-purple-400"></i>
                                <h4 class="text-sm font-bold text-white">Permissions sp\xE9ciales</h4>
                                <span class="text-[10px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">Surcharge le r\xF4le</span>
                             </div>
                             <div id="permissions-container" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div class="col-span-full text-center py-4">
                                    <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-slate-500 border-t-transparent"></div>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div class="border-t border-slate-700/70 pt-6 mt-6">
                        <h3 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <i data-lucide="key-round" class="w-4 h-4 text-blue-400"></i>
                            Identifiants de connexion
                        </h3>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-1">Nom d'utilisateur</label>
                                <input type="text" name="username" value="${s.username}" required autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
                                <div class="relative">
                                    <input type="password" id="employee-password" name="password" value="" ${t?"":"required"} autocomplete="off" placeholder="${t?"Laisser vide pour conserver":""}" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 pr-12">
                                    <button type="button" id="btn-toggle-employee-password" class="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-200 focus:outline-none">
                                        <i data-lucide="eye" class="h-5 w-5"></i>
                                    </button>
                                </div>
                                ${t&&s.password?`
                                <div class="mt-2 text-xs text-slate-400 flex items-center gap-2">
                                    <span>Mot de passe actuel :</span>
                                    <span id="current-password-display" data-password="${s.password.replace(/"/g,"&quot;")}" class="font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700 cursor-pointer hover:text-white transition-colors">\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</span>
                                    <i data-lucide="eye" class="w-3 h-3 cursor-pointer hover:text-white" id="toggle-current-password"></i>
                                </div>
                                `:""}
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-slate-300 mb-1">ID Discord</label>
                            <input type="text" name="discordId" value="${s.discord_id||""}" autocomplete="off" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3" placeholder="Ex: 123456789012345678">
                        </div>
                    </div>

                    <div id="recruitment-profile" class="hidden border-t border-slate-700/70 pt-6 mt-6">
                        <h3 class="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <i data-lucide="file-text" class="w-4 h-4 text-purple-400"></i>
                            Informations de candidature
                        </h3>
                        <div id="recruitment-profile-content" class="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4"></div>
                    </div>
                    
                    

                    ${o&&t?`
                    <div class="border-t border-slate-700 pt-6 mt-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-sm font-medium text-red-400 flex items-center gap-2">
                            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                            Avertissements & Sanctions
                            </h3>
                            <span id="warnings-count" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${a.length>=3?"bg-red-500/10 text-red-400 border-red-500/20":a.length===2?"bg-orange-500/10 text-orange-400 border-orange-500/20":a.length===1?"bg-yellow-500/10 text-yellow-400 border-yellow-500/20":"bg-slate-800 text-slate-400 border-slate-700"}">
                                ${a.length} ${a.length===1?"avertissement":"avertissements"}
                            </span>
                        </div>
                        
                        <!-- Add Warning -->
                        <div class="bg-slate-900/40 border border-slate-700 rounded-xl p-4 mb-6">
                            <div class="flex items-start gap-3">
                                <div class="mt-0.5 p-2 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20">
                                    <i data-lucide="file-warning" class="w-4 h-4"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Motif</label>
                                    <textarea id="warning-reason" rows="2" maxlength="220" placeholder="Ex: Retard r\xE9p\xE9t\xE9, comportement inadapt\xE9, non-respect des consignes..." class="w-full rounded-lg border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500 sm:text-sm p-2.5 resize-none"></textarea>
                                    <div class="mt-2 flex items-center justify-between gap-3">
                                        <div class="flex flex-wrap gap-2">
                                            ${["Retard r\xE9p\xE9t\xE9","Absence non justifi\xE9e","Non-respect des consignes","Manque de professionnalisme","Comportement inadapt\xE9"].map(i=>`
                                                <button type="button" class="js-warning-template px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs" data-text="${i}">${i}</button>
                                            `).join("")}
                                        </div>
                                        <div class="flex items-center gap-3 flex-shrink-0">
                                            <span id="warning-counter" class="text-xs text-slate-400 font-mono">0/220</span>
                                            <button type="button" id="add-warning-btn" class="px-4 py-2 rounded-lg font-bold text-sm bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                                                Ajouter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- List Warnings -->
                        <div class="flex items-center justify-between mb-3">
                            <div class="text-xs text-slate-500">Historique</div>
                            <input id="warnings-search" type="text" placeholder="Rechercher..." class="w-48 rounded-lg border-slate-700 bg-slate-900 text-slate-200 placeholder-slate-500 text-xs p-2">
                        </div>
                        <div id="warnings-list" class="space-y-3">
                            ${a.length===0?'<p id="no-warnings-msg" class="text-sm text-slate-500 italic">Aucun avertissement.</p>':""}
                            ${a.slice().sort((i,c)=>new Date(c.date)-new Date(i.date)).map((i,c)=>{let g=c+1,w=g>=3?"border-red-500/40":g===2?"border-orange-500/40":"border-yellow-500/40",m=g>=3?"bg-red-500/10 text-red-300 border-red-500/20":g===2?"bg-orange-500/10 text-orange-300 border-orange-500/20":"bg-yellow-500/10 text-yellow-300 border-yellow-500/20";return`
                                    <div id="warning-${i.id}" class="js-warning-item bg-slate-900/50 rounded-xl p-4 border ${w} flex justify-between items-start gap-4" data-text="${String(i.reason||"").toLowerCase().replace(/"/g,"&quot;")} ${String(i.author||"").toLowerCase().replace(/"/g,"&quot;")}">
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="js-warning-num inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${m}">#${g}</span>
                                                <span class="text-sm text-white font-semibold break-words">${i.reason}</span>
                                            </div>
                                            <div class="text-xs text-slate-400">
                                                <span class="text-slate-500">Par</span> <span class="font-medium text-slate-300">${i.author}</span>
                                                <span class="text-slate-600">\u2022</span>
                                                <span class="font-mono">${new Date(i.date).toLocaleString("fr-FR",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}</span>
                                            </div>
                                        </div>
                                        <button type="button" data-id="${i.id}" class="delete-warning-btn p-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </div>
                                    `}).join("")}
                        </div>
                    </div>
                    `:""}

                    <div class="flex justify-between pt-6 gap-3">
                        <div class="flex items-center gap-3">
                            ${o&&t?`
                            <div class="flex items-center gap-2">
                                <input type="text" id="fire-reason-input" placeholder="Motif du licenciement..." class="px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500 text-sm w-48 md:w-64">
                            </div>
                            <button type="button" id="fire-employee-btn" class="px-4 py-2 border border-red-600 text-red-400 rounded-lg font-medium hover:bg-red-600/10 transition-colors flex items-center gap-2">
                                <i data-lucide="user-x" class="w-4 h-4"></i>
                                Virer
                            </button>
                            `:""}

                            ${l&&t?`
                            <button type="button" id="delete-employee-btn-form" class="px-4 py-2 border border-red-800 bg-red-900/10 text-red-500 rounded-lg font-medium hover:bg-red-800 hover:text-white transition-colors flex items-center gap-2" title="Supprimer d\xE9finitivement la fiche (Patron)">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                            `:""}
                        </div>

                        <div class="flex gap-3">
                            <button type="button" onclick="window.history.back()" class="px-6 py-2 border border-slate-700 rounded-xl text-slate-300 font-semibold hover:bg-slate-800 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                                <i data-lucide="save" class="w-4 h-4"></i>
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `}var it=e=>{let t=(window.location.hash||"").match(new RegExp(`${e}=([^&]+)`));return t?decodeURIComponent(t[1]):null};async function lt(e){let t=!!e,s=it("employee"),a=it("price"),r=it("cost"),o=ie.getUser(),l=await u.hasPermission(o,"sales.create"),i=o&&o.role==="patron",c=0;try{c=await u.calculateGlobalSafeBalance()}catch(n){console.error(n)}let g=[],w=0,m=null;if(!t&&(a||r))try{let n=localStorage.getItem("last_tuning_calc");if(n){let v=JSON.parse(n);new Date-new Date(v.date)<15*60*1e3&&v.items&&Array.isArray(v.items)&&(g=v.items,w=v.adjustment||0,m=v.date)}}catch(n){console.error("Error reading ticket",n)}setTimeout(()=>{let n=document.getElementById("sales-service-type"),v=document.getElementById("sales-plate"),f=document.querySelector('input[name="price"]'),y=document.querySelector('input[name="cost"]'),h=document.getElementById("sales-margin-display"),b=document.getElementById("sales-margin-input"),p=document.getElementById("reparation-options"),k=document.getElementById("sales-safe-impact"),x=document.getElementById("sales-safe-total"),E=!1,T=(R=!0)=>{if(E)return;E=!0;let _=parseFloat(f.value)||0,I=n?n.value:"",A=I==="R\xE9paration"||I==="Reparation",H=0;_>0&&(A?H=0:H=_/1.8);let q=!!r&&parseFloat(r)>0,M=parseFloat(y?y.value:0)||0;q?M>0?H=M:parseFloat(r)>0&&(H=parseFloat(r)):!R&&M>0&&(H=M),y&&(R&&!q||!y.value||parseFloat(y.value)===0)&&(y.value=H.toFixed(2));let V=parseFloat(y?y.value:0)||0,W=_-V;if(h&&(h.textContent=B(W),h.className=`text-xl font-mono font-bold ${W>=0?"text-emerald-500":"text-red-500"}`),b&&(b.value=W.toFixed(2),b.className=`block w-full rounded-xl border-slate-600 bg-slate-800 font-bold placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500 p-3 ${W>=0?"text-emerald-400":"text-red-400"}`),k&&x){k.textContent=(W>=0?"+":"")+B(W),k.className=W>=0?"text-emerald-400 font-bold":"text-red-400 font-bold";let N=c;if(t){let $=parseFloat(d.price)||0,L=parseFloat(d.cost)||0,j=$-L;N=c-j+W}else N=c+W;x.textContent=B(N)}E=!1},P=()=>{if(E||!y||!f||!b)return;E=!0;let R=parseFloat(f.value)||0,_=parseFloat(b.value)||0,I=R-_;y.value=I.toFixed(2),E=!1},C=document.getElementById("btn-magic-margin");if(C&&C.addEventListener("click",()=>{try{let R=localStorage.getItem("last_tuning_calc");if(R){let{price:I,cost:A,date:H}=JSON.parse(R);if(new Date-new Date(H)<5*60*1e3){f&&(f.value=I),y&&(y.value=A),T(!1),Toast.show("Synchronis\xE9 avec le Calculateur !","success");return}}let _=parseFloat(f.value)||0;if(_>0){let I=_/1.8;y&&(y.value=I.toFixed(2),T(!1),Toast.show("Co\xFBt standard (1.8) appliqu\xE9 (Pas de calcul r\xE9cent trouv\xE9)","info"))}else Toast.show("Entrez d'abord un prix ou utilisez le calculateur.","warning")}catch(R){console.error(R);let _=parseFloat(f.value)||0;if(_>0){let I=_/1.8;y&&(y.value=I.toFixed(2),T(!1),Toast.show("Co\xFBt standard (1.8) appliqu\xE9 !","success"))}}}),f&&f.addEventListener("input",()=>T(!0)),y&&y.addEventListener("input",()=>T(!1)),b&&b.addEventListener("input",P),n&&v){let R=()=>{let _=n.value==="R\xE9paration";v.disabled=_,_?(v.value!=="REPARATION"&&(v.dataset.old=v.value),v.value="REPARATION",p&&p.classList.remove("hidden")):(v.value==="REPARATION"&&(v.value=v.dataset.old||""),p&&p.classList.add("hidden")),T(!0)};if(n.addEventListener("change",R),n.value==="R\xE9paration"&&R(),p&&f){let _=document.getElementById("repair-qty"),I=document.getElementById("qty-minus"),A=document.getElementById("qty-plus"),H=0,q=null,M=()=>{let W=_&&parseFloat(_.value)||1;H>0&&(f.value=H*W,T(!0))},V=W=>{if(!_)return;let N=parseInt(_.value)||1;N+=W,N<1&&(N=1),_.value=N,M()};I&&(I.onclick=()=>V(-1)),A&&(A.onclick=()=>V(1)),_&&(_.oninput=()=>M()),f.oninput=()=>{H=0,q&&(q.classList.remove("ring-2","ring-blue-500","ring-offset-2","ring-offset-slate-900"),q=null),T(!0)},p.querySelectorAll("button[data-price]").forEach(W=>{W.onclick=()=>{q&&q.classList.remove("ring-2","ring-blue-500","ring-offset-2","ring-offset-slate-900"),q=W,q.classList.add("ring-2","ring-blue-500","ring-offset-2","ring-offset-slate-900"),H=parseFloat(W.dataset.price),M(),W.dataset.plate?(v.value=W.dataset.plate,y&&(y.value="0",T(!1))):v.value!=="REPARATION"&&(v.value="REPARATION",T(!0))}})}}if(T(!r),g.length>0){let R=document.getElementById("ticket-container");if(R){let _=()=>{let I=g.reduce((M,V)=>M+Number(V.price),0)+w,A=g.reduce((M,V)=>M+(Number(V.cost)||0),0),H=I-A;R.innerHTML=`
                        <div class="bg-white rounded-3xl shadow-2xl overflow-hidden text-slate-900 transform transition-all">
                            <!-- Receipt Header -->
                            <div class="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                                <h3 class="font-bold text-slate-800 flex items-center gap-3 text-lg">
                                    <div class="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                        <i data-lucide="receipt" class="w-5 h-5 text-indigo-600"></i>
                                    </div>
                                    Ticket
                                </h3>
                                <span class="text-xs font-mono font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">${new Date(m).toLocaleDateString()}</span>
                            </div>
                            
                            <!-- Receipt Items -->
                            <div class="p-5 max-h-[500px] overflow-y-auto bg-slate-50/50 space-y-3 custom-scrollbar">
                                ${g.length===0&&w===0?'<div class="text-center text-slate-400 italic py-8 text-sm">Aucun article</div>':g.map((M,V)=>`
                                    <div class="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                        <div class="text-sm">
                                            <div class="font-bold text-slate-700">${M.name}</div>
                                            <div class="text-xs text-slate-400">${M.category||"Autre"}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-mono font-bold text-slate-800">${B(M.price)}</div>
                                            <button type="button" data-idx="${V}" class="btn-remove-item text-[10px] text-red-400 hover:text-red-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Retirer</button>
                                        </div>
                                    </div>
                                `).join("")}
                                
                                ${w>0?`
                                <div class="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm border-l-4 border-l-indigo-500">
                                    <div class="text-sm">
                                        <div class="font-bold text-indigo-900">Ajustement / Main d'oeuvre</div>
                                        <div class="text-xs text-indigo-500">Pour atteindre l'objectif</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-mono font-bold text-indigo-700">${B(w)}</div>
                                        <div class="text-xs text-indigo-400 italic">Marge 100%</div>
                                    </div>
                                </div>
                                `:""}
                            </div>

                            <!-- Receipt Footer -->
                            <div class="bg-white border-t border-slate-200 p-6 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10">
                                <div class="flex justify-between items-end">
                                    <span class="text-slate-500 font-medium text-sm mb-1">Total Client</span>
                                    <span class="font-bold font-mono text-3xl tracking-tight text-slate-800">${B(I)}</span>
                                </div>
                                
                                <div class="pt-3 border-t border-slate-100 space-y-2">
                                    <div class="flex justify-between text-xs text-slate-400">
                                        <span>Co\xFBt Entreprise</span>
                                        <span class="font-mono">${B(A)}</span>
                                    </div>
                                    <div class="flex justify-between text-sm items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                        <span class="text-emerald-700 font-bold flex items-center gap-2">
                                            <i data-lucide="trending-up" class="w-4 h-4"></i> Marge
                                        </span>
                                        <span class="font-bold font-mono text-emerald-700 text-lg">${B(H)}</span>
                                    </div>
                                </div>

                                <button type="button" id="btn-ticket-generate" class="w-full group relative overflow-hidden py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 mt-4">
                                    <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    <span>G\xE9n\xE9rer Facture</span>
                                    <i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                            </div>
                        </div>
                    `,window.lucide&&lucide.createIcons(),R.querySelectorAll(".btn-remove-item").forEach(M=>{M.addEventListener("click",V=>{let W=parseInt(V.target.dataset.idx),N=g[W];g.splice(W,1);let $=parseFloat(f.value)||0,L=parseFloat(y?y.value:0)||0,j=Math.max(0,$-N.price),F=N.cost||0,X=Math.max(0,L-F);f.value=j.toFixed(2),y&&(y.value=X.toFixed(2));let O=new Event("input");f.dispatchEvent(O),_()})});let q=document.getElementById("btn-ticket-generate");q&&q.addEventListener("click",()=>{let M=document.getElementById("sales-submit-btn");M&&M.click()})};_()}}},100);let d=t?{id:e.id,clientName:e.clientName||e.client_name,clientPhone:e.clientPhone||e.client_phone,plate:e.plate||e.vehicleModel||e.vehicle_model||e.propertyName,serviceType:e.serviceType||e.service_type||e.type,price:e.price,cost:e.cost||0,invoiceUrl:e.invoiceUrl||e.invoice_url||e.contractUrl,photoUrl:e.photoUrl||e.photo_url||e.locationUrl}:{clientName:"",clientPhone:"",plate:"",serviceType:"",price:a||"",cost:r||"",invoiceUrl:null,photoUrl:null};return`
        <div class="max-w-7xl mx-auto animate-fade-in">
            <div class="mb-6 flex items-center gap-4">
                <a href="#dashboard" class="text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="arrow-left" class="w-6 h-6"></i>
                </a>
                <h2 class="text-2xl font-bold text-white">${t?"Modifier l'Intervention":"Enregistrer une Intervention"}</h2>
            </div>

            <div class="grid grid-cols-1 ${g.length>0?"lg:grid-cols-3 gap-8 items-start":""}">
                
                <!-- LEFT COLUMN: FORM -->
                <div class="${g.length>0?"lg:col-span-2":""} bg-slate-900/70 glass rounded-2xl shadow-lg border border-slate-700 p-7 md:p-8">
                    <div class="h-1 w-full rounded-full bg-gradient-to-r from-[#dd3bcc] via-[#4bb4d3] to-[#dd3bcc] mb-7"></div>
                    <form id="sales-form" class="space-y-8">
                        ${t?`<input type="hidden" name="id" value="${d.id}">`:""}
                        ${s?`<input type="hidden" name="employeeId" value="${s}">`:""}
                        <input type="hidden" name="invoiceUrl" value="${d.invoiceUrl||""}">
                        
                        <div>
                            <div class="flex items-start justify-between gap-4 mb-5">
                                <div>
                                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                                        <i data-lucide="clipboard-list" class="w-5 h-5 text-blue-500"></i>
                                        D\xE9tails de l'Intervention
                                    </h3>
                                    <p class="text-sm text-slate-400 mt-1">Renseigne la plaque, le type et le montant.</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-slate-300 mb-1">Plaque du v\xE9hicule</label>
                                    <input id="sales-plate" type="text" name="plate" value="${d.plate||""}" required autocomplete="off" placeholder="Ex: AB-123-CD" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 p-3">
                                    <div class="mt-2 text-xs text-slate-500">Obligatoire (auto-majuscule).</div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-300 mb-1">Type de Prestation</label>
                                    <select id="sales-service-type" name="serviceType" required class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white focus:border-blue-500 focus:ring-blue-500 p-3">
                                        <option value="" disabled ${d.serviceType?"":"selected"}>S\xE9lectionner...</option>
                                        <option value="R\xE9paration" ${d.serviceType==="R\xE9paration"?"selected":""}>R\xE9paration</option>
                                        <option value="Customisation" ${d.serviceType==="Customisation"?"selected":""}>Customisation</option>
                                    </select>
                                </div>
                                
                                <!-- PRICE & COST & MARGIN -->
                                <div class="md:col-span-2 grid grid-cols-1 ${i?"md:grid-cols-3":"md:grid-cols-1"} gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-emerald-400 mb-1">Total Facture ($)</label>
                                        <div class="relative">
                                            <input type="number" name="price" value="${d.price}" required autocomplete="off" min="0" step="0.01" placeholder="0.00" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500 p-3 pr-10">
                                            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold">$</div>
                                        </div>
                                    </div>
                                    ${i?`
                                    <div>
                                        <label class="block text-sm font-medium text-slate-500 mb-1">Co\xFBt Garage ($)</label>
                                        <div class="relative">
                                            <input type="number" name="cost" id="sales-cost-input" value="${d.cost}" step="0.01" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-slate-500 p-3 pr-14">
                                            <button type="button" id="btn-magic-margin" class="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md transition-all flex items-center justify-center border border-white/10" title="Calculer Marge Standard (1.8)">
                                                <i data-lucide="wand-2" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-emerald-500 mb-1">Marge Nette ($)</label>
                                        <input type="number" id="sales-margin-input" step="0.01" class="block w-full rounded-xl border-slate-600 bg-slate-800 text-emerald-400 font-bold placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500 p-3">
                                    </div>
                                    `:`
                                    <input type="hidden" name="cost" value="${d.cost}">
                                    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 flex flex-col justify-center items-center">
                                        <span class="text-xs font-bold text-slate-500 uppercase">Votre Marge</span>
                                        <span id="sales-margin-display" class="text-xl font-mono font-bold text-slate-500">0.00 $</span>
                                    </div>
                                    `}
                                </div>

                                <!-- SAFE PROJECTION -->
                                <div class="md:col-span-2 mt-4 p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                            <i data-lucide="coins" class="w-5 h-5"></i>
                                        </div>
                                        <div>
                                            <p class="text-xs font-bold text-emerald-500 uppercase tracking-wider">Impact Coffre</p>
                                            <p class="text-xs text-emerald-500/60">Ajout automatique au solde</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p id="sales-safe-impact" class="text-lg font-bold text-emerald-400">+0.00 $</p>
                                        <p class="text-[10px] text-emerald-500/60 font-mono">
                                            Nouveau Solde Th\xE9orique: <span id="sales-safe-total" class="font-bold text-emerald-300">...</span>
                                        </p>
                                    </div>
                                </div>

                                <!-- Preset Buttons for Reparation -->
                                <div id="reparation-options" class="hidden md:col-span-2 mt-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 animate-fade-in">
                                    <div class="flex items-center justify-between mb-4">
                                        <label class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <i data-lucide="zap" class="w-3 h-3 text-yellow-500"></i> Tarifs Rapides
                                        </label>
                                        <div class="flex items-center bg-slate-700 rounded-lg p-1 border border-slate-600">
                                            <button type="button" id="qty-minus" class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 rounded-md transition-colors"><i data-lucide="minus" class="w-4 h-4"></i></button>
                                            <input type="number" id="repair-qty" value="1" min="1" class="w-12 text-center bg-transparent border-none text-white font-bold focus:ring-0 p-0 appearance-none" />
                                            <button type="button" id="qty-plus" class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 rounded-md transition-colors"><i data-lucide="plus" class="w-4 h-4"></i></button>
                                        </div>
                                    </div>
                                    <div class="space-y-4">
                                        <div>
                                            <span class="text-[10px] font-bold text-slate-500 mb-2 block uppercase tracking-wide">Standard</span>
                                            <div class="flex gap-2">
                                                <button type="button" data-price="500" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-xs font-bold rounded-lg transition-all border border-slate-600 shadow-sm hover:shadow-md">500 $</button>
                                                <button type="button" data-price="1000" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-xs font-bold rounded-lg transition-all border border-slate-600 shadow-sm hover:shadow-md">1000 $</button>
                                                <button type="button" data-price="2000" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-xs font-bold rounded-lg transition-all border border-slate-600 shadow-sm hover:shadow-md">2000 $</button>
                                            </div>
                                        </div>
                                        <div class="pt-3 border-t border-slate-700/50">
                                            <span class="text-[10px] font-bold text-orange-500 mb-2 block uppercase tracking-wide">Sp\xE9cial</span>
                                            <button type="button" data-price="2800" data-plate="VENTE KIT" class="w-full py-2 bg-orange-900/20 hover:bg-orange-900/40 text-orange-400 hover:text-orange-300 text-xs font-bold rounded-lg transition-all border border-orange-500/30 shadow-sm flex items-center justify-center gap-2">
                                                <i data-lucide="package" class="w-3 h-3"></i>
                                                Kit R\xE9paration (2800 $)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4 gap-3">
                            <button type="button" onclick="window.history.back()" class="px-6 py-2 border border-slate-600 rounded-lg text-slate-300 font-medium hover:bg-slate-700 transition-colors">
                                Annuler
                            </button>
                            <button id="sales-submit-btn" type="submit" ${l?"":"disabled"} class="bg-blue-600 has-sheen hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                <i data-lucide="check" class="w-4 h-4"></i>
                                ${t?"Modifier":"Valider"}
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- RIGHT COLUMN: TICKET -->
                ${g.length>0?`
                <div class="lg:col-span-1 sticky top-6">
                    <div id="ticket-container">
                        <!-- Content Injected via JS -->
                        <div class="bg-slate-800 rounded-2xl p-8 text-center animate-pulse">
                            <i data-lucide="loader-2" class="w-8 h-8 mx-auto text-blue-500 animate-spin"></i>
                        </div>
                    </div>
                </div>
                `:""}

            </div>
        </div>
    `}function nt(){return setTimeout(Ie,50),`
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
                    <p class="text-slate-400 text-sm">G\xE9rez votre temps de service en temps r\xE9el</p>
                    
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
                        <input type="text" id="p-search" autocomplete="off" placeholder="Rechercher un employ\xE9..." 
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
                                <div class="font-bold text-white text-sm">Historique d'activit\xE9</div>
                                <div class="text-xs text-slate-500">Voir les mouvements r\xE9cents</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span id="p-history-state" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Masqu\xE9</span>
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
    `}async function Ie(){let e=()=>{let m=new Date,d=document.getElementById("live-clock"),n=document.getElementById("live-date");d&&(d.textContent=m.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})),n&&(n.textContent=m.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}))};e();try{window.__pClockInterval&&clearInterval(window.__pClockInterval)}catch{}window.__pClockInterval=setInterval(e,3e4);let t=document.getElementById("pointeuse-grid"),s=document.getElementById("history-active"),a=document.getElementById("history-paused"),r=document.getElementById("history-completed"),o=document.getElementById("p-history-wrapper"),l=document.getElementById("p-history-toggle"),i=document.getElementById("p-history-state"),c=document.getElementById("p-history-chevron"),g=document.getElementById("p-count-active"),w=document.getElementById("p-count-paused");if(t){try{let m=await u.fetchEmployees(),d=await u.fetchTimeEntries(),n=ie.getUser(),v=u.hasPermissionSync(n,"pointeuse.view_all"),f=localStorage.getItem("p_filter")||(v?"all":"me"),y=v&&f==="all",h=v&&localStorage.getItem("p_search")||"",b=String(h||"").trim().toLowerCase(),p=!y&&n?m.filter(C=>C.id===n.id):m,k=document.getElementById("p-filter-bar");if(k&&v){if(!document.getElementById("p-scan-afk")){let I=document.createElement("div");I.className="mt-4 flex justify-center",I.innerHTML=`
                    <button id="p-scan-afk" onclick="handleScanAFK()" class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-all">
                        <i data-lucide="shield-alert" class="w-4 h-4"></i>
                        Scanner Inactifs (> 2h)
                    </button>
                `,k.appendChild(I)}let R=document.getElementById("p-filter-all"),_=document.getElementById("p-filter-me");R&&_&&(f==="all"?(R.className="px-6 py-2 rounded-lg text-sm font-bold transition-all text-white bg-white/10 shadow-sm",_.className="px-6 py-2 rounded-lg text-sm font-bold transition-all text-slate-400 hover:text-white hover:bg-white/5"):(R.className="px-6 py-2 rounded-lg text-sm font-bold transition-all text-slate-400 hover:text-white hover:bg-white/5",_.className="px-6 py-2 rounded-lg text-sm font-bold transition-all text-white bg-white/10 shadow-sm"),R.onclick=()=>{localStorage.setItem("p_filter","all"),Ie()},_.onclick=()=>{localStorage.setItem("p_filter","me"),Ie()})}else{let C=document.getElementById("p-filter-bar");C&&(C.style.display="none")}let x=document.getElementById("p-search-bar"),E=document.getElementById("p-search");x&&E&&v?(x.classList.remove("hidden"),E.value=h||"",E.oninput=C=>{localStorage.setItem("p_search",C.target.value||""),Ie()}):x&&x.classList.add("hidden"),b&&y&&(p=p.filter(C=>`${C.first_name||""} ${C.last_name||""}`.trim().toLowerCase().includes(b))),Gt(t,p,d,v);let P=(localStorage.getItem("p_history")||"collapsed")==="expanded";o&&o.classList.toggle("hidden",!P),i&&(i.textContent=P?"Affich\xE9":"Masqu\xE9"),c&&(c.style.transform=P?"rotate(180deg)":"rotate(0deg)"),l&&(l.onclick=()=>{let C=(localStorage.getItem("p_history")||"collapsed")==="expanded"?"collapsed":"expanded";localStorage.setItem("p_history",C),Ie()}),P&&Kt(s,a,r,d,m);try{let C=d.filter(_=>!_.clock_out&&!_.paused).length,R=d.filter(_=>!_.clock_out&&_.paused).length;if(g&&(g.textContent=String(C)),w&&(w.textContent=String(R)),n){let _=document.getElementById("p-my-hours-badge"),I=document.getElementById("p-my-hours-val");if(_&&I){_.classList.remove("hidden");let{start:A}=je(),H=d.filter(M=>String(M.employee_id)===String(n.id)&&new Date(M.clock_in)>=A),q=0;H.forEach(M=>{if(M.clock_out)q+=new Date(M.clock_out)-new Date(M.clock_in)-(M.pause_total_ms||0);else{let V=new Date,W=0;M.paused&&M.pause_started&&(W=V-new Date(M.pause_started)),q+=V-new Date(M.clock_in)-(M.pause_total_ms||0)-W}}),I.textContent=ze(q)}}}catch{}}catch(m){console.error("CRASH POINTEUSE:",m),t.innerHTML=`<div class="col-span-full text-red-500 text-center">Erreur de chargement des donn\xE9es: ${m.message}</div>`}try{window.__pRefreshInterval&&clearInterval(window.__pRefreshInterval)}catch{}window.__pRefreshInterval=setInterval(Ie,6e4)}}function ze(e){let t=Math.max(0,Math.floor(e/1e3)),s=Math.floor(t/3600),a=Math.floor(t%3600/60);return s<=0?`${a}m`:`${s}h ${String(a).padStart(2,"0")}m`}function xt(){let e=document.querySelectorAll('[data-p-card="1"]'),t=new Date,s=parseInt(localStorage.getItem("inactivity_threshold_hours")||"2",10);for(let a of e){let r=a.getAttribute("data-emp-id")||"",o=a.getAttribute("data-clock-in")||"",l=a.getAttribute("data-paused")==="1",i=a.getAttribute("data-pause-started")||"",c=Number(a.getAttribute("data-pause-total")||0),g=r?document.getElementById(`p-status-${r}`):null,w=r?document.getElementById(`p-dot-${r}`):null,m=r?document.getElementById(`p-avatar-${r}`):null,d=r?document.getElementById(`p-inactive-${r}`):null;if(!o||!g)continue;let n=new Date(o),v=n.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),f=0;if(l&&i){let b=new Date(i);f=Math.max(0,t-b)}let y=Math.max(0,t-n-c-f),h=ze(y);if(l){let b=i?new Date(i).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):v,p=i?Math.max(0,t-new Date(i)):0;g.className="text-xs text-yellow-400 flex items-center gap-1.5 bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-400/20 w-fit",g.innerHTML=`<i data-lucide="coffee" class="w-3 h-3"></i><span class="font-bold">En pause</span><span class="text-yellow-400/70 font-mono">(${ze(p)})</span>`,w&&(w.className="absolute top-0 right-0 w-3 h-3 rounded-full bg-yellow-400 border-2 border-slate-800 shadow-sm z-10"),m&&(m.className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-orange-500/20"),d&&d.classList.add("hidden")}else if(g.className="text-xs text-green-400 flex items-center gap-1.5 bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20 w-fit",g.innerHTML=`<i data-lucide="timer" class="w-3 h-3"></i><span class="font-bold">En service</span><span class="text-green-400/70 font-mono">(${h})</span>`,w&&(w.className="absolute top-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-800 shadow-sm z-10 animate-pulse"),m&&(m.className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-green-500/20"),d){let b=a.getAttribute("data-last-activity")||"",p=n;if(b){let x=new Date(b);isNaN(x.getTime())||(p=x)}t-p>=s*36e5?d.classList.remove("hidden"):d.classList.add("hidden")}}}function Gt(e,t,s,a){let r=new Map;for(let l of s)l&&l.employee_id!=null&&!l.clock_out&&r.set(String(l.employee_id),l);let o=t.slice().sort((l,i)=>{let c=r.get(String(l.id))||null,g=r.get(String(i.id))||null,w=!!(c&&c.paused),m=!!(g&&g.paused),d=!!c,n=!!g,v=d?w?1:0:2,f=n?m?1:0:2;if(v!==f)return v-f;let y=`${l.first_name||""} ${l.last_name||""}`.trim().toLowerCase(),h=`${i.first_name||""} ${i.last_name||""}`.trim().toLowerCase();return y<h?-1:y>h?1:0});e.innerHTML=o.map(l=>{let i=r.get(String(l.id))||null,c=!!i,g=!!(i&&i.paused),w="",m="",d="",n=0,v="";if(c){let b=new Date(i.clock_in),p=new Date;m=i.clock_in||"",d=i.pause_started||"",n=Number(i.pause_total_ms||0);let k=0;if(i.paused&&i.pause_started){let T=new Date(i.pause_started);k=Math.max(0,p-T)}let x=Math.max(0,p-b-n-k),E=b.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});w=g?`En pause \u2022 depuis ${E}`:`En service \u2022 ${ze(x)} \u2022 depuis ${E}`;try{if(!g){let P=u.getSales().filter(C=>String(C.employeeId)===String(l.id)).filter(C=>new Date(C.date)>=new Date(i.clock_in)).sort((C,R)=>new Date(R.date)-new Date(C.date))[0];P&&(v=new Date(P.date).toISOString())}}catch{}}let f=l.id===ie.getUser()?.id,y="";!a&&!f?y=`<div class="h-10 flex items-center justify-center text-slate-500 text-xs italic bg-slate-800/50 rounded-lg border border-white/5">${c?"En service":"Hors service"}</div>`:y=`
                <div class="grid grid-cols-${c?"2":"1"} gap-3">
                    ${c?g?`
                            <button 
                                onclick="handleResume('${l.id}')"
                                class="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20">
                                <i data-lucide="play" class="w-4 h-4"></i> REPRENDRE
                            </button>
                            <button 
                                onclick="handleClockOut('${l.id}')"
                                class="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                                <i data-lucide="log-out" class="w-4 h-4"></i> SORTIR
                            </button>
                        `:`
                            <button 
                                onclick="handlePause('${l.id}')"
                                class="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20">
                                <i data-lucide="coffee" class="w-4 h-4"></i> PAUSE
                            </button>
                            <button 
                                onclick="handleClockOut('${l.id}')"
                                class="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                                <i data-lucide="log-out" class="w-4 h-4"></i> ${a&&!f?"FORCER":"SORTIR"}
                            </button>
                        `:`
                            <button 
                                onclick="handleClockIn('${l.id}')"
                                class="py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0">
                                <i data-lucide="log-in" class="w-4 h-4"></i> ${a&&!f?"FORCER ARRIV\xC9E":"ARRIVER"}
                            </button>
                        `}
                </div>
            `;let h="";if(c&&!g)try{let b=u.getSales().filter(x=>String(x.employeeId)===String(l.id)),p=i.clock_in?new Date(i.clock_in):new Date;if(b&&b.length){let x=b.filter(E=>new Date(E.date)>=new Date(i.clock_in)).sort((E,T)=>new Date(T.date)-new Date(E.date))[0];x&&(p=new Date(x.date))}let k=parseInt(localStorage.getItem("inactivity_threshold_hours")||"2",10);new Date-p>=k*36e5?h=`<span id="p-inactive-${l.id}" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-500/10 text-orange-300 border border-orange-500/20 mt-2 animate-pulse"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Inactif</span>`:h=`<span id="p-inactive-${l.id}" class="hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-500/10 text-orange-300 border border-orange-500/20 mt-2 animate-pulse"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Inactif</span>`}catch{}return`
            <div data-p-card="1" data-emp-id="${l.id}" data-clock-in="${m}" data-paused="${g?"1":"0"}" data-pause-started="${d}" data-pause-total="${n}" data-last-activity="${v}" 
                class="relative bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border ${c?g?"border-yellow-500/30":"border-green-500/30":"border-white/5"} transition-all hover:border-white/10 group overflow-hidden">
                
                ${c?`
                    <div class="absolute inset-0 bg-gradient-to-br ${g?"from-yellow-500/5 to-transparent":"from-green-500/5 to-transparent"} pointer-events-none"></div>
                `:""}

                <div class="relative z-10 flex items-start gap-4 mb-6">
                    <div class="relative">
                        <div id="p-avatar-${l.id}" class="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center text-xl font-bold transition-all">
                            ${l.first_name[0]}${l.last_name[0]}
                        </div>
                        <span id="p-dot-${l.id}" class="absolute top-0 right-0 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-800 shadow-sm z-10 hidden"></span>
                    </div>
                    
                    <div class="flex-1 min-w-0 pt-1">
                        <h3 class="font-bold text-white text-lg truncate leading-tight">${l.first_name} ${l.last_name}</h3>
                        <div id="p-status-${l.id}" class="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                            <i data-lucide="moon" class="w-3 h-3"></i> Hors service
                        </div>
                        ${h}
                    </div>
                </div>

                <div class="relative z-10">
                    ${y}
                </div>
            </div>
        `}).join(""),window.lucide&&lucide.createIcons(),xt();try{window.__pCardInterval&&clearInterval(window.__pCardInterval)}catch{}window.__pCardInterval=setInterval(xt,15e3)}function Kt(e,t,s,a,r){let o=a.filter(g=>!g.clock_out&&!g.paused),l=a.filter(g=>!g.clock_out&&!!g.paused),i=a.filter(g=>!!g.clock_out).sort((g,w)=>new Date(w.clock_out)-new Date(g.clock_out)).slice(0,8),c=(g,w,m,d,n,v)=>{let f=r.find(b=>b.id===g),y=f?`${f.first_name} ${f.last_name}`:"Inconnu",h=y.split(" ").map(b=>b[0]).join("");return`
            <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-white/5 transition-colors group">
                <div class="w-8 h-8 rounded-lg ${n} ${v} border flex items-center justify-center text-xs font-bold shadow-sm">
                    ${h}
                </div>
                <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-200 truncate">${y}</p>
                    <div class="flex items-center gap-1.5 text-[10px] text-slate-500">
                        ${d}
                        <span>${w}</span>
                        <span class="text-slate-600">\u2022</span>
                        <span class="font-mono">${m}</span>
                    </div>
                </div>
            </div>
        `};e&&(o.length===0?e.innerHTML='<p class="text-slate-500 text-xs italic p-2">Aucun employ\xE9 en service.</p>':e.innerHTML=o.map(g=>{let w=new Date(g.clock_in).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});return c(g.employee_id,"Depuis "+w,new Date(g.clock_in).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}),'<i data-lucide="timer" class="w-3 h-3 text-green-400"></i>',"bg-green-500/10 text-green-400","border-green-500/20")}).join("")),t&&(l.length===0?t.innerHTML='<p class="text-slate-500 text-xs italic p-2">Aucun employ\xE9 en pause.</p>':t.innerHTML=l.map(g=>{let w=(g.pause_started?new Date(g.pause_started):new Date).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});return c(g.employee_id,"Pause \xE0 "+w,new Date(g.clock_in).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}),'<i data-lucide="coffee" class="w-3 h-3 text-yellow-400"></i>',"bg-yellow-500/10 text-yellow-400","border-yellow-500/20")}).join("")),s&&(i.length===0?s.innerHTML='<p class="text-slate-500 text-xs italic p-2">Aucune sortie r\xE9cente.</p>':s.innerHTML=i.map(g=>{let w=new Date(g.clock_out)-new Date(g.clock_in),m=Math.floor(w/36e5),d=Math.floor(w%36e5/6e4),n=`${m>0?m+"h ":""}${d}m`,v=new Date(g.clock_out).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});return c(g.employee_id,`Fin \xE0 ${v}`,`Dur\xE9e: ${n}`,'<i data-lucide="log-out" class="w-3 h-3 text-slate-400"></i>',"bg-slate-800 text-slate-400","border-slate-600/30")}).join("")),window.lucide&&lucide.createIcons()}window.handleClockIn=async e=>{try{if(window.__pA&&window.__pA[e])return;window.__pA=window.__pA||{},window.__pA[e]=!0,await u.clockIn(e),S.show("Prise de service enregistr\xE9e","success"),Ie()}catch(t){S.show(t.message,"error")}finally{window.__pA&&delete window.__pA[e]}};window.handleCleanGhosts=async()=>{if(confirm(`Voulez-vous vraiment clore automatiquement tous les services ouverts depuis plus de 12 heures ?

Ils seront plafonn\xE9s \xE0 12h de service.`))try{let e=await u.autoCloseGhostServices(12);e.count>0?(S.show(`${e.count} services fant\xF4mes ont \xE9t\xE9 clos.`,"success"),Ie()):S.show("Aucun service fant\xF4me d\xE9tect\xE9.","info")}catch(e){console.error(e),S.show("Erreur: "+e.message,"error")}};window.handleScanAFK=async()=>{se.show({title:"Scanner Inactifs (Anti-AFK)",message:`
            <div class="space-y-4">
                <p class="text-slate-300">Cette action va scanner tous les employ\xE9s actuellement en service.</p>
                <div class="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <h4 class="text-orange-400 font-bold text-sm mb-2 flex items-center gap-2">
                        <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                        Crit\xE8res & Sanctions
                    </h4>
                    <ul class="text-sm text-slate-400 list-disc list-inside space-y-1">
                        <li>Inactivit\xE9 d\xE9tect\xE9e > <strong>2 heures</strong></li>
                        <li>Fin de service <strong>ajust\xE9e \xE0 la derni\xE8re action</strong> (les heures AFK ne comptent pas)</li>
                        <li>Ajout d'un <strong>Avertissement</strong> au dossier</li>
                    </ul>
                </div>
                <p class="text-slate-400 text-xs italic">
                    Les employ\xE9s en <strong>Pause</strong> ne sont PAS concern\xE9s par ce scan.
                </p>
            </div>
        `,type:"danger",confirmText:"Lancer le Scan",onConfirm:async()=>{try{let e=await u.checkAndSanctionInactivity(2);e.count>0?(S.show(`${e.count} employ\xE9s sanctionn\xE9s pour inactivit\xE9.`,"success"),Ie()):S.show("Scan termin\xE9 : Aucune inactivit\xE9 d\xE9tect\xE9e.","success")}catch(e){console.error(e),S.show("Erreur lors du scan: "+e.message,"error")}}})};window.handleClockOut=async e=>{try{if(window.__pA&&window.__pA[e])return;window.__pA=window.__pA||{},window.__pA[e]=!0,await u.clockOut(e),S.show("Sortie enregistr\xE9e","success"),Ie()}catch(t){S.show(t.message,"error")}finally{window.__pA&&delete window.__pA[e]}};window.handlePause=async e=>{try{if(window.__pA&&window.__pA[e])return;window.__pA=window.__pA||{},window.__pA[e]=!0,await u.pauseService(e),S.show("Pause activ\xE9e","info"),Ie()}catch(t){S.show(t.message,"error")}finally{window.__pA&&delete window.__pA[e]}};window.handleResume=async e=>{try{if(window.__pA&&window.__pA[e])return;window.__pA=window.__pA||{},window.__pA[e]=!0,await u.resumeService(e),S.show("Reprise du service","success"),Ie()}catch(t){S.show(t.message,"error")}finally{window.__pA&&delete window.__pA[e]}};function wt(e){let t=u.getEmployeeByIdSync(e.employeeId),s=t?`${t.first_name} ${t.last_name}`:"Inconnu";return setTimeout(()=>{let a=document.getElementById("invoice-edit-form"),r=document.getElementById("invoice-root"),o=document.getElementById("btn-print-invoice"),l=document.getElementById("btn-export-pdf"),i=document.getElementById("btn-save-invoice"),c=document.getElementById("btn-back");function g(){let m=document.getElementById("f-clientName").value.trim(),d=document.getElementById("f-clientPhone").value.trim(),n=document.getElementById("f-vehicleModel").value.trim(),v=document.getElementById("f-serviceType").value.trim(),f=parseFloat(document.getElementById("f-price").value)||0,y=document.getElementById("f-companyName").value.trim(),h=document.getElementById("f-companyAddr").value.trim(),b=document.getElementById("f-note").value.trim();document.getElementById("p-companyName").textContent=y||"DriveLine Customs",document.getElementById("p-companyAddr").textContent=h||"Atelier de m\xE9canique \u2022 Los Santos",document.getElementById("p-clientName").textContent=m||"-",document.getElementById("p-clientPhone").textContent=d||"",document.getElementById("p-vehicleModel").textContent=n||"",document.getElementById("p-serviceType").textContent=v||"",document.getElementById("p-price").textContent=B(f),document.getElementById("p-totalHT").textContent=B(f),document.getElementById("p-totalTTC").textContent=B(f),document.getElementById("p-note").textContent=b||""}a&&(a.addEventListener("submit",m=>{m.preventDefault(),g()}),a.querySelectorAll("input, textarea").forEach(m=>{m.addEventListener("blur",g),m.addEventListener("input",()=>{document.getElementById("btn-export-pdf").disabled=!1,document.getElementById("btn-save-invoice").disabled=!1})}),g()),o&&o.addEventListener("click",()=>window.print()),c&&c.addEventListener("click",()=>{window.history.length>1?window.history.back():window.location.hash="#dashboard"});async function w(){try{if(!window.html2canvas||!window.jspdf)return S.show("Outils PDF manquants","error"),null;let m=await window.html2canvas(r,{scale:2,backgroundColor:"#ffffff"}),d=m.toDataURL("image/png"),{jsPDF:n}=window.jspdf,v=new n("p","mm","a4"),f=v.internal.pageSize.getWidth(),y=v.internal.pageSize.getHeight(),h=f,b=m.height*h/m.width;return v.addImage(d,"PNG",0,0,h,b),v.output("blob")}catch(m){return S.show("Erreur export PDF: "+(m?.message||m),"error"),null}}l&&l.addEventListener("click",async()=>{let m=await w();if(!m)return;let d=URL.createObjectURL(m),n=document.createElement("a");n.href=d,n.download=`facture_${e.id}.pdf`,n.click(),setTimeout(()=>URL.revokeObjectURL(d),2e3)}),i&&i.addEventListener("click",async()=>{try{i.disabled=!0,i.textContent="Enregistrement...";let m=await w();if(!m){i.disabled=!1,i.textContent="Enregistrer dans Supabase";return}let d=new File([m],`facture_${e.id}.pdf`,{type:"application/pdf"}),n=await u.uploadFile(d,"invoices"),v={...e,invoiceUrl:n};await u.saveSale(v),S.show("Facture enregistr\xE9e !","success");let f=u.getCurrentUser(),y=f&&u.hasPermissionSync(f,"sales.view_all");window.location.hash=y?"#admin-sales":"#sales"}catch(m){S.show("Erreur enregistrement: "+(m?.message||m),"error")}finally{i.disabled=!1,i.textContent="Enregistrer dans Supabase"}})},100),`
        <div class="max-w-5xl mx-auto p-6">
            <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 text-white">
                <form id="invoice-edit-form" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="text-xs text-slate-400">Client</label>
                        <input id="f-clientName" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="${e.clientName||""}">
                        <input id="f-clientPhone" class="w-full mt-2 rounded-lg bg-slate-700 border border-slate-600 text-white p-2" placeholder="T\xE9l\xE9phone" value="${e.clientPhone||""}">
                    </div>
                    <div>
                        <label class="text-xs text-slate-400">V\xE9hicule</label>
                        <input id="f-vehicleModel" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="${e.vehicleModel||""}">
                        <label class="text-xs text-slate-400 mt-3 block">Prestation</label>
                        <input id="f-serviceType" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="${e.serviceType||""}">
                    </div>
                    <div>
                        <label class="text-xs text-slate-400">Prix</label>
                        <input id="f-price" type="number" step="0.01" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="${e.price||0}">
                        <label class="text-xs text-slate-400 mt-3 block">Note</label>
                        <textarea id="f-note" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" rows="2" placeholder="Notes sur la prestation"></textarea>
                    </div>
                    <div class="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                            <label class="text-xs text-slate-400">Nom du Garage</label>
                            <input id="f-companyName" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="DriveLine Customs">
                        </div>
                        <div class="md:col-span-2">
                            <label class="text-xs text-slate-400">Adresse</label>
                            <input id="f-companyAddr" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2" value="Atelier de m\xE9canique \u2022 Los Santos">
                        </div>
                    </div>
                    <div class="md:col-span-3 flex gap-2 justify-end">
                        <button type="submit" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Appliquer</button>
                        <button type="button" id="btn-export-pdf" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">T\xE9l\xE9charger PDF</button>
                        <button type="button" id="btn-save-invoice" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm text-white">Enregistrer dans Supabase</button>
                        <button type="button" id="btn-print-invoice" class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm text-white">Imprimer</button>
                        <button type="button" id="btn-back" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Retour</button>
                    </div>
                </form>
            </div>
            <div id="invoice-root" class="bg-white text-slate-900 p-8 rounded-xl shadow-lg print:shadow-none print:mt-0">
            <div class="flex items-start justify-between mb-8">
                <div>
                    <h1 id="p-companyName" class="text-2xl font-bold">DriveLine Customs</h1>
                    <p id="p-companyAddr" class="text-sm text-slate-600">Atelier de m\xE9canique \u2022 Los Santos</p>
                </div>
                <div class="text-right">
                    <h2 class="text-xl font-bold">Facture</h2>
                    <p class="text-sm text-slate-600">N\xB0 ${e.id}</p>
                    <p class="text-sm text-slate-600">${$e(e.date)}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-6 mb-8">
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p class="text-xs font-semibold text-slate-500 uppercase">Client</p>
                    <p id="p-clientName" class="font-medium">${e.clientName||"-"}</p>
                    <p id="p-clientPhone" class="text-sm text-slate-600">${e.clientPhone||""}</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p class="text-xs font-semibold text-slate-500 uppercase">Employ\xE9</p>
                    <p class="font-medium">${s}</p>
                </div>
            </div>
            <table class="w-full text-sm border border-slate-200 rounded-lg overflow-hidden mb-8">
                <thead class="bg-slate-100">
                    <tr>
                        <th class="text-left p-3">Prestation</th>
                        <th class="text-left p-3">V\xE9hicule</th>
                        <th class="text-right p-3">Prix</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-t border-slate-200">
                        <td id="p-serviceType" class="p-3">${e.serviceType}</td>
                        <td id="p-vehicleModel" class="p-3">${e.vehicleModel}</td>
                        <td id="p-price" class="p-3 text-right font-semibold">${B(e.price)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="flex justify-end mb-8">
                <div class="w-64 bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div class="flex justify-between">
                        <span class="text-slate-600">Total HT</span>
                        <span id="p-totalHT" class="font-medium">${B(e.price)}</span>
                    </div>
                    <div class="flex justify-between mt-2">
                        <span class="text-slate-600">TVA (0%)</span>
                        <span class="font-medium">${B(0)}</span>
                    </div>
                    <div class="flex justify-between mt-2 border-t border-slate-200 pt-2">
                        <span class="font-bold">Total</span>
                        <span id="p-totalTTC" class="font-bold">${B(e.price)}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <p class="text-xs text-slate-500">Merci pour votre confiance.</p>
                <p id="p-note" class="text-xs text-slate-500"></p>
            </div>
            </div>
        </div>
    `}function yt(){return setTimeout(Yt,50),`
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
                    <p class="text-slate-400 text-sm">Rejoignez l'\xE9quipe d'\xE9lite</p>
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
                            <p class="text-slate-400 text-xs mt-1">Compl\xE9tez soigneusement tous les champs ci-dessous.</p>
                        </div>
                        <div id="status-badge" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wide transition-colors shadow-lg shadow-green-900/20">
                            <span id="status-dot" class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                            <span id="status-text">Ouvert</span>
                        </div>
                    </div>

                    <div class="p-8">
                        <form id="apply-form" class="space-y-8">
                            
                            <!-- Section 1: Identit\xE9 -->
                            <div class="space-y-4">
                                <h3 class="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <span class="w-8 h-px bg-blue-500/50"></span>
                                    Identit\xE9 & Discord
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="group">
                                        <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Nom Pr\xE9nom (RP)</label>
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
                                        <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">\xC2ge (HRP)</label>
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
                                        <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Num\xE9ro T\xE9l\xE9phone IG</label>
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
                                            <span>Mode d\xE9v > Clic droit profil > Copier l'identifiant.</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Section 3: Profil Pro -->
                            <div class="space-y-4">
                                <h3 class="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <span class="w-8 h-px bg-blue-500/50"></span>
                                    Exp\xE9rience & Motivations
                                </h3>
                                
                                <div class="group">
                                    <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Exp\xE9rience M\xE9cano / RP</label>
                                    <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                        <textarea name="experience" required rows="3"
                                            class="w-full bg-transparent border-none p-4 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 resize-none leading-relaxed"
                                            placeholder="D\xE9taillez vos exp\xE9riences pass\xE9es (autres serveurs, entreprises, etc.)..."></textarea>
                                    </div>
                                </div>

                                <div class="group">
                                    <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Motivations</label>
                                    <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                        <textarea name="motivation" required rows="4"
                                            class="w-full bg-transparent border-none p-4 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 resize-none leading-relaxed"
                                            placeholder="Pourquoi voulez-vous rejoindre DriveLine Customs ? Qu'apporterez-vous \xE0 l'entreprise ?"></textarea>
                                    </div>
                                </div>

                                <div class="group">
                                    <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Disponibilit\xE9s</label>
                                    <div class="flex items-start bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                        <div class="pl-4 pt-4 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                            <i data-lucide="clock" class="w-4 h-4"></i>
                                        </div>
                                        <textarea name="availability" required rows="2"
                                            class="w-full bg-transparent border-none p-4 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 resize-none leading-relaxed"
                                            placeholder="Ex: Soirs de semaine 20h-00h, Week-end apr\xE8s-midi..."></textarea>
                                    </div>
                                </div>

                                <!-- Captcha -->
                                <div class="group pt-2">
                                    <label class="block text-xs font-medium text-slate-400 mb-1.5 ml-1">S\xE9curit\xE9 (Anti-Robot)</label>
                                    <div class="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all group-focus-within:border-blue-500/50 group-focus-within:ring-1 group-focus-within:ring-blue-500/50 group-focus-within:bg-slate-800/80">
                                        <div class="pl-4 pr-3 text-blue-400 font-mono font-bold text-lg select-none tracking-widest" id="captcha-label">
                                            ...
                                        </div>
                                        <input type="number" id="captcha-input" required 
                                            class="w-full bg-transparent border-none py-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-0 font-medium"
                                            placeholder="R\xE9sultat du calcul">
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
                    &copy; 2026 DriveLine Customs. Tous droits r\xE9serv\xE9s.
                </p>
            </div>
        </div>
    `}function Yt(){lucide.createIcons();let e=document.getElementById("apply-form");if(!e)return;u.fetchWebhookSettings().then(o=>{let l=o?.recruitment_open??!0,i=document.getElementById("status-badge"),c=document.getElementById("status-dot"),g=document.getElementById("status-text");if(!l){i&&(i.className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wide transition-colors"),c&&(c.className="w-2 h-2 rounded-full bg-red-500"),g&&(g.textContent="Ferm\xE9"),e.querySelectorAll("input, textarea, button").forEach(d=>{d.disabled=!0,d.classList.add("opacity-50","cursor-not-allowed")});let m=document.createElement("div");m.className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center font-medium backdrop-blur-sm",m.innerHTML="<p class='flex items-center justify-center gap-2'><i data-lucide='lock' class='w-4 h-4'></i> Les sessions de recrutement sont actuellement ferm\xE9es.</p>",e.prepend(m),lucide.createIcons()}});let t=0;function s(){let o=Math.floor(Math.random()*10)+1,l=Math.floor(Math.random()*10)+1;t=o+l;let i=document.getElementById("captcha-label"),c=document.getElementById("captcha-input");i&&(i.textContent=`${o} + ${l} =`),c&&(c.value="")}s();let a=document.getElementById("refresh-captcha");a&&a.addEventListener("click",()=>{let o=a.querySelector("i");o&&o.classList.add("animate-spin"),setTimeout(()=>o&&o.classList.remove("animate-spin"),500),s()});let r=e.querySelector('input[name="discordUid"]');r&&r.addEventListener("input",o=>{o.target.value=o.target.value.replace(/[^0-9]/g,"")}),e.addEventListener("submit",async o=>{o.preventDefault();let l=document.getElementById("captcha-input");if(!l||parseInt(l.value)!==t){S.show("Calcul de s\xE9curit\xE9 incorrect. R\xE9essayez.","error"),l.parentElement.classList.add("ring-2","ring-red-500","animate-shake"),setTimeout(()=>l.parentElement.classList.remove("ring-2","ring-red-500","animate-shake"),500),l.value="",l.focus(),s();return}let i=e.querySelector('button[type="submit"]'),c=i.innerHTML;i.disabled=!0,i.classList.add("opacity-75","cursor-not-allowed"),i.innerHTML=`
            <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
            </span>
        `;let g=new FormData(e),w={fullName:g.get("fullName"),discordId:g.get("discordId"),discordUid:g.get("discordUid"),uniqueId:g.get("uniqueId"),phoneIg:g.get("phoneIg"),age:g.get("age"),experience:g.get("experience"),motivation:g.get("motivation"),availability:g.get("availability")};try{let m=await u.submitApplication(w),d=document.getElementById("apply-card")||e.parentElement,n=`
                <div class="flex flex-col items-center justify-center p-12 text-center animate-fade-in min-h-[500px]">
                    <div class="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-bounce-short shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <i data-lucide="check" class="w-12 h-12 text-green-500"></i>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-3 tracking-tight">Candidature Re\xE7ue !</h3>
                    <p class="text-slate-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                        Merci <span class="text-blue-400 font-semibold">${w.fullName}</span>, votre dossier a \xE9t\xE9 transmis \xE0 la direction.
                    </p>
                    
                    <div class="mb-8 text-sm text-slate-300 w-full max-w-sm">
                         <div class="bg-slate-800/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                            <div class="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                                <span class="text-slate-500 text-xs uppercase font-bold">N\xB0 Dossier</span>
                                <span class="font-mono text-white font-bold bg-slate-700/50 px-2 py-1 rounded text-xs">${m?.id||"\u2014"}</span>
                            </div>
                            <ul class="text-left space-y-2.5">
                                <li class="flex justify-between text-sm"><span class="text-slate-500">Nom RP</span> <span class="text-slate-200 font-medium">${w.fullName}</span></li>
                                <li class="flex justify-between text-sm"><span class="text-slate-500">Discord</span> <span class="text-slate-200 font-medium">${w.discordId}</span></li>
                            </ul>
                        </div>
                    </div>

                    <a href="#" class="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all border border-white/5 hover:border-white/10 flex items-center gap-2 group">
                        <i data-lucide="home" class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"></i>
                        Retour \xE0 l'accueil
                    </a>
                </div>
            `;d&&(d.innerHTML=n,window.lucide&&lucide.createIcons()),setTimeout(()=>{window.location.hash="#login"},6e3)}catch(m){console.error(m),S.show("Erreur lors de l'envoi : "+m.message,"error"),i.disabled=!1,i.classList.remove("opacity-75","cursor-not-allowed"),i.innerHTML=c,lucide.createIcons()}})}function _t(){return setTimeout(Zt,50),`
        <style>
            .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.5); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.8); }
        </style>
        <div class="space-y-8 animate-fade-in pb-20">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 class="text-3xl font-bold text-white flex items-center gap-3">
                        <div class="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <i data-lucide="users" class="w-8 h-8 text-blue-500"></i>
                        </div>
                        Recrutement
                    </h2>
                    <p class="text-slate-400 mt-2 ml-1">Gestion des candidatures et du vivier</p>
                </div>
                
                <div class="flex gap-3">
                    <button id="announce-btn" class="hidden px-4 py-2.5 text-sm font-bold rounded-xl transition-all items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20" title="Renvoyer une notification">
                        <i data-lucide="bell" class="w-4 h-4"></i>
                        <span class="hidden md:inline">Annoncer</span>
                    </button>

                    <button id="toggle-status-btn" class="px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700">
                        <span class="animate-pulse">...</span>
                    </button>
                    
                    <button id="refresh-btn" class="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors" title="Actualiser">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- KPIs -->
            <div id="recruitment-kpis" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Loading State -->
                <div class="bg-slate-900/50 h-32 rounded-xl animate-pulse"></div>
                <div class="bg-slate-900/50 h-32 rounded-xl animate-pulse"></div>
                <div class="bg-slate-900/50 h-32 rounded-xl animate-pulse"></div>
            </div>

            <!-- Kanban Board -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-350px)] min-h-[500px]">
                
                <!-- Pending Column -->
                <div class="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div class="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                            <h3 class="font-bold text-slate-200">\xC0 traiter</h3>
                            <span id="count-pending" class="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">0</span>
                        </div>
                    </div>
                    <div id="col-pending" class="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        <!-- Items -->
                    </div>
                </div>

                <!-- Interview Column -->
                <div class="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div class="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <h3 class="font-bold text-slate-200">Entretiens</h3>
                            <span id="count-interview" class="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">0</span>
                        </div>
                    </div>
                    <div id="col-interview" class="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        <!-- Items -->
                    </div>
                </div>

                <!-- Accepted Column -->
                <div class="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div class="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <h3 class="font-bold text-slate-200">Valid\xE9es</h3>
                            <span id="count-accepted" class="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">0</span>
                        </div>
                        <button id="delete-all-accepted-btn" class="text-xs text-slate-500 hover:text-red-400 transition-colors" title="Supprimer tout">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                    <div id="col-accepted" class="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        <!-- Items -->
                    </div>
                </div>

                <!-- Rejected Column -->
                <div class="flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
                    <div class="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-red-500"></div>
                            <h3 class="font-bold text-slate-200">Refus\xE9es</h3>
                            <span id="count-rejected" class="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">0</span>
                        </div>
                        <button id="delete-all-rejected-btn" class="text-xs text-slate-500 hover:text-red-400 transition-colors" title="Supprimer tout">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                    <div id="col-rejected" class="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                        <!-- Items -->
                    </div>
                </div>

            </div>
        </div>
    `}function Zt(){let e=document.getElementById("toggle-status-btn"),t=document.getElementById("announce-btn"),s=document.getElementById("refresh-btn"),a=document.getElementById("recruitment-kpis"),r=document.getElementById("col-pending"),o=document.getElementById("col-interview"),l=document.getElementById("col-accepted"),i=document.getElementById("col-rejected"),c=document.getElementById("count-pending"),g=document.getElementById("count-interview"),w=document.getElementById("count-accepted"),m=document.getElementById("count-rejected"),d=document.getElementById("delete-all-accepted-btn"),n=document.getElementById("delete-all-rejected-btn"),v=[],f=p=>{e&&(p?(e.innerHTML='<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span>Ouvert</span>',e.className="px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20",t&&(t.classList.remove("hidden"),t.classList.add("flex"))):(e.innerHTML='<div class="w-2 h-2 rounded-full bg-red-500"></div><span>Ferm\xE9</span>',e.className="px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700",t&&(t.classList.add("hidden"),t.classList.remove("flex"))))};e&&(u.fetchWebhookSettings().then(p=>{let k=p?.recruitment_open??!0;e.dataset.open=k;let x=p?.recruitment_target_count??u.getRecruitmentTargetCount()??null;x!==null&&(e.dataset.targetCount=String(x)),f(k)}),t&&(t.onclick=()=>{let p="announce-target-input",k="announce-reason-input",x="";try{let E=document.getElementById("toggle-status-btn");E&&E.dataset.targetCount&&(x=E.dataset.targetCount)}catch{}se.show({title:"Renvoyer une annonce",message:`
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="text-xs font-medium text-slate-400">Nombre de postes restants</label>
                                <input id="${p}" type="number" min="1" value="${x}" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2.5" placeholder="Ex: 2">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-medium text-slate-400">Message (Optionnel)</label>
                                <textarea id="${k}" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2.5 h-20 text-sm" placeholder="Ex: Il reste 2 places !"></textarea>
                            </div>
                        </div>
                    `,confirmText:"Envoyer",onConfirm:async()=>{let E=Number(document.getElementById(p)?.value||0),T=document.getElementById(k)?.value||"";if(!E||E<1){S.show("Nombre invalide","error");return}try{await u.setRecruitmentTargetCount(E),await u.setRecruitmentStatus(!0,T),e&&(e.dataset.targetCount=String(E)),S.show("Annonce envoy\xE9e sur Discord")}catch(P){S.show("Erreur: "+P.message,"error")}}})}),e.onclick=async()=>{if(e.dataset.open==="true")try{await u.setRecruitmentStatus(!1),e.dataset.open=!1,f(!1),S.show("Recrutement ferm\xE9")}catch(k){S.show("Erreur: "+k.message,"error")}else{let k="target-count-input",x="reason-input";se.show({title:"Ouvrir le recrutement",message:`
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="text-xs font-medium text-slate-400">Nombre de postes recherch\xE9s</label>
                                <input id="${k}" type="number" min="1" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2.5" placeholder="Ex: 3">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-medium text-slate-400">Motif (Optionnel)</label>
                                <textarea id="${x}" class="w-full rounded-lg bg-slate-700 border border-slate-600 text-white p-2.5 h-20" placeholder="Ex: Ouverture exceptionnelle..."></textarea>
                            </div>
                        </div>
                    `,confirmText:"Ouvrir",onConfirm:async()=>{let E=Number(document.getElementById(k)?.value||0),T=document.getElementById(x)?.value||"";if(!E||E<1){S.show("Nombre invalide","error");return}try{await u.setRecruitmentTargetCount(E),await u.setRecruitmentStatus(!0,T),e.dataset.open=!0,e.dataset.targetCount=String(E),f(!0),b(),S.show("Recrutement ouvert")}catch(P){S.show("Erreur: "+P.message,"error")}}})}}),s&&(s.onclick=()=>{s.querySelector("i").classList.add("animate-spin"),b().then(()=>setTimeout(()=>s.querySelector("i").classList.remove("animate-spin"),500))}),d&&(d.onclick=()=>{se.show({title:"Tout supprimer ?",message:"Voulez-vous supprimer toutes les candidatures accept\xE9es ?",type:"danger",confirmText:"Supprimer",onConfirm:async()=>{let p=v.filter(k=>k.status==="accepted");for(let k of p)await u.deleteApplication(k.id);b(),S.show(`${p.length} supprim\xE9s`,"success")}})}),n&&(n.onclick=()=>{se.show({title:"Tout supprimer ?",message:"Voulez-vous supprimer toutes les candidatures refus\xE9es ?",type:"danger",confirmText:"Supprimer",onConfirm:async()=>{let p=v.filter(k=>k.status==="rejected");for(let k of p)await u.deleteApplication(k.id);b(),S.show(`${p.length} supprim\xE9s`,"success")}})});let y=p=>{let k=p.ai&&typeof p.ai.score=="number"?Math.round(p.ai.score):null,x="text-slate-400 bg-slate-800";return k!==null&&(k>=70?x="text-green-400 bg-green-500/10 border border-green-500/20":k>=40?x="text-yellow-400 bg-yellow-500/10 border border-yellow-500/20":x="text-red-400 bg-red-500/10 border border-red-500/20"),`
            <div class="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all group relative animate-fade-in">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                            ${p.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-bold text-white text-sm line-clamp-1">${p.full_name}</div>
                            <div class="text-[10px] text-slate-500 font-mono">${$e(p.created_at)}</div>
                        </div>
                    </div>
                    ${k!==null?`
                        <div class="px-2 py-1 rounded text-[10px] font-bold ${x}" title="Score AI">
                            ${k}%
                        </div>
                    `:""}
                </div>
                
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div class="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
                        <div class="text-[10px] text-slate-500 uppercase">Age</div>
                        <div class="text-sm font-mono text-slate-300">${p.age} ans</div>
                    </div>
                    <div class="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
                        <div class="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                            Discord
                            ${/^\d{15,22}$/.test(p.discord_user_id||p.discord_id)?"":'<i data-lucide="alert-triangle" class="w-3 h-3 text-orange-500" title="ID non num\xE9rique : MP impossible"></i>'}
                        </div>
                        <div class="text-sm font-mono text-slate-300 truncate" title="${p.discord_user_id||p.discord_id||""}">${p.discord_user_id||p.discord_id||"-"}</div>
                    </div>
                </div>

                <div class="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                    <button onclick="viewApplication('${p.id}')" class="flex-1 py-1.5 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                        Voir d\xE9tails
                    </button>
                    ${p.status==="pending"||p.status==="interview"?`
                        <button onclick="updateStatus('${p.id}', 'accepted')" class="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Accepter">
                            <i data-lucide="check" class="w-4 h-4"></i>
                        </button>
                        <button onclick="updateStatus('${p.id}', 'rejected')" class="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Refuser">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    `:`
                        <button onclick="deleteApplication('${p.id}')" class="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    `}
                </div>
            </div>
        `},h=p=>{let k=p.filter(C=>C.status==="pending").length,x=p.filter(C=>C.status==="accepted").length,E=0;try{let C=document.getElementById("toggle-status-btn");C&&C.dataset.targetCount?E=Number(C.dataset.targetCount):E=Number(u.getRecruitmentTargetCount()||0)}catch{}let T=E>0?Math.min(100,x/E*100):0,P=p.length;a.innerHTML=`
            <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i data-lucide="inbox" class="w-12 h-12 text-blue-400"></i>
                </div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Candidatures en attente</div>
                <div class="text-3xl font-black text-white tracking-tight">${k}</div>
                <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">N\xE9cessitent une action</div>
            </div>

            <div class="bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden group">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i data-lucide="users" class="w-12 h-12 text-purple-400"></i>
                </div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Candidatures</div>
                <div class="text-3xl font-black text-white tracking-tight">${P}</div>
                <div class="mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 inline-block px-2 py-1 rounded-lg">Depuis l'ouverture</div>
            </div>

            <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-4 relative overflow-hidden group shadow-lg">
                <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i data-lucide="target" class="w-12 h-12 text-green-400"></i>
                </div>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Objectif Recrutement</div>
                <div class="flex items-end gap-2 mb-1">
                    <div class="text-3xl font-black text-white tracking-tight">${x}</div>
                    <div class="text-lg font-bold text-slate-500 mb-1">/ ${E||"\u221E"}</div>
                </div>
                
                <div class="w-full bg-slate-700/50 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-1000" style="width: ${T}%"></div>
                </div>
                <div class="mt-2 text-xs font-medium text-slate-400 text-right">${Math.round(T)}% atteint</div>
            </div>
        `},b=async()=>{try{v=await u.fetchApplications(),h(v);let p=v.filter(T=>T.status==="pending"),k=v.filter(T=>T.status==="interview"),x=v.filter(T=>T.status==="accepted"),E=v.filter(T=>T.status==="rejected");c.textContent=p.length,g.textContent=k.length,w.textContent=x.length,m.textContent=E.length,r.innerHTML=p.length?p.map(y).join(""):'<div class="text-center p-8 text-slate-500 text-xs italic opacity-50">Aucune candidature en attente</div>',l.innerHTML=x.length?x.map(y).join(""):'<div class="text-center p-8 text-slate-500 text-xs italic opacity-50">Aucune candidature valid\xE9e</div>',i.innerHTML=E.length?E.map(y).join(""):'<div class="text-center p-8 text-slate-500 text-xs italic opacity-50">Aucune candidature refus\xE9e</div>',window.lucide&&lucide.createIcons()}catch(p){console.error(p),S.show("Erreur de chargement: "+p.message,"error")}};window.updateStatus=async(p,k)=>{try{if(k==="rejected")se.show({title:"Refuser la candidature",message:'<textarea id="reject-reason" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-red-500 outline-none h-24" placeholder="Motif du refus (optionnel)..."></textarea>',confirmText:"Refuser",confirmColor:"bg-red-500 hover:bg-red-600",onConfirm:async()=>{let x=document.getElementById("reject-reason")?.value;await u.updateApplicationStatus(p,k,x),b(),S.show("Candidature refus\xE9e","info")}});else{let x=await u.updateApplicationStatus(p,k);if(k==="interview")b(),S.show("Invitation entretien envoy\xE9e","info");else if(k==="accepted"){let E=null;try{if(E=await u.createEmployeeFromApplication(x),E&&E.credentials){let T=x.full_name||x.fullName||"Candidat",P=x.discord_user_id||x.discord_id;await _e.logCredentialsForAdmin(T,P,E.credentials)}}catch(T){E=null,console.error(T)}if(b(),S.show("Candidature accept\xE9e !","success"),E&&E.created&&E.credentials){let T=E.credentials.username,P=E.credentials.password,C=E.employee&&E.employee.id?E.employee.id:"";se.show({title:"Fiche employ\xE9 cr\xE9\xE9e",message:`
                                <div class="space-y-4">
                                    <div class="text-slate-300 text-sm">La fiche compta a \xE9t\xE9 cr\xE9\xE9e automatiquement.</div>
                                    <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-2">
                                        <div class="text-xs text-slate-500 uppercase font-bold">Identifiants</div>
                                        <div class="text-sm text-white"><span class="text-slate-400">Username:</span> <span class="font-mono font-bold">${T}</span></div>
                                        <div class="text-sm text-white"><span class="text-slate-400">Mot de passe:</span> <span class="font-mono font-bold">${P}</span></div>
                                        <div class="pt-2 flex gap-2">
                                            <button type="button" class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold" onclick="navigator.clipboard.writeText('${T}')">Copier username</button>
                                            <button type="button" class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold" onclick="navigator.clipboard.writeText('${P}')">Copier mot de passe</button>
                                        </div>
                                    </div>
                                    <div class="flex justify-end gap-2">
                                        <button type="button" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm" onclick="window.location.hash = '#employees/edit/${C}'">Ouvrir la fiche</button>
                                    </div>
                                </div>
                            `,confirmText:"OK"})}else E&&E.created===!1&&E.employee?S.show("Employ\xE9 d\xE9j\xE0 existant, pas de doublon.","info"):E||S.show("Candidature accept\xE9e, mais la cr\xE9ation de fiche a \xE9chou\xE9.","warning")}else b()}}catch(x){S.show("Erreur: "+x.message,"error")}},window.deleteApplication=async p=>{se.show({title:"Supprimer ?",message:"Cette action est irr\xE9versible.",type:"danger",confirmText:"Supprimer",onConfirm:async()=>{try{await u.deleteApplication(p),b(),S.show("Supprim\xE9","success")}catch(k){S.show("Erreur: "+k.message,"error")}}})},window.viewApplication=p=>{let k=v.find(E=>E.id===p);if(!k)return;let x=k.ai&&typeof k.ai.score=="number"?Math.round(k.ai.score):null;se.show({title:k.full_name,message:`
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                            <div class="text-xs text-slate-500 uppercase font-bold mb-1">Profil</div>
                            <div class="text-sm text-white"><span class="text-slate-400">Age:</span> ${k.age} ans</div>
                            <div class="text-sm text-white"><span class="text-slate-400">Discord:</span> ${k.discord_id}</div>
                            <div class="text-sm text-white"><span class="text-slate-400">ID Unique:</span> ${k.unique_id||"-"}</div>
                            <div class="text-sm text-white"><span class="text-slate-400">T\xE9l:</span> ${k.phone_ig||"-"}</div>
                        </div>
                        <div class="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                            <div class="text-xs text-slate-500 uppercase font-bold mb-1">Disponibilit\xE9s</div>
                            <div class="text-sm text-white">${k.availability}</div>
                        </div>
                    </div>

                    <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div class="text-xs text-slate-500 uppercase font-bold mb-2">Exp\xE9rience</div>
                        <p class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${k.experience}</p>
                    </div>

                    <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div class="text-xs text-slate-500 uppercase font-bold mb-2">Motivation</div>
                        <p class="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">${k.motivation}</p>
                    </div>

                    ${k.rejection_reason?`
                        <div class="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                            <div class="text-xs text-red-400 uppercase font-bold mb-2">Motif du refus</div>
                            <p class="text-sm text-red-200">${k.rejection_reason}</p>
                        </div>
                    `:""}

                    ${x!==null?`
                        <div class="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                            <div class="flex justify-between items-center mb-2">
                                <div class="text-xs text-blue-400 uppercase font-bold">Analyse IA</div>
                                <div class="font-bold text-white">${x}/100</div>
                            </div>
                            <div class="w-full bg-slate-700 rounded-full h-1.5 mb-3">
                                <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${x}%"></div>
                            </div>
                            <p class="text-xs text-slate-400 italic">${k.ai.summary||"Analyse automatique du profil bas\xE9e sur les r\xE9ponses."}</p>
                        </div>
                    `:""}
                </div>
            `,size:"lg"})},b()}var Te="list",ve=null;function Et(){return setTimeout(Qt,50),`
        <div id="contracts-root" class="space-y-8 animate-fade-in pb-20 min-h-screen">
            <!-- Loading -->
            <div class="flex items-center justify-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        </div>
    `}async function Qt(){let e=u.getCurrentUser(),t=await u.hasPermission(e,"contracts.manage");Te="list",ve=null,await Pe()}async function Pe(){let e=document.getElementById("contracts-root");if(e){if(Te==="list")e.innerHTML=await Xt(),ts();else if(Te==="edit")e.innerHTML=ss(ve),as(ve),We(ve||Ve());else if(Te==="view"){e.innerHTML=rs(ve),os();let t={simple_title:ve.title,simple_fournisseur:ve.fournisseur,simple_partenaire:ve.partenaire,simple_date:ve.date,...ve.content_json};We(t)}window.lucide&&lucide.createIcons()}}async function Xt(){let e=u.getCurrentUser(),t=await u.hasPermission(e,"contracts.manage"),s=await u.fetchContracts();return`
        <div class="space-y-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 class="text-3xl font-black text-white uppercase tracking-tight">Contrats Partenaires</h1>
                    <p class="text-slate-400 mt-1">G\xE9rez et consultez les contrats commerciaux de l'entreprise.</p>
                </div>
                ${t?`
                <button id="btn-new-contract" class="px-5 py-2.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg hover:shadow-red-600/20 transition-all flex items-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Nouveau</span>
                </button>
                `:""}
            </div>

            ${s.length===0?`
                <div class="bg-zinc-900 border border-white/5 p-12 text-center rounded-lg">
                    <p class="text-slate-500">Aucun contrat enregistr\xE9.</p>
                </div>
            `:`
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    ${s.map(a=>es(a,t)).join("")}
                </div>
            `}
        </div>
    `}function es(e,t){let s={simple_title:e.title,simple_fournisseur:e.fournisseur,simple_partenaire:e.partenaire,simple_date:e.date,...e.content_json},a=e.title||"Contrat Commercial",r=e.fournisseur||"Fournisseur",o=e.partenaire||"Partenaire";return`
        <div class="flex flex-col bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-500/30 transition-all duration-300 group h-[350px]">
            <!-- Header Info -->
            <div class="p-4 border-b border-white/5 bg-slate-900/50 z-10 relative">
                <div class="flex items-start justify-between gap-4">
                    <div class="overflow-hidden flex-1">
                        <h3 class="font-bold text-white text-sm truncate" title="${ye(a)}">${ye(a)}</h3>
                        <div class="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                            <span class="truncate max-w-[45%] font-medium">${ye(r)}</span>
                            <i data-lucide="arrow-right" class="w-3 h-3 text-slate-600 flex-shrink-0"></i>
                            <span class="truncate max-w-[45%] font-medium text-blue-300">${ye(o)}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                         ${t?`
                        <button data-id="${e.id}" class="btn-delete w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors" title="Supprimer">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                        <button data-id="${e.id}" class="btn-edit w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors" title="Modifier">
                            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                        </button>
                        `:""}
                    </div>
                </div>
            </div>

            <!-- Preview Thumbnail -->
            <div class="relative flex-1 bg-slate-950/50 overflow-hidden flex items-start justify-center pt-6 cursor-pointer btn-view-overlay" data-id="${e.id}">
                <!-- Shadow/Glow behind paper -->
                <div class="absolute top-0 w-full h-full bg-gradient-to-b from-slate-900/0 to-slate-900/80 z-10 pointer-events-none"></div>
                
                <!-- The Paper -->
                <div class="bg-white shadow-2xl origin-top transform scale-[0.38] w-[210mm] h-[297mm] transition-transform duration-500 group-hover:scale-[0.40] group-hover:translate-y-[-5px]">
                     <div class="w-full h-full overflow-hidden select-none pointer-events-none p-[20mm]">
                        ${$t(s)}
                     </div>
                </div>
                
                <!-- Hover Action Overlay -->
                <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-20">
                    <button class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                        <span>Ouvrir le contrat</span>
                    </button>
                </div>
            </div>

            <!-- Footer Date -->
            <div class="px-4 py-3 border-t border-white/5 bg-slate-900/80 flex items-center justify-between text-[10px] text-slate-500 font-mono z-10">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Sign\xE9 le ${$e(e.date)}</span>
                </div>
                <span class="opacity-50">REF: ${e.id.slice(0,6).toUpperCase()}</span>
            </div>
        </div>
    `}function ts(){let e=document.getElementById("btn-new-contract");e&&e.addEventListener("click",()=>{Te="edit",ve=null,Pe()});let t=async s=>{ve=(await u.fetchContracts()).find(r=>r.id===s),Te="view",Pe()};document.querySelectorAll(".btn-view, .btn-view-overlay").forEach(s=>{s.addEventListener("click",()=>t(s.dataset.id))}),document.querySelectorAll(".btn-edit").forEach(s=>{s.addEventListener("click",async a=>{a.stopPropagation();let r=s.dataset.id,l=(await u.fetchContracts()).find(i=>i.id===r);l&&(ve={simple_title:l.title,simple_fournisseur:l.fournisseur,simple_partenaire:l.partenaire,simple_date:l.date,...l.content_json,id:l.id}),Te="edit",Pe()})}),document.querySelectorAll(".btn-delete").forEach(s=>{s.addEventListener("click",async a=>{if(a.stopPropagation(),confirm("\xCAtes-vous s\xFBr de vouloir supprimer ce contrat ?")){let r=s.dataset.id;try{await u.deleteContract(r),S.show("Contrat supprim\xE9","success"),Pe()}catch{S.show("Erreur lors de la suppression","error")}}})})}function ss(e){let t=e||It(),s={...Ve(),...t};return`
        <div class="space-y-6">
            <div class="flex items-center gap-4">
                <button id="btn-back" class="p-2 rounded-xl border border-white/10 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </button>
                <h2 class="text-2xl font-bold text-white">${e&&e.id?"Modifier le contrat":"Nouveau contrat"}</h2>
                <div class="ml-auto flex gap-2">
                    <button id="rp-save" class="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-900/20 flex items-center gap-2">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        <span>Sauvegarder</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <!-- Form -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-bold text-white flex items-center gap-2">
                                <i data-lucide="settings-2" class="w-5 h-5 text-blue-500"></i>
                                Configuration
                            </h3>
                            <button id="rp-generate" class="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 transition-colors">
                                <i data-lucide="refresh-cw" class="w-3 h-3"></i> Aper\xE7u
                            </button>
                        </div>

                        <div id="simple-fields" class="space-y-5">
                            ${Re("simple_title","Titre du document",s.simple_title,"type")}
                            ${Re("simple_logo_url","Logo (URL)",s.simple_logo_url,"image")}
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${Re("simple_fournisseur","Fournisseur",s.simple_fournisseur,"store")}
                                ${Re("simple_partenaire","Partenaire",s.simple_partenaire,"users")}
                            </div>
                            ${kt("simple_eng_fournisseur","Engagements du Fournisseur",s.simple_eng_fournisseur)}
                            ${kt("simple_eng_partenaire","Engagements du Partenaire",s.simple_eng_partenaire)}
                            ${Re("simple_duree","Dur\xE9e & Validit\xE9",s.simple_duree,"clock")}
                            <div class="grid grid-cols-2 gap-4">
                                ${Re("simple_fait_a","Fait \xE0",s.simple_fait_a,"map-pin")}
                                <div>
                                    <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                                    <div class="relative group">
                                        <input id="simple_date" type="date" value="${s.simple_date||""}" class="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all [color-scheme:dark]">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Preview -->
                <div class="lg:col-span-3">
                    <div class="sticky top-6">
                        <div class="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 md:p-8 shadow-2xl relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                            <div class="overflow-x-auto pb-4 custom-scrollbar">
                                <div id="rp-preview" class="bg-white text-slate-900 shadow-2xl mx-auto relative" style="width: 210mm; min-height: 297mm; padding: 20mm; transform-origin: top center;">
                                    <!-- Preview content injected by JS -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `}function Re(e,t,s,a){return`
        <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">${t}</label>
            <div class="relative group">
                <i data-lucide="${a}" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors"></i>
                <input id="${e}" value="${ye(s)}" class="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all">
            </div>
        </div>
    `}function kt(e,t,s){return`
        <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">${t}</label>
            <div class="relative">
                <textarea id="${e}" rows="4" class="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-y">${ye(s)}</textarea>
            </div>
        </div>
    `}function as(e){let t={...Ve(),...e,...e?{}:It()};["simple_title","simple_logo_url","simple_fournisseur","simple_partenaire","simple_eng_fournisseur","simple_eng_partenaire","simple_duree","simple_fait_a","simple_date"].forEach(a=>{let r=document.getElementById(a);r&&r.addEventListener("input",()=>{t[a]=r.value,We(t),(!e||!e.id)&&is(t)})}),document.getElementById("btn-back").addEventListener("click",()=>{Te="list",Pe()}),document.getElementById("rp-save").addEventListener("click",async()=>{if(ls(t).length){S.show("Veuillez remplir le fournisseur et le partenaire","error");return}try{let r={id:e&&e.id||Ce(),title:t.simple_title,fournisseur:t.simple_fournisseur,partenaire:t.simple_partenaire,date:t.simple_date,created_by:u.getCurrentUser().id,content_json:{simple_logo_url:t.simple_logo_url,simple_eng_fournisseur:t.simple_eng_fournisseur,simple_eng_partenaire:t.simple_eng_partenaire,simple_duree:t.simple_duree,simple_fait_a:t.simple_fait_a}};if(await u.saveContract(r),S.show("Contrat sauvegard\xE9","success"),!e||!e.id)try{localStorage.removeItem("contracts_rp_state")}catch{}Te="list",Pe()}catch(r){console.error(r),S.show("Erreur lors de la sauvegarde","error")}}),document.getElementById("rp-generate")?.addEventListener("click",()=>We(t))}function rs(e){if(!e)return"<div>Contrat introuvable</div>";let t={simple_title:e.title,simple_fournisseur:e.fournisseur,simple_partenaire:e.partenaire,simple_date:e.date,...e.content_json};return`
        <div class="space-y-6">
            <div class="flex items-center gap-4">
                <button id="btn-back-view" class="p-2 rounded-xl border border-white/10 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </button>
                <h2 class="text-2xl font-bold text-white">${ye(t.simple_title)}</h2>
                <div class="ml-auto flex gap-2">
                    <button id="rp-pdf-view" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 flex items-center gap-2">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        <span>T\xE9l\xE9charger PDF</span>
                    </button>
                </div>
            </div>

            <div class="flex justify-center">
                <div class="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 md:p-8 shadow-2xl relative overflow-hidden max-w-4xl w-full">
                    <div class="overflow-x-auto pb-4 custom-scrollbar flex justify-center">
                        <div id="rp-preview" class="bg-white text-slate-900 shadow-2xl relative shrink-0" style="width: 210mm; min-height: 297mm; padding: 20mm; transform-origin: top center;">
                            <!-- Preview content injected by JS -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `}function os(){document.getElementById("btn-back-view").addEventListener("click",()=>{Te="list",Pe()}),document.getElementById("rp-pdf-view").addEventListener("click",()=>{if(ve){let e={simple_title:ve.title,simple_fournisseur:ve.fournisseur,simple_partenaire:ve.partenaire,simple_date:ve.date,...ve.content_json,id:ve.id};cs(e)}})}function $t(e){let t=e.simple_logo_url||localStorage.getItem("brand_logo_url"),s=e.simple_title||"CONTRAT DE PARTENARIAT COMMERCIAL",a=new Date,r=e.simple_date?ns(e.simple_date):a.toLocaleDateString("fr-FR"),o=e.simple_fait_a||"",i=`REF-${(e.simple_date?String(e.simple_date):new Date().toISOString().slice(0,10)).replace(/-/g,"")}-${ct(e.simple_fournisseur||"PARTNER").substring(0,4)}`.toUpperCase(),c=String(e.simple_fournisseur||"").trim(),g=String(e.simple_partenaire||"").trim(),w=c?ye(c):'<span class="text-slate-400 italic font-sans bg-slate-50 px-2 py-0.5 rounded">Nom du Fournisseur</span>',m=g?ye(g):'<span class="text-slate-400 italic font-sans bg-slate-50 px-2 py-0.5 rounded">Nom du Partenaire</span>',d=St(e.simple_eng_fournisseur),n=St(e.simple_eng_partenaire),v=e.simple_duree||"Le contrat prend effet d\xE8s sa signature et reste valide jusqu\u2019\xE0 r\xE9siliation par accord mutuel ou en cas de non-respect des engagements.";return`
        <div id="rp-header" class="flex flex-col items-center gap-4 mb-10">
            <div id="rp-logo" class="h-24 w-auto object-contain">${t?`<img src="${t}" alt="logo" class="h-full w-auto object-contain mx-auto">`:""}</div>
            <div class="text-center space-y-1">
                <h3 id="rp-title" class="text-2xl font-extrabold tracking-widest uppercase text-slate-900 font-serif border-b-2 border-slate-900 pb-2 mb-2 inline-block">${ye(s)}</h3>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Document Officiel \u2022 DriveLine Customs</div>
            </div>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 mb-8 font-mono border-b border-slate-100 pb-4">
            <span class="flex items-center gap-2">
                ${o?`<span class="font-bold text-slate-700">${ye(o)}</span>`:""}
                ${o?'<span class="mx-2 text-slate-300">|</span>':""}
                <span>${r}</span>
            </span>
            <span class="bg-slate-100 px-2 py-1 rounded">${i}</span>
        </div>

        <div class="space-y-6 font-serif text-[14px] leading-relaxed text-slate-700">
            <div class="rounded-xl border-2 border-slate-100 bg-slate-50/50 p-6 mb-8">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center font-sans">ENTRE LES SOUSSIGN\xC9S</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-slate-200 hidden md:block"></div>
                    <div class="text-center">
                        <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans mb-1">Fournisseur</div>
                        <div class="text-xl font-bold text-slate-900 font-serif">${w}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans mb-1">Partenaire</div>
                        <div class="text-xl font-bold text-slate-900 font-serif">${m}</div>
                    </div>
                </div>
            </div>

            <div class="group">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 font-sans">1</div>
                    <div class="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">Objet du contrat</div>
                </div>
                <div class="pl-9 text-justify">
                    Le pr\xE9sent contrat formalise un partenariat commercial reposant sur un \xE9change de services et/ou de fournitures entre les Parties.
                </div>
            </div>

            <div class="group">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 font-sans">2</div>
                    <div class="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">Engagements du Fournisseur</div>
                </div>
                <div class="pl-9">
                    ${d.length?`<ul class="space-y-2">${d.map(f=>`<li class="flex items-start gap-2"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span><span>${ye(f)}</span></li>`).join("")}</ul>`:'<div class="text-slate-400 italic font-sans bg-slate-50 p-3 rounded-lg border border-slate-100 text-center text-xs">Aucun engagement d\xE9fini pour le moment.</div>'}
                </div>
            </div>

            <div class="group">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 font-sans">3</div>
                    <div class="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">Engagements du Partenaire</div>
                </div>
                <div class="pl-9">
                    ${n.length?`<ul class="space-y-2">${n.map(f=>`<li class="flex items-start gap-2"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span><span>${ye(f)}</span></li>`).join("")}</ul>`:'<div class="text-slate-400 italic font-sans bg-slate-50 p-3 rounded-lg border border-slate-100 text-center text-xs">Aucun engagement d\xE9fini pour le moment.</div>'}
                </div>
            </div>

            <div class="group">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 font-sans">4</div>
                    <div class="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">Dur\xE9e & R\xE9siliation</div>
                </div>
                <div class="pl-9 text-justify">
                    ${ye(v)}
                </div>
            </div>
        </div>

        <div class="mt-auto pt-10 border-t-2 border-slate-100">
            <div class="grid grid-cols-2 gap-8">
                <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 h-32 flex flex-col relative">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans mb-1">Pour le Fournisseur</div>
                    <div class="font-bold text-slate-900 font-serif text-sm">${w}</div>
                </div>
                <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 h-32 flex flex-col relative">
                    <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans mb-1">Pour le Partenaire</div>
                    <div class="font-bold text-slate-900 font-serif text-sm">${m}</div>
                </div>
            </div>
            <div class="text-center mt-6">
                <div class="inline-block px-4 py-2 bg-slate-100 rounded-full text-[10px] text-slate-500 font-sans font-medium">
                    Fait \xE0 <span class="text-slate-900 font-bold">${ye(e.simple_fait_a||".......")}</span>, le <span class="text-slate-900 font-bold">${r}</span>
                </div>
            </div>
        </div>
    `}function We(e){let t=document.getElementById("rp-preview");t&&(t.innerHTML=$t(e))}function Ve(){return{simple_title:"CONTRAT DE PARTENARIAT COMMERCIAL",simple_logo_url:"",simple_fournisseur:"",simple_partenaire:"DriveLine Customs",simple_eng_fournisseur:"",simple_eng_partenaire:"",simple_duree:"",simple_fait_a:"",simple_date:new Date().toISOString().slice(0,10)}}function It(){let e=null;try{e=JSON.parse(localStorage.getItem("contracts_rp_state"))}catch{}return{...Ve(),...e}}function is(e){try{localStorage.setItem("contracts_rp_state",JSON.stringify(e))}catch{}}function ls(e){let t=[];return String(e.simple_fournisseur||"").trim()||t.push("simple_fournisseur"),String(e.simple_partenaire||"").trim()||t.push("simple_partenaire"),t}function ns(e){try{return new Date(e).toLocaleDateString("fr-FR")}catch{return e}}function ye(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function St(e){return(e||"").split(/\r?\n/).map(t=>t.trim()).filter(Boolean)}function ct(e){return String(e||"").trim().toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_\-]+/g,"").slice(0,32)||"contrat"}async function cs(e){let t=document.getElementById("rp-preview");if(!(!t||!window.jspdf||!window.html2canvas))try{let a=await window.html2canvas(t,{scale:2,backgroundColor:"#ffffff",logging:!1}),{jsPDF:r}=window.jspdf,o=new r("p","mm","a4"),l=210,i=297,c=l/a.width,g=Math.floor(i/c),w=0,m=0,d=document.createElement("canvas").getContext("2d");for(d.canvas.width=a.width;w<a.height;){let f=Math.min(g,a.height-w);d.canvas.height=f,d.fillStyle="#ffffff",d.fillRect(0,0,d.canvas.width,f),d.drawImage(a,0,w,a.width,f,0,0,a.width,f),m>0&&o.addPage(),o.addImage(d.canvas.toDataURL("image/jpeg",.95),"JPEG",0,0,l,f*c),w+=f,m++}let n=ct(e.simple_fournisseur||"Fournisseur"),v=ct(e.simple_partenaire||"Partenaire");o.save(`Contrat_${n}_${v}.pdf`),S.show("PDF t\xE9l\xE9charg\xE9","success")}catch(s){console.error(s),S.show("Erreur PDF","error")}}function Ct(){let e=ie.getUser();return setTimeout(()=>{let t=document.getElementById("absence-form");if(t){let s=new Date().toISOString().split("T")[0],a=document.getElementById("absence-start"),r=document.getElementById("absence-end");a&&(a.min=s),r&&(r.min=s),a&&r&&a.addEventListener("change",()=>{r.min=a.value}),t.addEventListener("submit",async o=>{o.preventDefault();let l=document.getElementById("absence-submit-btn");l.disabled=!0,l.innerHTML='<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Envoi...',window.lucide&&lucide.createIcons();let i=new FormData(o.target),c=i.get("start"),g=i.get("end"),w=i.get("reason");if(!c||!g||!w){S.show("Veuillez remplir tous les champs.","warning"),l.disabled=!1,l.innerHTML=`<i data-lucide="send" class="w-4 h-4"></i> D\xE9clarer l'absence`,window.lucide&&lucide.createIcons();return}try{await u.declareAbsence(e.id,{start:c,end:g,reason:w}),S.show("Absence d\xE9clar\xE9e et compte bloqu\xE9 pour la p\xE9riode.","success"),window.location.hash="#dashboard"}catch(m){console.error(m),S.show("Erreur lors de la d\xE9claration : "+m.message,"error"),l.disabled=!1,l.innerHTML=`<i data-lucide="send" class="w-4 h-4"></i> D\xE9clarer l'absence`,window.lucide&&lucide.createIcons()}})}},100),`
        <div class="max-w-2xl mx-auto animate-fade-in">
            <div class="mb-6 flex items-center gap-4">
                <a href="#dashboard" class="text-slate-400 hover:text-white transition-colors">
                    <i data-lucide="arrow-left" class="w-6 h-6"></i>
                </a>
                <h2 class="text-2xl font-bold text-white">D\xE9clarer une Absence</h2>
            </div>

            <div class="bg-slate-900/70 glass rounded-2xl shadow-lg border border-slate-700 p-7 md:p-8">
                <div class="h-1 w-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 mb-7"></div>
                
                <div class="mb-6 p-4 rounded-xl bg-blue-900/20 border border-blue-700/30 flex items-start gap-3">
                    <i data-lucide="info" class="w-5 h-5 text-blue-400 mt-0.5"></i>
                    <div class="text-sm text-blue-200/80">
                        <p class="font-bold text-blue-300 mb-1">Information importante</p>
                        D\xE9clarer une absence bloquera automatiquement votre compte (cr\xE9ation de factures et pointeuse) pour la p\xE9riode indiqu\xE9e. Une notification sera envoy\xE9e \xE0 la direction.
                    </div>
                </div>

                <form id="absence-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Date de d\xE9but</label>
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
                            D\xE9clarer l'absence
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `}function Tt(){let e=null;try{let i=sessionStorage.getItem("imo_account_lock");e=i?JSON.parse(i):null}catch{e=null}let t=e&&e.reason!=null?String(e.reason).trim():"",s=e&&e.start!=null?String(e.start).trim():"",a=e&&e.end!=null?String(e.end).trim():"",r=i=>{let c=String(i||"").trim(),g=c.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!g)return c||"--";let w=Number(g[1]),m=Number(g[2])-1,d=Number(g[3]);return new Date(Date.UTC(w,m,d,0,0,0,0)).toLocaleDateString("fr-FR",{year:"numeric",month:"2-digit",day:"2-digit"})},o=s&&a?`${r(s)} \u2192 ${r(a)}`:"",l=(()=>{let i=String(a||"").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!i)return!1;let c=Number(i[1]),g=Number(i[2])-1,w=Number(i[3]),m=Date.UTC(c,g,w,23,59,59,999);return Date.now()>m})();return`
        <div class="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-10 animate-fade-in">
            <div class="w-full max-w-xl bg-slate-900/70 glass rounded-2xl border border-red-500/20 p-8 shadow-lg shadow-black/30">
                <div class="flex items-start gap-4">
                    <div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                        <i data-lucide="lock" class="w-6 h-6"></i>
                    </div>
                    <div class="min-w-0">
                        <h2 class="text-2xl font-extrabold text-white tracking-tight">Compte bloqu\xE9</h2>
                        <p class="text-slate-300 mt-1">${l?"La p\xE9riode de blocage semble termin\xE9e. Reconnecte-toi.":"Aucun acc\xE8s n\u2019est autoris\xE9 pendant la p\xE9riode de blocage."}</p>
                        <div class="mt-5 space-y-2">
                            <div class="text-sm text-slate-300"><span class="text-slate-400">Statut :</span> <span class="font-bold text-red-300">${l?"Bloqu\xE9 (fin pass\xE9e)":"Bloqu\xE9"}</span></div>
                            <div class="text-sm text-slate-300 ${o?"":"hidden"}"><span class="text-slate-400">P\xE9riode :</span> <span class="font-mono">${o}</span></div>
                            <div class="text-sm text-slate-300 ${t?"":"hidden"}"><span class="text-slate-400">Motif :</span> <span class="font-semibold">${t}</span></div>
                        </div>
                        <div class="mt-8 flex justify-end gap-3">
                            <button type="button" onclick="try{sessionStorage.removeItem('imo_account_lock')}catch(e){}; window.location.hash='#login';" class="px-6 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors font-semibold">
                                Retour \xE0 la connexion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `}function Lt(){return setTimeout(ds,50),`
        <div class="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <!-- Header -->
            <div class="relative bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 overflow-hidden shadow-2xl">
                <div class="absolute top-0 right-0 p-8 opacity-10">
                    <i data-lucide="user-circle" class="w-64 h-64 text-blue-500 transform rotate-12 translate-x-12 -translate-y-12"></i>
                </div>
                
                <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div class="relative group">
                        <div class="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl font-bold text-slate-500 shadow-xl" id="profile-avatar">
                            --
                        </div>
                        <div class="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-slate-800"></div>
                    </div>
                    
                    <div class="flex-1 text-center md:text-left">
                        <h2 class="text-4xl font-black text-white tracking-tight mb-2" id="profile-name">Chargement...</h2>
                        <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                            <span class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-bold uppercase tracking-wider" id="profile-role">--</span>
                            <span class="px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600 text-sm flex items-center gap-2">
                                <i data-lucide="calendar" class="w-3 h-3"></i>
                                Arriv\xE9 le <span id="profile-date">--</span>
                            </span>
                        </div>
                        
                        <div class="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div class="bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700">
                                <p class="text-[10px] uppercase font-bold text-slate-500 mb-1">Total G\xE9n\xE9r\xE9</p>
                                <p class="text-2xl font-mono font-bold text-white" id="profile-total-revenue">--</p>
                            </div>
                            <div class="bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700">
                                <p class="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Prime</p>
                                <p class="text-2xl font-mono font-bold text-emerald-400" id="profile-total-commission">--</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Left Column: Personal Info & Settings -->
                <div class="space-y-6">
                    <!-- Informations -->
                    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                        <div class="p-6 border-b border-slate-700 bg-slate-900/30">
                            <h3 class="font-bold text-white flex items-center gap-2">
                                <i data-lucide="info" class="w-5 h-5 text-blue-400"></i>
                                Mes Informations
                            </h3>
                        </div>
                        <div class="p-6 space-y-4">
                            <div>
                                <label class="text-xs text-slate-500 uppercase font-bold block mb-1">Num\xE9ro de t\xE9l\xE9phone</label>
                                <div class="flex gap-2">
                                    <input type="text" id="profile-phone" class="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" placeholder="Non renseign\xE9">
                                    <button id="save-phone-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                        <i data-lucide="save" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </div>
                            

                            <div class="pt-4 border-t border-slate-700">
                                <label class="text-xs text-slate-500 uppercase font-bold block mb-1">Pr\xE9f\xE9rences</label>
                                <div class="flex items-center justify-between py-2">
                                    <span class="text-sm text-slate-300">Mode Sombre</span>
                                    <div class="w-10 h-5 bg-blue-600 rounded-full relative cursor-not-allowed opacity-50">
                                        <div class="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Security -->
                    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                        <div class="p-6 border-b border-slate-700 bg-slate-900/30">
                            <h3 class="font-bold text-white flex items-center gap-2">
                                <i data-lucide="shield" class="w-5 h-5 text-red-400"></i>
                                S\xE9curit\xE9
                            </h3>
                        </div>
                        <div class="p-6">
                            <button id="logout-btn-profile" class="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg px-4 py-3 font-bold transition-all flex items-center justify-center gap-2 group">
                                <i data-lucide="log-out" class="w-5 h-5 group-hover:-translate-x-1 transition-transform"></i>
                                Se d\xE9connecter
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Stats & History -->
                <div class="lg:col-span-2 space-y-6">
                    
                    <!-- Weekly Progress -->
                    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg p-6">
                        <h3 class="font-bold text-white mb-6 flex items-center gap-2">
                            <i data-lucide="trending-up" class="w-5 h-5 text-emerald-400"></i>
                            Performance Semaine en cours
                        </h3>
                        
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                                <div class="text-xs text-slate-400 mb-1">Ventes</div>
                                <div class="text-2xl font-bold text-white" id="week-sales-count">0</div>
                            </div>
                            <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                                <div class="text-xs text-slate-400 mb-1">Commissions</div>
                                <div class="text-2xl font-bold text-emerald-400" id="week-commission">0 $</div>
                            </div>
                        </div>

                        <!-- Mini Chart Placeholder -->
                        <div class="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                            <div class="h-full bg-blue-500 w-[0%] transition-all duration-1000" id="week-progress-bar"></div>
                        </div>
                        <div class="flex items-center justify-between text-xs text-slate-500">
                            <span>Progression</span>
                            <div class="flex items-center gap-2 group">
                                <span>Objectif: <span id="week-goal-display" class="font-bold text-slate-400">10 000 $</span></span>
                                <button id="edit-goal-btn" class="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300">
                                    <i data-lucide="pencil" class="w-3 h-3"></i>
                                </button>
                            </div>
                        </div>
                        <div id="goal-edit-container" class="hidden mt-2 flex items-center gap-2">
                            <input type="number" id="week-goal-input" class="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none" placeholder="Montant">
                            <button id="save-goal-btn" class="text-green-400 hover:text-green-300"><i data-lucide="check" class="w-4 h-4"></i></button>
                            <button id="cancel-goal-btn" class="text-red-400 hover:text-red-300"><i data-lucide="x" class="w-4 h-4"></i></button>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                        <div class="p-6 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
                            <h3 class="font-bold text-white flex items-center gap-2">
                                <i data-lucide="history" class="w-5 h-5 text-purple-400"></i>
                                Derni\xE8res Activit\xE9s
                            </h3>
                            <button onclick="window.location.hash='#mysales'" class="text-xs text-blue-400 hover:text-blue-300 font-medium">Tout voir</button>
                        </div>
                        <div class="divide-y divide-slate-700/50" id="profile-activity-list">
                            <div class="p-8 text-center text-slate-500">
                                <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-500 border-r-transparent mb-2"></div>
                                <p>Chargement...</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `}async function ds(){let e=u.getCurrentUser();if(!e)return;let t=u.getEmployees().find(I=>I.id===e.id);if(!t)try{await u.fetchEmployees(),t=u.getEmployees().find(I=>I.id===e.id)}catch(I){console.error("Failed to fetch employee details",I)}t&&(e={...e,...t});let s=e.first_name||e.firstName||"",a=e.last_name||e.lastName||"",r=e.role||"",o=e.phone||"",l=e.iban||"",i=e.created_at||new Date().toISOString(),c=document.getElementById("profile-avatar"),g=document.getElementById("profile-name"),w=document.getElementById("profile-role"),m=document.getElementById("profile-date"),d=document.getElementById("profile-total-revenue"),n=document.getElementById("profile-total-commission"),v=document.getElementById("profile-phone"),f=document.getElementById("profile-iban"),y=document.getElementById("save-phone-btn"),h=document.getElementById("logout-btn-profile"),b=document.getElementById("profile-activity-list"),p=document.getElementById("week-sales-count"),k=document.getElementById("week-commission"),x=document.getElementById("week-progress-bar"),E=document.getElementById("week-goal-display"),T=document.getElementById("edit-goal-btn"),P=document.getElementById("goal-edit-container"),C=document.getElementById("week-goal-input"),R=document.getElementById("save-goal-btn"),_=document.getElementById("cancel-goal-btn");g&&(g.textContent=`${s} ${a}`),c&&(c.textContent=`${s[0]||""}${a[0]||""}`),w&&(w.textContent=r.replace("_"," ")),m&&(m.textContent=new Date(i).toLocaleDateString("fr-FR")),v&&(v.value=o),f&&(f.value=l),h&&(h.onclick=()=>{localStorage.removeItem("sb-auth-token"),localStorage.removeItem("user"),window.location.reload()}),y&&(y.onclick=async()=>{let I=v.value.trim();try{await u.updateEmployee(e.id,{phone:I}),S.show("Num\xE9ro de t\xE9l\xE9phone mis \xE0 jour","success")}catch(A){console.error(A),S.show("Erreur lors de la mise \xE0 jour","error")}});try{await u.fetchTimeEntries();let{data:I}=await u.fetchSalesPage(1,1e3,{employeeId:e.id}),A=I.reduce((O,Z)=>O+(Number(Z.price)-Number(Z.cost||0)),0),H=u.calculateTotalPay(e,I);d&&(d.textContent=B(A)),n&&(n.textContent=B(H));let q=new Date,M=q.getDay(),V=q.getDate()-M+(M===0?-6:1),W=new Date(q.setDate(V));W.setHours(0,0,0,0);let N=I.filter(O=>new Date(O.date)>=W),$=N.reduce((O,Z)=>O+(Number(Z.price)-Number(Z.cost||0)),0),L=u.calculateTotalPay(e,N);p&&(p.textContent=N.length),k&&(k.textContent=B(L));let j=`user_weekly_goal_${e.id}`,F=1e4;try{let O=localStorage.getItem(j);O&&(F=Number(O))}catch{}let X=()=>{let O=Math.min(100,L/F*100);if(x){x.style.width=`${O}%`;let Z="h-full transition-all duration-1000 rounded-full",ee="bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]";O>=100?ee="bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]":O>=75?ee="bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]":O>=50?ee="bg-gradient-to-r from-yellow-500 to-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]":O>=25&&(ee="bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"),x.className=`${Z} ${ee}`}E&&(E.textContent=B(F))};if(X(),T&&(T.onclick=()=>{P&&P.classList.remove("hidden"),C&&(C.value=F,C.focus())}),_&&(_.onclick=()=>{P&&P.classList.add("hidden")}),R&&(R.onclick=()=>{let O=Number(C.value);isFinite(O)&&O>0?(F=O,localStorage.setItem(j,String(F)),X(),P&&P.classList.add("hidden"),S.show("Objectif mis \xE0 jour !")):S.show("Montant invalide","warning")}),b){let O=I.slice(0,5);O.length===0?b.innerHTML='<div class="p-8 text-center text-slate-500">Aucune activit\xE9 r\xE9cente</div>':b.innerHTML=O.map(Z=>`
                    <div class="p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300">
                                <i data-lucide="wrench" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <p class="font-bold text-white text-sm">${Z.vehicleModel}</p>
                                <p class="text-xs text-slate-500">${new Date(Z.date).toLocaleDateString("fr-FR")} \u2022 ${Z.serviceType}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-mono font-bold text-white">${B(Z.price)}</p>
                            <p class="text-xs text-emerald-400 font-mono">+${B((Number(Z.price)-Number(Z.cost||0))*(e.commission_rate||.15))}</p>
                        </div>
                    </div>
                `).join("")}}catch(I){console.error("Profile load error",I)}window.lucide&&lucide.createIcons()}function Pt(){let e=[],t=[],s=[];return setTimeout(()=>{let a=document.getElementById("search-plate"),r=document.getElementById("plates-table-body"),o=document.getElementById("plates-count"),l=document.getElementById("plate-history-modal"),i=document.getElementById("plate-history-content"),c=document.getElementById("close-modal-btn");async function g(){r&&(r.innerHTML='<tr><td colspan="6" class="p-12 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-r-transparent"></div></td></tr>');try{e=(await u.fetchSalesPage(1,2e3,{})).data,w(),m()}catch(d){console.error(d),r&&(r.innerHTML='<tr><td colspan="6" class="p-8 text-center text-red-500">Erreur de chargement</td></tr>')}}function w(){let d=new Map;e.forEach(n=>{let v=(n.plate||"INCONNU").toUpperCase().trim();if(!v||v==="INCONNU")return;d.has(v)||d.set(v,{plate:v,vehicle:n.vehicleModel||"Inconnu",client:n.clientName||"Inconnu",phone:n.clientPhone||"",visits:0,totalSpent:0,lastVisit:new Date(0),history:[]});let f=d.get(v);f.visits++,f.totalSpent+=Number(n.price||0);let y=new Date(n.date);y>f.lastVisit&&(f.lastVisit=y,n.vehicleModel&&(f.vehicle=n.vehicleModel),n.clientName&&(f.client=n.clientName),n.clientPhone&&(f.phone=n.clientPhone)),f.history.push(n)}),t=Array.from(d.values()).sort((n,v)=>v.lastVisit-n.lastVisit),s=t}function m(){if(!r)return;if(document.getElementById("stat-unique-count")){document.getElementById("stat-unique-count").textContent=t.length;let n=t.reduce((f,y)=>f+y.totalSpent,0);document.getElementById("stat-total-spent").textContent=B(n);let v=t.reduce((f,y)=>f.totalSpent>y.totalSpent?f:y,{client:"--",totalSpent:0});document.getElementById("stat-top-client").textContent=v.client,document.getElementById("stat-top-client-amt").textContent=B(v.totalSpent)}let d=a?a.value.toLowerCase():"";if(s=t.filter(n=>n.plate.toLowerCase().includes(d)||n.client.toLowerCase().includes(d)||n.vehicle.toLowerCase().includes(d)),o&&(o.textContent=`${s.length} v\xE9hicules r\xE9pertori\xE9s`),s.length===0){r.innerHTML='<tr><td colspan="7" class="p-12 text-center text-slate-500 italic">Aucun v\xE9hicule trouv\xE9 dans les archives.</td></tr>';return}r.innerHTML=s.map(n=>`
                <tr class="hover:bg-slate-700/40 transition-all border-b border-slate-700/50 last:border-0 group cursor-pointer" onclick="window.viewPlateHistory('${n.plate}')">
                    <td class="p-5 pl-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors">
                                <i data-lucide="car-front" class="w-5 h-5"></i>
                            </div>
                            <div class="font-bold text-white text-base font-mono bg-slate-900/50 px-2.5 py-1 rounded border border-slate-700 group-hover:border-blue-500/50 transition-colors">${n.plate}</div>
                        </div>
                    </td>
                    <td class="p-5">
                        <div class="font-bold text-slate-200">${n.vehicle}</div>
                    </td>
                    <td class="p-5">
                        <div class="font-medium text-white">${n.client}</div>
                        ${n.phone?`<div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><i data-lucide="phone" class="w-3 h-3"></i> ${n.phone}</div>`:""}
                    </td>
                    <td class="p-5 text-center">
                        <div class="inline-flex flex-col items-center">
                            <span class="text-lg font-bold text-white">${n.visits}</span>
                            <span class="text-[10px] uppercase text-slate-500 font-bold">Visites</span>
                        </div>
                    </td>
                    <td class="p-5">
                        <div class="font-bold text-emerald-400 text-base">${B(n.totalSpent)}</div>
                        <div class="w-24 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-emerald-500" style="width: ${Math.min(100,n.totalSpent/5e4*100)}%"></div>
                        </div>
                    </td>
                    <td class="p-5 text-sm text-slate-400">
                        ${n.lastVisit.toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})}
                    </td>
                    <td class="p-5 text-right pr-6">
                        <button class="p-2 rounded-lg bg-slate-700 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                            <i data-lucide="chevron-right" class="w-5 h-5"></i>
                        </button>
                    </td>
                </tr>
            `).join(""),window.lucide&&lucide.createIcons()}window.viewPlateHistory=d=>{let n=t.find(f=>f.plate===d);if(!n)return;let v=n.history.sort((f,y)=>new Date(y.date)-new Date(f.date));i.innerHTML=`
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <div class="flex items-center gap-3 mb-1">
                            <h3 class="text-2xl font-bold text-white font-mono">${n.plate}</h3>
                            <span class="px-2 py-1 rounded bg-slate-700 text-xs text-slate-300 border border-slate-600">${n.vehicle}</span>
                        </div>
                        <p class="text-slate-400 text-sm">Propri\xE9taire: <span class="text-white">${n.client}</span> ${n.phone?`(${n.phone})`:""}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">Total D\xE9pens\xE9</p>
                        <p class="text-2xl font-bold text-emerald-400">${B(n.totalSpent)}</p>
                    </div>
                </div>

                <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    ${v.map(f=>{let y=u.getEmployeeByIdSync(f.employeeId),h=y?`${y.first_name} ${y.last_name}`:"Inconnu";return`
                        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                            <div class="flex justify-between items-start mb-2">
                                <div class="font-bold text-white text-sm">${f.serviceType}</div>
                                <div class="text-emerald-400 font-bold font-mono text-sm">${B(f.price)}</div>
                            </div>
                            <div class="flex justify-between items-end text-xs text-slate-500">
                                <div>
                                    <p>Par <span class="text-slate-400">${h}</span></p>
                                    <p class="mt-0.5">${new Date(f.date).toLocaleDateString("fr-FR")} \xE0 ${new Date(f.date).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</p>
                                </div>
                                <div>
                                    ${f.invoiceUrl?`<a href="${f.invoiceUrl}" target="_blank" class="text-blue-400 hover:underline flex items-center gap-1"><i data-lucide="external-link" class="w-3 h-3"></i> Facture</a>`:""}
                                </div>
                            </div>
                        </div>
                        `}).join("")}
                </div>
            `,l.classList.remove("hidden"),window.lucide&&lucide.createIcons()},a&&a.addEventListener("input",()=>m()),c&&(c.onclick=()=>{l.classList.add("hidden")}),l&&l.addEventListener("click",d=>{d.target===l&&l.classList.add("hidden")}),g()},100),`
        <div class="space-y-6 animate-fade-in pb-12">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
                <div class="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div class="relative z-10">
                    <h2 class="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <span class="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                            <i data-lucide="book" class="w-6 h-6"></i>
                        </span>
                        Annuaire Plaques
                    </h2>
                    <p class="text-slate-400 mt-2 font-medium" id="plates-count">Chargement des donn\xE9es...</p>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg group hover:border-blue-500/30 transition-colors">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">V\xE9hicules Uniques</p>
                            <h3 class="text-2xl font-bold text-white mt-1" id="stat-unique-count">--</h3>
                        </div>
                        <div class="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <i data-lucide="car" class="w-5 h-5"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg group hover:border-emerald-500/30 transition-colors">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total D\xE9pens\xE9 (Global)</p>
                            <h3 class="text-2xl font-bold text-emerald-400 mt-1" id="stat-total-spent">--</h3>
                        </div>
                        <div class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <i data-lucide="dollar-sign" class="w-5 h-5"></i>
                        </div>
                    </div>
                </div>
                <div class="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg group hover:border-purple-500/30 transition-colors">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Client</p>
                            <h3 class="text-lg font-bold text-white mt-1 truncate max-w-[150px]" id="stat-top-client">--</h3>
                            <p class="text-xs text-purple-400" id="stat-top-client-amt">--</p>
                        </div>
                        <div class="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <i data-lucide="crown" class="w-5 h-5"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search Bar -->
            <div class="bg-slate-800 p-1 rounded-xl shadow-lg border border-slate-700 max-w-2xl mx-auto transform transition-all focus-within:scale-[1.02] focus-within:ring-2 focus-within:ring-blue-500/50">
                <div class="relative flex items-center">
                    <i data-lucide="search" class="absolute left-4 w-5 h-5 text-slate-400"></i>
                    <input type="text" id="search-plate" autocomplete="off" placeholder="Rechercher une plaque, un client, un mod\xE8le..." class="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-slate-500 outline-none text-base font-medium">
                    <div class="absolute right-3 hidden md:flex items-center gap-2 pointer-events-none">
                        <kbd class="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-600 bg-slate-700 px-1.5 font-mono text-[10px] font-medium text-slate-400">CTRL+F</kbd>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead class="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th class="p-5 pl-6">Plaque</th>
                                <th class="p-5">V\xE9hicule</th>
                                <th class="p-5">Dernier Proprio.</th>
                                <th class="p-5 text-center">Fid\xE9lit\xE9</th>
                                <th class="p-5">Total Investi</th>
                                <th class="p-5">Derni\xE8re Venue</th>
                                <th class="p-5 text-right pr-6"></th>
                            </tr>
                        </thead>
                        <tbody id="plates-table-body" class="divide-y divide-slate-700/50 bg-slate-800/50">
                            <!-- JS Content -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- History Modal -->
        <div id="plate-history-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
            <div class="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl transform transition-all scale-100">
                <div class="p-6 relative">
                    <button id="close-modal-btn" class="absolute right-4 top-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                    <div id="plate-history-content">
                        <!-- JS Injected -->
                    </div>
                </div>
            </div>
        </div>
    `}function At(){let e=ie.getUser(),t=e&&e.role==="patron",s={paint:{label:"Peinture",icon:"palette",color:"text-pink-500",bg:"bg-pink-500/10",border:"border-pink-500/20"},rouge:{label:"Rouge",icon:"palette",color:"text-red-500",bg:"bg-red-500/10",border:"border-red-500/20"},bleu:{label:"Bleu",icon:"palette",color:"text-blue-500",bg:"bg-blue-500/10",border:"border-blue-500/20"},vert:{label:"Vert",icon:"palette",color:"text-green-500",bg:"bg-green-500/10",border:"border-green-500/20"},jaune:{label:"Jaune",icon:"palette",color:"text-yellow-400",bg:"bg-yellow-400/10",border:"border-yellow-400/20"},orange:{label:"Orange",icon:"palette",color:"text-orange-500",bg:"bg-orange-500/10",border:"border-orange-500/20"},violet:{label:"Violet",icon:"palette",color:"text-purple-500",bg:"bg-purple-500/10",border:"border-purple-500/20"},rose:{label:"Rose",icon:"palette",color:"text-pink-500",bg:"bg-pink-500/10",border:"border-pink-500/20"},blanc:{label:"Blanc",icon:"palette",color:"text-slate-100",bg:"bg-slate-100/10",border:"border-slate-100/20"},noir:{label:"Noir",icon:"palette",color:"text-slate-400",bg:"bg-black/40",border:"border-slate-600"},gris:{label:"Gris",icon:"palette",color:"text-gray-400",bg:"bg-gray-400/10",border:"border-gray-400/20"},marron:{label:"Marron",icon:"palette",color:"text-amber-700",bg:"bg-amber-700/10",border:"border-amber-700/20"},metal:{label:"M\xE9tal",icon:"sparkles",color:"text-slate-300",bg:"bg-slate-300/10",border:"border-slate-300/20"},mat:{label:"Mat",icon:"layers",color:"text-slate-500",bg:"bg-slate-500/10",border:"border-slate-500/20"},chrome:{label:"Chrome",icon:"sparkles",color:"text-cyan-200",bg:"bg-cyan-200/10",border:"border-cyan-200/20"},or:{label:"Or",icon:"sparkles",color:"text-yellow-500",bg:"bg-yellow-500/10",border:"border-yellow-500/20"},nacre:{label:"Nacr\xE9",icon:"sparkles",color:"text-pink-300",bg:"bg-pink-300/10",border:"border-pink-300/20"},engine:{label:"Moteur",icon:"zap",color:"text-orange-400",bg:"bg-orange-400/10",border:"border-orange-400/20"},brakes:{label:"Freins",icon:"disc",color:"text-red-400",bg:"bg-red-400/10",border:"border-red-400/20"},transmission:{label:"Transmission",icon:"git-merge",color:"text-blue-400",bg:"bg-blue-400/10",border:"border-blue-400/20"},suspension:{label:"Suspension",icon:"move-vertical",color:"text-indigo-400",bg:"bg-indigo-400/10",border:"border-indigo-400/20"},turbo:{label:"Turbo",icon:"wind",color:"text-cyan-400",bg:"bg-cyan-400/10",border:"border-cyan-400/20"},body:{label:"Carrosserie",icon:"car",color:"text-emerald-400",bg:"bg-emerald-400/10",border:"border-emerald-400/20"},wheels:{label:"Roues",icon:"circle",color:"text-slate-400",bg:"bg-slate-400/10",border:"border-slate-400/20"},interior:{label:"Int\xE9rieur",icon:"armchair",color:"text-purple-400",bg:"bg-purple-400/10",border:"border-purple-400/20"},lights:{label:"\xC9clairage",icon:"lightbulb",color:"text-yellow-400",bg:"bg-yellow-400/10",border:"border-yellow-400/20"},other:{label:"Autre",icon:"box",color:"text-slate-300",bg:"bg-slate-700/50",border:"border-slate-600"}},a={all:{label:"Tout",icon:"grid"},paint:{label:"Peintures",icon:"palette",categories:["paint","rouge","bleu","vert","jaune","orange","violet","rose","blanc","noir","gris","marron","metal","mat","chrome","or","nacre"]},performance:{label:"Performance",icon:"gauge",categories:["engine","brakes","transmission","suspension","turbo"]},aesthetic:{label:"Esth\xE9tique",icon:"car",categories:["wheels","interior","body","lights","other"]}},r={catalog:[],activeItems:new Set,searchTerm:"",activeTab:"all",targetPrice:null},o=`
        <div id="tuning-calculator-root" class="space-y-6 animate-fade-in pb-24 max-w-7xl mx-auto">
            
            <!-- TOP BAR: ACTIONS & TOTALS -->
            <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 flex flex-col lg:flex-row justify-between items-center gap-6 sticky top-4 z-30 backdrop-blur-md bg-slate-900/90">
                <div class="flex items-center gap-5 w-full lg:w-auto">
                    <div class="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-300">
                        <i data-lucide="calculator" class="w-8 h-8 text-white"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-white leading-none tracking-tight">Calculateur</h2>
                        <div class="flex gap-6 text-sm mt-2 items-center">
                            <span class="text-slate-400 font-medium">Total: <span id="header-total" class="text-white font-mono font-bold text-lg ml-1">$0</span></span>
                            ${t?'<span class="text-emerald-500 font-medium flex items-center gap-1">Profit: <span id="header-profit" class="font-mono font-bold text-lg">$0</span></span>':""}
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                    <!-- MAGIC WAND -->
                    <div class="group flex items-center bg-slate-800/50 rounded-xl border border-slate-700 p-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                        <input type="number" id="magic-input" placeholder="Budget..." class="bg-transparent border-none text-white text-sm w-28 px-3 py-1.5 outline-none text-right font-mono placeholder-slate-500" />
                        <button data-action="magic-calc" class="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/20" title="Calcul Automatique">
                            <i data-lucide="wand-2" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <div class="h-8 w-px bg-slate-700 mx-1 hidden sm:block"></div>

                    <button data-action="refresh" class="p-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all hover:scale-105" title="Rafra\xEEchir">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    </button>
                    
                    ${t?`
                    <button data-action="open-add-modal" class="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span class="hidden sm:inline">Ajouter</span>
                    </button>`:""}
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <!-- LEFT: CATALOG -->
                <div class="lg:col-span-8 space-y-6">
                    <!-- TABS -->
                    <div class="flex flex-wrap gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800 w-fit" id="catalog-tabs">
                        ${Object.entries(a).map(([n,v])=>`
                            <button data-action="switch-tab" data-tab="${n}" 
                                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${n===r.activeTab?"bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 scale-105":"text-slate-400 hover:text-white hover:bg-slate-800"}">
                                <i data-lucide="${v.icon}" class="w-4 h-4"></i>
                                ${v.label}
                            </button>
                        `).join("")}
                    </div>

                    <!-- Search & Filter -->
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i data-lucide="search" class="w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors"></i>
                        </div>
                        <input type="text" id="catalog-search" placeholder="Rechercher une pi\xE8ce, couleur..." 
                            class="block w-full rounded-2xl border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 py-4 pl-12 pr-4 shadow-sm transition-all text-sm" />
                    </div>

                    <!-- Catalog List -->
                    <div class="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden min-h-[500px]">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-bold">
                                    <tr>
                                        <th class="p-5 w-16 text-center">
                                            <i data-lucide="check-square" class="w-4 h-4 mx-auto opacity-50"></i>
                                        </th>
                                        <th class="p-5">Article</th>
                                        <th class="p-5 hidden sm:table-cell">Cat\xE9gorie</th>
                                        <th class="p-5 text-right">Prix Client</th>
                                        ${t?'<th class="p-5 text-right hidden sm:table-cell text-slate-500">Co\xFBt</th>':""}
                                        ${t?'<th class="p-5 w-12"></th>':""}
                                    </tr>
                                </thead>
                                <tbody id="catalog-list" class="divide-y divide-slate-800">
                                    <tr><td colspan="${t?6:4}" class="p-12 text-center"><div class="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: RECEIPT -->
                <div class="lg:col-span-4 space-y-6">
                    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden text-slate-900 transform transition-all sticky top-32">
                        <!-- Receipt Header -->
                        <div class="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                            <h3 class="font-bold text-slate-800 flex items-center gap-3 text-lg">
                                <div class="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <i data-lucide="receipt" class="w-5 h-5 text-indigo-600"></i>
                                </div>
                                Ticket
                            </h3>
                            <span class="text-xs font-mono font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-100" id="receipt-date">--/--</span>
                        </div>
                        
                        <!-- Receipt Items -->
                        <div class="p-5 min-h-[300px] max-h-[600px] overflow-y-auto bg-slate-50/50 space-y-3 custom-scrollbar" id="receipt-items">
                            <div class="flex flex-col items-center justify-center h-full py-12 text-slate-400 space-y-3 opacity-60">
                                <i data-lucide="shopping-cart" class="w-12 h-12 stroke-1"></i>
                                <span class="italic text-sm">Aucun article s\xE9lectionn\xE9</span>
                            </div>
                        </div>

                        <!-- Receipt Footer -->
                        <div class="bg-white border-t border-slate-200 p-6 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10">
                            <div class="flex justify-between items-end">
                                <span class="text-slate-500 font-medium text-sm mb-1">Total Client</span>
                                <span class="font-bold font-mono text-3xl tracking-tight text-slate-800" id="receipt-total">$0.00</span>
                            </div>
                            
                            ${t?`
                            <div class="pt-3 border-t border-slate-100 space-y-2">
                                <div class="flex justify-between text-xs text-slate-400">
                                    <span>Co\xFBt Entreprise</span>
                                    <span class="font-mono" id="receipt-cost">$0.00</span>
                                </div>
                                <div class="flex justify-between text-sm items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                    <span class="text-emerald-700 font-bold flex items-center gap-2">
                                        <i data-lucide="trending-up" class="w-4 h-4"></i> Marge
                                    </span>
                                    <span class="font-bold font-mono text-emerald-700 text-lg" id="receipt-profit">$0.00</span>
                                </div>
                            </div>`:""}

                            <button data-action="create-invoice" class="w-full group relative overflow-hidden py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 mt-4">
                                <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                <span>G\xE9n\xE9rer Facture</span>
                                <i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <!-- MODAL ADD -->
            <div id="modal-add" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 hidden flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                    <div class="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <h3 class="font-bold text-white text-lg">Ajouter un article</h3>
                        <button data-action="close-modal" class="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                    </div>
                    <div class="p-8 space-y-6">
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom de l'article</label>
                            <input type="text" id="inp-name" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600" placeholder="Ex: Peinture Rouge Sang" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cat\xE9gorie</label>
                            <div class="relative">
                                <select id="inp-cat" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                                    <optgroup label="Peintures">
                                        <option value="paint">Peinture</option>
                                    </optgroup>
                                    <optgroup label="Performance">
                                        ${a.performance.categories.map(n=>`<option value="${n}">${s[n].label}</option>`).join("")}
                                    </optgroup>
                                    <optgroup label="Esth\xE9tique">
                                        ${a.aesthetic.categories.map(n=>`<option value="${n}">${s[n].label}</option>`).join("")}
                                    </optgroup>
                                </select>
                                <i data-lucide="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none"></i>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <label class="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Prix Client</label>
                                <div class="relative">
                                    <input type="number" id="inp-price" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder-slate-600" placeholder="0" />
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Co\xFBt Garage</label>
                                <div class="relative">
                                    <input type="number" id="inp-cost" class="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none placeholder-slate-600" placeholder="0" />
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">$</span>
                                </div>
                            </div>
                        </div>
                        <button data-action="save-item" class="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Enregistrer l'article
                        </button>
                    </div>
                </div>
            </div>

        </div>
    `;async function l(){try{let n=await u.getTuningCatalog();r.catalog=n||[],i(),c()}catch(n){console.error(n),S.show("Erreur de chargement","error")}}function i(){let n=document.getElementById("catalog-list"),v=document.getElementById("catalog-tabs");if(!n)return;v&&(v.innerHTML=Object.entries(a).map(([h,b])=>`
                <button data-action="switch-tab" data-tab="${h}" 
                    class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${h===r.activeTab?"bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20":"bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700"}">
                    <i data-lucide="${b.icon}" class="w-4 h-4"></i>
                    ${b.label}
                </button>
            `).join(""));let f=r.searchTerm.toLowerCase(),y=r.catalog.filter(h=>{let b=h.name.toLowerCase().includes(f)||(s[h.category]?.label||"").toLowerCase().includes(f),p=!0;return r.activeTab!=="all"&&(p=a[r.activeTab].categories.includes(h.category)),b&&p});if(y.length===0){n.innerHTML=`<tr><td colspan="${t?6:4}" class="p-8 text-center text-slate-500 italic">Aucun r\xE9sultat.</td></tr>`;return}y.sort((h,b)=>{let p=r.activeItems.has(h.id),k=r.activeItems.has(b.id);return p!==k?k-p:h.category!==b.category?h.category.localeCompare(b.category):h.name.localeCompare(b.name)}),n.innerHTML=y.map(h=>{let b=s[h.category]||s.other,p=r.activeItems.has(h.id);return`
                <tr class="group border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer ${p?"bg-blue-900/10":""}" 
                    data-action="toggle-item" data-id="${h.id}">
                    <td class="p-4 text-center">
                        <div class="w-5 h-5 mx-auto rounded border ${p?"bg-blue-500 border-blue-500":"border-slate-600 bg-slate-800"} flex items-center justify-center transition-colors">
                            ${p?'<i data-lucide="check" class="w-3.5 h-3.5 text-white"></i>':""}
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="font-bold text-white">${h.name}</div>
                        <div class="sm:hidden text-xs text-slate-400 mt-1">${b.label}</div>
                    </td>
                    <td class="p-4 hidden sm:table-cell">
                        <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${b.bg} ${b.color} ${b.border}">
                            <i data-lucide="${b.icon}" class="w-3 h-3"></i>
                            ${b.label}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        <div class="font-mono font-bold text-emerald-400">${B(h.price)}</div>
                    </td>
                    ${t?`
                    <td class="p-4 text-right hidden sm:table-cell">
                        <div class="font-mono text-slate-500 text-sm">${B(h.cost)}</div>
                    </td>
                    <td class="p-4 text-center">
                        <button type="button" data-action="delete-item" data-id="${h.id}" class="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors z-10 relative">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </td>`:""}
                </tr>
            `}).join(""),window.lucide&&lucide.createIcons()}function c(){let n=document.getElementById("receipt-items"),v=document.getElementById("receipt-total"),f=document.getElementById("receipt-cost"),y=document.getElementById("receipt-profit"),h=document.getElementById("header-total"),b=document.getElementById("header-profit");if(!n)return;let p=r.catalog.filter(C=>r.activeItems.has(C.id)),k=0,x=0;p.forEach(C=>{k+=Number(C.price),x+=Number(C.cost)});let E=k,T=0;r.targetPrice&&r.targetPrice>k&&(E=r.targetPrice,T=r.targetPrice-k);let P=E-x;if(v&&(v.textContent=B(E)),f&&(f.textContent=B(x)),y&&(y.textContent=B(P)),h&&(h.textContent=B(E)),b&&(b.textContent=B(P)),p.length===0&&T===0)n.innerHTML='<div class="text-center text-slate-400 italic py-8 text-sm">Aucun article s\xE9lectionn\xE9</div>';else{let C=p.map(R=>`
                <div class="flex justify-between items-center p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div class="text-sm">
                        <div class="font-bold text-slate-700">${R.name}</div>
                        <div class="text-xs text-slate-400">${s[R.category]?.label||"Autre"}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-mono font-bold text-slate-800">${B(R.price)}</div>
                        <button data-action="remove-receipt-item" data-id="${R.id}" class="text-xs text-red-400 hover:text-red-600 hover:underline">Retirer</button>
                    </div>
                </div>
            `).join("");T>0&&(C+=`
                <div class="flex justify-between items-center p-2 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm border-l-4 border-l-indigo-500">
                    <div class="text-sm">
                        <div class="font-bold text-indigo-900">Ajustement / Main d'oeuvre</div>
                        <div class="text-xs text-indigo-500">Pour atteindre l'objectif</div>
                    </div>
                    <div class="text-right">
                        <div class="font-mono font-bold text-indigo-700">${B(T)}</div>
                        <div class="text-[10px] text-indigo-400 italic">Marge 100%</div>
                    </div>
                </div>
                `),n.innerHTML=C}document.getElementById("receipt-date").textContent=new Date().toLocaleDateString()}async function g(){let n=document.getElementById("inp-name"),v=document.getElementById("inp-cat"),f=document.getElementById("inp-price"),y=document.getElementById("inp-cost"),h=document.querySelector('[data-action="save-item"]'),b=n.value.trim(),p=parseFloat(f.value),k=parseFloat(y.value)||0;if(!b||isNaN(p)){S.show("Nom et prix requis","warning");return}try{h.disabled=!0,h.innerHTML='<i class="animate-spin" data-lucide="loader-2"></i>',window.lucide&&lucide.createIcons(),await u.saveTuningItem({id:null,name:b,category:v.value,price:p,cost:k}),n.value="",f.value="",y.value="",document.getElementById("modal-add").classList.add("hidden"),S.show("Article ajout\xE9"),await l()}catch(x){console.error(x),S.show("Erreur lors de la sauvegarde","error")}finally{h.disabled=!1,h.textContent="Enregistrer"}}async function w(n){se.show({title:"Supprimer l'article",message:"Voulez-vous vraiment supprimer cet article du catalogue ?",type:"danger",confirmText:"Supprimer",onConfirm:async()=>{try{await u.deleteTuningItem(n),r.activeItems.delete(n),r.catalog=r.catalog.filter(v=>v.id!==n),i(),c(),S.show("Article supprim\xE9")}catch(v){console.error(v),S.show("Impossible de supprimer","error")}}})}function m(){let n=document.getElementById("magic-input"),v=parseFloat(n.value);if(!v||v<=0){S.show("Veuillez entrer un montant valide","warning");return}r.activeItems.clear(),r.targetPrice=v;let f=[...r.catalog].sort((b,p)=>p.price-b.price),y=0;for(let b of f)y+b.price<=v&&(r.activeItems.add(b.id),y+=b.price);i(),c();let h=v-y;h>0?S.show(`Cible atteinte : ${B(v)} (dont ${B(h)} ajustement)`):S.show(`Cible atteinte : ${B(y)}`)}function d(){let n=document.getElementById("tuning-calculator-root");if(!n){setTimeout(d,50);return}if(n.dataset.initialized)return;n.dataset.initialized="true",l(),n.addEventListener("click",f=>{let y=f.target.closest('[data-action="delete-item"]');if(y){f.preventDefault(),f.stopPropagation(),w(y.dataset.id);return}if(f.target.id==="modal-add"){document.getElementById("modal-add").classList.add("hidden");return}let h=f.target.closest("[data-action]");if(!h)return;let b=h.dataset.action,p=h.dataset.id,k=h.dataset.tab;if(b==="switch-tab")r.activeTab=k,i();else if(b==="toggle-item")r.activeItems.has(p)?r.activeItems.delete(p):r.activeItems.add(p),i(),c();else if(b==="remove-receipt-item")r.activeItems.delete(p),i(),c();else if(b==="open-add-modal")document.getElementById("modal-add").classList.remove("hidden");else if(b==="close-modal")document.getElementById("modal-add").classList.add("hidden");else if(b==="save-item")g();else if(b==="magic-calc")m();else if(b==="refresh")r.activeItems.clear(),r.targetPrice=null,l(),S.show("Rafra\xEEchi");else if(b==="create-invoice"){if(r.activeItems.size===0&&!r.targetPrice){S.show("Aucun article s\xE9lectionn\xE9","warning");return}let x=0,E=0,T=r.catalog.filter(R=>r.activeItems.has(R.id));T.forEach(R=>{x+=Number(R.price),E+=Number(R.cost)});let P=x,C=0;r.targetPrice&&r.targetPrice>x&&(P=r.targetPrice,C=r.targetPrice-x),localStorage.setItem("last_tuning_calc",JSON.stringify({price:P,cost:E,items:T.map(R=>({name:R.name,category:R.category,price:R.price})),adjustment:C,date:new Date})),window.location.hash=`#sales/new?price=${P}&cost=${E}`,S.show("Redirection vers la facture...")}});let v=document.getElementById("catalog-search");v&&v.addEventListener("input",f=>{r.searchTerm=f.target.value,i()})}return setTimeout(d,0),o}async function Dt(){let e=u.getCurrentUser();if(!e)return"";let t=us(e);return setTimeout(()=>{let s=document.getElementById("sign-contract-form"),a=document.getElementById("signature-input"),r=document.getElementById("accept-check"),o=document.getElementById("btn-sign");if(s){let l=()=>{let i=(a.value||"").trim().toLowerCase(),c=`${e.firstName} ${e.lastName}`.toLowerCase(),g=i.length>3;o.disabled=!r.checked||!g};a.addEventListener("input",l),r.addEventListener("change",l),s.addEventListener("submit",async i=>{i.preventDefault(),o.disabled=!0,o.innerHTML='<i data-lucide="loader-2" class="animate-spin w-4 h-4 mr-2"></i> Signature en cours...',window.lucide&&lucide.createIcons();try{await u.signEmploymentContract({employee_id:e.id,signature:a.value.trim(),content_html:t,role_at_signature:e.role}),S.show("Contrat sign\xE9 avec succ\xE8s ! Bienvenue.","success"),window.location.hash="#dashboard"}catch(c){console.error(c),S.show("Erreur lors de la signature.","error"),o.disabled=!1,o.innerHTML="Signer le contrat"}})}},100),`
        <div class="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div class="max-w-4xl w-full bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                <!-- Contract Preview (Scrollable) -->
                <div class="flex-1 p-8 md:p-12 overflow-y-auto max-h-[80vh] bg-slate-50 border-r border-slate-200">
                    <div class="prose prose-slate prose-sm max-w-none">
                        ${t}
                    </div>
                </div>

                <!-- Action Panel -->
                <div class="w-full md:w-80 bg-white p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200 z-10 shadow-xl">
                    <div class="mb-6 text-center">
                        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                            <i data-lucide="pen-tool" class="w-8 h-8"></i>
                        </div>
                        <h2 class="text-xl font-bold text-slate-900">Signature Requise</h2>
                        <p class="text-sm text-slate-500 mt-2">Veuillez lire et signer votre contrat pour acc\xE9der \xE0 l'intranet.</p>
                    </div>

                    <form id="sign-contract-form" class="space-y-6">
                        <div class="space-y-3">
                            <label class="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input type="checkbox" id="accept-check" class="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                                <span class="text-sm text-slate-600 select-none">Je d\xE9clare avoir lu et accept\xE9 les termes du pr\xE9sent contrat de travail.</span>
                            </label>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-bold uppercase text-slate-500 tracking-wider">Signature \xE9lectronique</label>
                            <input type="text" id="signature-input" placeholder="Tapez votre Pr\xE9nom et Nom" 
                                class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-serif text-lg italic text-slate-800 placeholder:not-italic placeholder:text-slate-400 placeholder:font-sans transition-all">
                            <p class="text-xs text-slate-400">Pour valider, tapez : <span class="font-bold text-slate-600">${e.firstName} ${e.lastName}</span></p>
                        </div>

                        <button type="submit" id="btn-sign" disabled class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                            <i data-lucide="file-signature" class="w-5 h-5"></i>
                            <span>Signer le contrat</span>
                        </button>
                    </form>
                    
                    <div class="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button onclick="store.logout(); window.location.reload();" class="text-xs text-red-500 hover:text-red-700 font-medium hover:underline">
                            Se d\xE9connecter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `}function us(e){let t=new Date().toLocaleDateString("fr-FR"),s=ps(e.role),a={mecano_confirme:15,mecano_junior:15,chef_atelier:15,patron:0,co_patron:0};try{let l=localStorage.getItem("db_payroll_role_primes");l&&(a=JSON.parse(l))}catch{}let o=(l=>{let c=Number(a&&a[l==="mecano"?"mecano_confirme":l]);return isFinite(c)&&c>=0?Math.max(0,Math.min(100,Math.round(c))):15})(e.role);return`
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold uppercase tracking-widest text-slate-900 mb-2">Contrat de Travail</h1>
            <div class="text-xs font-bold text-slate-400 uppercase">DriveLine Customs \u2022 Los Santos</div>
        </div>

        <div class="mb-8 text-xs font-mono text-slate-500 flex justify-between border-b border-slate-200 pb-2">
            <span>Date: ${t}</span>
            <span>R\xE9f: EMP-${e.id.slice(0,8).toUpperCase()}</span>
        </div>

        <p class="mb-4"><strong>ENTRE LES SOUSSIGN\xC9S :</strong></p>
        
        <p class="mb-4">
            <strong>L'Entreprise DriveLine Customs</strong>, dont le si\xE8ge social est situ\xE9 \xE0 Los Santos, repr\xE9sent\xE9e par la Direction.<br>
            Ci-apr\xE8s d\xE9nomm\xE9e "l'Employeur",
        </p>

        <p class="mb-6">
            <strong>ET</strong><br><br>
            <strong>M./Mme ${e.firstName} ${e.lastName}</strong><br>
            Ci-apr\xE8s d\xE9nomm\xE9(e) "le Salari\xE9",
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 1 - Engagement et Fonctions</h3>
        <p class="mb-4">
            Le Salari\xE9 est engag\xE9 en qualit\xE9 de <strong>${s}</strong>. 
            Il s'engage \xE0 consacrer son activit\xE9 professionnelle au service de l'entreprise et \xE0 respecter les directives donn\xE9es par la hi\xE9rarchie.
        </p>
        <p class="mb-4">
            Ses missions principales incluent :
            <ul class="list-disc pl-5 space-y-1 mt-2">
                <li>R\xE9alisation des prestations m\xE9caniques et d'entretien.</li>
                <li>Accueil et conseil de la client\xE8le.</li>
                <li>Respect des proc\xE9dures de s\xE9curit\xE9 et d'hygi\xE8ne.</li>
                <li>Maintien de la propret\xE9 des locaux et du mat\xE9riel.</li>
            </ul>
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 2 - R\xE9mun\xE9ration</h3>
        <p class="mb-4">
            En contrepartie de son travail, le Salari\xE9 percevra une r\xE9mun\xE9ration compos\xE9e de :
            <ul class="list-disc pl-5 space-y-1 mt-2">
                <li>Un taux horaire de <strong>500$ / heure</strong> de service effectif (pointage).</li>
                <li>Une commission sur le chiffre d'affaires g\xE9n\xE9r\xE9, selon le bar\xE8me en vigueur (actuellement <strong>${o}%</strong> pour votre poste).</li>
                <li>Des primes \xE9ventuelles selon les performances et d\xE9cisions de la direction.</li>
            </ul>
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 3 - Horaires de Travail</h3>
        <p class="mb-4">
            Les horaires de travail sont flexibles et d\xE9finis selon les besoins de l'activit\xE9. 
            Le Salari\xE9 doit imp\xE9rativement utiliser le syst\xE8me de pointage pour enregistrer ses heures de prise et fin de service. 
            Toute heure non point\xE9e ne pourra \xEAtre r\xE9mun\xE9r\xE9e.
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 4 - Confidentialit\xE9 et Loyaut\xE9</h3>
        <p class="mb-4">
            Le Salari\xE9 est tenu \xE0 une obligation de discr\xE9tion absolue concernant les informations confidentielles de l'entreprise et de ses clients. 
            Il s'engage \xE0 ne pas d\xE9tourner la client\xE8le \xE0 son profit ou au profit d'un tiers.
        </p>

        <h3 class="text-lg font-bold text-slate-900 mt-6 mb-3">Article 5 - R\xE8glement Int\xE9rieur</h3>
        <p class="mb-4">
            Le Salari\xE9 d\xE9clare avoir pris connaissance du r\xE8glement int\xE9rieur de l'entreprise et s'engage \xE0 le respecter. 
            Tout manquement pourra faire l'objet de sanctions disciplinaires pouvant aller jusqu'au licenciement.
        </p>
        
        <div class="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between items-end">
            <div class="text-center w-1/3">
                <div class="text-xs font-bold uppercase text-slate-400 mb-4">Pour l'Employeur</div>
                <div class="font-serif font-bold text-lg text-slate-900">La Direction</div>
            </div>
            <div class="text-center w-1/3">
                <div class="text-xs font-bold uppercase text-slate-400 mb-4">Le Salari\xE9</div>
                <div class="font-serif italic text-slate-500">(Signature \xE9lectronique en attente)</div>
            </div>
        </div>
    `}function ps(e){return{patron:"Patron",co_patron:"Co-Patron",chef_atelier:"Chef d'Atelier",mecano_confirme:"M\xE9cano Confirm\xE9",mecano_junior:"M\xE9cano Junior",responsable_rh:"Responsable RH"}[e]||e}function Bt(){return setTimeout(async()=>{try{let e=await u.fetchRepairKitConfig(),t=e.stock,s=e.price,a=document.getElementById("stock-display");if(a&&(a.innerText=`Stock disponible : ${t}`,a.classList.remove("hidden"),t<=0)){let l=document.querySelector('button[type="submit"]');l&&(l.disabled=!0,l.innerText="Rupture de stock",l.classList.add("opacity-50","cursor-not-allowed"))}let r=document.getElementById("unit-price-display");r&&(r.innerText=`${new Intl.NumberFormat("fr-FR").format(s)} $`);let o=document.getElementById("order-kit-form");o&&(o.dataset.price=s)}catch(e){console.error(e)}},100),`
        <div class="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white relative overflow-hidden">
            <!-- Background Elements -->
            <div class="absolute inset-0 z-0 bg-gradient-to-br from-[#dd3bcc]/10 via-black/30 to-[#4bb4d3]/10"></div>
            <div class="absolute -left-24 -top-24 w-80 h-80 rounded-full blur-3xl bg-[#dd3bcc]/20"></div>
            <div class="absolute -right-24 -bottom-24 w-80 h-80 rounded-full blur-3xl bg-[#4bb4d3]/20"></div>

            <div class="relative z-10 w-full max-w-lg p-6 animate-fade-in">
                <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl">
                    
                    <div class="text-center mb-6">
                        <div class="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4 shadow-lg shadow-orange-500/10">
                            <i data-lucide="package" class="w-8 h-8 text-orange-500"></i>
                        </div>
                        <h1 class="text-2xl font-extrabold text-white tracking-tight">Commande de Kits</h1>
                        <p class="text-slate-400 mt-2 text-sm">Prix unitaire : <span id="unit-price-display" class="text-white font-bold">... $</span></p>
                        <div id="stock-display" class="hidden mt-2 inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-orange-300">
                            Chargement du stock...
                        </div>
                    </div>

                    <form id="order-kit-form" class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nom & Pr\xE9nom</label>
                                <div class="relative group">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i data-lucide="user" class="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                                    </div>
                                    <input type="text" name="clientName" required
                                        class="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm" 
                                        placeholder="Ex: John Doe">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">T\xE9l\xE9phone</label>
                                <div class="relative group">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i data-lucide="phone" class="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                                    </div>
                                    <input type="text" name="phone" required
                                        class="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm" 
                                        placeholder="Ex: 555-0199">
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Disponibilit\xE9s (pour r\xE9cup\xE9ration)</label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i data-lucide="clock" class="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                                </div>
                                <input type="text" name="availability" required
                                    class="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm" 
                                    placeholder="Ex: Ce soir apr\xE8s 21h, demain aprem...">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Quantit\xE9 souhait\xE9e</label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i data-lucide="layers" class="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors"></i>
                                </div>
                                <input type="number" name="quantity" id="inp-qty" min="1" required
                                    class="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-bold" 
                                    placeholder="Ex: 5">
                            </div>
                        </div>

                        <!-- Total Price Display -->
                        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex justify-between items-center">
                            <span class="text-slate-400 text-sm">Total estim\xE9 :</span>
                            <span id="total-price" class="text-xl font-bold text-white">0 $</span>
                        </div>

                        <button type="submit" 
                            class="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-900/20 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            <span class="inline-flex items-center gap-2">
                                <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                                <span>Confirmer la commande</span>
                            </span>
                        </button>
                    </form>

                    <div class="mt-6 pt-6 border-t border-slate-800 text-center">
                        <a href="#login" class="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            <i data-lucide="arrow-left" class="w-4 h-4"></i>
                            Retour \xE0 l'accueil
                        </a>
                    </div>

                </div>
            </div>
        </div>
    `}function jt(){let e=document.getElementById("order-kit-form");if(e){let t=document.getElementById("inp-qty"),s=document.getElementById("total-price"),a=()=>parseFloat(e.dataset.price)||2500;t&&s&&t.addEventListener("input",()=>{let r=parseInt(t.value)||0,o=a(),l=r*o;s.innerText=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(l).replace("$","")+" $",s.classList.toggle("text-orange-400",r>0)}),e.addEventListener("submit",async r=>{r.preventDefault();let o=e.querySelector('button[type="submit"]'),l=o.innerHTML;try{o.disabled=!0,o.innerHTML='<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>',window.lucide&&lucide.createIcons();let i=new FormData(e),c=i.get("clientName"),g=parseInt(i.get("quantity")),w=i.get("phone"),m=i.get("availability");if(!c||g<=0||!w||!m)throw new Error("Veuillez remplir tous les champs.");await u.createRepairKitOrder(c,g,w,m);let d=a();S.show(`Commande envoy\xE9e ! Total: ${g*d} $`,"success"),e.reset(),s&&(s.innerText="0 $"),setTimeout(()=>window.location.hash="#login",3e3)}catch(i){console.error(i),S.show("Erreur: "+i.message,"error")}finally{o.disabled=!1,o.innerHTML=l,window.lucide&&lucide.createIcons()}})}}function Nt(){let e=ie.getUser(),t=e&&(e.role==="patron"||e.role==="co_patron"||e.role==="responsable");return setTimeout(()=>{ms(t)},100),`
        <div class="min-h-screen bg-slate-950 text-white p-4 lg:p-8">
            <div class="max-w-7xl mx-auto space-y-8">
                <!-- Header -->
                <div class="text-center space-y-4">
                    <h1 class="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-lg">
                        \u{1F3B0} GRAND TIRAGE DRIVELINE \u{1F3B0}
                    </h1>
                    <p class="text-slate-400 text-lg">La chance sourit aux audacieux !</p>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <!-- Left: Wheel -->
                    <div class="xl:col-span-7 space-y-6">
                        <div class="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center">
                            <!-- Arrow -->
                            <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                                <i data-lucide="triangle" class="w-10 h-10 text-yellow-500 fill-current drop-shadow-lg rotate-180"></i>
                            </div>

                            <canvas id="wheelCanvas" width="500" height="500" class="max-w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-500"></canvas>
                            
                            <div class="mt-8">
                                <button onclick="window.tombolaSpin()" id="spinBtn" class="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
                                    LANCER LA ROUE \u{1F3B2}
                                </button>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                                <p class="text-slate-500 text-sm uppercase font-bold">Participants</p>
                                <p id="stat-participants" class="text-3xl font-black text-white">0</p>
                            </div>
                            <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
                                <p class="text-slate-500 text-sm uppercase font-bold">Tickets</p>
                                <p id="stat-tickets" class="text-3xl font-black text-orange-500">0</p>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Controls -->
                    <div class="xl:col-span-5 space-y-6">
                        ${t?`
                        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h3 class="text-xl font-bold text-white flex items-center gap-2">
                                <i data-lucide="plus-circle" class="w-5 h-5 text-green-500"></i>
                                Ajouter un participant
                            </h3>
                            <div class="space-y-3">
                                <div>
                                    <label class="text-xs text-slate-500 uppercase font-bold">Nom</label>
                                    <input type="text" id="t-name" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none" placeholder="Ex: Jean Dupont">
                                </div>
                                <div>
                                    <label class="text-xs text-slate-500 uppercase font-bold">Tickets</label>
                                    <input type="number" id="t-tickets" value="1" min="1" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none">
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="window.tombolaAdd()" class="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors">
                                        Ajouter
                                    </button>
                                    <button onclick="window.tombolaClear()" class="px-4 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-lg transition-colors" title="Tout effacer">
                                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        `:""}

                        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col max-h-[600px]">
                            <div class="p-4 border-b border-slate-800 bg-slate-950">
                                <h3 class="font-bold text-white">Liste des participants</h3>
                            </div>
                            <div id="tombola-list" class="flex-1 overflow-y-auto p-2 space-y-2">
                                <div class="text-center py-8 text-slate-500">Chargement...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `}var Me=[],Be=[],dt=!1,ae=null,Ne=null;async function ms(e){window.lucide&&lucide.createIcons(),Ne=document.getElementById("wheelCanvas"),Ne&&(ae=Ne.getContext("2d")),await Je(e)}async function Je(e){try{Me=await u.fetchTombolaEntries(),gs(),bs(e),fs(),qt()}catch(t){console.error(t),S.show("Erreur de chargement","error")}}function gs(){let e=[];Me.forEach(t=>{let s=Mt(t.name);for(let a=0;a<t.tickets;a++)e.push({name:t.name,color:s,id:t.id})});for(let t=e.length-1;t>0;t--){let s=Math.floor(Math.random()*(t+1));[e[t],e[s]]=[e[s],e[t]]}Be=e}function bs(e){let t=document.getElementById("tombola-list");if(t){if(Me.length===0){t.innerHTML='<div class="text-center py-10 text-slate-600 italic">Aucun participant pour le moment.</div>';return}t.innerHTML=Me.map(s=>`
        <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors group">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-900" style="background-color: ${Mt(s.name)}">
                    ${s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div class="font-bold text-white text-sm">${s.name}</div>
                    <div class="text-xs text-slate-400">${s.tickets} ticket${s.tickets>1?"s":""}</div>
                </div>
            </div>
            ${e?`
            <button onclick="window.tombolaDelete('${s.id}')" class="p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <i data-lucide="trash" class="w-4 h-4"></i>
            </button>
            `:""}
        </div>
    `).join(""),window.lucide&&lucide.createIcons()}}function fs(){let e=document.getElementById("stat-participants"),t=document.getElementById("stat-tickets");e&&(e.innerText=Me.length),t&&(t.innerText=Me.reduce((s,a)=>s+a.tickets,0))}var Rt=["#ef4444","#f97316","#f59e0b","#84cc16","#10b981","#06b6d4","#3b82f6","#8b5cf6","#d946ef","#f43f5e"];function Mt(e){let t=0;for(let a=0;a<e.length;a++)t=e.charCodeAt(a)+((t<<5)-t);let s=Math.abs(t)%Rt.length;return Rt[s]}function qt(e=0){if(!ae||!Ne)return;let t=Ne.width,s=Ne.height,a=t/2,r=s/2,o=Math.min(t,s)/2-20;if(ae.clearRect(0,0,t,s),Be.length===0){ae.beginPath(),ae.arc(a,r,o,0,2*Math.PI),ae.fillStyle="#1e293b",ae.fill(),ae.strokeStyle="#334155",ae.lineWidth=4,ae.stroke(),ae.fillStyle="#64748b",ae.font="20px Inter",ae.textAlign="center",ae.textBaseline="middle",ae.fillText("Ajoutez des joueurs",a,r);return}let l=2*Math.PI/Be.length;Be.forEach((i,c)=>{let g=e+c*l;if(ae.beginPath(),ae.moveTo(a,r),ae.arc(a,r,o,g,g+l),ae.fillStyle=i.color,ae.fill(),ae.stroke(),l>.035){ae.save(),ae.translate(a,r),ae.rotate(g+l/2),ae.textAlign="right",ae.fillStyle="white",ae.font="bold 12px Inter",ae.shadowColor="rgba(0,0,0,0.5)",ae.shadowBlur=4;let w=l<.1?10:15,m=i.name;m.length>w&&(m=m.substring(0,w)+".."),ae.fillText(m,o-10,5),ae.restore()}}),ae.beginPath(),ae.arc(a,r,40,0,2*Math.PI),ae.fillStyle="#ffffff",ae.fill(),ae.shadowColor="rgba(0,0,0,0.2)",ae.shadowBlur=10,ae.fillStyle="#0f172a",ae.font="24px Inter",ae.textAlign="center",ae.textBaseline="middle",ae.fillText("\u{1F3B0}",a,r+2)}window.tombolaAdd=async()=>{let e=document.getElementById("t-name"),t=document.getElementById("t-tickets");if(!e||!t)return;let s=e.value.trim(),a=parseInt(t.value);if(!s||a<1){S.show("Nom et tickets requis","warning");return}try{await u.addTombolaEntry(s,a),e.value="",t.value="1",S.show("Participant ajout\xE9 !","success"),Je(!0)}catch(r){console.error(r),S.show("Erreur d'ajout","error")}};window.tombolaDelete=async e=>{if(confirm("Supprimer ce participant ?"))try{await u.deleteTombolaEntry(e),Je(!0),S.show("Supprim\xE9")}catch{S.show("Erreur","error")}};window.tombolaClear=async()=>{if(confirm("TOUT supprimer ? Irr\xE9versible."))try{await u.clearTombolaEntries(),Je(!0),S.show("Tout effac\xE9")}catch{S.show("Erreur","error")}};window.tombolaSpin=()=>{if(dt||Be.length===0)return;dt=!0;let e=document.getElementById("spinBtn");e&&(e.disabled=!0);let t=0,s=0,a=4e3+Math.random()*2e3,r=.5+Math.random()*.5;function o(){s+=16;let l=s/a,i=r*(1-vs(l));t+=i,qt(t),s<a?requestAnimationFrame(o):hs(t)}o()};function hs(e){dt=!1;let t=document.getElementById("spinBtn");t&&(t.disabled=!1);let s=2*Math.PI/Be.length,a=e%(2*Math.PI),r=(1.5*Math.PI-a)%(2*Math.PI);r<0&&(r+=2*Math.PI);let o=Math.floor(r/s),l=Be[o];xs(),se.show({title:"\u{1F3C6} LE GAGNANT EST...",message:`
            <div class="text-center py-6">
                <div class="text-6xl mb-4">\u{1F389}</div>
                <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 mb-2">
                    ${l.name}
                </div>
                <p class="text-slate-400">F\xE9licitations !</p>
            </div>
        `,type:"success",confirmText:"Bravo !"})}function vs(e){return 1-Math.pow(1-e,4)}function xs(){if(!document.getElementById("confetti-style")){let e=document.createElement("style");e.id="confetti-style",e.innerHTML=`
            .confetti-piece {
                position: fixed;
                width: 10px; height: 10px;
                background-color: #f00;
                animation: fall linear forwards;
                z-index: 9999;
            }
            @keyframes fall {
                to { transform: translateY(100vh) rotate(720deg); }
            }
        `,document.head.appendChild(e)}for(let e=0;e<50;e++){let t=document.createElement("div");t.className="confetti-piece",t.style.left=Math.random()*100+"vw",t.style.top="-10px",t.style.backgroundColor=`hsl(${Math.random()*360}, 100%, 50%)`,t.style.animationDuration=Math.random()*2+2+"s",document.body.appendChild(t),setTimeout(()=>t.remove(),4e3)}}var qe=document.getElementById("app"),ws={"":{component:Ue,auth:!0},"#login":{component:gt,auth:!1},"#order-kit":{component:Bt,auth:!1},"#blocked":{component:Tt,auth:!1},"#apply":{component:yt,auth:!1},"#sign-contract":{component:Dt,auth:!0},"#dashboard":{component:Ue,auth:!0},"#tombola":{component:Nt,auth:!0,permission:"employees.view"},"#calculator":{component:At,auth:!0,permission:"sales.manage"},"#plates":{component:Pt,auth:!0},"#profile":{component:Lt,auth:!0},"#sales":{component:Ze,auth:!0},"#sales/new":{component:lt,auth:!0},"#contracts-rp":{component:Et,auth:!0,permission:"contracts.view"},"#admin-sales":{component:et,auth:!0,permission:"sales.view_all"},"#admin-stats":{component:Qe,auth:!0,permission:"sales.view_all"},"#admin-recruitment":{component:_t,auth:!0,permission:"recruitment.manage"},"#payroll":{component:ht,auth:!0,permission:"payroll.manage"},"#safe-management":{component:vt,auth:!0,permission:"payroll.manage"},"#employees":{component:rt,auth:!0,permission:"employees.view"},"#archives":{component:st,auth:!0,permission:"archives.manage"},"#admin-config":{component:Xe,auth:!0,permission:"config.manage"},"#employees/new":{component:ot,auth:!0,permission:"employees.manage"},"#pointeuse":{component:nt,auth:!0},"#absence":{component:Ct,auth:!0,permission:"absence.declare"}};async function Ge(){try{!ie.isAuthenticated()&&window.__accountLockInterval&&(clearInterval(window.__accountLockInterval),window.__accountLockInterval=null)}catch{}if(ie.isAuthenticated()){let l=ie.getUser();if(l&&!u.getCachedEmployeePermissions(l.id))try{await u.fetchEmployeePermissions(l.id)}catch{}}let e=window.location.hash||"",[t]=e.split("?");if(ie.isAuthenticated()){let l=ie.getUser();try{let i=await u.fetchEmployeeAccountLock(l.id),c=await u.fetchEmployeePermissions(l.id),g=u._isLockActive(i)?i:u.isLockActiveForPermissions(c)&&c&&c.lock?c.lock:null;if(u._isLockActive(g)){try{sessionStorage.setItem("imo_account_lock",JSON.stringify(g||{}))}catch{}u.logout(),window.location.hash="#blocked";return}if(window.location.hash!=="#sign-contract"&&window.location.hash!=="#login"&&window.location.hash!=="#blocked"&&sessionStorage.getItem("contract_signed_"+l.id)!=="true")try{if(await u.fetchEmploymentContract(l.id))sessionStorage.setItem("contract_signed_"+l.id,"true");else{window.location.hash="#sign-contract";return}}catch(m){console.error("Contract check failed",m)}}catch{u.logout(),window.location.hash="#login";return}try{window.__accountLockInterval&&clearInterval(window.__accountLockInterval)}catch{}window.__accountLockInterval=setInterval(async()=>{try{let i=ie.getUser();if(!i)return;let g=await u.fetchEmployeeAccountLock(i.id);if(!u._isLockActive(g)){let w=await u.fetchEmployeePermissions(i.id);g=u.isLockActiveForPermissions(w)&&w&&w.lock?w.lock:null}if(u._isLockActive(g)){try{sessionStorage.setItem("imo_account_lock",JSON.stringify(g||{}))}catch{}u.logout(),window.location.hash="#blocked"}}catch{}},2e4)}if(t==="#login"&&ie.isAuthenticated()){window.location.hash="#dashboard";return}let s=ws[t],a=null,r=!0,o=null;if(s)a=s.component,r=s.auth,o=s.permission||null;else if(t.startsWith("#employees/edit/")){let l=t.split("/edit/")[1],i=await u.getEmployeeById(l);if(!i){S.show("Employ\xE9 introuvable","error"),window.location.hash="#employees";return}a=()=>ot(i),r=!0,o="employees.manage"}else if(t.startsWith("#sales/edit/")){let l=t.split("/edit/")[1],i=await u.getSaleById(l);if(!i){S.show("Intervention introuvable","error"),window.location.hash="#dashboard";return}a=()=>lt(i),r=!0}else if(t.startsWith("#invoice/")){let l=t.split("/invoice/")[1],i=await u.getSaleById(l);if(u.getEmployees().length===0)try{await u.fetchEmployees()}catch{}if(!i){S.show("Facture introuvable","error"),window.location.hash="#dashboard";return}a=()=>wt(i),r=!0}else{window.location.hash=ie.isAuthenticated()?"#dashboard":"#login";return}if(r&&!ie.isAuthenticated()){window.location.hash="#login";return}if(o){let l=ie.getUser();if(!(u.hasPermissionSync(l,o)?!0:await u.hasPermission(l,o))){S.show("Acc\xE8s refus\xE9.","error"),window.location.hash="#dashboard";return}}{let l=document.getElementById("loading-spinner");if(!l&&!qe.innerHTML.trim()){let i=`
            <div id="loading-spinner" class="flex items-center justify-center h-full">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>`;try{qe.innerHTML=He(i)}catch{qe.innerHTML=i}}}try{let l="";if(t==="#employees"){await u.fetchSales();let i=await u.fetchEmployees();l=rt(i)}else if(t==="#dashboard"||t==="")await Promise.all([u.fetchSales(),u.fetchPayrollSettings(),u.fetchEmployees(),u.fetchWebhookSettings(),u.fetchTimeEntries()]),l=Ue();else if(t==="#sales")await Promise.all([u.fetchSales(),u.fetchPayrollSettings()]),l=Ze();else if(t==="#admin-sales")await u.fetchEmployees(),l=et();else if(t==="#admin-stats")await Promise.all([u.fetchSales(),u.fetchEmployees(),u.fetchPayrollSettings()]),l=Qe();else if(t==="#admin-config")try{l=Xe()}catch(i){console.error("Error executing AdminConfig:",i),l=`<div class="text-red-500 p-8">Erreur de chargement du module Configuration: ${i.message}</div>`}else if(t==="#archives")l=st();else if(t.startsWith("#pointeuse")){try{let i=ys();if(i.action){let c=ie.getUser();c?(i.action==="clock_in"?(await u.clockIn(c.id),S.show("Arriver: service d\xE9marr\xE9","success")):i.action==="clock_out"?(await u.clockOut(c.id),S.show("Sortir: service termin\xE9","success")):i.action==="pause"?(await u.pauseService(c.id),S.show("Pause activ\xE9e","info"),await Discord.updateServiceStatus()):i.action==="resume"&&(await u.resumeService(c.id),S.show("Reprise du service","success"),await Discord.updateServiceStatus()),setTimeout(()=>{window.location.hash="#pointeuse"},150)):(S.show("Connecte-toi pour ex\xE9cuter l'action.","warning"),window.location.hash="#login")}}catch(i){console.warn("Deep link action error:",i)}l=nt()}else{let i=a();i instanceof Promise?l=await i:l=i}try{qe.innerHTML=He(l)}catch{qe.innerHTML=l}window.lucide&&lucide.createIcons(),_s(e),e==="#admin-stats"?bt():e==="#order-kit"&&jt()}catch(l){console.error("Navigation error:",l),qe.innerHTML=He(`
            <div class="text-center p-8 text-red-600">
                <h2 class="text-xl font-bold">Une erreur est survenue</h2>
                <p>${l.message}</p>
                <button onclick="window.location.reload()" class="mt-4 bg-orange-500 text-white px-4 py-2 rounded">R\xE9essayer</button>
            </div>
        `)}}function ys(){let e=window.location.hash||"",t=e.indexOf("?");if(t<0)return{};let s=e.slice(t+1),a={};return s.split("&").forEach(r=>{let[o,l]=r.split("=");a[decodeURIComponent(o)]=decodeURIComponent(l||"")}),a}function _s(e){let t=document.getElementById("logout-btn");t&&t.addEventListener("click",()=>{ie.logout()});let s=document.getElementById("sidebar-admin-toggle"),a=document.getElementById("sidebar-admin-group"),r=document.getElementById("sidebar-admin-chevron"),o=(m,d=!0)=>{if(a&&(a.classList.toggle("hidden",!m),r&&r.classList.toggle("rotate-180",m),d))try{localStorage.setItem("sidebar_admin_open",m?"1":"0")}catch{}};s&&a&&s.addEventListener("click",m=>{m.preventDefault();let d=!a.classList.contains("hidden");o(!d,!0)});try{localStorage.removeItem("sidebar_compact")}catch{}let l=document.getElementById("sidebar-search"),i=m=>{let d=String(m||"").trim().toLowerCase(),n=Array.from(document.querySelectorAll("#sidebar a[data-nav-label]"));if(n.length===0)return;let v=!1;if(n.forEach(f=>{let y=String(f.getAttribute("data-nav-label")||"").toLowerCase(),h=!d||y.includes(d);f.style.display=h?"":"none",h&&(f.getAttribute("data-nav-group")||"")==="admin"&&(v=!0)}),d)a&&s&&o(v,!1);else{let f=(()=>{try{return localStorage.getItem("sidebar_admin_open")==="1"}catch{return!1}})();o(f,!1)}};l&&(l.addEventListener("input",()=>{try{sessionStorage.setItem("sidebar_search",l.value||"")}catch{}i(l.value)}),i(l.value));let c=document.getElementById("login-form");if(c){let y=function(){let p=m?m.value.trim():"",k=d?d.value:"",x=p.length>=3,E=k.length>=1;n&&n.classList.toggle("hidden",x),v&&v.classList.toggle("hidden",E),m&&(m.classList.toggle("border-red-600",!x),m.classList.toggle("border-slate-700",x)),d&&(d.classList.toggle("border-red-600",!E),d.classList.toggle("border-slate-700",E)),f&&(f.disabled=!(x&&E))},m=document.getElementById("username");try{let p=localStorage.getItem("last_username");m&&p&&(m.value=p),m&&m.focus()}catch{}c.addEventListener("submit",async p=>{p.preventDefault();let k=new FormData(p.target),x=c.querySelector('button[type="submit"]');document.getElementById("remember-me")?.checked?localStorage.setItem("remember_login","1"):localStorage.removeItem("remember_login");try{if(x&&(x.disabled=!0,x.innerHTML='<span class="inline-flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Connexion...</span></span>',window.lucide&&lucide.createIcons()),await u.login(k.get("username"),k.get("password"))){try{localStorage.setItem("last_username",String(k.get("username")||""))}catch{}window.location.hash="#dashboard"}else document.getElementById("login-error").classList.remove("hidden")}catch(T){if(console.error(T),T&&T.code==="ACCOUNT_LOCKED"){try{sessionStorage.setItem("imo_account_lock",JSON.stringify(T.lockMeta||{}))}catch{}window.location.hash="#blocked";return}S.show("Erreur de connexion","error")}finally{x&&(x.disabled=!1,x.innerHTML='<span class="inline-flex items-center gap-2"><i data-lucide="log-in" class="w-4 h-4"></i><span>Se connecter</span></span>',window.lucide&&lucide.createIcons())}});let d=document.getElementById("password"),n=document.getElementById("username-error"),v=document.getElementById("password-error"),f=c.querySelector('button[type="submit"]');m&&(m.addEventListener("input",y),m.addEventListener("blur",y));let h=document.getElementById("btn-toggle-password");if(h&&d&&h.addEventListener("click",()=>{let p=d.type==="password"?"text":"password";d.type=p;let k=h.querySelector("i");k&&(k.setAttribute("data-lucide",p==="password"?"eye":"eye-off"),lucide.createIcons())}),d){let p=document.getElementById("caps-warning");d.addEventListener("keyup",k=>{if(!p)return;let x=k.getModifierState&&k.getModifierState("CapsLock");p.classList.toggle("hidden",!x)}),d.addEventListener("input",y),d.addEventListener("blur",y),y()}let b=document.getElementById("login-help");b&&b.addEventListener("click",p=>{p.preventDefault(),se.show({title:"Besoin d'aide ?",message:`<div class="space-y-2"><p class="text-slate-300">Si tu rencontres un probl\xE8me de connexion, v\xE9rifie ton identifiant et ton mot de passe ou contacte l'administrateur.</p><p class="text-slate-400 text-sm">Discord: #support \u2022 Email: support@driveline.local</p></div>`,type:"info",confirmText:"Fermer",cancelText:null})})}let g=document.getElementById("sales-form");if(g){let m=v=>String(v||"").toUpperCase().replace(/\s+/g,"").replace(/[^A-Z0-9\-]/g,"").slice(0,16),d=g.querySelector('input[name="plate"]')||g.querySelector('input[name="vehicleModel"]');d&&d.addEventListener("input",()=>{d.value=m(d.value)});let n=g.querySelector('select[name="serviceType"]');g.addEventListener("submit",async v=>{v.preventDefault();let f=v.target.querySelector('button[type="submit"]'),y=f.innerHTML;f.disabled=!0,f.innerHTML='<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Envoi en cours...',window.lucide&&lucide.createIcons();let h=new FormData(v.target),b=ie.getUser(),p=h.get("id");try{if(!(b&&await u.hasPermission(b,"sales.create"))){S.show("Compte bloqu\xE9: impossible d'enregistrer une intervention.","error");return}}catch{S.show("Impossible de v\xE9rifier les permissions.","error");return}try{let k=(h.get("serviceType")||"").toString().trim(),x=m((h.get("plate")||h.get("vehicleModel")||"").trim());if(!x&&k==="R\xE9paration"){let V=g.querySelector('input[name="plate"]');V&&V.value&&(x=m(V.value)),x||(x="REPARATION")}let E=(h.get("price")||"").toString().trim().replace(",","."),T=Number(E);if(x==="VENTEKIT"){await u.createRepairKitSale({price:T,clientName:h.get("clientName"),clientPhone:h.get("clientPhone")}),S.show("Vente Kit enregistr\xE9e (Coffre + Stock MAJ, hors stats employ\xE9es)","success"),window.location.hash="#dashboard",f.disabled=!1,f.innerHTML=y;return}if(!x||x.length<3){S.show("Veuillez renseigner une plaque valide.","warning");return}if(!k){S.show("Veuillez s\xE9lectionner le type de prestation.","warning");return}if(!E||!isFinite(T)||T<=0){S.show("Veuillez renseigner un prix valide.","warning");return}let P=h.get("existingInvoiceUrl")||null,C=h.get("existingPhotoUrl")||null,R=h.get("invoiceFile");R&&R.size>0&&(P=await u.uploadFile(R,"invoices"));let _=h.get("photoFile");_&&_.size>0&&(C=await u.uploadFile(_,"photos"));let I=(window.location.hash||"").match(/employee=([^&]+)/),A=h.get("employeeId"),H=b&&await u.hasPermission(b,"sales.manage"),q=H?A||(I?I[1]:b.id):b.id,M={id:p||Ce(),employeeId:q,date:new Date().toISOString(),clientName:null,clientPhone:null,vehicleModel:x,plate:x,serviceType:k,price:T,cost:Number(h.get("cost")||0),invoiceUrl:P,photoUrl:C};if(await u.saveSale(M),S.show(p?"Intervention modifi\xE9e avec succ\xE8s !":"Intervention enregistr\xE9e avec succ\xE8s !"),H){let V=q;window.location.hash=`#admin-sales?employee=${V}`}else window.location.hash="#dashboard"}catch(k){S.show("Erreur lors de l'enregistrement : "+k.message,"error")}finally{f.disabled=!1,f.innerHTML=y}})}let w=document.getElementById("contract-form");window.deleteSale=async m=>{se.show({title:"Supprimer l'intervention",message:"\xCAtes-vous s\xFBr de vouloir supprimer cette intervention ?",type:"danger",confirmText:"Supprimer",onConfirm:async()=>{try{await u.deleteSale(m),S.show("Intervention supprim\xE9e !"),(window.location.hash==="#admin-sales"||window.location.hash==="#sales")&&Ge()}catch(d){S.show("Erreur lors de la suppression : "+d.message,"error")}}})},window.deleteEmployee=async m=>{se.show({title:"Supprimer l'employ\xE9",message:"\xCAtes-vous s\xFBr de vouloir supprimer cet employ\xE9 ?",type:"danger",confirmText:"Supprimer",onConfirm:async()=>{try{await u.deleteEmployee(m),S.show("Employ\xE9 supprim\xE9"),setTimeout(()=>Ge(),1e3)}catch(d){S.show("Erreur suppression : "+d.message,"error")}}})},window.toggleSidebar=()=>{let m=document.getElementById("sidebar"),d=document.getElementById("mobile-overlay");m&&d&&(m.classList.contains("-translate-x-full")?(m.classList.remove("-translate-x-full"),d.classList.remove("hidden"),setTimeout(()=>d.classList.remove("opacity-0"),10)):(m.classList.add("-translate-x-full"),d.classList.add("opacity-0"),setTimeout(()=>d.classList.add("hidden"),300)))},window.toggleCompactMode=()=>{},window.updateSafeDisplay=async()=>{let m=document.getElementById("sidebar-safe-balance");if(m)try{let d=await u.calculateGlobalSafeBalance();m.textContent=B(d),d<0?m.classList.add("text-red-400"):m.classList.remove("text-red-400")}catch(d){console.warn("Safe display update failed",d),m.textContent="Erreur"}},window.updateSafeDisplay()}window.addEventListener("unhandledrejection",function(e){e.reason&&e.reason.message&&e.reason.message.includes("employment_contracts")&&(console.warn("Ignored missing contracts table error to keep app alive."),e.preventDefault())});try{u.subscribeToAnnouncements(e=>{se.show({title:"\u{1F4E2} ANNONCE G\xC9N\xC9RALE",message:`
                <div class="text-center">
                    <div class="text-lg text-white font-medium mb-4 leading-relaxed">${e.content}</div>
                    <div class="text-xs text-slate-500 uppercase font-bold">
                        Par ${e.author_name||"Direction"} \u2022 ${new Date(e.created_at).toLocaleTimeString()}
                    </div>
                </div>
            `,type:"info",confirmText:"Bien re\xE7u",width:"max-w-xl"})})}catch(e){console.error("Announcement subscription error:",e)}window.addEventListener("hashchange",Ge);window.addEventListener("DOMContentLoaded",Ge);var Ft=0,ks=3e5,Ss=async()=>{let e=Date.now();if(e-Ft>ks){Ft=e;try{let t=ie.getUser();t&&await u.updateLastActivity(t.id)}catch(t){console.warn("Activity update failed",t)}}};["mousedown","keydown","touchstart"].forEach(e=>{document.addEventListener(e,Ss,{passive:!0})});
