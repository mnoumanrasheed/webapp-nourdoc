import { NextResponse } from "next/server";
import { apiUser, isErrorResponse, noStore } from "@/lib/api";
import { getWorkspaceRepository } from "@/lib/repositories";

export async function GET() {
  const user = await apiUser("hospital_admin");
  if (isErrorResponse(user)) return user;
  const repository = getWorkspaceRepository();
  return NextResponse.json(await repository.listHospitalDoctors(user.hospitalId), { headers: noStore });
}
