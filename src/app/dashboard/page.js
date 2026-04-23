"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EnhancedWinnings from "@/components/EnhancedWinnings";
import { Target, Trophy, Calendar, Heart, Plus, Sparkles, Award, TrendingUp, Activity, Edit3, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const RANK_THRESHOLDS = [
  { label: "Rookie",   min: 0,    color: "#94a3b8" },
  { label: "Amateur",  min: 150,  color: "#60a5fa" },
  { label: "Ace",      min: 350,  color: "#a78bfa" },
  { label: "Champion", min: 700,  color: "#fbbf24" },
  { label: "Legend",   min: 1200, color: "#f43f5e" },
];

function getRank(xp) {
  let rank = RANK_THRESHOLDS[0];
  for (const r of RANK_THRESHOLDS) { if (xp >= r.min) rank = r; }
  return rank;
}

import { useAuth } from "@/context/AuthContext";
import { useGlobalData } from "@/context/DataContext";

/* Animated stat card */
function StatCard({ label, val, unit, icon: Icon, iconColor, iconBg, change, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="stat-card" style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)`,
    }}>
      <div className="stat-card-icon" style={{ background: iconBg }}>
        <Icon size={22} color={iconColor} />
      </div>
      <div className="stat-card-value">
        {val}
        {unit && <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-3)", marginLeft: "4px" }}>{unit}</span>}
      </div>
      <div className="stat-card-label">{label}</div>
      {change !== undefined && (
        <div className="stat-card-change" style={{ color: change >= 0 ? "var(--green-400)" : "var(--rose-500)" }}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)} pts vs prev
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { scores, profile, loading: dataLoading, refreshData, setScores } = useGlobalData();
  const [newScore, setNewScore]     = useState("");
  const [insight, setInsight]       = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editScoreData, setEditScoreData]   = useState(null);
  const [posting, setPosting]       = useState(false);
  const [aiAdvice, setAiAdvice]     = useState({ advice: "Analysing your swing…", luckyNumbers: [] });
  const [pageVisible, setPageVisible] = useState(false);
  const [trendLimit, setTrendLimit] = useState(10); // Default to last 10 rounds

  useEffect(() => { const t = setTimeout(() => setPageVisible(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const fetchAIAdvice = async (userScores, currentRank) => {
    try {
      const res = await fetch("/api/caddy/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: userScores.map(s => s.score).slice(0, 5), rank: currentRank })
      });
      const data = await res.json();
      setAiAdvice(data);
    } catch (err) { console.error("AI Caddy failed:", err); }
  };

  useEffect(() => {
    if (scores.length > 0 && profile) {
      const xp = scores.length * 50 + (profile?.charity_id ? 100 : 0);
      fetchAIAdvice(scores, getRank(xp).label);
    }
  }, [scores, profile]);

  useEffect(() => {
    if (user) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("checkout") === "success") {
        supabase.from("profiles").update({ subscription_status: "active" }).eq("id", user.id).then(({ error }) => {
          if (!error) { toast.success("🎉 Welcome Aboard! Your subscription is now active."); refreshData(); }
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user]);

  const logRound = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in to save a score.");
    
    const val = parseInt(newScore);
    if (!val || val < 1 || val > 45) return toast.error("Enter a valid score (1–45 pts).");
    
    // 2. Close modal and reset state instantly
    const entryVal = val;
    setNewScore(""); 
    setShowScoreModal(false);
    toast.success("Round logged! Syncing...");
    
    const tempId = Math.random().toString();
    const now = new Date().toISOString();
    const newEntry = { 
      id: tempId, 
      user_id: user.id, 
      score: entryVal, 
      date_played: now.split("T")[0], 
      created_at: now 
    };
    
    // 1. Optimistic Update (Immediate UI response)
    const oldScores = [...scores];
    setScores([newEntry, ...scores]);
    
    // 3. Background Sync

    // 3. Background Sync (Happens in background, doesn't block UI)
    (async () => {
      try {
        const { error: insError } = await supabase.from("scores").insert({ 
          user_id: user.id, 
          score: val, 
          date_played: new Date().toISOString().split("T")[0]
          // created_at is handled by default by DB
        });
        
        if (insError) throw insError;
        
        console.log("DB Update Successful for score:", val);
        
        // Final refresh to ensure everything is perfectly in sync
        await refreshData(true);
      } catch (error) { 
        console.error("Background sync failed critically:", error); 
        setScores(oldScores); // Rollback to previous known good state
        toast.error("Database sync failed. Your score was not saved."); 
      }
    })();
  };

  if (authLoading || (dataLoading && !profile)) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg-void)", flexDirection: "column", gap: "20px" }}>
      <div style={{ width: "48px", height: "48px", border: "3px solid var(--border-default)", borderTopColor: "var(--green-500)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "var(--text-3)", fontSize: "14px", fontWeight: 600, letterSpacing: "0.5px" }}>Loading dashboard…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0;
  const xp  = scores.length * 50 + (profile?.charity_id ? 100 : 0);
  const rank = getRank(xp);
  const nextRank = RANK_THRESHOLDS[RANK_THRESHOLDS.indexOf(rank) + 1];
  const xpProgress = nextRank ? ((xp - rank.min) / (nextRank.min - rank.min)) * 100 : 100;
  const best = scores.length ? Math.max(...scores.map(s => s.score)) : 0;
  const trend = scores.length >= 2 ? scores[0].score - scores[1].score : 0;
  const username = user?.email?.split("@")[0] || "Golfer";

  return (
    <div style={{ opacity: pageVisible ? 1 : 0, transform: pageVisible ? "none" : "translateY(12px)", transition: "all 0.5s ease", position: "relative", minHeight: "100vh" }}>
      {/* Background Orbs */}
      <div style={{ position: "absolute", top: "-100px", left: "-50px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)", borderRadius: "50%", animation: "float 10s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", right: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.04), transparent 70%)", borderRadius: "50%", animation: "float 12s ease-in-out infinite reverse", pointerEvents: "none" }} />
      
      {/* Header */}
      <div className="flex-between mb-8" style={{ flexWrap: "wrap", gap: "16px", position: "relative", zIndex: 1 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, <span style={{ color: "var(--green-400)", fontWeight: 700 }}>{username}</span> 👋</p>
        </div>
        <button
          onClick={() => setShowScoreModal(true)}
          className="btn btn-primary"
          style={{ gap: "8px", background: "linear-gradient(135deg, var(--green-500), #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.3)", padding: "12px 24px" }}
        >
          <Plus size={18} /> Log Round
        </button>
      </div>

      {/* Rank Banner */}
      <div className="card mb-6" style={{
        background: `linear-gradient(135deg, ${rank.color}18, var(--bg-surface))`,
        borderColor: rank.color + "44",
        boxShadow: `0 12px 48px ${rank.color}15`,
        position: "relative",
        overflow: "hidden",
        padding: "32px",
        borderRadius: "28px"
      }}>
        <div style={{ 
          position: "absolute", 
          top: 0, 
          right: 0, 
          bottom: 0, 
          width: "50%", 
          opacity: 0.25, 
          backgroundImage: "url('/premium_golf_dashboard_header_1776881727594.png')", 
          backgroundSize: "cover", 
          backgroundPosition: "center", 
          maskImage: "linear-gradient(to left, black 20%, transparent)", 
          WebkitMaskImage: "linear-gradient(to left, black 20%, transparent)" 
        }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: rank.color + "22", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 16px ${rank.color}44` }}>
              <Award size={28} color={rank.color} />
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: rank.color, marginBottom: "4px" }}>Current Rank</div>
              <div style={{ fontSize: "26px", fontWeight: 900, fontFamily: "Outfit", color: "var(--text-0)", letterSpacing: "-1px" }}>{rank.label}</div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <div className="flex-between mb-2">
              <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>{xp} XP earned</span>
              {nextRank && <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 700 }}>{nextRank.label} at {nextRank.min} XP</span>}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${xpProgress}%`, background: `linear-gradient(90deg, ${rank.color}, ${rank.color}aa)`, boxShadow: `0 0 8px ${rank.color}66`, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
          </div>

          <div style={{ padding: "16px 20px", background: "var(--bg-raised)", borderRadius: "14px", border: "1px solid var(--border-subtle)", minWidth: "200px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 700, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Charity Contribution</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="range" min="10" max="50" value={profile?.contribution_percentage || 10}
                onChange={async (e) => {
                  const val = parseInt(e.target.value);
                  await supabase.from("profiles").update({ contribution_percentage: val }).eq("id", user.id);
                  refreshData();
                }}
                style={{ flex: 1, accentColor: "var(--green-500)" }}
              />
              <span style={{ fontSize: "18px", fontWeight: 900, color: "var(--green-400)", fontFamily: "Outfit", width: "42px" }}>
                {profile?.contribution_percentage || 10}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-6 stagger-children">
        <StatCard label="Average Score"  val={avg || "–"} unit="pts"    icon={Target}   iconColor="#10b981" iconBg="rgba(16,185,129,0.1)"  change={trend} delay={0} />
        <StatCard label="Best Round"     val={best || "–"} unit="pts"   icon={Trophy}   iconColor="#fbbf24" iconBg="rgba(251,191,36,0.1)"  delay={100} />
        <StatCard label="Rounds Logged"  val={scores.length}            icon={Calendar} iconColor="#6366f1" iconBg="rgba(99,102,241,0.1)"  delay={200} />
        <StatCard label="Charity Impact" val={`$${(scores.length * 3.5).toFixed(0)}`} icon={Heart} iconColor="#f43f5e" iconBg="rgba(244,63,94,0.1)" delay={300} />
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", marginBottom: "32px", alignItems: "start" }}>
        <style>{`@media (max-width:1024px){.dashboard-main-grid{grid-template-columns:1fr!important}}`}</style>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Performance chart */}
          <div className="card reveal">
            <div className="card-header">
              <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={18} color="var(--green-500)" /> Performance Trend
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <select 
                  className="input btn-sm" 
                  value={trendLimit} 
                  onChange={e => setTrendLimit(e.target.value === "all" ? scores.length : parseInt(e.target.value))}
                  style={{ height: "26px", fontSize: "11px", padding: "0 8px", width: "80px", background: "var(--bg-raised)" }}
                >
                  <option value="5">Last 5</option>
                  <option value="7">Last 7</option>
                  <option value="10">Last 10</option>
                  <option value="15">Last 15</option>
                </select>
                <span className="badge badge-green">Showing {Math.min(scores.length, trendLimit)} rounds</span>
              </div>
            </div>
            {scores.length === 0 ? (
              <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "var(--text-3)" }}>
                <Target size={36} style={{ opacity: 0.3 }} />
                <span style={{ fontSize: "14px" }}>Log your first round to see your trend</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "180px", padding: "20px 0 0" }}>
                {[...scores].slice(0, trendLimit).reverse().map((s, i) => {
                  const pct = (s.score / 45) * 100;
                  return (
                    <div key={s.id} className="bar-col" style={{ flex: 1 }}
                      title={`${s.score} pts — ${new Date(s.date_played).toLocaleDateString()}`}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-2)", marginBottom: "4px" }}>{s.score}</div>
                      <div className="bar" style={{
                        height: `${pct}%`, minHeight: "8px", borderRadius: "6px 6px 0 0",
                        background: `linear-gradient(180deg, var(--green-400), rgba(16,185,129,0.25))`,
                        animation: `barGrow 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both`,
                      }} />
                      <div className="bar-label">{new Date(s.date_played).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Round History Logbook */}
          <div className="card reveal" style={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "500px", 
            padding: 0,
            overflow: "hidden",
            background: "var(--bg-surface)"
          }}>
            <div className="card-header" style={{ padding: "20px 24px 16px", marginBottom: 0, borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={18} color="var(--green-500)" /> Round History Logbook
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-indigo">{scores.length} Rounds</span>
                <button className="btn btn-ghost btn-sm" onClick={() => router.push("/draws")}>Statistics</button>
              </div>
            </div>
            
            <div className="hide-scrollbar" style={{ 
              flex: 1, 
              overflowY: "auto", 
              padding: "16px 20px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "10px"
            }}>
              {scores.length === 0 ? (
                <div style={{ padding: "80px 40px", textAlign: "center", color: "var(--text-3)", fontSize: "14px" }}>
                  <div style={{ marginBottom: "12px", opacity: 0.2 }}><Target size={48} style={{ margin: "0 auto" }} /></div>
                  Your golf round history will appear here.
                </div>
              ) : (
                scores.map((score, index) => (
                  <div key={score.id} className="history-item" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "13px 16px", background: "var(--bg-raised)", borderRadius: "14px",
                    border: "1px solid var(--border-subtle)", transition: "all 0.25s ease",
                    animation: `fadeUp 0.45s ease ${index * 0.04}s both`,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated, var(--bg-panel))"; e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.transform = "translateX(3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.transform = ""; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ 
                        width: "42px", height: "42px", borderRadius: "12px", 
                        background: "linear-gradient(135deg, var(--green-500), #059669)", 
                        display: "flex", alignItems: "center", justifyContent: "center", 
                        fontWeight: 900, color: "white", fontFamily: "Outfit", fontSize: "17px", 
                        flexShrink: 0,
                        boxShadow: "0 4px 12px rgba(16,185,129,0.25)" 
                      }}>
                        {score.score}
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-0)" }}>{score.course_name || "Official Round"}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <ShieldCheck size={12} color="var(--blue-400)" /> Verified Stableford
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {new Date(score.date_played).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-3)" }}>{new Date(score.date_played).getFullYear()}</div>
                      </div>
                      <button
                        onClick={() => {
                          setEditScoreData(score);
                          setNewScore(String(score.score));
                        }}
                        className="btn btn-icon btn-sm"
                        style={{ width: "36px", height: "36px", borderRadius: "12px" }}
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ padding: "12px", textAlign: "center", borderTop: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.3px" }}>Scroll to see older rounds</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* AI Caddy */}
          <div className="card reveal" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), var(--bg-surface))", borderColor: "rgba(99,102,241,0.25)", boxShadow: "0 0 30px rgba(99,102,241,0.08)" }}>
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={16} color="#818cf8" />
                </div>
                <h3 style={{ fontSize: "16px" }}>AI Caddy</h3>
              </div>
              <button
                onClick={() => fetchAIAdvice(scores, getRank(xp).label)}
                className="btn btn-sm btn-secondary"
                disabled={insightLoading}
                style={{ height: "28px", fontSize: "11px" }}
              >{insightLoading ? "Analysing…" : "↻ Refresh"}</button>
            </div>
            <div style={{ background: "rgba(99,102,241,0.06)", borderRadius: "var(--r-sm)", padding: "16px", marginBottom: "16px", border: "1px solid rgba(99,102,241,0.12)" }}>
              <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-1)", fontStyle: "italic" }}>
                "{aiAdvice?.advice || "Log more rounds to unlock personalized caddy advice."}"
              </p>
            </div>
            {aiAdvice?.luckyNumbers?.length > 0 && (
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "1.5px" }}>Your Lucky Numbers</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {aiAdvice.luckyNumbers.map((n, i) => (
                    <div key={i} style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.08))",
                      border: "1px solid rgba(99,102,241,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 800, color: "#818cf8", fontFamily: "Outfit",
                      animation: `scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both`,
                    }}>{n}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Winnings */}
          <div className="card reveal">
            <div className="card-header">
              <h3 style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trophy size={16} color="var(--gold-400)" /> Active Winnings
              </h3>
            </div>
            {user && <EnhancedWinnings userId={user.id} />}
          </div>
        </div>
      </div>

      {/* Score Modal */}
      {(showScoreModal || editScoreData) && (
        <div className="modal-overlay" onClick={() => { setShowScoreModal(false); setEditScoreData(null); setNewScore(""); }} style={{ animation: "fadeIn 0.2s ease" }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)", maxWidth: "420px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {editScoreData ? <Edit3 size={22} color="var(--green-400)" /> : <Plus size={22} color="var(--green-400)" />}
              </div>
              <div>
                <h3 style={{ fontSize: "20px", marginBottom: "2px" }}>{editScoreData ? "Edit Round Score" : "Log a Round"}</h3>
                <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Enter your Stableford score (1–45)</p>
              </div>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (editScoreData) {
                const val = parseInt(newScore);
                if (!val || val < 1 || val > 45) return toast.error("Enter a valid score (1–45 pts).");
                setPosting(true);
                try {
                  await supabase.from("scores").update({ score: val }).eq("id", editScoreData.id);
                  await refreshData();
                  toast.success("Score updated successfully!");
                  setEditScoreData(null);
                  setNewScore("");
                } catch (err) { toast.error("Failed to update score"); }
                finally { setPosting(false); }
              } else {
                await logRound(e);
              }
            }}>
              <input
                type="number" className="input" placeholder="e.g. 32" min={1} max={45}
                value={newScore} onChange={e => setNewScore(e.target.value)}
                style={{ marginBottom: "20px", fontSize: "18px", textAlign: "center", fontWeight: 800, fontFamily: "Outfit" }}
                autoFocus required
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowScoreModal(false); setEditScoreData(null); setNewScore(""); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, background: "linear-gradient(135deg, var(--green-500), #059669)" }} disabled={posting}>
                  {posting ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                      Saving…
                    </span>
                  ) : (editScoreData ? "Save Changes ✓" : "Submit Round ✓")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes barGrow { from { height: 0; opacity: 0; } to { opacity: 1; } }
        .history-item:hover {
          transform: scale(1.02) rotateX(2deg);
          border-color: var(--green-500) !important;
          background: var(--bg-overlay) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
