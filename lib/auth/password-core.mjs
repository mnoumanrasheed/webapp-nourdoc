import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const ALGORITHM = "scrypt";
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

function derive(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION, maxmem: MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export function isSupportedPasswordHash(value) {
  if (typeof value !== "string") return false;
  const [algorithm, cost, blockSize, parallelization, salt, key, extra] = value.split("$");
  if (extra || algorithm !== ALGORITHM) return false;
  if (Number(cost) !== COST || Number(blockSize) !== BLOCK_SIZE || Number(parallelization) !== PARALLELIZATION) return false;
  try {
    return Buffer.from(salt, "base64url").length >= 16 && Buffer.from(key, "base64url").length === KEY_LENGTH;
  } catch {
    return false;
  }
}

export async function createPasswordHash(password) {
  if (typeof password !== "string" || password.length < 12 || password.length > 256) {
    throw new Error("Demo passwords must contain between 12 and 256 characters.");
  }
  const salt = randomBytes(24);
  const key = await derive(password, salt);
  return [ALGORITHM, COST, BLOCK_SIZE, PARALLELIZATION, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPasswordHash(password, encodedHash) {
  if (typeof password !== "string" || password.length < 1 || password.length > 256 || !isSupportedPasswordHash(encodedHash)) return false;
  const [, , , , saltValue, expectedValue] = encodedHash.split("$");
  try {
    const actual = await derive(password, Buffer.from(saltValue, "base64url"));
    const expected = Buffer.from(expectedValue, "base64url");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
