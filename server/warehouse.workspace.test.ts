import { describe, expect, it } from "vitest";
import { workspaceUserId } from "./db";

describe("workspaceUserId", () => {
  it("uses the shared persistent workspace for unauthenticated preview visitors", () => {
    expect(workspaceUserId(null)).toBe(0);
    expect(workspaceUserId(undefined)).toBe(0);
  });

  it("uses an authenticated operator's durable workspace when a user is present", () => {
    expect(workspaceUserId({ id: 42 })).toBe(42);
  });
});
