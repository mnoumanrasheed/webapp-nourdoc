"use client";
import { AlertCircle, Clock3, FileCheck2, Hourglass, LoaderCircle, Sparkles, TrendingUp, Users } from "lucide-react";
import type { Period } from "@/lib/types";

export const number = (value: number) => new Intl.NumberFormat("en-US").format(value);
export function PeriodTabs({ value, onChange }: { value: Period; onChange: (value: Period) => void }) {
  return <div className="period-tabs" role="group" aria-label="Time period">{(["today", "7d", "30d"] as const).map(p => <button type="button" aria-pressed={value === p} key={p} className={value === p ? "selected" : ""} onClick={() => onChange(p)}>{p === "today" ? "Today" : p === "7d" ? "Last 7 days" : "Last 30 days"}</button>)}</div>;
}
export function SectionHeading({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return <div className="section-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{right}</div>;
}
export function MetricCard({ icon, label, value, sub, change, tone = "blue" }: { icon: "users" | "clock" | "report" | "waiting"; label: string; value: string; sub?: string; change?: string; tone?: "blue" | "amber" | "mint" }) {
  const Icon = { users: Users, clock: Clock3, report: FileCheck2, waiting: Hourglass }[icon];
  return <div className="metric-card"><div className="metric-card-top"><div className={`metric-icon ${tone}`}><Icon size={19}/></div>{change && <span className="metric-change"><TrendingUp size={13}/>{change}</span>}</div><div className="metric-value">{value}</div><div className="metric-label">{label}</div>{sub && <div className="metric-sub">{sub}</div>}</div>;
}
export function LoadingPanel() { return <div className="loading-panel loading-skeleton" role="status" aria-live="polite" aria-busy="true"><span className="sr-only">Loading workspace data...</span><div className="skeleton-line skeleton-title"/><div className="skeleton-line"/><div className="skeleton-grid"><span/><span/><span/></div><LoaderCircle size={18} className="spin skeleton-spinner"/></div>; }
export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="empty-panel" role="alert"><AlertCircle size={28}/><h3>Could not load this workspace</h3><p>{message}</p>{onRetry && <button type="button" className="text-button" onClick={onRetry}>Try again</button>}</div>;
}
export function NoPeriodData({ period }: { period: Period }) {
  return <div className="empty-panel"><Clock3 size={28}/><h3>No sample metrics for {period === "7d" ? "the last 7 days" : "the last 30 days"}</h3><p>The screenshots only supplied Today data. We have intentionally not invented historical numbers. Connect your analytics API to enable this period.</p></div>;
}
export function BalanceCard({ available, allocated, consumed, title = "Minutes balance" }: { available: number; allocated: number; consumed: number; title?: string }) {
  const usedPct = allocated ? Math.min(100, (consumed / allocated) * 100) : 0;
  return <div className="balance-card"><div className="balance-info"><div className="small-label">{title}</div><div className="balance-number">{number(available)}<small> min</small></div><p>Available out of {number(allocated)} allocated minutes</p><div className="balance-track" aria-label={`${Math.round(usedPct)} percent minutes consumed`} role="progressbar" aria-valuenow={Math.round(usedPct)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${usedPct}%` }}/></div><div className="balance-footer"><span>{number(consumed)} minutes consumed</span><span>{Math.round(100 - usedPct)}% remaining</span></div></div><div className="donut-wrap"><div className="balance-donut" style={{ background: `conic-gradient(#50dbb8 ${100 - usedPct}%, #28453f ${100 - usedPct}% 100%)` }}><div><strong>{Math.round(100 - usedPct)}%</strong><small>remaining</small></div></div></div></div>;
}
export function SampleBadge() { return <span className="demo-badge"><Sparkles size={13}/> Curated demo data</span>; }
