import React from 'react';
import { ComplaintStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, FileText, RefreshCw, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const { t } = useLanguage();
  const s = (status || 'submitted').toLowerCase().replace(/\s+/g, '_');

  // Strictly follow prompt colours:
  // red #B91C1C ONLY for overdue/broken chain
  // green #15803D ONLY for resolved
  // amber #D97706 for "needs attention"
  let colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let IconComponent = FileText;
  let label = t(s) || status.replace('_', ' ').toUpperCase();

  if (s === 'overdue') {
    colorClass = 'bg-[#fef2f2] dark:bg-[#450a0a] text-[#991b1b] dark:text-[#fca5a5] border-[#fecaca] dark:border-[#7f1d1d] font-bold';
    IconComponent = AlertTriangle;
    label = t('overdue');
  } else if (s === 'escalated') {
    colorClass = 'bg-[#fef2f2] dark:bg-[#450a0a] text-[#991b1b] dark:text-[#fca5a5] border-[#B91C1C] dark:border-[#7f1d1d] font-bold';
    IconComponent = ShieldAlert;
    label = t('escalated');
  } else if (s === 'resolved') {
    colorClass = 'bg-[#f0fdf4] dark:bg-[#052e16] text-[#166534] dark:text-[#86efac] border-[#bbf7d0] dark:border-[#14532d] font-semibold';
    IconComponent = CheckCircle2;
    label = t('resolved');
  } else if (s === 'closed') {
    colorClass = 'bg-[#f0fdf4] dark:bg-[#052e16] text-[#166534] dark:text-[#86efac] border-[#bbf7d0] dark:border-[#14532d] font-medium';
    IconComponent = CheckCircle2;
    label = t('closed');
  } else if (s === 'in_progress' || s === 'pending') {
    colorClass = 'bg-[#fffbeb] dark:bg-[#451a03] text-[#92400e] dark:text-[#fcd34d] border-[#fde68a] dark:border-[#78350f] font-semibold';
    IconComponent = Clock;
    label = s === 'in_progress' ? t('in_progress') : t('awaiting_response');
  } else if (s === 'assigned') {
    colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 font-medium';
    IconComponent = Clock;
    label = t('assigned');
  } else if (s === 'reopened') {
    colorClass = 'bg-[#fffbeb] dark:bg-[#451a03] text-[#92400e] dark:text-[#fcd34d] border-[#fde68a] dark:border-[#78350f] font-semibold';
    IconComponent = RefreshCw;
    label = t('reopened');
  }

  const sizeClass = size === 'sm'
    ? 'text-[9px] px-1.5 py-0.2'
    : size === 'lg'
    ? 'text-xs px-2.5 py-1'
    : 'text-[10px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] border font-mono tracking-tight shrink-0 ${sizeClass} ${colorClass}`}
    >
      {showIcon && <IconComponent size={size === 'sm' ? 10 : 11} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
