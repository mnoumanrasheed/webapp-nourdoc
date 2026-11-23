import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { DoctorDashboard } from "@/components/doctor-dashboard";
import { getWorkspaceRepository } from "@/lib/repositories";
import { toShellIdentity } from "@/lib/presentation";

export default async function DoctorDashboardPage() {
  const user = await requireRole("doctor");
  const overview = await getWorkspaceRepository().getDoctorOverview("today", user);
  return <AppShell identity={toShellIdentity(user)} section="doctor"><DoctorDashboard overview={overview}/></AppShell>;
}
