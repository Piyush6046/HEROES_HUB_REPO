"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Account", "Charity", "Plan"];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]           = useState(0);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [contribution, setContribution] = useState(15);
  const [aiInput, setAiInput]     = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [mounted, setMounted]     = useState(false);
  const [animDir, setAnimDir]     = useState(1); // 1 = forward, -1 = backward

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    supabase.from("charities").select("*").then(({ data }) => setCharities(data || []));
  }, []);

  const goNext = (nextStep) => { setAnimDir(1); setStep(nextStep); };
  const goBack = (prevStep) => { setAnimDir(-1); setStep(prevStep); };

  const handleAiMatch = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await fetch("/api/ai/matchmaker", {
        method: "POST",
        body: JSON.stringify({ userPreference: aiInput, charities }),
      });
      if (!res.ok) throw new Error("offline");
      const match = await res.json();
      if (match.id) {
        setSelectedCharity(match.id);
        setAiSuggestion(match);
      }
    } catch {
      toast.error("AI offline — please select a charity manually below.");
    }
    setAiLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!selectedCharity) return setError("Please select a charity to support.");
    setLoading(true); setError("");

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: email.split("@")[0] } },
    });

    if (authErr) { setError(authErr.message); setLoading(false); return; }

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authData.user.id, email, charityId: selectedCharity, contribution, planId: selectedPlan })
      });
      const onboardingData = await res.json();
      if (onboardingData.error) throw new Error(onboardingData.error);
      if (onboardingData.url) { window.location.href = onboardingData.url; }
      else { router.push("/dashboard"); }
    } catch (err) {
      console.error("Onboarding Failed:", err);
      router.push("/auth/login");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-void)", overflow: "hidden" }}>

      {/* ── LEFT BRAND PANEL ── */}
      <div className="desktop-only" style={{
        width: "40%", minHeight: "100vh",
        background: "linear-gradient(160deg, #0a1f14 0%, #020408 55%, #0d1a2e 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.13), transparent 70%)", animation: "glowPulse 8s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)", animation: "glowPulse 10s ease-in-out infinite 2s", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "60px", opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, var(--green-500), var(--indigo-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontFamily: "Outfit", fontSize: "18px", boxShadow: "0 0 20px rgba(16,185,129,0.4)" }}>G</div>
            <span style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: "20px", color: "white", letterSpacing: "-0.5px" }}>HeroesHub</span>
          </Link>

          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 900, letterSpacing: "-1.5px", color: "white", marginBottom: "16px", lineHeight: 1.1, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s" }}>
            Join 2,400+<br />golfers giving back.
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", marginBottom: "48px", lineHeight: 1.7, opacity: mounted ? 1 : 0, transition: "all 0.6s ease 0.2s" }}>
            Set up in under 2 minutes. Your first charity contribution hits within the week.
          </p>

          {/* Step indicators */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(-16px)", transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.1}s` }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: i < step ? "var(--green-500)" : i === step ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)",
                  border: `2px solid ${i <= step ? "var(--green-500)" : "rgba(255,255,255,0.12)"}`,
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: i === step ? "0 0 12px rgba(16,185,129,0.4)" : "none",
                }}>
                  {i < step
                    ? <CheckCircle size={14} color="white" />
                    : <span style={{ fontSize: "12px", fontWeight: 800, color: i === step ? "var(--green-400)" : "rgba(255,255,255,0.3)" }}>{i + 1}</span>
                  }
                </div>
                <span style={{ fontSize: "14px", fontWeight: i <= step ? 700 : 400, color: i < step ? "rgba(255,255,255,0.85)" : i === step ? "#fff" : "rgba(255,255,255,0.3)", transition: "all 0.3s" }}>{s}</span>
                {i === step && <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, var(--green-500)44, transparent)" }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(16,185,129,0.03) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: "460px", position: "relative" }}>

          {/* Step 0: Account Details */}
          {step === 0 && (
            <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "8px" }}>Create your account</h1>
              <p style={{ fontSize: "14px", color: "var(--text-3)", marginBottom: "36px" }}>
                Already a member? <Link href="/auth/login" style={{ color: "var(--green-400)", fontWeight: 700 }}>Sign in →</Link>
              </p>
              <form onSubmit={(e) => { e.preventDefault(); goNext(1); }} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Email Address</label>
                  <input type="email" required className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPw ? "text" : "password"} required className="input" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: "44px" }} minLength={8} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", transition: "color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  {password && (
                    <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                      {[1,2,3,4].map(n => (
                        <div key={n} style={{ height: "3px", flex: 1, borderRadius: "99px", background: password.length >= n * 2 ? (password.length >= 8 ? "var(--green-500)" : "var(--gold-400)") : "var(--bg-overlay)", transition: "background 0.3s" }} />
                      ))}
                      <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "4px", whiteSpace: "nowrap" }}>{password.length < 4 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}</span>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px", marginTop: "4px", borderRadius: "12px", background: "linear-gradient(135deg, var(--green-500), #059669)", fontSize: "15px" }}>
                  Continue <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* Step 1: Choose Charity */}
          {step === 1 && (
            <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "8px" }}>Pick your cause</h1>
              <p style={{ fontSize: "14px", color: "var(--text-3)", marginBottom: "28px" }}>15% of your subscription will go here every month, automatically.</p>

              {/* AI Matchmaker */}
              <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "var(--r-md)", padding: "18px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Sparkles size={16} color="#818cf8" />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#818cf8" }}>AI Charity Matchmaker</span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input className="input" placeholder='e.g. "climate change, ocean clean up"' value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAiMatch()} style={{ fontSize: "13px" }} />
                  <button onClick={handleAiMatch} disabled={aiLoading} className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap" }}>
                    {aiLoading ? <span style={{ display: "flex", gap: "6px", alignItems: "center" }}><span style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Matching</span> : "Match →"}
                  </button>
                </div>
                {aiSuggestion && (
                  <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--green-400)", display: "flex", alignItems: "center", gap: "8px", animation: "fadeUp 0.3s ease" }}>
                    <CheckCircle size={14} /> Matched: <strong>{aiSuggestion.name}</strong>
                  </div>
                )}
              </div>

              {/* Charity cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto", marginBottom: "24px", paddingRight: "4px" }}
                className="hide-scrollbar">
                {charities.map((c, idx) => {
                  const sel = selectedCharity === c.id;
                  return (
                    <button key={c.id} type="button" onClick={() => setSelectedCharity(c.id)}
                      style={{ display: "flex", gap: "14px", padding: "14px 16px", borderRadius: "12px", border: `1px solid ${sel ? "var(--green-500)" : "var(--border-default)"}`, background: sel ? "rgba(16,185,129,0.07)" : "var(--bg-surface)", cursor: "pointer", textAlign: "left", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)", transform: sel ? "scale(1.01)" : "none", animation: `fadeUp 0.35s ease ${idx * 0.04}s both` }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${sel ? "var(--green-500)" : "var(--text-3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px", transition: "all 0.25s", boxShadow: sel ? "0 0 8px rgba(16,185,129,0.4)" : "none" }}>
                        {sel && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green-500)" }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: sel ? "var(--green-400)" : "var(--text-0)", marginBottom: "3px", transition: "color 0.2s" }}>{c.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: 1.4 }}>{c.description?.slice(0, 80)}…</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => goBack(0)} className="btn btn-secondary" style={{ flex: 1 }}>← Back</button>
                <button onClick={() => { if (!selectedCharity) return setError("Pick a charity."); setError(""); goNext(2); }} className="btn btn-primary" style={{ flex: 2 }}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
              {error && <p style={{ color: "var(--rose-500)", fontSize: "13px", marginTop: "10px", animation: "fadeUp 0.3s ease" }}>{error}</p>}
            </div>
          )}

          {/* Step 2: Choose Plan & Confirm */}
          {step === 2 && (
            <div style={{ animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px", marginBottom: "8px" }}>Choose your plan</h1>
              <p style={{ fontSize: "14px", color: "var(--text-3)", marginBottom: "28px" }}>Your charity receives {contribution}% of your subscription.</p>

              {/* Plan toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "28px" }}>
                {[
                  { label: "Monthly", price: "$9.99/mo", desc: "Billed every month", id: "monthly" },
                  { label: "Yearly",  price: "$89/yr",   desc: "Save 26% · Best value", id: "yearly", badge: "BEST" },
                ].map((p) => (
                  <div key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    style={{ padding: "20px", borderRadius: "var(--r-md)", border: `1px solid ${selectedPlan === p.id ? "var(--green-500)" : "var(--border-default)"}`, background: selectedPlan === p.id ? "rgba(16,185,129,0.08)" : "var(--bg-surface)", cursor: "pointer", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)", transform: selectedPlan === p.id ? "scale(1.02)" : "none", boxShadow: selectedPlan === p.id ? "0 0 20px rgba(16,185,129,0.15)" : "none", position: "relative" }}>
                    {p.badge && <div style={{ position: "absolute", top: "-1px", right: "12px", background: "var(--green-500)", color: "#fff", fontSize: "9px", fontWeight: 800, padding: "2px 8px", borderRadius: "0 0 6px 6px", letterSpacing: "0.5px" }}>{p.badge}</div>}
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-0)", marginBottom: "6px" }}>{p.label}</div>
                    <div style={{ fontSize: "22px", fontWeight: 900, fontFamily: "Outfit", color: "var(--green-400)", marginBottom: "4px", letterSpacing: "-1px" }}>{p.price}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-3)" }}>{p.desc}</div>
                  </div>
                ))}
              </div>

              {/* Charity Slider */}
              <div style={{ marginBottom: "28px", background: "var(--bg-surface)", borderRadius: "var(--r-md)", padding: "20px", border: "1px solid var(--border-default)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Charity Contribution</label>
                  <span style={{ fontSize: "16px", fontWeight: 900, color: "var(--green-400)", fontFamily: "Outfit" }}>{contribution}%</span>
                </div>
                <input type="range" min="10" max="50" step="5" value={contribution} onChange={(e) => setContribution(e.target.value)} style={{ width: "100%", accentColor: "var(--green-500)", height: "4px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "11px", color: "var(--text-3)" }}>
                  <span>10% — Min</span><span>50% — Max Impact</span>
                </div>
              </div>

              {error && <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "var(--r-sm)", padding: "12px", fontSize: "13px", color: "var(--rose-500)", marginBottom: "16px", animation: "fadeUp 0.3s ease" }}>{error}</div>}

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => goBack(1)} className="btn btn-secondary" style={{ flex: 1 }}>← Back</button>
                <button onClick={handleSignup} disabled={loading} className="btn btn-primary" style={{ flex: 2, padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, var(--green-500), #059669)", fontSize: "15px" }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                      Creating account…
                    </span>
                  ) : "Launch My Account 🎉"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
