import { creemBaseUrl, creemError, creemSiteUrl, getCreemProductId } from "../../_lib/creem";
import { getAvailableCredits, getPlan } from "../../_lib/credits";
import { Env, createId, getCurrentUser, jsonError } from "../../_lib/auth";

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

  if (!env.CREEM_API_KEY) {
    return jsonError("Creem API key is not configured.", 500);
  }

  const productId = getCreemProductId(env, plan.id);

  if (!productId) {
    return jsonError("Creem product ID is not configured for this plan.", 500);
  }

  try {
    const siteUrl = creemSiteUrl(request, env);
    const requestId = createId("creem_req");
    const successUrl = new URL(`${siteUrl}/checkout/success`);
    successUrl.searchParams.set("provider", "creem");
    successUrl.searchParams.set("request_id", requestId);
    const response = await fetch(`${creemBaseUrl(env)}/v1/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.CREEM_API_KEY
      },
      body: JSON.stringify({
        request_id: requestId,
        product_id: productId,
        units: 1,
        customer: {
          email: user.email
        },
        success_url: successUrl.toString(),
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
          credits: plan.credits
        }
      })
    });

    if (!response.ok) {
      return jsonError("Failed to create Creem checkout.", 502);
    }

    const checkout = (await response.json()) as {
      id: string;
      status: string;
      checkout_url?: string;
      order?: { id?: string };
      customer?: string | { id?: string; email?: string };
    };

    if (!checkout.checkout_url) {
      return jsonError("Creem did not return a checkout URL.", 502);
    }

    const customerId =
      typeof checkout.customer === "string" ? checkout.customer : checkout.customer?.id ?? null;
    const customerEmail =
      typeof checkout.customer === "string" ? null : checkout.customer?.email ?? user.email;
    const now = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO creem_checkouts
        (id, request_id, user_id, plan_id, product_id, status, amount, currency, credits,
         order_id, customer_id, customer_email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        updated_at = excluded.updated_at`
    )
      .bind(
        checkout.id,
        requestId,
        user.id,
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

    const credits = await getAvailableCredits(env, user.id);

    return Response.json({
      checkoutUrl: checkout.checkout_url,
      checkoutId: checkout.id,
      credits
    });
  } catch (error) {
    return creemError(error);
  }
};

export const onRequest: PagesFunction = async () => {
  return jsonError("Method not allowed.", 405);
};
