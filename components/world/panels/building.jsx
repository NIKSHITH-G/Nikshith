"use client";

// Views for everything beyond the studio's original nine: the elevator, the GitHub
// ship log, the gym games, snooker, live chess, the telescope and the radio.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, RotateCcw, LogOut, KeyRound } from "lucide-react";
import { Chess } from "chess.js";
import { FLOORS } from "../layout";
import { runtime, rideTo, useWorld, now } from "../store";
import * as sfx from "../audio";
import { OnScreen } from "./screens";
import { useChess, move as chessMove, reset as chessReset, whoami, setOwnerKey, ownerKey, refresh as chessRefresh, boardFromFen } from "../chess";

const best = {
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(`studio-best-${k}`));
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(`studio-best-${k}`, JSON.stringify(v));
    } catch {}
  },
};

function Backdrop({ className = "" }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`pointer-events-none fixed inset-0 z-30 ${className}`} />;
}

const ago = (t) => {
  if (!t) return "";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ═════════════ elevator ═════════════ */

export function ElevatorPanel() {
  const floor = useWorld((s) => s.floor);
  const floors = [...FLOORS].reverse();
  return (
    <>
      <Backdrop className="bg-black/50" />
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="pointer-events-auto w-[min(360px,92vw)] rounded-2xl border border-white/20 bg-[linear-gradient(135deg,#9ca3af,#e5e7eb_35%,#9ca3af_65%,#d1d5db)] p-[3px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
        >
          <div className="rounded-[14px] bg-[linear-gradient(160deg,#2a2c36,#16171f)] px-6 pb-6 pt-5">
            <div className="mx-auto mb-5 flex h-12 w-24 items-center justify-center rounded-md bg-black font-mono text-3xl font-bold text-[#ff9d3c] shadow-inner [text-shadow:0_0_12px_#ff9d3c]">
              {FLOORS.find((f) => f.id === floor)?.label}
            </div>
            <div className="space-y-2.5">
              {floors.map((f) => {
                const here = f.id === floor;
                return (
                  <button
                    key={f.id}
                    disabled={here}
                    onClick={() => rideTo(f.id)}
                    className="group flex w-full items-center gap-4 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/5 disabled:cursor-default"
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-mono text-lg font-bold transition ${
                        here
                          ? "border-amber-300 bg-amber-300/20 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                          : "border-[#9ca3af] bg-[radial-gradient(circle_at_35%_30%,#f3f4f6,#9ca3af)] text-[#1f2937] group-hover:shadow-[0_0_16px_rgba(255,255,255,0.4)] group-active:scale-95"
                      }`}
                    >
                      {f.label}
                    </span>
                    <span>
                      <span className="block font-display text-xl italic leading-none text-white">{f.name}</span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-white/45">{here ? "you are here" : f.blurb}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ═════════════ GitHub ship log (on the study's wall screen) ═════════════ */

const LANG = { JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Java: "#b07219", HTML: "#e34c26", CSS: "#563d7c", "Jupyter Notebook": "#DA5B0B", PHP: "#4F5D95" };

export function GitHubScreen({ portrait }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setErr(true));
  }, []);

  // last 26 weeks of the contribution calendar
  const weeks = useMemo(() => {
    const out = [];
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - (26 * 7 - 1) - start.getDay());
    for (let w = 0; w < 26; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + w * 7 + d);
        const key = day.toISOString().slice(0, 10);
        col.push(day > end ? null : data?.commitMap?.[key] ?? 0);
      }
      out.push(col);
    }
    return out;
  }, [data]);
  const total = weeks.flat().reduce((a, b) => a + (b || 0), 0);
  const shade = (n) => (n == null ? "transparent" : n === 0 ? "#161b22" : n < 2 ? "#0e4429" : n < 4 ? "#006d32" : n < 7 ? "#26a641" : "#39d353");

  return (
    <OnScreen base={1000} aspect={1.36 / 0.78} portrait={portrait} frame="rounded-[16px] border-[10px] border-[#16171f] shadow-2xl">
      <div className={`crt-on bg-[#0d1117] px-9 py-7 text-[#e6edf3] ${portrait ? "min-h-full" : "h-full"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[13px] text-[#7d8590]">github.com/NIKSHITH-G</div>
            <h2 className="mt-1 font-display text-[40px] italic leading-none">What I&apos;ve been shipping</h2>
          </div>
          <span className="flex items-center gap-2 font-mono text-[12px] text-[#3fb950]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#3fb950]" /> live</span>
        </div>
        {err ? (
          <p className="mt-10 font-mono text-sm text-[#7d8590]">Couldn&apos;t reach GitHub right now. Try again in a bit.</p>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap gap-3 font-mono text-[13px]">
              {[["repos", data?.stats?.publicRepos], ["stars", data?.stats?.totalStars], ["followers", data?.stats?.followers], ["contributions · 6 mo", data ? total : null]].map(([k, v]) => (
                <span key={k} className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5">
                  <b className="text-white">{v ?? "…"}</b> <span className="text-[#7d8590]">{k}</span>
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-[3px] overflow-hidden">
              {weeks.map((col, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
                  {col.map((n, j) => (
                    <motion.span
                      key={j}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 + i * 0.015 } }}
                      title={n != null ? `${n} contributions` : undefined}
                      className="block h-[14px] w-[14px] rounded-[3px]"
                      style={{ background: data ? shade(n) : "#161b22" }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className={`mt-6 grid gap-3 ${portrait ? "grid-cols-1" : "grid-cols-2"}`}>
              {(data?.repos ?? Array.from({ length: 4 }, () => null)).map((r, i) => (
                <a
                  key={r?.name ?? i}
                  href={r?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-3 transition hover:border-[#8b949e]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-[14px] text-[#4493f8] group-hover:underline">{r?.name ?? "loading…"}</span>
                    <ArrowUpRight size={14} className="shrink-0 text-[#7d8590]" />
                  </div>
                  <p className="mt-1 line-clamp-1 text-[13px] text-[#9198a1]">{r?.description || (r ? "No description yet." : " ")}</p>
                  <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-[#7d8590]">
                    {r?.language && (
                      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: LANG[r.language] ?? "#8b949e" }} />{r.language}</span>
                    )}
                    {r && <span>★ {r.stars}</span>}
                    {r && <span>pushed {ago(new Date(r.pushedAt).getTime())}</span>}
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </OnScreen>
  );
}

/* ═════════════ treadmill: 100 m sprint ═════════════ */

export function TreadmillSprint({ portrait }) {
  const [view, setView] = useState({ dist: 0, v: 0, t: 0, done: false, started: false });
  const sim = useRef({ dist: 0, v: 0, t0: 0, last: null, done: false, started: false });
  const [record, setRecord] = useState(() => best.get("sprint"));

  const step = useCallback((side) => {
    const s = sim.current;
    if (s.done) return;
    if (!s.started) {
      s.started = true;
      s.t0 = performance.now();
    }
    if (s.last === side) s.v *= 0.72; // same foot twice: stumble
    else s.v = Math.min(12, s.v + 0.95);
    s.last = side;
    sfx.step();
  }, []);

  useEffect(() => {
    let raf;
    let prev = performance.now();
    const loop = (t) => {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      const s = sim.current;
      if (s.started && !s.done) {
        s.v = Math.max(0, s.v - 3.4 * dt);
        s.dist = Math.min(100, s.dist + s.v * dt);
        runtime.sprint = s.v / 12;
        if (s.dist >= 100) {
          s.done = true;
          runtime.sprint = 0;
          const time = (performance.now() - s.t0) / 1000;
          s.time = time;
          sfx.chime();
          const b = best.get("sprint");
          if (!b || time < b) {
            best.set("sprint", time);
            setRecord(time);
          }
        }
      }
      setView({ dist: s.dist, v: s.v, t: s.started ? (s.done ? s.time : (performance.now() - s.t0) / 1000) : 0, done: s.done, started: s.started });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a" || k === "f") step("L");
      if (k === "arrowright" || k === "d" || k === "j") step("R");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      runtime.sprint = 0;
    };
  }, [step]);

  const again = () => {
    sim.current = { dist: 0, v: 0, t0: 0, last: null, done: false, started: false };
  };
  const verdict = (t) => (t < 9.58 ? "Faster than Usain Bolt. Suspicious." : t < 11 ? "Elite. The treadmill is scared of you." : t < 14 ? "Solid sprint." : "Warm-up pace. Go again?");

  return (
    <motion.div
      initial={{ y: "110%" }}
      animate={{ y: 0, transition: { delay: 0.25, type: "spring", stiffness: 140, damping: 20 } }}
      exit={{ y: "110%" }}
      className="pointer-events-auto fixed bottom-0 left-1/2 z-40 w-[min(760px,100vw)] -translate-x-1/2 rounded-t-3xl border border-b-0 border-white/10 bg-[#101218]/95 px-5 pb-6 pt-5 backdrop-blur-xl sm:px-8"
    >
      <div className="flex items-end justify-between font-mono">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-orange-300/80">100 m sprint</div>
          <div className="text-5xl font-bold tabular-nums text-white">{view.t.toFixed(2)}<span className="text-xl text-white/40">s</span></div>
        </div>
        <div className="text-right text-[12px] text-white/50">
          <div>{(view.v * 3.6).toFixed(1)} km/h</div>
          <div>best {record ? `${record.toFixed(2)}s` : "—"}</div>
        </div>
      </div>
      {/* track */}
      <div className="relative mt-4 h-14 overflow-hidden rounded-xl bg-[#7c2d12]">
        {[0, 1, 2].map((l) => <div key={l} className="absolute inset-x-0 h-px bg-white/30" style={{ top: `${(l + 1) * 25}%` }} />)}
        {Array.from({ length: 11 }, (_, i) => (
          <div key={i} className="absolute inset-y-0 w-px bg-white/15" style={{ left: `${4 + i * 9}%` }}>
            <span className="absolute bottom-0.5 left-1 font-mono text-[8px] text-white/40">{i * 10}</span>
          </div>
        ))}
        <div className="absolute inset-y-0 right-[4%] w-1.5 bg-[repeating-linear-gradient(0deg,#fff_0_6px,#111_6px_12px)]" />
        <div className="absolute top-1/2 text-3xl transition-[left] duration-75" style={{ left: `calc(${4 + view.dist * 0.9}% - 18px)`, transform: "translateY(-50%) scaleX(-1)" }}>🏃</div>
      </div>
      {view.done ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-2xl italic text-white">{verdict(view.t)}</p>
          <button onClick={again} className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400">Run again</button>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            {portrait ? "Tap left, right, left, right — fast." : <>Alternate <Kbd>←</Kbd> <Kbd>→</Kbd> (or <Kbd>A</Kbd> <Kbd>D</Kbd>) as fast as you can. Same foot twice and you stumble.</>}
          </p>
          <div className="flex shrink-0 gap-2">
            {["L", "R"].map((s) => (
              <button key={s} onPointerDown={() => step(s)} className="h-14 w-14 rounded-2xl border border-white/15 bg-white/[0.06] font-mono text-lg text-white active:scale-95 active:bg-orange-500/40">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Kbd({ children }) {
  return <kbd className="mx-0.5 inline-flex min-w-[22px] items-center justify-center rounded-md border border-white/20 border-b-[3px] bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white">{children}</kbd>;
}

/* ═════════════ punching bag ═════════════ */

export function PunchingBagGame() {
  const [stats, setStats] = useState({ total: 0, combo: 0, power: 0 });
  const [pops, setPops] = useState([]);
  const [record, setRecord] = useState(() => best.get("combo") ?? 0);
  const last = useRef(0);
  const combo = useRef(0);

  const hit = useCallback(() => {
    const t = now();
    combo.current = t - last.current < 0.5 ? combo.current + 1 : 1;
    last.current = t;
    const power = Math.min(2.5, 1 + combo.current * 0.08);
    runtime.bagHits.push({ at: t, power });
    sfx.punch(power - 1);
    setStats((s) => ({ total: s.total + 1, combo: combo.current, power }));
    const id = Math.random();
    const words = ["POW!", "BAM!", "WHAM!", "THWACK!", "BOOM!"];
    setPops((p) => [...p.slice(-5), { id, word: combo.current > 1 && combo.current % 10 === 0 ? `${combo.current} COMBO!` : words[Math.floor(Math.random() * words.length)], x: 35 + Math.random() * 30, y: 30 + Math.random() * 25 }]);
    setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 650);
    if (combo.current > (best.get("combo") ?? 0)) {
      best.set("combo", combo.current);
      setRecord(combo.current);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ([" ", "j", "k", "enter"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        if (!e.repeat) hit();
      }
    };
    window.addEventListener("keydown", onKey);
    // let the combo fade if you stop
    const id = setInterval(() => {
      if (now() - last.current > 0.6 && combo.current) {
        combo.current = 0;
        setStats((s) => ({ ...s, combo: 0, power: 0 }));
      }
    }, 200);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearInterval(id);
    };
  }, [hit]);

  return (
    <>
      {/* the whole screen is the target */}
      <div className="pointer-events-auto fixed inset-0 z-30 cursor-crosshair" onPointerDown={hit} aria-label="Punch the bag" role="button" />
      <AnimatePresence>
        {pops.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
            animate={{ opacity: 1, scale: 1.1, rotate: 4 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="pointer-events-none fixed z-40 font-pixel text-4xl text-yellow-300 [text-shadow:3px_3px_0_#b91c1c,6px_6px_0_#000]"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {p.word}
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
        exit={{ y: 40, opacity: 0 }}
        className="pointer-events-none fixed bottom-6 left-1/2 z-40 flex w-[min(620px,94vw)] -translate-x-1/2 items-end justify-between gap-4 rounded-2xl border border-white/10 bg-[#120c0c]/85 px-6 py-4 font-mono backdrop-blur-md"
      >
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-red-300/80">punches</div>
          <div className="text-4xl font-bold tabular-nums text-white">{stats.total}</div>
        </div>
        <div className="flex-1 px-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">power</div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600" animate={{ width: `${(stats.power / 2.5) * 100}%` }} transition={{ duration: 0.1 }} />
          </div>
          <div className="mt-1.5 text-[11px] text-white/45">click / tap / space — keep the rhythm for combos</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">combo</div>
          <div className="text-4xl font-bold tabular-nums text-yellow-300">×{stats.combo}</div>
          <div className="text-[10px] text-white/40">best ×{record}</div>
        </div>
      </motion.div>
    </>
  );
}

/* ═════════════ snooker ═════════════ */

const W = 1000;
const H = 500;
const R = 9.5;
const POCKETS = [[0, 0, 22], [W / 2, -4, 19], [W, 0, 22], [0, H, 22], [W / 2, H + 4, 19], [W, H, 22]];
const COLOURS = [
  { name: "yellow", value: 2, color: "#facc15", spot: [200, 332] },
  { name: "green", value: 3, color: "#16a34a", spot: [200, 168] },
  { name: "brown", value: 4, color: "#92400e", spot: [200, 250] },
  { name: "blue", value: 5, color: "#2563eb", spot: [500, 250] },
  { name: "pink", value: 6, color: "#ec4899", spot: [750, 250] },
  { name: "black", value: 7, color: "#111111", spot: [909, 250] },
];

function rack() {
  const balls = [{ kind: "cue", x: 160, y: 270, vx: 0, vy: 0, color: "#f8fafc" }];
  COLOURS.forEach((c) => balls.push({ kind: "colour", ...c, x: c.spot[0], y: c.spot[1], vx: 0, vy: 0 }));
  for (let row = 0; row < 5; row++)
    for (let i = 0; i <= row; i++) balls.push({ kind: "red", value: 1, color: "#b91c1c", x: 750 + 2 * R + 1 + row * (R * 1.75), y: 250 + (i - row / 2) * (R * 2.02), vx: 0, vy: 0 });
  return balls;
}

export function SnookerGame({ portrait }) {
  const canvas = useRef(null);
  const game = useRef(null);
  const [hud, setHud] = useState({ score: 0, brk: 0, shots: 0, on: "red", msg: "Drag back from anywhere to aim, release to shoot.", over: false });
  const [record, setRecord] = useState(() => best.get("snooker") ?? 0);

  const newGame = useCallback(() => {
    game.current = { balls: rack(), score: 0, brk: 0, shots: 0, on: "red", potted: [], moving: false, aim: null, over: false };
    setHud({ score: 0, brk: 0, shots: 0, on: "red", msg: "Drag back from anywhere to aim, release to shoot.", over: false });
  }, []);
  useEffect(newGame, [newGame]);

  // settle a shot: apply (simplified) snooker scoring to what went down
  const settle = useCallback(() => {
    const g = game.current;
    const reds = g.balls.filter((b) => b.kind === "red").length;
    const potted = g.potted;
    g.potted = [];
    let msg = "";
    let foul = 0;
    const cuePotted = potted.some((b) => b.kind === "cue");
    const onColourOrder = COLOURS.find((c) => g.balls.some((b) => b.name === c.name));
    let scored = 0;
    for (const b of potted.filter((p) => p.kind !== "cue")) {
      const legal = g.on === "red" ? b.kind === "red" : g.on === "colour" ? b.kind === "colour" : b.name === g.on;
      if (legal) scored += b.value;
      else foul = Math.max(foul, 4, b.value);
      // colours come back while reds remain (or if potted out of order)
      if (b.kind === "colour" && (reds > 0 || !legal || g.on === "red" || g.on === "colour")) {
        const spot = COLOURS.find((c) => c.name === b.name).spot;
        g.balls.push({ ...b, x: spot[0], y: spot[1], vx: 0, vy: 0 });
      }
    }
    if (cuePotted) {
      foul = Math.max(foul, 4);
      g.balls.unshift({ kind: "cue", x: 160, y: 270, vx: 0, vy: 0, color: "#f8fafc" });
    }
    const redsLeft = g.balls.filter((b) => b.kind === "red").length;
    if (foul) {
      g.score = Math.max(0, g.score - foul);
      g.brk = 0;
      g.on = redsLeft ? "red" : COLOURS.find((c) => g.balls.some((b) => b.name === c.name))?.name ?? "red";
      msg = `Foul! −${foul}`;
      sfx.blip(false);
    } else if (scored) {
      g.score += scored;
      g.brk += scored;
      if (g.on === "red") g.on = "colour";
      else if (g.on === "colour") g.on = redsLeft ? "red" : "yellow";
      else g.on = COLOURS.find((c) => g.balls.some((b) => b.name === c.name))?.name ?? "done";
      msg = `+${scored}${g.brk > scored ? ` · break ${g.brk}` : ""}`;
    } else {
      g.brk = 0;
      g.on = redsLeft ? "red" : onColourOrder?.name ?? "done";
      msg = "No pot. Line up the next one.";
    }
    const objectBalls = g.balls.filter((b) => b.kind !== "cue").length;
    if (!objectBalls) {
      g.over = true;
      msg = `Table cleared! Final score ${g.score} in ${g.shots} shots.`;
      sfx.chime();
      if (g.score > (best.get("snooker") ?? 0)) {
        best.set("snooker", g.score);
        setRecord(g.score);
      }
    }
    setHud({ score: g.score, brk: g.brk, shots: g.shots, on: g.on, msg, over: g.over });
  }, []);

  // physics + rendering loop
  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv.getContext("2d");
    let raf;
    let prev = performance.now();
    const loop = (t) => {
      const g = game.current;
      const dt = Math.min(0.033, (t - prev) / 1000);
      prev = t;
      if (g) {
        const SUB = 6;
        let anyMoving = false;
        for (let s = 0; s < SUB; s++) {
          const h = dt / SUB;
          for (const b of g.balls) {
            b.x += b.vx * h;
            b.y += b.vy * h;
            const sp = Math.hypot(b.vx, b.vy);
            if (sp > 0) {
              const ns = Math.max(0, sp - 140 * h);
              b.vx *= ns / sp;
              b.vy *= ns / sp;
            }
          }
          // ball-ball
          for (let i = 0; i < g.balls.length; i++)
            for (let j = i + 1; j < g.balls.length; j++) {
              const a = g.balls[i];
              const b = g.balls[j];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const d = Math.hypot(dx, dy);
              if (d > 0 && d < 2 * R) {
                const nx = dx / d;
                const ny = dy / d;
                const overlap = 2 * R - d;
                a.x -= (nx * overlap) / 2; a.y -= (ny * overlap) / 2;
                b.x += (nx * overlap) / 2; b.y += (ny * overlap) / 2;
                const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
                if (rel > 0) {
                  const imp = rel * 0.97;
                  a.vx -= imp * nx; a.vy -= imp * ny;
                  b.vx += imp * nx; b.vy += imp * ny;
                  if (s === 0) sfx.clack(rel / 700);
                }
              }
            }
          // pockets, then cushions
          for (let i = g.balls.length - 1; i >= 0; i--) {
            const b = g.balls[i];
            const p = POCKETS.find(([px, py, pr]) => Math.hypot(b.x - px, b.y - py) < pr);
            if (p) {
              g.balls.splice(i, 1);
              g.potted.push(b);
              sfx.pocket();
              continue;
            }
            if (b.x < R) { b.x = R; if (b.vx < 0) { if (b.vx < -60) sfx.cushion(-b.vx / 600); b.vx = -b.vx * 0.78; } }
            if (b.x > W - R) { b.x = W - R; if (b.vx > 0) { if (b.vx > 60) sfx.cushion(b.vx / 600); b.vx = -b.vx * 0.78; } }
            if (b.y < R) { b.y = R; if (b.vy < 0) { if (b.vy < -60) sfx.cushion(-b.vy / 600); b.vy = -b.vy * 0.78; } }
            if (b.y > H - R) { b.y = H - R; if (b.vy > 0) { if (b.vy > 60) sfx.cushion(b.vy / 600); b.vy = -b.vy * 0.78; } }
          }
        }
        for (const b of g.balls) {
          if (Math.hypot(b.vx, b.vy) < 4) b.vx = b.vy = 0;
          else anyMoving = true;
        }
        if (g.moving && !anyMoving) {
          g.moving = false;
          settle();
        }

        // draw
        const k = cv.width / (W + 80);
        ctx.setTransform(k, 0, 0, k, 40 * k, 40 * k);
        ctx.clearRect(-40, -40, W + 80, H + 80);
        ctx.fillStyle = "#4a2e1f";
        ctx.beginPath(); ctx.roundRect(-40, -40, W + 80, H + 80, 26); ctx.fill();
        ctx.fillStyle = "#14532d";
        ctx.fillRect(-14, -14, W + 28, H + 28);
        const felt = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.65);
        felt.addColorStop(0, "#1f8f4e");
        felt.addColorStop(1, "#146b3a");
        ctx.fillStyle = felt;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(200, 0); ctx.lineTo(200, H); ctx.stroke();
        ctx.beginPath(); ctx.arc(200, 250, 82, Math.PI / 2, -Math.PI / 2); ctx.stroke();
        for (const [px, py, pr] of POCKETS) {
          ctx.fillStyle = "#050505";
          ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
        }
        // aim guide + cue
        const cue = g.balls.find((b) => b.kind === "cue");
        if (cue && g.aim && !g.moving) {
          const dx = cue.x - g.aim.x;
          const dy = cue.y - g.aim.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const pow = Math.min(1, len / 220);
          ctx.setLineDash([6, 8]);
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(cue.x + ux * 600, cue.y + uy * 600); ctx.stroke();
          ctx.setLineDash([]);
          const back = 18 + pow * 80;
          ctx.strokeStyle = "#d4a373";
          ctx.lineWidth = 7;
          ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(cue.x - ux * back, cue.y - uy * back); ctx.lineTo(cue.x - ux * (back + 380), cue.y - uy * (back + 380)); ctx.stroke();
          ctx.lineWidth = 1.5;
          // power meter
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.fillRect(W - 170, H + 12, 160, 10);
          ctx.fillStyle = pow > 0.8 ? "#ef4444" : "#facc15";
          ctx.fillRect(W - 170, H + 12, 160 * pow, 10);
        }
        for (const b of g.balls) {
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath(); ctx.arc(b.x + 2.5, b.y + 3, R, 0, Math.PI * 2); ctx.fill();
          const grd = ctx.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, R);
          grd.addColorStop(0, "rgba(255,255,255,0.85)");
          grd.addColorStop(0.25, b.color);
          grd.addColorStop(1, b.color);
          ctx.fillStyle = grd;
          ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.fill();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [settle]);

  const toTable = (e) => {
    const r = canvas.current.getBoundingClientRect();
    const k = r.width / (W + 80);
    return { x: (e.clientX - r.left) / k - 40, y: (e.clientY - r.top) / k - 40 };
  };
  const onDown = (e) => {
    const g = game.current;
    if (!g || g.moving || g.over) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    g.aim = toTable(e);
  };
  const onMove = (e) => {
    const g = game.current;
    if (g?.aim) g.aim = toTable(e);
  };
  const onUp = () => {
    const g = game.current;
    if (!g?.aim) return;
    const cue = g.balls.find((b) => b.kind === "cue");
    const dx = cue.x - g.aim.x;
    const dy = cue.y - g.aim.y;
    const len = Math.hypot(dx, dy);
    g.aim = null;
    if (len < 12) return;
    const pow = Math.min(1, len / 220);
    cue.vx = (dx / len) * pow * 1500;
    cue.vy = (dy / len) * pow * 1500;
    g.moving = true;
    g.shots++;
    sfx.clack(pow);
    setHud((h) => ({ ...h, shots: g.shots, msg: "" }));
  };

  const onLabel = hud.on === "red" ? "a red" : hud.on === "colour" ? "any colour" : hud.on;
  return (
    <>
      <Backdrop className="bg-black/70" />
      <div className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center px-3 pt-20">
        <motion.div initial={{ opacity: 0, y: 20, rotateX: 25 }} animate={{ opacity: 1, y: 0, rotateX: 0, transition: { delay: 0.2 } }} exit={{ opacity: 0, y: 20 }} className="pointer-events-auto w-[min(1000px,96vw)]" style={{ perspective: 1200 }}>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3 font-mono text-white">
            <div className="flex gap-5">
              {[["score", hud.score], ["break", hud.brk], ["shots", hud.shots], ["best", record]].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/70">{k}</div>
                  <div className="text-2xl font-bold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
            <div className="text-right text-[12px] text-white/60">
              <div>on: <span className="text-white">{onLabel}</span></div>
              <button onClick={newGame} className="mt-1 inline-flex items-center gap-1 text-white/50 underline-offset-4 hover:text-white hover:underline"><RotateCcw size={12} /> re-rack</button>
            </div>
          </div>
          <canvas
            ref={canvas}
            width={portrait ? 900 : 1600}
            height={portrait ? 522 : 928}
            className="w-full touch-none rounded-[18px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
          <div className="mt-3 h-5 text-center font-mono text-[12px] text-white/60">{hud.msg}</div>
        </motion.div>
      </div>
    </>
  );
}

/* ═════════════ chess: The World vs Nikshith ═════════════ */

const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };

export function ChessGame({ portrait }) {
  const game = useChess(5000);
  const [sel, setSel] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [owner, setOwner] = useState(false);
  const [askKey, setAskKey] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const holdTimer = useRef(null);

  useEffect(() => {
    if (!ownerKey()) return;
    whoami().then((r) => setOwner(Boolean(r.owner)));
  }, []);

  const chess = useMemo(() => new Chess(game.fen), [game.fen]);
  const board = useMemo(() => boardFromFen(game.fen), [game.fen]);
  const worldTurn = game.turn === "w";
  const canMove = !game.over && (owner || worldTurn);
  const targets = useMemo(() => (sel ? new Set(chess.moves({ square: sel, verbose: true }).map((m) => m.to)) : new Set()), [sel, chess]);
  const last = game.history?.[game.history.length - 1];

  const files = "abcdefgh".split("");
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  const flip = owner; // owner sees the board from Black's side
  const rows = flip ? [...ranks].reverse() : ranks;
  const cols = flip ? [...files].reverse() : files;

  const click = async (sq) => {
    if (busy || !canMove) return;
    const piece = board[sq];
    const mine = piece && (piece === piece.toUpperCase() ? "w" : "b") === game.turn;
    if (sel && targets.has(sq)) {
      setBusy(true);
      setSel(null);
      const res = await chessMove(sel, sq);
      setBusy(false);
      if (res.ok) {
        sfx.clack(1);
        setMsg(worldTurn && !owner ? "Move played for the world. Your turn's done — now it's Nikshith's move." : "Move played.");
      } else {
        setMsg(res.error || "That didn't work.");
        sfx.blip(false);
      }
      return;
    }
    if (mine) {
      setSel(sq);
      sfx.hover();
    } else setSel(null);
  };

  // owner door: the "I'm Nikshith" link, or hold the black king in the header for 1.5 s.
  // Pointer capture keeps a slightly wobbly finger or mouse from cancelling the hold.
  const holdStart = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    holdTimer.current = setTimeout(() => setAskKey(true), 1500);
  };
  const holdEnd = () => clearTimeout(holdTimer.current);
  const submitKey = async (e) => {
    e.preventDefault();
    setOwnerKey(keyInput.trim());
    const r = await whoami();
    setOwner(Boolean(r.owner));
    setMsg(r.owner ? "Owner mode on. You're playing Black." : "That key didn't work.");
    if (!r.owner) setOwnerKey("");
    setAskKey(false);
    setKeyInput("");
    chessRefresh();
  };
  const doReset = async () => {
    if (!confirm("Reset the shared board for everyone?")) return;
    const r = await chessReset();
    setMsg(r.ok ? "Board reset. New game!" : r.error || "Couldn't reset.");
  };

  const status = game.loading
    ? "Loading the board…"
    : game.over
      ? `${game.result ?? "Game over"} — waiting for Nikshith to set up a new game.`
      : worldTurn
        ? owner
          ? "White (the world) to move."
          : "Your move! You play White, together with everyone who visits."
        : owner
          ? "Your move, Nikshith — you're Black."
          : `Waiting for Nikshith to reply as Black${last ? ` · last move ${ago(last.at)}` : ""}.`;

  const size = portrait ? "min(92vw, 380px)" : "min(56vh, 480px)";
  const pairs = [];
  (game.history ?? []).forEach((m, i) => {
    if (i % 2 === 0) pairs.push([m]);
    else pairs[pairs.length - 1].push(m);
  });

  return (
    <>
      <Backdrop className="bg-[radial-gradient(ellipse_at_center,rgba(10,15,25,0.55),rgba(5,5,10,0.88)_70%)]" />
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-y-auto px-3 pb-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotateX: 30 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, transition: { delay: 0.2, type: "spring", stiffness: 160, damping: 20 } }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{ perspective: 1200 }}
          className={`pointer-events-auto flex gap-6 ${portrait ? "flex-col items-center" : "items-start"}`}
        >
          <div>
            <div className="mb-3 flex items-center justify-between font-mono text-[12px] text-white/70" style={{ width: size }}>
              <span>
                <span
                  className="-m-2 mr-0 inline-block cursor-default touch-none select-none p-2 text-lg text-white [-webkit-touch-callout:none]"
                  onPointerDown={holdStart}
                  onPointerUp={holdEnd}
                  onPointerCancel={holdEnd}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  ♚&#xFE0E;
                </span>
                Nikshith <span className="text-white/35">· Black</span>
              </span>
              <span className="text-white/35">game #{game.gameNo ?? 1}</span>
            </div>
            <div className="grid grid-cols-8 grid-rows-8 overflow-hidden rounded-lg border-[6px] border-[#3a2418] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]" style={{ width: size, height: size }}>
              {rows.map((r) =>
                cols.map((f) => {
                  const sq = `${f}${r}`;
                  const p = board[sq];
                  const dark = (files.indexOf(f) + r) % 2 === 1;
                  const isLast = last && (last.from === sq || last.to === sq);
                  const isSel = sel === sq;
                  const isTarget = targets.has(sq);
                  return (
                    <button
                      key={sq}
                      onClick={() => click(sq)}
                      aria-label={`${sq}${p ? ` ${p}` : ""}`}
                      className="relative flex items-center justify-center"
                      style={{ background: isSel ? "#f6d365" : isLast ? (dark ? "#b9a24b" : "#e6d784") : dark ? "#9b6b43" : "#ecdcb9" }}
                    >
                      {isTarget && <span className={`absolute rounded-full ${p ? "inset-1 border-4 border-black/25" : "h-1/4 w-1/4 bg-black/25"}`} />}
                      {p && (
                        <span
                          className="relative select-none leading-none"
                          style={{
                            fontSize: `calc(${size} / 8 * 0.78)`,
                            color: p === p.toUpperCase() ? "#fffaf0" : "#1c1917",
                            textShadow: p === p.toUpperCase() ? "0 0 2px #000, 0 1px 1px #000, 0 0 1px #000" : "0 1px 0 rgba(255,255,255,0.35)",
                          }}
                        >
                          {GLYPH[p.toLowerCase()]}&#xFE0E;
                        </span>
                      )}
                      {f === cols[0] && <span className="absolute left-0.5 top-0 font-mono text-[9px] text-black/40">{r}</span>}
                      {r === rows[rows.length - 1] && <span className="absolute bottom-0 right-0.5 font-mono text-[9px] text-black/40">{f}</span>}
                    </button>
                  );
                })
              )}
            </div>
            <div className="mt-3 font-mono text-[12px] text-white/70" style={{ width: size }}>
              <span className="mr-1 text-lg text-white">♔&#xFE0E;</span> The world <span className="text-white/35">· White · you</span>
            </div>
          </div>

          <div className={`flex flex-col ${portrait ? "w-[min(92vw,380px)]" : "w-[300px]"}`}>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-sky-300/80">the world vs nikshith</div>
            <h2 className="mt-1 font-display text-3xl italic leading-tight text-white">One board, everyone plays.</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Every visitor plays White together, one move at a time. I play Black. Make a move and check back later to see how I answered.
            </p>
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${game.check && !game.over ? "border-red-400/30 bg-red-400/10 text-red-100" : "border-white/10 bg-white/[0.04] text-white/85"}`}>
              {game.check && !game.over && <b>Check! </b>}
              {status}
            </div>
            {msg && <div className="mt-2 font-mono text-[12px] text-amber-200/80">{msg}</div>}
            <div className="mt-4 max-h-44 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[12px] text-white/75">
              {pairs.length === 0 ? (
                <span className="text-white/35">No moves yet — White to start.</span>
              ) : (
                <ol className="grid grid-cols-[2rem_1fr_1fr] gap-x-2 gap-y-0.5">
                  {pairs.map((pr, i) => (
                    <li key={i} className="contents">
                      <span className="text-white/35">{i + 1}.</span>
                      <span>{pr[0]?.san}</span>
                      <span className="text-white/90">{pr[1]?.san ?? ""}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            {owner && game.persistent === false && (
              <p className="mt-2 font-mono text-[10px] text-amber-200/60">no database connected — the board resets on each deploy</p>
            )}
            {!owner && (
              <button onClick={() => setAskKey(true)} className="mt-3 inline-flex items-center gap-1.5 self-start font-mono text-[11px] text-white/35 transition hover:text-white/80">
                <KeyRound size={12} /> I&apos;m Nikshith
              </button>
            )}
            {owner && (
              <div className="mt-4 flex gap-2">
                <button onClick={doReset} className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 px-3.5 py-1.5 text-xs text-red-200 hover:bg-red-400/10">
                  <RotateCcw size={13} /> Reset board
                </button>
                <button onClick={() => { setOwnerKey(""); setOwner(false); setMsg("Signed out of owner mode."); }} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-white/70 hover:bg-white/5">
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {askKey && (
          <motion.form
            onSubmit={submitKey}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed left-1/2 top-1/2 z-[60] w-[min(340px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-[#0d0f18] p-5 shadow-2xl"
          >
            <div className="flex items-center gap-2 font-mono text-[12px] text-white/70"><KeyRound size={14} /> owner key</div>
            <input autoFocus type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} className="mt-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/60" />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setAskKey(false)} className="px-3 py-1.5 text-xs text-white/50">cancel</button>
              <button className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black">unlock</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═════════════ telescope: the southern sky ═════════════ */

// Positions are on a 2400 × 1000 sky strip; shapes are hand-placed, not to scale.
const CONSTELLATIONS = [
  { name: "Crux — the Southern Cross", fact: "On the Australian flag, and the smallest of all 88 constellations. From Melbourne it never sets.", stars: [[600, 380], [600, 520], [545, 440], [660, 455], [625, 480]], lines: [[0, 1], [2, 3]] },
  { name: "The Pointers", fact: "Alpha and Beta Centauri. Alpha Centauri is the closest star system to the Sun — about 4.37 light-years away.", stars: [[760, 560], [705, 600]], lines: [[0, 1]] },
  { name: "Orion (the Saucepan)", fact: "Seen upside down from Australia, so locals call the belt and sword 'the Saucepan'. Betelgeuse is the red one.", stars: [[1350, 300], [1470, 290], [1385, 420], [1410, 430], [1435, 440], [1340, 560], [1480, 550], [1415, 500], [1418, 520]], lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [3, 7], [7, 8]] },
  { name: "Scorpius", fact: "Its red heart, Antares, is a supergiant roughly 700 times wider than the Sun.", stars: [[1850, 260], [1880, 320], [1905, 380], [1915, 450], [1900, 520], [1870, 580], [1840, 620], [1800, 630], [1775, 600]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]] },
  { name: "The Pleiades", fact: "The Seven Sisters: a young star cluster about 444 light-years away.", stars: [[1090, 230], [1105, 240], [1098, 255], [1115, 228], [1120, 250], [1082, 248]], lines: [[0, 1], [1, 4], [1, 2], [0, 5], [0, 3]] },
  { name: "Large Magellanic Cloud", fact: "A whole galaxy orbiting the Milky Way, about 160,000 light-years away. Only visible from the southern hemisphere.", stars: [[300, 700], [330, 690], [315, 715]], lines: [[0, 1], [1, 2], [2, 0]], cloud: true },
];

export function Telescope({ portrait }) {
  const canvas = useRef(null);
  const view = useRef({ x: 300, drag: null, t: 0 });
  const [found, setFound] = useState(() => new Set());
  const [info, setInfo] = useState(null);
  const foundRef = useRef(found);
  foundRef.current = found;

  const stars = useMemo(() => {
    const out = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 1400; i++) out.push([rnd() * 2400, rnd() * 1000, rnd() ** 3 * 1.8 + 0.3, rnd()]);
    return out;
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv.getContext("2d");
    let raf;
    let shoot = { t: -1, next: 2 };
    const loop = (t) => {
      const v = view.current;
      const w = cv.width;
      const h = cv.height;
      const k = h / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#02030a");
      sky.addColorStop(1, "#0b1030");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      // milky way band
      ctx.save();
      ctx.translate(-v.x * k + w / 2, 0);
      const band = ctx.createLinearGradient(0, 200 * k, 0, 800 * k);
      band.addColorStop(0, "rgba(140,150,220,0)");
      band.addColorStop(0.5, "rgba(170,160,230,0.12)");
      band.addColorStop(1, "rgba(140,150,220,0)");
      ctx.fillStyle = band;
      ctx.beginPath();
      ctx.moveTo(-200 * k, 900 * k);
      ctx.bezierCurveTo(600 * k, 200 * k, 1400 * k, 800 * k, 2600 * k, 150 * k);
      ctx.lineTo(2600 * k, 450 * k);
      ctx.bezierCurveTo(1400 * k, 1050 * k, 600 * k, 450 * k, -200 * k, 1100 * k);
      ctx.fill();
      for (const [x, y, s, tw] of stars) {
        const a = 0.5 + 0.5 * Math.sin(t / 600 + tw * 40);
        ctx.fillStyle = `rgba(255,255,255,${0.35 + a * 0.55})`;
        ctx.fillRect(x * k, y * k, s * k * 1.4, s * k * 1.4);
      }
      for (const c of CONSTELLATIONS) {
        const isFound = foundRef.current.has(c.name);
        if (c.cloud) {
          const g = ctx.createRadialGradient(315 * k, 700 * k, 0, 315 * k, 700 * k, 70 * k);
          g.addColorStop(0, "rgba(200,200,255,0.25)");
          g.addColorStop(1, "rgba(200,200,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(315 * k, 700 * k, 70 * k, 0, Math.PI * 2); ctx.fill();
        }
        if (isFound) {
          ctx.strokeStyle = "rgba(125,211,252,0.7)";
          ctx.lineWidth = 1.5;
          for (const [a, b] of c.lines) {
            ctx.beginPath(); ctx.moveTo(c.stars[a][0] * k, c.stars[a][1] * k); ctx.lineTo(c.stars[b][0] * k, c.stars[b][1] * k); ctx.stroke();
          }
        }
        for (const [x, y] of c.stars) {
          ctx.fillStyle = isFound ? "#bae6fd" : "#fff";
          ctx.shadowColor = "#fff";
          ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(x * k, y * k, 2.6 * k + 1, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      // shooting star
      shoot.next -= 1 / 60;
      if (shoot.t < 0 && shoot.next <= 0) shoot = { t: 0, x: v.x - 300 + Math.random() * 600, y: 100 + Math.random() * 300, next: 6 + Math.random() * 6 };
      if (shoot.t >= 0) {
        shoot.t += 1 / 60;
        const sx = (shoot.x + shoot.t * 900) * k;
        const sy = (shoot.y + shoot.t * 380) * k;
        const tail = ctx.createLinearGradient(sx, sy, sx - 140 * k, sy - 60 * k);
        tail.addColorStop(0, "rgba(255,255,255,0.9)");
        tail.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = tail;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 140 * k, sy - 60 * k); ctx.stroke();
        if (shoot.t > 0.7) shoot.t = -1;
      }
      ctx.restore();
      if (!v.drag) v.x += 0.06; // slow sky drift
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stars]);

  const toSky = (e) => {
    const r = canvas.current.getBoundingClientRect();
    const k = canvas.current.height / 1000;
    const scale = canvas.current.width / r.width;
    return { x: ((e.clientX - r.left) * scale - canvas.current.width / 2) / k + view.current.x, y: ((e.clientY - r.top) * scale) / k };
  };
  const onDown = (e) => {
    view.current.drag = { x: e.clientX, from: view.current.x, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const d = view.current.drag;
    if (!d) return;
    const r = canvas.current.getBoundingClientRect();
    const k = canvas.current.height / 1000;
    const scale = canvas.current.width / r.width;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    view.current.x = Math.max(0, Math.min(2400, d.from - (dx * scale) / k));
  };
  const onUp = (e) => {
    const d = view.current.drag;
    view.current.drag = null;
    if (d?.moved) return;
    const p = toSky(e);
    const hit = CONSTELLATIONS.find((c) => c.stars.some(([x, y]) => Math.hypot(x - p.x, y - p.y) < 45));
    if (hit) {
      sfx.chime();
      setInfo(hit);
      setFound((f) => new Set(f).add(hit.name));
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-30 bg-black" />
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] } }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="pointer-events-auto fixed left-1/2 top-1/2 z-40 aspect-square w-[min(88vh,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-[0_0_0_6px_#1f2937,0_0_0_10px_#b45309,0_0_80px_20px_rgba(0,0,0,0.9)]"
      >
        <canvas ref={canvas} width={portrait ? 800 : 1200} height={portrait ? 800 : 1200} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} />
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_120px_40px_rgba(0,0,0,0.9)]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 bg-red-400/40" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-px w-10 -translate-x-1/2 -translate-y-1/2 bg-red-400/40" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }} exit={{ opacity: 0 }} className="pointer-events-none fixed bottom-5 left-1/2 z-[45] w-[min(560px,92vw)] -translate-x-1/2 text-center">
        <AnimatePresence mode="wait">
          {info ? (
            <motion.div key={info.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-sky-300/20 bg-[#050816]/85 px-5 py-3.5 backdrop-blur">
              <div className="font-display text-2xl italic text-sky-100">{info.name}</div>
              <p className="mt-1 text-sm text-white/70">{info.fact}</p>
            </motion.div>
          ) : (
            <motion.p key="hint" className="font-mono text-[12px] text-white/55">drag to sweep the sky · tap the bright stars to find constellations</motion.p>
          )}
        </AnimatePresence>
        <div className="mt-2 font-mono text-[11px] text-white/45">{found.size} / {CONSTELLATIONS.length} found · looking south from Melbourne</div>
      </motion.div>
    </>
  );
}

/* ═════════════ radio ═════════════ */

const STATIONS = [
  { id: "lofi", freq: "88.1", name: "Lo-fi room tone", desc: "Soft chords and vinyl crackle. The house default." },
  { id: "rain", freq: "92.4", name: "Melbourne rain", desc: "It's always about to rain in Melbourne." },
  { id: "crickets", freq: "97.0", name: "Night crickets", desc: "Just the rooftop at 2 a.m." },
  { id: "off", freq: "——", name: "Off", desc: "Silence. Bold choice." },
];

export function RadioPanel() {
  const [station, setStation] = useState(sfx.currentStation());
  const idx = STATIONS.findIndex((s) => s.id === station);
  const pick = (id) => {
    sfx.setStation(id);
    setStation(id);
    sfx.blip(true);
  };
  return (
    <motion.div
      initial={{ y: "120%" }}
      animate={{ y: 0, transition: { delay: 0.2, type: "spring", stiffness: 150, damping: 20 } }}
      exit={{ y: "120%" }}
      className="pointer-events-auto fixed bottom-4 left-1/2 z-40 w-[min(560px,94vw)] -translate-x-1/2 rounded-[28px] bg-gradient-to-b from-[#c2410c] to-[#7c2d12] p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
    >
      <div className="rounded-[22px] bg-[#1c1310] p-5">
        {/* dial */}
        <div className="relative h-14 overflow-hidden rounded-lg bg-[linear-gradient(180deg,#fef3c7,#fde68a)] shadow-inner">
          <div className="absolute inset-x-4 bottom-2 flex justify-between font-mono text-[10px] text-[#78350f]">
            {["88", "92", "96", "100", "104", "108"].map((n) => <span key={n}>{n}</span>)}
          </div>
          {Array.from({ length: 41 }, (_, i) => (
            <span key={i} className="absolute top-2 w-px bg-[#78350f]/50" style={{ left: `${4 + i * 2.3}%`, height: i % 5 ? 8 : 14 }} />
          ))}
          <motion.span className="absolute top-0 h-full w-0.5 bg-red-600 shadow-[0_0_6px_#dc2626]" animate={{ left: `${idx === 3 ? 96 : 8 + idx * 22}%` }} transition={{ type: "spring", stiffness: 120, damping: 14 }} />
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/70">{STATIONS[idx]?.freq} FM</div>
            <div className="font-display text-2xl italic text-amber-50">{STATIONS[idx]?.name}</div>
            <p className="mt-0.5 text-sm text-amber-100/55">{STATIONS[idx]?.desc}</p>
          </div>
          <span className="eq mt-2" aria-hidden><i /><i /><i /><i /></span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {STATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => pick(s.id)}
              className={`rounded-lg border px-2 py-2.5 font-mono text-[11px] transition ${station === s.id ? "border-amber-300 bg-amber-300/15 text-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.35)]" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"}`}
            >
              {s.id === "off" ? "OFF" : s.freq}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
