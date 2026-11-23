"use client";

import { AlertCircle, Clock3, FileCheck2, Hourglass, Sparkles, Users } from "lucide-react";
import type { Period } from "@/lib/types";

export const number = (value: number) => new Intl.NumberFormat("en-US").format(value);

export function PeriodTabs({ value, onChange }: { value: Period; onChange: (value: Period) => void }) {
  return (
    <div className="period-tabs" role="tablist" aria-label="Reporting period">
      {(["today", "7d", "30d"] as const).map((period) => (
        <button
          type="button"
          role="tab"
          aria-selected={value === period}
          key={period}
          className={value === period ? "selected" : ""}
          onClick={() => onChange(period)}
        >
          {period === "today" ? "Today" : period === "7d" ? "7 days" : "30 days"}
        </button>
      ))}
    </div>
  );
}

export function SectionHeading({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return <div className="section-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{right}</div>;
}

export function MetricCard({ icon, label, value, sub, meta, tone = "blue" }: {
  icon: "users" | "clock" | "report" | "waiting";
  label: string;
  value: string;
  sub?: string;
  meta?: string;
  tone?: "blue" | "amber" | "mint";
}) {
  const Icon = { users: Users, clock: Clock3, report: FileCheck2, waiting: Hourglass }[icon];
  return (
    <article className="metric-card">
      <div className="metric-card-top"><div className={`metric-icon ${tone}`}><Icon size={20} /></div>{meta && <span className="metric-meta">{meta}</span>}</div>
      <div className="metric-value">{value}</div><div className="metric-label">{label}</div>{sub && <div className="metric-sub">{sub}</div>}
    </article>
  );
}

export function LoadingPanel() {
  return (
    <div className="loading-panel loading-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading workspace data…</span>
      <div className="skeleton-line skeleton-title" /><div className="skeleton-line" />
      <div className="skeleton-grid"><span /><span /><span /></div>
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="empty-panel" role="alert"><AlertCircle size={28} /><h3>Could not load this workspace</h3><p>{message}</p>{onRetry && <button type="button" className="text-button" onClick={onRetry}>Try again</button>}</div>;
}

export function NoPeriodData({ period }: { period: Period }) {
  return (
    <div className="empty-panel">
      <Clock3 size={28} />
      <h3>No sample data for {period === "7d" ? "the 7-day period" : "the 30-day period"}</h3>
      <p>Only the supplied Today snapshot is available. Historical values have intentionally not been inferred or fabricated.</p>
    </div>
  );
}

export function BalanceCard({ available, allocated, consumed, title = "Minutes balance" }: { available: number; allocated: number; consumed: number; title?: string }) {
  const usedPercent = allocated > 0 ? Math.min(100, Math.max(0, (consumed / allocated) * 100)) : 0;
  const remainingPercent = Math.max(0, 100 - usedPercent);
  return (
    <div className="balance-card">
      <div className="balance-info">
        <div className="small-label">{title}</div>
        <div className="balance-number">{number(available)}<small> min</small></div>
        <p>Available from {number(allocated)} allocated minutes</p>
        <div className="balance-track" aria-label={`${Math.round(usedPercent)} percent of allocated minutes consumed`} role="progressbar" aria-valuenow={Math.round(usedPercent)} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${usedPercent}%` }} />
        </div>
        <div className="balance-footer"><span>{number(consumed)} min consumed</span><span>{number(available)} min available</span></div>
      </div>
      <div className="donut-wrap" aria-hidden="true">
        <div className="balance-donut" style={{ background: `conic-gradient(var(--teal-500) ${remainingPercent}%, var(--neutral-200) ${remainingPercent}% 100%)` }}>
          <div><strong>{Math.round(remainingPercent)}%</strong><small>available</small></div>
        </div>
      </div>
    </div>
  );
}

export function SampleBadge() {
  return <span className="demo-badge"><Sparkles size={14} /> Demo data · sample snapshot</span>;
}
