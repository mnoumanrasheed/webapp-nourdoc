import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { HospitalDashboard } from "@/components/hospital-dashboard";
import { getWorkspaceRepository } from "@/lib/repositories";
import { toShellIdentity } from "@/lib/presentation";

export default async function HospitalDashboardPage() {
  const user = await requireRole("hospital_admin");
  const overview = await getWorkspaceRepository().getHospitalOverview("today", user.hospitalId);
  return <AppShell identity={toShellIdentity(user)} section="hospital"><HospitalDashboard overview={overview}/></AppShell>;
}
