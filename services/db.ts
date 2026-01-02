
import { User, AttendanceRecord, LeaveRequest } from '../types';

const API_BASE = 'http://localhost:5000/api';

class DatabaseService {
  private getAuthHeader() {
    const token = localStorage.getItem('cf_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // --- User Auth ---
  getCurrentUser(): User | null {
    const user = localStorage.getItem('cf_current_user');
    return user ? JSON.parse(user) : null;
  }

  setCurrentUser(user: User | null, token?: string) {
    if (user) {
      localStorage.setItem('cf_current_user', JSON.stringify(user));
      if (token) localStorage.setItem('cf_token', token);
    } else {
      localStorage.removeItem('cf_current_user');
      localStorage.removeItem('cf_token');
    }
  }

  async authenticate(email: string): Promise<{user: User, token: string} | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password' }) // Password handling is simulated
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async registerUser(userData: Omit<User, 'id' | 'avatar'>): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) return (await res.json()).error;
    return await res.json();
  }

  async getUsers(): Promise<User[]> {
    // For admin panel: we'd need a specific endpoint, but using login/register as basis
    const res = await fetch(`${API_BASE}/users`, { headers: this.getAuthHeader() });
    return res.ok ? await res.json() : [];
  }

  // --- Attendance ---
  async getAttendance(userId?: string): Promise<AttendanceRecord[]> {
    const url = userId ? `${API_BASE}/attendance?userId=${userId}` : `${API_BASE}/attendance`;
    const res = await fetch(url, { headers: this.getAuthHeader() });
    return res.ok ? await res.json() : [];
  }

  async saveAttendance(record: AttendanceRecord) {
    await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { ...this.getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  }

  async getTodayRecord(userId: string): Promise<AttendanceRecord | undefined> {
    const history = await this.getAttendance(userId);
    const today = new Date().toISOString().split('T')[0];
    return history.find(r => r.date === today);
  }

  // --- Leaves ---
  async getLeaves(userId?: string): Promise<LeaveRequest[]> {
    const url = userId ? `${API_BASE}/leaves?userId=${userId}` : `${API_BASE}/leaves`;
    const res = await fetch(url, { headers: this.getAuthHeader() });
    return res.ok ? await res.json() : [];
  }

  async saveLeave(request: LeaveRequest) {
    await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: { ...this.getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }

  async updateLeaveStatus(id: string, status: LeaveRequest['status']) {
    await fetch(`${API_BASE}/leaves/${id}`, {
      method: 'PATCH',
      headers: { ...this.getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }
}

export const db = new DatabaseService();
