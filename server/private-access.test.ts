import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getPrivateProfile: vi.fn() }));

vi.mock("./db", () => ({
  advanceWarehouseOrder: vi.fn(),
  createPasswordAccount: vi.fn(),
  getPrivateProfile: mocks.getPrivateProfile,
  getWarehouseSnapshot: vi.fn(),
  listIndianRegions: vi.fn(),
  reorderInventoryItem: vi.fn(),
  resolveWarehouseConflict: vi.fn(),
  updatePrivateProfile: vi.fn(),
  verifyPasswordAccount: vi.fn(),
}));

import { appRouter } from "./routers";

const authenticatedContext = {
  user: { id: 42, openId: "local-42", name: "Owner", email: "owner@example.com", loginMethod: "password", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", headers: {} },
  res: { cookie: vi.fn(), clearCookie: vi.fn() },
} as any;

describe("private account access", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads a profile only for the authenticated account owner", async () => {
    mocks.getPrivateProfile.mockResolvedValue({ user: { id: 42, name: "Owner" }, profile: { userId: 42 } });
    const caller = appRouter.createCaller(authenticatedContext);
    await expect(caller.auth.profile()).resolves.toMatchObject({ profile: { userId: 42 } });
    expect(mocks.getPrivateProfile).toHaveBeenCalledWith(42);
  });

  it("rejects anonymous callers before private profile data is queried", async () => {
    const caller = appRouter.createCaller({ ...authenticatedContext, user: null });
    await expect(caller.auth.profile()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mocks.getPrivateProfile).not.toHaveBeenCalled();
  });
});
