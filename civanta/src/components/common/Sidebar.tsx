import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGrievance } from '../../context/GrievanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { tokens } from '../../tokens';
import {
  LayoutDashboard,
  FilePlus2,
  Search,
  FolderGit2,
  ShieldAlert,
  History,
  BarChart3,
  Users2,
  SlidersHorizontal,
  Bell,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: number;
  alert?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onToggle
}) => {
  const { currentUser, logout } = useAuth();
  const { complaints, unreadNotificationsCount } = useGrievance();
  const { t } = useLanguage();

  const role = currentUser?.role || 'citizen';

  // Counts for badge notifications
  const overdueCount = complaints.filter(c => c.isOverdue || c.isEscalated).length;
  const officerCasesCount = complaints.filter(
    c => c.assignedOfficerId === currentUser?.id && c.status !== 'resolved' && c.status !== 'closed'
  ).length;

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'citizen':
        return [
          { id: 'citizen-dash', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'new-complaint', label: t('newComplaint'), icon: FilePlus2, highlight: true },
          { id: 'track-complaint', label: t('trackComplaint'), icon: Search },
          { id: 'audit-trail', label: t('auditTrail'), icon: History },
          { id: 'notifications', label: t('notifications'), icon: Bell, badge: unreadNotificationsCount }
        ];

      case 'junior_officer':
        return [
          { id: 'officer-dash', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'assigned-cases', label: t('assignedCases'), icon: FolderGit2, badge: officerCasesCount },
          { id: 'track-complaint', label: t('trackComplaint'), icon: Search },
          { id: 'audit-trail', label: t('auditTrail'), icon: History },
          { id: 'notifications', label: t('notifications'), icon: Bell, badge: unreadNotificationsCount }
        ];

      case 'senior_supervisor':
        return [
          { id: 'supervisor-dash', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'escalations', label: t('escalations'), icon: ShieldAlert, badge: overdueCount, alert: true },
          { id: 'analytics', label: t('analytics'), icon: BarChart3 },
          { id: 'track-complaint', label: t('trackComplaint'), icon: Search },
          { id: 'audit-trail', label: t('auditTrail'), icon: History },
          { id: 'notifications', label: t('notifications'), icon: Bell, badge: unreadNotificationsCount }
        ];

      case 'admin':
        return [
          { id: 'admin-dash', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'users-management', label: t('usersManagement'), icon: Users2 },
          { id: 'sla-settings', label: t('slaSettings'), icon: SlidersHorizontal },
          { id: 'escalations', label: t('escalations'), icon: ShieldAlert, badge: overdueCount, alert: true },
          { id: 'analytics', label: t('analytics'), icon: BarChart3 },
          { id: 'audit-trail', label: t('auditTrail'), icon: History },
          { id: 'notifications', label: t('notifications'), icon: Bell, badge: unreadNotificationsCount }
        ];

      default:
        return [
          { id: 'landing', label: 'Home', icon: Home },
          { id: 'track-complaint', label: t('trackComplaint'), icon: Search }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`fixed md:sticky top-14 z-20 h-[calc(100vh-3.5rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between shrink-0 ${
        isOpen ? 'w-64' : 'w-14'
      }`}
    >
      {/* Top Nav Section */}
      <div className="p-2 space-y-4 overflow-y-auto">
        {/* Toggle Button for Desktop */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
          {isOpen && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {t('departmentPortal')}
            </span>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-[6px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ml-auto cursor-pointer"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Links */}
        <nav className="space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] font-medium text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-police-800 text-white font-semibold'
                    : item.highlight
                    ? 'bg-slate-100 text-police-900 dark:bg-slate-800 dark:text-police-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <Icon size={16} className="shrink-0" />
                {isOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
                {isOpen && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-auto px-1.5 py-0.2 rounded-[4px] text-[10px] font-mono font-bold ${
                      item.alert
                        ? 'bg-red-700 text-white'
                        : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Quick Info & Sign Out */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
        {isOpen && currentUser && (
          <div className="p-2 rounded-[6px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[4px] bg-police-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                <Shield size={12} />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-xs">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {currentUser.badgeNumber || currentUser.jurisdiction || currentUser.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            logout();
            onNavigate('landing');
          }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-slate-600 hover:text-red-700 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            !isOpen ? 'justify-center' : ''
          }`}
          title="Sign Out"
        >
          <LogOut size={14} />
          {isOpen && <span>{t('logout')}</span>}
        </button>
      </div>
    </aside>
  );
};
