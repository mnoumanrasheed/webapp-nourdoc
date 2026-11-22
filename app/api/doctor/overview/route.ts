import { NextRequest, NextResponse } from "next/server";
import { apiUser, isErrorResponse, noStore } from "@/lib/api";
import { validPeriod } from "@/lib/demo-data";
import { getWorkspaceRepository } from "@/lib/repositories";
export async function GET(request: NextRequest) {
  const user = await apiUser("doctor");
  if (isErrorResponse(user)) return user;
  const period = validPeriod(request.nextUrl.searchParams.get("period"));
  if (!period) return NextResponse.json({ error: "Invalid period" }, { status: 400, headers: noStore });
  const repository = getWorkspaceRepository();
  return NextResponse.json(await repository.getDoctorOverview(period, user), { headers: noStore });
}
