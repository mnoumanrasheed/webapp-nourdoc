# NourDoc – Role-Scoped Clinical Workspace (Next.js Prototype)

A runnable **Next.js App Router + TypeScript** prototype inspired by the nine supplied screenshots. Includes premium dark/teal responsive hospital, doctor and clinical-report screens. Every displayed number and named sample record is from the screenshots or a straightforward arithmetic derivation, rather than fabricated historical data.

**Crucial:** This is a **UI/architecture demo**, **not an authenticated production clinical application**. No live patients, real healthcare identity provider, billing, approvals, document signatures, AI verification, integrations or durable data storage are implemented.

## Start locally

Requires Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env.local
# Change SESSION_SECRET to a new random value (32+ characters).
npm run dev
```

Open http://localhost:3000. Sign in via the **demo administrator** or **demo doctor** selector. The selector simulates a role and does not verify a real identity. For PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

### Quality checks

```bash
npm run test
npm run typecheck
npm run build
```

## Features

- **Hospital Administrator:** Today's 186 served, 2,480 minutes consumed, PKR 48,095 illustrative expenditure, 24 waiting; balance 12,520 / 15,000; utilization for emergency, OPD, IPD and telehealth; selected example clinicians.
- **Doctor:** Dr. Ahmed Khan's own dashboard, 28 served, 6 pending, 4 to approve, 385 consumed; balance 1,615 / 2,000; filter encounters by care setting.
- **Clinical report:** Provided Patient B / ND-1025 SOAP example, editable local preview notes, approval *simulation only*, optional rating, disabled integration/sharing, verification reminders.
- **Role guarding:** Signed, httpOnly, SameSite session cookie for demo; server pages and API routes check role and hospital/doctor scope. Unauthorized page requests are redirected; unauthorized API requests return 401/403. The mock identity selector itself is intentionally **not production authentication**.
- **Date filters:** Only Today has screenshot-backed fixtures. The 7-day and 30-day views show an honest empty state rather than inventing numbers.
- **Data boundary:** REST-style internal Next.js routes, suitable for later replacement with actual authorized API calls.

## Internal endpoints (demo fixtures)

| Method | Endpoint | Access | Response / behavior |
| --- | --- | --- | --- |
| POST | `/api/auth/demo-login` | Enabled only with `DEMO_MODE=true` | `{"role":"hospital_admin"}` or `{"role":"doctor"}`; creates a **demo** signed session. |
| POST | `/api/auth/logout` | Any | Clears session. |
| GET | `/api/hospital/overview?period=today` | Hospital admin | Hospital metrics, example clinicians, care setting breakdown for the signed-in hospital. |
| GET | `/api/doctor/overview?period=today` | Doctor | Doctor's own metrics and encounters. |
| GET | `/api/reports/ND-1025` | Doctor assigned to the encounter | Sample clinical report, if authorized. |
| PATCH | `/api/reports/ND-1025` | Not implemented | Returns HTTP 501 by design. There is no real clinical write capability. |

Other allowed values for `period`: `7d`, `30d`; they return `available: false` in this screenshot-derived fixture.

## Future backend integration: work required

1. Replace `lib/session.ts` demo-login with **real SSO / identity provider** and backend-issued sessions. Do not determine roles from client-supplied fields. Disable `DEMO_MODE` for real deployments.
2. Use your backend as the **source of truth** for `user_id`, `role`, `hospital_id`, `doctor_id` and permissions. Validate all identity claims server-side; never rely only on hidden tabs or URL checks. Hospitals must not access other hospitals; doctors only their assigned encounters/reports. Resolve `hospital_id` and `doctor_id` from the verified session, not request parameters.
3. Replace the mock functions in `lib/demo-data.ts` with server-side service/repository functions making authorized requests to the real APIs. Preserve the contracts in `lib/types.ts` or explicitly migrate them with backend mapping/validation.
4. Implement actual login, logout, session expiry/revocation, MFA where required, access/audit logs, rate limiting, authorization tests, and error states.
5. Add patient/encounter ownership checks and an audited report approval workflow, version control, approval signatures, workflow transitions, ICD/CPT verification, integration and sharing. Frontend-only approval cannot count as medical sign-off.
6. Add source-of-truth definitions for `minutes_consumed`, `minutes_allocated`, unique patients vs. encounter counts, waiting vs. pending, expenditure/currency, reporting period/timezone, and any billing chargebacks before deploying real analytics.
7. Follow applicable privacy regulations and perform a formal security/privacy review before processing health information. Do **not** place secrets or patient identifiers in client-exposed environment variables or analytics.
8. Persist edited clinical reports and feedback only through validated, authorized write APIs (not local component state). Build an API contract, status codes, idempotency, concurrency and errors before enabling "Approve" or "Share".

## Data assumptions intentionally avoided

- The screenshots show **only** a portion of hospital clinicians. The four examples do not add up to the hospital-wide total. We do not invent additional doctors or assume the list is comprehensive.
- The hospital and doctor balances are derived directly from the screenshot: hospital 12,520 available + 2,480 consumed = 15,000 allocated; doctor 1,615 available + 385 consumed = 2,000 allocated.
- The doctor may see Patient A–D in the screenshot, but only **Patient B / ND-1025** has an accompanying report. Other reports are not fabricated.
- Clinical text is illustrative, not medical advice or an AI verified finding. "Physician verification" labels show an outstanding action, not a completed check.
- The displayed numbers are snapshots for **Today in the reference mockup**, not live hospital readings for the current calendar day.

## Production constraints

This project deliberately does not include a production-ready auth adapter or backend: the original API specifications, identity provider, deployment environment, database schema and permission matrix have not been provided. Replace them once supplied; do not repurpose the demo session as production access control.
