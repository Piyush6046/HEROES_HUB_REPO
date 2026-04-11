"use client";
import { useState } from "react";
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) { 
      setError(authError.message); 
      setLoading(false); 
    } else {
      // Pulse Check: Ensure Profile Always Exists (Self-Healing)
      // We call our onboarding API internally to guarantee a profile row exists
      await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email.split("@")[0]
        })
      });
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-void)" }}>

      {/* ── LEFT BRAND PANEL ── */}
      <div style={{
        width: "45%", minHeight: "100vh", background: "linear-gradient(160deg, #0d2418 0%, #020408 60%, #0d1a2e 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative glow */}
        <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "72px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, var(--green-500), var(--indigo-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontFamily: "Outfit", fontSize: "18px" }}>G</div>
            <span style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: "20px", color: "white", letterSpacing: "-0.5px" }}>HeroesHub</span>
          </Link>

          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 900, letterSpacing: "-1.5px", color: "white", marginBottom: "16px", lineHeight: 1.1 }}>
            Welcome<br />back, Ace.
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", marginBottom: "48px", lineHeight: 1.7 }}>
            Sign in to your dashboard and continue your journey on the leaderboard.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <CheckCircle size={16} color="var(--green-400)" style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "8px" }}>Sign in</h1>
          <p style={{ fontSize: "14px", color: "var(--text-3)", marginBottom: "36px" }}>
            New here? <Link href="/auth/signup" style={{ color: "var(--green-400)", fontWeight: 700 }}>Create an account →</Link>
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Email</label>
              <input
                type="email" required autoComplete="email"
                className="input" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} required autoComplete="current-password"
                  className="input" placeholder="Your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "4px" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "var(--r-sm)", padding: "12px 16px", fontSize: "13px", color: "var(--rose-500)" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", padding: "14px", fontSize: "15px", marginTop: "4px" }}>
              {loading ? "Signing in…" : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
