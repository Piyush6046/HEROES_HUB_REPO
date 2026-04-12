"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "./ThemeToggle";
import {
  LayoutDashboard, Heart, Gift, ShieldCheck, LogOut,
  Target, Settings, ChevronRight, Globe, Plus
} from "lucide-react";

const NAV = [
  { label: "Dashboard",  href: "/dashboard", icon: LayoutDashboard },
  { label: "Charities",  href: "/charities", icon: Heart },
  { label: "Draws",      href: "/draws",     icon: Gift },
  { label: "Admin",      href: "/admin",     icon: ShieldCheck },
];

import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, role, loading } = useAuth();

  // Hide sidebar on Landing page and Auth pages
  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const filteredNav = NAV.filter(item => {
    if (item.label === "Admin") return role?.toLowerCase() === "admin";
    return true;
  });

  console.log("Current User Role:", role, "Email:", user?.email);

  const initials = user?.email?.slice(0,2).toUpperCase() || "GH";
  const username = user?.email?.split("@")[0] || "Player";

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">G</div>
        <span className="sidebar-brand-name">HeroesHub</span>
      </div>

      {/* Nav */}
      <div className="sidebar-section-label">Navigation</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {loading ? (
          <div style={{ padding: "10px", color: "var(--text-3)", fontSize: "12px" }}>Synchronizing...</div>
        ) : user ? (
          filteredNav.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
                <Icon size={18} className="nav-icon" />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })
        ) : (
          <>
            <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
              <Globe size={18} className="nav-icon" />
              <span style={{ flex: 1 }}>Platform Concept</span>
            </Link>
            <Link href="/charities" className={`nav-item ${pathname === "/charities" ? "active" : ""}`}>
              <Heart size={18} className="nav-icon" />
              <span style={{ flex: 1 }}>Explore Charities</span>
            </Link>
            <div className="sidebar-section-label" style={{ marginTop: "16px" }}>Membership</div>
            <Link href="/auth/login" className="nav-item">
              <LogOut size={18} className="nav-icon" style={{ transform: "rotate(180deg)" }} />
              <span style={{ flex: 1 }}>Sign In</span>
            </Link>
            <Link href="/auth/signup" className="nav-item" style={{ background: "var(--blue-500)15", color: "var(--blue-400)" }}>
              <Plus size={18} className="nav-icon" />
              <span style={{ flex: 1 }}>Join Platform</span>
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Appearance</span>
          <ThemeToggle />
        </div>

        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{username}</div>
            <div style={{ fontSize: "11px", color: role === "admin" ? "var(--blue-400)" : "var(--green-500)", fontWeight: 700 }}>
              {role === "admin" ? "ADMINISTRATOR" : "PREMIUM"}
            </div>
          </div>
        </div>

        {role?.toLowerCase() !== "admin" && user?.email === "admin@gmail.com" && (
          <button 
            onClick={async () => {
              const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
              if (!error) {
                setRole("admin");
                alert("Role updated! Refreshing...");
                window.location.reload();
              } else {
                alert("Update failed: " + error.message);
              }
            }} 
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: "8px", borderRadius: "var(--r-sm)", fontSize: "11px", height: "32px" }}
          >
            PROMOTE TO ADMIN
          </button>
        )}

        <button onClick={logout} className="btn btn-ghost" style={{ width: "100%", marginTop: "8px", borderRadius: "var(--r-sm)", justifyContent: "flex-start", gap: "10px", fontSize: "13px" }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
