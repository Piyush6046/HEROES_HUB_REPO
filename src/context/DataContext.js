"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user, role } = useAuth();
  const [data, setData] = useState({
    scores: [],
    draws: [],
    charities: [],
    winners: [],
    users: [],
    profile: null
  });
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  // Manual setters for specific data updates (used in Admin actions)
  const setScores = (scores) => setData(prev => ({ ...prev, scores }));
  const setWinners = (winners) => setData(prev => ({ ...prev, winners }));
  const setDraws = (draws) => setData(prev => ({ ...prev, draws }));
  const setCharities = (charities) => setData(prev => ({ ...prev, charities }));
  const setUsers = (users) => setData(prev => ({ ...prev, users }));

  const refreshData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    // Prevent duplicate concurrent fetches (React Strict Mode double-invoke guard)
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    // Only show loading spinner on initial load to avoid UI flickers on tab focus/refresh
    const isInitialLoad = !data.profile;
    if (isInitialLoad) setLoading(true);
    
    try {
      const queryList = [
        supabase.from("scores").select("*").eq("user_id", user.id).order("date_played", { ascending: false }),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("draws").select("*").order("month_year", { ascending: false }),
        supabase.from("charities").select("*"),
        supabase.from("winners").select("*, draws(month_year), profiles(*)").eq("user_id", user.id).order("created_at", { ascending: false })
      ];

      if (role?.toLowerCase() === "admin") {
        queryList.push(supabase.from("profiles").select("*"));
        queryList.push(supabase.from("winners").select("*, draws(month_year), profiles(*)").order("created_at", { ascending: false }));
      }

      const results = await Promise.all(queryList);
      results.forEach((res, i) => {
        if (res.error) console.warn(`Global Data Query ${i} failed:`, res.error);
      });

      const s = results[0].data;
      const p = results[1].data;
      const d = results[2].data;
      const c = results[3].data;
      const userWinners = results[4].data;
      let allUsers = [];
      let allWinners = userWinners || [];

      if (role?.toLowerCase() === "admin" && results.length > 5) {
        allUsers = results[5].data || [];
        allWinners = results[6].data || [];
      }

      setData({
        scores: s || [],
        profile: p,
        draws: d || [],
        charities: c || [],
        winners: allWinners,
        users: allUsers
      });
    } catch (err) {
      console.error("Data refresh critical failure:", err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user, role]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setLoading(false);
      setData({ scores: [], draws: [], charities: [], winners: [], users: [], profile: null });
    }
  }, [user, role]);

  const contextValue = useMemo(() => ({
    ...data, 
    loading, 
    refreshData,
    setScores,
    setWinners,
    setDraws,
    setCharities,
    setUsers
  }), [data, loading, refreshData]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export const useGlobalData = () => useContext(DataContext);
