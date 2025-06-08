
export const LEAVE_TYPES: Array<{
  value: LeaveRequest['type'];
  label: string;
  color: string;
  maxDays?: number;
}> = [
  { value: 'vacaciones', label: 'Vacaciones', color: 'blue', maxDays: 30 },
  { value: 'enfermedad', label: 'Baja por enfermedad', color: 'red' },
  { value: 'personal', label: 'Asunto personal', color: 'orange', maxDays: 3 },
  { value: 'maternidad', label: 'Baja maternal', color: 'pink' },
  { value: 'paternidad', label: 'Baja paternal', color: 'green' },
];

export const HOLIDAY_TYPES = [
  { value: 'nacional', label: 'Nacional' },
  { value: 'autonomico', label: 'Autonómico' },
  { value: 'local', label: 'Local' },
  { value: 'empresa', label: 'Empresa' },
];

export const USER_ROLES = [
  { value: 'empleado', label: 'Empleado' },
  { value: 'responsable', label: 'Responsable' },
  { value: 'rrhh', label: 'RRHH' },
];
