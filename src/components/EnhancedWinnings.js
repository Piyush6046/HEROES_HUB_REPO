import { useState, useEffect } from "react";
  import { Trophy, Calendar, TrendingUp, ChevronDown, ChevronUp, Download, Award, ExternalLink, CheckCircle, Clock, X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function EnhancedWinnings({ userId }) {
  const [winnings, setWinnings] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWinnings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("winners")
          .select("*, draws(month_year), profiles(*)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching winnings:", error);
        } else {
          setWinnings(data || []);
        }
      } catch (error) {
        console.error("Unexpected error fetching winnings:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchWinnings();
    }
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "#10b981";
      case "processing": return "#3b82f6";
      case "pending": return "#f59e0b";
      case "rejected": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid": return <CheckCircle size={16} />;
      case "processing": return <Clock size={16} />;
      case "pending": return <Clock size={16} />;
      case "rejected": return <X size={16} />;
      default: return <Clock size={16} />;
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

  const getTierIcon = (tier) => {
    switch (tier) {
      case "5-Match": return <Trophy size={16} />;
      case "4-Match": return <Award size={16} />;
      case "3-Match": return <Award size={16} />;
      default: return <Award size={16} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "var(--text-3)" }}>
        <div style={{ display: "inline-block", padding: "20px", borderRadius: "50%", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="animate-spin" style={{ width: "24px", height: "24px", margin: "0 auto 10px", border: "3px solid var(--green-500)", borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderRadius: "50%" }}></div>
          <div>Loading winnings...</div>
        </div>
      </div>
    );
  }

  if (winnings.length === 0) {
    return (
      <div style={{ 
        padding: "40px", 
        textAlign: "center", 
        color: "var(--text-3)",
        background: "var(--bg-surface)",
        borderRadius: "var(--r-lg)",
        border: "1px solid var(--border-default)"
      }}>
        <Trophy size={48} style={{ color: "var(--text-3)", opacity: 0.3 }} />
        <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "var(--text-2)" }}>No Winnings Yet</h3>
        <p style={{ fontSize: "14px", lineHeight: 1.6 }}>
          Start logging your golf rounds and participate in monthly draws to win prizes!
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
          <a 
            href="/draws" 
            className="btn btn-primary"
            style={{ borderRadius: "99px", padding: "12px 24px" }}
          >
            View Draws
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-0)" }}>My Winnings</h3>
        <span style={{ fontSize: "14px", color: "var(--text-3)" }}>
          {winnings.length} Total Winnings
        </span>
      </div>

      <div style={{
        maxHeight: "400px",
        overflowY: "auto",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--r-lg)",
        background: "var(--bg-surface)"
      }}>
        <div style={{ padding: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Recent Activity
            </div>
          </div>

          {winnings.map((winner) => (
            <div key={winner.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px" }}>
              <div 
                onClick={() => setExpanded(expanded === winner.id ? null : winner.id)}
                style={{ 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "16px",
                  padding: "16px",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "12px", 
                  background: getTierColor(winner.match_type) + "15",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {getTierIcon(winner.match_type)}
                </div>

                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: getTierColor(winner.match_type) }}>
                      {winner.match_type}
                    </span>
                    <span className="badge" style={{ 
                      fontSize: "10px", 
                      background: getStatusColor(winner.payout_status) + "20", 
                      color: getStatusColor(winner.payout_status),
                      padding: "2px 8px",
                      borderRadius: "99px"
                    }}>
                      {winner.payout_status}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--text-3)", marginBottom: "4px" }}>
                    {winner.draws?.month_year} Draw
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: getTierColor(winner.match_type) }}>
                    {formatCurrency(winner.prize_amount)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {expanded === winner.id ? <ChevronUp size={16} color="var(--text-3)" /> : <ChevronDown size={16} color="var(--text-3)" />}
                </div>
              </div>

              {expanded === winner.id && (
                <div style={{ 
                  padding: "16px", 
                  background: "var(--bg-raised)", 
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--border-subtle)",
                  marginTop: "8px"
                }}>
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-3)", marginBottom: "8px" }}>
                      Winner Details
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>User</div>
                        <div style={{ fontSize: "14px", color: "var(--text-0)" }}>
                          {winner.profiles?.full_name || "Unknown User"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>Match Type</div>
                        <div style={{ fontSize: "14px", color: "var(--text-0)" }}>
                          {winner.match_type}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-3)", marginBottom: "8px" }}>
                      Prize Details
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>Prize Amount</div>
                        <div style={{ fontSize: "16px", fontWeight: 900, color: getTierColor(winner.match_type) }}>
                          {formatCurrency(winner.prize_amount)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>Draw Date</div>
                        <div style={{ fontSize: "14px", color: "var(--text-0)" }}>
                          {formatDate(winner.draws?.month_year)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-3)", marginBottom: "8px" }}>
                      Proof & Payout
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {winner.proof_url ? (
                        <a 
                          href={winner.proof_url} 
                          target="_blank" 
                          className="btn btn-sm btn-ghost" 
                          style={{ gap: "4px", color: "var(--blue-400)" }}
                        >
                          <ExternalLink size={12} /> View Proof
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-3)", fontSize: "12px" }}>No proof uploaded</span>
                      )}
                      <button 
                        onClick={() => {
                          const fileInput = document.createElement('input');
                          fileInput.type = 'file';
                          fileInput.accept = 'image/*';
                          fileInput.onchange = async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const formData = new FormData();
                              formData.append('winnerId', winner.id);
                              formData.append('file', file);
                              
                              try {
                                const res = await fetch('/api/admin/upload-proof', {
                                  method: 'POST',
                                  body: formData
                                });
                                const data = await res.json();
                                if (!data.error) {
                                  toast.success('Proof uploaded successfully!');
                                  // Refresh winners list
                                  const { data: w } = await supabase
                                    .from("winners")
                                    .select("*, draws(month_year), profiles(*)")
                                    .order("created_at", { ascending: false });
                                  setWinnings(w || []);
                                }
                              } catch (error) {
                                toast.error('Error uploading proof: ' + error.message);
                              }
                            }
                          };
                          fileInput.click();
                        }}
                        className="btn btn-sm btn-ghost"
                        style={{ fontSize: "12px" }}
                      >
                        <Upload size={12} /> Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
