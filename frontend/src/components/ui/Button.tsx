import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  shortcut?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      icon,
      shortcut,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60';

    const variants = {
      primary:
        'bg-[#8B7CFF] text-white hover:bg-[#7967FA] shadow-glow-accent border border-[#8B7CFF]/50',
      secondary:
        'bg-[#151B27] text-[#F1F5F9] hover:bg-[#1E2536] border border-[#252D3B] hover:border-[#374151]',
      outline:
        'bg-transparent text-[#94A3B8] hover:text-[#F1F5F9] border border-[#252D3B] hover:border-[#8B7CFF]/50 hover:bg-[#8B7CFF]/10',
      subtle:
        'bg-[#10141D] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#151B27] border border-transparent',
      danger:
        'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30',
      ghost:
        'bg-transparent text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2536]/50',
    };

    const sizes = {
      xs: 'text-xs px-2 py-1 gap-1.5 h-6',
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-3.5 py-2 gap-2 h-9',
      lg: 'text-sm px-5 py-2.5 gap-2.5 h-11',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {shortcut && (
          <kbd className="ml-1.5 hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-black/40 text-[#94A3B8] border border-[#252D3B]">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
