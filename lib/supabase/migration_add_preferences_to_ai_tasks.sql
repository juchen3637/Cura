-- Migration: Add preferences column to ai_tasks table
-- This allows storing user preferences for the Build Curated Resume feature
-- (e.g., max bullets per experience, max bullets per project)

-- Add preferences column (JSONB to store flexible preference object)
ALTER TABLE ai_tasks ADD COLUMN IF NOT EXISTS preferences JSONB;

-- Example preferences structure:
-- {
--   "maxExperiences": 3,
--   "maxProjects": 2,
--   "maxBulletsPerExperience": 3,
--   "maxBulletsPerProject": 3
-- }
