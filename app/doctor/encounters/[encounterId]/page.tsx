import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, FileText, Hospital, Stethoscope } from "lucide-react";
import { AppShell, TopIntro } from "@/components/app-shell";
import { SampleBadge, SectionHeading } from "@/components/ui";
import { getWorkspaceRepository } from "@/lib/repositories";
import { toShellIdentity } from "@/lib/presentation";
import { requireRole } from "@/lib/session";

export default async function DoctorEncounterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ encounterId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRole("doctor");
  const { encounterId } = await params;
  const query = await searchParams;
  const encounter = await getWorkspaceRepository().getDoctorEncounter(user, encounterId);
  if (!encounter) notFound();
  const fromValue = Array.isArray(query.from) ? query.from[0] : query.from;
  const backHref = fromValue?.startsWith("/doctor/encounters") ? fromValue : "/doctor/encounters";

  return (
    <AppShell identity={toShellIdentity(user)} section="encounters">
      <TopIntro
        eyebrow="PATIENT ENCOUNTER"
        title={encounter.patientLabel}
        description="Synthetic encounter context scoped to the signed-in clinician."
      />
      <div className="workspace-heading">
        <div><h2>{encounter.id}</h2><p>Encounter detail · Sample snapshot</p></div>
        <SampleBadge />
      </div>

      <section className="encounter-detail-card">
        <div className="encounter-detail-icon"><FileText size={24} /></div>
        <div className="encounter-detail-main">
          <span>ENCOUNTER REFERENCE</span><h2>{encounter.id}</h2><p>{encounter.patientLabel}</p>
        </div>
        <span className={`status status-${encounter.status.toLowerCase().replace(/\s/g, "-")}`}>{encounter.status}</span>
      </section>

      <div className="detail-stat-grid encounter-detail-grid">
        <div><Clock3 size={20} /><span><strong>{encounter.time}</strong>Encounter time</span></div>
        <div><Hospital size={20} /><span><strong>{encounter.setting}</strong>Care setting</span></div>
        <div><Stethoscope size={20} /><span><strong>{user.name}</strong>Assigned clinician</span></div>
        <div><CalendarDays size={20} /><span><strong>Sample snapshot</strong>Illustrative date context</span></div>
      </div>

      <section className="surface-panel">
        <SectionHeading title="Available actions" subtitle="No unsupported clinical details are fabricated" />
        <div className="detail-actions">
          {encounter.reportAvailable ? (
            <Link className="btn-primary" href={`/clinical/reports/${encodeURIComponent(encounter.id)}?from=${encodeURIComponent(backHref)}`}>
              Open clinical report
            </Link>
          ) : (
            <span className="unavailable-callout">No sample report is available for this encounter.</span>
          )}
        </div>
      </section>

      <Link className="back-link" href={backHref}>Back to encounters</Link>
    </AppShell>
  );
}
