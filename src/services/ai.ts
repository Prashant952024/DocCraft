import { supabase } from '@/lib/supabase';
import { AIGenerationRequest, AIGenerationResponse } from '@/types/ai';
import { CanonicalContent } from '@/types/canonical';
import { normalizeCanonicalContent } from './canonical';

export interface ExtractCanonicalRequest {
  sourceText?: string;
  storagePath?: string;
  fileMimeType?: string;
  sourceType?: string;
  language?: string;
  isPreprocessed?: boolean;
  useMultimodalFallback?: boolean;
  preprocessingMetadata?: import('@/types/transformation').PreprocessingMetadata | Record<string, unknown>;
}

/**
 * Phase B: Extract structured CanonicalContent from source document.
 */
export async function extractCanonicalContent(
  req: ExtractCanonicalRequest
): Promise<CanonicalContent> {
  const { data, error } = await supabase.functions.invoke('ai-generate', {
    body: {
      operation: 'extract_canonical',
      sourceText: req.sourceText,
      storagePath: req.storagePath,
      fileMimeType: req.fileMimeType,
      sourceType: req.sourceType || 'text',
      language: req.language || 'English',
      isPreprocessed: req.isPreprocessed,
      useMultimodalFallback: req.useMultimodalFallback,
      preprocessingMetadata: req.preprocessingMetadata,
    },
  });

  if (error) {
    let msg = error.message || 'Canonical extraction failed';
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errorJson = await error.context.json();
        if (errorJson?.error) {
          msg = errorJson.error;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const rawCanonical = data?.canonical || data;
  return normalizeCanonicalContent(
    rawCanonical,
    req.sourceText || '',
    req.sourceType || 'text',
    req.useMultimodalFallback ? 'multimodal' : 'hybrid'
  );
}

/**
 * Phase C/D: Generate communication deliverables from CanonicalContent representation.
 */
export async function generateArtifactsWithAI(
  request: AIGenerationRequest & { canonicalContent?: CanonicalContent }
): Promise<AIGenerationResponse> {
  const { data, error } = await supabase.functions.invoke('ai-generate', {
    body: {
      operation: 'generate_artifacts',
      ...request,
    },
  });

  if (error) {
    let msg = error.message || 'AI Content Transformation failed';
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errorJson = await error.context.json();
        if (errorJson?.error) {
          msg = errorJson.error;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  if (!data || !data.artifacts) {
    throw new Error('Invalid response structure received from AI orchestrator');
  }

  // Ensure analysis conforms to CanonicalContent
  const normalizedAnalysis = normalizeCanonicalContent(
    data.analysis || request.canonicalContent,
    request.sourceText || '',
    request.sourceType || 'text'
  );

  return {
    ...data,
    analysis: normalizedAnalysis,
  } as AIGenerationResponse;
}

/**
 * Unified generation entrypoint with automatic Phase B canonical integration and graceful fallback.
 */
export async function generateContentWithAI(
  request: AIGenerationRequest
): Promise<AIGenerationResponse> {
  const { data, error } = await supabase.functions.invoke('ai-generate', {
    body: {
      operation: 'unified',
      ...request,
    },
  });

  if (error) {
    let msg = error.message || 'AI Content Transformation failed';
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errorJson = await error.context.json();
        if (errorJson?.error) {
          msg = errorJson.error;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  if (!data || !data.artifacts) {
    throw new Error('Invalid response structure received from AI orchestrator');
  }

  const normalizedAnalysis = normalizeCanonicalContent(
    data.analysis,
    request.sourceText || '',
    request.sourceType || 'text'
  );

  return {
    ...data,
    analysis: normalizedAnalysis,
  } as AIGenerationResponse;
}
