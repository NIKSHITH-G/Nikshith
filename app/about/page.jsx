// app/about/page.jsx
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import Timeline from "../../components/Timeline";
import ProjectCard from "../../components/ProjectCard";
import ProjectsGrid from "../../components/ProjectsGrid";
import InteractiveWallpaper from "../../components/InteractiveWallpaper";

export default function About() {
  // ---- DATA ----
  const milestones = [
    {
      title: "Vellore Institute Of Technology",
      year: "2020-2024",
      image: "/images/Timeline/step1.png",
    },
    {
      title: "Narayana Saraswathi Pati",
      year: "2018-2020",
      image: "/images/Timeline/step2.png",
    },
    {
      title: "Narayana E-Techno School",
      year: "2016-2018",
      image: "/images/Timeline/step3.png",
    },
  ];

  const experience = [
    {
      title: "Systems Engineer — Tata Consultancy Services (TCS)",
      period: "Sep 2024 – Present • Bangalore, India",
      bullets: [
        "BFSI unit: core software development & maintenance in agile teams.",
        "Real-time issue resolution, RCA, and system enhancements.",
        "Deployments, monitoring, and automation with internal tooling.",
        "Worked on backend services, incident triage and CI/CD improvements.",
      ],
    },
    {
      title: "Web Developer — AR BRANDS (Intern)",
      period: "Jun–Jul 2023 • Remote",
      bullets: [
        "Gathered requirements and aligned dev with project goals.",
        "Built custom HTML/JS solutions and performed site testing.",
        "Shipped a smooth, bug-free user experience.",
        "Implemented responsive fixes and QA automation checks.",
      ],
    },
  ];

  // ===== PROJECTS =====
  // NOTE: ProjectsGrid expects each project to have: name, points, stack, slides (array of image urls)
  // Your previous code used "images" for ProjectCard; ProjectsGrid uses slides — we keep both below
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

    // Add more projects here — keep the same shape (name, points, stack, slides, images)
  ];

  const skills = [
    "Python",
    "Java",
    "React",
    "Next.js",
    "TypeScript",
    "HTML",
    "CSS",
    "PHP",
    "SQL",
    "Git",
    "OOP",
    "DBMS",
    "Blockchain",
    "AI",
    "ML",
  ];

  const certs = [
    "AWS Certified Cloud Practitioner — AWS",
    "Artificial Intelligence (Google Developers) — Externship (SMART INTERNZ)",
    "Web Developer Intern — AR BRANDS",
    "Full-Stack Web Developer (MERN) — PREGRAD",
    "Graduate Record Examination (GRE) — 322/340",
  ];

  // Map cert titles -> image paths (replace with your actual images)
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

  // === Skills wave interaction (position + color) ===
  const skillsContainerRef = useRef(null);
  const skillRefs = useRef([]);
  const skillsRaf = useRef(0);
  const glowRef = useRef(null);

  const safeNum = (n, fallback = 0) =>
    Number.isFinite(n) ? n : fallback;

  const handleSkillsMove = (e) => {
    const wrap = skillsContainerRef.current;
    if (!wrap) return;

    // guard getBoundingClientRect
    let rect;
    try {
      rect = wrap.getBoundingClientRect();
    } catch {
      return;
    }
    if (!rect) return;

    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : (e.clientX ?? null);
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : (e.clientY ?? null);
    if (clientX === null || clientY === null) return;

    const mxRaw = clientX - rect.left;
    const myRaw = clientY - rect.top;
    const mx = safeNum(mxRaw, 0);
    const my = safeNum(myRaw, 0);

    if (glowRef.current) {
      try {
        glowRef.current.style.left = `${mx}px`;
        glowRef.current.style.top = `${my}px`;
        glowRef.current.style.opacity = "1";
      } catch {
        /* ignore style write errors */
      }
    }

    cancelAnimationFrame(skillsRaf.current);
    skillsRaf.current = requestAnimationFrame(() => {
      const AMPLITUDE = 14;
      const RADIUS = 180;

      for (const el of skillRefs.current) {
        if (!el) continue;
        let r;
        try {
          r = el.getBoundingClientRect();
        } catch {
          continue;
        }
        if (!r) continue;

        const cxRaw = r.left - rect.left + r.width / 2;
        const cyRaw = r.top - rect.top + r.height / 2;
        const cx = safeNum(cxRaw, 0);
        const cy = safeNum(cyRaw, 0);

        const dx = mx - cx;
        const dy = my - cy;
        const d = Math.hypot(dx, dy);

        const t = Math.max(0, 1 - d / RADIUS);
        const lift = AMPLITUDE * t * t;
        const scaleRaw = 1 + 0.06 * t;
        const scale = safeNum(scaleRaw, 1);

        const alphaBgRaw = 0.05 + 0.25 * t;
        const alphaBg = safeNum(alphaBgRaw, 0.05);
        const alphaBorderRaw = 0.4 + 0.6 * t;
        const alphaBorder = safeNum(alphaBorderRaw, 0.4);

        // apply styles with guards
        try {
          el.style.transform = `translateY(${-safeNum(lift, 0)}px) scale(${scale})`;
          el.style.border = `1px solid rgba(99,102,241,${alphaBorder})`;
          el.style.backgroundColor = `rgba(99,102,241,${alphaBg})`;
          el.style.boxShadow = `0 10px 24px -12px rgba(99,102,241,${safeNum(0.35 * t, 0)})`;
          el.style.transition =
            "transform 120ms ease-out, background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease";
          el.style.willChange =
            "transform, background-color, border-color, box-shadow";
        } catch {
          // ignore style assignment errors in strange browsers/environments
        }
      }
    });
  };

  const handleSkillsLeave = () => {
    cancelAnimationFrame(skillsRaf.current);
    if (glowRef.current) {
      try {
        glowRef.current.style.opacity = "0";
      } catch {}
    }
    for (const el of skillRefs.current) {
      if (!el) continue;
      try {
        el.style.transform = "translateY(0) scale(1)";
        el.style.border = "1px solid rgba(99,102,241,0.4)";
        el.style.backgroundColor = "rgba(99,102,241,0.05)";
        el.style.boxShadow = "0 0 0 0 rgba(99,102,241,0)";
        el.style.transition = "all 300ms ease";
      } catch {}
    }
  };

  // === Certifications hover preview ===
  const [preview, setPreview] = useState({ show: false, x: 0, y: 0, src: "" });
  const certRaf = useRef(0);

  const showCertPreview = (e, title) => {
    const src = certImages[title] || "/images/certificates/placeholder.png";
    setPreview((p) => ({ ...p, show: true, src }));
    moveCertPreview(e);
  };

  const moveCertPreview = (e) => {
    cancelAnimationFrame(certRaf.current);

    // support touch events safely
    const px = (e.touches && e.touches[0]) ? e.touches[0].clientX : (e.clientX ?? null);
    const py = (e.touches && e.touches[0]) ? e.touches[0].clientY : (e.clientY ?? null);

    certRaf.current = requestAnimationFrame(() => {
      const OFFSET_X = 16;
      const OFFSET_Y = 16;

      const leftRaw = px !== null ? px + OFFSET_X : undefined;
      const topRaw = py !== null ? py + OFFSET_Y : undefined;

      const left = Number.isFinite(leftRaw) ? leftRaw : -9999;
      const top = Number.isFinite(topRaw) ? topRaw : -9999;

      // store finite numbers only
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

  // animate numbers when statsStarted becomes true
  useEffect(() => {
    if (!statsStarted) return;

    // target values (you asked for those exact displays)
    const targetYears = 1;
    const targetCerts = 15;
    const duration = 1000; // ms

    let start = null;
    let rafId = 0;

    function step(ts) {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / duration);

      const ease = (v) => 1 - Math.pow(1 - v, 3); // smooth ease-out

      setYears(Math.floor(ease(t) * targetYears));
      setCertCount(Math.floor(ease(t) * targetCerts));

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        // ensure exact at the end
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
      {/* Interactive live wallpaper sits behind content */}
      <InteractiveWallpaper />

      <main className="text-foreground relative z-10">
        {/* ===== INTRO / STATS (new) ===== */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-8">
          <div className="relative rounded-2xl p-6 border-2 border-white/6 bg-black/20 backdrop-blur-sm overflow-hidden">
            {/* Decorative soft gradient behind */}
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

            {/* Inspirational sentence */}
            <div className="relative z-10 text-center mb-6">
              <h2 className="mx-auto max-w-3xl text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                  There Are Miles To Go Before We Sleep
                </span>
              </h2>
              <p className="mt-3 text-sm text-foreground/70">
                A short reminder to keep building — one step at a time.
              </p>
            </div>

            {/* Stats row */}
            <div
              ref={statsRef}
              className="relative z-10 mt-6 grid grid-cols-3 gap-4 text-center items-center"
            >
              <div className="rounded-lg p-4 bg-white/3 border border-white/6 transition-transform duration-200 transform">
                <div className="text-3xl sm:text-4xl font-bold">
                  {years}
                  <span className="text-lg ml-1">+</span>
                </div>
                <div className="mt-1 text-sm text-foreground/70">
                  Years Experience
                </div>
              </div>

              <div className="rounded-lg p-4 bg-white/3 border border-white/6 transition-transform duration-200 transform">
                <div className="text-3xl sm:text-4xl font-bold">
                  {certCount}+
                </div>
                <div className="mt-1 text-sm text-foreground/70">
                  Certifications
                </div>
              </div>

              {/* Projects → clickable GitHub (fixed display: 10+) */}
              <a
                href="https://github.com/NIKSHITH-G"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-4 bg-white/3 border border-white/6 hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                aria-label="Open my GitHub profile in a new tab"
              >
                <div className="text-3xl sm:text-4xl font-bold">10+</div>
                <div className="mt-1 text-sm text-foreground/70">Projects</div>
              </a>
            </div>
          </div>
        </section>

        {/* ===== EXPERIENCE ===== */}
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="text-2xl font-bold mb-6">Experience</h2>

          <div className="relative rounded-2xl border-2 border-white/30 p-6">
            {/* Scrollable list */}
            <div
              className="space-y-6 overflow-y-auto pr-6"
              style={{
                maxHeight: "420px",
                scrollbarGutter: "stable both-edges",
              }}
            >
              {experience.map((exp, i) => {
                const expanded = openExpIndex === i;
                const showPreviewBullets = 2; // number of bullets shown when collapsed

                return (
                  <motion.div
                    key={`exp-${i}`}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.36, delay: i * 0.06 }}
                    className="relative rounded-xl border border-indigo-500/40 p-5 bg-[rgba(255,255,255,0.02)] backdrop-blur-sm group transform transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_-18px_rgba(99,102,241,0.25)]"
                    style={{ WebkitBackdropFilter: "blur(6px)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg tracking-tight">
                            {exp.title}
                          </h3>

                          {isPresent(exp.period) && (
                            <span
                              className="ml-1 inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-500/30 to-violet-500/20 text-indigo-200 ring-1 ring-indigo-400/10 shadow-[0_6px_20px_-12px_rgba(99,102,241,0.45)]"
                              aria-hidden
                            >
                              Present
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-foreground/70 mt-1">
                          {exp.period}
                        </div>
                      </div>

                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => toggleExp(i)}
                          aria-expanded={expanded}
                          aria-controls={`exp-details-${i}`}
                          className="text-sm rounded-md px-3 py-1 bg-white/5 hover:bg-white/6 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        >
                          {expanded ? "Collapse" : "Read more"}
                        </button>
                      </div>
                    </div>

                    {/* bullets: collapsed preview + expand animation */}
                    <div className="mt-4" id={`exp-details-${i}`}>
                      <ul className="list-disc pl-5 text-sm space-y-2 text-foreground/90">
                        {exp.bullets
                          .slice(0, showPreviewBullets)
                          .map((b, j) => (
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
                            <ul className="list-disc pl-5 text-sm mt-3 space-y-2 text-foreground/90">
                              {exp.bullets
                                .slice(showPreviewBullets)
                                .map((b, j) => (
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
          </div>
        </section>

        {/* ===== EDUCATION ===== */}
        <section id="education" className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="text-2xl font-bold mb-6">Education</h2>
          <div className="rounded-2xl border-2 border-white/30 p-6">
            <Timeline milestones={milestones} />
          </div>
        </section>

        {/* ===== PROJECTS ===== */}
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>

          {/* Use your ProjectsGrid component: it already implements the horizontal scroller + snap.
              ProjectsGrid uses the `projects` array (with slides) so pass that in. */}
          <ProjectsGrid projects={projects} />
        </section>

        {/* ===== SKILLS & CERTIFICATIONS (unchanged) ===== */}
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-8">
          <h2 className="text-2xl font-bold mb-6">Skills & Certifications</h2>

          <div
            className="
      relative rounded-2xl border-2 border-white/30 p-6 grid items-start gap-10 md:grid-cols-2
      before:content-[''] before:absolute before:inset-0 before:rounded-2xl
      before:bg-[conic-gradient(from_180deg,rgba(99,102,241,0.16),transparent,rgba(168,85,247,0.14),transparent)]
      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
      before:blur-[20px] before:pointer-events-none
    "
          >
            {/* Skills (left) */}
            <div
              ref={skillsContainerRef}
              onMouseMove={handleSkillsMove}
              onMouseLeave={handleSkillsLeave}
              className="relative"
            >
              <div
                ref={glowRef}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-[280px] h-[180px] rounded-full opacity-0 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)] blur-2xl"
                style={{ left: 0, top: 0 }}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {skills.map((s, i) => (
                  <motion.div
                    key={`skill-${s}-${i}`}
                    ref={(el) => (skillRefs.current[i] = el)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="relative group overflow-hidden rounded-lg px-3 py-2 text-sm text-center select-none"
                    style={{
                      transform: "translateY(0) scale(1)",
                      border: "1px solid rgba(99,102,241,0.4)",
                      backgroundColor: "rgba(99,102,241,0.05)",
                      boxShadow: "0 0 0 0 rgba(99,102,241,0)",
                    }}
                  >
                    <span className="pointer-events-none absolute -inset-1 translate-x-[-150%] group-hover:animate-[sheen_700ms_ease] bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.28),transparent)] w-1/2" />
                    {s}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Certifications (right) — scrollable independently */}
            <div className="relative">
              <div
                className="space-y-3 overflow-y-auto pr-6 certs-scroll"
                style={{
                  maxHeight: "260px",
                  scrollbarGutter: "stable both-edges",
                }}
              >
                <div className="md:max-h-[420px]" />

                {certs.map((c, i) => (
                  <motion.div
                    key={`cert-${i}`}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: i * 0.1 }}
                    className="relative overflow-hidden rounded-lg border border-indigo-500/40 px-4 py-3 text-sm bg-background/60 transition-all hover:translate-x-[2px] before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0 hover:before:w-[6px] before:bg-indigo-500/70 before:transition-[width] before:duration-200"
                    onMouseEnter={(e) => showCertPreview(e, c)}
                    onMouseMove={moveCertPreview}
                    onMouseLeave={hideCertPreview}
                    tabIndex={0}
                    onFocus={(e) => showCertPreview(e, c)}
                    onBlur={hideCertPreview}
                    role="button"
                    aria-label={`Preview ${c}`}
                  >
                    {c}
                  </motion.div>
                ))}
              </div>

              {preview.show && (() => {
                const safeLeft = Number.isFinite(preview.x) ? preview.x : -9999;
                const safeTop = Number.isFinite(preview.y) ? preview.y : -9999;
                return (
                  <div
                    className="fixed z-[60] pointer-events-none rounded-xl border border-white/20 bg-background/80 backdrop-blur-md shadow-2xl p-2 animate-[previewIn_140ms_ease-out]"
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
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
