import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, Clock3, Stethoscope, Users } from "lucide-react";
import { AppShell, TopIntro } from "@/components/app-shell";
import { number, SampleBadge, SectionHeading } from "@/components/ui";
import { getWorkspaceRepository } from "@/lib/repositories";
import { toShellIdentity } from "@/lib/presentation";
import { requireRole } from "@/lib/session";

export default async function HospitalDoctorDetailPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const user = await requireRole("hospital_admin");
  const { doctorId } = await params;
  const activity = await getWorkspaceRepository().getAdminDoctorActivitySummary(user.hospitalId, doctorId);
  if (!activity) notFound();
  const doctor = activity.clinician;

  return (
    <AppShell identity={toShellIdentity(user)} section="doctors">
      <TopIntro
        eyebrow="CLINICIAN UTILIZATION"
        title={doctor.name}
        description="Aggregate operational activity for this clinician in the displayed sample roster."
      />
      <div className="workspace-heading">
        <div>
          <h2>{doctor.department}</h2>
          <p>NourDoc Demo Hospital · {activity.snapshotLabel}</p>
        </div>
        <SampleBadge />
      </div>

      <section className="doctor-detail-hero">
        <div className="doctor-detail-avatar"><Stethoscope size={27} /></div>
        <div>
          <span>CLINICIAN PROFILE</span>
          <h2>{doctor.name}</h2>
          <p>{doctor.department}</p>
        </div>
        <span className="activity-chip"><Activity size={15} /> Sample activity</span>
      </section>

      <div className="detail-stat-grid">
        <div><Users size={20} /><span><strong>{number(doctor.patients)}</strong>Patients in sample snapshot</span></div>
        <div><Clock3 size={20} /><span><strong>{number(doctor.minutes)} min</strong>Minutes in sample snapshot</span></div>
        <div><Activity size={20} /><span><strong>{activity.relativeMinutesPercent}%</strong>Relative minutes comparison</span></div>
      </div>

      <section className="surface-panel detail-activity">
        <SectionHeading
          title="Operational activity summary"
          subtitle="Aggregate-only administrator view; patient records and clinical notes are not exposed"
        />
        <div className="comparison-summary">
          <div><span>Displayed sample comparison</span><strong>{doctor.name}</strong></div>
          <div
            className="comparison-meter"
            role="meter"
            aria-label={`${doctor.name} minutes compared with the highest minutes in the displayed sample`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={activity.relativeMinutesPercent}
          >
            <span style={{ width: `${activity.relativeMinutesPercent}%` }} />
          </div>
          <p>{activity.relativeMinutesBasis}. This is not an allocation or capacity percentage.</p>
        </div>
      </section>

      <Link className="back-link" href="/hospital/doctors">Back to doctor directory</Link>
    </AppShell>
  );
}
