import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ActionHistoryTimeline } from '../components/complaints/ActionHistoryTimeline';
import { api } from '../services/api';
import { tokens } from '../tokens';
import {
  History, Search, Filter, Lock, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, FileText
} from 'lucide-react';

interface ActionHistoryPageProps {
  onSelectComplaint?: (complaintId: string) => void;
}

export const ActionHistoryPage: React.FC<ActionHistoryPageProps> = ({ onSelectComplaint }) => {
  const { actionHistory, refreshData } = useGrievance();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'registration' | 'status' | 'escalation' | 'resolution'>('all');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [tampering, setTampering] = useState(false);

  const isSupervisorOrAdmin = currentUser?.role === 'senior_supervisor' || currentUser?.role === 'admin';

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
      refreshData();
    } catch (err: any) {
      setVerificationResult({
        valid: false,
        message: 'Chain verification failed to execute: ' + err.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleTamperTest = async () => {
    if (!window.confirm('Simulate direct database tampering on an audit row? This tests cryptographic tamper-evidence.')) {
      return;
    }
    setTampering(true);
    try {
      const res = await api.tamperTest();
      alert(`Database entry #${res.entry_id} mutated directly in SQLite.\nSelect Verify Chain to observe tamper detection.`);
      refreshData();
      const verifyRes = await api.verifyAuditChain();
      setVerificationResult(verifyRes);
    } catch (err: any) {
      alert('Tamper test error: ' + err.message);
    } finally {
      setTampering(false);
    }
  };

  const filteredHistory = actionHistory.filter(entry => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      entry.complaintId.toLowerCase().includes(searchLower) ||
      entry.action.toLowerCase().includes(searchLower) ||
      entry.userName.toLowerCase().includes(searchLower) ||
      entry.description.toLowerCase().includes(searchLower);

    const matchesRole =
      filterRole === 'all' ||
      (filterRole === 'system' ? entry.systemGenerated : entry.userRole === filterRole);

    const actionUp = entry.action.toUpperCase();
    let matchesCategory = true;
    if (activeCategoryTab === 'registration') {
      matchesCategory = actionUp.includes('REGIST') || actionUp.includes('ASSIGN');
    } else if (activeCategoryTab === 'status') {
      matchesCategory = actionUp.includes('STATUS') || actionUp.includes('ACCEPT') || actionUp.includes('UPDATE') || actionUp.includes('REVIEW');
    } else if (activeCategoryTab === 'escalation') {
      matchesCategory = actionUp.includes('ESCALAT') || actionUp.includes('OVERDUE') || actionUp.includes('REMIND');
    } else if (activeCategoryTab === 'resolution') {
      matchesCategory = actionUp.includes('RESOL') || actionUp.includes('CLOS') || actionUp.includes('FEEDBACK') || actionUp.includes('REOPEN');
    }

    return matchesSearch && matchesRole && matchesCategory;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Administrative Header Panel with Visible Border */}
      <div
        className="p-4 rounded-[6px] !bg-[#14213D] !text-white border-2 border-slate-700 shadow-sm space-y-3"
        style={{ backgroundColor: '#14213D', color: '#ffffff' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-mono font-semibold">
              <Lock size={14} className="text-amber-400" />
              <span>{t('cryptographicAuditLedger')}</span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {t('systemActionHistory')}
            </h1>
            <p className="text-xs text-slate-100 max-w-2xl leading-normal">
              {t('auditLedgerDescription')}
            </p>
          </div>

          {/* Action Buttons: Simulate DB Tampering is strictly gated to Supervisor and Admin */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleVerifyChain}
              disabled={verifying}
              className={tokens.components.buttonSuccess}
              title="Validate cryptographic hash continuity across all blocks"
            >
              <div className="flex items-center gap-1.5">
                {verifying ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={15} />}
                <span>{t('verifyChain')}</span>
              </div>
            </button>

            {isSupervisorOrAdmin && (
              <button
                onClick={handleTamperTest}
                disabled={tampering}
                className={tokens.components.buttonDanger}
                title="Supervisory Test Function: simulates direct SQLite DB mutation to verify chain failure"
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  <span>{t('simulateDbTampering')}</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Verification Result Banner */}
        {verificationResult && (
          <div
            className={`p-3 rounded-[6px] border text-xs flex items-start gap-2.5 transition-all ${
              verificationResult.valid
                ? 'bg-[#f0fdf4] dark:bg-[#052e16] border-[#bbf7d0] dark:border-[#14532d] text-[#166534] dark:text-[#86efac]'
                : 'bg-[#fef2f2] dark:bg-[#450a0a] border-[#B91C1C] text-[#991b1b] dark:text-[#fca5a5]'
            }`}
          >
            {verificationResult.valid ? (
              <CheckCircle2 size={16} className="text-[#15803D] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="text-[#B91C1C] shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 text-xs font-mono">
              <div className="font-bold">
                {verificationResult.valid
                  ? `Integrity verified: all ${verificationResult.total_verified} entries match cryptographic hash chain.`
                  : `Integrity check failed: broken hash link detected at entry #${verificationResult.broken_at_id}.`}
              </div>
              <p className="text-[11px] opacity-90 font-sans">
                {verificationResult.message || verificationResult.reason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Tabs (Declutters navigation between action types) */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
        {[
          { id: 'all', label: `All Audit Blocks (${actionHistory.length})` },
          { id: 'registration', label: 'Registrations & Intakes' },
          { id: 'status', label: 'Investigation & Actions' },
          { id: 'escalation', label: 'SLA Escalations & Alerts' },
          { id: 'resolution', label: 'Resolutions & Closures' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategoryTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer text-xs ${
              activeCategoryTab === tab.id
                ? 'bg-[#14213D] text-white font-semibold'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visible Top Toolbar */}
      <div className="p-3 rounded-[6px] border-2 border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-8 pr-3 py-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-2.5 py-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Roles</option>
            <option value="junior_officer">Junior Officer (PSI)</option>
            <option value="senior_supervisor">Senior Supervisor (DySP)</option>
            <option value="citizen">Citizen</option>
            <option value="system">System Automation</option>
          </select>

          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap">
            {filteredHistory.length} events
          </span>
        </div>
      </div>

      {/* Action History Component */}
      <div className="p-4 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <ActionHistoryTimeline
          entries={filteredHistory}
          isVerifying={verifying}
          brokenAtId={verificationResult?.broken_at_id}
          onSelectComplaint={onSelectComplaint}
        />
      </div>
    </div>
  );
};
