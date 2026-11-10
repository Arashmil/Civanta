import React, { useState, useEffect, useRef } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { tokens } from '../../tokens';
import {
  Search,
  FileText,
  Shield,
  ArrowRight,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComplaint: (id: string) => void;
  onNavigate: (page: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectComplaint,
  onNavigate
}) => {
  const { complaints } = useGrievance();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredComplaints = complaints.filter(c => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.citizen.name && c.citizen.name.toLowerCase().includes(q)) ||
      (c.assignedOfficerName && c.assignedOfficerName.toLowerCase().includes(q))
    );
  }).slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredComplaints.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredComplaints.length) % Math.max(1, filteredComplaints.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredComplaints[selectedIndex];
      if (selected) {
        onSelectComplaint(selected.id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-[6px] overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <Search size={16} className="text-slate-400 mr-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-mono"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <kbd className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredComplaints.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {t('noRecordsMatching')} "{query}".
            </div>
          ) : (
            filteredComplaints.map((c, idx) => {
              const isSelected = idx === selectedIndex;
              const isOverdue = c.isOverdue || c.status === 'overdue' || c.status === 'escalated';
              const isResolved = c.status === 'resolved' || c.status === 'closed';

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectComplaint(c.id);
                    onClose();
                  }}
                  className={`px-3 py-2 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-[4px] border border-slate-200 dark:border-slate-700 shrink-0">
                      {c.id}
                    </span>
                    <span className="truncate font-medium">{c.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      {c.assignedOfficerName || 'Unassigned'}
                    </span>
                    <span className={tokens.components.statusChip(c.status)}>
                      {c.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <ArrowRight size={12} className="text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[10px]">CIVANTA Central Registry</span>
        </div>
      </div>
    </div>
  );
};
