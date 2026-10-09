CREATE TABLE `portfolio_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portfolio_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portfolio_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`object_key` text NOT NULL,
	`upload_id` text NOT NULL,
	`content_type` text NOT NULL,
	`total_size` integer NOT NULL,
	`filename` text NOT NULL,
	`state` text DEFAULT 'uploading' NOT NULL,
	`created_at` text NOT NULL
);
