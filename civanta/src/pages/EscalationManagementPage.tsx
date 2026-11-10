import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SLAProgressBar } from '../components/common/SLAProgressBar';
import { SLACountdown } from '../components/common/SLACountdown';
import { ReassignModal } from '../components/complaints/ReassignModal';
import { Complaint } from '../types';
import { tokens } from '../tokens';
import {
  ShieldAlert,
  Clock,
  UserCheck,
  Eye,
  AlertTriangle,
  Filter,
  ShieldCheck
} from 'lucide-react';

interface EscalationManagementPageProps {
  onSelectComplaint: (complaintId: string) => void;
}

export const EscalationManagementPage: React.FC<EscalationManagementPageProps> = ({
  onSelectComplaint
}) => {
  const { complaints } = useGrievance();
  const { t, language } = useLanguage();
  const [selectedForReassign, setSelectedForReassign] = useState<Complaint | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Escalated or Overdue cases
  const escalatedComplaints = complaints.filter(
    c => c.isEscalated || c.isOverdue || c.status === 'escalated' || c.status === 'overdue'
  );

  const filtered = escalatedComplaints.filter(c => {
    return filterCategory === 'all' || c.category === filterCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={tokens.headerCardClass}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
            {t('supervisorEscalationManagement')}
          </span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          {t('slaEscalationsAndOverdue')}
        </h1>
        <p className="text-xs text-slate-200 dark:text-slate-300 max-w-2xl leading-relaxed">
          {t('escalationPageDesc')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className={`p-3 ${tokens.cardClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {t('filterByCategory')}
          </span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="p-1 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
          >
            <option value="all">{t('allBreachedCategories')} ({escalatedComplaints.length})</option>
            <option value="Cybercrime">{t('Cybercrime')}</option>
            <option value="Financial Fraud">{t('Financial Fraud')}</option>
            <option value="Lost Property">{t('Lost Property')}</option>
            <option value="Traffic & Public Safety">{t('Traffic & Public Safety')}</option>
            <option value="Complaints Involving Individuals">{t('Complaints Involving Individuals')}</option>
          </select>
        </div>

        <span className="font-mono text-xs font-bold text-red-700 dark:text-red-400">
          {filtered.length} {t('overdueCases')}
        </span>
      </div>

      {/* Escalation Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className={`p-8 ${tokens.cardClass} text-center space-y-2`}>
            <ShieldCheck size={28} className="text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('noEscalatedCases')}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {t('noEscalatedCasesDesc')}
            </p>
          </div>
        ) : (
          filtered.map(complaint => (
            <div
              key={complaint.id}
              className="p-4 rounded-[6px] border border-red-300 dark:border-red-900 bg-white dark:bg-slate-900 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-red-700 dark:text-red-400 text-xs">
                      {complaint.id}
                    </span>
                    <StatusBadge status={complaint.status} size="sm" />
                    <PriorityBadge priority={complaint.priority} size="sm" />
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900">
                      {t('slaLimit')}: {complaint.deadlineHours}h
                    </span>
                    <SLACountdown
                      dueDate={complaint.dueDate || (complaint as any).due_date}
                      isResolved={complaint.status === 'resolved' || complaint.status === 'closed'}
                      isOverdue={true}
                    />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-0.5">
                    {(language === 'kn' && complaint.originalLanguage === 'kn' && complaint.titleKannada)
                      ? complaint.titleKannada
                      : complaint.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {t('complainantLabel')} <strong>{complaint.citizen.name}</strong> • {t('locationLabel')} {complaint.incidentLocation.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => setSelectedForReassign(complaint)}
                    className="px-3 py-1.5 rounded-[6px] bg-amber-500 hover:bg-amber-600 text-police-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck size={13} />
                    <span>{t('reassignAction')}</span>
                  </button>

                  <button
                    onClick={() => onSelectComplaint(complaint.id)}
                    className="px-3 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>{t('investigateAction')}</span>
                  </button>
                </div>
              </div>

              {/* SLA & Reason Callout */}
              <div className="p-2.5 rounded-[6px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-red-600 shrink-0" />
                    {t('violationReason')}
                  </span>
                  <span className="text-[10px] font-mono text-red-700 dark:text-red-400">
                    {t('overdueSince')} {new Date(complaint.overdueSince || complaint.deadlineDate).toLocaleString()}
                  </span>
                </div>
                <p className="text-red-800 dark:text-red-300 leading-relaxed text-xs">
                  {complaint.escalationReason || 'Statutory resolution SLA deadline lapsed without resolution submission. Investigation escalated to DySP vigilance command.'}
                </p>
              </div>

              {/* Progress & Current Officer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[6px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">{t('assignedOfficer')}</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {complaint.assignedOfficerName || t('awaitingAssignment')}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    {complaint.assignedOfficerBadge} • {complaint.unit}
                  </p>
                </div>

                <div className="p-2.5 rounded-[6px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                  <SLAProgressBar complaint={complaint} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reassign Modal */}
      {selectedForReassign && (
        <ReassignModal
          complaint={selectedForReassign}
          isOpen={true}
          onClose={() => setSelectedForReassign(null)}
        />
      )}
    </div>
  );
};
