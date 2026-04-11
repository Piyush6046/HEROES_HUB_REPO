import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users, DollarSign, TrendingUp, Activity, Calendar,
  Trophy, Heart, Zap, BarChart3, CheckCircle, Clock, X,
  Download, Filter, Search, ChevronDown, ChevronUp, Eye, Edit, Trash2,
  Award, Target, Globe, Settings, Bell, Mail, Phone, MapPin, Plus, Star,
  ShieldCheck, Shuffle, Cpu, ExternalLink, Edit3
} from "lucide-react";
import { generateRandomDraw, generateAlgorithmicDraw } from "@/lib/drawEngine";

export default function EnhancedAdminWithFunctionality() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [simulatedDraw, setSimulatedDraw] = useState(null);
  const [drawType, setDrawType] = useState("standard");
  const [editingCharity, setEditingCharity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Filters State
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userPlanFilter, setUserPlanFilter] = useState("all");
  const [userSortBy, setUserSortBy] = useState("name");
  
  const [winnerStatusFilter, setWinnerStatusFilter] = useState("all");
  const [winnerTierFilter, setWinnerTierFilter] = useState("all");
  const [winnerSortBy, setWinnerSortBy] = useState("recent");
  
  const [charityCategoryFilter, setCharityCategoryFilter] = useState("all");
  const [charityStatusFilter, setCharityStatusFilter] = useState("all");
  const [charitySortBy, setCharitySortBy] = useState("name");
  const [searchWinner, setSearchWinner] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [{ data: u }, { data: s }, { data: d }, { data: w }, { data: c }] = await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("scores").select("score, user_id").order("date_played", { ascending: false }),
          supabase.from("draws").select("*").order("month_year", { ascending: false }),
          supabase.from("winners").select("*, draws(month_year), profiles(*)").order("created_at", { ascending: false }),
          supabase.from("charities").select("*").order("name", { ascending: true })
        ]);
        setUsers(u || []);
        setScores(s || []);
        setDraws(d || []);
        setWinners(w || []);
        setCharities(c || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate metrics
  const activeUsers = users.filter(u => u.subscription_status === 'active');
  const monthlyUsers = activeUsers.filter(u => u.subscription_plan === 'monthly');
  const yearlyUsers = activeUsers.filter(u => u.subscription_plan === 'yearly');
  const totalPool = (monthlyUsers.length * 9.99) + (yearlyUsers.length * (89/12));
  const charityPool = totalPool * 0.15;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = userStatusFilter === "all" || user.subscription_status === userStatusFilter;
    const matchesPlan = userPlanFilter === "all" || user.subscription_plan === userPlanFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  }).sort((a, b) => {
    if (userSortBy === "name") return (a.full_name || "").localeCompare(b.full_name || "");
    if (userSortBy === "recent") return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const filteredWinners = winners.filter(winner => {
    const matchesSearch = winner.profiles?.full_name?.toLowerCase().includes(searchWinner.toLowerCase()) || 
                          winner.profiles?.email?.toLowerCase().includes(searchWinner.toLowerCase());
    const matchesStatus = winnerStatusFilter === "all" || winner.payout_status === winnerStatusFilter;
    const matchesTier = winnerTierFilter === "all" || winner.match_type === winnerTierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  }).sort((a, b) => {
    if (winnerSortBy === "recent") return new Date(b.created_at) - new Date(a.created_at);
    if (winnerSortBy === "amount") return (b.prize_amount || 0) - (a.prize_amount || 0);
    return 0;
  });

  const filteredCharities = charities.filter(charity => {
    const matchesSearch = charity.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          charity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = charityCategoryFilter === "all" || charity.category === charityCategoryFilter;
    const matchesFeatured = charityStatusFilter === "all" || 
                            (charityStatusFilter === "featured" ? charity.is_featured : !charity.is_featured);
    return matchesSearch && matchesCategory && matchesFeatured;
  }).sort((a, b) => {
    if (charitySortBy === "name") return a.name.localeCompare(b.name);
    if (charitySortBy === "featured") return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    return 0;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#10b981";
      case "pending": return "#f59e0b";
      case "past_due": return "#ef4444";
      case "cancelled": return "#6b7280";
      default: return "#6b7280";
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "5-Match": return "#10b981";
      case "4-Match": return "#fbbf24";
      case "3-Match": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  // Original admin functionality
  const simulate = (type) => {
    const nums = type === "standard"
      ? generateRandomDraw()
      : generateAlgorithmicDraw(scores.map((s) => s.score));
    setSimulatedDraw({ type, numbers: nums, pool: totalPool });
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
      // Refresh data
      const [{ data: u }, { data: s }, { data: d }, { data: w }, { data: c }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("scores").select("score, user_id"),
        supabase.from("draws").select("*").order("month_year", { ascending: false }),
        supabase.from("winners").select("*, draws(month_year), profiles(*)").order("payout_status", { ascending: false }),
        supabase.from("charities").select("*"),
      ]);
      setUsers(u || []);
      setScores(s || []);
      setDraws(d || []);
      setWinners(w || []);
      setCharities(c || []);
      setLoading(false);
    } catch (err) {
      console.error("Publish Failed:", err);
      alert("Error: " + err.message);
    }

    setPublishing(false);
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
        // Optimistic UI update for instant feedback
        setWinners(prev => prev.map(w => w.id === winId ? { ...w, payout_status: status } : w));
        
        // Background sync to ensure data integrity
        const { data: w } = await supabase
          .from("winners")
          .select("*, draws(month_year), profiles(*)")
          .order("created_at", { ascending: false });
        if (w) setWinners(w);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const saveCharity = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Clean up the object to only include columns that exist in the database
    const { name, category, description, logo_url, website_url, is_featured, id } = editingCharity;
    const charityData = { name, category, description, logo_url, website_url, is_featured };

    try {
      if (id) {
        const { error } = await supabase
          .from("charities")
          .update(charityData)
          .eq("id", id);
        
        if (error) throw error;
        setCharities(charities.map(c => c.id === id ? { ...c, ...charityData } : c));
        alert("Charity updated successfully!");
      } else {
        const { data, error } = await supabase
          .from("charities")
          .insert([charityData])
          .select()
          .single();
        
        if (error) throw error;
        setCharities([...charities, data]);
        alert("Charity added successfully!");
      }
      setShowCharityModal(false);
    } catch (err) {
      console.error("Save Error:", err);
      alert("Error saving charity: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCharity = async (id) => {
    if (!confirm("Are you sure? This will remove the charity from the platform.")) return;
    const { error } = await supabase.from("charities").delete().eq("id", id);
    if (error) {
      alert("Error deleting charity: " + error.message);
    } else {
      setCharities(charities.filter(c => c.id !== id));
      alert("Charity deleted successfully.");
    }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action is permanent.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      alert("Error deleting user: " + error.message);
    } else {
      setUsers(users.filter(u => u.id !== id));
      alert("User removed successfully.");
    }
  };

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return alert("No data to export");
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = row[header];
        return `"${val !== null && val !== undefined ? String(val).replace(/"/g, '""') : ''}"`;
      }).join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>
        <div className="animate-spin" style={{ width: "32px", height: "32px", margin: "0 auto 16px", border: "3px solid var(--blue-500)", borderTop: "3px solid transparent", borderRadius: "50%" }}></div>
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Quick Stats Banner (Only on Overview) */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-0)", letterSpacing: "-1px" }}>
              Admin Console
            </h1>
            <p style={{ color: "var(--text-3)", fontSize: "16px", marginTop: "4px" }}>
              Comprehensive overview of platform performance and growth
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-ghost" style={{ gap: "8px" }} onClick={() => alert("Checking platform status...")}>
              <Activity size={16} /> System Health
            </button>
            <button className="btn btn-primary" style={{ gap: "8px" }} onClick={() => alert("Notification center opened.")}>
              <Bell size={16} /> Notifications
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", borderBottom: "1px solid var(--border-default)", paddingBottom: "2px" }}>
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "users", label: "Users", icon: Users },
          { id: "draws", label: "Draws", icon: Trophy },
          { id: "winners", label: "Winners", icon: Award },
          { id: "charities", label: "Charities", icon: Heart },
          { id: "analytics", label: "Analytics", icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-ghost ${activeTab === tab.id ? "active" : ""}`}
            style={{
              gap: "8px",
              borderBottom: activeTab === tab.id ? "2px solid var(--blue-500)" : "none",
              borderRadius: "0 0 0 0",
              height: "44px",
              padding: "0 20px"
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subtab Header Standardizer */}
      {(activeTab !== "overview" && activeTab !== "analytics") && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-0)" }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h3>
            <p style={{ color: "var(--text-3)", fontSize: "14px", marginTop: "4px" }}>
              {activeTab === 'users' && "Manage platform members, subscriptions and activity"}
              {activeTab === 'winners' && "Process prize payouts and verify winning claims"}
              {activeTab === 'draws' && "Configure and execute monthly prize draws"}
              {activeTab === 'charities' && "Manage partner charities and their impact goals"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {activeTab === 'users' && (
              <button 
                className="btn btn-primary" 
                style={{ gap: "8px" }}
                onClick={() => alert("Add User feature coming soon! Currently managed via Auth.")}
              >
                <Plus size={16} /> Add User
              </button>
            )}
            {activeTab === 'winners' && (
              <button 
                className="btn btn-primary" 
                style={{ gap: "8px" }}
                onClick={() => {
                  const pending = winners.filter(w => w.payout_status === 'pending');
                  if (pending.length === 0) return alert("No pending winners to process.");
                  if (confirm(`Process all ${pending.length} pending winners?`)) {
                    pending.forEach(async (w) => await updatePayoutStatus(w.id, "processing"));
                  }
                }}
              >
                <Zap size={16} /> Process All Pending
              </button>
            )}
            {activeTab === 'charities' && (
              <button 
                onClick={() => {
                  setEditingCharity({
                    name: "",
                    description: "",
                    logo_url: "",
                    website_url: "",
                    category: "",
                    is_featured: false,
                    mission_statement: "",
                    impact_area: ""
                  });
                  setShowCharityModal(true);
                }} 
                className="btn btn-primary" 
                style={{ gap: "8px" }}
              >
                <Plus size={16} /> Add Charity
              </button>
            )}
            <button 
              className="btn btn-ghost" 
              style={{ gap: "8px" }}
              onClick={() => {
                const dataToExport = activeTab === 'users' ? users : 
                                    activeTab === 'winners' ? winners : 
                                    activeTab === 'draws' ? draws : charities;
                downloadCSV(dataToExport, activeTab);
              }}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="animate-fade-up">
          {/* Key Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
            <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), var(--bg-surface))", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div className="stat-card-icon" style={{ background: "rgba(16,185,129,0.2)" }}>
                <Users size={24} color="#10b981" />
              </div>
              <div className="stat-card-value">{users.length}</div>
              <div className="stat-card-label">Total Users</div>
              <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
                {activeUsers.length} active
              </div>
            </div>

            <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), var(--bg-surface))", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div className="stat-card-icon" style={{ background: "rgba(59,130,246,0.2)" }}>
                <DollarSign size={24} color="#3b82f6" />
              </div>
              <div className="stat-card-value">{formatCurrency(totalPool)}</div>
              <div className="stat-card-label">Monthly Revenue</div>
              <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
                {monthlyUsers.length} monthly, {yearlyUsers.length} yearly
              </div>
            </div>

            <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.1), var(--bg-surface))", border: "1px solid rgba(244,63,94,0.2)" }}>
              <div className="stat-card-icon" style={{ background: "rgba(244,63,94,0.2)" }}>
                <Heart size={24} color="#f43f5e" />
              </div>
              <div className="stat-card-value">{formatCurrency(charityPool)}</div>
              <div className="stat-card-label">Charity Pool</div>
              <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
                15% of revenue
              </div>
            </div>

            <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.1), var(--bg-surface))", border: "1px solid rgba(251,191,36,0.2)" }}>
              <div className="stat-card-icon" style={{ background: "rgba(251,191,36,0.2)" }}>
                <Trophy size={24} color="#fbbf24" />
              </div>
              <div className="stat-card-value">{winners.length}</div>
              <div className="stat-card-label">Total Winners</div>
              <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
                {winners.filter(w => w.payout_status === 'pending').length} pending
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="card">
              <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>Recent Users</h3>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {users.slice(0, 5).map(user => (
                  <div key={user.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontWeight: 600 }}>
                      {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
                        {user.full_name || user.email?.split("@")[0]}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                        {user.email}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", color: getStatusColor(user.subscription_status), fontWeight: 600 }}>
                        {user.subscription_status}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-3)" }}>
                        {user.subscription_plan}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>Recent Winners</h3>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {winners.slice(0, 5).map(winner => (
                  <div key={winner.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: getTierColor(winner.match_type) + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trophy size={20} color={getTierColor(winner.match_type)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
                        {winner.profiles?.full_name || "Unknown User"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                        {winner.draws?.month_year} - {winner.match_type}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: getTierColor(winner.match_type) }}>
                        {formatCurrency(winner.prize_amount)}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-3)" }}>
                        {winner.payout_status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draws Tab - Enhanced UI */}
      {activeTab === "draws" && (
        <div className="animate-fade-up">
          {/* Draw Stats */}
          <div className="grid-4 mb-6">
            {[
              { label: "Total Draws", val: draws.length, icon: Trophy, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
              { label: "Standard", val: draws.filter(d => d.draw_type === 'standard').length, icon: Shuffle, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
              { label: "Algorithmic", val: draws.filter(d => d.draw_type === 'algorithmic').length, icon: Cpu, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
              { label: "Completed", val: draws.filter(d => d.status === 'completed').length, icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)" }
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
                <div className="stat-card-value">{s.val}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "24px" }}>
            <div className="card">
              <h3 style={{ fontSize: "18px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Zap size={20} color="var(--gold-400)" /> Execute New Draw
              </h3>
              
              <div style={{ marginBottom: "24px" }}>
                <label className="label">Configuration Profile</label>
                <select className="input" value={drawType} onChange={e => setDrawType(e.target.value)}>
                  <option value="standard">Standard Monthly Prize Draw</option>
                  <option value="algorithmic">Dynamic Engagement Draw (Algorithmic)</option>
                </select>
                <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "8px" }}>
                  {drawType === 'standard' 
                    ? "Uses pure random seed for number generation. Fair and consistent." 
                    : "Weights selection based on user score frequency and consistency."}
                </p>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label className="label">Simulated Numbers</label>
                <div style={{ display: "flex", gap: "10px", padding: "16px", background: "var(--bg-raised)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                  {simulatedDraw ? simulatedDraw.numbers.map((n, i) => (
                    <div key={i} className="draw-ball sm" style={{ width: "40px", height: "40px", fontSize: "16px", background: "var(--blue-500)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {n}
                    </div>
                  )) : (
                    <div style={{ color: "var(--text-3)", fontSize: "14px", fontStyle: "italic", textAlign: "center", width: "100%" }}>
                      No simulation data available. Click simulate below.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => simulate(drawType)} className="btn btn-secondary" style={{ flex: 1, gap: "8px" }}>
                  <Shuffle size={16} /> Run Simulation
                </button>
                <button 
                  onClick={publish} 
                  className="btn btn-primary" 
                  disabled={publishing || !simulatedDraw} 
                  style={{ flex: 1.5, gap: "8px" }}
                >
                  {publishing ? <Activity className="animate-spin" size={16} /> : <Globe size={16} />}
                  {publishing ? "Processing..." : "Authorize & Publish"}
                </button>
              </div>
            </div>

            <div className="card" style={{ background: "rgba(16,185,129,0.02)", border: "1px solid rgba(16,185,129,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px" }}>Prize Distribution Preview</h3>
                {simulatedDraw && <span className="badge badge-green">LIVE ESTIMATE</span>}
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { tier: "5-Match Jackpot", weight: "40%", pool: totalPool * 0.4, color: "#10b981" },
                  { tier: "4-Match Prize Pool", weight: "35%", pool: totalPool * 0.35, color: "#fbbf24" },
                  { tier: "3-Match Prize Pool", weight: "25%", pool: totalPool * 0.25, color: "#3b82f6" }
                ].map(p => (
                  <div key={p.tier} style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{p.tier}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{p.weight} Weight</span>
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: p.color }}>
                      {formatCurrency(p.pool)}
                    </div>
                    <div style={{ marginTop: "12px", height: "4px", background: "var(--border-default)", borderRadius: "2px" }}>
                      <div style={{ width: p.weight, height: "100%", background: p.color, borderRadius: "2px" }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "24px", padding: "16px", background: "rgba(59,130,246,0.05)", borderRadius: "12px", border: "1px solid rgba(59,130,246,0.1)" }}>
                <p style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 1.5 }}>
                  <ShieldCheck size={12} style={{ display: "inline", marginRight: "4px" }} />
                  Publishing this draw will automatically cross-reference all user scores and detect winners. This action is recorded on the audit log.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Winners Tab - Enhanced with All Winners */}
      {activeTab === "winners" && (
        <div className="animate-fade-up">
          {/* Winner Stats */}

          {/* Winner Stats */}
          <div className="grid-4 mb-6">
            {[
              { label: "Total Winners", val: winners.length, icon: Award, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
              { label: "Pending", val: winners.filter(w => w.payout_status === 'pending').length, icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
              { label: "Processing", val: winners.filter(w => w.payout_status === 'processing').length, icon: Activity, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
              { label: "Paid", val: winners.filter(w => w.payout_status === 'paid').length, icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)" }
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
                <div className="stat-card-value">{s.val}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Winner Filters */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
              <input
                className="input"
                placeholder="Search winners..."
                value={searchWinner}
                onChange={(e) => setSearchWinner(e.target.value)}
                style={{ paddingLeft: "38px", width: "100%" }}
              />
            </div>
            <select className="input" style={{ width: "150px" }} value={winnerStatusFilter} onChange={e => setWinnerStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="input" style={{ width: "150px" }} value={winnerTierFilter} onChange={e => setWinnerTierFilter(e.target.value)}>
              <option value="all">All Tiers</option>
              <option value="5-Match">5-Match</option>
              <option value="4-Match">4-Match</option>
              <option value="3-Match">3-Match</option>
            </select>
            <select className="input" style={{ width: "150px" }} value={winnerSortBy} onChange={e => setWinnerSortBy(e.target.value)}>
              <option value="recent">Recent First</option>
              <option value="amount">Highest Prize</option>
            </select>
          </div>

          {/* Winners Table */}
          <div className="card">
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Winner</th>
                    <th>Draw</th>
                    <th>Match Tier</th>
                    <th>Prize Amount</th>
                    <th>Match Details</th>
                    <th>Proof</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWinners.map(winner => (
                    <tr key={winner.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: getTierColor(winner.match_type) + "15",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <Trophy size={20} color={getTierColor(winner.match_type)} />
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
                              {winner.profiles?.full_name || "Unknown User"}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                              {winner.profiles?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "14px", color: "var(--text-0)" }}>
                          {winner.draws?.month_year}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                          {winner.draws?.draw_type}
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{
                          background: getTierColor(winner.match_type) + "20",
                          color: getTierColor(winner.match_type)
                        }}>
                          {winner.match_type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: getTierColor(winner.match_type) }}>
                          {formatCurrency(winner.prize_amount)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px" }}>
                          {winner.match_count} matches
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-3)" }}>
                          {winner.user_scores?.join(", ") || "N/A"}
                        </div>
                      </td>
                      <td>
                        {winner.proof_url ? (
                          <a href={winner.proof_url} target="_blank" className="btn btn-ghost btn-sm" style={{ gap: "4px", color: "var(--blue-400)" }}>
                            <ExternalLink size={12}/> View Proof
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-3)", fontSize: "12px" }}>Waiting for upload</span>
                        )}
                      </td>
                      <td>
                        <span className="badge" style={{
                          background: winner.payout_status === 'paid' ? "rgba(16,185,129,0.2)" :
                                     winner.payout_status === 'processing' ? "rgba(59,130,246,0.2)" :
                                     winner.payout_status === 'rejected' ? "rgba(239,68,68,0.2)" :
                                     "rgba(245,158,11,0.2)",
                          color: winner.payout_status === 'paid' ? "#10b981" :
                                 winner.payout_status === 'processing' ? "#3b82f6" :
                                 winner.payout_status === 'rejected' ? "#ef4444" : "#f59e0b"
                        }}>
                          {winner.payout_status}
                        </span>
                        {winner.payout_date && (
                          <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>
                            {formatDate(winner.payout_date)}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button 
                            className="btn btn-icon" 
                            title="View Details" 
                            style={{ color: "var(--blue-400)" }}
                            onClick={() => alert(`Full audit trail for winner: ${winner.profiles?.full_name}\nPrize: ${formatCurrency(winner.prize_amount)}\nMatch: ${winner.match_type}`)}
                          >
                            <Eye size={14} />
                          </button>
                          {winner.payout_status === 'pending' && (
                            <button
                              onClick={() => updatePayoutStatus(winner.id, "processing")}
                              className="btn btn-icon"
                              title="Mark Processing"
                              style={{ color: "var(--blue-400)" }}
                            >
                              <Clock size={14} />
                            </button>
                          )}
                          {winner.payout_status === 'processing' && (
                            <button
                              onClick={() => updatePayoutStatus(winner.id, "paid")}
                              className="btn btn-icon"
                              title="Mark Paid"
                              style={{ color: "var(--green-400)" }}
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {(winner.payout_status === 'pending' || winner.payout_status === 'processing') && (
                            <button
                              onClick={() => updatePayoutStatus(winner.id, "rejected")}
                              className="btn btn-icon"
                              title="Reject"
                              style={{ color: "var(--rose-400)" }}
                            >
                              <X size={14} />
                            </button>
                          )}
                          <button 
                            className="btn btn-icon" 
                            title="Send Email" 
                            style={{ color: "var(--purple-400)" }}
                            onClick={() => alert(`Email composition opened for ${winner.profiles?.email}`)}
                          >
                            <Mail size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "charities" && (
        <div className="animate-fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-0)", marginBottom: "8px" }}>
                Charity Partners
              </h1>
              <p style={{ color: "var(--text-3)", fontSize: "16px" }}>
                Manage partner charities and their impact goals
              </p>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ gap: "8px" }} 
              onClick={() => {
                setEditingCharity({
                  name: "",
                  category: "Health",
                  description: "",
                  logo_url: "",
                  website_url: "",
                  mission_statement: "",
                  impact_area: "Global",
                  is_featured: false
                });
                setShowCharityModal(true);
              }}
            >
              <Plus size={16} /> Add Charity Partner
            </button>
          </div>

          <div className="grid-4 mb-6">
            {[
              { label: "Total Charities", val: charities.length, icon: Heart, color: "#f43f5e", bg: "rgba(244,63,94,0.1)" },
              { label: "Featured", val: charities.filter(c => c.is_featured).length, icon: Star, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
              { label: "Categories", val: [...new Set(charities.map(c => c.category))].length, icon: Globe, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
              { label: "Active Users", val: users.filter(u => u.charity_id).length, icon: Users, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" }
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
                <div className="stat-card-value">{s.val}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
              <input
                className="input"
                placeholder="Search charities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "38px", width: "100%" }}
              />
            </div>
            <select className="input" style={{ width: "150px" }} value={charityCategoryFilter} onChange={e => setCharityCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {Array.from(new Set(charities.map(c => c.category))).filter(Boolean).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select className="input" style={{ width: "150px" }} value={charityStatusFilter} onChange={e => setCharityStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="featured">Featured Only</option>
              <option value="regular">Regular</option>
            </select>
            <select className="input" style={{ width: "150px" }} value={charitySortBy} onChange={e => setCharitySortBy(e.target.value)}>
              <option value="name">Name A-Z</option>
              <option value="featured">Featured First</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
            {filteredCharities.map(charity => (
              <div key={charity.id} className="card" style={{ padding: "0", overflow: "hidden", border: charity.is_featured ? "2px solid var(--yellow-500)" : "1px solid var(--border-default)" }}>
                <div style={{ height: "180px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={charity.logo_url || "https://via.placeholder.com/400x180"}
                    alt={charity.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {charity.is_featured && (
                    <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--yellow-500)", borderRadius: "99px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "white", fontWeight: 700 }}>
                      <Star size={12} /> Featured
                    </div>
                  )}
                  <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                    <span className="badge" style={{ background: "rgba(7,13,18,0.75)", backdropFilter: "blur(8px)" }}>
                      <ShieldCheck size={10} /> Vetted
                    </span>
                  </div>
                </div>

                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-0)", marginBottom: "4px" }}>{charity.name}</h3>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => {
                          setEditingCharity(charity);
                          setShowCharityModal(true);
                        }}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: "var(--blue-400)", padding: "4px" }}
                        title="Edit Charity"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteCharity(charity.id)}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: "var(--rose-400)", padding: "4px" }}
                        title="Delete Charity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "16px", minHeight: "60px", display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {charity.description}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
    
                    <div>
                      <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px" }}>Users</div>
                      <div style={{ fontSize: "14px", color: "var(--text-0)" }}>
                        {users.filter(u => u.charity_id === charity.id).length}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, height: "36px", fontSize: "13px" }}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ 
                        width: "36px", 
                        height: "36px", 
                        borderRadius: "6px", 
                        border: "1px solid var(--border-default)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0
                      }}
                      title="Visit Website"
                      onClick={() => window.open(charity.website_url || '#', '_blank')}
                    >
                      <ExternalLink size={16} color="var(--blue-400)" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="animate-fade-up">

          {/* User Stats */}
          <div className="grid-4 mb-6">
            {[
              { label: "Total Users", val: users.length, icon: Users, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
              { label: "Active Users", val: activeUsers.length, icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
              { label: "Monthly Subscriptions", val: monthlyUsers.length, icon: Calendar, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
              { label: "Yearly Subscriptions", val: yearlyUsers.length, icon: Award, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" }
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
                <div className="stat-card-value">{s.val}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* User Filters */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
              <input
                className="input"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "38px", width: "100%" }}
              />
            </div>
            <select className="input" style={{ width: "150px" }} value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select className="input" style={{ width: "150px" }} value={userPlanFilter} onChange={e => setUserPlanFilter(e.target.value)}>
              <option value="all">All Plans</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <select className="input" style={{ width: "150px" }} value={userSortBy} onChange={e => setUserSortBy(e.target.value)}>
              <option value="name">Name A-Z</option>
              <option value="recent">Newest First</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="card">
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Subscription</th>
                    <th>Charity</th>
                    <th>XP & Rank</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "var(--bg-surface)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-3)",
                            fontWeight: 600
                          }}>
                            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
                              {user.full_name || "Unknown User"}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "14px", color: "var(--text-0)" }}>
                          {user.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="badge" style={{
                            background: getStatusColor(user.subscription_status) + "20",
                            color: getStatusColor(user.subscription_status)
                          }}>
                            {user.subscription_status}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
                            {user.subscription_plan}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "14px", color: "var(--text-0)" }}>
                          {charities.find(c => c.id === user.charity_id)?.name || "None"}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                          {user.contribution_percentage}% contribution
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "14px", color: "var(--text-0)" }}>
                          {user.xp_points} XP
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                          {user.current_rank}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "14px", color: "var(--text-0)" }}>
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button 
                            className="btn btn-icon" 
                            title="Manage User" 
                            style={{ color: "var(--blue-400)" }}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            <Settings size={14} />
                          </button>
                          <button 
                            className="btn btn-icon" 
                            title="View User" 
                            style={{ color: "var(--blue-400)" }}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            className="btn btn-icon" 
                            title="Edit User" 
                            style={{ color: "var(--green-400)" }}
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-icon" 
                            title="Delete User" 
                            style={{ color: "var(--rose-400)" }}
                            onClick={() => deleteUser(user.id, user.full_name || user.email)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="animate-fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-0)", marginBottom: "8px" }}>
                Platform Analytics
              </h1>
              <p style={{ color: "var(--text-3)", fontSize: "16px" }}>
                Revenue distributions, user growth and charity impact
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-ghost" style={{ gap: "8px" }} onClick={() => alert("Preparing comprehensive PDF report...")}>
                <Download size={16} /> Export Full PDF
              </button>
              <button className="btn btn-primary" style={{ gap: "8px" }} onClick={() => alert("Scheduling automatic weekly report...")}>
                <TrendingUp size={16} /> Schedule Report
              </button>
            </div>
          </div>

          {/* Analytics Stats */}
          <div className="grid-4 mb-6">
            {[
              { label: "Total Revenue", val: formatCurrency(totalPool), icon: DollarSign, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
              { label: "Active Subscribers", val: activeUsers.length, icon: Users, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
              { label: "Total Winners", val: winners.length, icon: Trophy, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
              { label: "Avg. Prize Amount", val: formatCurrency(winners.length > 0 ? winners.reduce((sum, w) => sum + (w.prize_amount || 0), 0) / winners.length : 0), icon: Award, color: "#f43f5e", bg: "rgba(244,63,94,0.1)" }
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
                <div className="stat-card-value">{s.val}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Revenue Analytics */}
          <div className="grid-2 mb-6">
            <div className="card">
              <h4 style={{ fontSize: "16px", marginBottom: "20px" }}>Revenue Breakdown</h4>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-2)" }}>Monthly Subscriptions</span>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-0)" }}>
                    {monthlyUsers.length} × $9.99 = {formatCurrency(monthlyUsers.length * 9.99)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-2)" }}>Yearly Subscriptions</span>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-0)" }}>
                    {yearlyUsers.length} × $7.42 = {formatCurrency(yearlyUsers.length * 7.42)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-2)" }}>Charity Pool (15%)</span>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--red-400)" }}>
                    {formatCurrency(charityPool)}
                  </span>
                </div>
                <div style={{ height: "8px", background: "var(--border-default)", borderRadius: "4px", margin: "12px 0" }}>
                  <div style={{
                    height: "100%",
                    background: "linear-gradient(90deg, var(--blue-500) 60%, var(--red-400) 15%, var(--green-400) 25%)",
                    borderRadius: "4px"
                  }}></div>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 style={{ fontSize: "16px", marginBottom: "20px" }}>Subscription Distribution</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-2)" }}>Monthly</span>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
                      {users.length > 0 ? Math.round((monthlyUsers.length / users.length) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ height: "8px", background: "var(--border-default)", borderRadius: "4px" }}>
                    <div style={{
                      height: "100%",
                      width: users.length > 0 ? `${(monthlyUsers.length / users.length) * 100}%` : "0%",
                      background: "var(--blue-500)",
                      borderRadius: "4px"
                    }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-2)" }}>Yearly</span>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
                      {users.length > 0 ? Math.round((yearlyUsers.length / users.length) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ height: "8px", background: "var(--border-default)", borderRadius: "4px" }}>
                    <div style={{
                      height: "100%",
                      width: users.length > 0 ? `${(yearlyUsers.length / users.length) * 100}%` : "0%",
                      background: "var(--green-500)",
                      borderRadius: "4px"
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Winner Analytics */}
          <div className="grid-2 mb-6">
            <div className="card">
              <h4 style={{ fontSize: "16px", marginBottom: "20px" }}>Winner Distribution</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { tier: "5-Match", count: winners.filter(w => w.match_type === "5-Match").length, color: "#10b981" },
                  { tier: "4-Match", count: winners.filter(w => w.match_type === "4-Match").length, color: "#fbbf24" },
                  { tier: "3-Match", count: winners.filter(w => w.match_type === "3-Match").length, color: "#3b82f6" }
                ].map(tier => (
                  <div key={tier.tier}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-2)" }}>{tier.tier}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
                        {tier.count} ({winners.length > 0 ? Math.round((tier.count / winners.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div style={{ height: "8px", background: "var(--border-default)", borderRadius: "4px" }}>
                      <div style={{
                        height: "100%",
                        width: winners.length > 0 ? `${(tier.count / winners.length) * 100}%` : "0%",
                        background: tier.color,
                        borderRadius: "4px"
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 style={{ fontSize: "16px", marginBottom: "20px" }}>Payout Status</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { status: "Paid", count: winners.filter(w => w.payout_status === "paid").length, color: "#10b981" },
                  { status: "Processing", count: winners.filter(w => w.payout_status === "processing").length, color: "#3b82f6" },
                  { status: "Pending", count: winners.filter(w => w.payout_status === "pending").length, color: "#f59e0b" },
                  { status: "Rejected", count: winners.filter(w => w.payout_status === "rejected").length, color: "#ef4444" }
                ].map(status => (
                  <div key={status.status}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-2)" }}>{status.status}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
                        {status.count} ({winners.length > 0 ? Math.round((status.count / winners.length) * 100) : 0}%)
                      </span>
                    </div>
                    <div style={{ height: "8px", background: "var(--border-default)", borderRadius: "4px" }}>
                      <div style={{
                        height: "100%",
                        width: winners.length > 0 ? `${(status.count / winners.length) * 100}%` : "0%",
                        background: status.color,
                        borderRadius: "4px"
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charity Analytics */}
          <div className="card mb-6">
            <h4 style={{ fontSize: "16px", marginBottom: "20px" }}>Charity Distribution</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              {charities.map(charity => {
                const userCount = users.filter(u => u.charity_id === charity.id).length;
                const percentage = users.length > 0 ? Math.round((userCount / users.length) * 100) : 0;
                return (
                  <div key={charity.id} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)", marginBottom: "8px" }}>
                      {charity.name}
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--blue-400)", marginBottom: "4px" }}>
                      {userCount}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "8px" }}>
                      {percentage}% of users
                    </div>
                    <div style={{ height: "6px", background: "var(--border-default)", borderRadius: "3px" }}>
                      <div style={{
                        height: "100%",
                        width: `${percentage}%`,
                        background: "var(--blue-500)",
                        borderRadius: "3px"
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card">
            <h4 style={{ fontSize: "16px", marginBottom: "20px" }}>Performance Metrics</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px" }}>Avg. Revenue per User</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-0)" }}>
                  {users.length > 0 ? formatCurrency(totalPool / users.length) : "$0.00"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px" }}>Avg. Prize per Winner</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-0)" }}>
                  {winners.length > 0 ? formatCurrency(winners.reduce((sum, w) => sum + (w.prize_amount || 0), 0) / winners.length) : "$0.00"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px" }}>Winner Rate</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-0)" }}>
                  {users.length > 0 ? `${Math.round((winners.length / users.length) * 100)}%` : "0%"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px" }}>Charity Contribution</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-0)" }}>
                  {totalPool > 0 ? `${Math.round((charityPool / totalPool) * 100)}%` : "0%"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charity Modal */}
      {showCharityModal && (
        <div className="modal-overlay" onClick={() => setShowCharityModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: "22px", marginBottom: "20px" }}>
              {editingCharity?.id ? "Edit Charity" : "Add Charity"}
            </h3>
            <form onSubmit={saveCharity}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="label">Name *</label>
                  <input
                    className="input"
                    value={editingCharity?.name || ""}
                    onChange={e => setEditingCharity({...editingCharity, name: e.target.value})}
                    placeholder="Charity name..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <input
                    className="input"
                    value={editingCharity?.category || ""}
                    onChange={e => setEditingCharity({...editingCharity, category: e.target.value})}
                    placeholder="Environment, Health, Education..."
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="label">Website URL *</label>
                <input
                  className="input"
                  value={editingCharity?.website_url || ""}
                  onChange={e => setEditingCharity({...editingCharity, website_url: e.target.value})}
                  placeholder="https://..."
                  type="url"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label className="label">Logo URL</label>
                  <input
                    className="input"
                    value={editingCharity?.logo_url || ""}
                    onChange={e => setEditingCharity({...editingCharity, logo_url: e.target.value})}
                    placeholder="https://..."
                    type="url"
                  />
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label className="label">Description *</label>
                <textarea
                  className="input"
                  style={{ height: "100px", padding: "12px" }}
                  value={editingCharity?.description || ""}
                  onChange={e => setEditingCharity({...editingCharity, description: e.target.value})}
                  placeholder="Describe their impact and mission..."
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <input
                  type="checkbox"
                  checked={editingCharity?.is_featured || false}
                  onChange={e => setEditingCharity({...editingCharity, is_featured: e.target.checked})}
                />
                <label style={{ fontSize: "14px", color: "var(--text-2)" }}>Feature this charity on the homepage</label>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCharityModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Charity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" style={{ maxWidth: "600px", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800 }}>User Profile</h2>
              <button className="btn btn-icon" onClick={() => setShowUserModal(false)}><X size={20} /></button>
            </div>
            
            <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "var(--bg-raised)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 800, color: "var(--blue-400)" }}>
                {selectedUser.full_name?.[0] || selectedUser.email?.[0]}
              </div>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>{selectedUser.full_name || "Profile Incomplete"}</h3>
                <p style={{ color: "var(--text-3)", marginBottom: "12px" }}>{selectedUser.email}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span className="badge" style={{ background: getStatusColor(selectedUser.subscription_status) + "20", color: getStatusColor(selectedUser.subscription_status) }}>
                    {selectedUser.subscription_status.toUpperCase()}
                  </span>
                  <span className="badge badge-indigo">{selectedUser.subscription_plan}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
              <div className="card" style={{ padding: "16px", background: "var(--bg-raised)", border: "none" }}>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", fontWeight: 700 }}>MEMBER SINCE</div>
                <div style={{ fontSize: "14px" }}>{formatDate(selectedUser.created_at)}</div>
              </div>
              <div className="card" style={{ padding: "16px", background: "var(--bg-raised)", border: "none" }}>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", fontWeight: 700 }}>LAST ACTIVE</div>
                <div style={{ fontSize: "14px" }}>{selectedUser.last_active ? formatDate(selectedUser.last_active) : "Recently"}</div>
              </div>
              <div className="card" style={{ padding: "16px", background: "var(--bg-raised)", border: "none" }}>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", fontWeight: 700 }}>CHARITY SELECTION</div>
                <div style={{ fontSize: "14px" }}>{charities.find(c => c.id === selectedUser.charity_id)?.name || "Not Selected"}</div>
              </div>
              <div className="card" style={{ padding: "16px", background: "var(--bg-raised)", border: "none" }}>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", fontWeight: 700 }}>TOTAL DRAW XP</div>
                <div style={{ fontSize: "14px" }}>{scores.filter(s => s.user_id === selectedUser.id).length * 50} Points</div>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                // Update profile
                const { error: profileError } = await supabase
                  .from("profiles")
                  .update({
                    full_name: selectedUser.full_name,
                    role: selectedUser.role,
                    subscription_status: selectedUser.subscription_status
                  })
                  .eq("id", selectedUser.id);

                if (profileError) throw profileError;

                // Update scores (simplified for modal: updates the scores displayed)
                const userScores = scores.filter(s => s.user_id === selectedUser.id);
                for (const score of userScores) {
                  await supabase.from("scores").update({ score: score.score }).eq("id", score.id);
                }

                alert("User updated successfully!");
                setShowUserModal(false);
                window.location.reload(); // Refresh to show changes
              } catch (err) {
                alert("Error updating user: " + err.message);
              } finally {
                setSaving(false);
              }
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <label className="label">Full Name</label>
                  <input 
                    className="input" 
                    value={selectedUser.full_name || ""} 
                    onChange={e => setSelectedUser({...selectedUser, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Administrative Role</label>
                  <select 
                    className="input" 
                    value={selectedUser.role || "user"} 
                    onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label">Subscription Status</label>
                  <select 
                    className="input" 
                    value={selectedUser.subscription_status} 
                    onChange={e => setSelectedUser({...selectedUser, subscription_status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--text-3)" }}>GOLF SCORE ARCHIVE (LAST 5)</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {scores.filter(s => s.user_id === selectedUser.id).map((score, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-raised)", padding: "10px", borderRadius: "8px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-3)", width: "60px" }}>Round {idx + 1}</span>
                      <input 
                        type="number" 
                        className="input" 
                        style={{ width: "80px", height: "32px" }} 
                        value={score.score} 
                        onChange={(e) => {
                          const newScore = parseInt(e.target.value);
                          const updatedScores = [...scores];
                          const scoreIdx = updatedScores.findIndex(s => s.id === score.id);
                          if (scoreIdx > -1) {
                            updatedScores[scoreIdx].score = newScore;
                            setScores(updatedScores);
                          }
                        }}
                      />
                      <span style={{ fontSize: "11px", color: "var(--text-3)" }}>Stableford Points</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? "Saving Changes..." : "Complete Profile Sync"}
                </button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
