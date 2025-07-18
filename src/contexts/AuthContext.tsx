import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ValueChain = 'banana' | 'avocado' | 'dairy' | 'irish_potato' | 'coffee';
type Constituency = 'igembe_south' | 'igembe_central' | 'igembe_north' | 'tigania_west' | 'tigania_east' | 'north_imenti' | 'buuri' | 'central_imenti' | 'south_imenti';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'trainer' | 'supervisor';
  is_active: boolean;
  constituency?: Constituency;
  ward?: string;
  assigned_value_chains?: ValueChain[];
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        return { error: null };
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role = 'trainer') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
        return { error: null };
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Reset Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Refresh profile data
      await fetchProfile(user.id);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};