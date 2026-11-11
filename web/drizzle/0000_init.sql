CREATE TABLE `exercise_variations` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`label` text NOT NULL,
	`is_alternative` integer DEFAULT false NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `variations_exercise_idx` ON `exercise_variations` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`name` text NOT NULL,
	`sets` text DEFAULT '' NOT NULL,
	`reps` text DEFAULT '' NOT NULL,
	`rest` text DEFAULT '' NOT NULL,
	`num_sets` integer DEFAULT 3 NOT NULL,
	`tip` text DEFAULT '' NOT NULL,
	`badge_label` text DEFAULT '' NOT NULL,
	`badge_color` text DEFAULT '' NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `workout_sections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `exercises_section_idx` ON `exercises` (`section_id`);--> statement-breakpoint
CREATE TABLE `schedule_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`start_weekday` integer DEFAULT 2 NOT NULL,
	`has_fifth_day` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `set_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`date` text NOT NULL,
	`set_index` integer NOT NULL,
	`completed_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `set_logs_unique` ON `set_logs` (`exercise_id`,`date`,`set_index`);--> statement-breakpoint
CREATE INDEX `set_logs_user_date_idx` ON `set_logs` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `workout_days` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`name` text NOT NULL,
	`day_label` text DEFAULT '' NOT NULL,
	`color_hex` text DEFAULT '#4a9eff' NOT NULL,
	`position` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `days_plan_idx` ON `workout_days` (`plan_id`);--> statement-breakpoint
CREATE TABLE `workout_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `plans_user_idx` ON `workout_plans` (`user_id`);--> statement-breakpoint
CREATE TABLE `workout_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`title` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `workout_days`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sections_day_idx` ON `workout_sections` (`day_id`);