import { useState, useEffect } from 'react';
import { LeaveRequest } from '@/models/types';
import { mockRequests, mockUsers } from '@/data/mockData';

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
      
      const requestToUpdate = requests.find(r => r.id === requestId);
      if (!requestToUpdate) {
        throw new Error("Solicitud no encontrada");
      }

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

      // Si es una solicitud de vacaciones aprobada, descontar del saldo del usuario.
      if (status === 'aprobada' && requestToUpdate.type === 'vacaciones') {
        const userIndex = mockUsers.findIndex(u => u.id === requestToUpdate.user_id);
        if (userIndex !== -1) {
          mockUsers[userIndex].vacation_days_balance -= requestToUpdate.days_count;
        }
      }

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
