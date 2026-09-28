import React, { useState } from 'react';
import { Presentation, ChevronLeft, ChevronRight, Eye, MessageSquare, Lightbulb } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Button } from '@/components/ui/Button';

interface Slide {
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  speakerNotes: string;
  visualCue: string;
}

interface PresentationRendererProps {
  content: string;
  structuredData?: {
    presentationTitle?: string;
    totalSlides?: number;
    slides?: Slide[];
  };
}

export function PresentationRenderer({
  content,
  structuredData,
}: PresentationRendererProps) {
  const slides = structuredData?.slides || [];
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (slides.length === 0) {
    return <MarkdownRenderer content={content} />;
  }

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="space-y-6">
      {/* Slide Deck Viewer Container */}
      <div className="rounded-3xl border border-purple-500/30 bg-slate-950 p-6 md:p-8 shadow-2xl shadow-purple-950/20 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Presentation className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {structuredData?.presentationTitle || 'Executive Presentation Deck'}
              </h3>
              <p className="text-xs text-slate-400">
                Interactive 16:9 Slide Preview with Speaker Notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              icon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              icon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>

        {/* 16:9 Slide Canvas */}
        <div className="relative aspect-[16/9] w-full rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0b101d] to-slate-950 p-6 md:p-10 flex flex-col justify-between shadow-inner">
          {/* Slide Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                DOCCRAFT EXECUTIVE BRIEFING • SLIDE {currentSlideIndex + 1}
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">
                {currentSlide.title}
              </h2>
            </div>
            <span className="text-2xl font-black font-mono text-slate-800 select-none">
              0{currentSlideIndex + 1}
            </span>
          </div>

          {/* Slide Body Bullets */}
          <div className="my-auto py-4">
            <ul className="space-y-3 max-w-2xl">
              {currentSlide.bulletPoints?.map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm md:text-base text-slate-200 leading-relaxed font-sans"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Slide Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-800/60">
            <span>Confidential • Enterprise Briefing</span>
            <span>DocCraft Automated Presentation Synthesis</span>
          </div>
        </div>

        {/* Slide Thumbnail Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-2.5 rounded-xl border text-left shrink-0 transition-all w-36 ${
                currentSlideIndex === idx
                  ? 'bg-purple-500/10 border-purple-500/50 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono block font-bold text-purple-400 mb-0.5">
                SLIDE {idx + 1}
              </span>
              <span className="text-xs font-semibold truncate block">
                {s.title}
              </span>
            </button>
          ))}
        </div>

        {/* Drawer: Speaker Notes & Visual Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Speaker Notes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Speaker Notes & Verbal Talking Points</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{currentSlide.speakerNotes || 'Emphasize the core strategic takeaways and allow time for questions on technical remediation.'}"
            </p>
          </div>

          {/* Visual Recommendations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>Slide Design & Layout Recommendation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentSlide.visualCue || 'Use high-contrast bulleted list with split-screen risk metric card on the right quadrant.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
