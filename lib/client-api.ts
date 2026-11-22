import type { Clinician, DoctorOverview, Encounter, HospitalOverview, Period } from "./types";

/** Typed browser adapter. Replace these route calls with an authenticated API client at integration time. */
async function getJson<T>(path: string, validate: (value: unknown) => value is T, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, cache: "no-store", headers: { Accept: "application/json" } });
  let body: unknown = null;
  try { body = await response.json(); } catch { /* handled by the generic error below */ }
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
      ? body.error
      : "The workspace service returned an error.";
    throw new Error(message);
  }
  if (!validate(body)) throw new Error("The workspace service returned an invalid response.");
  return body;
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const clinician = (value: unknown): value is Clinician => object(value) && typeof value.id === "string" && typeof value.name === "string" && typeof value.department === "string" && typeof value.patients === "number" && typeof value.minutes === "number";
const encounter = (value: unknown): value is Encounter => object(value) && typeof value.id === "string" && typeof value.patientLabel === "string" && typeof value.time === "string" && typeof value.setting === "string" && typeof value.status === "string";
const hospitalOverview = (value: unknown): value is HospitalOverview => object(value) && typeof value.period === "string" && typeof value.hospital === "string" && typeof value.available === "boolean" && Array.isArray(value.clinicians) && value.clinicians.every(clinician) && Array.isArray(value.settings);
const doctorOverview = (value: unknown): value is DoctorOverview => object(value) && typeof value.period === "string" && typeof value.available === "boolean" && object(value.doctor) && Array.isArray(value.encounters) && value.encounters.every(encounter);

export const workspaceApi = {
  hospitalOverview(period: Period, signal?: AbortSignal) {
    return getJson<HospitalOverview>(`/api/hospital/overview?period=${period}`, hospitalOverview, signal);
  },
  doctorOverview(period: Period, signal?: AbortSignal) {
    return getJson<DoctorOverview>(`/api/doctor/overview?period=${period}`, doctorOverview, signal);
  },
  hospitalDoctors(signal?: AbortSignal) {
    return getJson<Clinician[]>("/api/hospital/doctors", (value): value is Clinician[] => Array.isArray(value) && value.every(clinician), signal);
  },
  hospitalDoctor(doctorId: string, signal?: AbortSignal) {
    return getJson<Clinician>(`/api/hospital/doctors/${encodeURIComponent(doctorId)}`, clinician, signal);
  },
  doctorEncounters(signal?: AbortSignal) {
    return getJson<Encounter[]>("/api/doctor/encounters", (value): value is Encounter[] => Array.isArray(value) && value.every(encounter), signal);
  },
  doctorEncounter(encounterId: string, signal?: AbortSignal) {
    return getJson<Encounter>(`/api/doctor/encounters/${encodeURIComponent(encounterId)}`, encounter, signal);
  },
};
