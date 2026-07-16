import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing - Image Background Remover",
  description:
    "Simple pricing for removing image backgrounds online. Start free, then upgrade for more monthly credits."
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: "3 credits",
    unitPrice: "Try before upgrading",
    description: "For first-time users who want to test background removal.",
    cta: "Start Free",
    href: "/",
    featured: false,
    features: [
      "3 free image removals",
      "Google sign-in required",
      "Transparent PNG download",
      "JPG, PNG, and WebP support",
      "Images up to 10MB"
    ]
  },
  {
    name: "Creator",
    price: "$9.99",
    period: "per month",
    credits: "30 credits / month",
    unitPrice: "$0.33 per image",
    description: "For creators, social sellers, and small content workflows.",
    cta: "Choose Creator",
    href: "/",
    featured: true,
    features: [
      "30 image removals per month",
      "Transparent PNG download",
      "Commercial use",
      "Good for product and social media images",
      "Monthly credits reset each billing cycle"
    ]
  },
  {
    name: "Pro",
    price: "$29.99",
    period: "per month",
    credits: "120 credits / month",
    unitPrice: "$0.25 per image",
    description: "For ecommerce sellers, designers, and frequent users.",
    cta: "Choose Pro",
    href: "/",
    featured: false,
    features: [
      "120 image removals per month",
      "Transparent PNG download",
      "Commercial use",
      "Built for repeat product-photo workflows",
      "Best value for frequent usage"
    ]
  }
];

const faqs = [
  {
    question: "How does a credit work?",
    answer:
      "One successfully processed image uses one credit. If background removal fails, the credit should not be deducted."
  },
  {
    question: "Do unused monthly credits roll over?",
    answer:
      "For the MVP pricing model, subscription credits reset each billing cycle and do not roll over."
  },
  {
    question: "Why do you limit image removals?",
    answer:
      "Each background removal uses the remove.bg API, which has a real per-image cost. Credits keep pricing predictable."
  },
  {
    question: "Can I use the images commercially?",
    answer:
      "Yes. Creator and Pro are intended for commercial workflows such as product images, listings, and social content."
  }
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link
          className="text-base font-semibold tracking-[0.08em] text-neutral-950"
          href="/"
        >
          IMAGE BG REMOVER
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link className="text-neutral-700 transition hover:text-neutral-950" href="/">
            Tool
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
          Simple credit-based pricing
        </p>
        <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.04] text-neutral-950 sm:text-6xl">
          Choose a plan that matches your image volume
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
          Start with free credits, then upgrade when you need more background
          removals for content, product photos, or ecommerce workflows.
        </p>
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

              <Link
                className={`mt-7 rounded-md px-5 py-3 text-center text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-teal-700 text-white hover:bg-teal-800"
                    : "bg-neutral-950 text-white hover:bg-neutral-800"
                }`}
                href={plan.href}
              >
                {plan.cta}
              </Link>

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
              The MVP uses a simple credit model so costs stay predictable while
              every successful removal is backed by the remove.bg API.
            </p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-950">1 image = 1 credit</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Credits are deducted only after a background is successfully removed.
            </p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold text-neutral-950">No rollover</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Monthly subscription credits reset each billing cycle in this MVP.
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
        Need more than 120 images per month? Contact us for a custom volume plan.
      </footer>
    </main>
  );
}
