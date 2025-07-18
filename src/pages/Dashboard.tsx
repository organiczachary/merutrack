
import React, { useState } from 'react';
import { MobileNavigation } from '@/components/navigation/MobileNavigation';
import { TrainingSessionsList } from '@/components/training/TrainingSessionsList';
import { TrainingCalendar } from '@/components/training/TrainingCalendar';
import { TrainingDetails } from '@/components/training/TrainingDetails';
import { Calendar, List, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

type ViewMode = 'dashboard' | 'list' | 'calendar' | 'details';

const Dashboard = () => {
  const { profile } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return <TrainingSessionsList />;
      case 'calendar':
        return <TrainingCalendar />;
      case 'details':
        return selectedSessionId ? (
          <TrainingDetails 
            sessionId={selectedSessionId} 
            onBack={() => setViewMode('list')} 
          />
        ) : (
          <TrainingSessionsList />
        );
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
            <div className="max-w-6xl mx-auto">
              {/* Welcome Section */}
              <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl shadow-xl p-6 mb-6 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">
                      Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
                    </h1>
                    <p className="text-slate-600">
                      {profile?.role === 'admin' 
                        ? 'Manage your training programs and monitor system performance.'
                        : profile?.role === 'supervisor'
                        ? 'Monitor training activities in your constituency.'
                        : 'Manage your training sessions and participants.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card 
                  className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/70 transition-all duration-300 cursor-pointer group"
                  onClick={() => setViewMode('list')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                      <List className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Training Sessions</h3>
                    <p className="text-sm text-slate-600">View all sessions</p>
                  </CardContent>
                </Card>

                <Card 
                  className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/70 transition-all duration-300 cursor-pointer group"
                  onClick={() => setViewMode('calendar')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-200 transition-colors">
                      <Calendar className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Calendar</h3>
                    <p className="text-sm text-slate-600">Schedule view</p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/70 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Reports</h3>
                    <p className="text-sm text-slate-600">View analytics</p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/70 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Participants</h3>
                    <p className="text-sm text-slate-600">Manage attendance</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No recent activity</h3>
                    <p className="text-slate-600 mb-4">
                      Start by scheduling your first training session or viewing your calendar.
                    </p>
                    <Button
                      onClick={() => setViewMode('list')}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                    >
                      Get Started
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <MobileNavigation />
      <main className="lg:ml-64">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
