CREATE TABLE `passwordCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(512) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastChangedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passwordCredentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwordCredentials_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `passwordCredentials_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredRegionCode` varchar(24) NOT NULL DEFAULT 'IN-W-MUM',
	`timeZone` varchar(64) NOT NULL DEFAULT 'Asia/Kolkata',
	`dataVisibility` enum('private') NOT NULL DEFAULT 'private',
	`operationalNotifications` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `warehouseRegions` (
	`code` varchar(24) NOT NULL,
	`hubName` varchar(120) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(100) NOT NULL,
	`timeZone` varchar(64) NOT NULL DEFAULT 'Asia/Kolkata',
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `warehouseRegions_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
ALTER TABLE `inventoryItems` ADD `regionCode` varchar(24) DEFAULT 'IN-W-MUM' NOT NULL;--> statement-breakpoint
ALTER TABLE `warehouseOrders` ADD `regionCode` varchar(24) DEFAULT 'IN-W-MUM' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `user_profiles_region_idx` ON `userProfiles` (`preferredRegionCode`);--> statement-breakpoint
CREATE INDEX `warehouse_orders_user_region_idx` ON `warehouseOrders` (`userId`,`regionCode`);