INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "documents_public_select" ON storage.objects
FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "documents_public_insert" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_public_update" ON storage.objects
FOR UPDATE
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_public_delete" ON storage.objects
FOR DELETE
USING (bucket_id = 'documents');
