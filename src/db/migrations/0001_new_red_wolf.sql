CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`class` text NOT NULL,
	`priority_1_id` integer NOT NULL,
	`priority_2_id` integer NOT NULL,
	`priority_3_id` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`priority_1_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_2_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_3_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
