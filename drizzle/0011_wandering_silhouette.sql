DROP INDEX "sites_tracking_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "idx_verification_identifier";--> statement-breakpoint
ALTER TABLE `account` ALTER COLUMN "provider" TO "provider" text;--> statement-breakpoint
CREATE UNIQUE INDEX `sites_tracking_id_unique` ON `sites` (`tracking_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_verification_identifier` ON `verification` (`identifier`);