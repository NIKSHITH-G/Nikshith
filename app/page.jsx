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
    <div className="mt-3 flex items-center gap-4">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="rounded-lg bg-[rgba(0,0,0,0.8)] border border-white/8 px-4 py-2 text-sm font-mono flex items-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-transform transition-colors"
        aria-label="Terminal — click to open"
      >
        <span className="text-green-300 select-none">$</span>
        <span className="select-text" aria-live="polite" style={{ minWidth: 180 }}>{display}</span>
        <span className="ml-1 animate-blink">|</span>
      </button>
      <div className="text-sm text-foreground/60">Deployed something, Probably works.</div>
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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[80] flex items-center justify-center p-6 md:p-12" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-2xl p-6 bg-[#06050a]/95 border border-white/8 shadow-2xl" style={{ backdropFilter: "blur(8px)" }}>
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
            <button onClick={onClose} className="rounded-md bg-white/6 px-3 py-2 text-sm hover:bg-white/8 active:scale-[0.98] transition" aria-label="Close terminal">Close</button>
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
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`),
        ]);
        if (!userRes.ok) throw new Error("GitHub API error");
        const userData = await userRes.json();
        const reposData = await reposRes.json();

        const totalStars = Array.isArray(reposData)
          ? reposData.reduce((acc, r) => acc + (r.stargazers_count || 0), 0)
          : 0;

        const topRepos = Array.isArray(reposData)
          ? reposData.filter((r) => !r.fork).slice(0, 3)
          : [];

        setStats({
          followers: userData.followers,
          publicRepos: userData.public_repos,
          totalStars,
        });
        setRepos(topRepos);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [username]);

  const statItems = stats
    ? [
        { label: "Repositories", value: stats.publicRepos },
        { label: "Followers", value: stats.followers },
        { label: "Stars earned", value: stats.totalStars },
      ]
    : [];

  const langColor = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Go: "#00ADD8",
    Rust: "#dea584",
    default: "#8b8b8b",
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pt-6 pb-2">
      <div
        className="rounded-2xl border border-white/5 bg-[rgba(255,255,255,0.02)] backdrop-blur-md px-6 py-5"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">

          {/* GitHub identity */}
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/8 group-hover:bg-white/10 transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white/70 group-hover:fill-white transition" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </span>
            <span className="text-sm font-mono text-white/50 group-hover:text-white/80 transition">
              @{username}
            </span>
          </a>

          {/* divider */}
          <span className="hidden sm:block h-8 w-px bg-white/8 shrink-0" />

          {/* stat pills */}
          {loading ? (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-24 rounded-full bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <span className="text-xs text-white/30 font-mono">github stats unavailable</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {statItems.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1"
                >
                  <span className="text-sm font-semibold text-white/80 tabular-nums">{s.value}</span>
                  <span className="text-xs text-white/35">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* divider */}
          {!loading && !error && repos.length > 0 && (
            <span className="hidden sm:block h-8 w-px bg-white/8 shrink-0" />
          )}

          {/* top repos */}
          {!loading && !error && repos.length > 0 && (
            <div className="flex flex-wrap gap-2 min-w-0">
              {repos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 px-3 py-1 transition"
                >
                  {repo.language && (
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: langColor[repo.language] ?? langColor.default }}
                    />
                  )}
                  <span className="text-xs font-mono text-white/50 group-hover:text-white/80 transition truncate max-w-[120px]">
                    {repo.name}
                  </span>
                  {repo.stargazers_count > 0 && (
                    <span className="text-[10px] text-white/25 group-hover:text-white/50 transition">
                      ★ {repo.stargazers_count}
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
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
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-10">
          <div
            ref={heroRef}
            className="relative overflow-visible rounded-2xl p-8"
            style={{
              background: "linear-gradient(180deg, rgba(8,6,20,0.72) 0%, rgba(10,4,26,0.66) 40%, rgba(18,6,40,0.62) 100%)",
              border: "1px solid rgba(255,255,255,0.03)",
            }}
          >
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(900px 360px at 88% 78%, rgba(124,58,237,0.06), transparent 10%), radial-gradient(700px 300px at 18% 10%, rgba(56,34,110,0.04), transparent 12%)", mixBlendMode: "overlay" }} />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* LEFT: portrait */}
              <div className="md:col-span-5 flex justify-start items-center">
                <div className="relative w-[380px] h-[560px] md:w-[420px] md:h-[620px] select-none md:mt-[-32px]">
                  <div className="absolute left-0 top-0 w-full h-full rounded-3xl overflow-hidden shadow-[0_30px_90px_-50px_rgba(0,0,0,0.85)]" style={{ transformOrigin: "50% 40%" }}>
                    <Image src="/images/Profile/Profile.png" alt="Nikshith profile" fill className="object-cover" style={{ objectPosition: "30% 12%" }} priority />
                  </div>
                </div>
              </div>

              {/* RIGHT: frosted card */}
              <div className="md:col-span-7 flex items-center justify-end">
                <div ref={cardRef} className="w-full md:max-w-[820px] rounded-2xl p-7 pt-9 bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/5 transform transition will-change-transform">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                          I'm Nikshith, I build things, break things, fix things.
                        </span>
                      </h1>
                      <p className="mt-6 text-lg text-foreground/70 max-w-[64ch]">{heroSub}</p>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="relative w-full max-w-[420px] h-10">
                        {rotatingChips.map((c, i) => (
                          <div key={i} className="absolute left-0 top-0 w-full h-10 rounded-md px-4 py-2 flex items-center gap-3 text-sm text-foreground/90 transition-opacity duration-500 ease-out" style={{ opacity: i === chipIdx ? 1 : 0, visibility: i === chipIdx ? "visible" : "hidden" }}>
                            <span className={`inline-block w-3 h-3 rounded-full ${c.dot}`} />
                            <span>{c.text}</span>
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

                    <div className="mt-6 pr-4 flex justify-end">
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-foreground/60">
                        <a href="/resume.pdf" className="hover:text-foreground/90 hover:underline underline-offset-4 transition-colors">Download CV</a>
                        <span className="inline-block w-1 h-1 rounded-full bg-foreground/40" />
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
        <GitHubStatsRow username="NIKSHITH-G" />

        {/* GITHUB CONTRIBUTION GRAPH */}
        <GitHubContributions />

        {/* FOOTER */}
        <footer className="mx-auto max-w-7xl px-6 pb-12 pt-10 text-sm text-foreground/70">
          <div className="pt-6 border-t border-white/6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>© {new Date().getFullYear()} Nikshith — Built with ❤️</div>
              <div className="flex items-center gap-4">
                <a href="/about" className="underline">About</a>
                <a href="/contact" className="underline">Contact</a>
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