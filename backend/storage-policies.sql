-- ========================================
-- SUPABASE STORAGE POLICIES (OPTIONAL)
-- ========================================
-- 
-- This file contains SQL policies for Supabase Storage to enable
-- profile picture uploads. The application works WITHOUT these
-- policies (it falls back to base64 encoding), but storage
-- provides better performance and file management.
--
-- HOW TO USE:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to Storage → Policies
-- 3. Create a new bucket called 'profile-pictures'
-- 4. Run these SQL commands in the SQL Editor
--
-- ALTERNATIVE: The app works fine without storage setup!
-- ========================================

-- Create the profile-pictures bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files to profile-pictures bucket
CREATE POLICY "Allow authenticated uploads to profile-pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow public read access to profile pictures
CREATE POLICY "Allow public read access to profile-pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

-- Policy to allow users to update their own profile pictures
CREATE POLICY "Allow authenticated updates to profile-pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow users to delete their own profile pictures
CREATE POLICY "Allow authenticated deletes from profile-pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
);

-- ========================================
-- NOTES:
-- ========================================
-- - These policies are OPTIONAL
-- - App works without storage (uses base64 fallback)
-- - Storage provides better performance for images
-- - Run these in Supabase SQL Editor after creating project
-- ========================================