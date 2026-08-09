import React from 'react';
import { cn } from '../../utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-surface-300 dark:text-surface-600 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">{title}</h3>
      {description && <p className="text-surface-500 dark:text-surface-400 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function Badge({ children, variant = 'default', className }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'; className?: string }) {
  const variants = {
    default: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-white dark:bg-surface-900 shadow-2xl w-full animate-slide-up sm:animate-scale-in',
        'rounded-t-3xl sm:rounded-2xl',
        'max-h-[88vh] sm:max-h-[90vh] overflow-y-auto',
        'mx-0 sm:mx-4',
        sizes[size]
      )}>
        {/* Mobile drag handle with safe area spacing */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden" style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))' }}>
          <div className="w-10 h-1 bg-surface-300 dark:bg-surface-600 rounded-full" />
        </div>
        <div className="sticky top-0 bg-white dark:bg-surface-900 z-10">
          <div className="flex items-center justify-between px-4 py-3 sm:p-6 border-b border-surface-100 dark:border-surface-800">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-2.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export function Select({ label, options, value, onChange, className, error }: { label?: string; options: { value: string; label: string }[]; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; className?: string; error?: string }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className={cn(
          'w-full h-10 px-3 rounded-xl border border-surface-300 bg-white text-surface-900',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'dark:bg-surface-900 dark:border-surface-700 dark:text-surface-100',
          error && 'border-red-500',
          className
        )}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function Tabs({ tabs, activeTab, onTabChange }: { tabs: { id: string; label: string; count?: number }[]; activeTab: string; onTabChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === tab.id
              ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full', activeTab === tab.id ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
