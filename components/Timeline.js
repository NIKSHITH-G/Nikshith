"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

export default function Timeline({ milestones }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Motion values for the dot/pill (always declare hooks unconditionally)
  const top = useSpring(0, { stiffness: 160, damping: 24 });
  const left = useSpring(10, { stiffness: 160, damping: 24 });
  const width = useSpring(12, { stiffness: 200, damping: 26 });
  const height = useSpring(12, { stiffness: 200, damping: 26 });
  const radius = useSpring(999, { stiffness: 180, damping: 24 });
  const opacity = useSpring(1, { stiffness: 120, damping: 20 });

  // Merge-into-halo extras (used only in "dot" mode)
  const dotScale = useSpring(1, { stiffness: 180, damping: 20 });
  const dotBlur = useSpring(0, { stiffness: 180, damping: 20 });
  const dotBlurPx = useTransform(dotBlur, (b) => `blur(${b}px)`);

  const DOT_SIZE = 12;
  const LINE_X = 10;      // matches className "left-10" on the vertical line
  const HALO_OFFSET = 45; // halo visual offset to the right
  const mergeProgress = useMotionValue(0);

  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerTop =
        container.getBoundingClientRect().top + window.scrollY;
      const containerLeft = container.getBoundingClientRect().left;
      const containerHeight = container.offsetHeight;
      const scrollMiddle = window.scrollY + window.innerHeight / 2;

      let progress = (scrollMiddle - containerTop) / containerHeight;
      progress = Math.max(0, Math.min(1, progress));

      // find active milestone near viewport middle
      const els = itemRefs.current.filter(Boolean);
      let idx = -1;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const r = el.getBoundingClientRect();
        const mid = r.top + window.scrollY + r.height / 2;
        if (Math.abs(mid - scrollMiddle) <= r.height * 0.6) {
          idx = i;
          break;
        }
      }

      // --- DOT MODE (no milestone "active") ---
      if (idx === -1) {
        setActiveIndex(-1);
        mergeProgress.set(0);

        // dot follows the line, centered at LINE_X
        const dotY = progress * containerHeight - DOT_SIZE / 2;
        top.set(dotY);
        left.set(LINE_X);
        width.set(DOT_SIZE);
        height.set(DOT_SIZE);
        radius.set(999);

        // fade/shrink/blur as it nears the bottom halo
        const FADE_ZONE_PX = 12; // increase to start blending earlier
        const fadeStartY = containerHeight - FADE_ZONE_PX;
        const fadeProgress =
          dotY <= fadeStartY
            ? 0
            : Math.min(1, (dotY - fadeStartY) / (FADE_ZONE_PX - DOT_SIZE));

        opacity.set(1 - fadeProgress);          // 1 -> 0
        dotScale.set(1 - 0.4 * fadeProgress);   // 1 -> 0.6
        dotBlur.set(6 * fadeProgress);          // 0px -> 6px
        return;
      }

      // --- PILL MODE (one milestone "active") ---
      setActiveIndex(idx);

      const activeEl = els[idx];
      const r = activeEl.getBoundingClientRect();

      const pillTop = r.top + window.scrollY - containerTop;
      const pillHeight = r.height;

      // Anchor pill to milestone's LEFT edge (so dot merges with the text)
      const milestoneLeft =
        r.left + window.scrollX - containerLeft; // absolute within container
      const pillWidth = r.width;

      top.set(pillTop);
      height.set(pillHeight);
      left.set(milestoneLeft);   // left edge, not center
      width.set(pillWidth);
      radius.set(12);
      opacity.set(0.18);         // pill translucency

      // keep pill crisp
      dotScale.set(1);
      dotBlur.set(0);

      const dist = Math.abs(
        scrollMiddle - (r.top + window.scrollY + r.height / 2)
      );
      mergeProgress.set(Math.max(0, 1 - dist / (r.height * 0.6)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [DOT_SIZE, LINE_X, top, left, width, height, radius, opacity, dotScale, dotBlur, mergeProgress]);

  const isDot = activeIndex === -1;

  return (
    <div className="w-full" suppressHydrationWarning>
      {/* Responsive grid: single column on small; two columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-[560px_minmax(0,1fr)] gap-8 lg:gap-12 items-center" suppressHydrationWarning>
        {/* Left: Timeline column */}
        <div ref={containerRef} className="relative w-full py-10 sm:py-12" suppressHydrationWarning>
          {/* Vertical line */}
          <div className="absolute left-10 top-0 w-1 h-full bg-indigo-600/80 rounded" />

          {/* Dot (centered at LINE_X) / Pill (left-anchored to milestone) */}
          <motion.div
            className="absolute pointer-events-none bg-indigo-600"
            suppressHydrationWarning
            style={{
              top,
              left,
              width,
              height,
              opacity,
              transform: isDot ? "translateX(-50%) rotate(180deg)" : "none",
              scale: isDot ? dotScale : 1,
              filter: isDot ? dotBlurPx : "none",
              borderRadius: 4,
              zIndex: 0,
            }}
          />

          {/* Milestones */}
          <div className="pl-16">
            {milestones.map((m, i) => (
              <div
                key={i}
                ref={(el) => (itemRefs.current[i] = el)}
                className="milestone relative mb-20 sm:mb-24 px-3 py-4 z-10 transition-colors
                           w-full sm:w-[520px] sm:max-w-[520px] rounded-xl"
                suppressHydrationWarning
                style={{
                  backgroundColor:
                    activeIndex === i
                      ? `rgba(99,102,241,${mergeProgress.get() * 0.15})`
                      : "transparent",
                }}
              >
                <h3
                  className={`font-bold text-lg sm:text-xl transition-colors ${
                    activeIndex === i ? "text-indigo-500" : "text-foreground"
                  }`}
                >
                  {m.title}
                </h3>
                <p
                  className={`text-sm transition-colors ${
                    activeIndex === i ? "text-indigo-400" : "text-foreground/70"
                  }`}
                >
                  {m.year}
                </p>
              </div>
            ))}
          </div>

          {/* Timeline End Glow (halo) */}
          <div
            className="absolute bottom-0"
            suppressHydrationWarning
            style={{
              left: `${LINE_X + HALO_OFFSET}px`,
              transform: "translateX(-50%)",
              width: "80px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 0,
            }}
          >
            <div
              suppressHydrationWarning
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at center, rgba(99,102,200,0.30) 10%, rgba(99,102,241,0) 80%)",
                transform: "scaleX(2)",
                boxShadow: "0 0 60px rgba(99,102,241,0.4)",
              }}
            />
          </div>
        </div>

        {/* Right: Image (responsive sizes) */}
        <div className="w-full flex items-center justify-center" suppressHydrationWarning>
          {activeIndex > -1 && (
            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              src={milestones[activeIndex].image}
              alt={milestones[activeIndex].title}
              className="rounded-2xl object-cover shadow-2xl
                         w-full max-w-[520px]
                         h-56 sm:h-72 md:h-80 lg:h-[400px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
