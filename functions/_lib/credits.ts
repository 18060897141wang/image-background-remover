import { Env, createId } from "./auth";

export const PLANS = {
  creator: {
    id: "creator",
    name: "Creator",
    price: "9.99",
    currency: "USD",
    credits: 30
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "29.99",
    currency: "USD",
    credits: 120
  }
} as const;

export type PaidPlanId = keyof typeof PLANS;

export function getPlan(planId: string) {
  return PLANS[planId as PaidPlanId] ?? null;
}

export function creditExpiry(days = 30) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

export async function getAvailableCredits(env: Env, userId: string) {
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS credits
     FROM credit_transactions
     WHERE user_id = ? AND (expires_at IS NULL OR expires_at > ?)`
  )
    .bind(userId, now)
    .first<{ credits: number }>();

  return Number(row?.credits ?? 0);
}

export async function grantCredits(
  env: Env,
  userId: string,
  amount: number,
  reason: string,
  paypalOrderId: string | null,
  expiresAt: Date | null
) {
  await env.DB.prepare(
    `INSERT INTO credit_transactions
      (id, user_id, amount, reason, paypal_order_id, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      createId("credit"),
      userId,
      amount,
      reason,
      paypalOrderId,
      expiresAt?.toISOString() ?? null,
      new Date().toISOString()
    )
    .run();
}

export async function deductCredit(env: Env, userId: string) {
  await grantCredits(env, userId, -1, "background_removal", null, null);
}
