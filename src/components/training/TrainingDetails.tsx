
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Users, Camera, FileText, 
  CheckCircle, XCircle, AlertCircle, ArrowLeft, Edit,
  MessageSquare, MoreVertical, Share, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  completion_notes: string | null;
  supervisor_comments: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  created_at: string;
}

interface TrainingDetailsProps {
  sessionId: string;
  onBack: () => void;
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'bg-blue-500' },
  { value: 'ongoing', label: 'Ongoing', icon: AlertCircle, color: 'bg-orange-500' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-emerald-500' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-500' }
];

export const TrainingDetails: React.FC<TrainingDetailsProps> = ({ sessionId, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [actualParticipants, setActualParticipants] = useState(0);

  useEffect(() => {
    fetchTrainingSession();
  }, [sessionId]);

  const fetchTrainingSession = async () => {
    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      
      setSession(data);
      setCompletionNotes(data.completion_notes || '');
      setActualParticipants(data.actual_participants || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch training session details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionStatus = async (newStatus: string) => {
    if (!session) return;

    setIsUpdating(true);
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        updates.completion_notes = completionNotes;
        updates.actual_participants = actualParticipants;
      }

      const { error } = await supabase
        .from('training_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;

      setSession(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Status updated",
        description: `Training session marked as ${newStatus}.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update training status.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatValueChain = (chain: string) => {
    return chain.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatConstituency = (constituency: string) => {
    return constituency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCurrentStatus = () => {
    return STATUS_OPTIONS.find(option => option.value === session?.status) || STATUS_OPTIONS[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-white/40 rounded-2xl"></div>
            <div className="h-96 bg-white/40 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/60 border-white/30 p-8">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Training session not found</h3>
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentStatus = getCurrentStatus();
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl shadow-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white/80 border-white/40 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/80 border-white/40 hover:bg-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Training
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Share Details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Training
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 ${currentStatus.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <StatusIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{session.title}</h1>
              <div className="flex items-center gap-4 text-slate-600">
                <Badge className={`${currentStatus.color} text-white`}>
                  {currentStatus.label}
                </Badge>
                <span className="text-sm">
                  Created {format(parseISO(session.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Training Information */}
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Training Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.description && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Description</h4>
                    <p className="text-slate-600">{session.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-500">Date & Time</p>
                      <p className="font-medium text-slate-800">
                        {format(parseISO(session.scheduled_date), 'MMM d, yyyy')} at {session.scheduled_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium text-slate-800">{session.venue}</p>
                      <p className="text-sm text-slate-600">{session.ward}, {formatConstituency(session.constituency)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-500">Participants</p>
                      <p className="font-medium text-slate-800">
                        {session.actual_participants || 0} / {session.expected_participants || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded"></div>
                    <div>
                      <p className="text-sm text-slate-500">Value Chain</p>
                      <p className="font-medium text-slate-800">{formatValueChain(session.value_chain)}</p>
                    </div>
                  </div>
                </div>

                {(session.gps_latitude && session.gps_longitude) && (
                  <div className="pt-4 border-t border-white/40">
                    <h4 className="font-semibold text-slate-700 mb-2">GPS Coordinates</h4>
                    <p className="text-sm text-slate-600">
                      {session.gps_latitude.toFixed(6)}, {session.gps_longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Management */}
            {session.status !== 'completed' && (
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Training Status</label>
                    <Select defaultValue={session.status} onValueChange={updateSessionStatus}>
                      <SelectTrigger className="bg-white/80 border-white/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="w-4 h-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {session.status === 'ongoing' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Actual Participants</label>
                        <input
                          type="number"
                          min="0"
                          value={actualParticipants}
                          onChange={(e) => setActualParticipants(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/80 border border-white/40 rounded-md focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Completion Notes</label>
                        <Textarea
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          placeholder="Add notes about the training session..."
                          className="bg-white/80 border-white/40 focus:bg-white"
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Completion Notes */}
            {session.completion_notes && (
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Completion Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{session.completion_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photos
                </Button>
                <Button variant="outline" className="w-full bg-white/80 border-white/40 hover:bg-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Attendance
                </Button>
                <Button variant="outline" className="w-full bg-white/80 border-white/40 hover:bg-white">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Participants
                </Button>
              </CardContent>
            </Card>

            {/* Supervisor Comments */}
            {session.supervisor_comments && (
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Supervisor Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{session.supervisor_comments}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
