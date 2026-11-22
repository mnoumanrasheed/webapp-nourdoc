"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Activity, Building2, ChevronDown, FileHeart, LayoutDashboard, LogOut, Menu, ShieldCheck, Stethoscope, Users, X } from "lucide-react";
import type { SessionUser } from "@/lib/types";

export function Brand({ small = false }: { small?: boolean }) {
  return <div className={`brand ${small ? "brand-small" : ""}`}>
    <span className="brand-symbol brand-logo"><img src="/nourdoc-logo-transparent.png" alt="" /></span>
    <span className="brand-word"><strong>NourDoc</strong><small>Clinical Intelligence Platform</small></span>
  </div>;
}

type AppSection = "hospital" | "doctors" | "doctor" | "encounters" | "reports";

export function AppShell({ user, section, children }: { user: SessionUser; section: AppSection; children: React.ReactNode }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function closeProfile(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", closeProfile);
    return () => document.removeEventListener("mousedown", closeProfile);
  }, []);
  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Could not sign out");
      router.replace("/login"); router.refresh();
    } catch { setBusy(false); setLogoutError("Could not sign out. Please retry."); }
  }
  const admin = user.role === "hospital_admin";
  const nav = admin ? [
    { href: "/hospital/dashboard", label: "Hospital overview", icon: LayoutDashboard, active: section === "hospital" },
    { href: "/hospital/doctors", label: "Doctor directory", icon: Users, active: section === "doctors" },
  ] : [
    { href: "/doctor/dashboard", label: "Clinical dashboard", icon: LayoutDashboard, active: section === "doctor" },
    { href: "/doctor/encounters", label: "Patient encounters", icon: Users, active: section === "encounters" },
    { href: "/clinical/reports/ND-1025", label: "Report review", icon: FileHeart, active: section === "reports" },
  ];
  const sectionLabel = section === "hospital" ? "Hospital overview" : section === "doctors" ? "Doctor directory" : section === "doctor" ? "Clinical dashboard" : section === "encounters" ? "Patient encounters" : "Clinical report";
  return <div className="shell">
    <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header"><Brand/><button className="icon-button close-mobile" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-mark">{admin ? <Building2 size={18}/> : <Stethoscope size={18}/>}</div><div className="workspace-meta"><small>ACTIVE WORKSPACE</small><strong>{admin ? "Hospital administration" : "Doctor workspace"}</strong></div><ChevronDown size={15} className="muted-icon"/></div>
      <div className="nav-section-title">WORKSPACE</div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {nav.map(({ href, label, icon: Icon, active }) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className={`nav-link ${active ? "active" : ""}`}><Icon size={17}/>{label}{active && <span className="nav-active-dot"/>}</Link>)}
      </nav>
      <div className="sidebar-push"/>
      <div className="privacy-note"><ShieldCheck size={17}/><span><strong>Scoped access</strong><small>Demo role restrictions enabled</small></span></div>
      <div className="side-footer"><div className="avatar">{admin ? "HA" : "AK"}</div><div className="who"><strong>{user.name}</strong><small>{admin ? "Hospital administrator" : "Cardiology · Clinician"}</small></div><button className="icon-button" onClick={logout} disabled={busy} title="Sign out" aria-label="Sign out"><LogOut size={17}/></button></div>
      {logoutError && <p className="logout-error" role="alert">{logoutError}</p>}
    </aside>
    {menuOpen && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className="main">
      <header className="topbar"><div className="topbar-start"><button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20}/></button><span className="breadcrumb">Workspace <span>/</span> <strong>{sectionLabel}</strong></span></div><div className="topbar-right"><span className="live-indicator"><span/> DEMO WORKSPACE</span><div className="profile-menu-wrap" ref={profileRef}><button className="topbar-avatar profile-trigger" type="button" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(v => !v)}>{admin ? "HA" : "AK"}</button>{profileOpen && <div className="profile-menu"><div><strong>{user.name}</strong><span>{admin ? "Hospital administrator" : "Cardiology clinician"}</span></div><button type="button" onClick={logout} disabled={busy}><LogOut size={15}/>{busy ? "Signing out…" : "Sign out"}</button></div>}</div></div></header>
      <div className="content">{children}<footer className="page-footer"><span>© NourDoc · Clinical Intelligence Platform</span><span><Activity size={13}/> Demonstration interface — no real patient data</span></footer></div>
    </main>
  </div>;
}

export function TopIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="intro"><div><div className="eyebrow"><span className="eyebrow-square"/> {eyebrow}</div><h1>{title}</h1><p>{description}</p></div><div className="intro-pill"><span/> Live demo workspace</div></div>;
}
