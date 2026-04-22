"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Trophy, Heart, Zap, Star, ChevronRight, Shield, Globe, Users, Target } from "lucide-react";

const GolfScene3D = dynamic(() => import("@/components/GolfScene3D"), { ssr: false });

/* ── Animated counter ── */
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

/* ── Reveal-on-scroll wrapper ── */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [hovered, setHovered] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      scrollProgress.current = Math.min(y / 2800, 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: Target,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.25)",
      title: "AI-Powered Score Analytics",
      desc: "Log your Stableford points after every round. Our AI Caddy analyses your last 5 scores and gives you personalised tactical coaching, lucky numbers, and draw probability boosts.",
    },
    {
      icon: Heart,
      color: "#f43f5e",
      bg: "rgba(244,63,94,0.08)",
      border: "rgba(244,63,94,0.25)",
      title: "Smart Charity Matching",
      desc: "Tell our Gemini AI what you're passionate about — children, climate, veterans. It instantly matches you with the most aligned charity in our vetted network. 15% of every subscription goes there automatically.",
    },
    {
      icon: Trophy,
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.08)",
      border: "rgba(251,191,36,0.25)",
      title: "Monthly Prize Engine",
      desc: "Every month, 5 winning numbers are published. If your golf scores contain those numbers, you win a share of the prize pool. The better you play, the better your odds.",
    },
    {
      icon: Zap,
      color: "#6366f1",
      bg: "rgba(99,102,241,0.08)",
      border: "rgba(99,102,241,0.25)",
      title: "XP Rank & Quests",
      desc: "Earn experience points for every logged round, charity milestone and draw you participate in. Level up through Rookie → Ace → Champion → Legend with growing perks.",
    },
  ];

  const steps = [
    { n: "01", title: "Join & Subscribe", desc: "Create your account and pick a Monthly or Yearly plan. 15% of every subscription auto-routes to your chosen charity." },
    { n: "02", title: "Play & Log Scores", desc: "After each round, log your Stableford points. AI Caddy reviews your form and tells you how it affects your draw odds." },
    { n: "03", title: "Win Monthly Draws", desc: "Every month, the Draw Engine publishes 5 numbers. Match all 5 = Jackpot. Even 3 matches earns you a pool share!" },
  ];

  return (
    <div style={{ background: "var(--bg-void)", minHeight: "100vh" }}>

      {/* ════ GOLF CLUB ANIMATION ════ */}
      <GolfScene3D scrollProgress={scrollProgress} />

      {/* SCROLL TO SWING prompt */}
      {scrollY < 60 && (
        <div style={{
          position: "fixed", bottom: "6%", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          pointerEvents: "none", zIndex: 10000, animation: "fadeUp 1s ease-in-out infinite alternate"
        }}>
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "3px",
            textTransform: "uppercase", color: "rgba(16,185,129,0.9)", fontFamily: "Outfit, sans-serif" }}>
            SCROLL TO SPIN
          </span>
          <div style={{ width: "2px", height: "36px",
            background: "linear-gradient(to bottom, rgba(16,185,129,0.8), transparent)" }} />
        </div>
      )}
      {/* ════ END GOLF ANIMATION ════ */}


      {/* ── HERO ── */}
      <section className="hero-section" style={{ paddingTop: "140px", paddingBottom: "80px" }}>
        {/* Animated background orbs */}
        <div className="hero-glow-1" style={{ animation: "glowPulse 8s ease-in-out infinite" }} />
        <div className="hero-glow-2" style={{ animation: "glowPulse 10s ease-in-out infinite 2s" }} />
        <div style={{
          position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)",
          top: "30%", left: "60%", animation: "glowPulse 12s ease-in-out infinite 4s",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px" }}>
          {/* Live badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "99px", padding: "6px 16px", marginBottom: "32px",
            animation: "fadeUp 0.6s ease 0.1s both",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green-400)", display: "inline-block" }} className="animate-pulse" />
            <span style={{ fontSize: "12px", color: "var(--green-400)", fontWeight: 700, letterSpacing: "0.5px" }}>2,400+ SUBSCRIBERS ACTIVE</span>
          </div>

          <h1 style={{
            fontSize: "clamp(3.5rem, 7vw, 6rem)", fontWeight: 900, lineHeight: 1,
            letterSpacing: "-3px", marginBottom: "28px", color: "var(--text-0)",
            animation: "fadeUp 0.7s ease 0.2s both",
          }}>
            Golf. Give.<br />
            <span style={{
              background: "linear-gradient(135deg, var(--green-400), #818cf8, var(--green-400))",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "gradientShift 5s ease infinite",
            }}>Conquer.</span>
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "var(--text-2)",
            maxWidth: "620px", lineHeight: 1.7, marginBottom: "48px",
            animation: "fadeUp 0.7s ease 0.35s both",
            position: "relative", zIndex: 2
          }}>
            The world's first subscription platform where your golf scores 
            fuel charities, unlock prizes, and build your legacy on the leaderboard.
          </p>


          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", animation: "fadeUp 0.7s ease 0.5s both" }}>
            <Link href="/auth/signup" className="btn btn-primary btn-lg" style={{
              background: "linear-gradient(135deg, var(--green-500), #059669)",
              boxShadow: "0 0 32px rgba(16,185,129,0.4)",
              borderRadius: "99px",
            }}>
              Start Your Journey <ArrowRight size={20} />
            </Link>
            <Link href="#how" className="btn btn-secondary btn-lg" style={{ borderRadius: "99px" }}>
              See How It Works
            </Link>
          </div>
        </div>

        {/* Floating stats card */}
        <div className="floating-stats-mobile" style={{
          position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)",
          display: "grid", gap: "16px", animation: "float 6s ease-in-out infinite",
        }}>
          {[
            { label: "This Month's Prize Pool", val: "$12,400", color: "var(--gold-400)" },
            { label: "Charity Distributed",     val: "$284K Total", color: "var(--green-400)" },
            { label: "Your Draw Odds",           val: "+18.4%", color: "#818cf8" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-default)",
              borderRadius: "var(--r-md)", padding: "16px 20px", minWidth: "220px",
              boxShadow: "var(--shadow-card)",
              animation: `fadeUp 0.6s ease ${0.3 + i * 0.12}s both`,
              transition: "transform 0.3s ease, border-color 0.3s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateX(-6px)"; e.currentTarget.style.borderColor = s.color + "66"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; }}
            >
              <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 900, fontFamily: "Outfit", color: s.color, letterSpacing: "-1px" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ padding: "60px 5%", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
        <div className="grid-4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {[
            { label: "Active Members",    end: 2400,   suffix: "+" },
            { label: "Prize Pool Paid Out", end: 284,  prefix: "$", suffix: "K" },
            { label: "Charities Supported", end: 12,   suffix: "" },
            { label: "Rounds Logged",     end: 189000, suffix: "+" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, fontFamily: "Outfit", letterSpacing: "-2px", color: "var(--text-0)" }}>
                  <Counter {...s} />
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600, marginTop: "4px" }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "100px 5%" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="badge badge-green" style={{ marginBottom: "16px" }}>Platform Features</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "16px" }}>Everything you need to play smart</h2>
            <p style={{ color: "var(--text-2)", maxWidth: "600px", margin: "0 auto", fontSize: "16px" }}>
              Four core pillars that make HeroesHub the world's most rewarding golf community.
            </p>
          </div>
        </Reveal>

        <div className="grid-2" style={{ maxWidth: "1200px", margin: "0 auto", gap: "24px", position: "relative" }}>
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "var(--bg-surface)",
                  border: `1px solid ${hovered === i ? f.border : "var(--border-default)"}`,
                  borderRadius: "var(--r-xl)", padding: "36px",
                  transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                  cursor: "default",
                  boxShadow: hovered === i ? `0 0 48px ${f.color}22, var(--shadow-card)` : "var(--shadow-card)",
                  transform: hovered === i ? "translateY(-6px) scale(1.02)" : "none",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {hovered === i && <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "150px", background: `linear-gradient(90deg, transparent, ${f.color}11)`, animation: "slideInRight 0.4s ease forwards" }} />}
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: hovered === i ? f.bg.replace("0.08", "0.15") : f.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "20px", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: hovered === i ? `0 0 20px ${f.color}44` : "none",
                  transform: hovered === i ? "rotate(-10deg) scale(1.1)" : "none"
                }}>
                  <f.icon size={26} color={f.color} style={{ transition: "all 0.3s ease", transform: hovered === i ? "scale(1.1)" : "none" }} />
                </div>
                <h3 style={{ fontSize: "20px", marginBottom: "12px", transition: "color 0.3s ease", color: hovered === i ? f.color : "var(--text-0)" }}>{f.title}</h3>
                <p style={{ color: "var(--text-2)", fontSize: "15px", lineHeight: 1.7, position: "relative", zIndex: 1 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CHARITY SPOTLIGHT ── */}
      <section style={{ padding: "clamp(40px, 10vw, 100px) 5%", borderTop: "1px solid var(--border-subtle)" }}>
        <Reveal>
          <div style={{
            background: "linear-gradient(135deg, var(--bg-surface), rgba(244,63,94,0.03))",
            borderRadius: "32px", padding: "clamp(24px, 5vw, 64px)",
            border: "1px solid var(--border-default)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "var(--rose-500)", opacity: 0.05, filter: "blur(60px)", borderRadius: "50%", animation: "glowPulse 8s ease-in-out infinite" }} />
            
            <div className="grid-2" style={{ alignItems: "center" }}>
              <div>
                <div className="badge badge-rose" style={{ marginBottom: "20px" }}>Featured Spotlight</div>
                <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", marginBottom: "24px" }}>Help Save the Oceans with Project Blue</h2>
                <p style={{ color: "var(--text-1)", fontSize: "clamp(16px, 2vw, 18px)", lineHeight: 1.8, marginBottom: "32px" }}>
                  This month's featured charity is dedicated to cleaning the Pacific coastline. 
                  With every golf round you log, you're helping remove 5lbs of plastic from our waters. 
                </p>
                <div style={{ display: "flex", gap: "32px", marginBottom: "40px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-0)" }}>$42,800</div>
                    <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Raised this month</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-0)" }}>15%</div>
                    <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Impact Multiplier</div>
                  </div>
                </div>
                <Link href="/auth/signup" className="btn btn-primary" style={{ maxWidth: "300px" }}>Participate via Subscription</Link>
              </div>
              <div style={{ position: "relative", marginTop: "32px", perspective: "1000px" }} className="mobile-only-margin">
                <div style={{
                  background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "24px", 
                  border: "1px solid rgba(244,63,94,0.2)",
                  transform: "rotateY(-5deg) rotateX(5deg)",
                  transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg) scale(1.05)"; e.currentTarget.style.boxShadow = "0 30px 60px rgba(244,63,94,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "rotateY(-5deg) rotateX(5deg)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)"; }}
                >
                  <img src="https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=800&q=80" alt="Ocean" style={{ width: "100%", borderRadius: "16px", display: "block" }} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "100px 5%", background: "var(--bg-base)" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div className="badge badge-indigo" style={{ marginBottom: "16px" }}>Process</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>How to Win in 3 Steps</h2>
          </div>
        </Reveal>

        <div className="grid-3" style={{ maxWidth: "1100px", margin: "0 auto", gap: "32px" }}>
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 120}>
              <div style={{
                textAlign: "center", padding: "32px 24px",
                background: "var(--bg-surface)", borderRadius: "var(--r-xl)",
                border: "1px solid var(--border-default)", boxShadow: "var(--shadow-card)",
                transition: "all 0.3s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--border-default)"; }}
              >
                <div style={{
                  fontSize: "56px", fontWeight: 900, fontFamily: "Outfit",
                  background: "linear-gradient(135deg, var(--green-500), #818cf8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  letterSpacing: "-3px", marginBottom: "20px",
                }}>{s.n}</div>
                <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>{s.title}</h3>
                <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "120px 5%", textAlign: "center", background: "linear-gradient(180deg, var(--bg-void) 0%, rgba(16,185,129,0.04) 50%, var(--bg-void) 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "20%", left: "20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)", animation: "glowPulse 9s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "10%", right: "15%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)", animation: "glowPulse 11s ease-in-out infinite 3s" }} />
        </div>
        <Reveal>
          <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "20px", maxWidth: "800px", margin: "0 auto 20px" }}>
            Ready to turn your handicap into impact?
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: "18px", marginBottom: "44px" }}>Join 2,400+ golfers already winning.</p>
          <Link href="/auth/signup" className="btn btn-primary" style={{
            fontSize: "18px", padding: "18px 48px", borderRadius: "99px",
            background: "linear-gradient(135deg, var(--green-500), #059669)",
            boxShadow: "0 0 40px rgba(16,185,129,0.4)",
            animation: "borderGlow 3s ease-in-out infinite",
          }}>
            Create Free Account <ArrowRight size={22} />
          </Link>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px 5%", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Outfit", fontWeight: 900, color: "var(--text-3)", fontSize: "16px" }}>HeroesHub</span>
        <span style={{ color: "var(--text-3)", fontSize: "13px" }}>© 2026 HeroesHub · Built for Digital Heroes Selection Process</span>
      </footer>
    </div>
  );
}
