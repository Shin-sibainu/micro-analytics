CREATE TABLE `ai_insights` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`site_id` text NOT NULL,
	`insight_type` text,
	`data_sources` text,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`expires_at` integer,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_id` text NOT NULL,
	`event_type` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`session_hash` text NOT NULL,
	`url` text,
	`path` text,
	`title` text,
	`referrer` text,
	`device_type` text,
	`screen_size` text,
	`browser` text,
	`os` text,
	`country` text,
	`event_name` text,
	`event_value` text,
	`timestamp` integer NOT NULL,
	`date` text GENERATED ALWAYS AS (date(timestamp, 'unixepoch')) VIRTUAL,
	`hour` integer GENERATED ALWAYS AS (cast(strftime('%H', timestamp, 'unixepoch') as integer)) VIRTUAL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `gsc_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_id` text NOT NULL,
	`date` text NOT NULL,
	`query` text,
	`page` text,
	`country` text,
	`device` text,
	`clicks` integer,
	`impressions` integer,
	`ctr` real,
	`position` real,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`domain` text NOT NULL,
	`name` text,
	`tracking_id` text DEFAULT (lower(hex(randomblob(8)))),
	`tracking_enabled` integer DEFAULT true,
	`gsc_enabled` integer DEFAULT false,
	`ga4_import_completed` integer DEFAULT false,
	`gsc_config` text,
	`ga4_config` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sites_tracking_id_unique` ON `sites` (`tracking_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`image` text,
	`google_id` text NOT NULL,
	`plan_type` text DEFAULT 'essential',
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_unique` ON `users` (`google_id`);