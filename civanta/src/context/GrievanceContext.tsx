import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Complaint,
  Officer,
  Department,
  ActionHistoryEntry,
  AppNotification,
  SLARule,
  ComplaintStatus,
  ComplaintCategory,
  PriorityLevel
} from '../types';
import { api } from '../services/api';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';

interface SubmitComplaintParams {
  title: string;
  description: string;
  originalLanguage: 'en' | 'kn';
  category?: ComplaintCategory;
  priority?: PriorityLevel;
  incidentDate?: string;
  incidentLocation?: {
    address: string;
    city: string;
    district: string;
    pinCode?: string;
  };
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  file?: File;
}

interface GrievanceContextType {
  complaints: Complaint[];
  officers: Officer[];
  departments: Department[];
  actionHistory: ActionHistoryEntry[];
  notifications: AppNotification[];
  slaRules: SLARule[];
  unreadNotificationsCount: number;

  submitComplaint: (params: SubmitComplaintParams) => Promise<Complaint>;
  acceptAssignment: (complaintId: string, nextAction?: string, dueDate?: string) => Promise<void>;
  updateInvestigation: (
    complaintId: string,
    remark: string,
    newStatus?: ComplaintStatus,
    attachmentUrl?: string,
    nextAction?: string,
    dueDate?: string
  ) => Promise<void>;
  reassignComplaint: (
    complaintId: string,
    newOfficerId: string,
    reason: string,
    nextAction?: string,
    dueDate?: string
  ) => Promise<boolean>;
  submitResolution: (
    complaintId: string,
    summary: string,
    firNumber?: string,
    recoveryDetails?: string,
    nextAction?: string,
    dueDate?: string
  ) => Promise<void>;
  submitFeedback: (complaintId: string, rating: number, comments: string) => Promise<void>;
  reopenComplaint: (complaintId: string, reason: string) => Promise<void>;
  closeComplaint: (complaintId: string, closureNote: string) => Promise<void>;
  simulateDeadlineExpiry: (complaintId: string) => Promise<void>;
  triggerInstantReminder: (complaintId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const GrievanceContext = createContext<GrievanceContextType | undefined>(undefined);

// Helper to map backend complaint record to frontend Complaint interface
function mapBackendComplaint(b: any): Complaint {
  return {
    id: b.id,
    title: b.title,
    titleKannada: b.language === 'kn' ? b.original_text.split('\n')[0] : undefined,
    description: b.original_text,
    descriptionKannada: b.language === 'kn' ? b.original_text : undefined,
    originalLanguage: b.language as 'en' | 'kn',
    isTranslated: b.language === 'kn' && !b.ai_flag_banner,

    category: b.category as ComplaintCategory,
    aiSuggestedCategory: b.category as ComplaintCategory,
    priority: b.priority as PriorityLevel,
    aiSuggestedPriority: b.priority as PriorityLevel,
    status: (b.status.toLowerCase().replace(/\s+/g, '_') as ComplaintStatus) || 'in_progress',

    incidentDate: b.created_at,
    incidentLocation: {
      address: b.assigned_area || 'Bengaluru Central',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560001',
    },

    citizen: {
      id: String(b.complainant_id),
      name: b.complainant_name,
      phone: b.complainant_phone || '+91 98450 12345',
      email: 'citizen@demo.com',
    },

    assignedOfficerId: String(b.assigned_officer_id),
    assignedOfficerName: b.assigned_officer_name,
    assignedOfficerBadge: `KSP-PSI-${b.assigned_officer_id}`,
    assignedAt: b.created_at,

    department: b.assigned_unit || 'Law & Order Division',
    unit: b.assigned_unit || 'Law & Order Division',
    jurisdiction: b.assigned_area || 'Bengaluru',

    createdAt: b.created_at,
    updatedAt: b.updated_at,

    deadlineHours: 48,
    deadlineDate: b.due_date,
    due_date: b.due_date,
    dueDate: b.due_date,
    nextAction: b.next_action,
    next_action: b.next_action,
    isOverdue: b.is_overdue,
    isEscalated: b.is_escalated,
    escalationLevel: b.escalation_level,
    remindersSentCount: 1,

    duplicateOf: b.duplicate_of,
    duplicate_of: b.duplicate_of,
    aiFlagBanner: b.ai_flag_banner,
    ai_flag_banner: b.ai_flag_banner,
    category_corrected: b.category_corrected,
    priority_corrected: b.priority_corrected,
    closure_note: b.closure_note,
    resolution_report: b.resolution_report,

    documents: (b.documents || []).map((d: any) => ({
      id: String(d.id),
      name: d.original_filename,
      type: 'document',
      url: `/uploads/${d.filename}`,
      size: `${Math.round(d.file_size / 1024)} KB`,
      uploadedAt: d.created_at,
      uploadedBy: 'Officer/Citizen',
    })),

    investigationRemarks: (b.action_logs || [])
      .filter((al: any) => al.action === 'REMARK_ADDED' || al.action === 'STATUS_CHANGE')
      .map((al: any) => ({
        id: String(al.id),
        officerId: String(al.user_id),
        officerName: al.user_name,
        timestamp: al.timestamp,
        remark: al.description,
      })),

    resolution: b.resolution_report
      ? {
          summary: b.resolution_report,
          resolvedAt: b.updated_at,
          resolvedByOfficerId: String(b.assigned_officer_id),
          resolvedByOfficerName: b.assigned_officer_name,
        }
      : undefined,

    feedback: b.feedback
      ? {
          rating: b.feedback.rating,
          comments: b.feedback.comment || '',
          submittedAt: b.feedback.created_at,
        }
      : undefined,
  };
}

export const GrievanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>(() => StorageService.getComplaints());
  const [officers, setOfficers] = useState<Officer[]>(() => StorageService.getOfficers());
  const [departments, setDepartments] = useState<Department[]>(() => StorageService.getDepartments());
  const [actionHistory, setActionHistory] = useState<ActionHistoryEntry[]>(() => StorageService.getActionHistory());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [slaRules, setSlaRules] = useState<SLARule[]>(() => StorageService.getSLARules());

  const refreshData = useCallback(async () => {
    try {
      // 1. Fetch complaints from FastAPI backend
      const backendComplaints = await api.getComplaints();
      if (Array.isArray(backendComplaints) && backendComplaints.length > 0) {
        setComplaints(backendComplaints.map(mapBackendComplaint));
      }

      // 2. Fetch action history
      const logs = await api.getAuditLogs();
      if (Array.isArray(logs) && logs.length > 0) {
        setActionHistory(
          logs.map((al: any) => ({
            id: String(al.id),
            complaintId: al.complaint_id,
            timestamp: al.timestamp,
            userId: String(al.user_id || 'system'),
            userName: al.user_name,
            userRole: al.user_role as any,
            action: al.action,
            previousStatus: al.old_status as any,
            newStatus: al.new_status as any,
            description: al.description,
            systemGenerated: al.user_role === 'system',
            hash: al.hash,
            prev_hash: al.prev_hash,
          }))
        );
      }

      // 3. Fetch notifications
      const notifs = await api.getNotifications();
      if (Array.isArray(notifs)) {
        setNotifications(
          notifs.map((n: any) => ({
            id: String(n.id),
            title: n.title,
            message: n.message_en,
            messageKannada: n.message_kn,
            complaintId: n.complaint_id,
            type: n.type,
            isRead: n.is_read,
            createdAt: n.created_at,
            priority: (n.type.includes('breach') || n.type.includes('escalat')) ? 'urgent' : (n.type.includes('overdue') || n.type.includes('reminder')) ? 'high' : 'normal',
          }))
        );
      }

      // 4. Fetch officers from backend workload
      const workload = await api.getOfficerWorkload();
      if (Array.isArray(workload) && workload.length > 0) {
        setOfficers(
          workload.map((w: any) => ({
            id: String(w.officer_id),
            name: w.officer_name,
            badgeNumber: w.badge_number,
            email: `officer_${w.officer_id}@ksp.gov.in`,
            phone: '+91 94808 01000',
            rank: 'Police Sub-Inspector (PSI)',
            departmentId: w.unit,
            departmentName: w.unit,
            unitName: w.unit,
            jurisdiction: w.area,
            activeCasesCount: w.open_cases,
            maxCapacity: 10,
            status: 'available',
            solvedCasesCount: w.resolved_cases,
            avgResolutionDays: 2.5,
            rating: 4.8,
          }))
        );
      }
    } catch (err) {
      console.warn('Backend sync warning, using local baseline:', err);
    }
  }, []);

  // Sync on mount and when currentUser changes
  useEffect(() => {
    refreshData();
  }, [currentUser, refreshData]);

  // Periodic deadline/notification poll (every 30s)
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Submit Complaint via real backend
  const submitComplaint = async (params: SubmitComplaintParams): Promise<Complaint> => {
    const formData = new FormData();
    formData.append('title', params.title);
    formData.append('description', params.description);
    formData.append('area', params.incidentLocation?.address || 'Bengaluru Central');
    if (params.citizenPhone) formData.append('phone', params.citizenPhone);
    if (params.file) formData.append('file', params.file);

    const b = await api.submitComplaint(formData);
    const newComp = mapBackendComplaint(b);
    await refreshData();
    return newComp;
  };

  const acceptAssignment = async (complaintId: string, nextAction: string = 'Intake verification commenced', dueDate?: string) => {
    await api.acceptComplaint(complaintId, nextAction, dueDate);
    await refreshData();
  };

  const updateInvestigation = async (
    complaintId: string,
    remark: string,
    newStatus?: ComplaintStatus,
    attachmentUrl?: string,
    nextAction?: string,
    dueDate?: string
  ) => {
    const statusMap: Record<string, string> = {
      submitted: 'Registered',
      awaiting_assignment: 'Assigned',
      assigned: 'Assigned',
      in_progress: 'In Progress',
      pending: 'Awaiting Response',
      resolved: 'Resolved',
      closed: 'Closed',
    };

    const statusStr = newStatus ? statusMap[newStatus] || 'In Progress' : 'In Progress';
    const actionStr = nextAction || 'Continuing field investigation and evidence compilation';
    const dueStr = dueDate || new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    await api.updateStatus(complaintId, {
      new_status: statusStr,
      next_action: actionStr,
      due_date: dueStr,
      remarks: remark,
    });
    await refreshData();
  };

  const reassignComplaint = async (
    complaintId: string,
    newOfficerId: string,
    reason: string,
    nextAction?: string,
    dueDate?: string
  ): Promise<boolean> => {
    try {
      const dueStr = dueDate || new Date(Date.now() + 48 * 3600 * 1000).toISOString();
      const actionStr = nextAction || 'Expedite case investigation and review preliminary findings';

      await api.reassignComplaint(complaintId, {
        new_officer_id: parseInt(newOfficerId, 10),
        reason,
        next_action: actionStr,
        due_date: dueStr,
      });
      await refreshData();
      return true;
    } catch (err) {
      console.error('Reassign failed:', err);
      return false;
    }
  };

  const submitResolution = async (
    complaintId: string,
    summary: string,
    firNumber?: string,
    recoveryDetails?: string,
    nextAction?: string,
    dueDate?: string
  ) => {
    const fullReport = `${summary}${firNumber ? ` (FIR/LDR: ${firNumber})` : ''}${recoveryDetails ? ` Recovery: ${recoveryDetails}` : ''}`;
    const dueStr = dueDate || new Date(Date.now() + 72 * 3600 * 1000).toISOString();
    await api.resolveComplaint(complaintId, {
      resolution_report: fullReport,
      next_action: nextAction || 'Pending citizen confirmation and satisfaction review',
      due_date: dueStr,
    });
    await refreshData();
  };

  const submitFeedback = async (complaintId: string, rating: number, comments: string) => {
    await api.submitFeedback(complaintId, rating, comments);
    await refreshData();
  };

  const reopenComplaint = async (complaintId: string, reason: string) => {
    await api.reopenComplaint(complaintId, reason);
    await refreshData();
  };

  const closeComplaint = async (complaintId: string, closureNote: string) => {
    await api.closeComplaint(complaintId, closureNote);
    await refreshData();
  };

  const simulateDeadlineExpiry = async (complaintId: string) => {
    await api.fastForwardClock(3, 0); // Advances 3 days, triggers overdue & escalation immediately
    await refreshData();
  };

  const triggerInstantReminder = async (complaintId: string) => {
    await api.fastForwardClock(1, 0); // Advances 1 day, triggers proactive 24h reminder immediately
    await refreshData();
  };

  const markNotificationRead = async (id: string) => {
    const numId = parseInt(id.replace(/\D/g, ''), 10) || 1;
    await api.markNotificationRead(numId);
    await refreshData();
  };

  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    await refreshData();
  };

  const resetDemoData = async () => {
    await api.resetClock();
    await refreshData();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <GrievanceContext.Provider
      value={{
        complaints,
        officers,
        departments,
        actionHistory,
        notifications,
        slaRules,
        unreadNotificationsCount: unreadCount,
        submitComplaint,
        acceptAssignment,
        updateInvestigation,
        reassignComplaint,
        submitResolution,
        submitFeedback,
        reopenComplaint,
        closeComplaint,
        simulateDeadlineExpiry,
        triggerInstantReminder,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        refreshData,
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};

export const useGrievance = () => {
  const context = useContext(GrievanceContext);
  if (!context) {
    throw new Error('useGrievance must be used within a GrievanceProvider');
  }
  return context;
};
