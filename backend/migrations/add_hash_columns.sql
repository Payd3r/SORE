-- Migration: Aggiunta colonne hash per rilevamento duplicati immagini
-- Data: 2025

-- Aggiungi colonne hash_original e hash_webp alla tabella images
ALTER TABLE `images`
  ADD COLUMN `hash_original` VARCHAR(64) NULL DEFAULT NULL AFTER `display_order`,
  ADD COLUMN `hash_webp` VARCHAR(64) NULL DEFAULT NULL AFTER `hash_original`;

-- Aggiungi indici per ricerca veloce dei duplicati
-- Nota: Non usiamo UNIQUE perché potrebbero esserci duplicati da rimuovere
ALTER TABLE `images`
  ADD INDEX `idx_hash_original` (`hash_original`),
  ADD INDEX `idx_hash_webp` (`hash_webp`),
  ADD INDEX `idx_hash_composite` (`hash_original`, `hash_webp`, `couple_id`);

