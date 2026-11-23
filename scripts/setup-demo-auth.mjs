import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { createPasswordHash } from "../lib/auth/password-core.mjs";

const envPath = resolve(process.cwd(), ".env.local");
const existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

function updateEnvironment(source, updates) {
  const remaining = new Map(Object.entries(updates));
  const lines = source ? source.replace(/\r\n/g, "\n").split("\n") : [];
  const next = lines.map((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    if (!match || !remaining.has(match[1])) return line;
    const value = remaining.get(match[1]);
    remaining.delete(match[1]);
    return `${match[1]}=${value}`;
  });
  if (remaining.size) {
    if (next.length && next.at(-1) !== "") next.push("");
    next.push("# Local credential-protected NourDoc demonstration accounts");
    for (const [name, value] of remaining) next.push(`${name}=${value}`);
  }
  return `${next.join("\n").replace(/\n+$/, "")}\n`;
}

async function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Run this setup from an interactive terminal so passwords are not echoed.");
  }
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
  let value = "";
  return new Promise((resolvePromise, reject) => {
    function finish(error) {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
      stdout.write("\n");
      if (error) reject(error);
      else resolvePromise(value);
    }
    function onData(character) {
      if (character === "\u0003") return finish(new Error("Setup cancelled."));
      if (character === "\r" || character === "\n") return finish();
      if (character === "\u007f" || character === "\b") {
        value = value.slice(0, -1);
        return;
      }
      if (character >= " " && value.length < 256) value += character;
    }
    stdin.on("data", onData);
  });
}

async function askPassword(label) {
  const password = await readHidden(`${label} password (12+ characters): `);
  if (password.length < 12) throw new Error(`${label} password must contain at least 12 characters.`);
  const confirmation = await readHidden(`Confirm ${label.toLowerCase()} password: `);
  if (password !== confirmation) throw new Error(`${label} passwords did not match.`);
  return password;
}

function validateIdentifier(value, label) {
  const normalized = value.trim().toLowerCase();
  if (normalized.length < 3 || normalized.length > 254 || /\s/.test(normalized)) {
    throw new Error(`${label} identifier must contain 3–254 characters and no spaces.`);
  }
  return normalized;
}

const rl = createInterface({ input: stdin, output: stdout });
try {
  stdout.write("Configure local NourDoc demo identities. Passwords are hidden and only scrypt hashes are saved.\n\n");
  const adminEmail = validateIdentifier((await rl.question("Administrator email [admin@nourdoc.local]: ")).trim() || "admin@nourdoc.local", "Administrator");
  const doctorAEmail = validateIdentifier((await rl.question("Doctor A email [ahmed@nourdoc.local]: ")).trim() || "ahmed@nourdoc.local", "Doctor A");
  const doctorBEmail = validateIdentifier((await rl.question("Doctor B email [sara@nourdoc.local]: ")).trim() || "sara@nourdoc.local", "Doctor B");
  if (new Set([adminEmail, doctorAEmail, doctorBEmail]).size !== 3) throw new Error("Each demo identity must use a distinct identifier.");
  rl.close();

  const adminPassword = await askPassword("Administrator");
  const doctorAPassword = await askPassword("Doctor A");
  const doctorBPassword = await askPassword("Doctor B");
  const updates = {
    DEMO_MODE: "true",
    NEXT_PUBLIC_DATA_MODE: "mock",
    SESSION_SECRET: randomBytes(48).toString("base64url"),
    DEMO_ADMIN_EMAIL: adminEmail.toLowerCase(),
    DEMO_ADMIN_PASSWORD_HASH: await createPasswordHash(adminPassword),
    DEMO_DOCTOR_A_EMAIL: doctorAEmail.toLowerCase(),
    DEMO_DOCTOR_A_PASSWORD_HASH: await createPasswordHash(doctorAPassword),
    DEMO_DOCTOR_B_EMAIL: doctorBEmail.toLowerCase(),
    DEMO_DOCTOR_B_PASSWORD_HASH: await createPasswordHash(doctorBPassword),
  };

  writeFileSync(envPath, updateEnvironment(existing, updates), { encoding: "utf8", mode: 0o600 });
  stdout.write("\n.env.local updated with three credential-protected synthetic identities. Restart the development server.\n");
} catch (error) {
  rl.close();
  process.stderr.write(`${error instanceof Error ? error.message : "Setup failed."}\n`);
  process.exitCode = 1;
}
