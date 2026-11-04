# Harbor carrier integration

Practice exercise using Next.js, TypeScript, Tailwind CSS, and Zod. Tickets 1–3 provide the development foundation, Harbor adapter and eligibility checks, and a form rendered from Harbor's JSON. Valid submissions display a prepared request; nothing is sent to a carrier.

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

## Try the form

- Start by creating a temporary standard customer profile. Nothing is saved; refresh discards it. Enter any valid US state and birth date to test Harbor eligibility.
- Or skip setup with Use sample A — Maya Torres / Use sample B — Sam Lee. Neither sample is selected by default, and their supplied data is unchanged.
- After choosing a profile, known answers appear in Your profile. Enter a phone number, choose coverage, complete the pet selection, and provide five-year claims. Sprinklers are optional.
- Dog is preselected but does not describe every pet. Add any other pets or select These are all my pets. None is exclusive; dog breed is shown only when Dog is selected.
- Edit prefilled details allows corrections without changing the sample fixtures. Eligibility follows those effective answers.
- Prepare quote request validates all applicable answers and displays exact Harbor JSON. Editing any answer clears the previous result.
- Sam immediately shows age and unsupported-state reasons; follow-up questions are not required while ineligible.
- Create another profile opens an empty form. Creating or loading a profile resets quote answers, errors, edit state, and request output, including reloading the same sample. Browser-local calendar dates are used for eligibility and refreshed on submission.

The form uses a local React reducer to coordinate answer changes, submission attempts, edit mode, and request output. Prefills, errors, and eligibility are derived. Profile/session selection uses a small reducer to reset quote state; profile creation uses native form inputs and local validation feedback. No global state or form library is needed.

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
