import { describe, expect, it } from "vitest";
import { hashPassword, verifyPasswordHash } from "./password";

describe("password hashing", () => {
  it("creates a non-plaintext hash that validates only the original password", async () => {
    const plainPassword = "WarehousePilot2026";
    const passwordHash = await hashPassword(plainPassword);

    expect(passwordHash).not.toContain(plainPassword);
    await expect(verifyPasswordHash(plainPassword, passwordHash)).resolves.toBe(true);
    await expect(verifyPasswordHash("IncorrectPassword2026", passwordHash)).resolves.toBe(false);
  });

  it("requires a sufficiently strong password", async () => {
    await expect(hashPassword("ShortPass1!")).rejects.toThrow("at least 12 characters");
  });
});
