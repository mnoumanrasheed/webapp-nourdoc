# NourDoc future integration boundary

No external API or production database is connected in this phase. The application operates in UI-first prototype mode by default, reading directly from the mock `WorkspaceRepository` on the server without requiring credentials or secret cookies.

The contracts and requirements detailed below describe proposed future architecture for when real backend services, IAM/SSO identity providers, and clinical persistence layers are implemented.

## Current repository contract

`lib/repositories/workspace-repository.ts` defines:

- Hospital overview by verified hospital scope and reporting period.
- Hospital doctor sample roster.
- Aggregate-only administrator doctor activity summary.
- Doctor overview by verified hospital and doctor scope.
- Doctor-scoped encounter list and encounter lookup.
- Doctor-scoped clinical report lookup.
- Future report draft, review, revision, approval, and rating operations.

`lib/repositories/mock-workspace-repository.ts` is the only implementation. `NEXT_PUBLIC_DATA_MODE=mock` selects it. Any other mode fails instead of inventing an integration.

## Authorization invariants

- Identity, role, hospital ID, and doctor ID come from a verified server session.
- Browser role fields, query parameters, and route IDs never grant authorization.
- An administrator may read operational aggregates and the sample roster for the bound hospital, not doctor-only encounters or report content.
- A doctor may read only encounters and reports matching both the bound hospital ID and doctor ID.
- Inaccessible and missing doctor-scoped resources use the same not-found behavior to avoid revealing another clinician's records.
- Report-read and report-write permissions must remain separate in a real backend.

## Future API adapter requirements

If a backend is supplied later, add a typed repository implementation rather than spreading fetch calls through components. Validate every response at runtime and agree on:

- Verified identity/session claims and tenant ownership rules.
- Pagination and filter semantics for doctors and encounters.
- Reporting timezone, date boundaries, and metric definitions.
- Distinct-patient versus encounter-count semantics.
- Minute allocation, consumption, rounding, and balance rules.
- Expenditure source, currency, tax, and paid/incurred semantics.
- Standard 401, 403, 404, 409, 422, and error payload behavior.
- Request correlation, privacy-safe logging, retention, and audit metadata.

## Clinical report writes

The current UI keeps report changes in component memory only. A real write contract requires:

- Stable report and revision identifiers.
- Optimistic concurrency/version checks.
- Draft validation and structured field limits.
- Explicit transition permissions.
- Immutable audit events with verified actor identity.
- Idempotency behavior.
- Separate physician-signature and approval operations.
- Clear handling for clinical coding verification.

Never implement approval as an unverified browser boolean. “Approved in demo” must not be mapped to a signed clinical status.

## Local auth routes

`POST /api/auth/demo-login` and `POST /api/auth/logout` exist only for the credential-protected local demonstration. They are same-origin, no-store operations and are not proposed production identity endpoints.
