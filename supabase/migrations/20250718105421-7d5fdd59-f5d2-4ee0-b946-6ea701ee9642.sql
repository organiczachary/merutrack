-- Create storage buckets for training photos and documents
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('training-photos', 'training-photos', true),
  ('training-documents', 'training-documents', false);

-- Create policies for training photos (public bucket)
CREATE POLICY "Anyone can view training photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'training-photos');

CREATE POLICY "Authenticated users can upload training photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'training-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM training_sessions 
    WHERE trainer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR (role = 'supervisor' AND constituency = training_sessions.constituency))
    )
  )
);

CREATE POLICY "Users can update their training photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'training-photos' 
  AND EXISTS (
    SELECT 1 FROM photos 
    WHERE file_path = storage.objects.name 
    AND uploaded_by = auth.uid()
  )
);

CREATE POLICY "Users can delete their training photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'training-photos' 
  AND EXISTS (
    SELECT 1 FROM photos 
    WHERE file_path = storage.objects.name 
    AND uploaded_by = auth.uid()
  )
);

-- Create policies for training documents (private bucket)
CREATE POLICY "Users can view documents for accessible sessions" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'training-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM training_sessions 
    WHERE trainer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR (role = 'supervisor' AND constituency = training_sessions.constituency))
    )
  )
);

CREATE POLICY "Authenticated users can upload training documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'training-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM training_sessions 
    WHERE trainer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND (role = 'admin' OR (role = 'supervisor' AND constituency = training_sessions.constituency))
    )
  )
);

CREATE POLICY "Users can update their training documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'training-documents' 
  AND EXISTS (
    SELECT 1 FROM photos 
    WHERE file_path = storage.objects.name 
    AND uploaded_by = auth.uid()
  )
);

CREATE POLICY "Users can delete their training documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'training-documents' 
  AND EXISTS (
    SELECT 1 FROM photos 
    WHERE file_path = storage.objects.name 
    AND uploaded_by = auth.uid()
  )
);