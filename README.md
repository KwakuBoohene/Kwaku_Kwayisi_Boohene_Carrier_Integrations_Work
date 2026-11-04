# Harbor carrier integration

Practice exercise using Next.js, TypeScript, Tailwind CSS, and Zod. Tickets 1–3 provide the development foundation, Harbor adapter and eligibility checks, and a Profile → Provider → Quote portal with a form rendered from Harbor's JSON. Valid submissions display a prepared request; nothing is sent to a carrier.

## Run locally

Use Node 24.22.2 or a newer Node 24 patch. Docker and a Node version manager are optional for reviewers.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Stop development with Ctrl+C.

For production mode:

```bash
npm run build
npm run start
```

`start` needs an existing production build. No application environment variables are required.

## Develop in Docker

The author's workflow requires Docker Engine and Docker Compose, with no host Node installation. The image pins Node 24.22.2.

The default UID/GID is 1000/1000. No `.env` file is needed. If your user IDs differ, run `export APP_UID="$(id -u)" APP_GID="$(id -g)"` in your terminal before running Compose. These settings apply only to Docker.

```bash
docker compose run --build --rm app npm ci
docker compose up
```

Open http://localhost:3000 in the Ubuntu VM browser. Source changes update the development page. Access from the physical host depends on VM networking.

Stop development before building production output because both use the same build volume:

```bash
docker compose down
docker compose run --rm app npm run build
docker compose run --rm --service-ports app npm run start
```

Source and node_modules are shared with the Ubuntu VM through the project bind mount. Dependencies are installed by Docker as your user, so host VS Code can resolve imports and types without host Node. `.next` stays in a named volume; routine `docker compose down` preserves it. Do not reuse Linux node_modules on another operating system; reinstall with npm ci there.

If VS Code still shows stale missing-module or JSX errors after installation, run **TypeScript: Restart TS Server** from its Command Palette. There is no ESLint configuration in this repository; these dependency-related messages are TypeScript diagnostics.

## Tests

```bash
npm test
# Or inside Docker:
docker compose run --rm app npm test
```

Vitest runs once and exits. Ten unit tests cover sample/custom profile validation and mapping, incomplete answers, conditional pets, request serialization, invalid answers, both sample eligibility outcomes, calendar age boundaries, shared field rules, pet selection, and optional booleans.

## Structure

- `app/`: Next.js page and Tailwind stylesheet.
- `components/`: temporary-profile creation, JSON-driven quote controls, profile review, form state, and eligibility display.
- `lib/`: standard types, shared field/date rules, and Harbor adapter/eligibility modules.
- `tests/`: ten domain and shared-rule unit tests.
- `data/`: the two sample profiles and unmodified Harbor definition.
- `plans/`: tickets; `plans/specs/` contains their specifications and verification records.

## Try the portal

1. **Profile:** choose Create a temporary profile (the primary action) or Use a sample profile. Creation uses the standard profile fields; the sample option offers unchanged Maya/Sam fixtures. Nothing is saved, and refresh returns to the portal start.
2. **Provider:** review the chosen customer's name and explicitly choose Harbor Assurance — Renters insurance. Harbor is the only provider available. Profile creation/selection does not skip this step.
3. **Quote:** Harbor checks eligibility, prefills known answers, and asks for missing details. Prepare quote request validates answers and displays exact Harbor JSON without sending it anywhere.

- Back navigation retains the chosen profile. Returning to Harbor with that same profile also retains its answers and prepared output; hidden quote controls are unavailable outside the Quote step.
- Change profile returns to profile options. Continue with this profile resumes the same customer; selecting or creating a replacement starts a clean quote session.
- Dog is preselected only when known, but the complete pet question still needs an explicit answer. Add other pets or confirm These are all my pets. None is exclusive, and breed appears only with Dog.
- Coverage is a customer selection; five-year claims is a separate question from the profile's three-year count. Sprinklers are optional.
- Edit prefilled details allows corrections without changing sample fixtures. Eligibility follows those effective answers. Editing an answer clears previous request output.
- Sam's age and unsupported-state reasons appear immediately after choosing Harbor, not on the provider screen. Missing questions are not required while ineligible.

Local reducers coordinate portal navigation and quote transitions. Prefills, errors, and eligibility are derived; profile creation uses native inputs and local feedback. No state-management library, routing framework, backend, or persistence was added.

## Adapter and eligibility

Zod parses the carrier definition and infers its TypeScript types. Field validation is generated from Harbor's JSON metadata. Validated answers are narrowed to the Harbor request type once, then a serializer formats the birth date without revalidating them. Semantic mapping, partial pet knowledge, and eligibility remain explicit domain logic. No numeric or boolean coercion is applied.

`prepareHarborAnswers(profile, customerAnswers?)` returns prefilled Harbor answers and visible questions still needing input. `harborRequestAdaptor(profile, customerAnswers, referenceDate)` returns either `{ ok: true, request }` or `{ ok: false, fieldErrors, eligibilityReasons }`. Reference dates are explicit YYYY-MM-DD strings, making eligibility deterministic. Form-state birth dates remain ISO; successful requests use MM/DD/YYYY.

`checkHarborEligibility({ date_of_birth, residence_state }, referenceDate)` accepts the ISO birth date and full state name. It checks the minimum age and supported states declared in Harbor's JSON. The builder rechecks effective answers after customer edits and never returns a request for invalid, incomplete, or ineligible input.

Assumptions and mapping decisions:

- Profile names form the legal name; state codes map explicitly to full names.
- Customers select coverage. Property value is not automatically converted to requested coverage.
- Dog ownership provides only a partial pet answer; customers explicitly answer the full pet question. No dog does not imply no pets.
- Known breeds map to exact Harbor options or Other; hidden breed answers are omitted.
- Customers supply five-year claims; three-year counts are never substituted or cross-checked.
- Optional sprinklers remain absent until answered; false and zero remain meaningful values.
- Eligibility uses calendar birthdays; February 29 birthdays advance on March 1 in non-leap years.
- Final requests are flat objects using only Harbor field keys, with no carrier/product envelope.

On 2026-11-03, Maya passes eligibility but still needs follow-up answers. Sam fails both age and residence rules, even after completing the missing answers.

The multi-carrier explanation and final demo guidance will be expanded in Ticket 4.
