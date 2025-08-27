// components/ProjectLightbox.jsx
"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectLightbox({ open, images, index, onClose, setIndex }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images?.length, onClose, setIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-background/90 p-3 shadow-2xl"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-white/5">
              {images?.length ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[index]}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
                  No screenshots yet
                </div>
              )}
              {/* Controls */}
              {images?.length > 1 && (
                <>
                  <button
                    onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-xs text-white hover:bg-black/70"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-xs text-white hover:bg-black/70"
                  >
                    Next
                  </button>
                </>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-white/60">
                {images?.length ? `${index + 1} / ${images.length}` : "—"}
              </div>
              <button
                onClick={onClose}
                className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/90 hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
