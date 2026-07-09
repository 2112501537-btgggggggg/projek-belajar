ALTER TABLE `users` MODIFY COLUMN `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255) NOT NULL;