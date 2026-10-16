"use client";

import { useSyncExternalStore } from "react";
import { ALL_ITEMS, SECTIONS, SPAWN, POWER, ENTER_SECONDS, planPath, activeItems, setActiveFloor, floorById } from "./layout";
import * as sfx from "./audio";

// UI state that React renders from. Kept small and selector-based so the HUD
// only re-renders when the bit it reads actually changes.
let state = {
  phase: "boot", // boot → title → entering → playing
  floor: "studio",
  ride: null, // elevator trip in progress: { from, to, stage: "closing" | "moving" | "opening" }
  panel: null, // { id, item, from }
  nearby: null, // interactable id, or "cat"
  map: false,
  toast: null,
  moved: false,
  visited: [],
  muted: sfx.isMuted(),
  quality: "high",
};
const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useWorld(selector) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

// Per-frame data the scene mutates directly. Never put this in React state.
export const runtime = {
  x: SPAWN[0],
  z: SPAWN[1],
  heading: Math.PI / 2,
  speed: 0,
  path: [],
  pendingOpen: null,
  keys: new Set(),
  joy: { x: 0, z: 0 },
  cat: { x: -7, z: 4.6 },
  dog: { x: 6.5, z: 3.5 }, // Pixel, on floor 2
  yaw: 0, // camera orbit, set by dragging
  zoom: 1, // set by the scroll wheel
  powerStart: null, // performance.now()/1000 when the lights start coming on
  waveAt: 0,
  piano: new Set(), // notes currently held, so the 3D keys can press down
  justDragged: false,
  surfaceEl: null, // the HTML overlay pinned to the focused screen
  bagHits: [], // timestamps of punches, so the 3D bag can swing
  steamAt: 0, // last coffee brewed, for the steam puff
  sprint: 0, // treadmill belt speed (0–1) while the sprint game runs
};

export const now = () => performance.now() / 1000;

/* ── flow ─────────────────────────────────────────── */

export function enter() {
  if (state.phase !== "title") return;
  sfx.init();
  sfx.startAmbient();
  runtime.powerStart = now();
  Object.values(POWER).forEach((t) => sfx.click(t));
  setState({ phase: "entering" });
  setTimeout(() => {
    runtime.waveAt = now();
    setState({ phase: "playing" });
  }, ENTER_SECONDS * 1000);
}

// Skip the cinematic (deep links, reduced motion).
export function enterInstantly() {
  runtime.powerStart = now() - 10;
  setState({ phase: "playing" });
}

export function toggleMute() {
  sfx.init();
  sfx.setMuted(!state.muted);
  setState({ muted: !state.muted });
}

/* ── elevator ─────────────────────────────────────── */

// Doors close, the car moves, doors open on the new floor. `then` runs once you're there.
export function rideTo(to, then) {
  if (to === state.floor) return then?.();
  if (state.ride) return;
  sfx.init();
  closePanel(true);
  const from = state.floor;
  setState({ ride: { from, to, stage: "closing" }, map: false });
  sfx.elevator();
  setTimeout(() => {
    setActiveFloor(to);
    const f = floorById(to);
    runtime.x = f.arrive[0];
    runtime.z = f.arrive[1];
    runtime.heading = Math.PI / 2;
    runtime.path = [];
    runtime.pendingOpen = null;
    runtime.yaw = 0;
    setState({ floor: to, ride: { from, to, stage: "moving" }, nearby: null });
  }, 650);
  setTimeout(() => {
    sfx.ding();
    setState({ ride: { from, to, stage: "opening" } });
  }, 1900);
  setTimeout(() => {
    setState({ ride: null });
    then?.();
  }, 2550);
}

/* ── panels ───────────────────────────────────────── */

// Prefer something on the floor you're on; otherwise look through the whole building.
function findInteractable(panel, item) {
  const match = (i) => i.panel === panel && (item === undefined || i.item === item);
  const here = activeItems().map((i) => ({ ...i, floor: state.floor }));
  return here.find(match) ?? ALL_ITEMS.find(match) ?? here.find((i) => i.panel === panel) ?? ALL_ITEMS.find((i) => i.panel === panel);
}

export function openPanel(panel, item, from) {
  runtime.path = [];
  runtime.pendingOpen = null;
  const it = from ? activeItems().find((i) => i.id === from) : findInteractable(panel, item);
  const counts = SECTIONS.includes(panel) && !state.visited.includes(panel);
  const visited = counts ? [...state.visited, panel] : state.visited;
  const firstTimeComplete = counts && visited.length === SECTIONS.length;
  setState({ panel: { id: panel, item: item ?? it?.item, from: it?.id }, map: false, visited });
  sfx.blip(true);
  if (panel === "music") sfx.duck(true);
  if (firstTimeComplete) {
    setTimeout(() => {
      sfx.chime();
      toast("You've explored the whole building. Byte is impressed — and Byte is never impressed.", "🏆", 6000);
    }, 700);
  }
}

export function closePanel(silent) {
  if (!state.panel) return;
  if (state.panel.id === "music") sfx.duck(false);
  if (!silent) sfx.blip(false);
  runtime.sprint = 0;
  setState({ panel: null });
}

export function walkTo(x, z, pendingOpen = null) {
  runtime.path = planPath([runtime.x, runtime.z], [x, z]);
  runtime.pendingOpen = pendingOpen;
  if (!state.moved) setState({ moved: true });
}

export function interact(id) {
  if (id === "cat") return petCat();
  if (id === "dog") return petDog();
  const it = activeItems().find((i) => i.id === id);
  if (!it) return;
  runtime.heading = Math.atan2(it.pos[0] - runtime.x, it.pos[1] - runtime.z);
  if (it.action === "coffee") return brewCoffee();
  openPanel(it.panel, it.item, it.id);
}

// Jump straight to a spot on the current floor (floor-plan map).
export function teleport(x, z) {
  runtime.x = x;
  runtime.z = z;
  runtime.path = [];
  runtime.pendingOpen = null;
  setState({ map: false, moved: true });
}

// Nav buttons, deep links, "next stop": go wherever that section lives, riding the elevator if needed.
export function goToPanel(panel, item) {
  const it = findInteractable(panel, item);
  if (!it) return;
  if (state.phase !== "playing") enterInstantly();
  const arrive = () => {
    teleport(it.stand[0], it.stand[1]);
    runtime.heading = Math.atan2(it.pos[0] - it.stand[0], it.pos[1] - it.stand[1]);
    openPanel(it.panel, item ?? it.item, it.id);
  };
  if (it.floor && it.floor !== state.floor) rideTo(it.floor, arrive);
  else arrive();
}

/* ── little actions ───────────────────────────────── */

let toastTimer;
export function toast(message, icon = "🐈", ms = 3600) {
  clearTimeout(toastTimer);
  setState({ toast: { message, icon } });
  toastTimer = setTimeout(() => setState({ toast: null }), ms);
}

async function brewCoffee() {
  sfx.init();
  sfx.brew();
  runtime.steamAt = now();
  try {
    const res = await fetch("/api/counter?name=coffee", { method: "POST" });
    const { count } = await res.json();
    toast(`Fresh coffee. Visitors have brewed ${Number(count).toLocaleString()} cups in this studio.`, "☕");
  } catch {
    toast("Fresh coffee. Productivity +10.", "☕");
  }
}

const CAT_LINES = [
  "Byte purrs. Byte has reviewed every PR in this house and approved none of them.",
  "Byte headbutts your leg. That's a strong hire signal.",
  "Byte was asleep on the keyboard again. That explains the commit messages.",
  "Mrrp. Byte thinks you should try the arcade cabinets in the lab.",
  "Byte stares at the piano. Byte has opinions about the bridge in Airplane Mode.",
  "Byte knocks a pen off the desk. Byte's way of saying 'ship it'.",
];
let catIdx = 0;
const DOG_LINES = [
  "Pixel rolls over for belly rubs. Pixel is the studio's head of morale.",
  "Pixel brings you a slobbery ball. Throwing it is now your full-time job.",
  "Pixel sniffs your shoes and approves. Strong candidate.",
  "Pixel photobombs every shot in the booth. Every. Single. One.",
  "Pixel thinks the cat downstairs gets too much credit.",
];
let dogIdx = 0;
function petDog() {
  sfx.bark?.();
  toast(DOG_LINES[dogIdx++ % DOG_LINES.length], "🐕");
}

function petCat() {
  sfx.meow();
  toast(CAT_LINES[catIdx++ % CAT_LINES.length]);
}

export function nextSuggestion() {
  const next = SECTIONS.find((s) => !state.visited.includes(s));
  return next ? findInteractable(next) : null;
}
