type DoctorScoped = { id: string; hospitalId: string; doctorId: string };
type HospitalScoped = { id: string; hospitalId: string };
export function listDoctorScoped<T extends DoctorScoped>(items: readonly T[], hospitalId: string, doctorId?: string): T[];
export function findDoctorScoped<T extends DoctorScoped>(items: readonly T[], hospitalId: string, doctorId: string | undefined, itemId: string): T | null;
export function findHospitalScoped<T extends HospitalScoped>(items: readonly T[], hospitalId: string, itemId: string): T | null;
