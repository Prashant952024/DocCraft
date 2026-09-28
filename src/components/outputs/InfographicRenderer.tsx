import React from 'react';
import { BarChart3, AlertOctagon, TrendingUp, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface InfographicRendererProps {
  content: string;
  structuredData?: {
    headline?: string;
    keyMetrics?: Array<{
      label: string;
      value: string;
      change?: string;
    }>;
    steps?: Array<{
      step: number;
      title: string;
      description: string;
    }>;
    callout?: {
      title: string;
      text: string;
      level?: 'critical' | 'warning' | 'info';
    };
  };
}

export function InfographicRenderer({
  content,
  structuredData,
}: InfographicRendererProps) {
  if (!structuredData || !structuredData.keyMetrics) {
    return <MarkdownRenderer content={content} />;
  }

  return (
    <div className="space-y-6">
      {/* Visual Infographic Poster Canvas */}
      <div className="rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-slate-900 via-[#0a1120] to-slate-950 p-6 md:p-8 shadow-2xl shadow-emerald-950/20 space-y-8">
        {/* Infographic Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <BarChart3 className="h-3.5 w-3.5" />
            Executive Visual Intelligence Spec
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {structuredData.headline || 'Multimodal Intelligence Dashboard'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Synthesized operational telemetry and strategic remediation flow
          </p>
        </div>

        {/* Section 1: Key Metric Cards */}
        {structuredData.keyMetrics && structuredData.keyMetrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {structuredData.keyMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-3xl pointer-events-none" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  {metric.label}
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {metric.value}
                  </span>
                  {metric.change && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {metric.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section 2: Sequential Step Process Flow */}
        {structuredData.steps && structuredData.steps.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 text-center">
              Strategic Execution & Lifecycle Stages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {structuredData.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-extrabold">
                      0{step.step || idx + 1}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-500">Stage {idx + 1}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-tight pt-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Critical Callout Alert */}
        {structuredData.callout && (
          <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 to-slate-900/60 p-5 flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 shrink-0 mt-0.5">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {structuredData.callout.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {structuredData.callout.text}
              </p>
            </div>
          </div>
        )}

        {/* Infographic Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Canonical Spec
          </span>
          <span>DocCraft Automated Visual Transformation</span>
        </div>
      </div>
    </div>
  );
}
