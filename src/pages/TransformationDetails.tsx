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
} from 'lucide-react';

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

  const analysis: CanonicalContent | null =
    (artifacts[0]?.metadata?.analysis as CanonicalContent) || null;

  const currentArtifact = artifacts.find(
    (a) => a.id === activeTab || a.artifact_type === activeTab
  );

  const approvedCount = artifacts.filter((a) => a.status === 'approved').length;

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
            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed & Validated
            </Badge>
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
          const artTitle = (art.metadata?.title as string) || art.artifact_type.replace('_', ' ');

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
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    TRANSFORMATION COMPLETE
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  {artifacts.length} Communication Deliverables Generated from 1 Multimodal Source
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review, edit, approve, or download each format individually or in batch.
                </p>
              </div>

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
            </div>

            {/* Grid of Deliverables */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artifacts.map((art) => {
                const artTitle = (art.metadata?.title as string) || art.artifact_type.replace('_', ' ');
                const isApproved = art.status === 'approved';

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
                        {art.content.slice(0, 140)}...
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
          </div>

          {/* Phase 7: Canonical Content Intelligence Panel */}
          {analysis && (
            <div className="rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Source Intelligence & Canonical Synthesis
                    </h3>
                    <p className="text-xs text-slate-400">
                      Standardized cross-modality representation before downstream transformation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="cyan" className="font-bold">
                    {analysis.validation_status || 'VALIDATED'}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    Language: {analysis.detected_language || 'English'}
                  </span>
                </div>
              </div>

              {/* Source Distillation Summary */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1.5">
                  Executive Distillation
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {analysis.summary}
                </p>
              </div>

              {/* Metadata Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Content Type</span>
                  <span className="font-bold text-white block truncate">
                    {analysis.content_type || 'Incident Advisory'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Primary Topic</span>
                  <span className="font-bold text-cyan-300 block truncate">
                    {analysis.primary_topic || analysis.topics?.[0] || 'Cybersecurity'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Target Audience</span>
                  <span className="font-bold text-white block truncate">
                    {analysis.audience || transformation.settings?.audience}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Communication Objective</span>
                  <span className="font-bold text-white block truncate">
                    {analysis.objective || transformation.settings?.objective}
                  </span>
                </div>
              </div>

              {/* Key Facts, Entities, Dates & Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Key Facts */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verified Key Facts</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {analysis.key_facts && analysis.key_facts.length > 0 ? (
                      analysis.key_facts.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{fact}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">No key facts parsed.</li>
                    )}
                  </ul>
                </div>

                {/* Entities */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                    <Users className="h-4 w-4" />
                    <span>Extracted Entities</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.entities && analysis.entities.length > 0 ? (
                      analysis.entities.map((entity, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
                        >
                          {entity}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No entities detected.</span>
                    )}
                  </div>
                </div>

                {/* Topics & Locations */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                      <Tag className="h-4 w-4" />
                      <span>Topic Classification</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.topics?.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {analysis.dates && analysis.dates.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Relevant Dates:
                      </span>
                      <div className="flex flex-wrap gap-1 text-xs font-mono text-cyan-300">
                        {analysis.dates.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Phase 11: Cryptographic Provenance & Audit Record */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 md:p-8 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              Cryptographic Ingestion Record & Audit Trace
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Transformation ID:</span>
                <p className="font-mono text-cyan-300 truncate">{transformation.id}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Payload Size & MIME:</span>
                <p className="font-semibold text-white">
                  {formatBytes(sourceDoc?.file_size)} • {sourceDoc?.mime_type || 'text/plain'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Orchestrator Model:</span>
                <p className="font-semibold text-white">
                  {artifacts[0]?.metadata?.model_used || 'Gemini 3.8 Flash'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400">Security Architecture:</span>
                <p className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  RLS & Edge Secret Isolated
                </p>
              </div>
            </div>

            {sourceDoc?.source_text && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Original Source Ingestion Text / Extracted Payload:
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
