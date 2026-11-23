"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Stethoscope, Users } from "lucide-react";
import type { Clinician } from "@/lib/types";
import { number, SampleBadge } from "./ui";
import { TopIntro } from "./app-shell";

export function HospitalDoctorDirectory({ doctors }: { doctors: Clinician[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return doctors;
    return doctors.filter((doctor) => `${doctor.name} ${doctor.department}`.toLowerCase().includes(normalized));
  }, [doctors, query]);

  return (
    <>
      <TopIntro eyebrow="HOSPITAL ADMINISTRATION" title="Doctor directory" description="Search the illustrative roster and inspect aggregate operational activity." />
      <div className="workspace-heading">
        <div><h2>Clinical team sample</h2><p>NourDoc Demo Hospital · Illustrative roster</p></div>
        <SampleBadge />
      </div>
      <div className="directory-toolbar">
        <label className="search-field">
          <Search size={18} /><span className="sr-only">Search doctors</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by doctor or specialty" />
        </label>
        <span className="directory-count"><Users size={16} />{filtered.length} matching profiles</span>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-panel compact-empty"><Search size={28} /><h3>No matching profiles</h3><p>Try a doctor name or specialty such as Cardiology or Pediatrics.</p></div>
      ) : (
        <section className="directory-grid" aria-label="Illustrative doctor roster">
          {filtered.map((doctor) => (
            <Link className="directory-card" href={`/hospital/doctors/${encodeURIComponent(doctor.id)}`} key={doctor.id}>
              <div className="directory-avatar">{initials(doctor.name)}</div>
              <div className="directory-main">
                <span className="directory-specialty"><Stethoscope size={15} />{doctor.department}</span>
                <h3>{doctor.name}</h3>
                <div className="directory-stats"><span><strong>{number(doctor.patients)}</strong>Patients in sample</span><span><strong>{number(doctor.minutes)} min</strong>Minutes in sample</span></div>
              </div>
              <span className="directory-action">View activity</span>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}

function initials(name: string): string {
  return name.split(" ").filter((part) => part !== "Dr.").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
