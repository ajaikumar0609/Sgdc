import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options = [],
      placeholder = 'Select an option',
      id,
      required,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-slate-800"
          >
            {label}
            {required && <span className="text-red-500 ml-1 font-bold" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative rounded-xl shadow-soft-sm">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'block w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 transition-all duration-150',
              'focus:border-brand-navy-700 focus:ring-2 focus:ring-brand-navy-700/20 focus:outline-none',
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-300 hover:border-slate-400',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            {error ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
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

Select.displayName = 'Select';
