"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { profile, socials, education, certifications, music, photography } from "../../../lib/content";
import * as sfx from "../audio";
import { goToPanel } from "../store";
import Piano from "../Piano";
import ContactForm from "../../ContactForm";

// Dims the 3D scene behind a stage so the foreground reads, without hiding it.
function Backdrop({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`pointer-events-none fixed inset-0 z-30 ${className}`}
    />
  );
}

/* ── trophy case: a 3D carousel you can spin and flip ── */

export function TrophyCarousel({ portrait }) {
  const N = certifications.length;
  const [front, setFront] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const drag = useRef(null);
  const cardW = portrait ? 200 : 280;
  const cardH = Math.round(cardW * 1.3);
  const spread = cardW * (portrait ? 0.55 : 0.68);

  const turn = (d) => {
    setFlipped(false);
    setFront((v) => Math.max(0, Math.min(N - 1, v + d)));
    sfx.hover();
  };
  const turnRef = useRef(turn);
  turnRef.current = turn;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") turnRef.current(1);
      if (e.key === "ArrowLeft") turnRef.current(-1);
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const c = certifications[front];
  return (
    <>
      <Backdrop className="bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,200,120,0.12),rgba(5,5,10,0.78)_65%)]" />
      <div className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center pt-10">
        {/* cover-flow: the front card faces you, the rest fan out to either side */}
        <div
          className="pointer-events-auto relative touch-none select-none"
          style={{ width: cardW, height: cardH, perspective: 1600, transformStyle: "preserve-3d" }}
          onPointerDown={(e) => (drag.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = drag.current == null ? 0 : e.clientX - drag.current;
            drag.current = null;
            if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1);
          }}
        >
          {certifications.map((cert, i) => {
            const d = i - front;
            const dist = Math.abs(d);
            const isFront = d === 0;
            return (
              <motion.div
                key={cert.title}
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d", zIndex: N - dist }}
                initial={{ y: 420, rotateX: 40, opacity: 0 }}
                animate={{
                  x: d * spread,
                  y: 0,
                  z: -dist * 170,
                  rotateY: d === 0 ? 0 : d > 0 ? -42 : 42,
                  rotateX: 0,
                  opacity: dist > 3 ? 0 : 1,
                }}
                exit={{ y: 300, opacity: 0, transition: { duration: 0.25, delay: dist * 0.03 } }}
                transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0 }}
              >
                  <button
                    onClick={() => {
                      if (isFront) {
                        setFlipped((f) => !f);
                        sfx.blip(!flipped);
                      } else {
                        turn(d);
                      }
                    }}
                    aria-label={isFront ? `Flip ${cert.title}` : `Show ${cert.title}`}
                    className="relative block h-full w-full"
                    style={{
                      // no filter/opacity here: either would flatten the 3D and break the flip
                      transformStyle: "preserve-3d",
                      transform: `rotateY(${isFront && flipped ? 180 : 0}deg)`,
                      transition: "transform 0.7s cubic-bezier(.2,.8,.2,1)",
                    }}
                  >
                    {/* front: the certificate in a gilt frame on a little plaque */}
                    <div className="absolute inset-0 flex flex-col rounded-xl bg-gradient-to-br from-[#f7d784] via-[#b8892f] to-[#f2cf75] p-[7px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] [backface-visibility:hidden]">
                      <div className="relative flex-1 overflow-hidden rounded-md bg-white">
                        <Image src={cert.image} alt={`${cert.title} certificate`} fill sizes="300px" className="object-contain p-2" />
                        {isFront && <div className="shine-loop absolute inset-0" />}
                      </div>
                      <div className="mt-[7px] rounded-md bg-gradient-to-b from-[#2a2112] to-[#16110a] px-3 py-2 text-center">
                        <div className="truncate font-display text-[15px] italic text-[#f3d68b]">{cert.title}</div>
                      </div>
                      <div className="pointer-events-none absolute inset-0 rounded-xl bg-black transition-opacity duration-500" style={{ opacity: dist * 0.3 }} />
                    </div>
                    {/* back: engraved details */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl border-[3px] border-[#c9a24a] bg-[radial-gradient(ellipse_at_top,#2a2112,#0f0c07)] p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="text-4xl">🏆</div>
                      <div className="font-display text-2xl italic leading-tight text-[#f3d68b]">{cert.title}</div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-[#c9a24a]/80">{cert.issuer}</div>
                      <a
                        href={cert.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#c9a24a]/50 px-4 py-1.5 text-xs text-[#f3d68b] transition hover:bg-[#c9a24a]/15"
                      >
                        View full certificate <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto mt-16 flex flex-col items-center px-6 text-center sm:mt-24"
        >
          <div className="font-mono text-[11px] tracking-[0.3em] text-amber-200/60">
            {String(front + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={c.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              <div className="mt-1 font-display text-3xl italic text-white sm:text-4xl">{c.title}</div>
              <div className="mt-1 font-mono text-xs text-white/50">{c.issuer}</div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={() => turn(-1)} aria-label="Previous" className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-white/80 backdrop-blur transition hover:bg-white/10">←</button>
            <span className="font-mono text-[11px] text-white/40">{portrait ? "swipe · tap to flip" : "drag or ← → to browse · click to flip"}</span>
            <button onClick={() => turn(1)} aria-label="Next" className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-white/80 backdrop-blur transition hover:bg-white/10">→</button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ── bookshelf: each school is a book you can read page by page ── */

const SPINE = ["#3b1d8f", "#9a3412", "#065f46"];

// The closed book on the shelf: campus photo, school name, years.
function SchoolCover({ e, i, w }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-r-md rounded-l-sm bg-black" style={{ width: w }}>
      <Image src={e.photo} alt={`${e.school} campus`} fill sizes="320px" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
      <div className="absolute inset-y-0 left-0 w-3" style={{ background: SPINE[i % SPINE.length] }} />
      {w < 140 ? (
        // phone-sized cover: short name, no degree line
        <div className="absolute inset-x-0 bottom-0 p-2.5 pl-5 text-left text-white">
          <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/70">{e.years}</div>
          <div className="mt-1 font-display text-[18px] italic leading-[1.05]">{e.short ?? e.school}</div>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 p-5 pl-7 text-left text-white">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">{e.years}</div>
          <div className="mt-1 font-display text-[28px] italic leading-[1.05]">{e.school}</div>
          <div className="mt-2 text-xs leading-snug text-white/75">{e.degree}</div>
        </div>
      )}
    </div>
  );
}

function PhotoPage({ e }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <Image src={e.photo} alt={`${e.school} campus`} fill sizes="460px" className="object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-12">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/80">{e.place}</div>
        <div className="font-display text-xl italic text-white">{e.short} campus</div>
      </div>
    </div>
  );
}

function TitlePage({ e, chapter }) {
  return (
    <div className="flex h-full flex-col justify-center px-8 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8a6d3b]">Chapter {chapter}</div>
      <h3 className="mt-4 font-display text-[34px] italic leading-[1.05]">{e.school}</h3>
      <div className="mx-auto my-5 h-px w-16 bg-[#8a6d3b]/50" />
      <p className="text-[15px] leading-snug text-[#3b2f22]">{e.degree}</p>
      <p className="mt-1 text-[13px] text-[#6b5a44]">{e.focus}</p>
      <div className="mt-6 font-hand text-2xl text-[#7c2d12]">{e.years}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#8a6d3b]">{e.place}</div>
    </div>
  );
}

function ContentPage({ page }) {
  return (
    <div className="flex h-full flex-col px-7 py-7">
      <h4 className="font-hand text-[34px] leading-none text-[#7c2d12]">{page.heading}</h4>
      <div className="mt-2 h-px bg-[#c9b994]" />
      {page.items && (
        <ul className="mt-5 space-y-5">
          {page.items.map((it) => (
            <li key={it.title}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[22px] italic leading-tight">{it.title}</span>
                {it.meta && <span className="shrink-0 text-right font-mono text-[10px] text-[#8a6d3b]">{it.meta}</span>}
              </div>
              {it.text && <p className="mt-1 text-[14.5px] leading-snug text-[#4a3b2a]">{it.text}</p>}
            </li>
          ))}
        </ul>
      )}
      {page.tags && (
        <div className="mt-5 flex flex-wrap gap-2">
          {page.tags.map((t, k) => (
            <span key={t} className="rounded-sm border border-dashed border-[#a8916a] bg-[#fbf6ea] px-2.5 py-1 font-mono text-[11px] text-[#5a4630]" style={{ transform: `rotate(${(k % 3) - 1}deg)` }}>
              {t}
            </span>
          ))}
        </div>
      )}
      {page.photos && (
        <div className="mt-4 flex flex-1 flex-col gap-3">
          <div className="grid flex-1 grid-cols-2 gap-3">
            {page.photos.map((src, k) => (
              <div key={src} className="relative min-h-[120px] bg-white p-1.5 pb-5 shadow-md" style={{ transform: `rotate(${k ? 2 : -2}deg)` }}>
                <div className="relative h-full w-full overflow-hidden">
                  <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                </div>
              </div>
            ))}
          </div>
          {page.caption && <p className="font-hand text-xl leading-snug text-[#5a4630]">{page.caption}</p>}
        </div>
      )}
      {page.cta === "contact" && (
        <button onClick={() => goToPanel("contact")} className="mt-auto self-start rounded-full bg-[#7c2d12] px-4 py-2 text-sm text-[#fbf6ea] shadow-[0_2px_0_#4a1a0a] transition hover:bg-[#9a3412]">
          Write me a letter ✉
        </button>
      )}
    </div>
  );
}

// Every page of a school's book, in reading order.
function bookPages(e, chapter) {
  return [
    { key: "photo", el: <PhotoPage e={e} />, bleed: true },
    { key: "title", el: <TitlePage e={e} chapter={chapter} /> },
    ...e.pages.map((pg) => ({ key: pg.heading, el: <ContentPage page={pg} /> })),
  ];
}

export function Bookshelf({ portrait }) {
  const [sel, setSel] = useState(null);
  // three covers side by side always fit the screen (12px gaps, 12px gutters)
  const coverW = portrait ? Math.min(150, Math.floor((window.innerWidth - 48) / 3)) : 230;
  const pick = (i) => {
    setSel(i);
    sfx.rustle();
  };

  return (
    <>
      <Backdrop className="bg-[radial-gradient(ellipse_at_center,rgba(10,8,20,0.25),rgba(5,5,10,0.78)_75%)]" />
      <div className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center px-3 pt-16">
        <AnimatePresence mode="wait">
          {sel === null ? (
            <motion.div key="row" className="pointer-events-auto flex flex-col items-center" exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}>
              <div className={`flex items-end ${portrait ? "gap-3" : "gap-8"}`}>
                {education.map((e, i) => (
                  <motion.button
                    key={e.school}
                    onClick={() => pick(i)}
                    initial={{ opacity: 0, y: 140, rotate: i % 2 ? 6 : -6 }}
                    animate={{ opacity: 1, y: 0, rotate: 0, transition: { delay: 0.25 + i * 0.12, type: "spring", stiffness: 160, damping: 18 } }}
                    whileHover={{ y: -16, rotate: i % 2 ? 1.5 : -1.5 }}
                    className="shadow-[0_30px_50px_-18px_rgba(0,0,0,0.95)]"
                    style={{ width: coverW, height: Math.round(coverW * 1.4) }}
                    aria-label={`Open ${e.school}`}
                  >
                    <SchoolCover e={e} i={i} w={coverW} />
                  </motion.button>
                ))}
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }} className="mt-8 font-mono text-xs text-white/60">
                pick a book off the shelf
              </motion.p>
            </motion.div>
          ) : (
            <OpenBook key={sel} e={education[sel]} i={sel} portrait={portrait} onSwitch={pick} onClose={() => setSel(null)} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function OpenBook({ e, i, portrait, onSwitch, onClose }) {
  const pages = bookPages(e, education.length - i);
  const per = portrait ? 1 : 2; // pages visible at once
  const spreads = [];
  for (let k = 0; k < pages.length; k += per) spreads.push(pages.slice(k, k + per));
  const [at, setAt] = useState(0);
  const [turn, setTurn] = useState(null); // { dir: 1 | -1 }
  const swipe = useRef(null);

  const W = portrait ? "min(86vw, 360px)" : "min(440px, 42vw)";
  const H = portrait ? "min(118vw, 500px)" : "min(570px, 62vh)";
  const paper = "relative h-full overflow-hidden bg-[#f6efdf] text-[#2a2118]";

  const go = (dir) => {
    if (turn) return;
    const next = at + dir;
    if (next < 0 || next >= spreads.length) return;
    sfx.rustle();
    setTurn({ dir });
  };
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => {
    const onKey = (ev) => {
      const k = ev.key.toLowerCase();
      if (k === "arrowright" || k === "d") goRef.current(1);
      if (k === "arrowleft" || k === "a") goRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const finish = () => {
    setAt((v) => v + turn.dir);
    setTurn(null);
  };

  const cur = spreads[at];
  const nxt = turn ? spreads[at + turn.dir] : null;
  const pageBox = (pg, side) =>
    pg ? (
      <div className={`${paper} ${side === "L" ? "rounded-l-md" : "rounded-r-md"}`}>
        {pg.el}
        {!pg.bleed && <div className={`pointer-events-none absolute inset-y-0 w-8 ${side === "L" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/12 to-transparent`} />}
      </div>
    ) : (
      <div className={`${paper} ${side === "L" ? "rounded-l-md" : "rounded-r-md"}`} />
    );

  // what lies under the turning leaf
  const under = !turn ? cur : per === 1 ? nxt : turn.dir > 0 ? [cur[0], nxt[1]] : [nxt[0], cur[1]];
  // the leaf: front is the page being lifted, back is the page it reveals
  const leafFront = turn && (per === 1 ? cur[0] : turn.dir > 0 ? cur[1] : cur[0]);
  const leafBack = turn && (per === 1 ? nxt[0] : turn.dir > 0 ? nxt[0] : nxt[1]);
  const leafOnRight = per === 1 || (turn && turn.dir > 0);

  return (
    <motion.div
      className="pointer-events-auto flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.88, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
    >
      <div
        className="relative flex touch-pan-y shadow-[0_50px_80px_-30px_rgba(0,0,0,0.95)]"
        style={{ height: H, perspective: 2200 }}
        onPointerDown={(ev) => (swipe.current = ev.clientX)}
        onPointerUp={(ev) => {
          const dx = swipe.current == null ? 0 : ev.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* the hardback cover peeking out behind the pages */}
        <div className="absolute -inset-2.5 rounded-lg" style={{ background: SPINE[i % SPINE.length] }} />
        {Array.from({ length: per }, (_, k) => (
          <div key={k} className="relative" style={{ width: W }}>
            {pageBox(under?.[k], per === 1 ? "R" : k === 0 ? "L" : "R")}
          </div>
        ))}
        {per === 2 && <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/25" />}

        {turn && (
          <motion.div
            key={`${at}-${turn.dir}`}
            className="absolute inset-y-0"
            style={{
              width: W,
              left: leafOnRight ? (per === 1 ? 0 : "50%") : 0,
              transformOrigin: leafOnRight ? (per === 1 ? "left center" : "left center") : "right center",
              transformStyle: "preserve-3d",
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: leafOnRight ? -180 : 180 }}
            transition={{ duration: 0.75, ease: [0.45, 0.05, 0.25, 1] }}
            onAnimationComplete={finish}
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">{pageBox(leafFront, leafOnRight ? "R" : "L")}</div>
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{pageBox(leafBack, leafOnRight ? "L" : "R")}</div>
          </motion.div>
        )}
      </div>

      {/* controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => go(-1)} disabled={at === 0} aria-label="Previous page" className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-white/85 backdrop-blur transition hover:bg-white/10 disabled:opacity-30">←</button>
        <span className="min-w-[110px] text-center font-mono text-[11px] text-white/60">
          {portrait ? `page ${at + 1} of ${spreads.length}` : `pages ${at * 2 + 1}–${Math.min(at * 2 + 2, pages.length)} of ${pages.length}`}
        </span>
        <button onClick={() => go(1)} disabled={at === spreads.length - 1} aria-label="Next page" className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-white/85 backdrop-blur transition hover:bg-white/10 disabled:opacity-30">→</button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {education.map((ed, k) => (
          <button
            key={ed.school}
            onClick={() => k !== i && onSwitch(k)}
            className={`rounded-full px-3 py-1 text-xs transition ${k === i ? "bg-white text-black" : "border border-white/20 text-white/65 hover:text-white"}`}
          >
            {ed.short}
          </button>
        ))}
        <button onClick={onClose} className="ml-2 font-mono text-[11px] text-white/50 underline-offset-4 hover:text-white hover:underline">back to shelf</button>
      </div>
      {!portrait && <div className="mt-2 font-mono text-[10px] text-white/35">← → or A D to turn pages</div>}
    </motion.div>
  );
}

/* ── piano: keyboard rises, sheet music drops in ───── */

export function PianoStage({ portrait }) {
  return (
    <>
      <Backdrop className="bg-gradient-to-b from-transparent via-transparent to-black/70" />
      <motion.div
        initial={{ opacity: 0, y: -40, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5, transition: { delay: 0.35, type: "spring", stiffness: 140, damping: 16 } }}
        exit={{ opacity: 0, y: -30 }}
        className={`pointer-events-auto fixed left-1/2 z-40 w-[min(500px,90vw)] -translate-x-1/2 ${portrait ? "top-[100px]" : "top-[110px]"}`}
      >
        <div className="relative overflow-hidden rounded-sm bg-[#f7f1e3] px-7 py-6 text-[#2a2118] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
          <div aria-hidden className="staff pointer-events-none absolute inset-x-6 top-[88px] h-[42px]" />
          <div className="flex items-baseline justify-between font-mono text-[10px] text-[#8a6d3b]">
            <span>♩ {music.latest.subtitle ?? "now playing"}</span>
            <span>new single</span>
          </div>
          <h2 className="mt-1 font-hand text-[44px] leading-none">{music.latest.title}</h2>
          <div className="mt-[54px] flex items-center gap-2 font-mono text-[11px] text-[#5a4630]">
            <span className="eq eq-dark" aria-hidden><i /><i /><i /><i /></span>
            released {music.latest.released} · {music.latest.length}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-hand text-2xl">
            <a href={music.studio} target="_blank" rel="noopener noreferrer" className="text-[#6d28d9] underline decoration-wavy decoration-[#6d28d9]/40 underline-offset-4 hover:decoration-[#6d28d9]">listen on my studio ↗</a>
            <a href={music.latest.video ?? music.youtube} target="_blank" rel="noopener noreferrer" className="text-[#b91c1c] underline decoration-wavy decoration-[#b91c1c]/40 underline-offset-4 hover:decoration-[#b91c1c]">watch the video ↗</a>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ y: "110%" }}
        animate={{ y: 0, transition: { delay: 0.2, type: "spring", stiffness: 120, damping: 20 } }}
        exit={{ y: "110%", transition: { duration: 0.3 } }}
        className="pointer-events-auto fixed bottom-0 left-1/2 z-40 w-[min(920px,100vw)] -translate-x-1/2 rounded-t-2xl border border-b-0 border-white/10 bg-[#0e0e14]/95 px-3 pb-4 pt-3 backdrop-blur-xl sm:px-5"
      >
        <Piano tall={!portrait} />
      </motion.div>
    </>
  );
}

/* ── camera: look through the viewfinder ───────────── */

const SHOTS = photography.photos;

function Shot({ s, className = "", sizes = "640px" }) {
  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <Image src={s.src} alt={s.title} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

export function Viewfinder({ portrait }) {
  const r = useMotionValue(0);
  const mask = useMotionTemplate`radial-gradient(circle at 50% 50%, transparent ${r}%, black calc(${r}% + 0.6%))`;
  const [sel, setSel] = useState(0);
  const [flash, setFlash] = useState(0);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    sfx.shutter();
    const a = animate(r, 140, { duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.15 });
    const t = setInterval(() => setSecs((v) => v + 1), 1000);
    return () => { a.stop(); clearInterval(t); };
  }, [r]);

  const take = (i) => {
    sfx.shutter();
    setSel(i);
    setFlash((f) => f + 1);
  };
  const step = (d) => take((sel + d + SHOTS.length) % SHOTS.length);
  const stepRef = useRef(step);
  stepRef.current = step;
  const swipe = useRef(null);

  // ← → / A D flip through the photos, like the trophy case
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowright" || k === "d") stepRef.current(1);
      if (k === "arrowleft" || k === "a") stepRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* iris opening */}
      <motion.div className="pointer-events-none fixed inset-0 z-[44] bg-black" style={{ WebkitMaskImage: mask, maskImage: mask }} exit={{ opacity: 0 }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_30%,rgba(0,0,0,0.92)_85%)]" />
      <AnimatePresence>
        {flash > 0 && (
          // a soft blink when you switch photos, not a full-screen flash
          <motion.div key={flash} className="pointer-events-none fixed inset-0 z-[46] bg-white" initial={{ opacity: 0.16 }} animate={{ opacity: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.8 } }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-[43] font-mono text-[11px] text-white/80">
        {/* frame corners */}
        {["left-4 top-24 border-l-2 border-t-2", "right-4 top-24 border-r-2 border-t-2", "bottom-4 left-4 border-b-2 border-l-2", "bottom-4 right-4 border-b-2 border-r-2"].map((c) => (
          <span key={c} className={`absolute h-8 w-8 border-white/70 ${c}`} />
        ))}
        <div className="absolute left-8 top-28 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> REC {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
        </div>
        <div className="absolute right-8 top-28 flex items-center gap-1.5">
          <span className="relative h-3 w-6 rounded-sm border border-white/70 after:absolute after:-right-1 after:top-0.5 after:h-1.5 after:w-0.5 after:bg-white/70"><span className="absolute inset-0.5 w-3/4 bg-emerald-400" /></span>
        </div>
        <div className="absolute bottom-8 left-8 hidden gap-5 sm:flex">
          <span>ISO 800</span><span>ƒ/1.8</span><span>1/60</span><span className="text-emerald-300">AF ●</span>
        </div>
        <div className="absolute bottom-8 right-8 hidden sm:block">35mm · RAW</div>
      </motion.div>

      <div className="pointer-events-none fixed inset-0 z-[45] flex flex-col items-center justify-center px-4 pt-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.9 } }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto relative w-[min(330px,62vw,40vh)] touch-pan-y"
          onPointerDown={(e) => (swipe.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = swipe.current == null ? 0 : e.clientX - swipe.current;
            swipe.current = null;
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
          }}
        >
          {[-1, 1].map((d) => (
            <button
              key={d}
              onClick={() => step(d)}
              aria-label={d < 0 ? "Previous photo" : "Next photo"}
              className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-lg text-white/85 backdrop-blur transition hover:bg-white/15 ${d < 0 ? "-left-14" : "-right-14"}`}
            >
              {d < 0 ? "←" : "→"}
            </button>
          ))}
          <AnimatePresence mode="wait">
            <motion.div key={sel} initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Shot s={SHOTS[sel]} className="aspect-[3/4] w-full rounded-sm" sizes="420px" />
            </motion.div>
          </AnimatePresence>
          {/* focus brackets */}
          <div className="pointer-events-none absolute inset-[18%_30%] border border-emerald-300/0">
            {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((c) => (
              <span key={c} className={`absolute h-4 w-4 border-emerald-300 ${c}`} />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-white/60">
            <span>{SHOTS[sel].title}</span>
            <span className="hidden text-white/35 sm:inline">← → or A D</span>
            <span>{String(sel + 1).padStart(3, "0")} / {String(SHOTS.length).padStart(3, "0")}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 1.05 } }}
          exit={{ opacity: 0 }}
          className="pointer-events-auto mt-5 flex gap-2 rounded-md bg-black/60 p-2 ring-1 ring-white/10"
        >
          {SHOTS.map((s, i) => (
            <button key={s.src} onClick={() => take(i)} aria-label={s.title} className={`overflow-hidden rounded-sm ring-2 transition ${i === sel ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100"}`}>
              <Shot s={s} className={portrait ? "h-12 w-9" : "h-16 w-12"} sizes="64px" />
            </button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.2 } }} exit={{ opacity: 0 }} className="pointer-events-auto mt-5 flex flex-col items-center gap-3 text-center">
          <p className="max-w-md text-sm text-white/70">Skies, birds, and whatever the light is doing around Melbourne. More on Instagram.</p>
          <a href={photography.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-violet-100">
            See {photography.handle} <ArrowUpRight size={14} />
          </a>
        </motion.div>
      </div>
    </>
  );
}

/* ── front door: an envelope arrives and the letter slides out ── */

export function Letter({ portrait }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    sfx.rustle();
    const tick = () => setTime(new Date().toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: profile.timezone }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Backdrop className="bg-[radial-gradient(ellipse_at_20%_60%,rgba(255,190,120,0.18),rgba(5,5,10,0.75)_60%)]" />
      {/* envelope: rises, flap opens, then drops away once the letter is out */}
      <motion.div
        className="pointer-events-none fixed bottom-[6vh] left-1/2 z-40 w-[min(500px,92vw)] -translate-x-1/2"
        style={{ aspectRatio: "1.6 / 1", perspective: 900 }}
        initial={{ y: "130%" }}
        animate={{ y: ["130%", "0%", "0%", "260%"], transition: { duration: 2.3, times: [0, 0.22, 0.62, 1], ease: "easeInOut" } }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 rounded-md bg-[#d9c7a3] shadow-2xl" />
        <motion.div
          className="absolute inset-x-0 top-0 h-[58%] origin-top"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "#cdb88f", transformStyle: "preserve-3d" }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: 180, transition: { delay: 0.55, duration: 0.45 } }}
        />
        <div className="absolute inset-0 rounded-md" style={{ clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)", background: "linear-gradient(180deg,#e6d6b6,#d6c29c)" }} />
        <div className="absolute bottom-[18%] left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-[#9a1f1f] shadow-inner ring-2 ring-[#7a1515]" />
      </motion.div>

      {/* the letter itself */}
      <motion.div
        className="pointer-events-auto fixed left-1/2 z-[41] w-[min(560px,94vw)] -translate-x-1/2"
        style={{ top: portrait ? 96 : 92 }}
        initial={{ y: "70vh", opacity: 0, rotate: 2 }}
        animate={{ y: 0, opacity: 1, rotate: -0.6, transition: { delay: 1.0, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] } }}
        exit={{ y: "60vh", opacity: 0, transition: { duration: 0.35 } }}
      >
        <div className="paper relative max-h-[calc(100vh-120px)] overflow-y-auto rounded-sm px-7 pb-7 pt-8 text-[#2a2118] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] sm:px-10">
          {/* postmark */}
          <div className="absolute right-5 top-5 flex h-20 w-20 rotate-12 flex-col items-center justify-center rounded-full border-2 border-[#9a3412]/50 text-center font-mono text-[8px] uppercase leading-tight tracking-wider text-[#9a3412]/70">
            <span>Melbourne</span>
            <span className="my-0.5 text-[11px] font-bold">{time || "—"}</span>
            <span>VIC · AU</span>
          </div>
          <p className="font-hand text-[34px] leading-none">Dear Nikshith,</p>
          <div className="mt-5 pr-0 sm:pr-16">
            <ContactForm tone="paper" />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-[#4a3b2a]">
            {profile.status} Prefer email? <a href={`mailto:${profile.email}`} className="underline decoration-[#b45309]/50 underline-offset-4">{profile.email}</a>
          </p>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-dashed border-[#c9b994] pt-4">
            {socials.map((s, i) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border-2 border-dotted border-[#a8916a] bg-[#fbf6ea] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#7c2d12] transition hover:-rotate-2 hover:bg-white"
                style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
