"use client";

import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "starter credits",
    credits: "3 credits",
    unitPrice: "Try before upgrading",
    description: "For first-time users who want to test background removal.",
    cta: "Start Free",
    featured: false,
    features: [
      "3 free image removals",
      "Google sign-in required",
      "Free starter credits do not expire",
      "Transparent PNG download",
      "JPG, PNG, and WebP support",
      "Images up to 10MB"
    ]
  },
  {
    id: "creator",
    name: "Creator",
    price: "$9.99",
    period: "one-time purchase",
    credits: "30 credits",
    unitPrice: "$0.33 per image",
    description: "For creators, social sellers, and small content workflows.",
    cta: "Buy Creator",
    featured: true,
    features: [
      "30 image removals",
      "Credits valid for 90 days",
      "One-time purchase",
      "No subscription or automatic renewal",
      "Transparent PNG download",
      "Commercial use",
      "Good for product and social media images"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29.99",
    period: "one-time purchase",
    credits: "120 credits",
    unitPrice: "$0.25 per image",
    description: "For ecommerce sellers, designers, and frequent users.",
    cta: "Buy Pro",
    featured: false,
    features: [
      "120 image removals",
      "Credits valid for 90 days",
      "One-time purchase",
      "No subscription or automatic renewal",
      "Transparent PNG download",
      "Commercial use",
      "Best value for frequent usage"
    ]
  }
];

const faqs = [
  {
    question: "Is this a subscription?",
    answer:
      "No. Creator and Pro are one-time credit packs. There is no subscription and no automatic renewal. Paid credits are valid for 90 days."
  },
  {
    question: "How does a credit work?",
    answer:
      "One successfully processed image uses one credit. If background removal fails, the credit is not deducted."
  },
  {
    question: "Do credits roll over?",
    answer:
      "Paid credits are valid for 90 days after purchase. Free starter credits are separate and do not expire."
  },
  {
    question: "Why do you limit image removals?",
    answer:
      "Each background removal uses the remove.bg API, which has a real per-image cost. Credits keep pricing predictable."
  }
];

export default function PricingClient() {
  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");

  async function buyPlan(planId: string, provider: "paypal" | "creem" = "paypal") {
    if (planId === "free") {
      window.location.href = "/";
      return;
    }

    setError("");
    setLoadingPlan(`${provider}:${planId}`);

    try {
      const response = await fetch(
        provider === "creem" ? "/api/creem/create-checkout" : "/api/paypal/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ planId })
        }
      );
      const data = (await response.json().catch(() => null)) as {
        approvalUrl?: string;
        checkoutUrl?: string;
        error?: string;
      } | null;
      const checkoutUrl = provider === "creem" ? data?.checkoutUrl : data?.approvalUrl;

      if (!response.ok || !checkoutUrl) {
        throw new Error(
          data?.error ||
            `Could not start ${provider === "creem" ? "Creem" : "PayPal"} checkout.`
        );
      }

      window.location.href = checkoutUrl;
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : `Could not start ${provider === "creem" ? "Creem" : "PayPal"} checkout.`
      );
      setLoadingPlan("");
    }
  }

  async function buyWithPayPal(planId: string) {
    await buyPlan(planId, "paypal");
  }

  async function buyWithCreem(planId: string) {
    await buyPlan(planId, "creem");
  }

  function isLoading(planId: string, provider: "paypal" | "creem") {
    return loadingPlan === `${provider}:${planId}`;
  }

  function isPlanLoading(planId: string) {
    return loadingPlan.endsWith(`:${planId}`);
  }

  function checkoutLabel(planId: string, provider: "paypal" | "creem", fallback: string) {
    if (!isLoading(planId, provider)) {
      return fallback;
    }

    return "Starting checkout...";
  }

  async function startFree(planId: string) {
    if (planId === "free") {
      window.location.href = "/";
    }
  }

  async function buyPaidPlan(planId: string) {
    await buyWithCreem(planId);
  }

  async function buyFallbackPlan(planId: string) {
    await buyWithPayPal(planId);
  }

  async function handlePrimaryClick(planId: string) {
    if (planId === "free") {
      await startFree(planId);
      return;
    }

    await buyPaidPlan(planId);
  }

  async function handleSecondaryClick(planId: string) {
    await buyFallbackPlan(planId);
  }

  const paidProviderText = "Creem or PayPal";

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link
          className="flex items-center"
          href="/"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Remove.Services" className="h-8 w-auto" src="/logo.png" />
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link className="text-neutral-700 transition hover:text-neutral-950" href="/">
            Tool
          </Link>
          <Link
            className="text-neutral-700 transition hover:text-neutral-950"
            href="/blog"
          >
            Blog
          </Link>
          <Link
            className="rounded-md bg-neutral-950 px-4 py-2 text-white transition hover:bg-teal-800"
            href="/pricing"
          >
            Pricing
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-10 pt-8 text-center">
        <p className="mb-4 inline-flex rounded-full border border-teal-700/30 bg-white/70 px-3 py-1 text-sm font-medium text-teal-800">
          One-time credit packs
        </p>
        <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.04] text-neutral-950 sm:text-6xl">
          Buy credits when you need them
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
          Start with free credits, then buy Creator or Pro credits through {paidProviderText}.
          Paid credits are valid for 90 days. No subscription, no automatic renewal.
        </p>
        {error ? (
          <p className="mx-auto mt-5 max-w-2xl rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-12 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            className={`relative flex rounded-lg border bg-white p-6 shadow-lg shadow-neutral-900/5 ${
              plan.featured
                ? "border-teal-700 ring-2 ring-teal-700/20"
                : "border-neutral-200"
            }`}
            key={plan.name}
          >
            {plan.featured ? (
              <span className="absolute right-5 top-5 rounded-full bg-teal-700 px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
            ) : null}
            <div className="flex min-h-[34rem] w-full flex-col">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-950">{plan.name}</h2>
                <p className="mt-3 min-h-12 text-sm leading-6 text-neutral-600">
                  {plan.description}
                </p>
                <div className="mt-7">
                  <span className="text-5xl font-semibold tracking-normal text-neutral-950">
                    {plan.price}
                  </span>
                  <span className="ml-2 text-sm font-medium text-neutral-500">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold text-neutral-900">
                  {plan.credits}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{plan.unitPrice}</p>
              </div>

              <div className="mt-7 grid gap-3">
                <button
                  className={`rounded-md px-5 py-3 text-center text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-neutral-300 ${
                    plan.featured
                      ? "bg-teal-700 text-white hover:bg-teal-800"
                      : "bg-neutral-950 text-white hover:bg-neutral-800"
                  }`}
                  disabled={isPlanLoading(plan.id)}
                  onClick={() => handlePrimaryClick(plan.id)}
                  type="button"
                >
                  {plan.id === "free"
                    ? plan.cta
                    : checkoutLabel(plan.id, "creem", "Pay with Creem")}
                </button>

                {plan.id !== "free" ? (
                  <button
                    className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-800 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                    disabled={isPlanLoading(plan.id)}
                    onClick={() => handleSecondaryClick(plan.id)}
                    type="button"
                  >
                    {checkoutLabel(plan.id, "paypal", "Pay with PayPal")}
                  </button>
                ) : null}
              </div>

              <div className="my-6 h-px bg-neutral-200" />

              <ul className="space-y-3 text-sm leading-6 text-neutral-700">
                {plan.features.map((feature) => (
                  <li className="flex gap-3" key={feature}>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-700" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="border-y border-neutral-200 bg-white/70">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-950">
              Pricing rules
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              The MVP uses one-time credit purchases so costs stay predictable
              while every successful removal is backed by the remove.bg API.
            </p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-950">1 image = 1 credit</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Credits are deducted only after a background is successfully removed.
            </p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-950">90-day validity</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Creator and Pro credits expire 90 days after purchase.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-2xl font-semibold text-neutral-950">FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <div className="rounded-md border border-neutral-200 bg-white p-5" key={faq.question}>
              <h3 className="font-semibold text-neutral-950">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-5 pb-8 text-center text-sm text-neutral-600">
        <p>Need more than 120 images? Contact us for a custom volume plan.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          <Link className="font-medium text-neutral-700 hover:text-neutral-950" href="/blog">
            Blog
          </Link>
          <Link className="font-medium text-neutral-700 hover:text-neutral-950" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="font-medium text-neutral-700 hover:text-neutral-950" href="/terms">
            Terms of Service
          </Link>
          <Link className="font-medium text-neutral-700 hover:text-neutral-950" href="/acceptable-use-policy">
            Acceptable Use Policy
          </Link>
          <Link className="font-medium text-neutral-700 hover:text-neutral-950" href="/refund-policy">
            Refund Policy
          </Link>
          <Link className="font-medium text-neutral-700 hover:text-neutral-950" href="/contact">
            Contact
          </Link>
        </div>
      </footer>
    </main>
  );
}
