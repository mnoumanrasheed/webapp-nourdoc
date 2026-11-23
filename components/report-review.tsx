"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CircleCheck, ClipboardPenLine, Copy, Pencil, RotateCcw, Save, ShieldAlert, ShieldCheck, Sparkles, Star, Stethoscope, X } from "lucide-react";
import type { ClinicalReport } from "@/lib/types";
import { canTransitionReport, transitionReport } from "@/lib/report-workflow.mjs";
import { TopIntro } from "./app-shell";
import { SectionHeading } from "./ui";

type DraftFields = Pick<ClinicalReport, "chiefComplaint" | "subjective" | "objective" | "assessment" | "plan" | "notes">;
type ReportWorkflowState = "draft" | "awaiting_review" | "needs_revision" | "approved";
type ReportWorkflowEvent = "save_draft" | "submit_review" | "request_revision" | "approve";

const workflowLabel: Record<ReportWorkflowState, string> = {
  draft: "Draft saved for preview",
  awaiting_review: "Awaiting demo review",
  needs_revision: "Demo revision requested",
  approved: "Approved in demo",
};

export function ReportReview({ report, backHref }: { report: ClinicalReport; backHref: string }) {
  const initialDraft = useMemo<DraftFields>(() => ({
    chiefComplaint: report.chiefComplaint,
    subjective: report.subjective,
    objective: report.objective,
    assessment: report.assessment,
    plan: report.plan,
    notes: report.notes,
  }), [report]);
  const [savedDraft, setSavedDraft] = useState(initialDraft);
  const [draft, setDraft] = useState(initialDraft);
  const [workflow, setWorkflow] = useState<ReportWorkflowState>("awaiting_review");
  const [isEditing, setEditing] = useState(false);
  const [confirmingApproval, setConfirmingApproval] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [copied, setCopied] = useState(false);
  const cancelApprovalRef = useRef<HTMLButtonElement>(null);
  const hasUnsavedEdits = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  useEffect(() => {
    if (!confirmingApproval) return;
    cancelApprovalRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setConfirmingApproval(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmingApproval]);

  function updateField(field: keyof DraftFields, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setValidationError("");
  }

  function applyTransition(event: ReportWorkflowEvent): boolean {
    const next = transitionReport(workflow, event);
    if (!next) return false;
    setWorkflow(next);
    return true;
  }

  function startEditing() {
    if (workflow === "approved") return;
    setDraft(savedDraft);
    setEditing(true);
    setMessage("");
    setValidationError("");
  }

  function saveDraft() {
    const missing = Object.entries(draft).find(([, value]) => !value.trim());
    if (missing) {
      setValidationError("Complete every structured sample field before saving this preview draft.");
      return;
    }
    if (!applyTransition("save_draft")) return;
    setSavedDraft(draft);
    setEditing(false);
    setMessage("Sample draft saved for this in-memory preview. Refreshing the page will discard it.");
  }

  function discardEdits() {
    setDraft(savedDraft);
    setEditing(false);
    setValidationError("");
    setMessage("Unsaved preview edits were discarded.");
  }

  function submitForReview() {
    if (isEditing || hasUnsavedEdits || !applyTransition("submit_review")) return;
    setMessage("Submitted for demo review in this page session only. No clinical system was updated.");
  }

  function requestRevision() {
    if (isEditing || hasUnsavedEdits || !applyTransition("request_revision")) return;
    setEditing(true);
    setMessage("Demo revision requested. Update the structured fields and save a new sample draft.");
  }

  function openApproval() {
    if (isEditing || hasUnsavedEdits || !canTransitionReport(workflow, "approve")) return;
    setConfirmingApproval(true);
  }

  function approveDemo() {
    if (!applyTransition("approve")) return;
    setConfirmingApproval(false);
    setEditing(false);
    setMessage("Approved in demo only. This is not medical verification, a signature, or durable persistence.");
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(`Synthetic sample report ${report.id}\n${savedDraft.notes}`);
      setCopied(true);
      setMessage("Synthetic sample notes copied. Do not place real patient information in this prototype.");
    } catch {
      setMessage("Copy is unavailable in this browser.");
    }
  }

  return (
    <>
      <TopIntro eyebrow="CLINICAL DOCUMENTATION" title="Clinical report review" description="Review one supplied synthetic report through a physician-led local demo workflow." />
      <div className="workspace-heading">
        <div><h2>Clinical Report Review</h2><p>Physician review · In-session demonstration state</p></div>
        <span className="demo-badge"><Sparkles size={14} /> AI-assisted sample · not connected</span>
      </div>

      <div className="report-columns">
        <div className="report-primary">
          <div className="patient-banner">
            <div className="patient-banner-main">
              <small>SYNTHETIC PATIENT ENCOUNTER</small><h2>{report.patientLabel}</h2>
              <div className="patient-banner-tags"><span>{report.encounterId}</span><span>{report.department}</span><span>{report.setting}</span></div>
              <p>Consulting physician: {report.doctorName} · {report.consultationTime}</p>
            </div>
            <span className={`review-badge workflow-${workflow}`}>{workflowLabel[workflow]}</span>
          </div>

          <section className="surface-panel report-panel">
            <SectionHeading title="Clinical documentation" subtitle="Synthetic wording requiring physician review against source records" right={<span className="neutral-chip">Physician review required</span>} />
            <div className="report-block">
              {isEditing ? (
                <div className="report-edit-grid">
                  <ReportField label="Chief complaint" value={draft.chiefComplaint} onChange={(value) => updateField("chiefComplaint", value)} />
                  <ReportField label="S — Subjective" value={draft.subjective} onChange={(value) => updateField("subjective", value)} />
                  <ReportField label="O — Objective" value={draft.objective} onChange={(value) => updateField("objective", value)} />
                  <ReportField label="A — Assessment" value={draft.assessment} onChange={(value) => updateField("assessment", value)} />
                  <ReportField label="P — Plan" value={draft.plan} onChange={(value) => updateField("plan", value)} />
                  <ReportField label="Clinical report notes" value={draft.notes} onChange={(value) => updateField("notes", value)} rows={5} />
                  {validationError && <p className="field-error" role="alert">{validationError}</p>}
                  <div className="edit-actions">
                    <button className="btn-secondary" type="button" onClick={discardEdits}><X size={16} /> Discard unsaved edits</button>
                    <button className="btn-primary" type="button" onClick={saveDraft}><Save size={16} /> Save sample draft</button>
                  </div>
                </div>
              ) : (
                <>
                  <ReportPart label="Chief complaint" value={savedDraft.chiefComplaint} />
                  <ReportPart label="S — Subjective" value={savedDraft.subjective} />
                  <ReportPart label="O — Objective" value={savedDraft.objective} />
                  <ReportPart label="A — Assessment" value={savedDraft.assessment} />
                  <ReportPart label="P — Plan" value={savedDraft.plan} />
                  <div className="report-coding">
                    <h3>Clinical coding</h3>
                    {report.coding.map((item) => <div className="coding-row" key={item.type}><span>{item.type}</span><span className="verify-chip">{item.status}</span></div>)}
                    <p>Automated coding verification is not connected.</p>
                  </div>
                  <div className="report-notes">
                    <div className="report-notes-head"><h3>Clinical report notes</h3><span className="neutral-chip">Synthetic sample</span></div>
                    <p>{savedDraft.notes}</p>
                    <button className="outline-full-button" type="button" onClick={startEditing} disabled={workflow === "approved"}><Pencil size={16} /> Edit structured report</button>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="surface-panel">
            <SectionHeading title="Demo review workflow" subtitle="Permitted transitions apply only to this page session" />
            <ol className="workflow-strip" aria-label="Report workflow">
              <li className={workflow === "draft" || workflow === "needs_revision" ? "active" : ""}>Draft</li>
              <li className={workflow === "awaiting_review" ? "active" : ""}>Physician review</li>
              <li className={workflow === "approved" ? "active" : ""}>Approved in demo</li>
            </ol>
            <div className="action-grid">
              <button className="btn-secondary" type="button" onClick={startEditing} disabled={isEditing || workflow === "approved"}><ClipboardPenLine size={17} /> Edit report</button>
              <button className="btn-secondary" type="button" onClick={submitForReview} disabled={isEditing || hasUnsavedEdits || !canTransitionReport(workflow, "submit_review")}><ShieldCheck size={17} /> Submit for demo review</button>
              <button className="btn-primary" type="button" onClick={openApproval} disabled={isEditing || hasUnsavedEdits || !canTransitionReport(workflow, "approve")}><CircleCheck size={17} /> Approve in demo</button>
              <button className="btn-secondary" type="button" onClick={requestRevision} disabled={isEditing || hasUnsavedEdits || !canTransitionReport(workflow, "request_revision")}><RotateCcw size={17} /> Request demo revision</button>
            </div>
            {message && <div className="preview-message" role="status" aria-live="polite"><ShieldCheck size={16} />{message}</div>}
          </section>

          <section className="surface-panel rating-panel">
            <SectionHeading title="Rate sample AI output" subtitle="Optional in-memory feedback; nothing is sent to a server" />
            <p>How useful was this synthetic documentation for interface review?</p>
            <div className="rating-row">
              {[1, 2, 3, 4, 5].map((value) => (
                <button className={rating === value ? "chosen" : ""} type="button" key={value} onClick={() => { setRating(value); setMessage(`Saved a ${value}/5 rating in this page session.`); }} aria-label={`Rate ${value} out of 5`} aria-pressed={rating === value}>{value}</button>
              ))}
              {rating && <span><Star size={16} /> {rating}/5 · In-memory preview</span>}
            </div>
          </section>
        </div>

        <aside className="report-aside" aria-label="Report review context">
          <div className="surface-panel review-aside">
            <div className="review-icon"><ShieldCheck size={21} /></div><h3>Physician verification</h3>
            <p>Generated medical text must be checked against source records by an authorized clinician before real-world use.</p>
            <div className="review-checklist"><div><CircleCheck size={16} /> Check encounter identity</div><div><CircleCheck size={16} /> Review SOAP documentation</div><div><ShieldAlert size={16} /> Validate any clinical codes</div><div><ShieldAlert size={16} /> Sign only through an audited backend</div></div>
          </div>
          <div className="surface-panel review-aside">
            <div className="review-icon"><Stethoscope size={21} /></div><h3>Clinical context</h3>
            <div className="side-detail"><span>Assigned physician</span><strong>{report.doctorName}</strong></div>
            <div className="side-detail"><span>Care setting</span><strong>{report.setting}</strong></div>
            <div className="side-detail"><span>Encounter</span><strong>{report.encounterId}</strong></div>
            <div className="side-detail"><span>Workflow</span><strong>{workflowLabel[workflow]}</strong></div>
          </div>
          <button className="copy-action" type="button" onClick={copySummary} disabled={isEditing}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copied sample notes" : "Copy synthetic notes"}</button>
        </aside>
      </div>

      <Link href={backHref} className="back-link">Back to patient encounters</Link>

      {confirmingApproval && (
        <div className="confirm-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setConfirmingApproval(false); }}>
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="approve-title" aria-describedby="approve-description">
            <div className="confirm-icon"><ShieldCheck size={22} /></div>
            <h2 id="approve-title">Approve this report in the demo?</h2>
            <p id="approve-description">This changes in-memory preview state only. It does not verify, sign, transmit, or persist a clinical document.</p>
            <div className="confirm-actions"><button ref={cancelApprovalRef} className="btn-secondary" type="button" onClick={() => setConfirmingApproval(false)}>Cancel</button><button className="btn-primary" type="button" onClick={approveDemo}>Confirm demo approval</button></div>
          </section>
        </div>
      )}
    </>
  );
}

function ReportPart({ label, value }: { label: string; value: string }) {
  return <section className="report-part"><h3>{label}</h3><p>{value}</p></section>;
}

function ReportField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label className="report-edit-field"><span>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} maxLength={2500} required /></label>;
}
