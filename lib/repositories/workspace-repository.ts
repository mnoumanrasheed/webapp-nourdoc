import type { ClinicalReport, Clinician, DoctorOverview, Encounter, HospitalOverview, Period, SessionUser } from "@/lib/types";

export type DemoReportTransition = "save_draft" | "submit_review" | "approve" | "request_revision";
export type ReportDraftInput = Pick<ClinicalReport, "chiefComplaint" | "subjective" | "objective" | "assessment" | "plan" | "notes">;
export type DemoWriteResult = { previewOnly: true; transition: DemoReportTransition | "rate" };

/**
 * Frontend-facing repository contract. Real endpoint URLs and payloads must be
 * supplied and validated before an API-backed implementation is enabled.
 */
export interface WorkspaceRepository {
  getHospitalOverview(period: Period, hospitalId: string): Promise<HospitalOverview>;
  listHospitalDoctors(hospitalId: string): Promise<Clinician[]>;
  getHospitalDoctor(hospitalId: string, doctorId: string): Promise<Clinician | null>;
  getDoctorOverview(period: Period, user: SessionUser): Promise<DoctorOverview>;
  listDoctorEncounters(user: SessionUser): Promise<Encounter[]>;
  getDoctorEncounter(user: SessionUser, encounterId: string): Promise<Encounter | null>;
  getClinicalReport(user: SessionUser, reportId: string): Promise<ClinicalReport | null>;
  saveDraftReport(user: SessionUser, reportId: string, draft: ReportDraftInput): Promise<DemoWriteResult>;
  requestReportReview(user: SessionUser, reportId: string): Promise<DemoWriteResult>;
  approveReport(user: SessionUser, reportId: string): Promise<DemoWriteResult>;
  requestReportRevision(user: SessionUser, reportId: string): Promise<DemoWriteResult>;
  saveAiReportRating(user: SessionUser, reportId: string, rating: 1 | 2 | 3 | 4 | 5): Promise<DemoWriteResult>;
}
