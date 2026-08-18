CREATE TABLE `inventoryItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sku` varchar(80) NOT NULL,
	`name` varchar(160) NOT NULL,
	`quantity` int NOT NULL,
	`requiredQuantity` int NOT NULL,
	`reorderLevel` int NOT NULL,
	`zone` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventoryItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_items_user_sku_unique` UNIQUE(`userId`,`sku`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `warehouseAuditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(180) NOT NULL,
	`detail` text NOT NULL,
	`tone` enum('teal','amber','rose','sky','emerald') NOT NULL DEFAULT 'teal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouseAuditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouseDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`sizeBytes` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(700) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `warehouseDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouseOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`externalId` varchar(32) NOT NULL,
	`customer` varchar(160) NOT NULL,
	`priority` enum('Urgent','High','Standard') NOT NULL,
	`status` enum('Conflict','Created','Allocated','Picking','Packing','Quality check','Dispatched','Backordered') NOT NULL,
	`sla` varchar(80) NOT NULL,
	`valueCents` int NOT NULL,
	`zone` varchar(80) NOT NULL,
	`isConflict` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warehouseOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `warehouse_orders_user_external_unique` UNIQUE(`userId`,`externalId`)
);
--> statement-breakpoint
CREATE INDEX `inventory_items_user_zone_idx` ON `inventoryItems` (`userId`,`zone`);--> statement-breakpoint
CREATE INDEX `warehouse_audit_user_created_idx` ON `warehouseAuditEvents` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `warehouse_documents_user_created_idx` ON `warehouseDocuments` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `warehouse_orders_user_status_idx` ON `warehouseOrders` (`userId`,`status`);