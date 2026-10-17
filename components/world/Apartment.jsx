"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WALLS, PART_H, POWER } from "./layout";
import { usePower } from "./power";
import { runtime, getState } from "./store";
import { WHITE, BLACK } from "./notes";
import { projects, music, photography } from "../../lib/content";

export const C = {
  wallOuter: "#2b2e48",
  wallInner: "#383c62",
  cap: "#8f93c9",
  wood: "#7a5a45",
  woodDark: "#43312a",
  violet: "#5e4c94",
  black: "#16171f",
  metal: "#8d93a8",
  gold: "#e8b94c",
  cream: "#ece5d3",
};
export const MONO = "'DM Mono', ui-monospace, Menlo, monospace";
export const SERIF = "'Instrument Serif', Georgia, serif";

/* ───────────────────────── helpers ───────────────────────── */

// Box with its bottom edge at y. `r` rounds the corners, which catches light far better.
export function B({ p: [x, y, z], s: [w, h, d], c, r = 0, rot, shadow = true, rough = 0.8, metal = 0 }) {
  const mat = <meshStandardMaterial color={c} roughness={rough} metalness={metal} />;
  if (r > 0) {
    return (
      <RoundedBox args={[w, h, d]} radius={Math.min(r, Math.min(w, h, d) / 2 - 0.002)} smoothness={3} position={[x, y + h / 2, z]} rotation={rot} castShadow={shadow} receiveShadow>
        {mat}
      </RoundedBox>
    );
  }
  return (
    <mesh position={[x, y + h / 2, z]} rotation={rot} castShadow={shadow} receiveShadow>
      <boxGeometry args={[w, h, d]} />
      {mat}
    </mesh>
  );
}

export function canvasTexture(w, h, draw) {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function useTex(w, h, draw, deps = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => canvasTexture(w, h, draw), deps);
}

// A light that switches on during the entrance.
function PLight({ k, intensity, ...props }) {
  const ref = useRef();
  usePower(POWER[k], (p) => ref.current && (ref.current.intensity = intensity * p));
  return <pointLight ref={ref} intensity={0} decay={2} {...props} />;
}

// Emissive material that switches on with its room.
function GlowMat({ k, color, intensity = 2, base = "#222", ...props }) {
  const ref = useRef();
  usePower(POWER[k], (p) => ref.current && (ref.current.emissiveIntensity = intensity * p));
  return <meshStandardMaterial ref={ref} color={base} emissive={color} emissiveIntensity={0} toneMapped={false} {...props} />;
}

// A glowing screen. Unlit so it reads at night; dark until its room powers on.
function Screen({ k, position, rotation, size, map }) {
  const ref = useRef();
  usePower(POWER[k], (p) => ref.current && ref.current.color.setScalar(0.03 + 0.97 * p));
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial ref={ref} map={map} toneMapped={false} />
    </mesh>
  );
}

/* ───────────────────────── shell ───────────────────────── */

function Shell() {
  const tiles = useTex(512, 512, (g, w, h) => {
    g.fillStyle = "#2e3146";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++) {
        g.fillStyle = (i + j) % 2 ? "#30344a" : "#2b2f44";
        g.fillRect(i * 64 + 2, j * 64 + 2, 60, 60);
      }
  });
  const planks = useTex(512, 512, (g, w, h) => {
    g.fillStyle = "#5c4433";
    g.fillRect(0, 0, w, h);
    for (let row = 0; row < 16; row++) {
      const off = (row * 71) % 210;
      g.fillStyle = ["#644a38", "#5a4231", "#604635"][row % 3];
      g.fillRect(0, row * 32, w, 30);
      g.fillStyle = "#3d2c22";
      g.fillRect(0, row * 32 + 30, w, 2);
      for (let x = off; x < w; x += 210) g.fillRect(x, row * 32, 2, 30);
      // grain
      g.fillStyle = "rgba(0,0,0,0.06)";
      for (let k = 0; k < 6; k++) g.fillRect((k * 97 + row * 31) % w, row * 32 + 8 + (k % 3) * 6, 60, 1);
    }
  });
  if (tiles) { tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(5, 1.5); }
  if (planks) { planks.wrapS = planks.wrapT = THREE.RepeatWrapping; planks.repeat.set(4, 2.5); }

  return (
    <group>
      {/* the slab the whole model sits on — reads like an architectural cutaway */}
      <B p={[0, -0.6, 0]} s={[24.6, 0.6, 16.6]} c="#191b2a" shadow={false} />
      <mesh position={[0, -0.6, 8.31]}>
        <planeGeometry args={[24.6, 0.6]} />
        <meshStandardMaterial color="#141522" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, -4.5]} receiveShadow>
        <planeGeometry args={[24, 7]} />
        <meshStandardMaterial map={tiles} roughness={0.55} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 3.5]} receiveShadow>
        <planeGeometry args={[24, 9]} />
        <meshStandardMaterial map={planks} roughness={0.7} />
      </mesh>

      {WALLS.map(([x, z, w, d, h], i) => {
        const outer = h > PART_H + 0.1;
        return (
          <group key={i}>
            <B p={[x, 0, z]} s={[w, h, d]} c={outer ? C.wallOuter : C.wallInner} shadow={h > 0.5} />
            {/* light cap on the cut edge of every wall */}
            <B p={[x, h, z]} s={[w + 0.02, 0.04, d + 0.02]} c={C.cap} shadow={false} />
          </group>
        );
      })}
      {/* skirting */}
      <B p={[0, 0, -7.86]} s={[23.8, 0.14, 0.05]} c="#1e2034" shadow={false} />
      <B p={[-11.86, 0, 0]} s={[0.05, 0.14, 15.8]} c="#1e2034" shadow={false} />
      <B p={[11.86, 0, 0]} s={[0.05, 0.14, 15.8]} c="#1e2034" shadow={false} />
    </group>
  );
}

function Window({ x }) {
  const sky = useTex(256, 170, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#162058");
    grd.addColorStop(1, "#45306e");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 46; i++) g.fillRect((i * 97 + x * 13) % w, (i * 53) % (h * 0.65), i % 5 ? 1.5 : 2.5, i % 5 ? 1.5 : 2.5);
    g.fillStyle = "#fbf6dc";
    g.shadowColor = "#fbf6dc";
    g.shadowBlur = 24;
    g.beginPath(); g.arc(w * 0.7, h * 0.3, 15, 0, Math.PI * 2); g.fill();
    g.shadowBlur = 0;
    for (let i = 0; i < 10; i++) {
      const bh = 34 + ((i * 37 + x) % 50);
      g.fillStyle = "#0f1430";
      g.fillRect(i * 27, h - bh, 24, bh);
      g.fillStyle = "#ffd58a";
      for (let k = 0; k < 4; k++) if ((i + k * 3) % 4 === 0) g.fillRect(i * 27 + 5 + (k % 2) * 9, h - bh + 8 + k * 8, 4, 4);
    }
  }, [x]);
  // a tapered, soft-edged beam: narrow at the window, spreading onto the floor
  const shaft = useTex(128, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "rgba(170,190,255,0)");
    grd.addColorStop(0.3, "rgba(170,190,255,0.5)");
    grd.addColorStop(1, "rgba(170,190,255,0.85)");
    g.filter = "blur(10px)";
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(w * 0.3, 0);
    g.lineTo(w * 0.7, 0);
    g.lineTo(w * 0.92, h);
    g.lineTo(w * 0.08, h);
    g.closePath();
    g.fill();
  });
  return (
    <group>
      <group position={[x, 1.55, -7.88]}>
        <B p={[0, -0.05, 0]} s={[2.2, 1.5, 0.06]} c="#d8d2c6" shadow={false} />
        <mesh position={[0, 0.7, 0.04]}>
          <planeGeometry args={[2, 1.3]} />
          <meshBasicMaterial map={sky} toneMapped={false} />
        </mesh>
        <B p={[0, 0, 0.06]} s={[0.04, 1.4, 0.04]} c="#d8d2c6" shadow={false} />
        <B p={[0, 0.68, 0.06]} s={[2, 0.04, 0.04]} c="#d8d2c6" shadow={false} />
        <B p={[0, -0.12, 0.12]} s={[2.3, 0.06, 0.22]} c="#d8d2c6" />
      </group>
      {/* fake moonlight shaft spilling onto the floor */}
      <mesh position={[x, 1.15, -6.55]} rotation-x={-0.865}>
        <planeGeometry args={[2.8, 3.6]} />
        <meshBasicMaterial map={shaft} transparent opacity={0.09} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Plant({ x, z, s = 1, kind = 0 }) {
  const leaves = kind === 0
    ? [[0, 0.78, 0, 0.32], [0.16, 0.98, 0.05, 0.24], [-0.13, 1.06, -0.05, 0.22], [0.02, 1.26, 0, 0.17]]
    : [[0, 0.95, 0, 0.12], [0.1, 0.8, 0.05, 0.14], [-0.1, 0.72, -0.04, 0.13], [0.04, 1.12, 0.02, 0.09], [-0.06, 0.6, 0.08, 0.12]];
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.5, 16]} />
        <meshStandardMaterial color={kind ? "#e7e2d8" : "#b9704f"} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
        <meshStandardMaterial color="#3a2a20" />
      </mesh>
      {leaves.map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]} castShadow>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={i % 2 ? "#4a9a63" : "#2f7349"} flatShading roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── study ───────────────────────── */

function Study() {
  const term = useTex(512, 300, (g, w, h) => {
    g.fillStyle = "#0a0a13";
    g.fillRect(0, 0, w, h);
    g.font = `22px ${MONO}`;
    const lines = [
      ["#86efac", "$ ", "#e6e6f0", "git log --career"],
      ["#fbbf24", "a3f9e1 ", "#c4b5fd", "systems eng @ TCS"],
      ["#fbbf24", "7c21d0 ", "#c4b5fd", "ai dev intern @ google dev"],
      ["#86efac", "$ ", "#e6e6f0", "open resume.pdf"],
      ["#86efac", "$ ", "#e6e6f0", "_"],
    ];
    lines.forEach(([c1, a, c2, b], i) => {
      g.fillStyle = c1; g.fillText(a, 26, 52 + i * 48);
      g.fillStyle = c2; g.fillText(b, 26 + g.measureText(a).width, 52 + i * 48);
    });
  });

  const books = useMemo(() => {
    const cols = ["#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#e5e7eb", "#ec4899", "#14b8a6", "#f97316"];
    const out = [];
    for (let shelf = 0; shelf < 4; shelf++) {
      let z = -5.78;
      let k = shelf * 7;
      while (z < -3.25) {
        const t = 0.1 + ((k * 37) % 7) / 60;
        const h = 0.32 + ((k * 13) % 5) / 38;
        const lean = k % 11 === 5 ? 0.25 : 0;
        out.push({ y: 0.16 + shelf * 0.58, z: z + t / 2, t, h, c: cols[k % cols.length], lean });
        z += t + 0.012 + (lean ? 0.12 : 0);
        k++;
      }
    }
    return out;
  }, []);

  return (
    <group>
      <Window x={-8} />
      {/* wall-mounted "ship log" screen — the live GitHub view opens on it */}
      <ShipLog />

      {/* desk */}
      <B p={[-8, 0.72, -7.2]} s={[2.6, 0.07, 1.1]} c={C.wood} r={0.02} />
      {[[-9.2, -7.65], [-6.8, -7.65], [-9.2, -6.75], [-6.8, -6.75]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.07, 0.72, 0.07]} c={C.woodDark} />
      ))}
      <B p={[-6.95, 0.25, -7.2]} s={[0.5, 0.47, 1.0]} c={C.woodDark} r={0.02} />
      {/* monitor */}
      <B p={[-8, 0.79, -7.45]} s={[0.3, 0.03, 0.2]} c={C.black} />
      <B p={[-8, 0.79, -7.5]} s={[0.06, 0.25, 0.06]} c={C.black} />
      <B p={[-8, 1.0, -7.5]} s={[1.32, 0.8, 0.06]} c={C.black} r={0.025} />
      <Screen k="monitor" position={[-8, 1.4, -7.465]} size={[1.22, 0.7]} map={term} />
      {/* keyboard, mouse, mug, notebook */}
      <B p={[-8, 0.79, -6.95]} s={[0.8, 0.025, 0.25]} c="#2a2c3a" r={0.01} />
      <B p={[-7.35, 0.79, -6.95]} s={[0.08, 0.025, 0.13]} c="#2a2c3a" r={0.01} />
      <mesh position={[-7.05, 0.855, -7.0]} castShadow>
        <cylinderGeometry args={[0.065, 0.06, 0.13, 16]} />
        <meshStandardMaterial color="#f5f3ee" />
      </mesh>
      <B p={[-8.85, 0.79, -6.95]} s={[0.35, 0.03, 0.25]} c="#c2410c" rot={[0, 0.2, 0]} />
      {/* desk lamp */}
      <B p={[-9.05, 0.79, -7.45]} s={[0.22, 0.03, 0.22]} c={C.black} />
      <mesh position={[-9.05, 1.04, -7.42]} rotation-x={0.2}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
        <meshStandardMaterial color={C.black} />
      </mesh>
      <mesh position={[-9.05, 1.3, -7.3]} rotation-x={0.7}>
        <coneGeometry args={[0.14, 0.2, 16, 1, true]} />
        <GlowMat k="study" color="#ffb85c" intensity={2.2} base="#ffd49a" side={THREE.DoubleSide} />
      </mesh>
      <PLight k="study" position={[-9, 1.15, -7.0]} color="#ffb870" intensity={5} distance={5.5} castShadow={false} />
      {/* chair */}
      <B p={[-8, 0.45, -6.2]} s={[0.62, 0.09, 0.6]} c={C.violet} r={0.04} />
      <B p={[-8, 0.54, -5.93]} s={[0.62, 0.62, 0.09]} c={C.violet} r={0.04} />
      <B p={[-8, 0.06, -6.2]} s={[0.05, 0.4, 0.05]} c={C.metal} />
      <B p={[-8, 0.02, -6.2]} s={[0.5, 0.04, 0.5]} c={C.metal} r={0.02} />

      {/* bookshelf */}
      <group>
        <B p={[-11.6, 0, -4.5]} s={[0.6, 2.4, 2.8]} c={C.woodDark} r={0.03} />
        {[0, 1, 2, 3].map((i) => (
          <B key={i} p={[-11.27, 0.11 + i * 0.58, -4.5]} s={[0.04, 0.05, 2.62]} c={C.wood} shadow={false} />
        ))}
        {books.map((b, i) => (
          <B key={i} p={[-11.42, b.y, b.z]} s={[0.34, b.h, b.t]} c={b.c} shadow={false} rot={[b.lean, 0, 0]} rough={0.6} />
        ))}
      </group>

      <Plant x={-4.8} z={-7.3} s={0.9} kind={1} />
    </group>
  );
}

// A wall display with a contribution-graph look; the real data appears when you open it.
function ShipLog() {
  const tex = useTex(512, 294, (g, w, h) => {
    g.fillStyle = "#0b0f14";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#e6edf3";
    g.font = `bold 22px ${MONO}`;
    g.fillText("ship log", 22, 38);
    g.fillStyle = "#7d8590";
    g.font = `15px ${MONO}`;
    g.fillText("github.com/NIKSHITH-G", 22, 62);
    const greens = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
    for (let x = 0; x < 30; x++)
      for (let y = 0; y < 7; y++) {
        const v = Math.floor(Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 5);
        g.fillStyle = greens[(x + y) % 7 === 0 ? 0 : v];
        g.fillRect(22 + x * 15.6, 92 + y * 15.6, 12, 12);
      }
    g.fillStyle = "#3fb950";
    g.font = `15px ${MONO}`;
    g.fillText("● live — press E", 22, 236 + 26);
  });
  return (
    <group>
      <B p={[-10.6, 1.49, -7.88]} s={[1.46, 0.88, 0.06]} c={C.black} r={0.02} shadow={false} />
      <Screen k="study" position={[-10.6, 1.93, -7.845]} size={[1.36, 0.78]} map={tex} />
    </group>
  );
}

// Melbourne time on the lab wall, ticking for real.
function WallClock({ position }) {
  const hour = useRef();
  const minute = useRef();
  const second = useRef();
  const last = useRef(-1);
  useFrame(() => {
    const s = Math.floor(Date.now() / 1000);
    if (s === last.current) return;
    last.current = s;
    const [hh, mm, ss] = new Date()
      .toLocaleTimeString("en-GB", { timeZone: "Australia/Melbourne", hour12: false })
      .split(":")
      .map(Number);
    if (hour.current) hour.current.rotation.z = -((hh % 12) + mm / 60) * (Math.PI / 6);
    if (minute.current) minute.current.rotation.z = -(mm + ss / 60) * (Math.PI / 30);
    if (second.current) second.current.rotation.z = -ss * (Math.PI / 30);
  });
  const hand = (ref, len, wdt, col) => (
    <group ref={ref}>
      <mesh position={[0, len / 2 - 0.03, 0]}>
        <boxGeometry args={[wdt, len, 0.01]} />
        <meshStandardMaterial color={col} />
      </mesh>
    </group>
  );
  return (
    <group position={position}>
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.36, 0.36, 0.05, 40]} />
        <meshStandardMaterial color="#1b1c26" />
      </mesh>
      <mesh position={[0, 0, 0.027]}>
        <circleGeometry args={[0.32, 40]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[Math.sin((i * Math.PI) / 6) * 0.27, Math.cos((i * Math.PI) / 6) * 0.27, 0.03]}>
          <boxGeometry args={[0.02, i % 3 ? 0.03 : 0.06, 0.005]} />
          <meshStandardMaterial color="#1b1c26" />
        </mesh>
      ))}
      <group position={[0, 0, 0.04]}>
        {hand(hour, 0.17, 0.025, "#1b1c26")}
        {hand(minute, 0.25, 0.016, "#1b1c26")}
        {hand(second, 0.27, 0.008, "#dc2626")}
      </group>
    </group>
  );
}

/* ───────────────────────── lab ───────────────────────── */

function Cabinet({ x, project, index }) {
  const screen = useTex(320, 256, (g, w, h) => {
    g.fillStyle = "#07070d";
    g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
    grd.addColorStop(0, `${project.color}33`);
    grd.addColorStop(1, "transparent");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.textAlign = "center";
    g.fillStyle = "#9aa0b4";
    g.font = `16px ${MONO}`;
    g.fillText(`HI-SCORE ${project.year}`, w / 2, 30);
    g.fillStyle = project.color;
    g.shadowColor = project.color;
    g.shadowBlur = 14;
    g.font = `bold 38px ${MONO}`;
    const words = project.name.split(" ");
    const lines = [];
    for (const word of words) {
      const last = lines[lines.length - 1];
      if (last && g.measureText(`${last} ${word}`).width < w - 30) lines[lines.length - 1] = `${last} ${word}`;
      else lines.push(word);
    }
    lines.slice(0, 3).forEach((l, i) => g.fillText(l, w / 2, 112 + i * 42 - (lines.length - 1) * 21));
    g.shadowBlur = 0;
    g.fillStyle = "#f5f5ff";
    g.font = `16px ${MONO}`;
    g.fillText("INSERT COIN · PRESS E", w / 2, h - 30);
    for (let y = 0; y < h; y += 3) { g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(0, y, w, 1); }
  }, [project.name]);

  const marquee = useRef();
  useFrame(({ clock }) => {
    if (!marquee.current) return;
    const on = marquee.current.userData.p ?? 0;
    marquee.current.emissiveIntensity = on * (1.5 + Math.sin(clock.elapsedTime * 2 + index * 1.7) * 0.45);
  });
  usePower(POWER.arcade + index * 0.12, (p) => marquee.current && (marquee.current.userData.p = p));

  return (
    <group position={[x, 0, -7.35]}>
      <B p={[0, 0, 0]} s={[1.05, 1.95, 0.95]} c="#1c1d2c" r={0.04} />
      <B p={[0.535, 0.2, 0]} s={[0.01, 1.5, 0.8]} c={project.color} shadow={false} />
      <B p={[-0.535, 0.2, 0]} s={[0.01, 1.5, 0.8]} c={project.color} shadow={false} />
      <B p={[0, 1.05, 0.54]} s={[0.92, 0.75, 0.08]} c={C.black} rot={[-0.18, 0, 0]} />
      <Screen k="arcade" position={[0, 1.43, 0.6]} rotation={[-0.18, 0, 0]} size={[0.82, 0.64]} map={screen} />
      <B p={[0, 0.86, 0.7]} s={[1.05, 0.1, 0.42]} c="#272939" rot={[0.25, 0, 0]} r={0.02} />
      <mesh position={[-0.22, 1.0, 0.74]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>
      <mesh position={[-0.22, 0.95, 0.74]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {[0.08, 0.22].map((bx, i) => (
        <mesh key={bx} position={[bx, 0.985, 0.74 - i * 0.03]}>
          <cylinderGeometry args={[0.038, 0.038, 0.03, 14]} />
          <meshStandardMaterial color={i ? "#facc15" : project.color} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 2.08, 0.1]}>
        <boxGeometry args={[1.05, 0.26, 0.75]} />
        <meshStandardMaterial ref={marquee} color={project.color} emissive={project.color} emissiveIntensity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Whiteboard() {
  const board = useTex(512, 340, (g, w, h) => {
    g.fillStyle = "#f6f4ee";
    g.fillRect(0, 0, w, h);
    g.font = `24px ${MONO}`;
    g.fillStyle = "#6d28d9";
    g.fillText("const stack = {", 24, 48);
    const rows = [["ai_ml", "tf · keras · numpy"], ["web", "react · next · spring"], ["langs", "python · java · ts"]];
    rows.forEach(([k, v], i) => {
      g.fillStyle = "#047857"; g.fillText(`  ${k}:`, 24, 96 + i * 48);
      g.fillStyle = "#1f2937"; g.fillText(v, 170, 96 + i * 48);
    });
    g.fillStyle = "#6d28d9"; g.fillText("}", 24, 96 + 3 * 48);
    g.strokeStyle = "#ef4444"; g.lineWidth = 3;
    g.beginPath(); g.ellipse(395, 292, 88, 28, -0.05, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#ef4444"; g.font = `20px ${MONO}`; g.fillText("ship it!", 352, 299);
  });
  return (
    <group position={[3.3, 0, -4.2]}>
      {[-0.85, 0.85].map((z) => (
        <group key={z}>
          <B p={[0, 0, z]} s={[0.05, 1.0, 0.05]} c={C.metal} />
          <B p={[0, 0, z]} s={[0.55, 0.04, 0.07]} c={C.metal} r={0.015} />
        </group>
      ))}
      <B p={[0, 0.95, 0]} s={[0.06, 1.25, 1.9]} c="#cfd3dc" r={0.02} />
      <mesh position={[-0.035, 1.575, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[1.8, 1.15]} />
        <meshStandardMaterial map={board} roughness={0.4} />
      </mesh>
      <B p={[-0.08, 0.92, 0]} s={[0.12, 0.03, 1.2]} c="#a8adb9" />
      {["#ef4444", "#2563eb", "#047857"].map((col, i) => (
        <B key={col} p={[-0.1, 0.95, -0.3 + i * 0.15]} s={[0.025, 0.025, 0.12]} c={col} shadow={false} />
      ))}
    </group>
  );
}

// Little server rack with blinking LEDs — every AI lab needs one.
function Rack() {
  const leds = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    leds.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = Math.sin(t * (3 + i * 1.3) + i * 2) > 0.2 ? 3 : 0.3;
    });
  });
  return (
    <group position={[-3.35, 0, -7.45]}>
      <B p={[0, 0, 0]} s={[0.55, 1.3, 0.55]} c="#15161f" r={0.03} />
      {[0, 1, 2, 3].map((row) => (
        <group key={row}>
          <B p={[0, 0.2 + row * 0.27, 0.28]} s={[0.46, 0.2, 0.01]} c="#232536" shadow={false} />
          {[0, 1, 2].map((c) => (
            <mesh key={c} position={[-0.15 + c * 0.05, 0.3 + row * 0.27, 0.29]}>
              <boxGeometry args={[0.025, 0.025, 0.01]} />
              <meshStandardMaterial ref={(m) => (leds.current[row * 3 + c] = m)} color="#111" emissive={c === 2 ? "#f59e0b" : "#22c55e"} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Lab() {
  return (
    <group>
      {projects.slice(0, 3).map((p, i) => (
        <Cabinet key={p.name} x={-2.4 + i * 2.4} project={p} index={i} />
      ))}
      <Whiteboard />
      <Rack />
      <WallClock position={[3.0, 2.25, -7.86]} />
      {/* neon strip on the back wall */}
      <mesh position={[0, 2.78, -7.86]}>
        <boxGeometry args={[4.4, 0.05, 0.03]} />
        <GlowMat k="lab" color="#a78bfa" intensity={3} base="#c4b5fd" />
      </mesh>
      <PLight k="lab" position={[0, 2.5, -6.2]} color="#a78bfa" intensity={6} distance={7.5} />
      <PLight k="board" position={[1.6, 2.4, -4.2]} color="#f1f5ff" intensity={2.2} distance={4} />
      <Sparkles count={30} scale={[7, 2.5, 6]} position={[0, 1.4, -4.5]} size={1.6} speed={0.15} opacity={0.35} color="#c4b5fd" />
    </group>
  );
}

/* ───────────────────────── music ───────────────────────── */

const KEY_W = 0.2;
const keyX = (i) => 8 + (i - (WHITE.length - 1) / 2) * KEY_W;

function PianoKeys() {
  const refs = useRef({});
  useFrame(() => {
    for (const [n, m] of Object.entries(refs.current)) {
      if (!m) continue;
      const target = runtime.piano.has(n) ? 0.09 : 0;
      m.rotation.x += (target - m.rotation.x) * 0.45;
    }
  });
  return (
    <group>
      {WHITE.map((k, i) => (
        <group key={k.n} position={[keyX(i), 0.78, -7.15]} ref={(g) => (refs.current[k.n] = g)}>
          <B p={[0, 0, 0.17]} s={[KEY_W - 0.015, 0.05, 0.32]} c="#f8f7f2" rough={0.35} r={0.01} shadow={false} />
        </group>
      ))}
      {BLACK.map((k) => (
        <group key={k.n} position={[keyX(k.after) + KEY_W / 2, 0.81, -7.15]} ref={(g) => (refs.current[k.n] = g)}>
          <B p={[0, 0, 0.1]} s={[0.11, 0.06, 0.2]} c="#121217" rough={0.3} r={0.01} shadow={false} />
        </group>
      ))}
    </group>
  );
}

function Music() {
  const poster = useTex(300, 400, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#1e1b4b");
    grd.addColorStop(1, "#7c3aed");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,0.25)";
    g.setLineDash([6, 8]);
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(30, 230); g.quadraticCurveTo(150, 120, 270, 150); g.stroke();
    g.setLineDash([]);
    g.fillStyle = "rgba(255,255,255,0.95)";
    g.beginPath(); g.moveTo(205, 150); g.lineTo(255, 132); g.lineTo(222, 162); g.closePath(); g.fill();
    g.font = `italic 46px ${SERIF}`;
    g.textAlign = "center";
    g.fillText(music.latest.title, w / 2, 300);
    g.font = `15px ${MONO}`;
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.fillText(`NEW SINGLE · ${music.latest.released.toUpperCase()}`, w / 2, 338);
  });
  const vinyl = useRef();
  useFrame((_, dt) => {
    if (vinyl.current) vinyl.current.rotation.z -= dt * 0.9;
  });

  return (
    <group>
      <Window x={10.3} />
      {/* upright piano */}
      <B p={[8, 0, -7.5]} s={[2.4, 1.28, 0.55]} c="#0f0f14" rough={0.25} r={0.03} />
      <B p={[8, 0.7, -7.15]} s={[2.4, 0.08, 0.38]} c="#0f0f14" rough={0.25} />
      <B p={[8, 0, -6.98]} s={[0.1, 0.7, 0.1]} c="#0f0f14" rough={0.25} />
      <B p={[8, 1.28, -7.5]} s={[2.44, 0.04, 0.6]} c="#25252e" rough={0.3} />
      <PianoKeys />
      <B p={[8, 1.02, -7.2]} s={[0.62, 0.38, 0.02]} c={C.cream} rot={[-0.22, 0, 0]} shadow={false} />
      <mesh position={[7.1, 1.35, -7.45]}>
        <cylinderGeometry args={[0.06, 0.07, 0.1, 12]} />
        <GlowMat k="music" color="#ffcf8a" intensity={1.5} base="#3a2a1a" />
      </mesh>
      {/* bench */}
      <B p={[8, 0.42, -6.2]} s={[1.1, 0.09, 0.4]} c={C.woodDark} r={0.03} />
      <B p={[7.6, 0, -6.2]} s={[0.06, 0.42, 0.35]} c={C.woodDark} />
      <B p={[8.4, 0, -6.2]} s={[0.06, 0.42, 0.35]} c={C.woodDark} />
      {/* poster */}
      <Screen k="music" position={[5.6, 1.9, -7.87]} size={[0.9, 1.2]} map={poster} />
      {/* speakers + turntable */}
      <group position={[11.5, 1.1, -5]}>
        <B p={[0, -1.1, -0.45]} s={[0.55, 1.1, 0.5]} c="#1a1a22" r={0.03} />
        <B p={[0, -1.1, 0.45]} s={[0.55, 1.1, 0.5]} c="#1a1a22" r={0.03} />
        {[-0.45, 0.45].map((z) => (
          <group key={z}>
            <mesh position={[-0.28, -0.55, z]} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.15, 0.15, 0.02, 24]} />
              <meshStandardMaterial color="#2c2c35" />
            </mesh>
            <mesh position={[-0.28, -0.85, z]} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.07, 0.07, 0.02, 20]} />
              <meshStandardMaterial color="#2c2c35" />
            </mesh>
          </group>
        ))}
        <B p={[0, 0, 0]} s={[0.55, 0.12, 0.62]} c={C.wood} r={0.02} />
        <mesh ref={vinyl} position={[0, 0.125, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.24, 40]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.13, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.08, 24]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
        <B p={[-0.18, 0.12, 0.22]} s={[0.03, 0.03, 0.3]} c={C.metal} rot={[0, 0.5, 0]} shadow={false} />
      </group>
      {/* acoustic guitar */}
      <group position={[5.15, 0, -7.45]} rotation={[0.18, 0.4, 0]}>
        <mesh position={[0, 0.36, 0]} scale={[1, 1.2, 0.35]} castShadow>
          <sphereGeometry args={[0.3, 20, 14]} />
          <meshStandardMaterial color="#c88d4c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.4, 0.105]} rotation-x={Math.PI / 2}>
          <circleGeometry args={[0.08, 20]} />
          <meshStandardMaterial color="#1a1208" />
        </mesh>
        <B p={[0, 0.62, 0.02]} s={[0.07, 0.8, 0.05]} c={C.woodDark} />
        <B p={[0, 1.42, 0.02]} s={[0.1, 0.16, 0.05]} c={C.woodDark} />
      </group>
      <PLight k="music" position={[8, 2.4, -6.1]} color="#ffcf8a" intensity={6} distance={6.5} />
    </group>
  );
}

/* ───────────────────────── living room ───────────────────────── */

function StringLights() {
  const ref = useRef();
  const mat = useRef();
  const pts = useMemo(() => {
    const out = [];
    const spans = [[-11.8, -9.1], [-6.9, -1.1]];
    for (const [a, b] of spans) {
      const n = Math.round((b - a) / 0.42);
      for (let i = 0; i <= n; i++) {
        const f = i / n;
        out.push([a + (b - a) * f, PART_H + 0.12 - Math.sin(f * Math.PI) * 0.12, -0.9]);
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    pts.forEach((p, i) => ref.current.setMatrixAt(i, m.makeTranslation(...p)));
    ref.current.instanceMatrix.needsUpdate = true;
  }, [pts]);
  usePower(POWER.strip, (p) => mat.current && mat.current.color.setRGB(1.9 * p + 0.05, 1.35 * p + 0.04, 0.55 * p + 0.02));
  return (
    <group>
      <instancedMesh ref={ref} args={[null, null, pts.length]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial ref={mat} color="#111" toneMapped={false} />
      </instancedMesh>
      <PLight k="strip" position={[-6, 1.6, -0.2]} color="#ffbe7a" intensity={3} distance={6} />
    </group>
  );
}

function Living() {
  const tv = useTex(512, 288, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#14112b");
    grd.addColorStop(1, "#2d1760");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#86efac";
    g.font = `20px ${MONO}`;
    g.fillText("● now showing", 36, 56);
    g.fillStyle = "#f5f3ff";
    g.font = `italic 68px ${SERIF}`;
    g.fillText("Nikshith G", 36, 142);
    g.fillStyle = "#c4b5fd";
    g.font = `22px ${MONO}`;
    g.fillText("ai & full-stack · melbourne", 36, 186);
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.fillRect(36, 236, w - 72, 4);
    g.fillStyle = "#a78bfa";
    g.fillRect(36, 236, (w - 72) * 0.38, 4);
  });

  return (
    <group>
      {/* rug */}
      <mesh rotation-x={-Math.PI / 2} position={[-4, 0.01, 2.3]} receiveShadow>
        <planeGeometry args={[5.2, 3.6]} />
        <meshStandardMaterial color="#3d356a" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-4, 0.012, 2.3]} receiveShadow>
        <ringGeometry args={[1.25, 1.33, 48]} />
        <meshStandardMaterial color="#9d90e0" roughness={1} />
      </mesh>
      <StringLights />
      {/* TV + stand */}
      <B p={[-4, 0, -0.6]} s={[2.4, 0.5, 0.55]} c={C.woodDark} r={0.03} />
      <B p={[-4.6, 0.1, -0.32]} s={[0.9, 0.02, 0.01]} c="#2a1f1a" shadow={false} />
      <B p={[-3.4, 0.1, -0.32]} s={[0.9, 0.02, 0.01]} c="#2a1f1a" shadow={false} />
      <B p={[-4, 0.5, -0.7]} s={[0.4, 0.05, 0.2]} c={C.black} />
      <B p={[-4, 0.55, -0.72]} s={[0.05, 0.1, 0.05]} c={C.black} />
      <B p={[-4, 0.6, -0.72]} s={[2.1, 1.2, 0.06]} c={C.black} r={0.02} />
      <Screen k="tv" position={[-4, 1.2, -0.685]} size={[2.0, 1.12]} map={tv} />
      <PLight k="tv" position={[-4, 1.1, 0.4]} color="#9b8cff" intensity={2.5} distance={4.5} />
      {/* coffee table with a book (the mug is Byte's, in Cat.jsx) */}
      <B p={[-4, 0.36, 2]} s={[1.6, 0.06, 0.7]} c={C.wood} r={0.025} />
      <B p={[-4.65, 0, 2]} s={[0.06, 0.36, 0.55]} c={C.woodDark} />
      <B p={[-3.35, 0, 2]} s={[0.06, 0.36, 0.55]} c={C.woodDark} />
      <B p={[-4.3, 0.42, 1.95]} s={[0.36, 0.05, 0.26]} c="#e5e7eb" rot={[0, 0.3, 0]} />
      <B p={[-4.3, 0.47, 1.95]} s={[0.34, 0.04, 0.24]} c="#7c3aed" rot={[0, 0.15, 0]} />
      {/* couch, facing the TV */}
      <B p={[-4, 0.05, 3.6]} s={[3.2, 0.42, 1.1]} c={C.violet} r={0.08} />
      <B p={[-4.72, 0.45, 3.55]} s={[1.3, 0.16, 0.85]} c="#6b5aa8" r={0.07} />
      <B p={[-3.28, 0.45, 3.55]} s={[1.3, 0.16, 0.85]} c="#6b5aa8" r={0.07} />
      <B p={[-4, 0.4, 4.05]} s={[3.2, 0.78, 0.32]} c={C.violet} r={0.1} />
      <B p={[-5.5, 0.4, 3.6]} s={[0.26, 0.42, 1.1]} c={C.violet} r={0.1} />
      <B p={[-2.5, 0.4, 3.6]} s={[0.26, 0.42, 1.1]} c={C.violet} r={0.1} />
      <B p={[-4.9, 0.58, 3.78]} s={[0.46, 0.42, 0.16]} c="#f0abfc" rot={[-0.3, 0.25, 0]} r={0.06} />
      <B p={[-3.0, 0.58, 3.8]} s={[0.42, 0.4, 0.16]} c="#fde68a" rot={[-0.25, -0.2, 0]} r={0.06} />
      {[[-5.4, 3.15], [-2.6, 3.15], [-5.4, 4.1], [-2.6, 4.1]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.06, 0.06, 0.06]} c={C.woodDark} shadow={false} />
      ))}
      {/* floor lamp */}
      <B p={[-6.3, 0, 4.2]} s={[0.36, 0.04, 0.36]} c={C.black} r={0.015} />
      <mesh position={[-6.3, 0.8, 4.2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
        <meshStandardMaterial color={C.black} />
      </mesh>
      <mesh position={[-6.3, 1.72, 4.2]}>
        <cylinderGeometry args={[0.18, 0.28, 0.32, 20, 1, true]} />
        <GlowMat k="living" color="#ffb85c" intensity={1.6} base="#ffe2b0" side={THREE.DoubleSide} />
      </mesh>
      <PLight k="living" position={[-6.3, 1.55, 4.2]} color="#ffb870" intensity={8} distance={8.5} />
      <Sparkles count={40} scale={[6, 2.2, 4]} position={[-4.5, 1.3, 3]} size={2} speed={0.18} opacity={0.45} color="#ffd9a0" />

      <NowBoard />
      <Kitchenette />
      <Elevator position={[-11.9, 0]} label="1" />

      {/* front door */}
      <FrontDoor />
      <mesh rotation-x={-Math.PI / 2} position={[-11.25, 0.012, 6]}>
        <planeGeometry args={[0.9, 1.35]} />
        <meshStandardMaterial color="#8b5a2b" roughness={1} />
      </mesh>
      <PLight k="door" position={[-11.2, 2.3, 6]} color="#ffcf8a" intensity={3} distance={4.5} />
      {/* coat hook */}
      <B p={[-11.85, 1.6, 7.15]} s={[0.05, 0.08, 0.5]} c={C.woodDark} shadow={false} />
      <B p={[-11.72, 1.0, 7.1]} s={[0.18, 0.62, 0.4]} c="#334155" r={0.06} />

      <Plant x={-11.2} z={7.35} s={1.15} />
      <Plant x={3.3} z={7.4} s={0.9} kind={1} />
    </group>
  );
}

// Counter against the gallery half-wall with the coffee machine (steams when you brew).
function Kitchenette() {
  const puffs = useRef([]);
  useFrame(({ clock }) => {
    const age = performance.now() / 1000 - runtime.steamAt;
    puffs.current.forEach((m, i) => {
      if (!m) return;
      const t = age - i * 0.25;
      const on = runtime.steamAt && t > 0 && t < 2.2;
      m.visible = Boolean(on);
      if (!on) return;
      m.position.set(3.45 + Math.sin(clock.elapsedTime * 2 + i) * 0.04, 1.42 + t * 0.35, 5.0);
      m.scale.setScalar(0.6 + t * 0.8);
      m.material.opacity = 0.35 * (1 - t / 2.2);
    });
  });
  return (
    <group>
      <B p={[3.55, 0, 5.6]} s={[0.6, 0.88, 2.2]} c="#e8e2d6" r={0.02} />
      <B p={[3.5, 0.88, 5.6]} s={[0.7, 0.05, 2.3]} c="#2f2a26" r={0.01} />
      {[5.05, 6.15].map((z) => (
        <B key={z} p={[3.24, 0.4, z]} s={[0.01, 0.04, 0.3]} c={C.metal} shadow={false} />
      ))}
      {/* espresso machine */}
      <B p={[3.6, 0.93, 5.0]} s={[0.42, 0.48, 0.4]} c="#1f1f24" r={0.04} />
      <B p={[3.38, 1.1, 5.0]} s={[0.06, 0.06, 0.18]} c={C.metal} metal={0.8} rough={0.3} />
      <mesh position={[3.37, 0.97, 5.0]}>
        <cylinderGeometry args={[0.05, 0.045, 0.08, 14]} />
        <meshStandardMaterial color="#f5f3ee" />
      </mesh>
      <mesh position={[3.37, 1.33, 5.0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* mugs + a plant */}
      {[[3.5, 5.55, "#a78bfa"], [3.55, 5.75, "#fbbf24"]].map(([x, z, col]) => (
        <mesh key={z} position={[x, 0.97, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.1, 14]} />
          <meshStandardMaterial color={col} />
        </mesh>
      ))}
      <Plant x={3.55} z={6.35} s={0.45} kind={1} />
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} ref={(m) => (puffs.current[i] = m)} visible={false}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// Brushed-steel elevator doors on a west wall. They slide open when you walk up,
// and the little display shows which floor you're on.
export function Elevator({ position: [x, z], label, facing = 1 }) {
  const left = useRef();
  const right = useRef();
  const amount = useRef(0);
  const sign = useTex(96, 64, (g, w, h) => {
    g.fillStyle = "#120a05";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#ff9d3c";
    g.font = `bold 40px ${MONO}`;
    g.textAlign = "center";
    g.fillText(label, w / 2, 46);
  }, [label]);
  useFrame((_, dt) => {
    const s = getState();
    const open = (s.nearby === "elevator" && !s.panel) || s.ride?.stage === "opening" ? 1 : 0;
    amount.current += (open - amount.current) * (1 - Math.exp(-dt * 6));
    const o = amount.current * 0.62;
    if (left.current) left.current.position.z = -0.35 - o;
    if (right.current) right.current.position.z = 0.35 + o;
  });
  return (
    <group position={[x, 0, z]} scale={[facing, 1, 1]}>
      {/* surround + lit car interior behind the doors */}
      <B p={[0.02, 0, 0]} s={[0.05, 2.6, 1.7]} c="#2a2c3a" shadow={false} />
      <mesh position={[0.05, 1.15, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[1.38, 2.3]} />
        <meshBasicMaterial color="#e8d9bd" toneMapped={false} />
      </mesh>
      <group ref={left} position={[0, 0, -0.35]}>
        <B p={[0.09, 0, 0]} s={[0.04, 2.3, 0.69]} c="#b9bcc6" metal={0.75} rough={0.32} />
      </group>
      <group ref={right} position={[0, 0, 0.35]}>
        <B p={[0.09, 0, 0]} s={[0.04, 2.3, 0.69]} c="#b9bcc6" metal={0.75} rough={0.32} />
      </group>
      {/* side walls inside the recess hide the doors as they slide */}
      <B p={[0.12, 0, -1.02]} s={[0.12, 2.6, 0.66]} c="#2a2c3a" shadow={false} />
      <B p={[0.12, 0, 1.02]} s={[0.12, 2.6, 0.66]} c="#2a2c3a" shadow={false} />
      <B p={[0.12, 2.3, 0]} s={[0.12, 0.3, 1.4]} c="#2a2c3a" shadow={false} />
      {/* floor display + call button */}
      <mesh position={[0.19, 2.45, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <B p={[0.17, 1.05, 1.15]} s={[0.03, 0.26, 0.14]} c="#2a2c3a" shadow={false} />
      <mesh position={[0.19, 1.18, 1.15]}>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial color="#fff1d6" emissive="#ffb85c" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Swings open (with warm light pouring in) while you're writing the letter.
function FrontDoor() {
  const leaf = useRef();
  const glow = useRef();
  const light = useRef();
  useFrame((_, dt) => {
    const open = getState().panel?.id === "contact" ? 1 : 0;
    const k = 1 - Math.exp(-dt * 4);
    if (leaf.current) leaf.current.rotation.y += (open * 1.35 - leaf.current.rotation.y) * k;
    if (glow.current) glow.current.color.setScalar(0.05 + open * 1.4);
    if (light.current) light.current.intensity += (open * 9 - light.current.intensity) * k;
  });
  return (
    <group position={[-11.88, 0, 6]}>
      <B p={[0.03, 0, 0]} s={[0.05, 2.38, 1.34]} c="#d8d2c6" shadow={false} />
      {/* the outside, seen through the open door */}
      <mesh position={[0.065, 1.17, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[1.16, 2.28]} />
        <meshBasicMaterial ref={glow} color="#ffd6a0" toneMapped={false} />
      </mesh>
      <group ref={leaf} position={[0.08, 0, -0.59]}>
        <group position={[0, 0, 0.59]}>
          <B p={[0, 0.02, 0]} s={[0.06, 2.3, 1.18]} c="#8a5638" r={0.02} />
          <B p={[0.035, 1.3, 0]} s={[0.02, 0.8, 0.8]} c="#7a4b33" shadow={false} />
          <B p={[0.035, 0.25, 0]} s={[0.02, 0.8, 0.8]} c="#7a4b33" shadow={false} />
          <mesh position={[0.08, 1.05, 0.42]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color={C.gold} metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      </group>
      <mesh position={[0.12, 2.55, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.4]} />
        <GlowMat k="door" color="#ffb85c" intensity={2.5} base="#ffd49a" />
      </mesh>
      <pointLight ref={light} position={[0.9, 1.2, 0]} color="#ffc98a" intensity={0} distance={6} decay={2} />
    </group>
  );
}

function Trophies() {
  const cups = [[0.6, 1.75], [0.6, 2.5], [0.6, 3.25], [1.28, 2.1], [1.28, 2.9]];
  // built facing +x, then turned round to face into the study from its east wall
  return (
    <group position={[-4.42, 0, -4.6]} rotation-y={Math.PI}>
    <group position={[0, 0, -2.5]}>
      {/* hollow cabinet: back, sides, top and plinth so the trophies are on show */}
      <B p={[-0.26, 0, 2.5]} s={[0.08, 2.2, 2.4]} c={C.woodDark} />
      <B p={[0, 0, 1.33]} s={[0.6, 2.2, 0.06]} c={C.woodDark} />
      <B p={[0, 0, 3.67]} s={[0.6, 2.2, 0.06]} c={C.woodDark} />
      <B p={[0, 2.12, 2.5]} s={[0.62, 0.08, 2.42]} c={C.woodDark} r={0.02} />
      <B p={[0, 0, 2.5]} s={[0.6, 0.5, 2.4]} c={C.woodDark} />
      {[0.5, 1.2, 1.9].map((y) => (
        <B key={y} p={[0, y, 2.5]} s={[0.5, 0.04, 2.3]} c={C.wood} shadow={false} />
      ))}
      {cups.map(([y, z], i) => (
        <group key={i} position={[0.02, y - 0.06, z]}>
          <B p={[0, 0, 0]} s={[0.17, 0.07, 0.17]} c="#2a2a33" shadow={false} r={0.015} />
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.02, 0.03, 0.16, 8]} />
            <meshStandardMaterial color={C.gold} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.12, 0.05, 0.2, 18]} />
            <meshStandardMaterial color={C.gold} metalness={0.9} roughness={0.18} emissive="#7a5a10" emissiveIntensity={0.25} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0, 0.34, side * 0.14]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.04, 0.012, 6, 12, Math.PI]} />
              <meshStandardMaterial color={C.gold} metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0.31, 1.3, 2.5]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[2.3, 1.6]} />
        <meshStandardMaterial color="#bcd7ff" transparent opacity={0.035} roughness={0.1} depthWrite={false} />
      </mesh>
      <PLight k="trophies" position={[0.6, 1.95, 2.5]} color="#ffe0a3" intensity={3} distance={3.2} />
    </group>
    </group>
  );
}

/* ───────────────────────── prints (hung on every floor) ───────────────────────── */

// Where each named spot is: [position, rotationY, width]. Height follows the 3:4 photos.
const HANG = {
  "studio-living": [[-11.84, 1.85, 4.45], Math.PI / 2, 0.96], // living-room west wall, by the front door
  "studio-music": [[8.0, 2.05, -7.84], 0, 0.96], // music room, above the piano
  "studio-dining": [[3.88, 0.8, 3.45], -Math.PI / 2, 0.52], // small print on the half-wall, just north of the kitchen counter
  gym: [[-11.84, 1.85, -2.2], Math.PI / 2, 0.96],
  "games-west": [[-11.84, 1.85, -3.7], Math.PI / 2, 0.96],
  "games-east": [[11.84, 1.85, 6.7], -Math.PI / 2, 0.96],
  ...Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`photo-${n}`, [[0.9 + n * 1.45, 1.85, -7.84], 0, 0.96]])),
};

// Every print whose `hang` spot starts with this prefix ("studio", "gym", "games", "photo").
export function HungPhotos({ where }) {
  return photography.photos
    .filter((ph) => ph.hang?.startsWith(where))
    .map((ph) => {
      const [position, ry, w] = HANG[ph.hang];
      return (
        <group key={ph.src}>
          <Print src={ph.src} position={position} rotation={[0, ry, 0]} w={w} h={w * 1.333} />
          <pointLight
            position={[position[0] + Math.sin(ry) * 0.9, position[1] + 0.85, position[2] + Math.cos(ry) * 0.9]}
            intensity={w > 0.8 ? 2.5 : 1.2}
            distance={2.6}
            decay={2}
            color="#fff1d6"
          />
        </group>
      );
    });
}

// A real photo, loaded as a texture.
function usePhoto(src) {
  return useMemo(() => {
    if (!src || typeof document === "undefined") return null;
    const t = new THREE.TextureLoader().load(src);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [src]);
}

export function Print({ position, rotation, w, h, palette = ["#444", "#222"], seed = 1, src }) {
  const photo = usePhoto(src);
  const tex = useTex(320, 220, (g, cw, ch) => {
    const grd = g.createLinearGradient(0, 0, 0, ch);
    palette.forEach((c, i) => grd.addColorStop(i / (palette.length - 1), c));
    g.fillStyle = grd;
    g.fillRect(0, 0, cw, ch);
    g.fillStyle = "rgba(255,255,255,0.85)";
    g.beginPath(); g.arc(cw * (0.25 + (seed % 4) * 0.15), ch * 0.32, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(0,0,0,0.55)";
    g.beginPath();
    g.moveTo(0, ch);
    for (let x = 0; x <= cw; x += 12) g.lineTo(x, ch * 0.64 - Math.abs(Math.sin(x * 0.03 + seed)) * ch * (0.12 + (seed % 3) * 0.05));
    g.lineTo(cw, ch);
    g.fill();
  }, [seed]);
  return (
    <group position={position} rotation={rotation}>
      <B p={[0, -h / 2 - 0.09, 0]} s={[w + 0.18, h + 0.18, 0.05]} c="#141416" shadow={false} />
      <B p={[0, -h / 2 - 0.03, 0.01]} s={[w + 0.06, h + 0.06, 0.05]} c="#f4f1ea" shadow={false} />
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[w * 0.9, h * 0.88]} />
        <meshStandardMaterial map={photo ?? tex} roughness={0.5} />
      </mesh>
      <mesh position={[0, h / 2 + 0.16, 0.12]}>
        <boxGeometry args={[w * 0.5, 0.04, 0.06]} />
        <meshStandardMaterial color="#888" emissive="#fff1d6" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── library ───────────────────────── */

const SPINES = ["#7f1d1d", "#14532d", "#1e3a8a", "#78350f", "#e7e5e4", "#3f3f46", "#a16207", "#581c87", "#0f766e", "#be123c"];

// A tall bookcase against the east wall, centred on z.
function TallShelf({ z }) {
  const books = useMemo(() => {
    const out = [];
    for (let shelf = 0; shelf < 5; shelf++) {
      let bz = z - 1.2;
      let k = shelf * 7 + Math.round(z * 10);
      while (bz < z + 1.15) {
        const t = 0.07 + ((k * 37) % 6) / 70;
        const h = 0.28 + ((k * 13) % 5) / 40;
        const lean = k % 13 === 4 ? 0.22 : 0;
        // the odd gap, so the shelves look used rather than stocked
        if (k % 17 !== 9) out.push({ y: 0.12 + shelf * 0.47, z: bz + t / 2, t, h, c: SPINES[k % SPINES.length], lean });
        bz += t + 0.012 + (lean ? 0.1 : 0);
        k++;
      }
    }
    return out;
  }, [z]);
  return (
    <group>
      <B p={[11.65, 0, z]} s={[0.5, 2.5, 2.6]} c="#3a2a20" r={0.02} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <B key={i} p={[11.4, 0.08 + i * 0.47, z]} s={[0.04, 0.04, 2.5]} c="#5a4232" shadow={false} />
      ))}
      {books.map((b, i) => (
        <B key={i} p={[11.5, b.y, b.z]} s={[0.28, b.h, b.t]} c={b.c} shadow={false} rough={0.7} rot={[b.lean, 0, 0]} />
      ))}
    </group>
  );
}

function Library() {
  const kindle = useRef();
  useFrame(({ clock }) => {
    if (kindle.current) kindle.current.emissiveIntensity = 0.55 + Math.sin(clock.elapsedTime * 1.5) * 0.08;
  });
  return (
    <group>
      <Rug x={8.6} z={4.4} w={4.6} d={3.4} color="#3b2f2a" border="#7c5a3a" />
      <TallShelf z={1.4} />
      <TallShelf z={5.0} />
      {/* library ladder: feet on the floor, top leaning on the front of the first bookcase,
          hooked onto a brass rail that runs along the shelves */}
      <mesh position={[11.36, 2.38, 1.4]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.02, 0.02, 2.6, 8]} />
        <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.25} />
      </mesh>
      <group position={[10.82, 0, 1.9]} rotation-z={-0.2}>
        {[-0.24, 0.24].map((dz) => (
          <B key={dz} p={[0, 0, dz]} s={[0.06, 2.45, 0.06]} c="#8b5a2b" r={0.01} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <B key={i} p={[0, 0.3 + i * 0.31, 0]} s={[0.05, 0.035, 0.46]} c="#a0693a" shadow={false} />
        ))}
        {/* hooks over the rail and little wheels at the feet */}
        {[-0.24, 0.24].map((dz) => (
          <group key={`h${dz}`}>
            <B p={[0.05, 2.38, dz]} s={[0.12, 0.05, 0.05]} c="#c9a227" metal={0.85} rough={0.25} shadow={false} />
            <mesh position={[0, 0.04, dz]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
              <meshStandardMaterial color="#1f1f24" />
            </mesh>
          </group>
        ))}
      </group>
      {/* reading chair facing into the room */}
      <group position={[8.3, 0, 5.0]}>
        <B p={[0, 0.05, 0]} s={[0.9, 0.4, 0.85]} c="#065f46" r={0.08} />
        <B p={[0, 0.4, -0.35]} s={[0.9, 0.75, 0.2]} c="#065f46" r={0.08} />
        <B p={[-0.42, 0.4, 0]} s={[0.16, 0.3, 0.85]} c="#065f46" r={0.06} />
        <B p={[0.42, 0.4, 0]} s={[0.16, 0.3, 0.85]} c="#065f46" r={0.06} />
        <B p={[0.05, 0.46, 0.1]} s={[0.55, 0.03, 0.4]} c="#d6d3d1" shadow={false} rot={[0, -0.3, 0]} />
      </group>
      {/* side table with the Kindle on a little stand, and tea */}
      <group position={[9.2, 0, 5.0]}>
        <mesh position={[0, 0.27, 0]}>
          <cylinderGeometry args={[0.2, 0.22, 0.54, 16]} />
          <meshStandardMaterial color={C.woodDark} />
        </mesh>
        <B p={[0, 0.54, 0.02]} s={[0.12, 0.03, 0.1]} c="#111" shadow={false} />
        <group position={[0, 0.66, -0.02]} rotation-x={-0.35}>
          <B p={[0, -0.1, 0]} s={[0.15, 0.2, 0.012]} c="#1c1c22" r={0.005} shadow={false} />
          <mesh position={[0, 0.005, 0.007]}>
            <planeGeometry args={[0.12, 0.155]} />
            <meshStandardMaterial ref={kindle} color="#f1ead6" emissive="#f6efdc" emissiveIntensity={0.55} />
          </mesh>
        </group>
        <mesh position={[0.12, 0.6, 0.08]}>
          <cylinderGeometry args={[0.045, 0.04, 0.09, 12]} />
          <meshStandardMaterial color="#e7e5e4" />
        </mesh>
      </group>
      {/* arc floor lamp over the chair */}
      <group position={[7.3, 0, 5.6]}>
        <B p={[0, 0, 0]} s={[0.32, 0.04, 0.32]} c={C.black} r={0.015} />
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 1.7, 6]} />
          <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.45, 1.75, -0.2]} rotation-z={-1.1}>
          <cylinderGeometry args={[0.014, 0.014, 1.0, 6]} />
          <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.95, 1.95, -0.4]}>
          <sphereGeometry args={[0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <GlowMat k="gallery" color="#ffcf8a" intensity={1.4} base="#b8860b" side={THREE.DoubleSide} />
        </mesh>
        <PLight k="gallery" position={[0.95, 1.7, -0.4]} color="#ffcf8a" intensity={5} distance={5} />
      </group>
      {/* a stack of books waiting by the chair */}
      {[0, 1, 2, 3].map((i) => (
        <B key={i} p={[7.6, i * 0.07, 4.3]} s={[0.32, 0.065, 0.24]} c={SPINES[(i * 3) % SPINES.length]} shadow={false} rot={[0, i * 0.25, 0]} />
      ))}
      <B p={[9, 0.42, 6.8]} s={[1.8, 0.08, 0.5]} c={C.wood} r={0.03} />
      <B p={[8.3, 0, 6.8]} s={[0.08, 0.42, 0.45]} c={C.black} />
      <B p={[9.7, 0, 6.8]} s={[0.08, 0.42, 0.45]} c={C.black} />
      <mesh position={[11.86, 2.8, 3.2]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[1.6, 0.26]} />
        <meshStandardMaterial color="#111" emissive="#fbbf24" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <PLight k="gallery" position={[10.4, 2.6, 1.4]} intensity={3} distance={4} color="#fff1d6" />
      <PLight k="gallery" position={[10.4, 2.6, 5.0]} intensity={3} distance={4} color="#fff1d6" />
      <Plant x={11.3} z={7.3} s={1.1} />
    </group>
  );
}

/* ───────────────────────── now board (living room) ───────────────────────── */

// Cork board on the west wall; its content is drawn on it when you walk up.
function NowBoard() {
  const cork = useTex(256, 160, (g, w, h) => {
    g.fillStyle = "#b08452";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = i % 2 ? "rgba(90,60,30,0.25)" : "rgba(230,200,150,0.2)";
      g.fillRect((i * 97) % w, (i * 53 + (i >> 2)) % h, 2, 2);
    }
    [["#fde68a", 30, 30], ["#bbf7d0", 120, 24], ["#fbcfe8", 70, 92], ["#bfdbfe", 170, 88]].forEach(([c, x, y], i) => {
      g.save();
      g.translate(x + 30, y + 22);
      g.rotate(((i % 3) - 1) * 0.06);
      g.fillStyle = c;
      g.fillRect(-30, -22, 60, 44);
      g.fillStyle = "rgba(0,0,0,0.35)";
      for (let l = 0; l < 3; l++) g.fillRect(-22, -10 + l * 9, 44 - l * 8, 3);
      g.fillStyle = "#dc2626";
      g.beginPath(); g.arc(0, -18, 4, 0, Math.PI * 2); g.fill();
      g.restore();
    });
    g.fillStyle = "#1c1917";
    g.font = `bold 20px ${MONO}`;
    g.fillText("NOW", 12, 150);
  });
  return (
    <group position={[-11.86, 1.6, 2.5]} rotation-y={Math.PI / 2}>
      <B p={[0, -0.65, 0]} s={[2.05, 1.3, 0.06]} c="#5a3a24" shadow={false} />
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[1.9, 1.15]} />
        <meshStandardMaterial map={cork} roughness={0.95} />
      </mesh>
      <PLight k="living" position={[0, 0.9, 0.7]} color="#ffe0a3" intensity={2} distance={3} />
    </group>
  );
}

/* ───────────────────────── lived-in extras ───────────────────────── */

function Rug({ x, z, w, d, color, border }) {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[x, 0.008, z]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={border ?? color} roughness={1} />
      </mesh>
      {border && (
        <mesh rotation-x={-Math.PI / 2} position={[x, 0.01, z]} receiveShadow>
          <planeGeometry args={[w - 0.25, d - 0.25]} />
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      )}
    </group>
  );
}

function Dining() {
  return (
    <group position={[0.6, 0, 5.3]}>
      <B p={[0, 0.74, 0]} s={[1.9, 0.06, 1.0]} c="#9a6b4a" r={0.02} />
      {[[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.4], [0.8, 0.4]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.06, 0.74, 0.06]} c={C.woodDark} />
      ))}
      {/* four chairs */}
      {[[-0.45, -0.75, 0], [0.45, -0.75, 0], [-0.45, 0.75, Math.PI], [0.45, 0.75, Math.PI]].map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={r}>
          <B p={[0, 0.44, 0]} s={[0.42, 0.05, 0.42]} c="#e7e5e4" r={0.02} />
          <B p={[0, 0.46, -0.2]} s={[0.42, 0.45, 0.04]} c="#e7e5e4" r={0.02} />
          {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([lx, lz], k) => (
            <B key={k} p={[lx, 0, lz]} s={[0.03, 0.44, 0.03]} c={C.woodDark} shadow={false} />
          ))}
        </group>
      ))}
      {/* fruit bowl, laptop, notebook */}
      <mesh position={[-0.3, 0.83, 0]}>
        <sphereGeometry args={[0.15, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#e7e5e4" side={THREE.DoubleSide} />
      </mesh>
      {[[-0.35, 0.05, "#f97316"], [-0.25, -0.05, "#facc15"], [-0.28, 0.07, "#84cc16"]].map(([x, z, col], i) => (
        <mesh key={i} position={[x, 0.85, z]}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshStandardMaterial color={col} />
        </mesh>
      ))}
      <B p={[0.4, 0.77, 0.05]} s={[0.42, 0.02, 0.3]} c="#9ca3af" metal={0.6} rough={0.3} shadow={false} />
      <B p={[0.4, 0.78, -0.1]} s={[0.42, 0.28, 0.015]} c="#9ca3af" metal={0.6} rough={0.3} rot={[-0.3, 0, 0]} shadow={false} />

      {/* pendant */}
      <group position={[0, 2.25, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 1.0, 4]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh>
          <coneGeometry args={[0.3, 0.24, 24, 1, true]} />
          <meshStandardMaterial color="#c7a17a" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <GlowMat k="living" color="#ffcf8a" intensity={2.5} base="#fff1d6" />
        </mesh>
        <PLight k="living" position={[0, -0.3, 0]} color="#ffcf8a" intensity={4} distance={4.5} />
      </group>
    </group>
  );
}

function ReadingNook() {
  return (
    <group>
      <group position={[-8.6, 0, 6.8]} rotation-y={Math.PI / 2}>
        <B p={[0, 0.05, 0]} s={[0.9, 0.4, 0.85]} c="#b45309" r={0.08} />
        <B p={[0, 0.4, -0.35]} s={[0.9, 0.62, 0.2]} c="#b45309" r={0.08} />
        <B p={[-0.42, 0.4, 0]} s={[0.16, 0.3, 0.85]} c="#b45309" r={0.06} />
        <B p={[0.42, 0.4, 0]} s={[0.16, 0.3, 0.85]} c="#b45309" r={0.06} />
        <B p={[0.1, 0.46, 0.05]} s={[0.5, 0.03, 0.36]} c="#7c3aed" shadow={false} rot={[0, 0.3, 0]} />
      </group>
      <group position={[-7.7, 0, 7.3]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
          <meshStandardMaterial color={C.woodDark} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <B key={i} p={[0, 0.5 + i * 0.05, 0]} s={[0.24, 0.045, 0.17]} c={["#1e3a8a", "#b91c1c", "#f5f5f4"][i]} shadow={false} rot={[0, i * 0.3, 0]} />
        ))}
      </group>
      <Rug x={-8.4} z={6.6} w={2.4} d={1.8} color="#7c2d12" border="#c2410c" />
    </group>
  );
}

// Byte's corner: bed, bowls and a ball of yarn.
function CatCorner() {
  return (
    <group position={[-1.2, 0, 0.35]}>
      <mesh position={[0, 0.08, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[0.3, 0.1, 10, 24]} />
        <meshStandardMaterial color="#a78bfa" roughness={1} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.28, 24]} />
        <meshStandardMaterial color="#ede9fe" roughness={1} />
      </mesh>
      {[0.6, 0.85].map((x, i) => (
        <mesh key={x} position={[x, 0.04, 0.05]}>
          <cylinderGeometry args={[0.09, 0.1, 0.07, 16]} />
          <meshStandardMaterial color={i ? "#38bdf8" : "#f472b6"} />
        </mesh>
      ))}
      <mesh position={[0.3, 0.07, 0.35]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial color="#ef4444" roughness={1} />
      </mesh>
    </group>
  );
}

function Globe() {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.3;
  });
  return (
    <group position={[-5.0, 0, -2.0]}>
      {[0, 2.1, 4.2].map((a) => (
        <B key={a} p={[Math.sin(a) * 0.15, 0, Math.cos(a) * 0.15]} s={[0.04, 0.7, 0.04]} c={C.woodDark} rot={[Math.cos(a) * 0.2, 0, -Math.sin(a) * 0.2]} />
      ))}
      <mesh ref={ref} position={[0, 0.95, 0]} rotation-z={0.4} castShadow>
        <sphereGeometry args={[0.25, 24, 16]} />
        <meshStandardMaterial color="#1e40af" roughness={0.5} />
      </mesh>
      {[[0.1, 1.05, 0.2], [-0.15, 0.9, 0.18], [0.05, 0.8, -0.22]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#65a30d" />
        </mesh>
      ))}
      <mesh position={[0, 0.95, 0]} rotation-z={0.4}>
        <torusGeometry args={[0.29, 0.012, 6, 32]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} />
      </mesh>
    </group>
  );
}

function DrumKit() {
  const drum = (p, r, h, rot = [0, 0, 0]) => (
    <group position={p} rotation={rot}>
      <mesh castShadow>
        <cylinderGeometry args={[r, r, h, 20]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.4} />
      </mesh>
      <mesh position={[0, h / 2 + 0.002, 0]}>
        <cylinderGeometry args={[r * 0.98, r * 0.98, 0.004, 20]} />
        <meshStandardMaterial color="#f5f5f4" />
      </mesh>
    </group>
  );
  const cymbal = (p) => (
    <group position={p}>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.9, 6]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </mesh>
      <mesh rotation-x={0.15}>
        <cylinderGeometry args={[0.24, 0.24, 0.01, 24]} />
        <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
  return (
    <group position={[9.9, 0, -3.1]} rotation-y={Math.PI}>
      {drum([0, 0.28, 0], 0.32, 0.45, [Math.PI / 2, 0, 0])}
      {drum([-0.45, 0.55, -0.15], 0.17, 0.16)}
      {drum([0.1, 0.78, -0.05], 0.13, 0.12, [0.4, 0, 0])}
      {drum([0.42, 0.45, -0.25], 0.2, 0.28)}
      {cymbal([-0.65, 1.0, 0.2])}
      {cymbal([0.6, 1.1, 0.25])}
      <mesh position={[0, 0.25, -0.65]}>
        <cylinderGeometry args={[0.16, 0.16, 0.05, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.12, -0.65]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
    </group>
  );
}

function MicStand() {
  return (
    <group position={[5.8, 0, -3.2]}>
      {[0, 2.1, 4.2].map((a) => (
        <B key={a} p={[Math.sin(a) * 0.14, 0, Math.cos(a) * 0.14]} s={[0.02, 0.05, 0.3]} c="#111" rot={[0, a, 0]} shadow={false} />
      ))}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.5, 6]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.08, 1.52, 0.05]} rotation-z={-0.5}>
        <capsuleGeometry args={[0.035, 0.1, 4, 10]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* pop filter */}
      <mesh position={[0.15, 1.52, 0.18]} rotation-y={0.6}>
        <torusGeometry args={[0.08, 0.006, 6, 20]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
}

// A little AI robot arm on a pedestal, idly sweeping back and forth.
function RobotArm() {
  const base = useRef();
  const upper = useRef();
  const fore = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (base.current) base.current.rotation.y = Math.sin(t * 0.6) * 1.1;
    if (upper.current) upper.current.rotation.z = -0.5 + Math.sin(t * 0.9) * 0.25;
    if (fore.current) fore.current.rotation.z = 1.1 + Math.sin(t * 1.3 + 1) * 0.35;
  });
  return (
    <group position={[-3.3, 0, -2.0]}>
      <B p={[0, 0, 0]} s={[0.55, 0.8, 0.55]} c="#e5e7eb" r={0.03} />
      <group ref={base} position={[0, 0.8, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.17, 0.2, 0.12, 20]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        <group ref={upper} position={[0, 0.14, 0]}>
          <B p={[0, 0, 0]} s={[0.1, 0.5, 0.1]} c="#f97316" r={0.03} />
          <group ref={fore} position={[0, 0.48, 0]}>
            <mesh>
              <sphereGeometry args={[0.07, 12, 10]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            <B p={[0, 0, 0]} s={[0.08, 0.38, 0.08]} c="#f97316" r={0.025} />
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.04, 10, 8]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function Extras() {
  return (
    <group>
      <Dining />
      <ReadingNook />
      <CatCorner />
      <Trophies />
      <Globe />
      <DrumKit />
      <MicStand />
      <RobotArm />
      {/* rugs anchor the study, music room and gallery */}
      <Rug x={-8} z={-4.4} w={3.6} d={2.6} color="#1e3a5f" border="#2d4a73" />
      <Rug x={8.6} z={-3.6} w={4.6} d={3.2} color="#3f1d38" border="#6b2d5c" />
      <Rug x={0} z={-3.4} w={2.6} d={2.4} color="#1e293b" border="#f59e0b" />
    </group>
  );
}

export default function Apartment() {
  return (
    <group>
      <Shell />
      <Study />
      <Lab />
      <Music />
      <Living />
      <Library />
      <Extras />
      <HungPhotos where="studio" />
    </group>
  );
}
