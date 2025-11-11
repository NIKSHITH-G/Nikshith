"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import InteractiveMeshGrid from "../components/InteractiveMeshGrid";
import ProjectsGrid from "../components/ProjectsGrid";

/* -------------------------
   MicroTerminal (upgraded)
   - typing loop
   - pauses on hover
   - clicking triggers whoami & expands (via callback)
------------------------- */
function MicroTerminal({
  lines = ["git push origin main", "deploy: succeeded (maybe)", "running experiments..."],
  whoami = "Nikshith — systems engineer & full-stack tinkerer",
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

  // combine external paused with local hover pause
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

  // clicking terminal: if onExpand provided, expand; also show whoami once
  const handleClick = () => {
    // prefer expanding if available
    if (typeof onExpand === "function") {
      onExpand();
      // show whoami briefly inside the small terminal as instant feedback
      setShowWhoami(true);
      setIsDeleting(false);
      setCharIdx(0);
      // hide whoami shortly (but when expanded large panel will show logs)
      if (raf.current) clearTimeout(raf.current);
      raf.current = setTimeout(() => {
        setShowWhoami(false);
        setCharIdx(0);
      }, 2200);
      return;
    }
    // fallback: just show whoami
    setShowWhoami(true);
    setIsDeleting(false);
    setCharIdx(0);
    if (raf.current) clearTimeout(raf.current);
    raf.current = setTimeout(() => {
      setShowWhoami(false);
      setCharIdx(0);
    }, 4200);
  };

  return (
    <div className="mt-4 flex items-center gap-4">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="rounded-md bg-[rgba(0,0,0,0.55)] border border-white/6 px-3 py-2 text-sm font-mono flex items-center gap-3 hover:scale-[1.01] transition"
        aria-label="Terminal — click to open"
        title="Click to open terminal (or press ⌘/Ctrl+K)"
      >
        <span className="text-green-300 select-none">$</span>
        <span className="select-text" aria-live="polite" style={{ minWidth: 160 }}>
          {display}
        </span>
        <span className="ml-1 animate-blink">|</span>
      </button>

      <div className="text-sm text-foreground/60">Deployed something. Probably works. Maybe.</div>
    </div>
  );
}

/* -------------------------
   ExpandedTerminalPanel
   - appears when user presses / clicks (easter egg)
   - shows recent logs + "whoami" output
------------------------- */
function ExpandedTerminalPanel({ open, onClose, logs = [], whoami = "Nikshith — systems engineer & full-stack tinkerer" }) {
  // trap Esc to close
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center p-6 md:p-12"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl p-6 bg-[#06050a]/95 border border-white/8 shadow-2xl"
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-foreground/60 mb-2">Interactive terminal — test commands</div>
            <div className="bg-black/70 rounded-md p-4 font-mono text-sm text-green-200">
              {logs.map((l, i) => (
                <div key={i} className="mb-2">
                  <span className="text-green-300 mr-2">$</span>
                  <span>{l.cmd}</span>
                  <div className="text-foreground/60 ml-6 mt-1">{l.out}</div>
                </div>
              ))}

              <div className="mt-2 border-t border-white/6 pt-2 text-foreground/80">
                <strong>whoami</strong>: {whoami}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={onClose}
              className="rounded-md bg-white/6 px-3 py-2 text-sm hover:bg-white/8"
              aria-label="Close terminal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   Home component
------------------------- */
export default function Home() {
  const tools = ["VS Code", "Postman", "Git / GitHub", "Docker", "Terminal (zsh)"];
  const devices = ["MacBook Pro (M4 Pro)", "Samsung Galaxy S23+", "Samsung Galaxy Buds 3 Pro"];
  const software = ["Chrome", "Slack", "Figma", "Tableau", "IntelliJ IDEA"];

  const projects = [
    {
      name: "Peer to Peer Encrypted File Sharing Using Blockchain",
      points: [
        "AES for encryption + SHA-512 for hashing; privacy-preserving scheme.",
        "Smart contracts for secondary verification & access control.",
      ],
      stack: ["Blockchain", "AES", "SHA-512", "MySQL"],
      images: ["/images/Projects/blockchain2.jpeg"],
    },
  ];

  const statusPool = [
    { dot: "bg-green-500", text: "Working at Tata Consultancy Services" },
    { dot: "bg-indigo-400", text: "Exploring Web3 & Cloud" },
    { dot: "bg-rose-400", text: "Taking notes on AI UX experiments" },
    { dot: "bg-yellow-400", text: "Open to small freelance gigs" },
  ];

  const [statusIdx, setStatusIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStatusIdx((s) => (s + 1) % statusPool.length), 3700);
    return () => clearInterval(id);
  }, []);

  const subtitles = ["Engineer • Builder • Learner", "Exploring Web3 & Cloud", "Experimenting with AI & UX"];
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSubtitleIdx((s) => (s + 1) % subtitles.length), 3000);
    return () => clearInterval(id);
  }, []);

  // parallax refs
  const heroRef = useRef(null);
  const portraitRef = useRef(null);
  const cardRef = useRef(null);
  const raf = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const scrollY = useRef(0);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }

    function onMouse(e) {
      const rect = hero.getBoundingClientRect();
      mouse.current.x = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      mouse.current.y = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      queueFrame();
    }
    function onLeave() {
      mouse.current.x = 0;
      mouse.current.y = 0;
      queueFrame();
    }
    function onScroll() {
      scrollY.current = window.scrollY || window.pageYOffset;
      queueFrame();
    }

    function updateFrame() {
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const s = Math.min(1, scrollY.current / 900);
      const scrollOffset = s * 18;

      const pTx = clamp(mx * 18, -24, 24);
      const pTy = clamp(my * 12 - scrollOffset, -32, 32);
      const pRot = clamp(mx * 3.5, -5, 5);

      const cTx = clamp(-mx * 10, -14, 14);
      const cTy = clamp(-my * 6, -10, 10 - s * 5);

      if (portraitRef.current) {
        portraitRef.current.style.transform = `translate3d(${pTx}px, ${pTy}px, 0) rotate(${pRot}deg)`;
      }
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${cTx}px, ${cTy}px, 0)`;
      }

      raf.current = null;
    }

    function queueFrame() {
      if (raf.current == null) raf.current = requestAnimationFrame(updateFrame);
    }

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

  // Expanded terminal (easter egg) state + logs
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { cmd: "npm run build", out: "build succeeded in 3.1s" },
    { cmd: "git push origin main", out: "pushed to origin/main" },
    { cmd: "deploy", out: "deployment started — rolling out" },
  ]);

  // open/close with key combo CMD/Ctrl + K
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }
      // quick shortcut: R to add a fake log (for demo), only when terminal open
      if (terminalOpen && e.key.toLowerCase() === "r") {
        setTerminalLogs((l) => [
          ...l,
          { cmd: "whoami", out: "Nikshith — systems engineer & tinkerer" },
        ]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terminalOpen]);

  // subtle shimmer + depth classes applied to card via CSS below

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
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-10">
          <div
            ref={heroRef}
            className="relative overflow-visible rounded-2xl p-8"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,6,20,0.72) 0%, rgba(10,4,26,0.66) 40%, rgba(18,6,40,0.62) 100%)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(1200px 480px at 20% 10%, rgba(88,58,226,0.12), transparent 12%), radial-gradient(900px 360px at 92% 80%, rgba(124,58,237,0.08), transparent 18%)",
                mixBlendMode: "overlay",
              }}
            />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* LEFT: portrait */}
              <div className="md:col-span-5 flex justify-start items-center">
                <div className="relative w-[360px] h-[520px] md:w-[380px] md:h-[540px] select-none">
                  <div
                    className="absolute inset-0 rounded-2xl -z-10"
                    style={{
                      background:
                        "radial-gradient(closest-side at 35% 18%, rgba(48,18,66,0.78), rgba(12,6,20,0.42) 40%, rgba(0,0,0,0.0) 70%)",
                      filter: "blur(38px)",
                      opacity: 1,
                    }}
                  />
                  <div
                    ref={portraitRef}
                    className="absolute left-0 top-0 w-full h-full rounded-3xl overflow-hidden shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] transition-transform duration-300 will-change-transform"
                    style={{ transformOrigin: "50% 40%" }}
                  >
                    <div className="w-full h-full relative group">
                      <Image
                        src="/images/Profile/Profile.png"
                        alt="Nikshith profile"
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-400"
                        style={{ objectPosition: "30% 12%" }}
                        priority
                      />

                      <div
                        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                        style={{
                          boxShadow: "0 14px 80px -30px rgba(99,66,245,0.28)",
                          mixBlendMode: "screen",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: frosted card */}
              <div className="md:col-span-7 flex items-center justify-end">
                <div
                  ref={cardRef}
                  className="w-full md:max-w-[820px] rounded-2xl p-8 bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/6 shimmer-border hover:card-hover transform transition will-change-transform"
                >
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                          Hi — I build things that people use.
                        </span>
                      </h2>
                      <p className="mt-4 text-lg text-foreground/70 max-w-[64ch]">
                        I’m Nikshith — systems engineer and full-stack tinkerer. This studio card is a compact
                        expression of my work: tools I love, things I ship, and experiments I can't stop tinkering with.
                      </p>
                    </div>

                    <div className="mt-1 text-indigo-300 font-medium">{subtitles[subtitleIdx]}</div>

                    {/* Context-aware status chip */}
                    <div className="mt-4 flex items-center gap-3 text-sm">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusPool[statusIdx].dot}`} aria-hidden />
                      <span className="text-foreground/80">{statusPool[statusIdx].text}</span>
                    </div>

                    {/* Micro terminal (click to expand) */}
                    <MicroTerminal
                      lines={["git push origin main", "deploy: succeeded (maybe)", "running experiments..."]}
                      whoami={"Nikshith — systems engineer & full-stack tinkerer"}
                      onExpand={() => setTerminalOpen(true)}
                      paused={terminalOpen}
                    />

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <a href="/about" className="inline-flex items-center rounded-md px-4 py-2 text-sm bg-white/6 hover:bg-white/8">
                        About
                      </a>

                      <a
                        href="https://github.com/NIKSHITH-G"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md px-4 py-2 text-sm bg-transparent border border-white/6 hover:bg-white/5"
                      >
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* subtle reflected glow under card */}
            <div className="absolute -bottom-6 left-8 right-8 h-[60px] pointer-events-none" style={{ filter: "blur(28px)", opacity: 0.12 }} />
          </div>
        </section>

        {/* QUICK HUB */}
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Hub</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border-2 border-white/20 p-6 bg-[rgba(255,255,255,0.02)]">
              <h3 className="font-semibold">Tools I use</h3>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                {tools.map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-indigo-500/80" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-white/20 p-6 bg-[rgba(255,255,255,0.02)]">
              <h3 className="font-semibold">Devices I use</h3>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                {devices.map((d) => (
                  <li key={d} className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-violet-500/80" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-white/20 p-6 bg-[rgba(255,255,255,0.02)]">
              <h3 className="font-semibold">Software I rely on</h3>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                {software.map((s) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-pink-500/80" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FEATURED PROJECTS */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
          <div className="rounded-2xl border-2 border-white/30 p-6">
            <ProjectsGrid projects={projects} />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mx-auto max-w-7xl px-6 pb-12 text-sm text-foreground/70">
          <div className="pt-6 border-t border-white/6">
            <div className="flex items-center justify-between">
              <div>© {new Date().getFullYear()} Nikshith — Built with ❤️</div>
              <div className="flex items-center gap-4">
                <a href="/about" className="underline">About</a>
                <a href="/contact" className="underline">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Expanded terminal modal */}
      <ExpandedTerminalPanel
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        logs={terminalLogs}
        whoami={"Nikshith — systems engineer & full-stack tinkerer"}
      />

      <style jsx>{`
        .animate-blink {
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          to {
            visibility: hidden;
          }
        }

        /* shimmer border + subtle depth on hover */
        .shimmer-border {
          position: relative;
          overflow: hidden;
        }
        .shimmer-border::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(124,58,237,0.06), rgba(99,102,241,0.06), rgba(124,58,237,0.06));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          filter: blur(8px);
          opacity: 0.8;
          animation: shimmer 6s linear infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-30%); }
          50% { transform: translateX(30%); }
          100% { transform: translateX(-30%); }
        }

        /* card hover depth */
        .card-hover:hover {
          transform: translateY(-6px) translateZ(6px) scale(1.005);
          box-shadow: 0 18px 80px -40px rgba(99,102,241,0.18), 0 6px 30px -28px rgba(0,0,0,0.6);
        }

        /* prefer-reduced-motion respects */
        @media (prefers-reduced-motion: reduce) {
          .transition, .transition-transform {
            transition: none !important;
          }
          .animate-blink {
            animation: none;
          }
          .shimmer-border::before {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}