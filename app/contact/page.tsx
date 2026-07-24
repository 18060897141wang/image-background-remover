import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | Remove.Services",
  description:
    "Contact Remove.Services for support, billing questions, refund requests, and abuse reports."
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link className="text-sm font-semibold text-neutral-950" href="/">
            Remove.Services
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-600">
            <Link className="hover:text-neutral-950" href="/pricing">
              Pricing
            </Link>
            <Link className="hover:text-neutral-950" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-neutral-950" href="/privacy">
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-sm font-medium text-blue-700">Support</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
          Contact Remove.Services
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700">
          For product support, payment questions, refund requests, privacy questions,
          or abuse reports, contact us by email.
        </p>

        <section className="mt-10 rounded-md border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-neutral-950">Email</h2>
          <p className="mt-3 text-base leading-7 text-neutral-700">
            <a className="font-medium text-blue-700 hover:text-blue-900" href="mailto:support@remove.services">
              support@remove.services
            </a>
          </p>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Please include your account email, order date if relevant, and a short
            description of the issue so we can review it efficiently.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-neutral-950">Useful Links</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link className="rounded-md border border-neutral-200 bg-white p-4 font-medium text-neutral-800 hover:border-neutral-400" href="/terms">
              Terms of Service
            </Link>
            <Link className="rounded-md border border-neutral-200 bg-white p-4 font-medium text-neutral-800 hover:border-neutral-400" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="rounded-md border border-neutral-200 bg-white p-4 font-medium text-neutral-800 hover:border-neutral-400" href="/acceptable-use-policy">
              Acceptable Use Policy
            </Link>
            <Link className="rounded-md border border-neutral-200 bg-white p-4 font-medium text-neutral-800 hover:border-neutral-400" href="/refund-policy">
              Refund Policy
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
