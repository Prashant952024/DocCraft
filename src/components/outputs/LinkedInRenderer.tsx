import React from 'react';
import { LinkedInIcon } from '@/components/ui/BrandIcons';
import { Globe, ThumbsUp, MessageSquare, Share2, Sparkles, Send } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface LinkedInRendererProps {
  content: string;
  structuredData?: {
    hook?: string;
    body?: string;
    takeaways?: string[];
    callToAction?: string;
    hashtags?: string[];
  };
}

export function LinkedInRenderer({
  content,
  structuredData,
}: LinkedInRendererProps) {
  return (
    <div className="space-y-6">
      {/* Authentic LinkedIn Card Preview */}
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-2xl shadow-black/40 overflow-hidden">
        {/* Post Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-cyan-600 text-white font-bold text-sm shadow-md">
              <LinkedInIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">Enterprise AI Transformation</span>
                <span className="text-xs text-slate-400 font-normal">• 1st</span>
              </div>
              <p className="text-[11px] text-slate-400">Content Intelligence & Executive Briefings</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Just now</span>
                <span>•</span>
                <Globe className="h-3 w-3" />
              </div>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold">
            Social Preview
          </div>
        </div>

        {/* Post Content */}
        <div className="p-5 space-y-4 text-sm text-slate-200 leading-relaxed font-sans">
          {structuredData?.hook ? (
            <>
              <p className="font-semibold text-white text-base leading-snug">
                {structuredData.hook}
              </p>

              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {structuredData.body}
              </div>

              {structuredData.takeaways && structuredData.takeaways.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-cyan-400 block uppercase tracking-wide">
                    Key Executive Takeaways:
                  </span>
                  {structuredData.takeaways.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-blue-400 font-bold">👉</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {structuredData.callToAction && (
                <p className="font-medium text-slate-300 pt-2 border-t border-slate-800/80">
                  {structuredData.callToAction}
                </p>
              )}

              {structuredData.hashtags && structuredData.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {structuredData.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-medium text-blue-400 hover:underline cursor-pointer">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>

        {/* Engagement bar */}
        <div className="px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
          <div className="flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[9px]">👍</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px]">💡</span>
            <span className="text-[11px] ml-1">142 reactions</span>
          </div>
          <span>18 comments • 9 reposts</span>
        </div>

        {/* Social actions footer */}
        <div className="px-3 py-2 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-xs text-slate-400">
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-800/80 transition-colors">
            <ThumbsUp className="h-4 w-4" />
            <span className="hidden sm:inline">Like</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-800/80 transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Comment</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-800/80 transition-colors">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Repost</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-800/80 transition-colors">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
