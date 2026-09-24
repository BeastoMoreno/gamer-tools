'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { browserAuth } from '@/lib/supabase/client';
import { authConfigured } from '@/lib/supabase/config';
type AuthState = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  error: string;
  signOut: () => Promise<boolean>;
};
const Context = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const client = browserAuth();
    let alive = true;
    let revision = 0;
    if (!client) {
      const frame = requestAnimationFrame(() => setLoading(false));
      return () => cancelAnimationFrame(frame);
    }
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event !== 'INITIAL_SESSION') revision++;
      if (alive) {
        setUser(session?.user || null);
        if (event !== 'INITIAL_SESSION') {
          setError('');
          setLoading(false);
        }
      }
    });
    void client.auth
      .getUser()
      .then(({ data, error: authError }) => {
        if (alive) {
          if (!revision) setUser(data.user);
          if (authError && authError.name !== 'AuthSessionMissingError')
            setError('Your session could not be verified. Try signing in again.');
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setLoading(false);
          setError('Could not connect to accounts. Please try again.');
        }
      });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);
  const signOut = async () => {
    const client = browserAuth();
    if (!client) return false;
    try {
      const { error: authError } = await client.auth.signOut({ scope: 'local' });
      if (authError) throw authError;
      setUser(null);
      setError('');
      return true;
    } catch {
      setError('Sign out could not finish. Check your connection and try again.');
      return false;
    }
  };
  return (
    <Context.Provider value={{ user, loading, configured: authConfigured, error, signOut }}>
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('AuthProvider is required');
  return value;
}
