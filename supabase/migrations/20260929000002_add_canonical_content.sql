-- Add canonical_content and canonical_extraction_metadata JSONB columns to source_documents
ALTER TABLE public.source_documents 
ADD COLUMN IF NOT EXISTS canonical_content JSONB DEFAULT NULL;

ALTER TABLE public.source_documents 
ADD COLUMN IF NOT EXISTS canonical_extraction_metadata JSONB DEFAULT NULL;
