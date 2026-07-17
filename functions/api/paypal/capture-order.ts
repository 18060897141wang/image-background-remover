import { creditExpiry, getAvailableCredits, grantCredits } from "../../_lib/credits";
import { Env, getCurrentUser, jsonError } from "../../_lib/auth";
import { getPayPalAccessToken, paypalBaseUrl, paypalError } from "../../_lib/paypal";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getCurrentUser(request, env);

  if (!user) {
    return jsonError("Please sign in before confirming payment.", 401);
  }

  const body = (await request.json().catch(() => null)) as { orderId?: string } | null;

  if (!body?.orderId) {
    return jsonError("Missing PayPal order ID.");
  }

  const localOrder = await env.DB.prepare(
    "SELECT * FROM paypal_orders WHERE id = ? AND user_id = ?"
  )
    .bind(body.orderId, user.id)
    .first<{
      id: string;
      status: string;
      credits: number;
      plan_id: string;
    }>();

  if (!localOrder) {
    return jsonError("Order not found.", 404);
  }

  if (localOrder.status === "COMPLETED") {
    const credits = await getAvailableCredits(env, user.id);
    return Response.json({ ok: true, credits, alreadyCaptured: true });
  }

  try {
    const accessToken = await getPayPalAccessToken(env);
    const response = await fetch(
      `${paypalBaseUrl(env)}/v2/checkout/orders/${encodeURIComponent(body.orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      return jsonError("Failed to capture PayPal order.", 502);
    }

    const order = (await response.json()) as { status: string };

    if (order.status !== "COMPLETED") {
      await env.DB.prepare(
        "UPDATE paypal_orders SET status = ?, updated_at = ? WHERE id = ?"
      )
        .bind(order.status, new Date().toISOString(), body.orderId)
        .run();
      return jsonError("PayPal order was not completed.", 400);
    }

    const now = new Date().toISOString();
    await grantCredits(
      env,
      user.id,
      Number(localOrder.credits),
      `paypal_${localOrder.plan_id}`,
      body.orderId,
      creditExpiry(30)
    );
    await env.DB.prepare(
      "UPDATE paypal_orders SET status = ?, captured_at = ?, updated_at = ? WHERE id = ?"
    )
      .bind("COMPLETED", now, now, body.orderId)
      .run();

    const credits = await getAvailableCredits(env, user.id);

    return Response.json({ ok: true, credits });
  } catch (error) {
    return paypalError(error);
  }
};
