import { getAvailableCredits, getPlan } from "../../_lib/credits";
import { Env, getCurrentUser, jsonError } from "../../_lib/auth";
import { getPayPalAccessToken, paypalBaseUrl, paypalError } from "../../_lib/paypal";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getCurrentUser(request, env);

  if (!user) {
    return jsonError("Please sign in before buying credits.", 401);
  }

  const body = (await request.json().catch(() => null)) as { planId?: string } | null;
  const plan = body?.planId ? getPlan(body.planId) : null;

  if (!plan) {
    return jsonError("Unknown pricing plan.");
  }

  try {
    const accessToken = await getPayPalAccessToken(env);
    const origin = new URL(request.url).origin;
    const response = await fetch(`${paypalBaseUrl(env)}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: `${user.id}:${plan.id}`,
            description: `${plan.name} credits for Image Background Remover`,
            amount: {
              currency_code: plan.currency,
              value: plan.price
            }
          }
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "Image Background Remover",
              landing_page: "LOGIN",
              user_action: "PAY_NOW",
              return_url: `${origin}/checkout/success`,
              cancel_url: `${origin}/checkout/cancel`
            }
          }
        }
      })
    });

    if (!response.ok) {
      return jsonError("Failed to create PayPal order.", 502);
    }

    const order = (await response.json()) as {
      id: string;
      status: string;
      links?: Array<{ href: string; rel: string }>;
    };
    const approvalUrl = order.links?.find((link) => link.rel === "payer-action")?.href;

    if (!approvalUrl) {
      return jsonError("PayPal did not return an approval URL.", 502);
    }

    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO paypal_orders
        (id, user_id, plan_id, status, amount, currency, credits, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        updated_at = excluded.updated_at`
    )
      .bind(
        order.id,
        user.id,
        plan.id,
        order.status,
        plan.price,
        plan.currency,
        plan.credits,
        now,
        now
      )
      .run();

    const credits = await getAvailableCredits(env, user.id);

    return Response.json({ approvalUrl, orderId: order.id, credits });
  } catch (error) {
    return paypalError(error);
  }
};
