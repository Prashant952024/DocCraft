import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTransformationWithDetails,
  deleteTransformation,
} from '@/services/transformations';
import {
  Transformation,
  SourceDocument,
  Artifact,
  ArtifactType,
  CanonicalContent,
} from '@/types/transformation';
import { ArtifactCard } from '@/components/outputs/ArtifactCard';
import { ExportMenu } from '@/components/outputs/ExportMenu';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatBytes } from '@/lib/utils';
import { LinkedInIcon, XTwitterIcon } from '@/components/ui/BrandIcons';
import { downloadAllArtifacts, ProvenanceInfo } from '@/lib/export';
import {
  Sparkles,
  ArrowLeft,
  Layers,
  FileCheck,
  Hash,
  Trash2,
  Loader2,
  AlertTriangle,
  Lightbulb,
  Tag,
  Users,
  CheckCircle2,
  FileText,
  BarChart3,
  Presentation,
  Video,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  ShieldAlert,
  Globe,
  Download,
  Check,
  Eye,
  ExternalLink,
  TrendingUp,
  CheckSquare,
  Quote,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sliders,
  Filter,
  Zap,
  ArrowDownRight,
} from 'lucide-react';
import { normalizeCanonicalContent } from '@/services/canonical';
import {
  selectContextsForOutputs,
  buildContextSelectionMetadata,
  OUTPUT_TOKEN_BUDGETS,
} from '@/services/contextSelector';
import { ContextSelectionMetadata, SelectedAIContext } from '@/types/context';

export function TransformationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [transformation, setTransformation] = useState<Transformation | null>(null);
  const [sourceDoc, setSourceDoc] = useState<SourceDocument | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsError, setToastIsError] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const showToast = (msg: string, isErr = false) => {
    setToastMessage(msg);
    setToastIsError(isErr);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getTransformationWithDetails(id);
      setTransformation(data.transformation);
      setSourceDoc(data.sourceDocument);
      setArtifacts(data.artifacts);
    } catch (err: any) {
      setError(err.message || 'Failed to load transformation workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this transformation?')) return;

    setDeleting(true);
    try {
      await deleteTransformation(id);
      navigate('/history');
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, true);
      setDeleting(false);
    }
  };

  const provenance: ProvenanceInfo | undefined = transformation
    ? {
        sourceHash: sourceDoc?.source_hash,
        transformationId: transformation.id,
        transformationTitle: transformation.title,
        createdAt: transformation.created_at,
        modelUsed: artifacts[0]?.metadata?.model_used || 'Gemini 3.8 Flash',
      }
    : undefined;

  const handleDownloadAll = async () => {
    if (artifacts.length === 0) return;
    setIsDownloadingAll(true);
    showToast(`Downloading all ${artifacts.length} deliverables...`);
    try {
      await downloadAllArtifacts(
        artifacts,
        provenance,
        (completed, total, currentName) => {
          showToast(`Exporting deliverable ${completed} of ${total}: ${currentName}...`);
        }
      );
      showToast(`✓ All ${artifacts.length} deliverables downloaded successfully`);
    } catch (err: any) {
      console.error('Download all error:', err);
      showToast('Unable to download all deliverables. Please try again.', true);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const getArtifactIcon = (type: ArtifactType) => {
    switch (type) {
      case 'executive_summary':
        return <FileText className="h-3.5 w-3.5 text-cyan-400" />;
      case 'advisory':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      case 'linkedin_post':
        return <LinkedInIcon className="h-3.5 w-3.5 text-blue-400" />;
      case 'x_post':
        return <XTwitterIcon className="h-3.5 w-3.5 text-sky-400" />;
      case 'infographic':
        return <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />;
      case 'presentation':
        return <Presentation className="h-3.5 w-3.5 text-purple-400" />;
      case 'video':
        return <Video className="h-3.5 w-3.5 text-rose-400" />;
      default:
        return <Layers className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
        <p className="text-sm font-medium">Loading transformation workspace...</p>
      </div>
    );
  }

  if (error || !transformation) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/60">
        <AlertTriangle className="h-10 w-10 text-rose-400 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Transformation Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">{error || 'Invalid identifier requested'}</p>
        <Button variant="secondary" onClick={() => navigate('/dashboard')} icon={<ArrowLeft className="h-4 w-4" />}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const [activeContextProfile, setActiveContextProfile] = useState<string>('executive_summary');
  const [showDistilledPrompt, setShowDistilledPrompt] = useState<boolean>(false);

  const rawAnalysis =
    sourceDoc?.canonical_content ||
    (artifacts[0]?.metadata?.analysis as CanonicalContent) ||
    null;

  const analysis: CanonicalContent | null = rawAnalysis
    ? normalizeCanonicalContent(
        rawAnalysis,
        sourceDoc?.source_text || '',
        transformation?.source_type || 'text'
      )
    : null;

  const currentArtifact = artifacts.find(
    (a) => a.id === activeTab || a.artifact_type === activeTab
  );

  const approvedCount = artifacts.filter((a) => a.status === 'approved').length;

  const targetTypes: ArtifactType[] = React.useMemo(() => {
    if (artifacts.length > 0) {
      return Array.from(new Set(artifacts.map((a) => a.artifact_type))) as ArtifactType[];
    }
    return ['executive_summary', 'advisory', 'linkedin_post'] as ArtifactType[];
  }, [artifacts]);

  const contextSelectionData = React.useMemo(() => {
    if (!analysis) return null;
    const selectedContexts = selectContextsForOutputs(analysis, targetTypes);
    const metadata: ContextSelectionMetadata =
      sourceDoc?.context_selection_metadata ||
      buildContextSelectionMetadata(selectedContexts, analysis);
    return { selectedContexts, metadata };
  }, [analysis, sourceDoc?.context_selection_metadata, targetTypes]);

  useEffect(() => {
    if (artifacts.length > 0 && !artifacts.some((a) => a.artifact_type === activeContextProfile)) {
      setActiveContextProfile(artifacts[0].artifact_type);
    }
  }, [artifacts, activeContextProfile]);

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border animate-in slide-in-from-bottom-3 duration-200 ${
            toastIsError
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-slate-900/95 border-cyan-500/40 text-cyan-200'
          }`}
        >
          {toastIsError ? (
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                DocCraft Intelligence Workspace
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{formatDate(transformation.created_at)}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {transformation.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global Download All Button */}
          {artifacts.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadAll}
              loading={isDownloadingAll}
              icon={<Download className="h-3.5 w-3.5" />}
              className="font-bold shadow-lg shadow-cyan-500/20"
            >
              Download All ({artifacts.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/create')}
            icon={<Sparkles className="h-3.5 w-3.5 text-cyan-400" />}
          >
            New Transformation
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            icon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Header Summary Banner */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl shadow-black/20 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Transformation Status</span>
            {transformation.status === 'completed' ? (
              <Badge variant="success" className="gap-1.5 py-1 px-3">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completed & Validated
              </Badge>
            ) : transformation.status === 'processing' ? (
              <Badge variant="warning" className="gap-1.5 py-1 px-3">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing AI Deliverables
              </Badge>
            ) : transformation.status === 'failed' ? (
              <Badge variant="destructive" className="gap-1.5 py-1 px-3">
                <AlertTriangle className="h-3.5 w-3.5" />
                Transformation Failed
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5 py-1 px-3">
                Draft
              </Badge>
            )}
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Source Modality</span>
            <span className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-cyan-400" />
              {transformation.source_type}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Generated Artefacts</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-400" />
              {artifacts.length} Formats
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Human Approval</span>
            <span className="text-xs font-bold text-cyan-300">
              {approvedCount} of {artifacts.length} Approved
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {sourceDoc?.source_hash && (
            <div className="flex items-center gap-2 bg-slate-950/90 px-3.5 py-2.5 rounded-2xl border border-cyan-500/30 text-xs">
              <Hash className="h-4 w-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-cyan-400 block font-bold uppercase tracking-wider">
                  SHA-256 Source Fingerprint
                </span>
                <span className="font-mono text-[11px] text-slate-200 truncate block max-w-xs">
                  {sourceDoc.source_hash}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          <span>Source Intelligence & Overview</span>
        </button>

        {artifacts.map((art) => {
          const isActive = activeTab === art.id || activeTab === art.artifact_type;
          const artTitle = (art.metadata?.title as string) || (art.artifact_type ? art.artifact_type.replace('_', ' ') : 'Artefact');

          return (
            <button
              key={art.id}
              onClick={() => setActiveTab(art.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 capitalize ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {getArtifactIcon(art.artifact_type)}
              <span>{artTitle}</span>
              {art.status === 'approved' && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Deliverables Matrix: Transformation Complete Showcase */}
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex h-2 w-2 rounded-full ${transformation.status === 'failed' ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${transformation.status === 'failed' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {transformation.status === 'failed' ? 'TRANSFORMATION FAILED' : 'TRANSFORMATION COMPLETE'}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  {artifacts.length > 0
                    ? `${artifacts.length} Communication Deliverables Generated from 1 Multimodal Source`
                    : 'Transformation Deliverables'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {artifacts.length > 0
                    ? 'Review, edit, approve, or download each format individually or in batch.'
                    : 'Status information for this transformation.'}
                </p>
              </div>

              {artifacts.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadAll}
                  loading={isDownloadingAll}
                  icon={<Download className="h-3.5 w-3.5" />}
                  className="font-bold shadow-lg shadow-cyan-500/20"
                >
                  Download All Deliverables
                </Button>
              )}
            </div>

            {/* Grid of Deliverables or Empty State */}
            {artifacts.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">
                  {transformation.status === 'processing'
                    ? 'AI Transformation is still processing...'
                    : transformation.status === 'failed'
                    ? 'AI Transformation could not generate deliverables.'
                    : 'No generated deliverables found for this transformation.'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {transformation.status === 'processing'
                    ? 'Gemini is processing your multimodal source document. Please refresh in a moment.'
                    : 'You can create a new transformation with the same source document.'}
                </p>
                <Button variant="secondary" size="sm" onClick={() => navigate('/create')}>
                  Create New Transformation
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artifacts.map((art) => {
                  const artTitle = (art.metadata?.title as string) || (art.artifact_type ? art.artifact_type.replace('_', ' ') : 'Deliverable');
                  const isApproved = art.status === 'approved';
                  const contentPreview = typeof art.content === 'string'
                    ? art.content
                    : (art.content ? JSON.stringify(art.content) : '');

                  return (
                    <div
                      key={art.id}
                      className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                              {getArtifactIcon(art.artifact_type)}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {art.artifact_type.replace('_', ' ')}
                              </span>
                              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                                {artTitle}
                              </h4>
                            </div>
                          </div>

                          {isApproved ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <Check className="h-3 w-3" /> Approved
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              Pending Review
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                          {contentPreview.slice(0, 140)}...
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-900">
                        <button
                          type="button"
                          onClick={() => setActiveTab(art.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Preview</span>
                        </button>

                        <ExportMenu
                          artifact={art}
                          provenance={provenance}
                          onToast={showToast}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Phase B: Canonical Content Intelligence Panel */}
          {analysis && (
            <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Source Intelligence & Canonical Knowledge Graph
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Phase B Engine
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Unified intermediate semantic representation • Reusable across all deliverable formats
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="cyan" className="font-bold">
                    {analysis.validation_status || 'VALIDATED'}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    Language: {analysis.language || analysis.detected_language || 'English'}
                  </span>
                </div>
              </div>

              {/* Extraction Metrics Real Counts Bar */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  Canonical Metrics:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-emerald-300 font-medium">
                  Facts: {analysis.facts?.length || 0}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-blue-300 font-medium">
                  Entities: {analysis.entities?.length || 0}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-amber-300 font-medium">
                  Figures: {analysis.figures?.length || 0}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-purple-300 font-medium">
                  Dates: {analysis.dates?.length || 0}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-rose-300 font-medium">
                  Events: {analysis.events?.length || 0}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-orange-300 font-medium">
                  Actions: {analysis.actions?.length || 0}
                </span>
                {analysis.tables?.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300 font-medium">
                    Tables: {analysis.tables.length}
                  </span>
                )}
                {analysis.quotes?.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-pink-300 font-medium">
                    Quotes: {analysis.quotes.length}
                  </span>
                )}
              </div>

              {/* Source Distillation Summary */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Executive Distillation
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Content Type: {analysis.contentType || analysis.content_type || 'Document'}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {analysis.summary}
                </p>
              </div>

              {/* Key Figures & Statistical Metrics */}
              {analysis.figures && analysis.figures.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>Key Figures, Metrics & Measurements ({analysis.figures.length})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {analysis.figures.map((fig, idx) => (
                      <div
                        key={fig.id || idx}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors"
                      >
                        <span className="text-lg font-extrabold text-amber-300 font-mono block">
                          {fig.value}
                        </span>
                        <span className="text-xs font-semibold text-white block mt-0.5 truncate">
                          {fig.label || 'Metric'}
                        </span>
                        {fig.context && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                            {fig.context}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Two Column Grid: Facts & Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Facts */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verified Key Facts ({analysis.facts?.length || 0})</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {analysis.facts && analysis.facts.length > 0 ? (
                      analysis.facts.map((fact, idx) => (
                        <li
                          key={fact.id || idx}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-850 text-xs text-slate-200 leading-relaxed"
                        >
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                              fact.importance === 'high'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {fact.importance || 'fact'}
                          </span>
                          <span className="flex-1">{fact.statement}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-500">No structured facts parsed.</li>
                    )}
                  </ul>
                </div>

                {/* Actions & Recommendations */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                    <CheckSquare className="h-4 w-4" />
                    <span>Identified Actions & Recommendations ({analysis.actions?.length || 0})</span>
                  </div>
                  <ul className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {analysis.actions && analysis.actions.length > 0 ? (
                      analysis.actions.map((act, idx) => (
                        <li
                          key={act.id || idx}
                          className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850 text-xs text-slate-200 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white">{act.action}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                act.priority === 'critical'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : act.priority === 'high'
                                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {act.priority || 'Action'}
                            </span>
                          </div>
                          {act.rationale && (
                            <p className="text-[11px] text-slate-400 leading-tight">
                              Rationale: {act.rationale}
                            </p>
                          )}
                          {act.deadline && (
                            <span className="text-[10px] font-mono text-cyan-300 block">
                              Deadline: {act.deadline}
                            </span>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-500">No explicit actions identified.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Entities & Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entities */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                    <Users className="h-4 w-4" />
                    <span>Extracted Semantic Entities ({analysis.entities?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                    {analysis.entities && analysis.entities.length > 0 ? (
                      analysis.entities.map((entity, idx) => (
                        <div
                          key={entity.id || idx}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center gap-1.5"
                        >
                          <span className="font-semibold text-white">{entity.name}</span>
                          <span className="text-[10px] font-mono text-blue-400 uppercase bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800/60">
                            {entity.type}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No entities detected.</span>
                    )}
                  </div>
                </div>

                {/* Timeline & Events */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                    <Clock className="h-4 w-4" />
                    <span>Events & Timeline ({analysis.events?.length || 0})</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {analysis.events && analysis.events.length > 0 ? (
                      analysis.events.map((evt, idx) => (
                        <div
                          key={evt.id || idx}
                          className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850 text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{evt.title}</span>
                            {evt.date && (
                              <span className="text-[10px] font-mono text-cyan-300">{evt.date}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{evt.description}</p>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No events detected.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tables & Direct Quotes if available */}
              {(analysis.tables?.length > 0 || analysis.quotes?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Structured Tables */}
                  {analysis.tables && analysis.tables.length > 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                        <TableIcon className="h-4 w-4" />
                        <span>Structured Tables ({analysis.tables.length})</span>
                      </div>
                      <div className="space-y-4">
                        {analysis.tables.map((tbl, tIdx) => (
                          <div key={tbl.id || tIdx} className="overflow-x-auto rounded-xl border border-slate-800">
                            {tbl.title && (
                              <div className="bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 border-b border-slate-800">
                                {tbl.title}
                              </div>
                            )}
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                  {Array.isArray(tbl.headers) && tbl.headers.map((h, hIdx) => (
                                    <th key={hIdx} className="p-2">
                                      {typeof h === 'object' ? JSON.stringify(h) : String(h ?? '')}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850 text-slate-300 font-mono text-[11px]">
                                {Array.isArray(tbl.rows) && tbl.rows.map((row, rIdx) => {
                                  const cells = Array.isArray(row)
                                    ? row
                                    : (typeof row === 'object' && row !== null ? Object.values(row) : [row]);
                                  return (
                                    <tr key={rIdx} className="hover:bg-slate-900/40">
                                      {cells.map((cell, cIdx) => (
                                        <td key={cIdx} className="p-2">
                                          {typeof cell === 'object' ? JSON.stringify(cell) : String(cell ?? '')}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Quotes */}
                  {analysis.quotes && analysis.quotes.length > 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                        <Quote className="h-4 w-4" />
                        <span>Attributed Direct Quotes ({analysis.quotes.length})</span>
                      </div>
                      <div className="space-y-3">
                        {analysis.quotes.map((q, qIdx) => (
                          <blockquote
                            key={q.id || qIdx}
                            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 border-l-2 border-l-pink-400 text-xs italic text-slate-300"
                          >
                            <p>"{q.text}"</p>
                            {(q.speaker || q.role) && (
                              <cite className="not-italic text-[11px] text-pink-300 font-semibold block mt-1.5">
                                — {q.speaker} {q.role ? `(${q.role})` : ''}
                              </cite>
                            )}
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Phase C: Context Reduction & Output-Aware Context Selection */}
          {contextSelectionData && (
            <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        AI Context Optimization & Context Selection
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Phase C Engine
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Deterministic output-aware context pruning • Sends only targeted semantic subsets to Gemini
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    -{contextSelectionData.metadata.reductionRatio}% Average Reduction
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    0 API Calls (Local Deterministic)
                  </span>
                </div>
              </div>

              {/* Context Optimization Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-cyan-400" />
                    Original Canonical Graph
                  </span>
                  <p className="text-lg font-bold text-white font-mono">
                    ~{contextSelectionData.metadata.originalTokens.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">tokens</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    Avg. Selected Payload
                  </span>
                  <p className="text-lg font-bold text-emerald-300 font-mono">
                    ~{contextSelectionData.metadata.selectedTokens.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-400">tokens</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block flex items-center gap-1">
                    <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
                    Token Efficiency Ratio
                  </span>
                  <p className="text-lg font-bold text-emerald-400 font-mono">
                    {contextSelectionData.metadata.reductionRatio > 0 ? `-${contextSelectionData.metadata.reductionRatio}%` : '0%'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block flex items-center gap-1">
                    <Filter className="h-3.5 w-3.5 text-amber-400" />
                    Optimized Deliverables
                  </span>
                  <p className="text-lg font-bold text-amber-300 font-mono">
                    {Object.keys(contextSelectionData.selectedContexts).length}{' '}
                    <span className="text-xs font-normal text-slate-400">profiles</span>
                  </p>
                </div>
              </div>

              {/* Deliverable Profile Switcher Tabs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                    Output-Specific Context Profiles
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click deliverable to inspect selected fields & pruning rationale
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.keys(contextSelectionData.selectedContexts).map((typeKey) => {
                    const type = typeKey as ArtifactType;
                    const ctx = (contextSelectionData.selectedContexts as Record<string, SelectedAIContext>)[type];
                    if (!ctx) return null;
                    const isActive = activeContextProfile === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActiveContextProfile(type)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          isActive
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-lg shadow-emerald-950/30'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {getArtifactIcon(type)}
                        <span>
                          {type === 'executive_summary'
                            ? 'Executive Summary'
                            : type === 'advisory'
                            ? 'Advisory Memo'
                            : type === 'linkedin_post'
                            ? 'LinkedIn Post'
                            : type === 'x_post'
                            ? 'X Thread'
                            : type === 'infographic'
                            ? 'Infographic'
                            : type === 'presentation'
                            ? 'Presentation'
                            : type === 'video'
                            ? 'Video Storyboard'
                            : type}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-emerald-500/30 text-emerald-200'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          -{ctx.reductionRatio}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Profile Details Panel */}
              {(() => {
                const activeCtx: SelectedAIContext | undefined = (contextSelectionData.selectedContexts as Record<string, SelectedAIContext>)[activeContextProfile];
                if (!activeCtx) return null;
                return (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-855 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          {activeContextProfile.replace('_', ' ')} Profile
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-mono text-slate-300">
                          Estimated Context: ~{activeCtx.estimatedTokens} tokens
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-mono text-slate-400">
                          Budget Limit: {OUTPUT_TOKEN_BUDGETS[activeCtx.outputType] || 5000} tokens
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        -{activeCtx.reductionRatio}% Saved
                      </span>
                    </div>

                    {/* Pruning & Inclusion Rationale */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Deterministic Pruning Rationale
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {activeCtx.selectionReason.map((reason: string, rIdx: number) => (
                          <li key={rIdx} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Selected vs Excluded Fields Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Selected / Retained Fields */}
                      <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/20">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Retained Semantic Context
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeCtx.facts.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-medium">
                              Facts ({activeCtx.facts.length})
                            </span>
                          )}
                          {activeCtx.figures.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[11px] font-medium">
                              Figures ({activeCtx.figures.length})
                            </span>
                          )}
                          {activeCtx.actions.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-orange-950/60 border border-orange-800/60 text-orange-300 text-[11px] font-medium">
                              Actions ({activeCtx.actions.length})
                            </span>
                          )}
                          {activeCtx.entities.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/60 text-blue-300 text-[11px] font-medium">
                              Entities ({activeCtx.entities.length})
                            </span>
                          )}
                          {activeCtx.dates.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[11px] font-medium">
                              Dates ({activeCtx.dates.length})
                            </span>
                          )}
                          {activeCtx.tables.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-[11px] font-medium">
                              Tables ({activeCtx.tables.length})
                            </span>
                          )}
                          {activeCtx.quotes.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-pink-950/60 border border-pink-800/60 text-pink-300 text-[11px] font-medium">
                              Quotes ({activeCtx.quotes.length})
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium">
                            Distilled Summary
                          </span>
                        </div>
                      </div>

                      {/* Pruned / Excluded Fields */}
                      <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Filter className="h-3.5 w-3.5 text-slate-500" />
                          Pruned / Excluded Fields
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeCtx.excludedFields.length > 0 ? (
                            activeCtx.excludedFields.map((f: string, fIdx: number) => (
                              <span
                                key={fIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 text-[11px] font-mono line-through decoration-slate-600"
                              >
                                {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">None (Full context permitted within budget)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Prompt Payload Preview */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDistilledPrompt(!showDistilledPrompt)}
                        className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        {showDistilledPrompt ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                        <span>{showDistilledPrompt ? 'Hide Gemini Prompt Context Payload' : 'Preview Gemini Prompt Context Payload'}</span>
                      </button>

                      {showDistilledPrompt && (
                        <pre className="mt-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60 leading-relaxed whitespace-pre-wrap">
                          {JSON.stringify(
                            {
                              targetOutput: activeContextProfile,
                              estimatedTokens: activeCtx.estimatedTokens,
                              reductionRatio: `${activeCtx.reductionRatio}%`,
                              summary: activeCtx.sourceSummary,
                              factsCount: activeCtx.facts.length,
                              figuresCount: activeCtx.figures.length,
                              actionsCount: activeCtx.actions.length,
                              entitiesCount: activeCtx.entities.length,
                              tablesCount: activeCtx.tables.length,
                              quotesCount: activeCtx.quotes.length,
                            },
                            null,
                            2
                          )}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Phase 11: Cryptographic Provenance & Preprocessing Audit Record */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                Source Provenance & Preprocessing Audit Record
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                Transformation ID: {transformation.id.slice(0, 8)}...
              </span>
            </div>

            {/* Source Provenance Grid */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                Original Source Provenance
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Original Source File</span>
                  <p className="font-semibold text-white truncate">
                    {sourceDoc?.file_name || 'Direct Text Input'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Original SHA-256 Fingerprint</span>
                  <p className="font-mono text-cyan-300 truncate" title={sourceDoc?.source_hash || 'N/A'}>
                    {sourceDoc?.source_hash || 'Calculated at ingestion'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Storage Retention</span>
                  <p className="font-semibold text-slate-200">
                    {sourceDoc?.storage_path ? 'Private Supabase Storage' : 'Database Record'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block">Access Control & Integrity</span>
                  <p className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Row Level Security (RLS)
                  </p>
                </div>
              </div>
            </div>

            {/* Preprocessing Metrics Grid */}
            {sourceDoc?.preprocessing_metadata && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Deterministic Preprocessing Metrics
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      sourceDoc.preprocessing_metadata.fallbackRequired
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {sourceDoc.preprocessing_metadata.fallbackRequired
                      ? 'Mode: Multimodal Fallback'
                      : 'Mode: Optimized Text Context'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Extraction Method</span>
                    <span className="font-semibold text-white">
                      {sourceDoc.preprocessing_metadata.method}
                    </span>
                  </div>

                  {sourceDoc.preprocessing_metadata.pageCount && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Document Pages</span>
                      <span className="font-semibold text-white">
                        {sourceDoc.preprocessing_metadata.pageCount} Pages
                      </span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Normalized Chars</span>
                    <span className="font-semibold text-white">
                      {sourceDoc.preprocessing_metadata.normalizedCharacterCount?.toLocaleString() || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Estimated AI Tokens</span>
                    <span className="font-semibold text-cyan-300">
                      ~{sourceDoc.preprocessing_metadata.estimatedTokens?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>

                {Array.isArray(sourceDoc.preprocessing_metadata.preprocessingApplied) &&
                  sourceDoc.preprocessing_metadata.preprocessingApplied.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-slate-400">Pipeline stages applied:</span>
                    {sourceDoc.preprocessing_metadata.preprocessingApplied.map((stageName, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-mono text-slate-300">
                        {String(stageName)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sourceDoc?.source_text && (
              <div className="mt-4 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Preprocessed Source Content Context:
                </span>
                <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                  {sourceDoc.source_text}
                </pre>
              </div>
            )}
          </div>
        </div>
      ) : currentArtifact ? (
        <ArtifactCard
          artifact={currentArtifact}
          provenance={provenance}
          onUpdate={loadData}
          onToast={showToast}
        />
      ) : (
        <div className="text-center py-12 text-slate-400">Artefact not found</div>
      )}
    </div>
  );
}
