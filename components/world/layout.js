// Floor plans for every floor of the building, in world units (1 unit ≈ 1 metre).
// Every floor shares the same 24 × 16 footprint: x runs west → east, z runs
// north → south, and the default camera looks north. The elevator is always on
// the west side, so you arrive in the same spot on every floor.
//
//   FLOOR 1 — STUDIO                 FLOOR 2 — GYM
//   z=-8 ┌───────┬───────┬───────┐   ┌──────── mirror wall ───────┐
//        │ STUDY │  LAB  │ MUSIC │   │ cardio      weights   bag  │
//   z=-1 ├─door──┴─door──┴─door──┤   │                            │
//        │ LIVING ROOM   │GALLERY│   │ lockers  mats      turf    │
//   z=8  └───────────────┴───────┘   └────────────────────────────┘
//
//   FLOOR 3 — GAMES ROOM             R — ROOFTOP (open sky)
//   ┌────────────────────────────┐   ┌╌╌╌╌╌╌╌╌ parapet ╌╌╌╌╌╌╌╌╌┐
//   │ snooker        chess       │   ╎ planters     telescope   ╎
//   │                            │   ╎      fire pit            ╎
//   │ foosball    ping-pong      │   ╎ hammock radio  loungers  ╎
//   └────────────────────────────┘   └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘

export const WALL_H = 3.2;
export const PART_H = 1.3;
const T = 0.2;

const OUTER = [
  [0, -8, 24 + T, T, WALL_H], // north
  [-12, 0, T, 16, WALL_H], // west
  [12, 0, T, 16, WALL_H], // east
  [0, 8, 24 + T, T, 0.3], // south lip (kept low so the camera sees in)
];

// The elevator lives on the west wall of floors 1–3 (and in a little hut on the roof).
const elevator = (pos = [-11.9, 0], stand = [-10.6, 0]) => ({
  id: "elevator",
  name: "Elevator",
  label: "Take the elevator",
  panel: "elevator",
  pos,
  stand,
  h: 2.7,
  shot: [[stand[0] + 2.4, 2.0, 1.8], [pos[0] + 0.1, 1.3, 0]],
});

const toColliders = (walls, furniture) => [...walls.map(([x, z, w, d]) => [x, z, w, d]), ...Object.values(furniture)];

/* ── floor 1: the studio ──────────────────────────────────────────────── */

// [centerX, centerZ, width, depth, height]
export const WALLS = [
  ...OUTER,
  // partition between the north rooms and the living area, with three doorways
  [-10.5, -1, 3, T, PART_H],
  [-4, -1, 6, T, PART_H],
  [4, -1, 6, T, PART_H],
  [10.5, -1, 3, T, PART_H],
  [-4, -4.5, T, 7, PART_H],
  [4, -4.5, T, 7, PART_H],
  [4, 5.5, T, 5, PART_H], // gallery half-wall
];

// Furniture footprints that block movement: [centerX, centerZ, width, depth]
const STUDIO_FURNITURE = {
  desk: [-8, -7.2, 2.6, 1.1],
  bookshelf: [-11.6, -4.5, 0.6, 2.8],
  cabinet0: [-2.4, -7.1, 1.1, 1.3],
  cabinet1: [0, -7.1, 1.1, 1.3],
  cabinet2: [2.4, -7.1, 1.1, 1.3],
  whiteboard: [3.3, -4.2, 0.4, 2],
  piano: [8, -7.3, 2.6, 0.9],
  speakers: [11.5, -5, 0.6, 1.4],
  tv: [-4, -0.6, 2.4, 0.6],
  couch: [-4, 3.6, 3.2, 1.1],
  table: [-4, 2, 1.6, 0.7],
  trophies: [-4.42, -4.6, 0.6, 2.4], // study, against its east wall
  nowBoard: [-11.85, 2.5, 0.15, 1.9],
  shelvesA: [11.65, 1.4, 0.5, 2.6],
  shelvesB: [11.65, 5.0, 0.5, 2.6],
  readChair: [8.3, 5.0, 0.9, 0.9],
  kindleTable: [9.2, 5.0, 0.45, 0.45],
  bench: [9, 6.8, 1.8, 0.5],
  kitchen: [3.55, 5.6, 0.6, 2.2],
  plantA: [-11.2, 7.4, 0.7, 0.6],
  plantB: [3.3, 7.4, 0.6, 0.6],
  plantC: [-4.8, -7.3, 0.6, 0.6],
  rack: [-3.35, -7.45, 0.6, 0.6],
  dining: [0.6, 5.3, 1.9, 1.0],
  armchair: [-8.6, 6.8, 0.9, 0.9],
  sideTable: [-7.7, 7.3, 0.45, 0.45],
  globe: [-5.0, -2.0, 0.5, 0.5],
  drums: [9.9, -3.1, 1.7, 1.4],
  robot: [-3.3, -2.0, 0.6, 0.6],
};

// Things you can walk up to.
//   pos     — the object on the floor plan [x, z]
//   stand   — where the player walks to when you click it from across the room
//   h       — height of the object (marker floats above it)
//   shot    — camera position + look target when you interact: [[cx,cy,cz],[lx,ly,lz]]
//   surface — for screens: the content is drawn *on* this rectangle.
//             c = centre, n = facing direction, w × h = size in metres.
//   action  — no panel; something just happens (handled in store.interact)
const STUDIO_ITEMS = [
  { id: "about", name: "TV", label: "Watch the intro", panel: "about", pos: [-4, -0.6], stand: [-4, 0.8], h: 1.9,
    shot: [[-3.2, 2.1, 3.1], [-4, 1.1, -0.6]],
    surface: { c: [-4, 1.2, -0.66], n: [0, 0, 1], w: 2.0, h: 1.12 } },
  { id: "experience", name: "Work desk", label: "Check the work desk", panel: "experience", pos: [-8, -7.2], stand: [-8, -5.7], h: 2.2,
    shot: [[-7.1, 2.3, -4.5], [-8, 1.15, -7.4]],
    surface: { c: [-8, 1.4, -7.44], n: [0, 0, 1], w: 1.22, h: 0.7 } },
  { id: "github", name: "Ship log", label: "See what I'm shipping", panel: "github", pos: [-10.6, -7.7], stand: [-10.4, -6.3], h: 2.7,
    shot: [[-10.6, 2.0, -5.2], [-10.6, 1.9, -7.8]],
    surface: { c: [-10.6, 1.93, -7.83], n: [0, 0, 1], w: 1.36, h: 0.78 } },
  { id: "education", name: "Bookshelf", label: "Browse the bookshelf", panel: "education", pos: [-11.6, -4.5], stand: [-10.3, -4.5], h: 2.6,
    shot: [[-8.6, 2.3, -3.1], [-11.4, 1.2, -4.6]] },
  { id: "proj-0", name: "MODO", label: "Play MODO", panel: "projects", item: 0, pos: [-2.4, -7.35], stand: [-2.4, -5.6], h: 2.4,
    shot: [[-1.9, 2.3, -4.3], [-2.4, 1.35, -6.9]],
    surface: { c: [-2.4, 1.434, -6.735], n: [0, 0.179, 0.984], w: 0.82, h: 0.64 } },
  { id: "proj-1", name: "GPT-2 Circuit", label: "Play GPT-2 Pronoun Circuit", panel: "projects", item: 1, pos: [0, -7.35], stand: [0, -5.6], h: 2.4,
    shot: [[0.5, 2.3, -4.3], [0, 1.35, -6.9]],
    surface: { c: [0, 1.434, -6.735], n: [0, 0.179, 0.984], w: 0.82, h: 0.64 } },
  { id: "proj-2", name: "Kisan Copilot", label: "Play Kisan Copilot", panel: "projects", item: 2, pos: [2.4, -7.35], stand: [2.4, -5.6], h: 2.4,
    shot: [[2.9, 2.3, -4.3], [2.4, 1.35, -6.9]],
    surface: { c: [2.4, 1.434, -6.735], n: [0, 0.179, 0.984], w: 0.82, h: 0.64 } },
  { id: "skills", name: "Whiteboard", label: "Read the whiteboard", panel: "skills", pos: [3.3, -4.2], stand: [2, -4.2], h: 2.3,
    shot: [[0.4, 2.1, -3.4], [3.3, 1.5, -4.2]],
    surface: { c: [3.26, 1.575, -4.2], n: [-1, 0, 0], w: 1.8, h: 1.15 } },
  { id: "music", name: "Piano", label: "Sit at the piano", panel: "music", pos: [8, -7.3], stand: [8, -5.8], h: 1.7,
    shot: [[8.6, 2.6, -4.6], [8, 0.95, -7.1]] },
  { id: "certs", name: "Trophy case", label: "Open the trophy case", panel: "certs", pos: [-4.42, -4.6], stand: [-5.7, -4.6], h: 2.4,
    shot: [[-7.9, 2.3, -3.0], [-4.5, 1.15, -4.6]] },
  { id: "now", name: "Now board", label: "What I'm up to", panel: "now", pos: [-11.85, 2.5], stand: [-10.4, 2.5], h: 2.5,
    shot: [[-8.6, 2.0, 3.4], [-11.8, 1.6, 2.5]],
    surface: { c: [-11.76, 1.6, 2.5], n: [1, 0, 0], w: 1.9, h: 1.15 } },
  { id: "library", name: "Kindle", label: "Browse my library", panel: "library", pos: [9.2, 5.0], stand: [8.3, 3.7], h: 1.4,
    shot: [[7.4, 2.0, 2.4], [9.6, 0.9, 5.4]] },
  { id: "contact", name: "Front door", label: "Write me a letter", panel: "contact", pos: [-11.9, 6], stand: [-10.6, 6.4], h: 2.5,
    shot: [[-8.2, 2.1, 4.5], [-11.8, 1.2, 6.2]] },
  { id: "coffee", name: "Coffee machine", label: "Brew a coffee", action: "coffee", pos: [3.55, 5.2], stand: [2.4, 5.2], h: 1.5 },
  elevator(),
];

const STUDIO_ROOMS = [
  { id: "study", name: "Study", rect: [-12, -8, -4, -1], spawn: [-8, -4], door: -8 },
  { id: "lab", name: "Lab", rect: [-4, -8, 4, -1], spawn: [0, -4], door: 0 },
  { id: "music", name: "Music room", rect: [4, -8, 12, -1], spawn: [8, -4], door: 8 },
  { id: "living", name: "Living room", rect: [-12, -1, 4, 8], spawn: [-1, 5.5] },
  { id: "gallery", name: "Library", rect: [4, -1, 12, 8], spawn: [6.8, 2.6] },
];

// Rough route through the doorways so click-to-walk doesn't get stuck on the partitions.
function studioPath([fx, fz], [tx, tz]) {
  const roomAt = (x, z) => STUDIO_ROOMS.find(({ rect: [a, b, c, d] }) => x >= a && x <= c && z >= b && z <= d) ?? STUDIO_ROOMS[3];
  const a = roomAt(fx, fz);
  const b = roomAt(tx, tz);
  const pts = [];
  if (a.id !== b.id && a.door !== undefined) pts.push([a.door, -1.8], [a.door, -0.2]);
  if (a.id !== b.id && b.door !== undefined) pts.push([b.door, -0.2], [b.door, -1.8]);
  const south = (r) => r.id === "living" || r.id === "gallery";
  if (a.id !== b.id && south(a) && south(b) && (fz > 2.6 || tz > 2.6)) pts.push([4, 1.4]);
  pts.push([tx, tz]);
  // then steer each leg round the living-room furniture
  const out = [];
  let cur = [fx, fz];
  for (const p of pts) {
    out.push(...livingDetours(cur, p));
    cur = p;
  }
  return out;
}
let livingDetours = (a, b) => [b]; // set once `detours` is defined below

/* ── floor 2: gym (west) + photo studio & dog lounge (east) ──────────── */

// a low wall down the middle with a doorway at z −1.5 … 1.5
const GYM_WALLS = [...OUTER, [0, -4.75, T, 6.5, PART_H], [0, 4.75, T, 6.5, PART_H]];

export const GYM_FURNITURE = {
  // gym
  treadmill2: [-9.9, -6.4, 1.0, 2.1],
  treadmill0: [-7.6, -6.4, 1.0, 2.1],
  treadmill1: [-5.3, -6.4, 1.0, 2.1],
  rower: [-3.2, -6.6, 0.6, 2.0],
  bike: [-1.3, -6.8, 0.6, 1.3],
  squat: [-8.6, -2.6, 2.3, 1.4],
  ring: [-4.6, 1.2, 4.2, 3.8],
  bag: [-1.4, -2.8, 0.9, 0.9],
  learningBoard: [-11.85, -4.4, 0.15, 1.9],
  lockers: [-11.7, 4.6, 0.5, 2.8],
  lockerBench: [-10.9, 4.6, 0.4, 2.4],
  cooler: [-11.6, 7.2, 0.5, 0.5],
  balls: [-3.0, 5.2, 0.9, 0.9],
  plyo: [-1.0, 4.4, 0.8, 0.8],
  kettlebells: [-5.0, 7.3, 1.9, 0.45],
  dumbbells: [-2.2, 7.35, 2.0, 0.5],
  // photo studio
  tripod: [6.0, -5.2, 0.7, 0.7],
  booth: [10.4, -6.2, 2.0, 1.9],
  softboxA: [10.6, -0.6, 0.5, 0.5],
  softboxB: [10.6, 3.6, 0.5, 0.5],
  stool: [11.0, 1.5, 0.45, 0.45],
  plantE: [1.0, -7.3, 0.6, 0.6],
  // dog lounge
  sofa: [5.6, 6.9, 2.8, 0.9],
  sideTable: [3.7, 7.0, 0.5, 0.5],
  dogBed: [9.6, 6.6, 1.0, 0.8],
  plant: [11.3, 7.3, 0.6, 0.6],
};

const GYM_ITEMS = [
  { id: "treadmill", name: "Treadmill", label: "Sprint 100 m", panel: "treadmill", pos: [-7.6, -6.4], stand: [-7.6, -4.6], h: 1.7,
    shot: [[-5.8, 2.6, -3.4], [-7.6, 0.9, -6.4]] },
  { id: "bag", name: "Punching bag", label: "Hit the bag", panel: "bag", pos: [-1.4, -2.8], stand: [-2.8, -2.8], h: 2.5,
    shot: [[-5.2, 2.0, -0.6], [-1.4, 1.3, -2.8]] },
  { id: "learning", name: "Training plan", label: "Read my training plan", panel: "learning", pos: [-11.85, -4.4], stand: [-10.4, -4.4], h: 2.5,
    shot: [[-8.6, 2.0, -3.4], [-11.8, 1.6, -4.4]],
    surface: { c: [-11.76, 1.6, -4.4], n: [1, 0, 0], w: 1.8, h: 1.15 } },
  { id: "photos", name: "Camera", label: "Look through the camera", panel: "photos", pos: [6.0, -5.2], stand: [6.0, -3.8], h: 1.6,
    shot: [[6.6, 2.0, -2.6], [6.0, 1.5, -7.8]] },
  { id: "photobooth", name: "Photo booth", label: "Take a selfie strip", panel: "photobooth", pos: [10.4, -6.2], stand: [10.4, -4.5], h: 2.6,
    shot: [[8.8, 2.2, -2.0], [10.4, 1.2, -6.2]] },
  elevator(),
];

const GYM_ROOMS = [
  { id: "cardio", name: "Cardio", rect: [-12, -8, 0, -3.5], spawn: [-6.5, -3.4] },
  { id: "gym", name: "Ring & weights", rect: [-12, -3.5, 0, 8], spawn: [-8.8, 1.4] },
  { id: "photo", name: "Photo studio", rect: [0, -8, 12, 0.5], spawn: [6, -2.6] },
  { id: "lounge", name: "Dog lounge", rect: [0, 0.5, 12, 8], spawn: [5, 3.5] },
];

/* ── floor 3: the games room ──────────────────────────────────────────── */

export const GAMES_FURNITURE = {
  snooker: [-4.5, -2.6, 3.9, 2.2],
  highTable: [-9.6, -6.3, 0.7, 0.7],
  jukebox: [-1.6, -7.4, 0.9, 0.7],
  bar: [1.8, -6.3, 4.6, 0.7],
  backBar: [1.8, -7.6, 4.8, 0.5],
  chessTable: [5.5, -3.5, 1.1, 1.1],
  chairW: [4.45, -3.5, 0.75, 0.75],
  chairE: [6.55, -3.5, 0.75, 0.75],
  books: [11.6, -4.6, 0.5, 3.4],
  readingLamp: [7.3, -5.4, 0.4, 0.4],
  pit: [0.4, 4.3, 3.2, 4.0],
  pingpong: [7.4, 4.6, 2.8, 1.6],
  foosball: [-6.8, 5.2, 1.4, 0.8],
  pinball: [-11.2, 3.5, 0.9, 1.5],
  arcade: [-11.35, 5.3, 0.8, 0.9],
  cab0: [-9.6, 2.2, 1.05, 0.95],
  cab1: [-8.3, 2.2, 1.05, 0.95],
  cab2: [-7.0, 2.2, 1.05, 0.95],
  kanban: [11.85, 4.4, 0.15, 2.4],
  beanbagA: [10.5, 6.8, 1, 1],
  beanbagB: [9.3, 7.2, 0.9, 0.9],
  plant: [-11.2, 7.3, 0.6, 0.6],
};

const GAMES_ITEMS = [
  { id: "snooker", name: "Snooker table", label: "Rack 'em up", panel: "snooker", pos: [-4.5, -2.6], stand: [-4.5, -0.8], h: 1.2,
    shot: [[-4.5, 4.4, 1.4], [-4.5, 0.8, -2.6]] },
  { id: "chess", name: "Chess board", label: "The World vs Nikshith", panel: "chess", pos: [5.5, -3.5], stand: [5.5, -2.1], h: 1.3,
    shot: [[5.5, 2.5, -1.3], [5.5, 0.85, -3.5]] },
  ...["Snake", "Breakout", "Pong"].map((name, i) => {
    const x = -9.6 + i * 1.3;
    return { id: `arcade-${i}`, name, label: `Play ${name}`, panel: "arcade", item: i, pos: [x, 2.2], stand: [x, 3.6], h: 2.3,
      shot: [[x, 1.9, 4.8], [x, 1.4, 2.3]] };
  }),
  { id: "kanban", name: "Side quests", label: "See what I'm building", panel: "kanban", pos: [11.85, 4.4], stand: [10.3, 4.4], h: 2.5,
    shot: [[8.6, 2.0, 5.6], [11.8, 1.6, 4.4]],
    surface: { c: [11.76, 1.6, 4.4], n: [-1, 0, 0], w: 2.2, h: 1.3 } },
  elevator(),
];

const GAMES_ROOMS = [
  { id: "snooker", name: "Snooker hall", rect: [-12, -8, -1, 1.5], spawn: [-4.5, 0.2] },
  { id: "bar", name: "Bar", rect: [-1, -8, 4.5, -3], spawn: [1.8, -4.6] },
  { id: "chess", name: "Chess library", rect: [4.5, -8, 12, 1.5], spawn: [5.5, -1] },
  { id: "lounge", name: "Lounge", rect: [-3, 1.5, 4, 8], spawn: [0.4, 1.6] },
  { id: "arcade", name: "Arcade corner", rect: [-12, 1.5, -3, 8], spawn: [-8, 4.0] },
  { id: "pingpong", name: "Ping-pong", rect: [4, 1.5, 12, 8], spawn: [7.4, 2.6] },
];

/* ── rooftop ──────────────────────────────────────────────────────────── */

export const ROOF_WALLS = [
  [0, -8, 24 + T, T, 1.0],
  [-12, 0, T, 16, 1.0],
  [12, 0, T, 16, 1.0],
  [0, 8, 24 + T, T, 1.0],
];

export const ROOF_FURNITURE = {
  hut: [-11.25, 0, 1.5, 3.2],
  bedA: [-9.2, -6.9, 3.2, 0.9],
  bedB: [-9.2, -5.0, 3.2, 0.9],
  greenhouse: [-4.4, -6.2, 2.4, 2.6],
  picnic: [-6.6, -2.2, 2.0, 1.5],
  bbq: [-3.6, -2.6, 0.8, 0.6],
  firepit: [0, 2, 1.3, 1.3],
  sofaW: [-1.95, 2, 0.9, 2.4],
  sofaS: [0, 3.95, 2.4, 0.9],
  chairE: [1.95, 1.7, 0.9, 0.9],
  radioTable: [-2.7, 4.3, 0.7, 0.7],
  postA: [-9.2, 4.6, 0.25, 0.25],
  postB: [-5.8, 4.6, 0.25, 0.25],
  telescope: [7, -5, 0.8, 0.8],
  starChart: [5.0, -6.9, 0.9, 0.4],
  beanA: [8.8, -3.4, 0.9, 0.9],
  beanB: [9.9, -4.8, 0.9, 0.9],
  ac: [8.4, -7.2, 1.4, 0.9],
  antenna: [10.9, -7, 0.4, 0.4],
  tank: [10.6, -1.9, 1.9, 1.9],
  tub: [8.8, 5.3, 2.5, 2.5],
  loungerA: [4.8, 5.9, 0.8, 1.9],
  loungerB: [6.2, 5.9, 0.8, 1.9],
  planterS: [-6, 7.4, 3.2, 0.6],
  guestbook: [1.4, -7.35, 2.6, 0.35],
};

const ROOF_ITEMS = [
  { id: "telescope", name: "Telescope", label: "Look at the stars", panel: "telescope", pos: [7, -5], stand: [6, -3.9], h: 1.9,
    shot: [[4.6, 2.6, -2.2], [7.6, 2.4, -6.2]] },
  { id: "radio", name: "Radio", label: "Change the vibe", panel: "radio", pos: [-2.7, 4.3], stand: [-2.7, 5.5], h: 1.0,
    shot: [[-2.0, 1.9, 6.6], [-2.7, 0.8, 4.3]] },
  { id: "guestbook", name: "Guestbook", label: "Leave a note", panel: "guestbook", pos: [1.4, -7.35], stand: [1.4, -5.9], h: 2.3,
    shot: [[1.4, 2.2, -3.4], [1.4, 1.3, -7.35]] },
  elevator([-10.5, 0], [-9.3, 0]),
];

const ROOF_ROOMS = [
  { id: "garden", name: "Garden & BBQ", rect: [-12, -8, -1.5, -1], spawn: [-5.5, -0.6] },
  { id: "stars", name: "Stargazing deck", rect: [4, -8, 12, -1], spawn: [6, -3] },
  { id: "lounge", name: "Fire pit", rect: [-12, -1, 4, 8], spawn: [0, 5.6] },
  { id: "tub", name: "Hot tub", rect: [4, -1, 12, 8], spawn: [6, 2.6] },
];

/* ── click-to-walk routing round big furniture ────────────────────────── */

// Does the segment a→b pass through the (padded) box? Liang–Barsky clipping.
function segHitsBox([x0, z0], [x1, z1], [cx, cz, w, d], pad) {
  const dx = x1 - x0;
  const dz = z1 - z0;
  let t0 = 0;
  let t1 = 1;
  const edges = [[-dx, x0 - (cx - w / 2 - pad)], [dx, cx + w / 2 + pad - x0], [-dz, z0 - (cz - d / 2 - pad)], [dz, cz + d / 2 + pad - z0]];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      t0 = Math.max(t0, r);
    } else {
      if (r < t0) return false;
      t1 = Math.min(t1, r);
    }
  }
  return true;
}

// Walk round obstacles in the way, going past the shortest pair of each one's
// corners and re-checking every new leg (a few levels deep).
function detours(obstacles) {
  const inside = ([x, z]) => x > -11.5 && x < 11.5 && z > -7.5 && z < 7.5 && !blocked(x, z, 0.36);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const route = (a, b, depth) => {
    if (depth > 4) return [b];
    const hit = obstacles.filter((o) => segHitsBox(a, b, o, 0.3)).sort((p, q) => dist(p, a) - dist(q, a))[0];
    if (!hit) return [b];
    const [cx, cz, w, d] = hit;
    const m = 0.7;
    const [wx, ex, nz, sz] = [cx - w / 2 - m, cx + w / 2 + m, cz - d / 2 - m, cz + d / 2 + m];
    const xs = b[0] > a[0] ? [wx, ex] : [ex, wx];
    const zs = b[1] > a[1] ? [nz, sz] : [sz, nz];
    const options = [
      [[xs[0], nz], [xs[1], nz]],
      [[xs[0], sz], [xs[1], sz]],
      [[wx, zs[0]], [wx, zs[1]]],
      [[ex, zs[0]], [ex, zs[1]]],
    ].filter((pts) => pts.every(inside));
    if (!options.length) return [b];
    const [c1, c2] = options.sort((p, q) => dist(a, p[0]) + dist(p[0], p[1]) + dist(p[1], b) - (dist(a, q[0]) + dist(q[0], q[1]) + dist(q[1], b)))[0];
    return [...route(a, c1, depth + 1), ...route(c1, c2, depth + 1), ...route(c2, b, depth + 1)];
  };
  return (from, to) => route(from, to, 0);
}

// Floor 2 is split by a wall: cross it through the doorway at x = 0, z ≈ 0.
function throughDoorway(route) {
  return (from, to) => {
    const legs = (from[0] < 0) !== (to[0] < 0)
      ? (from[0] < 0 ? [[-0.9, 0], [0.9, 0], to] : [[0.9, 0], [-0.9, 0], to])
      : [to];
    const out = [];
    let cur = from;
    for (const p of legs) {
      out.push(...route(cur, p));
      cur = p;
    }
    return out;
  };
}

livingDetours = detours([
  [-4, -0.6, 2.4, 0.6], // tv
  [-4, 2.75, 3.4, 2.7], // couch + coffee table
  STUDIO_FURNITURE.dining,
  STUDIO_FURNITURE.armchair,
  STUDIO_FURNITURE.readChair,
  STUDIO_FURNITURE.kitchen,
  [4, 5.5, 0.2, 5], // gallery half-wall
]);

/* ── the building ─────────────────────────────────────────────────────── */

export const FLOORS = [
  { id: "studio", label: "1", name: "Studio", blurb: "work, music & library", walls: WALLS, furniture: STUDIO_FURNITURE, items: STUDIO_ITEMS, rooms: STUDIO_ROOMS, path: studioPath, arrive: [-10.6, 0] },
  { id: "gym", label: "2", name: "Gym & Photo studio", blurb: "gym, photo booth & a dog", walls: GYM_WALLS, furniture: GYM_FURNITURE, items: GYM_ITEMS, rooms: GYM_ROOMS, arrive: [-10.6, 0],
    path: throughDoorway(detours(Object.values(GYM_FURNITURE))) },
  { id: "games", label: "3", name: "Games room", blurb: "bar, snooker & live chess", walls: OUTER, furniture: GAMES_FURNITURE, items: GAMES_ITEMS, rooms: GAMES_ROOMS, arrive: [-10.6, 0],
    path: detours([
      [-8.3, 2.2, 3.85, 0.95], // the arcade row as one block
      ...Object.entries(GAMES_FURNITURE).filter(([k]) => !["cab0", "cab1", "cab2"].includes(k)).map(([, v]) => v),
    ]) },
  { id: "roof", label: "R", name: "Rooftop", blurb: "stars, fire pit, hot tub", walls: ROOF_WALLS, furniture: ROOF_FURNITURE, items: ROOF_ITEMS, rooms: ROOF_ROOMS, arrive: [-9.3, 0],
    path: detours([
      [-0.3, 2.7, 6.0, 4.0], // the whole fire-pit lounge as one block
      ...Object.entries(ROOF_FURNITURE).filter(([k]) => !["firepit", "sofaW", "sofaS", "chairE", "radioTable"].includes(k)).map(([, v]) => v),
    ]) },
].map((f) => ({ ...f, colliders: toColliders(f.walls, f.furniture) }));

export const floorById = (id) => FLOORS.find((f) => f.id === id) ?? FLOORS[0];

// Every interactable in the building, tagged with its floor.
export const ALL_ITEMS = FLOORS.flatMap((f) => f.items.map((it) => ({ ...it, floor: f.id })));

// The "explore" checklist — every section worth visiting, in tour order.
export const SECTIONS = [
  "about", "experience", "github", "education", "projects", "skills", "certs", "now", "library", "music", "contact",
  "treadmill", "bag", "learning", "photos", "photobooth",
  "snooker", "chess", "arcade", "kanban",
  "telescope", "guestbook",
];

// You first arrive at the studio's front door, facing into the flat.
export const SPAWN = [-10.2, 6];

// When each studio light comes on during the entrance (seconds after "Enter").
export const POWER = {
  door: 0.25,
  living: 0.6,
  strip: 0.85,
  tv: 1.05,
  trophies: 1.25,
  study: 1.55,
  monitor: 1.7,
  lab: 1.95,
  arcade: 2.1,
  board: 2.2,
  music: 2.4,
  gallery: 2.65,
};
export const ENTER_SECONDS = 3.6;

// The floor you're on right now (kept outside React so collision checks are cheap).
let activeFloor = FLOORS[0];
export const setActiveFloor = (id) => (activeFloor = floorById(id));
export const activeItems = () => activeFloor.items;

export function planPath(from, to) {
  return activeFloor.path ? activeFloor.path(from, to) : [to];
}

// Circle-vs-box test for the player and the cat, against the current floor.
export function blocked(x, z, r) {
  for (const [cx, cz, w, d] of activeFloor.colliders) {
    const nx = Math.max(cx - w / 2, Math.min(x, cx + w / 2));
    const nz = Math.max(cz - d / 2, Math.min(z, cz + d / 2));
    if ((x - nx) ** 2 + (z - nz) ** 2 < r * r) return true;
  }
  return x < -12 + r || x > 12 - r || z < -8 + r || z > 8 - r;
}
