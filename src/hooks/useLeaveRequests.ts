
import { useState, useEffect } from 'react';
import { LeaveRequest } from '@/models/types';

// Mock data para demo
const mockRequests: LeaveRequest[] = [
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

export function useLeaveRequests() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 500);
  }, []);

  const createRequest = async (requestData: Omit<LeaveRequest, 'id' | 'created_at' | 'status'>) => {
    try {
      setLoading(true);
      
      const newRequest: LeaveRequest = {
        ...requestData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pendiente',
        created_at: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      setError('Error al crear la solicitud');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (
    requestId: string, 
    status: LeaveRequest['status'], 
    comments?: string
  ) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status, 
                review_comments: comments,
                reviewed_at: new Date().toISOString(),
                reviewed_by: 'Usuario Actual'
              }
            : req
        )
      );
    } catch (err) {
      setError('Error al actualizar la solicitud');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    requests,
    loading,
    error,
    createRequest,
    updateRequestStatus,
  };
}
