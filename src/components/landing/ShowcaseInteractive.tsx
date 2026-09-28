import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  BarChart3,
  Presentation,
  Video,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  Terminal,
} from 'lucide-react';
import { LinkedInIcon, XTwitterIcon } from '@/components/ui/BrandIcons';

export function ShowcaseInteractive() {
  const [selectedFormat, setSelectedFormat] = useState<
    'summary' | 'advisory' | 'infographic' | 'presentation' | 'video'
  >('summary');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
          INTERACTIVE DEMONSTRATION
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          See the Transformation in Action
        </h2>
        <p className="text-sm text-slate-400">
          From one raw technical incident report to tailored executive, advisory, presentation, and visual formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Source Document (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  INGESTED SOURCE
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
                PDF • 2.4 MB
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">
                Critical Incident Advisory: OpenSSL Memory Leak
              </h3>
              <p className="text-xs font-mono text-cyan-300">
                CVE-2026-4412 • CVSS 9.2 (Critical Severity)
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-2 leading-relaxed">
              <div className="text-slate-400 font-bold">EXCERPT:</div>
              <p>
                "A critical memory corruption vulnerability has been identified in the TLS session caching subsystem of enterprise API gateways. An unauthenticated remote attacker can exploit this flaw to cause denial-of-service and arbitrary heap disclosure up to 64KB per handshake request."
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                Impacted: 45 Production Ingress Clusters • Patch: v3.4.1
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono">SHA-256: 8f2b3e...94a1</span>
            <span className="text-emerald-400 font-semibold">Integrity Verified</span>
          </div>
        </div>

        {/* Center / Right Side: Multi-format Output Workspace (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-5">
            {/* Format Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
              {[
                { id: 'summary', label: 'Executive Summary', icon: FileText },
                { id: 'advisory', label: 'Advisory Memo', icon: AlertTriangle },
                { id: 'infographic', label: 'Infographic Spec', icon: BarChart3 },
                { id: 'presentation', label: 'Slide Deck', icon: Presentation },
                { id: 'video', label: 'Video Script', icon: Video },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedFormat === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedFormat(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800/80'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Output Previews */}
            {selectedFormat === 'summary' && (
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-cyan-400">
                    Executive Decision Brief
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Audience: Board & C-Suite
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Executive Assessment: CVE-2026-4412 Perimeter Impact
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Zero confirmed customer data compromise; proactive defense initiated within 2 hours.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>45 production instances queued for rolling container updates to firmware v3.4.1.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Total expected downtime: 0 minutes via high-availability blue/green switchover.</span>
                  </li>
                </ul>
              </div>
            )}

            {selectedFormat === 'advisory' && (
              <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    ADV-2026-4412 • MANDATORY ACTION
                  </span>
                  <span className="text-[10px] font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Priority 1 Emergency
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Affected:</span>
                    <span>Edge Balancers v3.1.2 - v3.4.0</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Remediation:</span>
                    <span className="text-emerald-400">Deploy v3.4.1 & Rotate STEKs</span>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                  WAF Ingress Rule: 941103 (Drop handshake &gt; 16KB)
                </div>
              </div>
            )}

            {selectedFormat === 'infographic' && (
              <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    Visual Intelligence Hierarchy
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Infographic Spec</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-lg font-black text-rose-400">9.2</span>
                    <span className="text-[10px] text-slate-400 block">CVSS Score</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-lg font-black text-white">45</span>
                    <span className="text-[10px] text-slate-400 block">Clusters</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-lg font-black text-emerald-400">&lt; 2h</span>
                    <span className="text-[10px] text-slate-400 block">Target Fix</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span>Stage 1: Isolate WAF</span>
                  <span>→</span>
                  <span>Stage 2: Patch v3.4.1</span>
                  <span>→</span>
                  <span>Stage 3: Rotate Keys</span>
                </div>
              </div>
            )}

            {selectedFormat === 'presentation' && (
              <div className="space-y-3 rounded-2xl border border-purple-500/30 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">
                    SLIDE 01 OF 04 • OVERVIEW DECK
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">16:9 Aspect</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Mitigating CVE-2026-4412: Architecture & Rollout Plan
                </h4>
                <p className="text-xs text-slate-300 italic bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  Speaker Note: "Present the blue/green switchover strategy to assure leadership that zero user disruption will occur."
                </p>
              </div>
            )}

            {selectedFormat === 'video' && (
              <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400">
                    SCENE 01 • VIDEO PRODUCTION SPEC
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Duration: 15s</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <span className="text-amber-400 font-bold block text-[10px] uppercase">Visual:</span>
                  <p className="text-slate-200">Animated map showing gateway clusters and traffic containment.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <span className="text-cyan-400 font-bold block text-[10px] uppercase">Voiceover Track:</span>
                  <p className="text-slate-200 italic">"Our cybersecurity team has deployed targeted mitigations across all edge routers."</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-medium">
            <span>Synchronized from a single ingestion payload</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              DocCraft Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
