import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, User, Award, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TrainerModule {
  id: string;
  trainer_id: string;
  module_id: string;
  competency_level: string;
  certification_status: string;
  assigned_at: string;
  certified_at: string | null;
  modules: {
    name: string;
    value_chain: string;
    difficulty_level: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Trainer {
  user_id: string;
  full_name: string;
  email: string;
}

interface Module {
  id: string;
  name: string;
  value_chain: string;
  difficulty_level: string;
}

export const TrainerAssignments: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [competencyLevel, setCompetencyLevel] = useState<string>('beginner');

  const isAdmin = profile?.role === 'admin';

  // Fetch trainer assignments
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['trainer-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_modules')
        .select(`
          *,
          modules!inner(name, value_chain, difficulty_level),
          profiles!inner(full_name, email)
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as TrainerModule[];
    }
  });

  // Fetch trainers for assignment dropdown
  const { data: trainers } = useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .eq('role', 'trainer')
        .eq('is_active', true);

      if (error) throw error;
      return data as Trainer[];
    },
    enabled: isAdmin
  });

  // Fetch modules for assignment dropdown
  const { data: modules } = useQuery({
    queryKey: ['modules-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('id, name, value_chain, difficulty_level')
        .eq('is_active', true);

      if (error) throw error;
      return data as Module[];
    },
    enabled: isAdmin
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTrainer || !selectedModule) {
        throw new Error('Please select both trainer and module');
      }

      const { error } = await supabase
        .from('trainer_modules')
        .insert([{
          trainer_id: selectedTrainer,
          module_id: selectedModule,
          competency_level: competencyLevel,
          certification_status: 'not_started'
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-assignments'] });
      setSelectedTrainer('');
      setSelectedModule('');
      setCompetencyLevel('beginner');
      toast({
        title: 'Success',
        description: 'Trainer assignment created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create assignment. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating assignment:', error);
    }
  });

  // Update certification status mutation
  const updateCertificationMutation = useMutation({
    mutationFn: async ({ assignmentId, status }: { assignmentId: string; status: string }) => {
      const updateData: any = { certification_status: status };
      if (status === 'certified') {
        updateData.certified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('trainer_modules')
        .update(updateData)
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-assignments'] });
      toast({
        title: 'Success',
        description: 'Certification status updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update certification status.',
        variant: 'destructive',
      });
      console.error('Error updating certification:', error);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'certified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompetencyColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'advanced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (assignmentsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment Form (Admin Only) */}
      {isAdmin && (
        <Card className="backdrop-blur-sm bg-white/60 border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Assign Module to Trainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers?.map((trainer) => (
                      <SelectItem key={trainer.user_id} value={trainer.user_id}>
                        {trainer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules?.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={competencyLevel} onValueChange={setCompetencyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Competency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => createAssignmentMutation.mutate()}
                disabled={!selectedTrainer || !selectedModule || createAssignmentMutation.isPending}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
              >
                {createAssignmentMutation.isPending ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments && assignments.length > 0 ? (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {assignment.profiles.full_name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {assignment.modules.name}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getStatusColor(assignment.certification_status)}>
                          <Award className="w-3 h-3 mr-1" />
                          {assignment.certification_status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getCompetencyColor(assignment.competency_level)}>
                          {assignment.competency_level}
                        </Badge>
                        <Badge variant="outline">
                          {assignment.modules.value_chain.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                      </div>
                      {assignment.certified_at && (
                        <div>
                          Certified: {new Date(assignment.certified_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {isAdmin && assignment.certification_status !== 'certified' && (
                      <Select
                        value={assignment.certification_status}
                        onValueChange={(value) => 
                          updateCertificationMutation.mutate({
                            assignmentId: assignment.id,
                            status: value
                          })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="certified">Certified</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardContent className="p-8 text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No assignments found</h3>
              <p className="text-gray-600">
                {isAdmin
                  ? 'Start by assigning modules to trainers.'
                  : 'No modules have been assigned to trainers yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};