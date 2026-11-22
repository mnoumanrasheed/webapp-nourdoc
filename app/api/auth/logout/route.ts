import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";
import { noStore } from "@/lib/api";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: noStore });
  await clearSession();
  return NextResponse.json({ ok: true }, { headers: noStore });
}
