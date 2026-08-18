import { and, desc, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { type InsertUser, inventoryItems, passwordCredentials, userProfiles, users, warehouseAuditEvents, warehouseDocuments, warehouseOrders, warehouseRegions } from "../drizzle/schema";
import { hashPassword, verifyPasswordHash } from "./password";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let regionsSeeded = false;

export function workspaceUserId(user: { id: number } | null | undefined) {
  if (!user) throw new Error("Sign in to access this private workspace.");
  return user.id;
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

const indianRegions = [
  { code: "IN-W-MUM", hubName: "Mumbai West Hub", city: "Mumbai", state: "Maharashtra" },
  { code: "IN-S-BLR", hubName: "Bengaluru South Hub", city: "Bengaluru", state: "Karnataka" },
  { code: "IN-N-DEL", hubName: "Delhi NCR Hub", city: "New Delhi", state: "Delhi NCR" },
  { code: "IN-S-CHN", hubName: "Chennai Coast Hub", city: "Chennai", state: "Tamil Nadu" },
  { code: "IN-E-KOL", hubName: "Kolkata East Hub", city: "Kolkata", state: "West Bengal" },
  { code: "IN-W-AHM", hubName: "Ahmedabad Trade Hub", city: "Ahmedabad", state: "Gujarat" },
];

async function ensureIndianRegions() {
  if (regionsSeeded) return;
  const db = await requireDb();
  for (const region of indianRegions) {
    await db.insert(warehouseRegions).values(region).onDuplicateKeyUpdate({ set: { hubName: region.hubName, city: region.city, state: region.state, isActive: true } });
  }
  regionsSeeded = true;
}

function normalizeEmail(email: string) { return email.trim().toLowerCase(); }

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  if (user.name !== undefined) {
    values.name = user.name;
    updateSet.name = user.name;
  }
  if (user.email !== undefined) {
    const email = user.email ? normalizeEmail(user.email) : null;
    values.email = email;
    updateSet.email = email;
  }
  if (user.loginMethod !== undefined) {
    values.loginMethod = user.loginMethod;
    updateSet.loginMethod = user.loginMethod;
  }
  const role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : undefined);
  if (role) {
    values.role = role;
    updateSet.role = role;
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

async function getUserById(userId: number) {
  const db = await requireDb();
  return (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
}

export async function createPasswordAccount(input: { name: string; email: string; password: string; preferredRegionCode?: string }) {
  const db = await requireDb();
  await ensureIndianRegions();
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  if (name.length < 2 || name.length > 120) throw new Error("Enter a name between 2 and 120 characters.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  const existing = await db.select({ id: passwordCredentials.id }).from(passwordCredentials).where(eq(passwordCredentials.email, email)).limit(1);
  if (existing.length) throw new Error("An account already exists for this email address.");
  const regionCode = input.preferredRegionCode || "IN-W-MUM";
  const region = await db.select({ code: warehouseRegions.code }).from(warehouseRegions).where(eq(warehouseRegions.code, regionCode)).limit(1);
  if (!region.length) throw new Error("Choose a valid Indian warehouse region.");
  const passwordHash = await hashPassword(input.password);
  const result = await db.insert(users).values({ openId: `local_${randomUUID()}`, name, email, loginMethod: "password", role: "user", lastSignedIn: new Date() });
  const userId = Number(result[0].insertId);
  await db.insert(passwordCredentials).values({ userId, email, passwordHash });
  await db.insert(userProfiles).values({ userId, preferredRegionCode: regionCode, timeZone: "Asia/Kolkata", dataVisibility: "private" });
  await ensureStarterWorkspace(userId, regionCode);
  const user = await getUserById(userId);
  if (!user) throw new Error("Account could not be created.");
  return user;
}

export async function verifyPasswordAccount(emailInput: string, password: string) {
  const db = await requireDb();
  const email = normalizeEmail(emailInput);
  const credential = (await db.select().from(passwordCredentials).where(eq(passwordCredentials.email, email)).limit(1))[0];
  if (!credential || !(await verifyPasswordHash(password, credential.passwordHash))) throw new Error("Email or password is incorrect.");
  const user = await getUserById(credential.userId);
  if (!user) throw new Error("Account is unavailable.");
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
  return user;
}

async function ensureProfile(userId: number) {
  await ensureIndianRegions();
  const db = await requireDb();
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(userProfiles).values({ userId, preferredRegionCode: "IN-W-MUM", timeZone: "Asia/Kolkata", dataVisibility: "private" });
  return (await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1))[0]!;
}

export async function getPrivateProfile(userId: number) {
  const db = await requireDb();
  const [user, profile, credential] = await Promise.all([
    getUserById(userId),
    ensureProfile(userId),
    db.select({ email: passwordCredentials.email }).from(passwordCredentials).where(eq(passwordCredentials.userId, userId)).limit(1),
  ]);
  if (!user) throw new Error("User not found.");
  return { user: { id: user.id, name: user.name, email: user.email || credential[0]?.email || null, role: user.role }, profile };
}

export async function updatePrivateProfile(userId: number, input: { name: string; preferredRegionCode: string; operationalNotifications: boolean }) {
  const db = await requireDb();
  const name = input.name.trim();
  if (name.length < 2 || name.length > 120) throw new Error("Enter a name between 2 and 120 characters.");
  await ensureIndianRegions();
  const region = await db.select({ code: warehouseRegions.code }).from(warehouseRegions).where(and(eq(warehouseRegions.code, input.preferredRegionCode), eq(warehouseRegions.isActive, true))).limit(1);
  if (!region.length) throw new Error("Choose an active Indian warehouse region.");
  await db.update(users).set({ name }).where(eq(users.id, userId));
  await db.update(userProfiles).set({ preferredRegionCode: input.preferredRegionCode, operationalNotifications: input.operationalNotifications }).where(eq(userProfiles.userId, userId));
  return getPrivateProfile(userId);
}

export async function listIndianRegions() {
  await ensureIndianRegions();
  const db = await requireDb();
  return db.select().from(warehouseRegions).where(eq(warehouseRegions.isActive, true)).orderBy(warehouseRegions.city);
}

type AuditTone = "teal" | "amber" | "rose" | "sky" | "emerald";
const starterOrders = [
  { externalId: "#IN-10482", customer: "Aarav Retail Network", priority: "Urgent" as const, status: "Conflict" as const, sla: "18 min", valueCents: 4820000, zone: "Mumbai · MH", regionCode: "IN-W-MUM", isConflict: true },
  { externalId: "#IN-10479", customer: "Namma Outfitters", priority: "High" as const, status: "Picking" as const, sla: "42 min", valueCents: 2180000, zone: "Bengaluru · KA", regionCode: "IN-S-BLR", isConflict: false },
  { externalId: "#IN-10477", customer: "Capital Commerce", priority: "Standard" as const, status: "Allocated" as const, sla: "1h 08m", valueCents: 960000, zone: "Delhi NCR", regionCode: "IN-N-DEL", isConflict: false },
  { externalId: "#IN-10474", customer: "Bayline Supply", priority: "Standard" as const, status: "Packing" as const, sla: "1h 26m", valueCents: 1420000, zone: "Chennai · TN", regionCode: "IN-S-CHN", isConflict: false },
  { externalId: "#IN-10469", customer: "Eastern Office Co.", priority: "High" as const, status: "Created" as const, sla: "1h 41m", valueCents: 2720000, zone: "Kolkata · WB", regionCode: "IN-E-KOL", isConflict: false },
];

async function ensureStarterWorkspace(userId: number, preferredRegionCode = "IN-W-MUM") {
  const db = await requireDb();
  const existing = await db.select({ id: warehouseOrders.id }).from(warehouseOrders).where(eq(warehouseOrders.userId, userId)).limit(1);
  if (existing.length) return;
  const firstOrder = { ...starterOrders[0], regionCode: preferredRegionCode };
  await db.insert(warehouseOrders).values([firstOrder, ...starterOrders.slice(1)].map(order => ({ ...order, userId })));
  await db.insert(inventoryItems).values([
    { userId, sku: "SKU-X", name: "Core assembly", quantity: 7, requiredQuantity: 10, reorderLevel: 12, zone: "Mumbai · MH", regionCode: preferredRegionCode },
    { userId, sku: "SKU-CF-90", name: "Cold-chain insert", quantity: 12, requiredQuantity: 48, reorderLevel: 18, zone: "Bengaluru · KA", regionCode: "IN-S-BLR" },
    { userId, sku: "SKU-XR", name: "Compatible substitute", quantity: 34, requiredQuantity: 34, reorderLevel: 10, zone: "Delhi NCR", regionCode: "IN-N-DEL" },
  ]);
  await db.insert(warehouseAuditEvents).values([
    { userId, action: "Conflict detected", detail: "SKU-X is three units short for urgent order #IN-10482 in Mumbai.", tone: "rose" },
    { userId, action: "Pick wave released", detail: "42 active picks released across Mumbai and Bengaluru hubs.", tone: "sky" },
    { userId, action: "Reorder confirmed", detail: "SKU-CF-90 replenishment is due at 10:30 IST.", tone: "amber" },
  ]);
}

export async function getWarehouseSnapshot(userId: number) {
  const profile = await ensureProfile(userId);
  await ensureStarterWorkspace(userId, profile.preferredRegionCode);
  const db = await requireDb();
  const [orders, inventory, audit, documents, regions] = await Promise.all([
    db.select().from(warehouseOrders).where(eq(warehouseOrders.userId, userId)).orderBy(desc(warehouseOrders.isConflict), desc(warehouseOrders.updatedAt)),
    db.select().from(inventoryItems).where(eq(inventoryItems.userId, userId)).orderBy(inventoryItems.sku),
    db.select().from(warehouseAuditEvents).where(eq(warehouseAuditEvents.userId, userId)).orderBy(desc(warehouseAuditEvents.createdAt)).limit(30),
    db.select().from(warehouseDocuments).where(eq(warehouseDocuments.userId, userId)).orderBy(desc(warehouseDocuments.createdAt)).limit(30),
    listIndianRegions(),
  ]);
  return { orders, inventory, audit, documents, regions, profile };
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
  if (values.orderId) {
    const ownedOrder = await db.select({ id: warehouseOrders.id }).from(warehouseOrders).where(and(eq(warehouseOrders.id, values.orderId), eq(warehouseOrders.userId, values.userId))).limit(1);
    if (!ownedOrder.length) throw new Error("The related order is not part of this private workspace.");
  }
  const result = await db.insert(warehouseDocuments).values(values);
  await createAuditEvent(input.userId, "Document stored", `${input.fileName} was uploaded to private warehouse storage.`, "sky");
  return { id: Number(result[0].insertId), ...values };
}
