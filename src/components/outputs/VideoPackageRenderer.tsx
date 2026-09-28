import React, { useState } from 'react';
import { Video, Film, Clock, Mic, Subtitles, Eye, ArrowRight } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface VideoScene {
  sceneNumber: number;
  durationSeconds: number;
  visualDescription: string;
  narrationVoiceover: string;
  onScreenText: string;
  transition: string;
}

interface VideoPackageRendererProps {
  content: string;
  structuredData?: {
    title?: string;
    targetDurationSeconds?: number;
    targetFormat?: string;
    scenes?: VideoScene[];
  };
}

export function VideoPackageRenderer({
  content,
  structuredData,
}: VideoPackageRendererProps) {
  const scenes = structuredData?.scenes || [];
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  if (scenes.length === 0) {
    return <MarkdownRenderer content={content} />;
  }

  const totalDuration = scenes.reduce((acc, s) => acc + (s.durationSeconds || 15), 0);

  return (
    <div className="space-y-6">
      {/* Video Package Canvas */}
      <div className="rounded-3xl border border-rose-500/30 bg-slate-950 p-6 md:p-8 shadow-2xl shadow-rose-950/20 space-y-6">
        {/* Video Package Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Video className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {structuredData?.title || 'Executive Video Intelligence Package'}
              </h3>
              <p className="text-xs text-slate-400">
                Production-Ready Storyboard, Narration Script & On-Screen Graphics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Runtime: ~{totalDuration}s ({scenes.length} Scenes)
            </span>
            <span className="text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {structuredData?.targetFormat || '16:9 Landscape'}
            </span>
          </div>
        </div>

        {/* Storyboard Timeline Strip */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Timeline Storyboard Blocks
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {scenes.map((scene, idx) => (
              <div
                key={idx}
                onClick={() => setActiveSceneIndex(idx)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  activeSceneIndex === idx
                    ? 'bg-rose-500/10 border-rose-500/60 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-rose-400">
                    SCENE 0{scene.sceneNumber || idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                    {scene.durationSeconds}s
                  </span>
                </div>
                <p className="text-xs font-medium text-white line-clamp-2 mb-2">
                  {scene.visualDescription}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Transition: {scene.transition || 'Cut'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Scene Detailed View */}
        {scenes[activeSceneIndex] && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-bold uppercase text-white tracking-wide">
                  Scene 0{scenes[activeSceneIndex].sceneNumber || activeSceneIndex + 1} Production Specifications
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                Estimated Duration: {scenes[activeSceneIndex].durationSeconds} Seconds
              </span>
            </div>

            {/* Visual Description */}
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Eye className="h-3.5 w-3.5" />
                Visual Direction & Motion Graphics:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                {scenes[activeSceneIndex].visualDescription}
              </p>
            </div>

            {/* Narration Script */}
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Mic className="h-3.5 w-3.5" />
                Voiceover Narration (Audio Track):
              </span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-sans italic">
                "{scenes[activeSceneIndex].narrationVoiceover}"
              </p>
            </div>

            {/* On-Screen Subtitle */}
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Subtitles className="h-3.5 w-3.5" />
                On-Screen Text Subtitles:
              </span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 font-semibold tracking-wide">
                {scenes[activeSceneIndex].onScreenText || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Full Script Markdown */}
        <div className="pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5 text-slate-400" />
            Full Video Package Documentation
          </h4>
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}
