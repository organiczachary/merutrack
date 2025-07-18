
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, User, MapPin, Briefcase } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'trainer' | 'supervisor';
  is_active: boolean;
  constituency?: string;
  ward?: string;
  assigned_value_chains?: string[];
  phone?: string;
}

interface UserCardProps {
  user: Profile;
  onEdit: () => void;
  onView: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onView }) => {
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
    if (!chains || chains.length === 0) return 'None assigned';
    return chains.map(chain => 
      chain.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).slice(0, 2).join(', ') + (chains.length > 2 ? ` +${chains.length - 2} more` : '');
  };

  return (
    <Card className="glass-card border-glass-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{user.full_name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.phone && (
                <p className="text-xs text-muted-foreground">{user.phone}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-1">
            <Badge className={`${getRoleColor(user.role)} border text-xs`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
            <Badge
              variant={user.is_active ? 'default' : 'secondary'}
              className={`text-xs ${user.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
            >
              {user.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{formatConstituencyName(user.constituency)}</span>
            {user.ward && <span className="ml-2">• {user.ward}</span>}
          </div>
          
          {user.assigned_value_chains && user.assigned_value_chains.length > 0 && (
            <div className="flex items-start text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4 mr-2 mt-0.5" />
              <span>{formatValueChains(user.assigned_value_chains)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
