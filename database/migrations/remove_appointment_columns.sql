-- Migration: Remove due_date, priority, and duration_minutes from appointments table
-- Created: 2025-08-17

-- Remove columns from appointments table
ALTER TABLE appointments 
DROP COLUMN IF EXISTS due_date,
DROP COLUMN IF EXISTS priority,
DROP COLUMN IF EXISTS duration_minutes;

-- Update any existing appointment records that might have these fields
-- (This is a safety measure in case any data exists)
-- No data migration needed since we're removing the columns entirely
