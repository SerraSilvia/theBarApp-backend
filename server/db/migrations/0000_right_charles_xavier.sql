CREATE TABLE `product_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type_id` integer,
	`price` real NOT NULL,
	`description` text,
	`ingredients` text,
	`image` text,
	FOREIGN KEY (`type_id`) REFERENCES `product_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`login` text,
	`password` text,
	`is_admin` integer DEFAULT false
);
