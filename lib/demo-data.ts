import type { ClinicalReport, Clinician, DoctorOverview, Encounter, HospitalOverview, Period, SessionUser } from "./types";

/** Curated fictional fixtures for product preview only; no records come from a medical system. */
export const DEMO_HOSPITAL_ID = "hospital-demo-001";
export const DEMO_DOCTOR_ID = "doctor-ahmed-demo";
export const demoAdmin: SessionUser = {
  userId: "admin-demo-001", name: "Hospital Administrator", role: "hospital_admin", hospitalId: DEMO_HOSPITAL_ID,
};
export const demoDoctor: SessionUser = {
  userId: "doctor-user-demo-001", name: "Dr. Ahmed Khan", role: "doctor", hospitalId: DEMO_HOSPITAL_ID, doctorId: DEMO_DOCTOR_ID,
};
export const clinicians: Clinician[] = [
  { id: DEMO_DOCTOR_ID, name: "Dr. Ahmed Khan", department: "Cardiology", patients: 28, minutes: 385, hospitalId: DEMO_HOSPITAL_ID },
  { id: "doctor-sara-demo", name: "Dr. Sara Malik", department: "Pediatrics", patients: 26, minutes: 360, hospitalId: DEMO_HOSPITAL_ID },
  { id: "doctor-usman-demo", name: "Dr. Usman Ali", department: "General Medicine", patients: 21, minutes: 285, hospitalId: DEMO_HOSPITAL_ID },
  { id: "doctor-fatima-demo", name: "Dr. Fatima Noor", department: "Gynecology", patients: 18, minutes: 240, hospitalId: DEMO_HOSPITAL_ID },
];
export const encounters: Encounter[] = [
  { id: "ND-1024", patientLabel: "Patient A", time: "10:30 AM", setting: "OPD", status: "Approved", doctorId: DEMO_DOCTOR_ID, hospitalId: DEMO_HOSPITAL_ID, reportAvailable: false },
  { id: "ND-1025", patientLabel: "Patient B", time: "11:15 AM", setting: "Emergency", status: "Review pending", doctorId: DEMO_DOCTOR_ID, hospitalId: DEMO_HOSPITAL_ID, reportAvailable: true },
  { id: "ND-1026", patientLabel: "Patient C", time: "12:00 PM", setting: "Telehealth", status: "Processing", doctorId: DEMO_DOCTOR_ID, hospitalId: DEMO_HOSPITAL_ID, reportAvailable: false },
  { id: "ND-1027", patientLabel: "Patient D", time: "01:30 PM", setting: "IPD", status: "Approved", doctorId: DEMO_DOCTOR_ID, hospitalId: DEMO_HOSPITAL_ID, reportAvailable: false },
];
export const reports: ClinicalReport[] = [{
  id: "ND-1025", patientLabel: "Patient B", encounterId: "ND-1025", department: "Cardiology", setting: "Emergency",
  doctorId: DEMO_DOCTOR_ID, hospitalId: DEMO_HOSPITAL_ID, doctorName: "Dr. Ahmed Khan", consultationTime: "11:15 AM",
  status: "Awaiting review", chiefComplaint: "Intermittent chest discomfort, reported over the last two days.",
  subjective: "Patient describes intermittent chest discomfort. Further history and associated symptoms should be verified by the clinician.",
  objective: "ECG findings and clinical observations to be reviewed and confirmed against source records.",
  assessment: "Clinical assessment requires physician confirmation. No definitive diagnosis inferred from this illustrative report.",
  plan: "Consider further cardiac evaluation and appropriate follow-up as clinically indicated.",
  notes: "Patient presents with intermittent chest discomfort. ECG findings reviewed. Recommend further cardiac evaluation and follow-up.",
  coding: [{ type: "ICD-10", status: "Physician verification" }, { type: "CPT", status: "Physician verification" }],
}];

export function hospitalOverview(period: Period, hospitalId: string): HospitalOverview {
  const available = period === "today" && hospitalId === DEMO_HOSPITAL_ID;
  return {
    period, hospital: "NourDoc Demo Hospital", available,
    summary: available ? { patientsServed: 186, minutesConsumed: 2480, expenditurePKR: 48095, patientsWaiting: 24, minutesAllocated: 15000, minutesAvailable: 12520 } : undefined,
    clinicians: available ? clinicians.filter(item => item.hospitalId === hospitalId) : [],
    settings: available ? [
      { label: "Emergency", patients: 35, minutes: 420 },
      { label: "OPD", patients: 95, minutes: 1140 },
      { label: "IPD", patients: 28, minutes: 560 },
      { label: "Telehealth", patients: 28, minutes: 360 },
    ] : [],
    sampleOnly: true,
  };
}
export function doctorOverview(period: Period, user: SessionUser): DoctorOverview {
  const available = period === "today" && user.hospitalId === DEMO_HOSPITAL_ID && user.doctorId === DEMO_DOCTOR_ID;
  return {
    period, available, doctor: { id: user.doctorId ?? "", name: user.name, department: "Cardiology Department", hospital: "NourDoc Demo Hospital" },
    summary: available ? { patientsServed: 28, waiting: 6, toApprove: 4, minutesConsumed: 385, allocatedMinutes: 2000, availableMinutes: 1615 } : undefined,
    encounters: available ? encounters.filter(e => e.hospitalId === user.hospitalId && e.doctorId === user.doctorId) : [],
  };
}
export function validPeriod(value: string | null): Period | null {
  return value === "today" || value === "7d" || value === "30d" ? value : null;
}
