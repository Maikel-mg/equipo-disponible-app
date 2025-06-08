
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'empleado' | 'responsable' | 'rrhh';
  team_id?: string;
  vacation_days_balance: number;
  sick_days_balance: number;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  manager_id: string;
  created_at: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'nacional' | 'autonomico' | 'local' | 'empresa';
  is_mandatory: boolean;
  created_by: string;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  user_name: string;
  type: 'vacaciones' | 'enfermedad' | 'personal' | 'maternidad' | 'paternidad';
  start_date: string;
  end_date: string;
  days_count: number;
  reason?: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  reviewed_by?: string;
  reviewed_at?: string;
  review_comments?: string;
  attachment_url?: string;
  created_at: string;
}

export interface DashboardStats {
  pending_requests: number;
  approved_this_month: number;
  team_members_out: number;
  upcoming_holidays: number;
}

export type LeaveType = {
  value: LeaveRequest['type'];
  label: string;
  color: string;
  icon: string;
};
