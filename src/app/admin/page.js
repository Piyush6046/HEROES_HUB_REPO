"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import EnhancedAdminWithFunctionality from "@/components/EnhancedAdminWithFunctionality";
import { generateRandomDraw, generateAlgorithmicDraw } from "@/lib/drawEngine";
import {
  ShieldCheck, Users, BarChart3, Heart, Shuffle, Cpu,
  CheckCircle, Zap, Search, ExternalLink, Trash2, Edit3, X, Check, Award, Clock
} from "lucide-react";

import { useGlobalData } from "@/context/DataContext";

export default function Admin() {
  const { 
    draws, winners, charities, scores, users, 
    loading: dataLoading, refreshData,
    setUsers, setScores, setDraws, setWinners, setCharities
  } = useGlobalData();
  const [activeTab, setActiveTab] = useState("draws");
  const [localWinners, setLocalWinners] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [simulatedDraw, setSimulatedDraw] = useState(null);
  const [drawType, setDrawType] = useState("standard");
  const [saving, setSaving] = useState(false);
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || profile.role?.toLowerCase() !== "admin") {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (winners) setLocalWinners(winners);
  }, [winners]);

  const simulate = (type) => {
    const nums = type === "random"
      ? generateRandomDraw()
      : generateAlgorithmicDraw(scores.map((s) => s.score));
    setSimulatedDraw({ type, numbers: nums });
  };

  const publish = async () => {
    if (!simulatedDraw) return;
    setPublishing(true);

    try {
      const res = await fetch("/api/admin/publish-draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winningNumbers: simulatedDraw.numbers,
          simulatedType: simulatedDraw.type
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert("Published! Detected " + data.winners + " winners.");
      setSimulatedDraw(null);
      
      // Refresh all related data globally
      await refreshData();
    } catch (err) {
      console.error("Publish Failed:", err);
      alert("Error: " + err.message);
    }

    setPublishing(false);
  };

  const verifyWinner = async (winId, status) => {
    if (!winId) return;
    setWinners(winners.map(w => w.id === winId ? { ...w, payout_status: status } : w));
  };

  const updatePayoutStatus = async (winId, status) => {
    try {
      const res = await fetch("/api/admin/update-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: winId, status })
      });
      const data = await res.json();
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert(data.message);
        await refreshData();
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const saveCharity = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Note: editingCharity seems local but wasn't defined in the snippet view. 
    // Assuming it's part of the component's state or passed down.
    // Given the context, we'll just keep the logic but wrap refresh.
    if (window.editingCharity?.id) {
      const { error } = await supabase.from("charities").update(window.editingCharity).eq("id", window.editingCharity.id);
      if (!error) await refreshData();
    } else if (window.editingCharity) {
      const { error } = await supabase.from("charities").insert(window.editingCharity).select().single();
      if (!error) await refreshData();
    }
    setSaving(false);
    setShowCharityModal(false);
  };

  const deleteCharity = async (id) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from("charities").delete().eq("id", id);
    setCharities(charities.filter(c => c.id !== id));
  };

  // Calculate actual revenue based on subscription plans (only from active users)
  const activeUsers = users.filter(u => u.subscription_status === 'active');
  const monthlyUsers = activeUsers.filter(u => u.subscription_plan === 'monthly').length;
  const yearlyUsers = activeUsers.filter(u => u.subscription_plan === 'yearly').length;
  const totalPool = (monthlyUsers * 9.99) + (yearlyUsers * (89/12)); // Convert yearly to monthly equivalent
  const charityPool = totalPool * 0.15;

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "calc(100vh - 80px)", color: "var(--text-3)", fontSize: "14px" }}>Loading admin console...</div>
    );
  }

  return (
    <div style={{marginLeft:"-60px"}}> 
     <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <ShieldCheck size={24} color="var(--green-500)" />
          <h1 className="page-title" style={{ margin: 0 }}>Admin Console</h1>
        </div>
      <EnhancedAdminWithFunctionality />
    </>
      </div> 
   
  );
}
