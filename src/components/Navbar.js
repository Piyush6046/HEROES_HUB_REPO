"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const hiddenRoutes = ["/dashboard", "/admin", "/charities", "/draws", "/auth"];
  const isHidden = hiddenRoutes.some((r) => pathname.startsWith(r));

  useEffect(() => {
    // Get the initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Subscribe to auth changes — this fires on login/logout in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (isHidden) return null;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      padding: "0 5%",
      height: "70px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: scrolled ? "rgba(3,5,7,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "32px", height: "32px",
          background: "linear-gradient(135deg, var(--green-500), var(--indigo-500))",
          borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: "900", fontFamily: "Outfit", fontSize: "14px",
          boxShadow: "0 0 12px rgba(16,185,129,0.35)"
        }}>G</div>
        <span style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: "18px", color: "var(--text-0)", letterSpacing: "-0.5px" }}>HeroesHub</span>
      </Link>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* Only render buttons once auth state is resolved to avoid flicker */}
        {!authLoading && (
          user ? (
            <Link href="/dashboard" className="btn btn-primary" style={{
              animation: "navButtonIn 0.3s ease forwards"
            }}>
              Open Dashboard →
            </Link>
          ) : (
            <div style={{ display: "flex", gap: "8px", animation: "navButtonIn 0.3s ease forwards" }}>
              <Link href="/auth/login" className="btn btn-secondary">Sign In</Link>
              <Link href="/auth/signup" className="btn btn-primary">Get Started →</Link>
            </div>
          )
        )}
      </div>
    </nav>
  );
}
