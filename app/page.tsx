import { QuotePortal } from "@/components/quote-portal";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-sm font-semibold tracking-wide text-teal-700">
        INSURANCE QUOTES
      </p>
      <h1 className="mt-3 text-3xl font-bold">Renters quote portal</h1>
      <p className="mt-3 text-slate-600">
        Choose a profile, select an insurance provider, and prepare your renters quote request.
      </p>
      <QuotePortal />
    </main>
  );
}
