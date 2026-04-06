// components/Navbar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";
import { animate, stagger, utils } from "animejs";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname() || "/";
  const activeIndex = NAV.findIndex((n) =>
    n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
  );

  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastYRef = useRef(0);
  const nameRef = useRef(null);
  const shimmerInstances = useRef([]);
  const isAnimating = useRef(false);
  const menuRef = useRef(null);

  // ── scroll hide/show ──────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > lastYRef.current && y > 80) {
        setHidden(true);
        setMenuOpen(false);
      } else setHidden(false);
      lastYRef.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── close menu on outside click ───────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── anime.js: shimmer helpers ─────────────────────────────────────
  const stopShimmer = () => {
    shimmerInstances.current.forEach((a) => { try { a.pause(); } catch (_) {} });
    shimmerInstances.current = [];
  };

  const startShimmer = (arr) => {
    stopShimmer();
    shimmerInstances.current = arr.map((el, i) =>
      animate(el, {
        color: [
          "rgba(255,255,255,0.92)",
          "rgba(165,180,252,1)",
          "rgba(216,180,254,1)",
          "rgba(255,255,255,0.92)",
        ],
        translateY: [0, -1.5, 0],
        duration: 3000,
        loop: true,
        ease: "inOutSine",
        delay: i * 120,
        alternate: true,
      })
    );
  };

  const burstIn = (arr) => {
    arr.forEach((el) => {
      el.style.opacity = "0";
      const tx = utils.random(-80, 80);
      const ty = utils.random(-60, 60);
      const r  = utils.random(-30, 30);
      const s  = utils.random(30, 180) / 100;
      el.style.transform = `translateX(${tx}px) translateY(${ty}px) rotate(${r}deg) scale(${s})`;
    });
    animate(arr, {
      opacity: 1,
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      duration: 800,
      ease: "outElastic(1, .6)",
      delay: stagger(60, { from: "center" }),
      onComplete: () => {
        isAnimating.current = false;
        startShimmer(arr);
      },
    });
  };

  useEffect(() => {
    const letters = Array.from(nameRef.current?.querySelectorAll("span") ?? []);
    if (!letters.length) return;
    burstIn(letters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNameHover = () => {
    if (isAnimating.current) return;
    const letters = Array.from(nameRef.current?.querySelectorAll("span") ?? []);
    if (!letters.length) return;
    isAnimating.current = true;
    stopShimmer();
    animate(letters, {
      translateX: () => utils.random(-100, 100),
      translateY: () => utils.random(-80, 80),
      rotate:     () => utils.random(-45, 45),
      scale:      () => utils.random(20, 160) / 100,
      opacity: 0,
      duration: 350,
      ease: "inBack",
      delay: stagger(35, { from: "center" }),
      onComplete: () => burstIn(letters),
    });
  };

  // ── mobile menu link stagger on open ─────────────────────────────
  useEffect(() => {
    if (!menuOpen) return;
    const items = document.querySelectorAll(".mobile-nav-item");
    if (!items.length) return;
    animate(Array.from(items), {
      opacity: [0, 1],
      translateY: [-12, 0],
      duration: 320,
      ease: "outQuart",
      delay: stagger(60),
    });
  }, [menuOpen]);

  return (
    <div ref={menuRef} className={`sticky top-0 z-50 transition-transform duration-500 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      {/* ── MAIN NAV BAR ── */}
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
          <nav
            className="relative rounded-2xl px-4 sm:px-6 py-2.5 backdrop-blur-xl border border-white/10 bg-black/40 transition-colors"
            aria-label="Primary"
          >
            {/* conic ring */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute -inset-[1px] rounded-2xl opacity-[.25] blur-lg [mask-image:radial-gradient(110%_80%_at_50%_-10%,#000_60%,transparent)] bg-[conic-gradient(from_210deg,rgba(99,102,241,.45),rgba(168,85,247,.35),transparent,rgba(99,102,241,.45))]" />
            </div>

            <div className="relative flex items-center justify-between gap-3">

              {/* BRAND */}
              <Link
                href="/"
                onMouseEnter={handleNameHover}
                className="relative inline-flex items-center gap-2 rounded-xl px-3 py-1 text-white/90 hover:text-white transition"
              >
                {/* ── Animated dot ── */}
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  {/* outer orbit ring */}
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full bg-indigo-400/30"
                    animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* second slower ring */}
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full bg-violet-400/20"
                    animate={{ scale: [1, 3, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  />
                  {/* core dot */}
                  <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 shadow-[0_0_14px_rgba(99,102,241,.6)]" />
                </span>

                <span ref={nameRef} className="font-semibold tracking-tight text-[1.05rem] inline-flex">
                  {"Nikshith".split("").map((ch, i) => (
                    <span key={i} style={{ display: "inline-block", opacity: 0 }}>{ch}</span>
                  ))}
                </span>
              </Link>

              {/* DESKTOP NAV LINKS */}
              <ul
                className="hidden sm:flex relative isolate items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,.04)] ring-1 ring-white/[0.05] px-1.5 py-1.5 before:absolute before:inset-0 before:rounded-full before:pointer-events-none before:bg-[radial-gradient(120%_200%_at_10%_-40%,rgba(99,102,241,.18),transparent_60%)]"
                role="menubar"
              >
                {NAV.map((item, i) => {
                  const active = i === activeIndex;
                  return (
                    <Fragment key={item.href}>
                      <li className="relative" role="none">
                        <Link
                          href={item.href}
                          role="menuitem"
                          className={[
                            "relative z-10 inline-flex h-10 items-center rounded-full px-4 sm:px-5 text-sm font-medium transition",
                            active ? "text-white" : "text-white/75 hover:text-white",
                          ].join(" ")}
                        >
                          {active && (
                            <motion.span
                              layoutId="nav-active-pill"
                              transition={{ type: "spring", stiffness: 520, damping: 38 }}
                              className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(93,95,240,.95),rgba(124,58,237,.95))] ring-1 ring-white/15 shadow-[0_10px_28px_-8px_rgba(99,102,241,.55)] after:absolute after:-inset-[10%] after:rounded-full after:bg-[radial-gradient(70%_60%_at_50%_120%,rgba(99,102,241,.45),transparent)] after:opacity-60 after:blur-[10px]"
                              aria-hidden
                            />
                          )}
                          <span className="relative z-10">{item.label}</span>
                        </Link>
                      </li>
                      {i < NAV.length - 1 && (
                        <span aria-hidden className="mx-1.5 sm:mx-2 h-5 w-px shrink-0 bg-white/14" />
                      )}
                    </Fragment>
                  );
                })}
              </ul>

              {/* HAMBURGER BUTTON — mobile only */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                className="sm:hidden relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition hover:bg-white/10"
              >
                <span className="sr-only">Menu</span>
                {/* animated bars */}
                <motion.span
                  className="absolute block h-[1.5px] w-4 bg-white/80 rounded-full"
                  animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute block h-[1.5px] w-4 bg-white/80 rounded-full"
                  animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="absolute block h-[1.5px] w-4 bg-white/80 rounded-full"
                  animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ── MOBILE DROPDOWN ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ transformOrigin: "top center" }}
            className="sm:hidden mx-4 mt-2"
          >
            <nav
              className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl px-2 py-2 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]"
              aria-label="Mobile"
            >
              {/* inner glow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute -inset-[1px] rounded-2xl opacity-[.15] blur-lg bg-[conic-gradient(from_210deg,rgba(99,102,241,.45),rgba(168,85,247,.35),transparent,rgba(99,102,241,.45))]" />
              </div>

              <ul className="relative flex flex-col gap-1">
                {NAV.map((item, i) => {
                  const active = NAV.findIndex((n) =>
                    n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
                  ) === i;
                  return (
                    <li key={item.href} className="mobile-nav-item" style={{ opacity: 0 }}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={[
                          "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                          active
                            ? "bg-[linear-gradient(135deg,rgba(93,95,240,.2),rgba(124,58,237,.2))] text-white"
                            : "text-white/70 hover:text-white hover:bg-white/[0.05]",
                        ].join(" ")}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                        )}
                        <span className="pl-1">{item.label}</span>
                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,.8)]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}