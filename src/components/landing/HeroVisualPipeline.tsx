import React from 'react';
import {
  FileText,
  UploadCloud,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  BarChart3,
  Presentation,
  Video,
  Hash,
  Cpu,
} from 'lucide-react';
import { LinkedInIcon, XTwitterIcon } from '@/components/ui/BrandIcons';

export function HeroVisualPipeline() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-[#0a0f1d]/95 to-slate-950/95 p-6 md:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-950/30">
      {/* Top Window Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-500 ml-2">
            doccraft-orchestrator.internal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="h-3 w-3" />
            Air-Gapped Edge Runtime
          </span>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
            Gemini 2.5 Flash
          </span>
        </div>
      </div>

      {/* Main Grid: Inputs -> AI Engine -> Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Multimodal Ingestion (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
              STAGE 01 • INGESTION
            </span>
            <h4 className="text-sm font-bold text-white">Multimodal Source</h4>
          </div>

          <div className="space-y-2.5">
            {/* PDF Card */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/80 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">incident-advisory.pdf</span>
                <span className="text-[10px] font-mono text-slate-400">PDF • 2.4 MB</span>
              </div>
            </div>

            {/* Image Card */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/80 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                <UploadCloud className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">network-topology.png</span>
                <span className="text-[10px] font-mono text-slate-400">Image • 840 KB</span>
              </div>
            </div>

            {/* URL/Text Card */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/80 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">cve-mitre-alert.txt</span>
                <span className="text-[10px] font-mono text-slate-400">Structured Text</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
            <Hash className="h-3 w-3 shrink-0 text-cyan-400" />
            <span className="truncate">SHA-256: e3b0c44298fc1c...</span>
          </div>
        </div>

        {/* Center Column: DocCraft Intelligence Core (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center space-y-3 py-4 lg:py-0">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
            <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl border border-cyan-500/50 bg-slate-900 text-center shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 mb-3 animate-pulse">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <span className="text-sm font-extrabold text-white tracking-tight">
                DocCraft Core
              </span>
              <span className="text-[10px] font-mono text-cyan-300 mt-1">
                Canonical Synthesis Engine
              </span>
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  Factual Guardrails
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  Zero Leakage
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>1 Source</span>
            <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-cyan-400 font-bold">7 Deliverables</span>
          </div>
        </div>

        {/* Right Column: Multi-Artefact Outputs (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                STAGE 02 • TRANSFORMATION
              </span>
              <h4 className="text-sm font-bold text-white">Generated Communication Artefacts</h4>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Synchronized Outputs
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Executive Summary */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Executive Summary</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                C-Suite briefing & impact metrics
              </p>
            </div>

            {/* Advisory Memo */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Advisory Memo</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Technical threat checklist & IOCs
              </p>
            </div>

            {/* Infographic Spec */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Infographic Spec</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Data charts, gauges & process steps
              </p>
            </div>

            {/* Presentation Slides */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                <Presentation className="h-3.5 w-3.5" />
                <span>Slide Deck (16:9)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Deck outline & speaker talking points
              </p>
            </div>

            {/* LinkedIn Post */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                <LinkedInIcon className="h-3.5 w-3.5" />
                <span>LinkedIn Post</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Insights, takeaways & hashtags
              </p>
            </div>

            {/* Video Package */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1 hover:border-rose-500/40 transition-colors">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                <Video className="h-3.5 w-3.5" />
                <span>Video Storyboard</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Scene cues, voiceover & subtitles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
