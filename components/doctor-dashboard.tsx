"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ClipboardCheck, FileText, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import type { CareSetting, DoctorOverview, EncounterStatus, Period } from "@/lib/types";
import { BalanceCard, MetricCard, NoPeriodData, number, PeriodTabs, SampleBadge, SectionHeading } from "./ui";
import { TopIntro } from "./app-shell";

function Status({ status }: { status: EncounterStatus }) {
  return <span className={`status status-${status.toLowerCase().replace(/\s/g, "-")}`}>{status}</span>;
}

export function DoctorDashboard({ overview }: { overview: DoctorOverview }) {
  const [period, setPeriod] = useState<Period>("today");
  const [setting, setSetting] = useState<"all" | CareSetting>("all");
  const data = period === "today" ? overview : null;
  const summary = data?.summary;
  const encounters = data?.encounters ?? [];
  const filtered = useMemo(
    () => encounters.filter((encounter) => setting === "all" || encounter.setting === setting),
    [encounters, setting],
  );

  return (
    <>
      <TopIntro
        eyebrow="CLINICIAN WORKSPACE"
        title="My clinical workspace"
        description="Your synthetic activity snapshot, assigned encounters, and physician-led report review."
      />
      <div className="workspace-heading">
        <div><h2>{overview.doctor.name}</h2><p>{overview.doctor.department} · {overview.doctor.hospital}</p></div>
        <SampleBadge />
      </div>
      <div className="controls-row">
        <PeriodTabs value={period} onChange={setPeriod} />
        <span className="period-label"><CalendarDays size={15} /> {period === "today" ? "Today · sample snapshot" : period === "7d" ? "Last 7 days" : "Last 30 days"}</span>
      </div>

      <section className="doctor-identity">
        <div className="doctor-profile-icon"><Stethoscope size={24} /></div>
        <div><span>CLINICIAN PROFILE</span><h3>{overview.doctor.name}</h3><p>{overview.doctor.department} · {overview.doctor.hospital}</p></div>
        <span className="doctor-verified"><Sparkles size={15} /> Sample snapshot</span>
      </section>

      {period !== "today" ? (
        <NoPeriodData period={period} />
      ) : !data?.available || !summary ? (
        <div className="empty-panel identity-empty">
          <Stethoscope size={30} />
          <h3>No activity fixture for this demo clinician</h3>
          <p>{overview.doctor.name} can sign in to verify identity isolation, but no encounter history or minute allocation was supplied for this account.</p>
        </div>
      ) : (
        <>
          <SectionHeading title="My activity" subtitle="Illustrative values from the supplied Today fixture" right={<span className="neutral-chip">Sample snapshot</span>} />
          <div className="metrics-grid">
            <MetricCard icon="users" value={number(summary.patientsServed)} label="Patients served" sub="Fixture-defined patient count" meta="Today sample" tone="mint" />
            <MetricCard icon="waiting" value={number(summary.waiting)} label="Waiting / pending" sub="Static sample queue count" meta="Sample snapshot" tone="amber" />
            <MetricCard icon="report" value={number(summary.toApprove)} label="Reports to approve" sub="Awaiting sample review" meta="Preview workflow" />
            <MetricCard icon="clock" value={`${number(summary.minutesConsumed)} min`} label="Minutes consumed" sub="From 2,000 allocated minutes" meta="Today sample" />
          </div>

          <section className="surface-panel doctor-balance">
            <SectionHeading title="My minute allocation" subtitle="Consumed and available minutes from the supplied fixture" right={<span className="neutral-chip">Minutes available</span>} />
            <BalanceCard available={summary.availableMinutes} allocated={summary.allocatedMinutes} consumed={summary.minutesConsumed} title="Available consultation minutes" />
          </section>

          <section className="surface-panel encounters-panel">
            <SectionHeading title="My patient encounters" subtitle="Synthetic encounters assigned to this clinician identity" right={<Link className="section-link" href="/doctor/encounters">View all encounters</Link>} />
            <div className="filter-wrap">
              <label htmlFor="setting-select">Care setting</label>
              <select id="setting-select" value={setting} onChange={(event) => setSetting(event.target.value as typeof setting)}>
                <option value="all">All care settings</option><option value="OPD">OPD</option><option value="Emergency">Emergency</option><option value="IPD">IPD</option><option value="Telehealth">Telehealth</option>
              </select>
            </div>
            <div className="encounter-list">
              {filtered.length ? filtered.map((encounter) => (
                <article key={encounter.id} className="encounter-row">
                  <div className="encounter-main">
                    <span className="patient-avatar"><FileText size={18} /></span>
                    <div><h3>{encounter.patientLabel}</h3><span>{encounter.id} · {encounter.time}</span><div className="encounter-setting">{encounter.setting}</div></div>
                  </div>
                  <div className="encounter-actions">
                    <Status status={encounter.status} />
                    {encounter.reportAvailable ? (
                      <Link href={`/clinical/reports/${encodeURIComponent(encounter.id)}?from=${encodeURIComponent("/doctor/encounters")}`} className="open-report">Open sample report</Link>
                    ) : (
                      <><Link className="open-report muted-report-link" href={`/doctor/encounters/${encodeURIComponent(encounter.id)}`}>View encounter</Link><small>No sample report available</small></>
                    )}
                  </div>
                </article>
              )) : <p className="no-encounters">No encounters match this care setting.</p>}
            </div>
            <div className="encounters-footer"><ClipboardCheck size={16} /><span>Review actions are local preview state and do not update a clinical system.</span></div>
          </section>
        </>
      )}
    </>
  );
}
