import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievance } from '../context/GrievanceContext';
import { useLanguage } from '../context/LanguageContext';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { ReassignModal } from '../components/complaints/ReassignModal';
import {
  CategoryBarChart,
  StatusBreakdown,
  OfficerWorkloadList
} from '../components/charts/Charts';
import { Complaint, Officer, ComplaintStatus } from '../types';
import { tokens } from '../tokens';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users2,
  TrendingUp,
  BarChart3,
  Shield,
  Eye,
  UserCheck,
  Building2,
  Calendar,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface SupervisorDashboardProps {
  onSelectComplaint: (complaintId: string) => void;
  onNavigate: (page: string) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  onSelectComplaint,
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const { complaints, officers } = useGrievance();
  const { t } = useLanguage();

  const [selectedComplaintForReassign, setSelectedComplaintForReassign] = useState<Complaint | null>(null);
  const [activeFilterStatus, setActiveFilterStatus] = useState<ComplaintStatus | 'all'>('all');

  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const overdueComplaints = complaints.filter(c => c.isOverdue || c.status === 'overdue');
  const escalatedComplaints = complaints.filter(c => c.isEscalated || c.status === 'escalated');
  const awaitingActionComplaints = complaints.filter(c => c.status === 'submitted' || c.status === 'assigned');

  // Critical complaints sorted by severity: escalated (level 2 > level 1) then overdue
  const criticalComplaints = complaints
    .filter(c => c.isEscalated || c.isOverdue || c.status === 'escalated' || c.status === 'overdue')
    .sort((a, b) => {
      const aWeight = a.isEscalated ? 2 : 1;
      const bWeight = b.isEscalated ? 2 : 1;
      return bWeight - aWeight;
    });

  // Filtered complaints for table below based on KPI card clicked
  const displayedComplaints = activeFilterStatus === 'all'
    ? complaints
    : activeFilterStatus === 'overdue'
    ? complaints.filter(c => c.isOverdue || c.status === 'overdue' || c.status === 'escalated')
    : activeFilterStatus === 'escalated'
    ? complaints.filter(c => c.isEscalated || c.status === 'escalated')
    : activeFilterStatus === 'resolved'
    ? complaints.filter(c => c.status === 'resolved' || c.status === 'closed')
    : activeFilterStatus === 'pending'
    ? complaints.filter(c => c.status === 'pending' || c.status === 'in_progress')
    : complaints.filter(c => c.status === activeFilterStatus);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Supervisor Command Header with Visible Distinct Border (Requirement 7) */}
      <div className="p-4 rounded-[6px] bg-[#14213D] text-white border-2 border-slate-700 shadow-sm space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-mono">
              <Shield size={13} className="text-amber-400" />
              <span>{t('SENIOR SUPERVISOR COMMAND DESK (DYSP)')}</span>
              <span>•</span>
              <span className="text-slate-400">{t('complaintId')}: KSP-DySP-1042</span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              DySP Rajeshwari Hegde
            </h1>
            <p className="text-xs text-slate-300">
              {t('Vigilance, Accountability and Command Division • Karnataka State Police')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              onClick={() => window.open('/api/analytics/export-csv', '_blank')}
              className="px-2.5 py-1.5 rounded-[6px] bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Export complete grievances dataset as CSV"
            >
              <FileSpreadsheet size={13} className="text-emerald-400" />
              <span>{t('exportCsv')}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1.5 rounded-[6px] bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print Command Summary Dossier"
            >
              <Printer size={13} />
              <span>{t('print')}</span>
            </button>
            <button
              onClick={() => onNavigate('escalations')}
              className={tokens.components.buttonDanger}
            >
              <div className="flex items-center gap-1.5">
                <ShieldAlert size={13} />
                <span>{t('Escalations Queue')} ({escalatedComplaints.length})</span>
              </div>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className={tokens.components.buttonSecondary}
            >
              <div className="flex items-center gap-1.5">
                <BarChart3 size={13} />
                <span>{t('Analytics Bureau')}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Overdue & Escalation Banner (Red at Top) */}
      {criticalComplaints.length > 0 && (
        <div className="p-3.5 rounded-[6px] border border-[#B91C1C] bg-[#fef2f2] dark:bg-[#450a0a] space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-[#fecaca] dark:border-[#7f1d1d]">
            <div className="flex items-center gap-2 text-[#991b1b] dark:text-[#fca5a5] font-bold">
              <ShieldAlert size={15} className="text-[#B91C1C] shrink-0" />
              <span>{t('Statutory Escalation & Overdue Notice')} ({criticalComplaints.length} cases)</span>
            </div>
            <span className="font-mono text-[11px] text-[#991b1b] dark:text-[#fca5a5]">
              {t('Sorted by severity')}
            </span>
          </div>

          <div className="divide-y divide-[#fecaca] dark:divide-[#7f1d1d] max-h-48 overflow-y-auto">
            {criticalComplaints.slice(0, 5).map(c => (
              <div
                key={c.id}
                className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#991b1b] dark:text-[#fca5a5]">
                      {c.id}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {c.title}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-[4px] bg-[#B91C1C] text-white font-bold">
                      {c.isEscalated ? t('ESCALATED') : t('OVERDUE')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {t('assignedOfficer')}: {c.assignedOfficerName || 'Unassigned'} • Unit: {c.unit} • {t('Mandatory Next Action')}: <em>{c.nextAction || 'Pending intake review'}</em>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => setSelectedComplaintForReassign(c)}
                    className="px-2 py-1 rounded-[4px] bg-[#D97706] hover:bg-amber-700 text-white font-mono text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <UserCheck size={11} />
                    <span>{t('Reassign')}</span>
                  </button>
                  <button
                    onClick={() => onSelectComplaint(c.id)}
                    className="px-2 py-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-medium hover:bg-slate-50 cursor-pointer"
                  >
                    {t('Review')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standout Feature 4: Daily Supervisor Command Summary */}
      <div className="p-3 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
            <FileText size={14} className="text-[#14213D] dark:text-slate-300" />
            <span>{t('Daily Supervisor Command Summary')}</span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-[4px] border border-slate-200 dark:border-slate-700">
              Automated in-app job
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
          Total active inquiries: {pendingComplaints} across 3 divisions. Breached SLA count: {overdueComplaints.length}. Critical escalations requiring command directive: {escalatedComplaints.length}. Total resolved cases archived: {resolvedComplaints}.
        </p>
      </div>

      {/* Max 6 Interactive KPI Cards (Click to filter list below) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 text-xs">
        {/* 1. Total */}
        <div
          onClick={() => setActiveFilterStatus('all')}
          className={`p-3 rounded-[6px] border transition-colors cursor-pointer flex flex-col justify-between min-h-[105px] ${
            activeFilterStatus === 'all'
              ? 'border-police-700 dark:border-sky-500 bg-slate-100 dark:bg-slate-800'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <div>
            <span className="text-[11px] text-slate-600 dark:text-slate-300 block font-medium leading-tight">{t('Total Registered')}</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{totalComplaints}</p>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{t('All grievance records')}</span>
        </div>

        {/* 2. Pending Inquiries */}
        <div
          onClick={() => setActiveFilterStatus('pending')}
          className={`p-3 rounded-[6px] border transition-colors cursor-pointer flex flex-col justify-between min-h-[105px] ${
            activeFilterStatus === 'pending'
              ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/70'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <div>
            <span className="text-[11px] text-amber-800 dark:text-amber-300 block font-medium leading-tight">{t('Action Pending')}</span>
            <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{pendingComplaints}</p>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{t('underInvestigation')}</span>
        </div>

        {/* 3. Resolved */}
        <div
          onClick={() => setActiveFilterStatus('resolved')}
          className={`p-3 rounded-[6px] border transition-colors cursor-pointer flex flex-col justify-between min-h-[105px] ${
            activeFilterStatus === 'resolved'
              ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <div>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium leading-tight">{t('resolved')}</span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{resolvedComplaints}</p>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{t('Certified closure')}</span>
        </div>

        {/* 4. Overdue SLA (Red) */}
        <div
          onClick={() => setActiveFilterStatus('overdue')}
          className={`p-3 rounded-[6px] border transition-colors cursor-pointer flex flex-col justify-between min-h-[105px] ${
            activeFilterStatus === 'overdue'
              ? 'border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/70'
              : 'border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 hover:bg-red-50/40 dark:hover:bg-red-950/30'
          }`}
        >
          <div>
            <span className="text-[11px] text-red-800 dark:text-red-300 block font-bold leading-tight">{t('Overdue SLA')}</span>
            <p className="text-xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">{overdueComplaints.length}</p>
          </div>
          <span className="text-[10px] text-red-700 dark:text-red-400 font-mono">{t('Breached deadline')}</span>
        </div>

        {/* 5. Escalated Cases (Red) */}
        <div
          onClick={() => setActiveFilterStatus('escalated')}
          className={`p-3 rounded-[6px] border transition-colors cursor-pointer flex flex-col justify-between min-h-[105px] ${
            activeFilterStatus === 'escalated'
              ? 'border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/70'
              : 'border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 hover:bg-red-50/40 dark:hover:bg-red-950/30'
          }`}
        >
          <div>
            <span className="text-[11px] text-red-800 dark:text-red-300 block font-bold leading-tight">{t('Active Escalations')}</span>
            <p className="text-xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">{escalatedComplaints.length}</p>
          </div>
          <span className="text-[10px] text-red-700 dark:text-red-400 font-mono">Supervisor queue</span>
        </div>

        {/* 6. Awaiting Intake */}
        <div
          onClick={() => setActiveFilterStatus('assigned')}
          className={`p-3 rounded-[6px] border transition-colors cursor-pointer flex flex-col justify-between min-h-[105px] ${
            activeFilterStatus === 'assigned'
              ? 'border-police-700 dark:border-sky-500 bg-slate-100 dark:bg-slate-800'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <div>
            <span className="text-[11px] text-slate-600 dark:text-slate-300 block font-medium leading-tight">{t('Awaiting Intake') || 'Awaiting Intake'}</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{awaitingActionComplaints.length}</p>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{t('Initial assignment') || 'Initial assignment'}</span>
        </div>
      </div>

      {/* Workload and Category Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Officer Workload */}
        <div className="p-3.5 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
              OFFICER WORKLOAD CAPACITY ({officers.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Active balance</span>
          </div>
          <OfficerWorkloadList officers={officers} />
        </div>

        {/* Crime Category Velocity */}
        <div className="p-3.5 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
              CATEGORY DISTRIBUTION (5 STATUTORY WINGS)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Relative volume</span>
          </div>
          <CategoryBarChart complaints={complaints} />
        </div>
      </div>

      {/* Filtered Complaints Table with Live SLA Countdown */}
      <ComplaintTable
        complaints={displayedComplaints}
        onSelectComplaint={onSelectComplaint}
        title={`Departmental Complaints (${activeFilterStatus.toUpperCase()} FILTER)`}
        subtitle="Click any row to inspect complete case dossier or execute supervisory reassignment"
        initialFilterStatus={activeFilterStatus}
      />

      {/* Reassign Modal */}
      {selectedComplaintForReassign && (
        <ReassignModal
          complaint={selectedComplaintForReassign}
          isOpen={true}
          onClose={() => setSelectedComplaintForReassign(null)}
        />
      )}
    </div>
  );
};
