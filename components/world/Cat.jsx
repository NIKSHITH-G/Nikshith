"use client";

// Byte the cat. A small state machine of cat behaviour: wander and follow you, hide
// behind the furniture and ambush you, zoomies, naps, staring at nothing, and knocking
// the mug off the coffee table while looking straight at the camera.

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { runtime, getState, toast, now, useWorld } from "./store";
import { blocked, planPath } from "./layout";
import { P } from "./Avatar";
import { B } from "./Apartment";
import { step, angleDiff } from "./Characters";
import * as sfx from "./audio";

const R = 0.2; // Byte's collision radius
const CAT_AREA = [-10.5, 0.6, 2.8, 7.4]; // where wandering and zoomies happen: [x0, z0, x1, z1]

// Hiding spots. Byte walks to `via`, then slinks into `at` (which may be inside furniture).
const HIDES = [
  { name: "the couch", via: [-5.15, 2.72], at: [-4.2, 2.72] },
  { name: "the dining table", via: [1.85, 5.3], at: [0.6, 5.3] },
  { name: "the armchair", via: [-7.6, 6.05], at: [-8.6, 6.05] },
  { name: "the plant", via: [-10.3, 6.8], at: [-11.2, 6.8] },
  { name: "the box", via: [-1.5, 6.55], at: [-1.5, 7.35], box: true },
];
const NAPS = [
  { at: [-1.2, 0.35], y: 0.03 }, // the cat bed
  { via: [-4.7, 2.75], at: [-4.7, 3.5], y: 0.58 }, // the couch cushion
];
const STARES = [
  { at: [-11.3, 0.3], face: -Math.PI / 2 },
  { at: [-6.5, -0.5], face: Math.PI },
  { at: [3.55, 3.9], face: Math.PI / 2 },
];
const TABLE_FLOOR = [-3.75, 1.3]; // north of the coffee table, where Byte jumps up from
const TABLE_TOP = [-3.75, 1.85, 0.39];
export const MUG_HOME = [-3.6, 0.45, 2.05];
const BOX = [-1.5, 7.35];

const CAT_LINES = [
  "Byte purrs. Byte has reviewed every PR in this house and approved none of them.",
  "Byte headbutts your leg. That's a strong hire signal.",
  "Byte was asleep on the keyboard again. That explains the commit messages.",
  "Mrrp. Byte thinks you should try the arcade cabinets in the lab.",
  "Byte stares at the piano. Byte has opinions about the bridge in Airplane Mode.",
  "Byte knocks a pen off the desk. Byte's way of saying 'ship it'.",
];
const AMBUSH_LINES = [
  (spot) => `BYTE AMBUSH from behind ${spot}. You never stood a chance.`,
  (spot) => `Byte had been waiting behind ${spot} for 40 minutes for exactly this moment.`,
  () => "Byte pounces on your shoelaces. Critical hit.",
  () => "Ambushed by Byte. This counts as your code review.",
  () => "SURPRISE. Byte would like you to know you walk very loudly.",
];
const WAKE_LINES = [
  "You woke Byte up. Byte will remember this.",
  "Byte opens one eye, judges you, and stomps off.",
  "Byte was dreaming about a merge with zero conflicts. Thanks a lot.",
];
let catIdx = 0;
let firstVisit = true;

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, u) => a + (b - a) * u;

function freeNear(x, z) {
  for (const r of [0, 0.3, 0.6, 0.9, 1.2]) {
    for (let k = 0; k < 8; k++) {
      const px = x + Math.cos((k / 8) * Math.PI * 2) * r;
      const pz = z + Math.sin((k / 8) * Math.PI * 2) * r;
      if (!blocked(px, pz, R + 0.02) && pz > -0.7) return [px, pz];
    }
  }
  return [x, z];
}

// Is the straight line from a to b clear for Byte?
function clear([ax, az], [bx, bz]) {
  const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.1);
  for (let i = 1; i <= n; i++) if (blocked(lerp(ax, bx, i / n), lerp(az, bz, i / n), R)) return false;
  return true;
}

// The house planner is tuned for the player and can zig-zag when Byte starts right up against
// furniture, so: straight there when nothing is in the way, otherwise the planner's route with
// loops cut out and any corner Byte can see past skipped.
function catPath(from, to) {
  if (clear(from, to)) return [to];
  const raw = [];
  for (const p of planPath(from, to)) {
    const seen = raw.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.05);
    if (seen >= 0) raw.length = seen + 1;
    else raw.push(p);
  }
  const out = [];
  let cur = from;
  let i = 0;
  while (i < raw.length) {
    let j = raw.length - 1;
    while (j > i && !clear(cur, raw[j])) j--;
    out.push(raw[j]);
    cur = raw[j];
    i = j + 1;
  }
  return out;
}

function randomSpot(awayFrom) {
  let best = null;
  for (let i = 0; i < 14; i++) {
    const x = lerp(CAT_AREA[0], CAT_AREA[2], Math.random());
    const z = lerp(CAT_AREA[1], CAT_AREA[3], Math.random());
    if (blocked(x, z, R + 0.05)) continue;
    if (!awayFrom || Math.hypot(x - awayFrom[0], z - awayFrom[1]) > 3) return [x, z];
    best = [x, z];
  }
  return best ?? [-7, 4.6];
}

export function Cat() {
  const root = useRef();
  const pose = useRef();
  const body = useRef();
  const tail = useRef();
  const head = useRef();
  const legs = useRef([]);
  const eyes = useRef([]);
  const ears = useRef([]);
  const [bubble, setBubble] = useState(null);
  const st = useRef(null);
  if (!st.current) {
    st.current = {
      mode: "idle", t: 0, once: {}, wait: 2, heading: 0, walk: 0, y: 0, path: [], then: null, leap: null, stuckT: 0,
      speed: 1.4, spot: null, petSeen: runtime.cat.petAt ?? 0, bubble: null, bubbleUntil: 0,
      cool: { hide: 0, knock: 25 }, follow: 0,
      // eased pose values
      sit: 1, crouch: 0, loaf: 0, roll: 0, sink: 0, swipe: 0, peek: 0, ears: 0, blinkAt: 2,
    };
    // first time in: Byte is already hiding behind the armchair, by the front door
    if (firstVisit) {
      firstVisit = false;
      const spot = HIDES[2];
      runtime.cat.x = spot.at[0];
      runtime.cat.z = spot.at[1];
      Object.assign(st.current, { mode: "hide", spot, t: 0 });
    }
  }

  // ?debug: window.dispatchEvent(new CustomEvent("byte:do", { detail: "hide" | "knock" | "zoom" | "nap" | "stare" }))
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("debug")) return;
    const R_FOR = { hide: 0.1, knock: 0.3, zoom: 0.4, nap: 0.5, stare: 0.6 };
    const on = ({ detail }) => (st.current.forced = R_FOR[detail]);
    window.addEventListener("byte:do", on);
    window.__byte = { st: st.current, cat: runtime.cat, mug: () => runtime.mug, player: () => [runtime.x, runtime.z] };
    return () => window.removeEventListener("byte:do", on);
  }, []);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = getState();
    const c = runtime.cat;
    const m = st.current;
    const t = now();
    m.t += dt;
    const pdx = runtime.x - c.x;
    const pdz = runtime.z - c.z;
    const toPlayer = Math.hypot(pdx, pdz);
    const atPlayer = Math.atan2(pdx, pdz);
    const live = s.phase === "playing" && !s.panel;

    const say = (b, secs = 0) => {
      m.bubbleUntil = secs ? t + secs : 0;
      if (m.bubble !== b) {
        m.bubble = b;
        setBubble(b);
      }
    };
    if (m.bubbleUntil && t > m.bubbleUntil) say(null);

    const setMode = (mode, extra) => {
      m.mode = mode;
      m.t = 0;
      m.once = {};
      Object.assign(m, extra);
    };
    const goTo = (x, z, then, speed = 1.4) => {
      setMode("walk", { path: catPath([c.x, c.z], [x, z]), then, speed, stuckT: 0 });
    };
    const leapTo = (x, z, y, then, { dur = 0.45, arc = 0.4 } = {}) => {
      setMode("leap", { leap: { fx: c.x, fz: c.z, fy: m.y, tx: x, tz: z, ty: y, dur, arc }, then });
    };
    // true the first time it's asked in the current mode
    const once = (k) => !m.once[k] && (m.once[k] = true);
    const idle = (wait = 1 + Math.random() * 3) => setMode("idle", { wait });

    // pick what to do next once Byte is idle
    const decide = (r = Math.random()) => {
      // never set off from inside furniture (under the table, in the box): hop out first
      if (blocked(c.x, c.z, R)) return getDown(() => decide(r));
      const mugHome = runtime.mug?.state === "table";
      if (r < 0.24 && t > m.cool.hide) {
        const options = HIDES.filter((h) => Math.hypot(h.at[0] - runtime.x, h.at[1] - runtime.z) > 3);
        const spot = pick(options.length ? options : HIDES);
        say(null);
        goTo(spot.via[0], spot.via[1], () => {
          const d = Math.hypot(spot.at[0] - c.x, spot.at[1] - c.z);
          leapTo(spot.at[0], spot.at[1], 0, () => setMode("hide", { spot }), { dur: spot.box ? 0.5 : Math.max(0.3, d / 0.9), arc: spot.box ? 0.45 : 0 });
        }, 1.6);
      } else if (r < 0.36 && mugHome && t > m.cool.knock) {
        m.cool.knock = t + 80;
        goTo(TABLE_FLOOR[0], TABLE_FLOOR[1], () =>
          leapTo(TABLE_TOP[0], TABLE_TOP[1], TABLE_TOP[2], () => setMode("knock", { heading: 0 }), { arc: 0.35 })
        );
      } else if (r < 0.46) {
        setMode("zoom", { legs: 4 + Math.floor(Math.random() * 3), path: [] });
      } else if (r < 0.56) {
        const nap = pick(NAPS);
        const settle = () => setMode("nap", { dur: 18 + Math.random() * 16, nap });
        if (nap.via) goTo(nap.via[0], nap.via[1], () => leapTo(nap.at[0], nap.at[1], nap.y, settle, { arc: 0.35 }));
        else goTo(nap.at[0], nap.at[1], settle);
      } else if (r < 0.64) {
        const spot = pick(STARES);
        goTo(spot.at[0], spot.at[1], () => setMode("stare", { dur: 7 + Math.random() * 5, face: spot.face }));
      } else {
        const followYou = runtime.z > 0 && runtime.x < 3.5 && Math.random() < 0.45;
        const [x, z] = followYou ? freeNear(runtime.x + 0.9, runtime.z + 0.6) : randomSpot();
        goTo(x, z, () => idle());
      }
    };

    // get down from wherever Byte is perched (table, couch, box, under the dining table)
    const getDown = (then) => {
      const [x, z] = freeNear(c.x, c.z + (m.y > 0.3 ? -0.8 : 0.8));
      if (m.y > 0.01 || blocked(c.x, c.z, R)) leapTo(x, z, 0, then, { arc: 0.3, dur: 0.4 });
      else then();
    };

    if (m.forced != null) {
      const r = m.forced;
      m.forced = null;
      m.cool.hide = m.cool.knock = 0;
      say(null);
      getDown(() => decide(r));
    }

    /* ── being petted ── */
    if (c.petAt && c.petAt !== m.petSeen) {
      m.petSeen = c.petAt;
      if (m.mode === "nap") {
        sfx.meow();
        toast(pick(WAKE_LINES), "😾");
        say("💢", 2.5);
        m.ears = 1;
        getDown(() => {
          const [x, z] = randomSpot([runtime.x, runtime.z]);
          goTo(x, z, () => idle(), 2);
        });
      } else if (m.mode === "hide" || m.mode === "wiggle") {
        toast(`You found Byte behind ${m.spot.name}. Byte pretends this was the plan.`, "🐈");
        say("😳", 2);
        m.cool.hide = t + 30;
        getDown(() => idle(1));
      } else if (m.mode === "zoom" || m.mode === "leap") {
        toast("Byte is far too busy to be petted right now.", "💨");
      } else if (m.mode === "knock") {
        toast("Byte will be with you as soon as this mug is on the floor.", "☕");
      } else {
        const r = Math.random();
        if (r < 0.55) {
          sfx.meow();
          toast(CAT_LINES[catIdx++ % CAT_LINES.length]);
          say("❤️", 2.5);
          setMode("sit", { dur: 3 });
        } else if (r < 0.8) {
          toast("Byte rolls over and shows you the belly. You know this is a trap.", "🐈");
          say("😸");
          setMode("belly");
        } else {
          sfx.meow();
          toast("Byte headbutts your leg and now follows you everywhere. You have a cat now.", "🐈");
          say("❤️", 3);
          setMode("follow", { dur: 15 });
        }
      }
    }

    /* ── behaviour ── */
    let moving = false;
    let speed = 1.4;
    let targets = { sit: 0, crouch: 0, loaf: 0, roll: 0, sink: 0, swipe: 0, peek: 0, ears: 0 };

    switch (m.mode) {
      case "idle": {
        targets.sit = 1;
        if (toPlayer < 1.4) m.heading = atPlayer;
        m.wait -= dt;
        if (m.wait <= 0) decide();
        break;
      }
      case "walk": {
        speed = m.speed;
        const res = followPath(c, m, speed * dt, dt);
        moving = res === "moving";
        if (!moving) {
          const then = m.then;
          m.then = null;
          if (res === "arrived" && then) then();
          else idle();
        }
        break;
      }
      case "leap": {
        const L = m.leap;
        const u = Math.min(1, m.t / L.dur);
        c.x = lerp(L.fx, L.tx, u);
        c.z = lerp(L.fz, L.tz, u);
        m.y = lerp(L.fy, L.ty, u) + L.arc * Math.sin(Math.PI * u);
        if (Math.hypot(L.tx - L.fx, L.tz - L.fz) > 0.05) m.heading = Math.atan2(L.tx - L.fx, L.tz - L.fz);
        targets.crouch = L.arc ? 0 : 1; // slinking in low, or stretched out mid-jump
        if (u >= 1) {
          const then = m.then;
          m.then = null;
          then ? then() : idle();
        }
        break;
      }
      case "hide": {
        const spot = m.spot;
        targets.sink = spot.box ? 1 : 0;
        targets.sit = spot.box ? 1 : 0;
        targets.crouch = spot.box ? 0 : 1;
        // peek out now and then, more often when you're close
        const near = toPlayer < 4.5;
        targets.peek = Math.sin(m.t * (near ? 1.6 : 0.6)) > (near ? 0.2 : 0.75) ? 1 : 0;
        m.heading = near ? atPlayer : 0;
        if (live && s.moved && m.t > 1.5 && toPlayer < 1.75 && s.floor === "studio") {
          say("!");
          setMode("wiggle");
        } else if (m.t > 45) {
          m.cool.hide = t + 20;
          getDown(() => idle());
        }
        break;
      }
      case "wiggle": {
        targets.crouch = 1;
        targets.peek = 1;
        targets.sink = m.spot?.box ? 0.4 : 0;
        m.heading = atPlayer;
        if (m.t > 0.45) {
          // land just short of your feet
          const back = toPlayer > 0.01 ? 0.5 / toPlayer : 0;
          const [x, z] = freeNear(runtime.x - pdx * back, runtime.z - pdz * back);
          sfx.pounce?.();
          const spot = m.spot;
          leapTo(x, z, 0, () => {
            runtime.startleAt = now();
            sfx.meow();
            toast(pick(AMBUSH_LINES)(spot?.name ?? "the couch"), "🙀", 4500);
            say("😼", 1.6);
            m.cool.hide = now() + 40;
            setMode("proud");
          }, { dur: 0.42, arc: m.spot?.box ? 0.7 : 0.5 });
        }
        break;
      }
      case "proud": {
        targets.sit = 1;
        m.heading = atPlayer;
        if (m.t > 1.6) setMode("zoom", { legs: 3, path: [] });
        break;
      }
      case "zoom": {
        speed = 4.6;
        targets.ears = 1;
        if (!m.path.length) {
          if (m.legs-- <= 0) {
            say(null);
            idle(2 + Math.random() * 2);
            break;
          }
          const [x, z] = randomSpot([c.x, c.z]);
          m.path = catPath([c.x, c.z], [x, z]);
          m.stuckT = 0;
          say("💨");
        }
        const res = followPath(c, m, speed * dt, dt);
        moving = res === "moving";
        if (res === "stuck") m.path = [];
        break;
      }
      case "nap": {
        targets.loaf = 1;
        if (m.t > 1.2 && m.bubble !== "💤") say("💤");
        if (m.t > m.dur) {
          say(null);
          getDown(() => idle());
        }
        break;
      }
      case "stare": {
        targets.sit = 1;
        m.heading = m.face;
        if (m.t > 2.5 && once("look")) say("👀");
        if (m.t > m.dur) {
          say(null);
          idle();
        }
        break;
      }
      case "knock": {
        // eye contact with the camera, one slow swipe, more eye contact
        targets.sit = m.t < 1.2 || m.t > 1.7 ? 1 : 0.4;
        m.heading = 0;
        if (m.t > 0.3 && once("stare")) say("😐");
        targets.swipe = m.t > 1.2 && m.t < 1.6 ? 1 : 0;
        if (m.t > 1.4 && runtime.mug?.state === "table") {
          runtime.mug.state = "falling";
          runtime.mug.vz = 1.1;
          runtime.mug.vy = 0;
        }
        if (m.t > 1.8 && once("gloat")) {
          say("😼");
          if (live && Math.hypot(runtime.x - TABLE_TOP[0], runtime.z - TABLE_TOP[1]) < 7) {
            toast("Byte knocked the mug off the table. Eye contact was maintained throughout.", "☕", 4500);
          }
        }
        if (m.t > 3.4) {
          say(null);
          leapTo(TABLE_FLOOR[0], TABLE_FLOOR[1], 0, () => idle(), { arc: 0.3, dur: 0.4 });
        }
        break;
      }
      case "sit": {
        targets.sit = 1;
        m.heading = atPlayer;
        if (m.t > m.dur) idle();
        break;
      }
      case "belly": {
        targets.roll = m.t < 1.5 ? 1 : 0;
        if (m.t > 1.5 && once("chomp")) {
          runtime.startleAt = now();
          sfx.meow();
          toast("CHOMP. Byte bit your hand. Affectionately.", "🦷", 3500);
          say("😼", 1.5);
        }
        if (m.t > 2.1) setMode("zoom", { legs: 2, path: [] });
        break;
      }
      case "follow": {
        if (toPlayer > 1.1 && s.floor === "studio") {
          if (!m.path.length || m.t - (m.repath ?? 0) > 0.5) {
            m.repath = m.t;
            const back = 0.8 / Math.max(toPlayer, 0.01);
            m.path = catPath([c.x, c.z], freeNear(runtime.x - pdx * back, runtime.z - pdz * back));
          }
          speed = toPlayer > 3 ? 3 : 2;
          moving = followPath(c, m, speed * dt, dt) === "moving";
        } else {
          m.path = [];
          m.heading = atPlayer;
          targets.sit = 1;
        }
        if (m.t > m.dur) {
          m.path = [];
          idle();
        }
        break;
      }
    }

    /* ── pose ── */
    const ease = Math.min(1, dt * 8);
    for (const k in targets) m[k] += (targets[k] - m[k]) * ease;
    m.walk += moving ? dt * (speed > 3 ? 22 : 12) : 0;
    if (m.mode !== "leap" && m.mode !== "knock" && !(m.mode === "nap" && m.nap?.y)) m.y += (0 - m.y) * Math.min(1, dt * 10);

    const g = root.current;
    if (!g) return;
    g.visible = !(s.panel?.from && toPlayer < 2.5);
    g.position.set(c.x, m.y + (moving ? Math.abs(Math.sin(m.walk)) * (speed > 3 ? 0.06 : 0.03) : 0), c.z);
    g.rotation.y += angleDiff(m.heading, g.rotation.y) * Math.min(1, dt * (m.mode === "zoom" ? 14 : 8));

    const hidden = m.crouch * (1 - m.peek * 0.7);
    pose.current.position.set(m.mode === "wiggle" ? Math.sin(m.t * 50) * 0.025 : 0, 0.2 - m.loaf * 0.07 - m.sink * 0.22 - hidden * 0.06, 0);
    pose.current.scale.y = 1 - hidden * 0.35;
    pose.current.rotation.z = m.roll * Math.PI * 0.85;
    body.current.rotation.x = -m.sit * 0.45 * (1 - m.loaf);
    body.current.position.y = -m.sit * 0.03;
    head.current.position.y = 0.36 + m.peek * m.crouch * 0.08 - m.loaf * 0.08;
    head.current.rotation.x = m.loaf * 0.35 - hidden * 0.2;
    head.current.rotation.z = m.mode === "stare" ? Math.sin(m.t * 0.9) * 0.3 : Math.sin(clock.elapsedTime * 0.7) * 0.12;

    // legs: walking cycle, tucked in for a nap, waving in the air on the back, one paw swiping
    legs.current.forEach((l, i) => {
      if (!l) return;
      const phase = (i === 0 || i === 3 ? 0 : Math.PI) + m.walk;
      l.rotation.x = moving ? Math.sin(phase) * 0.6 : m.roll > 0.5 ? Math.sin(clock.elapsedTime * 7 + i) * 0.5 : 0;
      if (i === 1) l.rotation.x -= m.swipe * 1.4;
      l.scale.y = 1 - m.loaf * 0.85;
    });
    ears.current.forEach((e) => e && (e.rotation.x = -m.ears * 0.7));
    m.ears += (0 - m.ears) * Math.min(1, dt * 0.8); // ears creep back up after being grumpy

    // blinking, and shut while napping
    if (t > m.blinkAt) m.blinkAt = t + 2 + Math.random() * 4;
    const blink = t > m.blinkAt - 0.12;
    const shut = m.mode === "nap" || m.mode === "belly" || blink;
    eyes.current.forEach((e) => e && (e.scale.y += ((shut ? 0.15 : 1) - e.scale.y) * 0.5));

    const tailSpeed = m.mode === "hide" || m.mode === "wiggle" ? 9 : toPlayer < 1.4 ? 6 : m.mode === "nap" ? 0.6 : 2.5;
    tail.current.rotation.z = Math.sin(clock.elapsedTime * tailSpeed) * (m.mode === "nap" ? 0.15 : 0.45);
    tail.current.rotation.x = m.mode === "zoom" ? -0.9 : m.mode === "hide" ? 0.5 : 0;
  });

  const playing = useWorld((s) => s.phase === "playing" && !s.panel);

  return (
    <group ref={root} position={[runtime.cat.x, 0, runtime.cat.z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <circleGeometry args={[0.26, 18]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {/* everything that crouches, curls up or rolls over pivots around the cat's middle */}
      <group ref={pose} position={[0, 0.2, 0]}>
        <group position={[0, -0.2, 0]}>
          <group ref={body}>
            <P p={[0, 0.2, -0.02]} s={[0.24, 0.22, 0.44]} c="#f2a65a" r={0.07} />
            <P p={[0, 0.2, 0.05]} s={[0.25, 0.14, 0.2]} c="#fff7ed" r={0.05} line={false} />
            {/* tabby stripes */}
            {[-0.12, -0.02, 0.08].map((z) => <P key={z} p={[0, 0.315, z]} s={[0.2, 0.012, 0.04]} c="#d97706" r={0.005} line={false} />)}
            {/* collar with a little bell */}
            <P p={[0, 0.27, 0.16]} s={[0.2, 0.04, 0.06]} c="#7c5cd6" r={0.015} />
            <P p={[0, 0.24, 0.195]} s={[0.04, 0.04, 0.04]} c="#facc15" r={0.018} line={false} />
            <group ref={head} position={[0, 0.36, 0.24]}>
              <P p={[0, 0, 0]} s={[0.25, 0.21, 0.21]} c="#f2a65a" r={0.07} />
              <P p={[0, -0.04, 0.09]} s={[0.12, 0.08, 0.05]} c="#fff7ed" r={0.025} line={false} />
              {[-1, 1].map((x, i) => (
                <group key={x}>
                  <group ref={(el) => (ears.current[i] = el)} position={[x * 0.075, 0.09, 0]}>
                    <P p={[0, 0.04, 0]} s={[0.07, 0.08, 0.05]} c="#e08b3e" r={0.015} />
                    <P p={[0, 0.035, 0.022]} s={[0.035, 0.045, 0.01]} c="#f9a8d4" r={0.008} line={false} />
                  </group>
                  <group ref={(el) => (eyes.current[i] = el)} position={[x * 0.055, 0.02, 0.106]}>
                    <P p={[0, 0, 0]} s={[0.045, 0.055, 0.012]} c="#1c1410" r={0.012} line={false} />
                    <P p={[x * -0.008, 0.013, 0.007]} s={[0.014, 0.014, 0.004]} c="#ffffff" r={0.004} line={false} />
                  </group>
                </group>
              ))}
              <P p={[0, -0.025, 0.118]} s={[0.035, 0.022, 0.01]} c="#f9a8d4" r={0.006} line={false} />
            </group>
            <group ref={tail} position={[0, 0.27, -0.22]}>
              <P p={[0, 0.14, -0.04]} s={[0.055, 0.3, 0.055]} c="#e08b3e" r={0.025} />
            </group>
          </group>
          {[[-0.07, 0.15], [0.07, 0.15], [-0.07, -0.15], [0.07, -0.15]].map(([x, z], i) => (
            <group key={i} ref={(el) => (legs.current[i] = el)} position={[x, 0.1, z]}>
              <P p={[0, -0.05, 0]} s={[0.065, 0.1, 0.065]} c="#fff7ed" r={0.02} />
            </group>
          ))}
        </group>
      </group>
      {bubble && playing && (
        <Html position={[0, 0.95, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <div key={bubble} className="label-pop whitespace-nowrap rounded-2xl rounded-bl-sm border border-white/15 bg-white/90 px-2 py-0.5 text-[15px] font-bold leading-snug text-[#1c1917] shadow-lg">
            {bubble}
          </div>
        </Html>
      )}
    </group>
  );
}

// Walk along m.path, sliding round anything in the way.
function followPath(c, m, sp, dt) {
  if (!m.path.length) return "arrived";
  const [tx, tz] = m.path[0];
  const dx = tx - c.x;
  const dz = tz - c.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.08) {
    m.path.shift();
    return m.path.length ? "moving" : "arrived";
  }
  m.heading = Math.atan2(dx, dz);
  const k = Math.min(sp, d) / d;
  if (step(c, dx * k, dz * k, R)) {
    m.stuckT = 0;
    return "moving";
  }
  m.stuckT += dt;
  return m.stuckT > 0.6 ? "stuck" : "moving";
}

// The mug on the coffee table (Byte's favourite thing to push off it) and Byte's box.
export function CatProps() {
  const mug = useRef();
  if (!runtime.mug) runtime.mug = { state: "table", x: MUG_HOME[0], y: MUG_HOME[1], z: MUG_HOME[2], rx: 0, vy: 0, vz: 0, at: 0 };

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const g = runtime.mug;
    if (g.state === "falling") {
      g.z += g.vz * dt;
      if (g.z > 2.33) {
        // off the edge: tumble to the floor
        g.vy -= 9.8 * dt;
        g.y += g.vy * dt;
        g.rx += 7 * dt;
        if (g.y <= 0.055) {
          Object.assign(g, { y: 0.055, rx: Math.PI / 2, state: "floor", at: now() });
          g.z += 0.15;
          sfx.clack?.(0.5);
        }
      }
    } else if (g.state === "floor") {
      // someone quietly puts it back when nobody's looking
      const far = Math.hypot(runtime.x - MUG_HOME[0], runtime.z - MUG_HOME[2]) > 4;
      if (now() - g.at > 25 && far) Object.assign(g, { state: "table", x: MUG_HOME[0], y: MUG_HOME[1], z: MUG_HOME[2], rx: 0 });
    }
    if (mug.current) {
      mug.current.position.set(g.x, g.y, g.z);
      mug.current.rotation.x = g.rx;
    }
  });

  return (
    <>
      <group ref={mug} position={MUG_HOME}>
        <mesh castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.11, 14]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[0.06, 0, 0]} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.03, 0.009, 6, 12]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>
      {/* an open cardboard box: if it fits, Byte sits */}
      <group position={[BOX[0], 0, BOX[1]]} rotation-y={0.12}>
        <B p={[0, 0, 0]} s={[0.62, 0.03, 0.48]} c="#a47148" />
        <B p={[0, 0, 0.225]} s={[0.62, 0.34, 0.03]} c="#c08a55" />
        <B p={[0, 0, -0.225]} s={[0.62, 0.34, 0.03]} c="#b07c4a" />
        <B p={[0.295, 0, 0]} s={[0.03, 0.34, 0.48]} c="#b9834f" />
        <B p={[-0.295, 0, 0]} s={[0.03, 0.34, 0.48]} c="#b9834f" />
        {/* open flaps */}
        <B p={[0, 0.33, 0.32]} s={[0.6, 0.02, 0.2]} c="#c99862" rot={[0.6, 0, 0]} shadow={false} />
        <B p={[0.4, 0.33, 0]} s={[0.2, 0.02, 0.46]} c="#c99862" rot={[0, 0, -0.5]} shadow={false} />
        <B p={[0, 0.341, 0.226]} s={[0.3, 0.004, 0.012]} c="#e7d3a8" shadow={false} />
      </group>
    </>
  );
}
