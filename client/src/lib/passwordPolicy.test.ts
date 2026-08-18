import { describe, expect, it } from "vitest";
import { passwordFieldPolicy, passwordIsStrong } from "./passwordPolicy";

describe("passwordFieldPolicy", () => {
  it("does not apply registration-only password rules to sign-in", () => {
    expect(passwordFieldPolicy("signin", "existing-password")).toEqual({
      minLength: undefined,
      showHint: false,
      showValidationMessage: false,
    });
  });

  it("keeps the strong-password policy for new registrations", () => {
    expect(passwordIsStrong("WeakPassword1")).toBe(true);
    expect(passwordFieldPolicy("register", "weakpassword")).toEqual({
      minLength: 12,
      showHint: true,
      showValidationMessage: true,
    });
  });
});
