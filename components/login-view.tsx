"use client";

import Link from "next/link";
import {
  BarChart3,
  Building2,
  ChevronRight,
  FileText,
  Info,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Brand } from "./app-shell";

export function LoginView() {
  return (
    <main className="login-page">
      <div className="login-wrap">
        <header className="login-header">
          <Brand />
          <span className="prototype-badge">
            <Sparkles size={14} /> INTERACTIVE PROTOTYPE
          </span>
        </header>

        <div className="login-grid">
          <section className="login-intro" aria-labelledby="login-intro-title">
            <span className="eyebrow">NOURDOC CLINICAL WORKSPACE</span>
            <h1 id="login-intro-title">
              Better clarity.
              <span>Better care.</span>
            </h1>
            <p>
              One connected workspace for hospital operations, clinician activity,
              minute allocation, and AI-assisted report review.
            </p>

            <div className="login-features" aria-label="Key workspace features">
              <span>
                <BarChart3 size={17} /> Hospital insights
              </span>
              <span>
                <Stethoscope size={17} /> Clinician workspace
              </span>
              <span>
                <FileText size={17} /> Clinical report review
              </span>
            </div>

            <div className="login-proof">
              <span className="proof-avatar">N</span>
              <span>
                <strong>Designed for calm, confident review</strong>
                <small>Illustrative synthetic data · No external healthcare integrations</small>
              </span>
            </div>
          </section>

          <section className="login-card" aria-labelledby="explore-title">
            <div className="login-card-top">
              <span className="login-card-icon">
                <Sparkles size={22} />
              </span>
              <span className="status-chip">INTERACTIVE PROTOTYPE</span>
            </div>

            <h2 id="explore-title">Explore NourDoc</h2>
            <p className="login-card-sub">Choose a workspace to preview the experience.</p>

            <div className="login-options">
              <Link
                href="/hospital/dashboard"
                className="login-option"
                aria-label="Explore Hospital Administrator workspace"
              >
                <span className="login-option-icon">
                  <Building2 size={24} />
                </span>
                <span className="login-option-text">
                  <strong>Hospital Administrator</strong>
                  <small>Hospital overview, doctor activity, minutes and utilization.</small>
                </span>
                <span className="login-option-arrow" aria-hidden="true">
                  <ChevronRight size={20} />
                </span>
              </Link>

              <Link
                href="/doctor/dashboard"
                className="login-option"
                aria-label="Explore Doctor and Clinician workspace"
              >
                <span className="login-option-icon">
                  <Stethoscope size={24} />
                </span>
                <span className="login-option-text">
                  <strong>Doctor / Clinician</strong>
                  <small>My encounters, consultation minutes and clinical reports.</small>
                </span>
                <span className="login-option-arrow" aria-hidden="true">
                  <ChevronRight size={20} />
                </span>
              </Link>
            </div>

            <div className="login-disclaimer">
              <Info size={16} />
              <span>
                <strong>Safe mock data preview.</strong> Explore the hospital dashboard, clinician
                workspace, encounters, and sample report without real patient records.
              </span>
            </div>
          </section>
        </div>

        <footer className="login-bottom">
          <span>Illustrative data only · No clinical or external integrations.</span>
        </footer>
      </div>
    </main>
  );
}
