import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Shield, Globe, Users, Menu, Search } from 'lucide-react';
import { tokens } from '../../tokens';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenRoleModal?: () => void;
  onSelectComplaint?: (complaintId: string) => void;
  onNavigate?: (page: string) => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenRoleModal,
  onSelectComplaint,
  onNavigate,
  onOpenCommandPalette
}) => {
  const { currentUser } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const getRoleLabel = () => {
    switch (currentUser?.role) {
      case 'citizen':
        return { label: t('citizen'), color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
      case 'junior_officer':
        return { label: t('junior_officer'), color: 'bg-police-100 text-police-900 dark:bg-police-950 dark:text-police-300' };
      case 'senior_supervisor':
        return { label: t('senior_supervisor'), color: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' };
      case 'admin':
        return { label: t('admin'), color: 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-200' };
      default:
        return { label: t('publicAccess'), color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Top Administrative Accent Line */}
      <div className="h-0.5 w-full bg-police-800 dark:bg-police-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Hamburger & Brand */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-1.5 rounded-[6px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden cursor-pointer"
                aria-label="Toggle Navigation Sidebar"
              >
                <Menu size={18} />
              </button>
            )}

            <div
              onClick={() => onNavigate && onNavigate('landing')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-[6px] bg-police-800 flex items-center justify-center text-white border border-police-700">
                <Shield size={16} className="text-amber-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-police-900 dark:text-white">
                    {t('appName')}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {t('kspPilot')}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline leading-none">
                  {t('appSubtitle')}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Command Palette Trigger Button (Ctrl+K) */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer w-64 justify-between transition-colors"
            >
              <span className="flex items-center gap-2 truncate">
                <Search size={13} className="text-slate-400" />
                <span className="text-slate-500">{t('searchCaseOrId')}</span>
              </span>
              <kbd className="font-mono text-[10px] px-1 py-0.5 rounded-[4px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenCommandPalette}
              className="p-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Search Case (Ctrl+K)"
            >
              <Search size={15} />
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Switch Language (ಕನ್ನಡ / English)"
            >
              <Globe size={13} className="text-police-700 dark:text-police-400" />
              <span className="font-kannada text-xs">{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown
              onSelectComplaint={onSelectComplaint}
              onViewAll={() => onNavigate && onNavigate('notifications')}
            />

            {/* Role Switcher Pill */}
            {currentUser && onOpenRoleModal && (
              <button
                onClick={onOpenRoleModal}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Change Demo User Role"
              >
                <div className="w-5 h-5 rounded-[4px] bg-police-800 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] font-mono px-1 rounded-[2px] inline-block w-fit ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <Users size={13} className="text-slate-400 ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
