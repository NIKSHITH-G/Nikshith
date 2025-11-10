"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InteractiveMeshGrid from "../components/InteractiveMeshGrid";
import ProjectsGrid from "../components/ProjectsGrid";

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
    {
      name: "Smart Mathematics Tutor",
      points: [
        "Web-based GUI where users draw shapes and get related formulas.",
        "Built with deep learning for shape recognition.",
      ],
      stack: ["TensorFlow", "Keras", "Flask"],
      images: ["/images/Projects/AI1.png"],
    },
  ];

  const subtitles = [
    "Engineer • Builder • Learner",
    "Exploring Web3 & Cloud",
    "Experimenting with AI & UX",
  ];
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSubtitleIdx((s) => (s + 1) % subtitles.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const status = {
    color: "bg-green-500",
    text: "Working at Tata Consultancy Services",
  };

  return (
    <>
      <Navbar />

      <InteractiveMeshGrid
        spacing={96}
        density={0.78}
        lineColor="rgba(255,255,255,0.03)"
        pointColor="rgba(168,85,247,0.95)"
        pointSize={1.6}
        warp={0.16}
        pointerSmoothing={0.16}
        spring={0.1}
        damping={0.84}
        disableBelow={420}
        maxPoints={1600}
      />

      <main className="relative z-10 text-foreground">
        {/* HERO */}
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-12">
          <div className="relative rounded-2xl p-8 border-2 border-white/6 bg-black/20 backdrop-blur-sm overflow-hidden">
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(ellipse at 10% 20%, rgba(99,102,241,0.06), transparent 15%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.04), transparent 20%)",
              }}
            />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left: Profile Image */}
              <div className="flex justify-center md:justify-start">
                <div className="group relative w-60 h-[28rem] md:w-70 md:h-[24rem] rounded-3xl overflow-hidden transform transition-all duration-500 will-change-transform group-hover:scale-[1.04] animate-float">
                  {/* Glow effect behind image */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-violet-500/20 to-transparent blur-3xl opacity-60 group-hover:opacity-90 transition duration-500"></div>

                  {/* Profile Image directly inside */}
                  <Image
                    src="/images/Profile/Profile.png"
                    alt="Nikshith profile"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 320px, (min-width: 768px) 240px, 200px"
                    priority
                  />
                </div>
              </div>

              {/* Right: Intro Content */}
              <div className="md:col-span-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                  <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                    Hi — I build things that people use.
                  </span>
                </h1>

                <p className="mt-4 text-lg text-foreground/70 max-w-2xl">
                  I’m Nikshith — systems engineer and full-stack tinkerer. This homepage is a compact hub: the
                  tools, devices and software I rely on daily, and a quick highlight of featured projects. For full
                  timelines and experience please visit the About page.
                </p>

                <div className="mt-3 text-indigo-400 font-medium">{subtitles[subtitleIdx]}</div>

                <div className="mt-4 flex items-center gap-3 text-sm text-foreground/70">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${status.color}`} aria-hidden />
                  <span>{status.text}</span>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <a
                    href="/about"
                    className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium bg-indigo-600/90 hover:bg-indigo-500/95 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    About me
                  </a>

                  <a
                    href="https://github.com/NIKSHITH-G"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium bg-white/6 hover:bg-white/8"
                  >
                    View GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK HUB */}
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Hub</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border-2 border-white/20 p-6 bg-[rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Tools I use</h3>
                <span className="text-xs text-foreground/60">Daily</span>
              </div>
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Devices I use</h3>
                <span className="text-xs text-foreground/60">Hardware</span>
              </div>
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Software I rely on</h3>
                <span className="text-xs text-foreground/60">Apps</span>
              </div>
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

          <p className="mt-4 text-sm text-foreground/60">
            Note: this page is intentionally concise and avoids repeating the detailed timeline and experience found on About.
          </p>
        </section>

        {/* FEATURED PROJECTS */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
          <div className="rounded-2xl border-2 border-white/30 p-6">
            <ProjectsGrid projects={projects} />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mx-auto max-w-6xl px-6 pb-12 text-sm text-foreground/70">
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

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}