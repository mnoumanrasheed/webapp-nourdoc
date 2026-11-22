import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { HospitalDoctorDirectory } from "@/components/hospital-doctor-directory";

export default async function HospitalDoctorsPage() {
  const user = await requireRole("hospital_admin");
  return <AppShell user={user} section="doctors"><HospitalDoctorDirectory/></AppShell>;
}
