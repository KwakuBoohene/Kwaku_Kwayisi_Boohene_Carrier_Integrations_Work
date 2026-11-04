import { QuoteForm } from "@/components/quote-form";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-sm font-semibold tracking-wide text-teal-700">
        HARBOR ASSURANCE
      </p>
      <h1 className="mt-3 text-3xl font-bold">Renters insurance</h1>
      <p className="mt-3 text-slate-600">
        We’ve filled in what your profile answers. Complete the remaining
        details below.
      </p>
      <QuoteForm />
    </main>
  );
}
