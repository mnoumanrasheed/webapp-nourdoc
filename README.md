# NourDoc Premium Healthcare Workspace

A responsive Next.js App Router + TypeScript demonstration workspace for hospital operations, clinician activity, patient encounter navigation, and local clinical-report review workflows.

The application uses a premium white interface with NourDoc teal/emerald accents. All displayed records are synthetic demonstration fixtures. No live patient data, production identity provider, durable clinical writes, signatures, billing integration, or external sharing are connected.

## Local setup

Requires Node.js 20.9+.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set a unique 32+ character `SESSION_SECRET` in `.env.local`. Keep:

```text
DEMO_MODE=true
NEXT_PUBLIC_DATA_MODE=mock
```

Open `http://localhost:3000/login` and choose either demonstration role.

## Role-aware routes

### Hospital administrator

- `/hospital/dashboard` — Today KPIs, minute allocation, care-setting activity, and clinician utilization.
- `/hospital/doctors` — Searchable demonstration doctor directory.
- `/hospital/doctors/[doctorId]` — Scoped clinician activity detail.

### Doctor

- `/doctor/dashboard` — Dr. Ahmed Khan's demonstration activity and recent encounters.
- `/doctor/encounters` — Search by patient/encounter, filter by care setting and status.
- `/doctor/encounters/[encounterId]` — Encounter detail with filter-preserving return navigation.
- `/clinical/reports/[reportId]` — Structured report editing and local review workflow.

Legacy `/hospital`, `/doctor`, and `/reports/[id]` paths redirect to canonical routes.

## Working interactions

- Signed, HTTP-only demonstration session cookie and role-aware server checks.
- Responsive sidebar and mobile drawer.
- Profile menu and logout.
- Today, 7 Days, and 30 Days filters. Only Today has supplied fixture data; other periods show honest empty states.
- Doctor search and detail navigation.
- Encounter search, care-setting filter, status filter, details, and report navigation.
- Structured report editing, save draft, submit for review, request revision, confirmation before demo approval, and 1–5 usefulness rating.
- Loading skeletons, empty states, error states, retries, focus states, and reduced-motion support.

Report mutations update local React state only and are explicitly labeled preview-only. They do not create a signed clinical document.

## Data architecture

`lib/repositories/workspace-repository.ts` defines the logical operations required by the frontend. `lib/repositories/mock-workspace-repository.ts` provides deterministic demonstration data. `lib/repositories/index.ts` selects the implementation using `NEXT_PUBLIC_DATA_MODE`.

Only `mock` mode is implemented. API mode intentionally throws until verified backend contracts are supplied. Internal Next.js API routes enforce current demonstration session scope before reading mock fixtures.

## Quality checks

```bash
npm run test
npm run typecheck
npm run build
```

## Backend requirements

Before production integration, supply and validate:

- Identity provider/session verification and role/tenant claims.
- Hospital and doctor ownership rules.
- Pagination/filter contracts for doctors and encounters.
- Report versioning, validation, optimistic concurrency, audit events, and signed approval transitions.
- ICD-10/CPT verification service boundaries.
- Metric definitions, reporting timezone, billing sources, and currency semantics.
- Runtime response validation and standardized error payloads.
- Privacy, security, retention, logging, and regulatory controls.

Do not reuse the demonstration role selector or browser-local report state as production authentication or clinical persistence.
