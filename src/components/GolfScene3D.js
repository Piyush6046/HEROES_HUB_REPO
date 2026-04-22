"use client";
import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function GolfScene3D({ scrollProgress }) {
  const pathname = usePathname();
  const canvasRef = useRef(null);
  const velocityRef = useRef(0);

  if (pathname !== "/") return null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1, rafId;

    // Orbiting green dot particles
    const orbitDots = Array.from({ length: 8 }, (_, i) => ({
      angle:   (i / 8) * Math.PI * 2,
      radius:  60 + (i % 3) * 22,
      size:    2.5 + (i % 2) * 1.5,
      speed:   0.008 + i * 0.0015,
      opacity: 0.35 + (i % 3) * 0.18,
      phase:   i * 0.7,
    }));

    // Trail particles for scroll velocity
    let trailParticles = [];

    function resize() {
      dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnTrailParticles(cx, cy, speed, angle) {
      if (speed < 0.25) return;
      const count = Math.floor(speed * 6);
      for (let i = 0; i < count; i++) {
        const spread = 40;
        const px = cx + Math.cos(angle + Math.PI / 2) * (Math.random() - 0.5) * spread;
        const py = cy + Math.sin(angle) * (Math.random() - 0.5) * spread;
        trailParticles.push({
          x: px, y: py,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 1.2,
          life: 0.7 + Math.random() * 0.5,
          maxLife: 1.2,
          size: 2 + Math.random() * 4,
        });
      }
      if (trailParticles.length > 60) trailParticles = trailParticles.slice(-60);
    }

    function drawOrbitDots(cx, cy, time, scroll) {
      const intensity = 0.4 + scroll * 0.5;
      for (const dot of orbitDots) {
        dot.angle += dot.speed;
        const a = dot.angle + time * 0.0008;
        // Ellipse orbit (3D feel — squash Y to simulate perspective)
        const ox = Math.cos(a) * dot.radius;
        const oy = Math.sin(a) * dot.radius * 0.3; // flattened = orbit plane perspective
        const x = cx + ox;
        const y = cy + oy;
        const depth = (Math.sin(a) + 1) / 2; // 0 = back, 1 = front

        // Glow ring
        const grd = ctx.createRadialGradient(x, y, 0, x, y, dot.size * 2.8);
        grd.addColorStop(0, `rgba(110,231,183,${dot.opacity * intensity * (0.5 + depth * 0.5)})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, dot.size * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, dot.size * (0.5 + depth * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110,231,183,${dot.opacity * intensity * (0.6 + depth * 0.4)})`;
        ctx.fill();

        // Connecting orbit path (very faint ellipse)
        if (dot === orbitDots[0]) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, dot.radius, dot.radius * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(110,231,183,0.04)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    function drawTrailParticles() {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.022;
        if (p.life <= 0) { trailParticles.splice(i, 1); continue; }
        const alpha = (p.life / p.maxLife) * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,220,170,${alpha})`;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawClub(cx, cy, angleRad, speed, time, scroll) {
      const cosA    = Math.cos(angleRad);
      const sinA    = Math.sin(angleRad);
      const isFront = cosA >= 0;
      const squash  = Math.abs(cosA);
      const isEdge  = squash < 0.15; // edge-on moment

      // Scroll-driven size & upward travel
      const scaleMul = 1 + scroll * 0.28;           // grows up to 28% bigger
      const shaftLen = Math.min(H * 0.32, 270) * scaleMul;
      const shaftW   = 6 * (0.85 + scaleMul * 0.15);
      const headW    = (52 + scroll * 14) * scaleMul;
      const headH    = 18 * scaleMul;
      const gripH    = 44 * scaleMul;
      const gripW    = 11 * (0.9 + scaleMul * 0.1);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(squash * 0.88 + 0.12, 1);

      // Subtle idle tilt when not scrolling
      const idleRot = scroll < 0.01 ? Math.sin(time * 0.003) * 0.04 : 0;
      ctx.rotate(idleRot);

      // ── EDGE FLASH: thin bright line when club is edge-on ──
      if (isEdge) {
        const edgeAlpha = (0.15 - squash) / 0.15;
        ctx.save();
        ctx.globalAlpha = edgeAlpha * 0.85;
        ctx.beginPath();
        ctx.moveTo(0, -shaftLen);
        ctx.lineTo(0,  shaftLen);
        ctx.strokeStyle = "rgba(200,255,230,0.9)";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(110,231,183,0.9)";
        ctx.stroke();
        ctx.restore();
      }

      // ── Ambient glow halo ──
      const glowR = 110 + scroll * 40;
      const glowGrd = ctx.createRadialGradient(0, 0, 5, 0, 0, glowR);
      glowGrd.addColorStop(0, `rgba(110,231,183,${0.07 + squash * 0.06 + scroll * 0.04})`);
      glowGrd.addColorStop(0.5, `rgba(60,180,120,${0.03 + squash * 0.02})`);
      glowGrd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glowGrd;
      ctx.beginPath(); ctx.arc(0, 0, glowR, 0, Math.PI * 2); ctx.fill();

      // ── Shaft ──
      const shaftGrd = ctx.createLinearGradient(-5, 0, 5, 0);
      if (isFront) {
        shaftGrd.addColorStop(0,    "rgba(130,185,158,0.95)");
        shaftGrd.addColorStop(0.25, "rgba(220,248,232,0.99)");
        shaftGrd.addColorStop(0.55, "rgba(245,255,248,1.0)");
        shaftGrd.addColorStop(0.8,  "rgba(185,225,202,0.97)");
        shaftGrd.addColorStop(1,    "rgba(105,155,130,0.9)");
      } else {
        shaftGrd.addColorStop(0,   "rgba(55,92,72,0.9)");
        shaftGrd.addColorStop(0.4, "rgba(95,140,115,0.94)");
        shaftGrd.addColorStop(0.7, "rgba(80,125,100,0.92)");
        shaftGrd.addColorStop(1,   "rgba(50,82,64,0.87)");
      }
      ctx.beginPath();
      ctx.roundRect(-shaftW / 2, -shaftLen, shaftW, shaftLen * 2, 3);
      ctx.fillStyle = shaftGrd;
      ctx.fill();

      // Specular edge highlight (front)
      if (isFront && squash > 0.25) {
        const alpha = (squash - 0.25) / 0.75;
        ctx.beginPath();
        ctx.moveTo(-2, -shaftLen + 14);
        ctx.lineTo(-2,  shaftLen - headH - 10);
        ctx.strokeStyle = `rgba(255,255,255,${0.55 * alpha})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        // Secondary softer highlight
        ctx.beginPath();
        ctx.moveTo(1, -shaftLen + 20);
        ctx.lineTo(1,  shaftLen - headH - 16);
        ctx.strokeStyle = `rgba(200,240,218,${0.25 * alpha})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // ── Grip ──
      const gripTop = -shaftLen;
      const gripGrd = ctx.createLinearGradient(-gripW / 2, gripTop, gripW / 2, gripTop);
      gripGrd.addColorStop(0,   "rgba(10,25,15,0.98)");
      gripGrd.addColorStop(0.5, "rgba(40,68,50,0.97)");
      gripGrd.addColorStop(1,   "rgba(8,20,12,0.98)");
      ctx.beginPath();
      ctx.roundRect(-gripW / 2, gripTop, gripW, gripH, 5);
      ctx.fillStyle = gripGrd;
      ctx.fill();

      // Grip rings
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(-gripW / 2 + 2, gripTop + 7 + i * 6.5);
        ctx.lineTo( gripW / 2 - 2, gripTop + 7 + i * 6.5);
        ctx.strokeStyle = "rgba(0,0,0,0.42)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── Club Head ──
      const headY = shaftLen - headH;
      const faceGrd = ctx.createLinearGradient(-headW / 2, headY, headW / 2, headY + headH);
      if (isFront) {
        faceGrd.addColorStop(0,   "rgba(252,255,252,0.99)");
        faceGrd.addColorStop(0.35,"rgba(212,242,222,0.97)");
        faceGrd.addColorStop(0.75,"rgba(168,212,185,0.93)");
        faceGrd.addColorStop(1,   "rgba(138,185,155,0.88)");
      } else {
        faceGrd.addColorStop(0, "rgba(85,128,105,0.92)");
        faceGrd.addColorStop(1, "rgba(58,92,74,0.86)");
      }
      ctx.beginPath();
      ctx.roundRect(-headW / 2, headY, headW, headH, [0, 0, 7, 7]);
      ctx.fillStyle = faceGrd;
      ctx.fill();

      // Grooves
      if (isFront && squash > 0.2) {
        const a = Math.min((squash - 0.2) / 0.8, 1);
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(-headW / 2 + 8, headY + 4 + i * 3);
          ctx.lineTo( headW / 2 - 8, headY + 4 + i * 3);
          ctx.strokeStyle = `rgba(0,28,12,${0.22 * a})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(-headW / 2 + 14, headY + 2.5);
        ctx.lineTo(-headW / 2 + 35, headY + 2.5);
        ctx.strokeStyle = `rgba(255,255,255,${0.85 * a})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Top edge / topline
      ctx.beginPath();
      ctx.moveTo(-headW / 2, headY);
      ctx.lineTo( headW / 2, headY);
      ctx.lineTo( headW / 2 + 12, headY - 14);
      ctx.lineTo(-headW / 2 + 9,  headY - 14);
      ctx.fillStyle = isFront ? "rgba(218,242,226,0.92)" : "rgba(95,135,112,0.85)";
      ctx.fill();

      // Hosel
      ctx.beginPath();
      ctx.moveTo(0, headY - 4);
      ctx.lineTo(0, headY + 9);
      ctx.strokeStyle = isFront ? "rgba(198,228,208,0.95)" : "rgba(95,135,110,0.9)";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.stroke();

      // ── Motion blur ghost stripes (velocity-driven) ──
      if (speed > 0.15 && squash > 0.08) {
        const intensity = Math.min(speed * 1.4, 0.85);
        for (let i = 1; i <= 4; i++) {
          ctx.save();
          ctx.rotate(-i * 0.07 * Math.sign(cosA || 1));
          ctx.globalAlpha = intensity * (0.38 - i * 0.08);
          ctx.beginPath();
          ctx.moveTo(0,  shaftLen - headH + 4);
          ctx.lineTo(0, -shaftLen);
          ctx.strokeStyle = `rgba(140,230,188,${0.55 * intensity})`;
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();

      // ── Ground shadow (squash-responsive ellipse) ──
      ctx.save();
      ctx.globalAlpha = 0.18 + squash * 0.10;
      const shadowY   = cy + shaftLen + 10;
      const sg = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, 55);
      sg.addColorStop(0, "rgba(0,0,0,0.85)");
      sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(cx, shadowY, 50 * (0.4 + squash * 0.6), 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    let lastScroll = 0;
    function frame(now) {
      if (!W || !H) resize();
      ctx.clearRect(0, 0, W, H);

      const scroll = scrollProgress.current;
      const speed  = Math.min(Math.abs(scroll - lastScroll) * 18, 1.4);
      lastScroll   = scroll;
      velocityRef.current = speed;

      const angle = scroll * Math.PI * 2 + (scroll < 0.01 ? Math.sin(now * 0.003) * 0.05 : 0);

      // Scroll-driven Y movement: rises from 0.40 → 0.28 as page scrolls
      const cx = W * 0.95;
      const cy = H * (0.40 - scroll * 0.14);

      // Draw orbit dots behind the club
      drawOrbitDots(cx, cy, now, scroll);

      // Draw the club
      drawClub(cx, cy, angle, speed, now, scroll);

      // Draw trail particles in front
      drawTrailParticles();
      if (speed > 0.3) spawnTrailParticles(cx, cy, speed, angle);

      rafId = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [scrollProgress]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        90,
        pointerEvents: "none",
        background:    "transparent",
      }}
    />
  );
}