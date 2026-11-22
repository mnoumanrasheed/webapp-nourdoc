"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, BarChart3, CalendarDays, Clock3, HeartPulse, ShieldCheck, Stethoscope, X } from "lucide-react";
import type { Clinician, HospitalOverview, Period } from "@/lib/types";
import { workspaceApi } from "@/lib/client-api";
import { BalanceCard, ErrorPanel, LoadingPanel, MetricCard, NoPeriodData, number, PeriodTabs, SampleBadge, SectionHeading } from "./ui";
import { TopIntro } from "./app-shell";

export function HospitalDashboard() {
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData] = useState<HospitalOverview | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setError("");
    workspaceApi.hospitalOverview(period, ctrl.signal)
      .then(setData).catch(e => { if (e instanceof Error && e.name !== "AbortError") setError(e.message); });
    return () => ctrl.abort();
  }, [period, reload]);
  function changePeriod(value: Period) { setData(null); setError(""); setPeriod(value); }
  const s = data?.summary;
  return <>
    <TopIntro eyebrow="HOSPITAL COMMAND CENTRE" title="Hospital overview" description="A clearer view of care delivery, clinician activity and minute utilization."/>
    <div className="workspace-heading"><div><h2>Hospital Command Centre</h2><p>Hospital owner / administrator · {data?.hospital || "NourDoc Demo Hospital"}</p></div><SampleBadge/></div>
    <div className="controls-row"><PeriodTabs value={period} onChange={changePeriod}/><span className="period-label"><CalendarDays size={14}/> {period === "today" ? "Today" : period === "7d" ? "Last 7 days" : "Last 30 days"}</span></div>
    {error ? <ErrorPanel message={error} onRetry={() => { setError(""); setReload(v => v + 1); }}/>
      : !data ? <LoadingPanel/>
      : !data.available || !s ? <NoPeriodData period={period}/>
      : <>
      <SectionHeading title="At a glance" subtitle="Essential metrics across the hospital" right={<span className="live-tag"><span/> SAMPLE METRICS</span>}/>
      <div className="metrics-grid">
        <MetricCard icon="users" label="Patients served" value={number(s.patientsServed)} sub="Completed patient encounters" change={period === "today" ? "+8.4%" : period === "7d" ? "+11.2%" : "+14.6%"} tone="mint"/>
        <MetricCard icon="clock" label="Minutes consumed" value={number(s.minutesConsumed)} sub="Across all care settings" change="16.5 min avg"/>
        <MetricCard icon="report" label="Estimated expenditure" value={`PKR ${number(s.expenditurePKR)}`} sub="Illustrative operational spend" change="Within plan"/>
        <MetricCard icon="waiting" label="Patients waiting" value={number(s.patientsWaiting)} sub="Current active queue" change="Live queue" tone="amber"/>
      </div>
      <div className="data-row main-data-row"><section className="surface-panel balance-panel"><SectionHeading title="Minutes allocation" subtitle="Track the hospital's available capacity" right={<Clock3 size={17} className="section-icon"/>}/><BalanceCard available={s.minutesAvailable} allocated={s.minutesAllocated} consumed={s.minutesConsumed}/><p className="panel-footnote"><ShieldCheck size={14}/> Curated preview figures for interface review; billing logic is not connected.</p></section>
        <section className="surface-panel care-panel"><SectionHeading title="Care setting utilization" subtitle="Minutes and patient activity by setting" right={<Activity size={17} className="section-icon"/>}/><div className="care-list">{data.settings.map(c => <div key={c.label} className="care-row"><div className="care-symbol">{c.label === "OPD" ? <Stethoscope size={17}/> : c.label === "Emergency" ? <HeartPulse size={17}/> : c.label === "IPD" ? <BarChart3 size={17}/> : <Activity size={17}/>}</div><div className="care-description"><strong>{c.label}</strong><span>{number(c.patients)} patients</span></div><strong className="care-minutes">{number(c.minutes)} <small>min</small></strong></div>)}</div></section>
      </div>
      <section className="surface-panel clinician-panel"><SectionHeading title="Clinician utilization" subtitle="A focused view of activity across the active clinical team" right={<span className="soft-chip">{data.clinicians.length} active clinicians</span>}/>
        <div className="doctor-list">{data.clinicians.map(doc => <Link className="doctor-row doctor-row-button" key={doc.id} href={`/hospital/doctors/${encodeURIComponent(doc.id)}`} title={`View ${doc.name} sample utilization`}><div className="doctor-avatar">{doc.name.split(" ").slice(1).map(a => a[0]).join("").slice(0, 2)}</div><div className="doctor-stat"><div className="doctor-head"><div><strong>{doc.name}</strong><small>{doc.department}</small></div><div className="right-stat"><strong>{number(doc.patients)} patients</strong><small>{number(doc.minutes)} minutes</small></div></div><div className="util-track" title="Relative to highest minute count among the displayed example doctors"><span style={{ width: `${Math.min(100, doc.minutes / Math.max(...data.clinicians.map(d => d.minutes)) * 100)}%` }}/></div></div></Link>)}</div>
        <p className="panel-footnote"><ArrowUpRight size={14}/> Clinician metrics are fictional preview data designed to demonstrate utilization patterns.</p>
      </section>
      </>}
  </>;
}

function ClinicianModal({ clinician, onClose }: { clinician: Clinician; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><section className="clinician-modal" role="dialog" aria-modal="true" aria-labelledby="clinician-title" onClick={e => e.stopPropagation()}><div className="modal-heading"><span>CLINICIAN UTILIZATION · DEMO</span><button type="button" aria-label="Close clinician details" onClick={onClose}><X size={18}/></button></div><h2 id="clinician-title">{clinician.name}</h2><p>{clinician.department}</p><div className="modal-stats"><div><strong>{number(clinician.patients)}</strong><span>Patients served</span></div><div><strong>{number(clinician.minutes)}</strong><span>Minutes consumed</span></div></div><p className="modal-disclaimer">This displays only the utilization values provided in your screenshots. Detailed encounters require a verified hospital-authorized backend API.</p></section></div>;
}
