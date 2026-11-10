import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-[4px] w-28 shrink-0" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-[4px] flex-1 max-w-md" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-[4px] w-24 shrink-0" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-[4px] w-20 shrink-0" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-[4px] w-16 shrink-0" />
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-[6px] bg-white dark:bg-slate-900 animate-pulse space-y-2">
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-[4px] w-24" />
    <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded-[4px] w-16" />
    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-[4px] w-32" />
  </div>
);
