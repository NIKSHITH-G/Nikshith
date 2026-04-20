"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import GitHubContributions from "../components/GitHubContributions";
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
   GitHubStatsRow
------------------------- */
function GitHubStatsRow({ username = "NIKSHITH-G" }) {
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/github");
        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        setStats(data.stats);
        setRepos(data.repos);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statItems = stats
    ? [
        { label: "Repositories", value: stats.publicRepos },
        { label: "Followers", value: stats.followers },
        { label: "Stars earned", value: stats.totalStars },
      ]
    : [];

  return (
  <>
    {loading ? (
      <div className="text-white/30 text-xs sm:text-sm">Loading...</div>
    ) : error ? (
      <div className="text-white/30 text-xs sm:text-sm">GitHub stats unavailable</div>
    ) : (
      statItems.map((s) => (
        <div
          key={s.label}
          className="px-2 sm:px-3 py-1 bg-white/5 rounded-full text-xs sm:text-sm whitespace-nowrap"
        >
          {s.value} {s.label}
        </div>
      ))
    )}
  </>
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

                    <div className="mt-4 sm:mt-6 flex justify-start sm:justify-end">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-foreground/60">
                        <a href="/resume.pdf" download target="_blank" rel="noopener noreferrer" className="hover:text-foreground/90 hover:underline underline-offset-4 transition-colors">Download CV</a>
                        <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-foreground/40" />
                        <Link href="/contact" className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 hover:underline underline-offset-4 transition-colors">
                          Let&apos;s talk <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GITHUB STATS ROW */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
          <div className="rounded-xl sm:rounded-2xl border border-white/5 bg-[rgba(255,255,255,0.02)] backdrop-blur-md px-4 sm:px-6 py-4 sm:py-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
              <span className="text-xs sm:text-sm font-mono text-white/40">
                GitHub stats
              </span>

              <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                <GitHubStatsRow username="NIKSHITH-G" />
              </div>
            </div>

            {/* DIVIDER */}
            <div className="h-px bg-white/6 my-3 sm:my-4" />

            {/* CONTRIBUTIONS */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <GitHubContributions />
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