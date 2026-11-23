import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resolveDemoIdentity } from "./auth/demo-accounts";
import { createSessionToken, SESSION_TTL_MS, verifySessionToken } from "./auth/session-token.mjs";
import { demoAdmin, demoDoctor } from "./demo-data";
import type { Role, SessionUser } from "./types";

const COOKIE_NAME = "nourdoc_demo_session";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain 32 or more characters.");
  return secret;
}

export function isSecureRequest(request: Request): boolean {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return new URL(request.url).protocol === "https:" || forwardedProtocol === "https";
}

export async function createDemoSession(user: SessionUser, secure: boolean): Promise<void> {
  if (process.env.DEMO_MODE !== "true") throw new Error("Demo mode is disabled.");
  const token = createSessionToken(user.userId, getSecret());
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    priority: "high",
  });
}

export async function clearSession(secure = false): Promise<void> {
  try {
    (await cookies()).set(COOKIE_NAME, "", {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  } catch {
    // harmless in environments without active cookie store
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  // If authenticated mode is explicitly enabled, verify server token
  if (process.env.AUTHENTICATED_MODE === "true") {
    try {
      const token = (await cookies()).get(COOKIE_NAME)?.value;
      if (!token) return null;
      const claims = verifySessionToken(token, getSecret());
      return claims ? resolveDemoIdentity(claims.sub) : null;
    } catch {
      return null;
    }
  }
  // In UI-first prototype mode, return null to allow free role exploration on entry
  return null;
}

export async function requireRole(role: Role): Promise<SessionUser> {
  // In UI-first prototype mode, resolve the mock viewer identity for the selected route
  if (process.env.AUTHENTICATED_MODE !== "true") {
    return role === "doctor" ? demoDoctor : demoAdmin;
  }
  // Production integration boundary (disabled by default)
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect(user.role === "doctor" ? "/doctor/dashboard" : "/hospital/dashboard");
  return user;
}

export async function requireDoctorReport(id: string) {
  const user = await requireRole("doctor");
  const { getWorkspaceRepository } = await import("./repositories");
  const report = await getWorkspaceRepository().getClinicalReport(user, id);
  return { user, report };
}
