import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Remove.Services",
  description:
    "Refund policy for Remove.Services credit purchases and image background removal."
};

const sections = [
  {
    title: "Credit Purchases",
    body: [
      "Remove.Services sells one-time credit packs for image background removal. Paid credits are added after successful payment confirmation.",
      "Creator includes 30 credits and Pro includes 120 credits. Paid credits are valid for 90 days after purchase unless the checkout page states otherwise."
    ]
  },
  {
    title: "When Refunds May Be Considered",
    body: [
      "If a technical issue prevents paid credits from being delivered, contact us and we will make reasonable efforts to restore the correct credit balance or provide an appropriate remedy.",
      "If a duplicate payment occurs because of a payment processing error, contact us with the payment details so we can review the issue."
    ]
  },
  {
    title: "Non-Refundable Usage",
    body: [
      "Unless required by law, purchases are final once credits are delivered and used for successful background removal.",
      "Credits used for successful image processing are not refundable because each successful removal uses third-party processing resources."
    ]
  },
  {
    title: "Abuse and Prohibited Content",
    body: [
      "We may deny refunds, suspend accounts, reverse credits, or take other reasonable action for fraud, chargeback abuse, payment disputes, or violations of our Terms of Service or Acceptable Use Policy."
    ]
  },
  {
    title: "How to Contact Us",
    body: [
      "For refund questions, contact support@remove.services with your account email, order date, and a short description of the issue."
    ]
  }
];

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link className="text-sm font-semibold text-neutral-950" href="/">
            Remove.Services
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-600">
            <Link className="hover:text-neutral-950" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-neutral-950" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-neutral-950" href="/contact">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-sm font-medium text-blue-700">Effective date: July 24, 2026</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
          Refund Policy
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700">
          This Refund Policy explains how Remove.Services handles refund requests for
          credit purchases and background removal services.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-neutral-950">{section.title}</h2>
              <div className="mt-3 space-y-3 text-base leading-7 text-neutral-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
