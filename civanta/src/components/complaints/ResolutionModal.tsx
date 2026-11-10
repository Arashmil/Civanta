import React, { useState } from 'react';
import { Complaint } from '../../types';
import { useGrievance } from '../../context/GrievanceContext';
import { CheckCircle2, X, FileCheck, ShieldCheck } from 'lucide-react';

interface ResolutionModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  complaint,
  isOpen,
  onClose
}) => {
  const { submitResolution } = useGrievance();
  const [summary, setSummary] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [recoveryDetails, setRecoveryDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError('Please provide a formal resolution report summary.');
      return;
    }

    submitResolution(
      complaint.id,
      summary.trim(),
      firNumber.trim() || undefined,
      recoveryDetails.trim() || undefined
    );
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
          <div className="w-9 h-9 rounded-[6px] bg-emerald-700 text-white flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Submit Case Resolution Report
            </h3>
            <p className="text-xs text-slate-500">
              Ref: <span className="font-mono font-medium text-police-700 dark:text-police-400">{complaint.id}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Comprehensive Resolution Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={e => {
                setSummary(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Beneficiary bank account frozen under Section 102 CrPC. ₹45,000 lien marked and reversal advisory sent to ICICI Nodal desk..."
              className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-police-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                FIR / LDR Reference No. (if filed)
              </label>
              <input
                type="text"
                value={firNumber}
                onChange={e => setFirNumber(e.target.value)}
                placeholder="e.g. FIR-0142/2026 or LDR-8819"
                className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Recovery / Seizure Details
              </label>
              <input
                type="text"
                value={recoveryDetails}
                onChange={e => setRecoveryDetails(e.target.value)}
                placeholder="e.g. Handset S/N: R5CT30ABC or ₹45,000 lien"
                className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <ShieldCheck size={16} className="shrink-0 text-emerald-700 mt-0.5" />
            <span>
              Submitting this resolution report will notify citizen <strong>{complaint.citizen.name}</strong> to inspect the findings and provide service satisfaction feedback.
            </span>
          </div>

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
              className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-[6px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck size={14} />
              <span>Certify & Submit Resolution</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
