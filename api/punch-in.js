const { requireUser } = require("./_auth");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Use POST");

    const ctx = await requireUser(req);
    if (!ctx) return res.status(401).json({ ok: false, error: "Non autenticato" });

    const { user, sql } = ctx;

    // Giorno e ora in Europe/Rome
    const t = await sql`
      select
        (now() at time zone 'Europe/Rome')::date as day,
        (now() at time zone 'Europe/Rome')::time as time_now
    `;
    const day = t[0].day;
    const timeNow = t[0].time_now;

    // crea/aggiorna riga del giorno
    await sql`
      insert into punches (user_id, day, in_time, updated_at)
      values (${user.id}, ${day}, ${timeNow}, now())
      on conflict (user_id, day) do update
        set in_time = excluded.in_time,
            updated_at = now()
    `;

    res.status(200).json({ ok: true, day, in_time: timeNow });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
