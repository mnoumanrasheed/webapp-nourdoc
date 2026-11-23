import { requireRole } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { DoctorEncounterDirectory } from "@/components/doctor-encounter-directory";
import { getWorkspaceRepository } from "@/lib/repositories";
import { toShellIdentity } from "@/lib/presentation";

export default async function DoctorEncountersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireRole("doctor");
  const encounters = await getWorkspaceRepository().listDoctorEncounters(user);
  const query = await searchParams;
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const parsedPage = Number(first(query.page) ?? "1");
  return <AppShell identity={toShellIdentity(user)} section="encounters"><DoctorEncounterDirectory encounters={encounters} doctorName={user.name} department={user.department ?? "Clinical department"} initialQuery={first(query.q)} initialSetting={first(query.setting)} initialStatus={first(query.status)} initialPage={Number.isSafeInteger(parsedPage) ? parsedPage : 1}/></AppShell>;
}
