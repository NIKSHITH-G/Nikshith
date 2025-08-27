"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Timeline from "../../components/Timeline";

export default function About() {
  // ---- DATA ----
  const milestones = [
    { title: "Vellore Institute Of Technology", year: "2020-2024", image: "/images/Timeline/step1.png" },
    { title: "Narayana Saraswathi Pati",        year: "2018-2020", image: "/images/Timeline/step2.png" },
    { title: "Narayana E-Techno School",        year: "2016-2018", image: "/images/Timeline/step3.png" },
  ];

  const experience = [
    {
      title: "Systems Engineer — Tata Consultancy Services (TCS)",
      period: "Sep 2024 – Present • Bangalore, India",
      bullets: [
        "BFSI unit: core software development & maintenance in agile teams.",
        "Real-time issue resolution, RCA, and system enhancements.",
        "Deployments, monitoring, and automation with internal tooling.",
      ],
    },
    {
      title: "Web Developer — AR BRANDS (Intern)",
      period: "Jun–Jul 2023 • Remote",
      bullets: [
        "Gathered requirements and aligned dev with project goals.",
        "Built custom HTML/JS solutions and performed site testing.",
        "Shipped a smooth, bug-free user experience.",
      ],
    },
  ];

  const projects = [
    {
      name: "Blockchain-Based Secure Data Storage",
      points: [
        "AES for encryption + SHA-512 for hashing; privacy-preserving scheme.",
        "Smart contracts for secondary verification & access control.",
        "Compared MD5, SHA-1, SHA-256, SHA-512 for security vs performance.",
      ],
      stack: ["Blockchain (Private/Public)", "AES", "SHA-512", "MySQL", "HTML", "CSS"],
    },
    {
      name: "TOCOMO — Secure Blockchain Wallet",
      points: [
        "MetaMask auth & transaction signing.",
        "Next.js UI with Web3.js to send/receive ETH.",
        "Sanity.io for dynamic content management.",
      ],
      stack: ["Next.js", "Web3.js", "Sanity.io", "MetaMask", "CSS"],
    },
  ];

  const skills = [
    "Python", "Java", "React", "Next.js", "TypeScript", "HTML", "CSS", "PHP", "SQL", "Git",
    "OOP", "DBMS", "Blockchain", "AI", "ML",
  ];

  const certs = [
    "AWS Certified Cloud Practitioner — AWS",
    "Artificial Intelligence (Google Developers) — Externship (SMART INTERNZ)",
    "Web Developer Intern — AR BRANDS",
    "Full-Stack Web Developer (MERN) — PREGRAD",
  ];

  // Map cert titles -> image paths (replace with your actual images)
  const certImages = {
    "AWS Certified Cloud Practitioner — AWS": "/images/certificates/AWS CLOUD PARTIONEER.jpg",
    "Artificial Intelligence (Google Developers) — Externship (SMART INTERNZ)":
      "/images/certificates/SmartBridge_AI.png",
    "Web Developer Intern — AR BRANDS": "/images/certificates/AR-BRANDS.png",
    "Full-Stack Web Developer (MERN) — PREGRAD": "/images/certificates/PREGRAD.jpg",
  };

  // === Skills wave interaction (position + color) ===
  const skillsContainerRef = useRef(null);
  const skillRefs = useRef([]);
  const skillsRaf = useRef(0);

  // (optional) soft glow under the cursor in the skills grid
  const glowRef = useRef(null);

  const handleSkillsMove = (e) => {
    const wrap = skillsContainerRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // move glow
    if (glowRef.current) {
      glowRef.current.style.left = `${mx}px`;
      glowRef.current.style.top  = `${my}px`;
      glowRef.current.style.opacity = 1;
    }

    cancelAnimationFrame(skillsRaf.current);
    skillsRaf.current = requestAnimationFrame(() => {
      const AMPLITUDE = 14; // px lift
      const RADIUS = 180;   // px influence

      for (const el of skillRefs.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const cx = r.left - rect.left + r.width / 2;
        const cy = r.top - rect.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const d = Math.hypot(dx, dy);

        const t = Math.max(0, 1 - d / RADIUS); // 0..1 proximity
        const lift = AMPLITUDE * t * t;
        const scale = 1 + 0.06 * t;

        // Color shift with proximity
        const alphaBg = 0.05 + 0.25 * t;   // 0.05 → 0.30
        const alphaBorder = 0.4 + 0.6 * t; // 0.40 → 1.00

        el.style.transform = `translateY(${-lift}px) scale(${scale})`;
        el.style.border = `1px solid rgba(99,102,241,${alphaBorder})`;
        el.style.backgroundColor = `rgba(99,102,241,${alphaBg})`;
        el.style.boxShadow = `0 10px 24px -12px rgba(99,102,241,${0.35 * t})`;
        el.style.transition = "transform 120ms ease-out, background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease";
        el.style.willChange = "transform, background-color, border-color, box-shadow";
      }
    });
  };

  const handleSkillsLeave = () => {
    cancelAnimationFrame(skillsRaf.current);
    if (glowRef.current) glowRef.current.style.opacity = 0;
    for (const el of skillRefs.current) {
      if (!el) continue;
      el.style.transform = "translateY(0) scale(1)";
      el.style.border = "1px solid rgba(99,102,241,0.4)";
      el.style.backgroundColor = "rgba(99,102,241,0.05)";
      el.style.boxShadow = "0 0 0 0 rgba(99,102,241,0)";
      el.style.transition = "all 300ms ease";
    }
  };

  // === Certifications hover preview ===
  const [preview, setPreview] = useState({
    show: false,
    x: 0,
    y: 0,
    src: "",
  });
  const certRaf = useRef(0);

  const showCertPreview = (e, title) => {
    const src = certImages[title] || "/images/certificates/placeholder.png";
    setPreview((p) => ({ ...p, show: true, src }));
    moveCertPreview(e);
  };

  const moveCertPreview = (e) => {
    cancelAnimationFrame(certRaf.current);
    const { clientX, clientY } = e;
    certRaf.current = requestAnimationFrame(() => {
      const OFFSET_X = 16;
      const OFFSET_Y = 16;
      setPreview((p) => ({ ...p, x: clientX + OFFSET_X, y: clientY + OFFSET_Y }));
    });
  };

  const hideCertPreview = () => {
    cancelAnimationFrame(certRaf.current);
    setPreview((p) => ({ ...p, show: false }));
  };

  return (
    <>
      <Navbar />

      <main className="text-foreground">
        {/* ===== EXPERIENCE (FIRST) ===== */}
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-12">
          <h2 className="text-2xl font-bold mb-6">Experience</h2>
          <div className="rounded-2xl border-2 border-white/30 p-6 space-y-6">
            {experience.map((exp, i) => (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl border border-indigo-500/40 p-5"
              >
                <div className="font-semibold">{exp.title}</div>
                <div className="text-sm text-foreground/70 mb-3">{exp.period}</div>
                <ul className="space-y-2 text-sm list-disc pl-5">
                  {exp.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== EDUCATION (TIMELINE, SINGLE OUTER OUTLINE ONLY) ===== */}
        <section id="education" className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="text-2xl font-bold mb-6">Education</h2>
          <div className="rounded-2xl border-2 border-white/30 p-6">
            <Timeline milestones={milestones} />
          </div>
        </section>

        {/* ===== PROJECTS ===== */}
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Projects</h2>
          <div className="rounded-2xl border-2 border-white/30 p-6 grid gap-6 md:grid-cols-2">
            {projects.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl border border-indigo-500/40 p-5"
              >
                <div className="font-semibold text-lg mb-2">{p.name}</div>
                <ul className="space-y-2 text-sm list-disc pl-5 mb-4">
                  {p.points.map((pt, j) => (
                    <li key={j}>{pt}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="text-xs rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== SKILLS & CERTIFICATIONS ===== */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="text-2xl font-bold mb-6">Skills & Certifications</h2>

          {/* Outer outline + subtle conic ring */}
          <div className="
            relative rounded-2xl border-2 border-white/30 p-6 grid gap-10 md:grid-cols-2
            before:content-[''] before:absolute before:inset-0 before:rounded-2xl
            before:bg-[conic-gradient(from_180deg,rgba(99,102,241,0.16),transparent,rgba(168,85,247,0.14),transparent)]
            before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
            before:blur-[20px] before:pointer-events-none
          ">
            {/* Skills */}
            <div
              ref={skillsContainerRef}
              onMouseMove={handleSkillsMove}
              onMouseLeave={handleSkillsLeave}
              className="relative"
            >
              {/* cursor-follow glow */}
              <div
                ref={glowRef}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2
                           w-[280px] h-[180px] rounded-full opacity-0 transition-opacity duration-300
                           bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)]
                           blur-2xl"
                style={{ left: 0, top: 0 }}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {skills.map((s, i) => (
                  <motion.div
                    key={s}
                    ref={(el) => (skillRefs.current[i] = el)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="
                      relative group overflow-hidden rounded-lg px-3 py-2 text-sm text-center select-none
                    "
                    style={{
                      transform: "translateY(0) scale(1)",
                      border: "1px solid rgba(99,102,241,0.4)",
                      backgroundColor: "rgba(99,102,241,0.05)",
                      boxShadow: "0 0 0 0 rgba(99,102,241,0)",
                    }}
                  >
                    {/* Sheen pass */}
                    <span
                      className="pointer-events-none absolute -inset-1 translate-x-[-150%] group-hover:animate-[sheen_700ms_ease]
                                 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.28),transparent)] w-1/2"
                    />
                    {s}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div className="space-y-3">
                {certs.map((c, i) => (
                  <motion.div
                    key={c}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: i * 0.1 }}
                    className="
                      relative overflow-hidden rounded-lg border border-indigo-500/40 px-4 py-3 text-sm bg-background/60
                      transition-all hover:translate-x-[2px]
                      before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0
                      hover:before:w-[6px] before:bg-indigo-500/70 before:transition-[width] before:duration-200
                    "
                    onMouseEnter={(e) => showCertPreview(e, c)}
                    onMouseMove={moveCertPreview}
                    onMouseLeave={hideCertPreview}
                  >
                    {c}
                  </motion.div>
                ))}
              </div>

              {/* Floating preview window with fade/scale */}
              {preview.show && (
                <div
                  className="fixed z-[60] pointer-events-none rounded-xl border border-white/20 bg-background/80 backdrop-blur-md shadow-2xl p-2
                             animate-[previewIn_140ms_ease-out]"
                  style={{
                    left: preview.x,
                    top: preview.y,
                    width: 260,
                    height: 160,
                  }}
                >
                  <img
                    src={preview.src}
                    alt=""
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
