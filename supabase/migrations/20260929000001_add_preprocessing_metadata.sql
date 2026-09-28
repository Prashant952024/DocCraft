-- Add preprocessing_metadata JSONB column to source_documents
ALTER TABLE public.source_documents 
ADD COLUMN IF NOT EXISTS preprocessing_metadata JSONB DEFAULT NULL;
