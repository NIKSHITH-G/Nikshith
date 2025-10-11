// components/HandTornado.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * HandTornado
 * Props:
 *  - image: string (src for person image)
 *  - icons: string[] (src for app icon images or emoji strings)
 *  - handOffset: { x, y } optional pixel offset from top-left of image to where the hand center is (tweak!)
 *  - size: number optional, width in px for the person image container (responsive handled in css)
 */
export default function HandTornado({
  image,
  icons = [],
  handOffset = { x: 240, y: 520 },
  size = 420,
}) {
  const containerRef = useRef(null);
  const orbRefs = useRef([]);
  const animRef = useRef(null);
  const lastTsRef = useRef(null);
  const pointer = useRef({ x: null, y: null });
  const [running, setRunning] = useState(true);

  // build meta for each icon so things are deterministic
  const ICON_META = icons.map((src, i) => ({
    src,
    baseRadius: 48 + (i % 5) * 26 + (i % 2 ? 8 : -8), // vary radii
    speed: 0.25 + (i % 5) * 0.06 + (i % 3) * 0.03, // radians per second-ish
    size: 28 + (i % 4) * 8,
    phase: (i / icons.length) * Math.PI * 2,
    tilt: (i % 7) * 6, // slight angle
    zIndex: 100 + i,
  }));

  // RAF loop: updates angles & positions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let angles = ICON_META.map((m) => m.phase);

    function step(ts) {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(60, ts - lastTsRef.current);
      lastTsRef.current = ts;

      // get container rect & hand center in page coords
      const rect = container.getBoundingClientRect();
      // approximate hand center inside the container using handOffset (pixels) relative to container top-left
      const handX = rect.left + handOffset.x;
      const handY = rect.top + handOffset.y;

      // pointer influence (-1..1)
      const px = pointer.current.x;
      const py = pointer.current.y;
      let influenceX = 0;
      let influenceY = 0;
      if (px !== null && py !== null) {
        // small normalized offset
        influenceX = (px - handX) / Math.max(80, rect.width);
        influenceY = (py - handY) / Math.max(80, rect.height);
      }

      ICON_META.forEach((m, i) => {
        // update angle
        angles[i] += (m.speed * (dt / 1000)) * (i % 2 ? 1 : -1);
        // slight radial pulse to mimic tornado column
        const pulse = 1 + 0.06 * Math.sin((ts / 300) + i);
        const radius = m.baseRadius * pulse + (influenceX * 20);

        // polar -> cartesian
        const x = Math.cos(angles[i]) * radius;
        const y = Math.sin(angles[i]) * (radius * 0.6); // ellipse for perspective

        const el = orbRefs.current[i];
        if (!el) return;

        // compute screen position relative to the container (so we can position absolute inside)
        const left = handOffset.x + x + influenceX * 40 - m.size / 2;
        const top = handOffset.y + y + influenceY * 40 - m.size / 2;

        el.style.transform = `translate(${left}px, ${top}px) rotate(${angles[i] * 30}deg) translateZ(${(i % 5) * 6}px)`;
        el.style.width = `${m.size}px`;
        el.style.height = `${m.size}px`;
        el.style.opacity = `${0.38 + (0.62 * Math.min(1, 1 - Math.abs(y) / 400))}`; // fade when high
        el.style.zIndex = m.zIndex + Math.round((y + 200) / 10);
        el.style.filter = `drop-shadow(0px ${2 + i % 3}px ${6 + i % 3}px rgba(0,0,0,0.45))`;
      });

      animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);

    // pointer listeners, bound to window so mobile touch works
    function onPointerMove(e) {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      pointer.current.x = cx;
      pointer.current.y = cy;
    }
    function onLeave() {
      pointer.current.x = null;
      pointer.current.y = null;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("touchend", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      lastTsRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("blur", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, icons.join("|"), handOffset.x, handOffset.y]);

  // small toggle to pause animation (for debugging)
  const toggle = () => setRunning((r) => !r);

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{
        width: size,
        maxWidth: "100%",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {/* background soft tornado column */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: handOffset.x - 120,
          top: handOffset.y - 260,
          width: 240,
          height: 520,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 10%, rgba(124,58,237,0.09), rgba(99,102,241,0.03) 35%, transparent 70%)",
          filter: "blur(28px)",
          transform: "translateZ(0)",
          borderRadius: "50%",
        }}
      />

      {/* person image (the container is the placing context for icons) */}
      <div
        className="relative overflow-visible"
        style={{
          width: "100%",
          display: "block",
        }}
      >
        {/* image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="hero-person"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.65)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.006))",
          }}
          draggable={false}
        />

        {/* orbit icons (absolute inside container) */}
        {ICON_META.map((m, i) => (
          <div
            key={`orb-${i}`}
            ref={(el) => (orbRefs.current[i] = el)}
            className="absolute pointer-events-auto flex items-center justify-center rounded-full bg-white/90"
            style={{
              left: 0,
              top: 0,
              transform: "translate(-9999px, -9999px)",
              width: `${m.size}px`,
              height: `${m.size}px`,
              borderRadius: "999px",
              display: "grid",
              placeItems: "center",
              transition: "width 120ms linear, height 120ms linear, opacity 240ms linear, transform 80ms linear",
              willChange: "transform, opacity",
              background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,245,245,0.92))",
            }}
            aria-hidden
          >
            {/* icon content (image or emoji) */}
            {m.src && (m.src.startsWith("http") || m.src.startsWith("/")) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.src}
                alt={`icon-${i}`}
                style={{
                  width: "70%",
                  height: "70%",
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            ) : (
              <span style={{ fontSize: Math.max(12, m.size * 0.5) }}>{m.src}</span>
            )}
          </div>
        ))}
      </div>

      {/* small controls (overlay) */}
      <div style={{ position: "absolute", right: 6, bottom: 6 }}>
        <button
          type="button"
          onClick={toggle}
          style={{
            background: "rgba(0,0,0,0.45)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "6px 8px",
            borderRadius: 10,
            fontSize: 12,
            backdropFilter: "blur(6px)",
            cursor: "pointer",
          }}
        >
          {running ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
