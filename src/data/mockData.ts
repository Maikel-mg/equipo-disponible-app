
import { LeaveRequest, User, Team } from '@/models/types';

export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Desarrollo',
    manager_id: '2',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 'team-2',
    name: 'Marketing',
    manager_id: '2',
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'team-3',
    name: 'Ventas',
    manager_id: '2',
    created_at: '2024-02-01T11:00:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'maria.garcia@email.com',
    name: 'María García',
    role: 'empleado',
    team_id: 'team-1',
    vacation_days_balance: 12,
    sick_days_balance: 3,
    created_at: '2024-06-01T09:00:00Z',
  },
  {
    id: '2',
    email: 'carlos.lopez@email.com',
    name: 'Carlos López',
    role: 'responsable',
    vacation_days_balance: 20,
    sick_days_balance: 5,
    created_at: '2024-05-21T13:00:00Z',
  },
  {
    id: '3',
    email: 'ana.ruiz@email.com',
    name: 'Ana Ruiz',
    role: 'rrhh',
    vacation_days_balance: 30,
    sick_days_balance: 15,
    created_at: '2024-03-08T07:00:00Z',
  },
  {
    id: '4',
    email: 'pedro.martinez@email.com',
    name: 'Pedro Martínez',
    role: 'empleado',
    team_id: 'team-1',
    vacation_days_balance: 15,
    sick_days_balance: 2,
    created_at: '2024-04-10T08:30:00Z',
  },
  {
    id: '5',
    email: 'lucia.fernandez@email.com',
    name: 'Lucía Fernández',
    role: 'empleado',
    team_id: 'team-2',
    vacation_days_balance: 8,
    sick_days_balance: 4,
    created_at: '2024-05-05T14:15:00Z',
  },
];


export const mockRequests: LeaveRequest[] = [
  {
    id: '1',
    user_id: '1',
    user_name: 'María García',
    type: 'vacaciones',
    start_date: '2024-07-15',
    end_date: '2024-07-19',
    days_count: 5,
    reason: 'Vacaciones de verano',
    status: 'pendiente',
    created_at: '2024-06-08T10:00:00Z',
  },
  {
    id: '2',
    user_id: '2',
    user_name: 'Carlos López',
    type: 'enfermedad',
    start_date: '2024-06-10',
    end_date: '2024-06-12',
    days_count: 3,
    reason: 'Gripe',
    status: 'aprobada',
    reviewed_by: 'Ana Martín',
    reviewed_at: '2024-06-09T15:30:00Z',
    created_at: '2024-06-08T08:00:00Z',
  },
  {
    id: '3',
    user_id: '3',
    user_name: 'Ana Martín',
    type: 'personal',
    start_date: '2024-06-20',
    end_date: '2024-06-20',
    days_count: 1,
    reason: 'Cita médica',
    status: 'aprobada',
    reviewed_by: 'RRHH',
    reviewed_at: '2024-06-08T12:00:00Z',
    created_at: '2024-06-07T14:00:00Z',
  },
];
