
import React, { useState } from 'react';
import { 
  Calendar, Users, BarChart3, Settings, Menu, X, 
  Home, BookOpen, Camera, FileText, UserCheck, 
  MapPin, Bell, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  roles?: string[];
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Training Sessions', href: '/training' },
  { icon: BookOpen, label: 'Modules', href: '/modules', roles: ['admin', 'trainer'] },
  { icon: Users, label: 'User Management', href: '/admin/users', roles: ['admin'] },
  { icon: UserCheck, label: 'Attendance', href: '/attendance' },
  { icon: Camera, label: 'Photos', href: '/photos' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: MapPin, label: 'Locations', href: '/locations', roles: ['admin'] },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export const MobileNavigation = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = NAVIGATION_ITEMS.filter(item => 
    !item.roles || item.roles.includes(profile?.role || 'trainer')
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <span className="text-sm font-bold">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">MeruTrack</h1>
              <p className="text-xs text-slate-600 capitalize">{profile?.role || 'Trainer'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="bg-white/80 border-white/40 hover:bg-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white/90 backdrop-blur-md border-r border-white/20 shadow-xl z-40">
        <div className="flex flex-col w-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <span className="text-lg font-bold">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">MeruTrack</h1>
                <p className="text-sm text-slate-600">Training Management</p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-sm">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-600 capitalize">
                  {profile?.role || 'Trainer'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-emerald-100 text-emerald-700 shadow-sm"
                        : "text-slate-600 hover:bg-white/80 hover:text-slate-800"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="bg-coral-100 text-coral-800 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Help */}
          <div className="p-4 border-t border-white/20">
            <Link
              to="/help"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-800 transition-all duration-200"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help & Support</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={toggleSidebar} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-lg shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <span className="text-lg font-bold">M</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">MeruTrack</h1>
                    <p className="text-sm text-slate-600">Training Management</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSidebar}
                  className="bg-white/80 border-white/40 hover:bg-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Profile */}
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-semibold">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-slate-600 capitalize">
                      {profile?.role || 'Trainer'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={toggleSidebar}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-emerald-100 text-emerald-700 shadow-sm"
                            : "text-slate-600 hover:bg-white/80 hover:text-slate-800"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="bg-coral-100 text-coral-800">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/20">
                <Link
                  to="/help"
                  onClick={toggleSidebar}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-800 transition-all duration-200"
                >
                  <HelpCircle className="w-6 h-6" />
                  <span>Help & Support</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Spacer for Mobile */}
      <div className="lg:hidden h-16" />
      {/* Content Spacer for Desktop */}
      <div className="hidden lg:block w-64" />
    </>
  );
};
