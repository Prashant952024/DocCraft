import { supabase } from '@/lib/supabase';
import { AIGenerationRequest, AIGenerationResponse } from '@/types/ai';

export async function generateContentWithAI(
  request: AIGenerationRequest
): Promise<AIGenerationResponse> {
  const { data, error } = await supabase.functions.invoke('ai-generate', {
    body: request,
  });

  if (error) {
    // Graceful error formatting
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

  return data as AIGenerationResponse;
}
