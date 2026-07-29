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

export const FREE_SIGNUP_CREDITS = 3;
export const DEFAULT_PAID_CREDIT_VALIDITY_DAYS = 90;

export function getPlan(planId: string) {
  return PLANS[planId as PaidPlanId] ?? null;
}

export function paidCreditValidityDays(env?: Env) {
  const parsed = Number(env?.PAID_CREDIT_VALIDITY_DAYS);

  return Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : DEFAULT_PAID_CREDIT_VALIDITY_DAYS;
}

export function creditExpiry(days = DEFAULT_PAID_CREDIT_VALIDITY_DAYS) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

export function paidCreditExpiry(env: Env) {
  return creditExpiry(paidCreditValidityDays(env));
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

export async function reserveCredit(env: Env, userId: string, taskId: string) {
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `INSERT INTO credit_transactions
      (id, user_id, amount, reason, paypal_order_id, expires_at, created_at, task_id)
     SELECT ?, ?, -1, 'background_removal_reserved', NULL, NULL, ?, ?
     WHERE
       (SELECT COALESCE(SUM(amount), 0)
        FROM credit_transactions
        WHERE user_id = ? AND (expires_at IS NULL OR expires_at > ?)) >= 1
       AND NOT EXISTS (
        SELECT 1
        FROM credit_transactions
        WHERE task_id = ? AND reason IN ('background_removal_reserved', 'background_removal')
       )`
  )
    .bind(createId("credit"), userId, now, taskId, userId, now, taskId)
    .run();

  return Number(result.meta?.changes ?? 0) === 1;
}

export async function confirmReservedCredit(env: Env, taskId: string) {
  await env.DB.prepare(
    `UPDATE credit_transactions
     SET reason = 'background_removal'
     WHERE task_id = ? AND reason = 'background_removal_reserved'`
  )
    .bind(taskId)
    .run();
}

export async function refundReservedCredit(env: Env, userId: string, taskId: string) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO credit_transactions
      (id, user_id, amount, reason, paypal_order_id, expires_at, created_at, task_id)
     SELECT ?, ?, 1, 'background_removal_refund', NULL, NULL, ?, ?
     WHERE EXISTS (
       SELECT 1
       FROM credit_transactions
       WHERE task_id = ? AND reason = 'background_removal_reserved'
     )`
  )
    .bind(createId("credit"), userId, now, taskId, taskId)
    .run();
}

export async function grantPayPalCreditsOnce(
  env: Env,
  userId: string,
  amount: number,
  reason: string,
  paypalOrderId: string,
  expiresAt: Date
) {
  await env.DB.prepare(
    `INSERT OR IGNORE INTO credit_transactions
      (id, user_id, amount, reason, paypal_order_id, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      createId("credit"),
      userId,
      amount,
      reason,
      paypalOrderId,
      expiresAt.toISOString(),
      new Date().toISOString()
    )
    .run();
}

export async function grantCreemCreditsOnce(
  env: Env,
  userId: string,
  amount: number,
  reason: string,
  creemCheckoutId: string,
  expiresAt: Date
) {
  await env.DB.prepare(
    `INSERT OR IGNORE INTO credit_transactions
      (id, user_id, amount, reason, paypal_order_id, expires_at, created_at, creem_checkout_id)
     VALUES (?, ?, ?, ?, NULL, ?, ?, ?)`
  )
    .bind(
      createId("credit"),
      userId,
      amount,
      reason,
      expiresAt.toISOString(),
      new Date().toISOString(),
      creemCheckoutId
    )
    .run();
}
