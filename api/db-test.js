const { neon } = require("@neondatabase/serverless");

module.exports = async (req, res) => {
  try {
    const url = process.env.DATABASE_URL;

    if (!url) {
      res.status(500).send("ERRORE: DATABASE_URL non trovata su Vercel");
      return;
    }

    const sql = neon(url);

    const rows = await sql`
      select now() at time zone 'Europe/Rome' as rome_time
    `;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(
      `DB OK ✅\nRome time: ${rows[0].rome_time}\n`
    );

  } catch (err) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(500).send(
      "DB KO ❌\n" + (err?.message || String(err))
    );
  }
};
