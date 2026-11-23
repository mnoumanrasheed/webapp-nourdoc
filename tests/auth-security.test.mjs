import assert from "node:assert/strict";
import test from "node:test";
import { createPasswordHash, isSupportedPasswordHash, verifyPasswordHash } from "../lib/auth/password-core.mjs";
import { authenticateConfiguredAccount } from "../lib/auth/account-auth.mjs";
import { createSessionToken, SESSION_TTL_MS, verifySessionToken } from "../lib/auth/session-token.mjs";

test("scrypt credentials use unique salts and reject wrong or missing passwords", async () => {
  const password = "local-demo-password-123";
  const first = await createPasswordHash(password);
  const second = await createPasswordHash(password);
  assert.equal(isSupportedPasswordHash(first), true);
  assert.notEqual(first, second);
  assert.equal(await verifyPasswordHash(password, first), true);
  assert.equal(await verifyPasswordHash("wrong-password", first), false);
  assert.equal(await verifyPasswordHash("", first), false);
  assert.equal(await verifyPasswordHash(password, "not-a-supported-hash"), false);
});

test("signed session tokens contain only identity claims and reject tampering", () => {
  const secret = "a-secure-local-test-secret-with-more-than-32-characters";
  const now = 1_800_000_000_000;
  const token = createSessionToken("doctor-user-demo-001", secret, now);
  const [payload, signature] = token.split(".");
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  assert.deepEqual(Object.keys(decoded).sort(), ["exp", "iat", "sub", "v"]);
  assert.equal("role" in decoded, false);
  assert.equal("hospitalId" in decoded, false);
  assert.equal("doctorId" in decoded, false);
  assert.equal(verifySessionToken(token, secret, now + 1_000)?.sub, "doctor-user-demo-001");
  assert.equal(verifySessionToken(`${payload}.${signature.slice(0, -1)}x`, secret, now), null);
  assert.equal(verifySessionToken("malformed", secret, now), null);
  assert.equal(verifySessionToken(token, secret, now + SESSION_TTL_MS), null);
});

test("configured account authentication rejects unknown, wrong, and missing credentials uniformly", async () => {
  const correctHash = await createPasswordHash("correct-local-password");
  const dummyHash = await createPasswordHash("dummy-local-password-1");
  const accounts = [{ identifier: "doctor@nourdoc.local", passwordHash: correctHash, id: "doctor-a" }];
  assert.equal((await authenticateConfiguredAccount(accounts, "DOCTOR@nourdoc.local", "correct-local-password", dummyHash))?.id, "doctor-a");
  assert.equal(await authenticateConfiguredAccount(accounts, "doctor@nourdoc.local", "wrong-password", dummyHash), null);
  assert.equal(await authenticateConfiguredAccount(accounts, "unknown@nourdoc.local", "wrong-password", dummyHash), null);
  assert.equal(await authenticateConfiguredAccount(accounts, "", "", dummyHash), null);
});
