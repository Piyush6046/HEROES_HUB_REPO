"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Trophy, Heart, Zap, Star, ChevronRight, Shield, Globe, Users, Target } from "lucide-react";

function Counter({ end, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(end / 60);
        const t = setInterval(() => {
          start = Math.min(start + step, end);
          setCount(start);
          if (start >= end) clearInterval(t);
        }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const [hovered, setHovered] = useState(null);

  const features = [
    {
      icon: Target,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      title: "AI-Powered Score Analytics",
      desc: "Log your Stableford points after every round. Our AI Caddy analyses your last 5 scores and gives you personalised tactical coaching, lucky numbers, and draw probability boosts.",
    },
    {
      icon: Heart,
      color: "#f43f5e",
      bg: "rgba(244,63,94,0.08)",
      title: "Smart Charity Matching",
      desc: "Tell our Gemini AI what you're passionate about — children, climate, veterans. It will instantly match you with the most aligned charity in our vetted network. 15% of every subscription goes there automatically.",
    },
    {
      icon: Trophy,
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.08)",
      title: "Monthly Prize Engine",
      desc: "Every month, 5 winning numbers are published. If your golf scores contain those numbers, you win a share of the prize pool. The better you play, the better your odds.",
    },
    {
      icon: Zap,
      color: "#6366f1",
      bg: "rgba(99,102,241,0.08)",
      title: "XP Rank & Quests",
      desc: "Earn experience points for every logged round, charity milestone you hit and draw you participate in. Level up through Rookie → Ace → Champion → Legend ranks with growing perks.",
    },
  ];

  const steps = [
    { n: "01", title: "Join & Subscribe", desc: "Create your account and pick a Monthly or Yearly plan. 15% of every subscription auto-routes to your chosen charity." },
    { n: "02", title: "Play & Log Scores", desc: "After each round, log your Stableford points. AI Caddy reviews your form and tells you how it affects your draw odds." },
    { n: "03", title: "Win Monthly Draws", desc: "Every month, the Draw Engine publishes 5 numbers. Match all 5 = Jackpot. Even 3 matches earns you a pool share!" },
  ];

  return (
    <main style={{ background: "var(--bg-void)", minHeight: "100vh", paddingTop: "70px" }}>
      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "99px", padding: "6px 16px", marginBottom: "28px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green-400)", display: "inline-block" }} className="animate-pulse" />
            <span style={{ fontSize: "12px", color: "var(--green-400)", fontWeight: 700, letterSpacing: "0.5px" }}>2,400+ SUBSCRIBERS ACTIVE</span>
          </div>

          <h1 style={{ fontSize: "clamp(3.5rem, 7vw, 6rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-3px", marginBottom: "28px", color: "var(--text-0)" }}>
            Golf. Give.<br />
            <span style={{ background: "linear-gradient(135deg, var(--green-400), var(--indigo-500))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Conquer.</span>
          </h1>

          <p style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "var(--text-2)", maxWidth: "620px", lineHeight: 1.7, marginBottom: "44px" }}>
            The world's first subscription platform where your golf scores 
            fuel charities, unlock prizes, and build your legacy on the leaderboard.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Start Your Journey <ArrowRight size={20} />
            </Link>
            <Link href="#how" className="btn btn-secondary btn-lg" style={{ borderRadius: "99px" }}>
              See How It Works
            </Link>
          </div>
        </div>

        {/* Floating stats card */}
        <div style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", display: "grid", gap: "16px", animation: "float 6s ease-in-out infinite" }}>
          {[
            { label: "This Month's Prize Pool", val: "$12,400", color: "var(--gold-400)" },
            { label: "Charity Distributed", val: "$284K Total", color: "var(--green-400)" },
            { label: "Your Draw Odds", val: "+18.4%", color: "#818cf8" },
          ].map((s, i) => (
            <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--r-md)", padding: "16px 20px", minWidth: "220px", boxShadow: "var(--shadow-card)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 900, fontFamily: "Outfit", color: s.color, letterSpacing: "-1px" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ padding: "60px 5%", display: "flex", gap: "40px", justifyContent: "center", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
        {[
          { label: "Active Members", end: 2400, suffix: "+" },
          { label: "Prize Pool Paid Out", end: 284, prefix: "$", suffix: "K" },
          { label: "Charities Supported", end: 12, suffix: "" },
          { label: "Rounds Logged", end: 189000, suffix: "+" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center", padding: "0 40px", borderRight: i < 3 ? "1px solid var(--border-subtle)" : "none" }}>
            <div style={{ fontSize: "40px", fontWeight: 900, fontFamily: "Outfit", letterSpacing: "-2px", color: "var(--text-0)" }}>
              <Counter {...s} />
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 600, marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "100px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="badge badge-green" style={{ marginBottom: "16px" }}>Platform Features</div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "16px" }}>Everything you need to play smart</h2>
          <p style={{ color: "var(--text-2)", maxWidth: "600px", margin: "0 auto", fontSize: "16px" }}>Four core pillars that make HeroesHub the world's most rewarding golf community.</p>
        </div>

        <div className="grid-2" style={{ maxWidth: "1200px", margin: "0 auto", gap: "24px" }}>
          {features.map((f, i) => (
            <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{ background: "var(--bg-surface)", border: `1px solid ${hovered === i ? f.color + "44" : "var(--border-default)"}`, borderRadius: "var(--r-xl)", padding: "36px", transition: "all 0.3s ease", cursor: "default", boxShadow: hovered === i ? `0 0 40px ${f.color}18` : "var(--shadow-card)" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <f.icon size={26} color={f.color} />
              </div>
              <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>{f.title}</h3>
              <p style={{ color: "var(--text-2)", fontSize: "15px", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHARITY SPOTLIGHT ── */}
      <section style={{ padding: "100px 5%", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ background: "linear-gradient(135deg, var(--bg-surface), rgba(244,63,94,0.03))", borderRadius: "32px", padding: "64px", border: "1px solid var(--border-default)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "var(--red-500)", opacity: 0.05, filter: "blur(60px)", borderRadius: "50%" }} />
          
          <div className="grid-2" style={{ alignItems: "center", gap: "60px" }}>
            <div>
              <div className="badge badge-rose" style={{ marginBottom: "20px" }}>Featured Spotlight</div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "24px" }}>Help Save the Oceans with Project Blue</h2>
              <p style={{ color: "var(--text-1)", fontSize: "18px", lineHeight: 1.8, marginBottom: "32px" }}>
                This month's featured charity is dedicated to cleaning the Pacific coastline. 
                With every golf round you log, you're helping remove 5lbs of plastic from our waters. 
              </p>
              <div style={{ display: "flex", gap: "32px", marginBottom: "40px" }}>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-0)" }}>$42,800</div>
                  <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Raised this month</div>
                </div>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-0)" }}>15%</div>
                  <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Impact Multiplier</div>
                </div>
              </div>
              <Link href="/auth/signup" className="btn btn-primary">Participate via Subscription</Link>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "24px", border: "1px solid var(--border-subtle)" }}>
              <img src="https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=800&q=80" alt="Ocean" style={{ width: "100%", borderRadius: "16px", display: "block" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "100px 5%", background: "var(--bg-base)" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="badge badge-indigo" style={{ marginBottom: "16px" }}>Process</div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>How to Win in 3 Steps</h2>
        </div>

        <div className="grid-3" style={{ maxWidth: "1100px", margin: "0 auto", gap: "32px" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", fontWeight: 900, fontFamily: "Outfit", color: "var(--border-strong)", letterSpacing: "-3px", marginBottom: "20px" }}>{s.n}</div>
              <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>{s.title}</h3>
              <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "120px 5%", textAlign: "center", background: "linear-gradient(180deg, var(--bg-void) 0%, rgba(16,185,129,0.04) 50%, var(--bg-void) 100%)" }}>
        <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "20px", maxWidth: "800px", margin: "0 auto 20px" }}>Ready to turn your handicap into impact?</h2>
        <p style={{ color: "var(--text-2)", fontSize: "18px", marginBottom: "44px" }}>Join 2,400+ golfers already winning.</p>
        <Link href="/auth/signup" className="btn btn-primary" style={{ fontSize: "18px", padding: "18px 48px", borderRadius: "99px" }}>
          Create Free Account <ArrowRight size={22} />
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px 5%", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Outfit", fontWeight: 900, color: "var(--text-3)", fontSize: "16px" }}>HeroesHub</span>
        <span style={{ color: "var(--text-3)", fontSize: "13px" }}>© 2026 HeroesHub · Built for Digital Heroes Selection Process</span>
      </footer>
    </main>
  );
}
