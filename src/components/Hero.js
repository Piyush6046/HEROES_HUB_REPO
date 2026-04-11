"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Globe, Trophy, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "0 20px",
      position: "relative",
      overflow: "hidden",
      background: "var(--bg-primary)"
    }}>
      {/* Background Decorative Element */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "800px",
        height: "400px",
        background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
        zIndex: 0,
        opacity: 0.6
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1000px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 16px",
          background: "var(--bg-tertiary)",
          borderRadius: "100px",
          border: "1px solid var(--bento-border)",
          marginBottom: "32px",
          fontSize: "14px",
          fontWeight: "600"
        }}>
          <Sparkles size={16} color="var(--accent-primary)" />
          <span>The Next-Gen Golf Economy is here.</span>
        </div>

        <h1 style={{
          fontSize: "clamp(3rem, 8vw, 6rem)",
          fontWeight: "900",
          lineHeight: "1",
          marginBottom: "24px",
          letterSpacing: "-4px"
        }}>
          GOLF. GIVE. <br />
          <span className="gradient-text">CONQUER.</span>
        </h1>

        <p style={{
          fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
          color: "var(--text-secondary)",
          maxWidth: "700px",
          margin: "0 auto 48px",
          lineHeight: "1.6"
        }}>
          Track your performance, empower global charities, and compete 
          in monthly weighted draws. The only platform where your 
          handicap helps humanitarian causes.
        </p>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginBottom: "80px" }}>
          <Link href="/auth/signup" className="glow-btn" style={{ textDecoration: "none", fontSize: "1.1rem" }}>
            Initialize Membership <ArrowRight size={20} style={{ marginLeft: "10px" }} />
          </Link>
          <button style={{
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--bento-border)",
            padding: "16px 32px",
            borderRadius: "100px",
            fontWeight: "700",
            cursor: "pointer"
          }}>
            Watch Protocol 
          </button>
        </div>

        {/* Trust Badges */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "40px",
          paddingTop: "60px",
          borderTop: "1px solid var(--bento-border)"
        }}>
           {[
             { label: "Global Reach", icon: Globe, val: "140+ Countries" },
             { label: "Secured Nodes", icon: ShieldCheck, val: "PCI Compliant" },
             { label: "Total Yield", icon: Trophy, val: "$2.4M Disbursed" },
             { label: "Active Rounds", icon: Target, val: "1.2M Recorded" }
           ].map((item, i) => (
             <div key={i} style={{ textAlign: "left" }}>
               <item.icon size={20} color="var(--text-muted)" style={{ marginBottom: "12px" }} />
               <h4 style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>{item.label}</h4>
               <p style={{ fontWeight: "800", fontSize: "18px" }}>{item.val}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
