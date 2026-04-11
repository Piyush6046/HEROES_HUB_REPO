"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState({
    scores: [],
    draws: [],
    charities: [],
    winners: [],
    users: [],
    profile: null
  });
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!user) return;
    
    try {
      const [
        { data: s }, 
        { data: p }, 
        { data: d }, 
        { data: c }, 
        { data: w },
        { data: u }
      ] = await Promise.all([
        supabase.from("scores").select("*").eq("user_id", user.id).order("date_played", { ascending: false }),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("draws").select("*").order("month_year", { ascending: false }),
        supabase.from("charities").select("*"),
        supabase.from("winners").select("*, draws(month_year), profiles(*)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*")
      ]);

      setData({
        scores: s || [],
        profile: p,
        draws: d || [],
        charities: c || [],
        winners: w || [],
        users: u || []
      });
    } catch (err) {
      console.error("Data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      refreshData();
    } else {
      setLoading(false);
    }
  }, [user, refreshData]);

  return (
    <DataContext.Provider value={{ ...data, loading, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useGlobalData = () => useContext(DataContext);
