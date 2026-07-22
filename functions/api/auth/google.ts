import {
  Env,
  createSessionId,
  hashSessionId,
  jsonError,
  sessionCookie,
  sessionExpiry
} from "../../_lib/auth";
import { FREE_SIGNUP_CREDITS, getAvailableCredits, grantCredits } from "../../_lib/credits";

interface GoogleTokenInfo {
  aud: string;
  sub: string;
  email?: string;
  email_verified?: "true" | "false" | boolean;
  name?: string;
  picture?: string;
  iss: string;
  exp: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.GOOGLE_CLIENT_ID || !env.SESSION_SECRET) {
    return jsonError("Google authentication is not configured.", 500);
  }

  const body = (await request.json().catch(() => null)) as {
    credential?: string;
  } | null;

  if (!body?.credential) {
    return jsonError("Missing Google credential.");
  }

  const tokenInfoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
      body.credential
    )}`
  );

  if (!tokenInfoResponse.ok) {
    return jsonError("Invalid Google credential.", 401);
  }

  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;
  const isValidIssuer =
    tokenInfo.iss === "https://accounts.google.com" || tokenInfo.iss === "accounts.google.com";
  const isVerified =
    tokenInfo.email_verified === true || tokenInfo.email_verified === "true";
  const expiresAtUnix = Number(tokenInfo.exp);

  if (
    tokenInfo.aud !== env.GOOGLE_CLIENT_ID ||
    !isValidIssuer ||
    !tokenInfo.sub ||
    !tokenInfo.email ||
    !isVerified ||
    !Number.isFinite(expiresAtUnix) ||
    expiresAtUnix * 1000 <= Date.now()
  ) {
    return jsonError("Google credential verification failed.", 401);
  }

  const now = new Date().toISOString();
  const userId = `google:${tokenInfo.sub}`;
  const existingUser = await env.DB.prepare("SELECT id FROM users WHERE google_sub = ?")
    .bind(tokenInfo.sub)
    .first<{ id: string }>();

  await env.DB.prepare(
    `INSERT INTO users (id, google_sub, email, name, picture, created_at, updated_at, last_login_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(google_sub) DO UPDATE SET
       email = excluded.email,
       name = excluded.name,
       picture = excluded.picture,
       updated_at = excluded.updated_at,
       last_login_at = excluded.last_login_at`
  )
    .bind(
      userId,
      tokenInfo.sub,
      tokenInfo.email,
      tokenInfo.name ?? null,
      tokenInfo.picture ?? null,
      now,
      now,
      now
    )
    .run();

  if (!existingUser) {
    await grantCredits(env, userId, FREE_SIGNUP_CREDITS, "free_signup", null, null);
  }

  const sessionId = createSessionId();
  const idHash = await hashSessionId(sessionId, env.SESSION_SECRET);
  const expiresAt = sessionExpiry();

  await env.DB.prepare(
    "INSERT INTO sessions (id_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
  )
    .bind(idHash, userId, now, expiresAt.toISOString())
    .run();

  const credits = await getAvailableCredits(env, userId);

  return Response.json(
    {
      user: {
        id: userId,
        email: tokenInfo.email,
        name: tokenInfo.name ?? null,
        picture: tokenInfo.picture ?? null
      },
      credits
    },
    {
      headers: {
        "Set-Cookie": sessionCookie(sessionId, expiresAt)
      }
    }
  );
};

export const onRequest: PagesFunction = async () => {
  return jsonError("Method not allowed.", 405);
};
