import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }

    return profile ?? null;
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Always settle loading based on getSession() result.
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          if (mounted) {
            setUser(null);
            setUserProfile(null);
          }
          return;
        }

        if (mounted) setUser(session.user);

        // Profile fetch should not prevent route gating from resolving.
        // So we fetch profile, but even if it fails, we keep the loading state settled.
        fetchProfile(session.user.id)
          .then((profile) => {
            if (mounted) setUserProfile(profile);
          })
          .catch((e) => {
            console.error('Auth init profile fetch error:', e);
            if (mounted) setUserProfile(null);
          });
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      // Settle route gating immediately; profile can load in background.
      setLoading(false);

      // Avoid async Supabase calls directly in auth callback.
      setTimeout(() => {
        fetchProfile(session.user.id)
          .then((profile) => {
            if (mounted) setUserProfile(profile);
          })
          .catch((err) => {
            console.error('Auth change profile fetch error:', err);
            if (mounted) setUserProfile(null);
          });
      }, 0);
    });

    return () => {
      mounted = false;
      if (subscription && subscription.subscription && subscription.subscription.unsubscribe) {
        subscription.subscription.unsubscribe();
      } else if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const value = useMemo(
    () => ({ user, userProfile, loading, signIn, signOut }),
    [user, userProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

