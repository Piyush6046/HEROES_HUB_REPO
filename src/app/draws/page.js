"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Trophy, Target, Calendar, ChevronDown, ChevronUp,
  Award, CheckCircle, DollarSign,
  Download, Eye, Activity, ArrowRight, Sparkles, ShieldCheck, Search, Filter
} from "lucide-react";
import { useGlobalData } from "@/context/DataContext";

function DrawBall({ num, delay = 0, size = "md", active = false }) {
  const sizes = {
    sm: { w: "32px", h: "32px", font: "13px" },
    md: { w: "50px", h: "50px", font: "18px" },
    lg: { w: "68px", h: "68px", font: "26px" },
  };
  const dim = sizes[size] || sizes.md;

  return (
    <div className="draw-ball-3d" style={{
      width: dim.w, height: dim.h, fontSize: dim.font,
      display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: "50%", fontWeight: 900, fontFamily: "'Outfit', sans-serif",
      background: active
        ? "linear-gradient(135deg, var(--gold-400), var(--gold-500))"
        : "linear-gradient(135deg, var(--green-500), var(--green-600))",
      color: "white",
      boxShadow: active 
        ? `0 15px 30px ${active ? "rgba(251,191,36,0.4)" : "rgba(16,185,129,0.3)"}` 
        : "0 8px 20px rgba(0,0,0,0.3)",
      border: "2px solid rgba(255,255,255,0.2)",
      position: "relative", overflow: "hidden",
      animation: `ballPop 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
      flexShrink: 0,
      cursor: "pointer"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2) translateY(-10px) rotate(10deg)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
    >
      <div style={{ position: "relative", zIndex: 2 }}>{num}</div>
      <div style={{ position: "absolute", top: "10%", left: "10%", width: "25%", height: "25%", background: "rgba(255,255,255,0.4)", borderRadius: "50%", filter: "blur(2px)" }} />
    </div>
  );
}

const drawSteps = [
  { n: "01", title: "Play & Log Scores", desc: "After every golf round, log your Stableford points in the dashboard. Each score you record becomes a potential lucky number in the monthly draw." },
  { n: "02", title: "Monthly Numbers Published", desc: "At the end of each month, the Draw Engine randomly selects 5 winning numbers. These are announced here in the Prize Center for full transparency." },
  { n: "03", title: "Match & Win", desc: "Your logged scores are automatically compared to the 5 winning numbers. Match 3 = prize pool share, 4 = gold pool, 5 = full Jackpot! 🏆" },
];

export default function Draws() {
  const { draws, scores: userScores, loading } = useGlobalData();
  const [expanded, setExpanded]       = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy]           = useState("date");
  const [pageVisible, setPageVisible] = useState(false);
  const [showHowModal, setShowHowModal] = useState(false);
  const [activeStep, setActiveStep]   = useState(0);

  useEffect(() => { const t = setTimeout(() => setPageVisible(true), 60); return () => clearTimeout(t); }, []);

  const countMatches = (winningNums, userScs) => {
    if (!winningNums || !userScs) return 0;
    const userSet = new Set(userScs.map(s => s.score));
    return winningNums.filter(n => userSet.has(n)).length;
  };

  const getTierInfo = (matches) => {
    if (matches >= 5) return { color: "#10b981", text: "5-Match Jackpot! 🏆", bg: "rgba(16,185,129,0.1)",  icon: <Trophy size={22} color="#10b981" /> };
    if (matches >= 4) return { color: "#fbbf24", text: "4-Match Prize 🥇",   bg: "rgba(251,191,36,0.1)",  icon: <Award size={22} color="#fbbf24" /> };
    if (matches >= 3) return { color: "#3b82f6", text: "3-Match Entry 🎯",   bg: "rgba(59,130,246,0.1)",  icon: <Award size={22} color="#3b82f6" /> };
    return            { color: "#64748b",  text: "No Match",              bg: "rgba(100,116,139,0.08)", icon: <Target size={22} color="#64748b" /> };
  };

  const filteredDraws = draws.filter(d => filterStatus === "all" ? true : d.status === filterStatus);
  const sortedDraws = [...filteredDraws].sort((a, b) => {
    if (sortBy === "date")    return new Date(b.month_year) - new Date(a.month_year);
    if (sortBy === "prize")   return (b.total_pool || 0) - (a.total_pool || 0);
    if (sortBy === "matches") {
      const aM = countMatches(a.winning_numbers, userScores);
      const bM = countMatches(b.winning_numbers, userScores);
      return bM - aM;
    }
    return 0;
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "20px" }}>
      <div style={{ width: "48px", height: "48px", border: "3px solid var(--border-default)", borderTopColor: "var(--green-500)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "var(--text-3)", fontSize: "14px", fontWeight: 600 }}>Curating prize draws…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  const latestDraw = draws[0];
  const userMatchesLatest = latestDraw ? countMatches(latestDraw.winning_numbers, userScores) : 0;
  const latestTier = getTierInfo(userMatchesLatest);

  return (
    <div style={{ opacity: pageVisible ? 1 : 0, transform: pageVisible ? "none" : "translateY(12px)", transition: "all 0.5s ease" }}>

      {/* ════ HOW IT WORKS MODAL ════ */}
      {showHowModal && (
        <div
          onClick={() => setShowHowModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
            animation: "fadeIn 0.25s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "28px",
              padding: "clamp(28px, 5vw, 56px)",
              maxWidth: "520px", width: "100%",
              position: "relative",
              boxShadow: "0 0 80px rgba(16,185,129,0.15), 0 40px 100px rgba(0,0,0,0.6)",
              animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setShowHowModal(false)}
              style={{
                position: "absolute", top: "20px", right: "20px",
                background: "var(--bg-base)", border: "1px solid var(--border-default)",
                borderRadius: "50%", width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-2)", fontSize: "18px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--border-default)"; e.currentTarget.style.color = "var(--text-0)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-base)"; e.currentTarget.style.color = "var(--text-2)"; }}
            >✕</button>

            {/* Progress bar */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
              {drawSteps.map((_, i) => (
                <div key={i} style={{
                  height: "4px", flex: 1, borderRadius: "99px",
                  background: i <= activeStep ? "var(--green-400)" : "var(--border-default)",
                  transition: "background 0.4s ease",
                }} />
              ))}
            </div>

            {/* Step number */}
            <div style={{
              fontSize: "72px", fontWeight: 900, fontFamily: "Outfit",
              background: "linear-gradient(135deg, var(--green-500), #818cf8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-4px", lineHeight: 1, marginBottom: "20px",
            }}>{drawSteps[activeStep].n}</div>

            {/* Title */}
            <h3 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, marginBottom: "16px", color: "var(--text-0)" }}>
              {drawSteps[activeStep].title}
            </h3>

            {/* Description */}
            <p style={{ color: "var(--text-2)", fontSize: "16px", lineHeight: 1.8, marginBottom: "40px" }}>
              {drawSteps[activeStep].desc}
            </p>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => setActiveStep(s => Math.max(0, s - 1))}
                disabled={activeStep === 0}
                style={{
                  padding: "12px 28px", borderRadius: "99px",
                  border: "1px solid var(--border-default)",
                  background: "transparent", color: activeStep === 0 ? "var(--text-3)" : "var(--text-1)",
                  cursor: activeStep === 0 ? "not-allowed" : "pointer",
                  fontSize: "15px", fontWeight: 600,
                  transition: "all 0.2s ease",
                  opacity: activeStep === 0 ? 0.4 : 1,
                }}
              >← Back</button>

              <span style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 700 }}>
                {activeStep + 1} / {drawSteps.length}
              </span>

              {activeStep < drawSteps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(s => s + 1)}
                  style={{
                    padding: "12px 28px", borderRadius: "99px",
                    background: "linear-gradient(135deg, var(--green-500), #059669)",
                    border: "none", color: "#fff",
                    cursor: "pointer", fontSize: "15px", fontWeight: 700,
                    boxShadow: "0 0 20px rgba(16,185,129,0.35)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(16,185,129,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 20px rgba(16,185,129,0.35)"; }}
                >Next →</button>
              ) : (
                <button
                  onClick={() => setShowHowModal(false)}
                  style={{
                    padding: "12px 28px", borderRadius: "99px",
                    background: "linear-gradient(135deg, var(--green-500), #059669)",
                    border: "none", color: "#fff",
                    cursor: "pointer", fontSize: "15px", fontWeight: 700,
                    boxShadow: "0 0 20px rgba(16,185,129,0.35)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                >Let's Play! 🏌️</button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ════ END MODAL ════ */}
      {/* Background glow */}
      <div style={{ position: "fixed", top: "-200px", right: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ position: "relative", zIndex: 1, marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={15} color="var(--green-500)" />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--green-500)" }}>Prize Center</span>
            </div>
            <h1 className="page-title">Luck of the Course</h1>
            <p className="page-subtitle">Your monthly prize draws and score matching results</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-ghost" style={{ gap: "8px" }}><Download size={15} /> Export</button>
            <button
              className="btn btn-primary"
              style={{ gap: "8px", background: "linear-gradient(135deg,var(--green-500),#059669)", cursor: "pointer" }}
              onClick={() => { setActiveStep(0); setShowHowModal(true); }}
            ><Sparkles size={15} /> How It Works</button>
          </div>
        </div>
      </header>

      {/* Featured Latest Draw */}
      {latestDraw && (
        <section style={{
          marginBottom: "40px",
          background: "var(--bg-surface)",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--border-green)",
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(16,185,129,0.08)",
          animation: "fadeUp 0.5s ease",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px" }} className="draw-featured-grid">
            <div style={{ padding: "clamp(20px,5vw,40px)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "100%", opacity: 0.05, backgroundImage: "url('https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&w=800&q=80')", backgroundSize: "cover", mixBlendMode: "overlay" }} />
              <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)", pointerEvents: "none", animation: "float 6s ease-in-out infinite" }} />
              
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <span className="badge badge-green" style={{ animation: "pulse 2s ease-in-out infinite" }}>● LATEST DRAW</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-2)" }}>{latestDraw.month_year}</span>
                </div>
                <h2 style={{ fontSize: "26px", marginBottom: "32px", color: "var(--text-0)" }}>Winning Numbers</h2>
              <div style={{ display: "flex", gap: "14px", marginBottom: "40px", flexWrap: "wrap" }}>
                {latestDraw.winning_numbers.map((num, i) => (
                  <DrawBall key={i} num={num} delay={i * 0.1} size="lg" active={userScores.some(s => s.score === num)} />
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {[
                  { label: "5-Match Jackpot", val: latestDraw.prize_pool_5match, color: "var(--green-400)" },
                  { label: "4-Match Pool",    val: latestDraw.prize_pool_4match, color: "var(--gold-400)" },
                  { label: "3-Match Pool",    val: latestDraw.prize_pool_3match, color: "var(--blue-400)" },
                ].map((p, i) => (
                  <div key={i} style={{ padding: "16px", background: "var(--bg-raised)", borderRadius: "14px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>{p.label}</div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: p.color, fontFamily: "Outfit", letterSpacing: "-1px" }}>
                      ${p.val?.toLocaleString() || "0"}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>

            <div style={{ borderLeft: "1px solid var(--border-subtle)", padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: `linear-gradient(180deg, ${latestTier.bg}, transparent)` }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: latestTier.bg, border: `2px solid ${latestTier.color}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 0 24px ${latestTier.color}33`, animation: "scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
                {latestTier.icon}
              </div>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Your Result</h3>
              <div style={{ fontSize: "20px", fontWeight: 800, color: latestTier.color, marginBottom: "12px" }}>{latestTier.text}</div>
              <p style={{ fontSize: "13px", color: "var(--text-3)", lineHeight: 1.6, marginBottom: "24px" }}>
                {userMatchesLatest > 0
                  ? `Congratulations! You matched ${userMatchesLatest} number${userMatchesLatest > 1 ? "s" : ""} in the ${latestDraw.month_year} draw.`
                  : "No matches this time. Keep playing to increase your chances!"}
              </p>
              <button className="btn btn-secondary" style={{ width: "100%", borderRadius: "10px" }}>
                Claim Winnings <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Stats Grid */}
      <div className="grid-4 mb-10">
        {[
          { label: "Total Lifetime Pool",    val: `$${draws.reduce((s, d) => s + (d.total_pool || 0), 0).toLocaleString()}`, icon: DollarSign, color: "var(--green-500)", bg: "rgba(16,185,129,0.1)" },
          { label: "Completed Draws",        val: draws.filter(d => d.status === "completed").length, icon: CheckCircle, color: "var(--blue-500)", bg: "rgba(59,130,246,0.1)" },
          { label: "Your Best Match",        val: draws.length > 0 && userScores.length > 0 ? `${Math.max(...draws.map(d => countMatches(d.winning_numbers, userScores)), 0)} Matches` : "0 Matches", icon: Award, color: "var(--gold-500)", bg: "rgba(245,158,11,0.1)" },
          { label: "Lifetime Performance",   val: `${userScores.reduce((s, sc) => s + (sc.score || 0), 0)} pts`, icon: Activity, color: "var(--rose-500)", bg: "rgba(244,63,94,0.1)" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
            <div className="stat-card-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-card-value">{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Historical Archive */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <h3 style={{ fontSize: "22px", fontWeight: 800 }}>Historical Archive</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Filter size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
              <select className="input" style={{ paddingLeft: "32px", paddingRight: "12px" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="date">Most Recent</option>
              <option value="prize">Highest Prize</option>
              <option value="matches">Most Matches</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sortedDraws.length === 0 ? (
            <div className="card flex-center" style={{ padding: "80px", borderStyle: "dashed", background: "transparent" }}>
              <div style={{ textAlign: "center" }}>
                <Search size={44} color="var(--text-3)" style={{ marginBottom: "16px", opacity: 0.3 }} />
                <div style={{ color: "var(--text-3)", fontSize: "15px" }}>No draws matching your criteria.</div>
              </div>
            </div>
          ) : sortedDraws.map((draw, idx) => {
            const matches  = countMatches(draw.winning_numbers, userScores);
            const tier     = getTierInfo(matches);
            const isExpanded = expanded === draw.id;

            return (
              <div key={draw.id} style={{
                background: "var(--bg-surface)", borderRadius: "var(--r-lg)",
                border: `1px solid ${isExpanded ? "var(--border-strong)" : "var(--border-default)"}`,
                overflow: "hidden", cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                animation: `fadeUp 0.4s ease ${idx * 0.05}s both`,
                boxShadow: isExpanded ? "0 8px 40px rgba(0,0,0,0.3)" : "var(--shadow-card)",
              }}
                onClick={() => setExpanded(isExpanded ? null : draw.id)}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
              >
                <div style={{ padding: "20px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-raised)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                        <Calendar size={20} color="var(--text-2)" />
                      </div>
                      <div>
                        <div style={{ fontSize: "17px", fontWeight: 800, marginBottom: "6px" }}>{draw.month_year}</div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span className={`badge ${draw.status === "completed" ? "badge-green" : "badge-rose"}`}>{draw.status.toUpperCase()}</span>
                          <span className="badge badge-indigo">{draw.draw_type?.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Prize Pool</div>
                        <div style={{ fontSize: "17px", fontWeight: 900, color: "var(--green-400)", fontFamily: "Outfit" }}>${draw.total_pool?.toLocaleString() || "0"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Matched</div>
                        <div style={{ fontSize: "17px", fontWeight: 900, color: tier.color, fontFamily: "Outfit" }}>{matches} Balls</div>
                      </div>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.3s ease", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                        <ChevronDown size={18} color="var(--text-2)" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ padding: "0 28px 28px", borderTop: "1px solid var(--border-subtle)", animation: "fadeUp 0.3s ease" }}>
                    <div style={{ paddingTop: "24px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Winning Combination</div>
                      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
                        {draw.winning_numbers.map((num, i) => (
                          <DrawBall key={i} num={num} delay={i * 0.08} size="md" active={userScores.some(s => s.score === num)} />
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                        {[
                          { label: "Jackpot (5-Match)", val: draw.prize_pool_5match, color: "var(--green-400)" },
                          { label: "4-Match Pool",      val: draw.prize_pool_4match, color: "var(--gold-400)" },
                          { label: "3-Match Pool",      val: draw.prize_pool_3match, color: "var(--blue-400)" },
                        ].map((p, i) => (
                          <div key={i} style={{ padding: "16px", background: "var(--bg-raised)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", marginBottom: "6px", fontWeight: 700 }}>{p.label}</div>
                            <div style={{ fontSize: "19px", fontWeight: 900, color: p.color, fontFamily: "Outfit" }}>${p.val?.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(16,185,129,0.04)", borderRadius: "12px", border: "1px solid rgba(16,185,129,0.12)" }}>
                        <div style={{ display: "flex", gap: "28px" }}>
                          <div>
                            <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "3px" }}>Published On</div>
                            <div style={{ fontSize: "13px", color: "var(--text-1)", fontWeight: 600 }}>{draw.published_at ? new Date(draw.published_at).toLocaleDateString() : "N/A"}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "3px" }}>Verification</div>
                            <div style={{ fontSize: "13px", color: "var(--text-0)", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                              <ShieldCheck size={14} color="var(--green-500)" /> Verified Result
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-secondary btn-sm" style={{ gap: "6px" }} onClick={e => e.stopPropagation()}>
                          <Eye size={14} /> Breakdown
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1000px) { .draw-featured-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
