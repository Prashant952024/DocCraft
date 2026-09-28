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
} from '@/types/transformation';
import { ArtifactCard } from '@/components/outputs/ArtifactCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatBytes } from '@/lib/utils';
import { LinkedInIcon, XTwitterIcon } from '@/components/ui/BrandIcons';
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
  Headphones,
  Video,
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

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
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
      alert(`Delete failed: ${err.message}`);
      setDeleting(false);
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
      case 'audio':
        return <Headphones className="h-3.5 w-3.5 text-indigo-400" />;
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

  const analysisMetadata = (artifacts[0]?.metadata?.analysis as any) || null;
  const currentArtifact = artifacts.find((a) => a.id === activeTab || a.artifact_type === activeTab);

  return (
    <div className="space-y-6 pb-12">
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
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Transformation Workspace
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{formatDate(transformation.created_at)}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {transformation.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
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
            <span className="text-xs font-semibold text-slate-400 block mb-1">Status</span>
            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
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
              {artifacts.length} Artefacts
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Audience & Tone</span>
            <span className="text-xs font-medium text-slate-300">
              {transformation.settings?.audience || 'Executive'} • {transformation.settings?.tone || 'Professional'}
            </span>
          </div>
        </div>

        {sourceDoc?.source_hash && (
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <Hash className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-semibold">SHA-256 PROVENANCE</span>
              <span className="font-mono text-[11px] text-cyan-300 truncate block max-w-xs">
                {sourceDoc.source_hash}
              </span>
            </div>
          </div>
        )}
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
          <span>Intelligence Overview</span>
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
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* AI Analysis Cards */}
          {analysisMetadata && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Core Distillation */}
              <div className="lg:col-span-3 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    AI Source Distillation
                  </h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {analysisMetadata.summary || 'Content successfully synthesized across requested artefacts.'}
                </p>
              </div>

              {/* Key Facts */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Key Facts Extracted</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {Array.isArray(analysisMetadata.keyFacts) && analysisMetadata.keyFacts.length > 0 ? (
                    analysisMetadata.keyFacts.map((fact: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">No key facts specified.</li>
                  )}
                </ul>
              </div>

              {/* Entities */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <Users className="h-4 w-4" />
                  <span>Identified Entities</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(analysisMetadata.entities) && analysisMetadata.entities.length > 0 ? (
                    analysisMetadata.entities.map((entity: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
                      >
                        {entity}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No entities specified.</span>
                  )}
                </div>
              </div>

              {/* Topics */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-purple-400">
                  <Tag className="h-4 w-4" />
                  <span>Topic Classification</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(analysisMetadata.topics) && analysisMetadata.topics.length > 0 ? (
                    analysisMetadata.topics.map((topic: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
                      >
                        {topic}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No topics specified.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Source Document Details */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-cyan-400" />
              Source Material & Cryptographic Record
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400">File / Ingestion Label:</span>
                <p className="font-semibold text-white">
                  {sourceDoc?.file_name || transformation.title}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400">Payload Size & MIME:</span>
                <p className="font-semibold text-white">
                  {formatBytes(sourceDoc?.file_size)} • {sourceDoc?.mime_type || 'text/plain'}
                </p>
              </div>
            </div>

            {sourceDoc?.source_text && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Original Source Ingestion Text:
                </span>
                <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                  {sourceDoc.source_text}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Artefacts Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Generated Artefacts ({artifacts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artifacts.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setActiveTab(art.id)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 hover:border-cyan-500/40 hover:bg-slate-900/80 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {getArtifactIcon(art.artifact_type)}
                    <h4 className="text-sm font-bold text-white capitalize">
                      {(art.metadata?.title as string) || art.artifact_type.replace('_', ' ')}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-3">
                    {art.content.replace(/[#*`_]/g, '').slice(0, 140)}...
                  </p>
                  <span className="text-xs font-semibold text-cyan-400">
                    Open Artefact →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : currentArtifact ? (
        <ArtifactCard artifact={currentArtifact} />
      ) : (
        <div className="text-center py-12 text-slate-400">Artefact not found</div>
      )}
    </div>
  );
}
