-- Migration: colonna type nella tabella notifications
-- Data: 2026
-- Permette di filtrare/raggruppare notifiche e opt-out per tipo in futuro.

ALTER TABLE `notifications`
  ADD COLUMN `type` VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `url`;
