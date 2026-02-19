CREATE TABLE `character_external_ids` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`character_id` text NOT NULL,
	`source` text NOT NULL,
	`external_id` text NOT NULL,
	`order_in_character` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_character_external_ids_lookup` ON `character_external_ids` (`source`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `character_external_ids_character_id_source_external_id_unique` ON `character_external_ids` (`character_id`,`source`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_character_external_id` ON `character_external_ids` (`source`,`external_id`);--> statement-breakpoint
CREATE TABLE `character_person_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`character_id` text NOT NULL,
	`person_id` text NOT NULL,
	`is_spoiler` integer DEFAULT false NOT NULL,
	`type` text DEFAULT 'other' NOT NULL,
	`note` text,
	`order_in_character` integer DEFAULT 0 NOT NULL,
	`order_in_person` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_character_person_links_character_id` ON `character_person_links` (`character_id`);--> statement-breakpoint
CREATE INDEX `idx_character_person_links_person_id` ON `character_person_links` (`person_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_character_person` ON `character_person_links` (`character_id`,`person_id`,`type`);--> statement-breakpoint
CREATE TABLE `character_tag_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`character_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`is_spoiler` integer DEFAULT false NOT NULL,
	`note` text,
	`order_in_character` integer DEFAULT 0 NOT NULL,
	`order_in_tag` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_character_tag_links_character_id` ON `character_tag_links` (`character_id`);--> statement-breakpoint
CREATE INDEX `idx_character_tag_links_tag_id` ON `character_tag_links` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `character_tag_links_character_id_tag_id_unique` ON `character_tag_links` (`character_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text DEFAULT 'unknown character' NOT NULL,
	`original_name` text,
	`sort_name` text,
	`photo_file` text,
	`birth_date` text,
	`gender` text,
	`blood_type` text,
	`height` integer,
	`weight` integer,
	`bust` integer,
	`waist` integer,
	`hips` integer,
	`cup` text,
	`age` integer,
	`score` integer,
	`is_favorite` integer DEFAULT false NOT NULL,
	`is_nsfw` integer DEFAULT false NOT NULL,
	`description` text,
	`related_sites` text
);
--> statement-breakpoint
CREATE INDEX `idx_characters_is_favorite` ON `characters` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_characters_is_nsfw` ON `characters` (`is_nsfw`);--> statement-breakpoint
CREATE INDEX `idx_characters_gender` ON `characters` (`gender`);--> statement-breakpoint
CREATE INDEX `idx_characters_created_at` ON `characters` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_characters_name` ON `characters` (`name`);--> statement-breakpoint
CREATE INDEX `idx_characters_score` ON `characters` (`score`);--> statement-breakpoint
CREATE INDEX `idx_characters_age` ON `characters` (`age`);--> statement-breakpoint
CREATE TABLE `collection_character_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`collection_id` text NOT NULL,
	`character_id` text NOT NULL,
	`note` text,
	`order_in_collection` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_collection_character_links_collection_id` ON `collection_character_links` (`collection_id`);--> statement-breakpoint
CREATE INDEX `idx_collection_character_links_character_id` ON `collection_character_links` (`character_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `collection_character_links_collection_id_character_id_unique` ON `collection_character_links` (`collection_id`,`character_id`);--> statement-breakpoint
CREATE TABLE `collection_company_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`collection_id` text NOT NULL,
	`company_id` text NOT NULL,
	`note` text,
	`order_in_collection` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_collection_company_links_collection_id` ON `collection_company_links` (`collection_id`);--> statement-breakpoint
CREATE INDEX `idx_collection_company_links_company_id` ON `collection_company_links` (`company_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `collection_company_links_collection_id_company_id_unique` ON `collection_company_links` (`collection_id`,`company_id`);--> statement-breakpoint
CREATE TABLE `collection_game_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`collection_id` text NOT NULL,
	`game_id` text NOT NULL,
	`note` text,
	`order_in_collection` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_collection_game_links_collection_id` ON `collection_game_links` (`collection_id`);--> statement-breakpoint
CREATE INDEX `idx_collection_game_links_game_id` ON `collection_game_links` (`game_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `collection_game_links_collection_id_game_id_unique` ON `collection_game_links` (`collection_id`,`game_id`);--> statement-breakpoint
CREATE TABLE `collection_person_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`collection_id` text NOT NULL,
	`person_id` text NOT NULL,
	`note` text,
	`order_in_collection` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_collection_person_links_collection_id` ON `collection_person_links` (`collection_id`);--> statement-breakpoint
CREATE INDEX `idx_collection_person_links_person_id` ON `collection_person_links` (`person_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `collection_person_links_collection_id_person_id_unique` ON `collection_person_links` (`collection_id`,`person_id`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text DEFAULT 'unknown collection' NOT NULL,
	`description` text,
	`cover_file` text,
	`is_nsfw` integer DEFAULT false NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`is_dynamic` integer DEFAULT false NOT NULL,
	`dynamic_config` text
);
--> statement-breakpoint
CREATE INDEX `idx_collections_order` ON `collections` (`order`);--> statement-breakpoint
CREATE INDEX `idx_collections_name` ON `collections` (`name`);--> statement-breakpoint
CREATE INDEX `idx_collections_is_dynamic` ON `collections` (`is_dynamic`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text DEFAULT 'unknown company' NOT NULL,
	`original_name` text,
	`sort_name` text,
	`founded_date` text,
	`logo_file` text,
	`score` integer,
	`is_favorite` integer DEFAULT false NOT NULL,
	`is_nsfw` integer DEFAULT false NOT NULL,
	`related_sites` text,
	`description` text
);
--> statement-breakpoint
CREATE INDEX `idx_companies_is_favorite` ON `companies` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_companies_is_nsfw` ON `companies` (`is_nsfw`);--> statement-breakpoint
CREATE INDEX `idx_companies_created_at` ON `companies` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_companies_name` ON `companies` (`name`);--> statement-breakpoint
CREATE INDEX `idx_companies_score` ON `companies` (`score`);--> statement-breakpoint
CREATE TABLE `company_external_ids` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`company_id` text NOT NULL,
	`source` text NOT NULL,
	`external_id` text NOT NULL,
	`order_in_company` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_company_external_ids_lookup` ON `company_external_ids` (`source`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `company_external_ids_company_id_source_external_id_unique` ON `company_external_ids` (`company_id`,`source`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_company_external_id` ON `company_external_ids` (`source`,`external_id`);--> statement-breakpoint
CREATE TABLE `company_tag_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`company_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`is_spoiler` integer DEFAULT false NOT NULL,
	`note` text,
	`order_in_company` integer DEFAULT 0 NOT NULL,
	`order_in_tag` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_company_tag_links_company_id` ON `company_tag_links` (`company_id`);--> statement-breakpoint
CREATE INDEX `idx_company_tag_links_tag_id` ON `company_tag_links` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `company_tag_links_company_id_tag_id_unique` ON `company_tag_links` (`company_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `game_character_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`game_id` text NOT NULL,
	`character_id` text NOT NULL,
	`is_spoiler` integer DEFAULT false NOT NULL,
	`type` text DEFAULT 'other' NOT NULL,
	`note` text,
	`order_in_game` integer DEFAULT 0 NOT NULL,
	`order_in_character` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_game_character_links_game_id` ON `game_character_links` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_game_character_links_character_id` ON `game_character_links` (`character_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_character_links_game_id_character_id_type_unique` ON `game_character_links` (`game_id`,`character_id`,`type`);--> statement-breakpoint
CREATE TABLE `game_company_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`game_id` text NOT NULL,
	`company_id` text NOT NULL,
	`is_spoiler` integer DEFAULT false NOT NULL,
	`type` text DEFAULT 'other' NOT NULL,
	`note` text,
	`order_in_game` integer DEFAULT 0 NOT NULL,
	`order_in_company` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_game_company_links_game_id` ON `game_company_links` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_game_company_links_company_id` ON `game_company_links` (`company_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_company_links_game_id_company_id_type_unique` ON `game_company_links` (`game_id`,`company_id`,`type`);--> statement-breakpoint
CREATE TABLE `game_external_ids` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`game_id` text NOT NULL,
	`source` text NOT NULL,
	`external_id` text NOT NULL,
	`order_in_game` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_game_external_ids_lookup` ON `game_external_ids` (`source`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_external_ids_game_id_source_external_id_unique` ON `game_external_ids` (`game_id`,`source`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_game_external_id` ON `game_external_ids` (`source`,`external_id`);--> statement-breakpoint
CREATE TABLE `game_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`game_id` text NOT NULL,
	`name` text NOT NULL,
	`content` text,
	`content_inline_files` text DEFAULT '[]' NOT NULL,
	`cover_file` text,
	`order_in_game` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_game_notes_game_id` ON `game_notes` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_game_notes_game_id_order` ON `game_notes` (`game_id`,`order_in_game`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_game_notes_game_id_name` ON `game_notes` (`game_id`,`name`);--> statement-breakpoint
CREATE TABLE `game_person_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`game_id` text NOT NULL,
	`person_id` text NOT NULL,
	`is_spoiler` integer DEFAULT false NOT NULL,
	`type` text DEFAULT 'other' NOT NULL,
	`note` text,
	`order_in_game` integer DEFAULT 0 NOT NULL,
	`order_in_person` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_game_person_links_game_id` ON `game_person_links` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_game_person_links_person_id` ON `game_person_links` (`person_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_person_links_game_id_person_id_type_unique` ON `game_person_links` (`game_id`,`person_id`,`type`);--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`game_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_game_sessions_game_id` ON `game_sessions` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_game_sessions_started_at` ON `game_sessions` (`started_at`);--> statement-breakpoint
CREATE TABLE `game_tag_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`game_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`is_spoiler` integer DEFAULT false NOT NULL,
	`note` text,
	`order_in_game` integer DEFAULT 0 NOT NULL,
	`order_in_tag` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_game_tag_links_game_id` ON `game_tag_links` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_game_tag_links_tag_id` ON `game_tag_links` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_tag_links_game_id_tag_id_unique` ON `game_tag_links` (`game_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text DEFAULT 'unknown game' NOT NULL,
	`original_name` text,
	`sort_name` text,
	`cover_file` text,
	`backdrop_file` text,
	`logo_file` text,
	`icon_file` text,
	`score` integer,
	`is_favorite` integer DEFAULT false NOT NULL,
	`release_date` text,
	`description` text,
	`related_sites` text,
	`status` text DEFAULT 'notStarted' NOT NULL,
	`last_active_at` integer,
	`total_duration` integer DEFAULT 0 NOT NULL,
	`save_path` text,
	`save_backups` text,
	`max_save_backups` integer DEFAULT 5 NOT NULL,
	`launcher_mode` text DEFAULT 'file' NOT NULL,
	`launcher_path` text,
	`monitor_mode` text DEFAULT 'folder' NOT NULL,
	`monitor_path` text,
	`game_dir_path` text,
	`is_nsfw` integer DEFAULT false NOT NULL,
	`description_inline_files` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_games_status` ON `games` (`status`);--> statement-breakpoint
CREATE INDEX `idx_games_is_favorite` ON `games` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_games_is_nsfw` ON `games` (`is_nsfw`);--> statement-breakpoint
CREATE INDEX `idx_games_last_active_at` ON `games` (`last_active_at`);--> statement-breakpoint
CREATE INDEX `idx_games_created_at` ON `games` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_games_name` ON `games` (`name`);--> statement-breakpoint
CREATE INDEX `idx_games_score` ON `games` (`score`);--> statement-breakpoint
CREATE TABLE `person_external_ids` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`person_id` text NOT NULL,
	`source` text NOT NULL,
	`external_id` text NOT NULL,
	`order_in_person` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_person_external_ids_lookup` ON `person_external_ids` (`source`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `person_external_ids_person_id_source_external_id_unique` ON `person_external_ids` (`person_id`,`source`,`external_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_person_external_id` ON `person_external_ids` (`source`,`external_id`);--> statement-breakpoint
CREATE TABLE `person_tag_links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`person_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`is_spoiler` integer DEFAULT false NOT NULL,
	`note` text,
	`order_in_person` integer DEFAULT 0 NOT NULL,
	`order_in_tag` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_person_tag_links_person_id` ON `person_tag_links` (`person_id`);--> statement-breakpoint
CREATE INDEX `idx_person_tag_links_tag_id` ON `person_tag_links` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `person_tag_links_person_id_tag_id_unique` ON `person_tag_links` (`person_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `persons` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text DEFAULT 'unknown person' NOT NULL,
	`original_name` text,
	`sort_name` text,
	`photo_file` text,
	`score` integer,
	`is_favorite` integer DEFAULT false NOT NULL,
	`is_nsfw` integer DEFAULT false NOT NULL,
	`birth_date` text,
	`death_date` text,
	`gender` text,
	`description` text,
	`related_sites` text
);
--> statement-breakpoint
CREATE INDEX `idx_persons_is_favorite` ON `persons` (`is_favorite`);--> statement-breakpoint
CREATE INDEX `idx_persons_is_nsfw` ON `persons` (`is_nsfw`);--> statement-breakpoint
CREATE INDEX `idx_persons_gender` ON `persons` (`gender`);--> statement-breakpoint
CREATE INDEX `idx_persons_created_at` ON `persons` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_persons_name` ON `persons` (`name`);--> statement-breakpoint
CREATE INDEX `idx_persons_score` ON `persons` (`score`);--> statement-breakpoint
CREATE TABLE `plugin_data` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`plugin_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE INDEX `idx_plugin_data_plugin_id` ON `plugin_data` (`plugin_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_plugin_data` ON `plugin_data` (`plugin_id`,`key`);--> statement-breakpoint
CREATE TABLE `scanners` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text DEFAULT 'unknown scanner' NOT NULL,
	`path` text NOT NULL,
	`type` text NOT NULL,
	`scraper_profile_id` text NOT NULL,
	`target_collection_id` text,
	`scan_interval_minutes` integer DEFAULT 0 NOT NULL,
	`entity_depth` integer DEFAULT 0 NOT NULL,
	`name_extraction_rules` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`scraper_profile_id`) REFERENCES `scraper_profiles`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`target_collection_id`) REFERENCES `collections`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_scanners_type` ON `scanners` (`type`);--> statement-breakpoint
CREATE INDEX `idx_scanners_scraper_profile_id` ON `scanners` (`scraper_profile_id`);--> statement-breakpoint
CREATE TABLE `scraper_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`media_type` text DEFAULT 'game' NOT NULL,
	`source_preset_id` text,
	`default_locale` text,
	`search_provider_id` text NOT NULL,
	`slot_configs` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_scraper_profiles_media_type` ON `scraper_profiles` (`media_type`);--> statement-breakpoint
CREATE INDEX `idx_scraper_profiles_order` ON `scraper_profiles` (`order`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY DEFAULT 0 NOT NULL,
	`locale` text,
	`main_window_close_action` text DEFAULT 'exit' NOT NULL,
	`scanner_ignored_names` text DEFAULT '[]' NOT NULL,
	`scanner_use_phash` integer DEFAULT false NOT NULL,
	`scanner_start_at_open` integer DEFAULT false NOT NULL,
	CONSTRAINT "single_row_check" CHECK("settings"."id" = 0)
);
--> statement-breakpoint
CREATE TABLE `showcase_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`entity_type` text DEFAULT 'game' NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`layout` text DEFAULT 'horizontal' NOT NULL,
	`item_size` text DEFAULT 'md' NOT NULL,
	`open_mode` text DEFAULT 'page' NOT NULL,
	`limit` integer,
	`filter` text DEFAULT '{}' NOT NULL,
	`sort_field` text DEFAULT 'name' NOT NULL,
	`sort_direction` text DEFAULT 'asc' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_showcase_sections_order` ON `showcase_sections` (`order`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_nsfw` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE INDEX `idx_tags_name` ON `tags` (`name`);--> statement-breakpoint
CREATE INDEX `idx_tags_is_nsfw` ON `tags` (`is_nsfw`);