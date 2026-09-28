import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Server, Terminal, ListChecks, FileText } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Badge } from '@/components/ui/Badge';

interface AdvisoryRendererProps {
  content: string;
  structuredData?: {
    advisoryId?: string;
    severity?: 'Critical' | 'High' | 'Medium' | 'Low';
    threatSummary?: string;
    affectedSystems?: string[];
    indicatorsOfCompromise?: string[];
    immediateActions?: string[];
    longTermRecommendations?: string[];
  };
}

export function AdvisoryRenderer({
  content,
  structuredData,
}: AdvisoryRendererProps) {
  if (!structuredData || !structuredData.severity) {
    return <MarkdownRenderer content={content} />;
  }

  const getSeverityBadge = (sev?: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive" className="font-bold">CRITICAL SEVERITY</Badge>;
      case 'high':
        return <Badge variant="warning" className="font-bold">HIGH SEVERITY</Badge>;
      case 'medium':
        return <Badge variant="primary" className="font-bold">MEDIUM SEVERITY</Badge>;
      default:
        return <Badge variant="secondary">LOW SEVERITY</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Formal Advisory Header */}
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-950/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <span className="font-mono text-xs font-bold text-rose-300">
              {structuredData.advisoryId || 'OFFICIAL TECHNICAL ADVISORY'}
            </span>
          </div>
          {getSeverityBadge(structuredData.severity)}
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {structuredData.threatSummary || 'Security advisory detailing potential vulnerability vectors and operational mitigation steps.'}
        </p>
      </div>

      {/* Grid: Affected Systems & IOCs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Affected Systems */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Server className="h-4 w-4" />
            <span>Impacted Systems & Infrastructure</span>
          </div>
          <ul className="space-y-2">
            {structuredData.affectedSystems?.map((sys, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>{sys}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Immediate Actions Required */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
            <ListChecks className="h-4 w-4" />
            <span>Mandatory Immediate Remediation</span>
          </div>
          <ul className="space-y-2">
            {structuredData.immediateActions?.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-bold shrink-0 mt-0.5">
                  !
                </span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Technical Indicators if available */}
      {structuredData.indicatorsOfCompromise && structuredData.indicatorsOfCompromise.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Terminal className="h-4 w-4" />
            <span>Indicators of Compromise & Telemetry Signatures</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 space-y-1 overflow-x-auto">
            {structuredData.indicatorsOfCompromise.map((ioc, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-500 select-none">[{idx + 1}]</span>
                <span>{ioc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Advisory Document Text */}
      <div className="pt-4 border-t border-slate-800/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          Full Advisory Documentation
        </h4>
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}
