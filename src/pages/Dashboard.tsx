import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import {
  listTransformations,
  getTransformationStats,
} from '@/services/transformations';
import { Transformation } from '@/types/transformation';
import {
  Sparkles,
  Layers,
  FileCheck2,
  FolderSync,
  Activity,
  ArrowRight,
  Clock,
  Plus,
  FileText,
  UploadCloud,
  Globe,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export function Dashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [stats, setStats] = useState({
    totalTransformations: 0,
    totalArtifacts: 0,
    totalFilesProcessed: 0,
    recentCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const displayName =
    userProfile?.fullName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Operator';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tList, sData] = await Promise.all([
          listTransformations(6),
          getTransformationStats(),
        ]);
        setTransformations(tList);
        setStats(sData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getSourceIcon = (type: string) => {
    if (type === 'file' || type === 'pdf' || type === 'image') {
      return <UploadCloud className="h-3.5 w-3.5 text-blue-400" />;
    }
    if (type === 'url') {
      return <Globe className="h-3.5 w-3.5 text-emerald-400" />;
    }
    return <FileText className="h-3.5 w-3.5 text-cyan-400" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="cyan">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90 p-6 md:p-8 backdrop-blur-xl shadow-xl shadow-black/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{displayName}</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            Transform raw multimodal information into enterprise communication artefacts.
          </p>
        </div>

        <div>
          <Button
            variant="glow"
            size="lg"
            onClick={() => navigate('/create')}
            icon={<Plus className="h-4.5 w-4.5 stroke-[2.5]" />}
          >
            New Transformation
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Transformations
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FolderSync className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {stats.totalTransformations}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Ingested across all modalities</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Generated Artefacts
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Layers className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {stats.totalArtifacts}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Synthesized AI deliverables</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Files Processed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileCheck2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {stats.totalFilesProcessed}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">SHA-256 integrity verified</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pipeline Status
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Supabase Edge + Gemini 2.5</p>
          </div>
        </div>
      </div>

      {/* Recent Transformations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Recent Transformations
            </h2>
          </div>

          <Link
            to="/history"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/30">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          </div>
        ) : transformations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-800/80 bg-slate-900/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              No transformations generated yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Upload raw source content or paste incident reports to generate multi-format communication deliverables.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/create')}
              icon={<Plus className="h-4 w-4" />}
            >
              Create First Transformation
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transformations.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/transformation/${item.id}`)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer shadow-lg shadow-black/10"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      {getSourceIcon(item.source_type)}
                      <span className="capitalize">{item.source_type}</span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h3>

                  {/* Settings summary badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mb-4">
                    <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {item.settings?.audience || 'Executive'}
                    </span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {item.settings?.tone || 'Professional'}
                    </span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-cyan-400 font-semibold">
                      {item.settings?.outputTypes?.length || 0} Artefacts
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                  <span>{formatDate(item.created_at)}</span>
                  <span className="font-semibold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Open Artefacts
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
