import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Clock,
  Users,
  BookOpen,
  Camera,
  MapPin,
  Target,
  CheckCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface DashboardInsights {
  headline_insight: string;
  performance_summary: string;
  alerts: string[];
  opportunities: string[];
  next_actions: string[];
  trends: {
    positive: string[];
    concerning: string[];
  };
  recommendations: {
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
}

interface DashboardData {
  recentSessions: number;
  totalAttendance: number;
  activeModules: number;
  recentPhotos: number;
  constituencyData: any[];
  attendanceByGender: Record<string, number>;
  modulesByValueChain: Record<string, number>;
}

const AIDashboard = () => {
  const { profile } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Redirect if not admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/60 border-white/30 p-8 max-w-md">
          <CardContent className="text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Restricted</h2>
            <p className="text-slate-600">Only administrators can access the AI dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch AI dashboard insights
  const { data: dashboardResponse, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: async () => {
      const response = await supabase.functions.invoke('ai-dashboard');
      if (response.error) throw response.error;
      setLastUpdated(new Date());
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const insights: DashboardInsights = dashboardResponse?.insights || {};
  const data: DashboardData = dashboardResponse?.data || {};

  const refreshDashboard = () => {
    refetch();
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = "primary" 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    trend?: string;
    color?: string;
  }) => (
    <Card className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-white/70 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {trend && (
              <p className="text-xs text-slate-500 mt-1">{trend}</p>
            )}
          </div>
          <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/60 border-white/30 p-8">
          <CardContent className="text-center">
            <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">AI is Analyzing Your Data</h2>
            <p className="text-slate-600">Generating intelligent insights...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/40 border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-1">AI Dashboard</h1>
                <p className="text-slate-600">Real-time intelligent insights and analytics</p>
              </div>
            </div>
            <div className="text-right">
              <Button 
                onClick={refreshDashboard}
                disabled={isRefetching}
                variant="outline" 
                className="gap-2 mb-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <p className="text-xs text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Headline Insight */}
        {insights.headline_insight && (
          <Alert className="backdrop-blur-sm bg-white/60 border-white/30">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-lg font-semibold text-slate-800">
              {insights.headline_insight}
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Recent Sessions" 
            value={data.recentSessions || 0}
            icon={BookOpen}
            trend="Last 30 days"
            color="blue"
          />
          <StatCard 
            title="Total Attendance" 
            value={data.totalAttendance || 0}
            icon={Users}
            trend="Last 30 days"
            color="green"
          />
          <StatCard 
            title="Active Modules" 
            value={data.activeModules || 0}
            icon={Target}
            color="purple"
          />
          <StatCard 
            title="Photos Uploaded" 
            value={data.recentPhotos || 0}
            icon={Camera}
            trend="Last 30 days"
            color="pink"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Performance Summary */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                {insights.performance_summary || "Analyzing system performance..."}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Immediate Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.next_actions?.slice(0, 3).map((action, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{action}</p>
                  </div>
                )) || (
                  <p className="text-slate-600 text-sm">Analyzing for recommended actions...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alerts */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.alerts?.length > 0 ? insights.alerts.map((alert, index) => (
                  <Alert key={index} className="border-amber-200 bg-amber-50/50">
                    <AlertDescription className="text-sm text-amber-800">
                      {alert}
                    </AlertDescription>
                  </Alert>
                )) : (
                  <p className="text-slate-600 text-sm">No alerts at this time</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.opportunities?.map((opportunity, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{opportunity}</p>
                  </div>
                )) || (
                  <p className="text-slate-600 text-sm">Identifying growth opportunities...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trends */}
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h4 className="font-medium text-slate-800">Positive</h4>
                </div>
                <div className="space-y-1">
                  {insights.trends?.positive?.map((trend, index) => (
                    <Badge key={index} variant="secondary" className="block w-fit text-xs">
                      {trend}
                    </Badge>
                  )) || <p className="text-slate-600 text-xs">Analyzing trends...</p>}
                </div>
              </div>
              
              {insights.trends?.concerning?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-amber-600" />
                    <h4 className="font-medium text-slate-800">Areas for Attention</h4>
                  </div>
                  <div className="space-y-1">
                    {insights.trends.concerning.map((trend, index) => (
                      <Badge key={index} variant="outline" className="block w-fit text-xs border-amber-300">
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Timeline */}
        {insights.recommendations && (
          <Card className="backdrop-blur-sm bg-white/60 border-white/30">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    Short-term (1 week)
                  </h4>
                  <div className="space-y-2">
                    {insights.recommendations.short_term?.map((rec, index) => (
                      <p key={index} className="text-sm text-slate-700 pl-5 border-l-2 border-primary/30">
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-glow rounded-full" />
                    Medium-term (1 month)
                  </h4>
                  <div className="space-y-2">
                    {insights.recommendations.medium_term?.map((rec, index) => (
                      <p key={index} className="text-sm text-slate-700 pl-5 border-l-2 border-primary-glow/30">
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full" />
                    Long-term (3 months)
                  </h4>
                  <div className="space-y-2">
                    {insights.recommendations.long_term?.map((rec, index) => (
                      <p key={index} className="text-sm text-slate-700 pl-5 border-l-2 border-accent/30">
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Visualizations */}
        {(data.attendanceByGender || data.modulesByValueChain) && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            {Object.keys(data.attendanceByGender || {}).length > 0 && (
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Attendance by Gender</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.attendanceByGender).map(([gender, count]) => {
                      const total = Object.values(data.attendanceByGender).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={gender} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {gender === 'unknown' ? 'Not specified' : gender}
                            </span>
                            <span className="text-sm text-slate-600">{count} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modules by Value Chain */}
            {Object.keys(data.modulesByValueChain || {}).length > 0 && (
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Modules by Value Chain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.modulesByValueChain).map(([chain, count]) => {
                      const total = Object.values(data.modulesByValueChain).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={chain} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {chain.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-slate-600">{count} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDashboard;