import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-xl rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-xl shadow-neutral-900/10">
        <p className="text-sm font-semibold text-amber-700">Checkout cancelled</p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950">
          No payment was made
        </h1>
        <p className="mt-4 text-neutral-700">
          You can return to pricing whenever you want to buy more credits.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link
            className="rounded-md bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
            href="/pricing"
          >
            Back to pricing
          </Link>
          <Link
            className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800"
            href="/"
          >
            Tool
          </Link>
        </div>
      </section>
    </main>
  );
}
