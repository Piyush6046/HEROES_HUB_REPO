"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function syncSession(session) {
      if (!mounted) return;
      const currentUser = session?.user ?? null;

      if (!currentUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // Optimization: Only update state if user ID changed or this is the first initialization
      // This prevents redundant re-renders on tab focus / token refresh
      setUser(prev => {
        if (prev?.id === currentUser.id) return prev;
        return currentUser;
      });

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .maybeSingle();
        
        if (mounted) {
          const newRole = profile?.role || "user";
          setRole(prev => (prev === newRole ? prev : newRole));
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        syncSession(session);
        initialized.current = true;
      }
    });

    // Listen for changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      // If it's just a token refresh and we already have a user, don't trigger a hard reload
      if (event === 'TOKEN_REFRESHED' && initialized.current) {
        return; 
      }

      syncSession(session);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
