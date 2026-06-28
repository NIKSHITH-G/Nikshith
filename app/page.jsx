"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Compass, Ghost, NotebookText, Send, Library, Snowflake, Camera, BookOpen } from "lucide-react";
import Navbar from "../components/Navbar";
import InteractiveMeshGrid from "../components/InteractiveMeshGrid";

/* -------------------------
   MicroTerminal
------------------------- */
function MicroTerminal({
  lines = ["git push origin main", "deploy: succeeded (maybe)", "running experiments..."],
  whoami = "Nikshith — someone who learns by building and breaking things",
  onExpand = null,
  paused = false,
}) {
  const [display, setDisplay] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showWhoami, setShowWhoami] = useState(false);
  const raf = useRef(null);

  const effectivePaused = paused || isPaused;

  useEffect(() => {
    if (effectivePaused) return;
    const current = showWhoami ? whoami : lines[lineIdx];
    if (!isDeleting && charIdx <= current.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 36 + Math.random() * 36);
      setDisplay(current.slice(0, charIdx));
      return () => clearTimeout(t);
    }
    if (!isDeleting && charIdx > current.length) {
      const t = setTimeout(() => setIsDeleting(true), 900 + Math.random() * 600);
      return () => clearTimeout(t);
    }
    if (isDeleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx((c) => c - 1), 20 + Math.random() * 28);
      setDisplay(current.slice(0, charIdx));
      return () => clearTimeout(t);
    }
    if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setLineIdx((i) => (i + 1) % lines.length);
    }
  }, [charIdx, isDeleting, lineIdx, effectivePaused, showWhoami, lines, whoami]);

  const handleClick = () => {
    if (typeof onExpand === "function") {
      onExpand();
      setShowWhoami(true);
      setIsDeleting(false);
      setCharIdx(0);
      if (raf.current) clearTimeout(raf.current);
      raf.current = setTimeout(() => { setShowWhoami(false); setCharIdx(0); }, 2200);
      return;
    }
    setShowWhoami(true);
    setIsDeleting(false);
    setCharIdx(0);
    if (raf.current) clearTimeout(raf.current);
    raf.current = setTimeout(() => { setShowWhoami(false); setCharIdx(0); }, 4200);
  };

  return (
    <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="w-full sm:w-auto rounded-lg bg-[rgba(0,0,0,0.8)] border border-white/8 px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono flex items-center gap-2 sm:gap-3 hover:scale-[1.01] active:scale-[0.99] transition-transform transition-colors"
        aria-label="Terminal — click to open"
      >
        <span className="text-green-300 select-none flex-shrink-0">$</span>
        <span className="select-text flex-1 overflow-hidden text-ellipsis whitespace-nowrap" aria-live="polite" style={{ minWidth: "140px" }}>{display}</span>
        <span className="ml-1 animate-blink flex-shrink-0">|</span>
      </button>
      <div className="text-xs sm:text-sm text-foreground/60 pl-1 sm:pl-0">Deployed something, Probably works.</div>
    </div>
  );
}

/* -------------------------
   ExpandedTerminalPanel
------------------------- */
function ExpandedTerminalPanel({ open, onClose, logs = [], whoami = "" }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 md:p-12" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-2xl p-4 sm:p-6 bg-[#06050a]/95 border border-white/8 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backdropFilter: "blur(8px)" }}>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="text-xs sm:text-sm text-foreground/60">Interactive terminal — test commands</div>
            <button onClick={onClose} className="flex-shrink-0 rounded-md bg-white/6 px-3 py-2 text-xs sm:text-sm hover:bg-white/8 active:scale-[0.98] transition" aria-label="Close terminal">Close</button>
          </div>
          
          <div className="bg-black/70 rounded-md p-3 sm:p-4 font-mono text-xs sm:text-sm text-green-200 overflow-x-auto">
            {logs.map((l, i) => (
              <div key={i} className="mb-2">
                <span className="text-green-300 mr-2">$</span>
                <span className="break-all">{l.cmd}</span>
                <div className="text-foreground/60 ml-4 sm:ml-6 mt-1 break-all">{l.out}</div>
              </div>
            ))}
            <div className="mt-2 border-t border-white/6 pt-2 text-foreground/80">
              <strong>whoami</strong>: <span className="break-words">{whoami}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   Home
------------------------- */
export default function Home() {
  const rotatingChips = [
    { dot: "bg-blue-400", text: "Learning how learning works" },
    { dot: "bg-green-400", text: "Master of Artificial Intelligence at Monash" },
    { dot: "bg-violet-400", text: "Studying the shape of ideas I'll encounter next." },
  ];
  const [chipIdx, setChipIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setChipIdx((i) => (i + 1) % rotatingChips.length), 4500);
    return () => clearInterval(id);
  }, []);

  const INSTAGRAM_URL = "https://www.instagram.com/enigma_view/";

  const books = [
    { title: "The Mistborn Trilogy", author: "Brandon Sanderson" },
    { title: "Die With Zero", author: "Bill Perkins" },
    { title: "The Psychology of Money", author: "Morgan Housel" },
    { title: "Zero to One", author: "Peter Thiel" },
  ];

  const apps = [
    { name: "Arc", role: "Browser", icon: Compass },
    { name: "Ghostty", role: "Terminal", icon: Ghost },
    { name: "Notion", role: "Notes & docs", icon: NotebookText },
    { name: "Blip", role: "File transfer", icon: Send },
    { name: "Shelf", role: "Drag & drop stash", icon: Library },
    { name: "Ice", role: "Menu bar", icon: Snowflake },
  ];

  // Cursor-following spotlight for the "off the clock" cards.
  const handleSpotlight = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const heroSub = "Poke around — everything here is a work in progress.";
  const heroRef = useRef(null);
  const cardRef = useRef(null);
  const raf = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const scrollY = useRef(0);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    
    // Disable parallax on mobile/tablet
    const isMobile = window.matchMedia("(max-width: 1024px)").matches;
    if (isMobile) return;
    
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function onMouse(e) {
      const rect = hero.getBoundingClientRect();
      mouse.current.x = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      mouse.current.y = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      queueFrame();
    }
    function onLeave() { mouse.current.x = 0; mouse.current.y = 0; queueFrame(); }
    function onScroll() { scrollY.current = window.scrollY || window.pageYOffset; queueFrame(); }
    function updateFrame() {
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const s = Math.min(1, scrollY.current / 900);
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${clamp(-mx * 8, -12, 12)}px, ${clamp(-my * 5, -8, 8 - s * 4)}px, 0)`;
      }
      raf.current = null;
    }
    function queueFrame() { if (raf.current == null) raf.current = requestAnimationFrame(updateFrame); }
    hero.addEventListener("mousemove", onMouse);
    hero.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    queueFrame();
    return () => {
      hero.removeEventListener("mousemove", onMouse);
      hero.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLogs] = useState([
    { cmd: "npm run build", out: "build succeeded in 3.1s" },
    { cmd: "git push origin main", out: "pushed to origin/main" },
    { cmd: "deploy", out: "deployment started — rolling out" },
  ]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Navbar />

      <InteractiveMeshGrid
        spacing={84}
        density={0.72}
        lineColor="rgba(255,255,255,0.02)"
        pointColor="rgba(168,85,247,0.95)"
        pointSize={1.6}
        warp={0.14}
        pointerSmoothing={0.16}
        spring={0.08}
        damping={0.88}
        disableBelow={420}
        maxPoints={1200}
      />

      <main className="relative z-10 text-foreground">
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-10">
          <div
            ref={heroRef}
            className="relative overflow-visible rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8"
            style={{
              background: "linear-gradient(180deg, rgba(8,6,20,0.72) 0%, rgba(10,4,26,0.66) 40%, rgba(18,6,40,0.62) 100%)",
              border: "1px solid rgba(255,255,255,0.03)",
            }}
          >
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(900px 360px at 88% 78%, rgba(124,58,237,0.06), transparent 10%), radial-gradient(700px 300px at 18% 10%, rgba(56,34,110,0.04), transparent 12%)", mixBlendMode: "overlay" }} />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
              {/* LEFT: portrait - now stacks on top on mobile */}
              <div className="md:col-span-5 flex justify-center md:justify-start items-center order-1 md:order-none">
                <div className="relative w-[280px] h-[380px] sm:w-[340px] sm:h-[480px] md:w-[380px] md:h-[560px] lg:w-[420px] lg:h-[620px] select-none md:mt-[-32px]">
                  <div className="absolute left-0 top-0 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] sm:shadow-[0_30px_90px_-50px_rgba(0,0,0,0.85)]" style={{ transformOrigin: "50% 40%" }}>
                    <Image src="/images/Profile/Profile.png" alt="Nikshith profile" fill className="object-cover" style={{ objectPosition: "30% 12%" }} priority />
                  </div>
                </div>
              </div>

              {/* RIGHT: frosted card - now below image on mobile */}
              <div className="md:col-span-7 flex items-center justify-center md:justify-end order-2 md:order-none">
                <div ref={cardRef} className="w-full md:max-w-[820px] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-7 md:pt-9 bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/5 transform transition will-change-transform">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                          I'm Nikshith, I build things, break things, fix things.
                        </span>
                      </h1>
                      <p className="mt-3 sm:mt-4 md:mt-6 text-sm sm:text-base md:text-lg text-foreground/70 max-w-[64ch]">{heroSub}</p>
                    </div>

                    <div className="mt-2 sm:mt-3 space-y-2">
                      <div className="relative w-full max-w-[420px] h-auto min-h-[40px]">
                        {rotatingChips.map((c, i) => (
                          <div key={i} className="absolute left-0 top-0 w-full rounded-md px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-foreground/90 transition-opacity duration-500 ease-out" style={{ opacity: i === chipIdx ? 1 : 0, visibility: i === chipIdx ? "visible" : "hidden" }}>
                            <span className={`inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${c.dot}`} />
                            <span className="break-words">{c.text}</span>
                          </div>
                        ))}
                      </div>

                      <MicroTerminal
                        lines={["git push origin main", "deploy: succeeded (maybe)", "running experiments..."]}
                        whoami="Nikshith — part engineer, part detective, full-time : why is this happening"
                        onExpand={() => setTerminalOpen(true)}
                        paused={terminalOpen}
                      />
                    </div>

                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                      <Link
                        href="/contact"
                        className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_34px_-10px_rgba(99,102,241,0.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_44px_-10px_rgba(99,102,241,0.9)]"
                      >
                        Let&apos;s talk
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </Link>
                      <a
                        href="/resume.pdf"
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-foreground/90 transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
                      >
                        Download CV
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DAILY DRIVERS — apps */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-12 pb-2">
          <div className="mb-6 sm:mb-8">
            <div className="font-mono text-xs sm:text-sm text-emerald-300/80">// daily drivers</div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Tools I reach for</h2>
            <p className="mt-1.5 text-sm text-foreground/50">The apps always open on my machine.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {apps.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.name}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-foreground/65 transition-colors group-hover:border-indigo-400/40 group-hover:text-indigo-300">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground/90">{app.name}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-foreground/40">{app.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* OFF THE CLOCK — photography + reading */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-12 pb-2">
          <div className="mb-6 sm:mb-8">
            <div className="font-mono text-xs sm:text-sm text-emerald-300/80">// off the clock</div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Beyond the code</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Photography */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onMouseMove={handleSpotlight}
              className="group relative flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 transition-all hover:-translate-y-1 hover:border-indigo-500/40"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(99,102,241,0.18), transparent 60%)" }}
              />
              <div className="relative z-10 flex flex-1 flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-indigo-300 transition-colors group-hover:border-indigo-400/40">
                  <Camera className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-semibold tracking-tight">Photography</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  When I&apos;m not shipping code, I&apos;m chasing light — the frames I&apos;m
                  proud of live on Instagram.
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-mono text-xs text-indigo-300">
                  @enigma_view
                  <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                </span>
              </div>
            </a>

            {/* Reading */}
            <div
              onMouseMove={handleSpotlight}
              className="group relative flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 transition-colors hover:border-indigo-500/40"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(99,102,241,0.18), transparent 60%)" }}
              />
              <div className="relative z-10 flex flex-1 flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-indigo-300 transition-colors group-hover:border-indigo-400/40">
                  <BookOpen className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-semibold tracking-tight">Reading</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  Always mid-book on my Kindle — fantasy worlds and ideas that rewire how I think.
                </p>
                <ul className="mt-4 space-y-2">
                  {books.map((b) => (
                    <li
                      key={b.title}
                      className="group/book flex flex-wrap items-baseline gap-x-2 transition-transform duration-200 hover:translate-x-1"
                    >
                      <span className="text-indigo-400/60 transition-colors group-hover/book:text-indigo-300">→</span>
                      <span className="text-sm text-foreground/85 transition-colors group-hover/book:text-white">{b.title}</span>
                      <span className="font-mono text-[11px] text-foreground/40">{b.author}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mx-auto max-w-7xl px-4 sm:px-6 pb-8 sm:pb-12 pt-6 sm:pt-10 text-xs sm:text-sm text-foreground/70">
          <div className="pt-4 sm:pt-6 border-t border-white/6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
              <div>© {new Date().getFullYear()} Nikshith — Built with ❤️</div>
              <div className="flex items-center gap-3 sm:gap-4">
                <a href="/about" className="underline hover:text-foreground/90 transition-colors">About</a>
                <a href="/contact" className="underline hover:text-foreground/90 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <ExpandedTerminalPanel
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        logs={terminalLogs}
        whoami="Nikshith — part engineer, part detective, full-time : why is this happening"
      />

      <style jsx>{`
        .animate-blink { animation: blink 1s steps(2, start) infinite; }
        @keyframes blink { to { visibility: hidden; } }
        @media (prefers-reduced-motion: reduce) {
          .transition, .transition-transform { transition: none !important; }
          .animate-blink { animation: none; }
        }
      `}</style>
    </>
  );
}