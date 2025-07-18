
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Shield, MapPin, Briefcase } from 'lucide-react';

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

const VALUE_CHAINS = ['banana', 'avocado', 'dairy', 'irish_potato', 'coffee'];

const MERU_WARDS = [
  // Igembe North
  'Antuambui', 'Antubetwe Kiongo', 'Naathu', 'Ntunene', 'Amwathi',
  // Igembe South
  'Akachiu', 'Athiru Gaiti', 'Kanuni', 'Kiegoi/Antubochiu', 'Maua',
  // Igembe Central
  'Akirang\'ondú', 'Athiru Ruujine', 'Igembe East', 'Kangeta', 'Njia',
  // Tigania East
  'Karama', 'Kiguchwa', 'Mikinduri', 'Muthara', 'Thangatha',
  // Tigania West
  'Akithii', 'Athwana', 'Kianjai', 'Mbeu', 'Nkomo',
  // North Imenti
  'Municipality', 'Ntima East', 'Ntima West', 'Nyaki East', 'Nyaki West',
  // Central Imenti
  'Abothuguchi Central', 'Abothuguchi West', 'Kiagu', 'Mwanganthia',
  // South Imenti
  'Abogeta East', 'Abogeta West', 'Igoji East', 'Igoji West', 'Mitunguu', 'Nkuene',
  // Buuri
  'Kiirua/Naari', 'Kisima', 'Ruiri/Rwarera', 'Timau', 'Kibirichia'
];

const SAMPLE_NAMES = {
  female: [
    'Grace Kendi', 'Olivia Makena', 'Faith Nkatha', 'Charlotte Nkirote', 'Joy Kajuju',
    'Abigail Karimi', 'Zoe Gatwiri', 'Hannah Gacheri', 'Victoria Kawira', 'Sharon Kagwiria',
    'Sophia Kathure', 'Annabelle Kanana', 'Rose Kinya', 'Mercy Mukami', 'Catherine Mutethia',
    'Isabella Gakii', 'Chloe Ciambaka', 'Brenda Kathambi', 'Peninah Ciankui', 'Lillian Kananu',
    'Angela Mwendwa', 'Emily Ciara', 'Rebecca Kathomi', 'Sarah Ntinyari', 'Winfred Kiende'
  ],
  male: [
    'Martin Kimathi', 'Morris Mwenda', 'James Koome', 'Peter Murithi', 'David Mutuma',
    'Paul Mawira', 'Henry Gitonga', 'John Kirimi', 'Stephen Mugambi', 'George Muriuki',
    'Francis Kinoti', 'Charles Kimaita', 'Douglas Mwirigi', 'Lewis Bundi', 'Patrick Munene',
    'Michael Mbae', 'Gilbert Kaaria', 'Samuel Mureti', 'Simon Micheni', 'Andrew Mutwiri',
    'Dennis Kithinji', 'Lawrence Kathurima', 'Joseph Mugendi', 'Edward Muriithi', 'Robert Majau'
  ]
};

interface AddEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
}

export const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'trainer',
    constituency: user?.constituency || '',
    ward: user?.ward || '',
    assigned_value_chains: user?.assigned_value_chains || [],
    is_active: user?.is_active ?? true,
  });

  const formatConstituencyName = (constituency: string) => {
    return constituency.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatValueChainName = (chain: string) => {
    return chain.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleValueChainChange = (chain: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        assigned_value_chains: [...prev.assigned_value_chains, chain]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assigned_value_chains: prev.assigned_value_chains.filter(c => c !== chain)
      }));
    }
  };

  const getRandomSampleName = () => {
    const allNames = [...SAMPLE_NAMES.female, ...SAMPLE_NAMES.male];
    return allNames[Math.floor(Math.random() * allNames.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
            constituency: formData.constituency || null,
            ward: formData.ward || null,
            assigned_value_chains: formData.assigned_value_chains.length > 0 ? formData.assigned_value_chains : null,
            is_active: formData.is_active,
          })
          .eq('id', user.id);

        if (error) throw error;
        
        toast({
          title: "User Updated",
          description: "User information has been successfully updated.",
        });
      } else {
        // Create new user - this would require admin privileges to create auth users
        // For now, we'll just show a message about the limitation
        toast({
          title: "Feature Limitation",
          description: "Creating new users requires additional setup for admin user creation via Supabase Auth API.",
          variant: "destructive",
        });
        return;
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-glass-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Update user information and assignments' : 'Create a new user account with role assignments'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="glass-card border-glass-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter full name"
                      className="glass-card border-glass-border"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 px-2 text-xs"
                      onClick={() => setFormData(prev => ({ ...prev, full_name: getRandomSampleName() }))}
                    >
                      Sample
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    className="glass-card border-glass-border"
                    disabled={!!user}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+254 700 000 000"
                  className="glass-card border-glass-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Role and Permissions */}
          <Card className="glass-card border-glass-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role and Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="glass-card border-glass-border">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-glass-border bg-background">
                    <SelectItem value="admin">
                      <div className="flex flex-col">
                        <span>Admin</span>
                        <span className="text-xs text-muted-foreground">Full system access</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="supervisor">
                      <div className="flex flex-col">
                        <span>Supervisor</span>
                        <span className="text-xs text-muted-foreground">Oversee trainers in constituency</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="trainer">
                      <div className="flex flex-col">
                        <span>Trainer</span>
                        <span className="text-xs text-muted-foreground">Conduct training sessions</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Account Active</Label>
              </div>
            </CardContent>
          </Card>

          {/* Location Assignment */}
          <Card className="glass-card border-glass-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="constituency">Constituency</Label>
                  <Select 
                    value={formData.constituency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, constituency: value }))}
                  >
                    <SelectTrigger className="glass-card border-glass-border">
                      <SelectValue placeholder="Select constituency" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-glass-border bg-background max-h-60">
                      {CONSTITUENCIES.map((constituency) => (
                        <SelectItem key={constituency} value={constituency}>
                          {formatConstituencyName(constituency)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward">Ward {formData.role === 'trainer' && '*'}</Label>
                  <Select 
                    value={formData.ward} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, ward: value }))}
                  >
                    <SelectTrigger className="glass-card border-glass-border">
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-glass-border bg-background max-h-60">
                      {MERU_WARDS.map((ward) => (
                        <SelectItem key={ward} value={ward}>
                          {ward}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value Chain Assignment - Only for trainers */}
          {formData.role === 'trainer' && (
            <Card className="glass-card border-glass-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Value Chain Assignment
                </CardTitle>
                <CardDescription>
                  Select the value chains this trainer will be responsible for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {VALUE_CHAINS.map((chain) => (
                    <div key={chain} className="flex items-center space-x-2">
                      <Checkbox
                        id={chain}
                        checked={formData.assigned_value_chains.includes(chain)}
                        onCheckedChange={(checked) => handleValueChainChange(chain, checked as boolean)}
                      />
                      <Label htmlFor={chain} className="cursor-pointer">
                        {formatValueChainName(chain)}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.assigned_value_chains.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {formData.assigned_value_chains.map((chain) => (
                      <Badge key={chain} variant="secondary" className="text-xs">
                        {formatValueChainName(chain)}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
