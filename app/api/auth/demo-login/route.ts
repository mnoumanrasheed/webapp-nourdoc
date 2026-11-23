import { NextRequest, NextResponse } from "next/server";
import { authenticateDemoAccount, DemoAuthConfigurationError } from "@/lib/auth/demo-accounts";
import { checkLoginRateLimit, clearLoginFailures, recordLoginFailure } from "@/lib/auth/rate-limit";
import { hasValidRequestOrigin, noStoreHeaders } from "@/lib/auth/request";
import { createDemoSession, isSecureRequest } from "@/lib/session";

const GENERIC_FAILURE = "Sign-in failed. Check your email and password.";

export async function POST(request: NextRequest) {
  if (process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ error: "Demo sign-in is unavailable." }, { status: 404, headers: noStoreHeaders });
  }
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStoreHeaders });
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: GENERIC_FAILURE }, { status: 400, headers: noStoreHeaders });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: GENERIC_FAILURE }, { status: 400, headers: noStoreHeaders });
  }

  const identifier = typeof (body as { identifier?: unknown })?.identifier === "string"
    ? (body as { identifier: string }).identifier.trim()
    : "";
  const password = typeof (body as { password?: unknown })?.password === "string"
    ? (body as { password: string }).password
    : "";
  if (!identifier || !password || identifier.length > 254 || password.length > 256) {
    return NextResponse.json({ error: GENERIC_FAILURE }, { status: 400, headers: noStoreHeaders });
  }

  const network = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limitKey = `${network}|${identifier.toLowerCase()}`;
  const limit = checkLoginRateLimit(limitKey);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait and try again." },
      { status: 429, headers: { ...noStoreHeaders, "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const user = await authenticateDemoAccount(identifier, password);
    if (!user) {
      recordLoginFailure(limitKey);
      return NextResponse.json({ error: GENERIC_FAILURE }, { status: 401, headers: noStoreHeaders });
    }
    clearLoginFailures(limitKey);
    await createDemoSession(user, isSecureRequest(request));
    return NextResponse.json(
      { destination: user.role === "doctor" ? "/doctor/dashboard" : "/hospital/dashboard" },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    if (error instanceof DemoAuthConfigurationError) {
      return NextResponse.json(
        { error: "Demo credentials are not configured. Run npm run setup:demo-auth." },
        { status: 503, headers: noStoreHeaders },
      );
    }
    return NextResponse.json({ error: "Demo sign-in is temporarily unavailable." }, { status: 503, headers: noStoreHeaders });
  }
}
