import { NextRequest, NextResponse } from "next/server";
import { apiUser, isErrorResponse, noStore } from "@/lib/api";
import { getWorkspaceRepository } from "@/lib/repositories";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("doctor");
  if (isErrorResponse(user)) return user;
  const { id } = await params;
  const report = await getWorkspaceRepository().getClinicalReport(user, id);
  if (!report) return NextResponse.json({ error: "No report preview available for this encounter" }, { status: 404, headers: noStore });
  return NextResponse.json(report, { headers: noStore });
}
export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("doctor");
  if (isErrorResponse(user)) return user;
  const { id } = await params;
  const permitted = await getWorkspaceRepository().getClinicalReport(user, id);
  if (!permitted) return NextResponse.json({ error: "Report not found" }, { status: 404, headers: noStore });
  // Never imply clinical approval, coding, sharing or persistence without an audited backend.
  return NextResponse.json({ error: "Clinical mutations are not implemented in the demo. Connect an audited backend." }, { status: 501, headers: noStore });
}
