"use client";
import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SwingingGolfClub({
  swingAngleRad = -1.2,
  x = 0.85,
  y = 0.82,
  scale = 1,
  isActive = true,
}) {
  const pathname = usePathname();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive || pathname !== "/") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1, rafId;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function drawClub(cx, cy, angle, scaleVal, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const shaftLen = 280 * scaleVal;
      const shaftW   = 7   * scaleVal;
      const headW    = 88  * scaleVal;
      const headH    = 52  * scaleVal;
      const gripH    = 64  * scaleVal;
      const gripW    = 11  * scaleVal;

      // Shaft shadow
      ctx.beginPath();
      ctx.moveTo(3, 4); ctx.lineTo(2, -shaftLen + 4);
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 10; ctx.lineCap = "round";
      ctx.filter = "blur(4px)"; ctx.stroke(); ctx.filter = "none";

      // Shaft gradient (white/mint)
      const sg = ctx.createLinearGradient(-5, 0, 5, 0);
      sg.addColorStop(0,    "rgba(160,210,180,0.95)");
      sg.addColorStop(0.3,  "rgba(245,255,250,1)");
      sg.addColorStop(0.7,  "rgba(200,235,215,0.98)");
      sg.addColorStop(1,    "rgba(120,170,140,0.9)");
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, -shaftLen);
      ctx.strokeStyle = sg; ctx.lineWidth = shaftW; ctx.lineCap = "round"; ctx.stroke();

      // Highlight edge
      ctx.beginPath();
      ctx.moveTo(-1.8, -10); ctx.lineTo(-1.8, -shaftLen + 45);
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1.8; ctx.stroke();

      // Grip
      const gripTop = -shaftLen;
      const gg = ctx.createLinearGradient(-6, gripTop, 6, gripTop);
      gg.addColorStop(0, "rgba(15,35,22,0.98)");
      gg.addColorStop(0.5, "rgba(45,75,58,0.96)");
      gg.addColorStop(1, "rgba(10,28,16,0.98)");
      ctx.beginPath();
      ctx.roundRect(-gripW / 2, gripTop, gripW, gripH, 5);
      ctx.fillStyle = gg; ctx.fill();

      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(-gripW / 2 + 2, gripTop + 8 + i * 8);
        ctx.lineTo(gripW  / 2 - 2, gripTop + 8 + i * 8);
        ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.2; ctx.stroke();
      }

      // Club head
      const hy = 8;

      // Face
      const fg = ctx.createLinearGradient(-headW / 2, hy - headH / 2, headW / 2, hy + headH / 2);
      fg.addColorStop(0,    "rgba(255,255,255,0.98)");
      fg.addColorStop(0.25, "rgba(230,248,238,0.96)");
      fg.addColorStop(0.6,  "rgba(190,225,205,0.94)");
      fg.addColorStop(1,    "rgba(150,195,165,0.9)");
      ctx.beginPath();
      ctx.rect(-headW / 2, hy - headH / 2, headW, headH);
      ctx.fillStyle = fg; ctx.fill();

      // Score lines
      for (let i = 0; i < 6; i++) {
        const ly = hy - headH / 2 + 12 + i * 6;
        ctx.beginPath();
        ctx.moveTo(-headW / 2 + 12, ly); ctx.lineTo(headW / 2 - 12, ly);
        ctx.strokeStyle = "rgba(0,40,20,0.25)"; ctx.lineWidth = 1; ctx.stroke();
      }

      // Specular
      ctx.beginPath();
      ctx.moveTo(-headW / 2 + 15, hy - headH / 2 + 8);
      ctx.lineTo(-headW / 2 + 40, hy - headH / 2 + 8);
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2.5; ctx.stroke();

      // Top edge
      ctx.beginPath();
      ctx.moveTo(-headW / 2, hy - headH / 2);
      ctx.lineTo( headW / 2, hy - headH / 2);
      ctx.lineTo( headW / 2 + 12, hy - headH / 2 - 18);
      ctx.lineTo(-headW / 2 + 8,  hy - headH / 2 - 18);
      ctx.fillStyle = "rgba(220,245,225,0.85)"; ctx.fill();

      // Hosel
      ctx.beginPath();
      ctx.moveTo(0, hy - 5); ctx.lineTo(0, hy + 12);
      ctx.strokeStyle = "rgba(200,235,215,0.9)"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.stroke();

      // Motion blur
      const swingSpeed = Math.abs(Math.sin(angle * 2)) * 0.6;
      if (swingSpeed > 0.2 && angle > -0.8 && angle < 0.5) {
        for (let i = 1; i <= 3; i++) {
          ctx.save();
          ctx.rotate(-i * 0.07);
          ctx.globalAlpha = swingSpeed * (0.4 - i * 0.1);
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(0, -shaftLen);
          ctx.strokeStyle = "rgba(200,255,220,0.5)"; ctx.lineWidth = 5; ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();
    }

    function drawShadow(cx, cy, scaleVal, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.2;
      const groundY = cy + 150 * scaleVal;
      const grad = ctx.createRadialGradient(cx, groundY, 0, cx, groundY, 70 * scaleVal);
      grad.addColorStop(0, "rgba(0,0,0,0.8)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, groundY, 55 * scaleVal, 12 * scaleVal, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function frame() {
      if (!W || !H) resize();
      ctx.clearRect(0, 0, W, H);
      const cx = W * x;
      const cy = H * y;
      const dynamicScale = scale * (1 + Math.abs(Math.sin(swingAngleRad)) * 0.05);
      drawShadow(cx, cy, dynamicScale, 1);
      drawClub(cx, cy, swingAngleRad, dynamicScale, 1);
      rafId = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    resize();
    frame();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafId); };
  }, [swingAngleRad, x, y, scale, isActive, pathname]);

  if (pathname !== "/") return null;

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 90, pointerEvents: "none", background: "transparent" }}
    />
  );
}
