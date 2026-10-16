"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { runtime, getState, setState, openPanel, interact, now } from "./store";
import { blocked, activeItems } from "./layout";
import * as sfx from "./audio";

const SPEED = 4.3;
const RADIUS = 0.32;

function Part({ p, s, c, r = 0.04, rough = 0.75 }) {
  return (
    <RoundedBox args={s} radius={Math.min(r, Math.min(...s) / 2 - 0.002)} smoothness={3} position={p} castShadow>
      <meshStandardMaterial color={c} roughness={rough} />
    </RoundedBox>
  );
}

// Move (x, z) by (dx, dz), sliding along whatever is in the way.
function step(obj, dx, dz, r) {
  let moved = false;
  if (dx && !blocked(obj.x + dx, obj.z, r)) { obj.x += dx; moved = true; }
  if (dz && !blocked(obj.x, obj.z + dz, r)) { obj.z += dz; moved = true; }
  return moved;
}

const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

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
    body.current.position.y = Math.abs(Math.sin(m.phase)) * 0.05 * stride;
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
          <group ref={legL} position={[-0.11, 0.62, 0]}>
            <Part p={[0, -0.28, 0]} s={[0.17, 0.56, 0.2]} c="#2b3150" />
            <Part p={[0, -0.585, 0.04]} s={[0.19, 0.09, 0.3]} c="#f5f5f5" r={0.03} />
          </group>
          <group ref={legR} position={[0.11, 0.62, 0]}>
            <Part p={[0, -0.28, 0]} s={[0.17, 0.56, 0.2]} c="#2b3150" />
            <Part p={[0, -0.585, 0.04]} s={[0.19, 0.09, 0.3]} c="#f5f5f5" r={0.03} />
          </group>
          {/* hoodie */}
          <Part p={[0, 0.93, 0]} s={[0.52, 0.64, 0.32]} c="#0f766e" r={0.08} />
          <Part p={[0, 0.82, 0.15]} s={[0.3, 0.16, 0.04]} c="#115e59" r={0.02} />
          <Part p={[0, 1.2, -0.15]} s={[0.4, 0.18, 0.1]} c="#115e59" r={0.04} />
          <group ref={armL} position={[-0.33, 1.18, 0]}>
            <Part p={[0, -0.26, 0]} s={[0.14, 0.54, 0.18]} c="#0f766e" r={0.06} />
            <Part p={[0, -0.57, 0]} s={[0.12, 0.11, 0.14]} c="#c89878" r={0.04} />
          </group>
          <group ref={armR} position={[0.33, 1.18, 0]}>
            <Part p={[0, -0.26, 0]} s={[0.14, 0.54, 0.18]} c="#0f766e" r={0.06} />
            <Part p={[0, -0.57, 0]} s={[0.12, 0.11, 0.14]} c="#c89878" r={0.04} />
          </group>
          <group ref={head} position={[0, 1.27, 0]}>
            <Part p={[0, 0.2, 0]} s={[0.42, 0.42, 0.4]} c="#c89878" r={0.09} />
            {/* hair */}
            <Part p={[0, 0.43, -0.02]} s={[0.46, 0.13, 0.44]} c="#1a1410" r={0.05} />
            <Part p={[0, 0.3, -0.19]} s={[0.46, 0.3, 0.08]} c="#1a1410" r={0.03} />
            <Part p={[0.12, 0.37, 0.18]} s={[0.2, 0.08, 0.07]} c="#1a1410" r={0.03} />
            {/* eyes */}
            <Part p={[-0.09, 0.22, 0.2]} s={[0.055, 0.07, 0.02]} c="#111" r={0.009} />
            <Part p={[0.09, 0.22, 0.2]} s={[0.055, 0.07, 0.02]} c="#111" r={0.009} />
            {/* the visitor wears a cap — Nikshith is the one with the headphones */}
            <Part p={[0, 0.47, 0]} s={[0.47, 0.12, 0.45]} c="#f59e0b" r={0.05} />
            <Part p={[0, 0.43, 0.27]} s={[0.4, 0.04, 0.2]} c="#d97706" r={0.02} />
          </group>
        </group>
      </group>
    </>
  );
}

// Byte the cat wanders the living room and comes to sit near you.
const CAT_AREA = [-10.5, 0.6, 2.8, 7.4];

export function Cat() {
  const root = useRef();
  const body = useRef();
  const tail = useRef();
  const headRef = useRef();
  const st = useRef({ tx: -7, tz: 4.6, wait: 2, heading: 0, walk: 0, sit: 1 });

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const c = runtime.cat;
    const m = st.current;
    const toPlayer = Math.hypot(runtime.x - c.x, runtime.z - c.z);

    let moving = false;
    if (toPlayer < 1.4) {
      m.heading = Math.atan2(runtime.x - c.x, runtime.z - c.z);
    } else if (m.wait > 0) {
      m.wait -= dt;
    } else {
      const dx = m.tx - c.x;
      const dz = m.tz - c.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.1) {
        m.wait = 2 + Math.random() * 4;
        const followYou = runtime.z > 0 && runtime.x < 3.5 && Math.random() < 0.45;
        m.tx = followYou ? runtime.x + 0.9 : CAT_AREA[0] + Math.random() * (CAT_AREA[2] - CAT_AREA[0]);
        m.tz = followYou ? runtime.z + 0.6 : CAT_AREA[1] + Math.random() * (CAT_AREA[3] - CAT_AREA[1]);
      } else {
        const sp = 1.4 * dt;
        if (!step(c, (dx / d) * sp, (dz / d) * sp, 0.2)) {
          m.wait = 0.5;
          m.tx = c.x;
          m.tz = c.z;
        }
        m.heading = Math.atan2(dx, dz);
        moving = true;
      }
    }
    m.walk += moving ? dt * 12 : 0;
    m.sit += ((moving ? 0 : 1) - m.sit) * Math.min(1, dt * 4);

    const g = root.current;
    if (!g) return;
    g.visible = !(getState().panel?.from && toPlayer < 2.5);
    g.position.set(c.x, moving ? Math.abs(Math.sin(m.walk)) * 0.03 : 0, c.z);
    g.rotation.y += angleDiff(m.heading, g.rotation.y) * Math.min(1, dt * 8);
    // sitting tilts the body back
    body.current.rotation.x = -m.sit * 0.45;
    body.current.position.y = -m.sit * 0.03;
    tail.current.rotation.z = Math.sin(clock.elapsedTime * (toPlayer < 1.4 ? 6 : 2.5)) * 0.45;
    headRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.12;
  });

  return (
    <group ref={root} position={[runtime.cat.x, 0, runtime.cat.z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <circleGeometry args={[0.26, 18]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <group ref={body}>
        <Part p={[0, 0.2, -0.02]} s={[0.24, 0.22, 0.44]} c="#f2a65a" r={0.07} />
        <Part p={[0, 0.2, 0.05]} s={[0.25, 0.14, 0.2]} c="#fff7ed" r={0.05} />
        <group ref={headRef} position={[0, 0.36, 0.24]}>
          <Part p={[0, 0, 0]} s={[0.24, 0.21, 0.21]} c="#f2a65a" r={0.07} />
          <Part p={[-0.075, 0.13, 0]} s={[0.07, 0.08, 0.05]} c="#e08b3e" r={0.015} />
          <Part p={[0.075, 0.13, 0]} s={[0.07, 0.08, 0.05]} c="#e08b3e" r={0.015} />
          <Part p={[-0.055, 0.02, 0.105]} s={[0.035, 0.045, 0.01]} c="#111" r={0.004} />
          <Part p={[0.055, 0.02, 0.105]} s={[0.035, 0.045, 0.01]} c="#111" r={0.004} />
          <Part p={[0, -0.035, 0.108]} s={[0.04, 0.025, 0.01]} c="#f9a8d4" r={0.004} />
        </group>
        <group ref={tail} position={[0, 0.27, -0.22]}>
          <Part p={[0, 0.14, -0.04]} s={[0.055, 0.3, 0.055]} c="#e08b3e" r={0.025} />
        </group>
      </group>
      {[[-0.07, 0.15], [0.07, 0.15], [-0.07, -0.15], [0.07, -0.15]].map(([x, z], i) => (
        <Part key={i} p={[x, 0.05, z]} s={[0.065, 0.1, 0.065]} c="#fff7ed" r={0.02} />
      ))}
    </group>
  );
}
