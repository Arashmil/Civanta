export type UserRole = 'citizen' | 'junior_officer' | 'senior_supervisor' | 'admin';

export type CoreCategory =
  | 'Cybercrime'
  | 'Financial Fraud'
  | 'Lost Property'
  | 'Traffic & Public Safety'
  | 'Complaints Involving Individuals';

export type ComplaintCategory =
  | CoreCategory
  | 'Online Payment Fraud'
  | 'Theft'
  | 'Missing Person'
  | 'Harassment'
  | 'Fake Social Media Account'
  | 'Suspicious Online Activity'
  | 'Other Police Complaints';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ComplaintStatus =
  | 'registered'
  | 'submitted'
  | 'awaiting_assignment'
  | 'assigned'
  | 'accepted'
  | 'in_progress'
  | 'pending'
  | 'awaiting_response'
  | 'overdue'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type GovIdType = 'Aadhaar' | 'PAN' | 'Voter ID' | 'Driving License' | 'Passport';

export interface GovVerificationDetails {
  idType: GovIdType;
  idNumber: string;
  documentUrl?: string;
  documentName?: string;
  isVerified: boolean;
  verifiedAt: string;
  verificationMethod: 'DigiLocker' | 'e-KYC Document Upload' | 'Aadhaar OTP';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  badgeNumber?: string;
  designation?: string;
  departmentId?: string;
  jurisdiction?: string;
  avatar?: string;
  govVerification?: GovVerificationDetails;
}

export interface SupportingDocument {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document';
  url: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ActionHistoryEntry {
  id: string;
  complaintId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  previousStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
  description: string;
  systemGenerated?: boolean;
  prev_hash?: string;
  hash?: string;
  prevHash?: string;
  entryHash?: string;
}

export interface ComplaintFeedback {
  rating: number; // 1 to 5
  comments: string;
  submittedAt: string;
  satisfactionCategory?: 'Very Satisfied' | 'Satisfied' | 'Neutral' | 'Unsatisfied';
}

export interface Complaint {
  id: string; // e.g., CIV-2026-BLR-0101
  title: string;
  titleKannada?: string;
  description: string;
  descriptionKannada?: string;
  originalLanguage: 'en' | 'kn';
  isTranslated: boolean;
  
  category: ComplaintCategory;
  aiSuggestedCategory?: ComplaintCategory;
  priority: PriorityLevel;
  aiSuggestedPriority?: PriorityLevel;
  status: ComplaintStatus;
  
  incidentDate: string;
  incidentLocation: {
    address: string;
    city: string;
    district: string;
    pinCode?: string;
    lat?: number;
    lng?: number;
  };
  
  citizen: {
    id: string;
    name: string;
    phone: string;
    email: string;
    aadhaarLast4?: string;
  };
  
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerBadge?: string;
  assignedAt?: string;
  acknowledgedAt?: string;
  
  department: string;
  unit: string;
  jurisdiction: string;
  
  createdAt: string;
  updatedAt: string;
  
  // Deadline & Escalation tracking
  deadlineHours: number;
  deadlineDate: string; // ISO string
  due_date?: string;
  dueDate?: string;
  nextAction?: string;
  next_action?: string;
  isOverdue: boolean;
  overdueSince?: string;
  isEscalated: boolean;
  escalatedAt?: string;
  escalationLevel?: number;
  escalationReason?: string;
  remindersSentCount: number;
  lastReminderSentAt?: string;
  duplicateOf?: string;
  duplicate_of?: string;
  aiFlagBanner?: boolean;
  ai_flag_banner?: boolean;
  category_corrected?: boolean;
  priority_corrected?: boolean;
  closure_note?: string;
  resolution_report?: string;
  
  documents: SupportingDocument[];
  investigationRemarks: {
    id: string;
    officerId: string;
    officerName: string;
    timestamp: string;
    remark: string;
    attachmentUrl?: string;
  }[];
  
  resolution?: {
    summary: string;
    resolvedAt: string;
    resolvedByOfficerId: string;
    resolvedByOfficerName: string;
    firNumber?: string;
    recoveryDetails?: string;
    closureReportUrl?: string;
  };
  
  feedback?: ComplaintFeedback;
  reopenReason?: string;
  reopenedAt?: string;
}

export interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
  email: string;
  phone: string;
  rank: 'Police Sub-Inspector (PSI)' | 'Police Inspector (PI)' | 'Deputy Superintendent of Police (DySP)' | 'Assistant Commissioner of Police (ACP)';
  departmentId: string;
  departmentName: string;
  unitName: string;
  jurisdiction: string;
  activeCasesCount: number;
  maxCapacity: number;
  status: 'available' | 'on_duty' | 'leave';
  solvedCasesCount: number;
  avgResolutionDays: number;
  rating: number;
}

export interface Department {
  id: string;
  name: string;
  nameKannada: string;
  code: string;
  headOfDepartment: string;
  activeOfficersCount: number;
  jurisdiction: string;
  categories: ComplaintCategory[];
}

export interface AppNotification {
  id: string;
  recipientId?: string; // specific user ID or 'all_officers' or 'supervisors'
  recipientRole?: UserRole;
  complaintId?: string;
  category?: ComplaintCategory | string;
  title: string;
  message: string;
  messageKannada?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SLARule {
  id: string;
  category: ComplaintCategory;
  priority: PriorityLevel;
  deadlineHours: number;
  reminderNoticeHours: number;
  escalationGraceHours: number;
}
