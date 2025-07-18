
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Eye, MoreVertical, RefreshCw } from 'lucide-react';
import { UserCard } from './UserCard';

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
  phone?: string;
}

interface UserManagementTableProps {
  users: Profile[];
  isLoading: boolean;
  onRefresh: () => void;
  onEditUser: (user: Profile) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  isLoading,
  onRefresh,
  onEditUser,
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'supervisor':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'trainer':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatConstituencyName = (constituency?: string) => {
    if (!constituency) return 'Not assigned';
    return constituency.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatValueChains = (chains?: string[]) => {
    if (!chains || chains.length === 0) return 'None';
    return chains.map(chain => 
      chain.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).join(', ');
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-glass-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-glass-border">
      <CardContent className="p-0">
        {/* Mobile View */}
        <div className="block md:hidden">
          <div className="space-y-4 p-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={() => onEditUser(user)}
                onView={() => console.log('View user:', user)}
              />
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border">
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Constituency</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Value Chains</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-glass-border">
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.phone && (
                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getRoleColor(user.role)} border`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatConstituencyName(user.constituency)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {user.ward || 'Not assigned'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <span className="text-sm">
                        {formatValueChains(user.assigned_value_chains)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.is_active ? 'default' : 'secondary'}
                      className={user.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View user:', user)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditUser(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
