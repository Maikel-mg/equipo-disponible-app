
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { User as AppUser } from '@/models/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateAuthUser: (data: Partial<AppUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserProfile = async (authUser: User) => {
    try {
      console.log('Creating user profile for:', authUser.id);
      
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([{
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
          role: 'empleado' as const,
          vacation_days_balance: 22,
          sick_days_balance: 3,
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }
      
      console.log('Profile created successfully:', newProfile);
      return newProfile as AppUser;
    } catch (err) {
      console.error('Unexpected error creating profile:', err);
      return null;
    }
  };

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log('Fetching user profile for:', authUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          return await createUserProfile(authUser);
        }
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile fetched successfully:', profile);
      return {
        ...profile,
        role: profile.role as 'empleado' | 'responsable' | 'rrhh'
      } as AppUser;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    let isProcessing = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (isProcessing) {
          console.log('Already processing auth change, skipping...');
          return;
        }
        
        isProcessing = true;
        setSession(session);
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
        
        setLoading(false);
        isProcessing = false;
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.email);
        
        if (!session) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    console.log('Logging out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const updateAuthUser = (data: Partial<AppUser>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const value = {
    user,
    session,
    loading,
    logout,
    isAuthenticated: !!user && !!session,
    updateAuthUser,
  };

  console.log('AuthContext state:', { 
    hasUser: !!user, 
    userEmail: user?.email, 
    loading, 
    isAuthenticated: !!user && !!session 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
