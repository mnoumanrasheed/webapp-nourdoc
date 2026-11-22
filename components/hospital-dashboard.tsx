"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Clock3,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import type { HospitalOverview, Period } from "@/lib/types";
import { workspaceApi } from "@/lib/client-api";
import {
  BalanceCard,
  ErrorPanel,
  LoadingPanel,
  MetricCard,
  NoPeriodData,
  number,
  PeriodTabs,
  SampleBadge,
  SectionHeading,
} from "./ui";
import { TopIntro } from "./app-shell";

export function HospitalDashboard() {
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData] = useState<HospitalOverview | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError("");

    workspaceApi
      .hospitalOverview(period, controller.signal)
      .then(setData)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setError(error.message);
        }
      });

    return () => controller.abort();
  }, [period, reload]);

  function changePeriod(value: Period) {
    setData(null);
    setError("");
    setPeriod(value);
  }

  const summary = data?.summary;
  const maxSettingMinutes = Math.max(
    1,
    ...(data?.settings.map((setting) => setting.minutes) ?? []),
  );
  const maxClinicianMinutes = Math.max(
    1,
    ...(data?.clinicians.map((clinician) => clinician.minutes) ?? []),
  );

  return (
    <>
      <TopIntro
        eyebrow="HOSPITAL COMMAND CENTRE"
        title="Hospital overview"
        description="A clearer view of care delivery, clinician activity and minute utilization."
      />

      <div className="workspace-heading">
        <div>
          <h2>Hospital Command Centre</h2>
          <p>
            Hospital owner / administrator · {data?.hospital || "NourDoc Demo Hospital"}
          </p>
        </div>
        <SampleBadge />
      </div>

      <div className="controls-row">
        <PeriodTabs value={period} onChange={changePeriod} />
        <span className="period-label">
          <CalendarDays size={14} />
          {period === "today"
            ? "Today"
            : period === "7d"
              ? "Last 7 days"
              : "Last 30 days"}
        </span>
      </div>

      {error ? (
        <ErrorPanel
          message={error}
          onRetry={() => {
            setError("");
            setReload((value) => value + 1);
          }}
        />
      ) : !data ? (
        <LoadingPanel />
      ) : !data.available || !summary ? (
        <NoPeriodData period={period} />
      ) : (
        <>
          <SectionHeading
            title="At a glance"
            subtitle="Essential metrics across the hospital"
            right={
              <span className="live-tag">
                <span /> SAMPLE METRICS
              </span>
            }
          />

          <div className="metrics-grid">
            <MetricCard
              icon="users"
              label="Patients served"
              value={number(summary.patientsServed)}
              sub="Completed patient encounters"
              change="Today"
              tone="mint"
            />
            <MetricCard
              icon="clock"
              label="Minutes consumed"
              value={number(summary.minutesConsumed)}
              sub="Across all care settings"
              change="16.5 min avg"
            />
            <MetricCard
              icon="report"
              label="Estimated expenditure"
              value={`PKR ${number(summary.expenditurePKR)}`}
              sub="Illustrative operational spend"
              change="Preview only"
            />
            <MetricCard
              icon="waiting"
              label="Patients waiting"
              value={number(summary.patientsWaiting)}
              sub="Current sample queue"
              change="Sample queue"
              tone="amber"
            />
          </div>

          <div className="data-row main-data-row">
            <section className="surface-panel balance-panel">
              <SectionHeading
                title="Minutes allocation"
                subtitle="Track the hospital's available capacity"
                right={<Clock3 size={17} className="section-icon" />}
              />
              <BalanceCard
                available={summary.minutesAvailable}
                allocated={summary.minutesAllocated}
                consumed={summary.minutesConsumed}
              />
              <p className="panel-footnote">
                <ShieldCheck size={14} /> Curated preview figures for interface review;
                billing logic is not connected.
              </p>
            </section>

            <section className="surface-panel care-panel">
              <SectionHeading
                title="Care setting utilization"
                subtitle="Minutes and patient activity by setting"
                right={<Activity size={17} className="section-icon" />}
              />
              <div className="care-list">
                {data.settings.map((setting) => (
                  <div key={setting.label} className="care-row">
                    <div className="care-symbol">
                      {setting.label === "OPD" ? (
                        <Stethoscope size={17} />
                      ) : setting.label === "Emergency" ? (
                        <HeartPulse size={17} />
                      ) : setting.label === "IPD" ? (
                        <BarChart3 size={17} />
                      ) : (
                        <Activity size={17} />
                      )}
                    </div>
                    <div className="care-description">
                      <strong>{setting.label}</strong>
                      <span>{number(setting.patients)} patients</span>
                      <div className="care-util-track" aria-hidden="true">
                        <span
                          style={{
                            width: `${Math.round((setting.minutes / maxSettingMinutes) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <strong className="care-minutes">
                      {number(setting.minutes)} <small>min</small>
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="surface-panel clinician-panel">
            <SectionHeading
              title="Clinician utilization"
              subtitle="A focused view of activity across the active clinical team"
              right={<span className="soft-chip">{data.clinicians.length} active clinicians</span>}
            />
            <div className="doctor-list">
              {data.clinicians.map((clinician) => (
                <Link
                  className="doctor-row doctor-row-button"
                  key={clinician.id}
                  href={`/hospital/doctors/${encodeURIComponent(clinician.id)}`}
                  title={`View ${clinician.name} sample utilization`}
                >
                  <div className="doctor-avatar">
                    {clinician.name
                      .split(" ")
                      .slice(1)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="doctor-stat">
                    <div className="doctor-head">
                      <div>
                        <strong>{clinician.name}</strong>
                        <small>{clinician.department}</small>
                      </div>
                      <div className="right-stat">
                        <strong>{number(clinician.patients)} patients</strong>
                        <small>{number(clinician.minutes)} minutes</small>
                      </div>
                    </div>
                    <div
                      className="util-track"
                      title="Relative to the highest minute count among the displayed sample doctors"
                    >
                      <span
                        style={{
                          width: `${Math.min(
                            100,
                            (clinician.minutes / maxClinicianMinutes) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <p className="panel-footnote">
              <ArrowUpRight size={14} /> Clinician metrics are fictional preview data designed
              to demonstrate utilization patterns.
            </p>
          </section>
        </>
      )}
    </>
  );
}
