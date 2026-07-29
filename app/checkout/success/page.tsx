"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [message, setMessage] = useState("Confirming your payment...");
  const [credits, setCredits] = useState<number | null>(null);
  const [provider, setProvider] = useState("Payment");

  useEffect(() => {
    async function confirmCreemCheckout(requestId: string) {
      const response = await fetch("/api/creem/confirm-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ requestId })
      });
      const data = (await response.json().catch(() => null)) as {
        credits?: number;
        completed?: boolean;
        error?: string;
      } | null;

      if (!response.ok) {
        setMessage(data?.error || "Could not confirm your Creem payment yet.");
        return;
      }

      setCredits(data?.credits ?? null);
      setMessage(
        data?.completed
          ? "Payment confirmed. Your credits are ready."
          : "Payment completed. Your credits will appear after confirmation."
      );
    }

    async function captureOrder() {
      const params = new URLSearchParams(window.location.search);
      const checkoutProvider = params.get("provider");

      if (checkoutProvider === "creem") {
        const requestId = params.get("request_id");
        setProvider("Creem checkout");

        if (!requestId) {
          setMessage("Missing Creem checkout request ID.");
          return;
        }

        setMessage("Payment completed. Checking your credit balance...");
        await confirmCreemCheckout(requestId);
        return;
      }

      setProvider("PayPal checkout");
      const orderId = params.get("token");

      if (!orderId) {
        setMessage("Missing PayPal order ID.");
        return;
      }

      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId })
      });
      const data = (await response.json().catch(() => null)) as {
        credits?: number;
        error?: string;
      } | null;

      if (!response.ok) {
        setMessage(data?.error || "Payment confirmation failed.");
        return;
      }

      setCredits(data?.credits ?? null);
      setMessage("Payment confirmed. Your credits are ready.");
    }

    captureOrder();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-xl rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-xl shadow-neutral-900/10">
        <p className="text-sm font-semibold text-teal-800">{provider}</p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950">
          Payment status
        </h1>
        <p className="mt-4 text-neutral-700">{message}</p>
        {credits !== null ? (
          <p className="mt-4 rounded-md bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
            Available credits: {credits}
          </p>
        ) : null}
        <div className="mt-7 flex justify-center gap-3">
          <Link
            className="rounded-md bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
            href="/"
          >
            Back to tool
          </Link>
          <Link
            className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800"
            href="/pricing"
          >
            Pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
