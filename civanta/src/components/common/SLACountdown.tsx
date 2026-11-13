import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ClockService } from '../../services/clockService';

interface SLACountdownProps {
  dueDate?: string;
  isResolved?: boolean;
  isOverdue?: boolean;
  className?: string;
}

export const SLACountdown: React.FC<SLACountdownProps> = ({
  dueDate,
  isResolved,
  isOverdue,
  className = ''
}) => {
  const [timeDiff, setTimeDiff] = useState<number>(0);

  useEffect(() => {
    if (!dueDate || isResolved) return;

    const calculateDiff = () => {
      const target = new Date(dueDate).getTime();
      const now = ClockService.getSimulatedTime().getTime();
      setTimeDiff(target - now);
    };

    calculateDiff();
    const interval = setInterval(calculateDiff, 1000);
    window.addEventListener('civanta-clock-change', calculateDiff);

    return () => {
      clearInterval(interval);
      window.removeEventListener('civanta-clock-change', calculateDiff);
    };
  }, [dueDate, isResolved]);

  if (isResolved) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[11px] text-[#15803D] dark:text-[#86efac] font-medium ${className}`}>
        <CheckCircle2 size={12} className="shrink-0" />
        <span>Resolved on time</span>
      </span>
    );
  }

  if (!dueDate) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 ${className}`}>
        <Clock size={12} className="shrink-0" />
        <span>SLA calculating</span>
      </span>
    );
  }

  const isBreached = timeDiff <= 0 || isOverdue;
  const absDiff = Math.abs(timeDiff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
  const seconds = Math.floor((absDiff / 1000) % 60);

  const formattedTime = days > 0
    ? `${days}d ${hours}h ${minutes}m ${seconds}s`
    : `${hours}h ${minutes}m ${seconds}s`;

  if (isBreached) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#B91C1C] dark:text-[#fca5a5] bg-[#fef2f2] dark:bg-[#450a0a] px-1.5 py-0.5 rounded-[4px] border border-[#fecaca] dark:border-[#7f1d1d] ${className}`}>
        <AlertTriangle size={11} className="shrink-0" />
        <span>Overdue: {formattedTime}</span>
      </span>
    );
  }

  const isImpending = timeDiff < 24 * 3600 * 1000;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded-[4px] border ${
        isImpending
          ? 'text-[#92400e] dark:text-[#fcd34d] bg-[#fffbeb] dark:bg-[#451a03] border-[#fde68a] dark:border-[#78350f] font-semibold'
          : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      } ${className}`}
    >
      <Clock size={11} className="shrink-0" />
      <span>Due in: {formattedTime}</span>
    </span>
  );
};
