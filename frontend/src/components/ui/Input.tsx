import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              'w-full h-10 px-3 rounded-xl border border-surface-300 bg-white text-surface-900 placeholder:text-surface-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'dark:bg-surface-900 dark:border-surface-700 dark:text-surface-100 dark:placeholder:text-surface-500',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
