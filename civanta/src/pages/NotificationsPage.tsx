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
  Send
} from 'lucide-react';

interface NotificationsPageProps {
  onSelectComplaint?: (complaintId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onSelectComplaint }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useGrievance();
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [filterType, setFilterType] = useState<string>('all');

  const role = currentUser?.role || 'citizen';

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
    if (filterType === 'all') return true;
    if (filterType === 'case_resolved') {
      return n.type === 'case_resolved' || n.type === 'case_closed';
    }
    return n.type === filterType;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'highest_priority_breach':
      case 'escalation_alert':
      case 'escalation':
        return <ShieldAlert className="text-[#B91C1C] shrink-0" size={16} />;
      case 'rescheduling_request':
        return <Clock className="text-[#D97706] shrink-0" size={16} />;
      case 'due_reminder':
        return <AlertCircle className="text-[#D97706] shrink-0" size={16} />;
      case 'case_resolved':
      case 'case_closed':
        return <CheckCircle2 className="text-[#15803D] shrink-0" size={16} />;
      case 'case_scheduled':
        return <Calendar className="text-police-700 dark:text-police-300 shrink-0" size={16} />;
      case 'officer_assigned':
      case 'case_assigned':
        return <UserCheck className="text-police-800 dark:text-police-200 shrink-0" size={16} />;
      default:
        return <FileText className="text-slate-600 shrink-0" size={16} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Header Panel with Visible Distinct Border (Requirement 7) */}
      <div className="p-4 rounded-[6px] bg-[#14213D] text-white border-2 border-slate-700 shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
              Karnataka State Police • Dedicated Role Alerts
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {t('officialNotificationCentre')}
            </h1>
            <p className="text-xs text-slate-300">
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

      {/* Role-Specific Filter Tabs (Requirement 8) */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer text-xs ${
              filterType === tab.id
                ? 'bg-[#14213D] text-white font-semibold'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {/* Notification List with Distinct Cards */}
      <div className="rounded-[6px] border-2 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            {t('No notifications in this category.')}
          </div>
        ) : (
          filtered.map(notif => {
            const displayMessage = (language === 'kn' && notif.messageKannada) ? notif.messageKannada : notif.message;
            const isCritical = notif.type === 'highest_priority_breach' || notif.type === 'escalation_alert';

            return (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.complaintId && onSelectComplaint) {
                    onSelectComplaint(notif.complaintId);
                  }
                }}
                className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-start gap-3.5 ${
                  isCritical ? 'bg-red-50/40 dark:bg-red-950/20' : !notif.isRead ? 'bg-slate-50/80 dark:bg-slate-850' : ''
                }`}
              >
                <div className="mt-1">{getNotifIcon(notif.type)}</div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className={`text-xs font-semibold ${
                      isCritical ? 'text-[#B91C1C] dark:text-red-400 font-bold' : 'text-slate-900 dark:text-white'
                    }`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {displayMessage}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    {notif.complaintId && (
                      <span className="text-[10px] font-mono text-police-800 dark:text-police-300 font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                        Ref: {notif.complaintId}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {notif.type.replace(/_/g, ' ')}
                    </span>
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
