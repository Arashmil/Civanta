import React, { useState } from 'react';
import { Complaint, Officer } from '../../types';
import { useGrievance } from '../../context/GrievanceContext';
import { ShieldAlert, X, UserCheck, AlertTriangle } from 'lucide-react';

interface ReassignModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  complaint,
  isOpen,
  onClose
}) => {
  const { officers, reassignComplaint } = useGrievance();
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(
    officers.find(o => o.id !== complaint.assignedOfficerId)?.id || officers[0]?.id || ''
  );
  const [reason, setReason] = useState<string>('');
  const [nextAction, setNextAction] = useState<string>(
    complaint.nextAction || complaint.next_action || 'Supervisory reassignment review and expedited investigation'
  );
  
  const defaultDueDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a formal supervisor justification for reassignment.');
      return;
    }
    if (!nextAction.trim()) {
      setError('CORE RULE: Mandatory next action note required.');
      return;
    }

    setLoading(true);
    try {
      const success = await reassignComplaint(
        complaint.id,
        selectedOfficerId,
        reason.trim(),
        nextAction.trim(),
        new Date(dueDate).toISOString()
      );
      if (success) {
        onClose();
      } else {
        setError('Failed to reassign officer. Please verify officer availability.');
      }
    } catch (err: any) {
      setError(err.message || 'Reassignment failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectedOfficer = officers.find(o => o.id === selectedOfficerId);

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
          <div className="w-9 h-9 rounded-[6px] bg-amber-600 text-white flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Supervisor Case Reassignment
            </h3>
            <p className="text-xs text-slate-500">
              Transferring case <span className="font-mono font-medium text-police-700 dark:text-police-400">{complaint.id}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-[6px] bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select New Investigating Officer <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedOfficerId}
              onChange={e => setSelectedOfficerId(e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[6px] p-2.5 font-medium text-slate-900 dark:text-white"
            >
              {officers.map(officer => (
                <option key={officer.id} value={officer.id}>
                  {officer.name} ({officer.badgeNumber || 'KSP'}) • {officer.unitName || officer.departmentName} ({officer.activeCasesCount} active cases)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Required Next Action for New Officer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              placeholder="e.g. Expedite forensic audit and issue summons under Section 91 CrPC"
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[6px] p-2.5 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              New Statutory Follow-Up Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[6px] p-2.5 text-slate-900 dark:text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Supervisory Reason for Reassignment <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Document statutory justification (e.g. officer leave, workload rebalancing, overdue SLA escalation, specialized cyber forensics required)..."
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-[6px] p-2.5 text-slate-900 dark:text-white"
              required
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
              className="px-4 py-1.5 rounded-[6px] bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer transition-colors disabled:opacity-50"
            >
              {loading ? 'Reassigning...' : 'Confirm Reassignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
