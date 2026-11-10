import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { Shield, UserCheck, ShieldAlert, Settings, X, Check } from 'lucide-react';

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected?: (role: UserRole) => void;
}

export const DemoLoginModal: React.FC<DemoLoginModalProps> = ({ isOpen, onClose, onRoleSelected }) => {
  const { currentRole, switchRole } = useAuth();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const rolesConfig: {
    role: UserRole;
    title: string;
    subtitle: string;
    email: string;
    badge?: string;
    icon: any;
    color: string;
    border: string;
  }[] = [
    {
      role: 'citizen',
      title: t('citizen'),
      subtitle: `Ramesh Gowda • ${t('Public Grievance Portal')}`,
      email: 'citizen@demo.com',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      role: 'junior_officer',
      title: t('Junior Police Officer (PSI)'),
      subtitle: `PSI Anand Kumar • ${t('Cyber Crime South Div')}`,
      badge: 'KSP-PSI-2489',
      email: 'junior@demo.com',
      icon: Shield,
      color: 'bg-police-50 text-police-700 dark:bg-police-950/40 dark:text-police-300',
      border: 'border-police-200 dark:border-police-800'
    },
    {
      role: 'senior_supervisor',
      title: t('Senior Police Supervisor (DySP)'),
      subtitle: `DySP Rajeshwari Hegde • ${t('Vigilance & Command')}`,
      badge: 'KSP-DySP-1042',
      email: 'supervisor@demo.com',
      icon: ShieldAlert,
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800'
    },
    {
      role: 'admin',
      title: t('System Administrator'),
      subtitle: `Prakash Rao • ${t('Police Computer Systems')}`,
      email: 'admin@demo.com',
      icon: Settings,
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800'
    }
  ];

  const handleSelect = (role: UserRole) => {
    switchRole(role);
    if (onRoleSelected) onRoleSelected(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[6px] bg-white p-6 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-[6px] bg-police-700 flex items-center justify-center text-white">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {t('Switch Demonstration Role')}
            </h3>
            <p className="text-xs text-slate-500">
              Standard credential for demonstration accounts: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-[4px] font-mono text-police-700 dark:text-police-400 font-medium">Demo@123</code>
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {rolesConfig.map(cfg => {
            const Icon = cfg.icon;
            const isSelected = currentRole === cfg.role;
            return (
              <button
                key={cfg.role}
                onClick={() => handleSelect(cfg.role)}
                className={`w-full flex items-center justify-between p-3 rounded-[6px] border transition-colors text-left cursor-pointer ${
                  isSelected
                    ? `${cfg.border} ring-1 ring-police-500/30 ${cfg.color}`
                    : 'border-slate-200 dark:border-slate-800 hover:border-police-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-[6px] ${cfg.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {cfg.title}
                      </span>
                      {cfg.badge && (
                        <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-[4px] text-slate-700 dark:text-slate-300">
                          {cfg.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {cfg.subtitle}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                      {cfg.email}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-police-700 dark:text-police-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-[4px] border border-police-200 dark:border-police-700">
                    <Check size={12} /> {t('Active')}
                  </span>
                ) : (
                  <span className="text-[11px] text-police-600 dark:text-police-400 font-medium">
                    {t('Select')}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Role switches update permission sets, navigation routes, and dashboard metrics.
          </p>
        </div>
      </div>
    </div>
  );
};
