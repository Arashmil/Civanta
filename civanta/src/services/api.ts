/**
 * Centralized API client for CIVANTA Full-Stack FastAPI backend.
 */
import { fallbackChatService } from './fallbackChatService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

let isBackendOffline = false;
let lastOfflineCheck = 0;
const OFFLINE_RETRY_INTERVAL_MS = 30000;

export function isOfflineMode(): boolean {
  return isBackendOffline;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('civanta_auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('civanta_auth_token', token);
  } else {
    localStorage.removeItem('civanta_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // If backend is detected offline, avoid repeatedly hammering the dev proxy
  if (isBackendOffline && Date.now() - lastOfflineCheck < OFFLINE_RETRY_INTERVAL_MS) {
    throw new Error('Backend offline: Operating in autonomous client-side mode');
  }

  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type for FormData (browser sets it with boundary automatically)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    isBackendOffline = true;
    lastOfflineCheck = Date.now();
    throw new Error(`Backend offline: ${netErr.message}`);
  }

  if (res.status === 503) {
    isBackendOffline = true;
    lastOfflineCheck = Date.now();
    throw new Error('Backend offline');
  }

  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail);
  }

  // Request succeeded: backend is online
  isBackendOffline = false;

  // Return json or text
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text() as unknown as T;
}

export const api = {
  // --- AUTH ---
  async login(email: string, pass: string) {
    const data = await request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    setAuthToken(data.access_token);
    return data;
  },

  async register(params: { name: string; email: string; password: string; role?: string; phone?: string; area?: string }) {
    const data = await request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setAuthToken(data.access_token);
    return data;
  },

  async demoLogin(role: string) {
    const data = await request<{ access_token: string; user: any }>(`/auth/demo-login?role=${role}`, {
      method: 'POST',
    });
    setAuthToken(data.access_token);
    return data;
  },

  async getMe() {
    return request<any>('/auth/me');
  },

  logout() {
    setAuthToken(null);
  },

  // --- COMPLAINTS ---
  async getComplaints(params?: {
    category?: string;
    priority?: string;
    status?: string;
    overdue_only?: boolean;
    escalated_only?: boolean;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.status) query.set('status', params.status);
    if (params?.overdue_only) query.set('overdue_only', 'true');
    if (params?.escalated_only) query.set('escalated_only', 'true');
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    return request<any[]>(`/complaints${qs ? `?${qs}` : ''}`);
  },

  async getComplaint(id: string) {
    return request<any>(`/complaints/${id}`);
  },

  async trackComplaint(id: string) {
    return request<any>(`/complaints/track/${id}`);
  },

  async submitComplaint(formData: FormData) {
    return request<any>('/complaints', {
      method: 'POST',
      body: formData,
    });
  },

  async updateStatus(id: string, data: { new_status: string; next_action: string; due_date: string; remarks?: string }) {
    return request<any>(`/complaints/${id}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async acceptComplaint(id: string, nextAction: string, dueDate?: string) {
    const form = new FormData();
    form.append('next_action', nextAction);
    if (dueDate) form.append('due_date', dueDate);

    return request<any>(`/complaints/${id}/accept`, {
      method: 'POST',
      body: form,
    });
  },

  async reassignComplaint(id: string, data: { new_officer_id: number; reason: string; next_action: string; due_date: string }) {
    return request<any>(`/complaints/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resolveComplaint(id: string, data: { resolution_report: string; next_action?: string; due_date: string }) {
    return request<any>(`/complaints/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async closeComplaint(id: string, closure_note: string) {
    return request<any>(`/complaints/${id}/close`, {
      method: 'POST',
      body: JSON.stringify({ closure_note }),
    });
  },

  async reopenComplaint(id: string, reason: string) {
    return request<any>(`/complaints/${id}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async submitFeedback(id: string, rating: number, comment?: string) {
    return request<any>(`/complaints/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  async refineGrievance(text: string, language: 'en' | 'kn' = 'en') {
    return request<{
      refinedText: string;
      suggestedCategory: any;
      suggestedPriority: any;
      applicableLaws: string[];
      missingDetails: string[];
      evidenceChecklist: string[];
    }>('/complaints/refine', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
    });
  },

  async correctAI(id: string, data: { category?: string; priority?: string; reason: string }) {
    return request<any>(`/complaints/${id}/correct-ai`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // --- SUPERVISOR ---
  async getNeedsAttention() {
    return request<any[]>('/supervisor/needs-attention');
  },

  async getEscalations() {
    return request<any[]>('/supervisor/escalations');
  },

  async getOfficerWorkload() {
    return request<any[]>('/supervisor/workload');
  },

  async getDailySummaries() {
    return request<any[]>('/supervisor/daily-summary');
  },

  async generateDailySummary() {
    return request<any>('/supervisor/generate-summary', { method: 'POST' });
  },

  // --- ADMIN & DEMO CLOCK ---
  async getClock() {
    return request<any>('/admin/clock');
  },

  async fastForwardClock(days: number, hours: number = 0) {
    return request<any>('/admin/clock/fast-forward', {
      method: 'POST',
      body: JSON.stringify({ days, hours }),
    });
  },

  async resetClock() {
    return request<any>('/admin/clock/reset', {
      method: 'POST',
    });
  },

  async triggerScheduler() {
    return request<any>('/admin/scheduler/run', {
      method: 'POST',
    });
  },

  async getRules() {
    return request<any[]>('/admin/rules');
  },

  async updateRule(key: string, value: string, description?: string) {
    return request<any>('/admin/rules', {
      method: 'PUT',
      body: JSON.stringify({ key, value, description }),
    });
  },

  async getUsers(role?: string) {
    return request<any[]>(`/admin/users${role ? `?role=${role}` : ''}`);
  },

  // --- AUDIT LEDGER ---
  async getAuditLogs(complaintId?: string) {
    return request<any[]>(`/audit/logs${complaintId ? `?complaint_id=${complaintId}` : ''}`);
  },

  async verifyAuditChain() {
    return request<{
      valid: boolean;
      total_verified: number;
      message: string;
      broken_at_id?: number;
      reason?: string;
      details?: any;
    }>('/audit/verify');
  },

  async tamperTest() {
    return request<any>('/audit/tamper-test', {
      method: 'POST',
    });
  },

  // --- ANALYTICS ---
  async getKPIs() {
    return request<any>('/analytics/kpis');
  },

  async getAgingBuckets() {
    return request<any[]>('/analytics/aging-buckets');
  },

  async getCategoryDistribution() {
    return request<any[]>('/analytics/category-distribution');
  },

  async getPriorityDistribution() {
    return request<any[]>('/analytics/priority-distribution');
  },

  async getStationOverdue() {
    return request<any[]>('/analytics/station-overdue');
  },

  async getOfficerScorecards() {
    return request<any[]>('/analytics/scorecards');
  },

  getExportCSVUrl() {
    return `${API_BASE}/analytics/export-csv`;
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    return request<any[]>('/notifications');
  },

  async getUnreadNotificationCount() {
    return request<{ unread_count: number }>('/notifications/unread-count');
  },

  async markNotificationRead(id: number) {
    return request<any>(`/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllNotificationsRead() {
    return request<any>('/notifications/read-all', { method: 'PUT' });
  },

  // --- CHATBOT ---
  async sendChatMessage(message: string, history: Array<{ role: string; content: string }> = [], language: 'en' | 'kn' = 'en') {
    try {
      return await request<{ reply: string; complaint_found?: any; disclaimer: string; source?: 'gemini-live' | 'neural-nlp' }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history, language }),
      });
    } catch (err) {
      console.warn('Backend /chat unreachable, routing via fallback police desk service:', err);
      return fallbackChatService.respond(message, history, language);
    }
  }
};
