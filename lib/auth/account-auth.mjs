import { verifyPasswordHash } from "./password-core.mjs";

export async function authenticateConfiguredAccount(accounts, identifier, password, dummyHash) {
  if (!Array.isArray(accounts) || typeof identifier !== "string" || typeof password !== "string") return null;
  if (!identifier.trim() || !password || identifier.length > 254 || password.length > 256) return null;
  const normalized = identifier.trim().toLowerCase();
  const matched = accounts.find((account) => account.identifier === normalized);
  const valid = await verifyPasswordHash(password, matched?.passwordHash ?? dummyHash);
  return matched && valid ? matched : null;
}
