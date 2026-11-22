"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, CircleCheck, ClipboardPenLine, Copy, Pencil, RotateCcw, Save, ShieldAlert, ShieldCheck, Sparkles, Star, Stethoscope, X } from "lucide-react";
import type { ClinicalReport } from "@/lib/types";
import { TopIntro } from "./app-shell";
import { SectionHeading } from "./ui";

type WorkflowState = "draft" | "awaiting_review" | "needs_revision" | "approved";
type DraftFields = Pick<ClinicalReport, "chiefComplaint" | "subjective" | "objective" | "assessment" | "plan" | "notes">;

const workflowLabel: Record<WorkflowState, string> = {
  draft: "Draft",
  awaiting_review: "Awaiting review",
  needs_revision: "Needs revision",
  approved: "Approved in demo",
};

export function ReportReview({ report }: { report: ClinicalReport }) {
  const initialDraft: DraftFields = { chiefComplaint: report.chiefComplaint, subjective: report.subjective, objective: report.objective, assessment: report.assessment, plan: report.plan, notes: report.notes };
  const [draft, setDraft] = useState(initialDraft);
  const [workflow, setWorkflow] = useState<WorkflowState>("awaiting_review");
  const [isEditing, setEditing] = useState(false);
  const [confirmingApproval, setConfirmingApproval] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  function updateField(field: keyof DraftFields, value: string) { setDraft(current => ({ ...current, [field]: value })); }
  function saveDraft() { setEditing(false); setWorkflow("draft"); setMessage("Draft saved in this browser preview only. No clinical system was updated."); }
  function submitForReview() { setWorkflow("awaiting_review"); setMessage("Submitted for demonstration review. This is a local workflow preview only."); }
  function requestRevision() { setWorkflow("needs_revision"); setEditing(true); setMessage("Revision requested in the local preview. Update the report and save a new draft."); }
  function approveDemo() { setWorkflow("approved"); setConfirmingApproval(false); setEditing(false); setMessage("Approved in demo mode only. This is not a signed or verified clinical document."); }
  function discardEdits() { setDraft(initialDraft); setEditing(false); setMessage("Unsaved preview edits were discarded."); }
  async function copySummary() {
    try { await navigator.clipboard.writeText(`Sample report ${report.id}\n${draft.notes}`); setCopied(true); setMessage("Demo report notes copied. Do not use this prototype for real patient information."); }
    catch { setMessage("Copy is unavailable in this browser."); }
  }

  return <>
    <TopIntro eyebrow="AI-ASSISTED CLINICAL DOCUMENTATION" title="Clinical report review" description="Inspect, refine, and validate illustrative clinical documentation in a physician-led workflow."/>
    <div className="workspace-heading"><div><h2>Clinical Report Review</h2><p>Physician review · Local demonstration workflow</p></div><span className="demo-badge"><Sparkles size={13}/> AI-generated sample</span></div>
    <div className="report-columns"><div className="report-primary">
      <div className="patient-banner"><div className="patient-banner-main"><small>PATIENT ENCOUNTER</small><h2>{report.patientLabel}</h2><div className="patient-banner-tags"><span>{report.encounterId}</span><span>{report.department}</span><span>{report.setting}</span></div><p>Consulting doctor: {report.doctorName} · {report.consultationTime}</p></div><span className={`review-badge workflow-${workflow}`}>{workflowLabel[workflow]}</span></div>
      <section className="surface-panel report-panel"><SectionHeading title="Clinical documentation" subtitle="AI-generated sample requiring clinician verification" right={<span className="ai-chip"><Sparkles size={13}/> AI-assisted draft</span>}/>
        <div className="report-block">
          {isEditing ? <div className="report-edit-grid">
            <ReportField label="Chief complaint" value={draft.chiefComplaint} onChange={value => updateField("chiefComplaint", value)}/><ReportField label="S — Subjective" value={draft.subjective} onChange={value => updateField("subjective", value)}/><ReportField label="O — Objective" value={draft.objective} onChange={value => updateField("objective", value)}/><ReportField label="A — Assessment" value={draft.assessment} onChange={value => updateField("assessment", value)}/><ReportField label="P — Plan" value={draft.plan} onChange={value => updateField("plan", value)}/><ReportField label="Clinical report notes" value={draft.notes} onChange={value => updateField("notes", value)} rows={5}/>
            <div className="edit-actions"><button className="btn-secondary" type="button" onClick={discardEdits}><X size={15}/> Discard</button><button className="btn-primary" type="button" onClick={saveDraft}><Save size={15}/> Save draft</button></div>
          </div> : <>
            <ReportPart label="Chief complaint" value={draft.chiefComplaint}/><ReportPart label="S — Subjective" value={draft.subjective}/><ReportPart label="O — Objective" value={draft.objective}/><ReportPart label="A — Assessment" value={draft.assessment}/><ReportPart label="P — Plan" value={draft.plan}/>
            <div className="report-coding"><h3>Clinical coding</h3>{report.coding.map(item => <div className="coding-row" key={item.type}><span>{item.type}</span><span className="verify-chip">{item.status}</span></div>)}</div>
            <div className="report-notes"><div className="report-notes-head"><h3>Clinical report notes</h3><span className="soft-chip">Preview only</span></div><p>{draft.notes}</p><button className="outline-full-button" type="button" onClick={() => setEditing(true)}><Pencil size={15}/> Edit structured report</button></div>
          </>}
        </div>
      </section>
      <section className="surface-panel report-actions"><SectionHeading title="Review workflow" subtitle="Every transition is local and synthetic"/>
        <div className="workflow-strip"><span className={workflow === "draft" || workflow === "needs_revision" ? "active" : ""}>Draft</span><span className={workflow === "awaiting_review" ? "active" : ""}>Physician review</span><span className={workflow === "approved" ? "active" : ""}>Approved</span></div>
        <div className="action-grid"><button className="btn-secondary" type="button" onClick={() => setEditing(true)} disabled={isEditing || workflow === "approved"}><ClipboardPenLine size={17}/> Edit report</button><button className="btn-secondary" type="button" onClick={submitForReview} disabled={isEditing || workflow === "awaiting_review" || workflow === "approved"}><ShieldCheck size={17}/> Submit for review</button><button className="btn-primary" type="button" onClick={() => setConfirmingApproval(true)} disabled={isEditing || workflow !== "awaiting_review"}><CircleCheck size={17}/> Approve in demo</button><button className="btn-secondary" type="button" onClick={requestRevision} disabled={isEditing || workflow === "approved"}><RotateCcw size={17}/> Request revision</button></div>
        {message && <div className="preview-message" role="status"><ShieldCheck size={15}/>{message}</div>}
      </section>
      <section className="surface-panel rating-panel"><SectionHeading title="Rate AI report quality" subtitle="Optional preview feedback — not sent to a server"/><p>How useful was this AI-generated documentation?</p><div className="rating-row">{[1, 2, 3, 4, 5].map(value => <button className={rating === value ? "chosen" : ""} type="button" key={value} onClick={() => { setRating(value); setMessage(`Saved a ${value}/5 rating in this local preview.`); }} aria-label={`Rate ${value} out of 5`} aria-pressed={rating === value}>{value}</button>)}{rating && <span><Star size={15}/> {rating}/5 · Local preview</span>}</div></section>
    </div>
    <aside className="report-aside"><div className="surface-panel review-aside"><div className="review-icon"><ShieldCheck size={20}/></div><h3>Physician verification</h3><p>Generated medical text must be checked against source notes by an authorized clinician before real-world use.</p><div className="review-checklist"><div><CircleCheck size={16}/> Check patient and encounter identity</div><div><CircleCheck size={16}/> Review SOAP documentation</div><div><ShieldAlert size={16}/> Validate ICD-10 / CPT codes</div><div><ShieldAlert size={16}/> Sign through an audited backend</div></div></div>
      <div className="surface-panel review-aside"><div className="review-icon"><Stethoscope size={20}/></div><h3>Clinical context</h3><div className="side-detail"><span>Assigned physician</span><strong>{report.doctorName}</strong></div><div className="side-detail"><span>Care setting</span><strong>{report.setting}</strong></div><div className="side-detail"><span>Encounter</span><strong>{report.encounterId}</strong></div><div className="side-detail"><span>Workflow</span><strong>{workflowLabel[workflow]}</strong></div></div>
      <button className="copy-action" type="button" onClick={copySummary}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied sample notes" : "Copy sample notes"}</button>
    </aside></div>
    <Link href="/doctor/encounters" className="back-link">Back to patient encounters</Link>
    {confirmingApproval && <div className="confirm-backdrop" role="presentation" onClick={() => setConfirmingApproval(false)}><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="approve-title" onClick={event => event.stopPropagation()}><div className="confirm-icon"><ShieldCheck size={22}/></div><h2 id="approve-title">Approve this demo report?</h2><p>This changes local preview state only. It does not sign, verify, transmit, or persist a clinical document.</p><div className="confirm-actions"><button className="btn-secondary" type="button" onClick={() => setConfirmingApproval(false)}>Cancel</button><button className="btn-primary" type="button" onClick={approveDemo}>Confirm demo approval</button></div></section></div>}
  </>;
}

function ReportPart({ label, value }: { label: string; value: string }) { return <div className="report-part"><label>{label}</label><p>{value}</p></div>; }
function ReportField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) { return <label className="report-edit-field"><span>{label}</span><textarea value={value} onChange={event => onChange(event.target.value)} rows={rows} maxLength={2500}/></label>; }
