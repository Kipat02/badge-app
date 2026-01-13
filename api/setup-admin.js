const { neon } = require("@neondatabase/serverless");
const crypto = require("crypto");

function hashPassword(password) {
  // semplice e ok per iniziare (poi possiamo passare a bcrypt)
  return crypto.createHash("sha256").update(password).digest("hex");
}

module.exports = async (req, res) => {
  try {
    const url = process.env.DATABASE_URL;
    const setupKey = process.env.ADMIN_SETUP_KEY;

    if (!url || !setupKey) {
      return res.status(500).send("Missing DATABASE_URL or ADMIN_SETUP_KEY");
    }

    const key = req.query.key;
    const email = req.query.email;
    const name = req.query.name || "Admin";
    const password = req.query.password;

    if (key !== setupKey) return res.status(403).send("Forbidden");
    if (!email || !password) return res.status(400).send("email e password richiesti");

    const sql = neon(url);

    const passHash = hashPassword(password);

    await sql`
      insert into users (name, email, password_hash, role, active)
      values (${name}, ${email}, ${passHash}, 'admin', true)
      on conflict (email) do update set role = 'admin', active = true
    `;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("Admin creato/aggiornato ✅");
  } catch (err) {
    res.status(500).send(err?.message || String(err));
  }
};
