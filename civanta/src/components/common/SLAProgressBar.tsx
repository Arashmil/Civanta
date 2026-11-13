import React, { useState, useEffect } from 'react';
import { Complaint } from '../../types';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ClockService } from '../../services/clockService';

interface SLAProgressBarProps {
  complaint: Complaint;
  compact?: boolean;
}

export const SLAProgressBar: React.FC<SLAProgressBarProps> = ({ complaint, compact = false }) => {
  const [simulatedNow, setSimulatedNow] = useState<Date>(() => ClockService.getSimulatedTime());

  useEffect(() => {
    const updateTime = () => setSimulatedNow(ClockService.getSimulatedTime());
    window.addEventListener('civanta-clock-change', updateTime);
    const interval = setInterval(updateTime, 5000);
    return () => {
      window.removeEventListener('civanta-clock-change', updateTime);
      clearInterval(interval);
    };
  }, []);

  if (complaint.status === 'resolved' || complaint.status === 'closed') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 size={14} />
        <span>Resolved within SLA window</span>
      </div>
    );
  }

  const now = simulatedNow;
  const deadline = new Date(complaint.deadlineDate || complaint.dueDate || complaint.createdAt);
  const created = new Date(complaint.createdAt);

  const totalDurationMs = Math.max(1, deadline.getTime() - created.getTime());
  const elapsedMs = now.getTime() - created.getTime();
  const percentage = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

  const isOverdue = complaint.isOverdue || now.getTime() > deadline.getTime();
  const diffHours = Math.abs(Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));

  if (compact) {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-pulse">
          <ShieldAlert size={12} />
          <span>Overdue by {diffHours}h</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
        <Clock size={12} className={diffHours <= 6 ? 'text-amber-500' : 'text-slate-400'} />
        <span>{diffHours}h left</span>
      </span>
    );
  }

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
          {isOverdue ? (
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
              <ShieldAlert size={14} className="animate-bounce" />
              SLA BREACHED ({diffHours} hrs overdue)
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock size={13} className={diffHours <= 6 ? 'text-amber-500 animate-pulse' : 'text-slate-500'} />
              <span>{diffHours} hours remaining</span>
            </span>
          )}
        </span>
        <span className="text-[11px] text-slate-500">
          Limit: {complaint.deadlineHours}h ({new Date(complaint.deadlineDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
        </span>
      </div>

      {/* Bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isOverdue
              ? 'bg-rose-600'
              : percentage > 75
              ? 'bg-amber-500'
              : 'bg-police-600'
          }`}
          style={{ width: isOverdue ? '100%' : `${percentage}%` }}
        />
      </div>

      {complaint.remindersSentCount > 0 && !isOverdue && (
        <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
          <AlertTriangle size={11} />
          <span>{complaint.remindersSentCount} pending reminder(s) issued</span>
        </div>
      )}
    </div>
  );
};
