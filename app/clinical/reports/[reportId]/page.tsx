import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ReportReview } from "@/components/report-review";
import { toShellIdentity } from "@/lib/presentation";
import { requireDoctorReport } from "@/lib/session";

export default async function ClinicalReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { reportId } = await params;
  const query = await searchParams;
  const { user, report } = await requireDoctorReport(reportId);
  if (!report) notFound();
  const fromValue = Array.isArray(query.from) ? query.from[0] : query.from;
  const backHref = fromValue?.startsWith("/doctor/encounters") ? fromValue : "/doctor/encounters";
  return <AppShell identity={toShellIdentity(user)} section="reports"><ReportReview report={report} backHref={backHref} /></AppShell>;
}
