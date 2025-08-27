// components/ProjectCard.jsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectCard({ project, idx }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

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

  // Keyboard controls when lightbox is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  return (
    <>
      <div
        className="
          group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30
          ring-1 ring-white/5 p-5 sm:p-6 backdrop-blur
          shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
        "
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
          <button
            type="button"
            onClick={() => {
              if (!images.length) return;
              setOpen(true);
              setCurrent(0);
            }}
            className="
              relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40
              ring-1 ring-white/5 transition-colors hover:bg-white/[0.02]
              h-[260px] md:h-[300px]
            "
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt={`${name} preview`}
              className="h-full w-full object-cover"
            />
            <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(70%_60%_at_50%_-10%,rgba(99,102,241,.15),transparent)]" />
          </button>
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
            onClick={() => setOpen(false)}
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
              {/* Decorative soft ring */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-40 blur-2xl [mask-image:radial-gradient(100%_90%_at_50%_10%,#000_40%,transparent)] bg-[conic-gradient(from_200deg,rgba(99,102,241,.25),rgba(168,85,247,.2),transparent,rgba(99,102,241,.25))]" />

              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
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

              {/* Image area */}
              <div className="relative grid place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[current]}
                  alt={`${name} screenshot ${current + 1}`}
                  className="max-h-[76vh] w-full object-contain"
                />

                {/* Prev / Next */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 inline-grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white/90 hover:bg-white/15 backdrop-blur"
                      aria-label="Previous"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M15 6l-6 6 6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 inline-grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white/90 hover:bg-white/15 backdrop-blur"
                      aria-label="Next"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M9 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Caption + dots */}
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
