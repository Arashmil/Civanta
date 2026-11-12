import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus, PriorityLevel } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SLACountdown } from '../common/SLACountdown';
import { EmptyState } from '../common/EmptyState';
import { useLanguage } from '../../context/LanguageContext';
import { exportComplaintsToCSV } from '../../services/csvExport';
import { tokens } from '../../tokens';
import {
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  RotateCcw,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface ComplaintTableProps {
  complaints: Complaint[];
  onSelectComplaint: (complaintId: string) => void;
  title?: string;
  subtitle?: string;
  initialFilterStatus?: ComplaintStatus | 'all';
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  onSelectComplaint,
  title,
  subtitle,
  initialFilterStatus = 'all'
}) => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilterStatus);
  const [sortBy, setSortBy] = useState<'createdAt' | 'deadlineDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  const handleExportCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportComplaintsToCSV(filteredComplaints, 'civanta_complaints_ledger.csv');
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        c.id.toLowerCase().includes(searchLower) ||
        c.title.toLowerCase().includes(searchLower) ||
        (c.titleKannada && c.titleKannada.includes(search)) ||
        (c.citizen.name && c.citizen.name.toLowerCase().includes(searchLower)) ||
        (c.assignedOfficerName && c.assignedOfficerName.toLowerCase().includes(searchLower)) ||
        (c.incidentLocation.address && c.incidentLocation.address.toLowerCase().includes(searchLower));

      const matchesCategory =
        selectedCategory === 'all' || c.category === selectedCategory;

      const matchesPriority =
        selectedPriority === 'all' || c.priority === selectedPriority;

      const matchesStatus =
        selectedStatus === 'all' ||
        c.status === selectedStatus ||
        (selectedStatus === 'overdue' && (c.isOverdue || c.status === 'overdue' || c.status === 'escalated'));

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    }).sort((a, b) => {
      const timeA = new Date(a[sortBy]).getTime();
      const timeB = new Date(b[sortBy]).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [complaints, search, selectedCategory, selectedPriority, selectedStatus, sortBy, sortOrder]);

  const categories: ComplaintCategory[] = [
    'Cybercrime',
    'Financial Fraud',
    'Lost Property',
    'Traffic & Public Safety',
    'Complaints Involving Individuals',
    'Women & Child Safety',
    'Theft & Burglary',
    'Narcotics & Illegal Substances',
    'Missing Persons & Runaways',
    'Public Nuisance & Civic Grievances',
    'Senior Citizen Assistance',
    'Organized Crime & Extortion'
  ];

  return (
    <div className={tokens.components.tableContainer}>
      {/* Visible Top Toolbar with Distinct Border (Requirement 7) */}
      <div className="p-3.5 border-b-2 border-slate-300 dark:border-slate-700 space-y-2.5 bg-slate-100/90 dark:bg-slate-800/90 shadow-sm rounded-t-[6px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              {title ? t(title) : t('assignedCases')}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-slate-500">{t(subtitle)}</p>
            )}
          </div>

          {/* Action Toolbar: Export CSV, Print Table, Records Counter */}
          <div className="flex items-center gap-2 self-start sm:self-auto no-print">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 rounded-[4px] bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download complaints ledger as CSV spreadsheet"
            >
              <FileSpreadsheet size={13} className="text-emerald-700 dark:text-emerald-400" />
              <span>{t('exportCsv')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 rounded-[4px] bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print table dossier"
            >
              <Printer size={13} className="text-police-700 dark:text-police-400" />
              <span>{t('printTable')}</span>
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded-[4px]">
              {filteredComplaints.length} {t('recordsMatching')}
            </span>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-8 pr-2.5 py-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 font-mono"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-1 px-2 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">{t('allCategories')}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {t(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full py-1 px-2 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">{t('allPriorities')}</option>
              <option value="Urgent">{t('Urgent')}</option>
              <option value="High">{t('High')}</option>
              <option value="Medium">{t('Medium')}</option>
              <option value="Low">{t('Low')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full py-1 px-2 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-mono"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="overdue">{t('overdue')}</option>
              <option value="in_progress">{t('in_progress')}</option>
              <option value="assigned">{t('assigned')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="resolved">{t('resolved')}</option>
              <option value="closed">{t('closed')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Compact Table with Sticky Header */}
      <div className="overflow-x-auto max-h-[580px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr className={tokens.components.tableHeaderRow}>
              <th className="py-2.5 px-3">{t('complaintId')}</th>
              <th className="py-2.5 px-3">{t('subjectIncident')}</th>
              <th className="py-2.5 px-3">{t('categoryPriority')}</th>
              <th className="py-2.5 px-3">{t('assignedOfficer')}</th>
              <th className="py-2.5 px-3">{t('liveSlaCountdown')}</th>
              <th className="py-2.5 px-3">{t('status')}</th>
              <th className="py-2.5 px-3 text-right">{t('view')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6">
                  <EmptyState
                    title={t('noRecordsMatching')}
                    description={t('adjustSearchString')}
                    actionLabel={t('resetAllFilters')}
                    onAction={() => {
                      setSearch('');
                      setSelectedCategory('all');
                      setSelectedPriority('all');
                      setSelectedStatus('all');
                    }}
                  />
                </td>
              </tr>
            ) : (
              filteredComplaints.map(c => {
                const isOverdue = c.isOverdue || c.status === 'overdue' || c.status === 'escalated';
                const isResolved = c.status === 'resolved' || c.status === 'closed';

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectComplaint(c.id)}
                    className={`${tokens.components.tableRow} ${
                      isOverdue ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                    }`}
                  >
                    {/* ID */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-[#14213D] dark:text-slate-200">
                          {c.id}
                        </span>
                        {c.originalLanguage === 'kn' && (
                          <span className="text-[9px] font-mono px-1 rounded-[3px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800" title="Kannada original statement">
                            KN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </td>

                    {/* Subject / Incident */}
                    <td className="py-2 px-3 max-w-xs">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {language === 'kn'
                          ? (/[\u0C80-\u0CFF]/.test(c.title) ? c.title : (c.titleKannada || c.title))
                          : c.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {c.citizen.name} • {c.incidentLocation.address}
                      </p>
                    </td>

                    {/* Category & Priority */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="text-slate-700 dark:text-slate-300 block font-medium text-[11px]">
                        {t(c.category)}
                      </span>
                      <div className="mt-0.5">
                        <PriorityBadge priority={c.priority} size="sm" />
                      </div>
                    </td>

                    {/* Officer */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block text-[11px]">
                        {c.assignedOfficerName || 'Unassigned'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {c.assignedOfficerBadge || c.unit}
                      </span>
                    </td>

                    {/* Live SLA Countdown */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <SLACountdown
                        dueDate={c.dueDate || (c as any).due_date}
                        isResolved={isResolved}
                        isOverdue={isOverdue}
                      />
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectComplaint(c.id);
                        }}
                        className="p-1 rounded-[4px] text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title={t('view')}
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
