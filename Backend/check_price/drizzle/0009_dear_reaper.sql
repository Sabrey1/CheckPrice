PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer,
	`branch_id` integer,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`full_name` text,
	`phone` text,
	`email` text,
	`active` text,
	`created_at` integer,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`branch_id`) REFERENCES `branchs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "role_id", "branch_id", "username", "password", "full_name", "phone", "email", "active", "created_at") SELECT "id", "role_id", "branch_id", "username", "password", "full_name", "phone", "email", "active", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;