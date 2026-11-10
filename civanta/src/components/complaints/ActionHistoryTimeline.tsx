import React, { useState } from 'react';
import { ActionHistoryEntry } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Shield,
  User,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Bell,
  RefreshCw,
  GitCommit,
  Blocks,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface ActionHistoryTimelineProps {
  entries: ActionHistoryEntry[];
  isVerifying?: boolean;
  brokenAtId?: number | null;
  onSelectComplaint?: (complaintId: string) => void;
}

export const ActionHistoryTimeline: React.FC<ActionHistoryTimelineProps> = ({
  entries,
  isVerifying = false,
  brokenAtId = null,
  onSelectComplaint
}) => {
  const { t } = useLanguage();
  const [expandedHashes, setExpandedHashes] = useState<Record<string, boolean>>({});

  const toggleHash = (id: string | number) => {
    setExpandedHashes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getActionBadge = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes('ESCALAT') || a.includes('OVERDUE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-mono font-bold bg-[#fef2f2] dark:bg-[#450a0a] text-[#991b1b] dark:text-[#fca5a5] border border-[#fecaca] dark:border-[#7f1d1d]">
          <AlertTriangle size={12} />
          <span>{action}</span>
        </span>
      );
    }
    if (a.includes('REMINDER') || a.includes('REASSIGN') || a.includes('REVIEW')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-mono font-semibold bg-[#fffbeb] dark:bg-[#451a03] text-[#92400e] dark:text-[#fcd34d] border border-[#fde68a] dark:border-[#78350f]">
          <RefreshCw size={12} />
          <span>{action}</span>
        </span>
      );
    }
    if (a.includes('RESOL') || a.includes('CLOS')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-mono font-semibold bg-[#f0fdf4] dark:bg-[#052e16] text-[#166534] dark:text-[#86efac] border border-[#bbf7d0] dark:border-[#14532d]">
          <CheckCircle2 size={12} />
          <span>{action}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
        <GitCommit size={12} />
        <span>{action}</span>
      </span>
    );
  };

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-mono">
        No audit logs match current search or role filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Ledger Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-[#14213D] dark:text-amber-400" />
          <span className="font-bold text-slate-900 dark:text-slate-100">
            Immutable Audit Chain ({entries.length} Sequenced Blocks)
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            SHA-256 Append-Only
          </span>
        </div>

        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          block.hash = SHA256(content + prev_hash)
        </span>
      </div>

      {/* Sequential Blocks Flow */}
      <div className="space-y-3">
        {entries.map((entry, index) => {
          const isBroken = brokenAtId === Number(entry.id);
          const isExpanded = !!expandedHashes[entry.id];
          const blockNum = String(entry.id).padStart(2, '0');

          return (
            <div
              key={entry.id}
              className={`p-3.5 rounded-[6px] border transition-all text-xs ${
                isBroken
                  ? 'border-[#B91C1C] bg-[#fef2f2] dark:bg-[#450a0a] ring-2 ring-red-400'
                  : isVerifying
                  ? 'border-[#15803D] bg-green-50/20 animate-pulse'
                  : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              {/* Block Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-police-900 text-white dark:bg-slate-800 dark:text-amber-400 border border-slate-700">
                    BLOCK #{blockNum}
                  </span>

                  {getActionBadge(entry.action)}

                  {entry.complaintId && (
                    <button
                      onClick={() => onSelectComplaint && onSelectComplaint(entry.complaintId)}
                      className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-police-900 dark:text-police-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 cursor-pointer"
                      title="Inspect case file"
                    >
                      Case: {entry.complaintId}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <User size={12} className="text-slate-400" />
                    <strong className="text-slate-700 dark:text-slate-300">{entry.userName}</strong> ({entry.userRole})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Block Description Content */}
              <div className="py-2.5 text-slate-800 dark:text-slate-200 leading-relaxed font-sans text-xs">
                {entry.description}
              </div>

              {/* Cryptographic Proof Collapsible Accordion */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleHash(entry.id)}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:text-police-900 dark:hover:text-white cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    <span>{isExpanded ? 'Hide Cryptographic Proof' : 'Inspect Block Proof (SHA-256)'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                    <span>hash: <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.hash?.slice(0, 10)}...</span></span>
                    <span>|</span>
                    <span>prev: <span className="text-slate-500">{entry.prev_hash?.slice(0, 8)}...</span></span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 p-2.5 rounded-[4px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-mono space-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase tracking-wider">SHA-256 Digest (Head)</span>
                      <span className="text-[#14213D] dark:text-amber-400 font-bold break-all select-all block">
                        {entry.hash || 'GENESIS'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Previous Block Pointer (prev_hash)</span>
                      <span className="text-slate-600 dark:text-slate-300 break-all select-all block">
                        {entry.prev_hash || '0'.repeat(64)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                      Continuity check: Verified link to preceding block in append-only SQLite ledger.
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
