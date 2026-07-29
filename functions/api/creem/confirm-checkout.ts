import { CreemCheckout, creemBaseUrl, creemError } from "../../_lib/creem";
import { getAvailableCredits, getPlan, grantCreemCreditsOnce, paidCreditExpiry } from "../../_lib/credits";
import { Env, getCurrentUser, jsonError } from "../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getCurrentUser(request, env);

  if (!user) {
    return jsonError("Please sign in to confirm this checkout.", 401);
  }

  const body = (await request.json().catch(() => null)) as { requestId?: string } | null;
  const requestId = body?.requestId ?? "";

  if (!requestId) {
    return jsonError("Missing Creem checkout request ID.");
  }

  if (!env.CREEM_API_KEY) {
    return jsonError("Creem API key is not configured.", 500);
  }

  const stored = await env.DB.prepare(
    "SELECT * FROM creem_checkouts WHERE request_id = ? AND user_id = ?"
  )
    .bind(requestId, user.id)
    .first<{
      id: string;
      user_id: string;
      plan_id: string;
      status: string;
      credits: number;
    }>();

  if (!stored) {
    return jsonError("Creem checkout was not found.", 404);
  }

  try {
    const response = await fetch(
      `${creemBaseUrl(env)}/v1/checkouts?checkout_id=${encodeURIComponent(stored.id)}`,
      {
        headers: {
          "x-api-key": env.CREEM_API_KEY
        }
      }
    );

    if (!response.ok) {
      return jsonError("Failed to confirm Creem checkout.", 502);
    }

    const checkout = (await response.json()) as CreemCheckout;
    const now = new Date().toISOString();

    await env.DB.prepare(
      `UPDATE creem_checkouts
       SET status = ?, order_id = COALESCE(?, order_id), updated_at = ?,
           completed_at = CASE WHEN ? = 'completed' THEN COALESCE(completed_at, ?) ELSE completed_at END
       WHERE id = ?`
    )
      .bind(
        checkout.status,
        checkout.order?.id ?? null,
        now,
        checkout.status,
        now,
        stored.id
      )
      .run();

    const plan = getPlan(stored.plan_id);

    if (checkout.status === "completed" && plan) {
      await grantCreemCreditsOnce(
        env,
        user.id,
        plan.credits,
        `creem_${plan.id}`,
        stored.id,
        paidCreditExpiry(env)
      );
    }

    const credits = await getAvailableCredits(env, user.id);

    return Response.json({
      ok: true,
      status: checkout.status,
      credits,
      completed: checkout.status === "completed"
    });
  } catch (error) {
    return creemError(error);
  }
};

export const onRequest: PagesFunction = async () => {
  return jsonError("Method not allowed.", 405);
};
