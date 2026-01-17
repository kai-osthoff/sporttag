CREATE TABLE `allocations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`seed` text NOT NULL,
	`status` text NOT NULL,
	`stats` text,
	`created_at` integer,
	`completed_at` integer
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`class` text NOT NULL,
	`priority_1_id` integer NOT NULL,
	`priority_2_id` integer,
	`priority_3_id` integer,
	`assigned_event_id` integer,
	`assignment_type` text,
	`assigned_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`priority_1_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_2_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`priority_3_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_students`("id", "first_name", "last_name", "class", "priority_1_id", "priority_2_id", "priority_3_id", "created_at", "updated_at") SELECT "id", "first_name", "last_name", "class", "priority_1_id", "priority_2_id", "priority_3_id", "created_at", "updated_at" FROM `students`;--> statement-breakpoint
DROP TABLE `students`;--> statement-breakpoint
ALTER TABLE `__new_students` RENAME TO `students`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
