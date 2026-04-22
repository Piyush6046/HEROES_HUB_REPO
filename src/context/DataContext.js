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
  const lastFetchTime = useRef(0);
  const prevRoleRef = useRef(null);
  const FETCH_COOLDOWN = 5000; // 5 seconds minimum between auto-refreshes

  // Specialized setters for optimistic updates
  const setScores = useCallback((scores) => setData(prev => ({ ...prev, scores })), []);
  const setWinners = useCallback((winners) => setData(prev => ({ ...prev, winners })), []);

  const refreshData = useCallback(async (force = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    const now = Date.now();
    const roleChanged = prevRoleRef.current !== role;

    // Avoid double fetching or spamming fetches on tab focus, UNLESS forced or role changed
    if (fetchingRef.current && !force && !roleChanged) return;
    if (!force && !roleChanged && (now - lastFetchTime.current < FETCH_COOLDOWN)) return;

    fetchingRef.current = true;
    prevRoleRef.current = role;
    
    // Only set global loading to true if we have NO data at all (initial load)
    const isInitialLoad = !data.profile && data.scores.length === 0;
    if (isInitialLoad) setLoading(true);

    try {
      const isAdmin = role?.toLowerCase() === "admin";
      
      const queries = [
        // Admins fetch ALL scores for the draw engine, regular users only fetch their own
        isAdmin 
          ? supabase.from("scores").select("*").order("date_played", { ascending: false }).order("created_at", { ascending: false }).limit(2000)
          : supabase.from("scores").select("*").eq("user_id", user.id).order("date_played", { ascending: false }).order("created_at", { ascending: false }),
        
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("draws").select("*").order("created_at", { ascending: false }), // Sort by creation date
        supabase.from("charities").select("*"),
        supabase.from("winners").select("*, draws(month_year), profiles(*)").eq("user_id", user.id).order("created_at", { ascending: false })
      ];

      if (isAdmin) {
        queries.push(supabase.from("profiles").select("*").limit(500));
        queries.push(supabase.from("winners").select("*, draws(month_year), profiles(*)").order("created_at", { ascending: false }).limit(200));
      }

      const results = await Promise.all(queries);
      console.log("Fetch Complete. Admin:", isAdmin, "Results Count:", results.length);
      
      const scoresRes = results[0];
      const profileRes = results[1];
      const drawsRes = results[2];
      const charitiesRes = results[3];
      const userWinnersRes = results[4];
      
      let allUsers = [];
      let allWinners = userWinnersRes.data || [];

      // If admin, the extra queries are at index 5 and 6
      if (isAdmin && results.length > 5) {
        allUsers = results[5].data || [];
        allWinners = results[6].data || [];
        console.log("Admin Data Loaded. Users:", allUsers.length, "Winners:", allWinners.length);
      }

      setData(prev => ({
        scores: scoresRes.data || prev.scores,
        profile: profileRes.data || prev.profile,
        draws: drawsRes.data || prev.draws,
        charities: charitiesRes.data || prev.charities,
        winners: allWinners,
        users: allUsers
      }));

      lastFetchTime.current = Date.now();
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user, role, data.profile, data.scores.length]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setLoading(false);
      setData({ scores: [], draws: [], charities: [], winners: [], users: [], profile: null });
      prevRoleRef.current = null;
    }
  }, [user, role, refreshData]);

  const value = useMemo(() => ({
    ...data,
    loading,
    refreshData,
    setScores,
    setWinners
  }), [data, loading, refreshData, setScores, setWinners]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useGlobalData = () => useContext(DataContext);
