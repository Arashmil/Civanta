import { Complaint, AppNotification, ComplaintCategory, PriorityLevel } from '../types';
import { StorageService } from './storage';
import { AuditLogger } from './auditLogger';
import { ClockService } from './clockService';

export interface SLAEvaluationResult {
  totalChecked: number;
  newlyOverdue: number;
  newlyEscalated: number;
  remindersDispatched: number;
}

export class DeadlineService {
  /**
   * Calculates deadline hours based on Category and Priority from active SLA rules
   */
  static getDeadlineHours(category: ComplaintCategory, priority: PriorityLevel): number {
    const rules = StorageService.getSLARules();
    const matched = rules.find(r => r.category === category && r.priority === priority);
    if (matched) return matched.deadlineHours;

    // Fallbacks
    switch (priority) {
      case 'Urgent':
        return 24;
      case 'High':
        return 48;
      case 'Medium':
        return 72;
      case 'Low':
      default:
        return 120;
    }
  }

  /**
   * Calculate future deadline ISO string
   */
  static calculateDeadlineDate(fromTime: Date, hours: number): string {
    const deadline = new Date(fromTime.getTime() + hours * 60 * 60 * 1000);
    return deadline.toISOString();
  }

  /**
   * Main SLA Monitor loop - can be triggered on interval or on state load
   */
  static checkAllDeadlines(customNow?: Date): SLAEvaluationResult {
    const complaints = StorageService.getComplaints();
    const notifications = StorageService.getNotifications();
    const now = customNow || ClockService.getSimulatedTime();

    let newlyOverdue = 0;
    let newlyEscalated = 0;
    let remindersDispatched = 0;

    const updatedComplaints = complaints.map(complaint => {
      // Skip completed or closed complaints
      if (complaint.status === 'resolved' || complaint.status === 'closed') {
        return complaint;
      }

      const deadline = new Date(complaint.deadlineDate);
      const isPastDeadline = now.getTime() > deadline.getTime();
      const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

      // 1. Pending Work Reminder: If within reminder window (e.g. <= 6 hours) and haven't sent reminder in last 12 hours
      if (!isPastDeadline && hoursRemaining <= 6 && complaint.remindersSentCount < 2) {
        const lastSent = complaint.lastReminderSentAt ? new Date(complaint.lastReminderSentAt).getTime() : 0;
        const timeSinceLast = (now.getTime() - lastSent) / (1000 * 60 * 60);

        if (timeSinceLast >= 12) {
          complaint.remindersSentCount += 1;
          complaint.lastReminderSentAt = now.toISOString();
          remindersDispatched += 1;

          // Dispatch reminder notification
          notifications.unshift({
            id: `notif-rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            recipientId: complaint.assignedOfficerId,
            recipientRole: 'junior_officer',
            complaintId: complaint.id,
            title: `REMINDER: ${Math.round(hoursRemaining)} Hours Left for SLA Resolution`,
            message: `Case ${complaint.id} (${complaint.title}) requires action before ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            type: 'reminder',
            isRead: false,
            createdAt: now.toISOString(),
            priority: 'high'
          });

          // Immutable Audit Log
          AuditLogger.logAction({
            complaintId: complaint.id,
            userId: 'system',
            userName: 'CIVANTA Automated SLA Monitor',
            userRole: 'admin',
            action: 'Automated Pending-Work Reminder Dispatched',
            description: `Automated alert dispatched to assigned officer ${complaint.assignedOfficerName || 'Officer'}. SLA expires in approx ${Math.round(hoursRemaining)} hrs.`,
            systemGenerated: true
          });
        }
      }

      // 2. Overdue & Automatic Escalation Detection
      if (isPastDeadline) {
        if (!complaint.isOverdue) {
          complaint.isOverdue = true;
          complaint.overdueSince = deadline.toISOString();
          newlyOverdue += 1;
        }

        // Automatic escalation if overdue for more than grace period or not yet escalated
        if (!complaint.isEscalated) {
          const previousStatus = complaint.status;
          complaint.isEscalated = true;
          complaint.escalatedAt = now.toISOString();
          complaint.status = 'escalated';
          complaint.escalationReason = `Resolution SLA of ${complaint.deadlineHours} hours breached without case resolution. Automatically routed to Senior Supervisor.`;
          newlyEscalated += 1;

          // Notify Supervisor
          notifications.unshift({
            id: `notif-esc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            recipientRole: 'senior_supervisor',
            complaintId: complaint.id,
            title: `CRITICAL ESCALATION: Case ${complaint.id} Overdue`,
            message: `Case '${complaint.title}' assigned to ${complaint.assignedOfficerName || 'Officer'} breached SLA deadline on ${deadline.toLocaleDateString()}. Supervisor action required.`,
            type: 'escalation',
            isRead: false,
            createdAt: now.toISOString(),
            priority: 'urgent'
          });

          // Also notify the officer of the escalation event
          if (complaint.assignedOfficerId) {
            notifications.unshift({
              id: `notif-off-esc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              recipientId: complaint.assignedOfficerId,
              recipientRole: 'junior_officer',
              complaintId: complaint.id,
              title: `CASE ESCALATED: ${complaint.id} Breached SLA`,
              message: `Case ${complaint.id} has been escalated to Senior Supervisor due to deadline breach.`,
              type: 'overdue',
              isRead: false,
              createdAt: now.toISOString(),
              priority: 'urgent'
            });
          }

          // Immutable Audit Log
          AuditLogger.logAction({
            complaintId: complaint.id,
            userId: 'system',
            userName: 'CIVANTA Automatic Escalation Engine',
            userRole: 'admin',
            action: 'Deadline Violation & Automatic Escalation',
            previousStatus,
            newStatus: 'escalated',
            description: `Statutory SLA of ${complaint.deadlineHours} hours was breached on ${deadline.toISOString()}. Case automatically marked OVERDUE and escalated to Senior Supervisor queue.`,
            systemGenerated: true
          });
        }
      }

      return complaint;
    });

    StorageService.saveComplaints(updatedComplaints);
    StorageService.saveNotifications(notifications);

    return {
      totalChecked: complaints.length,
      newlyOverdue,
      newlyEscalated,
      remindersDispatched
    };
  }

  /**
   * Prototype Admin-Only Simulation: Immediately simulates deadline expiry on a complaint
   */
  static simulateDeadlineExpiry(complaintId: string): Complaint | null {
    const complaints = StorageService.getComplaints();
    const notifications = StorageService.getNotifications();
    const complaint = complaints.find(c => c.id === complaintId);

    if (!complaint) return null;

    const previousStatus = complaint.status;
    const now = new Date();
    const pastDate = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

    complaint.deadlineDate = pastDate.toISOString();
    complaint.isOverdue = true;
    complaint.overdueSince = pastDate.toISOString();
    complaint.isEscalated = true;
    complaint.escalatedAt = now.toISOString();
    complaint.status = 'escalated';
    complaint.escalationReason = 'SIMULATED SLA BREACH: Fast-forwarded via Admin Deadline Simulator for demonstration purposes.';
    complaint.updatedAt = now.toISOString();

    // Add Supervisor Escalation Notification
    notifications.unshift({
      id: `notif-esc-sim-${Date.now()}`,
      recipientRole: 'senior_supervisor',
      complaintId: complaint.id,
      title: `[SIMULATED] CRITICAL ESCALATION: ${complaint.id} SLA Breached`,
      message: `Admin simulation triggered: ${complaint.title} has violated deadline. Case immediately escalated to Senior Supervisor.`,
      type: 'escalation',
      isRead: false,
      createdAt: now.toISOString(),
      priority: 'urgent'
    });

    // Notify Officer
    if (complaint.assignedOfficerId) {
      notifications.unshift({
        id: `notif-off-sim-${Date.now()}`,
        recipientId: complaint.assignedOfficerId,
        recipientRole: 'junior_officer',
        complaintId: complaint.id,
        title: `[SIMULATED] SLA Breached: ${complaint.id}`,
        message: `Admin simulation triggered: Case ${complaint.id} deadline expired and has been escalated to Senior Supervisor.`,
        type: 'overdue',
        isRead: false,
        createdAt: now.toISOString(),
        priority: 'urgent'
      });
    }

    // Log in Immutable Audit Log
    AuditLogger.logAction({
      complaintId: complaint.id,
      userId: 'usr-admin-01',
      userName: 'Administrator (Simulation Control)',
      userRole: 'admin',
      action: 'Admin Deadline Simulation Triggered',
      previousStatus,
      newStatus: 'escalated',
      description: 'Prototype testing trigger: Artificially set deadline to expired status to test supervisor escalation workflow.',
      systemGenerated: false
    });

    StorageService.saveComplaints(complaints);
    StorageService.saveNotifications(notifications);

    return complaint;
  }

  /**
   * Prototype Admin-Only Simulation: Immediately dispatch an urgent pending reminder
   */
  static triggerInstantReminder(complaintId: string): boolean {
    const complaints = StorageService.getComplaints();
    const notifications = StorageService.getNotifications();
    const complaint = complaints.find(c => c.id === complaintId);

    if (!complaint) return false;

    const now = new Date();
    complaint.remindersSentCount += 1;
    complaint.lastReminderSentAt = now.toISOString();

    notifications.unshift({
      id: `notif-instant-rem-${Date.now()}`,
      recipientId: complaint.assignedOfficerId,
      recipientRole: 'junior_officer',
      complaintId: complaint.id,
      title: `[INSTANT ALERT] Pending Action Required: ${complaint.id}`,
      message: `Urgent pending work alert triggered for ${complaint.title}. Please update investigation remarks immediately.`,
      type: 'reminder',
      isRead: false,
      createdAt: now.toISOString(),
      priority: 'urgent'
    });

    AuditLogger.logAction({
      complaintId: complaint.id,
      userId: 'usr-admin-01',
      userName: 'Administrator (Simulation Control)',
      userRole: 'admin',
      action: 'Manual/Instant Reminder Triggered',
      description: `Manual reminder alert dispatched to officer ${complaint.assignedOfficerName || 'Officer'} to verify notification pipeline.`,
      systemGenerated: false
    });

    StorageService.saveComplaints(complaints);
    StorageService.saveNotifications(notifications);

    return true;
  }
}
