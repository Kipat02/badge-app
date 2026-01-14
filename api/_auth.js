const { neon } = require("@neondatabase/serverless");
const { sha256, parseCookies } = require("./_utils");

async function requireUser(req) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");

  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies.session;
  if (!token) return null;

  const sql = neon(url);
  const tokenHash = sha256(token);

  const rows = await sql`
    select u.id, u.name, u.email, u.role
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${tokenHash}
      and s.expires_at > now()
    limit 1
  `;

  if (rows.length === 0) return null;
  return { user: rows[0], sql };
}

module.exports = { requireUser };
