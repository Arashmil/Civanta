import React, { useState } from 'react';
import { Complaint, Officer } from '../../types';
import { Shield, AlertCircle, CheckCircle2, TrendingUp, MapPin, Eye } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Colors conforming to Government Administration Navy / Slate palette
const STATUS_COLORS: Record<string, string> = {
  Resolved: '#10b981', // Emerald
  'In Progress': '#0ea5e9', // Sky
  Accepted: '#3b82f6', // Blue
  Assigned: '#6366f1', // Indigo
  Registered: '#f59e0b', // Amber
  'Awaiting Response': '#8b5cf6', // Purple
  Overdue: '#dc2626', // Red
  Escalated: '#b91c1c', // Dark Red
};

const CATEGORY_COLORS = ['#1e3a8a', '#0284c7', '#0d9488', '#f59e0b', '#64748b'];

// 1. Recharts Category Distribution Bar Chart
export const RechartsCategoryBarChart: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  const categoryCounts: Record<string, number> = {};
  complaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const data = Object.entries(categoryCounts).map(([name, count]) => ({
    name: name.length > 20 ? name.slice(0, 18) + '...' : name,
    fullName: name,
    cases: count,
  }));

  return (
    <div className="w-full h-64 text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <XAxis type="number" allowDecimals={false} stroke="#94a3b8" />
          <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
            formatter={(value: any) => [`${value} cases`, 'Total Complaints']}
            labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullName || label}
          />
          <Bar dataKey="cases" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Recharts Status Pie / Donut Chart
export const RechartsStatusPieChart: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  const statusCounts: Record<string, number> = {
    'Resolved': 0,
    'In Progress': 0,
    'Assigned': 0,
    'Overdue': 0,
  };

  complaints.forEach(c => {
    if (c.isOverdue || c.status === 'overdue' || c.status === 'escalated') {
      statusCounts['Overdue'] += 1;
    } else if (c.status === 'resolved' || c.status === 'closed') {
      statusCounts['Resolved'] += 1;
    } else if (c.status === 'in_progress') {
      statusCounts['In Progress'] += 1;
    } else {
      statusCounts['Assigned'] += 1;
    }
  });

  const data = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="w-full h-64 text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
            formatter={(value: any) => [`${value} cases`, 'Complaints']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => <span className="text-slate-600 dark:text-slate-400 text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Recharts Priority Distribution Bar Chart
export const RechartsPriorityChart: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  const priorityCounts: Record<string, number> = {
    Urgent: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  complaints.forEach(c => {
    if (priorityCounts[c.priority] !== undefined) {
      priorityCounts[c.priority] += 1;
    }
  });

  const data = [
    { priority: 'Urgent', count: priorityCounts.Urgent, color: '#dc2626' },
    { priority: 'High', count: priorityCounts.High, color: '#f97316' },
    { priority: 'Medium', count: priorityCounts.Medium, color: '#3b82f6' },
    { priority: 'Low', count: priorityCounts.Low, color: '#64748b' },
  ];

  return (
    <div className="w-full h-56 text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="priority" stroke="#94a3b8" />
          <YAxis allowDecimals={false} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
            formatter={(value: any) => [`${value} cases`, 'Grievances']}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Aging Buckets Recharts Component
export const RechartsAgingChart: React.FC<{ agingData: { bucket: string; count: number; percentage: number }[] }> = ({ agingData }) => {
  return (
    <div className="w-full h-56 text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={agingData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="bucket" stroke="#94a3b8" />
          <YAxis allowDecimals={false} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
            formatter={(value: any, name: any, item: any) => [`${value} cases (${item.payload.percentage}%)`, 'Active Aging Cases']}
          />
          <Bar dataKey="count" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 5. Classic Bar Distribution Chart (backward compatibility)
export const CategoryBarChart: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  return <RechartsCategoryBarChart complaints={complaints} />;
};

// 6. Status Breakdown Component
export const StatusBreakdown: React.FC<{ complaints: Complaint[] }> = ({ complaints }) => {
  const total = complaints.length;
  const overdueCount = complaints.filter(c => c.isOverdue || c.status === 'overdue' || c.status === 'escalated').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const newCount = complaints.filter(c => c.status === 'submitted' || c.status === 'awaiting_assignment' || c.status === 'pending').length;

  const overduePct = Math.round((overdueCount / total) * 100) || 0;
  const inProgressPct = Math.round((inProgressCount / total) * 100) || 0;
  const resolvedPct = Math.round((resolvedCount / total) * 100) || 0;
  const newPct = Math.round((newCount / total) * 100) || 0;

  return (
    <div className="space-y-4">
      <RechartsStatusPieChart complaints={complaints} />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Resolved / Closed</span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
            {resolvedCount} <span className="text-xs font-normal text-slate-400 font-mono">({resolvedPct}%)</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/50 dark:bg-sky-950/20">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Under Investigation</span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
            {inProgressCount} <span className="text-xs font-normal text-slate-400 font-mono">({inProgressPct}%)</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>New / Pending</span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
            {newCount} <span className="text-xs font-normal text-slate-400 font-mono">({newPct}%)</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>Overdue / Escalated</span>
          </div>
          <p className="text-lg font-black text-rose-700 dark:text-rose-400 mt-1">
            {overdueCount} <span className="text-xs font-normal text-rose-500 font-mono">({overduePct}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// 7. Officer Workload List
export const OfficerWorkloadList: React.FC<{
  officers: Officer[];
  onSelectOfficer?: (officer: Officer) => void;
}> = ({ officers, onSelectOfficer }) => {
  return (
    <div className="space-y-3">
      {officers.map(officer => {
        const loadPercentage = Math.min(Math.round((officer.activeCasesCount / (officer.maxCapacity || 10)) * 100), 100);
        const isNearCapacity = loadPercentage >= 80;

        return (
          <div
            key={officer.id}
            onClick={() => onSelectOfficer?.(officer)}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-police-600 transition-all cursor-pointer shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">{officer.name}</p>
                <p className="text-[11px] text-slate-400">{officer.badgeNumber || 'KSP'} • {officer.unitName || officer.departmentName}</p>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isNearCapacity ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {officer.activeCasesCount} active cases
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isNearCapacity ? 'bg-rose-600' : 'bg-police-600'}`}
                style={{ width: `${loadPercentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
