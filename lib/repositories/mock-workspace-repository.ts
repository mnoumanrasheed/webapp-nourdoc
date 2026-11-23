import { clinicians, doctorOverview, encounters, hospitalOverview, reports } from "@/lib/demo-data";
import { findDoctorScoped, findHospitalScoped, listDoctorScoped } from "@/lib/data/scope-fixtures.mjs";
import type { WorkspaceRepository } from "./workspace-repository";

export const mockWorkspaceRepository: WorkspaceRepository = {
  async getHospitalOverview(period, hospitalId) {
    return hospitalOverview(period, hospitalId);
  },
  async listHospitalDoctors(hospitalId) {
    return clinicians.filter(item => item.hospitalId === hospitalId);
  },
  async getAdminDoctorActivitySummary(hospitalId, doctorId) {
    const clinician = findHospitalScoped(clinicians, hospitalId, doctorId);
    if (!clinician) return null;
    const sample = clinicians.filter(item => item.hospitalId === hospitalId);
    const maxMinutes = Math.max(1, ...sample.map(item => item.minutes));
    return {
      clinician,
      snapshotLabel: "Today · sample snapshot",
      rosterLabel: "Illustrative sample roster",
      relativeMinutesPercent: Math.round((clinician.minutes / maxMinutes) * 100),
      relativeMinutesBasis: "Compared with the highest minutes in the displayed sample",
    };
  },
  async getDoctorOverview(period, user) {
    return doctorOverview(period, user);
  },
  async listDoctorEncounters(user) {
    return listDoctorScoped(encounters, user.hospitalId, user.doctorId);
  },
  async getDoctorEncounter(user, encounterId) {
    return findDoctorScoped(encounters, user.hospitalId, user.doctorId, encounterId);
  },
  async getClinicalReport(user, reportId) {
    return findDoctorScoped(reports, user.hospitalId, user.doctorId, reportId);
  },
  async saveDraftReport() { return { previewOnly: true, transition: "save_draft" }; },
  async requestReportReview() { return { previewOnly: true, transition: "submit_review" }; },
  async approveReport() { return { previewOnly: true, transition: "approve" }; },
  async requestReportRevision() { return { previewOnly: true, transition: "request_revision" }; },
  async saveAiReportRating() { return { previewOnly: true, transition: "rate" }; },
};
