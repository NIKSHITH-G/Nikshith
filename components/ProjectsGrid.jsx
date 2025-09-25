// components/ProjectsGrid.jsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ProjectsGrid({ projects }) {
  const [open, setOpen] = useState(false);
  const [pIdx, setPIdx] = useState(0);
  const [sIdx, setSIdx] = useState(0);

  // SINGLE boolean: when true -> every card shows its preview area.
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);

  const hoverTimeout = useRef(null);

  const openLightbox = (idx) => {
    setPIdx(idx);
    setSIdx(0);
    setOpen(true);
    document.documentElement.style.overflow = "hidden"; // lock scroll
  };
  const closeLightbox = () => {
    setOpen(false);
    document.documentElement.style.overflow = ""; // unlock
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

  // keyboard controls for lightbox
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

  // Hover-intent helpers (single boolean)
  const onCardEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    hoveredRef.current = true;
    hoverTimeout.current = setTimeout(() => {
      setHovered(true);
      hoverTimeout.current = null;
    }, 80);
  };

  const onCardLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    hoverTimeout.current = setTimeout(() => {
      hoveredRef.current = false;
      setHovered(false);
      hoverTimeout.current = null;
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
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
            className="
              group cursor-pointer relative overflow-hidden rounded-2xl
              border-2 border-white/15 bg-white/[0.03] backdrop-blur
              hover:border-indigo-500/40 transition-[border,transform,box-shadow]
              hover:-translate-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]
            "
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox(i);
              }
            }}
            role="button"
            aria-label={`Open ${p.name} project slideshow`}
          >
            {/* Blue inset border */}
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-xl border border-indigo-500/40 pointer-events-none"
                style={{
                  top: "24px",   // 1 cm gap top
                  left: "24px",  // 1 cm gap left
                  right: "24px", // 1 cm gap right
                  bottom: "24px" // 1 cm gap bottom
                }}
              />

              {/* Inner frame (content) */}
              <div className="relative rounded-xl p-5 flex flex-col min-h-[280px]">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-xl">{p.name}</h3>
                  {p.slides?.length ? (
                    <span className="text-[11px] px-2 py-1 rounded-md border border-indigo-500/30 bg-indigo-500/10">
                      {p.slides.length} shots
                    </span>
                  ) : null}
                </div>

                <ul className="space-y-2 text-sm list-disc pl-5 my-4 flex-1">
                  {p.points.map((pt, j) => (
                    <li key={j}>{pt}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="text-xs rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Preview area */}
                <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
                  <AnimatePresence>
                    {hovered ? (
                      <motion.div
                        key={`preview-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 160, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        className="relative w-full"
                      >
                        <img
                          src={p.slides?.[0] || "/images/projects/placeholder.png"}
                          alt={`${p.name} preview`}
                          className="w-full h-full object-cover rounded-b-md"
                          style={{ height: "160px" }}
                          draggable={false}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`preview-empty-${i}`}
                        initial={{ height: 0 }}
                        animate={{ height: 0 }}
                        exit={{ height: 0 }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-white/70 px-3">Preview</div>
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
          </motion.article>
        ))}
      </div>

      {/* Lightbox / slideshow */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-label={`${projects[pIdx]?.name} slideshow`}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeLightbox}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="
                relative z-[81] w-[min(92vw,1100px)] max-h-[86vh]
                rounded-2xl border border-white/15 bg-[#0c0c0f]/95 shadow-2xl
                p-4 md:p-5 flex flex-col gap-3
              "
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

                {slides.length > 1 && (
                  <>
                    <button type="button" onClick={prevSlide} className="nav-arrow left-3">‹</button>
                    <button type="button" onClick={nextSlide} className="nav-arrow right-3">›</button>
                  </>
                )}
              </div>

              {slides.length > 1 && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSIdx(i)}
                      className={`h-2.5 rounded-full transition-all ${
                        i === sIdx ? "w-6 bg-indigo-400" : "w-2.5 bg-white/25 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProjectsGrid;
