"use client";

// Small interactive pieces for the classic (no-3D) page.

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { trackVisit } from "../../lib/track";

// Counts the classic page once per session (renders nothing).
export function VisitPing({ id }) {
  useEffect(() => trackVisit(id), [id]);
  return null;
}

// Melbourne's local time, ticking — so visitors know if it's a sensible hour to reach out.
export function LocalTime({ timezone }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <span className="inline-block w-16" />;
  const time = now.toLocaleTimeString("en-AU", { timeZone: timezone, hour: "numeric", minute: "2-digit" });
  return <span suppressHydrationWarning>{time.toLowerCase()}</span>;
}

// Fade + lift sections in as they scroll into view.
export function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Header links that light up for the section you're reading.
export function SectionNav({ items }) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const els = items.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav className="hidden items-center gap-1 text-[13px] lg:flex">
      {items.map(([id, label]) => (
        <a
          key={id}
          href={`#${id}`}
          className={`rounded-full px-3 py-1.5 transition ${active === id ? "bg-white/10 text-white" : "text-white/55 hover:text-white"}`}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

// Photo grid with a full-screen viewer (← → to browse, esc to close).
export function Gallery({ photos, more }) {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setOpen((i) => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, photos.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <button key={p.src} onClick={() => setOpen(i)} className="group relative aspect-square overflow-hidden rounded-xl bg-white/5">
            <Image src={p.src} alt={p.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px" className="object-cover transition duration-500 group-hover:scale-[1.05]" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-8 text-left text-[12px] text-white/90 opacity-0 transition group-hover:opacity-100">
              {p.title}
            </span>
          </button>
        ))}
        {more && (
          <a href={more.href} target="_blank" rel="noopener noreferrer" className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-4 text-center transition hover:border-violet-300/60 hover:bg-white/[0.06]">
            <span className="font-display text-2xl italic text-white">More on Instagram</span>
            <span className="font-mono text-xs text-violet-300">{more.handle} ↗</span>
          </a>
        )}
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <motion.div key={open} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative h-[78vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Image src={photos[open].src} alt={photos[open].title} fill sizes="100vw" className="object-contain" />
            </motion.div>
            <div className="mt-4 flex items-center gap-4 text-sm text-white/80" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setOpen((open - 1 + photos.length) % photos.length)} className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10" aria-label="Previous photo">←</button>
              <span className="min-w-[200px] text-center">{photos[open].title} <span className="text-white/40">· {open + 1}/{photos.length}</span></span>
              <button onClick={() => setOpen((open + 1) % photos.length)} className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10" aria-label="Next photo">→</button>
            </div>
            <button onClick={() => setOpen(null)} className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-black">Close ✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
