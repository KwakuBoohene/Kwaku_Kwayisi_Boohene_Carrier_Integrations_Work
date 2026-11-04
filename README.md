# Harbor carrier integration

A renters-insurance quote portal built with Next.js, TypeScript, Tailwind CSS, and Zod. The portal walks through **Profile → Provider → Quote**: create a temporary customer profile or choose a sample, select Harbor Assurance, and complete its JSON-driven form. A valid result displays Harbor's request payload.

## Run locally

Use **Node 24.22.2 or a newer Node 24 patch**.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Stop development with Ctrl+C before production mode:

```bash
npm test
npm run build
npm run start
```

Tests run once and exit. `start` requires a completed build; Ctrl+C stops either server.


## Try the portal

1. **Profile:** create test details or choose Maya/Sam through Use a sample profile. 
2. **Provider:** review the selected customer and explicitly choose Harbor Assurance
3. **Quote:** review prefills, complete missing answers, and select Prepare quote request. Ineligible customers see all applicable reasons here before completing unnecessary questions.

Internal Back actions retain the selected profile and same-profile quote answers/output. Change profile lets you resume that profile or replace it; selecting/reloading a profile resets its quote. Refresh discards everything in memory and returns to profile options. Unsubmitted profile-creation drafts are not retained when leaving that form.



## Mapping decisions and assumptions

| Harbor information | Behavior |
| --- | --- |
| Legal name | Join trimmed first/last names; assume those profile names are the legal name. |
| Birth date | Keep YYYY-MM-DD in profile/form state; serialize MM/DD/YYYY without timezone conversion. |
| Residence/ZIP | Translate the state code to its full name; retain ZIP strings and leading zeroes. |
| Phone | Ask; the standard profile has no phone number. Harbor provides no additional phone pattern. |
| Coverage | Ask for an allowed numeric amount. Property value does not determine requested coverage; no automatic rounding. |
| Pets | Prefill Dog when the profile records dog ownership, without extra confirmation. Keep the selection editable so customers can add other pets. No dog does not imply None; None is exclusive. |
| Dog breed | Normalize known breeds to Harbor options; use Other for an unlisted known breed. Ask if unknown and Dog is selected; omit when hidden. |
| Five-year claims | Prefill the known three-year count as an editable starting value, without extra confirmation. Increase it for older claims within five years; reject totals below the known count. This assumes the same claims definition/reference date, not that older claims are known to be absent. Clearing it leaves a required blank. |
| Sprinklers | Optional, with no default. Omit unanswered values; preserve explicit false and numeric zero. |
| Request shape | Flat object of Harbor field keys; no carrier/product envelope or profile-only fields. |

**Validation** checks input types, required/conditional answers, patterns, options, and numeric constraints. **Eligibility** checks Harbor's minimum age and supported states and returns every applicable reason. No breed restrictions are invented. The profile creator and input controls explicitly parse numbers/booleans; the adapter requires the correct types rather than coercing bad answers.

Zod parses the standard profile and carrier definition and generates field validation from Harbor metadata. The adapter validates once; the serializer only formats the validated request. Age uses calendar birthdays, with March 1 assumed for February 29 birthdays in non-leap years. The application uses the browser's current local date and refreshes it on submission. Tests pass fixed reference dates: on 2026-11-03 Maya is eligible and Sam fails both rules; that date is not hard-coded into the UI.

## Code organization and 50 carriers

- `app/` and `components/`: portal/profile creation, reducer-driven navigation and quote state, shared field controls, and feedback.
- `lib/profile.ts`, `lib/form-schema.ts`, `lib/form-rules.ts`: standard input schema, supported carrier definitions, and reusable validation/visibility rules. `lib/dates.ts` and `lib/us-states.ts` provide shared conversions.
- `lib/carriers/harbor/`: explicit mapping, eligibility, pet rules, and typed request serialization. `harborRequestAdaptor(profile, answers, referenceDate)` returns either a request or field errors/eligibility reasons; `prepareHarborAnswers` exposes prefills and missing questions.
- `data/`: original Harbor definition and both unchanged sample profiles. `tests/`: ten unit cases covering mapping, profiles, claims defaults, conditions, invalid values, and date boundaries.

For 50 carriers, I would build an LLM-powered tool which helps in adapter creation. Uploading a carrier's JSON form would automatically start a workflow that generates a draft adapter. The tool would supply the LLM with our standard customer profile, shared form and validation code, approved adapters, and any uploaded carrier documentation. It would generate the mappings and conversions, identify missing answers, and flag unclear requirements for review.

The workflow would also generate sample customers with different ages, states, pets, claims, and missing details, then run the adapter and its tests in an isolated environment. Results would show whether it produces the right carrier format and catches invalid or ineligible applications. A reviewer would check the proposed mappings and expected results against the carrier's requirements, because the LLM could make the same mistake in both the adapter and its tests. Failed checks and reviewer feedback would guide another generation and test cycle.

After approval, the adapter would run as normal code. Uploading an updated carrier form would trigger the same workflow and rerun existing tests before the update is approved.

## With more time

I would build a small version of this tool and try it with a second carrier whose fields and rules differ from Harbor's. I would measure the time from JSON upload to an approved adapter, how many corrections it needs, and which mistakes the tests catch, then compare that with writing the adapter manually. That would show whether automated onboarding actually saves time while keeping the mappings correct.
