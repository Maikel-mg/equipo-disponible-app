
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile from database
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            // Type assertion to ensure role is correctly typed
            const typedProfile: AppUser = {
              ...profile,
              role: profile.role as 'empleado' | 'responsable' | 'rrhh'
            };
            setUser(typedProfile);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // This will trigger the auth state change listener above
        setSession(session);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
