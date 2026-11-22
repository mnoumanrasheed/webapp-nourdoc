import { NextResponse } from "next/server";
import { apiUser, isErrorResponse, noStore } from "@/lib/api";
import { getWorkspaceRepository } from "@/lib/repositories";

export async function GET() {
  const user = await apiUser("doctor");
  if (isErrorResponse(user)) return user;
  const repository = getWorkspaceRepository();
  return NextResponse.json(await repository.listDoctorEncounters(user), { headers: noStore });
}
