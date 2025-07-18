
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Eye, Plus, Filter, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TrainingScheduler } from './TrainingScheduler';

interface TrainingSession {
  id: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  scheduled_time: string;
  venue: string;
  value_chain: string;
  constituency: string;
  ward: string;
  expected_participants: number | null;
  actual_participants: number | null;
  status: string;
  created_at: string;
}

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  ongoing: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const VALUE_CHAIN_COLORS = {
  banana: 'bg-yellow-100 text-yellow-800',
  avocado: 'bg-green-100 text-green-800',
  dairy: 'bg-blue-100 text-blue-800',
  irish_potato: 'bg-purple-100 text-purple-800',
  coffee: 'bg-amber-100 text-amber-800'
};

export const TrainingSessionsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [valueChainFilter, setValueChainFilter] = useState('all');
  const [showScheduler, setShowScheduler] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrainingSessions();
    }
  }, [user]);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, statusFilter, valueChainFilter]);

  const fetchTrainingSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('trainer_id', user?.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch training sessions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.ward.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    if (valueChainFilter !== 'all') {
      filtered = filtered.filter(session => session.value_chain === valueChainFilter);
    }

    setFilteredSessions(filtered);
  };

  const formatValueChain = (chain: string) => {
    return chain.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatConstituency = (constituency: string) => {
    return constituency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (showScheduler) {
    return <TrainingScheduler />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white/40 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl shadow-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Training Sessions</h1>
                <p className="text-slate-600">Manage your training schedule</p>
              </div>
            </div>
            <Button
              onClick={() => setShowScheduler(true)}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Training
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search trainings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 border-white/40 focus:bg-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white/80 border-white/40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={valueChainFilter} onValueChange={setValueChainFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white/80 border-white/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="avocado">Avocado</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="irish_potato">Irish Potato</SelectItem>
                <SelectItem value="coffee">Coffee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/60 border-white/30 p-8">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No training sessions found</h3>
                <p className="text-slate-600 mb-4">
                  {sessions.length === 0 
                    ? "You haven't scheduled any training sessions yet."
                    : "No sessions match your current filters."
                  }
                </p>
                <Button
                  onClick={() => setShowScheduler(true)}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Your First Training
                </Button>
              </div>
            </Card>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session.id} className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/70 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {session.title}
                          </h3>
                          {session.description && (
                            <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                              {session.description}
                            </p>
                          )}
                        </div>
                        <Badge className={STATUS_COLORS[session.status as keyof typeof STATUS_COLORS]}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={VALUE_CHAIN_COLORS[session.value_chain as keyof typeof VALUE_CHAIN_COLORS]}>
                          {formatValueChain(session.value_chain)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span>
                            {format(parseISO(session.scheduled_date), 'MMM d, yyyy')} at {session.scheduled_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>{session.venue}, {session.ward}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>
                            {session.actual_participants || 0}/{session.expected_participants || 0} participants
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 border-white/40 hover:bg-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
