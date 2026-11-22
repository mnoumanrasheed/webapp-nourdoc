import { NextResponse } from "next/server";
import { apiUser, isErrorResponse, noStore } from "@/lib/api";
import { getWorkspaceRepository } from "@/lib/repositories";

export async function GET(_request: Request, { params }: { params: Promise<{ encounterId: string }> }) {
  const user = await apiUser("doctor");
  if (isErrorResponse(user)) return user;
  const { encounterId } = await params;
  const repository = getWorkspaceRepository();
  const encounter = await repository.getDoctorEncounter(user, encounterId);
  if (!encounter) return NextResponse.json({ error: "Encounter not found" }, { status: 404, headers: noStore });
  return NextResponse.json(encounter, { headers: noStore });
}
