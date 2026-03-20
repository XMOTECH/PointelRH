import type { User } from '../../../types';

export interface Employee extends User {
  department: string;
  position: string;
  joinDate: string;
  status: 'active' | 'on_leave' | 'inactive';
  name?: string;
}
