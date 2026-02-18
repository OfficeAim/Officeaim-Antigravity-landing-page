-- Upgrade Schema for Visual Layer and Progressive Unlock
-- Adds 'image_url' for Hero Assets
-- Adds 'passing_threshold' for Quiz Gating

ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS passing_threshold INTEGER DEFAULT 80;

-- Update existing lessons with defaults if needed
UPDATE lessons SET passing_threshold = 80 WHERE passing_threshold IS NULL;
