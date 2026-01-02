
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // ISO date
  clockIn: string | null; // ISO datetime
  clockOut: string | null; // ISO datetime
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE';
  notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'SICK' | 'VACATION' | 'PERSONAL';
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
}
