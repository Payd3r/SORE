
-- Create database
CREATE DATABASE IF NOT EXISTS couple_memories;

USE couple_memories;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  avatar VARCHAR(255),
  bio TEXT,
  coupleId VARCHAR(36),
  uploadCount INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Couples table
CREATE TABLE IF NOT EXISTS Couples (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  startDate DATETIME NOT NULL,
  anniversaryDate DATETIME,
  avatar VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Memories table
CREATE TABLE IF NOT EXISTS Memories (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('travel', 'event', 'simple') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  startDate DATETIME NOT NULL,
  endDate DATETIME,
  song VARCHAR(255),
  eventTag ENUM('birthday', 'anniversary', 'gift', 'holiday', 'other'),
  userId VARCHAR(36) NOT NULL,
  creatorName VARCHAR(255) NOT NULL,
  coupleId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (coupleId) REFERENCES Couples(id) ON DELETE CASCADE
);

-- Images table
CREATE TABLE IF NOT EXISTS Images (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  thumbnailUrl VARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  type ENUM('landscape', 'singlePerson', 'couple') DEFAULT 'landscape',
  isFavorite BOOLEAN DEFAULT FALSE,
  originalFormat VARCHAR(10), -- Added field to track original format (jpg, png, heic, etc)
  memoryId VARCHAR(36),
  userId VARCHAR(36) NOT NULL,
  uploaderName VARCHAR(255) NOT NULL,
  coupleId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (memoryId) REFERENCES Memories(id) ON DELETE SET NULL,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (coupleId) REFERENCES Couples(id) ON DELETE CASCADE
);

-- GeoLocations table
CREATE TABLE IF NOT EXISTS GeoLocations (
  id VARCHAR(36) PRIMARY KEY,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  name VARCHAR(255),
  memoryId VARCHAR(36),
  imageId VARCHAR(36),
  ideaId VARCHAR(36),
  coupleId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (memoryId) REFERENCES Memories(id) ON DELETE CASCADE,
  FOREIGN KEY (imageId) REFERENCES Images(id) ON DELETE CASCADE,
  FOREIGN KEY (ideaId) REFERENCES Ideas(id) ON DELETE CASCADE,
  FOREIGN KEY (coupleId) REFERENCES Couples(id) ON DELETE CASCADE
);

-- Ideas table
CREATE TABLE IF NOT EXISTS Ideas (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('travel', 'restaurant', 'general', 'challenge') NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  dueDate DATETIME,
  completed BOOLEAN DEFAULT FALSE,
  completedAt DATETIME,
  completedById VARCHAR(36),
  completedByName VARCHAR(255),
  userId VARCHAR(36) NOT NULL,
  creatorName VARCHAR(255) NOT NULL,
  coupleId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (completedById) REFERENCES Users(id) ON DELETE SET NULL,
  FOREIGN KEY (coupleId) REFERENCES Couples(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_users_couple ON Users(coupleId);
CREATE INDEX idx_memories_couple ON Memories(coupleId);
CREATE INDEX idx_memories_user ON Memories(userId);
CREATE INDEX idx_images_couple ON Images(coupleId);
CREATE INDEX idx_images_user ON Images(userId);
CREATE INDEX idx_images_memory ON Images(memoryId);
CREATE INDEX idx_ideas_couple ON Ideas(coupleId);
CREATE INDEX idx_ideas_user ON Ideas(userId);
CREATE INDEX idx_ideas_completed ON Ideas(completed);
CREATE INDEX idx_geolocation_couple ON GeoLocations(coupleId);
