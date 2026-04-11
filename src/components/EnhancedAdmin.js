import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, DollarSign, TrendingUp, Activity, Calendar, 
  Trophy, Heart, Zap, BarChart3, CheckCircle, Clock, X,
  Download, Filter, Search, ChevronDown, ChevronUp, Eye, Edit, Trash2,
  Award, Target, Globe, Settings, Bell, Mail, Phone, MapPin
} from "lucide-react";

export default function EnhancedAdmin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [{ data: u }, { data: s }, { data: d }, { data: w }, { data: c }] = await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("scores").select("*").order("date_played", { ascending: false }),
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

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-0)", marginBottom: "8px" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: "16px" }}>
            Platform management and analytics
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-ghost" style={{ gap: "8px" }}>
            <Download size={16} /> Export Data
          </button>
          <button className="btn btn-primary" style={{ gap: "8px" }}>
            <Bell size={16} /> Notifications
          </button>
        </div>
      </div>

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
              borderRadius: "0 0 0 0"
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* Key Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "32px" }}>
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

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div className="relative" style={{ width: "300px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                  style={{ paddingLeft: "40px", width: "100%" }}
                />
              </div>
              <select className="input" style={{ width: "150px" }}>
                <option>All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Past Due</option>
                <option>Cancelled</option>
              </select>
              <select className="input" style={{ width: "150px" }}>
                <option>All Plans</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-ghost" style={{ gap: "8px" }}>
                <Filter size={16} /> Filter
              </button>
              <button className="btn btn-primary" style={{ gap: "8px" }}>
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          <div className="data-table">
            <thead>
              <tr>
                <th>User</th>
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
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontWeight: 600 }}>
                        {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
                          {user.full_name || "Unknown User"}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                          {user.email}
                        </div>
                      </div>
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
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-0)" }}>
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
                      <button className="btn btn-icon" title="View User" style={{ color: "var(--blue-400)" }}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-icon" title="Edit User" style={{ color: "var(--green-400)" }}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-icon" title="Delete User" style={{ color: "var(--rose-400)" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </div>
        </div>
      )}

      {/* Other tabs would be implemented similarly... */}
      {activeTab === "draws" && (
        <div>
          <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>Draw Management</h3>
          <p style={{ color: "var(--text-3)" }}>Draw management interface coming soon...</p>
        </div>
      )}

      {activeTab === "winners" && (
        <div>
          <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>Winner Management</h3>
          <p style={{ color: "var(--text-3)" }}>Winner management interface coming soon...</p>
        </div>
      )}

      {activeTab === "charities" && (
        <div>
          <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>Charity Management</h3>
          <p style={{ color: "var(--text-3)" }}>Charity management interface coming soon...</p>
        </div>
      )}

      {activeTab === "analytics" && (
        <div>
          <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>Analytics & Reports</h3>
          <p style={{ color: "var(--text-3)" }}>Analytics interface coming soon...</p>
        </div>
      )}
    </div>
  );
}
