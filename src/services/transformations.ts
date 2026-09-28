import { supabase } from '@/lib/supabase';
import {
  Transformation,
  SourceDocument,
  Artifact,
  SourceType,
  TransformationSettings,
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
  }
): Promise<SourceDocument> {
  const { data, error } = await supabase
    .from('source_documents')
    .insert({
      transformation_id: transformationId,
      user_id: userId,
      file_name: doc.fileName || null,
      mime_type: doc.mimeType || null,
      file_size: doc.fileSize || null,
      storage_path: doc.storagePath || null,
      source_text: doc.sourceText || null,
      source_hash: doc.sourceHash || null,
      source_url: doc.sourceUrl || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save source document metadata: ${error.message}`);
  }

  return data as SourceDocument;
}

export async function saveArtifacts(
  transformationId: string,
  userId: string,
  artifacts: GeneratedArtifact[],
  analysisMetadata?: Record<string, unknown>
): Promise<Artifact[]> {
  const rows = artifacts.map((art) => ({
    transformation_id: transformationId,
    user_id: userId,
    artifact_type: art.type,
    content: art.content,
    status: 'completed',
    metadata: {
      title: art.title,
      ...(art.metadata || {}),
      ...(analysisMetadata ? { analysis: analysisMetadata } : {}),
    },
  }));

  const { data, error } = await supabase
    .from('artifacts')
    .insert(rows)
    .select();

  if (error) {
    throw new Error(`Failed to save generated artefacts: ${error.message}`);
  }

  return data as Artifact[];
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
