/**
 * Client-Side RFC 4180 CSV Exporter with UTF-8 BOM
 * Guarantees Export CSV works reliably on Vercel, offline, and in Microsoft Excel (with full Kannada script support).
 */
import { Complaint } from '../types';

export function exportComplaintsToCSV(complaints: Complaint[], filename: string = 'civanta_complaints_ledger.csv'): boolean {
  if (!complaints || complaints.length === 0) {
    alert('No complaint records available to export.');
    return false;
  }

  const headers = [
    'Complaint ID',
    'Subject Title (English)',
    'Subject Title (Kannada)',
    'Original Language',
    'Category',
    'Priority',
    'Current Status',
    'Filing Date & Time',
    'SLA Due Date',
    'Is Overdue',
    'Is Escalated',
    'Assigned Officer Name',
    'Assigned Officer Badge',
    'Police Unit',
    'Jurisdiction',
    'Citizen Name',
    'Citizen Phone',
    'Incident Address',
    'City',
    'District',
    'PIN Code',
    'Mandatory Next Action',
    'Grievance Description'
  ];

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = complaints.map(c => [
    escapeCSV(c.id),
    escapeCSV(c.title),
    escapeCSV(c.titleKannada || ''),
    escapeCSV(c.originalLanguage === 'kn' ? 'Kannada' : 'English'),
    escapeCSV(c.category),
    escapeCSV(c.priority),
    escapeCSV(c.status.toUpperCase()),
    escapeCSV(c.createdAt ? new Date(c.createdAt).toLocaleString() : ''),
    escapeCSV(c.dueDate ? new Date(c.dueDate).toLocaleString() : (c.deadlineDate ? new Date(c.deadlineDate).toLocaleString() : '')),
    escapeCSV(c.isOverdue || c.status === 'overdue' ? 'YES' : 'NO'),
    escapeCSV(c.isEscalated || c.status === 'escalated' ? 'YES' : 'NO'),
    escapeCSV(c.assignedOfficerName || 'Unassigned'),
    escapeCSV(c.assignedOfficerBadge || ''),
    escapeCSV(c.unit || ''),
    escapeCSV(c.jurisdiction || ''),
    escapeCSV(c.citizen?.name || ''),
    escapeCSV(c.citizen?.phone || ''),
    escapeCSV(c.incidentLocation?.address || ''),
    escapeCSV(c.incidentLocation?.city || ''),
    escapeCSV(c.incidentLocation?.district || ''),
    escapeCSV(c.incidentLocation?.pinCode || c.incidentLocation?.pincode || ''),
    escapeCSV(c.nextAction || ''),
    escapeCSV(c.description || '')
  ].join(','));

  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel renders Kannada & symbols properly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
