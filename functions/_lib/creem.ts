import { Env, jsonError } from "./auth";
import { PaidPlanId } from "./credits";

export interface CreemCheckout {
  id: string;
  status: string;
  request_id?: string;
  checkout_url?: string;
  success_url?: string | null;
  metadata?: Record<string, unknown>;
  order?: {
    id?: string;
    amount?: number;
    currency?: string;
    status?: string;
  };
  product?: string | {
    id?: string;
    name?: string;
    price?: number;
    currency?: string;
  };
  customer?: string | {
    id?: string;
    email?: string;
    name?: string | null;
  };
}

export interface CreemWebhookEvent {
  id: string;
  eventType: string;
  object?: CreemCheckout;
}

export function creemBaseUrl(env: Env) {
  return env.CREEM_ENV === "live" ? "https://api.creem.io" : "https://test-api.creem.io";
}

export function creemSiteUrl(request: Request, env: Env) {
  return (env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
}

export function getCreemProductId(env: Env, planId: PaidPlanId) {
  if (planId === "creator") {
    return env.CREEM_CREATOR_PRODUCT_ID || "";
  }

  if (planId === "pro") {
    return env.CREEM_PRO_PRODUCT_ID || "";
  }

  return "";
}

export function getCreemObjectId(value: CreemCheckout["product"] | CreemCheckout["customer"]) {
  return typeof value === "string" ? value : value?.id ?? null;
}

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function verifyCreemSignature(rawBody: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const computedSignature = bytesToHex(signed);

  if (!constantTimeEqual(computedSignature, signature)) {
    throw new Error("Invalid Creem webhook signature.");
  }
}

export function creemError(error: unknown) {
  const message = error instanceof Error ? error.message : "Creem payment failed.";
  const status = message.toLowerCase().includes("signature") ? 401 : 502;

  return jsonError(message, status);
}
