import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useModuleStats = () => {
  return useQuery({
    queryKey: ['module-stats'],
    queryFn: async () => {
      // Get total modules count
      const { count: totalModules } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get trainer assignments count
      const { count: activeAssignments } = await supabase
        .from('trainer_modules')
        .select('*', { count: 'exact', head: true });

      // Get certified count
      const { count: completedCertifications } = await supabase
        .from('trainer_modules')
        .select('*', { count: 'exact', head: true })
        .eq('certification_status', 'certified');

      return {
        totalModules: totalModules || 0,
        activeAssignments: activeAssignments || 0,
        completedCertifications: completedCertifications || 0,
      };
    },
  });
};