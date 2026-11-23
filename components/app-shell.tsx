"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import type { ShellIdentity } from "@/lib/presentation";

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand ${small ? "brand-small" : ""}`}>
      <span className="brand-logo">
        <Image src="/nourdoc-logo-transparent.png" alt="NourDoc Logo" width={44} height={44} priority />
      </span>
      <span className="brand-word">
        <strong>NourDoc</strong>
        <small>Clinical Intelligence Platform</small>
      </span>
    </div>
  );
}

type AppSection = "hospital" | "doctors" | "doctor" | "encounters" | "reports";

export function AppShell({
  identity,
  section,
  children,
}: {
  identity: ShellIdentity;
  section: AppSection;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const closeMenuRef = useRef<HTMLButtonElement>(null);
  const admin = identity.role === "hospital_admin";
  const initials = getInitials(identity.name, admin ? "HA" : "DR");
  const roleLabel = admin ? "Hospital administrator" : `${identity.department ?? "Clinical"} clinician`;

  useEffect(() => {
    function closeProfile(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", closeProfile);
    return () => document.removeEventListener("mousedown", closeProfile);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeMenuRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function switchExperience() {
    router.push("/login");
  }

  const nav = admin
    ? [
        { href: "/hospital/dashboard", label: "Hospital overview", icon: LayoutDashboard, active: section === "hospital" },
        { href: "/hospital/doctors", label: "Doctor directory", icon: Users, active: section === "doctors" },
      ]
    : [
        { href: "/doctor/dashboard", label: "Clinical dashboard", icon: LayoutDashboard, active: section === "doctor" },
        { href: "/doctor/encounters", label: "Patient encounters", icon: Users, active: section === "encounters" || section === "reports" },
      ];

  const sectionLabel =
    section === "hospital"
      ? "Hospital overview"
      : section === "doctors"
      ? "Doctor directory"
      : section === "doctor"
      ? "Clinical dashboard"
      : section === "encounters"
      ? "Patient encounters"
      : "Clinical report";

  return (
    <div className="shell">
      <aside
        id="workspace-navigation"
        className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}
        aria-label="Workspace navigation"
      >
        <div className="sidebar-header">
          <Brand />
          <button
            ref={closeMenuRef}
            className="icon-button close-mobile"
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-context">
          <div className="workspace-mark">
            {admin ? <Building2 size={19} /> : <Stethoscope size={19} />}
          </div>
          <div className="workspace-meta">
            <small>CURRENT WORKSPACE</small>
            <strong>{admin ? "Hospital administration" : "Clinician workspace"}</strong>
          </div>
        </div>

        <div className="nav-section-title">NAVIGATION</div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {nav.map(({ href, label, icon: Icon, active }) => (
            <Link
              onClick={() => setMenuOpen(false)}
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`nav-link ${active ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-push" />

        <div className="sidebar-switch-wrap">
          <Link
            href="/login"
            className="sidebar-switch-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Switch prototype experience"
          >
            <ArrowLeftRight size={15} />
            <span>Switch experience</span>
          </Link>
        </div>

        <div className="privacy-note">
          <ShieldCheck size={18} />
          <span>
            <strong>Synthetic demonstration</strong>
            <small>Illustrative fixtures · No medical data</small>
          </span>
        </div>

        <div className="side-footer">
          <div className="avatar">{initials}</div>
          <div className="who">
            <strong>{identity.name}</strong>
            <small>{roleLabel}</small>
          </div>
          <Link
            href="/login"
            className="icon-button"
            title="Switch experience"
            aria-label="Switch experience"
          >
            <LogOut size={18} />
          </Link>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-overlay"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main">
        <header className="topbar">
          <div className="topbar-start">
            <button
              className="icon-button menu-toggle"
              type="button"
              aria-label="Open navigation"
              aria-controls="workspace-navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span> <strong>{sectionLabel}</strong>
            </span>
          </div>

          <div className="topbar-right">
            <span className="workspace-status">
              <ShieldCheck size={14} /> Synthetic data workspace
            </span>

            <Link
              href="/login"
              className="topbar-switch-btn"
              title="Return to prototype role selection"
            >
              <ArrowLeftRight size={14} />
              <span>Switch experience</span>
            </Link>

            <div className="profile-menu-wrap" ref={profileRef}>
              <button
                className="topbar-avatar profile-trigger"
                type="button"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                {initials}
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <strong>{identity.name}</strong>
                    <span>{roleLabel}</span>
                  </div>
                  <Link
                    href="/login"
                    className="profile-menu-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ArrowLeftRight size={15} />
                    <span>Switch experience</span>
                  </Link>
                  <Link
                    href="/login"
                    className="profile-menu-link exit"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LogOut size={15} />
                    <span>Exit workspace</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content">
          {children}
          <footer className="page-footer">
            <span>© NourDoc · Clinical Intelligence Platform</span>
            <span>
              <Activity size={14} /> Demonstration interface · Illustrative synthetic data only
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export function TopIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="intro">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="intro-pill">
        <ShieldCheck size={14} /> Synthetic prototype
      </div>
    </div>
  );
}

function getInitials(name: string, fallback: string): string {
  const value = name
    .split(" ")
    .filter((part) => part && part !== "Dr.")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return value || fallback;
}
