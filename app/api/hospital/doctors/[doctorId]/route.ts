import { NextResponse } from "next/server";
import { apiUser, isErrorResponse, noStore } from "@/lib/api";
import { getWorkspaceRepository } from "@/lib/repositories";

export async function GET(_request: Request, { params }: { params: Promise<{ doctorId: string }> }) {
  const user = await apiUser("hospital_admin");
  if (isErrorResponse(user)) return user;
  const { doctorId } = await params;
  const repository = getWorkspaceRepository();
  const doctor = await repository.getHospitalDoctor(user.hospitalId, doctorId);
  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404, headers: noStore });
  return NextResponse.json(doctor, { headers: noStore });
}
