"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

const FEATURES = [
  "Track your Stableford scores round by round",
  "AI Caddy gives you personalised game coaching",
  "15% of your sub auto-routes to your chosen charity",
  "Compete in monthly prize draws — match 5 to win",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) { 
      setError(authError.message); 
      setLoading(false); 
    } else {
      try {
        fetch("/api/auth/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userId: user.id, 
            email: user.email,
            fullName: user.user_metadata?.full_name || user.email.split("@")[0]
          })
        }).catch(err => console.error("Onboarding error:", err));
      } catch (e) {}
      window.location.href = "/dashboard";
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-void)", overflow: "hidden" }}>

      {/* ── LEFT BRAND PANEL ── */}
      <div className="desktop-only" style={{
        width: "45%", minHeight: "100vh",
        background: "linear-gradient(160deg, #0a1f14 0%, #020408 55%, #0d1a2e 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px",
        position: "relative", overflow: "hidden",
      }}>
        {/* animated orbs */}
        <div style={{ position: "absolute", top: "-120px", left: "-120px", width: "450px", height: "450px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.13), transparent 70%)", animation: "glowPulse 8s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)", animation: "glowPulse 11s ease-in-out infinite 3s", pointerEvents: "none" }} />
        {/* grid texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "72px", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(-10px)", transition: "all 0.5s ease" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, var(--green-500), var(--indigo-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontFamily: "Outfit", fontSize: "18px", boxShadow: "0 0 20px rgba(16,185,129,0.4)" }}>G</div>
            <span style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: "20px", color: "white", letterSpacing: "-0.5px" }}>HeroesHub</span>
          </Link>

          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 900, letterSpacing: "-1.5px", color: "white", marginBottom: "16px", lineHeight: 1.1, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s" }}>
            Welcome<br />back, Ace.
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7, opacity: mounted ? 1 : 0, transition: "all 0.6s ease 0.2s" }}>
            Sign in to your dashboard and continue<br />your journey on the leaderboard.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(-16px)", transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.08}s` }}>
                <CheckCircle size={16} color="var(--green-400)" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative" }}>
        {/* subtle background pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(16,185,129,0.03) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: "420px", position: "relative", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(24px)", transition: "all 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "8px" }}>Sign in</h1>
          <p style={{ fontSize: "14px", color: "var(--text-3)", marginBottom: "36px" }}>
            New here? <Link href="/auth/signup" style={{ color: "var(--green-400)", fontWeight: 700 }}>Create an account →</Link>
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Email</label>
              <input
                type="email" required autoComplete="email"
                className="input" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} required autoComplete="current-password"
                  className="input" placeholder="Your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "4px", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "var(--r-sm)", padding: "12px 16px", fontSize: "13px", color: "var(--rose-500)", display: "flex", alignItems: "center", gap: "8px", animation: "fadeUp 0.3s ease" }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "14px", fontSize: "15px", marginTop: "4px", borderRadius: "12px", background: loading ? "var(--green-600)" : "linear-gradient(135deg, var(--green-500), #059669)", transition: "all 0.25s ease", position: "relative", overflow: "hidden" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Signing in…
                </span>
              ) : <><span>Sign In</span> <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
