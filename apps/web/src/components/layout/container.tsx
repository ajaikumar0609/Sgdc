import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({
  className,
  size = 'lg',
  children,
  ...props
}: ContainerProps) {
  const sizeMap = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1400px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeMap[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'none';
  background?: 'white' | 'slate' | 'neutral' | 'navy' | 'emerald';
}

export function Section({
  className,
  spacing = 'lg',
  background = 'slate',
  children,
  ...props
}: SectionProps) {
  const spacingMap = {
    none: 'py-0',
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-24',
  };

  const bgMap = {
    white: 'bg-white',
    slate: 'bg-slate-50',
    neutral: 'bg-slate-50',
    navy: 'bg-brand-navy-900 text-white',
    emerald: 'bg-brand-emerald-50',
  };

  return (
    <section
      className={cn('relative w-full', spacingMap[spacing], bgMap[background], className)}
      {...props}
    >
      {children}
    </section>
  );
}
