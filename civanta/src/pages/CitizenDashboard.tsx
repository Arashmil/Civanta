import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievance } from '../context/GrievanceContext';
import { useLanguage } from '../context/LanguageContext';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { tokens } from '../tokens';
import {
  FilePlus2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderGit2
} from 'lucide-react';

interface CitizenDashboardProps {
  onNavigate: (page: string) => void;
  onSelectComplaint: (complaintId: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onNavigate,
  onSelectComplaint
}) => {
  const { currentUser } = useAuth();
  const { complaints } = useGrievance();
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'pending' | 'resolved'>('all');

  // Citizen's complaints or all demo citizen complaints
  const myComplaints = complaints.filter(
    c => c.citizen.email === currentUser?.email || c.citizen.id === currentUser?.id || currentUser?.role === 'citizen'
  );

  const total = myComplaints.length;
  const inProgress = myComplaints.filter(c => c.status === 'in_progress' || c.status === 'assigned');
  const pending = myComplaints.filter(c => c.status === 'pending' || c.status === 'awaiting_assignment' || c.status === 'submitted' || c.status === 'awaiting_response');
  const resolved = myComplaints.filter(c => c.status === 'resolved' || c.status === 'closed');

  const displayedComplaints = filterTab === 'in_progress'
    ? inProgress
    : filterTab === 'pending'
    ? pending
    : filterTab === 'resolved'
    ? resolved
    : myComplaints;

  return (
    <div className="space-y-4">
      {/* Administrative Header Banner */}
      <div
        className={`${tokens.headerCardClass} !bg-[#14213D] !text-white`}
        style={{ backgroundColor: '#14213D', color: '#ffffff' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
              {t('Citizen Grievance Portal')}
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {t('My Registered Grievance Dossiers')}
            </h1>
            <p className="text-xs text-slate-100 font-mono">
              {t('Complainant:')} {currentUser?.name || 'Public Complainant'} • {currentUser?.email || 'citizen@demo.com'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('new-complaint')}
              className="px-3 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-600 text-white font-semibold text-xs border border-police-600 flex items-center gap-1.5 cursor-pointer"
            >
              <FilePlus2 size={14} />
              <span>{t('newComplaint')}</span>
            </button>

            <button
              onClick={() => onNavigate('track-complaint')}
              className="px-3 py-1.5 rounded-[6px] bg-police-800 hover:bg-police-700 text-slate-200 font-medium text-xs border border-police-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Search size={14} />
              <span>{t('Track by Case ID')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (Click-to-Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          onClick={() => setFilterTab('all')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            filterTab === 'all'
              ? 'border-police-700 bg-slate-100 dark:bg-slate-800 text-police-950 dark:text-white'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="text-xs text-slate-500 font-medium">{t('Total Registered')}</span>
          <p className="text-xl font-bold font-mono">{total}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('All grievance records')}</span>
        </div>

        <div
          onClick={() => setFilterTab('in_progress')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            filterTab === 'in_progress'
              ? 'border-police-700 bg-slate-100 dark:bg-slate-800 text-police-950 dark:text-white'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
            <Clock size={13} />
            <span>{t('underInvestigation')}</span>
          </span>
          <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{inProgress.length}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('Police inquiry ongoing')}</span>
        </div>

        <div
          onClick={() => setFilterTab('pending')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            filterTab === 'pending'
              ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
            <AlertCircle size={13} />
            <span>{t('Action Pending')}</span>
          </span>
          <p className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">{pending.length}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('awaiting_response')}</span>
        </div>

        <div
          onClick={() => setFilterTab('resolved')}
          className={`p-3 rounded-[6px] border cursor-pointer transition-colors space-y-1 ${
            filterTab === 'resolved'
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>{t('Resolved & Closed')}</span>
          </span>
          <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{resolved.length}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('Officially disposed')}</span>
        </div>
      </div>

      {/* Grievance Table */}
      <ComplaintTable
        complaints={displayedComplaints}
        onSelectComplaint={onSelectComplaint}
        title={t(filterTab === 'in_progress' ? 'underInvestigation' : filterTab === 'pending' ? 'Action Pending' : filterTab === 'resolved' ? 'Resolved Cases' : 'All My Grievances')}
        subtitle={t('adjustSearchString')}
      />
    </div>
  );
};
