
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, parseISO, isWeekend } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern: string = "PPP"): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: es });
}

export function calculateWorkingDays(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  let workingDays = 0;
  
  const totalDays = differenceInDays(end, start) + 1;
  
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    
    if (!isWeekend(currentDate)) {
      workingDays++;
    }
  }
  
  return workingDays;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pendiente': return 'amber';
    case 'aprobada': return 'green';
    case 'rechazada': return 'red';
    default: return 'gray';
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'vacaciones': return 'blue';
    case 'enfermedad': return 'red';
    case 'personal': return 'orange';
    case 'maternidad': return 'pink';
    case 'paternidad': return 'green';
    default: return 'gray';
  }
}
