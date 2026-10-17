"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Map as MapIcon, X, Volume2, VolumeX, FileText } from "lucide-react";
import {
  useWorld, setState, getState, interact, goToPanel, teleport, runtime, enter, toggleMute, nextSuggestion, rideTo,
} from "./store";
import { FLOORS, SECTIONS, floorById } from "./layout";
import { ElevatorRide } from "./panels/ride";
import Panel from "./panels";
import { profile } from "../../lib/content";

const NAV = [
  ["about", "About"],
  ["experience", "Work"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["certs", "Certs"],
  ["library", "Library"],
  ["music", "Music"],
  ["contact", "Contact"],
];

const glass = "border border-white/10 bg-[#0d0f1a]/70 backdrop-blur-md";

function Kbd({ children }) {
  return (
    <kbd className="inline-flex min-w-[22px] items-center justify-center rounded-md border border-white/20 border-b-[3px] bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white">
      {children}
    </kbd>
  );
}

/* ── frame 0: boot ─────────────────────────────────── */

const BOOT = [
  "mounting floor plan",
  "stacking the bookshelf · 47 books",
  "plugging in arcade cabinets",
  "tuning the piano · A4 = 440 Hz",
  "feeding Byte",
  "compiling shaders",
];

function Boot({ ready }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= BOOT.length - 1) return;
    const t = setTimeout(() => setN((v) => v + 1), 170 + Math.random() * 120);
    return () => clearTimeout(t);
  }, [n]);
  const done = ready && n >= BOOT.length - 1;
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setState({ phase: "title" }), 450);
    return () => clearTimeout(t);
  }, [done]);
  const pct = Math.round(((n + (done ? 1 : 0)) / BOOT.length) * 100);

  return (
    <motion.div key="boot" exit={{ opacity: 0, transition: { duration: 0.8 } }} className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-[#07080d] px-6">
      <div className="w-full max-w-sm font-mono text-[12px]">
        <div className="mb-4 text-white/80">nikshith-os <span className="text-white/35">v2.6</span> — booting house</div>
        <ul className="space-y-1.5">
          {BOOT.slice(0, n + 1).map((line, i) => {
            const ok = i < n || done;
            return (
              <li key={line} className="flex gap-2 text-white/55">
                <span className={ok ? "text-emerald-400" : "animate-pulse text-amber-300"}>{ok ? "[ ok ]" : "[ .. ]"}</span>
                {line}
              </li>
            );
          })}
        </ul>
        <div className="mt-6 h-[3px] overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400" animate={{ width: `${pct}%` }} transition={{ ease: "easeOut" }} />
        </div>
        <div className="mt-2 text-right text-white/35">{pct}%</div>
      </div>
    </motion.div>
  );
}

/* ── frame 1: title ────────────────────────────────── */

function Title({ touch, muted }) {
  return (
    <motion.div
      key="title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="pointer-events-none fixed inset-0 z-40 bg-[linear-gradient(90deg,rgba(7,8,13,0.88)_0%,rgba(7,8,13,0.55)_38%,rgba(7,8,13,0)_70%)] max-sm:bg-[linear-gradient(0deg,rgba(7,8,13,0.95)_0%,rgba(7,8,13,0.6)_55%,rgba(7,8,13,0)_80%)]"
    >
      <div className="pointer-events-auto absolute bottom-0 left-0 max-w-xl px-6 pb-10 sm:px-14 sm:pb-16">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-emerald-300/80">
          <span className="h-px w-8 bg-emerald-300/50" />
          {profile.location.toUpperCase()}
        </motion.div>
        <h1 className="mt-5 font-display text-[64px] italic leading-[0.88] text-white sm:text-[112px]">
          {"Nikshith's".split("").map((ch, i) => (
            <motion.span key={i} className="inline-block" initial={{ opacity: 0, y: 30, rotate: 6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.25 + i * 0.035, type: "spring", stiffness: 260, damping: 20 }}>
              {ch}
            </motion.span>
          ))}
          <br />
          <motion.span
            className="inline-block bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text pr-4 text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 20 }}
          >
            House
          </motion.span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} className="mt-6 max-w-md text-[15px] leading-relaxed text-white/70">
          I&apos;m an {profile.role.toLowerCase()}. This is my place — walk around, poke at things, play the piano. Everything you&apos;d find on a résumé is in here somewhere.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4">
          <button
            autoFocus
            onClick={enter}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black shadow-[0_0_50px_-8px_rgba(167,139,250,0.8)] transition hover:scale-[1.03] active:scale-[0.98]"
          >
            <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-violet-500" /><span className="h-2 w-2 rounded-full bg-violet-600" /></span>
            Come inside
            {!touch && <span className="rounded border border-black/15 px-1.5 py-0.5 font-mono text-[10px] text-black/50">↵</span>}
          </button>
          <button onClick={toggleMute} className="flex items-center gap-2 font-mono text-[11px] text-white/50 transition hover:text-white">
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {muted ? "sound off" : "best with sound"}
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mt-6">
          <Link href="/about" className="font-mono text-[11px] text-white/40 underline-offset-4 transition hover:text-white hover:underline">
            in a hurry? read the classic version →
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── map ───────────────────────────────────────────── */

function FloorPlan() {
  const visited = useWorld((s) => s.visited);
  const floor = useWorld((s) => s.floor);
  const f = floorById(floor);
  const sx = (x) => (x + 12) * 10;
  const sz = (z) => (z + 8) * 10;
  return (
    <motion.div
      key="map"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => setState({ map: false })}
    >
      <motion.div
        initial={{ scale: 0.96, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#10121d] p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Floor plan"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="font-mono text-[11px] text-emerald-300/80">// floor plan · {visited.length}/{SECTIONS.length} explored</div>
            <h2 className="font-display text-3xl italic text-white">Where to?</h2>
            <p className="text-xs text-white/45">Tap a room to walk in, a dot to jump to it, or another floor to take the elevator.</p>
            <Link href="/about" className="mt-1.5 inline-block font-mono text-[11px] text-white/50 underline-offset-4 hover:text-white hover:underline">
              in a hurry? classic version →
            </Link>
          </div>
          <button onClick={() => setState({ map: false })} aria-label="Close map" className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="mb-3 flex gap-1.5">
          {FLOORS.map((fl) => (
            <button
              key={fl.id}
              onClick={() => rideTo(fl.id)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition ${fl.id === floor ? "bg-white text-black" : "border border-white/10 text-white/60 hover:text-white"}`}
            >
              <span className="font-mono font-bold">{fl.label}</span>
              <span className="hidden sm:inline">{fl.name}</span>
            </button>
          ))}
        </div>
        <svg viewBox="-4 -4 248 168" className="w-full">
          {f.rooms.map((r) => {
            const [a, b, c, d] = r.rect;
            return (
              <g key={r.id} className="cursor-pointer" onClick={() => teleport(r.spawn[0], r.spawn[1])}>
                <rect x={sx(a)} y={sz(b)} width={(c - a) * 10} height={(d - b) * 10} rx="3" className="fill-white/[0.03] stroke-white/20 transition hover:fill-violet-400/15" strokeWidth="1.2" />
                <text x={sx((a + c) / 2)} y={sz(d) - 7} textAnchor="middle" className="pointer-events-none fill-white/45 font-mono text-[6px] uppercase tracking-widest">
                  {r.name}
                </text>
              </g>
            );
          })}
          {f.items.map((it) => {
            const seen = visited.includes(it.panel);
            const go = () => {
              if (it.panel) return goToPanel(it.panel, it.item);
              teleport(it.stand[0], it.stand[1]);
              interact(it.id);
            };
            return (
              <g key={it.id} className="cursor-pointer" onClick={go}>
                <circle cx={sx(it.pos[0])} cy={sz(it.pos[1])} r="3.6" className={`${seen ? "fill-slate-500" : "fill-violet-400"} transition hover:fill-emerald-300`} />
                <title>{it.name}</title>
              </g>
            );
          })}
          <circle cx={sx(runtime.x)} cy={sz(runtime.z)} r="4" className="fill-emerald-300 stroke-black" strokeWidth="1.2" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

/* ── mobile joystick ───────────────────────────────── */

function Joystick() {
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false });
  const origin = useRef(null);
  const R = 44;

  const move = (e) => {
    if (!origin.current) return;
    let dx = e.clientX - origin.current.x;
    let dy = e.clientY - origin.current.y;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
    setKnob({ x: dx, y: dy, active: true });
    runtime.joy.x = dx / R;
    runtime.joy.z = dy / R;
    if (!getState().moved) setState({ moved: true });
  };
  const end = () => {
    origin.current = null;
    runtime.joy.x = 0;
    runtime.joy.z = 0;
    setKnob({ x: 0, y: 0, active: false });
  };

  return (
    <div
      className="pointer-events-auto absolute bottom-8 left-6 h-28 w-28 touch-none rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-md"
      onPointerDown={(e) => {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        const r = e.currentTarget.getBoundingClientRect();
        origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        move(e);
      }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      aria-label="Movement joystick"
    >
      <div
        className={`absolute left-1/2 top-1/2 h-12 w-12 rounded-full border border-white/30 bg-white/20 transition-colors ${knob.active ? "bg-violet-400/50" : ""}`}
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}

/* ── HUD ───────────────────────────────────────────── */

export default function HUD({ ready, touch }) {
  const phase = useWorld((s) => s.phase);
  const panel = useWorld((s) => s.panel);
  const nearby = useWorld((s) => s.nearby);
  const map = useWorld((s) => s.map);
  const toastMsg = useWorld((s) => s.toast);
  const moved = useWorld((s) => s.moved);
  const visited = useWorld((s) => s.visited);
  const muted = useWorld((s) => s.muted);
  const floor = useWorld((s) => s.floor);
  const ride = useWorld((s) => s.ride);
  const playing = phase === "playing";
  const near = nearby === "cat" ? { name: "Pet Byte" } : nearby === "dog" ? { name: "Pet Pixel" } : nearby === "nikshith" ? { name: "Talk to Nikshith" } : floorById(floor).items.find((i) => i.id === nearby);
  const next = nextSuggestion();

  return (
    <div className="pointer-events-none fixed inset-0 z-20 select-none">
      {/* top bar */}
      <AnimatePresence>
        {playing && !panel && (
          <motion.header
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-3 py-3 sm:px-5"
          >
            <button onClick={() => goToPanel("about")} className={`flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 ${glass}`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 font-mono text-[11px] font-bold text-black">NG</span>
              <span className="whitespace-nowrap font-display text-base italic text-white max-[379px]:hidden sm:text-lg">Nikshith&apos;s House</span>
              <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/70">{floorById(floor).label === "R" ? "ROOF" : `${floorById(floor).label}F`}</span>
            </button>
            <nav className={`hidden items-center gap-0.5 rounded-full p-1 xl:flex ${glass}`} aria-label="Sections">
              {NAV.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => goToPanel(id)}
                  className={`relative rounded-full px-3 py-1.5 text-[13px] transition ${panel?.id === id ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
                >
                  {label}
                  {visited.includes(id) && panel?.id !== id && <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-emerald-400" />}
                </button>
              ))}
              <span className="mx-1 h-5 w-px bg-white/15" />
              {FLOORS.map((fl) => (
                <button
                  key={fl.id}
                  onClick={() => rideTo(fl.id)}
                  title={fl.name}
                  className={`h-7 w-7 rounded-full font-mono text-[11px] font-bold transition ${fl.id === floor ? "bg-amber-300 text-black" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
                >
                  {fl.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={() => setState({ map: true, panel: null })} className={`flex items-center gap-2 rounded-full px-3 py-2 sm:px-3.5 text-[13px] text-white/80 transition hover:text-white ${glass}`}>
                <MapIcon size={15} aria-hidden />
                <span className="font-mono text-[12px]">{visited.length}/{SECTIONS.length}</span>
              </button>
              <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className={`rounded-full p-2.5 text-white/75 transition hover:text-white ${glass}`}>
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <Link href="/about" aria-label="Classic version" title="Classic version" className={`rounded-full p-2.5 text-white/75 transition hover:text-white sm:px-3.5 sm:py-2 sm:text-[13px] sm:text-white/60 ${glass}`}>
                <FileText size={15} className="sm:hidden" aria-hidden />
                <span className="hidden sm:inline">Classic</span>
              </Link>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* exploration objective */}
      <AnimatePresence>
        {playing && !panel && moved && next && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={`pointer-events-auto absolute left-3 top-[72px] w-[230px] rounded-2xl px-4 py-3 sm:left-5 ${glass}`}
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/45">
              <span>Explore the house</span>
              <span className="text-white/70">{visited.length}/{SECTIONS.length}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-emerald-300" animate={{ width: `${(visited.length / SECTIONS.length) * 100}%` }} />
            </div>
            <button onClick={() => goToPanel(next.panel, next.item)} className="mt-2.5 text-left text-[13px] text-white/80 transition hover:text-white">
              Next: <span className="font-display text-[15px] italic text-violet-200">{next.name}</span> <span className="text-white/40">→</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* touch: tap-to-interact button (desktop gets the floating label + E) */}
      <AnimatePresence>
        {playing && touch && near && !panel && !map && (
          <motion.button
            key={nearby}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => interact(nearby)}
            className="pointer-events-auto absolute bottom-10 right-6 rounded-full border border-emerald-300/40 bg-emerald-400/90 px-5 py-3.5 text-sm font-semibold text-black shadow-[0_0_30px_-6px_rgba(52,211,153,0.8)]"
          >
            {near.name}
          </motion.button>
        )}
      </AnimatePresence>

      {playing && touch && !panel && !map && !ride && <Joystick />}


      {/* controls hint until you first move */}
      <AnimatePresence>
        {playing && !moved && !panel && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
            exit={{ opacity: 0 }}
            className={`absolute left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 text-center text-xs text-white/75 ${touch ? "bottom-40" : "bottom-8"} ${glass}`}
          >
            {touch ? (
              "Drag the joystick to walk · tap glowing things · swipe to look around"
            ) : (
              <span className="flex flex-wrap items-center justify-center gap-1.5">
                <Kbd>W</Kbd><Kbd>A</Kbd><Kbd>S</Kbd><Kbd>D</Kbd> walk
                <span className="mx-1 text-white/25">·</span><Kbd>E</Kbd> interact
                <span className="mx-1 text-white/25">·</span><Kbd>M</Kbd> map
                <span className="mx-1 text-white/25">·</span>drag to look, scroll to zoom
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            key={toastMsg.message}
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, x: "-50%" }}
            className={`absolute left-1/2 z-[60] flex w-max max-w-[min(92vw,460px)] items-start gap-3 rounded-2xl border border-amber-300/20 bg-[#141018]/95 px-4 py-3 text-sm text-amber-50 shadow-2xl backdrop-blur-md ${panel ? "top-[96px]" : "top-[72px]"}`}
            role="status"
          >
            <span className="text-lg leading-none">{toastMsg.icon}</span>
            {toastMsg.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{panel && <Panel key={panel.id} panel={panel} />}</AnimatePresence>
      <AnimatePresence>{map && <FloorPlan />}</AnimatePresence>
      {ride && <ElevatorRide key={`${ride.from}-${ride.to}`} ride={ride} />}
      <AnimatePresence>{phase === "title" && <Title touch={touch} muted={muted} />}</AnimatePresence>
      <AnimatePresence>{phase === "boot" && <Boot ready={ready} />}</AnimatePresence>
    </div>
  );
}
