import { describe, expect, it } from "vitest";
import { workspaceUserId } from "./db";

describe("workspaceUserId", () => {
  it("rejects unauthenticated access to a private workspace", () => {
    expect(() => workspaceUserId(null)).toThrow("Sign in to access this private workspace.");
    expect(() => workspaceUserId(undefined)).toThrow("Sign in to access this private workspace.");
  });

  it("uses an authenticated operator's durable workspace when a user is present", () => {
    expect(workspaceUserId({ id: 42 })).toBe(42);
  });
});
