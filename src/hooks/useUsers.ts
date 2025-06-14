import { useState, useEffect } from 'react';
import { User, Team } from '@/models/types';
import { mockUsers, mockTeams } from '@/data/mockData';

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
