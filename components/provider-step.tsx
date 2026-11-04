import type { CustomerProfile } from "@/lib/profile";

interface ProviderStepProps {
  profile: CustomerProfile;
  onBack: () => void;
  onSelect: () => void;
}

export function ProviderStep({ profile, onBack, onSelect }: ProviderStepProps) {
  return (
    <section className="space-y-5" aria-labelledby="providers-heading">
      <button type="button" onClick={onBack}
        className="text-sm font-medium text-teal-800 underline underline-offset-4">Back to profiles</button>
      <div>
        <h2 id="providers-heading" className="text-xl font-semibold">Choose an insurance provider</h2>
        <p className="mt-2 text-slate-600">Profile: <strong className="text-slate-900">{profile.first_name} {profile.last_name}</strong></p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold">Harbor Assurance</h3>
        <p className="mt-1 text-slate-600">Renters insurance</p>
        <p className="mt-3 text-sm text-slate-600">Check eligibility and complete the details Harbor needs for your quote request.</p>
        <button type="button" onClick={onSelect}
          className="mt-5 rounded-md bg-teal-800 px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
          Choose Harbor Assurance
        </button>
      </div>
    </section>
  );
}
