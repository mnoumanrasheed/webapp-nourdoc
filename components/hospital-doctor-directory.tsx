"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, Stethoscope, Users } from "lucide-react";
import type { Clinician } from "@/lib/types";
import { workspaceApi } from "@/lib/client-api";
import { ErrorPanel, LoadingPanel, number, SampleBadge } from "./ui";
import { TopIntro } from "./app-shell";

export function HospitalDoctorDirectory() {
  const [doctors, setDoctors] = useState<Clinician[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    workspaceApi.hospitalDoctors(controller.signal).then(setDoctors).catch((reason) => {
      if (reason instanceof Error && reason.name !== "AbortError") setError(reason.message);
    });
    return () => controller.abort();
  }, [reload]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return doctors ?? [];
    return (doctors ?? []).filter((doctor) => `${doctor.name} ${doctor.department}`.toLowerCase().includes(normalized));
  }, [doctors, query]);

  return <>
    <TopIntro eyebrow="HOSPITAL ADMINISTRATION" title="Doctor directory" description="Search the demonstration clinician roster and inspect scoped utilization details."/>
    <div className="workspace-heading"><div><h2>Clinical team</h2><p>NourDoc Demo Hospital · Illustrative roster</p></div><SampleBadge/></div>
    <div className="directory-toolbar"><label className="search-field"><Search size={18}/><span className="sr-only">Search doctors</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by doctor or specialty"/></label><span className="directory-count"><Users size={16}/>{filtered.length} clinicians</span></div>
    {error ? <ErrorPanel message={error} onRetry={() => setReload(value => value + 1)}/>
      : !doctors ? <LoadingPanel/>
      : filtered.length === 0 ? <div className="empty-panel compact-empty"><Search size={28}/><h3>No matching doctors</h3><p>Try a doctor name or specialty such as Cardiology or Pediatrics.</p></div>
      : <section className="directory-grid" aria-label="Doctor directory">{filtered.map((doctor) => <Link className="directory-card" href={`/hospital/doctors/${encodeURIComponent(doctor.id)}`} key={doctor.id}><div className="directory-avatar">{doctor.name.split(" ").slice(1).map(part => part[0]).join("").slice(0, 2)}</div><div className="directory-main"><span className="directory-specialty"><Stethoscope size={14}/>{doctor.department}</span><h3>{doctor.name}</h3><div className="directory-stats"><span><strong>{number(doctor.patients)}</strong> Patients</span><span><strong>{number(doctor.minutes)}</strong> Minutes</span></div></div><span className="directory-action">View activity</span></Link>)}</section>}
  </>;
}
