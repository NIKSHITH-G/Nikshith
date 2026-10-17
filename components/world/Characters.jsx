"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { runtime, getState, setState, openPanel, interact, now } from "./store";
import { blocked, activeItems } from "./layout";
import { Arm, Head, Leg, OUTFITS, P, Torso } from "./Avatar";
import * as sfx from "./audio";

const SPEED = 4.3;
const RADIUS = 0.32;


// Move (x, z) by (dx, dz), sliding along whatever is in the way.
export function step(obj, dx, dz, r) {
  let moved = false;
  if (dx && !blocked(obj.x + dx, obj.z, r)) { obj.x += dx; moved = true; }
  if (dz && !blocked(obj.x, obj.z + dz, r)) { obj.z += dz; moved = true; }
  return moved;
}

export const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

// Little dust puffs kicked up by footsteps.
const PUFFS = 8;
function Dust({ puffs }) {
  return (
    <group>
      {Array.from({ length: PUFFS }, (_, i) => (
        <mesh key={i} ref={(m) => (puffs.current[i] = m)} visible={false} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.09, 10]} />
          <meshBasicMaterial color="#cbbfae" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Player() {
  const root = useRef();
  const body = useRef();
  const head = useRef();
  const legL = useRef();
  const legR = useRef();
  const armL = useRef();
  const armR = useRef();
  const puffs = useRef([]);
  const puffIdx = useRef(0);
  const st = useRef({ phase: 0, lastStep: 0, stuck: 0, breathe: 0 });

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = getState();
    const m = st.current;
    const frozen = s.phase !== "playing" || s.panel || s.map;
    const k = runtime.keys;

    // input in screen space: x = right, z = towards the camera
    let ix = 0;
    let iz = 0;
    if (!frozen) {
      if (k.has("a") || k.has("arrowleft")) ix -= 1;
      if (k.has("d") || k.has("arrowright")) ix += 1;
      if (k.has("w") || k.has("arrowup")) iz -= 1;
      if (k.has("s") || k.has("arrowdown")) iz += 1;
      ix += runtime.joy.x;
      iz += runtime.joy.z;
    }

    let wx = 0;
    let wz = 0;
    if (Math.hypot(ix, iz) > 0.12) {
      // rotate by the camera yaw so "up" always means "away from the camera"
      const c = Math.cos(runtime.yaw);
      const sn = Math.sin(runtime.yaw);
      wx = ix * c + iz * sn;
      wz = -ix * sn + iz * c;
      runtime.path = [];
      runtime.pendingOpen = null;
      if (!s.moved) setState({ moved: true });
    } else if (!frozen && runtime.path.length) {
      const [tx, tz] = runtime.path[0];
      const dx = tx - runtime.x;
      const dz = tz - runtime.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.15) {
        runtime.path.shift();
        m.stuck = 0;
        if (!runtime.path.length && runtime.pendingOpen) {
          const it = activeItems().find((i) => i.id === runtime.pendingOpen);
          runtime.pendingOpen = null;
          if (it) {
            runtime.heading = Math.atan2(it.pos[0] - runtime.x, it.pos[1] - runtime.z);
            if (it.action) interact(it.id);
            else openPanel(it.panel, it.item, it.id);
          }
        }
      } else {
        wx = dx / d;
        wz = dz / d;
      }
    }

    const mag = Math.min(1, Math.hypot(wx, wz));
    const walking = mag > 0.05;
    // ease speed in and out so starts and stops don't feel robotic
    runtime.speed += ((walking ? SPEED * mag : 0) - runtime.speed) * Math.min(1, dt * 12);

    if (walking) {
      const len = Math.hypot(wx, wz);
      const moved = step(runtime, (wx / len) * runtime.speed * dt, (wz / len) * runtime.speed * dt, RADIUS);
      if (!moved && runtime.path.length) {
        m.stuck += dt;
        if (m.stuck > 0.4) { runtime.path = []; runtime.pendingOpen = null; m.stuck = 0; }
      }
      runtime.heading += angleDiff(Math.atan2(wx, wz), runtime.heading) * Math.min(1, dt * 14);
    }

    const stride = runtime.speed / SPEED;
    m.phase += dt * 11 * stride;
    if (stride < 0.05) m.phase += (Math.round(m.phase / Math.PI) * Math.PI - m.phase) * 0.2;

    // a footstep (sound + dust) every half stride
    const stepNo = Math.floor(m.phase / Math.PI);
    if (stride > 0.3 && stepNo !== m.lastStep) {
      m.lastStep = stepNo;
      sfx.step();
      const p = puffs.current[puffIdx.current++ % PUFFS];
      if (p) {
        const side = stepNo % 2 ? 0.12 : -0.12;
        p.position.set(runtime.x + Math.cos(runtime.heading) * side, 0.03, runtime.z - Math.sin(runtime.heading) * side);
        p.userData.born = clock.elapsedTime;
        p.visible = true;
      }
    }
    for (const p of puffs.current) {
      if (!p?.visible) continue;
      const age = clock.elapsedTime - p.userData.born;
      if (age > 0.6) { p.visible = false; continue; }
      p.scale.setScalar(1 + age * 3);
      p.material.opacity = 0.35 * (1 - age / 0.6);
    }

    const g = root.current;
    if (!g) return;
    g.position.set(runtime.x, 0, runtime.z);
    g.rotation.y = runtime.heading;
    // step out of the shot while the camera is focused on an object
    g.visible = !s.panel?.from && s.panel?.id !== "ask";

    const swing = Math.sin(m.phase) * 0.65 * Math.min(1, stride * 1.4);
    legL.current.rotation.x = swing;
    legR.current.rotation.x = -swing;
    armL.current.rotation.x = -swing * 0.8;
    armL.current.rotation.z = 0;

    // wave hello for a couple of seconds after arriving
    const sinceWave = now() - runtime.waveAt;
    if (runtime.waveAt && sinceWave < 2.2 && !walking) {
      armR.current.rotation.x = 0;
      armR.current.rotation.z += (2.6 + Math.sin(sinceWave * 12) * 0.35 - armR.current.rotation.z) * 0.3;
    } else {
      armR.current.rotation.z += (0 - armR.current.rotation.z) * 0.25;
      armR.current.rotation.x = swing * 0.8;
    }

    // breathing + bounce
    m.breathe += dt;
    // jump out of your skin when Byte pounces
    const startled = now() - (runtime.startleAt ?? -9);
    const hop = startled < 0.5 ? Math.sin((startled / 0.5) * Math.PI) * 0.32 : 0;
    body.current.position.y = Math.abs(Math.sin(m.phase)) * 0.05 * stride + hop;
    body.current.scale.y = 1 + Math.sin(m.breathe * 2.2) * 0.012 * (1 - stride);

    // look at whatever you're near
    let look = 0;
    const near = activeItems().find((i) => i.id === s.nearby);
    const pet = { cat: runtime.cat, dog: runtime.dog, nikshith: runtime.npc }[s.nearby];
    const target = near ? near.pos : pet ? [pet.x, pet.z] : null;
    if (target && !walking) {
      look = Math.max(-0.8, Math.min(0.8, angleDiff(Math.atan2(target[0] - runtime.x, target[1] - runtime.z), runtime.heading)));
    } else if (!walking) {
      look = Math.sin(m.breathe * 0.4) * 0.25; // idle glance around
    }
    head.current.rotation.y += (look - head.current.rotation.y) * Math.min(1, dt * 5);
    if (startled < 0.8) {
      armL.current.rotation.z = -2.5;
      armR.current.rotation.z = 2.5;
      armL.current.rotation.x = armR.current.rotation.x = 0;
    } else if (startled < 1.2) {
      armL.current.rotation.z *= 0.8;
    }
  });

  return (
    <>
      <Dust puffs={puffs} />
      <group ref={root} position={[runtime.x, 0, runtime.z]}>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, 0]}>
          <circleGeometry args={[0.4, 24]} />
          <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
        </mesh>
        <group ref={body}>
          <group ref={legL} position={[-0.11, 0.62, 0]}><Leg o={OUTFITS.visitor} /></group>
          <group ref={legR} position={[0.11, 0.62, 0]}><Leg o={OUTFITS.visitor} /></group>
          <Torso o={OUTFITS.visitor} />
          <group ref={armL} position={[-0.335, 1.18, 0]}><Arm o={OUTFITS.visitor} side={-1} /></group>
          <group ref={armR} position={[0.335, 1.18, 0]}><Arm o={OUTFITS.visitor} side={1} /></group>
          <group ref={head} position={[0, 1.27, 0]}>
            {/* the visitor wears a cap — Nikshith is the one with the headphones */}
            <Head o={OUTFITS.visitor} />
          </group>
        </group>
      </group>
    </>
  );
}
