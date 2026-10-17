"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FLOORS } from "../layout";

// What's waiting on each floor, for the "now arriving" screen on the doors.
const ARRIVING = {
  studio: ["📺 The TV", "🕹️ Projects arcade", "🎹 A playable piano", "📚 The library", "🐈 Byte (watch your ankles)"],
  gym: ["🏃 Treadmill sprint", "🥊 Punching bag", "📸 Photo booth", "🐕 Pixel the dog"],
  games: ["🧠 Live chess vs Nikshith", "🎱 Snooker", "👾 Snake · Breakout · Pong", "🗺️ Side quests"],
  roof: ["🔭 Telescope", "📻 Radio stations", "📝 The guestbook", "✨ A lot of stars"],
};

// One of these gets taped to the doors each ride.
const NOTICES = [
  ["MAX LOAD", "1 visitor + 1 cat"],
  ["NOTICE", "Byte is not allowed in the lift. Byte has been in the lift."],
  ["PLEASE", "Do not press all the buttons. We know it was you."],
  ["IN CASE OF FIRE", "There are no stairs. Good luck."],
  ["LAST INSPECTED", "by Pixel 🐾 (very good boy)"],
  ["POWERED BY", "React Three Fiber and hope"],
  ["MIND THE GAP", "between commits"],
];
let noticeIdx = Math.floor(Math.random() * NOTICES.length);

const ease = [0.6, 0, 0.3, 1];

// Doors closing over the screen while the car moves between floors. Everything on the
// doors (directory, arrival screen, notice, paw prints) slides with them.
export function ElevatorRide({ ride }) {
  const closed = ride.stage !== "opening";
  const to = FLOORS.find((f) => f.id === ride.to);
  const fromIdx = FLOORS.findIndex((f) => f.id === ride.from);
  const toIdx = FLOORS.findIndex((f) => f.id === ride.to);
  const up = toIdx > fromIdx;
  const [shown, setShown] = useState(FLOORS[fromIdx]?.label);
  const [notice] = useState(() => NOTICES[noticeIdx++ % NOTICES.length]);
  useEffect(() => {
    if (ride.stage !== "moving") return;
    let i = fromIdx;
    const dir = up ? 1 : -1;
    const id = setInterval(() => {
      if (i === toIdx) return clearInterval(id);
      i += dir;
      setShown(FLOORS[i].label);
    }, 1100 / Math.max(1, Math.abs(toIdx - fromIdx)));
    return () => clearInterval(id);
  }, [ride.stage, fromIdx, toIdx, up]);

  const door =
    "absolute inset-y-0 w-1/2 overflow-hidden bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_3px),linear-gradient(90deg,#8f939d,#c9ccd4_30%,#a3a7b0_60%,#c2c5cc)]";
  const slide = (side) => ({
    initial: { x: side * 100 + "%" },
    animate: { x: closed ? "0%" : side * 100 + "%" },
    transition: { duration: 0.6, ease },
  });

  // building directory, top floor first; the car rides from row to row
  const rows = [...FLOORS].reverse();
  const ROW = 44;
  const rowOf = (idx) => FLOORS.length - 1 - idx;
  const carRow = ride.stage === "closing" ? rowOf(fromIdx) : rowOf(toIdx);

  return (
    <div className="pointer-events-auto fixed inset-0 z-[70] select-none">
      {/* left door: the floor directory, plus today's notice */}
      <motion.div className={`${door} left-0 border-r border-black/30`} {...slide(-1)}>
        <div className="absolute right-[6%] top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0c0d12]/90 p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-4">
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 sm:text-[10px]">Directory</div>
          <div className="relative" style={{ height: rows.length * ROW }}>
            {/* the shaft and the car */}
            <div className="absolute bottom-3 left-[17px] top-3 w-px bg-white/15" />
            <motion.div
              className="absolute left-[9px] h-[17px] w-[17px] rounded-[5px] bg-[#ff9d3c] shadow-[0_0_14px_#ff9d3c]"
              initial={{ top: rowOf(fromIdx) * ROW + (ROW - 17) / 2 }}
              animate={{ top: carRow * ROW + (ROW - 17) / 2 }}
              transition={{ duration: 1.15, ease: [0.45, 0, 0.25, 1] }}
            />
            {rows.map((f, i) => {
              const dest = f.id === ride.to;
              return (
                <div key={f.id} className="flex items-center gap-3 pl-9" style={{ height: ROW }}>
                  <span className={`w-5 font-mono text-[15px] font-bold ${dest ? "text-[#ff9d3c] [text-shadow:0_0_10px_#ff9d3c]" : "text-white/35"}`}>{f.label}</span>
                  <span className={`hidden whitespace-nowrap text-[13px] sm:block ${dest ? "font-semibold text-white" : "text-white/45"}`}>
                    {f.name}
                    {f.id === ride.from && <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-white/30">you were here</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* a notice taped to the door */}
        <div className="absolute bottom-[14%] left-[8%] w-[150px] -rotate-3 sm:left-[12%] sm:w-[190px]">
          <div className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-2 bg-[#f5f0dc]/70 shadow-sm" />
          <div className="border-2 border-[#1c1917] bg-[#fde047] px-3 py-2.5 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.6)]">
            <div className="font-mono text-[10px] font-bold tracking-[0.15em] text-[#1c1917]">⚠ {notice[0]}</div>
            <div className="mt-1 text-[12px] font-medium leading-snug text-[#1c1917] sm:text-[13px]">{notice[1]}</div>
          </div>
        </div>
        <Paws className="bottom-[5%] right-[4%]" />
      </motion.div>

      {/* right door: now arriving */}
      <motion.div className={`${door} right-0 border-l border-black/30`} {...slide(1)}>
        <div className="absolute left-[6%] top-1/2 w-[min(300px,82%)] -translate-y-1/2 rounded-xl border border-white/10 bg-[#0c0d12]/90 p-4 text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#ff9d3c] sm:text-[10px]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff9d3c]" /> Now arriving
          </div>
          <div className="mt-2 font-display text-[26px] italic leading-none sm:text-[34px]">{to?.name}</div>
          <ul className="mt-3 space-y-1.5 text-[12px] text-white/75 sm:mt-4 sm:text-[13.5px]">
            {(ARRIVING[ride.to] ?? []).map((line, i) => (
              <motion.li
                key={line}
                className={i > 2 ? "hidden sm:block" : ""}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.55 + i * 0.12 } }}
              >
                {line}
              </motion.li>
            ))}
          </ul>
        </div>
        <Paws className="bottom-[9%] left-[10%] rotate-12" />
      </motion.div>

      {/* floor display above the doors */}
      <AnimatePresence>
        {closed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="absolute left-1/2 top-[7%] -translate-x-1/2"
          >
            <div className="flex h-16 items-center gap-3 rounded-lg border border-white/10 bg-black px-5 font-mono text-4xl font-bold text-[#ff9d3c] shadow-[0_0_40px_rgba(0,0,0,0.6)] [text-shadow:0_0_16px_#ff9d3c] sm:h-20 sm:text-5xl">
              <motion.span
                animate={ride.stage === "moving" ? { y: up ? [6, -6] : [-6, 6], opacity: [0.3, 1, 0.3] } : { y: 0, opacity: 1 }}
                transition={{ duration: 0.55, repeat: ride.stage === "moving" ? Infinity : 0 }}
                className="text-3xl sm:text-4xl"
              >
                {up ? "▲" : "▼"}
              </motion.span>
              <span className="tabular-nums">{shown}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Byte's muddy paw prints, wandering across the bottom of a door.
function Paws({ className = "" }) {
  const steps = [[0, 0], [22, -14], [46, 2], [68, -12], [92, 4]];
  return (
    <svg className={`absolute h-12 w-28 opacity-30 ${className}`} viewBox="0 0 120 50" aria-hidden>
      {steps.map(([x, y], i) => (
        <g key={i} transform={`translate(${x + 8} ${y + 30}) rotate(${i % 2 ? -18 : 12}) scale(0.55)`} fill="#1c1917">
          <ellipse cx="0" cy="6" rx="7" ry="6" />
          <ellipse cx="-8" cy="-4" rx="2.8" ry="3.6" />
          <ellipse cx="-3" cy="-9" rx="2.8" ry="3.6" />
          <ellipse cx="3" cy="-9" rx="2.8" ry="3.6" />
          <ellipse cx="8" cy="-4" rx="2.8" ry="3.6" />
        </g>
      ))}
    </svg>
  );
}
