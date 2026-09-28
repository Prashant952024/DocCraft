import React from 'react';
import { ArtifactType } from '@/types/transformation';
import { LinkedInIcon, XTwitterIcon } from '@/components/ui/BrandIcons';
import {
  FileText,
  AlertTriangle,
  BarChart3,
  Presentation,
  Video,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OutputTypeSelectorProps {
  selectedOutputs: ArtifactType[];
  setSelectedOutputs: React.Dispatch<React.SetStateAction<ArtifactType[]>>;
}

interface OutputOption {
  id: ArtifactType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  tagColor: string;
}

const OUTPUT_OPTIONS: OutputOption[] = [
  {
    id: 'executive_summary',
    title: 'Executive Summary',
    description: 'High-level synthesis with key findings, strategic takeaways, and actionable metrics.',
    icon: FileText,
    badge: 'Core',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'advisory',
    title: 'Advisory Memo',
    description: 'Structured formal advisory with situation analysis, risks, and prescriptive action steps.',
    icon: AlertTriangle,
    badge: 'Core',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'linkedin_post',
    title: 'LinkedIn Post',
    description: 'Engaging professional breakdown with insight hooks, key takeaways, and strategic hashtags.',
    icon: LinkedInIcon,
    badge: 'Social',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'x_post',
    title: 'X / Twitter Thread',
    description: 'High-impact concise summary and thread formulation designed for rapid viral distribution.',
    icon: XTwitterIcon,
    badge: 'Social',
    tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'infographic',
    title: 'Infographic Structure',
    description: 'Visual hierarchy, stat cards, callouts, and data visualization layout specifications.',
    icon: BarChart3,
    badge: 'Visual Spec',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'presentation',
    title: 'Presentation Slides',
    description: 'Complete slide-by-slide deck outline including slide titles, bullet points, and speaker notes.',
    icon: Presentation,
    badge: 'Slides',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 'video',
    title: 'Video Storyboard Package',
    description: 'Scene-by-scene visual cues, narration voiceover, and on-screen text instructions.',
    icon: Video,
    badge: 'Video Spec',
    tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
];

export function OutputTypeSelector({
  selectedOutputs,
  setSelectedOutputs,
}: OutputTypeSelectorProps) {
  const toggleOutput = (id: ArtifactType) => {
    setSelectedOutputs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedOutputs(OUTPUT_OPTIONS.map((opt) => opt.id));
  };

  const clearAll = () => {
    setSelectedOutputs(['executive_summary']);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Target Communication Artefacts <span className="text-cyan-400">*</span>
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Select one or multiple output formats to transform the source simultaneously.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Select All
          </button>
          <span className="text-slate-700">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {OUTPUT_OPTIONS.map((opt) => {
          const isSelected = selectedOutputs.includes(opt.id);
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => toggleOutput(opt.id)}
              className={cn(
                'group relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none',
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
              )}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-800 border-slate-700/60 text-slate-400 group-hover:text-slate-200'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {opt.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                          opt.tagColor
                        )}
                      >
                        {opt.badge}
                      </span>
                    )}

                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-md border transition-all',
                        isSelected
                          ? 'bg-cyan-500 border-cyan-400 text-black'
                          : 'border-slate-700 bg-slate-950/60'
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                <h4
                  className={cn(
                    'text-sm font-semibold mb-1 transition-colors',
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  )}
                >
                  {opt.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-medium text-cyan-400">
                  <span>Included in pipeline</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
