const { requireUser } = require("./_auth");

module.exports = async (req, res) => {
  try {
    const ctx = await requireUser(req);
    if (!ctx) {
      return res.status(401).json({ ok: false, error: "Non autenticato" });
    }

    const { user, sql } = ctx;

    // Solo admin
    if (user.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Accesso negato" });
    }

    const rows = await sql`
      select id, name, email, role, active, created_at
      from users
      order by created_at desc
    `;

    res.status(200).json({ ok: true, users: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
