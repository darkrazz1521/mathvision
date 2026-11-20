import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'sunken' | 'flat' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'elevated',
  children,
  ...props
}) => {
  const variants = {
    elevated: 'bg-[#151B27] border-[#252D3B] shadow-elevated',
    sunken: 'bg-[#090B10] border-[#1C2333]',
    flat: 'bg-[#10141D] border-[#252D3B]',
    interactive:
      'bg-[#151B27] border-[#252D3B] hover:border-[#374151] hover:bg-[#1A2232] transition-colors duration-150 cursor-pointer',
  };

  return (
    <div
      className={cn('rounded-xl border p-4 text-[#F1F5F9]', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
