import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Edit3, Star, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type Module = Tables<'modules'>;

interface ModulesListProps {
  onEdit?: (module: Module) => void;
}

export const ModulesList: React.FC<ModulesListProps> = ({ onEdit }) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getValueChainColor = (valueChain: string) => {
    switch (valueChain) {
      case 'banana':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avocado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dairy':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'irish_potato':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'coffee':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
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

  if (!modules || modules.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/60 border-white/30">
        <CardContent className="p-8 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No modules found</h3>
          <p className="text-gray-600">
            {isAdmin
              ? 'Start by creating your first training module.'
              : 'No training modules have been created yet.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <Card key={module.id} className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/70 transition-all duration-300">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg text-slate-800 mb-2">{module.name}</CardTitle>
                {module.description && (
                  <p className="text-sm text-slate-600 mb-3">{module.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getDifficultyColor(module.difficulty_level)}>
                    <Star className="w-3 h-3 mr-1" />
                    {module.difficulty_level}
                  </Badge>
                  
                  <Badge className={getValueChainColor(module.value_chain)}>
                    {module.value_chain.replace('_', ' ')}
                  </Badge>
                  
                  {module.duration_hours && (
                    <Badge variant="outline" className="text-slate-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {module.duration_hours}h
                    </Badge>
                  )}
                  
                  {!module.is_active && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>

                {module.learning_objectives && module.learning_objectives.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Learning Objectives:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {module.learning_objectives.slice(0, 3).map((objective, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 flex-shrink-0"></div>
                          {objective}
                        </li>
                      ))}
                      {module.learning_objectives.length > 3 && (
                        <li className="text-xs text-slate-500">
                          +{module.learning_objectives.length - 3} more objectives
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {module.prerequisites && module.prerequisites.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Prerequisites:</h4>
                    <div className="flex flex-wrap gap-1">
                      {module.prerequisites.map((prereq, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {isAdmin && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(module)}
                  className="ml-4"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};