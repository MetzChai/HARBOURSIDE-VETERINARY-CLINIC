
-- Create storage bucket for pet and owner images
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-images', 'pet-images', true);

-- Allow public read access
CREATE POLICY "Anyone can view pet images"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-images');

-- Allow uploads (prototype - open access)
CREATE POLICY "Anyone can upload pet images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pet-images');

-- Allow updates
CREATE POLICY "Anyone can update pet images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pet-images');

-- Allow deletes
CREATE POLICY "Anyone can delete pet images"
ON storage.objects FOR DELETE
USING (bucket_id = 'pet-images');
