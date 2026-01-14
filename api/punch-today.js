const { requireUser } = require("./_auth");

module.exports = async (req, res) => {
  try {
    const ctx = await requireUser(req);
    if (!ctx) return res.status(401).json({ ok: false, error: "Non autenticato" });

    const { user, sql } = ctx;

    const t = await sql`select (now() at time zone 'Europe/Rome')::date as day`;
    const day = t[0].day;

    const rows = await sql`
      select day, in_time, out_time
      from punches
      where user_id = ${user.id} and day = ${day}
      limit 1
    `;

    res.status(200).json({ ok: true, day, punch: rows[0] || null });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
