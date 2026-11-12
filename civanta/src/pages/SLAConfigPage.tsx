import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useLanguage } from '../context/LanguageContext';
import { SLARule } from '../types';
import { StorageService } from '../services/storage';
import { tokens } from '../tokens';
import { Clock, Bell, ShieldAlert, Check } from 'lucide-react';

export const SLAConfigPage: React.FC = () => {
  const { slaRules, refreshData } = useGrievance();
  const { t } = useLanguage();
  const [rules, setRules] = useState<SLARule[]>(slaRules);
  const [saved, setSaved] = useState(false);

  const handleUpdate = (id: string, field: keyof SLARule, value: number) => {
    const updated = rules.map(r => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setRules(updated);
    setSaved(false);
  };

  const handleSaveAll = () => {
    StorageService.saveSLARules(rules);
    refreshData();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div
        className={`${tokens.headerCardClass} !bg-[#14213D] !text-white`}
        style={{ backgroundColor: '#14213D', color: '#ffffff' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
              Module 5 & 6 • SLA Engine Rules
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {t('slaDeadlinesConfig')}
            </h1>
            <p className="text-xs text-slate-100">
              {t('slaConfigDesc')}
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            className="px-4 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-600 text-white font-semibold text-xs border border-police-600 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Check size={13} />
            <span>{saved ? t('settingsSaved') : t('saveRuleChanges')}</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className={`rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden`}>
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Active Statutory Rule Matrix ({rules.length} Categories)
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Automated monitoring evaluates every minute on simulated clock
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Crime Category</th>
                <th className="py-2.5 px-3">Default Priority</th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Resolution SLA (Hours)</span>
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <Bell size={12} />
                    <span>Reminder Window (Hours)</span>
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <ShieldAlert size={12} />
                    <span>Escalation Grace (Hours)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {t(rule.category)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {t(rule.priority)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={720}
                        value={rule.deadlineHours}
                        onChange={e => handleUpdate(rule.id, 'deadlineHours', parseInt(e.target.value) || 24)}
                        className="w-16 p-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-police-700 dark:text-police-400"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">hours</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={48}
                        value={rule.reminderNoticeHours}
                        onChange={e => handleUpdate(rule.id, 'reminderNoticeHours', parseInt(e.target.value) || 6)}
                        className="w-14 p-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-amber-700 dark:text-amber-400"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">hrs before</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={rule.escalationGraceHours}
                        onChange={e => handleUpdate(rule.id, 'escalationGraceHours', parseInt(e.target.value) || 2)}
                        className="w-14 p-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-red-700 dark:text-red-400"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">hrs</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
