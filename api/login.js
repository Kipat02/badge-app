const { neon } = require("@neondatabase/serverless");
const { sha256, randomToken, setCookie } = require("./_utils");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).send("Use POST");
      return;
    }

    const url = process.env.DATABASE_URL;
    if (!url) return res.status(500).send("Missing DATABASE_URL");

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      res.status(400).json({ ok: false, error: "email e password richiesti" });
      return;
    }

    const sql = neon(url);

    const users = await sql`
      select id, name, email, password_hash, role, active
      from users
      where email = ${email}
      limit 1
    `;

    if (users.length === 0) {
      res.status(401).json({ ok: false, error: "Credenziali non valide" });
      return;
    }

    const u = users[0];
    if (!u.active) {
      res.status(403).json({ ok: false, error: "Utente disattivato" });
      return;
    }

    const passHash = sha256(password);
    if (passHash !== u.password_hash) {
      res.status(401).json({ ok: false, error: "Credenziali non valide" });
      return;
    }

    // create session
    const token = randomToken();
    const tokenHash = sha256(token);
    const expiresHours = 24 * 7; // 7 giorni
    const expiresAt = new Date(Date.now() + expiresHours * 3600 * 1000);

    await sql`
      insert into sessions (user_id, token_hash, expires_at)
      values (${u.id}, ${tokenHash}, ${expiresAt.toISOString()})
    `;

    // cookie session
    setCookie(res, "session", token, { maxAge: expiresHours * 3600 });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).json({ ok: true, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
