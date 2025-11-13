ALTER TABLE `sessions` ADD `token` text NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `created_at` integer DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `sessions` ADD `updated_at` integer DEFAULT (unixepoch());--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);