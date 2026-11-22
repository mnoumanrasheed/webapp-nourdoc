# NourDoc integration contracts (proposed, not existing backend specifications)

These are **proposed frontend-facing shapes** consistent with screenshots, not assertions that your backend already exposes these paths or fields. They allow frontend development without inventing real endpoint names.

## Authorization invariants

- User identity and permissions must be verified by the backend session.
- A hospital administrator's hospital scope is taken from verified identity and checked on all database queries, not `hospitalId` in a browser request.
- A clinician's doctor scope is taken from verified identity and enforced for encounters, reports, note edits and approvals.
- Report-read and report-write rights may differ. Use explicit permission checks and a full clinical audit log.
- Return 401 if not authenticated, 403 if role insufficient, 404 for inaccessible/missing encounter, and 422 for invalid payloads.
- Do not trust `role`, `doctorId`, `hospitalId`, or approval authority from client state.

## Suggested endpoints / payloads

### GET /api/hospital/overview?period=today|7d|30d

Protected: hospital_admin. Shape: `HospitalOverview` in `lib/types.ts`. Today sample includes `patientsServed`, `minutesConsumed`, `expenditurePKR`, `patientsWaiting`, `minutesAllocated`, `minutesAvailable`, clinician samples and care-setting utilization. Real backend should provide complete roster vs. partial sample distinction, reporting timezone and date range.

### GET /api/doctor/overview?period=today|7d|30d

Protected: doctor. Shape: `DoctorOverview` in `lib/types.ts`. Includes doctor profile, metrics and only authorized encounters. Real integration should paginate encounter rows and filter by date/care setting server-side as needed.

### GET /api/reports/:encounterId

Protected: doctor who owns encounter and has report-read rights. Shape: `ClinicalReport` in `lib/types.ts`. All currently shown text is sample copy transcribed from the image; real backend requires source-verified records.

### PATCH /api/reports/:encounterId

**Not implemented.** Before implementation, agree on an explicit versioned API contract with backend team including draft content, optimistic concurrency/revision ID, author identity, authorization, change audit, and validation. Approval should be a separate audited state transition with a verified clinician signature, not a boolean submitted by the browser.

## Metric definitions to agree with backend

- `patientsServed`: distinct patients vs. number of encounters (these can differ)
- `minutesConsumed`: individual consultation durations, billed minutes or rounded allocation usage
- `minutesAllocated`: per clinician, per hospital or subscription pool; period-specific balance vs. running balance
- `patientsWaiting`: waiting room count vs. clinician pending work
- `toApprove`: status/assigned reviewer definition
- `expenditurePKR`: billing source, taxes, currency, paid vs. incurred, precise date range
- `period`: timezone (hospital-local), boundaries, and historical aggregation rules

No real endpoint URL, bearer token, IDP, billing formula, database schema or clinical compliance certification has been inferred from the screenshots.
