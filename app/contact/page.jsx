// app/contact/page.jsx
// npm i @emailjs/browser
// Fill in the three EMAILJS_ constants + YOUR_EMAIL below

"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";
import emailjs from "@emailjs/browser";
import InteractiveMeshGrid from "../../components/InteractiveMeshGrid";

const EMAILJS_SERVICE_ID  = "service_mc8ysnm";
const EMAILJS_TEMPLATE_ID_MAIN = "template_gedrp5l";
const EMAILJS_TEMPLATE_ID_AUTO = "template_rowmn13";
const EMAILJS_PUBLIC_KEY  = "UyM8c_VmTl027Xvxk";
const YOUR_EMAIL          = "nikshith.online@email.com";
const MAX_CHARS           = 500;

// ── Social links ──────────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/NIKSHITH-G",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/nikshith-g",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: `mailto:${YOUR_EMAIL}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 7 10 7 10-7" />
      </svg>
    ),
  },
];

// ── Particle burst ────────────────────────────────────────────────────────────
function ParticleBurst({ active }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2;
    const colors = ["#a78bfa", "#c4b5fd", "#f0ece4", "#7c3aed", "#ddd6fe", "#e9d5ff"];
    const particles = Array.from({ length: 54 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.018 + Math.random() * 0.025,
        r: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14;
        p.life -= p.decay;
        if (p.life <= 0) continue;
        alive = true;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (alive) rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 9998,
      }}
    />
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      display: "flex", alignItems: "center", gap: "12px",
      padding: "14px 20px", borderRadius: "12px",
      border: `1px solid ${type === "success" ? "rgba(167,139,250,0.45)" : "rgba(248,113,113,0.4)"}`,
      background: type === "success" ? "rgba(109,40,217,0.28)" : "rgba(153,27,27,0.28)",
      backdropFilter: "blur(20px)",
      color: type === "success" ? "#e9d5ff" : "#fca5a5",
      fontFamily: "'DM Mono', monospace",
      fontSize: "12px", letterSpacing: "0.06em",
      maxWidth: "320px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      animation: "toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <span style={{ fontSize: "18px" }}>{type === "success" ? "✓" : "✗"}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{
        marginLeft: "auto", background: "none", border: "none",
        color: "inherit", cursor: "pointer", opacity: 0.5,
        fontSize: "18px", lineHeight: 1, padding: "0 2px",
      }}>×</button>
    </div>
  );
}

// ── Magnetic tilt wrapper ─────────────────────────────────────────────────────
function TiltCard({ children, className }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left)  / r.width  - 0.5;
    const y = (e.clientY - r.top)   / r.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1.01)`;
  };
  const handleLeave = () => {
    if (ref.current)
      ref.current.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1)";
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: "transform 0.4s ease", willChange: "transform" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Contact() {
  const formRef = useRef(null);
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus]   = useState("idle");
  const [toast, setToast]     = useState(null);
  const [focused, setFocused] = useState(null);
  const [time, setTime]       = useState("");
  const [burst, setBurst]     = useState(false);

  useScrollReveal();

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-AU", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        timeZone: "Australia/Melbourne",
      }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > MAX_CHARS) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ validation
  if (!form.name || !form.email || !form.message) {
    setToast({ message: "Please fill all required fields", type: "error" });
    return;
  }

  setStatus("sending");

  try {
    const templateParams = {
      from_name: form.name,
      from_email: form.email,
      subject: form.subject,
      message: form.message,
    };

    // 📩 Send email to YOU
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_MAIN,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    // 📩 Send auto-reply to USER
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_AUTO,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    // ✅ success UI
    setStatus("sent");
    setForm({ name: "", email: "", subject: "", message: "" });
    setToast({ message: "Message sent! I'll get back to you soon.", type: "success" });

    // 🎉 animation
    setBurst(true);
    setTimeout(() => setBurst(false), 2800);

  } catch (err) {
    console.error("EmailJS Error:", err);
    setStatus("error");
    setToast({ message: "Something went wrong. Try again.", type: "error" });
  } finally {
    setTimeout(() => setStatus("idle"), 3000);
  }
};

  const charsLeft   = MAX_CHARS - form.message.length;
  const charPercent = ((MAX_CHARS - charsLeft) / MAX_CHARS) * 100;
  const charColor   = charsLeft <= 10 ? "#f87171" : charsLeft <= 50 ? "#fbbf24" : "#a78bfa";

  const inputBase = (name) => ({
    width: "100%",
    background: focused === name ? "rgba(167,139,250,0.06)" : "rgba(255,255,255,0.03)",
    border: "none",
    borderBottom: `1.5px solid ${focused === name ? "#a78bfa" : "rgba(255,255,255,0.18)"}`,
    borderRadius: 0,
    padding: "12px 6px",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    outline: "none",
    transition: "border-color 0.25s, background 0.25s",
    boxSizing: "border-box",
    letterSpacing: "0.03em",
  });

  const labelStyle = {
    display: "block",
    fontSize: "9px",
    letterSpacing: "0.26em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "6px",
    fontFamily: "'DM Mono', monospace",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Scroll reveal ── */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.75s cubic-bezier(.4,0,.2,1), transform 0.75s cubic-bezier(.4,0,.2,1);
        }
        .reveal.revealed { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.1s; }
        .reveal-d2 { transition-delay: 0.22s; }
        .reveal-d3 { transition-delay: 0.36s; }
        .reveal-d4 { transition-delay: 0.5s; }

        /* ── Page ── */
        .cp {
          min-height: 100vh;
          background: transparent;
          color: #fff;
          font-family: 'DM Mono', 'Courier New', monospace;
          position: relative;
          z-index: 10;
        }
        .cw {
          max-width: 1120px;
          margin: 0 auto;
          padding: 5rem 2rem 4rem;
        }

        /* ── Top bar ── */
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3.5rem;
          border-bottom: 1px solid rgba(167,139,250,0.2);
          padding-bottom: 1rem;
        }
        .tbl {
          font-size: 9px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }
        .tbc { font-size: 11px; letter-spacing: 0.1em; color: rgba(255,255,255,0.35); }
        .tbc em { font-style: normal; color: #a78bfa; }

        /* ── Headline ── */
        .headline {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(3.4rem, 8.5vw, 6.8rem);
          font-weight: 400;
          line-height: 1.02;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0 0 1rem;
          text-shadow: 0 2px 48px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.6);
        }
        /* word-by-word entrance */
        .hw span {
          display: inline-block;
          opacity: 0;
          transform: translateY(36px);
          animation: wup 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes wup { to { opacity: 1; transform: translateY(0); } }
        .hw em {
          font-style: italic;
          color: #c4b5fd;
          display: inline-block;
          animation: wup 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.5s both, float 4s 1.2s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-7px); }
        }

        /* ── Subline ── */
        .subline {
          font-size: 13px;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.75);
          max-width: 440px;
          line-height: 2.1;
          margin-bottom: 2.5rem;
          text-shadow: 0 1px 16px rgba(0,0,0,0.8);
        }

        /* ── Social row ── */
        .social-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4rem; }
        .sp {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 16px; border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px; color: rgba(255,255,255,0.75);
          font-size: 11px; letter-spacing: 0.08em;
          text-decoration: none;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(8px);
          transition: border-color .2s, color .2s, background .2s, transform .2s;
          font-family: 'DM Mono', monospace;
        }
        .sp:hover {
          border-color: #a78bfa; color: #e9d5ff;
          background: rgba(167,139,250,0.15); transform: translateY(-2px);
        }
        .avail {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 16px; border: 1px solid rgba(52,211,153,0.4);
          border-radius: 100px; color: #6ee7b7; font-size: 11px;
          letter-spacing: 0.08em; background: rgba(52,211,153,0.08);
          font-family: 'DM Mono', monospace;
        }
        .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #34d399;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(52,211,153,.5); }
          50%      { opacity:.5; box-shadow: 0 0 0 5px rgba(52,211,153,0); }
        }

        /* ── Main grid ── */
        .mg {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(167,139,250,0.22);
          background: rgba(8,6,18,0.65);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          box-shadow: 0 0 0 1px rgba(167,139,250,0.07) inset, 0 32px 80px rgba(0,0,0,0.55);
        }
        @media(max-width:700px) {
          .mg { grid-template-columns: 1fr; }
          .ip { border-right: none !important; border-bottom: 1px solid rgba(167,139,250,0.15); }
        }

        /* ── Info panel ── */
        .ip {
          padding: 3rem 2.5rem;
          border-right: 1px solid rgba(167,139,250,0.15);
          display: flex; flex-direction: column; gap: 2.5rem;
          min-height: 520px;
        }
        .ii { font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(167,139,250,0.7); }
        .ist {
          font-family: 'Instrument Serif', serif; font-size: 1.4rem;
          font-weight: 400; font-style: italic; color: #f0ece4; margin: 0 0 0.6rem;
        }
        .ib { font-size: 12px; line-height: 2.1; color: rgba(255,255,255,0.65); letter-spacing: 0.03em; }
        .cdr {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; color: rgba(255,255,255,0.5);
          margin-top: 0.5rem; text-decoration: none;
          letter-spacing: 0.04em;
          transition: color .2s, transform .2s;
        }
        .cdr:hover { color: #c4b5fd; transform: translateX(4px); }

        /* ── Form panel ── */
        .fp { padding: 3rem 2.5rem; }
        .fr { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
        .fd { margin-bottom: 1.8rem; }

        /* ── Char bar ── */
        .cbw { margin-top: 8px; display: flex; align-items: center; gap: 10px; }
        .cbb { flex: 1; height: 2px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
        .cbf { height: 100%; border-radius: 2px; transition: width .2s, background .3s; }
        .ccl { font-size: 10px; letter-spacing: 0.08em; min-width: 64px; text-align: right; font-family: 'DM Mono', monospace; transition: color .3s; }

        /* ── Submit row ── */
        .sr { display: flex; align-items: center; justify-content: space-between; margin-top: 2.5rem; gap: 1rem; flex-wrap: wrap; }
        .sh { font-size: 10px; letter-spacing: 0.06em; color: rgba(255,255,255,0.3); max-width: 190px; line-height: 1.7; }

        /* ── Send button ── */
        .sbtn {
          position: relative; display: inline-flex; align-items: center; gap: 10px;
          padding: 13px 30px;
          background: linear-gradient(135deg, #6d28d9, #9333ea);
          color: #fff; border: none; border-radius: 100px;
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 0.16em; text-transform: uppercase;
          cursor: pointer; overflow: hidden;
          box-shadow: 0 4px 28px rgba(109,40,217,0.55);
          transition: transform .2s, box-shadow .2s;
        }
        .sbtn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #9333ea, #c084fc);
          opacity: 0; transition: opacity .3s;
        }
        .sbtn:hover:not(:disabled)::after { opacity: 1; }
        .sbtn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 40px rgba(109,40,217,0.75); }
        .sbtn:active:not(:disabled) { transform: scale(0.97); }
        .sbtn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sbtn > * { position: relative; z-index: 1; }
        .ripple {
          position: absolute; border-radius: 50%; background: rgba(255,255,255,0.28);
          transform: scale(0); animation: rippleOut .65s linear; pointer-events: none;
        }
        @keyframes rippleOut { to { transform: scale(5); opacity: 0; } }
        .ba { transition: transform .25s; }
        .sbtn:hover:not(:disabled) .ba { transform: translateX(4px); }

        /* ── Footer ── */
        .pf {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 6px; padding: 1rem 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        @keyframes toastIn {
          from { transform: translateY(20px) scale(0.94); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }

        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(8,6,18,0.95) inset;
          -webkit-text-fill-color: #fff;
        }
        textarea { resize: none; }
      `}</style>

      <Navbar />

      <InteractiveMeshGrid
        spacing={96} density={0.78}
        lineColor="rgba(255,255,255,0.03)"
        pointColor="rgba(168,85,247,0.95)"
        pointSize={1.6} warp={0.16}
        pointerSmoothing={0.16} spring={0.1}
        damping={0.84} disableBelow={420} maxPoints={1600}
      />

      <div className="cp">
        <div className="cw">

          {/* Top bar */}
          <div className="top-bar reveal">
            <span className="tbl">Contact — Nikshith</span>
            <span className="tbc">Melbourne <em>{time}</em></span>
          </div>

          {/* Headline — word-by-word entrance */}
          <h1 className="headline hw">
            {["Let's", "build"].map((w, i) => (
              <span key={w} style={{ animationDelay: `${i * 0.13}s`, marginRight: "0.25em" }}>{w}</span>
            ))}
            <br />
            <span style={{ animationDelay: "0.28s", marginRight: "0.25em" }}>something</span>
            {" "}<em>real.</em>
          </h1>

          <p className="subline reveal reveal-d1">
            Collaborations, ideas, roles, or just a good conversation —
            I read every message personally.
          </p>

          {/* Social row */}
          <div className="social-row reveal reveal-d2">
            <span className="avail"><span className="dot" />Open to roles &amp; collabs</span>
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="sp">
                {s.icon}{s.label}
              </a>
            ))}
          </div>

          {/* Grid with tilt */}
          <TiltCard className="mg reveal reveal-d3">

            {/* Info panel */}
            <div className="ip">
              <span className="ii">01 / Info</span>

              <div>
                <p className="ist">How I work</p>
                <p className="ib">
                  I&apos;m a Master&apos;s student in AI at Monash with a background
                  in full-stack engineering. I care about clear thinking,
                  solid code, and building things that actually matter.
                </p>
              </div>

              <div>
                <p className="ist">Response time</p>
                <p className="ib">
                  Usually within 24–48 hours — unless I&apos;m deep in a
                  debugging hole. Detailed messages get detailed replies.
                </p>
              </div>

              <div>
                <a href={`mailto:${YOUR_EMAIL}`} className="cdr">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
                  </svg>
                  {YOUR_EMAIL}
                </a>
                <a href="https://github.com/NIKSHITH-G" target="_blank" rel="noreferrer" className="cdr">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  github.com/NIKSHITH-G
                </a>
              </div>
            </div>

            {/* Form panel */}
            <div className="fp">
              <div style={{ marginBottom: "2rem" }}>
                <span className="ii">02 / Message</span>
              </div>

              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="fr">
                  <div>
                    <label htmlFor="name" style={labelStyle}>Name</label>
                    <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                      onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                      placeholder="Your name" style={inputBase("name")} />
                  </div>
                  <div>
                    <label htmlFor="email" style={labelStyle}>Email *</label>
                    <input id="email" name="email" type="email" required value={form.email} onChange={handleChange}
                      onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                      placeholder="you@example.com" style={inputBase("email")} />
                  </div>
                </div>

                <div className="fd">
                  <label htmlFor="subject" style={labelStyle}>Subject</label>
                  <input id="subject" name="subject" type="text" value={form.subject} onChange={handleChange}
                    onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)}
                    placeholder="What's this about?" style={inputBase("subject")} />
                </div>

                <div className="fd">
                  <label htmlFor="message" style={labelStyle}>Message * ({MAX_CHARS} char max)</label>
                  <textarea id="message" name="message" rows={6} required value={form.message} onChange={handleChange}
                    onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                    placeholder="Tell me about your project, idea, or question."
                    style={{ ...inputBase("message"), lineHeight: "1.9" }} />
                  <div className="cbw">
                    <div className="cbb">
                      <div className="cbf" style={{ width: `${charPercent}%`, background: charColor }} />
                    </div>
                    <span className="ccl" style={{ color: charColor }}>{charsLeft} left</span>
                  </div>
                </div>

                <div className="sr">
                  <span className="sh">No spam. Just a real human reading your message.</span>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="sbtn"
                    onClick={(e) => {
                      const btn = e.currentTarget;
                      const r = document.createElement("span");
                      r.className = "ripple";
                      const size = Math.max(btn.offsetWidth, btn.offsetHeight);
                      const rect = btn.getBoundingClientRect();
                      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
                      btn.appendChild(r);
                      setTimeout(() => r.remove(), 750);
                    }}
                  >
                    <span>{status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send message"}</span>
                    {status === "idle" && (
                      <svg className="ba" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </TiltCard>

          {/* Footer */}
          <div className="pf">
            <span>© {new Date().getFullYear()} Nikshith G</span>
            <span>Melbourne, AU</span>
          </div>
        </div>
      </div>

      <ParticleBurst active={burst} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
} 