import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");

test("canonical role-aware product routes remain available", () => {
  for (const route of [
    "app/login/page.tsx",
    "app/hospital/dashboard/page.tsx",
    "app/hospital/doctors/page.tsx",
    "app/hospital/doctors/[doctorId]/page.tsx",
    "app/doctor/dashboard/page.tsx",
    "app/doctor/encounters/page.tsx",
    "app/doctor/encounters/[encounterId]/page.tsx",
    "app/clinical/reports/[reportId]/page.tsx",
  ]) {
    assert.equal(fs.existsSync(new URL(route, root)), true, route);
  }
});

test("/login is a prototype role selector without username/password or credential alerts", () => {
  const loginView = read("components/login-view.tsx");
  const loginPage = read("app/login/page.tsx");

  // Must have the two one-click experience cards
  assert.match(loginView, /href="\/hospital\/dashboard"/);
  assert.match(loginView, /href="\/doctor\/dashboard"/);
  assert.match(loginView, /Hospital Administrator/);
  assert.match(loginView, /Doctor \/ Clinician/);
  assert.match(loginView, /Explore NourDoc/);
  assert.match(loginView, /Better clarity\./);
  assert.match(loginView, /Better care\./);

  // Must NOT contain username/password fields or credential warnings
  assert.doesNotMatch(loginView, /type="password"/);
  assert.doesNotMatch(loginView, /autoComplete="current-password"/);
  assert.doesNotMatch(loginView, /setup:demo-auth/);
  assert.doesNotMatch(loginView, /Demo credentials are not configured/);
  assert.doesNotMatch(loginView, /Server-verified demo identities/);

  // Login page should not gate on demo credential setup
  assert.doesNotMatch(loginPage, /isDemoAuthConfigured/);
});

test("hospital and doctor routes work without credentials in prototype mode", () => {
  const sessionSource = read("lib/session.ts");
  assert.match(sessionSource, /role === "doctor" \? demoDoctor : demoAdmin/);
  assert.match(sessionSource, /AUTHENTICATED_MODE !== "true"/);
});

test("navigation between workspaces can be repeated via switch experience controls", () => {
  const shell = read("components/app-shell.tsx");
  assert.match(shell, /Switch experience/);
  assert.match(shell, /href="\/login"/);
  assert.match(shell, /sidebar-switch-btn/);
  assert.match(shell, /topbar-switch-btn/);
});

test("metrics and allocations are arithmetically consistent", () => {
  const fixtures = read("lib/demo-data.ts");
  // Hospital figures
  assert.match(fixtures, /patientsServed:\s*186/);
  assert.match(fixtures, /minutesConsumed:\s*2480/);
  assert.match(fixtures, /expenditurePKR:\s*48095/);
  assert.match(fixtures, /patientsWaiting:\s*24/);
  assert.match(fixtures, /minutesAllocated:\s*15000/);
  assert.match(fixtures, /minutesAvailable:\s*12520/);
  assert.equal(15000 - 2480, 12520, "15,000 allocated - 2,480 consumed = 12,520 available");

  // Doctor figures
  assert.match(fixtures, /patientsServed:\s*28/);
  assert.match(fixtures, /waiting:\s*6/);
  assert.match(fixtures, /toApprove:\s*4/);
  assert.match(fixtures, /minutesConsumed:\s*385/);
  assert.match(fixtures, /allocatedMinutes:\s*2000/);
  assert.match(fixtures, /availableMinutes:\s*1615/);
  assert.equal(2000 - 385, 1615, "2,000 allocated - 385 consumed = 1,615 available");
});

test("doctor encounters expose only supplied sample reports without fabricating missing reports", () => {
  const source = read("components/doctor-encounter-directory.tsx");
  const fixtures = read("lib/demo-data.ts");

  assert.match(source, /encounter\.reportAvailable/);
  assert.match(source, /Open sample report/);
  assert.match(source, /No sample report/);

  // In fixtures, only Patient B / ND-1025 has reportAvailable: true
  assert.match(fixtures, /id:\s*"ND-1025",\s*patientLabel:\s*"Patient B".*reportAvailable:\s*true/s);
  assert.match(fixtures, /id:\s*"ND-1024",\s*patientLabel:\s*"Patient A".*reportAvailable:\s*false/s);
  assert.match(fixtures, /id:\s*"ND-1026",\s*patientLabel:\s*"Patient C".*reportAvailable:\s*false/s);
  assert.match(fixtures, /id:\s*"ND-1027",\s*patientLabel:\s*"Patient D".*reportAvailable:\s*false/s);
});

test("unsupported periods and metrics remain honest", () => {
  const fixtures = read("lib/demo-data.ts");
  const hospital = read("components/hospital-dashboard.tsx");
  const doctor = read("components/doctor-dashboard.tsx");
  assert.match(fixtures, /period === "today"/);
  assert.doesNotMatch(hospital, /16\.5 min avg|\+8\.4%|Live queue/);
  assert.doesNotMatch(doctor, /\+9\.2%|Healthy balance|Live queue/);
});

test("clinical report review explicitly communicates demo preview state", () => {
  const reportReview = read("components/report-review.tsx");
  assert.match(reportReview, /Approved in demo/);
  assert.match(reportReview, /not medical verification/);
  assert.match(reportReview, /Approve this report in the demo\?/);
  assert.match(reportReview, /SOAP|Chief complaint|Subjective|Objective|Assessment|Plan/);
});
