import React, { useState } from 'react';
import { Artifact, ArtifactType } from '@/types/transformation';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LinkedInIcon, XTwitterIcon } from '@/components/ui/BrandIcons';
import {
  Copy,
  Check,
  Download,
  FileText,
  AlertTriangle,
  BarChart3,
  Presentation,
  Headphones,
  Video,
  Code2,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtifactCardProps {
  artifact: Artifact;
}

const TYPE_CONFIG: Record<
  ArtifactType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; badgeColor: string }
> = {
  executive_summary: {
    label: 'Executive Summary',
    icon: FileText,
    color: 'text-cyan-400',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  advisory: {
    label: 'Advisory Memo',
    icon: AlertTriangle,
    color: 'text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  linkedin_post: {
    label: 'LinkedIn Post',
    icon: LinkedInIcon,
    color: 'text-blue-400',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  x_post: {
    label: 'X / Twitter Post',
    icon: XTwitterIcon,
    color: 'text-sky-400',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  infographic: {
    label: 'Infographic Spec',
    icon: BarChart3,
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  presentation: {
    label: 'Presentation Outline',
    icon: Presentation,
    color: 'text-purple-400',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  audio: {
    label: 'Audio Briefing Script',
    icon: Headphones,
    color: 'text-indigo-400',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  video: {
    label: 'Video Storyboard Script',
    icon: Video,
    color: 'text-rose-400',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
};

export function ArtifactCard({ artifact }: ArtifactCardProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  const config = TYPE_CONFIG[artifact.artifact_type] || {
    label: artifact.artifact_type,
    icon: FileText,
    color: 'text-slate-400',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const Icon = config.icon;
  const artifactTitle =
    (artifact.metadata?.title as string) || config.label;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy content:', e);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([artifact.content], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${artifact.artifact_type}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-xl shadow-black/20 flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border',
              config.badgeColor
            )}
          >
            <Icon className={cn('h-4.5 w-4.5', config.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">
                {artifactTitle}
              </h4>
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border',
                  config.badgeColor
                )}
              >
                {config.label}
              </span>
            </div>
          </div>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('formatted')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors',
                viewMode === 'formatted'
                  ? 'bg-slate-850 text-cyan-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors',
                viewMode === 'raw'
                  ? 'bg-slate-850 text-cyan-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Markdown</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              copied
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-750 border-slate-700/60'
            )}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            title="Download as Markdown"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700/60 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 overflow-y-auto max-h-[600px] flex-1">
        {viewMode === 'formatted' ? (
          <MarkdownRenderer content={artifact.content} />
        ) : (
          <pre className="text-xs font-mono text-cyan-200/90 whitespace-pre-wrap leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
            {artifact.content}
          </pre>
        )}
      </div>
    </div>
  );
}
