import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PhotoFiltersProps {
  onSessionChange: (sessionId: string | null) => void;
  onSearchChange: (query: string) => void;
}

export const PhotoFilters: React.FC<PhotoFiltersProps> = ({
  onSessionChange,
  onSearchChange,
}) => {
  const { data: sessions } = useQuery({
    queryKey: ['training-sessions-with-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('id, title, scheduled_date, venue')
        .order('scheduled_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="backdrop-blur-sm bg-white/60 border-white/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search Photos</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Search by caption or filename..."
                className="pl-10"
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Session Filter */}
          <div>
            <Label htmlFor="session">Training Session</Label>
            <Select onValueChange={(value) => onSessionChange(value === 'all' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {sessions?.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.title} - {new Date(session.scheduled_date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};