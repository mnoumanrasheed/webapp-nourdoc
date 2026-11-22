import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { DoctorDashboard } from "@/components/doctor-dashboard";

export default async function DoctorDashboardPage() {
  const user = await requireRole("doctor");
  return <AppShell user={user} section="doctor"><DoctorDashboard/></AppShell>;
}
