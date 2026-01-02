
import { User, UserRole } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Connor',
    email: 'admin@chronoflow.com',
    role: UserRole.ADMIN,
    department: 'Executive',
    avatar: 'https://picsum.photos/seed/sarah/200'
  },
  {
    id: 'u2',
    name: 'John Miller',
    email: 'manager@chronoflow.com',
    role: UserRole.MANAGER,
    department: 'Engineering',
    avatar: 'https://picsum.photos/seed/john/200'
  },
  {
    id: 'u3',
    name: 'Emily Davis',
    email: 'emily@chronoflow.com',
    role: UserRole.EMPLOYEE,
    department: 'Engineering',
    avatar: 'https://picsum.photos/seed/emily/200'
  }
];

export const STORAGE_KEYS = {
  USERS: 'cf_users',
  ATTENDANCE: 'cf_attendance',
  LEAVES: 'cf_leaves',
  CURRENT_USER: 'cf_current_user'
};
