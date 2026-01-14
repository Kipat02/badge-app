const { requireUser } = require("./_auth");

module.exports = async (req, res) => {
  try {
    const ctx = await requireUser(req);
    if (!ctx) return res.status(401).json({ ok: false, error: "Non autenticato" });

    const { user, sql } = ctx;

    const limit = Math.min(parseInt(req.query.limit || "31", 10) || 31, 200);

    const rows = await sql`
      select day, in_time, out_time, notes
      from punches
      where user_id = ${user.id}
      order by day desc
      limit ${limit}
    `;

    res.status(200).json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
