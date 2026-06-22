-- Remove permissive anonymous storage policies on pet-images
DROP POLICY IF EXISTS "Anyone can upload pet images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update pet images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete pet images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pet images" ON storage.objects;

-- Allow only authenticated users to upload to the pet-images bucket
CREATE POLICY "Authenticated users can upload pet images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pet-images');

-- Allow only authenticated users to update objects in the pet-images bucket
CREATE POLICY "Authenticated users can update pet images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'pet-images')
WITH CHECK (bucket_id = 'pet-images');

-- Allow only authenticated users to delete objects in the pet-images bucket
CREATE POLICY "Authenticated users can delete pet images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'pet-images');

-- NOTE: No broad SELECT policy is created. The bucket stays public so existing
-- public image URLs continue to load by direct path, but anonymous clients can
-- no longer LIST the contents of the bucket.