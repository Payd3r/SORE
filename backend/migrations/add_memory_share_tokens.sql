-- Migration: token di condivisione pubblica per i ricordi
-- Permette la creazione di link condivisibili e revocabili/expirabili.

CREATE TABLE `memory_share_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `memory_id` INT NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_memory_share_token` (`token`),
  KEY `idx_memory_share_token` (`token`),
  KEY `idx_memory_share_expires_at` (`expires_at`),
  KEY `idx_memory_share_memory_id` (`memory_id`),
  CONSTRAINT `fk_memory_share_tokens_memory_id`
    FOREIGN KEY (`memory_id`) REFERENCES `memories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
