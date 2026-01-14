const { neon } = require("@neondatabase/serverless");
const { sha256, parseCookies, setCookie } = require("./_utils");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).send("Use POST");
      return;
    }

    const url = process.env.DATABASE_URL;
    if (!url) return res.status(500).send("Missing DATABASE_URL");

    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies.session;

    if (token) {
      const sql = neon(url);
      const tokenHash = sha256(token);
      await sql`delete from sessions where token_hash = ${tokenHash}`;
    }

    // clear cookie
    setCookie(res, "session", "", { maxAge: 0 });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};
