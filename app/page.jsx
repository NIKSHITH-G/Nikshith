"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
    <div className="mt-3 flex items-center gap-4">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="rounded-lg bg-[rgba(0,0,0,0.8)] border border-white/8 px-4 py-2 text-sm font-mono flex items-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-transform transition-colors"
        aria-label="Terminal — click to open"
        title="Click to open terminal (or press ⌘/Ctrl+K)"
      >
        <span className="text-green-300 select-none">$</span>
        <span className="select-text" aria-live="polite" style={{ minWidth: 180 }}>
          {display}
        </span>
        <span className="ml-1 animate-blink">|</span>
      </button>

      <div className="text-sm text-foreground/60">Deployed something, Probably works.</div>
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
            <div className="text-sm text-foreground/60 mb-2">
              Interactive terminal — test commands
            </div>
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
              className="rounded-md bg-white/6 px-3 py-2 text-sm hover:bg-white/8 active:scale-[0.98] transition"
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
   StackDashboard – one big stack card
------------------------- */
function StackDashboard() {
  const sections = [
    {
      id: "software",
      label: "Software",
      title: "Software I rely on",
      subtitle: "The apps that are almost always open on my Mac.",
      badge: "Apps",
      items: [
        {
          slug: "vscode",
          name: "VS Code",
          role: "Editor",
          icon: "🧑‍💻",
          description: "Where most of the building (and breaking) happens.",
          bullets: ["Primary editor for code.", "Lives next to Git, terminals & debuggers."],
        },
        {
          slug: "chrome",
          name: "Chrome",
          role: "Browser",
          icon: "🌐",
          description: "DevTools, testing, and way too many tabs.",
          bullets: ["Inspecting layouts & network calls.", "Debugging frontend issues quickly."],
        },
        {
          slug: "postman",
          name: "Postman",
          role: "APIs",
          icon: "📮",
          description: "Where APIs get poked, broken, and fixed.",
          bullets: ["Testing REST endpoints.", "Trying different payloads & edge cases."],
        },
        {
          slug: "figma",
          name: "Figma",
          role: "Design",
          icon: "🎨",
          description: "A scratchpad for UI ideas and flows.",
          bullets: ["Rough wireframes for projects.", "Experimenting with layouts & components."],
        },
        {
          slug: "notion",
          name: "Notion",
          role: "Notes",
          icon: "📚",
          description: "Dumping ideas, tracking learning, and planning.",
          bullets: ["Project notes & task lists.", "Tracking what I’m learning next."],
        },
      ],
    },
    {
      id: "stack",
      label: "Stack",
      title: "Engineering stack",
      subtitle: "Technologies I reach for first when building something.",
      badge: "Tech",
      items: [
        {
          slug: "nextjs",
          name: "Next.js",
          role: "Web framework",
          icon: "⚡️",
          description: "My go-to for modern React apps.",
          bullets: [
            "File-based routing & server components.",
            "Great for fast prototypes & serious builds.",
          ],
        },
        {
          slug: "react",
          name: "React",
          role: "UI layer",
          icon: "⚛️",
          description: "Where UI logic and components live.",
          bullets: ["Component-driven thinking.", "Hooks for state & effects."],
        },
        {
          slug: "tailwind",
          name: "Tailwind CSS",
          role: "Styling",
          icon: "💨",
          description: "Utility-first styling for fast iteration.",
          bullets: ["Keeps styles close to components.", "Easy to tweak spacing & typography."],
        },
        {
          slug: "python",
          name: "Python",
          role: "Scripting / AI",
          icon: "🐍",
          description: "Scripting, experiments, and data workflows.",
          bullets: ["Quick prototypes & utilities.", "Great for ML / AI work later."],
        },
        {
          slug: "git",
          name: "Git & GitHub",
          role: "Version control",
          icon: "🧬",
          description: "Timeline of experiments, mistakes, and fixes.",
          bullets: ["Feature branches & PRs.", "Keeping work backed up & reviewable."],
        },
      ],
    },
    {
      id: "workflow",
      label: "Workflow",
      title: "How I like to work",
      subtitle: "Little habits and tools that keep me shipping consistently.",
      badge: "Flow",
      items: [
        {
          slug: "terminal",
          name: "Terminal (zsh)",
          role: "CLI",
          icon: "⌨️",
          description: "Git, scripts, and quick checks.",
          bullets: ["Aliases for frequent commands.", "Jumping between projects quickly."],
        },
        {
          slug: "macbook",
          name: "MacBook Pro (M4 Pro)",
          role: "Machine",
          icon: "💻",
          description: "Main workhorse for code, design, and meetings.",
          bullets: ["Everything from coding to video calls.", "Optimized for long sessions."],
        },
        {
          slug: "buds",
          name: "Galaxy Buds 3 Pro",
          role: "Audio",
          icon: "🎧",
          description: "Noise barrier + music while working.",
          bullets: ["Deep work playlists.", "Blocking out background noise."],
        },
        {
          slug: "routine",
          name: "Small routines",
          role: "Habits",
          icon: "⏱️",
          description: "Short blocks of focused work + breaks.",
          bullets: ["Breaking work into sprints.", "Reviewing progress at the end of the day."],
        },
      ],
    },
  ];

  const [activeSectionId, setActiveSectionId] = useState("software");
  const [hoveredSlug, setHoveredSlug] = useState(null);

  const activeSection =
    sections.find((s) => s.id === activeSectionId) ?? sections[0];

  const activeItem =
    activeSection.items.find((item) => item.slug === hoveredSlug) ??
    activeSection.items[0];

  return (
    <section className="mx-auto max-w-7xl px-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Stack dashboard</h2>
          <p className="mt-2 text-sm text-foreground/70 max-w-xl">
            Hover over anything on the right to see how it fits into how I work.
          </p>
        </div>

        {/* Tabs / file switcher */}
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[rgba(8,6,20,0.7)] px-1 py-1">
          {sections.map((section) => {
            const active = activeSectionId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSectionId(section.id);
                  setHoveredSlug(null);
                }}
                className={`relative px-3.5 py-1.5 text-xs sm:text-sm rounded-full border transition-all duration-200
                  ${
                    active
                      ? "border-white/40 bg-white/10 shadow-[0_0_0_1px_rgba(148,163,184,0.35)]"
                      : "border-transparent text-foreground/60 hover:text-foreground/90 hover:bg-white/5"
                  }`}
              >
                <span className="flex items-center gap-1.5">
                  {active && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  )}
                  <span>{section.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ONE big stack card */}
      <div
        className="relative rounded-2xl border-2 border-white/12 bg-[rgba(10,10,20,0.88)] overflow-hidden 
                   px-6 py-6 md:px-8 md:py-7"
      >
        {/* faint inner border to feel like a “file” */}
        <div className="pointer-events-none absolute inset-[10px] rounded-2xl border border-white/5 opacity-[0.08]" />

        <div className="relative grid gap-6 md:gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] items-stretch">
          {/* LEFT: detail panel that changes on hover */}
          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.09em] text-foreground/70 mb-3">
                <span>{activeSection.badge}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">
                {activeSection.title}
              </h3>
              <p className="mt-2 text-sm text-foreground/70 max-w-md">
                {activeSection.subtitle}
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-xl">
                    <span>{activeItem.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{activeItem.name}</div>
                    <div className="text-xs uppercase tracking-wide text-foreground/60">
                      {activeItem.role}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-foreground/80">
                  {activeItem.description}
                </p>

                {activeItem.bullets && activeItem.bullets.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-xs text-foreground/70">
                    {activeItem.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <p className="text-[11px] text-foreground/50">
              Tip: move your cursor over different icons on the right. The left
              side updates to show how I use each one.
            </p>
          </div>

          {/* RIGHT: icon grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            onMouseLeave={() => setHoveredSlug(null)}
          >
            {activeSection.items.map((item) => {
              const isActive = activeItem.slug === item.slug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onMouseEnter={() => setHoveredSlug(item.slug)}
                  onFocus={() => setHoveredSlug(item.slug)}
                  className={`group relative flex flex-col items-center justify-between gap-2 rounded-xl border px-3 py-3 text-xs
                    transition-all duration-150
                    ${
                      isActive
                        ? "border-emerald-400/70 bg-emerald-400/10 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-lg">
                    <span className="group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[11px] font-medium">{item.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-foreground/50">
                      {item.role}
                    </span>
                  </div>

                  {isActive && (
                    <span className="absolute -top-1.5 right-2 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------
   Home component
------------------------- */
export default function Home() {
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
    const id = setInterval(
      () => setChipIdx((i) => (i + 1) % rotatingChips.length),
      4500
    );
    return () => clearInterval(id);
  }, []);

  const heroSub = "Poke around — everything here is a work in progress.";

  const heroRef = useRef(null);
  const portraitRef = useRef(null);
  const cardRef = useRef(null);
  const raf = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const scrollY = useRef(0);

  // Parallax only for the card, not the image
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

      const cTx = clamp(-mx * 8, -12, 12);
      const cTy = clamp(-my * 5, -8, 8 - s * 4);

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
              border: "1px solid rgba(255,255,255,0.03)",
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

            {/* main grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* LEFT: portrait */}
              <div className="md:col-span-5 flex justify-start items-center">
                <div className="relative w-[380px] h-[560px] md:w-[420px] md:h-[620px] select-none md:mt-[-32px]">
                  <div
                    ref={portraitRef}
                    className="absolute left-0 top-0 w-full h-full rounded-3xl overflow-hidden shadow-[0_30px_90px_-50px_rgba(0,0,0,0.85)]"
                    style={{ transformOrigin: "50% 40%" }}
                  >
                    <Image
                      src="/images/Profile/Profile.png"
                      alt="Nikshith profile"
                      fill
                      className="object-cover"
                      style={{ objectPosition: "30% 12%" }}
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: frosted card */}
              <div className="md:col-span-7 flex items-center justify-end">
                <div
                  ref={cardRef}
                  className="w-full md:max-w-[820px] rounded-2xl p-7 pt-9 bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/5 transform transition will-change-transform"
                >
                  <div className="flex flex-col gap-4">
                    {/* Heading + subtitle */}
                    <div>
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                          I’m Nikshith, I build things, break things, fix things.
                        </span>
                      </h1>

                      <p className="mt-6 text-lg text-foreground/70 max-w-[64ch]">
                        {heroSub}
                      </p>
                    </div>

                    {/* Status + terminal grouped */}
                    <div className="mt-3 space-y-2">
                      {/* Rotating chip as status */}
                      <div className="relative w-full max-w-[420px] h-10">
                        {rotatingChips.map((c, i) => (
                          <div
                            key={i}
                            className="absolute left-0 top-0 w-full h-10 rounded-md px-4 py-2 flex items-center gap-3 text-sm text-foreground/90 transition-opacity duration-500ease-out"
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

                      {/* Micro terminal */}
                      <MicroTerminal
                        lines={[
                          "git push origin main",
                          "deploy: succeeded (maybe)",
                          "running experiments...",
                        ]}
                        whoami={
                          "Nikshith — part engineer, part detective, full-time : why is this happening"
                        }
                        onExpand={() => setTerminalOpen(true)}
                        paused={terminalOpen}
                      />
                    </div>

                    {/* CTA links aligned right */}
                    <div className="mt-6 pr-4 flex justify-end">
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-foreground/60">
                        <a
                          href="/resume.pdf"
                          className="hover:text-foreground/90 hover:underline underline-offset-4 transition-colors"
                        >
                          Download CV
                        </a>

                        <span className="inline-block w-1 h-1 rounded-full bg-foreground/40" />

                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 hover:underline underline-offset-4 transition-colors"
                        >
                          Let&apos;s talk
                          <span>→</span>
                        </Link>
                      </div>
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

        {/* STACK DASHBOARD */}
        <StackDashboard />

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
            <div className="flex items-center justify-between gap-3 flex-wrap">
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