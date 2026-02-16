function rand(n) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let s = '';
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function supaGet(path, key) {
  const url = `${process.env.SUPABASE_URL}/rest/v1${path}`;
  const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!r.ok) return null;
  return await r.json();
}

async function supaPatch(path, body, key) {
  const url = `${process.env.SUPABASE_URL}/rest/v1${path}`;
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body)
  });
  if (!r.ok) return { ok: false, status: r.status, text: await r.text() };
  return { ok: true, data: await r.json() };
}

function baseUsername(firstName) {
  const t = String(firstName || '').trim();
  if (!t) return 'User';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'method_not_allowed' });
      return;
    }
    const body = req.body || {};
    const mode = String(body.mode || 'create');
    if (mode !== 'create' && mode !== 'reset') {
      res.status(400).json({ ok: false, error: 'invalid_mode' });
      return;
    }
    if (mode === 'reset') {
      const sec = process.env.INTERNAL_API_SECRET || '';
      if (sec && req.headers['x-internal-secret'] !== sec) {
        res.status(401).json({ ok: false, error: 'unauthorized' });
        return;
      }
    }
    if (mode === 'create') {
      const fn = String(body.firstName || '').trim() || 'User';
      const username = baseUsername(fn);
      const password = baseUsername(fn);
      res.status(200).json({ ok: true, username, password });
      return;
    }
    if (mode === 'reset') {
      const id = String(body.employeeId || '').trim();
      if (!id) {
        res.status(400).json({ ok: false, error: 'missing_employeeId' });
        return;
      }
      const key = process.env.SUPABASE_SERVICE_KEY || '';
      if (!process.env.SUPABASE_URL || !key) {
        res.status(500).json({ ok: false, error: 'missing_supabase_server_creds' });
        return;
      }
      const newPass = rand(12);
      const r = await supaPatch(`/employees?id=eq.${encodeURIComponent(id)}`, { password: newPass }, key);
      if (!r.ok) {
        res.status(502).json({ ok: false, error: 'update_failed', details: r.text || '' });
        return;
      }
      const row = Array.isArray(r.data) && r.data[0] ? r.data[0] : null;
      const username = row && (row.username || row.USERNAME) ? String(row.username || row.USERNAME) : '';
      res.status(200).json({ ok: true, username, password: newPass });
      return;
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server_error' });
  }
}
