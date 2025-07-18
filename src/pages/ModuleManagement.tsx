import React, { useState } from 'react';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';
import { ModulesList } from '@/components/modules/ModulesList';
import { AddEditModuleModal } from '@/components/modules/AddEditModuleModal';
import { TrainerAssignments } from '@/components/modules/TrainerAssignments';
import { Plus, BookOpen, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleStats } from '@/hooks/useModuleStats';

const ModuleManagement = () => {
  const { profile } = useAuth();
  const { data: stats } = useModuleStats();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <MobileNavigation />
      <main className="lg:ml-64">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl shadow-xl p-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">
                    Module Management
                  </h1>
                  <p className="text-slate-600">
                    {isAdmin 
                      ? 'Create and manage training modules, assign to trainers, and track competencies.'
                      : 'View your assigned modules and track your progress.'
                    }
                  </p>
                </div>
              </div>
              {isAdmin && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Module
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Modules</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.totalModules || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Assignments</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.activeAssignments || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/60 border-white/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Certifications</p>
                    <p className="text-2xl font-bold text-foreground">{stats?.completedCertifications || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle>Training Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="modules" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="modules">Modules</TabsTrigger>
                  <TabsTrigger value="assignments">Trainer Assignments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="modules" className="mt-6">
                  <ModulesList 
                    onEdit={isAdmin ? setEditingModule : undefined}
                  />
                </TabsContent>
                
                <TabsContent value="assignments" className="mt-6">
                  <TrainerAssignments />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <AddEditModuleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          module={null}
        />
        
        {editingModule && (
          <AddEditModuleModal
            isOpen={true}
            onClose={() => setEditingModule(null)}
            module={editingModule}
          />
        )}
      </main>
    </div>
  );
};

export default ModuleManagement;