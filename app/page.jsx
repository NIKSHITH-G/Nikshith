"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import InteractiveMeshGrid from "../components/InteractiveMeshGrid";
import ProjectsGrid from "../components/ProjectsGrid";

/* -------------------------
   MicroTerminal (typing + click to expand)
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
      raf.current = setTimeout(() => {
        setShowWhoami(false);
        setCharIdx(0);
      }, 2200);
      return;
    }
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
        <span className="select-text" aria-live="polite" style={{ minWidth: 180 }}>
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
------------------------- */
function ExpandedTerminalPanel({
  open,
  onClose,
  logs = [],
  whoami = "Nikshith — someone who learns by building and breaking things",
}) {
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
        className="w-full max-w-2xl rounded-2xl p-6 bg-[#06050a]/95 border border-white/8 shadow-2xl"
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

  const rotatingChips = [
    { dot: "bg-blue-400", text: "Learning how learning works" },
    { dot: "bg-green-400", text: "Working at Tata Consultancy Services" },
    { dot: "bg-violet-400", text: "Studying the shape of ideas I’ll encounter next." },
  ];
  const [chipIdx, setChipIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setChipIdx((i) => (i + 1) % rotatingChips.length), 4500);
    return () => clearInterval(id);
  }, []);

  const heroSub = "Running experiments until the universe sends me a hint.";

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
      const scrollOffset = s * 10;

      const pTx = clamp(mx * 14, -20, 20);
      const pTy = clamp(my * 10 - scrollOffset, -24, 24);
      const pRot = clamp(mx * 2.4, -3, 3);

      const cTx = clamp(-mx * 8, -12, 12);
      const cTy = clamp(-my * 5, -8, 8 - s * 4);

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

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
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
      if (terminalOpen && e.key.toLowerCase() === "r") {
        setTerminalLogs((l) => [
          ...l,
          {
            cmd: "whoami",
            out: "Nikshith — part engineer, part detective, full-time : why is this happening",
          },
        ]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terminalOpen]);

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
                  "radial-gradient(900px 360px at 88% 78%, rgba(124,58,237,0.06), transparent 10%), radial-gradient(700px 300px at 18% 10%, rgba(56,34,110,0.04), transparent 12%)",
                mixBlendMode: "overlay",
              }}
            />

            {/* main grid: align from top */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* LEFT: portrait */}
              <div className="md:col-span-5 flex justify-start items-start">
                <div className="relative w-[360px] h-[520px] md:w-[380px] md:h-[540px] select-none md:mt-[-20px]">
                  <div
                    ref={portraitRef}
                    className="absolute left-0 top-0 w-full h-full rounded-3xl overflow-hidden shadow-[0_30px_90px_-50px_rgba(0,0,0,0.85)] transition-transform duration-300 will-change-transform"
                    style={{ transformOrigin: "50% 40%" }}
                  >
                    <Image
                      src="/images/Profile/Profile.png"
                      alt="Nikshith profile"
                      fill
                      className="object-cover transition-transform duration-500"
                      style={{ objectPosition: "30% 12%" }}
                      priority
                    />
                    <div
                      className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-400"
                      style={{
                        boxShadow: "0 26px 80px -32px rgba(31,9,50,0.45)",
                        mixBlendMode: "multiply",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: frosted card */}
              <div className="md:col-span-7 flex items-start justify-end">
                <div
                  ref={cardRef}
                  className="w-full md:max-w-[820px] rounded-2xl p-8 pt-10 bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/6 transform transition will-change-transform"
                >
                  <div className="flex flex-col gap-4">
                    <div>
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                          I’m Nikshith, I build things, break things, fix things.
                        </span>
                      </h1>

                      <p className="mt-6 text-lg text-foreground/70 max-w-[64ch]">{heroSub}</p>
                    </div>

                    {/* Rotating single chip (fade only) */}
                    <div className="mt-6">
                      <div className="relative w-full max-w-[420px] h-12">
                        {rotatingChips.map((c, i) => (
                          <div
                            key={i}
                            className="absolute left-0 top-0 w-full h-12 rounded-md px-4 py-3 flex items-center gap-3 text-sm text-foreground/90 transition-opacity duration-500 ease-out"
                            style={{
                              opacity: i === chipIdx ? 1 : 0,
                              visibility: i === chipIdx ? "visible" : "hidden",
                            }}
                          >
                            <span className={`inline-block w-3 h-3 rounded-full ${c.dot}`} />
                            <span>{c.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Micro terminal (click to expand) */}
                    <MicroTerminal
                      lines={["git push origin main", "deploy: succeeded (maybe)", "running experiments..."]}
                      whoami={"Nikshith — part engineer, part detective, full-time : why is this happening"}
                      onExpand={() => setTerminalOpen(true)}
                      paused={terminalOpen}
                    />

                    {/* New pill-style buttons */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <a
                        href="/about"
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white shadow-[0_18px_40px_rgba(79,70,229,0.45)] ring-1 ring-indigo-300/40 transition-transform duration-150 hover:scale-[1.02]"
                      >
                        <span>About</span>
                      </a>

                      <a
                        href="https://github.com/NIKSHITH-G"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-foreground/90 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-transform duration-150 hover:scale-[1.02]"
                      >
                        <span className="font-mono text-xs opacity-70">GH</span>
                        <span>GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-6 left-8 right-8 h-[60px] pointer-events-none"
              style={{ filter: "blur(22px)", opacity: 0.08 }}
            />
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
                <a href="/about" className="underline">
                  About
                </a>
                <a href="/contact" className="underline">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <ExpandedTerminalPanel
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        logs={terminalLogs}
        whoami={"Nikshith — part engineer, part detective, full-time : why is this happening"}
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

        @media (prefers-reduced-motion: reduce) {
          .transition,
          .transition-transform {
            transition: none !important;
          }
          .animate-blink {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
