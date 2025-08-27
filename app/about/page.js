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
    "AWS Certified Cloud Practitioner — AWS": "images/certificates/AWS CLOUD PARTIONEER.jpg",
    "Artificial Intelligence (Google Developers) — Externship (SMART INTERNZ)":
      "images/certificates/SmartBridge_AI.png",
    "Web Developer Intern — AR BRANDS": "images/certificates/AR-BRANDS.png",
    "Full-Stack Web Developer (MERN) — PREGRAD": "images/certificates/PREGRAD.jpg",
  };

  // === Skills wave interaction (position + color) ===
  const skillsContainerRef = useRef(null);
  const skillRefs = useRef([]);
  const skillsRaf = useRef(0);

  const handleSkillsMove = (e) => {
    const wrap = skillsContainerRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    cancelAnimationFrame(skillsRaf.current);
    skillsRaf.current = requestAnimationFrame(() => {
      const AMPLITUDE = 14;
      const RADIUS = 180;

      for (const el of skillRefs.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const cx = r.left - rect.left + r.width / 2;
        const cy = r.top - rect.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const d = Math.hypot(dx, dy);

        const t = Math.max(0, 1 - d / RADIUS);
        const lift = AMPLITUDE * t * t;
        const scale = 1 + 0.06 * t;

        const alphaBg = 0.05 + 0.25 * t;
        const alphaBorder = 0.4 + 0.6 * t;

        el.style.transform = `translateY(${-lift}px) scale(${scale})`;
        el.style.border = `1px solid rgba(99,102,241,${alphaBorder})`;
        el.style.backgroundColor = `rgba(99,102,241,${alphaBg})`;
        el.style.transition =
          "transform 120ms ease-out, background-color 150ms ease, border-color 150ms ease";
        el.style.willChange = "transform, background-color, border-color";
      }
    });
  };

  const handleSkillsLeave = () => {
    cancelAnimationFrame(skillsRaf.current);
    for (const el of skillRefs.current) {
      if (!el) continue;
      el.style.transform = "translateY(0) scale(1)";
      el.style.border = "1px solid rgba(99,102,241,0.4)";
      el.style.backgroundColor = "rgba(99,102,241,0.05)";
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
        {/* ===== EXPERIENCE ===== */}
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

          <div className="rounded-2xl border-2 border-white/30 p-6 grid gap-10 md:grid-cols-2">
            {/* Skills */}
            <div
              ref={skillsContainerRef}
              onMouseMove={handleSkillsMove}
              onMouseLeave={handleSkillsLeave}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {skills.map((s, i) => (
                  <motion.div
                    key={s}
                    ref={(el) => (skillRefs.current[i] = el)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="rounded-lg px-3 py-2 text-sm text-center select-none"
                    style={{
                      transform: "translateY(0) scale(1)",
                      border: "1px solid rgba(99,102,241,0.4)",
                      backgroundColor: "rgba(99,102,241,0.05)",
                    }}
                  >
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
                    className="rounded-lg border border-indigo-500/40 px-4 py-3 text-sm bg-background/60"
                    onMouseEnter={(e) => showCertPreview(e, c)}
                    onMouseMove={moveCertPreview}
                    onMouseLeave={hideCertPreview}
                  >
                    {c}
                  </motion.div>
                ))}
              </div>

              {/* Floating preview window */}
              {preview.show && (
                <div
                  className="fixed z-[60] pointer-events-none rounded-xl border border-white/20 bg-background/80 backdrop-blur-md shadow-2xl p-2"
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
