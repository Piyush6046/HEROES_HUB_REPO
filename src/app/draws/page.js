"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import {
  Trophy, Target, Calendar, Users, ChevronDown, ChevronUp,
  Award, CheckCircle, Clock, X, TrendingUp, Filter,
  Download, Eye, Zap, BarChart3, Activity, DollarSign,
  ArrowRight, Sparkles, Star, ShieldCheck, Search
} from "lucide-react";

function DrawBall({ num, delay = 0, size = "md", active = false }) {
  const sizeClasses = {
    sm: { w: "32px", h: "32px", font: "14px" },
    md: { w: "48px", h: "48px", font: "18px" },
    lg: { w: "64px", h: "64px", font: "24px" }
  };

  const dim = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`draw-ball ${active ? 'active' : ''}`}
      style={{
        animationDelay: delay + "s",
        width: dim.w,
        height: dim.h,
        fontSize: dim.font,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        fontWeight: 900,
        fontFamily: "'Outfit', sans-serif",
        background: active
          ? "linear-gradient(135deg, var(--gold-400), var(--gold-500))"
          : "linear-gradient(135deg, var(--green-500), var(--green-600))",
        color: "white",
        boxShadow: active
          ? "0 0 25px rgba(245, 158, 11, 0.4)"
          : "0 0 20px rgba(16, 185, 129, 0.3)",
        border: "2px solid rgba(255,255,255,0.2)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ position: "relative", zIndex: 2 }}>{num}</div>
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%", height: "50%",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50% 50% 0 0"
      }}></div>
    </div>
  );
}

export default function Draws() {
  const [draws, setDraws] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [scores, setScores] = useState([]);
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: d }, { data: sc }, { data: us }] = await Promise.all([
        supabase.from("draws").select("*").order("month_year", { ascending: false }),
        supabase.from("scores").select("user_id, score"),
        user ? supabase.from("scores").select("*").eq("user_id", user.id).order("date_played", { ascending: false }).limit(10) : { data: [] },
      ]);
      setDraws(d || []);
      setScores(sc || []);
      setUserScores(us || []);
      setLoading(false);
    }
    init();
  }, []);

  const countMatches = (winningNums, userScs) => {
    if (!winningNums || !userScs) return 0;
    const userSet = new Set(userScs.map(s => s.score));
    return winningNums.filter(n => userSet.has(n)).length;
  };

  const getTierInfo = (matches) => {
    if (matches >= 5) return { color: "#10b981", text: "5-Match Jackpot!", icon: <Trophy size={20} />, bg: "rgba(16,185,129,0.1)" };
    if (matches >= 4) return { color: "#fbbf24", text: "4-Match Prize", icon: <Award size={20} />, bg: "rgba(251,191,36,0.1)" };
    if (matches >= 3) return { color: "#3b82f6", text: "3-Match Entry", icon: <Award size={20} />, bg: "rgba(59,130,246,0.1)" };
    return { color: "#64748b", text: "No Match", icon: <Target size={20} />, bg: "rgba(100,116,139,0.1)" };
  };

  const filteredDraws = draws.filter(draw => {
    if (filterStatus === "all") return true;
    return draw.status === filterStatus;
  });

  const sortedDraws = [...filteredDraws].sort((a, b) => {
    switch (sortBy) {
      case "date": return new Date(b.month_year) - new Date(a.month_year);
      case "prize": return (b.total_pool || 0) - (a.total_pool || 0);
      case "matches":
        const aMatches = userScores.length > 0 ? countMatches(a.winning_numbers, userScores) : 0;
        const bMatches = userScores.length > 0 ? countMatches(b.winning_numbers, userScores) : 0;
        return bMatches - aMatches;
      default: return 0;
    }
  });

  if (loading) return (
    <div className="flex-center" style={{ height: "calc(100vh - 80px)" }}>
      <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <Trophy size={48} color="var(--text-3)" />
        <div style={{ color: "var(--text-3)", fontSize: "14px", fontWeight: 600 }}>Curating the prize draws...</div>
      </div>
    </div>
  );

  const latestDraw = draws[0];
  const userMatchesLatest = latestDraw ? countMatches(latestDraw.winning_numbers, userScores) : 0;
  const latestTier = getTierInfo(userMatchesLatest);

  return (
    <>
      {/* Decorative Background Elements */}
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }}></div>

      <header style={{ position: "relative", zIndex: 1, marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={18} color="var(--green-500)" />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--green-500)" }}>Prize Center</span>
            </div>
            <h1 className="page-title">Luck of the Course</h1>
            <p className="page-subtitle">Your monthly prize draws and score matching results</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-ghost" style={{ gap: "8px" }}>
              <Download size={16} /> Export
            </button>
            <button className="btn btn-primary" style={{ gap: "8px" }}>
              <Sparkles size={16} /> How it works
            </button>
          </div>
        </div>
      </header>

      {/* Featured Latest Draw Section */}
      {latestDraw && (
        <section className="card" style={{
          marginBottom: "40px",
          border: "1px solid var(--border-green)",
          background: "linear-gradient(135deg, var(--bg-surface), var(--bg-base))",
          padding: "0",
          overflow: "hidden"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "0" }}>
            <div style={{ padding: "32px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <span className="badge badge-green">LATEST DRAW</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-2)" }}>{latestDraw.month_year}</span>
              </div>

              <h2 style={{ fontSize: "28px", marginBottom: "32px" }}>Winning Numbers</h2>

              <div style={{ display: "flex", gap: "16px", marginBottom: "40px" }}>
                {latestDraw.winning_numbers.map((num, i) => (
                  <DrawBall
                    key={i}
                    num={num}
                    delay={i * 0.1}
                    size="lg"
                    active={userScores.some(s => s.score === num)}
                  />
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-3)", textTransform: "uppercase", marginBottom: "8px" }}>5-Match Jackpot</div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--green-400)", fontFamily: "'Outfit'" }}>
                    ${latestDraw.prize_pool_5match?.toLocaleString() || "0"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-3)", textTransform: "uppercase", marginBottom: "8px" }}>4-Match Pool</div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--gold-400)", fontFamily: "'Outfit'" }}>
                    ${latestDraw.prize_pool_4match?.toLocaleString() || "0"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-3)", textTransform: "uppercase", marginBottom: "8px" }}>3-Match Pool</div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--blue-400)", fontFamily: "'Outfit'" }}>
                    ${latestDraw.prize_pool_3match?.toLocaleString() || "0"}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: "rgba(16,185,129,0.03)",
              borderLeft: "1px solid var(--border-default)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center"
            }}>
              <div style={{
                width: "80px", height: "80px",
                borderRadius: "50%",
                background: latestTier.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px"
              }}>
                {latestTier.icon}
              </div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Your Result</h3>
              <div style={{ fontSize: "24px", fontWeight: 800, color: latestTier.color, marginBottom: "12px" }}>
                {latestTier.text}
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-3)", lineHeight: 1.5, marginBottom: "24px" }}>
                {userMatchesLatest > 0
                  ? `Congratulations! You matched ${userMatchesLatest} numbers in the ${latestDraw.month_year} draw.`
                  : "No matches this time. Keep playing to increase your chances for next month!"}
              </p>
              <button className="btn btn-secondary" style={{ width: "100%" }}>
                Claim Winnings <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Stats Grid */}
      <div className="grid-4 mb-10">
        {[
          { label: "Total Lifetime Pool", val: `$${draws.reduce((sum, d) => sum + (d.total_pool || 0), 0).toLocaleString()}`, icon: DollarSign, color: "var(--green-500)", bg: "rgba(16,185,129,0.1)" },
          { label: "Completed Draws", val: draws.filter(d => d.status === 'completed').length, icon: CheckCircle, color: "var(--blue-500)", bg: "rgba(59,130,246,0.1)" },
          {
            label: "Your Best Match",
            val: draws.length > 0 && userScores.length > 0
              ? `${Math.max(...draws.map(d => countMatches(d.winning_numbers, userScores)), 0)} Matches`
              : "0 Matches",
            icon: Award,
            color: "var(--gold-500)",
            bg: "rgba(245,158,11,0.1)"
          },
          {
            label: "Lifetime Performance",
            val: `${userScores.reduce((sum, s) => sum + (s.score || 0), 0)} pts`,
            icon: Activity,
            color: "var(--rose-500)",
            bg: "rgba(244,63,94,0.1)"
          }
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-card-value">{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Historical Draws */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: 800 }}>Historical Archive</h3>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ position: "relative" }}>
                <Filter size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
                <select className="input" style={{ width: "160px", paddingLeft: "36px" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <select className="input" style={{ width: "160px" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date">Most Recent First</option>
                <option value="prize">Highest Prize Pool</option>
                <option value="matches">Most Matchings</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {sortedDraws.length === 0 ? (
              <div className="card flex-center" style={{ padding: "80px", background: "transparent", borderStyle: "dashed" }}>
                <div style={{ textAlign: "center" }}>
                  <Search size={48} color="var(--text-3)" style={{ marginBottom: "20px", opacity: 0.3 }} />
                  <div style={{ fontSize: "16px", color: "var(--text-3)" }}>No draws found matching your criteria.</div>
                </div>
              </div>
            ) : (
              sortedDraws.map(draw => {
                const matches = countMatches(draw.winning_numbers, userScores);
                const isExpanded = expanded === draw.id;

                return (
                  <div key={draw.id} className="card animate-fade-up" style={{ padding: "0", cursor: "pointer", transition: "transform 0.2s ease" }} onClick={() => setExpanded(isExpanded ? null : draw.id)}>
                    <div style={{ padding: "24px 32px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--bg-raised)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-subtle)" }}>
                            <Calendar size={24} color="var(--text-2)" />
                          </div>
                          <div>
                            <div style={{ fontSize: "18px", fontWeight: 800 }}>{draw.month_year}</div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                              <span className={`badge ${draw.status === 'completed' ? 'badge-green' : 'badge-rose'}`} style={{ fontSize: "11px", fontWeight: 700 }}>
                                {draw.status.toUpperCase()}
                              </span>
                              <span className="badge badge-indigo" style={{ fontSize: "11px", fontWeight: 700 }}>
                                {draw.draw_type.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Prize Pool</div>
                            <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--green-400)" }}>${draw.total_pool?.toLocaleString() || "0"}</div>
                          </div>
                          <div style={{ width: "1px", height: "40px", background: "var(--border-subtle)" }}></div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Matched</div>
                            <div style={{ fontSize: "20px", fontWeight: 900, color: getTierInfo(matches).color }}>
                              {matches} Balls
                            </div>
                          </div>
                          <button className="btn btn-icon" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "0 32px 32px", borderTop: "1px solid var(--border-subtle)", marginTop: "0", background: "rgba(255,255,255,0.01)" }}>
                        <div style={{ paddingTop: "32px" }}>
                          <div style={{ marginBottom: "20px", fontSize: "14px", fontWeight: 700, color: "var(--text-2)" }}>WINNING COMBINATION</div>
                          <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                            {draw.winning_numbers.map((num, i) => (
                              <DrawBall key={i} num={num} size="md" active={userScores.some(s => s.score === num)} />
                            ))}
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
                            <div style={{ padding: "20px", background: "var(--bg-raised)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                              <div style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", marginBottom: "8px", fontWeight: 700 }}>Jackpot (5-Match)</div>
                              <div style={{ fontSize: "20px", fontWeight: 900 }}>${draw.prize_pool_5match?.toLocaleString()}</div>
                            </div>
                            <div style={{ padding: "20px", background: "var(--bg-raised)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                              <div style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", marginBottom: "8px", fontWeight: 700 }}>4-Match Pool</div>
                              <div style={{ fontSize: "20px", fontWeight: 900 }}>${draw.prize_pool_4match?.toLocaleString()}</div>
                            </div>
                            <div style={{ padding: "20px", background: "var(--bg-raised)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                              <div style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", marginBottom: "8px", fontWeight: 700 }}>Entry Pool (3-Match)</div>
                              <div style={{ fontSize: "20px", fontWeight: 900 }}>${draw.prize_pool_3match?.toLocaleString()}</div>
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "rgba(16,185,129,0.05)", borderRadius: "12px", border: "1px solid rgba(16,185,129,0.1)" }}>
                            <div style={{ display: "flex", gap: "32px" }}>
                              <div>
                                <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>Published On</div>
                                <div style={{ fontSize: "14px", color: "var(--text-1)", fontWeight: 600 }}>{draw.published_at ? new Date(draw.published_at).toLocaleDateString() : "N/A"}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>Verification</div>
                                <div style={{ fontSize: "14px", color: "var(--text-0)", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                                  <ShieldCheck size={16} color="var(--green-500)" /> Verified Result
                                </div>
                              </div>
                            </div>
                            <button className="btn btn-secondary btn-sm" style={{ gap: "8px" }}>
                              <Eye size={16} /> Detailed Breakdown
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

