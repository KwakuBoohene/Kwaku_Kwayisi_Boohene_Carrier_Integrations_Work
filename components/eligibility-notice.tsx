import type { EligibilityReason } from "@/lib/carriers/harbor/eligibility";

export function EligibilityNotice({ reasons }: { reasons: EligibilityReason[] }) {
  if (!reasons.length) return null;
  return (
    <section role="alert" aria-labelledby="eligibility-heading"
      className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
      <h2 id="eligibility-heading" className="font-semibold">Harbor cannot quote this customer</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {reasons.map(reason => <li key={reason.code}>{reason.message}</li>)}
      </ul>
    </section>
  );
}
