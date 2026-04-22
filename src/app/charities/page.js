"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, Search, CheckCircle, ExternalLink, Sparkles, ShieldCheck, Filter, Globe, Star, ChevronDown, ChevronUp, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useGlobalData } from "@/context/DataContext";

export default function Charities() {
  const { user } = useAuth();
  const { charities, profile, loading, refreshData } = useGlobalData();
  const [search, setSearch]         = useState("");
  const [saving, setSaving]         = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiInput, setAiInput]       = useState("");
  const [expanded, setExpanded]     = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy]         = useState("name");
  const [viewMode, setViewMode]     = useState("grid");
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setPageVisible(true), 60); return () => clearTimeout(t); }, []);

  const setPrimary = async (id) => {
    if (!user) return;
    setSaving(id);
    await supabase.from("profiles").update({ charity_id: id }).eq("id", user.id);
    await refreshData();
    setSaving(null);
  };

  const runAiMatch = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/matchmaker", { method: "POST", body: JSON.stringify({ userPreference: aiInput, charities }) });
      if (!res.ok) throw new Error("AI unavailable");
      const match = await res.json();
      if (match.id) { await setPrimary(match.id); toast.success(`AI matched you with "${match.name}"!\n\n${match.reason}`, { duration: 6000 }); }
    } catch { toast.error("AI matching unavailable — please select manually below."); }
    setAiLoading(false);
  };

  const categories = ["all", ...new Set(charities.map(c => c.category).filter(Boolean))];
  const filtered = charities.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase())) &&
    (selectedCategory === "all" || c.category === selectedCategory)
  );
  const sortedCharities = [...filtered].sort((a, b) => {
    if (sortBy === "name")     return a.name.localeCompare(b.name);
    if (sortBy === "featured") return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    if (sortBy === "category") return (a.category || "").localeCompare(b.category || "");
    return 0;
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "20px" }}>
      <div style={{ width: "48px", height: "48px", border: "3px solid var(--border-default)", borderTopColor: "#f43f5e", borderRadius: "50%", animation: "spinC 0.8s linear infinite" }} />
      <div style={{ color: "var(--text-3)", fontSize: "14px", fontWeight: 600 }}>Loading charity partners…</div>
      <style>{`@keyframes spinC { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ opacity: pageVisible ? 1 : 0, transform: pageVisible ? "none" : "translateY(12px)", transition: "all 0.5s ease", position: "relative" }}>
      {/* Background glow orb */}
      <div style={{ position: "fixed", top: "-200px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(244,63,94,0.05) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none", animation: "float 8s ease-in-out infinite alternate" }} />

      {/* Header */}
      <div style={{ marginBottom: "32px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(244,63,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={15} color="#f43f5e" />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#f43f5e" }}>Charity Partners</span>
        </div>
        <h1 className="page-title">Choose Your Cause</h1>
        <p className="page-subtitle">15% of your subscription is automatically routed here every month.</p>
      </div>

      {/* Stats row */}
      <div className="grid-4 mb-6">
        {[
          { label: "Total Partners",  val: charities.length,                             icon: Heart,        color: "#f43f5e", bg: "rgba(244,63,94,0.1)" },
          { label: "Featured",        val: charities.filter(c => c.is_featured).length,  icon: Star,         color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
          { label: "Categories",      val: categories.length - 1,                         icon: Globe,        color: "#10b981", bg: "rgba(16,185,129,0.1)" },
          { label: "Your Selection",  val: profile?.charity_id ? charities.find(c => c.id === profile.charity_id)?.name?.split(" ")[0] || "Active" : "None", icon: CheckCircle, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
            <div className="stat-card-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div className="stat-card-value">{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Matchmaker */}
      <div className="card mb-6" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.07), var(--bg-surface))", borderColor: "rgba(99,102,241,0.22)", boxShadow: "0 0 30px rgba(99,102,241,0.06)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-50px", top: "-20px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)", pointerEvents: "none", animation: "pulse 3s infinite alternate" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px", position: "relative", zIndex: 1 }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(99,102,241,0.25)", animation: "float 4s ease-in-out infinite" }}>
            <Sparkles size={26} color="#818cf8" />
          </div>
          <div>
            <h3 style={{ fontSize: "17px", marginBottom: "3px" }}>AI Charity Matchmaker</h3>
            <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Describe what matters to you and Gemini AI finds your ideal match</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            className="input"
            placeholder='e.g. "I care about children, education, or ocean conservation"'
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAiMatch()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={runAiMatch} disabled={aiLoading} style={{ whiteSpace: "nowrap", padding: "12px 24px", minWidth: "140px", background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            {aiLoading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spinC 0.7s linear infinite" }} />
                Thinking…
              </span>
            ) : "✦ Find My Match"}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <select className="input" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ width: "160px" }}>
          {categories.map(cat => <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>)}
        </select>
        <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: "150px" }}>
          <option value="name">Name A–Z</option>
          <option value="featured">Featured First</option>
          <option value="category">By Category</option>
        </select>
        <div style={{ background: "var(--bg-surface)", borderRadius: "10px", padding: "4px", display: "flex", gap: "4px", border: "1px solid var(--border-default)" }}>
          {["grid", "list"].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`btn btn-sm ${viewMode === mode ? "btn-primary" : "btn-ghost"}`}
              style={{ padding: "7px 16px", borderRadius: "7px", fontSize: "12px", fontWeight: 700, textTransform: "capitalize" }}
            >{mode}</button>
          ))}
        </div>
        <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input className="input" placeholder="Search charities…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "36px", width: "100%" }} />
        </div>
      </div>

      {/* Count + Export */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <p style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 500 }}>
          {sortedCharities.length} partners{selectedCategory !== "all" ? ` in "${selectedCategory}"` : ""}
        </p>
        <button className="btn btn-ghost btn-sm" style={{ gap: "6px", fontSize: "12px" }}
          onClick={() => {
            const csv = ["Name,Category,Description,Website", ...sortedCharities.map(c =>
              `"${c.name}","${c.category}","${c.description?.replace(/"/g, '""')}","${c.website_url}"`)].join("\n");
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            a.download = `charities_${Date.now()}.csv`;
            a.click();
          }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid-3" style={{ gap: "20px" }}>
          {sortedCharities.map((c, idx) => {
            const selected = profile?.charity_id === c.id;
            return (
              <div key={c.id} style={{
                background: "var(--bg-surface)",
                border: `${selected ? "2px" : "1px"} solid ${selected ? "var(--green-500)" : "var(--border-default)"}`,
                borderRadius: "var(--r-xl)", overflow: "hidden",
                transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                animation: `fadeUp 0.4s ease ${idx * 0.05}s both`,
                boxShadow: selected ? "0 0 28px rgba(16,185,129,0.18)" : "var(--shadow-card)",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = selected ? "var(--green-400)" : "var(--border-strong)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = selected ? "var(--green-500)" : "var(--border-default)"; }}
              >
                {/* Image */}
                <div style={{ height: "180px", overflow: "hidden", position: "relative" }}>
                  <img src={c.logo_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80"} alt={c.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(3,5,7,0.4), transparent 50%)" }} />
                  {selected && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", background: "var(--green-500)", borderRadius: "99px", padding: "5px 12px", display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "white", fontWeight: 700, boxShadow: "0 0 12px rgba(16,185,129,0.5)" }}>
                      <CheckCircle size={12} /> ACTIVE
                    </div>
                  )}
                  <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "6px" }}>
                    <span className="badge" style={{ background: "rgba(3,5,7,0.75)", backdropFilter: "blur(8px)", color: "var(--text-1)" }}>
                      <ShieldCheck size={11} /> Vetted
                    </span>
                    {c.is_featured && <span className="badge" style={{ background: "rgba(251,191,36,0.85)", backdropFilter: "blur(8px)", color: "#000" }}><Star size={11} /> Featured</span>}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-0)" }}>{c.name}</h3>
                    <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="btn btn-ghost btn-sm" style={{ padding: "4px", width: "28px", height: "28px", borderRadius: "8px" }}>
                      {expanded === c.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                  <span className="badge" style={{ background: "var(--bg-raised)", color: "var(--text-2)", marginBottom: "12px", display: "inline-flex" }}>{c.category}</span>
                  <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "16px" }}>{c.description?.slice(0, 90)}…</p>

                  {expanded === c.id && (
                    <div style={{ padding: "12px", background: "var(--bg-raised)", borderRadius: "10px", border: "1px solid var(--border-subtle)", marginBottom: "16px", animation: "fadeUp 0.25s ease" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "6px", fontWeight: 700 }}>Website</div>
                      <a href={c.website_url} target="_blank" rel="noopener" style={{ color: "var(--blue-400)", fontSize: "13px", fontWeight: 600 }}>Visit {c.name} →</a>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setPrimary(c.id)} disabled={saving === c.id}
                      className={`btn ${selected ? "btn-secondary" : "btn-primary"}`}
                      style={{ flex: 1, height: "40px", borderRadius: "10px", fontWeight: 700, fontSize: "13px" }}>
                      {saving === c.id ? "Saving…" : selected ? "✓ Your Choice" : "Select Charity"}
                    </button>
                    <button className="btn btn-ghost" style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1px solid rgba(59,130,246,0.3)", color: "var(--blue-400)", padding: 0 }}
                      onClick={() => window.open(c.website_url || "#", "_blank")}>
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sortedCharities.map((c, idx) => {
            const selected = profile?.charity_id === c.id;
            return (
              <div key={c.id} style={{
                background: "var(--bg-surface)",
                border: `${selected ? "2px" : "1px"} solid ${selected ? "var(--green-500)" : "var(--border-default)"}`,
                borderRadius: "var(--r-lg)", overflow: "hidden",
                transition: "all 0.25s ease",
                animation: `fadeUp 0.4s ease ${idx * 0.04}s both`,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = selected ? "var(--green-400)" : "var(--border-strong)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = selected ? "var(--green-500)" : "var(--border-default)"; }}
              >
                <div style={{ display: "flex", gap: "16px", padding: "18px 20px", alignItems: "center" }}>
                  <div style={{ width: "72px", height: "72px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
                    <img src={c.logo_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&q=80"} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-0)" }}>{c.name}</h3>
                      {selected && <span className="badge badge-green" style={{ fontSize: "10px" }}><CheckCircle size={10} /> ACTIVE</span>}
                      {c.is_featured && <span className="badge badge-gold" style={{ fontSize: "10px" }}><Star size={10} /> Featured</span>}
                    </div>
                    <span className="badge" style={{ background: "var(--bg-raised)", color: "var(--text-2)", marginBottom: "6px", display: "inline-flex" }}>{c.category}</span>
                    <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.5 }}>{c.description?.slice(0, 100)}…</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button className={`btn ${selected ? "btn-secondary" : "btn-primary"}`} style={{ height: "38px", fontSize: "13px" }}
                      onClick={() => setPrimary(c.id)} disabled={saving === c.id || selected}>
                      {saving === c.id ? "…" : selected ? "Selected ✓" : "Set Target"}
                    </button>
                    <button className="btn btn-ghost" style={{ width: "38px", height: "38px", borderRadius: "8px", border: "1px solid rgba(59,130,246,0.3)", color: "var(--blue-400)", padding: 0 }}
                      onClick={() => window.open(c.website_url || "#", "_blank")}>
                      <ExternalLink size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
