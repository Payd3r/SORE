
-- MySQL Schema for Couple App

-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),  -- Hashed password, NULL for social auth users
    avatar VARCHAR(255),
    bio TEXT,
    upload_count INT DEFAULT 0,
    couple_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (couple_id)
);

-- Couples Table
CREATE TABLE couples (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    anniversary_date DATE,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add foreign key constraint after both tables exist
ALTER TABLE users
ADD CONSTRAINT fk_users_couple
FOREIGN KEY (couple_id) REFERENCES couples(id)
ON DELETE SET NULL;

-- Memories Table
CREATE TABLE memories (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('travel', 'event', 'simple') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    song VARCHAR(255),
    event_tag ENUM('birthday', 'anniversary', 'gift', 'holiday', 'other'),
    user_id VARCHAR(36) NOT NULL,
    creator_name VARCHAR(100) NOT NULL,
    couple_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
    INDEX (couple_id)
);

-- Locations Table
CREATE TABLE locations (
    id VARCHAR(36) PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (latitude, longitude)
);

-- Memory Locations (Many-to-Many)
CREATE TABLE memory_locations (
    memory_id VARCHAR(36) NOT NULL,
    location_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (memory_id, location_id),
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Images Table
CREATE TABLE images (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type ENUM('landscape', 'singlePerson', 'couple') NOT NULL,
    memory_id VARCHAR(36),
    user_id VARCHAR(36) NOT NULL,
    uploader_name VARCHAR(100) NOT NULL,
    couple_id VARCHAR(36) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
    INDEX (couple_id),
    INDEX (memory_id)
);

-- Image Locations (Many-to-Many)
CREATE TABLE image_locations (
    image_id VARCHAR(36) NOT NULL,
    location_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (image_id, location_id),
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Ideas Table
CREATE TABLE ideas (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('travel', 'restaurant', 'general', 'challenge') NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by_id VARCHAR(36),
    completed_by_name VARCHAR(100),
    user_id VARCHAR(36) NOT NULL,
    creator_name VARCHAR(100) NOT NULL,
    couple_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
    INDEX (couple_id)
);

-- Idea Locations (Many-to-Many)
CREATE TABLE idea_locations (
    idea_id VARCHAR(36) NOT NULL,
    location_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (idea_id, location_id),
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Stats View for quick access to couple statistics
CREATE VIEW couple_stats AS
SELECT 
    c.id AS couple_id,
    c.name AS couple_name,
    COUNT(DISTINCT m.id) AS total_memories,
    COUNT(DISTINCT i.id) AS total_ideas,
    SUM(CASE WHEN i.completed = 1 THEN 1 ELSE 0 END) AS completed_ideas,
    COUNT(DISTINCT img.id) AS total_images,
    COUNT(DISTINCT l.id) AS total_locations,
    (SELECT COUNT(*) FROM memories WHERE type = 'travel' AND couple_id = c.id) AS travel_memories,
    (SELECT COUNT(*) FROM memories WHERE type = 'event' AND couple_id = c.id) AS event_memories,
    (SELECT COUNT(*) FROM memories WHERE type = 'simple' AND couple_id = c.id) AS simple_memories,
    DATEDIFF(CURRENT_DATE, c.start_date) AS days_together
FROM 
    couples c
LEFT JOIN 
    memories m ON c.id = m.couple_id
LEFT JOIN 
    ideas i ON c.id = i.couple_id
LEFT JOIN 
    images img ON c.id = img.couple_id
LEFT JOIN 
    memory_locations ml ON m.id = ml.memory_id
LEFT JOIN 
    image_locations il ON img.id = il.image_id
LEFT JOIN 
    idea_locations idl ON i.id = idl.idea_id
LEFT JOIN 
    locations l ON l.id = ml.location_id OR l.id = il.location_id OR l.id = idl.location_id
GROUP BY 
    c.id;

-- User Stats View
CREATE VIEW user_stats AS
SELECT 
    u.id AS user_id,
    u.name,
    u.couple_id,
    COUNT(DISTINCT m.id) AS memories_created,
    COUNT(DISTINCT i.id) AS ideas_created,
    SUM(CASE WHEN i.completed_by_id = u.id THEN 1 ELSE 0 END) AS ideas_completed,
    COUNT(DISTINCT img.id) AS images_uploaded,
    COUNT(DISTINCT l.id) AS locations_visited
FROM 
    users u
LEFT JOIN 
    memories m ON u.id = m.user_id
LEFT JOIN 
    ideas i ON u.id = i.user_id
LEFT JOIN 
    images img ON u.id = img.user_id
LEFT JOIN 
    memory_locations ml ON (m.id = ml.memory_id AND m.user_id = u.id)
LEFT JOIN 
    image_locations il ON (img.id = il.image_id AND img.user_id = u.id)
LEFT JOIN 
    locations l ON l.id = ml.location_id OR l.id = il.location_id
WHERE 
    u.couple_id IS NOT NULL
GROUP BY 
    u.id;
