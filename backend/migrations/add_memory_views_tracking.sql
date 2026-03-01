-- Migration: Aggiunta tracking visualizzazioni ricordi
-- Data: 2026

ALTER TABLE `memories`
  ADD COLUMN `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER `song`,
  ADD COLUMN `last_viewed_at` DATETIME NULL DEFAULT NULL AFTER `view_count`,
  ADD INDEX `idx_memories_couple_view_count` (`couple_id`, `view_count`, `id`),
  ADD INDEX `idx_memories_last_viewed_at` (`last_viewed_at`);
