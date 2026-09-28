import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  History,
  Settings,
  Shield,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/create',
      label: 'New Transformation',
      icon: Sparkles,
      highlight: true,
    },
    {
      to: '/history',
      label: 'Transformations',
      icon: History,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 flex flex-col justify-between p-4 hidden md:flex shrink-0">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? item.highlight
                          ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 font-semibold'
                          : 'bg-slate-800/80 text-white border border-slate-700/60 font-semibold'
                        : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent'
                    )
                  }
                >
                  <Icon className={cn('h-4 w-4 shrink-0', item.highlight ? 'text-cyan-400' : '')} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Modal Supported Types Section */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Active Orchestrator</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div className="flex justify-between items-center py-0.5">
              <span>Input Modalities</span>
              <span className="font-mono text-cyan-400 font-medium">Text • File • URL</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>AI Engine</span>
              <span className="font-mono text-cyan-400 font-medium">Gemini 2.5 Flash</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Orchestrator</span>
              <span className="text-emerald-400 font-medium">Edge Function</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Footer Card */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 flex items-start gap-2.5">
        <Shield className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
        <div className="text-[11px] text-slate-400 leading-tight">
          <span className="font-semibold text-slate-200 block mb-0.5">Air-Gapped Keys</span>
          Gemini API secrets isolated in Supabase Edge Runtime.
        </div>
      </div>
    </aside>
  );
}
