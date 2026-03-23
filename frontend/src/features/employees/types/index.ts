import type { User } from '../../../types';

export interface Employee extends User {
  department: string;
  position: string;
  joinDate: string;
  schedule_id?: string;
  department_id?: string;
  status: 'active' | 'on_leave' | 'inactive';
  name?: string;
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
