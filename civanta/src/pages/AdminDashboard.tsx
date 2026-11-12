import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievance } from '../context/GrievanceContext';
import { useLanguage } from '../context/LanguageContext';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { tokens } from '../tokens';
import {
  Cpu,
  Users,
  Building2,
  SlidersHorizontal,
  RotateCcw,
  ShieldAlert,
  BellRing,
  CheckCircle2
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectComplaint: (complaintId: string) => void;
  onNavigate: (page: string) => void;
  onOpenRoleModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectComplaint,
  onNavigate,
  onOpenRoleModal
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const {
    complaints,
    officers,
    departments,
    actionHistory,
    simulateDeadlineExpiry,
    triggerInstantReminder,
    resetDemoData
  } = useGrievance();

  const [simComplaintId, setSimComplaintId] = useState(
    complaints.find(c => c.status === 'in_progress')?.id || complaints[0]?.id || ''
  );
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress' || c.status === 'assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const escalatedCount = complaints.filter(c => c.isEscalated || c.status === 'escalated').length;

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-[6px] border border-slate-700 text-xs">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Header */}
      <div
        className={`${tokens.headerCardClass} !bg-[#14213D] !text-white`}
        style={{ backgroundColor: '#14213D', color: '#ffffff' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-amber-300" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                {t('systemAdminConsole')}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {t('adminControlAndConfig')}
            </h1>
            <p className="text-xs text-slate-100">
              {t('adminControlDesc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('users-management')}
              className="px-3 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-600 text-white font-semibold text-xs border border-police-600 flex items-center gap-1.5 cursor-pointer"
            >
              <Users size={13} />
              <span>{t('userOfficerDirectory')}</span>
            </button>
            <button
              onClick={() => onNavigate('sla-settings')}
              className="px-3 py-1.5 rounded-[6px] bg-police-800 hover:bg-police-700 text-slate-200 font-medium text-xs border border-police-700 flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal size={13} />
              <span>{t('slaRulesEngine')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Prototype Simulation Lab */}
      <div className="p-3.5 rounded-[6px] border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-amber-200 dark:border-amber-800">
          <h3 className="font-bold text-amber-950 dark:text-amber-200">
            {t('prototypeSlaSimulation')}
          </h3>
          <span className="font-mono text-[10px] text-amber-800 dark:text-amber-300">
            {t('interactiveTestActions')}
          </span>
        </div>

        <p className="text-amber-900 dark:text-amber-300 text-xs leading-relaxed">
          {t('Simulate statutory deadline expiry without waiting for wall-clock time. Select any case below to artificially advance its SLA state, triggering overdue marks, supervisor escalations, and SHA-256 ledger entries.')}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <select
            value={simComplaintId}
            onChange={e => setSimComplaintId(e.target.value)}
            className="w-full sm:w-auto flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-[6px] p-1.5 font-mono text-slate-800 dark:text-slate-100"
          >
            {complaints.map(c => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title.slice(0, 36)}... [{c.status.toUpperCase()}]
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              simulateDeadlineExpiry(simComplaintId);
              showToast(`Simulated: ${simComplaintId} deadline expired. Escalated to DySP queue.`);
            }}
            className="w-full sm:w-auto px-3 py-1.5 rounded-[6px] bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <ShieldAlert size={13} />
            <span>{t('simulateSlaExpiry')}</span>
          </button>

          <button
            onClick={() => {
              triggerInstantReminder(simComplaintId);
              showToast(`Simulated: Pending work reminder dispatched to officer.`);
            }}
            className="w-full sm:w-auto px-3 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <BellRing size={13} />
            <span>{t('dispatchOfficerReminder')}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo data to baseline 30 fictional complaints?')) {
                resetDemoData();
                showToast('All demonstration complaints and audit trails reset to baseline.');
              }
            }}
            className="w-full sm:w-auto px-3 py-1.5 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-1 cursor-pointer shrink-0"
          >
            <RotateCcw size={12} />
            <span>{t('resetDemoData')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Max 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className={`p-3 ${tokens.cardClass} space-y-1`}>
          <span className="text-xs text-slate-500 font-medium">{t('policeUnits')}</span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{departments.length}</p>
          <span className="text-[10px] text-slate-400 font-mono block">Active Wings</span>
        </div>

        <div className={`p-3 ${tokens.cardClass} space-y-1`}>
          <span className="text-xs text-slate-500 font-medium">{t('activeOfficers')}</span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{officers.length}</p>
          <span className="text-[10px] text-slate-400 font-mono block">Investigating Staff</span>
        </div>

        <div className={`p-3 ${tokens.cardClass} space-y-1`}>
          <span className="text-xs text-slate-500 font-medium">{t('totalComplaints')}</span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">{totalComplaints}</p>
          <span className="text-[10px] text-slate-400 font-mono block">Registered Dossiers</span>
        </div>

        <div className={`p-3 ${tokens.cardClass} space-y-1`}>
          <span className="text-xs text-slate-500 font-medium">{t('auditEvents')}</span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {actionHistory.length}
          </p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('sha256Verified')}</span>
        </div>
      </div>

      {/* System Complaint Table */}
      <ComplaintTable
        complaints={complaints}
        onSelectComplaint={onSelectComplaint}
        title={t('allSystemComplaintsTitle')}
        subtitle={t('allSystemComplaintsSubtitle')}
      />
    </div>
  );
};
