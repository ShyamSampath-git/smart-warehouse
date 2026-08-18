import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { advanceWarehouseOrder, createPasswordAccount, getPrivateProfile, getWarehouseSnapshot, listIndianRegions, reorderInventoryItem, resolveWarehouseConflict, updatePrivateProfile, verifyPasswordAccount } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

function authError(error: unknown) {
  return new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Account request could not be completed." });
}

async function startLocalSession(ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { cookie: (name: string, value: string, options: Record<string, unknown>) => void } }, user: { openId: string; name: string | null }) {
  const token = await sdk.createSessionToken(user.openId, { name: user.name || "Warehouse operator" });
  ctx.res.cookie(COOKIE_NAME, token, getSessionCookieOptions(ctx.req));
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({ name: z.string(), email: z.string(), password: z.string(), preferredRegionCode: z.string().optional() })).mutation(async ({ ctx, input }) => {
      try {
        const user = await createPasswordAccount(input);
        await startLocalSession(ctx, user);
        return { id: user.id, name: user.name, email: user.email };
      } catch (error) { throw authError(error); }
    }),
    signIn: publicProcedure.input(z.object({ email: z.string(), password: z.string() })).mutation(async ({ ctx, input }) => {
      try {
        const user = await verifyPasswordAccount(input.email, input.password);
        await startLocalSession(ctx, user);
        return { id: user.id, name: user.name, email: user.email };
      } catch (error) { throw authError(error); }
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    profile: protectedProcedure.query(({ ctx }) => getPrivateProfile(ctx.user.id)),
    updateProfile: protectedProcedure.input(z.object({ name: z.string(), preferredRegionCode: z.string(), operationalNotifications: z.boolean() })).mutation(({ ctx, input }) => updatePrivateProfile(ctx.user.id, input)),
  }),
  warehouse: router({
    regions: publicProcedure.query(() => listIndianRegions()),
    snapshot: protectedProcedure.query(({ ctx }) => getWarehouseSnapshot(ctx.user.id)),
    advanceOrder: protectedProcedure.input(z.object({ orderId: z.number().int().positive() })).mutation(({ ctx, input }) => advanceWarehouseOrder(ctx.user.id, input.orderId)),
    resolveConflict: protectedProcedure.input(z.object({ orderId: z.number().int().positive(), option: z.enum(["reallocate", "backorder", "substitute", "escalate"]) })).mutation(({ ctx, input }) => resolveWarehouseConflict(ctx.user.id, input.orderId, input.option)),
    reorderInventory: protectedProcedure.input(z.object({ inventoryId: z.number().int().positive() })).mutation(({ ctx, input }) => reorderInventoryItem(ctx.user.id, input.inventoryId)),
  }),
});

export type AppRouter = typeof appRouter;
