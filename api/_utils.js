const crypto = require("crypto");

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(v.join("=") || "");
  });
  return out;
}

function setCookie(res, name, value, opts = {}) {
  const {
    httpOnly = true,
    secure = true,
    sameSite = "Lax",
    path = "/",
    maxAge, // in seconds
  } = opts;

  let cookie = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
  if (httpOnly) cookie += `; HttpOnly`;
  if (secure) cookie += `; Secure`;
  if (typeof maxAge === "number") cookie += `; Max-Age=${maxAge}`;

  // support multiple Set-Cookie headers
  const prev = res.getHeader("Set-Cookie");
  if (!prev) res.setHeader("Set-Cookie", cookie);
  else if (Array.isArray(prev)) res.setHeader("Set-Cookie", [...prev, cookie]);
  else res.setHeader("Set-Cookie", [prev, cookie]);
}

module.exports = { sha256, randomToken, parseCookies, setCookie };
