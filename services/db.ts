
import { User, AttendanceRecord, LeaveRequest, UserRole } from '../types';
import { INITIAL_USERS, STORAGE_KEYS } from '../constants';

class DatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEAVES)) {
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify([]));
    }
  }

  // --- User Auth ---
  getCurrentUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  }

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  authenticate(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  registerUser(userData: Omit<User, 'id' | 'avatar'>): User | string {
    const users = this.getUsers();
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return "An account with this email already exists.";
    }

    const newUser: User = {
      ...userData,
      id: `u-${Math.random().toString(36).substr(2, 9)}`,
      avatar: `https://picsum.photos/seed/${userData.name.split(' ')[0]}/200`
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  // --- Attendance ---
  getAttendance(userId?: string): AttendanceRecord[] {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    if (userId) return all.filter((r: AttendanceRecord) => r.userId === userId);
    return all;
  }

  saveAttendance(record: AttendanceRecord) {
    const all = this.getAttendance();
    const index = all.findIndex(r => r.id === record.id);
    if (index > -1) {
      all[index] = record;
    } else {
      all.push(record);
    }
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(all));
  }

  getTodayRecord(userId: string): AttendanceRecord | undefined {
    const today = new Date().toISOString().split('T')[0];
    return this.getAttendance(userId).find(r => r.date === today);
  }

  // --- Leaves ---
  getLeaves(userId?: string): LeaveRequest[] {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]');
    if (userId) return all.filter((l: LeaveRequest) => l.userId === userId);
    return all;
  }

  saveLeave(request: LeaveRequest) {
    const all = this.getLeaves();
    const index = all.findIndex(l => l.id === request.id);
    if (index > -1) {
      all[index] = request;
    } else {
      all.push(request);
    }
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(all));
  }

  updateLeaveStatus(id: string, status: LeaveRequest['status']) {
    const all = this.getLeaves();
    const index = all.findIndex(l => l.id === id);
    if (index > -1) {
      all[index].status = status;
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(all));
    }
  }
}

export const db = new DatabaseService();
