export type Role = "hospital_admin" | "doctor";
export type Period = "today" | "7d" | "30d";
export type EncounterStatus = "Approved" | "Review pending" | "Processing";
export type CareSetting = "OPD" | "Emergency" | "IPD" | "Telehealth";

export interface SessionUser {
  userId: string;
  name: string;
  role: Role;
  hospitalId: string;
  doctorId?: string;
  department?: string;
}
export interface Clinician {
  id: string;
  name: string;
  department: string;
  patients: number;
  minutes: number;
  hospitalId: string;
}
export interface CareUtilization {
  label: CareSetting;
  patients: number;
  minutes: number;
}
export interface Encounter {
  id: string;
  patientLabel: string;
  time: string;
  setting: CareSetting;
  status: EncounterStatus;
  doctorId: string;
  hospitalId: string;
  reportAvailable: boolean;
}
export interface HospitalOverview {
  period: Period;
  hospital: string;
  available: boolean;
  summary?: {
    patientsServed: number;
    minutesConsumed: number;
    expenditurePKR: number;
    patientsWaiting: number;
    minutesAllocated: number;
    minutesAvailable: number;
  };
  clinicians: Clinician[];
  settings: CareUtilization[];
  sampleOnly: boolean;
}
export interface DoctorOverview {
  period: Period;
  available: boolean;
  doctor: { id: string; name: string; department: string; hospital: string };
  summary?: { patientsServed: number; waiting: number; toApprove: number; minutesConsumed: number; allocatedMinutes: number; availableMinutes: number };
  encounters: Encounter[];
}
export interface AdminDoctorActivitySummary {
  clinician: Clinician;
  snapshotLabel: "Today · sample snapshot";
  rosterLabel: "Illustrative sample roster";
  relativeMinutesPercent: number;
  relativeMinutesBasis: "Compared with the highest minutes in the displayed sample";
}
export interface ClinicalReport {
  id: string;
  patientLabel: string;
  encounterId: string;
  department: string;
  setting: CareSetting;
  doctorId: string;
  hospitalId: string;
  doctorName: string;
  consultationTime: string;
  status: "Awaiting review";
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  notes: string;
  coding: { type: string; status: string }[];
}
