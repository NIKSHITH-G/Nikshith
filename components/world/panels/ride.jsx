"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FLOORS } from "../layout";

// Doors closing over the screen while the car moves between floors.
export function ElevatorRide({ ride }) {
  const closed = ride.stage !== "opening";
  const to = FLOORS.find((f) => f.id === ride.to);
  const fromIdx = FLOORS.findIndex((f) => f.id === ride.from);
  const toIdx = FLOORS.findIndex((f) => f.id === ride.to);
  const [shown, setShown] = useState(FLOORS[fromIdx]?.label);
  useEffect(() => {
    if (ride.stage !== "moving") return;
    let i = fromIdx;
    const dir = toIdx > fromIdx ? 1 : -1;
    const id = setInterval(() => {
      if (i === toIdx) return clearInterval(id);
      i += dir;
      setShown(FLOORS[i].label);
    }, 1100 / Math.max(1, Math.abs(toIdx - fromIdx)));
    return () => clearInterval(id);
  }, [ride.stage, fromIdx, toIdx]);

  const door = "absolute inset-y-0 w-1/2 bg-[linear-gradient(90deg,#8f939d,#c9ccd4_30%,#a3a7b0_60%,#c2c5cc)]";
  return (
    <div className="pointer-events-auto fixed inset-0 z-[70]">
      <motion.div className={`${door} left-0 border-r border-black/30`} initial={{ x: "-100%" }} animate={{ x: closed ? "0%" : "-100%" }} transition={{ duration: 0.6, ease: [0.6, 0, 0.3, 1] }} />
      <motion.div className={`${door} right-0 border-l border-black/30`} initial={{ x: "100%" }} animate={{ x: closed ? "0%" : "100%" }} transition={{ duration: 0.6, ease: [0.6, 0, 0.3, 1] }} />
      <AnimatePresence>
        {closed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.45 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex h-20 w-28 items-center justify-center rounded-lg bg-black font-mono text-5xl font-bold text-[#ff9d3c] shadow-[0_0_40px_rgba(0,0,0,0.6)] [text-shadow:0_0_16px_#ff9d3c]">
              {toIdx > fromIdx ? "▲" : "▼"}{shown}
            </div>
            <div className="mt-4 font-display text-2xl italic text-[#1f2937]">{to?.name}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

