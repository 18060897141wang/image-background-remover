import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Image Background Remover",
  description:
    "Privacy Policy for Image Background Remover, including image processing, Google sign-in, payments, cookies, and third-party services."
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "When you sign in with Google, we may receive your Google account identifier, email address, display name, and profile image so we can create and manage your account.",
      "We store account, session, credit balance, purchase, and payment confirmation records needed to operate the service.",
      "When you upload an image, the image is processed temporarily so the background can be removed. We do not use uploaded images to build a public gallery or sell image content."
    ]
  },
  {
    title: "How Images Are Processed",
    body: [
      "Uploaded images are processed in memory by our application and sent to the remove.bg API for background removal.",
      "We do not intentionally store uploaded images on our servers after processing is complete. Your browser receives the processed result so you can download it."
    ]
  },
  {
    title: "How We Use Information",
    body: [
      "We use your information to provide login, manage credits, process payments, deliver background removal results, prevent abuse, troubleshoot errors, and improve reliability.",
      "We may use basic technical logs for security, diagnostics, and service monitoring."
    ]
  },
  {
    title: "Third-Party Services",
    body: [
      "We use Google Sign-In for authentication, third-party payment providers including PayPal and Creem for payments, remove.bg for background removal, and Cloudflare for hosting, security, and delivery.",
      "These providers may process information according to their own privacy policies and service terms."
    ]
  },
  {
    title: "Payments",
    body: [
      "Payments may be handled by third-party payment providers, including PayPal, Creem, or other supported payment processors. We do not store your full card number, bank account details, PayPal password, or equivalent payment account credentials.",
      "We store payment status, order identifiers, credit transactions, and related records so we can grant credits and resolve support issues."
    ]
  },
  {
    title: "Cookies",
    body: [
      "We use necessary cookies or similar technologies to keep you signed in and protect your session.",
      "You can block cookies in your browser, but login and credit-based features may stop working."
    ]
  },
  {
    title: "Data Retention",
    body: [
      "Account, credit, order, and transaction records may be retained as long as needed to provide the service, meet legal obligations, resolve disputes, and prevent fraud.",
      "Uploaded images are not intentionally retained by our application after processing is complete."
    ]
  },
  {
    title: "Your Choices",
    body: [
      "You may stop using the service at any time. If you want to request account deletion or ask a privacy question, contact the site owner at support@remove.services.",
      "We may need to keep certain transaction or security records where required by law or legitimate operational needs."
    ]
  },
  {
    title: "Changes",
    body: [
      "We may update this Privacy Policy as the service changes. The effective date above shows when this page was last updated."
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link className="text-sm font-semibold text-neutral-950" href="/">
            Image Background Remover
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-600">
            <Link className="hover:text-neutral-950" href="/pricing">
              Pricing
            </Link>
            <Link className="hover:text-neutral-950" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-neutral-950" href="/refund-policy">
              Refund
            </Link>
            <Link className="hover:text-neutral-950" href="/contact">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-sm font-medium text-blue-700">Effective date: July 20, 2026</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
          Privacy Policy
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700">
          This Privacy Policy explains how Image Background Remover, available at
          remove.services, collects, uses, and protects information when visitors use the
          website, sign in, buy credits, or remove image backgrounds.
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
