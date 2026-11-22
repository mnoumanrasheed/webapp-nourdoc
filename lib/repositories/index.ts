import { mockWorkspaceRepository } from "./mock-workspace-repository";
import type { WorkspaceRepository } from "./workspace-repository";

export type { DemoReportTransition, DemoWriteResult, ReportDraftInput, WorkspaceRepository } from "./workspace-repository";

export function getWorkspaceRepository(): WorkspaceRepository {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? "mock";
  if (mode === "mock") return mockWorkspaceRepository;
  throw new Error(`Unsupported data mode "${mode}". Supply verified API contracts before enabling API mode.`);
}
