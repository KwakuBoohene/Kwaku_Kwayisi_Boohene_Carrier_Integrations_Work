# Harbor carrier integration

A renters-insurance quote portal built with Next.js, TypeScript, Tailwind CSS, and Zod. The portal walks through **Profile → Provider → Quote**: create a temporary customer profile or choose a sample, select Harbor Assurance, and complete its JSON-driven form. A valid result displays Harbor's request payload; no quote is priced or sent externally.

## Run locally

Use **Node 24.22.2 or a newer Node 24 patch**. Reviewers do not need Docker, a version manager, or application environment variables.

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

## Develop in Docker

The author's Ubuntu VM workflow uses Docker Engine and Docker Compose with a pinned Node 24.22.2 image, without host Node/npm.

```bash
docker compose run --build --rm app npm ci
docker compose up
```

Open [localhost:3000](http://localhost:3000) inside the VM. Source changes update the page. Run tests in another terminal, then stop development before production checks:

```bash
docker compose run --rm app npm test
docker compose stop app
docker compose run --rm app npm run build
docker compose run --rm --service-ports app npm run start
# After stopping the server with Ctrl+C:
docker compose down
```

UID/GID default to 1000/1000. If yours differ, run `export APP_UID="$(id -u)" APP_GID="$(id -g)"` before building/running Compose. No `.env` file is needed. Source and `node_modules` are shared with Ubuntu so VS Code can resolve types; Node/npm still run inside Docker. `.next` uses a named volume, preserved by ordinary shutdown. Reinstall dependencies when changing operating systems. For stale editor diagnostics after installation, use **TypeScript: Restart TS Server**.

## Try the portal

1. **Profile:** create test details or choose Maya/Sam through Use a sample profile. Standard-profile validation accepts valid US states and ages independently of Harbor eligibility.
2. **Provider:** review the selected customer and explicitly choose Harbor Assurance, the only available provider.
3. **Quote:** review prefills, complete missing answers, and select Prepare quote request. Ineligible customers see all applicable reasons here before completing unnecessary questions.

Internal Back actions retain the selected profile and same-profile quote answers/output. Change profile lets you resume that profile or replace it; selecting/reloading a profile resets its quote. Refresh discards everything in memory and returns to profile options. Unsubmitted profile-creation drafts are not retained when leaving that form.

For Maya, enter a phone, select coverage, complete the pet list, and optionally answer sprinklers. Her five-year claims starts at zero and remains editable. For Sam, choosing Harbor shows both the minimum-age and Nevada failures, using the current date. Edit prefilled details supports corrections without mutating either sample fixture. Changing any answer clears previously prepared output.

## Mapping decisions and assumptions

| Harbor information | Behavior |
| --- | --- |
| Legal name | Join trimmed first/last names; assume those profile names are the legal name. |
| Birth date | Keep YYYY-MM-DD in profile/form state; serialize MM/DD/YYYY without timezone conversion. |
| Residence/ZIP | Translate the state code to its full name; retain ZIP strings and leading zeroes. |
| Phone | Ask; the standard profile has no phone number. Harbor provides no additional phone pattern. |
| Coverage | Ask for an allowed numeric amount. Property value does not determine requested coverage; no automatic rounding. |
| Pets | Dog ownership is partial information. Add other pets or explicitly confirm an unchanged preselected Dog. No dog does not imply None; None is exclusive. |
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

For 50 carriers, reuse the renderer and schema/field rules, while adding reviewed mappings, eligibility, request formatting/types, and contract fixtures per carrier. A small provider/adapter registry would connect these integrations to provider selection; the current portal intentionally has only Harbor. Version definitions and test representative profiles against expected payloads/rejections to catch changed keys, options, or rules. New field types or conditional constructs need explicit schema/renderer extensions. Similar field names alone cannot establish a semantic mapping.

With more time, add browser regression coverage for navigation/conditional inputs, stronger definition checks for duplicate keys and invalid dependencies, and broader accessibility/responsive checks. Introduce a registry and versioned fixtures when adding a second carrier, rather than implementing that infrastructure speculatively now.
