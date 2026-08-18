import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, table => [uniqueIndex("users_email_unique").on(table.email)]);

export const passwordCredentials = mysqlTable("passwordCredentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 512 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastChangedAt: timestamp("lastChangedAt").defaultNow().notNull(),
});

export const warehouseRegions = mysqlTable("warehouseRegions", {
  code: varchar("code", { length: 24 }).primaryKey(),
  hubName: varchar("hubName", { length: 120 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  timeZone: varchar("timeZone", { length: 64 }).default("Asia/Kolkata").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  preferredRegionCode: varchar("preferredRegionCode", { length: 24 }).default("IN-W-MUM").notNull(),
  timeZone: varchar("timeZone", { length: 64 }).default("Asia/Kolkata").notNull(),
  dataVisibility: mysqlEnum("dataVisibility", ["private"]).default("private").notNull(),
  operationalNotifications: boolean("operationalNotifications").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("user_profiles_region_idx").on(table.preferredRegionCode)]);

export const warehouseOrders = mysqlTable("warehouseOrders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  externalId: varchar("externalId", { length: 32 }).notNull(),
  customer: varchar("customer", { length: 160 }).notNull(),
  priority: mysqlEnum("priority", ["Urgent", "High", "Standard"]).notNull(),
  status: mysqlEnum("status", ["Conflict", "Created", "Allocated", "Picking", "Packing", "Quality check", "Dispatched", "Backordered"]).notNull(),
  sla: varchar("sla", { length: 80 }).notNull(),
  valueCents: int("valueCents").notNull(),
  zone: varchar("zone", { length: 80 }).notNull(),
  regionCode: varchar("regionCode", { length: 24 }).default("IN-W-MUM").notNull(),
  isConflict: boolean("isConflict").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("warehouse_orders_user_external_unique").on(table.userId, table.externalId),
  index("warehouse_orders_user_status_idx").on(table.userId, table.status),
  index("warehouse_orders_user_region_idx").on(table.userId, table.regionCode),
]);

export const inventoryItems = mysqlTable("inventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sku: varchar("sku", { length: 80 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  quantity: int("quantity").notNull(),
  requiredQuantity: int("requiredQuantity").notNull(),
  reorderLevel: int("reorderLevel").notNull(),
  zone: varchar("zone", { length: 80 }).notNull(),
  regionCode: varchar("regionCode", { length: 24 }).default("IN-W-MUM").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("inventory_items_user_sku_unique").on(table.userId, table.sku),
  index("inventory_items_user_zone_idx").on(table.userId, table.zone),
]);

export const warehouseAuditEvents = mysqlTable("warehouseAuditEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 180 }).notNull(),
  detail: text("detail").notNull(),
  tone: mysqlEnum("tone", ["teal", "amber", "rose", "sky", "emerald"]).default("teal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("warehouse_audit_user_created_idx").on(table.userId, table.createdAt)]);

export const warehouseDocuments = mysqlTable("warehouseDocuments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderId: int("orderId"),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  storageUrl: varchar("storageUrl", { length: 700 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("warehouse_documents_user_created_idx").on(table.userId, table.createdAt)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type WarehouseRegion = typeof warehouseRegions.$inferSelect;
export type WarehouseOrder = typeof warehouseOrders.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type WarehouseAuditEvent = typeof warehouseAuditEvents.$inferSelect;
export type WarehouseDocument = typeof warehouseDocuments.$inferSelect;
