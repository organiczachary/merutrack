import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tables, Enums } from '@/integrations/supabase/types';

type Module = Tables<'modules'>;

interface AddEditModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module | null;
}

interface ModuleFormData {
  name: string;
  description: string;
  value_chain: Enums<'value_chain'>;
  difficulty_level: string;
  duration_hours: number;
  is_active: boolean;
  learning_objectives: string[];
  prerequisites: string[];
  sort_order: number;
}

const VALUE_CHAINS: { value: Enums<'value_chain'>; label: string }[] = [
  { value: 'banana', label: 'Banana' },
  { value: 'avocado', label: 'Avocado' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'irish_potato', label: 'Irish Potato' },
  { value: 'coffee', label: 'Coffee' },
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const AddEditModuleModal: React.FC<AddEditModuleModalProps> = ({
  isOpen,
  onClose,
  module,
}) => {
  const queryClient = useQueryClient();
  const [newObjective, setNewObjective] = React.useState('');
  const [newPrerequisite, setNewPrerequisite] = React.useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ModuleFormData>({
    defaultValues: {
      name: '',
      description: '',
      value_chain: 'banana',
      difficulty_level: 'beginner',
      duration_hours: 1,
      is_active: true,
      learning_objectives: [],
      prerequisites: [],
      sort_order: 0,
    },
  });

  const learningObjectives = watch('learning_objectives');
  const prerequisites = watch('prerequisites');

  useEffect(() => {
    if (module) {
      reset({
        name: module.name,
        description: module.description || '',
        value_chain: module.value_chain,
        difficulty_level: module.difficulty_level,
        duration_hours: module.duration_hours || 1,
        is_active: module.is_active,
        learning_objectives: module.learning_objectives || [],
        prerequisites: module.prerequisites || [],
        sort_order: module.sort_order || 0,
      });
    } else {
      reset({
        name: '',
        description: '',
        value_chain: 'banana',
        difficulty_level: 'beginner',
        duration_hours: 1,
        is_active: true,
        learning_objectives: [],
        prerequisites: [],
        sort_order: 0,
      });
    }
  }, [module, reset]);

  const saveModuleMutation = useMutation({
    mutationFn: async (data: ModuleFormData) => {
      if (module) {
        const { error } = await supabase
          .from('modules')
          .update(data)
          .eq('id', module.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('modules')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({
        title: 'Success',
        description: `Module ${module ? 'updated' : 'created'} successfully.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${module ? 'update' : 'create'} module. Please try again.`,
        variant: 'destructive',
      });
      console.error('Error saving module:', error);
    },
  });

  const addObjective = () => {
    if (newObjective.trim()) {
      setValue('learning_objectives', [...learningObjectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setValue('learning_objectives', learningObjectives.filter((_, i) => i !== index));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setValue('prerequisites', [...prerequisites, newPrerequisite.trim()]);
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setValue('prerequisites', prerequisites.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ModuleFormData) => {
    saveModuleMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {module ? 'Edit Module' : 'Create New Module'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Module Name</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Module name is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter module name"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="value_chain">Value Chain</Label>
              <Controller
                name="value_chain"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select value chain" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALUE_CHAINS.map((chain) => (
                        <SelectItem key={chain.value} value={chain.value}>
                          {chain.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Enter module description"
                  rows={3}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty_level">Difficulty Level</Label>
              <Controller
                name="difficulty_level"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="duration_hours">Duration (Hours)</Label>
              <Controller
                name="duration_hours"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    max="40"
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Controller
                name="sort_order"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <Label>Learning Objectives</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Add learning objective"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                />
                <Button type="button" onClick={addObjective} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {learningObjectives.map((objective, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {objective}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removeObjective(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Prerequisites</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Add prerequisite"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                />
                <Button type="button" onClick={addPrerequisite} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prerequisite, index) => (
                  <Badge key={index} variant="outline" className="pr-1">
                    {prerequisite}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => removePrerequisite(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label>Active Module</Label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saveModuleMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
            >
              {saveModuleMutation.isPending 
                ? (module ? 'Updating...' : 'Creating...') 
                : (module ? 'Update Module' : 'Create Module')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};