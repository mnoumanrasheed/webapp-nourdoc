# NourDoc Premium Healthcare Workspace

A white-theme Next.js 16 UI-first demonstration workspace for hospital operations, clinician activity, synthetic patient encounter navigation, and physician-led review of one supplied sample report.

This is a UI-first prototype. It does not connect to a live healthcare API, EHR, billing platform, external identity provider, AI service, production database, or real patient records. All data displayed is synthetic.

## Quick start (no credentials or backend required)

Requirements: Node.js 20.9 or newer.

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` (or `http://localhost:3000/login`) in your browser.

- The landing page presents the **Explore NourDoc** role selector.
- Click **Hospital Administrator** to preview hospital operations, clinician activity, care setting comparisons, and minutes allocation.
- Click **Doctor / Clinician** to preview clinician KPIs, consultation minutes balance, assigned synthetic encounters, and report review.
- Click **Switch experience** from the top bar, sidebar, or user menu at any time to return to `/login` and switch between workspaces.
- No username, password, `.env.local`, `SESSION_SECRET`, or setup command is needed to run the prototype.

## Interactive prototype architecture

- **One-click preview selection**: The entry page at `/login` provides direct access to both synthetic workspaces without credential prompts or authentication blockers.
- **Dedicated synthetic viewer identities**:
  - `Hospital Administrator`: Maps to `demoAdmin` (fictional administrator for *NourDoc Demo Hospital*).
  - `Doctor / Clinician`: Maps to `demoDoctor` (*Dr. Ahmed Khan*, Cardiology).
- **Smooth navigation**: Prototype navigation does not depend on secret-configured cookies or external services. Both roles can be explored interchangeably without session errors or redirect loops.
- **Production integration boundary**: Future authentication and authorization code is preserved behind a disabled-by-default boundary (`AUTHENTICATED_MODE="true"`). In prototype mode (default), the repository serves synthetic fixtures directly.

## Prototype routes

### Hospital Administrator
- `/hospital/dashboard` — supplied Today operational snapshot, minute allocation, care-setting comparison, and clinician sample.
- `/hospital/doctors` — searchable illustrative roster.
- `/hospital/doctors/[doctorId]` — aggregate-only doctor activity summary. Patient records and clinical notes are not exposed to the administrator.

### Doctor / Clinician
- `/doctor/dashboard` — personal clinician activity, minutes balance, and recent encounters.
- `/doctor/encounters` — patient encounters with search, setting/status filters, pagination, and URL-preserved list state.
- `/doctor/encounters/[encounterId]` — encounter detail with contextual actions.
- `/clinical/reports/[reportId]` — physician-led sample SOAP report review interface (available for ND-1025).

Legacy routes `/hospital`, `/doctor`, and `/reports/[id]` automatically redirect to their respective canonical destinations.

## Clinical report review workflow

The report screen (`/clinical/reports/ND-1025`) supports:
- Structured SOAP editing (Chief complaint, Subjective, Objective, Assessment, Plan, Clinical notes).
- Discarding unsaved edits or saving in-memory sample drafts.
- Submitting for demo review and requesting demo revisions.
- Confirmation dialog for demonstration approval (clearly labeled as non-binding demonstration state).
- 1–5 local usefulness rating.
- Copying synthetic notes with notification.

All report modifications live strictly in component memory and reset on page reload. No clinical text is transmitted to an external service or persisted.

## Data integrity and honesty rules

- **Arithmetic consistency**:
  - Hospital: 15,000 allocated − 2,480 consumed = 12,520 available.
  - Doctor: 2,000 allocated − 385 consumed = 1,615 available.
- **Honest timeframes**: Only the supplied "Today" snapshot is available. Selecting 7-day or 30-day filters displays an honest empty state explaining that historical fixtures were not supplied.
- **Relative comparisons**: Care setting and clinician comparison bars explicitly state that they are relative to the highest value in the displayed sample, rather than allocated capacity.
- **Sample reports**: Only encounter `ND-1025` (Patient B) contains a supplied clinical report. Encounters without reports clearly display `No sample report available`.

## Verification commands

```powershell
npm test             # Run automated journey and security tests (14 passing tests)
npm run audit:css    # Verify 100% static class matching in app/globals.css
npm run typecheck    # Validate TypeScript types without emit
npm run build        # Validate optimized production Next.js build
```

Recommended viewport verification sizes: 1440px, 1024px, 768px, 560px, 390px, and 320px.
