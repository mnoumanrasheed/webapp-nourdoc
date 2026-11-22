"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FileText, Search, SlidersHorizontal } from "lucide-react";
import type { CareSetting, Encounter, EncounterStatus } from "@/lib/types";
import { workspaceApi } from "@/lib/client-api";
import { ErrorPanel, LoadingPanel, SampleBadge } from "./ui";
import { TopIntro } from "./app-shell";

type StatusFilter = "all" | EncounterStatus;
type SettingFilter = "all" | CareSetting;

const PAGE_SIZE = 3;

export function DoctorEncounterDirectory({ initialQuery = "", initialSetting = "all", initialStatus = "all", initialPage = 1 }: { initialQuery?: string; initialSetting?: string; initialStatus?: string; initialPage?: number }) {
  const [encounters, setEncounters] = useState<Encounter[] | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [setting, setSetting] = useState<SettingFilter>(["OPD", "Emergency", "IPD", "Telehealth"].includes(initialSetting) ? initialSetting as CareSetting : "all");
  const [status, setStatus] = useState<StatusFilter>(["Approved", "Review pending", "Processing"].includes(initialStatus) ? initialStatus as EncounterStatus : "all");
  const [page, setPage] = useState(Number.isSafeInteger(initialPage) && initialPage > 0 ? initialPage : 1);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    workspaceApi.doctorEncounters(controller.signal).then(setEncounters).catch((reason) => {
      if (reason instanceof Error && reason.name !== "AbortError") setError(reason.message);
    });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (setting !== "all") params.set("setting", setting);
    if (status !== "all") params.set("status", status);
    if (page > 1) params.set("page", String(page));
    const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [query, setting, status, page]);

  const filtered = useMemo(() => (encounters ?? []).filter((encounter) => {
    const matchesQuery = !query.trim() || `${encounter.patientLabel} ${encounter.id}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (setting === "all" || encounter.setting === setting) && (status === "all" || encounter.status === status);
  }), [encounters, query, setting, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((Math.min(page, pageCount) - 1) * PAGE_SIZE, Math.min(page, pageCount) * PAGE_SIZE);
  const currentListUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (setting !== "all") params.set("setting", setting);
    if (status !== "all") params.set("status", status);
    if (page > 1) params.set("page", String(page));
    return `/doctor/encounters${params.size ? `?${params}` : ""}`;
  }, [query, setting, status, page]);

  return <>
    <TopIntro eyebrow="CLINICIAN WORKSPACE" title="Patient encounters" description="Find recent demonstration encounters, review status, and open available clinical documentation."/>
    <div className="workspace-heading"><div><h2>Encounter directory</h2><p>Dr. Ahmed Khan · Cardiology</p></div><SampleBadge/></div>
    <div className="encounter-toolbar"><label className="search-field"><Search size={18}/><span className="sr-only">Search encounters</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search patient label or encounter ID"/></label><label className="filter-field"><span><SlidersHorizontal size={15}/>Care setting</span><select value={setting} onChange={(event) => { setSetting(event.target.value as SettingFilter); setPage(1); }}><option value="all">All settings</option><option value="OPD">OPD</option><option value="Emergency">Emergency</option><option value="IPD">IPD</option><option value="Telehealth">Telehealth</option></select></label><label className="filter-field"><span>Status</span><select value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(1); }}><option value="all">All statuses</option><option value="Approved">Approved</option><option value="Review pending">Review pending</option><option value="Processing">Processing</option></select></label></div>
    {error ? <ErrorPanel message={error} onRetry={() => { setError(""); setReload(value => value + 1); }}/>
      : !encounters ? <LoadingPanel/>
      : filtered.length === 0 ? <div className="empty-panel compact-empty"><Search size={28}/><h3>No matching encounters</h3><p>Adjust the patient search, care setting, or report status filter.</p></div>
      : <><section className="encounter-table" aria-label="Patient encounters"><div className="encounter-table-head"><span>Patient</span><span>Care setting</span><span>Status</span><span>Actions</span></div>{visible.map((encounter) => <article className="encounter-table-row" key={encounter.id}><div className="encounter-patient"><span className="patient-avatar"><FileText size={18}/></span><span><strong>{encounter.patientLabel}</strong><small>{encounter.id} · {encounter.time}</small></span></div><span className="setting-label">{encounter.setting}</span><span className={`status status-${encounter.status.toLowerCase().replace(/\s/g, "-")}`}>{encounter.status}</span><div className="encounter-row-actions"><Link href={`/doctor/encounters/${encodeURIComponent(encounter.id)}?from=${encodeURIComponent(currentListUrl)}`}>View details</Link>{encounter.reportAvailable && <Link className="primary-row-action" href={`/clinical/reports/${encodeURIComponent(encounter.id)}`}>Open report</Link>}</div></article>)}</section>{pageCount > 1 && <nav className="pagination" aria-label="Encounter pages"><button type="button" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</button><span>Page {Math.min(page, pageCount)} of {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}>Next</button></nav>}</>}
  </>;
}
