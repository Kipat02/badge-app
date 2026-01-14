const { requireUser } = require("./_auth");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Use POST");

    const ctx = await requireUser(req);
    if (!ctx) return res.status(401).json({ ok: false, error: "Non autenticato" });

    const { user, sql } = ctx;

    const t = await sql`
      select
        (now() at time zone 'Europe/Rome')::date as day,
        (now() at time zone 'Europe/Rome')::time as time_now
    `;
    const day = t[0].day;
    const timeNow = t[0].time_now;

    // Se non esiste riga per oggi, la creiamo con solo out_time (caso raro)
    await sql`
      insert into punches (user_id, day, out_time, updated_at)
      values (${user.id}, ${day}, ${timeNow}, now())
      on conflict (user_id, day) do update
        set out_time = excluded.out_time,
            updated_at = now()
    `;

    res.status(200).json({ ok: true, day, out_time: timeNow });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
