"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        let newRole = null;
        if (currentUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();
          newRole = profile?.role || "user";
        }
        setUser(currentUser);
        setRole(newRole);
      } catch (err) {
        console.error("Auth context error:", err);
      } finally {
        setLoading(false);
      }
    }

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        let newRole = null;

        if (currentUser) {
          const { data: p } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single();
          newRole = p?.role || "user";
        }

        // Batch updates to minimize re-renders
        setUser(prev => (prev?.id === currentUser?.id ? prev : currentUser));
        setRole(prev => (prev === newRole ? prev : newRole));
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
