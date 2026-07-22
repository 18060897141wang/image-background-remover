import { Env, jsonError } from "./auth";
import { getAvailableCredits, grantPayPalCreditsOnce, paidCreditExpiry } from "./credits";

export function paypalBaseUrl(env: Env) {
  return env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(env: Env) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal is not configured.");
  }

  const credentials = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${paypalBaseUrl(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with PayPal.");
  }

  const data = (await response.json()) as { access_token?: string };

  if (!data.access_token) {
    throw new Error("PayPal did not return an access token.");
  }

  return data.access_token;
}

export function paypalError(error: unknown) {
  return jsonError(error instanceof Error ? error.message : "PayPal request failed.", 500);
}

export async function captureStoredOrder(env: Env, orderId: string) {
  const localOrder = await env.DB.prepare("SELECT * FROM paypal_orders WHERE id = ?")
    .bind(orderId)
    .first<{
      id: string;
      user_id: string;
      status: string;
      credits: number;
      plan_id: string;
    }>();

  if (!localOrder) {
    throw new Error("Order not found.");
  }

  if (localOrder.status === "COMPLETED") {
    const credits = await getAvailableCredits(env, localOrder.user_id);
    return { ok: true, credits, alreadyCaptured: true };
  }

  if (localOrder.status === "CAPTURING") {
    throw new Error("Payment is already being confirmed. Please refresh shortly.");
  }

  const captureStarted = await env.DB.prepare(
    `UPDATE paypal_orders
     SET status = ?, updated_at = ?
     WHERE id = ? AND status NOT IN ('COMPLETED', 'CAPTURING')`
  )
    .bind("CAPTURING", new Date().toISOString(), orderId)
    .run();

  if (Number(captureStarted.meta?.changes ?? 0) !== 1) {
    const credits = await getAvailableCredits(env, localOrder.user_id);
    return { ok: true, credits, alreadyCaptured: true };
  }

  const accessToken = await getPayPalAccessToken(env);
  const response = await fetch(
    `${paypalBaseUrl(env)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!response.ok) {
    await env.DB.prepare("UPDATE paypal_orders SET status = ?, updated_at = ? WHERE id = ?")
      .bind("CAPTURE_FAILED", new Date().toISOString(), orderId)
      .run();
    throw new Error("Failed to capture PayPal order.");
  }

  const order = (await response.json()) as { status: string };

  if (order.status !== "COMPLETED") {
    await env.DB.prepare("UPDATE paypal_orders SET status = ?, updated_at = ? WHERE id = ?")
      .bind(order.status, new Date().toISOString(), orderId)
      .run();
    throw new Error("PayPal order was not completed.");
  }

  const now = new Date().toISOString();
  await grantPayPalCreditsOnce(
    env,
    localOrder.user_id,
    Number(localOrder.credits),
    `paypal_${localOrder.plan_id}`,
    orderId,
    paidCreditExpiry(env)
  );
  await env.DB.prepare(
    "UPDATE paypal_orders SET status = ?, captured_at = ?, updated_at = ? WHERE id = ?"
  )
    .bind("COMPLETED", now, now, orderId)
    .run();

  const credits = await getAvailableCredits(env, localOrder.user_id);

  return { ok: true, credits };
}
