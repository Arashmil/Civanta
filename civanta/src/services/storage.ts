import {
  Complaint,
  Officer,
  Department,
  User,
  ActionHistoryEntry,
  AppNotification,
  SLARule
} from '../types';
import {
  INITIAL_COMPLAINTS,
  OFFICERS,
  DEPARTMENTS,
  DEMO_USERS,
  INITIAL_ACTION_HISTORY,
  INITIAL_NOTIFICATIONS,
  DEFAULT_SLA_RULES,
  generateCalibratedComplaints,
  generateCalibratedActionHistory,
  generateCalibratedNotifications
} from '../data/initialData';

const STORAGE_KEYS = {
  COMPLAINTS: 'civanta_complaints',
  OFFICERS: 'civanta_officers',
  DEPARTMENTS: 'civanta_departments',
  USERS: 'civanta_users',
  ACTION_HISTORY: 'civanta_action_history',
  NOTIFICATIONS: 'civanta_notifications',
  SLA_RULES: 'civanta_sla_rules',
  CURRENT_USER: 'civanta_current_user',
  LANGUAGE: 'civanta_language'
};

export class StorageService {
  static getComplaints(): Complaint[] {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (!data) {
      const fresh = generateCalibratedComplaints();
      this.saveComplaints(fresh);
      return fresh;
    }
    try {
      const parsed: Complaint[] = JSON.parse(data);
      // Purge old simulated demo cases (CIV-2026-BLR-*) to keep only real Karnataka police cases and user complaints
      const cleaned = parsed.filter(c => !c.id.startsWith('CIV-2026-BLR-'));

      // Check if cached demo complaints have obsolete/frozen timestamps from earlier iterations
      const hasObsoleteDates = cleaned.some(c =>
        c.createdAt && (
          c.createdAt.startsWith('2026-02-14') ||
          c.createdAt.startsWith('2026-03-02') ||
          c.createdAt.startsWith('2025-10') ||
          c.createdAt.startsWith('2019-06')
        )
      );

      if (hasObsoleteDates) {
        const freshDemo = generateCalibratedComplaints();
        const userCustom = cleaned.filter(c => !c.id.startsWith('KSP-') && !c.id.startsWith('LOK-'));
        const refreshed = [...freshDemo, ...userCustom];
        this.saveComplaints(refreshed);
        return refreshed;
      }

      const existingIds = new Set(cleaned.map(c => c.id));
      const missing = INITIAL_COMPLAINTS.filter(c => !existingIds.has(c.id));
      const finalComplaints = [...missing, ...cleaned];

      if (finalComplaints.length !== parsed.length || missing.length > 0) {
        this.saveComplaints(finalComplaints);
      }
      return finalComplaints;
    } catch {
      const fresh = generateCalibratedComplaints();
      return fresh;
    }
  }

  static saveComplaints(complaints: Complaint[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }

  static getOfficers(): Officer[] {
    const data = localStorage.getItem(STORAGE_KEYS.OFFICERS);
    if (!data) {
      this.saveOfficers(OFFICERS);
      return OFFICERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return OFFICERS;
    }
  }

  static saveOfficers(officers: Officer[]): void {
    localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(officers));
  }

  static getDepartments(): Department[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (!data) {
      this.saveDepartments(DEPARTMENTS);
      return DEPARTMENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEPARTMENTS;
    }
  }

  static saveDepartments(departments: Department[]): void {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  }

  static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      this.saveUsers(DEMO_USERS);
      return DEMO_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEMO_USERS;
    }
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getActionHistory(): ActionHistoryEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACTION_HISTORY);
    if (!data) {
      const fresh = generateCalibratedActionHistory();
      this.saveActionHistory(fresh);
      return fresh;
    }
    try {
      const parsed: ActionHistoryEntry[] = JSON.parse(data);
      // If cached history still references old simulated demo IDs or obsolete dates, refresh with real-world case audit chain
      if (
        parsed.some(e => e.complaintId.startsWith('CIV-2026-BLR-')) ||
        parsed.some(e => e.timestamp && (e.timestamp.startsWith('2026-02-14') || e.timestamp.startsWith('2019-06')))
      ) {
        const fresh = generateCalibratedActionHistory();
        this.saveActionHistory(fresh);
        return fresh;
      }
      return parsed;
    } catch {
      return generateCalibratedActionHistory();
    }
  }

  static saveActionHistory(history: ActionHistoryEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.ACTION_HISTORY, JSON.stringify(history));
  }

  static getNotifications(): AppNotification[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      const fresh = generateCalibratedNotifications();
      this.saveNotifications(fresh);
      return fresh;
    }
    try {
      const parsed: AppNotification[] = JSON.parse(data);
      // If cached notifications reference old demo cases or obsolete dates, update to real-world police cases
      if (
        parsed.some(n => n.complaintId && n.complaintId.startsWith('CIV-2026-BLR-')) ||
        parsed.some(n => n.createdAt && (n.createdAt.startsWith('2026-02-15') || n.createdAt.startsWith('2026-03-04')))
      ) {
        const fresh = generateCalibratedNotifications();
        this.saveNotifications(fresh);
        return fresh;
      }
      return parsed;
    } catch {
      return generateCalibratedNotifications();
    }
  }

  static saveNotifications(notifications: AppNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  static getSLARules(): SLARule[] {
    const data = localStorage.getItem(STORAGE_KEYS.SLA_RULES);
    if (!data) {
      this.saveSLARules(DEFAULT_SLA_RULES);
      return DEFAULT_SLA_RULES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_SLA_RULES;
    }
  }

  static saveSLARules(rules: SLARule[]): void {
    localStorage.setItem(STORAGE_KEYS.SLA_RULES, JSON.stringify(rules));
  }

  static getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) {
      // Default to Citizen on first load
      return DEMO_USERS[0];
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEMO_USERS[0];
    }
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  static getLanguage(): 'en' | 'kn' {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'en' | 'kn') || 'en';
  }

  static setLanguage(lang: 'en' | 'kn'): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }

  static resetAllToDemo(): void {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
    localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(OFFICERS));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    localStorage.setItem(STORAGE_KEYS.ACTION_HISTORY, JSON.stringify(INITIAL_ACTION_HISTORY));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.SLA_RULES, JSON.stringify(DEFAULT_SLA_RULES));
  }
}
