import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple, robust client-side markdown formatter for paragraphs, headings, lists, bold, code
  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushList = () => {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-3 space-y-1.5 list-disc list-inside text-slate-300">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const parseInline = (str: string): React.ReactNode => {
      // Parse bold **text**, code `text`, italic *text*
      const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">{part.slice(1, -1)}</code>;
        }
        return part;
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushList();
        continue;
      }

      // Headings
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={i} className="text-base font-bold text-cyan-300 mt-4 mb-2 flex items-center gap-2">
            {parseInline(line.replace('### ', ''))}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={i} className="text-lg font-bold text-white mt-5 mb-2 pb-1 border-b border-slate-800">
            {parseInline(line.replace('## ', ''))}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={i} className="text-xl font-bold text-white mt-6 mb-3">
            {parseInline(line.replace('# ', ''))}
          </h2>
        );
      }
      // List items
      else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
        inList = true;
        listItems.push(line.replace(/^[-*]\s+|\d+\.\s+/, ''));
      }
      // Blockquote
      else if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={i} className="my-3 border-l-2 border-cyan-500 pl-4 py-1 text-slate-300 italic bg-cyan-950/20 rounded-r-lg">
            {parseInline(line.replace('> ', ''))}
          </blockquote>
        );
      }
      // Regular paragraph
      else {
        flushList();
        elements.push(
          <p key={i} className="text-sm text-slate-300 leading-relaxed my-2">
            {parseInline(line)}
          </p>
        );
      }
    }

    flushList();
    return elements;
  };

  return (
    <div className="prose prose-invert max-w-none text-slate-200">
      {renderFormatted(content)}
    </div>
  );
}
