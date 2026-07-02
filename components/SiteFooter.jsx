"use client";

import Link from "next/link";
import { Github, Linkedin, Instagram, Mail, ArrowUp } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/enigma_view/";
const GITHUB_URL = "https://github.com/NIKSHITH-G";
const LINKEDIN_URL = "https://www.linkedin.com/in/nikshith-g-08368a246";
const EMAIL = "nikshith.online@gmail.com";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SOCIALS = [
  { label: "GitHub", href: GITHUB_URL, Icon: Github },
  { label: "LinkedIn", href: LINKEDIN_URL, Icon: Linkedin },
  { label: "Instagram", href: INSTAGRAM_URL, Icon: Instagram },
  { label: "Email", href: `mailto:${EMAIL}`, Icon: Mail },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 mt-10 sm:mt-16 border-t border-white/10 bg-[#08070f]">
      {/* thin accent line at the very top edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
          {/* Brand + tagline + status */}
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.85)]" />
              <span className="text-base font-semibold text-foreground">
                Nikshith
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground/55">
              Master&apos;s in AI @ Monash. I move between full-stack
              engineering and applied ML — building things, breaking them, and
              figuring out exactly why.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-xs text-emerald-300/90">
                Open to opportunities
              </span>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <div className="font-mono text-xs text-white/35">// navigate</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground/60 hover:text-foreground transition-colors"
                >
                  Résumé <span aria-hidden className="text-xs">↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Elsewhere */}
          <div>
            <div className="font-mono text-xs text-white/35">// elsewhere</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    className="group inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4 text-foreground/40 group-hover:text-indigo-300 transition-colors" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/6 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-foreground/45">
            © {new Date().getFullYear()} Nikshith — Built with ❤️ using Next.js
            &amp; Tailwind
          </div>
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new Event("open-command-palette"))
              }
              className="group inline-flex items-center gap-2 text-xs text-foreground/45 transition-colors hover:text-foreground/80"
              aria-label="Open command menu"
            >
              <span>Command menu</span>
              <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-foreground/60 group-hover:border-white/25">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group inline-flex items-center gap-1.5 text-xs text-foreground/45 transition-colors hover:text-foreground/80"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
