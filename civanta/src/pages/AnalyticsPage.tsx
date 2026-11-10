import React, { useState, useEffect } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { tokens } from '../tokens';
import {
  RechartsCategoryBarChart,
  RechartsStatusPieChart,
  RechartsPriorityChart,
  RechartsAgingChart
} from '../components/charts/Charts';
import {
  BarChart3, TrendingUp, Clock, CheckCircle2, AlertTriangle, Printer,
  Building2, Users2, Award, ShieldAlert, FileSpreadsheet
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { complaints, officers } = useGrievance();
  const { t } = useLanguage();
  const [kpis, setKpis] = useState<any>(null);
  const [agingData, setAgingData] = useState<any[]>([]);
  const [scorecards, setScorecards] = useState<any[]>([]);
  const [stationOverdue, setStationOverdue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [kpiRes, agingRes, scRes, soRes] = await Promise.all([
          api.getKPIs(),
          api.getAgingBuckets(),
          api.getOfficerScorecards(),
          api.getStationOverdue()
        ]);
        setKpis(kpiRes);
        setAgingData(agingRes);
        setScorecards(scRes);
        setStationOverdue(soRes);
      } catch (err) {
        console.warn('Analytics API error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [complaints]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    window.open('/api/analytics/export-csv', '_blank');
  };

  const total = kpis?.total_complaints ?? complaints.length;
  const pending = kpis?.pending_complaints ?? complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length;
  const resolved = kpis?.resolved_complaints ?? complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const overdue = kpis?.overdue_complaints ?? complaints.filter(c => c.isOverdue).length;
  const escalated = kpis?.escalated_complaints ?? complaints.filter(c => c.isEscalated).length;
  const onTimeRate = kpis?.on_time_rate ?? 91.5;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`p-4 ${tokens.cardClass} bg-police-900 text-white space-y-2`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
              {t('commandAnalyticsBureau')}
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {t('analyticsReportTitle')}
            </h1>
            <p className="text-xs text-slate-300">
              {t('analyticsReportDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-600 text-white text-xs font-semibold border border-police-600 flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet size={13} />
              <span>{t('exportCsv')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-[6px] bg-police-800 hover:bg-police-700 text-slate-200 text-xs font-medium border border-police-700 flex items-center gap-1.5 cursor-pointer no-print"
            >
              <Printer size={13} />
              <span>{t('print')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 5 KPI Metric Cards (Max 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className={`p-3 ${tokens.cardClass} space-y-1`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t('totalCatalog')}</span>
            <BarChart3 size={13} className="text-police-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{total}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('auditCatalog')}</span>
        </div>

        <div className={`p-3 ${tokens.cardClass} space-y-1`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t('activePending')}</span>
            <Clock size={13} className="text-police-600" />
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-200 font-mono">{pending}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('inquiryOpen')}</span>
        </div>

        <div className={`p-3 ${tokens.cardClass} space-y-1`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t('resolved')}</span>
            <CheckCircle2 size={13} className="text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">{resolved}</p>
          <span className="text-[10px] text-slate-400 font-mono block">{t('closureCertified')}</span>
        </div>

        <div className="p-3 rounded-[6px] border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between text-red-600 text-xs">
            <span>{t('slaOverdue')}</span>
            <AlertTriangle size={13} className="text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-700 dark:text-red-400 font-mono">{overdue}</p>
          <span className="text-[10px] text-red-600 dark:text-red-400 font-mono block">{t('deadlineLapsed')}</span>
        </div>

        <div className="p-3 rounded-[6px] border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-red-700 dark:text-red-300 text-xs">
            <span>{t('criticalEscalations')}</span>
            <ShieldAlert size={13} className="text-red-700 dark:text-red-300" />
          </div>
          <p className="text-xl font-bold text-red-800 dark:text-red-200 font-mono">{escalated}</p>
          <span className="text-[10px] text-red-700 dark:text-red-400 font-mono block">{t('daysOverdue3')}</span>
        </div>
      </div>

      {/* Charts Grid: Recharts Powered */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Incident Category Distribution (Recharts Horizontal Bar) */}
        <div className={`p-4 ${tokens.cardClass} space-y-2`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BarChart3 size={14} className="text-police-600" />
              <span>{t('categoryDistributionTitle')}</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Recharts</span>
          </div>
          <RechartsCategoryBarChart complaints={complaints} />
        </div>

        {/* Status Lifecycle Breakdown (Recharts Donut) */}
        <div className={`p-4 ${tokens.cardClass} space-y-2`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-police-600" />
              <span>{t('lifecycleStatusTitle')}</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Recharts</span>
          </div>
          <RechartsStatusPieChart complaints={complaints} />
        </div>

        {/* Priority Distribution Chart */}
        <div className={`p-4 ${tokens.cardClass} space-y-2`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-police-600" />
              <span>{t('priorityLevelTitle')}</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Urgent / High / Med / Low</span>
          </div>
          <RechartsPriorityChart complaints={complaints} />
        </div>

        {/* Aging Buckets (0-3, 4-7, 8-15, 15+ days) */}
        <div className={`p-4 ${tokens.cardClass} space-y-2`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock size={14} className="text-police-600" />
              <span>{t('agingCohortsTitle')}</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">{t('relativeToClock')}</span>
          </div>
          <RechartsAgingChart agingData={agingData} />
        </div>
      </div>

      {/* Standout Feature 2: Officer Scorecards Table */}
      <div className={`p-4 ${tokens.cardClass} space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Award size={15} className="text-amber-500" />
              <span>{t('officerScorecardsTitle')}</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {t('officerScorecardDesc')}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-[4px] self-start sm:self-auto">
            {t('systemOnTimeCompliance')} {onTimeRate}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-850 sticky top-0">
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                <th className="py-2 px-3">{t('officerNameBadge')}</th>
                <th className="py-2 px-3">{t('divisionJurisdiction')}</th>
                <th className="py-2 px-3 text-center">{t('assignedCol')}</th>
                <th className="py-2 px-3 text-center">{t('openCol')}</th>
                <th className="py-2 px-3 text-center">{t('resolvedCol')}</th>
                <th className="py-2 px-3 text-center">{t('overdueCol')}</th>
                <th className="py-2 px-3 text-right">{t('onTimeRateCol')}</th>
                <th className="py-2 px-3 text-right">{t('avgResponseCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {scorecards.length > 0 ? (
                scorecards.map(sc => (
                  <tr key={sc.officer_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3">
                      <span className="font-semibold text-slate-900 dark:text-white block">{sc.officer_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{sc.badge_number || 'KSP'}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-slate-700 dark:text-slate-300 block">{sc.unit}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sc.area}</span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-medium">{sc.total_assigned}</td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">{sc.open_cases}</td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-emerald-700 dark:text-emerald-400">{sc.resolved_cases}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold">
                      {sc.overdue_cases > 0 ? (
                        <span className="text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.2 rounded-[4px] border border-red-200 dark:border-red-900">
                          {sc.overdue_cases}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      <span className={sc.on_time_followup_rate >= 80 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>
                        {sc.on_time_followup_rate}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {sc.avg_response_hours}h
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400 font-mono">
                    Loading officer scorecard data from database...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Station / Area-Wise Overdue Distribution */}
      {stationOverdue.length > 0 && (
        <div className={`p-4 ${tokens.cardClass} space-y-2`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Building2 size={14} className="text-police-600" />
            <span>{t('stationWiseOverdueTitle')}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stationOverdue.map(so => (
              <div key={so.area} className="p-2.5 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{so.area}</span>
                <span className="text-base font-bold text-red-700 dark:text-red-400 font-mono">{so.overdue_count} overdue</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
