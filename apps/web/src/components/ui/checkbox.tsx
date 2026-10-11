import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
  hint?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      hint,
      id,
      required,
      disabled,
      checked,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const errorId = `${checkboxId}-error`;

    return (
      <div className="w-full">
        <label
          htmlFor={checkboxId}
          className={cn(
            'flex items-start gap-3 cursor-pointer select-none group',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              required={required}
              disabled={disabled}
              checked={checked}
              onChange={onChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className={cn(
                'peer h-5 w-5 appearance-none rounded-md border transition-all duration-150',
                'checked:bg-brand-emerald-600 checked:border-brand-emerald-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald-600/30 focus-visible:ring-offset-2',
                error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400',
                className
              )}
              {...props}
            />
            <Check
              className="pointer-events-none absolute w-3.5 h-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
              strokeWidth={3}
            />
          </div>

          <div className="text-sm">
            <span className="text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
              {label}
            </span>
            {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
          </div>
        </label>

        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-red-600 mt-1 pl-8">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
