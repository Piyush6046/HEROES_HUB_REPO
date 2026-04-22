"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Globe, Trophy, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GolfClub3D from "./GolfClub3D";

export default function Hero() {
  const scrollProgress = useRef(0);
  const [scrollPos, setScrollPos] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const maxScroll = 1200;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollPos(y);
      scrollProgress.current = Math.min(y / maxScroll, 1);
    };
    const handleMouse = (e) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 15, y: (e.clientY / window.innerHeight - 0.5) * 15 });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouse);
    handleScroll();
    return () => { window.removeEventListener("scroll", handleScroll); window.removeEventListener("mousemove", handleMouse); };
  }, []);

  const maxScroll = 1000;
  const progress = Math.min(scrollPos / maxScroll, 1);
  const swingProgress = Math.min(progress / 0.2, 1);
  const clubRotate = 60 - swingProgress * 110;
  const flightProgress = progress > 0.2 ? (progress - 0.2) / 0.8 : 0;
  const ballX = flightProgress * 200;
  const ballY = -flightProgress * 600;
  const ballZ = -flightProgress * 1200;
  const ballScale = 1 - flightProgress * 0.8;
  const ballRotate = flightProgress * 1440;
  const sceneOpacity = 1 - Math.max(0, (scrollPos - 1500) / 500);

  return (
    <section className="hero-section" style={{ perspective: "2000px", transformStyle: "preserve-3d", background: "var(--bg-void)", padding: "100px 5% 0", minHeight: "250vh", position: "relative", overflow: "visible" }}>

      {/* 3D Golf Club — left side, scroll-driven rotation */}
      <GolfClub3D scrollProgress={scrollProgress} x={0.18} y={0.52} baseScale={1} spinMultiplier={2} zIndex={49} />

      {/* Original 3D overlay */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, opacity: sceneOpacity, transformStyle: "preserve-3d", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: "15%", width: "400px", height: "200px", background: "radial-gradient(ellipse, rgba(16,185,129,0.2) 0%, transparent 80%)", borderRadius: "50%", transform: "rotateX(75deg) translateZ(-600px)", border: "4px dashed rgba(16,185,129,0.2)" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50px", height: "30px", background: "#000", borderRadius: "50%", boxShadow: "inset 0 10px 20px rgba(0,0,0,1)" }} />
        </div>
        <div style={{ position: "absolute", bottom: "10%", left: "45%", transformOrigin: "top center", transform: `translateX(-50%) rotate(${clubRotate}deg) scale(1.5)`, opacity: progress > 0.4 ? (1 - (progress - 0.4) * 2) : 1, transition: "transform 0.05s linear", zIndex: 51 }}>
          <div style={{ width: "8px", height: "300px", background: "linear-gradient(90deg, #333, #666, #333)", borderRadius: "4px" }} />
          <div style={{ width: "60px", height: "30px", background: "linear-gradient(135deg, #aaa, #444)", borderRadius: "10px 30px 10px 10px", position: "absolute", bottom: "-10px", left: "-40px", boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }} />
        </div>
        <div style={{ position: "absolute", bottom: "15%", left: "50%", transform: `translateX(-50%) translate(${ballX}px, ${ballY}px) translateZ(${ballZ}px) scale(${ballScale}) rotate(${ballRotate}deg)`, transition: "transform 0.05s linear", filter: `drop-shadow(0 ${20*(1-flightProgress)}px 10px rgba(0,0,0,0.4))`, transformStyle: "preserve-3d" }}>
          <div className="golf-ball-3d" style={{ width: "70px", height: "70px", boxShadow: "inset -10px -10px 30px rgba(0,0,0,0.2), inset 10px 10px 30px rgba(255,255,255,1), 0 0 40px rgba(16,185,129,0.2)" }}>
            <div className="ball-dimples" />
            <div className="ball-shine" />
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div style={{ position: "relative", zIndex: 20, maxWidth: "1200px", margin: "0 auto", paddingTop: "60px", textAlign: "center", opacity: 1 - scrollPos / 600 }}>
        {scrollPos < 100 && (
          <div style={{ position: "absolute", bottom: "-100px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--text-3)", animation: "fadeUp 1.5s ease infinite alternate" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase" }}>Scroll to Hit</span>
            <div style={{ width: "2px", height: "40px", background: "linear-gradient(to bottom, var(--green-500), transparent)" }} />
          </div>
        )}
        <div style={{ position: "relative", height: "180px", marginBottom: "40px" }}>
          <div className="golf-ball-3d"><div className="ball-dimples" /><div className="ball-shine" /></div>
          <div className="ball-shadow" />
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 20px", background: "rgba(16,185,129,0.08)", borderRadius: "100px", border: "1px solid rgba(16,185,129,0.2)", marginBottom: "32px", fontSize: "13px", fontWeight: "800", color: "var(--green-400)", textTransform: "uppercase", letterSpacing: "1.5px", animation: "fadeUp 0.8s ease both" }}>
          <Sparkles size={14} /><span>The Next-Gen Golf Economy is here.</span>
        </div>
        <h1 style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)", fontWeight: "950", lineHeight: "0.9", marginBottom: "32px", letterSpacing: "-0.05em", color: "var(--text-0)", animation: "slideUp 1s cubic-bezier(0.16,1,0.3,1) both" }}>
          GOLF. GIVE. <br />
          <span style={{ background: "linear-gradient(135deg, var(--green-400), var(--blue-400))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 30px rgba(16,185,129,0.3))" }}>CONQUER.</span>
        </h1>
        <p style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", color: "var(--text-2)", maxWidth: "800px", margin: "0 auto 56px", lineHeight: "1.6", fontWeight: "500", animation: "fadeUp 1.2s ease both 0.2s" }}>
          Track your performance, empower global charities, and compete in monthly weighted draws. The only platform where your handicap helps humanitarian causes.
        </p>
        <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginBottom: "100px", animation: "fadeUp 1.4s ease both 0.4s" }}>
          <Link href="/auth/signup" className="btn btn-primary btn-lg" style={{ fontSize: "1.2rem", padding: "18px 40px", boxShadow: "0 20px 40px rgba(16,185,129,0.3)", background: "linear-gradient(135deg, var(--green-500), #059669)" }}>
            Join Protocol <ArrowRight size={22} style={{ marginLeft: "12px" }} />
          </Link>
          <button className="btn btn-ghost btn-lg" style={{ fontSize: "1.2rem", padding: "18px 40px", borderColor: "var(--border-strong)" }}>Explore Assets</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", paddingTop: "64px", borderTop: "1px solid var(--border-subtle)", animation: "fadeUp 1.6s ease both 0.6s" }}>
          {[{ label: "Global Reach", icon: Globe, val: "140+ Countries", color: "#60a5fa" }, { label: "Secured Nodes", icon: ShieldCheck, val: "PCI Compliant", color: "#10b981" }, { label: "Total Yield", icon: Trophy, val: "$2.4M Disbursed", color: "#fbbf24" }, { label: "Active Rounds", icon: Target, val: "1.2M Recorded", color: "#f43f5e" }].map((item, i) => (
            <div key={i} className="trust-card" style={{ textAlign: "left", padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid var(--border-subtle)", transition: "all 0.3s ease" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}><item.icon size={20} color={item.color} /></div>
              <h4 style={{ fontSize: "11px", color: "var(--text-3)", textTransform: "uppercase", fontWeight: "800", letterSpacing: "1px", marginBottom: "8px" }}>{item.label}</h4>
              <p style={{ fontWeight: "900", fontSize: "22px", color: "var(--text-0)", fontFamily: "Outfit" }}>{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hero-section { overflow: hidden; position: relative; }
        .golf-ball-3d { width:100px;height:100px;background:#fff;border-radius:50%;margin:0 auto;position:relative;box-shadow:inset -10px -10px 40px rgba(0,0,0,0.1),inset 10px 10px 40px rgba(255,255,255,0.8);animation:float 4s ease-in-out infinite,spinSlow 12s linear infinite;transform-style:preserve-3d; }
        .ball-dimples { position:absolute;inset:0;background-image:radial-gradient(circle,rgba(0,0,0,0.05) 1px,transparent 1px);background-size:8px 8px;border-radius:50%; }
        .ball-shine { position:absolute;top:15%;left:15%;width:30%;height:30%;background:radial-gradient(circle,rgba(255,255,255,0.8) 0%,transparent 80%);border-radius:50%; }
        .ball-shadow { width:60px;height:10px;background:rgba(0,0,0,0.2);border-radius:50%;margin:20px auto 0;filter:blur(5px);animation:shadowScale 4s ease-in-out infinite; }
        @keyframes shadowScale { 0%,100%{transform:scale(1);opacity:0.2} 50%{transform:scale(1.3);opacity:0.1} }
        .trust-card:hover { transform:translateY(-10px) rotateX(10deg);background:rgba(255,255,255,0.05);border-color:var(--border-strong);box-shadow:0 20px 40px rgba(0,0,0,0.3); }
      `}</style>
    </section>
  );
}