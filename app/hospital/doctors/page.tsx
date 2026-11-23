import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { HospitalDoctorDirectory } from "@/components/hospital-doctor-directory";
import { getWorkspaceRepository } from "@/lib/repositories";
import { toShellIdentity } from "@/lib/presentation";

export default async function HospitalDoctorsPage() {
  const user = await requireRole("hospital_admin");
  const doctors = await getWorkspaceRepository().listHospitalDoctors(user.hospitalId);
  return <AppShell identity={toShellIdentity(user)} section="doctors"><HospitalDoctorDirectory doctors={doctors}/></AppShell>;
}
