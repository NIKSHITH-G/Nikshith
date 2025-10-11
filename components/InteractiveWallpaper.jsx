// components/InteractiveWallpaper.jsx
"use client";

import { useEffect, useRef } from "react";

/**
 * InteractiveWallpaper - optimized + visible glowing lines
 * - Single canvas (constellation)
 * - Caps drawing resolution to MAX_DRAW_SIZE to reduce pixel work
 * - Adaptive particle count (area-based)
 * - Pointer updates throttled via RAF
 * - Link drawing skipped on some frames
 * - Stronger, slightly glowing line color for better visibility
 * - Respects prefers-reduced-motion and pauses when not visible
 *
 * Drop-in: replace your existing components/InteractiveWallpaper.jsx with this file.
 */

export default function InteractiveWallpaper({
  maxDrawSize = 1100, // max drawing dimension (px) to cap rendering resolution
  baseParticles = 120,
  extraParticles = 40,
} = {}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const hiddenRef = useRef(false);
  const pointer = useRef({ x: -9999, y: -9999, down: false });
  const pointerDirty = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const particlesRef = useRef([]);
  const frameCounter = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    let running = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 900;

    const PARTICLE_SPEED = prefersReduced ? 0.12 : 0.45;
    const LINK_FRAME_SKIP = prefersReduced ? 3 : 2;
    let MAX_LINK = isSmall ? 90 : 140;

    function makeParticle(w, h) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.04 + Math.random() * PARTICLE_SPEED;
      const size = 0.8 + Math.random() * 2.2;
      const hue = 245 + Math.random() * 30;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        hue,
        alpha: 0.6 + Math.random() * 0.4,
      };
    }

    function computeDrawSize() {
      const wCss = Math.max(300, window.innerWidth);
      const hCss = Math.max(300, window.innerHeight);

      // scale to cap the larger dimension to maxDrawSize
      const scale = Math.min(1, maxDrawSize / Math.max(wCss, hCss));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const drawW = Math.round(wCss * scale);
      const drawH = Math.round(hCss * scale);

      return { wCss, hCss, drawW, drawH, dpr, scale };
    }

    function resize() {
      const { wCss, hCss, drawW, drawH, dpr } = computeDrawSize();
      sizeRef.current = { w: drawW, h: drawH, dpr };

      canvas.width = Math.round(drawW * dpr);
      canvas.height = Math.round(drawH * dpr);
      canvas.style.width = `${wCss}px`;
      canvas.style.height = `${hCss}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // adaptive particle count
      const areaRatio = (drawW * drawH) / (1200 * 800);
      const desired = Math.max(
        24,
        Math.min(
          320,
          Math.round((baseParticles + Math.random() * extraParticles) * Math.max(0.5, areaRatio))
        )
      );

      const arr = particlesRef.current;
      if (arr.length < desired) {
        for (let i = arr.length; i < desired; i++) arr.push(makeParticle(drawW, drawH));
      } else if (arr.length > desired) {
        particlesRef.current = arr.slice(0, desired);
      }

      // recompute link distance reasonably
      MAX_LINK = Math.max(60, Math.min(200, Math.round(Math.min(drawW, drawH) * (isSmall ? 0.12 : 0.11))));
    }

    function draw() {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);

      const arr = particlesRef.current;

      // update particles
      for (let p of arr) {
        const mx = pointer.current.x;
        const my = pointer.current.y;
        if (mx > -9000) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dsq = dx * dx + dy * dy;
          const r = 120;
          if (dsq < r * r) {
            const strength = (1 - dsq / (r * r)) * 0.95;
            const inv = 1 / (Math.sqrt(dsq) + 0.001);
            p.vx += (dx * inv) * 0.12 * strength;
            p.vy += (dy * inv) * 0.12 * strength;
          }
        }

        p.vx *= 0.986;
        p.vy *= 0.986;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
        if (p.y < -12) p.y = h + 12;
        if (p.y > h + 12) p.y = -12;
      }

      // draw links every LINK_FRAME_SKIP frames to save CPU
      if (frameCounter.current % LINK_FRAME_SKIP === 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter"; // helps glow effect

        for (let i = 0; i < arr.length; i++) {
          const a = arr[i];
          for (let j = i + 1; j < arr.length; j++) {
            const b = arr[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < MAX_LINK * MAX_LINK) {
              const dist = Math.sqrt(dist2);
              const alpha = Math.min(0.32, 0.32 * (1 - dist / MAX_LINK) * ((a.alpha + b.alpha) / 2));
              if (alpha < 0.01) continue;
              const lw = 0.6 + (1 - dist / MAX_LINK) * 1.2;

              // Visible glowing line: brighter stroke + small shadow (cheap glow)
              ctx.strokeStyle = `rgba(190,170,255,${alpha * 1.3})`; // brighter purple
              ctx.lineWidth = lw * 1.2;

              // subtle shadow/glow (kept small to avoid heavy GPU cost)
              ctx.shadowColor = `rgba(150,130,255,${Math.min(0.9, alpha * 0.9)})`;
              ctx.shadowBlur = 4;

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();

              // reset shadow to not affect other drawings
              ctx.shadowBlur = 0;
            }
          }
        }
        ctx.restore();
      }

      // draw particles on top
      for (const p of arr) {
        const r = Math.max(1.0, p.size * 1.2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(6, r * 6));
        g.addColorStop(0, `rgba(255,255,255,${Math.min(1, p.alpha + 0.05)})`);
        g.addColorStop(0.18, `rgba(220,200,255,${Math.min(0.92, p.alpha * 0.95)})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      if (!running) return;
      rafRef.current = requestAnimationFrame(loop);
      frameCounter.current++;
      if (hiddenRef.current) return;

      if (pointerDirty.current) {
        pointerDirty.current = false;
      }

      draw();
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const px = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const py = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      const scaleX = sizeRef.current.w / rect.width;
      const scaleY = sizeRef.current.h / rect.height;
      pointer.current.x = (px - rect.left) * scaleX;
      pointer.current.y = (py - rect.top) * scaleY;
      pointerDirty.current = true;
    }
    function onLeave() {
      pointer.current.x = -9999;
      pointer.current.y = -9999;
      pointerDirty.current = true;
    }
    function onDown(e) {
      pointer.current.down = true;
      const rect = canvas.getBoundingClientRect();
      const px = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const py = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      const scaleX = sizeRef.current.w / rect.width;
      const scaleY = sizeRef.current.h / rect.height;
      const mx = (px - rect.left) * scaleX;
      const my = (py - rect.top) * scaleY;
      for (const p of particlesRef.current) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const f = 1 - Math.sqrt(d2) / 160;
          const inv = 1 / (Math.sqrt(d2) + 0.01);
          p.vx += (dx * inv) * 0.9 * f;
          p.vy += (dy * inv) * 0.9 * f;
        }
      }
    }
    function onUp() {
      pointer.current.down = false;
    }

    function onVis() {
      hiddenRef.current = document.hidden;
    }
    document.addEventListener("visibilitychange", onVis);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        hiddenRef.current = !en.isIntersecting;
      });
    }, { threshold: 0.01 });
    io.observe(canvas);

    // attach listeners
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchend", onUp, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize, { passive: true });

    // initial setup & start
    resize();
    rafRef.current = requestAnimationFrame(loop);

    // cleanup
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      particlesRef.current.length = 0;
    };
  }, [baseParticles, extraParticles, maxDrawSize]);

  return (
    <canvas
      ref={canvasRef}
      className="interactive-dots fixed inset-0 -z-[11] w-full h-full pointer-events-none"
      aria-hidden
    />
  );
}