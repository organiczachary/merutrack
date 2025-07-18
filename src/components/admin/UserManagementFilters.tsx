
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CONSTITUENCIES = [
  'igembe_south',
  'igembe_central', 
  'igembe_north',
  'tigania_west',
  'tigania_east',
  'north_imenti',
  'buuri',
  'central_imenti',
  'south_imenti'
];

interface UserManagementFiltersProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedConstituency: string;
  setSelectedConstituency: (constituency: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

export const UserManagementFilters: React.FC<UserManagementFiltersProps> = ({
  selectedRole,
  setSelectedRole,
  selectedConstituency,
  setSelectedConstituency,
  selectedStatus,
  setSelectedStatus,
}) => {
  const formatConstituencyName = (constituency: string) => {
    return constituency.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="glass-card border-glass-border mt-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role-filter">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="glass-card border-glass-border">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border bg-background">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="trainer">Trainer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="constituency-filter">Constituency</Label>
            <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
              <SelectTrigger className="glass-card border-glass-border">
                <SelectValue placeholder="All Constituencies" />
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border bg-background">
                <SelectItem value="all">All Constituencies</SelectItem>
                {CONSTITUENCIES.map((constituency) => (
                  <SelectItem key={constituency} value={constituency}>
                    {formatConstituencyName(constituency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="glass-card border-glass-border">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border bg-background">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
