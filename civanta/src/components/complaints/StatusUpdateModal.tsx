import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../../types';
import { useGrievance } from '../../context/GrievanceContext';
import { Edit3, X, Calendar, AlertCircle, Clock, Shield } from 'lucide-react';

interface StatusUpdateModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  complaint,
  isOpen,
  onClose
}) => {
  const { updateInvestigation } = useGrievance();
  const [remark, setRemark] = useState('');
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [nextAction, setNextAction] = useState(complaint.nextAction || complaint.next_action || '');
  
  // Default due date to 48 hours from now
  const defaultDueDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16);
  const [dueDate, setDueDate] = useState<string>(
    complaint.deadlineDate ? new Date(complaint.deadlineDate).toISOString().slice(0, 16) : defaultDueDate
  );
  
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // CORE RULE ENFORCEMENT
    if (!nextAction.trim() || nextAction.trim().length < 5) {
      setError('CORE RULE: A mandatory next action note (minimum 5 characters) is required for any status change.');
      return;
    }

    if (!dueDate) {
      setError('CORE RULE: A mandatory follow-up due date is required for any status change.');
      return;
    }

    setLoading(true);
    try {
      await updateInvestigation(
        complaint.id,
        remark.trim(),
        status,
        attachmentUrl.trim() || undefined,
        nextAction.trim(),
        new Date(dueDate).toISOString()
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update complaint status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-[6px] bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-[6px] bg-police-700 text-white flex items-center justify-center">
            <Edit3 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Update Investigation & Status
            </h3>
            <p className="text-xs text-slate-500">
              Ref: <span className="font-mono font-medium text-police-700 dark:text-police-400">{complaint.id}</span>
            </p>
          </div>
        </div>

        {/* Core Rule Callout Banner */}
        <div className="p-3 mb-4 rounded-[6px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
          <Shield size={16} className="text-police-700 dark:text-police-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">Statutory Core Rule:</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Every status change requires an explicit next action and follow-up deadline. Incomplete updates are rejected by system policy.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-[6px] bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              New Investigation Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ComplaintStatus)}
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[6px] p-2.5 font-medium text-slate-900 dark:text-white"
            >
              <option value="in_progress">In Progress (Active Field / Digital Steps)</option>
              <option value="pending">Awaiting Response / External Notice</option>
              <option value="accepted">Accepted (Intake Verification)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Mandatory Next Action Note <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              placeholder="e.g. Subpoena bank transaction logs under Sec 91 CrPC"
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[6px] p-2.5 font-medium text-slate-900 dark:text-white"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Specific investigative next step required by police accountability protocol.
            </span>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Next Follow-Up Due Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[6px] p-2.5 font-medium text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Reminder triggers 24h prior. Escalates to supervisor upon SLA breach.
            </span>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Official Remark & Case Notes
            </label>
            <textarea
              rows={3}
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="Record summary of evidence reviewed, witnesses examined, or notices served..."
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[6px] p-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Supporting Evidence / Report URL (Optional)
            </label>
            <input
              type="text"
              value={attachmentUrl}
              onChange={e => setAttachmentUrl(e.target.value)}
              placeholder="https://... or internal document reference"
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[6px] p-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-[6px] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-medium cursor-pointer transition-colors disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Status & Due Date'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
