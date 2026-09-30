import { supabase } from '@/lib/supabase';
import {
  Transformation,
  SourceDocument,
  Artifact,
  SourceType,
  TransformationSettings,
  ArtifactStatus,
  CanonicalContent,
} from '@/types/transformation';
import { GeneratedArtifact } from '@/types/ai';

export async function createTransformation(
  userId: string,
  title: string,
  sourceType: SourceType,
  settings: TransformationSettings
): Promise<Transformation> {
  const { data, error } = await supabase
    .from('transformations')
    .insert({
      user_id: userId,
      title,
      source_type: sourceType,
      status: 'processing',
      settings,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transformation record: ${error.message}`);
  }

  return data as Transformation;
}

export async function updateTransformationStatus(
  transformationId: string,
  status: 'draft' | 'processing' | 'completed' | 'failed'
): Promise<void> {
  const { error } = await supabase
    .from('transformations')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transformationId);

  if (error) {
    console.error('Failed to update transformation status:', error);
  }
}

export async function saveSourceDocument(
  transformationId: string,
  userId: string,
  doc: {
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    storagePath?: string;
    sourceText?: string;
    sourceHash?: string;
    sourceUrl?: string;
    preprocessingMetadata?: import('@/types/transformation').PreprocessingMetadata;
    canonicalContent?: import('@/types/canonical').CanonicalContent;
    contextSelectionMetadata?: import('@/types/context').ContextSelectionMetadata;
  }
): Promise<SourceDocument> {
  const insertPayload: Record<string, any> = {
    transformation_id: transformationId,
    user_id: userId,
    file_name: doc.fileName || null,
    mime_type: doc.mimeType || null,
    file_size: doc.fileSize || null,
    storage_path: doc.storagePath || null,
    source_text: doc.sourceText || null,
    source_hash: doc.sourceHash || null,
    source_url: doc.sourceUrl || null,
  };

  if (doc.preprocessingMetadata) {
    insertPayload.preprocessing_metadata = doc.preprocessingMetadata;
  }

  if (doc.canonicalContent) {
    insertPayload.canonical_content = doc.canonicalContent;
    insertPayload.canonical_extraction_metadata = doc.canonicalContent.extractionMetadata;
  }

  if (doc.contextSelectionMetadata) {
    insertPayload.context_selection_metadata = doc.contextSelectionMetadata;
  }

  const { data, error } = await supabase
    .from('source_documents')
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    // If optional columns do not exist in table, gracefully fallback without them
    if (
      error.message?.includes('preprocessing_metadata') ||
      error.message?.includes('canonical_content') ||
      error.message?.includes('context_selection_metadata') ||
      error.code === '42703'
    ) {
      delete insertPayload.preprocessing_metadata;
      delete insertPayload.canonical_content;
      delete insertPayload.canonical_extraction_metadata;
      delete insertPayload.context_selection_metadata;
      const { data: retryData, error: retryError } = await supabase
        .from('source_documents')
        .insert(insertPayload)
        .select()
        .single();
      if (retryError) throw new Error(`Failed to save source document metadata: ${retryError.message}`);
      return retryData as SourceDocument;
    }
    throw new Error(`Failed to save source document metadata: ${error.message}`);
  }

  return data as SourceDocument;
}

export async function updateSourceDocumentCanonical(
  transformationId: string,
  canonicalContent: import('@/types/canonical').CanonicalContent
): Promise<void> {
  try {
    await supabase
      .from('source_documents')
      .update({
        canonical_content: canonicalContent,
        canonical_extraction_metadata: canonicalContent.extractionMetadata,
      })
      .eq('transformation_id', transformationId);
  } catch (err) {
    console.warn('Could not update canonical content in source_documents:', err);
  }
}

export async function saveArtifacts(
  transformationId: string,
  userId: string,
  artifacts: GeneratedArtifact[],
  analysisMetadata?: CanonicalContent
): Promise<Artifact[]> {
  const rows = artifacts.map((art) => {
    let safeContent = '';
    if (typeof art.content === 'string') {
      safeContent = art.content;
    } else if (art.content && typeof art.content === 'object') {
      safeContent = JSON.stringify(art.content, null, 2);
    } else if (art.structured_data && typeof art.structured_data === 'object') {
      safeContent = JSON.stringify(art.structured_data, null, 2);
    } else {
      safeContent = String(art.content || '');
    }

    return {
      transformation_id: transformationId,
      user_id: userId,
      artifact_type: art.type,
      content: safeContent,
      status: art.status || 'pending_review',
      metadata: {
        title: art.title || `${art.type} Artefact`,
        ...(art.metadata || {}),
        ...(art.structured_data ? { structured_data: art.structured_data } : {}),
        ...(analysisMetadata ? { analysis: analysisMetadata } : {}),
      },
    };
  });

  const { data, error } = await supabase
    .from('artifacts')
    .insert(rows)
    .select();

  if (error) {
    throw new Error(`Failed to save generated artefacts: ${error.message}`);
  }

  return data as Artifact[];
}

export async function updateArtifactStatus(
  artifactId: string,
  status: ArtifactStatus,
  reviewNotes?: string
): Promise<void> {
  const { data: existing, error: fetchErr } = await supabase
    .from('artifacts')
    .select('metadata')
    .eq('id', artifactId)
    .single();

  if (fetchErr) {
    throw new Error(`Failed to fetch artifact for update: ${fetchErr.message}`);
  }

  const updatedMetadata = {
    ...(existing?.metadata || {}),
    ...(reviewNotes !== undefined ? { review_notes: reviewNotes } : {}),
    reviewed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('artifacts')
    .update({
      status,
      metadata: updatedMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', artifactId);

  if (error) {
    throw new Error(`Failed to update artifact status: ${error.message}`);
  }
}

export async function updateArtifactContent(
  artifactId: string,
  content: string,
  title?: string
): Promise<void> {
  const { data: existing, error: fetchErr } = await supabase
    .from('artifacts')
    .select('metadata')
    .eq('id', artifactId)
    .single();

  if (fetchErr) {
    throw new Error(`Failed to fetch artifact: ${fetchErr.message}`);
  }

  const updatedMetadata = {
    ...(existing?.metadata || {}),
    ...(title ? { title } : {}),
    last_edited_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('artifacts')
    .update({
      content,
      metadata: updatedMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', artifactId);

  if (error) {
    throw new Error(`Failed to save artifact edits: ${error.message}`);
  }
}

export async function getTransformationWithDetails(transformationId: string): Promise<{
  transformation: Transformation;
  sourceDocument: SourceDocument | null;
  artifacts: Artifact[];
}> {
  const { data: transformation, error: tErr } = await supabase
    .from('transformations')
    .select('*')
    .eq('id', transformationId)
    .single();

  if (tErr || !transformation) {
    throw new Error(`Transformation not found: ${tErr?.message || 'Invalid ID'}`);
  }

  const [docsRes, artifactsRes] = await Promise.all([
    supabase
      .from('source_documents')
      .select('*')
      .eq('transformation_id', transformationId)
      .maybeSingle(),
    supabase
      .from('artifacts')
      .select('*')
      .eq('transformation_id', transformationId)
      .order('created_at', { ascending: true }),
  ]);

  return {
    transformation: transformation as Transformation,
    sourceDocument: docsRes.data as SourceDocument | null,
    artifacts: (artifactsRes.data as Artifact[]) || [],
  };
}

export async function listTransformations(limit = 50): Promise<Transformation[]> {
  const { data, error } = await supabase
    .from('transformations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch transformations: ${error.message}`);
  }

  return (data as Transformation[]) || [];
}

export async function deleteTransformation(id: string): Promise<void> {
  const { error } = await supabase
    .from('transformations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete transformation: ${error.message}`);
  }
}

export async function getTransformationStats(): Promise<{
  totalTransformations: number;
  totalArtifacts: number;
  totalFilesProcessed: number;
  recentCount: number;
}> {
  const [tRes, aRes, dRes] = await Promise.all([
    supabase.from('transformations').select('id', { count: 'exact', head: true }),
    supabase.from('artifacts').select('id', { count: 'exact', head: true }),
    supabase.from('source_documents').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalTransformations: tRes.count || 0,
    totalArtifacts: aRes.count || 0,
    totalFilesProcessed: dRes.count || 0,
    recentCount: tRes.count || 0,
  };
}
