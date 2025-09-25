// components/Navbar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";

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
  const lastYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      // scroll down => hide when passed a threshold, otherwise show
      if (y > lastYRef.current && y > 80) setHidden(true);
      else setHidden(false);
      lastYRef.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-transform duration-500 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
        <nav
          className="
            relative rounded-2xl px-4 sm:px-6 py-2.5
            backdrop-blur-xl border border-white/10 bg-black/40
            transition-colors
          "
          aria-label="Primary"
        >
          {/* subtle conic ring */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
            <div
              className="absolute -inset-[1px] rounded-2xl opacity-[.25] blur-lg
                          [mask-image:radial-gradient(110%_80%_at_50%_-10%,#000_60%,transparent)]
                          bg-[conic-gradient(from_210deg,rgba(99,102,241,.45),rgba(168,85,247,.35),transparent,rgba(99,102,241,.45))]"
            />
          </div>

          <div className="relative flex items-center justify-between gap-3">
            {/* BRAND */}
            <Link
              href="/"
              className="relative inline-flex items-center gap-2 rounded-xl px-3 py-1 text-white/90 hover:text-white transition"
            >
              <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 shadow-[0_0_14px_rgba(99,102,241,.6)]" />
              <span className="font-semibold tracking-tight text-[1.05rem]">
                Nikshith
              </span>
            </Link>

            {/* NAV LINKS */}
            <ul
              className="
                relative isolate flex items-center gap-1
                rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md
                shadow-[inset_0_1px_0_rgba(255,255,255,.04)]
                ring-1 ring-white/[0.05] px-1.5 py-1.5
                before:absolute before:inset-0 before:rounded-full before:pointer-events-none
                before:bg-[radial-gradient(120%_200%_at_10%_-40%,rgba(99,102,241,.18),transparent_60%)]
              "
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
                          active
                            ? "text-white"
                            : "text-white/75 hover:text-white",
                        ].join(" ")}
                      >
                        {active && (
                          <motion.span
                            layoutId="nav-active-pill"
                            transition={{ type: "spring", stiffness: 520, damping: 38 }}
                            className="
                              absolute inset-0 rounded-full
                              bg-[linear-gradient(135deg,rgba(93,95,240,.95),rgba(124,58,237,.95))]
                              ring-1 ring-white/15
                              shadow-[0_10px_28px_-8px_rgba(99,102,241,.55)]
                              after:absolute after:-inset-[10%] after:rounded-full
                              after:bg-[radial-gradient(70%_60%_at_50%_120%,rgba(99,102,241,.45),transparent)]
                              after:opacity-60 after:blur-[10px]
                            "
                            aria-hidden
                          />
                        )}
                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    </li>

                    {/* divider as its own flex item */}
                    {i < NAV.length - 1 && (
                      <span
                        aria-hidden
                        className="mx-1.5 sm:mx-2 h-5 w-px shrink-0 bg-white/14"
                      />
                    )}
                  </Fragment>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
