// app/about/page.jsx
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import Timeline from "../../components/Timeline";
import ProjectsGrid from "../../components/ProjectsGrid";
import InteractiveMeshGrid from "../../components/InteractiveMeshGrid";

export default function About() {
  // ---- DATA ----
  const milestones = [
  {
    title: "Monash University",
    degree: "Masters in Artificial Intelligence",
    year: "2026-2028",
    image: "/images/Timeline/step3.png",
  },
  {
    title: "Vellore Institute Of Technology",
    degree: "B.Tech in Computer Science Engineering",
    year: "2020-2024",
    image: "/images/Timeline/step2.png",
  },
  {
    title: "Narayana Saraswathi Pati",
    degree: "Mathematics, Physics & Chemistry",
    year: "2018-2020",
    image: "/images/Timeline/step1.png",
  },
];

const experience = [
  {
    title: "Systems Engineer — Tata Consultancy Services (TCS)",
    period: "Sep 2024 – Feb 2026 • Bangalore, India",
    bullets: [
      "Developed and maintained Java Spring Boot REST APIs for core banking systems in the BFSI domain, supporting high-volume transactions.",
      "Designed and executed automated test suites (unit, integration, regression) using Selenium, reducing manual QA effort and improving release confidence.",
      "Performed root cause analysis on production issues across multiple banking modules, ensuring system reliability and faster resolution times.",
      "Contributed to CI/CD pipelines and deployment workflows using Git, enabling consistent and efficient software releases.",
    ],
  },
  {
    title: "AI Developer Intern — Google Developers Program",
    period: "Jun 2023 – Jul 2023 • Remote",
    bullets: [
      "Developed an interactive GUI application to enhance mathematics learning using AI-based shape recognition.",
      "Built machine learning models using TensorFlow and Keras to detect hand-drawn shapes and generate relevant formulas.",
      "Deployed the application using Flask, integrating NumPy and Matplotlib for data processing and visualization.",
      "Collaborated using Jupyter Notebook, IBM Watson Studio, and Anaconda to deliver project outcomes.",
    ],
  },
  {
    title: "Web Developer Intern — AR BRANDS",
    period: "Jun 2023 – Jul 2023 • Remote",
    bullets: [
      "Collaborated with stakeholders to gather requirements and translate business needs into functional web solutions.",
      "Developed responsive web interfaces using HTML, CSS, and JavaScript, ensuring cross-device compatibility.",
      "Conducted testing and debugging to deliver a smooth, bug-free user experience.",
      "Implemented performance optimizations and usability improvements across web pages.",
    ],
  },
];

  // ===== PROJECTS =====
  const projects = [
    {
      name: " Peer to Peer Encrypted File Sharing Using Blockchain ",
      points: [
        "AES for encryption + SHA-512 for hashing; privacy-preserving scheme.",
        "Smart contracts for secondary verification & access control.",
        "Compared MD5, SHA-1, SHA-256, SHA-512 for security vs performance.",
      ],
      stack: [
        "Blockchain (Private/Public)",
        "AES",
        "SHA-512",
        "MySQL",
        "HTML",
        "CSS",
      ],
      slides: [
        "/images/Projects/blockchain2.jpeg",
        "/images/Projects/blockchain1.jpeg",
        "/images/Projects/blockchain3.jpeg",
      ],
      images: [
        "/images/Projects/blockchain2.jpeg",
        "/images/Projects/blockchain1.jpeg",
        "/images/Projects/blockchain3.jpeg",
      ],
    },

    {
      name: "Smart Mathematics Tutor",
      points: [
        "Web-based GUI where users draw shapes and get related formulas.",
        "increases interactive learning and reduces unproductive screen time.",
        "Built with deep learning for shape recognition.",
      ],
      stack: [
        "TensorFlow",
        "Keras",
        "Flask",
        "NumPy",
        "Matplotlib",
        "HTML",
        "CSS",
        "IBM Cloud",
        "Watson Studio",
      ],
      slides: [
        "/images/Projects/AI1.png",
        "/images/Projects/AI2.png",
        "/images/Projects/AI3.png",
      ],
      images: [
        "/images/Projects/AI1.png",
        "/images/Projects/AI2.png",
        "/images/Projects/AI3.png",
      ],
    },
  ];

  const skillGroups = [
    { key: "languages", items: ["Python", "Java", "TypeScript", "PHP", "SQL"] },
    { key: "frameworks", items: ["React", "Next.js", "HTML", "CSS"] },
    { key: "tools", items: ["Git", "OOP", "DBMS", "Blockchain"] },
    { key: "ai_ml", items: ["TensorFlow", "Keras", "NumPy", "Pandas", "Matplotlib"] },
  ];

  const certs = [
    "AWS Certified Cloud Practitioner — AWS",
    "Artificial Intelligence (Google Developers) — Externship (SMART INTERNZ)",
    "Web Developer Intern — AR BRANDS",
    "Full-Stack Web Developer (MERN) — PREGRAD",
    "Graduate Record Examination (GRE) — 322/340",
  ];

  const certImages = {
    "AWS Certified Cloud Practitioner — AWS":
      "/images/certificates/AWS CLOUD PARTIONEER.jpg",
    "Artificial Intelligence (Google Developers) — Externship (SMART INTERNZ)":
      "/images/certificates/SmartBridge_AI.png",
    "Web Developer Intern — AR BRANDS": "/images/certificates/AR-BRANDS.png",
    "Full-Stack Web Developer (MERN) — PREGRAD":
      "/images/certificates/PREGRAD.jpg",
    "Graduate Record Examination (GRE) — 322/340":
      "/images/certificates/GRE.jpg",
  };


  // === Certifications hover preview (disabled on mobile) ===
  const [preview, setPreview] = useState({ show: false, x: 0, y: 0, src: "" });
  const certRaf = useRef(0);

  const showCertPreview = (e, title) => {
    // Disable preview on mobile
    if (window.matchMedia("(max-width: 768px)").matches) return;
    
    const src = certImages[title] || "/images/certificates/placeholder.png";
    setPreview((p) => ({ ...p, show: true, src }));
    moveCertPreview(e);
  };

  const moveCertPreview = (e) => {
    cancelAnimationFrame(certRaf.current);

    const px = (e.touches && e.touches[0]) ? e.touches[0].clientX : (e.clientX ?? null);
    const py = (e.touches && e.touches[0]) ? e.touches[0].clientY : (e.clientY ?? null);

    certRaf.current = requestAnimationFrame(() => {
      const OFFSET_X = 16;
      const OFFSET_Y = 16;

      const leftRaw = px !== null ? px + OFFSET_X : undefined;
      const topRaw = py !== null ? py + OFFSET_Y : undefined;

      const left = Number.isFinite(leftRaw) ? leftRaw : -9999;
      const top = Number.isFinite(topRaw) ? topRaw : -9999;

      setPreview((p) => ({
        ...p,
        x: left,
        y: top,
      }));
    });
  };

  const hideCertPreview = () => {
    cancelAnimationFrame(certRaf.current);
    setPreview((p) => ({ ...p, show: false }));
  };

  // === Experience expand state ===
  const [openExpIndex, setOpenExpIndex] = useState(-1);
  const toggleExp = (i) => {
    setOpenExpIndex((cur) => (cur === i ? -1 : i));
  };
  const isPresent = (period) => /present/i.test(period);

  // === Animated Stats Counter ===
  const statsRef = useRef(null);
  const [statsStarted, setStatsStarted] = useState(false);
  const [years, setYears] = useState(0);
  const [certCount, setCertCount] = useState(0);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsStarted(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!statsStarted) return;

    const targetYears = 1.5;
    const targetCerts = 15;
    const duration = 1000;

    let start = null;
    let rafId = 0;

    function step(ts) {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const ease = (v) => 1 - Math.pow(1 - v, 3);

      setYears(Math.floor(ease(t) * targetYears));
      setCertCount(Math.floor(ease(t) * targetCerts));

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setYears(targetYears);
        setCertCount(targetCerts);
      }
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [statsStarted]);

  return (
    <>
      <Navbar />

      {/* Mesh grid behind content */}
      <InteractiveMeshGrid
        spacing={96}
        density={0.78}
        lineColor="rgba(255,255,255,0.03)"
        pointColor="rgba(168,85,247,0.95)"
        pointSize={1.6}
        warp={0.16}
        pointerSmoothing={0.16}
        spring={0.10}
        damping={0.84}
        disableBelow={420}
        maxPoints={1600}
      />

      <main className="text-foreground relative z-10">
        {/* ===== INTRO / STATS ===== */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8">
          {/* Heading */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="font-mono text-xs sm:text-sm text-emerald-300/80 mb-3">
              // about me
            </div>
            <h2 className="mx-auto max-w-3xl text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                There Are Miles To Go Before We Sleep
              </span>
            </h2>
            <p className="mt-2 sm:mt-3 text-sm text-foreground/60">
              A short reminder to keep building — one step at a time.
            </p>
          </div>

          {/* Bio */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.16),transparent_70%)] blur-2xl"
            />
            <p className="relative mx-auto max-w-3xl text-center text-sm sm:text-base leading-relaxed text-foreground/75">
              I&apos;m a Master&apos;s student in Artificial Intelligence at Monash, with two years
              building core banking systems at TCS. I move between full-stack engineering and
              applied ML — and I learn fastest by building things, breaking them, and figuring out
              exactly why.
            </p>
          </div>

          {/* Compact stats */}
          <div ref={statsRef} className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-4 sm:py-5 text-center transition-colors hover:border-indigo-500/40">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                {years}
                <span className="text-indigo-400">+</span>
              </div>
              <div className="mt-1 text-[11px] sm:text-sm text-foreground/60">
                Years experience
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-4 sm:py-5 text-center transition-colors hover:border-indigo-500/40">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                {certCount}
                <span className="text-indigo-400">+</span>
              </div>
              <div className="mt-1 text-[11px] sm:text-sm text-foreground/60">
                Certifications
              </div>
            </div>

            <a
              href="https://github.com/NIKSHITH-G"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-4 sm:py-5 text-center transition-colors hover:border-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              aria-label="Open my GitHub profile in a new tab"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                10<span className="text-indigo-400">+</span>
              </div>
              <div className="mt-1 text-[11px] sm:text-sm text-foreground/60 group-hover:text-foreground/80">
                Projects ↗
              </div>
            </a>
          </div>
        </section>

        {/* ===== EXPERIENCE ===== */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-8 sm:pb-12">
          <div className="mb-4 sm:mb-6">
            <div className="font-mono text-xs sm:text-sm text-emerald-300/80">// experience</div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Where I&apos;ve worked</h2>
          </div>

          <div className="space-y-4">
            {experience.map((exp, i) => {
              const expanded = openExpIndex === i;
              const showPreviewBullets = 2;
              const [role, company] = exp.title.split(" — ");
              const [dates, location] = exp.period.split(" • ");

              return (
                <motion.div
                  key={`exp-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.36, delay: i * 0.06 }}
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 transition-colors hover:border-indigo-500/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                          {role}
                        </h3>
                        {isPresent(exp.period) && (
                          <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-400/20">
                            Present
                          </span>
                        )}
                      </div>

                      {company && (
                        <div className="mt-0.5 text-sm font-medium text-indigo-300/90">
                          {company}
                        </div>
                      )}

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-foreground/45">
                        <span>{dates}</span>
                        {location && (
                          <>
                            <span className="text-foreground/25">•</span>
                            <span>{location}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExp(i)}
                      aria-expanded={expanded}
                      aria-controls={`exp-details-${i}`}
                      className="shrink-0 whitespace-nowrap rounded-md bg-white/5 px-3 py-1.5 text-xs sm:text-sm transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      {expanded ? "Collapse" : "Read more"}
                    </button>
                  </div>

                  <div className="mt-4" id={`exp-details-${i}`}>
                    <ul className="list-disc space-y-1.5 pl-4 text-xs text-foreground/80 marker:text-indigo-400/60 sm:space-y-2 sm:pl-5 sm:text-sm">
                      {exp.bullets.slice(0, showPreviewBullets).map((b, j) => (
                        <li key={`exp-${i}-b-${j}`}>{b}</li>
                      ))}
                    </ul>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28 }}
                          className="overflow-hidden"
                        >
                          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-foreground/80 marker:text-indigo-400/60 sm:mt-3 sm:space-y-2 sm:pl-5 sm:text-sm">
                            {exp.bullets.slice(showPreviewBullets).map((b, j) => (
                              <li key={`exp-${i}-more-${j}`}>{b}</li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ===== EDUCATION ===== */}
        <section id="education" className="mx-auto max-w-6xl px-4 sm:px-6 pb-8 sm:pb-12">
          <div className="mb-4 sm:mb-6">
            <div className="font-mono text-xs sm:text-sm text-emerald-300/80">// education</div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Where I studied</h2>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6">
            <Timeline milestones={milestones} />
          </div>
        </section>

        {/* ===== PROJECTS ===== */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-8 sm:pb-12">
          <div className="mb-4 sm:mb-6">
            <div className="font-mono text-xs sm:text-sm text-emerald-300/80">// projects</div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Things I&apos;ve built</h2>
          </div>
          <ProjectsGrid projects={projects} />
        </section>

        {/* ===== SKILLS & CERTIFICATIONS ===== */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-8 sm:pb-12 pt-4 sm:pt-8">
          <div className="mb-4 sm:mb-6">
            <div className="font-mono text-xs sm:text-sm text-emerald-300/80">// stack</div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Skills &amp; certifications</h2>
          </div>

          <div className="grid items-stretch gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
            {/* SKILLS — rendered as a code object in an editor window */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              {/* window chrome */}
              <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.015] px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 font-mono text-xs text-white/40">stack.js</span>
              </div>

              {/* code body with line-number gutter */}
              <div className="flex-1 overflow-x-auto p-4 sm:p-5 font-mono text-[12px] leading-6 sm:text-sm sm:leading-7">
                {(() => {
                  const lines = [
                    <>
                      <span className="text-violet-300">const</span>{" "}
                      <span className="text-sky-300">stack</span>{" "}
                      <span className="text-white/45">= {"{"}</span>
                    </>,
                    ...skillGroups.map((g) => (
                      <span className="pl-4">
                        <span className="text-emerald-300">{g.key}</span>
                        <span className="text-white/45">: [</span>
                        {g.items.map((s, i) => (
                          <span key={s}>
                            <span className="cursor-default text-amber-200/90 transition-colors hover:text-white">
                              &quot;{s}&quot;
                            </span>
                            {i < g.items.length - 1 && (
                              <span className="text-white/40">, </span>
                            )}
                          </span>
                        ))}
                        <span className="text-white/45">],</span>
                      </span>
                    )),
                    <>
                      <span className="text-white/45">{"}"}</span>
                      <span className="ml-1 inline-block h-4 w-[7px] translate-y-[2px] animate-pulse bg-violet-300/70 align-middle" />
                    </>,
                    <span className="text-white/25">{"// always learning, always shipping"}</span>,
                  ];
                  return lines.map((ln, i) => (
                    <div key={i} className="flex">
                      <span className="w-6 shrink-0 select-none pr-3 text-right text-white/20 sm:w-7">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
                        {ln}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>

            {/* CERTIFICATIONS — verified credentials panel */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              {/* panel header */}
              <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.015] px-4 py-2.5">
                <div className="flex items-center gap-2 font-mono text-xs text-white/45">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" aria-hidden>
                    <path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5l-8-3Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  credentials
                </div>
                <span className="font-mono text-xs text-white/30">
                  {certs.length} verified
                </span>
              </div>

              {/* credential rows */}
              <div className="flex-1 divide-y divide-white/5">
                {certs.map((c, i) => {
                  const [title, issuer] = c.split(" — ");
                  return (
                    <motion.div
                      key={`cert-${i}`}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                      onMouseEnter={(e) => showCertPreview(e, c)}
                      onMouseMove={moveCertPreview}
                      onMouseLeave={hideCertPreview}
                      tabIndex={0}
                      onFocus={(e) => showCertPreview(e, c)}
                      onBlur={hideCertPreview}
                      role="button"
                      aria-label={`Preview ${c}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="m5 12 5 5L20 6" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground/90">{title}</div>
                        {issuer && (
                          <div className="truncate font-mono text-xs text-foreground/45">{issuer}</div>
                        )}
                      </div>
                      <span className="shrink-0 font-mono text-xs text-indigo-300 opacity-0 transition-opacity group-hover:opacity-100">
                        view ↗
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* PREVIEW (desktop only) */}
              {preview.show && (() => {
                const safeLeft = Number.isFinite(preview.x) ? preview.x : -9999;
                const safeTop = Number.isFinite(preview.y) ? preview.y : -9999;
                return (
                  <div
                    className="fixed z-[60] pointer-events-none rounded-xl border border-white/20 bg-background/80 backdrop-blur-md shadow-2xl p-2 animate-[previewIn_140ms_ease-out] hidden md:block"
                    style={{
                      left: `${safeLeft}px`,
                      top: `${safeTop}px`,
                      width: 260,
                      height: 160,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview.src}
                      alt=""
                      className="h-full w-full object-contain rounded-md"
                      loading="lazy"
                    />
                  </div>
                );
              })()}
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}