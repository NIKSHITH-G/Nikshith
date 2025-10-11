// components/InteractiveMeshGrid.jsx
"use client";
import { useEffect, useRef } from "react";

export default function InteractiveMeshGrid({
  spacing = 100,
  density = 0.8,
  lineColor = "rgba(255,255,255,0.04)",
  hoverLineColor = "rgba(168,85,247,0.35)",
  pointColor = "rgba(168,85,247,0.95)",
  pointSize = 1.8,
  warp = 0.15,
  pointerSmoothing = 0.18,
  spring = 0.1,
  damping = 0.84,
  disableBelow = 480,
  maxPoints = 1500,
} = {}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const gridRef = useRef({ pts: [], w: 0, h: 0 });
  const pointer = useRef({ x: -9999, y: -9999, active: false });
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    let mounted = true;

    function buildGrid(w, h) {
      const eff = Math.max(40, spacing * density);
      const cols = Math.ceil(w / eff) + 1;
      const rows = Math.ceil(h / eff) + 1;

      const pts = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * eff;
          const y = r * eff;
          pts.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, n: [] });
        }
      }
      const idx = (c, r) => r * cols + c;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(c, r);
          const p = pts[i];
          if (c + 1 < cols) p.n.push(idx(c + 1, r));
          if (r + 1 < rows) p.n.push(idx(c, r + 1));
          if (c + 1 < cols && r + 1 < rows) p.n.push(idx(c + 1, r + 1));
        }
      }
      gridRef.current = { pts, w, h, eff };
    }

    function draw() {
      if (!mounted) return;
      const { pts, w, h, eff } = gridRef.current;
      if (!pts.length) return;
      ctx.clearRect(0, 0, w, h);

      // cursor-based glow influence
      const px = pointer.current.x;
      const py = pointer.current.y;
      const active = pointer.current.active && Math.abs(px) < 9000;

      const glowRadius = 220;

      ctx.lineWidth = Math.max(0.5, eff / 320);
      ctx.beginPath();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const dist = active ? Math.hypot(p.x - px, p.y - py) : 9999;
        const glowFactor = active ? Math.max(0, 1 - dist / glowRadius) : 0;

        ctx.strokeStyle =
          glowFactor > 0
            ? `rgba(168,85,247,${0.3 * glowFactor + 0.04})`
            : lineColor;

        for (const n of p.n) {
          const q = pts[n];
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
        }
      }
      ctx.stroke();

      ctx.fillStyle = pointColor;
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step(dt) {
      const { pts } = gridRef.current;
      const px = pointer.current.x;
      const py = pointer.current.y;
      const active = pointer.current.active && Math.abs(px) < 9000;
      const influence = 120;

      for (const p of pts) {
        const dx = p.ox - p.x;
        const dy = p.oy - p.y;
        p.vx += dx * spring;
        p.vy += dy * spring;

        if (active) {
          const sx = px - p.x;
          const sy = py - p.y;
          const dist = Math.hypot(sx, sy);
          if (dist < influence) {
            const t = 1 - dist / influence;
            p.vx += (sx / dist) * (warp * t * 6);
            p.vy += (sy / dist) * (warp * t * 6);
          }
        }

        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx * (dt / 16.67);
        p.y += p.vy * (dt / 16.67);
      }
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid(w, h);
    }

    function pointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      pointer.current.x = x - rect.left;
      pointer.current.y = y - rect.top;
      pointer.current.active = true;
    }
    function pointerLeave() {
      pointer.current.active = false;
      pointer.current.x = -9999;
      pointer.current.y = -9999;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerleave", pointerLeave);
    window.addEventListener("touchmove", pointerMove);

    let last = performance.now();
    function loop(ts) {
      if (!mounted) return;
      const dt = Math.min(40, ts - last);
      last = ts;
      step(dt);
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    loop(last);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerleave", pointerLeave);
      window.removeEventListener("touchmove", pointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}