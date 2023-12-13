CREATE TABLE `asset` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`extension` text NOT NULL,
	`game` text NOT NULL,
	`asset_category` text NOT NULL,
	`uploaded_by_id` text NOT NULL,
	`uploaded_by_name` text NOT NULL,
	`url` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`uploaded_date` text NOT NULL,
	`asset_is_optimized` integer DEFAULT false NOT NULL,
	`asset_is_suggestive` integer DEFAULT false NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL,
	`width` integer DEFAULT 0 NOT NULL,
	`height` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game`) REFERENCES `game`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_category`) REFERENCES `assetCategory`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`uploaded_by_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`uploaded_by_name`) REFERENCES `authUser`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `atlas` (
	`id` text NOT NULL,
	`url` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`uploaded_by_name` text NOT NULL,
	`uploaded_date` integer NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `atlasToAsset` (
	`id` text,
	`atlas_id` text NOT NULL,
	`asset_id` integer NOT NULL,
	FOREIGN KEY (`atlas_id`) REFERENCES `atlas`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetLikes` (
	`asset_id` text NOT NULL,
	`liked_by_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`liked_by_id`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assetCategory` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`formatted_name` text NOT NULL,
	`asset_count` integer DEFAULT 0 NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gameAssetCategory` (
	`game_id` text NOT NULL,
	`asset_category_id` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_category_id`) REFERENCES `assetCategory`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetCategoryLikes` (
	`asset_id` text NOT NULL,
	`liked_by_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assetCategory`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`liked_by_id`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `game` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`formatted_name` text NOT NULL,
	`asset_count` integer DEFAULT 0,
	`possible_suggestive_content` integer DEFAULT 0 NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gameLikes` (
	`asset_id` text NOT NULL,
	`liked_by_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`liked_by_id`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `assetTag` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`formatted_name` text NOT NULL,
	`asset_count` integer DEFAULT 0 NOT NULL,
	`last_updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assetTagAsset` (
	`asset_tag_id` text NOT NULL,
	`asset_id` integer NOT NULL,
	FOREIGN KEY (`asset_tag_id`) REFERENCES `assetTag`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assetTagLikes` (
	`asset_id` text NOT NULL,
	`liked_by_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assetTag`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`liked_by_id`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `savedOcGenerators` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`game` text NOT NULL,
	`date_created` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`content` text NOT NULL,
	`saved_color_palette` text,
	`sakura_url` text,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `authCredentials` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`hashed_password` text,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `authUser` (
	`id` text NOT NULL,
	`avatar_url` text,
	`banner_url` text,
	`display_name` text,
	`username` text NOT NULL,
	`username_colour` text,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`pronouns` text,
	`verified` integer DEFAULT 0 NOT NULL,
	`bio` text DEFAULT 'No bio set' NOT NULL,
	`date_joined` text NOT NULL,
	`is_supporter` integer DEFAULT false NOT NULL,
	`supporter_expires_at` text,
	`is_banned` integer DEFAULT false NOT NULL,
	`is_contributor` integer DEFAULT false NOT NULL,
	`role_flags` integer DEFAULT 1 NOT NULL,
	`self_assignable_role_flags` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `authSession` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`user_agent` text NOT NULL,
	`country_code` text NOT NULL,
	`ip_address` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `emailVerificationToken` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `passwordResetToken` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userCollection` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`user_id` text NOT NULL,
	`date_created` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userCollectionAsset` (
	`collection_id` text NOT NULL,
	`asset_id` integer NOT NULL,
	`date_added` text NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `userCollection`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `socialsConnection` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`discord_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userFavorite` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `authUser`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userFavoriteAsset` (
	`id` text NOT NULL,
	`favorited_assets_id` text NOT NULL,
	`asset_id` integer NOT NULL,
	FOREIGN KEY (`favorited_assets_id`) REFERENCES `userFavorite`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `asset`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userFollowing` (
	`followerId` text NOT NULL,
	`followingId` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`followerId`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`followingId`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userCollectionLikes` (
	`collection_id` text NOT NULL,
	`liked_by_id` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `userCollection`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`liked_by_id`) REFERENCES `authUser`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assets_id_idx` ON `asset` (`id`);--> statement-breakpoint
CREATE INDEX `assets_name_idx` ON `asset` (`name`);--> statement-breakpoint
CREATE INDEX `assets_game_name_idx` ON `asset` (`game`);--> statement-breakpoint
CREATE INDEX `assets_asset_category_name_idx` ON `asset` (`asset_category`);--> statement-breakpoint
CREATE INDEX `assets_uploaded_by_id_idx` ON `asset` (`uploaded_by_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atlas_id_unique` ON `atlas` (`id`);--> statement-breakpoint
CREATE INDEX `atlas_id_idx` ON `atlas` (`id`);--> statement-breakpoint
CREATE INDEX `atlas_uploaded_by_idx` ON `atlas` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `atlas_uploaded_by_name_idx` ON `atlas` (`uploaded_by_name`);--> statement-breakpoint
CREATE INDEX `atlas_to_assets_id_idx` ON `atlasToAsset` (`id`);--> statement-breakpoint
CREATE INDEX `atlas_to_assets_atlas_id_idx` ON `atlasToAsset` (`atlas_id`);--> statement-breakpoint
CREATE INDEX `atlas_to_assets_asset_id_idx` ON `atlasToAsset` (`asset_id`);--> statement-breakpoint
CREATE INDEX `assetlikes_asset_idx` ON `assetLikes` (`asset_id`);--> statement-breakpoint
CREATE INDEX `assetlikes_likedBy_idx` ON `assetLikes` (`liked_by_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetCategory_id_unique` ON `assetCategory` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetCategory_name_unique` ON `assetCategory` (`name`);--> statement-breakpoint
CREATE INDEX `asset_category_id_idx` ON `assetCategory` (`id`);--> statement-breakpoint
CREATE INDEX `asset_category_name_idx` ON `assetCategory` (`name`);--> statement-breakpoint
CREATE INDEX `game_asset_category_game_id_idx` ON `gameAssetCategory` (`game_id`);--> statement-breakpoint
CREATE INDEX `game_asset_category_asset_category_id_idx` ON `gameAssetCategory` (`asset_category_id`);--> statement-breakpoint
CREATE INDEX `assetCategoryLikes_asset_idx` ON `assetCategoryLikes` (`asset_id`);--> statement-breakpoint
CREATE INDEX `assetCategoryLikes_likedby_idx` ON `assetCategoryLikes` (`liked_by_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_id_unique` ON `game` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `game_name_unique` ON `game` (`name`);--> statement-breakpoint
CREATE INDEX `game_id_idx` ON `game` (`id`);--> statement-breakpoint
CREATE INDEX `game_name_idx` ON `game` (`name`);--> statement-breakpoint
CREATE INDEX `gamelikes_game_idx` ON `gameLikes` (`asset_id`);--> statement-breakpoint
CREATE INDEX `gamelikes_likedby_idx` ON `gameLikes` (`liked_by_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetTag_id_unique` ON `assetTag` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `assetTag_name_unique` ON `assetTag` (`name`);--> statement-breakpoint
CREATE INDEX `asset_tag_id_idx` ON `assetTag` (`id`);--> statement-breakpoint
CREATE INDEX `asset_tag_name_idx` ON `assetTag` (`name`);--> statement-breakpoint
CREATE INDEX `asset_tags_assets_asset_tag_id_idx` ON `assetTagAsset` (`asset_tag_id`);--> statement-breakpoint
CREATE INDEX `asset_tags_assets_asset_id_idx` ON `assetTagAsset` (`asset_id`);--> statement-breakpoint
CREATE INDEX `assetTagLikes_asset_idx` ON `assetTagLikes` (`asset_id`);--> statement-breakpoint
CREATE INDEX `assetTagLikes_likedby_idx` ON `assetTagLikes` (`liked_by_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `savedOcGenerators_id_unique` ON `savedOcGenerators` (`id`);--> statement-breakpoint
CREATE INDEX `saved_oc_generators_id_idx` ON `savedOcGenerators` (`id`);--> statement-breakpoint
CREATE INDEX `saved_oc_generators_user_id_idx` ON `savedOcGenerators` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `authCredentials_id_unique` ON `authCredentials` (`id`);--> statement-breakpoint
CREATE INDEX `key_user_id_idx` ON `authCredentials` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `authUser_id_unique` ON `authUser` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `authUser_username_unique` ON `authUser` (`username`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `authUser` (`id`);--> statement-breakpoint
CREATE INDEX `user_username_idx` ON `authUser` (`username`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `authUser` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `authSession_id_unique` ON `authSession` (`id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `authSession` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `emailVerificationToken_id_unique` ON `emailVerificationToken` (`id`);--> statement-breakpoint
CREATE INDEX `email_verification_token_user_id_idx` ON `emailVerificationToken` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_verification_token_token_idx` ON `emailVerificationToken` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `passwordResetToken_id_unique` ON `passwordResetToken` (`id`);--> statement-breakpoint
CREATE INDEX `password_reset_token_user_id_idx` ON `passwordResetToken` (`user_id`);--> statement-breakpoint
CREATE INDEX `password_reset_token_token_idx` ON `passwordResetToken` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `userCollection_id_unique` ON `userCollection` (`id`);--> statement-breakpoint
CREATE INDEX `collection_id_idx` ON `userCollection` (`id`);--> statement-breakpoint
CREATE INDEX `user_collection_id_idx` ON `userCollection` (`user_id`);--> statement-breakpoint
CREATE INDEX `collection_assets_collection_id_idx` ON `userCollectionAsset` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collection_assets_asset_id_idx` ON `userCollectionAsset` (`asset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `socialsConnection_id_unique` ON `socialsConnection` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `socialsConnection_user_id_unique` ON `socialsConnection` (`user_id`);--> statement-breakpoint
CREATE INDEX `socials_connection_user_id_idx` ON `socialsConnection` (`user_id`);--> statement-breakpoint
CREATE INDEX `socials_connection_discord_id_idx` ON `socialsConnection` (`discord_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userFavorite_id_unique` ON `userFavorite` (`id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_id_idx` ON `userFavorite` (`id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_user_id_idx` ON `userFavorite` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userFavoriteAsset_id_unique` ON `userFavoriteAsset` (`id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_assets_id_idx` ON `userFavoriteAsset` (`id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_assets_user_id_idx` ON `userFavoriteAsset` (`favorited_assets_id`);--> statement-breakpoint
CREATE INDEX `favorited_assets_assets_asset_id_idx` ON `userFavoriteAsset` (`asset_id`);--> statement-breakpoint
CREATE INDEX `userfollowing_follower_idx` ON `userFollowing` (`followerId`);--> statement-breakpoint
CREATE INDEX `userfollowing_following_idx` ON `userFollowing` (`followingId`);--> statement-breakpoint
CREATE INDEX `userCollectionNetworking_collection_idx` ON `userCollectionLikes` (`collection_id`);--> statement-breakpoint
CREATE INDEX `userCollectionNetworking_likedBy_idx` ON `userCollectionLikes` (`liked_by_id`);