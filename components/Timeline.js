"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function Timeline({ milestones }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Motion values for the dot/pill
  const top = useSpring(0, { stiffness: 160, damping: 24 });
  const left = useSpring(10, { stiffness: 160, damping: 24 });
  const width = useSpring(12, { stiffness: 200, damping: 26 });
  const height = useSpring(12, { stiffness: 200, damping: 26 });
  const radius = useSpring(999, { stiffness: 180, damping: 24 });
  const opacity = useSpring(1, { stiffness: 120, damping: 20 });

  const DOT_SIZE = 12;
  const LINE_X = 10;
  const mergeProgress = useMotionValue(0);

  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerTop =
        container.getBoundingClientRect().top + window.scrollY;
      const containerHeight = container.offsetHeight;
      const scrollMiddle = window.scrollY + window.innerHeight / 2;

      let progress = (scrollMiddle - containerTop) / containerHeight;
      progress = Math.max(0, Math.min(1, progress));

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

      if (idx === -1) {
        setActiveIndex(-1);
        mergeProgress.set(0);
        top.set(progress * containerHeight - DOT_SIZE / 2);
        left.set(LINE_X);
        width.set(DOT_SIZE);
        height.set(DOT_SIZE);
        radius.set(999);
        opacity.set(1);
        return;
      }

      setActiveIndex(idx);

      const activeEl = els[idx];
      const r = activeEl.getBoundingClientRect();
      const pillTop = r.top + window.scrollY - containerTop;
      const pillHeight = r.height;
      const pillLeftCenter =
        r.left +
        window.scrollX -
        containerRef.current.getBoundingClientRect().left +
        r.width / 2;
      const pillWidth = r.width;

      top.set(pillTop);
      height.set(pillHeight);
      left.set(pillLeftCenter);
      width.set(pillWidth);
      radius.set(12);
      opacity.set(0.18);

      const dist = Math.abs(
        scrollMiddle - (r.top + window.scrollY + r.height / 2)
      );
      mergeProgress.set(Math.max(0, 1 - dist / (r.height * 0.6)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [DOT_SIZE, LINE_X, top, left, width, height, radius, opacity, mergeProgress]);

  return (
    <div className="flex w-full max-w-7xl mx-auto">
      {/* Left side - timeline */}
      <div ref={containerRef} className="relative flex flex-col w-1/2 py-12">
        {/* Vertical line */}
        <div className="absolute left-10 top-0 w-1 h-full bg-indigo-600/80 rounded" />

        {/* Dot / Pill */}
        <motion.div
        className="absolute pointer-events-none bg-indigo-600"
        style={{
          top,
          left,
          width,
          height,
          opacity,
          transform: "translateX(-50%) rotate(180deg)", // rotation makes it diamond
          borderRadius: 4, // small radius for smoother edges (not full circle)
          zIndex: 0,
        }}
        />


        {/* Milestones */}
        {milestones.map((m, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className="milestone relative mb-28 ml-16 px-3 py-4 z-10 transition-colors"
            style={{
              borderRadius: 12,
              backgroundColor:
                activeIndex === i
                  ? `rgba(99,102,241,${mergeProgress.get() * 0.15})`
                  : "transparent",
            }}
          >
            <h3
              className={`font-bold text-lg transition-colors ${
                activeIndex === i ? "text-indigo-600" : "text-foreground"
              }`}
            >
              {m.title}
            </h3>
            <p
              className={`text-sm transition-colors ${
                activeIndex === i ? "text-indigo-500" : "text-foreground/70"
              }`}
            >
              {m.year}
            </p>
          </div>
        ))}

        {/* Timeline End Glow */}
        <div
          className="absolute bottom-0"
          style={{
            left: `${LINE_X}px`,
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

      {/* Right side - image preview */}
      <div className="w-1/2 flex justify-center items-center">
        {activeIndex > -1 && (
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="relative group"
          >
            <motion.img
              src={milestones[activeIndex].image}
              alt={milestones[activeIndex].title}
              className="w-[500px] h-[500px] object-cover rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient glow behind image */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl -z-10" />
          </motion.div>
        )}
      </div>
    </div>
  );
}