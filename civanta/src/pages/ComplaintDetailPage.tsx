import React, { useState, useEffect } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SLAProgressBar } from '../components/common/SLAProgressBar';
import { ActionHistoryTimeline } from '../components/complaints/ActionHistoryTimeline';
import { ReassignModal } from '../components/complaints/ReassignModal';
import { StatusUpdateModal } from '../components/complaints/StatusUpdateModal';
import { ResolutionModal } from '../components/complaints/ResolutionModal';
import { FeedbackModal } from '../components/complaints/FeedbackModal';
import { ReopenModal } from '../components/complaints/ReopenModal';
import { api } from '../services/api';
import { TranslationService } from '../services/translator';
import { SLACountdown } from '../components/common/SLACountdown';
import { EscalationLadderStepper } from '../components/complaints/EscalationLadderStepper';
import { LocationTrackingRadar } from '../components/common/LocationTrackingRadar';
import { tokens } from '../tokens';
import {
  Shield,
  Clock,
  User,
  MapPin,
  Calendar,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  Edit3,
  UserCheck,
  FileCheck,
  HeartHandshake,
  RefreshCw,
  BellRing,
  Download,
  Printer,
  Sparkles,
  Star,
  Languages,
  Globe,
  X,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface ComplaintDetailPageProps {
  complaintId: string;
  onBack: () => void;
}

export const ComplaintDetailPage: React.FC<ComplaintDetailPageProps> = ({
  complaintId,
  onBack
}) => {
  const { complaints, actionHistory, acceptAssignment, simulateDeadlineExpiry, triggerInstantReminder, refreshData } =
    useGrievance();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();

  const complaint = complaints.find(c => c.id === complaintId) || complaints[0];
  const historyEntries = actionHistory.filter(h => h.complaintId === complaint?.id);

  // Modals state
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [isCorrectAIOpen, setIsCorrectAIOpen] = useState(false);
  const [correctCategory, setCorrectCategory] = useState<string>(complaint?.category || 'Cybercrime');
  const [correctPriority, setCorrectPriority] = useState<string>(complaint?.priority || 'High');
  const [correctReason, setCorrectReason] = useState<string>('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence'>('overview');

  if (!complaint) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-slate-500">Case record not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-police-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const role = currentUser?.role || 'citizen';
  const isAssignedToMe = complaint.assignedOfficerId === currentUser?.id;
  const isSupervisor = role === 'senior_supervisor' || role === 'admin';
  const isCitizenOwner = complaint.citizen.email === currentUser?.email || role === 'citizen';

  // On-Demand Translation state
  const isKnOriginal = complaint.originalLanguage === 'kn' || /[\u0C80-\u0CFF]/.test(complaint.description);
  const [translationView, setTranslationView] = useState<'original' | 'translated' | 'dual'>('original');
  const [translatedContent, setTranslatedContent] = useState<string | null>(() => {
    if (isKnOriginal) {
      return complaint.description && !/[\u0C80-\u0CFF]/.test(complaint.description) ? complaint.description : null;
    } else {
      return complaint.descriptionKannada && /[\u0C80-\u0CFF]/.test(complaint.descriptionKannada)
        ? complaint.descriptionKannada
        : null;
    }
  });
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  useEffect(() => {
    const valid = isKnOriginal
      ? (complaint.description && !/[\u0C80-\u0CFF]/.test(complaint.description) ? complaint.description : null)
      : (complaint.descriptionKannada && /[\u0C80-\u0CFF]/.test(complaint.descriptionKannada) ? complaint.descriptionKannada : null);
    setTranslatedContent(valid);
    setTranslationView('original');
  }, [complaint.id, complaint.description, complaint.descriptionKannada, isKnOriginal]);

  const handleTranslateOnDemand = async () => {
    const hasValidTranslation = translatedContent && (
      isKnOriginal ? !/[\u0C80-\u0CFF]/.test(translatedContent) : /[\u0C80-\u0CFF]/.test(translatedContent)
    );

    if (hasValidTranslation) {
      setTranslationView(prev => (prev === 'original' ? 'translated' : 'original'));
      return;
    }

    setIsTranslating(true);
    try {
      const sourceLang = isKnOriginal ? 'kn' : 'en';
      const targetLang = isKnOriginal ? 'en' : 'kn';
      const res = await TranslationService.translateText(complaint.description, sourceLang, targetLang);
      setTranslatedContent(res.translatedText);
      if (targetLang === 'kn') {
        complaint.descriptionKannada = res.translatedText;
      }
      setTranslationView('translated');
    } catch (err) {
      console.warn('On-demand translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCorrectAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctReason.trim()) {
      alert('A valid reason is required to override AI classification.');
      return;
    }
    setIsSubmittingCorrection(true);
    try {
      await api.correctAI(complaint.id, {
        category: correctCategory,
        priority: correctPriority,
        reason: correctReason.trim()
      });
      await refreshData();
      setIsCorrectAIOpen(false);
      setCorrectReason('');
    } catch (err: any) {
      alert(`Correction failed: ${err.message || err}`);
    } finally {
      setIsSubmittingCorrection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Controls with Visible Distinct Border (Requirement 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 rounded-[6px] shadow-sm no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-police-700 dark:text-police-400 hover:underline cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{t('Return to Dashboard')}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Officer Actions */}
          {(isAssignedToMe || role === 'junior_officer') && (
            <>
              {complaint.status === 'assigned' && (
                <button
                  onClick={() => acceptAssignment(complaint.id)}
                  className="px-3 py-1.5 rounded-lg bg-police-700 hover:bg-police-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                  <span>{t('Accept Case Assignment')}</span>
                </button>
              )}
              {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                <>
                  <button
                    onClick={() => setIsUpdateOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-police-300 dark:border-police-700 text-police-700 dark:text-police-300 hover:bg-police-50 dark:hover:bg-police-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>{t('Update Investigation Status')}</span>
                  </button>
                  <button
                    onClick={() => setIsResolutionOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck size={13} />
                    <span>{t('Submit Resolution & Close')}</span>
                  </button>
                </>
              )}
            </>
          )}

          {/* Supervisor Actions */}
          {isSupervisor && (
            <>
              <button
                onClick={() => setIsReassignOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-police-950 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck size={13} />
                <span>{t('Reassign to Another Officer')}</span>
              </button>
            </>
          )}

          {/* Citizen Actions */}
          {complaint.status === 'resolved' && !complaint.feedback && isCitizenOwner && (
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-police-950 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <HeartHandshake size={13} />
              <span>{t('Citizen Feedback')}</span>
            </button>
          )}

          {(complaint.status === 'resolved' || complaint.status === 'closed') && (
            <button
              onClick={() => setIsReopenOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>{t('Request Case Reopening')}</span>
            </button>
          )}

          {/* Print/Export */}
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs cursor-pointer"
            title={t('Print Case Dossier')}
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className={`p-4 ${tokens.cardClass} space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-lg font-bold text-police-700 dark:text-police-400">
                {complaint.id}
              </span>
              {complaint.firNumber && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[6px] bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold tracking-wide">
                  FIR: {complaint.firNumber}
                </span>
              )}
              {complaint.isIrlCase && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[6px] bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-semibold">
                  KSP REAL-WORLD DOSSIER
                </span>
              )}
              <StatusBadge status={complaint.status} size="sm" />
              <PriorityBadge priority={complaint.priority} />
              {complaint.severity && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[6px] bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold">
                  {complaint.severity.toUpperCase()}
                </span>
              )}
              {complaint.originalLanguage === 'kn' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[6px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ಕನ್ನಡ (Kannada Original)
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {language === 'kn'
                ? (/[\u0C80-\u0CFF]/.test(complaint.title) ? complaint.title : (complaint.titleKannada || complaint.title))
                : complaint.title}
            </h1>
            <p className="text-xs text-slate-500">
              {t('Department')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{complaint.department}</span> • {t('Unit')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{complaint.unit}</span> • {t('Area')}: <span className="font-mono text-slate-600 dark:text-slate-400">{complaint.incidentLocation?.city || 'Bangalore'}</span>
            </p>
          </div>

          <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-w-[260px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{t('liveSlaCountdown')}</span>
              <SLACountdown
                dueDate={complaint.dueDate || (complaint as any).due_date}
                isResolved={complaint.status === 'resolved' || complaint.status === 'closed'}
                isOverdue={complaint.status === 'overdue' || complaint.isOverdue}
              />
            </div>
            <SLAProgressBar complaint={complaint} />
          </div>
        </div>

        {/* Escalation Alert Banner if escalated */}
        {complaint.isEscalated && (
          <div className="p-3 rounded-[6px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-red-900 dark:text-red-200">
              <ShieldAlert size={14} className="text-red-600 shrink-0" />
              <span>SUPERVISOR ESCALATION EVENT ACTIVE</span>
            </div>
            <p className="text-red-800 dark:text-red-300 leading-relaxed">
              {complaint.escalationReason || 'Statutory resolution SLA breached without closure report. Case prioritized on DySP Command Dashboard.'}
            </p>
            <span className="text-[10px] text-red-700 dark:text-red-400 font-mono block pt-0.5">
              Escalated at: {new Date(complaint.escalatedAt || complaint.updatedAt).toLocaleString()}
            </span>
          </div>
        )}

        {/* Standout Feature 1: Duplicate Detection Banner */}
        {(complaint.duplicateOf || (complaint as any).duplicate_of) && (
          <div className="p-3 rounded-[6px] bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <span>Duplicate Record Correlation</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300">
              This grievance shares high semantic text similarity with existing police case record{' '}
              <strong className="font-mono underline">
                {complaint.duplicateOf || (complaint as any).duplicate_of}
              </strong>
              . Flagged to investigating officer for cross-referencing and verification.
            </p>
          </div>
        )}

        {/* Statutory Escalation Ladder Stepper */}
        <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <EscalationLadderStepper complaint={complaint} />
        </div>

        {/* AI Triage & Assessment Card */}
        <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles size={14} className="text-police-600 dark:text-police-400 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {t('AI Suggested Category & Priority')}
              </span>
              <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono text-[10px]">
                {t('Suggested. Officer must confirm.')}
              </span>
            </div>

            {(role === 'junior_officer' || isSupervisor) && (
              <button
                onClick={() => {
                  setCorrectCategory(complaint.category);
                  setCorrectPriority(complaint.priority);
                  setIsCorrectAIOpen(true);
                }}
                className="px-2.5 py-1 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer w-fit"
              >
                <Edit3 size={12} />
                <span>{t('Override Category / Priority')}</span>
              </button>
            )}
          </div>

          {(complaint.aiFlagBanner || (complaint as any).ai_flag_banner) && (
            <div className="p-2 rounded-[6px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 font-medium text-[11px] flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-600 shrink-0" />
              <span>{complaint.aiFlagBanner || (complaint as any).ai_flag_banner}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-400 block font-medium">{t('Category')}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{t(complaint.category)}</span>
              {complaint.category_corrected && (
                <span className="ml-1 text-[10px] text-amber-600 font-medium">(Officer Corrected)</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block font-medium">{t('Priority')}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{t(complaint.priority)}</span>
              {complaint.priority_corrected && (
                <span className="ml-1 text-[10px] text-amber-600 font-medium">(Officer Corrected)</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block font-medium">{t('Mandatory Next Action')}:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {complaint.nextAction || (complaint as any).next_action || 'Preliminary verification'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">{t('Target Resolution Due Date')}:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {new Date(complaint.dueDate || (complaint as any).due_date || complaint.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dossier Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold no-print">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'border-police-600 text-police-700 dark:text-police-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Overview')}
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'timeline'
              ? 'border-police-600 text-police-700 dark:text-police-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Investigation Timeline')} ({historyEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`py-3 px-4 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'evidence'
              ? 'border-police-600 text-police-700 dark:text-police-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Evidence & Documents')} ({complaint.documents.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Real-World KSP / Lokayukta Case Intelligence Dossier */}
          {(complaint.firNumber || complaint.applicableLaws || complaint.supervisingOfficerName || complaint.financialLossInr !== undefined || complaint.evidenceItems) && (
            <div className={`p-4 ${tokens.cardClass} space-y-3.5 border-l-4 border-l-police-700 dark:border-l-police-500`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-police-700 dark:text-police-400" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    Official Police Case Dossier & Statutory Evidence Ledger
                  </h3>
                </div>
                {complaint.firNumber && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-police-50 dark:bg-police-950 text-police-800 dark:text-police-200 border border-police-200 dark:border-police-800 font-bold">
                    Crime FIR No: {complaint.firNumber}
                  </span>
                )}
              </div>

              {/* 4-Column Intelligence Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {/* 1. Station & Specialized Unit */}
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Jurisdiction / Unit</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{complaint.specializedUnit || complaint.department}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{complaint.incidentLocation?.nearestPoliceStation || complaint.unit}</p>
                </div>

                {/* 2. Supervising IPS Officer */}
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Supervising Officer</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{complaint.supervisingOfficerName || 'Senior Command'}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{complaint.supervisingOfficerRank || 'IPS Officer'}</p>
                </div>

                {/* 3. Financial Impact & Recovery */}
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Financial Loss / Siphoned</span>
                  <p className="font-mono font-bold text-red-700 dark:text-red-400">
                    {complaint.financialLossInr ? `₹${Number(complaint.financialLossInr).toLocaleString('en-IN')}` : '₹0 (Non-Financial)'}
                  </p>
                  {complaint.amountFrozenInr ? (
                    <span className="inline-block text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      ₹{Number(complaint.amountFrozenInr).toLocaleString('en-IN')} Frozen / Seized
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">No freeze order active</span>
                  )}
                </div>

                {/* 4. Sub-category & Severity */}
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Offence Classification</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{complaint.subCategory || complaint.category}</p>
                  <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-medium">Severity: {complaint.severity || complaint.priority}</p>
                </div>
              </div>

              {/* Applicable Laws Section */}
              {complaint.applicableLaws && complaint.applicableLaws.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Statutory Provisions & Legal Sections Invoked:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {complaint.applicableLaws.map((law, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-police-900 dark:text-police-200 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-medium"
                      >
                        {law}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Ledger Section */}
              {complaint.evidenceItems && complaint.evidenceItems.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Evidence Register & Attached Investigative Artifacts:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                    {complaint.evidenceItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <FileText size={13} className="text-police-600 dark:text-police-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Citizen Details */}
            <div className={`p-3.5 ${tokens.cardClass} space-y-2 text-xs`}>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                <User size={14} className="text-police-600 dark:text-police-400" />
                {t('Citizen Information')}
              </span>
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {complaint.citizen.name}
              </p>
              <p className="text-slate-600 dark:text-slate-400">{t('Phone')}: {complaint.citizen.phone}</p>
              <p className="text-slate-600 dark:text-slate-400">{t('Email')}: {complaint.citizen.email}</p>
              {complaint.citizen.aadhaarLast4 && (
                <p className="text-slate-400 font-mono text-[11px]">
                  Aadhaar: XXXX-XXXX-{complaint.citizen.aadhaarLast4}
                </p>
              )}
            </div>

            {/* 2. Investigating Officer */}
            <div className={`p-3.5 ${tokens.cardClass} space-y-2 text-xs`}>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                <Shield size={14} className="text-police-600 dark:text-police-400" />
                {t('assignedOfficer')}
              </span>
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {complaint.assignedOfficerName || t('awaitingAssignment')}
              </p>
              <p className="font-mono text-slate-500">
                Badge: {complaint.assignedOfficerBadge || 'N/A'}
              </p>
              <p className="text-slate-600 dark:text-slate-400">{complaint.unit}</p>
              <p className="text-slate-500 text-[11px]">{complaint.jurisdiction}</p>
            </div>

            {/* 3. Incident Location & Date */}
            <div className={`p-3.5 ${tokens.cardClass} space-y-2 text-xs`}>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                <MapPin size={14} className="text-police-600 dark:text-police-400" />
                {t('Incident Location & Police Jurisdiction')}
              </span>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {complaint.incidentLocation.address}
              </p>
              <p className="text-slate-500">
                {complaint.incidentLocation.city}, {complaint.incidentLocation.district}
              </p>
              <p className="text-slate-400 text-[11px]">
                {t('Incident Date')}: {new Date(complaint.incidentDate).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Incident Location & Real-Time Field Dispatch Radar Card */}
          <LocationTrackingRadar complaint={complaint} />

          {/* Incident Description with On-Demand Translation */}
          <div className={`p-4 ${tokens.cardClass} space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('Grievance Statement')}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {isKnOriginal ? 'Original: ಕನ್ನಡ (Kannada)' : 'Original: English'}
                </span>
              </div>

              {/* On-Demand Translation Controls */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {translatedContent && (isKnOriginal ? !/[\u0C80-\u0CFF]/.test(translatedContent) : /[\u0C80-\u0CFF]/.test(translatedContent)) ? (
                  <div className="inline-flex rounded-[4px] border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTranslationView('original')}
                      className={`px-2 py-0.5 rounded-[3px] font-medium transition-colors cursor-pointer ${
                        translationView === 'original'
                          ? 'bg-white dark:bg-slate-700 text-police-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isKnOriginal ? 'ಕನ್ನಡ ಮೂಲ' : 'Original (EN)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTranslationView('translated')}
                      className={`px-2 py-0.5 rounded-[3px] font-medium transition-colors cursor-pointer ${
                        translationView === 'translated'
                          ? 'bg-white dark:bg-slate-700 text-police-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isKnOriginal ? 'English Translation' : 'ಕನ್ನಡ ಅನುವಾದ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTranslationView('dual')}
                      className={`px-2 py-0.5 rounded-[3px] font-medium transition-colors cursor-pointer ${
                        translationView === 'dual'
                          ? 'bg-white dark:bg-slate-700 text-police-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Side-by-Side
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTranslateOnDemand}
                    disabled={isTranslating}
                    className="px-2.5 py-1 rounded-[4px] bg-police-700 hover:bg-police-800 text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Languages size={12} className={isTranslating ? 'animate-spin' : ''} />
                    <span>
                      {isTranslating
                        ? (language === 'kn' ? 'ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...' : 'Translating...')
                        : (isKnOriginal ? 'Translate to English' : 'ಕನ್ನಡಕ್ಕೆ ಅನುವಾದಿಸಿ (Translate to Kannada)')}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Display Statement based on View Mode */}
            {translationView === 'dual' && translatedContent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    {isKnOriginal ? 'ಕನ್ನಡ ಮೂಲ ದಾಖಲೆ (Original)' : 'Original English Dossier'}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {complaint.description}
                  </p>
                </div>
                <div className="p-3 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-police-700 dark:text-police-400 font-mono">
                    {isKnOriginal ? 'English Translation' : 'ಕನ್ನಡ ಅನುವಾದ (Translated)'}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-kannada">
                    {translatedContent}
                  </p>
                </div>
              </div>
            ) : translationView === 'translated' && translatedContent ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-police-700 dark:text-police-400 font-mono font-semibold">
                  <Globe size={11} />
                  <span>{isKnOriginal ? 'English Administrative Translation:' : 'ಕನ್ನಡ ಅಧಿಕೃತ ಅನುವಾದ:'}</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-850/50 p-3 rounded-[6px] border border-slate-200 dark:border-slate-800 font-kannada">
                  {translatedContent}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>
            )}
          </div>

          {/* Investigation Remarks Log */}
          <div className={`p-4 ${tokens.cardClass} space-y-3`}>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('Officer Investigation Remarks Log')} ({complaint.investigationRemarks.length})
              </h3>
              {(isAssignedToMe || role === 'junior_officer') && (
                <button
                  onClick={() => setIsUpdateOpen(true)}
                  className="text-xs font-semibold text-police-700 dark:text-police-400 hover:underline cursor-pointer"
                >
                  + Add New Remark
                </button>
              )}
            </div>

            {complaint.investigationRemarks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">
                No preliminary investigation remarks logged yet. Case pending initial officer notes.
              </p>
            ) : (
              <div className="space-y-2">
                {complaint.investigationRemarks.map(rem => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {rem.officerName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(rem.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {rem.remark}
                    </p>
                    {rem.attachmentUrl && (
                      <span className="text-[11px] text-police-600 block">
                        Attachment: {rem.attachmentUrl}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolution & Feedback Section */}
          {complaint.resolution && (
            <div className={`p-4 rounded-[6px] border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 space-y-2`}>
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300 pb-1.5 border-b border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Certified Case Resolution Report</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {complaint.resolution.summary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Resolved By</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {complaint.resolution.resolvedByOfficerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">FIR / LDR Record</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {complaint.resolution.firNumber || 'Non-Cognizable Recorded'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Resolved On</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">
                    {new Date(complaint.resolution.resolvedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Citizen Feedback if submitted */}
          {complaint.feedback && (
            <div className="p-3.5 rounded-[6px] border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-1.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-amber-200/60 dark:border-amber-900">
                <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <HeartHandshake size={14} />
                  <span>Citizen Service Rating:</span>
                  <span className="inline-flex items-center gap-0.5 font-mono">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    {complaint.feedback.rating}/5
                  </span>
                  <span className="text-slate-500">({complaint.feedback.satisfactionCategory})</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                "{complaint.feedback.comments}"
              </p>
            </div>
          )}
        </div>
      )}



      {activeTab === 'timeline' && (
        <div className={`p-4 ${tokens.cardClass} space-y-3`}>
          <ActionHistoryTimeline entries={historyEntries} />
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className={`p-4 ${tokens.cardClass} space-y-3`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            Chain of Custody • Supporting Evidence Documents ({complaint.documents.length})
          </h3>
          {complaint.documents.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No digital evidence or files uploaded for this case.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {complaint.documents.map(doc => (
                <div
                  key={doc.id}
                  className="p-3 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                      {doc.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-[4px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {doc.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Uploaded by {doc.uploadedBy} • {doc.size}
                  </p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-police-600 dark:text-police-400 font-semibold hover:underline pt-0.5"
                  >
                    <Download size={13} />
                    <span>Download / Inspect Document</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ReassignModal
        complaint={complaint}
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
      />
      <StatusUpdateModal
        complaint={complaint}
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
      />
      <ResolutionModal
        complaint={complaint}
        isOpen={isResolutionOpen}
        onClose={() => setIsResolutionOpen(false)}
      />
      <FeedbackModal
        complaint={complaint}
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
      <ReopenModal
        complaint={complaint}
        isOpen={isReopenOpen}
        onClose={() => setIsReopenOpen(false)}
      />

      {/* Override AI Classification Modal */}
      {isCorrectAIOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[6px] max-w-lg w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-police-700 dark:text-police-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Override AI Classification
                </h3>
              </div>
              <button
                onClick={() => setIsCorrectAIOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              As an authorized police officer or supervisor, you can correct the AI-suggested category and priority.
              All modifications are recorded in the SHA-256 tamper-evident audit ledger.
            </p>

            <form onSubmit={handleCorrectAI} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Correct Category')}
                </label>
                <select
                  value={correctCategory}
                  onChange={e => setCorrectCategory(e.target.value)}
                  className="w-full p-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Cybercrime">{t('Cybercrime')}</option>
                  <option value="Financial Fraud">{t('Financial Fraud')}</option>
                  <option value="Lost Property">{t('Lost Property')}</option>
                  <option value="Traffic & Public Safety">{t('Traffic & Public Safety')}</option>
                  <option value="Complaints Involving Individuals">{t('Complaints Involving Individuals')}</option>
                  <option value="Women & Child Safety">{t('Women & Child Safety')}</option>
                  <option value="Theft & Burglary">{t('Theft & Burglary')}</option>
                  <option value="Narcotics & Illegal Substances">{t('Narcotics & Substance Abuse') || t('Narcotics & Illegal Substances')}</option>
                  <option value="Missing Persons & Runaways">{t('Missing Persons') || t('Missing Persons & Runaways')}</option>
                  <option value="Public Nuisance & Civic Grievances">{t('Noise & Public Nuisance') || t('Public Nuisance & Civic Grievances')}</option>
                  <option value="Senior Citizen Assistance">{t('Senior Citizen Assistance')}</option>
                  <option value="Organized Crime & Extortion">{t('Organized Crime & Extortion')}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Correct Priority')}
                </label>
                <select
                  value={correctPriority}
                  onChange={e => setCorrectPriority(e.target.value)}
                  className="w-full p-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Urgent">{t('Urgent Priority')}</option>
                  <option value="High">{t('High Priority')}</option>
                  <option value="Medium">{t('Medium Priority')}</option>
                  <option value="Low">{t('Low Priority')}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Reason for Correction (Mandatory for Audit Trail)')}
                </label>
                <textarea
                  required
                  rows={3}
                  value={correctReason}
                  onChange={e => setCorrectReason(e.target.value)}
                  placeholder={t('Reason for Correction (Mandatory for Audit Trail)')}
                  className="w-full p-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCorrectAIOpen(false)}
                  className="px-3 py-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCorrection}
                  className="px-3 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCorrection ? t('Logging Correction...') : t('Confirm and Log Override')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
