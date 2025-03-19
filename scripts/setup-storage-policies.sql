-- Create exec_sql function if it doesn't exist
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profile Images Policies
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Game Images Policies
CREATE POLICY "Anyone can view game images"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-images');

CREATE POLICY "Users can upload game images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-images' AND
  auth.uid() IN (
    SELECT host_id FROM public.games 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can update game images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'game-images' AND
  auth.uid() IN (
    SELECT host_id FROM public.games 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can delete game images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-images' AND
  auth.uid() IN (
    SELECT host_id FROM public.games 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Location Images Policies
CREATE POLICY "Anyone can view location images"
ON storage.objects FOR SELECT
USING (bucket_id = 'location-images');

CREATE POLICY "Authenticated users can upload location images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'location-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update location images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'location-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete location images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'location-images' AND
  auth.role() = 'authenticated'
); 