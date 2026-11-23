"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FileText, Search, SlidersHorizontal } from "lucide-react";
import type { CareSetting, Encounter, EncounterStatus } from "@/lib/types";
import { SampleBadge } from "./ui";
import { TopIntro } from "./app-shell";

type StatusFilter = "all" | EncounterStatus;
type SettingFilter = "all" | CareSetting;
const PAGE_SIZE = 3;

type Props = {
  encounters: Encounter[];
  doctorName: string;
  department: string;
  initialQuery?: string;
  initialSetting?: string;
  initialStatus?: string;
  initialPage?: number;
};

export function DoctorEncounterDirectory({ encounters, doctorName, department, initialQuery = "", initialSetting = "all", initialStatus = "all", initialPage = 1 }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [setting, setSetting] = useState<SettingFilter>(["OPD", "Emergency", "IPD", "Telehealth"].includes(initialSetting) ? initialSetting as CareSetting : "all");
  const [status, setStatus] = useState<StatusFilter>(["Approved", "Review pending", "Processing"].includes(initialStatus) ? initialStatus as EncounterStatus : "all");
  const [page, setPage] = useState(Number.isSafeInteger(initialPage) && initialPage > 0 ? initialPage : 1);

  const filtered = useMemo(() => encounters.filter((encounter) => {
    const matchesQuery = !query.trim() || `${encounter.patientLabel} ${encounter.id}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (setting === "all" || encounter.setting === setting) && (status === "all" || encounter.status === status);
  }), [encounters, query, setting, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const currentListUrl = useMemo(() => buildListUrl(query, setting, status, safePage), [query, setting, status, safePage]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    window.history.replaceState(null, "", currentListUrl);
  }, [currentListUrl]);

  function resetPage() { setPage(1); }

  return (
    <>
      <TopIntro eyebrow="CLINICIAN WORKSPACE" title="Patient encounters" description="Search synthetic encounters assigned to your clinician prototype profile." />
      <div className="workspace-heading">
        <div><h2>Encounter directory</h2><p>{doctorName} · {department}</p></div>
        <SampleBadge />
      </div>

      <div className="encounter-toolbar">
        <label className="search-field">
          <Search size={18} /><span className="sr-only">Search encounters</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); resetPage(); }} placeholder="Search patient label or encounter ID" />
        </label>
        <label className="filter-field" htmlFor="encounter-setting">
          <span><SlidersHorizontal size={15} />Care setting</span>
          <select id="encounter-setting" value={setting} onChange={(event) => { setSetting(event.target.value as SettingFilter); resetPage(); }}>
            <option value="all">All settings</option><option value="OPD">OPD</option><option value="Emergency">Emergency</option><option value="IPD">IPD</option><option value="Telehealth">Telehealth</option>
          </select>
        </label>
        <label className="filter-field" htmlFor="encounter-status">
          <span>Status</span>
          <select id="encounter-status" value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); resetPage(); }}>
            <option value="all">All statuses</option><option value="Approved">Approved</option><option value="Review pending">Review pending</option><option value="Processing">Processing</option>
          </select>
        </label>
      </div>

      {encounters.length === 0 ? (
        <div className="empty-panel compact-empty"><FileText size={29} /><h3>No encounter fixture for this clinician</h3><p>This demo identity has no supplied encounters. Another clinician's records are intentionally not shown.</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-panel compact-empty"><Search size={28} /><h3>No matching encounters</h3><p>Adjust the patient search, care setting, or status filter.</p></div>
      ) : (
        <>
          <section className="encounter-table" aria-label="Patient encounters">
            <div className="encounter-table-head"><span>Patient</span><span>Care setting</span><span>Status</span><span>Actions</span></div>
            {visible.map((encounter) => (
              <article className="encounter-table-row" key={encounter.id}>
                <div className="encounter-patient"><span className="patient-avatar"><FileText size={18} /></span><span><strong>{encounter.patientLabel}</strong><small>{encounter.id} · {encounter.time}</small></span></div>
                <span className="setting-label">{encounter.setting}</span>
                <span className={`status status-${encounter.status.toLowerCase().replace(/\s/g, "-")}`}>{encounter.status}</span>
                <div className="encounter-row-actions">
                  <Link href={`/doctor/encounters/${encodeURIComponent(encounter.id)}?from=${encodeURIComponent(currentListUrl)}`}>View encounter</Link>
                  {encounter.reportAvailable ? (
                    <Link className="primary-row-action" href={`/clinical/reports/${encodeURIComponent(encounter.id)}?from=${encodeURIComponent(currentListUrl)}`}>Open sample report</Link>
                  ) : <small>No sample report</small>}
                </div>
              </article>
            ))}
          </section>
          {pageCount > 1 && (
            <nav className="pagination" aria-label="Encounter pages">
              <button type="button" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
              <span>Page {safePage} of {pageCount}</span>
              <button type="button" disabled={safePage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

function buildListUrl(query: string, setting: SettingFilter, status: StatusFilter, page: number): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (setting !== "all") params.set("setting", setting);
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  return `/doctor/encounters${params.size ? `?${params}` : ""}`;
}
