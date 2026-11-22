import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, Clock3, Stethoscope, Users } from "lucide-react";
import { AppShell, TopIntro } from "@/components/app-shell";
import { requireRole } from "@/lib/session";
import { getWorkspaceRepository } from "@/lib/repositories";
import { number, SampleBadge, SectionHeading } from "@/components/ui";

export default async function HospitalDoctorDetailPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const user = await requireRole("hospital_admin");
  const { doctorId } = await params;
  const repository = getWorkspaceRepository();
  const doctor = await repository.getHospitalDoctor(user.hospitalId, doctorId);
  if (!doctor) notFound();
  const averageMinutes = doctor.patients ? Math.round(doctor.minutes / doctor.patients) : 0;
  return <AppShell user={user} section="doctors">
    <TopIntro eyebrow="CLINICIAN UTILIZATION" title={doctor.name} description="Scoped demonstration activity for the selected clinician."/>
    <div className="workspace-heading"><div><h2>{doctor.department}</h2><p>NourDoc Demo Hospital · Today</p></div><SampleBadge/></div>
    <section className="doctor-detail-hero"><div className="doctor-detail-avatar"><Stethoscope size={28}/></div><div><span>CLINICIAN PROFILE</span><h2>{doctor.name}</h2><p>{doctor.department}</p></div><span className="activity-chip"><Activity size={15}/> Demo activity</span></section>
    <div className="detail-stat-grid"><div><Users size={20}/><span><strong>{number(doctor.patients)}</strong>Patients served</span></div><div><Clock3 size={20}/><span><strong>{number(doctor.minutes)}</strong>Minutes consumed</span></div><div><Activity size={20}/><span><strong>{averageMinutes} min</strong>Average per encounter</span></div></div>
    <section className="surface-panel"><SectionHeading title="Activity context" subtitle="Available demonstration metrics for this clinician"/><p className="detail-copy">These values are fictional preview data scoped to this demo hospital. Encounter-level records and allocation totals are not available for this roster entry, so no unsupported utilization percentage is shown.</p></section>
    <Link className="back-link" href="/hospital/doctors">Back to doctor directory</Link>
  </AppShell>;
}
