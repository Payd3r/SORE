ALTER TABLE images
ADD COLUMN original_format VARCHAR(10) AFTER url,
ADD COLUMN original_path VARCHAR(255) AFTER original_format,
ADD COLUMN jpg_path VARCHAR(255) AFTER original_path,
ADD COLUMN thumb_big_path VARCHAR(255) AFTER jpg_path,
ADD COLUMN thumb_small_path VARCHAR(255) AFTER thumb_big_path,
ADD COLUMN taken_at DATETIME AFTER thumb_small_path,
ADD COLUMN latitude DECIMAL(10, 8) AFTER taken_at,
ADD COLUMN longitude DECIMAL(11, 8) AFTER latitude,
ADD COLUMN location_name VARCHAR(255) AFTER longitude,
ADD COLUMN location_address TEXT AFTER location_name; 