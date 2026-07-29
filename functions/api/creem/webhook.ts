import {
  CreemWebhookEvent,
  creemError,
  getCreemObjectId,
  verifyCreemSignature
} from "../../_lib/creem";
import { getAvailableCredits, getPlan, grantCreemCreditsOnce, paidCreditExpiry } from "../../_lib/credits";
import { Env, jsonError } from "../../_lib/auth";

async function grantCheckoutCredits(env: Env, event: CreemWebhookEvent) {
  const checkout = event.object;

  if (!checkout?.id) {
    return;
  }

  const stored = await env.DB.prepare("SELECT * FROM creem_checkouts WHERE id = ? OR request_id = ?")
    .bind(checkout.id, checkout.request_id ?? "")
    .first<{
      id: string;
      user_id: string;
      plan_id: string;
      product_id: string;
      status: string;
      credits: number;
    }>();

  const metadata = checkout.metadata ?? {};
  const plan = stored?.plan_id
    ? getPlan(stored.plan_id)
    : typeof metadata.plan_id === "string"
      ? getPlan(metadata.plan_id)
      : null;
  const userId = stored?.user_id ?? (typeof metadata.user_id === "string" ? metadata.user_id : "");

  if (!plan || !userId) {
    throw new Error("Creem checkout metadata does not match a known user and plan.");
  }

  const productId = getCreemObjectId(checkout.product) ?? stored?.product_id ?? "";

  if (!stored) {
    const now = new Date().toISOString();
    const customerId = getCreemObjectId(checkout.customer);
    const customerEmail =
      typeof checkout.customer === "string" ? null : checkout.customer?.email ?? null;

    await env.DB.prepare(
      `INSERT INTO creem_checkouts
        (id, request_id, user_id, plan_id, product_id, status, amount, currency, credits,
         order_id, customer_id, customer_email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        checkout.id,
        checkout.request_id ?? checkout.id,
        userId,
        plan.id,
        productId,
        checkout.status,
        plan.price,
        plan.currency,
        plan.credits,
        checkout.order?.id ?? null,
        customerId,
        customerEmail,
        now,
        now
      )
      .run();
  }

  if (checkout.status !== "completed") {
    return;
  }

  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE creem_checkouts
     SET status = ?, order_id = COALESCE(?, order_id), updated_at = ?, completed_at = COALESCE(completed_at, ?)
     WHERE id = ?`
  )
    .bind(checkout.status, checkout.order?.id ?? null, now, now, checkout.id)
    .run();

  await grantCreemCreditsOnce(
    env,
    userId,
    plan.credits,
    `creem_${plan.id}`,
    checkout.id,
    paidCreditExpiry(env)
  );

  await getAvailableCredits(env, userId);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const rawBody = await request.text();

  try {
    if (!env.CREEM_WEBHOOK_SECRET) {
      throw new Error("Creem webhook secret is not configured.");
    }

    const signature = request.headers.get("creem-signature") ?? "";

    if (!signature) {
      throw new Error("Missing Creem webhook signature.");
    }

    await verifyCreemSignature(rawBody, signature, env.CREEM_WEBHOOK_SECRET);

    const event = JSON.parse(rawBody) as CreemWebhookEvent;

    if (event.eventType === "checkout.completed") {
      await grantCheckoutCredits(env, event);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return creemError(error);
  }
};

export const onRequest: PagesFunction = async () => {
  return jsonError("Method not allowed.", 405);
};
