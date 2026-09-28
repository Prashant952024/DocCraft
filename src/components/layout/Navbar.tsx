import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const { user, userProfile, signOut } = useAuth();

  const displayName = userProfile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Operator';

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  DocCraft
                </span>
                <span className="rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Multimodal Content Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Right side user info & actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">RLS & Edge Secured</span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-850 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-850 border border-slate-700 text-cyan-400">
                <UserIcon className="h-3.5 w-3.5" />
              </div>
              <span className="hidden md:inline font-semibold">{displayName}</span>
            </Link>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
