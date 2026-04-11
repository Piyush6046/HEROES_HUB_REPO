"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import { Heart, Search, CheckCircle, ExternalLink, Sparkles, ShieldCheck, Filter, TrendingUp, Globe, Users, Award, Star, ChevronDown, ChevronUp, Info, MapPin, Mail, Phone, Calendar, Download } from "lucide-react";

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
  const [sortBy, setSortBy]         = useState("name"); // name, featured, category
  const [viewMode, setViewMode]     = useState("grid"); // grid, list

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
      const res = await fetch("/api/ai/matchmaker", {
        method: "POST",
        body: JSON.stringify({ userPreference: aiInput, charities }),
      });
      if (!res.ok) throw new Error("AI unavailable");
      const match = await res.json();
      if (match.id) {
        await setPrimary(match.id);
        alert(`✅ AI matched you with "${match.name}"\n\n${match.reason}`);
      }
    } catch {
      alert("AI matching unavailable — please select manually below.");
    }
    setAiLoading(false);
  };

  const filtered = charities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                         c.description.toLowerCase().includes(search.toLowerCase()) ||
                         c.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCharities = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "featured":
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const categories = ["all", ...new Set(charities.map(c => c.category).filter(Boolean))];

  if (loading) return (
    <div className="flex-center" style={{ height: "calc(100vh - 80px)", fontSize: "14px", color: "var(--text-3)" }}>Loading charities...</div>
  );

  return (
    <div style={{marginLeft:"-60px"}}>
          <>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <Heart size={24} color="var(--red-500)" />
          <h1 className="page-title">Charity Partners</h1>
        </div>
        <p style={{marginBottom:"20px"}} className="page-subtitle">Select your cause - 15% of your subscription goes here every month.</p>

        {/* Stats Overview */}
        <div className="grid-4 mb-6">
          {[
            { label: "Total Partners", val: charities.length, icon: Heart, color: "#f43f5e", bg: "rgba(244,63,94,0.1)" },
            { label: "Featured", val: charities.filter(c => c.is_featured).length, icon: Star, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
            { label: "Categories", val: categories.length - 1, icon: Globe, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
            { label: "Your Selection", val: profile?.charity_id ? charities.find(c => c.id === profile.charity_id)?.name || "Selected" : "None", icon: CheckCircle, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" }
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
              <div className="stat-card-value">{s.val}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* AI Matchmaker Card */}
        <div className="card mb-8 enhanced" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.06), var(--bg-surface))", borderColor: "rgba(99,102,241,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={24} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>AI Charity Matchmaker</h3>
              <p style={{ fontSize: "14px", color: "var(--text-3)" }}>Tell Gemini AI what matters to you</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              className="input"
              placeholder='e.g. "I care about children and education access in developing nations"'
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAiMatch()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={runAiMatch} disabled={aiLoading} style={{ whiteSpace: "nowrap", padding: "12px 24px" }}>
              {aiLoading ? "Thinking..." : "Find My Match"}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: "150px" }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: "150px" }}
          >
            <option value="name">Name A-Z</option>
            <option value="featured">Featured First</option>
            <option value="category">By Category</option>
          </select>
          <div style={{ display: "flex", gap: "8px", background: "var(--bg-surface)", borderRadius: "8px", padding: "4px" }}>
            <button
              className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setViewMode("grid")}
              style={{ padding: "8px 12px" }}
            >
              Grid
            </button>
            <button
              className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setViewMode("list")}
              style={{ padding: "8px 12px" }}
            >
              List
            </button>
          </div>
          <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input className="input" placeholder="Search charities..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "38px", width: "100%" }} />
          </div>
        </div>

        {/* Results count */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-3)" }}>
            {sortedCharities.length} partners available
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost btn-sm" style={{ gap: "4px", fontSize: "12px" }}>
              <Filter size={14} /> Filter
            </button>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ gap: "4px", fontSize: "12px" }}
              onClick={() => {
                const data = sortedCharities.map(c => ({
                  Name: c.name,
                  Category: c.category,
                  Description: c.description,
                  Website: c.website_url,
                  Vetted: "Yes",
                  Featured: c.is_featured ? "Yes" : "No"
                }));
                const headers = Object.keys(data[0]);
                const csv = [
                  headers.join(","),
                  ...data.map(row => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(","))
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `charity_partners_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Grid/List View */}
        {viewMode === "grid" ? (
          <div className="grid-3" style={{ gap: "24px" }}>
            {sortedCharities.map((c) => {
              const selected = profile?.charity_id === c.id;
              return (
                <div key={c.id} className="charity-card enhanced" style={{ border: selected ? "2px solid var(--green-500)" : "1px solid var(--border-default)", transition: "all 0.3s ease" }}>
                  <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                    <img src={c.logo_url || "https://via.placeholder.com/400x200"} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {selected && (
                      <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--green-500)", borderRadius: "99px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "white", fontWeight: 700 }}>
                        <CheckCircle size={14} /> ACTIVE
                      </div>
                    )}
                    <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "8px" }}>
                      <span className="badge" style={{ background: "rgba(7,13,18,0.75)", backdropFilter: "blur(8px)" }}>
                        <ShieldCheck size={12} /> Vetted
                      </span>
                      {c.is_featured && (
                        <span className="badge" style={{ background: "rgba(251,191,36,0.75)", backdropFilter: "blur(8px)" }}>
                          <Star size={12} /> Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-0)", marginBottom: "4px" }}>{c.name}</h3>
                      <button
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "4px" }}
                      >
                        {expanded === c.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    <span className="badge" style={{ background: "var(--bg-surface)", color: "var(--text-2)", marginBottom: "12px" }}>
                      {c.category}
                    </span>

                    <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "20px", minHeight: "60px" }}>
                      {c.description}
                    </p>

                    {expanded === c.id && (
                      <div style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "8px", border: "1px solid var(--border-subtle)", marginBottom: "20px" }}>
                        <h4 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--text-2)" }}>Contact Information</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div>
                            <div style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "4px" }}>Website</div>
                            <a href={c.website_url} target="_blank" style={{ color: "var(--blue-400)", fontSize: "12px" }}>
                              Visit Website
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setPrimary(c.id)}
                        disabled={saving === c.id}
                        className={`btn ${selected ? "btn-secondary" : "btn-primary"}`}
                        style={{ flex: 1, height: "44px", borderRadius: "10px", fontWeight: 700 }}
                      >
                        {saving === c.id ? "Saving..." : selected ? "Active Choice" : "Select Charity"}
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ 
                          width: "44px", 
                          height: "44px", 
                          borderRadius: "10px", 
                          border: "2px solid #3b82f6", 
                          color: "#3b82f6",
                          background: "rgba(59,130,246,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0
                        }}
                        title="Independent Donation"
                        onClick={() => window.open(c.website_url || '#', '_blank')}
                      >
                        <Heart size={20} fill="#3b82f6" fillOpacity={0.2} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            {sortedCharities.map((c) => {
              const selected = profile?.charity_id === c.id;
              return (
                <div key={c.id} className="charity-list-item" style={{ border: selected ? "2px solid var(--green-500)" : "1px solid var(--border-default)", transition: "all 0.3s ease" }}>
                  <div style={{ display: "flex", gap: "16px", padding: "20px" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                      <img src={c.logo_url || "https://via.placeholder.com/80x80"} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-0)" }}>{c.name}</h3>
                          {selected && (
                            <span className="badge" style={{ background: "var(--green-500)", color: "white" }}>
                              <CheckCircle size={12} /> ACTIVE
                            </span>
                          )}
                          {c.is_featured && (
                            <span className="badge" style={{ background: "var(--yellow-500)", color: "white" }}>
                              <Star size={12} /> Featured
                            </span>
                          )}
                        </div>
                        <span className="badge" style={{ background: "var(--bg-surface)", color: "var(--text-2)", marginBottom: "8px" }}>
                          {c.category}
                        </span>
                        <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.6 }}>
                          {c.description}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                          className={`btn ${selected ? "btn-secondary" : "btn-primary"}`}
                          style={{ height: "36px", fontSize: "13px" }}
                          onClick={() => setPrimary(c.id)}
                          disabled={saving === c.id || selected}
                        >
                          {saving === c.id ? "Saving..." : selected ? " Selected" : "Set as Target"}
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ 
                            width: "36px", 
                            height: "36px", 
                            borderRadius: "6px", 
                            border: "1px solid var(--blue-400)",
                            color: "var(--blue-400)",
                            background: "rgba(59,130,246,0.05)"
                          }}
                          title="Visit Website"
                          onClick={() => window.open(c.website_url || '#', '_blank')}
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </>
      </div>

  );
}
