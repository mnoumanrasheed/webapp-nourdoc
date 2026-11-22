"use client";
import { useState } from "react";
import { Building2, HeartPulse, LockKeyhole, ShieldCheck, Stethoscope } from "lucide-react";
import { Brand } from "./app-shell";
import type { Role } from "@/lib/types";
export function LoginView({ enabled }: { enabled: boolean }) {
  const [loading, setLoading] = useState<Role | null>(null);
  const [error, setError] = useState("");
  async function login(role: Role) {
    setLoading(role); setError("");
    try {
      const response = await fetch("/api/auth/demo-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign in failed");
      if (!result.destination) throw new Error("No destination returned");
      window.location.assign(result.destination);
    } catch (e) { setError(e instanceof Error ? e.message : "Unexpected error"); setLoading(null); }
  }
  return <div className="login-page">
    <div className="login-orb orb-one"/><div className="login-orb orb-two"/><div className="login-grid-lines" aria-hidden="true"/>
    <div className="login-wrap"><div className="login-header"><Brand/><span className="login-demo"><span/> INTERACTIVE PROTOTYPE</span></div>
      <div className="login-grid"><section className="login-intro"><div className="eyebrow"><span className="eyebrow-square"/> THE CLINICAL INTELLIGENCE WORKSPACE</div><h1>Better clarity.<br/><span>Better care.</span></h1><p>One connected workspace for hospital operations, clinician activity, minute utilization, and AI-assisted report review.</p><div className="login-features"><span><ShieldCheck size={15}/> Role-scoped experience</span><span><HeartPulse size={15}/> Clear clinical workflows</span><span><LockKeyhole size={15}/> Backend-ready architecture</span></div><div className="login-proof"><span className="proof-avatar">N</span><span><strong>Designed for calm, confident decisions</strong><small>Private by default · Built for care teams</small></span><span className="proof-line"/></div></section>
      <section className="login-card"><div className="login-card-top"><span className="login-card-icon"><HeartPulse size={22}/></span><span className="status-chip"><span/> DEMO MODE</span></div><h2>Explore NourDoc</h2><p>Choose a sample identity to explore the proposed interface.</p>
        <div className="login-options"><button className="login-option" onClick={() => login("hospital_admin")} disabled={!enabled || loading !== null}><span className="login-option-icon"><Building2 size={22}/></span><span><strong>{loading === "hospital_admin" ? "Opening hospital workspace…" : "Hospital Administrator"}</strong><small>Operations, minutes, clinicians & utilization</small></span><span className="login-option-cta">Open</span></button>
        <button className="login-option" onClick={() => login("doctor")} disabled={!enabled || loading !== null}><span className="login-option-icon"><Stethoscope size={22}/></span><span><strong>{loading === "doctor" ? "Opening clinician workspace…" : "Doctor / Clinician"}</strong><small>My metrics, patient encounters & reports</small></span><span className="login-option-cta">Open</span></button></div>
        {!enabled && <p className="alert error">Demo login is off. Set DEMO_MODE=true and SESSION_SECRET in .env.local to run the sample.</p>}
        {error && <p role="alert" className="alert error">{error}</p>}
        <div className="login-disclaimer"><LockKeyhole size={15}/><span><strong>Safe mock data preview.</strong> Explore the hospital dashboard, clinician workspace, encounters and sample report without real patient records.</span></div>
      </section></div><div className="login-bottom">NourDoc Concept v1.0 <span>•</span> Illustrative data only <span>•</span> No external integrations</div>
    </div>
  </div>;
}
