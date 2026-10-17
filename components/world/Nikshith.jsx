"use client";

// Nikshith lives in the studio. He goes about his day on his own — coding,
// playing piano, reading, making coffee — and when a visitor walks up he stops,
// turns, waves, and you can talk to him.

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { runtime, getState, useWorld } from "./store";
import { blocked, planPath, ACTIVITIES } from "./layout";
import { Arm, Head, Leg, OUTFITS, Torso } from "./Avatar";

export { ACTIVITIES };


const SPEED = 2.1;
const R = 0.32;
const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const rand = ([a, b]) => a + Math.random() * (b - a);

function Part({ p, s, c, r = 0.04, rot }) {
  return (
    <RoundedBox args={s} radius={Math.min(r, Math.min(...s) / 2 - 0.002)} smoothness={3} position={p} rotation={rot} castShadow>
      <meshStandardMaterial color={c} roughness={0.75} />
    </RoundedBox>
  );
}

// pick his next activity: somewhere he wasn't just now
function nextActivity(prevId) {
  const options = ACTIVITIES.filter((a) => a.id !== prevId);
  return options[Math.floor(Math.random() * options.length)];
}

export function Nikshith() {
  const root = useRef();
  const body = useRef();
  const head = useRef();
  const legL = useRef();
  const legR = useRef();
  const armL = useRef();
  const armR = useRef();
  const mug = useRef();
  const book = useRef();
  const key = useRef();
  const [bubble, setBubble] = useState(ACTIVITIES[0].bubble);
  // thought bubbles only while you are walking around (not over the title screen or a panel)
  const playing = useWorld((s) => s.phase === "playing" && !s.panel);
  const st = useRef({ act: ACTIVITIES[0], path: [], until: 16, walk: 0, greeted: false, wave: 0, stuck: 0 });

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;
    const n = runtime.npc;
    const m = st.current;
    const s = getState();
    const talking = s.panel?.id === "ask";
    const toPlayer = Math.hypot(runtime.x - n.x, runtime.z - n.z);
    const near = toPlayer < 2.0;

    let moving = false;
    if (talking || near) {
      // stop and face the visitor; wave hello the first time they come close
      n.heading += angleDiff(Math.atan2(runtime.x - n.x, runtime.z - n.z), n.heading) * Math.min(1, dt * 6);
      if (!m.greeted) {
        m.greeted = true;
        m.wave = t;
      }
      if (bubble !== null) setBubble(null);
    } else {
      if (toPlayer > 4) m.greeted = false;
      if (m.path.length) {
        const [tx, tz] = m.path[0];
        const dx = tx - n.x;
        const dz = tz - n.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.12) {
          m.path.shift();
          if (!m.path.length) {
            m.until = t + rand(m.act.secs);
            setBubble(m.act.bubble);
          }
        } else {
          const sp = SPEED * dt;
          let ok = false;
          if (!blocked(n.x + (dx / d) * sp, n.z, R)) { n.x += (dx / d) * sp; ok = true; }
          if (!blocked(n.x, n.z + (dz / d) * sp, R)) { n.z += (dz / d) * sp; ok = true; }
          m.stuck = ok ? 0 : m.stuck + dt;
          if (m.stuck > 1) {
            // wedged: skip this leg rather than shuffle forever
            m.path.shift();
            m.stuck = 0;
          }
          n.heading += angleDiff(Math.atan2(dx, dz), n.heading) * Math.min(1, dt * 8);
          moving = true;
        }
      } else {
        // at the activity: face it, and move on once time's up
        const [lx, lz] = m.act.look;
        n.heading += angleDiff(Math.atan2(lx - n.x, lz - n.z), n.heading) * Math.min(1, dt * 5);
        if (t > m.until) {
          m.act = nextActivity(m.act.id);
          n.activity = m.act.id;
          m.path = planPath([n.x, n.z], m.act.spot);
          setBubble(null);
        } else if (bubble === null) {
          setBubble(m.act.bubble);
        }
      }
    }

    // ── animate ──
    const g = root.current;
    if (!g) return;
    g.position.set(n.x, 0, n.z);
    g.rotation.y = n.heading;
    m.walk += moving ? dt * 9 : 0;
    const swing = moving ? Math.sin(m.walk) * 0.6 : 0;
    const pose = moving || near || talking ? "idle" : m.act.pose;
    legL.current.rotation.x = swing;
    legR.current.rotation.x = -swing;
    body.current.position.y = moving ? Math.abs(Math.sin(m.walk)) * 0.04 : Math.sin(t * 2) * 0.008;

    // arms: x = forward/back, z = out to the side (left arm out = negative z)
    let lx = -swing * 0.8, rx = swing * 0.8, lz = 0, rz = 0;
    const waving = t - m.wave < 2.2;
    if (pose === "type") { lx = rx = -1.15; lx += Math.sin(t * 14) * 0.08; rx += Math.sin(t * 14 + 2) * 0.08; }
    if (pose === "piano") { lx = rx = -1.1; lz = -0.12 + Math.sin(t * 3) * 0.12; rz = 0.12 + Math.sin(t * 3 + 1.5) * 0.12; }
    if (pose === "play") { lx = rx = -1.0; rx += Math.sin(t * 12) * 0.12; }
    if (pose === "write") { rx = -1.6 + Math.sin(t * 5) * 0.12; rz = 0.25 + Math.sin(t * 3) * 0.15; }
    if (pose === "browse") { rx = -1.9 + Math.sin(t * 1.3) * 0.2; }
    if (pose === "read") { lx = rx = -1.0; lz = -0.25; rz = 0.25; }
    if (pose === "coffee") { rx = Math.sin(t * 0.9) > 0.3 ? -2.2 : -0.6; }
    if (waving) { rx = 0; rz = 2.6 + Math.sin((t - m.wave) * 12) * 0.35; }
    // talking: easy hand gestures, a little head bob, mouth flapping
    const speaking = talking && n.talking;
    if (speaking && !waving) {
      lx = -0.45 + Math.sin(t * 3.1) * 0.25;
      rx = -0.55 + Math.sin(t * 2.3 + 1) * 0.3;
      lz = -0.15 + Math.sin(t * 1.7) * 0.1;
      rz = 0.2 + Math.sin(t * 2.1 + 2) * 0.15;
    }
    const k = Math.min(1, dt * 10);
    armL.current.rotation.x += (lx - armL.current.rotation.x) * k;
    armR.current.rotation.x += (rx - armR.current.rotation.x) * k;
    armL.current.rotation.z += (lz - armL.current.rotation.z) * k;
    armR.current.rotation.z += (rz - armR.current.rotation.z) * k;
    // look down at what he's doing, up at a visitor
    if (talking && !m.wasTalking) m.nod = t;
    m.wasTalking = talking;
    const nod = t - (m.nod ?? -9) < 0.7 ? Math.sin((t - m.nod) * 9) * 0.16 : 0;
    const tilt = pose === "type" || pose === "piano" || pose === "read" ? 0.25 : near ? -0.1 + (speaking ? Math.sin(t * 5) * 0.05 : 0) : 0;
    head.current.rotation.x += (tilt + nod - head.current.rotation.x) * k;
    // glance at a visitor who's around (the body only turns once they're close)
    const glance = toPlayer < 5 && !moving && !talking ? Math.max(-0.7, Math.min(0.7, angleDiff(Math.atan2(runtime.x - n.x, runtime.z - n.z), n.heading))) : 0;
    head.current.rotation.y += (glance - head.current.rotation.y) * Math.min(1, dt * 3);
    head.current.rotation.z = speaking ? Math.sin(t * 1.3) * 0.05 : head.current.rotation.z * 0.9;
    // a warm key light on his face while you're talking to him
    if (key.current) key.current.intensity += ((talking ? 7 : 0) - key.current.intensity) * Math.min(1, dt * 4);
    if (mug.current) mug.current.visible = pose === "coffee" || pose === "idle";
    if (book.current) book.current.visible = pose === "read";
  });

  return (
    <group ref={root} position={[runtime.npc.x, 0, runtime.npc.z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.014, 0]}>
        <circleGeometry args={[0.4, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.32} depthWrite={false} />
      </mesh>
      <group ref={body}>
        <group ref={legL} position={[-0.11, 0.62, 0]}><Leg o={OUTFITS.nikshith} /></group>
        <group ref={legR} position={[0.11, 0.62, 0]}><Leg o={OUTFITS.nikshith} /></group>
        <Torso o={OUTFITS.nikshith} />
        <group ref={armL} position={[-0.335, 1.18, 0]}>
          <Arm o={OUTFITS.nikshith} side={-1} />
          {/* a book, held open in both hands while reading */}
          <group ref={book} position={[0.33, -0.62, 0.05]} visible={false}>
            <Part p={[0, 0, 0]} s={[0.36, 0.03, 0.26]} c="#f5f0e1" r={0.01} />
            <Part p={[0, -0.02, 0]} s={[0.38, 0.02, 0.28]} c="#111" r={0.01} />
          </group>
        </group>
        <group ref={armR} position={[0.335, 1.18, 0]}>
          <Arm o={OUTFITS.nikshith} side={1} />
          <mesh ref={mug} position={[0, -0.66, 0.06]} visible={false}>
            <cylinderGeometry args={[0.055, 0.05, 0.12, 12]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>
        <group ref={head} position={[0, 1.27, 0]}>
          <Head o={OUTFITS.nikshith} />
        </group>
      </group>
      <pointLight ref={key} position={[0.6, 2.3, 1.6]} color="#ffe2c2" intensity={0} distance={5} decay={2} />
      {bubble && playing && (
        <Html position={[0, 2.35, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <div className="label-pop whitespace-nowrap rounded-2xl rounded-bl-sm border border-white/15 bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#1c1917] shadow-lg">
            {bubble}
          </div>
        </Html>
      )}
    </group>
  );
}
