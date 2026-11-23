"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, BarChart3, CalendarDays, Clock3, HeartPulse, Info, ShieldCheck, Stethoscope } from "lucide-react";
import type { HospitalOverview, Period } from "@/lib/types";
import { BalanceCard, MetricCard, NoPeriodData, number, PeriodTabs, SampleBadge, SectionHeading } from "./ui";
import { TopIntro } from "./app-shell";

export function HospitalDashboard({ overview }: { overview: HospitalOverview }) {
  const [period, setPeriod] = useState<Period>("today");
  const data = period === "today" ? overview : null;
  const summary = data?.summary;
  const maxSettingMinutes = Math.max(1, ...(data?.settings.map((setting) => setting.minutes) ?? []));
  const maxClinicianMinutes = Math.max(1, ...(data?.clinicians.map((clinician) => clinician.minutes) ?? []));
  const periodLabel = period === "today" ? "Today · sample snapshot" : period === "7d" ? "Last 7 days" : "Last 30 days";
  const consumedPercent = useMemo(
    () => summary?.minutesAllocated ? Math.round((summary.minutesConsumed / summary.minutesAllocated) * 100) : 0,
    [summary],
  );

  return (
    <>
      <TopIntro
        eyebrow="HOSPITAL COMMAND CENTRE"
        title="Hospital overview"
        description="Operational minutes, care settings, and clinician activity in one calm sample workspace."
      />
      <div className="workspace-heading">
        <div><h2>Hospital Command Centre</h2><p>Hospital administrator · NourDoc Demo Hospital</p></div>
        <SampleBadge />
      </div>
      <div className="controls-row">
        <PeriodTabs value={period} onChange={setPeriod} />
        <span className="period-label"><CalendarDays size={15} /> {periodLabel}</span>
      </div>

      {!data || !data.available || !summary ? (
        <NoPeriodData period={period} />
      ) : (
        <>
          <SectionHeading
            title="At a glance"
            subtitle="Illustrative operational values from the supplied Today fixture"
            right={<span className="neutral-chip">Sample snapshot</span>}
          />
          <div className="metrics-grid">
            <MetricCard icon="users" label="Patients served" value={number(summary.patientsServed)} sub="Fixture-defined patient count" meta="Today sample" tone="mint" />
            <MetricCard icon="clock" label="Minutes consumed" value={`${number(summary.minutesConsumed)} min`} sub={`${consumedPercent}% of allocated minutes`} meta="Today sample" />
            <MetricCard icon="report" label="Illustrative expenditure" value={`PKR ${number(summary.expenditurePKR)}`} sub="No billing system connected" meta="Preview only" />
            <MetricCard icon="waiting" label="Patients waiting" value={number(summary.patientsWaiting)} sub="Static sample queue count" meta="Sample snapshot" tone="amber" />
          </div>

          <div className="data-row">
            <section className="surface-panel">
              <SectionHeading title="Hospital minute allocation" subtitle="Consumed and remaining minutes from the supplied allocation" right={<Clock3 size={18} className="section-icon" />} />
              <BalanceCard available={summary.minutesAvailable} allocated={summary.minutesAllocated} consumed={summary.minutesConsumed} />
              <p className="panel-footnote"><ShieldCheck size={15} /> 15,000 allocated − 2,480 consumed = 12,520 available.</p>
            </section>

            <section className="surface-panel">
              <SectionHeading title="Care setting comparison" subtitle="Patients and minutes in each displayed sample setting" right={<Activity size={18} className="section-icon" />} />
              <div className="care-list">
                {data.settings.map((setting) => {
                  const relative = Math.round((setting.minutes / maxSettingMinutes) * 100);
                  return (
                    <div key={setting.label} className="care-row">
                      <div className="care-symbol">
                        {setting.label === "OPD" ? <Stethoscope size={18} /> : setting.label === "Emergency" ? <HeartPulse size={18} /> : setting.label === "IPD" ? <BarChart3 size={18} /> : <Activity size={18} />}
                      </div>
                      <div className="care-description">
                        <div><strong>{setting.label}</strong><span>{number(setting.patients)} patients</span></div>
                        <div className="comparison-bar" role="meter" aria-label={`${setting.label} minutes relative to the highest displayed care setting`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={relative}>
                          <span style={{ width: `${relative}%` }} />
                        </div>
                      </div>
                      <strong className="care-minutes">{number(setting.minutes)} <small>min</small></strong>
                    </div>
                  );
                })}
              </div>
              <p className="comparison-note"><Info size={14} /> Bars compare minutes with the highest displayed setting; they are not capacity percentages.</p>
            </section>
          </div>

          <section className="surface-panel clinician-panel">
            <SectionHeading
              title="Clinician activity sample"
              subtitle="Operational totals for the four supplied roster profiles"
              right={<span className="neutral-chip">{data.clinicians.length} profiles in sample roster</span>}
            />
            <div className="doctor-list">
              {data.clinicians.map((clinician) => {
                const relative = Math.round((clinician.minutes / maxClinicianMinutes) * 100);
                return (
                  <Link className="doctor-row doctor-row-button" key={clinician.id} href={`/hospital/doctors/${encodeURIComponent(clinician.id)}`}>
                    <div className="doctor-avatar">{initials(clinician.name)}</div>
                    <div className="doctor-stat">
                      <div className="doctor-head">
                        <div><strong>{clinician.name}</strong><small>{clinician.department}</small></div>
                        <div className="right-stat"><strong>{number(clinician.patients)} patients</strong><small>{number(clinician.minutes)} minutes</small></div>
                      </div>
                      <div className="comparison-bar" role="meter" aria-label={`${clinician.name} minutes relative to the highest minutes in this displayed clinician sample`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={relative}>
                        <span style={{ width: `${relative}%` }} />
                      </div>
                    </div>
                    <span className="row-action-label">View activity</span>
                  </Link>
                );
              })}
            </div>
            <p className="panel-footnote"><Info size={15} /> Comparative bars are relative to this displayed sample, not individual allocations.</p>
          </section>
        </>
      )}
    </>
  );
}

function initials(name: string): string {
  return name.split(" ").filter((part) => part !== "Dr.").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
