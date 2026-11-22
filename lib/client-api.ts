import type { Clinician, DoctorOverview, Encounter, HospitalOverview, Period } from "./types";

/** Typed browser adapter. Replace these route calls with an authenticated API client at integration time. */
async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, cache: "no-store", headers: { Accept: "application/json" } });
  let body: unknown = null;
  try { body = await response.json(); } catch { /* handled by the generic error below */ }
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
      ? body.error
      : "The workspace service returned an error.";
    throw new Error(message);
  }
  return body as T;
}

export const workspaceApi = {
  hospitalOverview(period: Period, signal?: AbortSignal) {
    return getJson<HospitalOverview>(`/api/hospital/overview?period=${period}`, signal);
  },
  doctorOverview(period: Period, signal?: AbortSignal) {
    return getJson<DoctorOverview>(`/api/doctor/overview?period=${period}`, signal);
  },
  hospitalDoctors(signal?: AbortSignal) {
    return getJson<Clinician[]>("/api/hospital/doctors", signal);
  },
  hospitalDoctor(doctorId: string, signal?: AbortSignal) {
    return getJson<Clinician>(`/api/hospital/doctors/${encodeURIComponent(doctorId)}`, signal);
  },
  doctorEncounters(signal?: AbortSignal) {
    return getJson<Encounter[]>("/api/doctor/encounters", signal);
  },
  doctorEncounter(encounterId: string, signal?: AbortSignal) {
    return getJson<Encounter>(`/api/doctor/encounters/${encodeURIComponent(encounterId)}`, signal);
  },
};
