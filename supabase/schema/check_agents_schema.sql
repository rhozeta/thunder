-- Check agents table schema
\d agents

-- Check if profile_photo_url column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'agents' AND column_name = 'profile_photo_url';

-- Check current data in agents table
SELECT id, first_name, last_name, email, profile_photo_url, updated_at 
FROM agents 
ORDER BY updated_at DESC 
LIMIT 10;
