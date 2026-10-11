import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      id,
      rows = 4,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-slate-800"
          >
            {label}
            {required && <span className="text-red-500 ml-1 font-bold" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative rounded-xl shadow-soft-sm">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150',
              'focus:border-brand-navy-700 focus:ring-2 focus:ring-brand-navy-700/20 focus:outline-none',
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed resize-y',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-300 hover:border-slate-400',
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}

        {!error && hint && (
          <p id={hintId} className="text-xs text-slate-500 mt-1">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
