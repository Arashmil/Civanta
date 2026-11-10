import React from 'react';
import { PriorityLevel } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const { t } = useLanguage();
  const p = (priority || 'Low').toLowerCase();

  let colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let IconComponent = Shield;

  if (p === 'urgent') {
    colorClass = 'bg-[#fef2f2] dark:bg-[#450a0a] text-[#991b1b] dark:text-[#fca5a5] border-[#fecaca] dark:border-[#7f1d1d] font-bold';
    IconComponent = AlertTriangle;
  } else if (p === 'high') {
    colorClass = 'bg-[#fffbeb] dark:bg-[#451a03] text-[#92400e] dark:text-[#fcd34d] border-[#fde68a] dark:border-[#78350f] font-semibold';
    IconComponent = Clock;
  }

  const sizeClass = size === 'sm' ? 'text-[9px] px-1.5 py-0.2' : 'text-[10px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] border font-mono tracking-tight shrink-0 ${sizeClass} ${colorClass}`}
    >
      <IconComponent size={size === 'sm' ? 10 : 11} className="shrink-0" />
      <span>{t(priority) || priority.toUpperCase()}</span>
    </span>
  );
};
