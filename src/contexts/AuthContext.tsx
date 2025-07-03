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
        .insert([
          {
            id: authUser.id,
            email: authUser.email || '',
            name:
              authUser.user_metadata?.name ||
              authUser.email?.split('@')[0] ||
              'Usuario',
            role: 'empleado' as const,
            vacation_days_balance: 22,
            sick_days_balance: 3,
          },
        ])
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
        role: profile.role as 'empleado' | 'responsable' | 'rrhh',
      } as AppUser;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    console.log('Initializing auth context...');

    const initializeAuth = async () => {
      try {
        try {
          // Get initial session
          const {
            data: { session: initialSession },
          } = await supabase.auth.getSession();
          console.log(
            'Initial session:',
            initialSession?.user?.email || 'No session'
          );

          if (initialSession?.user) {
            const profile = await fetchUserProfile(initialSession.user);
            if (profile) {
              setUser(profile);
              setSession(initialSession);
            } else {
              console.error(
                'Profile fetch failed during init, clearing session.'
              );
              setUser(null);
              setSession(null);
            }
          } else {
            // No initial user in session, ensure state is cleared if it wasn't already
            setUser(null);
            setSession(null);
          }
        } catch (error) {
          console.error('Error during initial auth sequence:', error);
          // Ensure clean state on error during the auth sequence
          setUser(null);
          setSession(null);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        // This outer catch is for unexpected errors in the try/finally itself,
        // though it's unlikely to be hit if finally does its job.
        console.error('Outer error initializing auth:', error);
        setLoading(false); // Defensive: ensure loading is false
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(
        'Auth state changed:',
        event,
        newSession?.user?.email || 'No session'
      );

      setLoading(true);

      // Envuelve la lógica en una función async para evitar hacer el callback async
      const handleAuth = async () => {
        try {
          setSession(newSession);
          if (newSession?.user) {
            const profile = await fetchUserProfile(newSession.user);
            if (profile) {
              setUser(profile);
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in onAuthStateChange handler:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

      handleAuth(); // Llama a la función async
    });

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    console.log('Logging out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Log the error from Supabase, but we'll still clear local state in finally
        console.error('Error during Supabase sign out:', error);
      }
    } catch (err) {
      // Log any other unexpected errors during logout
      console.error('Unexpected error logging out:', err);
    } finally {
      // Ensure local user and session are cleared regardless of errors
      setUser(null);
      setSession(null);
      console.log('Local user and session cleared.');
    }
  };

  const updateAuthUser = (data: Partial<AppUser>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
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
    isAuthenticated: !!user && !!session,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
