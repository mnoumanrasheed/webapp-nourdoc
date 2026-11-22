import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");

test("canonical role-aware product routes exist", () => {
  for (const route of [
    "app/hospital/dashboard/page.tsx",
    "app/hospital/doctors/page.tsx",
    "app/hospital/doctors/[doctorId]/page.tsx",
    "app/doctor/dashboard/page.tsx",
    "app/doctor/encounters/page.tsx",
    "app/doctor/encounters/[encounterId]/page.tsx",
    "app/clinical/reports/[reportId]/page.tsx",
  ]) assert.equal(fs.existsSync(new URL(route, root)), true, route);
});

test("encounter directory supports search, filters, and preserved return state", () => {
  const source = read("components/doctor-encounter-directory.tsx");
  assert.match(source, /Search patient label or encounter ID/);
  assert.match(source, /All settings/);
  assert.match(source, /All statuses/);
  assert.match(source, /currentListUrl/);
  assert.match(source, /from=/);
});

test("clinical report exposes complete local review transitions", () => {
  const source = read("components/report-review.tsx");
  assert.match(source, /Save draft/);
  assert.match(source, /Submit for review/);
  assert.match(source, /Request revision/);
  assert.match(source, /Confirm demo approval/);
  assert.match(source, /Rate AI report quality/);
});

test("mock repository boundary is explicit and does not invent API mode", () => {
  const source = read("lib/repositories/index.ts");
  assert.match(source, /NEXT_PUBLIC_DATA_MODE/);
  assert.match(source, /mode === "mock"/);
  assert.match(source, /Supply verified API contracts/);
});

test("historical periods remain unavailable without supplied fixtures", () => {
  const source = read("lib/demo-data.ts");
  assert.match(source, /period === "today"/);
  assert.doesNotMatch(source, /patientsServed: 1248|patientsServed: 5420/);
});
