import { NextResponse } from "next/server";
import { getSessionUser } from "./session";
import type { Role, SessionUser } from "./types";

export const noStore = { "Cache-Control": "private, no-store" };
export async function apiUser(role: Role): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers: noStore });
  if (user.role !== role) return NextResponse.json({ error: "Access denied" }, { status: 403, headers: noStore });
  return user;
}
export function isErrorResponse(value: SessionUser | NextResponse): value is NextResponse { return value instanceof NextResponse; }
