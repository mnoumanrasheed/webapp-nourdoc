import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoAdmin, demoDoctor } from "./demo-data";
import type { Role, SessionUser } from "./types";

const COOKIE_NAME = "nourdoc_demo_session";
const SESSION_SECONDS = 8 * 60 * 60;
type Payload = { userId: string; role: Role; hospitalId: string; doctorId?: string; exp: number };

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain 32 or more characters");
  return secret;
}
function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}
function parseToken(token: string): Payload | null {
  try {
    const [payload64, signature, extra] = token.split(".");
    if (!payload64 || !signature || extra) return null;
    const expected = Buffer.from(sign(payload64), "utf8");
    const actual = Buffer.from(signature, "utf8");
    if (expected.length !== actual.length || !timingSafeEqual(actual, expected)) return null;
    const parsed: Payload = JSON.parse(Buffer.from(payload64, "base64url").toString("utf8"));
    if (!Number.isSafeInteger(parsed.exp) || Date.now() > parsed.exp) return null;
    if (parsed.role !== "hospital_admin" && parsed.role !== "doctor") return null;
    if (parsed.hospitalId !== demoAdmin.hospitalId) return null;
    return parsed;
  } catch { return null; }
}
export async function createDemoSession(role: Role): Promise<void> {
  const user = role === "hospital_admin" ? demoAdmin : demoDoctor;
  const payload: Payload = { userId: user.userId, role: user.role, hospitalId: user.hospitalId, doctorId: user.doctorId, exp: Date.now() + SESSION_SECONDS * 1000 };
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  (await cookies()).set(COOKIE_NAME, `${b64}.${sign(b64)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_SECONDS,
  });
}
export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
export async function getSessionUser(): Promise<SessionUser | null> {
  if (process.env.DEMO_MODE !== "true") return null;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const payload = token && parseToken(token);
  if (!payload) return null;
  // Resolve role and scope server-side from an allowlist, not from arbitrary browser input.
  const matched = [demoAdmin, demoDoctor].find(user => user.userId === payload.userId && user.role === payload.role && user.hospitalId === payload.hospitalId && user.doctorId === payload.doctorId);
  return matched ?? null;
}
export async function requireRole(role: Role): Promise<SessionUser> {
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
