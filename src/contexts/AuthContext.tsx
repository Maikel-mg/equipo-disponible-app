
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

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to prevent potential recursion issues
          setTimeout(async () => {
            try {
              console.log('Fetching user profile for:', session.user.id);
              
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching profile:', error);
                
                // If profile doesn't exist, create it
                if (error.code === 'PGRST116') {
                  console.log('Profile not found, creating one...');
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([{
                      id: session.user.id,
                      email: session.user.email || '',
                      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
                      role: 'empleado' as const,
                      vacation_days_balance: 22,
                      sick_days_balance: 3,
                    }])
                    .select()
                    .single();
                  
                  if (createError) {
                    console.error('Error creating profile:', createError);
                  } else {
                    console.log('Profile created successfully:', newProfile);
                    setUser(newProfile as AppUser);
                  }
                }
              } else {
                console.log('Profile fetched successfully:', profile);
                const typedProfile: AppUser = {
                  ...profile,
                  role: profile.role as 'empleado' | 'responsable' | 'rrhh'
                };
                setUser(typedProfile);
              }
            } catch (err) {
              console.error('Unexpected error in auth handler:', err);
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    console.log('Logging out...');
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
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

  console.log('AuthContext render:', { user: user?.email, loading, isAuthenticated: !!user && !!session });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
