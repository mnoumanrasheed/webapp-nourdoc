import type { ClinicalReport, Clinician, DoctorOverview, Encounter, HospitalOverview, Period, SessionUser } from "@/lib/types";

export type DemoReportTransition = "save_draft" | "submit_review" | "approve" | "request_revision";

export interface DemoReportMutation {
  reportId: string;
  transition: DemoReportTransition;
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

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
  mutateDemoReport(user: SessionUser, input: DemoReportMutation): Promise<{ previewOnly: true; transition: DemoReportTransition }>;
}
