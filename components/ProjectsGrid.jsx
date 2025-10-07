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

  // hover-intent (single boolean controlling all cards)
  const onCardEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    // small enter delay to avoid accidental hover
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
    // small leave delay so moving between cards doesn't instantly hide
    hoverTimeout.current = setTimeout(() => {
      setHovered(false);
      hoverTimeout.current = null;
    }, 120);
  };

  // clear timer on unmount
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
            {/* Outer margin + rounded white inner card (this keeps your white border) */}
            <div className="relative m-3 rounded-xl">
              {/* Blue decorative frame - absolutely fills the interior of the white card.
                  pointer-events-none so it doesn't block clicks. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-xl border border-indigo-500/40 pointer-events-none"
                style={{ boxSizing: "border-box" }}
              />

              {/* CONTENT: positioned relative above the blue frame.
                  We set an explicit padding of 1cm (user requested) so the blue frame
                  appears inset by 1cm on all sides.
                  The layout is flex column with justify-between so the preview row sits at the bottom. */}
              <div
                className="relative flex flex-col min-h-[280px] z-10"
                style={{ padding: "1cm" }} // exact 1cm gap inside the blue border
              >
                {/* Top + middle content. Put these into a growable area so preview stays at bottom */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-xl">{p.name}</h3>

                    {p.slides?.length ? (
                      <span className="text-[11px] px-2 py-1 rounded-md border border-indigo-500/30 bg-indigo-500/10">
                        {p.slides.length} shots
                      </span>
                    ) : null}
                  </div>

                  <ul className="space-y-2 text-sm list-disc pl-5 my-4">
                    {p.points.map((pt, j) => (
                      <li key={j}>{pt}</li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="text-xs rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <hr className="my-4 border-white/10" />
                </div>

                {/* BOTTOM AREA (preview container + footer row).
                    Because the parent is flex-col + has a flex-1 top area, this bottom area
                    will always sit at the bottom of the card before and after hover. */}
                <div className="flex flex-col gap-3">
                  {/* Preview "banner" area that expands/collapses.
                      When collapsed it has height: 0 (no extra space).
                      On-hover it animates to a fixed height (160px). */}
                  <div className="overflow-hidden rounded-lg border border-white/10">
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

                  {/* preview footer row (label + view button) */}
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
            {/* Dim/blur backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeLightbox}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {/* Modal content */}
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
              {/* Header */}
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

              {/* Image area */}
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

                {/* Arrows */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="nav-arrow left-3"
                      aria-label="Previous slide"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="nav-arrow right-3"
                      aria-label="Next slide"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Dots */}
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
                      aria-label={`Go to slide ${i + 1}`}
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
 