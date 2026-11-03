# Harbor carrier integration

Practice exercise using Next.js, TypeScript, and Tailwind CSS. Ticket 1 provides the development foundation, profile types, carrier schema, and supplied data. Quote mapping, eligibility, and the dynamic form are not implemented yet.

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

Source is bind-mounted. Dependencies and `.next` output live in separate named volumes initialized from the image with application-user ownership. Routine `docker compose down` preserves those volumes. If changing UID/GID after creating volumes, recreate this project's disposable dependency/build volumes and reinstall packages.

## Tests

```bash
npm test
# Or inside Docker:
docker compose run --rm app npm test
```

Vitest runs once and exits. There are no test files in Ticket 1, so it currently reports no tests and exits with status 1. The following tickets add 10 domain test cases; no placeholder tests are included.

## Structure

- `app/`: minimal Next.js shell and Tailwind stylesheet.
- `lib/`: standard profile and supported form/answer types.
- `data/`: the two sample profiles and unmodified Harbor definition.
- `plans/`: tickets; `plans/specs/` contains their specifications and verification records.

Mapping assumptions, the multi-carrier explanation, and final demo guidance will be expanded as the remaining tickets are completed.
