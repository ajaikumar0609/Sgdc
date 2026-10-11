import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'emerald' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-brand-navy-800 text-white hover:bg-brand-navy-700 shadow-soft-sm hover:shadow-soft-md focus-visible:ring-brand-navy-800',
      emerald:
        'bg-brand-emerald-600 text-white hover:bg-brand-emerald-700 shadow-soft-sm hover:shadow-glow-emerald focus-visible:ring-brand-emerald-600',
      gold:
        'bg-brand-gold-500 text-slate-900 font-semibold hover:bg-brand-gold-400 shadow-soft-sm hover:shadow-soft-md focus-visible:ring-brand-gold-500',
      outline:
        'border-2 border-brand-navy-800 text-brand-navy-800 bg-transparent hover:bg-brand-navy-50 focus-visible:ring-brand-navy-800',
      ghost:
        'text-slate-700 hover:text-brand-navy-800 hover:bg-slate-100 focus-visible:ring-brand-navy-800',
      danger:
        'bg-red-600 text-white hover:bg-red-700 shadow-soft-sm focus-visible:ring-red-600',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium',
      md: 'text-sm px-5 py-2.5 gap-2 font-medium',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
