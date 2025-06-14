
import { useState, useEffect } from 'react';
import { User, Team } from '@/models/types';

// Mock data para demo
const mockTeams: Team[] = [
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

const mockUsers: User[] = [
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

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setTeams(mockTeams);
      setLoading(false);
    }, 500);
  }, []);

  const createUser = async (userData: Omit<User, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError('Error al crear el usuario');
      throw err;
    } finally {  
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, ...userData }
            : user
        )
      );
    } catch (err) {
      setError('Error al actualizar el usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      setError('Error al eliminar el usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: Omit<Team, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      
      const newTeam: Team = {
        ...teamData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTeams(prev => [newTeam, ...prev]);
      return newTeam;
    } catch (err) {
      setError('Error al crear el equipo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, teamData: Partial<Team>) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTeams(prev => 
        prev.map(team => 
          team.id === teamId 
            ? { ...team, ...teamData }
            : team
        )
      );
    } catch (err) {
      setError('Error al actualizar el equipo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTeams(prev => prev.filter(team => team.id !== teamId));
      // También remover la asignación del equipo de los usuarios
      setUsers(prev => prev.map(user => 
        user.team_id === teamId 
          ? { ...user, team_id: undefined }
          : user
      ));
    } catch (err) {
      setError('Error al eliminar el equipo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    teams,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}
