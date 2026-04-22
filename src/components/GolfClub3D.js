"use client";
import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * GolfClub3D — a white golf club on the RIGHT side of the screen,
 * scroll-driven swing animation. Canvas 2D, fully transparent bg.
 */
export default function GolfClub3D({ scrollProgress }) {
  const pathname = usePathname();
  const canvasRef = useRef(null);

  // Only on landing page
  if (pathname !== "/") return null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1, rafId;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(dpr, dpr);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const p = scrollProgress.current;

      // Club position: right side, bottom
      const cx = W * 0.88;
      const cy = H * 0.78;

      // Swing: start at -50° (backswing), end at +85° (follow-through)
      const swingP = Math.min(p / 0.22, 1);
      const angle  = (-50 + swingP * 135) * (Math.PI / 180);

      // Fade out after ball launches
      const alpha = p > 0.32 ? Math.max(0, 1 - (p - 0.32) * 5) : 1;
      if (alpha < 0.01) { rafId = requestAnimationFrame(draw); return; }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const shaftLen = Math.min(H * 0.28, 240);

      // ── Shaft shadow (depth) ──
      ctx.beginPath();
      ctx.moveTo(3, 4);
      ctx.lineTo(2, -shaftLen + 4);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth   = 9;
      ctx.lineCap     = "round";
      ctx.filter      = "blur(3px)";
      ctx.stroke();
      ctx.filter = "none";

      // ── Shaft — white with subtle gradient ──
      const shaftGrd = ctx.createLinearGradient(-5, 0, 5, 0);
      shaftGrd.addColorStop(0,   "rgba(180,220,200,0.9)");
      shaftGrd.addColorStop(0.35,"rgba(255,255,255,0.98)");
      shaftGrd.addColorStop(0.65,"rgba(220,240,230,0.95)");
      shaftGrd.addColorStop(1,   "rgba(140,190,165,0.85)");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -shaftLen);
      ctx.strokeStyle = shaftGrd;
      ctx.lineWidth   = 6;
      ctx.lineCap     = "round";
      ctx.stroke();

      // Highlight strip (specular)
      ctx.beginPath();
      ctx.moveTo(-1.5, -8);
      ctx.lineTo(-1.5, -shaftLen + 40);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // ── Grip (dark wrap at top) ──
      const gripTop = -shaftLen;
      const gripH   = 50;
      const gripGrd = ctx.createLinearGradient(-5, gripTop, 5, gripTop);
      gripGrd.addColorStop(0,   "rgba(20,40,30,0.95)");
      gripGrd.addColorStop(0.5, "rgba(50,80,65,0.9)");
      gripGrd.addColorStop(1,   "rgba(15,30,22,0.95)");
      ctx.beginPath();
      ctx.roundRect(-4.5, gripTop, 9, gripH, 4);
      ctx.fillStyle = gripGrd;
      ctx.fill();
      // Grip texture lines
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(-4, gripTop + 8 + i * 7);
        ctx.lineTo( 4, gripTop + 8 + i * 7);
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      // ── Club Head (iron) ──
      const hx = 0, hy = 0; // at pivot (bottom of shaft)

      // Bottom face
      ctx.beginPath();
      ctx.moveTo(-20, hy + 1);
      ctx.lineTo(20,  hy + 1);
      ctx.lineTo(24,  hy + 12);
      ctx.lineTo(-16, hy + 12);
      ctx.closePath();
      ctx.fillStyle = "rgba(140,200,170,0.6)";
      ctx.fill();

      // Front face — white/light
      const faceGrd = ctx.createLinearGradient(-20, hy - 12, 20, hy + 1);
      faceGrd.addColorStop(0,   "rgba(255,255,255,0.97)");
      faceGrd.addColorStop(0.4, "rgba(230,248,238,0.95)");
      faceGrd.addColorStop(0.8, "rgba(200,235,215,0.92)");
      faceGrd.addColorStop(1,   "rgba(170,220,195,0.88)");
      ctx.beginPath();
      ctx.moveTo(-20, hy - 12);
      ctx.lineTo(20,  hy - 12);
      ctx.lineTo(20,  hy + 1);
      ctx.lineTo(-20, hy + 1);
      ctx.closePath();
      ctx.fillStyle = faceGrd;
      ctx.fill();

      // Top face
      const topGrd = ctx.createLinearGradient(-18, hy - 22, 22, hy - 12);
      topGrd.addColorStop(0, "rgba(240,255,248,0.98)");
      topGrd.addColorStop(1, "rgba(180,230,205,0.9)");
      ctx.beginPath();
      ctx.moveTo(-20, hy - 12);
      ctx.lineTo( 20, hy - 12);
      ctx.lineTo( 24, hy - 22);
      ctx.lineTo(-16, hy - 22);
      ctx.closePath();
      ctx.fillStyle = topGrd;
      ctx.fill();

      // Score lines on face
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-16, hy - 10 + i * 3.5);
        ctx.lineTo( 16, hy - 10 + i * 3.5);
        ctx.strokeStyle = "rgba(0,60,30,0.18)";
        ctx.lineWidth   = 0.9;
        ctx.stroke();
      }

      // Specular on face
      ctx.beginPath();
      ctx.moveTo(-10, hy - 11);
      ctx.lineTo(-2,  hy - 11);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Hosel
      ctx.beginPath();
      ctx.moveTo(0, hy - 8);
      ctx.lineTo(0, 0);
      ctx.strokeStyle = "rgba(220,245,232,0.85)";
      ctx.lineWidth   = 6;
      ctx.lineCap     = "round";
      ctx.stroke();

      // ── Motion blur streaks during swing ──
      if (swingP > 0.05 && swingP < 0.95) {
        const blurStr = Math.sin(swingP * Math.PI) * 0.35;
        for (let i = 1; i <= 4; i++) {
          ctx.save();
          ctx.rotate(-i * 0.055);
          ctx.globalAlpha = blurStr * (1 - i * 0.22) * alpha;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -shaftLen);
          ctx.strokeStyle = "rgba(200,255,225,0.5)";
          ctx.lineWidth   = 4;
          ctx.lineCap     = "round";
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();

      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [scrollProgress]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99,
        pointerEvents: "none",
        background: "transparent",
      }}
    />
  );
}
