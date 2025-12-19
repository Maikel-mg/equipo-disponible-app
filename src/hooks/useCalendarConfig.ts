
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarConfig, SpecialWorkday } from '@/models/types';
import { supabase } from '@/integrations/supabase/client';

export function useCalendarConfig(year: number = new Date().getFullYear()) {
  const queryClient = useQueryClient();

  // Query for Summer Config
  const { data: configs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['calendar_configs', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_configs')
        .select('*')
        .eq('year', year);
      
      if (error) throw error;
      return data as CalendarConfig[];
    },
  });

  // Query for Special Workdays
  const { data: specialDays = [], isLoading: loadingSpecialDays } = useQuery({
    queryKey: ['special_workdays'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_workdays')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as SpecialWorkday[];
    },
  });

  // Mutations
  const updateConfigMutation = useMutation({
    mutationFn: async (configData: Omit<CalendarConfig, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('calendar_configs')
        .upsert([{ ...configData, year }], { onConflict: 'year' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_configs'] });
    },
  });

  const addSpecialDayMutation = useMutation({
    mutationFn: async (dayData: Omit<SpecialWorkday, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('special_workdays')
        .insert([dayData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['special_workdays'] });
    },
  });

  const deleteSpecialDayMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('special_workdays')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['special_workdays'] });
    },
  });

  return {
    config: configs[0] || null,
    specialDays,
    loading: loadingConfigs || loadingSpecialDays,
    updateConfig: updateConfigMutation.mutateAsync,
    addSpecialDay: addSpecialDayMutation.mutateAsync,
    deleteSpecialDay: deleteSpecialDayMutation.mutateAsync,
  };
}
