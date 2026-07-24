import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | Remove.Services",
  description:
    "Rules for lawful image processing and prohibited content on Remove.Services."
};

const prohibitedItems = [
  "Pornography, nudity, sexually explicit material, sexually suggestive material, or other NSFW content.",
  "Content that depicts, exploits, abuses, or sexualizes minors.",
  "Non-consensual intimate imagery or content related to sexual exploitation, abuse, or trafficking.",
  "Violence, terrorism, illegal activity, fraud, harassment, hate, or abuse.",
  "Content that infringes copyright, trademark, privacy, publicity, or other third-party rights.",
  "Malware, malicious code, automated abuse, or attempts to disrupt, overload, or compromise the service.",
  "Any other content or activity that violates applicable law or creates risk for Remove.Services, users, payment providers, or partners."
];

export default function AcceptableUsePolicyPage() {
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
          Acceptable Use Policy
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-700">
          This Acceptable Use Policy explains the rules that apply when using
          Remove.Services to upload images, remove backgrounds, and download processed
          results.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-neutral-950">Permitted Use</h2>
          <div className="mt-3 space-y-3 text-base leading-7 text-neutral-700">
            <p>
              Remove.Services may only be used to process images that you own, are
              legally authorized to use, comply with applicable law, and do not violate
              another person&apos;s rights.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-neutral-950">
            Prohibited Content and Activities
          </h2>
          <p className="mt-3 text-base leading-7 text-neutral-700">
            You may not use Remove.Services to upload, process, edit, remove
            backgrounds from, store, or distribute content that includes:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-base leading-7 text-neutral-700">
            {prohibitedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-neutral-950">Enforcement</h2>
          <div className="mt-3 space-y-3 text-base leading-7 text-neutral-700">
            <p>
              We may refuse or stop processing, limit access, suspend or terminate
              accounts, reverse credits, or take other reasonable action when prohibited
              content or abusive activity is detected.
            </p>
            <p>
              Where required by law, we may preserve relevant information and cooperate
              with appropriate authorities.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-neutral-950">Report Abuse</h2>
          <p className="mt-3 text-base leading-7 text-neutral-700">
            To report suspected misuse of Remove.Services, contact{" "}
            <a className="font-medium text-blue-700 hover:text-blue-900" href="mailto:support@remove.services">
              support@remove.services
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
