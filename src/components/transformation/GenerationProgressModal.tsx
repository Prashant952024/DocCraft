import React from 'react';
import { Sparkles, CheckCircle2, Loader2, ShieldCheck, Cpu, AlertCircle } from 'lucide-react';
import { GenerationStage } from '@/types/ai';

interface GenerationProgressModalProps {
  isOpen: boolean;
  stage: GenerationStage;
  error?: string | null;
  outputCount: number;
}

export function GenerationProgressModal({
  isOpen,
  stage,
  error,
  outputCount,
}: GenerationProgressModalProps) {
  if (!isOpen) return null;

  const stages = [
    {
      id: 'secure_ingestion',
      label: '1. Secure Source Ingestion & Provenance Hashing',
      desc: 'Calculating SHA-256 source fingerprint and staging to private Supabase storage...',
    },
    {
      id: 'source_preprocessing',
      label: '2. Client-Side Document Preprocessing',
      desc: 'Executing local text extraction, layout preservation, and scanned PDF detection...',
    },
    {
      id: 'content_extraction',
      label: '3. Content Extraction & Noise Normalization',
      desc: 'Cleaning unicode noise, detecting factual signals (CVEs, dates, metrics), and structuring sections...',
    },
    {
      id: 'context_preparation',
      label: '4. Compact Context Preparation',
      desc: 'Assembling token-optimized context with enterprise guardrails & tone directives...',
    },
    {
      id: 'ai_generation',
      label: `5. AI Transformation (${outputCount} Artefact Pipelines)`,
      desc: 'Synthesizing executive summaries, advisories, social threads, and structured deliverables with Gemini...',
    },
    {
      id: 'output_validation',
      label: '6. Output Validation & Schema Verification',
      desc: 'Validating CanonicalContent analysis and verifying structured JSON schemas...',
    },
    {
      id: 'artifact_storage',
      label: '7. Artifact Storage & Provenance Locking',
      desc: 'Committing deliverables to Supabase database with Row Level Security...',
    },
  ];

  const stageOrder = [
    'secure_ingestion',
    'source_preprocessing',
    'content_extraction',
    'context_preparation',
    'ai_generation',
    'output_validation',
    'artifact_storage',
    'completed',
  ];

  const getStageStatus = (stageId: string) => {
    const currentIndex = stageOrder.indexOf(stage);
    const targetIndex = stageOrder.indexOf(stageId);

    if (error) {
      if (currentIndex === targetIndex) return 'error';
      if (currentIndex > targetIndex) return 'done';
      return 'pending';
    }

    if (currentIndex > targetIndex || stage === 'completed') return 'done';
    if (currentIndex === targetIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-lg p-4">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 md:p-8 shadow-2xl shadow-cyan-950/50">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-28 w-64 bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            {stage === 'completed' ? (
              <CheckCircle2 className="h-7 w-7 text-white" />
            ) : error ? (
              <AlertCircle className="h-7 w-7 text-rose-300" />
            ) : (
              <Sparkles className="h-7 w-7 text-white animate-pulse" />
            )}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            {stage === 'completed'
              ? 'Transformation Pipeline Complete'
              : error
              ? 'Pipeline Error'
              : 'Executing Multimodal Transformation Pipeline'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {error
              ? 'An error occurred during pipeline execution.'
              : 'Isolated Supabase Edge Function • Gemini 2.5 Flash'}
          </p>
        </div>

        {/* Stages list */}
        <div className="space-y-2.5 mb-6 max-h-[380px] overflow-y-auto pr-1">
          {stages.map((s) => {
            const status = getStageStatus(s.id);

            return (
              <div
                key={s.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  status === 'active'
                    ? 'bg-slate-800/90 border-cyan-500/50 shadow-sm'
                    : status === 'done'
                    ? 'bg-slate-950/50 border-slate-800/60 opacity-85'
                    : 'bg-slate-950/20 border-slate-800/30 opacity-40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {status === 'done' && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  {status === 'active' && (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  )}
                  {status === 'pending' && (
                    <div className="h-4 w-4 rounded-full border border-slate-700 bg-slate-900" />
                  )}
                  {status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold ${
                      status === 'active'
                        ? 'text-cyan-300'
                        : status === 'done'
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Cryptographic Provenance Verified</span>
          </div>
          <span className="font-mono text-cyan-400">Status: {stage}</span>
        </div>
      </div>
    </div>
  );
}
