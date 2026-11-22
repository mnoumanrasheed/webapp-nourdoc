import { notFound } from "next/navigation";
import { requireDoctorReport } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { ReportReview } from "@/components/report-review";

export default async function ClinicalReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const { user, report } = await requireDoctorReport(reportId);
  if (!report) notFound();
  return <AppShell user={user} section="reports"><ReportReview report={report}/></AppShell>;
}
