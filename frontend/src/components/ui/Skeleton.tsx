import React from 'react';
import { cn } from '../../utils';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={cn('skeleton', className)} />
      ))}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-100 dark:border-surface-800">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton w-20" />
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-3/4" />
        <div className="h-6 skeleton w-24" />
        <div className="h-10 skeleton w-full rounded-xl" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 border border-surface-100 dark:border-surface-800">
      <div className="aspect-square skeleton rounded-xl mb-3" />
      <div className="h-4 skeleton w-2/3 mx-auto" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex gap-4 p-4">
      {[...Array(cols)].map((_, i) => (
        <div key={i} className="h-4 skeleton flex-1" />
      ))}
    </div>
  );
}
