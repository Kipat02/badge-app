const { requireUser } = require("./_auth");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Use POST");

    const ctx = await requireUser(req);
    if (!ctx) return res.status(401).json({ ok: false, error: "Non autenticato" });

    const { user, sql } = ctx;

    if (user.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Accesso negato" });
    }

    // Leggiamo body JSON
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");

    const targetId = parseInt(body.user_id, 10);
    const active = !!body.active;

    if (!targetId) {
      return res.status(400).json({ ok: false, error: "user_id mancante" });
    }

    // Protezione: non permettere all'admin di disattivare se stesso
    if (String(targetId) === String(user.id) && active === false) {
      return res.status(400).json({ ok: false, error: "Non puoi disattivare te stesso" });
    }

    const updated = await sql`
      update users
      set active = ${active}, updated_at = now()
      where id = ${targetId}
      returning id, name, email, role, active
    `;

    if (updated.length === 0) {
      return res.status(404).json({ ok: false, error: "Utente non trovato" });
    }

    res.status(200).json({ ok: true, user: updated[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
