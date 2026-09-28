import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTransformations, deleteTransformation } from '@/services/transformations';
import { Transformation, TransformationStatus } from '@/types/transformation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Trash2,
  FileText,
  UploadCloud,
  Globe,
  Loader2,
  Calendar,
} from 'lucide-react';

export function History() {
  const navigate = useNavigate();
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [filteredList, setFilteredList] = useState<Transformation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await listTransformations(100);
      setTransformations(data);
      setFilteredList(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = transformations;

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.source_type.toLowerCase().includes(q)
      );
    }

    setFilteredList(result);
  }, [statusFilter, searchQuery, transformations]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this transformation?')) return;

    try {
      setDeletingId(id);
      await deleteTransformation(id);
      setTransformations((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getSourceIcon = (type: string) => {
    if (type === 'file' || type === 'pdf' || type === 'image') {
      return <UploadCloud className="h-3.5 w-3.5 text-blue-400" />;
    }
    if (type === 'url') {
      return <Globe className="h-3.5 w-3.5 text-emerald-400" />;
    }
    return <FileText className="h-3.5 w-3.5 text-cyan-400" />;
  };

  const getStatusBadge = (status: TransformationStatus) => {
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-cyan-400" />
            Transformation History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and manage previous multimodal transformation runs and generated artefacts.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/create')}
          icon={<Plus className="h-4 w-4" />}
        >
          New Transformation
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or modality..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'completed', 'processing', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/30">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
          <HistoryIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No transformations found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try changing your search query or filter settings.'
              : 'Start your first multimodal transformation to view it here.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/create')}>
            Start Transformation
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/transformation/${item.id}`)}
              className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/40 cursor-pointer transition-all duration-150 shadow-md shadow-black/10"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 shrink-0 mt-0.5 group-hover:border-cyan-500/30">
                  {getSourceIcon(item.source_type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {item.title}
                    </h3>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="capitalize">{item.source_type}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-medium">
                      {item.settings?.outputTypes?.length || 0} Artefacts
                    </span>
                    <span>•</span>
                    <span>{item.settings?.audience || 'Executive'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, item.id)}
                  disabled={deletingId === item.id}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
