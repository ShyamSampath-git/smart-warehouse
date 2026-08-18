import { describe, expect, it } from "vitest";
import { apiErrorMessage } from "./apiError";

describe("apiErrorMessage", () => {
  it("explains a failed transport without claiming the mutation was saved", () => {
    expect(apiErrorMessage(new Error("Failed to fetch"))).toBe("The warehouse service is temporarily unreachable. Your action was not submitted; please try again in a moment.");
  });

  it("leaves application errors to their specific mutation handlers", () => {
    expect(apiErrorMessage(new Error("Invalid profile details"))).toBeNull();
  });
});
