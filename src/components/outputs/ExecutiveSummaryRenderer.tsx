import React from 'react';
import { FileText, CheckCircle, TrendingUp, AlertCircle, Shield } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ExecutiveSummaryRendererProps {
  content: string;
  structuredData?: {
    executiveBrief?: string;
    keyFindings?: string[];
    strategicImpacts?: string[];
    recommendations?: string[];
    confidenceScore?: string;
  };
}

export function ExecutiveSummaryRenderer({
  content,
  structuredData,
}: ExecutiveSummaryRendererProps) {
  if (!structuredData || !structuredData.keyFindings) {
    return <MarkdownRenderer content={content} />;
  }

  return (
    <div className="space-y-6">
      {/* Header briefing banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-900/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Executive Decision Brief
            </span>
          </div>
          {structuredData.confidenceScore && (
            <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
              Synthesis Confidence: {structuredData.confidenceScore}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {structuredData.executiveBrief || content.slice(0, 200)}
        </p>
      </div>

      {/* Grid: Key Findings & Strategic Impacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Findings */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            <span>Key Findings</span>
          </div>
          <ul className="space-y-2.5">
            {structuredData.keyFindings?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strategic Impacts */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <TrendingUp className="h-4 w-4" />
            <span>Strategic Impacts</span>
          </div>
          <ul className="space-y-2.5">
            {structuredData.strategicImpacts?.map((impact, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold shrink-0 mt-0.5">
                  •
                </span>
                <span>{impact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations Checklist */}
      {structuredData.recommendations && structuredData.recommendations.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Shield className="h-4 w-4" />
            <span>Executive Recommendations</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {structuredData.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5"
              >
                <div className="h-4 w-4 rounded-md border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="text-xs text-slate-300 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Detailed Content View */}
      <div className="pt-4 border-t border-slate-800/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          Full Executive Briefing Text
        </h4>
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}
