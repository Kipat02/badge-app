const { neon } = require("@neondatabase/serverless");

module.exports = async (req, res) => {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      res.status(500).send("ERRORE: DATABASE_URL non trovata su Vercel");
      return;
    }

    const sql = neon(url);
    const rows = await sql`select now() as server_time`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(`DB OK ✅\nServer time: ${rows[0].server_time}\n`);
  } catch (err) {
    res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(500).send("DB KO ❌\n" + (err?.message || String(err)));
  }
};
