import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useLanguage } from '../context/LanguageContext';
import { Complaint } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SLAProgressBar } from '../components/common/SLAProgressBar';
import { SLACountdown } from '../components/common/SLACountdown';
import { EscalationLadderStepper } from '../components/complaints/EscalationLadderStepper';
import { ActionHistoryTimeline } from '../components/complaints/ActionHistoryTimeline';
import { tokens } from '../tokens';
import { Search, Shield, ArrowRight, Clock, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface TrackComplaintPageProps {
  onSelectComplaint: (complaintId: string) => void;
  preselectedId?: string;
}

export const TrackComplaintPage: React.FC<TrackComplaintPageProps> = ({
  onSelectComplaint,
  preselectedId
}) => {
  const { complaints, actionHistory } = useGrievance();
  const { t, language } = useLanguage();
  const [searchId, setSearchId] = useState(preselectedId || 'KA-CYB-2026-0001');
  const [searchedComplaint, setSearchedComplaint] = useState<Complaint | null>(
    complaints.find(c => c.id === searchId) || complaints[0] || null
  );
  const [hasSearched, setHasSearched] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim().toUpperCase();
    if (!query) return;

    // First search in local complaints
    const found = complaints.find(
      c => c.id.toUpperCase() === query || c.id.toUpperCase().includes(query)
    );
    if (found) {
      setSearchedComplaint(found);
      setHasSearched(true);
      return;
    }

    // Otherwise attempt backend public tracking endpoint
    setIsSearching(true);
    try {
      const publicTrackData = await api.trackComplaint(query);
      if (publicTrackData && publicTrackData.id) {
        // Map public tracking response to Complaint shape
        setSearchedComplaint({
          id: publicTrackData.id,
          title: publicTrackData.title,
          description: publicTrackData.description,
          originalLanguage: publicTrackData.language || 'en',
          isTranslated: false,
          category: publicTrackData.category,
          priority: publicTrackData.priority,
          status: publicTrackData.status.toLowerCase().replace(/\s+/g, '_') as any,
          incidentDate: publicTrackData.created_at,
          incidentLocation: {
            address: publicTrackData.assigned_area || 'Bengaluru Central',
            city: 'Bengaluru',
            district: 'Bengaluru Urban'
          },
          citizen: { id: '0', name: 'Citizen', phone: 'Protected', email: 'Protected' },
          assignedOfficerName: publicTrackData.assigned_officer_name,
          assignedOfficerBadge: publicTrackData.assigned_officer_badge,
          department: publicTrackData.assigned_unit,
          unit: publicTrackData.assigned_unit,
          jurisdiction: publicTrackData.assigned_area,
          createdAt: publicTrackData.created_at,
          updatedAt: publicTrackData.updated_at,
          deadlineHours: 48,
          deadlineDate: publicTrackData.due_date,
          due_date: publicTrackData.due_date,
          dueDate: publicTrackData.due_date,
          nextAction: publicTrackData.next_action,
          next_action: publicTrackData.next_action,
          isOverdue: publicTrackData.is_overdue,
          isEscalated: publicTrackData.is_escalated,
          escalationLevel: 0,
          remindersSentCount: 0,
          documents: [],
          investigationRemarks: [],
          resolution: publicTrackData.resolution_summary ? {
            summary: publicTrackData.resolution_summary,
            resolvedAt: publicTrackData.updated_at,
            resolvedByOfficerId: '1',
            resolvedByOfficerName: publicTrackData.assigned_officer_name || 'Investigating Officer'
          } : undefined
        });
      } else {
        setSearchedComplaint(null);
      }
    } catch {
      setSearchedComplaint(null);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const relevantHistory = searchedComplaint
    ? actionHistory.filter(h => h.complaintId === searchedComplaint.id)
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className={tokens.headerCardClass}>
        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
          Module 8 • Public Accountability Tracker
        </span>
        <h1 className="text-lg font-bold text-white tracking-tight">
          {t('Track Official Grievance Status')}
        </h1>
        <p className="text-xs text-slate-200 dark:text-slate-300">
          {t('Enter Complaint ID (e.g., KA-CYB-2026-0001)')}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="pt-1 flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              placeholder={t('Enter Complaint ID (e.g., KA-CYB-2026-0001)')}
              className="w-full pl-8 pr-3 py-1.5 rounded-[6px] border border-police-700 bg-police-800 text-white placeholder:text-slate-400 font-mono text-xs"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-600 text-white font-semibold text-xs border border-police-600 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{t('Search Case')}</span>
            <ArrowRight size={13} />
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
          <span className="font-mono text-[10px] text-slate-400">Quick Samples:</span>
          {['KA-CYB-2026-0001', 'KA-FIN-2026-0002', 'KA-LST-2026-0003', 'KA-TRF-2026-0004'].map(demoId => (
            <button
              key={demoId}
              type="button"
              onClick={() => {
                setSearchId(demoId);
                const found = complaints.find(c => c.id === demoId);
                if (found) {
                  setSearchedComplaint(found);
                } else {
                  handleSearch({ preventDefault: () => {} } as any);
                }
              }}
              className="font-mono text-[11px] underline hover:text-amber-300 cursor-pointer text-slate-300"
            >
              {demoId}
            </button>
          ))}
        </div>
      </div>

      {/* Case Details Card */}
      {hasSearched && !searchedComplaint ? (
        <div className={`p-6 ${tokens.cardClass} text-center space-y-2`}>
          <AlertCircle size={24} className="text-amber-500 mx-auto" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Complaint Not Found
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            No grievance record matches ID "{searchId}". Please verify your reference number.
          </p>
        </div>
      ) : searchedComplaint ? (
        <div className="space-y-4">
          {/* Main Case Summary Box */}
          <div className={`p-4 ${tokens.cardClass} space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-police-700 dark:text-police-400">
                    {searchedComplaint.id}
                  </span>
                  <StatusBadge status={searchedComplaint.status} size="sm" />
                  <PriorityBadge priority={searchedComplaint.priority} size="sm" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {language === 'kn' && searchedComplaint.titleKannada ? searchedComplaint.titleKannada : searchedComplaint.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <SLACountdown
                  dueDate={searchedComplaint.dueDate || (searchedComplaint as any).due_date}
                  isResolved={searchedComplaint.status === 'resolved' || searchedComplaint.status === 'closed'}
                  isOverdue={searchedComplaint.status === 'overdue' || searchedComplaint.isOverdue}
                />
                <button
                  onClick={() => onSelectComplaint(searchedComplaint.id)}
                  className="px-3 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Dossier View</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Statutory Escalation Ladder Stepper */}
            <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <EscalationLadderStepper complaint={searchedComplaint} />
            </div>

            {/* Citizen-Safe Next Action & Deadline Callout (Core Rule) */}
            <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock size={13} className="text-police-600 dark:text-police-400" />
                  Mandatory Next Action & Follow-Up
                </span>
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Lock size={11} />
                  Citizen Safe View (Personal contacts redacted)
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                {searchedComplaint.nextAction || (searchedComplaint as any).next_action || 'Preliminary case review by assigned investigating officer.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>
                  Expected Follow-Up:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {new Date(searchedComplaint.dueDate || (searchedComplaint as any).due_date || searchedComplaint.deadlineDate).toLocaleString()}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Assigned Unit:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{searchedComplaint.unit}</strong>
                </span>
                <span>•</span>
                <span>
                  Officer In-Charge: <strong className="text-slate-800 dark:text-slate-200">{searchedComplaint.assignedOfficerName || 'Assigned Officer'}</strong> ({searchedComplaint.assignedOfficerBadge || 'KSP-PSI'})
                </span>
              </div>
            </div>

            {/* SLA Progress Bar */}
            <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <SLAProgressBar complaint={searchedComplaint} />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Department & Unit</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {searchedComplaint.department}
                </span>
                <span className="text-[10px] text-slate-500 block">{searchedComplaint.unit}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Investigating Officer</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {searchedComplaint.assignedOfficerName || 'Awaiting Assignment'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {searchedComplaint.assignedOfficerBadge}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Incident Location</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {searchedComplaint.incidentLocation.address}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {searchedComplaint.incidentLocation.city}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Filing Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {new Date(searchedComplaint.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  Original: {searchedComplaint.originalLanguage === 'kn' ? 'Kannada' : 'English'}
                </span>
              </div>
            </div>

            {/* Resolution Banner if resolved */}
            {searchedComplaint.resolution && (
              <div className="p-3 rounded-[6px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Resolution Report Certified</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {searchedComplaint.resolution.summary}
                </p>
                {searchedComplaint.resolution.firNumber && (
                  <p className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 pt-0.5">
                    Official Record Ref: {searchedComplaint.resolution.firNumber}
                  </p>
                )}
              </div>
            )}
          </div>



          {/* Action History Timeline */}
          <div className={`p-4 ${tokens.cardClass} space-y-3`}>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              Official Investigation Progress Timeline
            </h3>
            <ActionHistoryTimeline entries={relevantHistory} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
