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