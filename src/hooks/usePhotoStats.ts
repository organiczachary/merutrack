import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePhotoStats = () => {
  return useQuery({
    queryKey: ['photo-stats'],
    queryFn: async () => {
      // Get total photos count
      const { count: totalPhotos } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true });

      // Get sessions with photos count
      const { data: sessionsWithPhotos } = await supabase
        .from('photos')
        .select('training_session_id')
        .order('training_session_id');

      const uniqueSessions = new Set(sessionsWithPhotos?.map(p => p.training_session_id));

      // Get recent uploads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentUploads } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      return {
        totalPhotos: totalPhotos || 0,
        sessionsWithPhotos: uniqueSessions.size,
        recentUploads: recentUploads || 0,
      };
    },
  });
};