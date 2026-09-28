import React from 'react';
import { Sparkles, CheckCircle2, Loader2, ShieldCheck, Cpu } from 'lucide-react';
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
      id: 'preparing_source',
      label: 'Preparing source & computing cryptographic SHA-256 hash',
      desc: 'Validating payload fidelity and verifying integrity...',
    },
    {
      id: 'analyzing_content',
      label: 'Analyzing content & extracting key intelligence',
      desc: 'Gemini reasoning engine identifying entities, facts, and structure...',
    },
    {
      id: 'orchestrating_outputs',
      label: `Orchestrating ${outputCount} communication artefacts`,
      desc: 'Applying enterprise tone guardrails and formatting constraints...',
    },
    {
      id: 'persisting_results',
      label: 'Validating response & persisting to secure database',
      desc: 'Storing structured outputs in Row-Level-Security storage...',
    },
  ];

  const getStageStatus = (stageId: string) => {
    const stageOrder = [
      'preparing_source',
      'analyzing_content',
      'orchestrating_outputs',
      'persisting_results',
      'completed',
    ];
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 md:p-8 shadow-2xl shadow-cyan-950/40">
        {/* Glow highlight */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-48 bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            {stage === 'completed' ? (
              <CheckCircle2 className="h-7 w-7 text-white" />
            ) : error ? (
              <Cpu className="h-7 w-7 text-rose-300" />
            ) : (
              <Sparkles className="h-7 w-7 text-white animate-pulse" />
            )}
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            {stage === 'completed'
              ? 'Transformation Complete'
              : error
              ? 'Transformation Interrupted'
              : 'Orchestrating Multimodal Transformation'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {error
              ? 'An error occurred during pipeline execution.'
              : 'Executing isolated Edge Function & Gemini AI processing.'}
          </p>
        </div>

        {/* Stages list */}
        <div className="space-y-3.5 mb-6">
          {stages.map((s) => {
            const status = getStageStatus(s.id);

            return (
              <div
                key={s.id}
                className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                  status === 'active'
                    ? 'bg-slate-800/80 border-cyan-500/40 shadow-sm'
                    : status === 'done'
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
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
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Zero frontend key exposure</span>
          </div>
          <span className="font-mono text-cyan-400">Stage: {stage}</span>
        </div>
      </div>
    </div>
  );
}
