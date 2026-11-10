import { ActionHistoryEntry, ComplaintStatus, UserRole } from '../types';
import { StorageService } from './storage';

export class AuditLogger {
  static logAction(params: {
    complaintId: string;
    userId: string;
    userName: string;
    userRole: UserRole;
    action: string;
    description: string;
    previousStatus?: ComplaintStatus;
    newStatus?: ComplaintStatus;
    systemGenerated?: boolean;
  }): ActionHistoryEntry {
    const history = StorageService.getActionHistory();

    const entry: ActionHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      complaintId: params.complaintId,
      timestamp: new Date().toISOString(),
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      description: params.description,
      systemGenerated: params.systemGenerated || false
    };

    // Immutable append: records cannot be edited or deleted
    history.push(entry);
    StorageService.saveActionHistory(history);

    return entry;
  }

  static getHistoryForComplaint(complaintId: string): ActionHistoryEntry[] {
    const history = StorageService.getActionHistory();
    return history
      .filter(h => h.complaintId === complaintId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  static getAllHistory(): ActionHistoryEntry[] {
    const history = StorageService.getActionHistory();
    return [...history].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
