import type { User } from '../../../types';

export interface Department {
  id: string;
  name: string;
  parent_id?: string | null;
}

export interface Schedule {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  work_days?: number[];
  grace_minutes?: number;
}

export interface Employee extends User {
  department: Department | string | null;
  department_id?: string;
  schedule_id?: string;
  position: string;
  phone?: string;
  contract_type?: 'cdi' | 'cdd' | 'freelance' | 'intern';
  hire_date?: string;
  full_name?: string;
  qr_token?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface CreateEmployeePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id: string;
  schedule_id: string;
  contract_type: 'cdi' | 'cdd' | 'freelance' | 'intern';
  hire_date: string;
  role: 'admin' | 'manager' | 'employee';
}

export interface UpdateEmployeePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department_id?: string;
  schedule_id?: string;
  contract_type?: 'cdi' | 'cdd' | 'freelance' | 'intern';
  hire_date?: string;
}
