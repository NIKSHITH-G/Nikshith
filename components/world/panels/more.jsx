"use client";

// Views for the library, Now board, training plan, side quests, photo booth,
// arcade cabinets and rooftop guestbook.

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Download, RotateCcw, Check, Trash2, X } from "lucide-react";
import { now, learning, quests, reading, profile } from "../../../lib/content";
import { OnScreen } from "./screens";
import { ownerKey } from "../chess";
import * as sfx from "../audio";

const best = {
  get(k) {
    try {
      return Number(localStorage.getItem(`studio-best-${k}`)) || 0;
    } catch {
      return 0;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(`studio-best-${k}`, String(v));
    } catch {}
  },
};

function Backdrop({ className = "" }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`pointer-events-none fixed inset-0 z-30 ${className}`} />;
}

/* ═════════════ Kindle: the library ═════════════ */

// The book's real cover (from Open Library), or a designed stand-in if there isn't one.
function Cover({ book, big }) {
  const [bg, ink] = book.colors;
  const size = big ? "h-40 w-28" : "h-[92px] w-16";
  if (book.cover) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-[3px] bg-black shadow-[2px_3px_8px_rgba(0,0,0,0.35)] ${size}`}>
        <Image src={book.cover} alt={`${book.title} cover`} fill sizes={big ? "112px" : "64px"} className="object-cover" />
        <div className="absolute inset-y-0 left-0 w-[3px] bg-black/25" />
      </div>
    );
  }
  return (
    <div className={`relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[3px] shadow-[2px_3px_8px_rgba(0,0,0,0.35)] ${size} ${big ? "p-3" : "p-1.5"}`} style={{ background: bg, color: ink }}>
      <div className="absolute inset-y-0 left-0 w-[3px] bg-black/25" />
      <div className={`font-display italic leading-[1.05] ${big ? "text-lg" : "text-[10px]"}`}>{book.title}</div>
      <div className={`font-mono uppercase leading-tight opacity-75 ${big ? "text-[8px]" : "text-[5.5px]"}`}>{book.author}</div>
    </div>
  );
}

export function LibraryKindle({ portrait }) {
  const [open, setOpen] = useState(null);
  const fav = reading.shelves.flatMap((sh) => sh.books).find((b) => b.title === reading.favourite);
  const count = reading.shelves.reduce((n, sh) => n + sh.books.length, 0);

  return (
    <>
      <Backdrop className="bg-[radial-gradient(ellipse_at_center,rgba(40,25,10,0.35),rgba(5,5,10,0.85)_70%)]" />
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 25 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, transition: { delay: 0.2, type: "spring", stiffness: 140, damping: 18 } }}
          exit={{ opacity: 0, y: 40 }}
          style={{ perspective: 1200 }}
          className={`pointer-events-auto rounded-[28px] bg-[#1c1c22] p-4 pb-9 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10 ${portrait ? "w-[94vw]" : "w-[480px]"}`}
        >
          {/* e-ink screen */}
          <div className="relative flex h-[min(66vh,600px)] flex-col overflow-hidden rounded-md bg-[#f1ead6] text-[#1c1917]">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-2 font-mono text-[10px] text-black/55">
              {open ? (
                <button onClick={() => setOpen(null)} className="text-black/70 hover:text-black">← Library</button>
              ) : (
                <span>{profile.name.split(" ")[0]}&apos;s Library · {count} books</span>
              )}
              <span>▮▮▮▯ 87%</span>
            </div>

            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key={open.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 overflow-y-auto px-5 py-5">
                  <div className="flex gap-4">
                    <Cover book={open} big />
                    <div className="min-w-0">
                      {open.title === reading.favourite && <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#b45309]">★ favourite</div>}
                      <h2 className="font-display text-[26px] italic leading-tight">{open.title}</h2>
                      <div className="mt-1 text-xs text-black/55">{open.author}</div>
                      <p className="mt-3 text-[13px] leading-relaxed text-black/75">{open.line}</p>
                    </div>
                  </div>
                  {open.summary && (
                    <>
                      <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-black/45">About the book</div>
                      <p className="mt-2 font-serif text-[14.5px] leading-relaxed text-black/80">{open.summary}</p>
                    </>
                  )}
                  {open.why && <p className="mt-5 border-l-2 border-[#b45309] pl-3 font-hand text-xl leading-snug text-[#7c2d12]">{open.why}</p>}
                  {open.quotes?.length > 0 && (
                    <>
                      <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-black/45">Highlights · {open.quotes.length}</div>
                      <ul className="mt-3 space-y-4">
                        {open.quotes.map((q, i) => (
                          <motion.li key={q.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.08 } }}>
                            <p className="font-serif text-[15px] leading-relaxed">
                              <span className="box-decoration-clone bg-[#fde68a] px-1 py-0.5">“{q.text}”</span>
                            </p>
                            <div className="mt-1 font-mono text-[10px] text-black/45">— {q.from}</div>
                          </motion.li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-black/45">My takeaways</div>
                  <ul className="mt-2 space-y-2">
                    {open.ideas.map((idea) => (
                      <li key={idea} className="flex gap-2 text-[13.5px] leading-relaxed text-black/75">
                        <span className="text-[#b45309]">✎</span> {idea}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.div key="shelves" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 overflow-y-auto pb-4">
                  {fav && (
                    <button onClick={() => setOpen(fav)} className="mx-4 mt-4 flex w-[calc(100%-2rem)] gap-4 rounded-md border border-black/15 bg-white/40 p-3 text-left transition hover:bg-white/70">
                      <Cover book={fav} big />
                      <div className="min-w-0 py-1">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[#b45309]">★ all-time favourite</div>
                        <div className="mt-1 font-display text-2xl italic leading-tight">{fav.title}</div>
                        <div className="text-xs text-black/55">{fav.author}</div>
                        <p className="mt-2 line-clamp-3 text-[12px] leading-snug text-black/70">{fav.why || fav.line}</p>
                        <div className="mt-2 font-mono text-[10px] text-black/45">tap to read highlights →</div>
                      </div>
                    </button>
                  )}
                  {reading.shelves.filter((sh) => !(sh.books.length === 1 && sh.books[0] === fav)).map((sh) => (
                    <section key={sh.name} className="mt-5">
                      <div className="flex items-baseline justify-between px-4">
                        <h3 className="font-display text-lg italic">{sh.name}</h3>
                        <span className="font-mono text-[10px] text-black/45">{sh.books.length}</span>
                      </div>
                      <div className="no-scrollbar mt-2 flex gap-3 overflow-x-auto px-4 pb-2">
                        {sh.books.map((b) => (
                          <button key={b.title} onClick={() => setOpen(b)} className="group w-16 shrink-0 text-left" aria-label={`${b.title} by ${b.author}`}>
                            <div className="transition group-hover:-translate-y-1">
                              <Cover book={b} />
                            </div>
                            <div className="mt-1.5 line-clamp-2 text-[10px] leading-tight text-black/70">{b.title}</div>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-3 text-center font-mono text-[10px] tracking-[0.3em] text-white/30">kindle</div>
        </motion.div>
      </div>
    </>
  );
}

/* ═════════════ Now board (on the cork board) ═════════════ */

const CARD = ["#fde68a", "#bbf7d0", "#fbcfe8", "#bfdbfe"];

export function NowScreen({ portrait }) {
  return (
    <OnScreen base={1000} aspect={1.9 / 1.15} portrait={portrait} frame="rounded-[14px] border-[10px] border-[#5a3a24] shadow-2xl">
      <div className={`relative bg-[#b08452] px-10 py-8 [background-image:radial-gradient(rgba(90,60,30,0.35)_1px,transparent_1px)] [background-size:6px_6px] ${portrait ? "min-h-full" : "h-full"}`}>
        <div className="flex items-baseline justify-between">
          <h2 className="font-hand text-5xl text-[#1c1917]">Now</h2>
          <span className="font-mono text-xs text-black/55">updated {now.updated}</span>
        </div>
        <div className={`mt-5 grid gap-6 ${portrait ? "grid-cols-1" : "grid-cols-2"}`}>
          {now.items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -16, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: ((i % 3) - 1) * 1.6, transition: { delay: 0.5 + i * 0.12, type: "spring", stiffness: 220, damping: 16 } }}
              className="relative px-6 pb-5 pt-7 shadow-[0_10px_20px_-8px_rgba(0,0,0,0.5)]"
              style={{ background: CARD[i % CARD.length] }}
            >
              <span className="absolute left-1/2 top-2 h-4 w-4 -translate-x-1/2 rounded-full bg-red-600 shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.25)]" />
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-black/50">{item.label}</div>
              <p className="mt-1 font-hand text-[26px] leading-[1.15] text-[#1c1917]">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </OnScreen>
  );
}

/* ═════════════ Training plan (gym whiteboard) ═════════════ */

const INK = ["#c2410c", "#047857", "#1d4ed8", "#6d28d9", "#b91c1c"];

export function LearningScreen({ portrait }) {
  let k = 0;
  const draw = () => ({ className: "draw", style: { animationDelay: `${0.45 + k++ * 0.12}s` } });
  return (
    <OnScreen base={1000} aspect={1.8 / 1.15} portrait={portrait} frame="rounded-[14px] border-[8px] border-[#9ca3af] shadow-2xl">
      <div className={`bg-[#f6f4ee] px-12 py-9 font-hand text-[#1f2937] ${portrait ? "min-h-full" : "h-full"}`}>
        <div {...draw()}>
          <span className="text-5xl leading-none text-[#c2410c]">Training plan 🏋️</span>
        </div>
        <ul className="mt-6 space-y-4">
          {learning.map((l, i) => (
            <li key={l.topic} {...draw()} className="draw flex items-baseline gap-4">
              <span className="inline-block h-6 w-6 shrink-0 translate-y-1 rounded border-[3px]" style={{ borderColor: INK[i % INK.length] }} />
              {/* on a phone the detail drops under the topic instead of squeezing beside it */}
              <span className={portrait ? "min-w-0" : "contents"}>
                <span className="text-[34px] leading-none" style={{ color: INK[i % INK.length] }}>{l.topic}</span>
                <span className={`text-2xl text-[#4b5563] ${portrait ? "mt-1 block" : ""}`}>{portrait ? "" : "— "}{l.detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <div {...draw()} className="draw mt-6 text-3xl text-[#b91c1c]">reps: every day. rest days: when the code compiles.</div>
      </div>
    </OnScreen>
  );
}

/* ═════════════ Side quests (kanban) ═════════════ */

export function KanbanScreen({ portrait }) {
  const cols = [
    ["Shipped", quests.shipped, "#bbf7d0"],
    ["Building", quests.building, "#fde68a"],
    ["Next", quests.next, "#bfdbfe"],
  ];
  let k = 0;
  return (
    <OnScreen base={1000} aspect={2.2 / 1.3} portrait={portrait} frame="rounded-[14px] border-[8px] border-[#9ca3af] shadow-2xl">
      <div className={`bg-[#f6f4ee] px-10 py-8 text-[#1f2937] ${portrait ? "min-h-full" : "h-full"}`}>
        <div className="flex items-baseline justify-between">
          <h2 className="font-hand text-5xl leading-none">Side quests</h2>
          <span className="font-mono text-xs text-black/45">a real board, kept up to date</span>
        </div>
        <div className={`mt-6 grid gap-6 ${portrait ? "grid-cols-1" : "grid-cols-3"}`}>
          {cols.map(([title, items, color]) => (
            <div key={title}>
              <div className="mb-3 flex items-center justify-between border-b-2 border-black/15 pb-1 font-mono text-sm font-bold uppercase tracking-wider">
                {title} <span className="text-black/40">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((it) => (
                  <motion.div
                    key={it}
                    initial={{ opacity: 0, x: -20, rotate: -2 }}
                    animate={{ opacity: 1, x: 0, rotate: ((k % 3) - 1) * 0.8, transition: { delay: 0.5 + k++ * 0.08 } }}
                    className="px-4 py-3 font-hand text-[24px] leading-tight shadow-[0_6px_12px_-6px_rgba(0,0,0,0.4)]"
                    style={{ background: color }}
                  >
                    {title === "Shipped" && "✓ "}
                    {it}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </OnScreen>
  );
}

/* ═════════════ Photo booth: a 4-shot strip of the studio character ═════════════ */

const BoothScene = lazy(() => import("./booth3d"));

const BACKDROPS = [
  { id: "sunset", label: "Sunset", bg: ["#fb7185", "#fdba74"] },
  { id: "ocean", label: "Ocean", bg: ["#38bdf8", "#1e3a8a"] },
  { id: "mint", label: "Mint", bg: ["#6ee7b7", "#065f46"] },
  { id: "night", label: "Night", bg: ["#312e81", "#c084fc"] },
];
const OUTFITS = [
  { id: "violet", label: "Violet", top: "#7c5cd6" },
  { id: "red", label: "Red", top: "#dc2626" },
  { id: "forest", label: "Forest", top: "#15803d" },
  { id: "black", label: "Black", top: "#1f2937" },
];
const PROPS = [
  { id: "headphones", label: "🎧" },
  { id: "shades", label: "🕶️" },
  { id: "party", label: "🥳" },
  { id: "crown", label: "👑" },
];
const SHOT_POSES = ["wave", "peace", "jump", "hug"];
const SHOTS = 4;

export function PhotoBoothStage({ portrait }) {
  const canvasEl = useRef(null);
  const poseRef = useRef("idle");
  const [look, setLook] = useState({ bg: BACKDROPS[0].bg, top: OUTFITS[0].top, prop: "headphones", dog: true, skin: "#c89878" });
  const [bgId, setBgId] = useState(BACKDROPS[0].id);
  const [state, setStateB] = useState("posing"); // posing | shooting | done
  const [count, setCount] = useState(null);
  const [shot, setShot] = useState(0);
  const [flash, setFlash] = useState(0);
  const [strip, setStrip] = useState(null);

  // little idle animation between shots so the character doesn't stand frozen
  useEffect(() => {
    if (state !== "posing") return;
    const cycle = ["idle", "wave", "idle", "flex", "idle", "peace"];
    let i = 0;
    const id = setInterval(() => (poseRef.current = cycle[i++ % cycle.length]), 1400);
    return () => clearInterval(id);
  }, [state]);

  const grab = () => {
    const src = canvasEl.current;
    const c = document.createElement("canvas");
    c.width = 480;
    c.height = 360;
    const g = c.getContext("2d");
    // centre-crop the render to 4:3
    const ar = 4 / 3;
    let sw = src.width;
    let sh = src.height;
    if (sw / sh > ar) sw = sh * ar;
    else sh = sw / ar;
    g.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, 480, 360);
    return c;
  };

  const compose = (frames) => {
    const pad = 24;
    const c = document.createElement("canvas");
    c.width = 480 + pad * 2;
    c.height = SHOTS * (360 + pad) + pad + 90;
    const g = c.getContext("2d");
    g.fillStyle = "#fafaf9";
    g.fillRect(0, 0, c.width, c.height);
    frames.forEach((f, i) => g.drawImage(f, pad, pad + i * (360 + pad)));
    g.fillStyle = "#1c1917";
    g.textAlign = "center";
    g.font = "italic 34px Georgia, serif";
    g.fillText("Nikshith's Studio", c.width / 2, c.height - 50);
    g.font = "18px ui-monospace, Menlo, monospace";
    g.fillStyle = "#78716c";
    g.fillText(`nikshith.dev · ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`, c.width / 2, c.height - 22);
    return c.toDataURL("image/png");
  };

  const shoot = async () => {
    const frames = [];
    setStateB("shooting");
    for (let i = 0; i < SHOTS; i++) {
      setShot(i + 1);
      poseRef.current = SHOT_POSES[i];
      for (let n = 3; n > 0; n--) {
        setCount(n);
        sfx.beep(520, 0.05);
        await new Promise((r) => setTimeout(r, 600));
      }
      setCount(null);
      // let a frame render without the countdown before taking the picture
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      frames.push(grab());
      sfx.snap();
      setFlash((f) => f + 1);
      await new Promise((r) => setTimeout(r, 380));
    }
    poseRef.current = "idle";
    setStrip(compose(frames));
    setStateB("done");
  };

  const chip = (on) => `rounded-full px-3 py-1.5 text-xs transition ${on ? "bg-white text-black" : "border border-white/20 text-white/70 hover:text-white"}`;

  return (
    <>
      <Backdrop className="bg-[#1a0510]/85" />
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} className="pointer-events-none fixed inset-0 z-[46] bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }} />}
      </AnimatePresence>
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center-safe justify-center overflow-y-auto px-4 pb-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
          exit={{ opacity: 0 }}
          className={`pointer-events-auto flex gap-6 ${portrait ? "flex-col items-center" : "items-start"}`}
        >
          {state === "done" && strip ? (
            <>
              <motion.img
                src={strip}
                alt="Your photo strip"
                initial={{ y: -200, opacity: 0, rotate: -4 }}
                animate={{ y: 0, opacity: 1, rotate: -2 }}
                transition={{ type: "spring", stiffness: 90, damping: 14 }}
                className={`${portrait ? "w-44" : "w-56"} shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]`}
              />
              <div className="max-w-xs">
                <h2 className="font-display text-4xl italic text-white">Fresh off the press.</h2>
                <p className="mt-2 text-sm text-white/65">Four poses, one strip. Keep it as a souvenir from the studio.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={strip} download="nikshith-studio-photobooth.png" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-rose-100">
                    <Download size={15} /> Download strip
                  </a>
                  <button onClick={() => { setStrip(null); setStateB("posing"); }} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm text-white hover:bg-white/10">
                    <RotateCcw size={15} /> Another one
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={portrait ? "w-[92vw]" : "w-[640px]"}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-[10px] border-[#881337] bg-black shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]">
                <div className="absolute inset-0">
                  <Suspense fallback={null}>
                    <BoothScene look={look} poseRef={poseRef} onReady={(el) => (canvasEl.current = el)} />
                  </Suspense>
                </div>
                <AnimatePresence>
                  {count && (
                    <motion.div key={count} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[140px] italic text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.6)]">
                      {count}
                    </motion.div>
                  )}
                </AnimatePresence>
                {state === "shooting" && (
                  <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 font-mono text-xs text-white">
                    shot {shot} / {SHOTS} · {SHOT_POSES[shot - 1]}
                  </div>
                )}
              </div>
              {state === "posing" && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 w-16 font-mono text-[10px] uppercase tracking-wider text-white/40">backdrop</span>
                    {BACKDROPS.map((b) => (
                      <button key={b.id} onClick={() => { setBgId(b.id); setLook({ ...look, bg: b.bg }); }} className={chip(bgId === b.id)}>{b.label}</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 w-16 font-mono text-[10px] uppercase tracking-wider text-white/40">hoodie</span>
                    {OUTFITS.map((o) => (
                      <button key={o.id} onClick={() => setLook({ ...look, top: o.top })} aria-label={o.label} className={`h-7 w-7 rounded-full border-2 transition ${look.top === o.top ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`} style={{ background: o.top }} />
                    ))}
                    <span className="ml-3 mr-1 font-mono text-[10px] uppercase tracking-wider text-white/40">prop</span>
                    {PROPS.map((pr) => (
                      <button key={pr.id} onClick={() => setLook({ ...look, prop: pr.id })} className={`rounded-full px-2.5 py-1 text-base transition ${look.prop === pr.id ? "bg-white" : "hover:bg-white/10"}`}>{pr.label}</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs text-white/70">
                      <input type="checkbox" checked={look.dog} onChange={(e) => setLook({ ...look, dog: e.target.checked })} className="accent-rose-500" /> Pixel joins the photo
                    </label>
                    <button onClick={shoot} className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-400">
                      <Camera size={16} /> Take 4 photos
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}

/* ═════════════ Arcade: Snake, Breakout, Pong ═════════════ */

const W = 400;
const H = 400;

function useKeys() {
  const keys = useRef(new Set());
  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      keys.current.add(k);
    };
    const up = (e) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return keys;
}

const pressed = (keys, ...names) => names.some((n) => keys.current.has(n));

// Each game is a plain object: reset(), step(dt, input) → events, draw(g).
function makeSnake() {
  const N = 20;
  const S = W / N;
  let snake, dir, nextDir, food, acc, score, over;
  const placeFood = () => {
    do food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
    while (snake.some(([x, y]) => x === food[0] && y === food[1]));
  };
  return {
    reset() {
      snake = [[8, 10], [7, 10], [6, 10]];
      dir = [1, 0];
      nextDir = dir;
      acc = 0;
      score = 0;
      over = false;
      placeFood();
    },
    input(k) {
      const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      const d = map[k];
      if (d && !(d[0] === -dir[0] && d[1] === -dir[1])) nextDir = d;
    },
    step(dt) {
      acc += dt;
      const speed = Math.max(0.06, 0.12 - score * 0.002);
      if (acc < speed || over) return {};
      acc = 0;
      dir = nextDir;
      const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
      if (head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N || snake.some(([x, y]) => x === head[0] && y === head[1])) {
        over = true;
        return { over: true };
      }
      snake.unshift(head);
      if (head[0] === food[0] && head[1] === food[1]) {
        score += 1;
        placeFood();
        return { scored: true };
      }
      snake.pop();
      return {};
    },
    draw(g) {
      g.fillStyle = "#020617";
      g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(34,197,94,0.06)";
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) g.fillRect(i * S, j * S, S, S);
      g.fillStyle = "#ef4444";
      g.fillRect(food[0] * S + 3, food[1] * S + 3, S - 6, S - 6);
      snake.forEach(([x, y], i) => {
        g.fillStyle = i ? "#22c55e" : "#86efac";
        g.fillRect(x * S + 1, y * S + 1, S - 2, S - 2);
      });
    },
    get score() {
      return score;
    },
  };
}

function makeBreakout() {
  const R = 7;
  let px, ball, vx, vy, bricks, score, lives, stuck;
  const resetBall = () => {
    ball = [px, H - 40];
    vx = 0;
    vy = 0;
    stuck = true;
  };
  return {
    reset() {
      px = W / 2;
      score = 0;
      lives = 3;
      bricks = [];
      const cols = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#38bdf8"];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) bricks.push({ x: 10 + c * 48, y: 40 + r * 20, c: cols[r], alive: true });
      resetBall();
    },
    input() {},
    step(dt, inp) {
      px = Math.max(40, Math.min(W - 40, inp.pointerX ?? px + inp.dx * 420 * dt));
      if (stuck) {
        ball = [px, H - 40];
        if (inp.fire) {
          stuck = false;
          vx = 160 * (Math.random() > 0.5 ? 1 : -1);
          vy = -280;
        }
        return {};
      }
      ball[0] += vx * dt;
      ball[1] += vy * dt;
      let ev = {};
      if (ball[0] < R || ball[0] > W - R) { vx = -vx; ball[0] = Math.max(R, Math.min(W - R, ball[0])); ev.bounce = true; }
      if (ball[1] < R) { vy = Math.abs(vy); ev.bounce = true; }
      if (ball[1] > H - 32 && ball[1] < H - 20 && Math.abs(ball[0] - px) < 44 && vy > 0) {
        vy = -Math.abs(vy) * 1.02;
        vx = (ball[0] - px) * 6;
        ev.bounce = true;
      }
      for (const b of bricks) {
        if (b.alive && ball[0] > b.x && ball[0] < b.x + 44 && ball[1] > b.y && ball[1] < b.y + 16) {
          b.alive = false;
          vy = -vy;
          score += 10;
          ev.scored = true;
          break;
        }
      }
      if (ball[1] > H + 10) {
        lives -= 1;
        if (lives <= 0) return { over: true };
        resetBall();
      }
      if (bricks.every((b) => !b.alive)) return { over: true, won: true };
      return ev;
    },
    draw(g) {
      g.fillStyle = "#020617";
      g.fillRect(0, 0, W, H);
      bricks.forEach((b) => {
        if (!b.alive) return;
        g.fillStyle = b.c;
        g.fillRect(b.x, b.y, 44, 16);
      });
      g.fillStyle = "#f8fafc";
      g.fillRect(px - 40, H - 28, 80, 8);
      g.beginPath();
      g.arc(ball[0], ball[1], R, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.5)";
      g.font = "12px ui-monospace, monospace";
      g.fillText("♥".repeat(lives), 10, H - 8);
    },
    get score() {
      return score;
    },
  };
}

function makePong() {
  const PH = 64;
  let py, cy, ball, vx, vy, you, cpu, serveT;
  const serve = (dir) => {
    ball = [W / 2, H / 2];
    vx = 230 * dir;
    vy = (Math.random() - 0.5) * 200;
    serveT = 0.7;
  };
  return {
    reset() {
      py = H / 2;
      cy = H / 2;
      you = 0;
      cpu = 0;
      serve(1);
    },
    input() {},
    step(dt, inp) {
      py = Math.max(PH / 2, Math.min(H - PH / 2, inp.pointerY ?? py + inp.dy * 360 * dt));
      // the CPU tracks the ball, but not perfectly
      cy += Math.max(-220 * dt, Math.min(220 * dt, ball[1] - cy));
      if (serveT > 0) {
        serveT -= dt;
        return {};
      }
      ball[0] += vx * dt;
      ball[1] += vy * dt;
      let ev = {};
      if (ball[1] < 6 || ball[1] > H - 6) { vy = -vy; ev.bounce = true; }
      if (ball[0] < 28 && ball[0] > 14 && Math.abs(ball[1] - py) < PH / 2 + 6 && vx < 0) {
        vx = -vx * 1.05;
        vy += (ball[1] - py) * 4;
        ev.bounce = true;
      }
      if (ball[0] > W - 28 && ball[0] < W - 14 && Math.abs(ball[1] - cy) < PH / 2 + 6 && vx > 0) {
        vx = -vx * 1.05;
        vy += (ball[1] - cy) * 3;
        ev.bounce = true;
      }
      if (ball[0] < -10) { cpu += 1; serve(1); }
      if (ball[0] > W + 10) { you += 1; serve(-1); ev.scored = true; }
      if (you >= 7 || cpu >= 7) return { over: true, won: you >= 7 };
      return ev;
    },
    draw(g) {
      g.fillStyle = "#020617";
      g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(255,255,255,0.3)";
      for (let y = 6; y < H; y += 22) g.fillRect(W / 2 - 1, y, 2, 12);
      g.fillStyle = "#38bdf8";
      g.fillRect(14, py - PH / 2, 10, PH);
      g.fillStyle = "#f8fafc";
      g.fillRect(W - 24, cy - PH / 2, 10, PH);
      g.fillRect(ball[0] - 5, ball[1] - 5, 10, 10);
      g.font = "bold 40px ui-monospace, monospace";
      g.textAlign = "center";
      g.fillText(`${you}   ${cpu}`, W / 2, 50);
      g.textAlign = "left";
    },
    get score() {
      return you;
    },
  };
}

const GAMES = [
  { name: "Snake", make: makeSnake, color: "#22c55e", how: "Arrows / WASD or swipe. Eat, grow, don't bite yourself." },
  { name: "Breakout", make: makeBreakout, color: "#f97316", how: "Move the mouse or ← →. Space / tap to launch." },
  { name: "Pong", make: makePong, color: "#38bdf8", how: "Move the mouse or ↑ ↓ / W S. First to 7 vs the CPU." },
];

export function ArcadeGames({ item = 0, portrait }) {
  const meta = GAMES[item ?? 0];
  const canvas = useRef(null);
  const game = useRef(null);
  const keys = useKeys();
  const pointer = useRef({ x: null, y: null });
  const fire = useRef(false);
  const touchStart = useRef(null);
  const [phase, setPhase] = useState("ready"); // ready | playing | over
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(() => best.get(`arcade-${item}`));
  const [result, setResult] = useState("");

  const begin = useCallback(() => {
    game.current = meta.make();
    game.current.reset();
    setScore(0);
    setResult("");
    setPhase("playing");
    sfx.beep(880, 0.08);
  }, [meta]);

  useEffect(() => {
    game.current = meta.make();
    game.current.reset();
    setPhase("ready");
    setRecord(best.get(`arcade-${item}`));
  }, [meta, item]);

  useEffect(() => {
    const g = canvas.current.getContext("2d");
    let raf;
    let prev = performance.now();
    const loop = (t) => {
      const dt = Math.min(0.033, (t - prev) / 1000);
      prev = t;
      const gm = game.current;
      if (gm && phase === "playing") {
        const k = keys.current;
        if (pressed(keys, "arrowup", "w")) gm.input("up");
        if (pressed(keys, "arrowdown", "s")) gm.input("down");
        if (pressed(keys, "arrowleft", "a")) gm.input("left");
        if (pressed(keys, "arrowright", "d")) gm.input("right");
        const inp = {
          dx: (pressed(keys, "arrowright", "d") ? 1 : 0) - (pressed(keys, "arrowleft", "a") ? 1 : 0),
          dy: (pressed(keys, "arrowdown", "s") ? 1 : 0) - (pressed(keys, "arrowup", "w") ? 1 : 0),
          pointerX: k.size ? null : pointer.current.x,
          pointerY: k.size ? null : pointer.current.y,
          fire: fire.current || k.has(" "),
        };
        fire.current = false;
        const ev = gm.step(dt, inp) || {};
        if (ev.bounce) sfx.beep(440, 0.03);
        if (ev.scored) {
          sfx.beep(990, 0.07);
          setScore(gm.score);
        }
        if (ev.over) {
          setScore(gm.score);
          setResult(ev.won ? "You win!" : "Game over");
          sfx.beep(ev.won ? 1200 : 180, 0.3);
          if (gm.score > best.get(`arcade-${item}`)) {
            best.set(`arcade-${item}`, gm.score);
            setRecord(gm.score);
          }
          setPhase("over");
        }
      }
      if (gm) gm.draw(g);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, item, keys]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === " " || e.key === "Enter") && phase !== "playing") {
        e.preventDefault();
        begin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, begin]);

  const toGame = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const onMove = (e) => {
    const p = toGame(e);
    pointer.current = p;
  };
  const onDown = (e) => {
    if (phase !== "playing") return begin();
    fire.current = true;
    touchStart.current = { x: e.clientX, y: e.clientY };
    pointer.current = toGame(e);
  };
  const onUp = (e) => {
    // swipe to steer Snake
    const s = touchStart.current;
    touchStart.current = null;
    if (!s || item !== 0 || !game.current) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    game.current.input(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };

  const size = portrait ? "min(88vw, 380px)" : "min(62vh, 460px)";
  return (
    <>
      <Backdrop className="bg-black/80" />
      <div className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center px-4 pt-16">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }} exit={{ opacity: 0 }} className="pointer-events-auto">
          <div className="mb-3 flex items-end justify-between font-mono text-white" style={{ width: size }}>
            <div>
              <div className="font-pixel text-2xl" style={{ color: meta.color, textShadow: `0 0 14px ${meta.color}` }}>{meta.name.toUpperCase()}</div>
              <div className="text-[11px] text-white/45">{meta.how}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">score · best</div>
              <div className="text-xl tabular-nums">{score} · {record}</div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border-[10px] border-[#111827] shadow-[0_0_60px_-10px_rgba(0,0,0,0.9)]" style={{ width: size, height: size, boxShadow: `0 0 50px -12px ${meta.color}` }}>
            <canvas ref={canvas} width={W} height={H} className="h-full w-full touch-none" onPointerMove={onMove} onPointerDown={onDown} onPointerUp={onUp} />
            <div aria-hidden className="crt-lines pointer-events-none absolute inset-0" />
            {phase !== "playing" && (
              <button onClick={begin} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 font-pixel text-white">
                {result && <span className="text-2xl" style={{ color: meta.color }}>{result}</span>}
                <span className="blink text-sm">{phase === "over" ? "PRESS SPACE / TAP TO PLAY AGAIN" : "PRESS SPACE / TAP TO START"}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ═════════════ Guestbook ═════════════ */

const headers = () => {
  const k = ownerKey();
  return { "Content-Type": "application/json", ...(k ? { "x-owner-key": k } : {}) };
};

export function GuestbookStage({ portrait }) {
  const [notes, setNotes] = useState([]);
  const [owner, setOwner] = useState(false);
  const [form, setForm] = useState({ name: "", message: "", website: "" });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/guestbook", { headers: headers(), cache: "no-store" });
      const d = await r.json();
      setNotes(d.notes || []);
      setOwner(Boolean(d.owner));
    } catch {}
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const r = await fetch("/api/guestbook", { method: "POST", headers: headers(), body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) setStatus(d.error || "Couldn't post that.");
      else {
        setStatus(d.pending ? "Thanks! Your note will go up once Nikshith approves it." : "Posted.");
        setForm({ name: "", message: "", website: "" });
        sfx.chime();
        load();
      }
    } catch {
      setStatus("Couldn't reach the guestbook. Try again in a bit.");
    }
    setBusy(false);
  };

  const moderate = async (id, action) => {
    const r = await fetch("/api/guestbook", { method: "POST", headers: headers(), body: JSON.stringify({ id, action }) });
    if (r.ok) load();
  };

  const pending = notes.filter((n) => n.approved === false);
  const shown = notes.filter((n) => n.approved !== false);
  return (
    <>
      <Backdrop className="bg-[radial-gradient(ellipse_at_center,rgba(30,20,10,0.5),rgba(5,5,10,0.9)_70%)]" />
      <div className="pointer-events-none fixed inset-0 z-40 flex justify-center overflow-y-auto px-4 pb-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          exit={{ opacity: 0 }}
          className={`pointer-events-auto flex h-fit gap-6 ${portrait ? "w-full flex-col" : "w-[min(1000px,94vw)]"}`}
        >
          {/* the wall of notes */}
          <div className="flex-1 rounded-2xl border-[10px] border-[#5a3a24] bg-[#7c5a3a] p-5 shadow-2xl">
            <h2 className="font-hand text-4xl text-[#fef3c7]">The rooftop guestbook</h2>
            {owner && pending.length > 0 && (
              <div className="mt-4 rounded-lg bg-black/30 p-3">
                <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-amber-200">{pending.length} waiting for approval</div>
                <div className="space-y-2">
                  {pending.map((n) => (
                    <div key={n.id} className="flex items-start justify-between gap-3 rounded bg-white/90 p-2 text-sm text-black">
                      <div><b>{n.name}</b>: {n.message}</div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => moderate(n.id, "approve")} aria-label="Approve" className="rounded bg-emerald-600 p-1.5 text-white"><Check size={14} /></button>
                        <button onClick={() => moderate(n.id, "delete")} aria-label="Delete" className="rounded bg-rose-600 p-1.5 text-white"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shown.length === 0 && <p className="col-span-full py-10 text-center font-hand text-2xl text-[#fef3c7]/70">No notes yet — be the first!</p>}
              {shown.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, rotate: ((i % 5) - 2) * 1.3, transition: { delay: 0.3 + i * 0.03 } }}
                  className="relative p-3 pt-5 shadow-[0_8px_16px_-8px_rgba(0,0,0,0.6)]"
                  style={{ background: n.color || "#fde68a" }}
                >
                  <span className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-red-600" />
                  <p className="font-hand text-xl leading-tight text-[#1c1917]">{n.message}</p>
                  <div className="mt-2 font-mono text-[10px] text-black/55">— {n.name}</div>
                  {owner && (
                    <button onClick={() => moderate(n.id, "delete")} aria-label="Delete note" className="absolute right-1 top-1 rounded p-0.5 text-black/40 hover:text-rose-700">
                      <X size={12} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          {/* write a note */}
          <form onSubmit={submit} className={`${portrait ? "" : "w-72"} h-fit rotate-1 bg-[#fde68a] p-5 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)]`}>
            <div className="font-hand text-3xl text-[#1c1917]">Leave a note</div>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={40}
              required
              placeholder="Your name"
              className="mt-3 w-full border-b border-black/30 bg-transparent px-1 py-1.5 font-hand text-xl text-[#1c1917] outline-none placeholder:text-black/40"
            />
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={280}
              required
              rows={4}
              placeholder="Say hi, share a thought, recommend a book…"
              className="mt-3 w-full resize-none bg-transparent px-1 font-hand text-xl leading-snug text-[#1c1917] outline-none placeholder:text-black/40"
            />
            <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[10px] text-black/45">{form.message.length}/280</span>
              <button disabled={busy} className="rounded-full bg-[#1c1917] px-4 py-2 text-sm text-[#fde68a] disabled:opacity-50">{busy ? "Pinning…" : "Pin it"}</button>
            </div>
            {status && <p className="mt-3 text-sm text-[#7c2d12]">{status}</p>}
            <p className="mt-3 text-[11px] leading-snug text-black/50">Notes appear after Nikshith reviews them.</p>
          </form>
        </motion.div>
      </div>
    </>
  );
}
