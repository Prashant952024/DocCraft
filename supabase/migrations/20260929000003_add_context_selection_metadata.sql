-- Add context_selection_metadata JSONB column to source_documents for Phase C
ALTER TABLE public.source_documents 
ADD COLUMN IF NOT EXISTS context_selection_metadata JSONB DEFAULT NULL;
