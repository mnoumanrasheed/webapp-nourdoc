export function listDoctorScoped(items, hospitalId, doctorId) {
  if (!hospitalId || !doctorId) return [];
  return items.filter((item) => item.hospitalId === hospitalId && item.doctorId === doctorId);
}

export function findDoctorScoped(items, hospitalId, doctorId, itemId) {
  if (!hospitalId || !doctorId || !itemId) return null;
  return items.find((item) => item.id === itemId && item.hospitalId === hospitalId && item.doctorId === doctorId) ?? null;
}

export function findHospitalScoped(items, hospitalId, itemId) {
  if (!hospitalId || !itemId) return null;
  return items.find((item) => item.id === itemId && item.hospitalId === hospitalId) ?? null;
}
