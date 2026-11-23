export type ReportWorkflowState = "draft" | "awaiting_review" | "needs_revision" | "approved";
export type ReportWorkflowEvent = "save_draft" | "submit_review" | "request_revision" | "approve";
export function canTransitionReport(state: ReportWorkflowState, event: ReportWorkflowEvent): boolean;
export function transitionReport(state: ReportWorkflowState, event: ReportWorkflowEvent): ReportWorkflowState | null;
