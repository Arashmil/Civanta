import React, { useState } from 'react';
import { Complaint } from '../../types';
import { useGrievance } from '../../context/GrievanceContext';
import { RefreshCw, X, AlertTriangle } from 'lucide-react';

interface ReopenModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
}

export const ReopenModal: React.FC<ReopenModalProps> = ({
  complaint,
  isOpen,
  onClose
}) => {
  const { reopenComplaint } = useGrievance();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide the reason why the case should be reopened.');
      return;
    }

    reopenComplaint(complaint.id, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-[6px] bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-[6px] bg-amber-600 text-white flex items-center justify-center">
            <RefreshCw size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Request Grievance Reopening
            </h3>
            <p className="text-xs text-slate-500">
              Ref: <span className="font-mono font-medium text-police-700 dark:text-police-400">{complaint.id}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reason for Unsatisfactory Resolution / New Evidence <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="State why the resolution was incomplete or describe recurring nuisance / new suspect activity..."
              className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="p-3 rounded-[6px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
            <span>
              Reopening a case immediately alerts the Senior Police Supervisor (DySP) and prompts supervisor review of the original investigation.
            </span>
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[6px] border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-[6px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Submit Reopen Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
