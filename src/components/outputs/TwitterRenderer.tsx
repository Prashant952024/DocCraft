import React from 'react';
import { XTwitterIcon } from '@/components/ui/BrandIcons';
import { MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface TwitterRendererProps {
  content: string;
  structuredData?: {
    thread?: Array<{
      tweetNumber: number;
      content: string;
    }>;
  };
}

export function TwitterRenderer({
  content,
  structuredData,
}: TwitterRendererProps) {
  const tweets = structuredData?.thread || [];

  if (tweets.length === 0) {
    return <MarkdownRenderer content={content} />;
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between px-2 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
          <XTwitterIcon className="h-3.5 w-3.5" />
          Thread Preview ({tweets.length} Tweets)
        </span>
        <span className="text-xs text-slate-400">Optimized for Viral Distribution</span>
      </div>

      <div className="space-y-0">
        {tweets.map((tweet, idx) => (
          <div key={idx} className="relative">
            {/* Thread connector line */}
            {idx < tweets.length - 1 && (
              <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-slate-800" />
            )}

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 mb-3 backdrop-blur-sm relative z-10">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 border border-slate-700 text-sky-400 shrink-0">
                  <XTwitterIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">GovTech Intelligence</span>
                      <span className="text-xs text-slate-500">@DocCraftHQ</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {tweet.tweetNumber}/{tweets.length}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed mb-3 font-sans">
                    {tweet.content}
                  </p>

                  {/* Tweet action metrics */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60 max-w-sm">
                    <div className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="text-[11px]">24</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                      <Repeat2 className="h-3.5 w-3.5" />
                      <span className="text-[11px]">88</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-rose-400 cursor-pointer">
                      <Heart className="h-3.5 w-3.5" />
                      <span className="text-[11px]">412</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer">
                      <BarChart2 className="h-3.5 w-3.5" />
                      <span className="text-[11px]">18.4K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
