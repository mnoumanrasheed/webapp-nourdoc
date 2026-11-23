import assert from "node:assert/strict";
import test from "node:test";
import { findDoctorScoped, findHospitalScoped, listDoctorScoped } from "../lib/data/scope-fixtures.mjs";
import { canTransitionReport, transitionReport } from "../lib/report-workflow.mjs";

const records = [
  { id: "A-1", hospitalId: "hospital-a", doctorId: "doctor-a" },
  { id: "A-2", hospitalId: "hospital-a", doctorId: "doctor-b" },
  { id: "B-1", hospitalId: "hospital-b", doctorId: "doctor-a" },
];

test("doctor scope requires both hospital and doctor identity", () => {
  assert.deepEqual(listDoctorScoped(records, "hospital-a", "doctor-a").map((item) => item.id), ["A-1"]);
  assert.equal(findDoctorScoped(records, "hospital-a", "doctor-a", "A-2"), null);
  assert.equal(findDoctorScoped(records, "hospital-a", "doctor-a", "B-1"), null);
  assert.equal(findDoctorScoped(records, "hospital-a", "doctor-b", "A-2")?.id, "A-2");
});

test("hospital aggregate scope cannot cross tenant boundaries", () => {
  assert.equal(findHospitalScoped(records, "hospital-a", "A-1")?.id, "A-1");
  assert.equal(findHospitalScoped(records, "hospital-a", "B-1"), null);
  assert.equal(findHospitalScoped(records, "hospital-b", "A-1"), null);
});

test("report workflow prevents impossible transitions", () => {
  assert.equal(transitionReport("awaiting_review", "approve"), "approved");
  assert.equal(transitionReport("approved", "request_revision"), null);
  assert.equal(transitionReport("draft", "approve"), null);
  assert.equal(transitionReport("draft", "submit_review"), "awaiting_review");
  assert.equal(transitionReport("awaiting_review", "request_revision"), "needs_revision");
  assert.equal(canTransitionReport("needs_revision", "save_draft"), true);
});
