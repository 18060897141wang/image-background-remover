import { Env, jsonError } from "../../_lib/auth";
import {
  captureStoredOrder,
  getPayPalAccessToken,
  paypalBaseUrl,
  paypalError
} from "../../_lib/paypal";

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    status?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
}

async function verifyWebhookSignature(env: Env, request: Request, rawBody: string) {
  if (!env.PAYPAL_WEBHOOK_ID) {
    throw new Error("PayPal webhook ID is not configured.");
  }

  const accessToken = await getPayPalAccessToken(env);
  const response = await fetch(`${paypalBaseUrl(env)}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      auth_algo: request.headers.get("paypal-auth-algo"),
      cert_url: request.headers.get("paypal-cert-url"),
      transmission_id: request.headers.get("paypal-transmission-id"),
      transmission_sig: request.headers.get("paypal-transmission-sig"),
      transmission_time: request.headers.get("paypal-transmission-time"),
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(rawBody)
    })
  });

  if (!response.ok) {
    throw new Error("Could not verify PayPal webhook signature.");
  }

  const result = (await response.json()) as { verification_status?: string };

  if (result.verification_status !== "SUCCESS") {
    throw new Error("Invalid PayPal webhook signature.");
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const rawBody = await request.text();

  try {
    await verifyWebhookSignature(env, request, rawBody);
    const event = JSON.parse(rawBody) as PayPalWebhookEvent;

    if (event.event_type === "CHECKOUT.ORDER.APPROVED" && event.resource?.id) {
      await captureStoredOrder(env, event.resource.id);
    }

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id;

      if (orderId) {
        await captureStoredOrder(env, orderId);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("signature")) {
      return jsonError(error.message, 401);
    }

    return paypalError(error);
  }
};

export const onRequest: PagesFunction = async () => {
  return jsonError("Method not allowed.", 405);
};
