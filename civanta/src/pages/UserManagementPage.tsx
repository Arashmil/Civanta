import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { tokens } from '../tokens';
import { Shield, Building2, Star } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { officers, departments } = useGrievance();
  const { demoUsers } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'officers' | 'users' | 'departments'>('officers');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`p-4 ${tokens.cardClass} bg-police-900 text-white space-y-1`}>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
          {t('administratorControls')}
        </span>
        <h1 className="text-lg font-bold text-white tracking-tight">
          {t('usersOfficersUnitsManagement')}
        </h1>
        <p className="text-xs text-slate-300">
          {t('userManagementDesc')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveTab('officers')}
          className={`py-2 px-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'officers'
              ? 'border-police-800 text-police-900 dark:text-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Investigating Officers')} ({officers.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`py-2 px-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'departments'
              ? 'border-police-800 text-police-900 dark:text-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Police Units')} ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'users'
              ? 'border-police-800 text-police-900 dark:text-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Demo Role Accounts')} ({demoUsers.length})
        </button>
      </div>

      {/* Officers List */}
      {activeTab === 'officers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {officers.map(officer => {
            const loadPct = Math.round((officer.activeCasesCount / officer.maxCapacity) * 100);
            return (
              <div
                key={officer.id}
                className={`p-3.5 ${tokens.cardClass} space-y-2.5`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[4px] bg-police-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      <Shield size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                        {officer.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {officer.badgeNumber} • {officer.rank}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded-[4px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                    {officer.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                  <p>Department: <strong className="text-slate-800 dark:text-slate-200">{officer.departmentName}</strong></p>
                  <p>Unit Cell: <strong className="text-slate-800 dark:text-slate-200">{officer.unitName}</strong></p>
                  <p>Jurisdiction: {officer.jurisdiction}</p>
                  <p className="font-mono text-[11px] text-slate-500">{officer.phone} • {officer.email}</p>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Workload Capacity</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                      {officer.activeCasesCount} / {officer.maxCapacity} Active ({loadPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        loadPct >= 75 ? 'bg-red-600' : 'bg-police-700'
                      }`}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span>{officer.rating} rating</span>
                  </span>
                  <span>{officer.solvedCasesCount} solved</span>
                  <span>Avg: {officer.avgResolutionDays}d</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Departments List */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {departments.map(dept => (
            <div
              key={dept.id}
              className={`p-3.5 ${tokens.cardClass} space-y-2`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[4px] bg-slate-100 text-police-900 dark:bg-slate-800 dark:text-police-300 flex items-center justify-center font-bold">
                  <Building2 size={15} />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                    {dept.name}
                  </h4>
                  <p className="text-[10px] font-kannada text-slate-500">
                    {dept.nameKannada}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                <p>Unit Code: <strong className="font-mono">{dept.code}</strong></p>
                <p>Command Head: <strong className="text-slate-800 dark:text-slate-200">{dept.headOfDepartment}</strong></p>
                <p>Jurisdiction: {dept.jurisdiction}</p>
                <p>Active Officers: <strong className="font-mono">{dept.activeOfficersCount}</strong></p>
              </div>

              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  Mandated Crime Categories:
                </span>
                <div className="flex flex-wrap gap-1">
                  {dept.categories.map(cat => (
                    <span
                      key={cat}
                      className="text-[10px] px-1.5 py-0.2 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo Users List */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoUsers.map(user => (
            <div
              key={user.id}
              className={`p-3 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 text-xs`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[4px] bg-police-800 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-900 dark:text-white">
                      {user.name}
                    </h5>
                    <p className="text-[10px] font-mono text-slate-400">{user.email}</p>
                  </div>
                </div>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-[4px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">
                  {user.role}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Unit / Designation: {user.designation || user.jurisdiction || 'Citizen Account'}
              </p>
              <p className="text-slate-400 font-mono text-[10px]">
                Demo Credentials: Password is <code className="text-police-700 dark:text-police-400 font-bold">Demo@123</code>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
