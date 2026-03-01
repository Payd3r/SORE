-- Migration: colonna photo_count nella tabella notifications
-- Permette di raggruppare le notifiche "nuove foto" per ricordo (una notifica per memory, con conteggio).

ALTER TABLE `notifications`
  ADD COLUMN `photo_count` INT DEFAULT 1 NULL AFTER `type`;
