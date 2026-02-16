import fs from 'fs';
import path from 'path';
import https from 'https';
import os from 'os';

function getArg(name, def) {
  const i = process.argv.findIndex(a => a.startsWith(`--${name}=`));
  if (i >= 0) return process.argv[i].split('=')[1];
  return def;
}

const minutes = Number(getArg('window-minutes', '30')) || 30;
const now = Date.now();
const since = now - minutes * 60 * 1000;
const root = process.cwd();
const excludes = new Set(['node_modules', 'dist', '.git', '.trae']);

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excludes.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full));
    } else {
      try {
        const stat = fs.statSync(full);
        out.push({ path: full, mtimeMs: stat.mtimeMs, size: stat.size });
      } catch {}
    }
  }
  return out;
}

const files = listFiles(root).filter(f => f.mtimeMs >= since);
files.sort((a, b) => b.mtimeMs - a.mtimeMs);

const webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
if (!webhookUrl) {
  console.log('DISCORD_WEBHOOK_URL non défini, notification ignorée.');
  process.exit(0);
}

function fmtSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0, v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

function rel(p) {
  return path.relative(root, p).replace(/\\/g, '/');
}

const maxLines = 40;
const lines = files.slice(0, maxLines).map(f => {
  const ts = new Date(f.mtimeMs).toLocaleString('fr-FR');
  return `• ${rel(f.path)} • ${fmtSize(f.size)} • ${ts}`;
});
const truncated = files.length > maxLines ? `\n… et ${files.length - maxLines} autres fichiers` : '';
const description = files.length === 0 ? 'Aucun fichier modifié sur la fenêtre.' : `${lines.join('\n')}${truncated}`;
const color =
  files.length >= 20 ? 0xEF4444 : // rouge
  files.length >= 5 ? 0xF59E0B :   // orange
  0x22C55E;                        // vert

const embed = {
  title: 'Mise à jour du site',
  color,
  timestamp: new Date().toISOString(),
  fields: [
    { name: 'Fenêtre', value: `${minutes} min`, inline: true },
    { name: 'Total', value: `${files.length} fichier(s)`, inline: true },
    { name: 'Build par', value: `${os.userInfo().username}@${os.hostname()}`, inline: true }
  ],
  description,
  footer: { text: 'Driveline • Post-build' }
};
const payload = JSON.stringify({ username: 'Captain Hook', embeds: [embed] });

function postWebhook(u, body) {
  const parsed = new URL(u);
  const opts = {
    method: 'POST',
    hostname: parsed.hostname,
    path: parsed.pathname + (parsed.search || ''),
    protocol: parsed.protocol,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

try {
  const resp = await postWebhook(webhookUrl, payload);
  console.log(`Discord webhook status: ${resp.status}`);
} catch (e) {
  console.error('Erreur envoi Discord:', e.message);
  process.exitCode = 1;
}
