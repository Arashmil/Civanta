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
  ArrowRight
} from 'lucide-react';

interface NotificationDropdownProps {
  onSelectComplaint?: (complaintId: string) => void;
  onViewAll?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onSelectComplaint,
  onViewAll
}) => {
  const { notifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead } =
    useGrievance();
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
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

  // Filter notifications relevant to current user
  const relevantNotifications = notifications.filter(n => {
    if (!currentUser) return true;
    if (n.recipientId && n.recipientId === currentUser.id) return true;
    if (n.recipientRole && n.recipientRole === currentUser.role) return true;
    if (currentUser.role === 'admin') return true;
    return false;
  });

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'escalation':
        return <ShieldAlert className="text-red-700 shrink-0" size={15} />;
      case 'overdue':
        return <AlertCircle className="text-amber-600 shrink-0" size={15} />;
      case 'reminder':
        return <Clock className="text-police-700 dark:text-police-400 shrink-0" size={15} />;
      case 'resolution':
        return <CheckCircle2 className="text-emerald-600 shrink-0" size={15} />;
      default:
        return <FileText className="text-slate-600 shrink-0" size={15} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell size={16} />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-700 text-[9px] font-mono font-bold text-white">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-80 sm:w-96 rounded-[6px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                {t('notifications')}
              </span>
              {unreadNotificationsCount > 0 && (
                <span className="rounded-[4px] bg-red-100 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">
                  {unreadNotificationsCount} unread
                </span>
              )}
            </div>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-police-700 hover:text-police-900 dark:text-police-400 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Check size={12} />
                {t('markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {relevantNotifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 font-mono">
                {t('No notifications in this category.')}
              </div>
            ) : (
              relevantNotifications.slice(0, 8).map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.complaintId && onSelectComplaint) {
                      onSelectComplaint(notif.complaintId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-2.5 ${
                    !notif.isRead ? 'bg-slate-50/80 dark:bg-slate-850' : ''
                  }`}
                >
                  <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold leading-tight ${
                        notif.priority === 'urgent' ? 'text-red-700 dark:text-red-400 font-bold' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {(language === 'kn' && notif.messageKannada) ? notif.messageKannada : notif.message}
                    </p>
                    {notif.complaintId && (
                      <span className="inline-block text-[10px] font-mono text-police-700 dark:text-police-400 font-medium pt-0.5">
                        {notif.complaintId} →
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {onViewAll && (
            <div className="border-t border-slate-100 dark:border-slate-800 p-1.5 text-center bg-slate-50 dark:bg-slate-850">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onViewAll();
                }}
                className="w-full py-1 text-xs text-police-700 dark:text-police-300 hover:text-police-900 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View all notification records</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
