import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievance } from '../context/GrievanceContext';
import { useLanguage } from '../context/LanguageContext';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { tokens } from '../tokens';
import {
  Shield,
  FolderGit2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Star,
  CalendarClock,
  Inbox
} from 'lucide-react';

interface OfficerDashboardProps {
  onSelectComplaint: (complaintId: string) => void;
  onNavigate: (page: string) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  onSelectComplaint,
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const { complaints, officers } = useGrievance();
  const { t } = useLanguage();
  const [inboxTab, setInboxTab] = useState<'all' | 'due_today' | 'overdue' | 'new' | 'in_progress' | 'resolved'>('all');

  // Find current officer profile or default to PSI Anand Kumar
  const currentOfficer =
    officers.find(o => o.id === currentUser?.id || o.email === currentUser?.email) || officers[0];

  // Cases assigned to this officer
  const myAssignedCases = complaints.filter(
    c => c.assignedOfficerId === currentOfficer.id || c.assignedOfficerName === currentOfficer.name
  );

  const totalAssigned = myAssignedCases.length;
  const newAssigned = myAssignedCases.filter(c => c.status === 'assigned').length;
  const inProgress = myAssignedCases.filter(c => c.status === 'in_progress' || c.status === 'awaiting_response').length;
  const overdue = myAssignedCases.filter(c => c.isOverdue || c.status === 'overdue' || c.status === 'escalated').length;
  const resolved = myAssignedCases.filter(c => c.status === 'resolved' || c.status === 'closed').length;

  // Due today cases: due_date within 24h or already due, not resolved/closed
  const dueTodayCases = myAssignedCases.filter(c => {
    if (c.status === 'resolved' || c.status === 'closed') return false;
    const dueTime = new Date(c.dueDate || (c as any).due_date || c.deadlineDate).getTime();
    const now = Date.now();
    return dueTime <= now + 24 * 3600 * 1000;
  });

  const displayedCases = inboxTab === 'due_today'
    ? dueTodayCases
    : inboxTab === 'overdue'
    ? myAssignedCases.filter(c => c.isOverdue || c.status === 'overdue' || c.status === 'escalated')
    : inboxTab === 'new'
    ? myAssignedCases.filter(c => c.status === 'assigned')
    : inboxTab === 'in_progress'
    ? myAssignedCases.filter(c => c.status === 'in_progress' || c.status === 'awaiting_response')
    : inboxTab === 'resolved'
    ? myAssignedCases.filter(c => c.status === 'resolved' || c.status === 'closed')
    : myAssignedCases;

  return (
    <div className="space-y-4">
      {/* Officer Header Bar */}
      <div
        className={`${tokens.headerCardClass} !bg-[#14213D] !text-white`}
        style={{ backgroundColor: '#14213D', color: '#ffffff' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                {t('Investigating Officer Workstation')}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#1e2e50] border border-slate-600 text-slate-100">
                {t('complaintId')}: {currentOfficer.badgeNumber}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {currentOfficer.name} ({currentOfficer.rank})
            </h1>
            <p className="text-xs text-slate-100 font-mono">
              {currentOfficer.unitName} • {currentOfficer.jurisdiction}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-[6px] bg-police-800 border border-police-700 text-right min-w-[120px]">
              <span className="text-[10px] text-slate-300 block font-mono">{t('Active Load')}</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {currentOfficer.activeCasesCount} / {currentOfficer.maxCapacity}
              </span>
            </div>
            <div className="p-2.5 rounded-[6px] bg-police-800 border border-police-700 text-right min-w-[120px]">
              <span className="text-[10px] text-slate-300 block font-mono">{t('Scorecard Rating')}</span>
              <span className="text-base font-bold text-slate-100 font-mono inline-flex items-center gap-1">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                {currentOfficer.rating} / 5.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards (Max 6, Click-to-Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div
          onClick={() => setInboxTab('all')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            inboxTab === 'all'
              ? 'border-police-700 bg-slate-100 dark:bg-slate-800 text-police-950 dark:text-white'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="text-xs text-slate-500 font-medium">{t('Total Assigned')}</span>
          <p className="text-xl font-bold font-mono">{totalAssigned}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('All assigned files')}</span>
        </div>

        <div
          onClick={() => setInboxTab('new')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            inboxTab === 'new'
              ? 'border-police-700 bg-slate-100 dark:bg-slate-800 text-police-950 dark:text-white'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
            <FolderGit2 size={13} />
            <span>{t('Newly Assigned')}</span>
          </span>
          <p className="text-xl font-bold font-mono text-police-700 dark:text-police-400">{newAssigned}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('Pending accept')}</span>
        </div>

        <div
          onClick={() => setInboxTab('due_today')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            inboxTab === 'due_today'
              ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
            <CalendarClock size={13} />
            <span>{t('Due in 24h')}</span>
          </span>
          <p className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">{dueTodayCases.length}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('Action required')}</span>
        </div>

        <div
          onClick={() => setInboxTab('in_progress')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            inboxTab === 'in_progress'
              ? 'border-police-700 bg-slate-100 dark:bg-slate-800 text-police-950 dark:text-white'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
            <Clock size={13} />
            <span>{t('In Progress')}</span>
          </span>
          <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{inProgress}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('Active inquiries')}</span>
        </div>

        <div
          onClick={() => setInboxTab('overdue')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            inboxTab === 'overdue'
              ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
              : 'border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 text-red-700 dark:text-red-400'
          }`}
        >
          <span className="text-xs text-red-700 dark:text-red-400 font-bold flex items-center gap-1">
            <AlertTriangle size={13} />
            <span>{t('Overdue SLA')}</span>
          </span>
          <p className="text-xl font-bold font-mono text-red-700 dark:text-red-400">{overdue}</p>
          <span className="text-[10px] text-red-600 dark:text-red-400 font-mono block">{t('Breached deadline')}</span>
        </div>

        <div
          onClick={() => setInboxTab('resolved')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            inboxTab === 'resolved'
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>{t('resolved')}</span>
          </span>
          <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{resolved}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('Certified closure')}</span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1">
        <button
          onClick={() => setInboxTab('all')}
          className={`py-2 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
            inboxTab === 'all'
              ? 'border-police-800 text-police-900 dark:text-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox size={13} />
          <span>{t('All Assigned')} ({totalAssigned})</span>
        </button>
        <button
          onClick={() => setInboxTab('due_today')}
          className={`py-2 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
            inboxTab === 'due_today'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarClock size={13} />
          <span>{t('Due in 24h')} ({dueTodayCases.length})</span>
        </button>
        <button
          onClick={() => setInboxTab('overdue')}
          className={`py-2 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
            inboxTab === 'overdue'
              ? 'border-red-600 text-red-700 dark:text-red-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle size={13} />
          <span>{t('Overdue SLA')} ({overdue})</span>
        </button>
      </div>

      {/* Assigned Cases Table with Live SLA Countdowns */}
      <ComplaintTable
        complaints={displayedCases}
        onSelectComplaint={onSelectComplaint}
        title={t(inboxTab === 'due_today' ? 'Cases Due in Next 24 Hours' : inboxTab === 'overdue' ? 'Overdue Police Grievances' : 'Assigned Case Dossiers')}
        subtitle={t('Filter by category, priority, status and monitor next action deadlines')}
      />
    </div>
  );
};
