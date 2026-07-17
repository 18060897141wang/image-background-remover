import { Env, getCurrentUser, jsonError } from "../../_lib/auth";
import { captureStoredOrder, paypalError } from "../../_lib/paypal";

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

  try {
    const result = await captureStoredOrder(env, localOrder.id);
    return Response.json(result);
  } catch (error) {
    return paypalError(error);
  }
};
