import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export function validatePassword(password: string) {
  if (password.length < 12) throw new Error("Use a password with at least 12 characters.");
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Use upper-case, lower-case, and numeric characters in your password.");
  }
}

export async function hashPassword(password: string) {
  validatePassword(password);
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPasswordHash(password: string, passwordHash: string) {
  const [salt, expected] = passwordHash.split(":");
  if (!salt || !expected) return false;
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const expectedKey = Buffer.from(expected, "hex");
  return expectedKey.length === derivedKey.length && timingSafeEqual(expectedKey, derivedKey);
}
