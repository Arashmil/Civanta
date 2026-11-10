import React, { useState, useRef, useEffect } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppNotification } from '../../types';
import {
  Bell,
  Check,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';

interface NotificationDropdownProps {
  onSelectComplaint?: (complaintId: string) => void;
  onViewAll?: () => void;
  onNavigate?: (page: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onSelectComplaint,
  onViewAll,
  onNavigate
}) => {
  const { notifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead, complaints } =
    useGrievance();
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to determine the complaint form/category
  const getComplaintCategory = (notif: AppNotification): string => {
    if (notif.category) return notif.category;
    if (notif.complaintId) {
      const comp = complaints.find(c => c.id.toUpperCase() === notif.complaintId?.toUpperCase());
      if (comp?.category) return comp.category;
    }
    // Infer from title / message keywords
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

  // Badge styling based on complaint form/category
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Cybercrime':
        return {
          label: language === 'kn' ? 'ಸೈಬರ್ ಅಪರಾಧ' : 'Cybercrime',
          className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800'
        };
      case 'Financial Fraud':
        return {
          label: language === 'kn' ? 'ಹಣಕಾಸು ವಂಚನೆ' : 'Financial Fraud',
          className: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
        };
      case 'Lost Property':
        return {
          label: language === 'kn' ? 'ಕಳೆದುಹೋದ ವಸ್ತು' : 'Lost Property',
          className: 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800'
        };
      case 'Traffic & Public Safety':
        return {
          label: language === 'kn' ? 'ಸಂಚಾರ ಸುರಕ್ಷತೆ' : 'Traffic & Safety',
          className: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
        };
      case 'Complaints Involving Individuals':
        return {
          label: language === 'kn' ? 'ವೈಯಕ್ತಿಕ ದೂರು' : 'Individual Grievance',
          className: 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800'
        };
      default:
        return {
          label: language === 'kn' ? 'ಪೊಲೀಸ್ ಕಚೇರಿ' : 'General Grievance',
          className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
        };
    }
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'escalation':
      case 'highest_priority_breach':
        return <ShieldAlert className="text-red-600 dark:text-red-400 shrink-0" size={15} />;
      case 'overdue':
        return <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0" size={15} />;
      case 'reminder':
      case 'due_reminder':
        return <Clock className="text-police-700 dark:text-police-400 shrink-0" size={15} />;
      case 'resolution':
      case 'case_resolved':
        return <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0" size={15} />;
      default:
        return <FileText className="text-slate-600 dark:text-slate-400 shrink-0" size={15} />;
    }
  };

  // User role filter
  const roleNotifications = notifications.filter(n => {
    if (!currentUser) return true;
    if (n.recipientId && n.recipientId === currentUser.id) return true;
    if (n.recipientRole && n.recipientRole === currentUser.role) return true;
    if (currentUser.role === 'admin') return true;
    return false;
  });

  // Display list: if 'mine' selected and has items, use roleNotifications; otherwise show all notifications
  const displayNotifications = activeTab === 'mine' && roleNotifications.length > 0
    ? roleNotifications
    : notifications;

  const handleOpenNotificationMenu = (notif?: AppNotification) => {
    if (notif) {
      markNotificationRead(notif.id);
      if (notif.complaintId && onSelectComplaint) {
        onSelectComplaint(notif.complaintId);
      }
    }
    setIsOpen(false);
    if (onViewAll) {
      onViewAll();
    } else if (onNavigate) {
      onNavigate('notifications');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title={language === 'kn' ? 'ಸೂಚನೆಗಳು (Notifications)' : 'Notifications'}
        aria-label="Open notifications"
      >
        <Bell size={16} />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-mono font-bold text-white shadow-xs">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-84 sm:w-96 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bell size={13} className="text-[#14213D] dark:text-amber-400" />
                {t('notifications')}
              </span>
              {unreadNotificationsCount > 0 && (
                <span className="rounded-[4px] bg-red-100 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900">
                  {unreadNotificationsCount} {language === 'kn' ? 'ಹೊಸತು' : 'new'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-police-700 hover:text-police-900 dark:text-police-400 flex items-center gap-1 font-medium cursor-pointer"
                  title="Mark all as read"
                >
                  <Check size={11} />
                  <span>{t('markAllRead')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Tabs: All Grievance Alerts / My Role */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 px-2 py-1 gap-1 text-[11px]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-800 text-police-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {language === 'kn' ? 'ಎಲ್ಲಾ ಸೂಚನೆಗಳು' : 'All Case Alerts'} ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                activeTab === 'mine'
                  ? 'bg-white dark:bg-slate-800 text-police-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {language === 'kn' ? 'ನನ್ನ ಪಾತ್ರಕ್ಕೆ ಸಂಬಂಧಿಸಿದ' : 'My Role Alerts'} ({roleNotifications.length})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-84 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {displayNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono space-y-1">
                <p>{language === 'kn' ? 'ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ' : 'No notifications in this view'}</p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="text-police-700 dark:text-police-400 underline text-[11px] cursor-pointer"
                >
                  {language === 'kn' ? 'ಎಲ್ಲಾ ಪ್ರಕರಣಗಳ ಸೂಚನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'View all station notifications'}
                </button>
              </div>
            ) : (
              displayNotifications.slice(0, 8).map(notif => {
                const category = getComplaintCategory(notif);
                const badge = getCategoryBadge(category);
                const displayMessage = (language === 'kn' && notif.messageKannada) ? notif.messageKannada : notif.message;
                const isUrgent = notif.priority === 'urgent';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleOpenNotificationMenu(notif)}
                    className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-2.5 ${
                      !notif.isRead ? 'bg-amber-50/30 dark:bg-slate-850/80 border-l-2 border-l-police-700 dark:border-l-amber-400' : ''
                    }`}
                    title="Click to view in Notification Menu"
                  >
                    <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                    <div className="flex-1 space-y-1">
                      {/* Classification Badge & Timestamp */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Title */}
                      <p className={`text-xs leading-snug ${
                        isUrgent ? 'text-red-700 dark:text-red-400 font-bold' : 'text-slate-900 dark:text-slate-100 font-semibold'
                      }`}>
                        {notif.title}
                      </p>

                      {/* Message preview */}
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {displayMessage}
                      </p>

                      {/* Complaint ID reference */}
                      {notif.complaintId && (
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="text-[10px] font-mono text-police-700 dark:text-police-300 font-bold">
                            {notif.complaintId}
                          </span>
                          <span className="text-[10px] text-slate-400">→</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: Open Notification Menu */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-2 text-center bg-slate-50 dark:bg-slate-850">
            <button
              onClick={() => handleOpenNotificationMenu()}
              className="w-full py-1.5 px-3 text-xs text-police-700 dark:text-police-300 hover:text-police-900 dark:hover:text-white font-semibold flex items-center justify-center gap-1.5 rounded-[4px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>{language === 'kn' ? 'ಅಧಿಸೂಚನೆ ಮೆನು ತೆರೆಯಿರಿ (ಎಲ್ಲವನ್ನು ವೀಕ್ಷಿಸಿ)' : 'Open Notification Menu (View All)'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
