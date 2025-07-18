
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TrainingScheduler } from './TrainingScheduler';

interface TrainingSession {
  id: string;
  title: string;
  scheduled_date: string;
  scheduled_time: string;
  venue: string;
  value_chain: string;
  ward: string;
  expected_participants: number | null;
  actual_participants: number | null;
  status: string;
}

const STATUS_COLORS = {
  scheduled: 'bg-blue-500',
  ongoing: 'bg-orange-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-500'
};

export const TrainingCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrainingSessions();
    }
  }, [user, currentDate]);

  const fetchTrainingSessions = async () => {
    try {
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('trainer_id', user?.id)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true });

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

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => 
      isSameDay(parseISO(session.scheduled_date), date)
    );
  };

  const getSelectedDateSessions = () => {
    if (!selectedDate) return [];
    return getSessionsForDate(selectedDate);
  };

  const formatValueChain = (chain: string) => {
    return chain.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (showScheduler) {
    return <TrainingScheduler />;
  }

  const days = getDaysInMonth();
  const selectedDateSessions = getSelectedDateSessions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl shadow-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Training Calendar</h1>
                <p className="text-slate-600">View and manage your training schedule</p>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-slate-800">
                    {format(currentDate, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                      className="bg-white/80 border-white/40 hover:bg-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                      className="bg-white/80 border-white/40 hover:bg-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="h-8 bg-slate-200 rounded"></div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {[...Array(35)].map((_, i) => (
                        <div key={i} className="h-20 bg-slate-100 rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {days.map((day, index) => {
                        const daySessions = getSessionsForDate(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        return (
                          <div
                            key={index}
                            className={`
                              min-h-20 p-2 rounded-lg border cursor-pointer transition-all duration-200
                              ${isSelected 
                                ? 'bg-emerald-100 border-emerald-300 shadow-md' 
                                : isCurrentMonth 
                                  ? 'bg-white/80 border-white/40 hover:bg-white hover:shadow-sm' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }
                            `}
                            onClick={() => setSelectedDate(day)}
                          >
                            <div className="text-sm font-medium mb-1">
                              {format(day, 'd')}
                            </div>
                            <div className="space-y-1">
                              {daySessions.slice(0, 2).map((session, i) => (
                                <div
                                  key={i}
                                  className={`
                                    text-xs px-1 py-0.5 rounded text-white truncate
                                    ${STATUS_COLORS[session.status as keyof typeof STATUS_COLORS]}
                                  `}
                                  title={session.title}
                                >
                                  {session.title}
                                </div>
                              ))}
                              {daySessions.length > 2 && (
                                <div className="text-xs text-slate-600">
                                  +{daySessions.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div>
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a Date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  selectedDateSessions.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateSessions.map((session) => (
                        <div key={session.id} className="p-4 bg-white/80 rounded-lg border border-white/40">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-slate-800 text-sm">{session.title}</h4>
                            <Badge className={`text-xs ${STATUS_COLORS[session.status as keyof typeof STATUS_COLORS]} text-white`}>
                              {session.status}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>{session.scheduled_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              <span>{session.venue}, {session.ward}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-emerald-600" />
                              <span>
                                {session.actual_participants || 0}/{session.expected_participants || 0} participants
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {formatValueChain(session.value_chain)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 text-sm mb-4">No training sessions scheduled for this date</p>
                      <Button
                        size="sm"
                        onClick={() => setShowScheduler(true)}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                      >
                        <Plus className="w-3 h-3 mr-2" />
                        Schedule Training
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-400 text-sm">
                      Click on a date to view training sessions
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
