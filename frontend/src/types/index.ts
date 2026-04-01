export interface User {
  id: string;
  first_name: string;
  last_name: string;
  name?: string;         // Computed full name from backend
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'employee';
  department_id?: string;
  company_id?: string;
  employee_id?: string;
  qr_token?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}
