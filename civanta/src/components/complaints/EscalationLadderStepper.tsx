import React from 'react';
import { Complaint } from '../../types';
import {
  FileCheck,
  Bell,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface EscalationLadderStepperProps {
  complaint: Complaint;
}

export const EscalationLadderStepper: React.FC<EscalationLadderStepperProps> = ({ complaint }) => {
  const isResolved = complaint.status === 'resolved' || complaint.status === 'closed';
  const isEscalated = complaint.isEscalated || complaint.status === 'escalated';
  const isOverdue = complaint.isOverdue || complaint.status === 'overdue' || isEscalated;

  // Compute days overdue relative to due date
  const now = Date.now();
  const due = new Date(complaint.dueDate || (complaint as any).due_date || complaint.createdAt).getTime();
  const overdueDays = Math.max(0, Math.floor((now - due) / (1000 * 3600 * 24)));
  const isRedFlag = isEscalated && (overdueDays >= 7 || (complaint as any).escalation_level >= 2);

  const steps = [
    {
      id: 'intake',
      label: 'Intake Registration',
      sublabel: 'Assigned to Unit',
      icon: FileCheck,
      completed: true,
      current: complaint.status === 'assigned' || complaint.status === 'submitted',
      breached: false
    },
    {
      id: 'reminder',
      label: '24h Reminder Alert',
      sublabel: 'Officer Queue Notification',
      icon: Bell,
      completed: true,
      current: complaint.status === 'in_progress' && !isOverdue,
      breached: false
    },
    {
      id: 'sla',
      label: 'Statutory SLA Due Date',
      sublabel: `${complaint.deadlineHours || 48}h Resolution Limit`,
      icon: Clock,
      completed: isResolved,
      current: isOverdue && !isEscalated,
      breached: isOverdue && !isResolved
    },
    {
      id: 'escalation',
      label: 'Level 1 Escalation',
      sublabel: '+3 Days Overdue (DySP)',
      icon: ShieldAlert,
      completed: false,
      current: isEscalated && !isRedFlag,
      breached: isEscalated
    },
    {
      id: 'red_flag',
      label: 'Level 2 Command Red Flag',
      sublabel: '+7 Days Overdue (SP)',
      icon: AlertTriangle,
      completed: false,
      current: isRedFlag,
      breached: isRedFlag
    }
  ];

  return (
    <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-[6px] bg-white dark:bg-slate-900 space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 font-mono">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Statutory Escalation Ladder Protocol
        </span>
        <span>
          Status: {complaint.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          let containerClass = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300';
          let iconColor = 'text-slate-500';

          if (step.breached) {
            containerClass = 'border-[#B91C1C] bg-[#fef2f2] dark:bg-[#450a0a] text-[#991b1b] dark:text-[#fca5a5] font-semibold';
            iconColor = 'text-[#B91C1C]';
          } else if (step.current) {
            containerClass = 'border-[#D97706] bg-[#fffbeb] dark:bg-[#451a03] text-[#92400e] dark:text-[#fcd34d] font-semibold';
            iconColor = 'text-[#D97706]';
          } else if (step.completed) {
            containerClass = 'border-[#15803D] bg-[#f0fdf4] dark:bg-[#052e16] text-[#166534] dark:text-[#86efac]';
            iconColor = 'text-[#15803D]';
          }

          return (
            <div
              key={step.id}
              className={`p-2 rounded-[6px] border ${containerClass} space-y-1 transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono opacity-80">
                  Step 0{idx + 1}
                </span>
                <Icon size={13} className={iconColor} />
              </div>
              <p className="font-semibold text-[11px] leading-tight">
                {step.label}
              </p>
              <p className="text-[10px] opacity-75 font-mono">
                {step.sublabel}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
