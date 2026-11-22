import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { HospitalDashboard } from "@/components/hospital-dashboard";

export default async function HospitalDashboardPage() {
  const user = await requireRole("hospital_admin");
  return <AppShell user={user} section="hospital"><HospitalDashboard/></AppShell>;
}
