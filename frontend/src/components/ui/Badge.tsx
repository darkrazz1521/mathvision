import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent' | 'cyan' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-[#151B27] text-[#94A3B8] border-[#252D3B]',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    accent: 'bg-[#8B7CFF]/15 text-[#8B7CFF] border-[#8B7CFF]/40',
    cyan: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40',
    neutral: 'bg-white/5 text-[#F1F5F9] border-white/10',
  };

  const dotColors = {
    default: 'bg-gray-400',
    success: 'bg-emerald-400 animate-pulse',
    warning: 'bg-amber-400',
    error: 'bg-rose-400 animate-pulse',
    accent: 'bg-[#8B7CFF]',
    cyan: 'bg-[#38BDF8]',
    neutral: 'bg-white',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border tracking-wide select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
