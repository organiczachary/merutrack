
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Filter, Users, UserCheck, UserX, Download } from 'lucide-react';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { AddEditUserModal } from '@/components/admin/AddEditUserModal';
import { UserManagementFilters } from '@/components/admin/UserManagementFilters';
import { UserManagementStats } from '@/components/admin/UserManagementStats';

const AdminUserManagement: React.FC = () => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Redirect if not admin
  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchQuery, selectedRole, selectedConstituency, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      if (selectedRole !== 'all') {
        query = query.eq('role', selectedRole as 'admin' | 'trainer' | 'supervisor');
      }

      if (selectedConstituency !== 'all') {
        query = query.eq('constituency', selectedConstituency as 'igembe_south' | 'igembe_central' | 'igembe_north' | 'tigania_west' | 'tigania_east' | 'north_imenti' | 'buuri' | 'central_imenti' | 'south_imenti');
      }

      if (selectedStatus !== 'all') {
        query = query.eq('is_active', selectedStatus === 'active');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleExportUsers = () => {
    if (!users) return;
    
    const csvContent = [
      ['Name', 'Email', 'Role', 'Constituency', 'Ward', 'Status', 'Created'],
      ...users.map(user => [
        user.full_name,
        user.email,
        user.role,
        user.constituency || '',
        user.ward || '',
        user.is_active ? 'Active' : 'Inactive',
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen auth-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage users, roles, and assignments</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportUsers}
              variant="outline"
              className="glass-card border-glass-border"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setShowAddUserModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <UserManagementStats users={users || []} />

        {/* Search and Filters */}
        <Card className="glass-card border-glass-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-card border-glass-border"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="glass-card border-glass-border"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <UserManagementFilters
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                selectedConstituency={selectedConstituency}
                setSelectedConstituency={setSelectedConstituency}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <UserManagementTable
          users={users || []}
          isLoading={isLoading}
          onRefresh={refetch}
          onEditUser={(user) => {
            // Will implement edit functionality
            console.log('Edit user:', user);
          }}
        />

        {/* Add User Modal */}
        <AddEditUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onSuccess={() => {
            setShowAddUserModal(false);
            refetch();
          }}
        />
      </div>
    </div>
  );
};

export default AdminUserManagement;
