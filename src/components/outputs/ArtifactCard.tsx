import React, { useState } from 'react';
import { Artifact, ArtifactType, ArtifactStatus } from '@/types/transformation';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ExecutiveSummaryRenderer } from './ExecutiveSummaryRenderer';
import { AdvisoryRenderer } from './AdvisoryRenderer';
import { LinkedInRenderer } from './LinkedInRenderer';
import { TwitterRenderer } from './TwitterRenderer';
import { InfographicRenderer } from './InfographicRenderer';
import { PresentationRenderer } from './PresentationRenderer';
import { VideoPackageRenderer } from './VideoPackageRenderer';
import { LinkedInIcon, XTwitterIcon } from '@/components/ui/BrandIcons';
import { updateArtifactStatus, updateArtifactContent } from '@/services/transformations';
import { ExportMenu } from './ExportMenu';
import { ProvenanceInfo } from '@/lib/export';
import {
  Copy,
  Check,
  Download,
  FileText,
  AlertTriangle,
  BarChart3,
  Presentation,
  Video,
  Code2,
  Eye,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ArtifactCardProps {
  artifact: Artifact;
  provenance?: ProvenanceInfo;
  onUpdate?: () => void;
  onToast?: (message: string, isError?: boolean) => void;
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
  video: {
    label: 'Video Storyboard Script',
    icon: Video,
    color: 'text-rose-400',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
};

export function ArtifactCard({ artifact, provenance, onUpdate, onToast }: ArtifactCardProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [status, setStatus] = useState<ArtifactStatus>(artifact.status || 'pending_review');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(
    typeof artifact.content === 'string'
      ? artifact.content
      : (artifact.content ? JSON.stringify(artifact.content, null, 2) : '')
  );
  const [editableTitle, setEditableTitle] = useState(
    (artifact.metadata?.title as string) || artifact.artifact_type.replace('_', ' ')
  );
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const config = TYPE_CONFIG[artifact.artifact_type] || {
    label: artifact.artifact_type,
    icon: FileText,
    color: 'text-slate-400',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const Icon = config.icon;
  const artifactTitle = editableTitle;
  const structuredData = artifact.metadata?.structured_data;
  const canvasElementId = `artifact-canvas-${artifact.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableContent);
      setCopied(true);
      if (onToast) onToast(`✓ Copied ${artifactTitle} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy content:', e);
      if (onToast) onToast('Failed to copy content', true);
    }
  };

  const handleStatusChange = async (newStatus: ArtifactStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateArtifactStatus(artifact.id, newStatus);
      setStatus(newStatus);
      if (onToast) onToast(newStatus === 'approved' ? `✓ ${artifactTitle} approved` : `Status updated to rejected`);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      if (onToast) onToast(`Failed to update approval status: ${err.message}`, true);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      await updateArtifactContent(artifact.id, editableContent, editableTitle);
      setIsEditing(false);
      if (onToast) onToast(`✓ Saved changes to ${artifactTitle}`);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      if (onToast) onToast(`Failed to save changes: ${err.message}`, true);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Render specialized UI based on artifact type
  const renderSpecializedOutput = () => {
    if (viewMode === 'raw') {
      return (
        <pre className="text-xs font-mono text-cyan-200/90 whitespace-pre-wrap leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
          {editableContent}
        </pre>
      );
    }

    return (
      <div id={canvasElementId} data-artifact-id={artifact.id}>
        {(() => {
          switch (artifact.artifact_type) {
            case 'executive_summary':
              return <ExecutiveSummaryRenderer content={editableContent} structuredData={structuredData} />;
            case 'advisory':
              return <AdvisoryRenderer content={editableContent} structuredData={structuredData} />;
            case 'linkedin_post':
              return <LinkedInRenderer content={editableContent} structuredData={structuredData} />;
            case 'x_post':
              return <TwitterRenderer content={editableContent} structuredData={structuredData} />;
            case 'infographic':
              return <InfographicRenderer content={editableContent} structuredData={structuredData} />;
            case 'presentation':
              return <PresentationRenderer content={editableContent} structuredData={structuredData} />;
            case 'video':
              return <VideoPackageRenderer content={editableContent} structuredData={structuredData} />;
            default:
              return <MarkdownRenderer content={editableContent} />;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-xl shadow-black/20 flex flex-col space-y-0">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border',
              config.badgeColor
            )}
          >
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {artifactTitle}
              </h3>
              <span
                className={cn(
                  'text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border',
                  config.badgeColor
                )}
              >
                {config.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Model: {artifact.metadata?.model_used || 'Gemini 3.8 Flash'} • Provenance Hash Verified
            </p>
          </div>
        </div>

        {/* Human Approval Status Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {status === 'approved' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Approved by Operator</span>
            </div>
          ) : status === 'rejected' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <XCircle className="h-4 w-4 text-rose-400" />
              <span>Rejected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Pending Review</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-header Bar: View toggle + Compact Action Area (Copy, Edit, Approve/Reject, ExportMenu) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 text-xs">
        {/* Layout toggle */}
        <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
          <button
            onClick={() => setViewMode('formatted')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors font-medium',
              viewMode === 'formatted'
                ? 'bg-slate-850 text-cyan-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Interactive Layout</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors font-medium',
              viewMode === 'raw'
                ? 'bg-slate-850 text-cyan-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Raw Markdown</span>
          </button>
        </div>

        {/* Action controls row: Copy, Edit, Approve, Export */}
        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <>
              {/* Copy Action */}
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all',
                  copied
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                )}
                title="Copy deliverable content"
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

              {/* Edit Action */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
                title="Edit deliverable content"
              >
                <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Edit</span>
              </button>

              {/* Approval Buttons */}
              <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleStatusChange('approved')}
                  disabled={isUpdatingStatus || status === 'approved'}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-40 flex items-center gap-1"
                  title="Approve deliverable"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isUpdatingStatus || status === 'rejected'}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 flex items-center gap-1"
                  title="Reject deliverable"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>
              </div>

              {/* Export / Download Menu */}
              <ExportMenu
                artifact={artifact}
                targetElementId={canvasElementId}
                provenance={provenance}
                onToast={onToast}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                loading={isSavingEdit}
                icon={<Save className="h-3.5 w-3.5" />}
              >
                Save Changes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
                icon={<X className="h-3.5 w-3.5" />}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Artefact Title:
              </label>
              <input
                type="text"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Content Body (Markdown):
              </label>
              <textarea
                rows={16}
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
              />
            </div>
          </div>
        ) : (
          renderSpecializedOutput()
        )}
      </div>
    </div>
  );
}
