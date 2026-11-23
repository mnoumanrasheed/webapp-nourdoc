import "server-only";

import type { SessionUser } from "../types";
import { demoAdmin, demoDoctor, demoDoctorSara } from "../demo-data";
import { authenticateConfiguredAccount } from "./account-auth.mjs";
import { isSupportedPasswordHash } from "./password-core.mjs";

const DUMMY_HASH = "scrypt$16384$8$1$Tm91ckRvY0RlbW9GYWxsYmFja1NhbHQyMDI2$DqQlr_gCcaEJzSI6-l2cgHpmQWHR5bPYLfcSwwNCTfM4S5UEzk_q1o2TglERnsmpE5hIVDnjZn7io9_4XUJDGQ";

type AccountSlot = {
  identifierVariable: string;
  hashVariable: string;
  user: SessionUser;
};

type ConfiguredAccount = {
  identifier: string;
  passwordHash: string;
  user: SessionUser;
};

const accountSlots: AccountSlot[] = [
  { identifierVariable: "DEMO_ADMIN_EMAIL", hashVariable: "DEMO_ADMIN_PASSWORD_HASH", user: demoAdmin },
  { identifierVariable: "DEMO_DOCTOR_A_EMAIL", hashVariable: "DEMO_DOCTOR_A_PASSWORD_HASH", user: demoDoctor },
  { identifierVariable: "DEMO_DOCTOR_B_EMAIL", hashVariable: "DEMO_DOCTOR_B_PASSWORD_HASH", user: demoDoctorSara },
];

export class DemoAuthConfigurationError extends Error {
  constructor() {
    super("Demo authentication is not configured.");
    this.name = "DemoAuthConfigurationError";
  }
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

function configuredAccounts(): ConfiguredAccount[] {
  if (process.env.DEMO_MODE !== "true") throw new DemoAuthConfigurationError();
  const accounts = accountSlots.map(({ identifierVariable, hashVariable, user }) => {
    const identifier = normalizeIdentifier(process.env[identifierVariable] ?? "");
    const passwordHash = process.env[hashVariable] ?? "";
    if (!identifier || !isSupportedPasswordHash(passwordHash)) throw new DemoAuthConfigurationError();
    return { identifier, passwordHash, user };
  });
  if (new Set(accounts.map((account) => account.identifier)).size !== accounts.length) throw new DemoAuthConfigurationError();
  return accounts;
}

export function isDemoAuthConfigured(): boolean {
  try {
    configuredAccounts();
    return Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32);
  } catch {
    return false;
  }
}

export async function authenticateDemoAccount(identifier: string, password: string): Promise<SessionUser | null> {
  const accounts = configuredAccounts();
  const matched = await authenticateConfiguredAccount(accounts, identifier, password, DUMMY_HASH);
  return matched?.user ?? null;
}

export function resolveDemoIdentity(userId: string): SessionUser | null {
  try {
    return configuredAccounts().find((account) => account.user.userId === userId)?.user ?? null;
  } catch {
    return null;
  }
}
