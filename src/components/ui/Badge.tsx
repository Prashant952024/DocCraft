import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'cyan';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    primary: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    secondary: 'bg-slate-700/50 text-slate-300 border-slate-600/40',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    destructive: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    outline: 'border-slate-700 text-slate-400 bg-transparent',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-colors select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
