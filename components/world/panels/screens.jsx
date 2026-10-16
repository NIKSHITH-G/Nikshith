"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { profile, experience, projects, skills } from "../../../lib/content";
import { runtime, goToPanel, openPanel, getState } from "../store";
import BlockyAvatar from "../../BlockyAvatar";
import * as sfx from "../audio";

/* ── OnScreen: pins content onto a 3D screen ───────────────────────────────
   On desktop the Scene projects the screen's corners every frame and writes
   --sx/--sy/--sk onto this element, so the HTML sits exactly on the glass and
   rides along as the camera flies in. On phones it becomes a full-screen
   device frame instead, so the text stays readable. */

export function OnScreen({ base, aspect, portrait, frame, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (portrait) return;
    const el = ref.current;
    runtime.surfaceEl = el;
    return () => {
      if (runtime.surfaceEl === el) runtime.surfaceEl = null;
    };
  }, [portrait]);

  if (portrait) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: 0.25, type: "spring", stiffness: 260, damping: 28 } }}
        exit={{ opacity: 0, scale: 0.96 }}
        className={`pointer-events-auto fixed inset-x-3 bottom-3 top-[92px] z-40 overflow-hidden ${frame}`}
      >
        <div className="h-full overflow-y-auto overscroll-contain">{children}</div>
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      data-base={base}
      className="pointer-events-auto fixed left-0 top-0 z-40"
      style={{ transform: "translate(var(--sx, -9999px), var(--sy, 0px))" }}
    >
      <div style={{ width: base, height: base / aspect, transform: "scale(var(--sk, 0.001))", transformOrigin: "0 0" }}>
        <motion.div
          className="h-full w-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.35, duration: 0.25 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

const lineIn = (i, base = 0.55) => ({
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0, transition: { delay: base + i * 0.07, duration: 0.2 } },
});

/* ── TV: about ─────────────────────────────────────── */

export function TVScreen({ portrait }) {
  const facts = ["Master of AI · Monash", "ex-Systems Engineer · TCS", "Melbourne", "music & photography"];
  const ticker = `${profile.status} · ${facts.join(" · ")} · `;
  return (
    <OnScreen base={1000} aspect={2 / 1.12} portrait={portrait} frame="rounded-[22px] border-[10px] border-[#111216] shadow-2xl">
      <div className={`crt-on relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#2d1a63,#14112b_70%)] text-white ${portrait ? "min-h-full" : "h-full"}`}>
        <div aria-hidden className="crt-lines pointer-events-none absolute inset-0 z-10" />
        <div className="flex items-center justify-between px-10 pt-7 font-mono text-[13px]">
          <span className="text-emerald-300">● now showing</span>
          <span className="text-white/45">CH 01 · ABOUT</span>
        </div>
        <div className={`gap-9 px-10 pt-6 ${portrait ? "flex flex-col pb-20" : "grid grid-cols-[190px_1fr] pb-14"}`}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.7 } }}>
            {profile.tvPhoto ? (
              <Image src={profile.tvPhoto} alt={profile.name} width={380} height={460} className="h-[230px] w-[190px] rounded-2xl object-cover object-top ring-1 ring-white/20" />
            ) : (
              <BlockyAvatar size={190} className="rounded-2xl ring-1 ring-white/20" />
            )}
            <div className="mt-3 font-mono text-[11px] text-white/45">{profile.location}</div>
          </motion.div>
          <div>
            <motion.h2 {...lineIn(0, 0.6)} className="font-display text-[64px] italic leading-[0.95]">{profile.name}</motion.h2>
            <motion.div {...lineIn(1, 0.6)} className="mt-2 text-lg text-violet-200">{profile.role}</motion.div>
            <motion.p {...lineIn(2, 0.6)} className="mt-4 font-display text-[26px] italic leading-snug text-white/90">&ldquo;{profile.tagline}&rdquo;</motion.p>
            {profile.bio.map((p, i) => (
              <motion.p key={p} {...lineIn(3 + i, 0.6)} className="mt-3 text-[15px] leading-relaxed text-white/70">{p}</motion.p>
            ))}
            <motion.div {...lineIn(6, 0.6)} className="mt-5 flex flex-wrap gap-2.5">
              <button onClick={() => goToPanel("projects", 0)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-violet-100">▶ Play my projects</button>
              <button onClick={() => goToPanel("contact")} className="rounded-full border border-white/25 px-5 py-2.5 text-sm text-white/90 transition hover:bg-white/10">Say hi</button>
              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-5 py-2.5 text-sm text-white/90 transition hover:bg-white/10">Résumé ↓</a>
            </motion.div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-10 items-center overflow-hidden bg-black/45 font-mono text-[13px] text-white/75">
          <span className="z-10 flex h-full shrink-0 items-center bg-violet-500 px-4 font-semibold text-white">LIVE</span>
          <div className="ticker flex whitespace-nowrap">
            <span className="px-4">{ticker.repeat(3)}</span>
            <span className="px-4">{ticker.repeat(3)}</span>
          </div>
        </div>
      </div>
    </OnScreen>
  );
}

/* ── monitor: experience as a terminal ─────────────── */

const HASHES = ["a3f9e1c", "7c21d04", "e04b88f"];

export function TerminalScreen({ portrait }) {
  const [open, setOpen] = useState(0);
  let n = 0;
  return (
    <OnScreen base={900} aspect={1.22 / 0.7} portrait={portrait} frame="rounded-[18px] border-[10px] border-[#17181f] shadow-2xl">
      <div className="flex h-full min-h-full flex-col bg-[#0a0b11] font-mono text-[13px] leading-[1.65] text-white/80">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="flex-1 text-center text-[12px] text-white/40">nikshith@studio — ~/work — zsh</span>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-4">
          <motion.div {...lineIn(n++, 0.4)} className="text-white/35">Last login: {new Date().toDateString()} on ttys001</motion.div>
          <motion.div {...lineIn(n++, 0.4)}><Prompt /> whoami</motion.div>
          <motion.div {...lineIn(n++, 0.4)} className="text-violet-300">nikshith — {profile.role.toLowerCase()}, {profile.location.split(",")[0].toLowerCase()}</motion.div>
          <motion.div {...lineIn(n++, 0.4)} className="mt-2"><Prompt /> git log --career --graph</motion.div>
          <div className="mt-2">
            {experience.map((e, i) => {
              const expanded = open === i;
              return (
                <motion.div key={e.company} {...lineIn(n++, 0.4)} className="group">
                  <button
                    onClick={() => { setOpen(expanded ? -1 : i); sfx.blip(!expanded); }}
                    aria-expanded={expanded}
                    className="w-full rounded px-1 text-left transition hover:bg-white/[0.04]"
                  >
                    <span className="text-violet-400">* </span>
                    <span className="text-amber-300">{HASHES[i]}</span>
                    {i === 0 && <span className="text-white/45"> (<span className="text-cyan-300">HEAD</span> → <span className="text-emerald-300">latest</span>)</span>}
                    <span className="text-white"> {e.role}</span>
                    <span className="text-white/45"> @ {e.company}</span>
                    <div className="pl-4 text-white/40"><span className="text-violet-400/60">| </span>{e.dates} · {e.location}{!expanded && <span className="text-white/25">  — {e.bullets.length} changes, click to expand</span>}</div>
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden pl-5"
                      >
                        {e.bullets.map((b) => (
                          <li key={b} className="text-white/70"><span className="text-violet-400/60">| </span><span className="text-emerald-400">+ </span>{b}</li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                  <div className="pl-1 text-violet-400/60">|</div>
                </motion.div>
              );
            })}
          </div>
          <motion.div {...lineIn(n++, 0.4)} className="mt-1"><Prompt /> <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-white/70" /></motion.div>
        </div>
      </div>
    </OnScreen>
  );
}

function Prompt() {
  return (
    <>
      <span className="text-emerald-400">nikshith@studio</span>
      <span className="text-white/40">:</span>
      <span className="text-sky-400">~/work</span>
      <span className="text-white/40">$</span>
    </>
  );
}

/* ── arcade: projects ──────────────────────────────── */

export function ArcadeScreen({ item = 0, portrait }) {
  const i = item ?? 0;
  const p = projects[i];
  const go = (d) => {
    const j = (i + d + projects.length) % projects.length;
    // the first three games have their own cabinet the camera glides to; the rest play on this one
    openPanel("projects", j, j < 3 ? `proj-${j}` : getState().panel?.from);
  };
  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goRef.current(1);
      if (e.key === "ArrowLeft") goRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <OnScreen base={700} aspect={0.82 / 0.64} portrait={portrait} frame="rounded-[18px] border-[10px] border-[#1c1d2c] shadow-[0_0_60px_-10px_rgba(139,92,246,0.6)]">
      <div className="crt-on relative h-full min-h-full overflow-hidden bg-[radial-gradient(ellipse_at_center,#14102a,#05050a_75%)] font-mono text-white">
        <div aria-hidden className="crt-lines pointer-events-none absolute inset-0 z-10" />
        <div className="no-scrollbar relative h-full overflow-y-auto px-7 py-5">
          <div className="flex items-center justify-between font-pixel text-[10px] tracking-wider">
            <span className="text-amber-300">SELECT GAME</span>
            <span className="text-white/45">GAME {i + 1}/{projects.length}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => go(-1)} aria-label="Previous project" className="font-pixel text-lg text-white/60 transition hover:text-white">◀</button>
            <div className="flex gap-1.5">
              {projects.map((proj, j) => (
                <span key={proj.name} className="h-2 w-7 rounded-sm" style={{ background: j === i ? proj.color : "rgba(255,255,255,0.15)", boxShadow: j === i ? `0 0 10px ${proj.color}` : "none" }} />
              ))}
            </div>
            <button onClick={() => go(1)} aria-label="Next project" className="font-pixel text-lg text-white/60 transition hover:text-white">▶</button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={p.name} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <h2 className="mt-4 text-center font-pixel text-[30px] leading-tight" style={{ color: p.color, textShadow: `0 0 18px ${p.color}` }}>{p.name}</h2>
              <p className="mt-1 text-center font-display text-lg italic text-white/90">{p.tagline}</p>
              {p.images.length > 0 && (
                <div className="mt-3 flex justify-center gap-2">
                  {p.images.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded border border-white/15">
                      <Image src={src} alt={`${p.name} screenshot`} width={120} height={72} className="h-[60px] w-auto object-cover" />
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-4 font-pixel text-[9px] tracking-[0.25em] text-amber-300">HOW TO PLAY</div>
              <ul className="mt-1.5 space-y-1 text-[12px] leading-snug text-white/80">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2"><span style={{ color: p.color }}>▸</span>{pt}</li>
                ))}
              </ul>
              <div className="mt-3 font-pixel text-[9px] tracking-[0.25em] text-amber-300">POWER-UPS</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <span key={s} className="rounded border px-1.5 py-0.5 text-[11px] text-white/85" style={{ borderColor: `${p.color}66`, background: `${p.color}14` }}>{s}</span>
                ))}
              </div>
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="blink mt-4 block rounded py-2.5 text-center font-pixel text-sm text-black" style={{ background: p.color, boxShadow: `0 0 20px -2px ${p.color}` }}>
                  ▶ PRESS START · {new URL(p.url).hostname.replace(/^www\./, "").toUpperCase()}
                </a>
              )}
              {p.repo ? (
                <a href={p.repo} target="_blank" rel="noopener noreferrer" className={`block rounded border py-2 text-center font-pixel text-[11px] text-white/80 transition hover:text-white ${p.url ? "mt-2" : "mt-4"}`} style={{ borderColor: `${p.color}66` }}>
                  VIEW SOURCE ON GITHUB
                </a>
              ) : (
                !p.url && <div className="mt-4 text-center font-pixel text-[10px] text-white/35">SOURCE ON REQUEST</div>
              )}
              <div className="mt-3 text-center text-[10px] text-white/30">◀ ▶ arrow keys to switch cabinets</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </OnScreen>
  );
}

/* ── whiteboard: skills ────────────────────────────── */

const INK = ["#6d28d9", "#047857", "#b91c1c", "#1d4ed8"];

export function WhiteboardScreen({ portrait }) {
  let k = 0;
  const draw = () => ({ className: "draw", style: { animationDelay: `${0.5 + k++ * 0.09}s` } });
  return (
    <OnScreen base={1000} aspect={1.8 / 1.15} portrait={portrait} frame="rounded-[14px] border-[8px] border-[#c9ccd6] shadow-2xl">
      <div className="relative h-full min-h-full bg-[#f6f4ee] px-12 py-9 font-hand text-[#1f2937]">
        <div {...draw()}>
          <span className="text-[42px] leading-none text-[#6d28d9]">const stack = {"{"}</span>
        </div>
        <div className={`mt-5 grid gap-x-12 gap-y-6 pl-8 ${portrait ? "grid-cols-1" : "grid-cols-2"}`}>
          {skills.map((g, i) => (
            <div key={g.group}>
              <div {...draw()}>
                <span className="text-[30px] leading-none" style={{ color: INK[i % INK.length] }}>{g.group.toLowerCase().replace(" / ", "_")}:</span>
              </div>
              <div {...draw()} className="draw mt-1 flex flex-wrap gap-x-4 text-[26px] leading-snug">
                {g.items.map((s, j) => (
                  <span key={s} style={{ display: "inline-block", transform: `rotate(${((j * 7 + i * 3) % 5) - 2}deg)` }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div {...draw()} className="draw mt-4">
          <span className="text-[42px] leading-none text-[#6d28d9]">{"}"}</span>
        </div>
        {/* ship it! — circled in red marker */}
        <svg viewBox="0 0 220 90" className={`absolute h-[90px] w-[220px] ${portrait ? "relative mt-4" : "bottom-9 right-12"}`} aria-hidden>
          <ellipse cx="110" cy="45" rx="100" ry="34" fill="none" stroke="#dc2626" strokeWidth="3.5" className="draw-stroke" style={{ animationDelay: `${0.5 + k * 0.09}s` }} transform="rotate(-3 110 45)" />
          <text x="110" y="55" textAnchor="middle" className="fill-[#dc2626] font-hand text-[30px]">ship it!</text>
        </svg>
        <div className="absolute bottom-3 left-12 flex gap-3" aria-hidden>
          {INK.slice(0, 3).map((c) => <span key={c} className="h-2 w-12 rounded-full" style={{ background: c }} />)}
        </div>
      </div>
    </OnScreen>
  );
}
