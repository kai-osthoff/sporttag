CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`capacity` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
