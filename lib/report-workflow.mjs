const transitions = {
  save_draft: { draft: "draft", awaiting_review: "draft", needs_revision: "draft" },
  submit_review: { draft: "awaiting_review", needs_revision: "awaiting_review" },
  request_revision: { awaiting_review: "needs_revision" },
  approve: { awaiting_review: "approved" },
};

export function canTransitionReport(state, event) {
  return Boolean(transitions[event]?.[state]);
}

export function transitionReport(state, event) {
  return transitions[event]?.[state] ?? null;
}
