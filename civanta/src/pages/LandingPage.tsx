import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGrievance } from '../context/GrievanceContext';
import { useLanguage } from '../context/LanguageContext';
import { tokens } from '../tokens';
import {
  Shield,
  FilePlus2,
  Search,
  ShieldAlert,
  Clock,
  Languages,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Lock,
  Users
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onOpenRoleModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenRoleModal }) => {
  const { loginAs } = useAuth();
  const { complaints } = useGrievance();
  const { t } = useLanguage();

  const totalComplaints = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const overdueCount = complaints.filter(c => c.isOverdue || c.status === 'overdue' || c.status === 'escalated').length;
  const onTimeRate = Math.round(((totalComplaints - overdueCount) / Math.max(1, totalComplaints)) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Dense Administrative Hero */}
      <section className="p-6 rounded-[6px] bg-police-900 border border-police-800 text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-police-800 border border-police-700 text-slate-200">
                {t('kspPilotPlatform')}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {t('academicDemoPrototype')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t('landingHeroTitle')}
            </h1>
            <p className="text-xs text-slate-300 font-mono">
              "{t('appTagline')}"
            </p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {t('landingHeroDescription')}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 min-w-[200px]">
            <button
              onClick={() => {
                loginAs('citizen');
                onNavigate('new-complaint');
              }}
              className="w-full px-3 py-2 rounded-[6px] bg-police-700 hover:bg-police-600 text-white font-semibold text-xs border border-police-600 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FilePlus2 size={14} />
              <span>{t('newComplaint')}</span>
            </button>

            <button
              onClick={() => onNavigate('track-complaint')}
              className="w-full px-3 py-2 rounded-[6px] bg-police-800 hover:bg-police-700 text-slate-200 font-medium text-xs border border-police-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={14} />
              <span>{t('trackGrievanceById')}</span>
            </button>

            <button
              onClick={onOpenRoleModal}
              className="w-full px-3 py-2 rounded-[6px] bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users size={14} />
              <span>{t('demoRoleAccounts')}</span>
            </button>
          </div>
        </div>

        {/* Live System Metric Tickers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-police-800">
          <div className="p-2.5 rounded-[4px] bg-police-800/80 border border-police-700">
            <span className="text-[10px] font-mono text-slate-300 block">{t('totalCatalog')}</span>
            <span className="text-lg font-bold font-mono text-white">{totalComplaints}</span>
          </div>
          <div className="p-2.5 rounded-[4px] bg-police-800/80 border border-police-700">
            <span className="text-[10px] font-mono text-slate-300 block">{t('resolvedClosed')}</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{resolvedCount}</span>
          </div>
          <div className="p-2.5 rounded-[4px] bg-police-800/80 border border-police-700">
            <span className="text-[10px] font-mono text-slate-300 block">{t('onTimeCompliance')}</span>
            <span className="text-lg font-bold font-mono text-slate-100">{onTimeRate}%</span>
          </div>
          <div className="p-2.5 rounded-[4px] bg-police-800/80 border border-police-700">
            <span className="text-[10px] font-mono text-slate-300 block">{t('activeOverdue')}</span>
            <span className="text-lg font-bold font-mono text-red-400">{overdueCount}</span>
          </div>
        </div>
      </section>

      {/* 4 Primary Operational Roles */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {t('operationalRolePortals')}
          </h2>
          <span className="text-[10px] font-mono text-slate-400">
            {t('selectPortalDesc')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Citizen */}
          <div
            onClick={() => {
              loginAs('citizen');
              onNavigate('citizen-dash');
            }}
            className={`p-4 ${tokens.cardClass} hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {t('Role 1')}
              </span>
              <FilePlus2 size={16} className="text-police-700 dark:text-police-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('citizenPortal')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('citizenPortalDesc')}
            </p>
            <span className="text-xs font-semibold text-police-700 dark:text-police-400 flex items-center gap-1 pt-1">
              <span>{t('openPortal')}</span>
              <ArrowRight size={12} />
            </span>
          </div>

          {/* 2. Junior Officer */}
          <div
            onClick={() => {
              loginAs('junior_officer');
              onNavigate('officer-dash');
            }}
            className={`p-4 ${tokens.cardClass} hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {t('Role 2')}
              </span>
              <Shield size={16} className="text-police-700 dark:text-police-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('juniorOfficerPsi')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('juniorOfficerDesc')}
            </p>
            <span className="text-xs font-semibold text-police-700 dark:text-police-400 flex items-center gap-1 pt-1">
              <span>{t('openWorkstation')}</span>
              <ArrowRight size={12} />
            </span>
          </div>

          {/* 3. Senior Supervisor */}
          <div
            onClick={() => {
              loginAs('senior_supervisor');
              onNavigate('supervisor-dash');
            }}
            className={`p-4 ${tokens.cardClass} hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {t('Role 3')}
              </span>
              <ShieldAlert size={16} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('seniorSupervisorDysp')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('seniorSupervisorDesc')}
            </p>
            <span className="text-xs font-semibold text-police-700 dark:text-police-400 flex items-center gap-1 pt-1">
              <span>{t('openCommandCenter')}</span>
              <ArrowRight size={12} />
            </span>
          </div>

          {/* 4. Administrator */}
          <div
            onClick={() => {
              loginAs('admin');
              onNavigate('admin-dash');
            }}
            className={`p-4 ${tokens.cardClass} hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {t('Role 4')}
              </span>
              <Cpu size={16} className="text-police-700 dark:text-police-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('systemAdmin')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('systemAdminDesc')}
            </p>
            <span className="text-xs font-semibold text-police-700 dark:text-police-400 flex items-center gap-1 pt-1">
              <span>{t('openAdminConsole')}</span>
              <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </section>

      {/* Statutory Architecture Pillars */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-slate-800">
          {t('coreEnforcementArchitecture')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`p-4 ${tokens.cardClass} space-y-2`}>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-police-700 dark:text-police-400" />
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                {t('mandatoryNextActionRule')}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('mandatoryNextActionDesc')}
            </p>
          </div>

          <div className={`p-4 ${tokens.cardClass} space-y-2`}>
            <div className="flex items-center gap-2">
              <Languages size={16} className="text-police-700 dark:text-police-400" />
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                {t('bilingualKannadaEnglish')}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('bilingualDesc')}
            </p>
          </div>

          <div className={`p-4 ${tokens.cardClass} space-y-2`}>
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-police-700 dark:text-police-400" />
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                {t('tamperEvidentLedger')}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('tamperEvidentDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
