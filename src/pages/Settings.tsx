import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Cpu,
  Lock,
  CheckCircle2,
  AlertCircle,
  Database,
  KeyRound,
} from 'lucide-react';

export function Settings() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.fullName) {
      setFullName(userProfile.fullName);
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-cyan-400" />
          Operator & Platform Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage operator profile, transformation preferences, and view active security guardrails.
        </p>
      </div>

      {/* Operator Profile Card */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 md:p-8 backdrop-blur-md">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80 mb-6">
          <User className="h-4.5 w-4.5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Operator Profile
          </h2>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md" loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Security and Architecture Status */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 md:p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Enterprise Security Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-cyan-400" />
                Row Level Security (RLS)
              </span>
              <Badge variant="success">Enforced</Badge>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Tables <code className="text-cyan-300 font-mono">transformations</code>,{' '}
              <code className="text-cyan-300 font-mono">source_documents</code>, and{' '}
              <code className="text-cyan-300 font-mono">artifacts</code> are strictly scoped by user session ID.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                Gemini API Key Isolation
              </span>
              <Badge variant="success">Air-Gapped</Badge>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Gemini API keys reside exclusively in Supabase Edge Secrets (<code className="text-cyan-300 font-mono">GEMINI_API_KEY</code>). Zero exposure to client browsers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-cyan-400" />
                Private Storage Bucket
              </span>
              <Badge variant="success">Authenticated Only</Badge>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Source file uploads reside in private bucket <code className="text-cyan-300 font-mono">source-files</code> under partitioned user directories.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                AI Orchestrator Engine
              </span>
              <Badge variant="cyan">Gemini 2.5 Flash</Badge>
            </div>
            <p className="text-slate-400 leading-relaxed">
              High-speed reasoning model generating structured JSON analysis and multi-channel communication deliverables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
