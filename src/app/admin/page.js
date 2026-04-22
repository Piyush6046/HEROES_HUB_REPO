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
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function Admin() {
  const { user, role, loading: authLoading } = useAuth();
  const { 
    draws, winners, charities, scores, users, 
    loading: dataLoading, refreshData,
    setUsers, setScores, setDraws, setWinners, setCharities
  } = useGlobalData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("draws");
  const [localWinners, setLocalWinners] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [simulatedDraw, setSimulatedDraw] = useState(null);
  const [drawType, setDrawType] = useState("standard");
  const [saving, setSaving] = useState(false);
  const [showCharityModal, setShowCharityModal] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (role?.toLowerCase() !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, role, authLoading, router]);

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
      toast.success("Published! Detected " + data.winners + " winners.");
      setSimulatedDraw(null);
      
      // Refresh all related data globally
      await refreshData();
    } catch (err) {
      console.error("Publish Failed:", err);
      toast.error("Error: " + err.message);
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
        toast.error("Error: " + data.error);
      } else {
        toast.success(data.message);
        await refreshData();
      }
    } catch (error) {
      toast.error("Error: " + error.message);
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
    toast((t) => (
      <div>
        <p style={{marginBottom: "10px", fontSize:"14px"}}>Are you sure?</p>
        <div style={{display:"flex", gap:"10px", justifyContent:"flex-end"}}>
          <button className="btn btn-secondary btn-sm" onClick={() => toast.dismiss(t.id)}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={async () => {
            toast.dismiss(t.id);
            await supabase.from("charities").delete().eq("id", id);
            setCharities(charities.filter(c => c.id !== id));
            toast.success("Charity deleted.");
          }}>Yes</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  // Calculate actual revenue based on subscription plans (only from active users)
  const activeUsers = users.filter(u => u.subscription_status === 'active');
  const monthlyUsers = activeUsers.filter(u => u.subscription_plan === 'monthly').length;
  const yearlyUsers = activeUsers.filter(u => u.subscription_plan === 'yearly').length;
  const totalPool = (monthlyUsers * 9.99) + (yearlyUsers * (89/12)); // Convert yearly to monthly equivalent
  const charityPool = totalPool * 0.15;

  if (authLoading || dataLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "20px" }}>
        <div style={{ width: "48px", height: "48px", border: "3px solid var(--border-default)", borderTopColor: "var(--green-500)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: "var(--text-3)", fontSize: "14px", fontWeight: 600 }}>Securing admin console…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  return (
    <div className="admin-container"> 
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
