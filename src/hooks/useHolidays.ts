
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Holiday } from '@/models/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useHolidays() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: holidays = [], isLoading: loading, error } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as Holiday[];
    },
  });

  const createHolidayMutation = useMutation({
    mutationFn: async (holidayData: Omit<Holiday, 'id' | 'created_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('holidays')
        .insert([{
          ...holidayData,
          created_by: user?.id,
        }])
        .select()
        .single();
      
      if (error) {
        if (error.message.includes('duplicate') || error.code === '23505') {
          throw new Error('Festivo duplicado');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });

  const updateHolidayMutation = useMutation({
    mutationFn: async ({ id, ...holidayData }: Holiday) => {
      const { data, error } = await supabase
        .from('holidays')
        .update(holidayData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        if (error.message.includes('duplicate') || error.code === '23505') {
          throw new Error('Festivo duplicado');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: async (holidayId: string) => {
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', holidayId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });

  const createHoliday = async (holidayData: Omit<Holiday, 'id' | 'created_at' | 'created_by'>) => {
    return createHolidayMutation.mutateAsync(holidayData);
  };

  const updateHoliday = async (id: string, updated: Omit<Holiday, "id" | "created_at" | "created_by">) => {
    return updateHolidayMutation.mutateAsync({ id, ...updated } as Holiday);
  };

  const deleteHoliday = async (holidayId: string) => {
    return deleteHolidayMutation.mutateAsync(holidayId);
  };

  return {
    holidays,
    loading: loading || createHolidayMutation.isPending || updateHolidayMutation.isPending || deleteHolidayMutation.isPending,
    error: error?.message || null,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  };
}
