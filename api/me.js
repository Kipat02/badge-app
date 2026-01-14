const { neon } = require("@neondatabase/serverless");
const { sha256, parseCookies } = require("./_utils");

module.exports = async (req, res) => {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) return res.status(500).send("Missing DATABASE_URL");

    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies.session;
    if (!token) return res.status(401).json({ ok: false, error: "Non autenticato" });

    const sql = neon(url);
    const tokenHash = sha256(token);

    const rows = await sql`
      select u.id, u.name, u.email, u.role
      from sessions s
      join users u on u.id = s.user_id
      where s.token_hash = ${tokenHash}
        and s.expires_at > now()
      limit 1
    `;

    if (rows.length === 0) return res.status(401).json({ ok: false, error: "Sessione scaduta" });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).json({ ok: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
