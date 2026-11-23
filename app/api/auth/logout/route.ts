import { NextRequest, NextResponse } from "next/server";
import { hasValidRequestOrigin, noStoreHeaders } from "@/lib/auth/request";
import { clearSession, isSecureRequest } from "@/lib/session";
export async function POST(request: NextRequest) {
  if (!hasValidRequestOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStoreHeaders });
  await clearSession(isSecureRequest(request));
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
