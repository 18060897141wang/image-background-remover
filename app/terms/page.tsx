import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Remove.Services",
  description:
    "Terms governing the lawful use of Remove.Services, including prohibited content, accounts, credits, payments, and user responsibilities."
};

const sections = [
  {
    title: "Use of the Service",
    body: [
      "Image Background Remover lets users upload images, remove backgrounds, and download processed results.",
      "You must use the service only for lawful purposes and in a way that does not abuse, overload, disrupt, or attempt to compromise the website or its providers.",
      "Your use of the service is also governed by our Acceptable Use Policy."
    ]
  },
  {
    title: "Accounts and Login",
    body: [
      "Some features require Google sign-in. You are responsible for keeping your Google account secure and for activity under your account.",
      "We may suspend or restrict access if we detect abuse, fraud, unauthorized automation, or violations of these Terms."
    ]
  },
  {
    title: "Credits and Plans",
    body: [
      "Each successful background removal uses one credit. New users may receive free starter credits.",
      "Paid credit packs are one-time purchases. Creator includes 30 credits, and Pro includes 120 credits. Paid credits are valid for 90 days after purchase unless the checkout page states otherwise. Free starter credits are separate and do not expire.",
      "Credits have no cash value, cannot be transferred, and may be adjusted if a payment is reversed, refunded, disputed, or found to be fraudulent."
    ]
  },
  {
    title: "Payments and Refunds",
    body: [
      "Payments may be processed by third-party payment providers, including PayPal, Creem, or other supported payment processors. Paid credits are added after successful payment confirmation.",
      "Unless required by law, purchases are final once credits are delivered. If a technical issue prevents credit delivery, we will make reasonable efforts to fix the issue or restore the correct credit balance."
    ]
  },
  {
    title: "User Content",
    body: [
      "You keep ownership of images you upload. You give us the limited permission needed to process those images and return the background-removed result.",
      "You confirm that you have the rights needed to upload and process each image, and that the image does not violate laws, privacy rights, intellectual property rights, or third-party platform rules."
    ]
  },
  {
    title: "Prohibited Content",
    body: [
      "You may not upload, process, edit, remove backgrounds from, store, or distribute images that contain pornography, nudity, sexually explicit material, sexually suggestive material, or other NSFW content.",
      "You may not use the service for content that depicts, exploits, abuses, or sexualizes minors; non-consensual intimate imagery; sexual exploitation; trafficking; violence; terrorism; illegal activity; fraud; harassment; hate; abuse; malware; or content that infringes third-party rights.",
      "We may refuse processing, restrict access, suspend or terminate accounts, reverse credits, and take other reasonable action when prohibited content or abusive activity is detected."
    ]
  },
  {
    title: "Third-Party Services",
    body: [
      "The service depends on third-party providers including Google, PayPal, Creem, remove.bg, and Cloudflare.",
      "Availability, processing quality, login, payments, and delivery may be affected by those providers. Their own terms and policies may also apply."
    ]
  },
  {
    title: "Service Availability",
    body: [
      "We aim to keep the service reliable, but we do not guarantee uninterrupted access, error-free processing, or that every image will produce a perfect result.",
      "We may update, pause, limit, or discontinue parts of the service when needed for maintenance, security, provider changes, or product improvements."
    ]
  },
  {
    title: "No Warranties",
    body: [
      "The service is provided as is and as available. To the fullest extent allowed by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement."
    ]
  },
  {
    title: "Limitation of Liability",
    body: [
      "To the fullest extent allowed by law, Image Background Remover will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, business, or goodwill.",
      "Our total liability for claims related to the service will not exceed the amount you paid for the credits related to the claim."
    ]
  },
  {
    title: "Changes to These Terms",
    body: [
      "We may update these Terms as the product, pricing, providers, or legal requirements change. The effective date above shows when this page was last updated."
    ]
  },
  {
    title: "Contact",
    body: ["For questions about these Terms, contact the site owner at support@remove.services."]
  }
];

export default function TermsOfServicePage() {
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
            <Link className="hover:text-neutral-950" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-neutral-950" href="/acceptable-use-policy">
              Acceptable Use
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
          Terms of Service
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700">
          These Terms of Service govern your access to and use of Image Background Remover,
          available at remove.services. By using the website, signing in, uploading an image,
          or purchasing credits, you agree to these Terms.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
          By uploading an image, you also agree to the{" "}
          <Link className="font-medium text-blue-700 hover:text-blue-900" href="/acceptable-use-policy">
            Acceptable Use Policy
          </Link>
          .
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
