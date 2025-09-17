// components/ProjectCard.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectCard({ project, idx }) {
  const [open, setOpen] = useState(false); // lightbox open
  const [current, setCurrent] = useState(0); // current slide in lightbox/preview
  const [showPreviews, setShowPreviews] = useState(false); // driven by global event
  const cycleTimer = useRef(null);

  const { name, points = [], stack = [], images = [] } = project;
  const previewSrc = images?.[0] || "/images/projects/placeholder.png";

  const nextImage = () => {
    if (!images.length) return;
    setCurrent((c) => (c + 1) % images.length);
  };

  const prevImage = () => {
    if (!images.length) return;
    setCurrent((c) => (c - 1 + images.length) % images.length);
  };

  // Listen for global hover events so all cards reveal together
  useEffect(() => {
    const onGlobalHover = (e) => {
      setShowPreviews(Boolean(e?.detail));
    };
    window.addEventListener("projects-hover", onGlobalHover);
    return () => window.removeEventListener("projects-hover", onGlobalHover);
  }, []);

  // Auto-cycle while previews are visible AND lightbox isn't open
  useEffect(() => {
    if (cycleTimer.current) {
      clearInterval(cycleTimer.current);
      cycleTimer.current = null;
    }
    if (showPreviews && images.length > 1 && !open) {
      cycleTimer.current = setInterval(() => {
        setCurrent((c) => (c + 1) % images.length);
      }, 1500);
    }
    return () => {
      if (cycleTimer.current) {
        clearInterval(cycleTimer.current);
        cycleTimer.current = null;
      }
    };
  }, [showPreviews, images.length, open]);

  // Keyboard handlers for lightbox
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        document.documentElement.style.overflow = "";
      }
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  // Use a single globally-shared leave timer so different cards don't fight
  // window.__projectsHoverLeaveTimer is used to debounce the "leave" across all cards
  const handleMouseEnter = () => {
    // Clear any pending global leave timer (prevents the preview turning off while moving between cards)
    if (window.__projectsHoverLeaveTimer) {
      clearTimeout(window.__projectsHoverLeaveTimer);
      window.__projectsHoverLeaveTimer = null;
    }
    // Immediately broadcast "show previews"
    window.dispatchEvent(new CustomEvent("projects-hover", { detail: true }));
  };

  const handleMouseLeave = () => {
    // small global delay so moving between cards doesn't collapse previews
    if (window.__projectsHoverLeaveTimer) {
      clearTimeout(window.__projectsHoverLeaveTimer);
      window.__projectsHoverLeaveTimer = null;
    }
    window.__projectsHoverLeaveTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("projects-hover", { detail: false }));
      window.__projectsHoverLeaveTimer = null;
    }, 100); // 100ms debounce — tweakable
  };

  return (
    <>
      <div
        className="
          group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30
          ring-1 ring-white/5 p-5 sm:p-6 backdrop-blur
          shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
        "
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
              {name}
            </h3>
            {images?.length > 0 && (
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] sm:text-xs text-indigo-300">
                {images.length} shots
              </span>
            )}
          </div>

          {/* Bullets */}
          {points?.length > 0 && (
            <ul className="mb-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
              {points.map((pt, i) => (
                <li key={`pt-${idx}-${i}`}>{pt}</li>
              ))}
            </ul>
          )}

          {/* Tech stack */}
          {stack?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {stack.map((s, i) => (
                <span
                  key={`stack-${idx}-${s}-${i}`}
                  className="text-xs rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto" />

          {/* Preview box */}
          <div
            className="
              relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40
              ring-1 ring-white/5 transition-colors hover:bg-white/[0.02]
            "
          >
            {/* Top row: label + View button */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm text-white/80">Preview</div>
              <button
                type="button"
                onClick={() => {
                  if (!images.length) return;
                  setOpen(true);
                  setCurrent(0);
                  document.documentElement.style.overflow = "hidden";
                }}
                className="rounded-md bg-indigo-700/10 px-3 py-1 text-sm text-indigo-200 hover:bg-indigo-700/20 transition"
              >
                View
              </button>
            </div>

            {/* Expandable preview area — controlled by global showPreviews */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={
                showPreviews
                  ? { height: 300, opacity: 1, transition: { duration: 0.32 } }
                  : { height: 0, opacity: 0, transition: { duration: 0.28 } }
              }
              className="w-full overflow-hidden bg-black/30 px-4 pb-4"
            >
              <motion.img
                // eslint-disable-next-line @next/next/no-img-element
                src={images[current] || previewSrc}
                alt={`${name} preview`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={
                  showPreviews ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }
                }
                transition={{ duration: 0.32 }}
                className="h-[220px] w-full object-cover rounded-md shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)]"
                draggable={false}
              />

              {/* small controls when revealed */}
              {images.length > 1 && showPreviews && (
                <div className="mt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="inline-grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/20 text-white/80 hover:bg-white/5"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <div className="text-xs text-white/70">
                    {current + 1} / {images.length}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="inline-grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/20 text-white/80 hover:bg-white/5"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox slideshow */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpen(false);
              document.documentElement.style.overflow = "";
            }}
          >
            <motion.div
              className="
                relative w-full max-w-5xl
                rounded-2xl border border-white/12 bg-black/40 ring-1 ring-white/8
                shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]
                overflow-hidden
              "
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-40 blur-2xl [mask-image:radial-gradient(100%_90%_at_50%_10%,#000_40%,transparent)] bg-[conic-gradient(from_200deg,rgba(99,102,241,.25),rgba(168,85,247,.2),transparent,rgba(99,102,241,.25))]" />

              <button
                onClick={() => {
                  setOpen(false);
                  document.documentElement.style.overflow = "";
                }}
                className="absolute right-3 top-3 z-10 inline-grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white/80 hover:bg-white/15"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className="relative grid place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[current]}
                  alt={`${name} screenshot ${current + 1}`}
                  className="max-h-[76vh] w-full object-contain"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 inline-grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white/90 hover:bg-white/15 backdrop-blur"
                      aria-label="Previous"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 inline-grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white/90 hover:bg-white/15 backdrop-blur"
                      aria-label="Next"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 px-4 pb-4 pt-2 md:px-5">
                <div className="truncate text-xs sm:text-sm text-white/70">
                  {name} — <span className="text-white/60">shot {current + 1} of {images.length}</span>
                </div>
                {images.length > 1 && (
                  <div className="flex items-center gap-2">
                    {images.map((_, i) => (
                      <button
                        key={`dot-${i}`}
                        onClick={() => setCurrent(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={[
                          "h-2.5 w-2.5 rounded-full transition",
                          i === current ? "bg-white" : "bg-white/35 hover:bg-white/60",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}