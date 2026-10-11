import React from 'react';
import { cn } from '@/lib/utils';
import { EnquiryStatus } from '@shasthi-guru/shared';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'navy'
    | 'emerald'
    | 'gold'
    | 'danger'
    | 'outline'
    | 'success'
    | 'warning'
    | 'neutral'
    | 'primary'
    | EnquiryStatus;
  size?: 'xs' | 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full select-none';

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.2 gap-1',
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  const variantStyles: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    navy: 'bg-brand-navy-50 text-brand-navy-800 border border-brand-navy-200',
    emerald: 'bg-brand-emerald-50 text-brand-emerald-700 border border-brand-emerald-200',
    gold: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    outline: 'bg-transparent text-slate-700 border border-slate-300',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-brand-navy-50 text-brand-navy-800 border border-brand-navy-200',
    
    // CRM Enquiry Statuses
    NEW: 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse',
    ASSIGNED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    CONTACTED: 'bg-sky-50 text-sky-700 border border-sky-200',
    COUNSELING: 'bg-amber-50 text-amber-800 border border-amber-200',
    FOLLOW_UP: 'bg-orange-50 text-orange-800 border border-orange-200',
    ADMISSION_SUPPORT: 'bg-purple-50 text-purple-700 border border-purple-200',
    CONVERTED: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
    CLOSED: 'bg-slate-100 text-slate-600 border border-slate-200',
  };

  const statusLabels: Record<string, string> = {
    NEW: 'New Enquiry',
    ASSIGNED: 'Assigned',
    CONTACTED: 'Contacted',
    COUNSELING: 'In Counseling',
    FOLLOW_UP: 'Follow-up Due',
    ADMISSION_SUPPORT: 'Admission Support',
    CONVERTED: 'Converted',
    CLOSED: 'Closed',
  };

  const displayText = typeof children === 'undefined' && statusLabels[variant]
    ? statusLabels[variant]
    : children;

  return (
    <span
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {displayText}
    </span>
  );
}
