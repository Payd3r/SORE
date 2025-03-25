-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL AFTER password,
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(50) DEFAULT 'light' AFTER couple_id,
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(255) AFTER theme_preference;

-- Update existing users to set password_hash equal to password
UPDATE users SET password_hash = password WHERE password_hash IS NULL; 