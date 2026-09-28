import React, { useState, useRef, useEffect } from 'react';
import { Artifact, ArtifactType } from '@/types/transformation';
import {
  Download,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Printer,
  FileCode,
  Copy,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  sanitizeFilename,
  downloadTextFile,
  downloadMarkdownFile,
  downloadJsonFile,
  exportElementToPng,
  getArtifactPlainContent,
  getArtifactMarkdown,
  printArtifactDocument,
  ProvenanceInfo,
} from '@/lib/export';
import { cn } from '@/lib/utils';

interface ExportMenuProps {
  artifact: Artifact;
  targetElementId?: string;
  provenance?: ProvenanceInfo;
  onToast?: (message: string, isError?: boolean) => void;
  className?: string;
}

type ExportFormat = 'md' | 'txt' | 'json' | 'pdf' | 'png' | 'copy';

interface FormatOption {
  id: ExportFormat;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ExportMenu({
  artifact,
  targetElementId,
  provenance,
  onToast,
  className,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const artTitle = (artifact.metadata?.title as string) || artifact.artifact_type.replace('_', ' ');
  const safeFilename = `doccraft_${artifact.artifact_type}_${sanitizeFilename(artTitle)}`;

  const showToast = (msg: string, isErr = false) => {
    if (onToast) {
      onToast(msg, isErr);
    }
  };

  const getFormatOptions = (type: ArtifactType): FormatOption[] => {
    switch (type) {
      case 'executive_summary':
        return [
          { id: 'md', label: 'Download Markdown (.md)', sublabel: 'Standard formatted document', icon: FileText },
          { id: 'txt', label: 'Download Plain Text (.txt)', sublabel: 'Clean plain text', icon: FileText },
          { id: 'pdf', label: 'Export PDF / Print', sublabel: 'Print-ready executive brief', icon: Printer },
        ];

      case 'advisory':
        return [
          { id: 'md', label: 'Download Markdown (.md)', sublabel: 'Technical advisory format', icon: FileText },
          { id: 'txt', label: 'Download Plain Text (.txt)', sublabel: 'Clean raw text format', icon: FileText },
          { id: 'pdf', label: 'Export PDF / Print Memo', sublabel: 'Formal security memo layout', icon: Printer },
        ];

      case 'linkedin_post':
        return [
          { id: 'txt', label: 'Download Post (.txt)', sublabel: 'Optimized social post text', icon: FileText },
          { id: 'md', label: 'Download Markdown (.md)', sublabel: 'Markdown representation', icon: FileText },
          { id: 'copy', label: 'Copy Clean Post Text', sublabel: 'Direct to clipboard', icon: Copy },
        ];

      case 'x_post':
        return [
          { id: 'txt', label: 'Download Thread (.txt)', sublabel: 'Numbered tweet list (1/ 2/ ...)', icon: FileText },
          { id: 'md', label: 'Download Markdown (.md)', sublabel: 'Markdown thread format', icon: FileText },
          { id: 'copy', label: 'Copy Thread Text', sublabel: 'Direct to clipboard', icon: Copy },
        ];

      case 'infographic':
        return [
          { id: 'png', label: 'Download Visual PNG (.png)', sublabel: 'High-resolution graphic canvas', icon: ImageIcon },
          { id: 'pdf', label: 'Export PDF / Print Spec', sublabel: 'Print-ready infographic spec', icon: Printer },
          { id: 'md', label: 'Download Specification (.md)', sublabel: 'Structured metric & step spec', icon: FileText },
          { id: 'json', label: 'Download JSON Spec (.json)', sublabel: 'Raw structured telemetry data', icon: FileCode },
        ];

      case 'presentation':
        return [
          { id: 'pdf', label: 'Export PDF / Print Slides', sublabel: '16:9 Slide pages with notes', icon: Printer },
          { id: 'md', label: 'Download Slide Outline (.md)', sublabel: 'Full slide deck markdown', icon: FileText },
          { id: 'txt', label: 'Download Deck Text (.txt)', sublabel: 'Plain text slide bullets & notes', icon: FileText },
        ];

      case 'video':
        return [
          { id: 'md', label: 'Download Storyboard (.md)', sublabel: 'Scene-by-scene script & timing', icon: FileText },
          { id: 'txt', label: 'Download Narration Script (.txt)', sublabel: 'Plain text voiceover script', icon: FileText },
          { id: 'pdf', label: 'Export PDF / Print Storyboard', sublabel: 'Production-ready briefing format', icon: Printer },
        ];

      default:
        return [
          { id: 'md', label: 'Download Markdown (.md)', icon: FileText },
          { id: 'txt', label: 'Download Text (.txt)', icon: FileText },
          { id: 'pdf', label: 'Export PDF / Print', icon: Printer },
        ];
    }
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      switch (format) {
        case 'md': {
          const mdContent = getArtifactMarkdown(artifact, provenance);
          downloadMarkdownFile(safeFilename, mdContent);
          showToast(`✓ Downloaded ${artTitle} (.md)`);
          break;
        }

        case 'txt': {
          const plainContent = getArtifactPlainContent(artifact);
          downloadTextFile(safeFilename, plainContent);
          showToast(`✓ Downloaded ${artTitle} (.txt)`);
          break;
        }

        case 'json': {
          const data = artifact.metadata?.structured_data || { content: artifact.content };
          downloadJsonFile(safeFilename, data);
          showToast(`✓ Downloaded ${artTitle} spec (.json)`);
          break;
        }

        case 'pdf': {
          printArtifactDocument(artifact, provenance);
          showToast(`✓ Opened Print / PDF Dialog for ${artTitle}`);
          break;
        }

        case 'png': {
          let element: HTMLElement | null = null;
          if (targetElementId) {
            element = document.getElementById(targetElementId);
          }
          if (!element) {
            // Fallback: look for generic render container or parent
            element = document.querySelector(`[data-artifact-id="${artifact.id}"]`);
          }

          if (element) {
            await exportElementToPng(element, safeFilename);
            showToast(`✓ Exported ${artTitle} image (.png)`);
          } else {
            // Fallback to markdown download if DOM element not found
            const mdContent = getArtifactMarkdown(artifact, provenance);
            downloadMarkdownFile(safeFilename, mdContent);
            showToast(`✓ Downloaded ${artTitle} specification`);
          }
          break;
        }

        case 'copy': {
          const plainContent = getArtifactPlainContent(artifact);
          await navigator.clipboard.writeText(plainContent);
          showToast(`✓ Copied ${artTitle} to clipboard`);
          break;
        }
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (err: any) {
      console.error('Export error:', err);
      showToast('Unable to export this artifact. Please try again.', true);
    } finally {
      setIsExporting(false);
    }
  };

  const options = getFormatOptions(artifact.artifact_type);
  const primaryOption = options[0];

  return (
    <div className={cn('relative inline-flex items-center', className)} ref={menuRef}>
      {/* Segmented Button: Primary Action + Dropdown Trigger */}
      <div className="inline-flex rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-sm p-0.5">
        {/* Primary Download Button */}
        <button
          type="button"
          onClick={() => handleExport(primaryOption.id)}
          disabled={isExporting}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            exportSuccess
              ? 'bg-emerald-500/20 text-emerald-300 font-bold'
              : 'text-slate-200 hover:text-white hover:bg-slate-700/80'
          )}
          title={`Download ${primaryOption.label}`}
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
          ) : exportSuccess ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Download className="h-3.5 w-3.5 text-cyan-400" />
          )}
          <span>{exportSuccess ? 'Downloaded' : 'Download'}</span>
        </button>

        {/* Dropdown Toggle Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isExporting}
          className={cn(
            'px-1.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors border-l border-slate-700/60',
            isOpen && 'bg-slate-700/90 text-cyan-400'
          )}
          title="Choose export format"
        >
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Export Deliverable
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
              {artifact.artifact_type.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-0.5">
            {options.map((opt) => {
              const IconComponent = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleExport(opt.id)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:text-white hover:bg-slate-800/90 transition-all group"
                >
                  <div className="p-1 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors shrink-0 mt-0.5">
                    <IconComponent className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-200 group-hover:text-white leading-tight">
                      {opt.label}
                    </div>
                    {opt.sublabel && (
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
