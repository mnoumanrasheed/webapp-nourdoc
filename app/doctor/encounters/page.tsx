import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { DoctorEncounterDirectory } from "@/components/doctor-encounter-directory";

export default async function DoctorEncountersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireRole("doctor");
  const query = await searchParams;
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  return <AppShell user={user} section="encounters"><DoctorEncounterDirectory initialQuery={first(query.q)} initialSetting={first(query.setting)} initialStatus={first(query.status)}/></AppShell>;
}
