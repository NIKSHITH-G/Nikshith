"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { closePanel, goToPanel, nextSuggestion, useWorld } from "../store";
const from = (load, name) => lazy(() => load().then((m) => ({ default: m[name] })));
const screens = () => import("./screens");
const stages = () => import("./stages");
const building = () => import("./building");
const more = () => import("./more");
const chat = () => import("./chat");
const TVScreen = from(screens, "TVScreen");
const TerminalScreen = from(screens, "TerminalScreen");
const ArcadeScreen = from(screens, "ArcadeScreen");
const WhiteboardScreen = from(screens, "WhiteboardScreen");
const TrophyCarousel = from(stages, "TrophyCarousel");
const Bookshelf = from(stages, "Bookshelf");
const PianoStage = from(stages, "PianoStage");
const Viewfinder = from(stages, "Viewfinder");
const Letter = from(stages, "Letter");
const ElevatorPanel = from(building, "ElevatorPanel");
const GitHubScreen = from(building, "GitHubScreen");
const TreadmillSprint = from(building, "TreadmillSprint");
const LiftGame = from(building, "LiftGame");
const PunchingBagGame = from(building, "PunchingBagGame");
const SnookerGame = from(building, "SnookerGame");
const ChessGame = from(building, "ChessGame");
const Telescope = from(building, "Telescope");
const RadioPanel = from(building, "RadioPanel");
const LibraryKindle = from(more, "LibraryKindle");
const NowScreen = from(more, "NowScreen");
const LearningScreen = from(more, "LearningScreen");
const KanbanScreen = from(more, "KanbanScreen");
const PhotoBoothStage = from(more, "PhotoBoothStage");
const ArcadeGames = from(more, "ArcadeGames");
const GuestbookStage = from(more, "GuestbookStage");
const AskChat = from(chat, "AskChat");

// warm the panel chunks once the studio is idle, so opening one never waits
export function preloadPanels() {
  screens();
  stages();
  building();
  more();
  chat();
}

export const PANEL_META = {
  about: { kicker: "living room · tv", title: "Now showing" },
  experience: { kicker: "study · work desk", title: "Experience" },
  education: { kicker: "study · bookshelf", title: "Pick a book" },
  projects: { kicker: "lab · arcade", title: "Select game" },
  skills: { kicker: "lab · whiteboard", title: "The stack" },
  certs: { kicker: "study · trophy case", title: "Trophies" },
  music: { kicker: "music room · piano", title: "Music" },
  photos: { kicker: "photo studio · camera", title: "Through the lens" },
  contact: { kicker: "front door", title: "Write me a letter" },
  github: { kicker: "study · wall screen", title: "Ship log" },
  elevator: { kicker: "elevator", title: "Going up?" },
  treadmill: { kicker: "gym · treadmill", title: "100 m sprint" },
  bag: { kicker: "gym · punching bag", title: "Hit the bag" },
  lift: { kicker: "gym · squat rack", title: "Squat day" },
  snooker: { kicker: "games room · snooker", title: "Snooker" },
  chess: { kicker: "games room · chess", title: "The World vs Nikshith" },
  telescope: { kicker: "rooftop · telescope", title: "The southern sky" },
  radio: { kicker: "rooftop · radio", title: "Change the vibe" },
  library: { kicker: "living room · library", title: "Reading list" },
  now: { kicker: "living room · now board", title: "What I'm up to" },
  learning: { kicker: "gym · training plan", title: "What I'm learning" },
  photobooth: { kicker: "photo studio · booth", title: "Photo booth" },
  arcade: { kicker: "games room · arcade", title: "Insert coin" },
  kanban: { kicker: "games room · side quests", title: "Side quests" },
  guestbook: { kicker: "rooftop · guestbook", title: "Guestbook" },
  ask: { kicker: "house · Nikshith", title: "Talking to Nikshith" },
};

// Each object opens in its own way: screens light up in place, everything else gets a stage.
const VIEWS = {
  about: TVScreen,
  experience: TerminalScreen,
  projects: ArcadeScreen,
  skills: WhiteboardScreen,
  certs: TrophyCarousel,
  education: Bookshelf,
  music: PianoStage,
  photos: Viewfinder,
  contact: Letter,
  github: GitHubScreen,
  elevator: ElevatorPanel,
  treadmill: TreadmillSprint,
  lift: LiftGame,
  bag: PunchingBagGame,
  snooker: SnookerGame,
  chess: ChessGame,
  telescope: Telescope,
  radio: RadioPanel,
  library: LibraryKindle,
  now: NowScreen,
  learning: LearningScreen,
  photobooth: PhotoBoothStage,
  arcade: ArcadeGames,
  kanban: KanbanScreen,
  guestbook: GuestbookStage,
  ask: AskChat,
};

// a phone held sideways: wide but too short for content pinned onto a 3D screen
export const isShort = () => window.innerHeight < 500;
// views drawn onto a screen in the room; on short screens they open as a card instead
const SCREEN_VIEWS = new Set(["about", "experience", "projects", "skills", "github", "now", "learning", "kanban"]);

export function usePortrait() {
  const [mode, setMode] = useState({ portrait: false, short: false });
  useEffect(() => {
    const check = () => setMode({ portrait: window.innerWidth / window.innerHeight < 0.9 || window.innerWidth < 640, short: isShort() });
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mode;
}

// Shared frame around every view: where you are, the way back, and where to go next.
function Chrome({ id }) {
  useWorld((s) => s.visited.length);
  const meta = PANEL_META[id];
  const next = nextSuggestion();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[45] flex items-start justify-between gap-3 p-3 sm:p-5"
    >
      <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[#0b0c14]/70 px-4 py-2.5 backdrop-blur-md">
        <div className="font-mono text-[10px] text-emerald-300/80">// {meta.kicker}</div>
        <div className="font-display text-xl italic leading-tight text-white sm:text-2xl">{meta.title}</div>
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        {next ? (
          <button
            onClick={() => goToPanel(next.panel, next.item)}
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-[#0b0c14]/70 px-4 py-2.5 text-[13px] text-white/75 backdrop-blur-md transition hover:text-white sm:flex"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">next</span>
            <span className="font-display text-[15px] italic text-violet-200">{next.name}</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 font-mono text-[11px] text-emerald-300 backdrop-blur-md sm:block">
            ✓ house fully explored
          </span>
        )}
        <button
          onClick={closePanel}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-medium text-black shadow-lg transition hover:bg-violet-100"
        >
          <X size={15} /> <span className="hidden sm:inline">Keep exploring</span>
          <kbd className="hidden rounded border border-black/15 px-1 font-mono text-[10px] text-black/45 sm:inline">esc</kbd>
        </button>
      </div>
    </motion.div>
  );
}

export default function Panel({ panel }) {
  const View = VIEWS[panel.id];
  const mode = usePortrait();
  const portrait = mode.portrait || (mode.short && SCREEN_VIEWS.has(panel.id));
  return (
    <>
      <Chrome id={panel.id} />
      <Suspense fallback={null}>
        <View item={panel.item} portrait={portrait} />
      </Suspense>
    </>
  );
}
