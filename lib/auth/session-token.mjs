import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function signature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(subject, secret, now = Date.now()) {
  if (typeof subject !== "string" || !subject || typeof secret !== "string" || secret.length < 32) {
    throw new Error("A valid demo identity and 32+ character session secret are required.");
  }
  const claims = { sub: subject, iat: now, exp: now + SESSION_TTL_MS, v: 1 };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

export function verifySessionToken(token, secret, now = Date.now()) {
  if (typeof token !== "string" || typeof secret !== "string" || secret.length < 32) return null;
  try {
    const [payload, suppliedSignature, extra] = token.split(".");
    if (!payload || !suppliedSignature || extra) return null;
    const expected = Buffer.from(signature(payload, secret), "utf8");
    const actual = Buffer.from(suppliedSignature, "utf8");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    if (parsed.v !== 1 || typeof parsed.sub !== "string" || !parsed.sub) return null;
    if (!Number.isSafeInteger(parsed.iat) || !Number.isSafeInteger(parsed.exp)) return null;
    if (parsed.iat > now + 60_000 || parsed.exp <= now || parsed.exp - parsed.iat !== SESSION_TTL_MS) return null;
    return { sub: parsed.sub, iat: parsed.iat, exp: parsed.exp, v: 1 };
  } catch {
    return null;
  }
}
