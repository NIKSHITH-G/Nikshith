// components/InteractiveWallpaper.jsx
"use client";

import { useEffect, useRef } from "react";

/**
 * InteractiveWallpaper
 * - Renders two canvases stacked: waves (below, mix-blend overlay) + constellation (above).
 * - Responsive & respects prefers-reduced-motion.
 * - Pointer interactions: waves subtly react to cursor; constellation repels particles.
 *
 * Usage: <InteractiveWallpaper /> (place once near top of page, behind content)
 */

export default function InteractiveWallpaper() {
  const wavesRef = useRef(null);
  const dotsRef = useRef(null);
  const rafRef = useRef(null);
  const hiddenRef = useRef(false);
  const pointer = useRef({ x: -9999, y: -9999, down: false });
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    const wavesCanvas = wavesRef.current;
    const dotsCanvas = dotsRef.current;
    if (!wavesCanvas || !dotsCanvas) return;

    const wctx = wavesCanvas.getContext("2d", { alpha: true });
    const dctx = dotsCanvas.getContext("2d", { alpha: true });

    let running = true;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 900;

    // Wave config
    const LAYERS = prefersReduced ? 2 : 4;
    const WAVE_BASE_AMPL = isSmall ? 6 : 12;
    const WAVE_SPEED = prefersReduced ? 0.25 : 0.6;

    // Constellation config
    const PARTICLE_BASE = prefersReduced ? 30 : isSmall ? 60 : 120;
    const MAX_LINK = isSmall ? 90 : 140;
    const PARTICLE_SPEED = prefersReduced ? 0.2 : 0.6;

    // particles array
    let particles = [];

    // resize handling
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(300, window.innerWidth);
      const h = Math.max(300, window.innerHeight);
      sizeRef.current = { w, h, dpr };

      // waves
      wavesCanvas.width = Math.round(w * dpr);
      wavesCanvas.height = Math.round(h * dpr);
      wavesCanvas.style.width = `${w}px`;
      wavesCanvas.style.height = `${h}px`;
      wctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // dots
      dotsCanvas.width = Math.round(w * dpr);
      dotsCanvas.height = Math.round(h * dpr);
      dotsCanvas.style.width = `${w}px`;
      dotsCanvas.style.height = `${h}px`;
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // seed/adjust particles
      const desired = PARTICLE_BASE + Math.floor((Math.random() - 0.5) * 8);
      if (particles.length < desired) {
        for (let i = particles.length; i < desired; i++) particles.push(makeParticle(w, h));
      } else if (particles.length > desired) {
        particles = particles.slice(0, desired);
      }
    }

    function makeParticle(w, h) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.1 + Math.random() * PARTICLE_SPEED;
      const size = 1 + Math.random() * 2.2;
      const hue = 250 + Math.random() * 30;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        hue,
        alpha: 0.65 + Math.random() * 0.35,
      };
    }

    // wave helper: draw layered sin waves with gentle gradient
    let wavePhase = 0;
    function drawWaves(t) {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;
      wctx.clearRect(0, 0, w, h);

      // soft ambient radial to add depth
      const rad = wctx.createRadialGradient(w * 0.2, h * 0.1, 0, w * 0.2, h * 0.1, Math.max(w, h));
      rad.addColorStop(0, "rgba(70,50,120,0.07)");
      rad.addColorStop(1, "rgba(0,0,0,0)");
      wctx.fillStyle = rad;
      wctx.fillRect(0, 0, w, h);

      wavePhase += (WAVE_SPEED * 0.0008) * (prefersReduced ? 0.3 : 1) * (t || 1);

      // amplitude react to proximity of pointer
      let mouseInfluence = 0;
      const px = pointer.current.x;
      const py = pointer.current.y;
      if (px > -9000) {
        // compute distance to center
        const dx = px - w / 2;
        const dy = py - h / 2;
        const d = Math.hypot(dx, dy);
        mouseInfluence = Math.max(0, 1 - d / Math.max(w, h));
      }

      for (let layer = 0; layer < LAYERS; layer++) {
        const layerAmp = WAVE_BASE_AMPL * (1 + layer * 0.6) * (0.6 + mouseInfluence * 1.6);
        const speedOffset = wavePhase * (1 + layer * 0.3);
        const hue = 250 + layer * 6;
        const alpha = 0.02 + layer * 0.02;

        // create gradient for layer
        const grad = wctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, `rgba(120,90,255,${alpha})`);
        grad.addColorStop(0.5, `rgba(100,80,220,${alpha * 0.9})`);
        grad.addColorStop(1, `rgba(120,90,255,${alpha})`);
        wctx.fillStyle = grad;

        // path
        wctx.beginPath();
        const yOffset = h * (0.35 + layer * 0.04);
        const points = 160; // sampling, keep moderate for perf
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * w;
          // multi-sine for a richer wave
          const s =
            Math.sin((i * 0.02) + speedOffset * 0.6) * layerAmp * (0.7 + Math.sin(speedOffset + layer) * 0.1) +
            Math.sin((i * 0.05) + speedOffset * (0.9 + layer * 0.2)) * (layerAmp * 0.4);
          const y = yOffset + s;
          if (i === 0) wctx.moveTo(x, y);
          else wctx.lineTo(x, y);
        }
        // close shape to bottom and fill
        wctx.lineTo(w, h);
        wctx.lineTo(0, h);
        wctx.closePath();
        wctx.globalCompositeOperation = "source-over";
        wctx.fill();
      }

      // slight overall tint overlay for cohesion
      wctx.globalCompositeOperation = "lighter";
      wctx.globalAlpha = 0.035;
      wctx.fillStyle = "rgba(110,80,255,1)";
      wctx.fillRect(0, 0, w, h);
      wctx.globalAlpha = 1;
      wctx.globalCompositeOperation = "source-over";
    }

    // constellation draw
    function drawDots() {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;
      dctx.clearRect(0, 0, w, h);

      // update particles
      for (let p of particles) {
        // mouse repulsion
        const mx = pointer.current.x;
        const my = pointer.current.y;
        if (mx > -9000) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dsq = dx * dx + dy * dy;
          const r = 120;
          if (dsq < r * r) {
            const strength = (1 - dsq / (r * r)) * 0.9;
            p.vx += (dx / (Math.sqrt(dsq) + 0.01)) * 0.12 * strength;
            p.vy += (dy / (Math.sqrt(dsq) + 0.01)) * 0.12 * strength;
          }
        }

        // damping and movement
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      // draw links
      dctx.save();
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < MAX_LINK * MAX_LINK) {
            const alpha = 0.14 * (1 - Math.sqrt(dist2) / MAX_LINK);
            dctx.strokeStyle = `rgba(115,99,255,${alpha})`;
            dctx.lineWidth = 0.6;
            dctx.beginPath();
            dctx.moveTo(a.x, a.y);
            dctx.lineTo(b.x, b.y);
            dctx.stroke();
          }
        }
      }
      dctx.restore();

      // draw particles
      for (const p of particles) {
        const g = dctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(6, p.size * 6));
        g.addColorStop(0, `rgba(150,130,255,${Math.min(0.9, p.alpha)})`);
        g.addColorStop(0.4, `rgba(120,90,255,${Math.min(0.45, p.alpha * 0.6)})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        dctx.fillStyle = g;
        dctx.beginPath();
        dctx.arc(p.x, p.y, Math.max(1.2, p.size * 1.2), 0, Math.PI * 2);
        dctx.fill();
      }
    }

    // main loop
    function loop(ts) {
      if (!running) return;
      rafRef.current = requestAnimationFrame(loop);

      if (hiddenRef.current) return;

      drawWaves(ts);
      drawDots();
    }

    // pointer handlers
    function onPointerMove(e) {
      const rect = wavesCanvas.getBoundingClientRect();
      const px = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const py = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      pointer.current.x = px - rect.left;
      pointer.current.y = py - rect.top;
    }
    function onLeave() {
      pointer.current.x = -9999;
      pointer.current.y = -9999;
    }
    function onDown(e) {
      pointer.current.down = true;
      // gentle burst: push nearby particles outward
      const rect = wavesCanvas.getBoundingClientRect();
      const px = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const py = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      const mx = px - rect.left;
      const my = py - rect.top;
      for (const p of particles) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const f = 1 - Math.sqrt(d2) / 160;
          p.vx += (dx / (Math.sqrt(d2) + 0.01)) * 0.9 * f;
          p.vy += (dy / (Math.sqrt(d2) + 0.01)) * 0.9 * f;
        }
      }
    }
    function onUp() {
      pointer.current.down = false;
    }

    // observe visibility/viewport to pause when not visible
    function onVis() {
      hiddenRef.current = document.hidden;
    }
    document.addEventListener("visibilitychange", onVis);

    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        hiddenRef.current = !en.isIntersecting;
      });
    }, { threshold: 0.01 });
    io.observe(wavesCanvas);

    // attach events
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchend", onUp, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    // initial setup + start
    resize();
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize, { passive: true });

    // cleanup
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  // two canvases stacked together; waves uses mix-blend-mode overlay and is slightly lower in z.
  return (
    <>
      <canvas
        ref={wavesRef}
        className="interactive-waves fixed inset-0 -z-[12] w-full h-full pointer-events-none"
        aria-hidden
      />
      <canvas
        ref={dotsRef}
        className="interactive-dots fixed inset-0 -z-[11] w-full h-full pointer-events-none"
        aria-hidden
      />
    </>
  );
}
