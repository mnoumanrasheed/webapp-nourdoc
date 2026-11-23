import type { SessionUser } from "./types";

export type ShellIdentity = Pick<SessionUser, "name" | "role" | "department">;

export function toShellIdentity(user: SessionUser): ShellIdentity {
  return { name: user.name, role: user.role, department: user.department };
}
