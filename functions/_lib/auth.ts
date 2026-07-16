export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  SESSION_SECRET: string;
  REMOVE_BG_API_KEY: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

const SESSION_COOKIE = "ibr_session";
const SESSION_DAYS = 30;

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(input: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return bytesToHex(digest);
}

export async function hashSessionId(sessionId: string, secret: string) {
  return sha256(`${sessionId}.${secret}`);
}

export function createSessionId() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes.buffer);
}

export function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return "";
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const prefix = `${name}=`;
  const match = cookies.find((cookie) => cookie.startsWith(prefix));

  return match ? decodeURIComponent(match.slice(prefix.length)) : "";
}

export function sessionCookie(sessionId: string, expiresAt: Date) {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`
  ].join("; ");
}

export function clearSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0"
  ].join("; ");
}

export function sessionExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return expiresAt;
}

export async function getCurrentUser(request: Request, env: Env): Promise<AuthUser | null> {
  const sessionId = getCookie(request, SESSION_COOKIE);

  if (!sessionId || !env.SESSION_SECRET) {
    return null;
  }

  const idHash = await hashSessionId(sessionId, env.SESSION_SECRET);
  const now = new Date().toISOString();

  return env.DB.prepare(
    `SELECT users.id, users.email, users.name, users.picture
     FROM sessions
     INNER JOIN users ON users.id = sessions.user_id
     WHERE sessions.id_hash = ? AND sessions.expires_at > ?`
  )
    .bind(idHash, now)
    .first<AuthUser>();
}

export async function deleteCurrentSession(request: Request, env: Env) {
  const sessionId = getCookie(request, SESSION_COOKIE);

  if (!sessionId || !env.SESSION_SECRET) {
    return;
  }

  const idHash = await hashSessionId(sessionId, env.SESSION_SECRET);
  await env.DB.prepare("DELETE FROM sessions WHERE id_hash = ?").bind(idHash).run();
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
