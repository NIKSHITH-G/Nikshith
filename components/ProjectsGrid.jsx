// components/ProjectsGrid.jsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ProjectsGrid({ projects }) {
  const [open, setOpen] = useState(false);
  const [pIdx, setPIdx] = useState(0);
  const [sIdx, setSIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const scrollerRef = useRef(null);
  const hoverTimeout = useRef(null);

  const openLightbox = (idx) => {
    setPIdx(idx);
    setSIdx(0);
    setOpen(true);
    document.documentElement.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setOpen(false);
    document.documentElement.style.overflow = "";
  };

  const slides = projects[pIdx]?.slides || [];

  const nextSlide = useCallback(() => {
    if (!slides.length) return;
    setSIdx((n) => (n + 1) % slides.length);
  }, [slides.length]);
  const prevSlide = useCallback(() => {
    if (!slides.length) return;
    setSIdx((n) => (n - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, nextSlide, prevSlide]);

  const onCardEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setHovered(true);
      hoverTimeout.current = null;
    }, 80);
  };
  const onCardLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setHovered(false);
      hoverTimeout.current = null;
    }, 120);
  };

  useEffect(() => () => clearTimeout(hoverTimeout.current), []);

  // Horizontal scroll on wheel
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        const atStart = el.scrollLeft === 0;
        const atEnd = Math.round(el.scrollLeft) >= Math.round(maxScrollLeft);
        if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: "smooth" });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Match card heights for footer alignment
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const syncHeights = () => {
      const cards = Array.from(el.querySelectorAll(".project-card"));
      cards.forEach((c) => (c.style.height = "auto"));
      const max = Math.max(...cards.map((c) => c.getBoundingClientRect().height));
      cards.forEach((c) => (c.style.height = `${Math.ceil(max)}px`));
    };
    syncHeights();
    const resizeObs = new ResizeObserver(syncHeights);
    resizeObs.observe(el);
    return () => resizeObs.disconnect();
  }, [projects, hovered]);

  return (
    <>
      <div style={{ position: "relative" }}>
        <div ref={scrollerRef} className="projects-scroller">
          {projects.map((p, i) => (
            <motion.article
              key={p.name ?? `project-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              onClick={() => openLightbox(i)}
              onMouseEnter={onCardEnter}
              onMouseLeave={onCardLeave}
              className="project-card group cursor-pointer relative overflow-hidden rounded-2xl border-2 border-white/15 bg-white/[0.03] backdrop-blur hover:border-indigo-500/40 transition-[border,transform,box-shadow] hover:-translate-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]"
              tabIndex={0}
              role="button"
              aria-label={`Open ${p.name} project slideshow`}
            >
              <div className="relative m-3 rounded-xl project-inner">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-xl border border-indigo-500/40 pointer-events-none"
                  style={{ boxSizing: "border-box" }}
                />
                <div className="relative flex flex-col project-content z-10" style={{ padding: "1cm" }}>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-xl">{p.name}</h3>
                      {p.slides?.length ? (
                        <span className="text-[11px] px-2 py-1 rounded-md border border-indigo-500/30 bg-indigo-500/10">
                          {p.slides.length} shots
                        </span>
                      ) : null}
                    </div>

                    <ul className="space-y-2 text-sm list-disc pl-4 my-4">
                      {p.points.map((pt, j) => <li key={j}>{pt}</li>)}
                    </ul>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.stack.map((s) => (
                        <span key={s} className="text-xs rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 mb-4">
                      {p.links?.map((l) => (
                        <a
                          key={l.link}
                          href={l.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/5 transition"
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* --- Updated preview animation area --- */}
                    <div
                      className="overflow-hidden rounded-lg border border-white/10"
                      style={{
                        contain: "layout paint",
                        transform: "translateZ(0)",
                        backfaceVisibility: "hidden",
                        willChange: "height, opacity",
                      }}
                    >
                      <AnimatePresence>
                        {hovered ? (
                          <motion.div
                            key={`preview-${i}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                              height: 160,
                              opacity: 1,
                              transition: { duration: 0.25, ease: [0.22, 0.61, 0.36, 1] },
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                              transition: { duration: 0.22, ease: "easeOut" },
                            }}
                            className="relative w-full"
                          >
                            <img
                              src={p.slides?.[0] || "/images/projects/placeholder.png"}
                              alt={`${p.name} preview`}
                              className="w-full h-[160px] object-cover rounded-b-md pointer-events-none"
                              draggable={false}
                            />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/70">Preview</div>
                      <button
                        type="button"
                        className="rounded-md bg-white/5 px-3 py-1 text-sm hover:bg-white/6"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(i);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Lightbox remains unchanged */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeLightbox}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-[81] w-[min(92vw,1100px)] max-h-[86vh] rounded-2xl border border-white/15 bg-[#0c0c0f]/95 shadow-2xl p-4 md:p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-white/60">Project</div>
                  <div className="font-semibold text-lg">{projects[pIdx]?.name}</div>
                </div>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={sIdx}
                    src={slides[sIdx]}
                    alt={`${projects[pIdx]?.name} screenshot ${sIdx + 1}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                  />
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProjectsGrid;
