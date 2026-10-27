"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Github,
  Linkedin,
  Instagram,
  Mail,
  Music,
  Swords,
  Circle,
  Dumbbell,
  Telescope,
  Camera,
  Gamepad2,
  StickyNote,
  BookOpen,
  Pin,
  FileText,
  Terminal,
  Search,
  CornerDownLeft,
} from "lucide-react";

const GITHUB_URL = "https://github.com/NIKSHITH-G";
const LINKEDIN_URL = "https://www.linkedin.com/in/nikshith-g-08368a246";
const INSTAGRAM_URL = "https://www.instagram.com/enigma_view/";
const EMAIL = "nikshith.online@gmail.com";

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const go = useCallback(
    (href) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  // Sections live inside the 3D studio: travel there if we're on it, otherwise deep-link.
  const travel = useCallback(
    (section) => {
      setOpen(false);
      if (window.location.pathname === "/") window.dispatchEvent(new CustomEvent("world:go", { detail: section }));
      else router.push(`/?go=${section}`);
    },
    [router]
  );

  const openExternal = useCallback((href) => {
    setOpen(false);
    window.open(href, "_blank", "noopener,noreferrer");
  }, []);

  // The command set. `keywords` widens what a search term will match.
  const commands = useMemo(
    () => [
      { group: "Navigate", label: "House (3D home)", icon: Home, keywords: "start intro hero world", run: () => go("/") },
      { group: "Navigate", label: "About", icon: User, keywords: "bio me story", run: () => travel("about") },
      { group: "Navigate", label: "Experience", icon: Briefcase, keywords: "work tcs job roles", run: () => travel("experience") },
      { group: "Navigate", label: "Education", icon: GraduationCap, keywords: "study monash degree", run: () => travel("education") },
      { group: "Navigate", label: "Projects", icon: FolderGit2, keywords: "work built portfolio shipped modo", run: () => travel("projects") },
      { group: "Navigate", label: "Skills & certifications", icon: Terminal, keywords: "stack tech tools languages", run: () => travel("skills") },
      { group: "Navigate", label: "Music", icon: Music, keywords: "song piano tick tock leo airplane mode video", run: () => travel("music") },
      { group: "Navigate", label: "Contact", icon: Mail, keywords: "hire talk reach message", run: () => travel("contact") },
      { group: "Floors", label: "Play chess — The World vs Nikshith", icon: Swords, keywords: "chess game board move games room floor 3", run: () => travel("chess") },
      { group: "Floors", label: "Snooker", icon: Circle, keywords: "pool billiards cue games room", run: () => travel("snooker") },
      { group: "Floors", label: "Gym — 100 m sprint", icon: Dumbbell, keywords: "gym treadmill run workout floor 2 punching bag", run: () => travel("treadmill") },
      { group: "Floors", label: "Photo booth — take a selfie strip", icon: Camera, keywords: "photo booth selfie camera picture floor 2 dog", run: () => travel("photobooth") },
      { group: "Floors", label: "Arcade — Snake, Breakout, Pong", icon: Gamepad2, keywords: "arcade games snake breakout pong play", run: () => travel("arcade") },
      { group: "Floors", label: "Rooftop guestbook — leave a note", icon: StickyNote, keywords: "guestbook note message sign roof", run: () => travel("guestbook") },
      { group: "Navigate", label: "Library — what I'm reading", icon: BookOpen, keywords: "books reading kindle library", run: () => travel("library") },
      { group: "Navigate", label: "Now — what I'm up to", icon: Pin, keywords: "now current status studying building", run: () => travel("now") },
      { group: "Floors", label: "Rooftop — stargazing", icon: Telescope, keywords: "roof sky stars telescope radio top", run: () => travel("telescope") },
      { group: "Floors", label: "What I'm shipping (GitHub)", icon: Github, keywords: "github commits repos activity ship log", run: () => travel("github") },
      { group: "Navigate", label: "Classic text version", icon: FileText, keywords: "plain recruiter text", run: () => go("/about") },
      { group: "Actions", label: "Download résumé (PDF)", icon: FileText, keywords: "resume cv pdf download", run: () => openExternal("/resume.pdf") },
      { group: "Links", label: "Open GitHub", icon: Github, keywords: "code repos source", run: () => openExternal(GITHUB_URL) },
      { group: "Links", label: "Open LinkedIn", icon: Linkedin, keywords: "professional network", run: () => openExternal(LINKEDIN_URL) },
      { group: "Links", label: "Open Instagram", icon: Instagram, keywords: "photography enigma view photos", run: () => openExternal(INSTAGRAM_URL) },
      { group: "Actions", label: "Email me", icon: Mail, keywords: "mail contact write", run: () => { setOpen(false); window.location.href = `mailto:${EMAIL}`; } },
    ],
    [go, travel, openExternal]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.keywords} ${c.group}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Global open shortcut: ⌘K / Ctrl+K (and "/" when not typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (
        k === "/" &&
        !open &&
        !/^(input|textarea|select)$/i.test(e.target.tagName) &&
        !e.target.isContentEditable
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Let any button on the page open the palette (e.g. the footer trigger).
  useEffect(() => {
    const openEvt = () => setOpen(true);
    window.addEventListener("open-command-palette", openEvt);
    return () => window.removeEventListener("open-command-palette", openEvt);
  }, []);

  // Reset + focus on open; restore scroll lock.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      document.documentElement.style.overflow = "hidden";
      return () => clearTimeout(t);
    }
    document.documentElement.style.overflow = "";
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[active]?.run();
    }
  };

  // Keep the active row scrolled into view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  let lastGroup = null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-[#0b0b12]/95 shadow-[0_40px_120px_-40px_rgba(99,102,241,0.55)]"
        onKeyDown={onKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-white/8 px-4">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            className="w-full bg-transparent py-4 text-sm text-foreground placeholder:text-white/35 focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-white/12 px-1.5 py-0.5 font-mono text-[10px] text-white/40 sm:block">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <div className="px-3 py-8 text-center font-mono text-xs text-white/40">
              no matches
            </div>
          )}

          {results.map((c, i) => {
            const Icon = c.icon;
            const showGroup = c.group !== lastGroup;
            lastGroup = c.group;
            const isActive = i === active;
            return (
              <div key={c.label}>
                {showGroup && (
                  <div className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-wider text-white/30">
                    {c.group}
                  </div>
                )}
                <button
                  data-idx={i}
                  type="button"
                  onMouseMove={() => setActive(i)}
                  onClick={() => c.run()}
                  className={[
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    isActive
                      ? "bg-indigo-500/15 text-foreground"
                      : "text-foreground/70 hover:bg-white/5",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-4 w-4 shrink-0",
                      isActive ? "text-indigo-300" : "text-white/40",
                    ].join(" ")}
                  />
                  <span className="flex-1 truncate">{c.label}</span>
                  {isActive && (
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-white/40" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-white/8 px-4 py-2.5 font-mono text-[10px] text-white/35">
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-white/12 px-1 py-0.5">↑</kbd>
            <kbd className="rounded border border-white/12 px-1 py-0.5">↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-white/12 px-1 py-0.5">↵</kbd>
            to select
          </span>
        </div>
      </div>
    </div>
  );
}
