export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'method_not_allowed' });
      return;
    }
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      res.status(500).json({ ok: false, error: 'missing_token' });
      return;
    }
    const { userId, content } = req.body || {};
    if (!userId || !/^\d{15,22}$/.test(String(userId))) {
      res.status(400).json({ ok: false, error: 'invalid_user' });
      return;
    }
    const dmResp = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipient_id: String(userId) })
    });
    if (!dmResp.ok) {
      const txt = await dmResp.text();
      res.status(502).json({ ok: false, error: 'dm_open_failed', details: txt });
      return;
    }
    const dm = await dmResp.json();
    const channelId = dm.id;
    const msgResp = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: String(content || '').slice(0, 1900), allowed_mentions: { parse: [] } })
    });
    if (!msgResp.ok) {
      const txt = await msgResp.text();
      res.status(502).json({ ok: false, error: 'send_failed', details: txt });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server_error' });
  }
}
