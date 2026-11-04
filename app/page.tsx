import { QuoteForm } from "@/components/quote-form";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="text-sm font-semibold tracking-wide text-teal-700">
        HARBOR ASSURANCE
      </p>
      <h1 className="mt-3 text-3xl font-bold">Renters insurance</h1>
      <p className="mt-3 text-slate-600">
        Create a temporary customer profile or try a sample to see how Harbor’s quote form is prefilled.
      </p>
      <QuoteForm />
    </main>
  );
}
