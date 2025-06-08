
import { useState, useEffect } from 'react';
import { Holiday } from '@/models/types';

// Mock data para demo
const mockHolidays: Holiday[] = [
  {
    id: '1',
    name: 'Año Nuevo',
    date: '2024-01-01',
    type: 'nacional',
    is_mandatory: true,
    created_by: 'system',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Día del Trabajador',
    date: '2024-05-01',
    type: 'nacional',
    is_mandatory: true,
    created_by: 'system',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Fiesta Local',
    date: '2024-06-24',
    type: 'local',
    is_mandatory: false,
    created_by: 'rrhh-1',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '4',
    name: 'Vacaciones de Agosto',
    date: '2024-08-15',
    type: 'empresa',
    is_mandatory: true,
    created_by: 'rrhh-1',
    created_at: '2024-02-01T00:00:00Z',
  },
];

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setHolidays(mockHolidays);
      setLoading(false);
    }, 300);
  }, []);

  const createHoliday = async (holidayData: Omit<Holiday, 'id' | 'created_at' | 'created_by'>) => {
    try {
      setLoading(true);
      
      const newHoliday: Holiday = {
        ...holidayData,
        id: Math.random().toString(36).substr(2, 9),
        created_by: 'current-user',
        created_at: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHolidays(prev => [...prev, newHoliday].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      
      return newHoliday;
    } catch (err) {
      setError('Error al crear el día festivo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHoliday = async (holidayId: string) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setHolidays(prev => prev.filter(holiday => holiday.id !== holidayId));
    } catch (err) {
      setError('Error al eliminar el día festivo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    holidays,
    loading,
    error,
    createHoliday,
    deleteHoliday,
  };
}
