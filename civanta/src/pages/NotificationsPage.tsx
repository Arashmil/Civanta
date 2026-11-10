import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AppNotification } from '../types';
import { tokens } from '../tokens';
import {
  Bell,
  Check,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  AlertTriangle,
  FolderGit2,
  Calendar,
  Send,
  Filter
} from 'lucide-react';

interface NotificationsPageProps {
  onSelectComplaint?: (complaintId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onSelectComplaint }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, complaints } = useGrievance();
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [filterType, setFilterType] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const role = currentUser?.role || 'citizen';

  // Helper to determine the complaint form/category
  const getComplaintCategory = (notif: AppNotification): string => {
    if (notif.category) return notif.category;
    if (notif.complaintId) {
      const comp = complaints.find(c => c.id.toUpperCase() === notif.complaintId?.toUpperCase());
      if (comp?.category) return comp.category;
    }
    const text = `${notif.title} ${notif.message}`.toLowerCase();
    if (text.includes('upi') || text.includes('cyber') || text.includes('phishing') || text.includes('account takeover')) {
      return 'Cybercrime';
    }
    if (text.includes('fraud') || text.includes('trading') || text.includes('wire') || text.includes('ponzi')) {
      return 'Financial Fraud';
    }
    if (text.includes('phone') || text.includes('mobile') || text.includes('theft') || text.includes('vehicle') || text.includes('lost')) {
      return 'Lost Property';
    }
    if (text.includes('traffic') || text.includes('signal') || text.includes('road') || text.includes('accident')) {
      return 'Traffic & Public Safety';
    }
    if (text.includes('tenant') || text.includes('deposit') || text.includes('dispute') || text.includes('harassment')) {
      return 'Complaints Involving Individuals';
    }
    return 'General Grievance';
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Cybercrime':
        return {
          label: language === 'kn' ? 'ಸೈಬರ್ ಅಪರಾಧ (Cybercrime)' : 'Cybercrime',
          className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800'
        };
      case 'Financial Fraud':
        return {
          label: language === 'kn' ? 'ಹಣಕಾಸು ವಂಚನೆ (Financial Fraud)' : 'Financial Fraud',
          className: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
        };
      case 'Lost Property':
        return {
          label: language === 'kn' ? 'ಕಳೆದುಹೋದ ವಸ್ತುಗಳು (Lost Property)' : 'Lost Property',
          className: 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800'
        };
      case 'Traffic & Public Safety':
        return {
          label: language === 'kn' ? 'ಸಂಚಾರ ಸುರಕ್ಷತೆ (Traffic & Public Safety)' : 'Traffic & Public Safety',
          className: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
        };
      case 'Complaints Involving Individuals':
        return {
          label: language === 'kn' ? 'ವೈಯಕ್ತಿಕ ದೂರು (Individual Grievance)' : 'Complaints Involving Individuals',
          className: 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800'
        };
      default:
        return {
          label: language === 'kn' ? 'ಪೊಲೀಸ್ ಕಚೇರಿ (General)' : 'General Police Notice',
          className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
        };
    }
  };

  // Role-specific filter tab configurations
  const getTabsForRole = () => {
    if (role === 'citizen') {
      return [
        { id: 'all', label: 'All Citizen Updates' },
        { id: 'case_registered', label: 'Grievance Registrations' },
        { id: 'officer_assigned', label: 'Investigating Officers Assigned' },
        { id: 'case_scheduled', label: 'Supervisory Review Scheduled' },
        { id: 'case_resolved', label: 'Resolutions & Closures' },
      ];
    }
    if (role === 'junior_officer') {
      return [
        { id: 'all', label: 'All Officer Alerts' },
        { id: 'case_assigned', label: 'New Assigned Cases' },
        { id: 'due_reminder', label: '24-Hour SLA Reminders' },
        { id: 'supervisor_directive', label: 'Command Directives' },
      ];
    }
    if (role === 'senior_supervisor') {
      return [
        { id: 'all', label: 'All Command Notices' },
        { id: 'citizen_filing', label: 'Citizen Case Intakes' },
        { id: 'highest_priority_breach', label: 'Critical SLA Breaches (Red Flag)' },
        { id: 'escalation_alert', label: 'Overdue Escalations' },
        { id: 'rescheduling_request', label: 'Officer Rescheduling Requests' },
        { id: 'case_resolved', label: 'Resolution Certifications' },
      ];
    }
    return [
      { id: 'all', label: 'All System Alerts' },
      { id: 'highest_priority_breach', label: 'Critical Breaches' },
      { id: 'escalation_alert', label: 'Escalations' },
    ];
  };

  const tabs = getTabsForRole();

  const filtered = notifications.filter(n => {
    // 1. Role / Type filter
    if (filterType !== 'all') {
      if (filterType === 'case_resolved') {
        if (n.type !== 'case_resolved' && n.type !== 'case_closed' && n.type !== 'resolution') return false;
      } else if (n.type !== filterType) {
        return false;
      }
    }

    // 2. Complaint Category filter
    if (categoryFilter !== 'all') {
      const cat = getComplaintCategory(n);
      if (cat !== categoryFilter) return false;
    }

    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'highest_priority_breach':
      case 'escalation_alert':
      case 'escalation':
        return <ShieldAlert className="text-[#B91C1C] dark:text-red-400 shrink-0" size={16} />;
      case 'rescheduling_request':
        return <Clock className="text-[#D97706] dark:text-amber-400 shrink-0" size={16} />;
      case 'due_reminder':
      case 'overdue':
        return <AlertCircle className="text-[#D97706] dark:text-amber-400 shrink-0" size={16} />;
      case 'case_resolved':
      case 'case_closed':
      case 'resolution':
        return <CheckCircle2 className="text-[#15803D] dark:text-emerald-400 shrink-0" size={16} />;
      case 'case_scheduled':
        return <Calendar className="text-police-700 dark:text-police-300 shrink-0" size={16} />;
      case 'officer_assigned':
      case 'case_assigned':
      case 'assignment':
        return <UserCheck className="text-police-800 dark:text-police-200 shrink-0" size={16} />;
      default:
        return <FileText className="text-slate-600 dark:text-slate-400 shrink-0" size={16} />;
    }
  };

  const categoriesList = [
    { id: 'all', labelEn: 'All Forms of Grievances', labelKn: 'ಎಲ್ಲಾ ದೂರುಗಳು' },
    { id: 'Cybercrime', labelEn: 'Cybercrime', labelKn: 'ಸೈಬರ್ ಅಪರಾಧ' },
    { id: 'Financial Fraud', labelEn: 'Financial Fraud', labelKn: 'ಹಣಕಾಸು ವಂಚನೆ' },
    { id: 'Lost Property', labelEn: 'Lost Property', labelKn: 'ಕಳೆದುಹೋದ ವಸ್ತುಗಳು' },
    { id: 'Traffic & Public Safety', labelEn: 'Traffic & Public Safety', labelKn: 'ಸಂಚಾರ ಸುರಕ್ಷತೆ' },
    { id: 'Complaints Involving Individuals', labelEn: 'Individual Grievances', labelKn: 'ವೈಯಕ್ತಿಕ ದೂರುಗಳು' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Header Panel */}
      <div className={tokens.headerCardClass}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
              Karnataka State Police • Dedicated Role Alerts
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {t('officialNotificationCentre')}
            </h1>
            <p className="text-xs text-slate-200 dark:text-slate-300">
              Role-authenticated alert console. Citizen progress notices, officer 24h reminders, and supervisory command intelligence.
            </p>
          </div>

          <button
            onClick={markAllNotificationsRead}
            className="px-3 py-1.5 rounded-[6px] bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Check size={13} />
            <span>{t('markAllRead')}</span>
          </button>
        </div>
      </div>

      {/* Complaint Form Classification Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-[6px] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Filter size={14} className="text-police-700 dark:text-amber-400" />
          <span>{language === 'kn' ? 'ದೂರು ವರ್ಗದ ಪ್ರಕಾರ ವಿಂಗಡಿಸಿ:' : 'Filter by Complaint Category:'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {categoriesList.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-[4px] border transition-colors cursor-pointer text-[11px] ${
                categoryFilter === cat.id
                  ? 'bg-police-900 text-white font-bold border-police-800 dark:bg-amber-400 dark:text-slate-950 dark:border-amber-400'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'kn' ? cat.labelKn : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Role-Specific Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer text-xs ${
              filterType === tab.id
                ? 'bg-[#14213D] text-white font-semibold'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {/* Notification List with Distinct Cards */}
      <div className="rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono space-y-1">
            <p>{t('No notifications in this category.')}</p>
            <button
              onClick={() => { setCategoryFilter('all'); setFilterType('all'); }}
              className="text-police-700 dark:text-amber-400 underline text-xs cursor-pointer font-sans"
            >
              {language === 'kn' ? 'ಎಲ್ಲಾ ಅಧಿಸೂಚನೆಗಳನ್ನು ತೋರಿಸಿ' : 'Reset filters to view all'}
            </button>
          </div>
        ) : (
          filtered.map(notif => {
            const category = getComplaintCategory(notif);
            const badge = getCategoryBadge(category);
            const displayMessage = (language === 'kn' && notif.messageKannada) ? notif.messageKannada : notif.message;
            const isCritical = notif.type === 'highest_priority_breach' || notif.type === 'escalation_alert' || notif.type === 'escalation';

            return (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.complaintId && onSelectComplaint) {
                    onSelectComplaint(notif.complaintId);
                  }
                }}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-start gap-3.5 ${
                  isCritical ? 'bg-red-50/40 dark:bg-red-950/20' : !notif.isRead ? 'bg-amber-50/20 dark:bg-slate-850/80 border-l-2 border-l-police-700 dark:border-l-amber-400' : ''
                }`}
              >
                <div className="mt-1">{getNotifIcon(notif.type)}</div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${badge.className}`}>
                        {badge.label}
                      </span>
                      <h4 className={`text-xs font-semibold ${
                        isCritical ? 'text-[#B91C1C] dark:text-red-400 font-bold' : 'text-slate-900 dark:text-white'
                      }`}>
                        {notif.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {displayMessage}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                    {notif.complaintId && (
                      <span className="text-[10px] font-mono text-police-800 dark:text-police-300 font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                        Ref: {notif.complaintId} →
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {notif.type.replace(/_/g, ' ')}
                    </span>
                    {!notif.isRead && (
                      <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400 px-1 rounded bg-amber-100 dark:bg-amber-950/60">
                        UNREAD
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
