"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
// Sidebar import removed as it is now in AppShell
import EnhancedWinnings from "@/components/EnhancedWinnings";
import { Target, Trophy, Calendar, Heart, Plus, Sparkles, Award, TrendingUp, Activity, Users, DollarSign, Edit3 } from "lucide-react";

const RANK_THRESHOLDS = [
  { label: "Rookie",   min: 0,   color: "#94a3b8" },
  { label: "Amateur",  min: 150, color: "#60a5fa" },
  { label: "Ace",      min: 350, color: "#a78bfa" },
  { label: "Champion", min: 700, color: "#fbbf24" },
  { label: "Legend",   min: 1200, color: "#f43f5e" },
];

function getRank(xp) {
  let rank = RANK_THRESHOLDS[0];
  for (const r of RANK_THRESHOLDS) { if (xp >= r.min) rank = r; }
  return rank;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser]     = useState(null);
  const [scores, setScores] = useState([]);
  const [profile, setProfile] = useState(null);
  const [newScore, setNewScore] = useState("");
  const [loading, setLoading]   = useState(true);
  const [insight, setInsight]   = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [aiAdvice, setAiAdvice] = useState({ advice: "Analysing your swing...", luckyNumbers: [] });

  const fetchAIAdvice = async (userScores, currentRank) => {
    try {
      const res = await fetch("/api/caddy/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scores: userScores.map(s => s.score).slice(0, 5), 
          rank: currentRank 
        })
      });
      const data = await res.json();
      setAiAdvice(data);
    } catch (err) {
      console.error("AI Caddy failed:", err);
    }
  };

  const fetchData = useCallback(async (u) => {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from("scores").select("*").eq("user_id", u.id).order("date_played", { ascending: false }).limit(6),
      supabase.from("profiles").select("*").eq("id", u.id).maybeSingle(),
    ]);
    setScores(s || []);
    setProfile(p);
    
    const xp = (s || []).length * 50 + (p?.charity_id ? 100 : 0);
    fetchAIAdvice(s || [], getRank(xp).label);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const handleCheckoutSuccess = async (uId) => {
      if (urlParams.get("checkout") === "success") {
        const { error } = await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("id", uId);
        
        if (!error) {
          alert("🎉 Welcome Aboard! Your subscription is now active.");
          await fetchData({ id: uId });
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return router.push("/auth/login");
      setUser(data.user);
      await fetchData(data.user);
      await handleCheckoutSuccess(data.user.id);
      setLoading(false);
    });
  }, [router, fetchData]);

  const logRound = async (e) => {
    e.preventDefault();
    const val = parseInt(newScore);
    if (!val || val < 1 || val > 45) return alert("Enter a valid score (1-45 pts).");
    setPosting(true);

    try {
      // Get current scores to maintain only last 5
      const { data: currentScores, error: fetchError } = await supabase
        .from("scores")
        .select("id, date_played")
        .eq("user_id", user.id)
        .order("date_played", { ascending: true });

      if (fetchError) {
        console.error("Error fetching current scores:", fetchError);
        alert("Error saving score. Please try again.");
        setPosting(false);
        return;
      }

      // If user already has 5 scores, delete the oldest
      if (currentScores && currentScores.length >= 5) {
        const oldestScore = currentScores[0];
        const { error: deleteError } = await supabase
          .from("scores")
          .delete()
          .eq("id", oldestScore.id);

        if (deleteError) {
          console.error("Error deleting old score:", deleteError);
          alert("Error saving score. Please try again.");
          setPosting(false);
          return;
        }
      }

      // Insert new score
      const { data: newScoreData, error: insertError } = await supabase
        .from("scores")
        .insert({
          user_id: user.id,
          score: val,
          date_played: new Date().toISOString().split('T')[0] // Today's date
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting new score:", insertError);
        alert("Error saving score. Please try again.");
        setPosting(false);
        return;
      }

      console.log("Score saved successfully:", newScoreData);

      // Reset and refresh
      setNewScore("");
      setShowScoreModal(false);
      await fetchData(user);
      fetchAiInsight();

    } catch (error) {
      console.error("Unexpected error in logRound:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const fetchAiInsight = async () => {
    if (scores.length === 0) return;
    setInsightLoading(true);
    try {
      const res = await fetch("/api/ai/predict", {
        method: "POST",
        body: JSON.stringify({ scores: scores.map((s) => s.score) }),
      });
      const d = await res.json();
      setInsight(d.insight || "");
    } catch { setInsight("Great consistency! Keep tracking your rounds."); }
    setInsightLoading(false);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg-void)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "var(--text-3)", fontSize: "14px" }}>Loading dashboard...</div>
      </div>
    </div>
  );

  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0;
  const xp  = scores.length * 50 + (profile?.charity_id ? 100 : 0);
  const rank = getRank(xp);
  const nextRank = RANK_THRESHOLDS[RANK_THRESHOLDS.indexOf(rank) + 1];
  const xpProgress = nextRank ? ((xp - rank.min) / (nextRank.min - rank.min)) * 100 : 100;
  const best = scores.length ? Math.max(...scores.map(s => s.score)) : 0;
  const trend = scores.length >= 2 ? scores[0].score - scores[1].score : 0;

  return (
    <>
        <div className="flex-between mb-8" style={{ flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user.email?.split("@")[0]}</p>
          </div>
          <button onClick={() => setShowScoreModal(true)} className="btn btn-primary" style={{ gap: "8px" }}>
            <Plus size={18} /> Log Round
          </button>
        </div>

        <div className="card mb-6" style={{ background: `linear-gradient(135deg, ${rank.color}18, var(--bg-surface))`, borderColor: rank.color + "33" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: rank.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award size={28} color={rank.color} />
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: rank.color, marginBottom: "4px" }}>Current Rank</div>
                <div style={{ fontSize: "24px", fontWeight: 900, fontFamily: "Outfit", color: "var(--text-0)" }}>{rank.label}</div>
              </div>
            </div>
            
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div className="flex-between mb-2">
                <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{xp} XP</span>
                <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 700 }}>Next Renewal: {new Date(new Date(profile?.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${xpProgress}%`, background: rank.color }} />
              </div>
            </div>

            <div style={{ padding: "12px", background: "var(--bg-raised)", borderRadius: "12px", border: "1px solid var(--border-subtle)", minWidth: "200px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 700, marginBottom: "8px" }}>CHARITY CONTRIBUTION</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input 
                  type="range" 
                  min="10" 
                  max="50" 
                  value={profile?.contribution_percentage || 10} 
                  onChange={async (e) => {
                    const val = parseInt(e.target.value);
                    setProfile({...profile, contribution_percentage: val});
                    await supabase.from("profiles").update({ contribution_percentage: val }).eq("id", user.id);
                  }}
                  style={{ flex: 1, accentColor: "var(--blue-400)" }}
                />
                <span style={{ fontSize: "16px", fontWeight: 900, color: "var(--text-0)", width: "40px" }}>{profile?.contribution_percentage || 10}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-4 mb-6">
          {[
            { label: "Average Score", val: avg || "-", unit: "pts", icon: Target, iconColor: "#10b981", iconBg: "rgba(16,185,129,0.1)", change: trend },
            { label: "Best Round", val: best || "-", unit: "pts", icon: Trophy, iconColor: "#fbbf24", iconBg: "rgba(251,191,36,0.1)" },
            { label: "Rounds Logged", val: scores.length, unit: "", icon: Calendar, iconColor: "#6366f1", iconBg: "rgba(99,102,241,0.1)" },
            { label: "Charity Impact", val: `$${(scores.length * 3.5).toFixed(0)}`, unit: "", icon: Heart, iconColor: "#f43f5e", iconBg: "rgba(244,63,94,0.1)" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-icon" style={{ background: s.iconBg }}>
                <s.icon size={22} color={s.iconColor} />
              </div>
              <div className="stat-card-value">{s.val}<span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-3)", marginLeft: "4px" }}>{s.unit}</span></div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: "1.5fr 1fr", alignItems: "start", gap: "24px", marginBottom: "32px" }}>
          {/* Main Activity Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: "16px" }}>Performance Trend</h3>
                <span className="badge badge-green">Last {scores.length} rounds</span>
              </div>
              {scores.length === 0 ? (
                <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>No rounds tracked yet. Start by logging a score!</div>
              ) : (
                <div className="bar-chart" style={{ height: "180px", padding: "20px 0" }}>
                  {[...scores].reverse().map((s, i) => (
                    <div key={s.id} className="bar-col">
                      <div className="bar" style={{ height: `${(s.score / 50) * 100}%`, borderRadius: "4px 4px 0 0" }} />
                      <div className="bar-label">{new Date(s.date_played).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity size={18} color="var(--green-500)" /> Recent Activity
                </h3>
  <button className="btn btn-ghost btn-sm" style={{ fontSize: "12px" }} onClick={() => router.push('/draws')}>View Draw History</button>
</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {scores.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)", fontSize: "14px" }}>
                    Your golf round history will appear here.
                  </div>
                ) : (
                  scores.map((score, index) => (
                    <div key={score.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--bg-raised)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--green-400)" }}>
                          {score.score}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-0)" }}>{score.course_name || "Club House Round"}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>Stableford Points</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)" }}>{new Date(score.date_played).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>Verified via App</div>
                        </div>
                        <button 
                          onClick={async () => {
                            const updated = prompt("Enter new score (1-45):", score.score);
                            const val = parseInt(updated);
                            if (val && val >= 1 && val <= 45) {
                              const { error } = await supabase.from("scores").update({ score: val }).eq("id", score.id);
                              if (!error) fetchData(user);
                            }
                          }}
                          className="btn btn-icon btn-sm" 
                          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                        >
                          <Edit3 size={14} color="var(--text-3)" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Insights Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="card" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), var(--bg-surface))", borderColor: "rgba(99,102,241,0.2)" }}>
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Sparkles size={18} color="#818cf8" />
                  <h3 style={{ fontSize: "16px" }}>AI Caddy</h3>
                </div>
                <button onClick={() => fetchAIAdvice(scores, profile?.current_rank)} className="btn btn-sm btn-secondary" disabled={insightLoading} style={{ height: "28px", fontSize: "11px" }}>
                  {insightLoading ? "Analysing..." : "Refresh"}
                </button>
              </div>
              <div style={{ background: "var(--bg-raised)", borderRadius: "var(--r-sm)", padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-1)", fontStyle: "italic" }}>
                  "{aiAdvice?.advice || "Log more rounds to unlock personalized caddy advice."}"
                </p>
              </div>
              {aiAdvice?.luckyNumbers?.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "1px" }}>Your Lucky Numbers</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {aiAdvice.luckyNumbers.map((n, i) => (
                      <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: "var(--indigo-400)" }}>
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: "16px" }}>Active Winnings</h3>
              </div>
              <EnhancedWinnings userId={user.id} />
            </div>
          </div>
        </div>

      {showScoreModal && (
        <div className="modal-overlay" onClick={() => setShowScoreModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: "22px", marginBottom: "20px" }}>Log Round</h3>
            <form onSubmit={logRound}>
              <input type="number" className="input" placeholder="Stableford Score" value={newScore} onChange={e => setNewScore(e.target.value)} style={{ marginBottom: "20px" }} required />
              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={posting}>{posting ? "Saving..." : "Submit Round"}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

