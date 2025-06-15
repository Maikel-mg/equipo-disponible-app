
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Team } from '@/models/types';
import { supabase } from '@/integrations/supabase/client';

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },
  });

  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Team[];
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { 
      email: string; 
      password: string; 
      name: string; 
      role: User['role']; 
      team_id?: string;
      vacation_days_balance?: number;
      sick_days_balance?: number;
    }) => {
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name
        }
      });

      if (authError) throw authError;

      // Crear perfil en la tabla profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          team_id: userData.team_id || null,
          vacation_days_balance: userData.vacation_days_balance || 22,
          sick_days_balance: userData.sick_days_balance || 3,
        }])
        .select()
        .single();

      if (profileError) throw profileError;
      return profileData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: Partial<User> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: Omit<Team, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert([teamData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ teamId, teamData }: { teamId: string; teamData: Partial<Team> }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(teamData)
        .eq('id', teamId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { error: updateUsersError } = await supabase
        .from('profiles')
        .update({ team_id: null })
        .eq('team_id', teamId);

      if (updateUsersError) throw updateUsersError;

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const createUser = async (userData: { 
    email: string; 
    password: string; 
    name: string; 
    role: User['role']; 
    team_id?: string;
    vacation_days_balance?: number;
    sick_days_balance?: number;
  }) => {
    return createUserMutation.mutateAsync(userData);
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    return updateUserMutation.mutateAsync({ userId, userData });
  };

  const deleteUser = async (userId: string) => {
    return deleteUserMutation.mutateAsync(userId);
  };

  const createTeam = async (teamData: Omit<Team, 'id' | 'created_at'>) => {
    return createTeamMutation.mutateAsync(teamData);
  };

  const updateTeam = async (teamId: string, teamData: Partial<Team>) => {
    return updateTeamMutation.mutateAsync({ teamId, teamData });
  };

  const deleteTeam = async (teamId: string) => {
    return deleteTeamMutation.mutateAsync(teamId);
  };

  const loading = usersLoading || teamsLoading || 
    createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending ||
    createTeamMutation.isPending || updateTeamMutation.isPending || deleteTeamMutation.isPending;

  const error = usersError?.message || teamsError?.message || null;

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
