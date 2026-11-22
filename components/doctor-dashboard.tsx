"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ClipboardCheck, FileText, ShieldCheck, Stethoscope } from "lucide-react";
import type { CareSetting, DoctorOverview, EncounterStatus, Period } from "@/lib/types";
import { workspaceApi } from "@/lib/client-api";
import { BalanceCard, ErrorPanel, LoadingPanel, MetricCard, NoPeriodData, number, PeriodTabs, SampleBadge, SectionHeading } from "./ui";
import { TopIntro } from "./app-shell";

function Status({ status }: { status: EncounterStatus }) {
  return <span className={`status status-${status.toLowerCase().replace(/\s/g, "-")}`}>{status}</span>;
}
export function DoctorDashboard() {
  const [period, setPeriod] = useState<Period>("today");
  const [setting, setSetting] = useState<"all" | CareSetting>("all");
  const [data, setData] = useState<DoctorOverview | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    setError("");
    workspaceApi.doctorOverview(period, ctrl.signal)
      .then(setData).catch(e => { if (e instanceof Error && e.name !== "AbortError") setError(e.message); });
    return () => ctrl.abort();
  }, [period, reload]);
  const filtered = useMemo(() => (data?.encounters || []).filter(e => setting === "all" || e.setting === setting), [data, setting]);
  function changePeriod(p: Period) { setPeriod(p); setData(null); setError(""); }
  const s = data?.summary;
  return <>
    <TopIntro eyebrow="CLINICIAN WORKSPACE" title="My clinical workspace" description="Every consultation, report and minute — organized around your day."/>
    <div className="workspace-heading"><div><h2>My Clinical Workspace</h2><p>Individual doctor / clinician</p></div><SampleBadge/></div>
    <div className="controls-row"><PeriodTabs value={period} onChange={changePeriod}/><span className="period-label"><CalendarDays size={14}/> {period === "today" ? "Today" : period === "7d" ? "Last 7 days" : "Last 30 days"}</span></div>
    {error ? <ErrorPanel message={error} onRetry={() => { setError(""); setReload(x => x + 1); }}/>
      : !data ? <LoadingPanel/>
      : !data.available || !s ? <NoPeriodData period={period}/>
      : <>
        <div className="doctor-identity"><div className="doctor-profile-icon"><Stethoscope size={24}/></div><div><span>YOUR CLINICAL PROFILE</span><h3>{data.doctor.name}</h3><p>{data.doctor.department} · {data.doctor.hospital}</p></div><span className="doctor-verified"><ShieldCheck size={15}/> Demo identity</span></div>
        <SectionHeading title="My overview" subtitle="Your activity and outstanding work"/>
        <div className="metrics-grid"><MetricCard icon="users" value={number(s.patientsServed)} label="Patients served" sub="Completed consultations" change="+9.2%" tone="mint"/><MetricCard icon="waiting" value={String(s.waiting).padStart(2, "0")} label="Waiting / pending" sub="Current care queue" change="Live queue" tone="amber"/><MetricCard icon="report" value={String(s.toApprove).padStart(2, "0")} label="Reports to approve" sub="Awaiting your review" change="Priority"/><MetricCard icon="clock" value={number(s.minutesConsumed)} label="Minutes consumed" sub="Consultation time" change="On track"/></div>
        <section className="surface-panel doctor-balance"><SectionHeading title="My available minutes" subtitle="Your remaining consultation allocation" right={<span className="healthy-chip">Healthy balance</span>}/><BalanceCard available={s.availableMinutes} allocated={s.allocatedMinutes} consumed={s.minutesConsumed} title="Available consultation minutes"/></section>
        <section className="surface-panel encounters-panel"><SectionHeading title="My patient encounters" subtitle="Recent encounters assigned to your clinician workspace" right={<Link className="section-link" href="/doctor/encounters">View all encounters</Link>}/>
          <div className="filter-wrap"><label htmlFor="setting-select">Care setting</label><select id="setting-select" value={setting} onChange={e => setSetting(e.target.value as typeof setting)}><option value="all">All care settings</option><option value="OPD">OPD</option><option value="Emergency">Emergency</option><option value="IPD">IPD</option><option value="Telehealth">Telehealth</option></select></div>
          <div className="encounter-list">{filtered.length ? filtered.map(e => <article key={e.id} className="encounter-row"><div className="encounter-main"><span className="patient-avatar"><FileText size={18}/></span><div><h3>{e.patientLabel}</h3><span>{e.id} <b>·</b> {e.time}</span><div className="encounter-setting">{e.setting}</div></div></div><div className="encounter-actions"><Status status={e.status}/>{e.reportAvailable ? <Link href={`/clinical/reports/${encodeURIComponent(e.id)}`} className="open-report">Open report <ArrowUpRight size={14}/></Link> : <Link className="open-report muted-report-link" href={`/doctor/encounters/${encodeURIComponent(e.id)}`}>View details</Link>}</div></article>) : <p className="no-encounters">No encounters in this care setting.</p>}</div>
          <div className="encounters-footer"><ClipboardCheck size={16}/><span>Review and approval workflows require verified clinical backend endpoints.</span></div>
        </section>
      </>}
  </>;
}
