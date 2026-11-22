import { NextRequest, NextResponse } from "next/server";
import { createDemoSession } from "@/lib/session";
import { noStore } from "@/lib/api";

export async function POST(request: NextRequest) {
  if (process.env.DEMO_MODE !== "true") return NextResponse.json({ error: "Demo login is disabled" }, { status: 404, headers: noStore });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: noStore });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: noStore }); }
  const role = (body as { role?: unknown })?.role;
  if (role !== "hospital_admin" && role !== "doctor") return NextResponse.json({ error: "Invalid demo role" }, { status: 400, headers: noStore });
  try { await createDemoSession(role); } catch { return NextResponse.json({ error: "Configure SESSION_SECRET before using the demo" }, { status: 503, headers: noStore }); }
  return NextResponse.json({ destination: role === "doctor" ? "/doctor/dashboard" : "/hospital/dashboard" }, { headers: noStore });
}
