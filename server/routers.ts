import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { advanceWarehouseOrder, getWarehouseSnapshot, reorderInventoryItem, resolveWarehouseConflict, workspaceUserId } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  warehouse: router({
    snapshot: publicProcedure.query(({ ctx }) => getWarehouseSnapshot(workspaceUserId(ctx.user))),
    advanceOrder: publicProcedure.input(z.object({ orderId: z.number().int().positive() })).mutation(({ ctx, input }) => advanceWarehouseOrder(workspaceUserId(ctx.user), input.orderId)),
    resolveConflict: publicProcedure.input(z.object({ orderId: z.number().int().positive(), option: z.enum(["reallocate", "backorder", "substitute", "escalate"]) })).mutation(({ ctx, input }) => resolveWarehouseConflict(workspaceUserId(ctx.user), input.orderId, input.option)),
    reorderInventory: publicProcedure.input(z.object({ inventoryId: z.number().int().positive() })).mutation(({ ctx, input }) => reorderInventoryItem(workspaceUserId(ctx.user), input.inventoryId)),
  }),
});

export type AppRouter = typeof appRouter;
