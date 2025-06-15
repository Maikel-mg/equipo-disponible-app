
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
    updateUserMutation.isPending || deleteUserMutation.isPending ||
    createTeamMutation.isPending || updateTeamMutation.isPending || deleteTeamMutation.isPending;

  const error = usersError?.message || teamsError?.message || null;

  return {
    users,
    teams,
    loading,
    error,
    updateUser,
    deleteUser,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}
