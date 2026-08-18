import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { type InsertUser, inventoryItems, users, warehouseAuditEvents, warehouseDocuments, warehouseOrders } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export function workspaceUserId(user: { id: number } | null | undefined) {
  return user?.id ?? 0;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("The database is not available. Please try again shortly.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date() };
  const role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : undefined);
  if (role) values.role = role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: { name: values.name, email: values.email, loginMethod: values.loginMethod, role: values.role, lastSignedIn: values.lastSignedIn } });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

type AuditTone = "teal" | "amber" | "rose" | "sky" | "emerald";
const starterOrders = [
  { externalId: "#10482", customer: "Northstar Retail", priority: "Urgent" as const, status: "Conflict" as const, sla: "18 min", valueCents: 482000, zone: "Zone A", isConflict: true },
  { externalId: "#10479", customer: "Atlas Outfitters", priority: "High" as const, status: "Picking" as const, sla: "42 min", valueCents: 218000, zone: "Cold chain", isConflict: false },
  { externalId: "#10477", customer: "Canyon & Co.", priority: "Standard" as const, status: "Allocated" as const, sla: "1h 08m", valueCents: 96000, zone: "Zone B", isConflict: false },
  { externalId: "#10474", customer: "Morrow Supply", priority: "Standard" as const, status: "Packing" as const, sla: "1h 26m", valueCents: 142000, zone: "High-value", isConflict: false },
  { externalId: "#10469", customer: "Harbor Office", priority: "High" as const, status: "Created" as const, sla: "1h 41m", valueCents: 272000, zone: "Zone C", isConflict: false },
];

async function ensureStarterWorkspace(userId: number) {
  const db = await requireDb();
  const existing = await db.select({ id: warehouseOrders.id }).from(warehouseOrders).where(eq(warehouseOrders.userId, userId)).limit(1);
  if (existing.length) return;
  await db.insert(warehouseOrders).values(starterOrders.map(order => ({ ...order, userId })));
  await db.insert(inventoryItems).values([
    { userId, sku: "SKU-X", name: "Core assembly", quantity: 7, requiredQuantity: 10, reorderLevel: 12, zone: "Zone A" },
    { userId, sku: "SKU-CF-90", name: "Cold-chain insert", quantity: 12, requiredQuantity: 48, reorderLevel: 18, zone: "Cold chain" },
    { userId, sku: "SKU-XR", name: "Compatible substitute", quantity: 34, requiredQuantity: 34, reorderLevel: 10, zone: "Zone B" },
  ]);
  await db.insert(warehouseAuditEvents).values([
    { userId, action: "Conflict detected", detail: "SKU-X is three units short for urgent order #10482.", tone: "rose" },
    { userId, action: "Pick wave released", detail: "42 active picks sent to Zone A and Cold chain.", tone: "sky" },
    { userId, action: "Reorder confirmed", detail: "SKU-CF-90 replenishment is due at 10:30.", tone: "amber" },
  ]);
}

export async function getWarehouseSnapshot(userId: number) {
  await ensureStarterWorkspace(userId);
  const db = await requireDb();
  const [orders, inventory, audit, documents] = await Promise.all([
    db.select().from(warehouseOrders).where(eq(warehouseOrders.userId, userId)).orderBy(desc(warehouseOrders.isConflict), desc(warehouseOrders.updatedAt)),
    db.select().from(inventoryItems).where(eq(inventoryItems.userId, userId)).orderBy(inventoryItems.sku),
    db.select().from(warehouseAuditEvents).where(eq(warehouseAuditEvents.userId, userId)).orderBy(desc(warehouseAuditEvents.createdAt)).limit(30),
    db.select().from(warehouseDocuments).where(eq(warehouseDocuments.userId, userId)).orderBy(desc(warehouseDocuments.createdAt)).limit(30),
  ]);
  return { orders, inventory, audit, documents };
}

export async function createAuditEvent(userId: number, action: string, detail: string, tone: AuditTone = "teal") {
  const db = await requireDb();
  await db.insert(warehouseAuditEvents).values({ userId, action, detail, tone });
}

export async function advanceWarehouseOrder(userId: number, orderId: number) {
  const db = await requireDb();
  const order = (await db.select().from(warehouseOrders).where(and(eq(warehouseOrders.id, orderId), eq(warehouseOrders.userId, userId))).limit(1))[0];
  if (!order) throw new Error("Order not found.");
  if (order.isConflict) throw new Error("Resolve the allocation conflict before advancing this order.");
  const flow = ["Created", "Allocated", "Picking", "Packing", "Quality check", "Dispatched"] as const;
  const index = flow.indexOf(order.status as (typeof flow)[number]);
  if (index === -1 || order.status === "Dispatched") throw new Error("This order cannot be advanced further.");
  const nextStatus = flow[index + 1];
  await db.update(warehouseOrders).set({ status: nextStatus, sla: "Updated now" }).where(and(eq(warehouseOrders.id, orderId), eq(warehouseOrders.userId, userId)));
  await createAuditEvent(userId, "Order advanced", `${order.externalId} moved from ${order.status.toLowerCase()} to ${nextStatus.toLowerCase()}.`);
  return nextStatus;
}

export async function resolveWarehouseConflict(userId: number, orderId: number, option: "reallocate" | "backorder" | "substitute" | "escalate") {
  const db = await requireDb();
  const order = (await db.select().from(warehouseOrders).where(and(eq(warehouseOrders.id, orderId), eq(warehouseOrders.userId, userId))).limit(1))[0];
  if (!order) throw new Error("Order not found.");
  const status = option === "backorder" ? "Backordered" : option === "escalate" ? "Conflict" : "Allocated";
  const conflictOpen = option === "escalate";
  await db.update(warehouseOrders).set({ status, isConflict: conflictOpen, sla: conflictOpen ? "Escalated" : "SLA protected" }).where(and(eq(warehouseOrders.id, orderId), eq(warehouseOrders.userId, userId)));
  const label = { reallocate: "Protect urgent SLA", backorder: "Backorder the shortfall", substitute: "Offer a close substitute", escalate: "Hold and escalate" }[option];
  await createAuditEvent(userId, `Decision applied — ${label}`, `${order.externalId} moved to ${status.toLowerCase()}.`, option === "escalate" ? "rose" : "emerald");
  return { status, conflictOpen };
}

export async function reorderInventoryItem(userId: number, inventoryId: number) {
  const db = await requireDb();
  const item = (await db.select().from(inventoryItems).where(and(eq(inventoryItems.id, inventoryId), eq(inventoryItems.userId, userId))).limit(1))[0];
  if (!item) throw new Error("Inventory item not found.");
  const incoming = Math.max(item.reorderLevel * 4, 120);
  await db.update(inventoryItems).set({ quantity: sql`${inventoryItems.quantity} + ${incoming}` }).where(and(eq(inventoryItems.id, inventoryId), eq(inventoryItems.userId, userId)));
  await createAuditEvent(userId, "Reorder created", `Purchase request created for ${incoming} units of ${item.sku}.`, "amber");
  return { sku: item.sku, incoming };
}

export async function createWarehouseDocument(input: { userId: number; orderId?: number | null; fileName: string; mimeType: string; sizeBytes: number; storageKey: string; storageUrl: string }) {
  const db = await requireDb();
  const values = { ...input, orderId: input.orderId ?? null };
  const result = await db.insert(warehouseDocuments).values(values);
  await createAuditEvent(input.userId, "Document stored", `${input.fileName} was uploaded to warehouse storage.`, "sky");
  return { id: Number(result[0].insertId), ...values };
}
