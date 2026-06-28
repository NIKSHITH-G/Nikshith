"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

/* -------------------------------------------------------------------------
   One milestone: an always-visible card (image banner + text) on a spine.
   - `active`  → the travelling ball has arrived at this node: highlight the photo.
   - `visited` → the ball has already passed this node: keep it "lit".
------------------------------------------------------------------------- */
function Milestone({ m, index, active, visited, registerRef }) {
  const isLeft = index % 2 === 0; // desktop side

  return (
    <div
      ref={(el) => registerRef(index, el)}
      className="relative pl-16 lg:pl-0 mb-10 lg:mb-14 last:mb-8"
    >
      {/* Connector from spine to card (desktop) */}
      <div
        aria-hidden
        className={[
          "hidden lg:block absolute top-1/2 -translate-y-1/2 h-[2px] w-10 transition-all duration-300",
          active ? "w-12 bg-indigo-400" : visited ? "bg-indigo-500/70" : "bg-indigo-500/30",
          isLeft
            ? "right-1/2 bg-gradient-to-r from-transparent"
            : "left-1/2 bg-gradient-to-l from-transparent",
        ].join(" ")}
      />

      {/* Node on the spine */}
      <div className="absolute left-6 lg:left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <span className="relative flex h-4 w-4 items-center justify-center">
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-indigo-400/50"
            animate={
              active
                ? { scale: [1, 1.9, 1], opacity: [0.55, 0, 0.55] }
                : { scale: 1, opacity: 0 }
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span
            className={[
              "relative rounded-full border-2 transition-all duration-300",
              active
                ? "h-[18px] w-[18px] bg-indigo-400 border-white shadow-[0_0_20px_rgba(99,102,241,0.95)]"
                : visited
                ? "h-4 w-4 bg-indigo-600 border-indigo-300"
                : "h-4 w-4 bg-[#0b0b12] border-indigo-500/40",
            ].join(" ")}
          />
        </span>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={[
          "lg:w-[calc(50%-2.5rem)]",
          isLeft ? "lg:mr-auto" : "lg:ml-auto",
        ].join(" ")}
      >
        <div
          className={[
            "group relative overflow-hidden rounded-2xl border bg-[#0d0b16]",
            "transition-all duration-300 hover:-translate-y-1",
            active
              ? "border-indigo-400/50 shadow-[0_18px_50px_-32px_rgba(99,102,241,0.6)]"
              : visited
              ? "border-indigo-500/30"
              : "border-white/10",
          ].join(" ")}
        >
          {/* Image banner */}
          {m.image && (
            <div className="relative h-44 sm:h-52 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt={m.title}
                loading="lazy"
                className={[
                  "h-full w-full object-cover transition-all duration-500",
                  active
                    ? "brightness-105"
                    : "brightness-[0.88] group-hover:brightness-100",
                ].join(" ")}
              />
              {/* darkening gradient lifts when active so the photo pops */}
              <div
                className={[
                  "absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-[#0b0b12] via-[#0b0b12]/10 to-transparent",
                  active ? "opacity-40" : "opacity-100",
                ].join(" ")}
              />
              {/* highlight ring when the ball arrives */}
              <div
                aria-hidden
                className={[
                  "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500",
                  "ring-1 ring-inset ring-indigo-400/40",
                  active ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-mono backdrop-blur transition-colors duration-300",
                  active
                    ? "bg-indigo-500/80 text-white"
                    : "bg-black/55 text-indigo-200",
                ].join(" ")}
              >
                {m.year}
              </span>
            </div>
          )}

          {/* Text */}
          <div className="p-4 sm:p-5">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {m.title}
            </h3>
            <p className="mt-1 text-sm font-medium text-indigo-300/90">
              {m.degree}
            </p>
            {!m.image && (
              <p className="mt-1 text-xs text-foreground/60">{m.year}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Timeline: spine + scroll-driven fill, a ball that travels and is swallowed
   by the portal ("hole") at the bottom. The ball's position drives which
   card is highlighted, so the photo lights up exactly when the ball lands.
------------------------------------------------------------------------- */
export default function Timeline({ milestones = [] }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const fractionsRef = useRef([]);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [passedIndex, setPassedIndex] = useState(-1);

  const registerRef = (i, el) => {
    itemRefs.current[i] = el;
  };

  // Progress as the section travels through the viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 60%", "end 55%"],
  });

  const fillScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const ballTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  // Ball fades + shrinks as it gets swallowed by the portal.
  const ballOpacity = useTransform(scrollYProgress, [0, 0.86, 1], [1, 1, 0]);
  const ballScale = useTransform(scrollYProgress, [0, 0.86, 1], [1, 1, 0.2]);

  // The hole only fades in as the ball nears the bottom — calm, not constant.
  const holeOpacity = useTransform(scrollYProgress, [0.62, 0.92], [0, 0.9]);

  // Measure each node's vertical centre as a fraction of the spine height.
  // The ball's top% === scrollYProgress, so comparing the two tells us exactly
  // when the ball is sitting on a given node.
  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const h = cRect.height || 1;
      fractionsRef.current = itemRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return (r.top - cRect.top + r.height / 2) / h;
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [milestones]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const fr = fractionsRef.current;
    const LAND = 0.1; // how close the ball must be to "land" on a node

    let nearest = -1;
    let best = Infinity;
    let passed = -1;
    fr.forEach((f, i) => {
      if (f == null) return;
      if (p >= f - 0.02) passed = i;
      const d = Math.abs(f - p);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });

    setActiveIndex(best <= LAND ? nearest : -1);
    setPassedIndex(passed);
  });

  return (
    <div ref={containerRef} className="relative py-4 sm:py-8">
      {/* Spine */}
      <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 rounded-full bg-white/10">
        {/* Scroll-driven gradient fill */}
        <motion.div
          style={{ scaleY: fillScaleY, transformOrigin: "top" }}
          className="absolute inset-0 rounded-full bg-gradient-to-b from-indigo-400 via-violet-500 to-indigo-600"
        />
        {/* Travelling ball */}
        <motion.span
          aria-hidden
          style={{ top: ballTop, opacity: ballOpacity, scale: ballScale }}
          className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_3px_rgba(124,58,237,0.6)]"
        />
      </div>

      {/* The "hole" the ball sinks into — a small, soft glow pool */}
      <motion.div
        aria-hidden
        style={{ opacity: holeOpacity }}
        className="pointer-events-none absolute left-6 lg:left-1/2 bottom-0 z-10 -translate-x-1/2 translate-y-1/2"
      >
        <div className="relative grid place-items-center">
          {/* soft glow */}
          <div className="absolute h-6 w-20 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.28),transparent_70%)] blur-md" />
          {/* shallow well */}
          <div className="h-3.5 w-12 rounded-[50%] border border-indigo-400/30 bg-[radial-gradient(ellipse_at_center,#07050d,#120a20_80%,transparent)] shadow-[inset_0_1px_4px_rgba(0,0,0,0.9)]" />
        </div>
      </motion.div>

      {/* Milestones */}
      <div className="relative">
        {milestones.map((m, i) => (
          <Milestone
            key={m.title ?? i}
            m={m}
            index={i}
            active={i === activeIndex}
            visited={i <= passedIndex}
            registerRef={registerRef}
          />
        ))}
      </div>
    </div>
  );
}
