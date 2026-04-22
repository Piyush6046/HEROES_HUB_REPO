"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function FlyingGolfBall({ flightProgress = 0, isActive = false }) {
  const containerRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isActive || pathname !== "/") return;
    const container = containerRef.current;
    if (!container) return;

    const x      = flightProgress * 280;
    const y      = -flightProgress * 520;
    const z      = -flightProgress * 1100;
    const sc     = 1 - flightProgress * 0.7;
    const rotate = flightProgress * 1440;

    container.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px) scale(${sc}) rotate(${rotate}deg)`;
    container.style.opacity   = flightProgress > 0.95 ? String(1 - (flightProgress - 0.95) * 20) : "1";

    // Trail particles
    if (flightProgress > 0.1 && flightProgress < 0.9) {
      const trail = document.createElement("div");
      trail.style.cssText = [
        "position:absolute",
        "width:14px", "height:14px",
        "background:radial-gradient(circle,rgba(16,185,129,0.65),transparent)",
        "border-radius:50%",
        `left:${-flightProgress * 90}px`,
        `top:${flightProgress * 45}px`,
        "pointer-events:none",
        "animation:trailFade 0.55s ease-out forwards",
      ].join(";");
      container.appendChild(trail);
      setTimeout(() => trail.remove(), 600);
    }
  }, [flightProgress, isActive, pathname]);

  if (pathname !== "/") return null;

  return (
    <>
      <style>{`
        @keyframes trailFade {
          0%   { opacity:0.65; transform:scale(1) translate(0,0); }
          100% { opacity:0;    transform:scale(0.25) translate(70px,-130px); }
        }
        @keyframes floatBall {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-14px); }
        }
      `}</style>

      {/* Fixed wrapper so the ball lives in screen-space */}
      <div style={{
        position:      "fixed",
        inset:         0,
        pointerEvents: "none",
        zIndex:        95,
        perspective:   "1400px",
        display:       "flex",
        alignItems:    "flex-end",
        justifyContent:"center",
        paddingBottom: "18%",
      }}>
        <div
          ref={containerRef}
          style={{
            transformStyle: "preserve-3d",
            transition:     "transform 0.04s linear",
            filter:         `drop-shadow(0 ${20 * (1 - flightProgress)}px 15px rgba(0,0,0,0.4))`,
            willChange:     "transform",
          }}
        >
          <div style={{
            width:        "72px",
            height:       "72px",
            background:   "radial-gradient(circle at 35% 35%, #FFFFFF, #E8F0EC, #C8DDD0)",
            borderRadius: "50%",
            boxShadow:    "inset -8px -8px 20px rgba(0,0,0,0.15), inset 8px 8px 25px rgba(255,255,255,0.9), 0 0 30px rgba(16,185,129,0.3)",
            position:     "relative",
            animation:    flightProgress === 0 ? "floatBall 3s ease-in-out infinite" : "none",
          }}>
            {/* Dimples */}
            <div style={{
              position:            "absolute", inset: 0,
              borderRadius:        "50%",
              backgroundImage:     "radial-gradient(circle, rgba(0,0,0,0.08) 2px, transparent 2px)",
              backgroundSize:      "10px 10px",
            }} />
            {/* Shine */}
            <div style={{
              position:     "absolute", top: "15%", left: "15%",
              width:        "35%", height: "35%",
              background:   "radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 80%)",
              borderRadius: "50%",
            }} />
            {/* Spin conic blur */}
            {flightProgress > 0.2 && (
              <div style={{
                position:     "absolute", inset: 0,
                borderRadius: "50%",
                background:   "conic-gradient(from 0deg, transparent, rgba(16,185,129,0.22), transparent)",
                animation:    "spinSlow 0.15s linear infinite",
              }} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
