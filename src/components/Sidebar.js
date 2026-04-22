"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "./ThemeToggle";
import {
  LayoutDashboard, Heart, Gift, ShieldCheck, LogOut,
  Target, ChevronRight, Globe, Plus, Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "#10b981" },
  { label: "Charities", href: "/charities",  icon: Heart,           color: "#f43f5e" },
  { label: "Draws",     href: "/draws",      icon: Gift,            color: "#fbbf24" },
  { label: "Admin",     href: "/admin",      icon: ShieldCheck,     color: "#6366f1", adminOnly: true },
];

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, role, loading } = useAuth();
  const [hovered, setHovered] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  const filteredNav = NAV.filter(item => item.adminOnly ? role?.toLowerCase() === "admin" : true);
  const initials = user?.email?.slice(0, 2).toUpperCase() || "GH";
  const username = user?.email?.split("@")[0] || "Player";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} style={{ overflowX: "hidden" }}>
      {/* Brand */}
      <div className="sidebar-brand" style={{ padding: "0 8px" }}>
        <div className="sidebar-logo" style={{ boxShadow: "0 0 14px rgba(16,185,129,0.35)" }}>G</div>
        <span className="sidebar-brand-name">HeroesHub</span>
      </div>

      {/* XP mini bar if user is logged in */}
      {user && !loading && (
        <div style={{ margin: "0 8px 20px", padding: "10px 14px", background: "var(--bg-raised)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-3)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Zap size={10} color="var(--gold-400)" /> XP Progress
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--gold-400)", fontFamily: "Outfit" }}>Lv 1</span>
          </div>
          <div style={{ height: "4px", background: "var(--bg-overlay)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "35%", background: "linear-gradient(90deg, var(--gold-400), var(--gold-500))", borderRadius: "99px", boxShadow: "0 0 6px rgba(251,191,36,0.5)" }} />
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="sidebar-section-label">Navigation</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {loading ? (
          <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "18px", height: "18px", border: "2px solid var(--border-default)", borderTopColor: "var(--green-500)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <span style={{ color: "var(--text-3)", fontSize: "13px" }}>Syncing…</span>
          </div>
        ) : user ? (
          filteredNav.map(({ label, href, icon: Icon, color, adminOnly }, i) => {
            const active = pathname === href;
            const isHovered = hovered === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${active ? "active" : ""}`}
                style={{
                  background: active ? `rgba(${color === "#10b981" ? "16,185,129" : color === "#f43f5e" ? "244,63,94" : color === "#fbbf24" ? "251,191,36" : "99,102,241"},0.1)` : isHovered ? "var(--bg-raised)" : "transparent",
                  borderColor: active ? color + "44" : "transparent",
                  color: active ? color : isHovered ? "var(--text-0)" : "var(--text-2)",
                  animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
                  transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                }}
                onMouseEnter={() => setHovered(href)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: active ? color + "22" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
                  <Icon size={16} color={active ? color : isHovered ? "var(--text-1)" : "var(--text-3)"} />
                </div>
                <span style={{ flex: 1, fontSize: "14px" }}>{label}</span>
                {active && <ChevronRight size={14} color={color} />}
              </Link>
            );
          })
        ) : (
          <>
            <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
              <Globe size={16} className="nav-icon" />
              <span style={{ flex: 1 }}>Platform Concept</span>
            </Link>
            <Link href="/charities" className={`nav-item ${pathname === "/charities" ? "active" : ""}`}>
              <Heart size={16} className="nav-icon" />
              <span style={{ flex: 1 }}>Explore Charities</span>
            </Link>
            <div className="sidebar-section-label" style={{ marginTop: "16px" }}>Membership</div>
            <Link href="/auth/login" className="nav-item">
              <LogOut size={16} className="nav-icon" style={{ transform: "rotate(180deg)" }} />
              <span style={{ flex: 1 }}>Sign In</span>
            </Link>
            <Link href="/auth/signup" className="nav-item" style={{ background: "rgba(16,185,129,0.08)", color: "var(--green-400)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Plus size={16} className="nav-icon" />
              <span style={{ flex: 1 }}>Join Platform</span>
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", padding: "0 4px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Appearance</span>
          <ThemeToggle />
        </div>

        {user && (
          <div className="user-card" style={{ transition: "all 0.2s ease" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = ""}
          >
            <div className="user-avatar" style={{ boxShadow: "0 0 12px rgba(16,185,129,0.3)" }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{username}</div>
              <div style={{ fontSize: "10px", color: role === "admin" ? "var(--blue-400)" : "var(--green-500)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {role === "admin" ? "● Administrator" : "● Premium"}
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={logout} 
          disabled={isLoggingOut || !user}
          className="btn btn-ghost" 
          style={{ width: "100%", marginTop: "8px", borderRadius: "10px", justifyContent: "flex-start", gap: "10px", fontSize: "13px", color: "var(--text-2)", opacity: isLoggingOut ? 0.6 : 1 }}
          onMouseEnter={e => { if(!isLoggingOut) { e.currentTarget.style.color = "var(--rose-500)"; e.currentTarget.style.background = "rgba(244,63,94,0.06)"; } }}
          onMouseLeave={e => { e.currentTarget.style.color = ""; e.currentTarget.style.background = ""; }}
        >
          {isLoggingOut ? (
            <div style={{ width: "15px", height: "15px", border: "2px solid var(--border-default)", borderTopColor: "var(--rose-500)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          ) : <LogOut size={15} />} 
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
  );
}
