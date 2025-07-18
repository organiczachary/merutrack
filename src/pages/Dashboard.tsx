import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, MapPin, Briefcase, Shield } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'supervisor':
        return 'bg-accent text-accent-foreground';
      case 'trainer':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatConstituency = (constituency?: string) => {
    if (!constituency) return 'Not assigned';
    return constituency.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatValueChains = (chains?: string[]) => {
    if (!chains || chains.length === 0) return 'None assigned';
    return chains.map(chain => 
      chain.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).join(', ');
  };

  return (
    <div className="min-h-screen auth-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || user?.email}</p>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="glass-card border-glass-border hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="glass-card border-glass-border mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{profile?.full_name || 'User'}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>
              <Badge className={getRoleColor(profile?.role || 'trainer')}>
                <Shield className="w-3 h-3 mr-1" />
                {formatRole(profile?.role || 'trainer')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Constituency: {formatConstituency(profile?.constituency)}</p>
                  <p className="text-sm text-muted-foreground">Ward: {profile?.ward || 'Not assigned'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Value Chains
                </div>
                <p className="font-medium">{formatValueChains(profile?.assigned_value_chains)}</p>
              </div>
            </div>
            {profile?.phone && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Phone</div>
                <p className="font-medium">{profile.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card border-glass-border">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-muted-foreground">Active Trainings</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-glass-border">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-accent mb-2">0</div>
              <div className="text-sm text-muted-foreground">Completed Sessions</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-glass-border">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-secondary-foreground mb-2">0</div>
              <div className="text-sm text-muted-foreground">Total Participants</div>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific sections */}
        {profile?.role === 'admin' && (
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>Manage users, trainings, and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.role === 'supervisor' && (
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle>Supervisor Dashboard</CardTitle>
              <CardDescription>Monitor trainings and trainer performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Monitor Trainers
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.role === 'trainer' && (
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle>Trainer Dashboard</CardTitle>
              <CardDescription>Manage your training sessions and participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  My Trainings
                </Button>
                <Button variant="outline" className="justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Participants
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;