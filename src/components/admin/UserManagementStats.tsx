
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'trainer' | 'supervisor';
  is_active: boolean;
  constituency?: string;
  ward?: string;
  assigned_value_chains?: string[];
  created_at: string;
}

interface UserManagementStatsProps {
  users: Profile[];
}

export const UserManagementStats: React.FC<UserManagementStatsProps> = ({ users }) => {
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    supervisors: users.filter(u => u.role === 'supervisor').length,
    trainers: users.filter(u => u.role === 'trainer').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="glass-card border-glass-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-glass-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-glass-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <UserX className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">Inactive Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-glass-border">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Roles</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {stats.admins} Admin{stats.admins !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats.supervisors} Supervisor{stats.supervisors !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats.trainers} Trainer{stats.trainers !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
