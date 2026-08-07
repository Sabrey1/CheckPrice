PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_branchs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`phone` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_branchs`("id", "name", "address", "phone", "status", "created_at") SELECT "id", "name", "address", "phone", "status", "created_at" FROM `branchs`;--> statement-breakpoint
DROP TABLE `branchs`;--> statement-breakpoint
ALTER TABLE `__new_branchs` RENAME TO `branchs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;