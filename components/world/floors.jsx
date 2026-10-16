"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import { B, C, MONO, Plant, Elevator, useTex } from "./Apartment";
import { WALL_H, floorById } from "./layout";
import { runtime, now } from "./store";
import { useChess, boardFromFen } from "./chess";

/* ── shared shell: slab, floor, walls with light caps ── */

function Room({ id, floorTex, cap = "#8f93c9", wall = "#2b2e48", indoor = true }) {
  const { walls } = floorById(id);
  return (
    <group>
      {indoor && <hemisphereLight args={["#e8ecff", "#3a3340", 0.75]} />}
      <B p={[0, -0.6, 0]} s={[24.6, 0.6, 16.6]} c="#191b2a" shadow={false} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial map={floorTex} roughness={0.8} />
      </mesh>
      {walls.map(([x, z, w, d, h], i) => (
        <group key={i}>
          <B p={[x, 0, z]} s={[w, h, d]} c={wall} shadow={h > 0.5} />
          <B p={[x, h, z]} s={[w + 0.02, 0.04, d + 0.02]} c={cap} shadow={false} />
        </group>
      ))}
    </group>
  );
}

function repeatTex(t, x, y) {
  if (t) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(x, y);
  }
  return t;
}

function Neon({ text, position, width = 3, color = "#f472b6", rotation }) {
  const tex = useTex(512, 96, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.font = `bold 58px ${MONO}`;
    g.textAlign = "center";
    g.shadowColor = color;
    g.shadowBlur = 18;
    g.fillStyle = "#fff";
    g.fillText(text, w / 2, 68);
    g.shadowBlur = 6;
    g.fillStyle = color;
    g.fillText(text, w / 2, 68);
  }, [text, color]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width * (96 / 512)]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function Lamp({ position, color = "#fff1d6", intensity = 6, distance = 9 }) {
  return <pointLight position={position} color={color} intensity={intensity} distance={distance} decay={2} />;
}

/* ═════════════════════════════ FLOOR 2: GYM ═════════════════════════════ */

function Treadmill({ x, z, active }) {
  const belt = useRef();
  const tex = useTex(64, 256, (g, w, h) => {
    g.fillStyle = "#18181d";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#26262e";
    for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 3);
  });
  repeatTex(tex, 1, 3);
  useFrame((_, dt) => {
    if (belt.current && active) belt.current.offset.y -= dt * (0.15 + runtime.sprint * 3);
  });
  if (tex) belt.current = tex;
  return (
    <group position={[x, 0, z]}>
      <B p={[0, 0, 0]} s={[0.9, 0.2, 2.0]} c="#2a2b33" r={0.04} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.205, 0.05]}>
        <planeGeometry args={[0.62, 1.7]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      {[-0.4, 0.4].map((dx) => (
        <B key={dx} p={[dx, 0.2, -0.85]} s={[0.06, 1.05, 0.06]} c={C.metal} metal={0.6} rough={0.4} />
      ))}
      <B p={[0, 1.2, -0.88]} s={[0.86, 0.32, 0.16]} c="#1a1b22" r={0.04} rot={[0.4, 0, 0]} />
      <mesh position={[0, 1.38, -0.8]} rotation-x={-0.9}>
        <planeGeometry args={[0.5, 0.18]} />
        <meshStandardMaterial color="#0a1a10" emissive="#22c55e" emissiveIntensity={active ? 1.2 : 0.4} toneMapped={false} />
      </mesh>
      {[-0.42, 0.42].map((dx) => (
        <B key={dx} p={[dx, 0.95, -0.55]} s={[0.04, 0.04, 0.6]} c={C.metal} shadow={false} />
      ))}
    </group>
  );
}

function Dumbbell({ p, col, len = 0.32, r = 0.07 }) {
  return (
    <group position={p} rotation-z={Math.PI / 2}>
      <mesh>
        <cylinderGeometry args={[0.018, 0.018, len, 8]} />
        <meshStandardMaterial color={C.metal} metalness={0.7} roughness={0.3} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, (s * len) / 2.6, 0]} castShadow>
          <cylinderGeometry args={[r, r, 0.07, 6]} />
          <meshStandardMaterial color={col} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function PunchingBag() {
  const pivot = useRef();
  useFrame(() => {
    const t = now();
    let ang = 0;
    runtime.bagHits = runtime.bagHits.filter((h) => t - h.at < 3);
    for (const h of runtime.bagHits) {
      const a = t - h.at;
      ang += h.power * 0.22 * Math.exp(-a * 1.6) * Math.sin(a * 5.5);
    }
    if (pivot.current) pivot.current.rotation.z = ang;
  });
  return (
    <group>
      {/* bracket off the east wall */}
      <B p={[10.85, 3.0, -1.2]} s={[2.1, 0.1, 0.1]} c="#222" />
      <B p={[11.85, 2.5, -1.2]} s={[0.12, 0.6, 0.3]} c="#222" />
      <group ref={pivot} position={[9.8, 3.0, -1.2]}>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
          <meshStandardMaterial color="#888" metalness={0.8} />
        </mesh>
        <mesh position={[0, -1.3, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.24, 1.2, 20]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.55} />
        </mesh>
        {[-0.75, -1.85].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.265, 0.265, 0.08, 20]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Hanging LED batten: a glowing bar on two wires, with its light.
function Batten({ x, z, len = 3, color = "#f1f5ff", intensity = 10, rot = 0 }) {
  return (
    <group position={[x, 2.95, z]} rotation-y={rot}>
      {[-len / 2 + 0.2, len / 2 - 0.2].map((dx) => (
        <mesh key={dx} position={[dx, 0.4, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.8, 4]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      <mesh>
        <boxGeometry args={[len, 0.06, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" emissive={color} emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.3, 0]} color={color} intensity={intensity} distance={9} decay={2} />
    </group>
  );
}

// Floor tape marking out a zone.
function Tape({ x, z, w, d, color = "#facc15" }) {
  const t = 0.06;
  return (
    <group position={[x, 0.008, z]}>
      {[[0, -d / 2, w, t], [0, d / 2, w, t], [-w / 2, 0, t, d], [w / 2, 0, t, d]].map(([px, pz, sw, sd], i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[px, 0, pz]}>
          <planeGeometry args={[sw, sd]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function BoxingRing() {
  const canvas = useTex(512, 512, (g, w, h) => {
    g.fillStyle = "#1e3a8a";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#1d4ed8";
    g.fillRect(24, 24, w - 48, h - 48);
    g.strokeStyle = "rgba(255,255,255,0.85)";
    g.lineWidth = 6;
    g.beginPath(); g.arc(w / 2, h / 2, 90, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#fff";
    g.font = `bold 54px ${MONO}`;
    g.textAlign = "center";
    g.fillText("NG", w / 2, h / 2 + 18);
    g.font = `bold 22px ${MONO}`;
    g.fillStyle = "rgba(255,255,255,0.6)";
    g.fillText("· FIGHT CLUB ·", w / 2, h / 2 + 62);
  });
  const [cx, cz, W, D] = [3.5, 0.6, 5.2, 4.6];
  const H = 0.45;
  const posts = [[-1, -1, "#dc2626"], [1, -1, "#f8fafc"], [-1, 1, "#f8fafc"], [1, 1, "#2563eb"]];
  return (
    <group position={[cx, 0, cz]}>
      {/* platform with apron skirt */}
      <B p={[0, 0, 0]} s={[W, H, D]} c="#111827" />
      <mesh position={[0, H / 2, D / 2 + 0.006]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, H + 0.004, 0]} receiveShadow>
        <planeGeometry args={[W - 0.1, D - 0.1]} />
        <meshStandardMaterial map={canvas} roughness={0.9} />
      </mesh>
      {/* corner posts + pads */}
      {posts.map(([sx, sz, col]) => (
        <group key={`${sx}${sz}`} position={[(sx * (W - 0.2)) / 2, H, (sz * (D - 0.2)) / 2]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 10]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.7} roughness={0.3} />
          </mesh>
          <B p={[0, 0.2, 0]} s={[0.16, 0.85, 0.16]} c={col} r={0.04} />
        </group>
      ))}
      {/* three ropes per side */}
      {[0.45, 0.75, 1.05].map((y, i) => (
        <group key={y}>
          {[[0, -(D - 0.2) / 2, W - 0.2, 0], [0, (D - 0.2) / 2, W - 0.2, 0], [-(W - 0.2) / 2, 0, D - 0.2, Math.PI / 2], [(W - 0.2) / 2, 0, D - 0.2, Math.PI / 2]].map(([px, pz, len, ry], k) => (
            <mesh key={k} position={[px, H + y, pz]} rotation={[0, ry, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, len, 6]} />
              <meshStandardMaterial color={i === 1 ? "#f8fafc" : "#dc2626"} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      {/* steps, stool and a towel in the corner */}
      <B p={[W / 2 + 0.3, 0, -D / 2 + 0.4]} s={[0.5, 0.22, 0.6]} c="#374151" r={0.02} />
      <B p={[-W / 2 + 0.35, H, -D / 2 + 0.35]} s={[0.3, 0.38, 0.3]} c="#111" r={0.02} />
      <B p={[-W / 2 + 0.35, H + 0.38, -D / 2 + 0.35]} s={[0.32, 0.03, 0.32]} c="#f8fafc" shadow={false} />
      {/* gloves resting on the canvas */}
      {[[0.5, -0.4, "#dc2626"], [0.75, -0.25, "#dc2626"]].map(([gx, gz, col], i) => (
        <mesh key={i} position={[gx, H + 0.08, gz]} scale={[1, 0.8, 1.3]} castShadow>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color={col} roughness={0.35} />
        </mesh>
      ))}
      {/* ring spotlight (the fixture itself is off-camera, just its light) */}
      <pointLight position={[0, 2.6, 0]} color="#fff7e6" intensity={18} distance={7} decay={2} />
    </group>
  );
}

function Rower() {
  return (
    <group position={[-1.2, 0, -6.6]}>
      <B p={[0, 0.1, 0]} s={[0.12, 0.1, 2.0]} c="#334155" />
      <B p={[0, 0, -0.95]} s={[0.4, 0.12, 0.12]} c="#111" />
      <B p={[0, 0, 0.95]} s={[0.4, 0.12, 0.12]} c="#111" />
      <mesh position={[0, 0.42, -0.8]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.24, 0.24, 0.16, 20]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <B p={[0, 0.22, 0.2]} s={[0.3, 0.06, 0.36]} c="#111" r={0.02} />
      <B p={[0, 0.2, -0.45]} s={[0.36, 0.03, 0.18]} c="#475569" />
      <mesh position={[0, 0.66, -0.75]} rotation-x={-0.5}>
        <planeGeometry args={[0.2, 0.14]} />
        <meshStandardMaterial color="#082f49" emissive="#38bdf8" emissiveIntensity={1} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CableMachine() {
  return (
    <group position={[11.3, 0, -5.4]}>
      <B p={[0, 0, -0.8]} s={[0.12, 2.5, 0.12]} c="#1f2937" />
      <B p={[0, 0, 0.8]} s={[0.12, 2.5, 0.12]} c="#1f2937" />
      <B p={[0, 2.4, 0]} s={[0.14, 0.12, 1.75]} c="#1f2937" />
      <B p={[0.1, 0.2, 0]} s={[0.3, 1.1, 0.4]} c="#374151" />
      {Array.from({ length: 10 }, (_, i) => (
        <B key={i} p={[0.1, 0.22 + i * 0.1, 0]} s={[0.32, 0.08, 0.42]} c={i % 2 ? "#111" : "#1e1e1e"} shadow={false} />
      ))}
      {[-0.65, 0.65].map((z) => (
        <mesh key={z} position={[-0.25, 1.3, z]}>
          <cylinderGeometry args={[0.006, 0.006, 2.2, 4]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
      ))}
      <B p={[-0.3, 0.3, -0.65]} s={[0.08, 0.06, 0.2]} c="#dc2626" shadow={false} />
      <B p={[-0.3, 0.3, 0.65]} s={[0.08, 0.06, 0.2]} c="#dc2626" shadow={false} />
    </group>
  );
}

function PlateTree() {
  return (
    <group position={[5.0, 0, -4.9]}>
      <B p={[0, 0, 0]} s={[0.55, 0.06, 0.55]} c="#111" />
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.7} />
      </mesh>
      {[[0.3, 0.32, "#dc2626"], [0.7, 0.26, "#2563eb"], [1.05, 0.2, "#eab308"]].map(([y, r, col]) => (
        <mesh key={y} position={[0.06, y, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[r, r, 0.05, 22]} />
          <meshStandardMaterial color={col} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function PullUpRig() {
  return (
    <group position={[6.6, 0, 6.3]}>
      {[[-1, -0.35], [1, -0.35], [-1, 0.35], [1, 0.35]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.08, 2.6, 0.08]} c="#111827" />
      ))}
      <B p={[0, 2.5, -0.35]} s={[2.1, 0.08, 0.08]} c="#111827" />
      <B p={[0, 2.5, 0.35]} s={[2.1, 0.08, 0.08]} c="#111827" />
      <mesh position={[0, 2.35, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.02, 0.02, 2.0, 8]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.8} />
      </mesh>
      {/* gymnastic rings */}
      {[-0.3, 0.3].map((x) => (
        <group key={x} position={[x, 1.75, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.6, 4]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
          <mesh rotation-y={Math.PI / 2}>
            <torusGeometry args={[0.09, 0.015, 6, 16]} />
            <meshStandardMaterial color="#a16207" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BattleRopes() {
  const pts = useMemo(() => {
    const out = [];
    for (let i = 0; i <= 18; i++) out.push(i);
    return out;
  }, []);
  return (
    <group>
      <B p={[11.5, 0, 4.8]} s={[0.3, 0.6, 0.3]} c="#374151" r={0.03} />
      {[-0.12, 0.12].map((dz) =>
        pts.map((i) => (
          <mesh key={`${dz}${i}`} position={[11.3 - i * 0.2, 0.05, 4.8 + dz + Math.sin(i * 0.9) * 0.12]}>
            <sphereGeometry args={[0.045, 6, 5]} />
            <meshStandardMaterial color="#1f2937" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}

export function GymFloor() {
  const rubber = useTex(256, 256, (g, w, h) => {
    g.fillStyle = "#24262f";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1100; i++) {
      g.fillStyle = ["#30333d", "#3d414c", "#2b2e37"][i % 3];
      g.fillRect((i * 97) % w, (i * 53 + (i >> 3)) % h, 2, 2);
    }
    g.strokeStyle = "#18191f";
    g.lineWidth = 3;
    g.strokeRect(0, 0, w, h);
  });
  repeatTex(rubber, 12, 8);
  const turf = useTex(512, 128, (g, w, h) => {
    g.fillStyle = "#2f6b3a";
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) {
      g.fillStyle = x % 16 ? "#357a42" : "#2b6236";
      g.fillRect(x, 0, 4, h);
    }
    g.fillStyle = "#f5f5f5";
    for (let x = 32; x < w; x += 96) g.fillRect(x, 0, 4, h);
    g.fillRect(0, 6, w, 4);
    g.fillRect(0, h - 10, w, 4);
  });
  const mirror = useTex(512, 128, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#5a6680");
    grd.addColorStop(0.5, "#95a2c0");
    grd.addColorStop(1, "#525c76");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.18)";
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.moveTo(40 + i * 90, h); g.lineTo(80 + i * 90, h); g.lineTo(130 + i * 90, 0); g.lineTo(110 + i * 90, 0);
      g.fill();
    }
  });
  const stats = useTex(256, 144, (g, w, h) => {
    g.fillStyle = "#050a08";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#4ade80";
    g.font = `bold 46px ${MONO}`;
    g.fillText("128", 20, 64);
    g.font = `16px ${MONO}`;
    g.fillStyle = "#86efac";
    g.fillText("BPM · ZONE 4", 22, 92);
    g.strokeStyle = "#22c55e";
    g.lineWidth = 3;
    g.beginPath();
    for (let x = 0; x < w; x += 4) g.lineTo(x, 122 + Math.sin(x * 0.12) * 6 + (x % 52 < 6 ? -18 : 0));
    g.stroke();
  });
  const poster = useTex(200, 280, (g, w, h) => {
    g.fillStyle = "#f97316";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#111";
    g.font = `bold 40px ${MONO}`;
    g.fillText("NO", 20, 70);
    g.fillText("DAYS", 20, 115);
    g.fillText("OFF.", 20, 160);
    g.font = `14px ${MONO}`;
    g.fillText("(except sundays)", 20, 240);
  });

  return (
    <group>
      <Room id="gym" floorTex={rubber} cap="#f97316" wall="#2a2c36" />

      {/* zones: tape around the cardio row, stretch area and turf */}
      <Tape x={-6} z={-5.9} w={11} d={3.4} />
      <Tape x={-6.4} z={1.0} w={7.4} d={5.2} color="#38bdf8" />
      <mesh rotation-x={-Math.PI / 2} position={[-6.4, 0.006, 1.0]}>
        <planeGeometry args={[7.3, 5.1]} />
        <meshStandardMaterial color="#2c3a4a" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-4.5, 0.006, 6.75]} receiveShadow>
        <planeGeometry args={[13, 1.9]} />
        <meshStandardMaterial map={turf} roughness={1} />
      </mesh>

      {/* north wall: mirrors, neon, heart-rate screens */}
      <mesh position={[-1, 1.45, -7.87]}>
        <planeGeometry args={[19, 2.3]} />
        <meshStandardMaterial map={mirror} metalness={0.6} roughness={0.15} emissive="#1d2333" emissiveMap={mirror} emissiveIntensity={0.25} />
      </mesh>
      <Neon text="ONE MORE REP" position={[-1, 2.85, -7.85]} width={3.6} color="#f97316" />
      {[-8.8, 2.6].map((x) => (
        <group key={x} position={[x, 2.55, -7.83]}>
          <B p={[0, -0.27, 0]} s={[0.98, 0.58, 0.04]} c="#111" shadow={false} />
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[0.9, 0.5]} />
            <meshBasicMaterial map={stats} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* cardio row */}
      <Treadmill x={-9.9} z={-6.4} />
      <Treadmill x={-7.6} z={-6.4} active />
      <Treadmill x={-5.3} z={-6.4} />
      <group position={[-3.2, 0, -6.8]}>
        <B p={[0, 0, 0]} s={[0.5, 0.06, 1.1]} c="#222" />
        <mesh position={[0, 0.42, -0.35]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.28, 0.28, 0.08, 24]} />
          <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
        </mesh>
        <B p={[0, 0.06, 0.1]} s={[0.07, 0.85, 0.07]} c="#dc2626" rot={[-0.25, 0, 0]} />
        <B p={[0, 0.9, 0.22]} s={[0.22, 0.06, 0.32]} c="#111" r={0.02} />
        <B p={[0, 0.06, -0.45]} s={[0.07, 1.0, 0.07]} c="#dc2626" rot={[0.2, 0, 0]} />
        <B p={[0, 1.06, -0.62]} s={[0.5, 0.05, 0.08]} c="#111" />
      </group>
      <Rower />

      {/* weights corner */}
      <group position={[2.6, 0, -6.7]}>
        {[[-1, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6]].map(([x, z], i) => (
          <B key={i} p={[x, 0, z]} s={[0.09, 2.4, 0.09]} c="#1f2937" />
        ))}
        <B p={[0, 2.35, -0.6]} s={[2.1, 0.09, 0.09]} c="#1f2937" />
        <B p={[0, 2.35, 0.6]} s={[2.1, 0.09, 0.09]} c="#1f2937" />
        <B p={[0, 0, 0]} s={[2.3, 0.04, 1.4]} c="#3b2a1e" />
        <mesh position={[0, 1.45, 0.6]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.025, 0.025, 2.5, 10]} />
          <meshStandardMaterial color="#c0c4cc" metalness={0.85} roughness={0.25} />
        </mesh>
        {[-1, 1].map((sd) =>
          [0, 1].map((k) => (
            <mesh key={`${sd}${k}`} position={[sd * (1.08 + k * 0.07), 1.45, 0.6]} rotation-z={Math.PI / 2} castShadow>
              <cylinderGeometry args={[0.3 - k * 0.07, 0.3 - k * 0.07, 0.06, 24]} />
              <meshStandardMaterial color={k ? "#2563eb" : "#dc2626"} roughness={0.5} />
            </mesh>
          ))
        )}
      </group>
      <PlateTree />
      <group>
        <B p={[7.6, 0, -7.45]} s={[2.9, 0.5, 0.5]} c="#1f2937" r={0.02} />
        <B p={[7.6, 0.5, -7.55]} s={[2.9, 0.4, 0.3]} c="#1f2937" r={0.02} />
        {Array.from({ length: 7 }, (_, i) => (
          <Dumbbell key={i} p={[6.4 + i * 0.4, 0.58, -7.35]} col={["#dc2626", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#111"][i]} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <Dumbbell key={`t${i}`} p={[6.55 + i * 0.4, 0.98, -7.55]} col="#2a2a33" r={0.06} />
        ))}
        <B p={[7.6, 0.42, -5.3]} s={[0.4, 0.1, 1.4]} c="#111" r={0.04} />
        <B p={[7.6, 0, -5.8]} s={[0.35, 0.42, 0.08]} c="#4b5563" />
        <B p={[7.6, 0, -4.8]} s={[0.35, 0.42, 0.08]} c="#4b5563" />
        <Dumbbell p={[7.9, 0.08, -4.3]} col="#dc2626" />
      </group>
      <CableMachine />
      <mesh position={[11.86, 1.6, -2.6]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[0.9, 1.26]} />
        <meshStandardMaterial map={poster} />
      </mesh>

      {/* centrepiece */}
      <BoxingRing />
      <PunchingBag />
      {/* wall-mounted speed bag */}
      <group position={[11.6, 1.8, 1.8]}>
        <B p={[0, 0.35, 0]} s={[0.5, 0.06, 0.7]} c="#3b2a1e" />
        <B p={[0.2, -0.3, 0]} s={[0.08, 0.7, 0.3]} c="#3b2a1e" />
        <mesh position={[-0.05, 0.12, 0]} scale={[1, 1.4, 1]}>
          <sphereGeometry args={[0.1, 14, 12]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.4} />
        </mesh>
      </group>

      {/* stretch zone */}
      {[["#8b5cf6", -8.6], ["#14b8a6", -7.3], ["#f472b6", -6.0]].map(([col, x]) => (
        <group key={x}>
          <B p={[x, 0, 1.0]} s={[0.65, 0.025, 1.8]} c={col} shadow={false} />
          <mesh position={[x, 0.08, 2.15]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.08, 0.08, 0.6, 12]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
      ))}
      {[[-4.3, 2.4, 0.36, "#38bdf8"], [-3.9, 3.25, 0.32, "#a78bfa"]].map(([x, z, r, col]) => (
        <mesh key={x} position={[x, r, z]} castShadow>
          <sphereGeometry args={[r, 24, 18]} />
          <meshStandardMaterial color={col} roughness={0.35} />
        </mesh>
      ))}
      {/* wall bars north of the elevator */}
      <group position={[-11.84, 0, -2.6]}>
        {[-0.5, 0.5].map((z) => (
          <B key={z} p={[0, 0, z]} s={[0.08, 2.6, 0.08]} c={C.wood} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[0.03, 0.2 + i * 0.25, 0]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.02, 0.02, 1.0, 6]} />
            <meshStandardMaterial color="#c49a6c" />
          </mesh>
        ))}
      </group>

      {/* functional: kettlebells, plyo boxes, sled, rig, ropes */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[-7.2 + i * 0.32, 0, 5.3]}>
          <mesh position={[0, 0.12 + i * 0.01, 0]} castShadow>
            <sphereGeometry args={[0.11 + i * 0.012, 14, 12]} />
            <meshStandardMaterial color={i === 5 ? "#dc2626" : "#1f2937"} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.28 + i * 0.02, 0]}>
            <torusGeometry args={[0.065, 0.015, 6, 14, Math.PI]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
      ))}
      <B p={[-3.4, 0, 5.4]} s={[0.75, 0.6, 0.75]} c="#a16207" r={0.03} />
      <B p={[-3.4, 0.6, 5.4]} s={[0.6, 0.45, 0.6]} c="#ca8a04" r={0.03} />
      <B p={[-2.6, 0, 5.6]} s={[0.5, 0.3, 0.5]} c="#854d0e" r={0.03} />
      <group position={[0.2, 0, 6.9]}>
        <B p={[0, 0, 0]} s={[0.9, 0.12, 0.8]} c="#111" r={0.03} />
        <B p={[0.3, 0.12, 0]} s={[0.08, 0.9, 0.6]} c="#dc2626" />
        {[-0.2, 0.2].map((z) => (
          <mesh key={z} position={[-0.1, 0.26, z]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.22, 0.22, 0.07, 16]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
      </group>
      <PullUpRig />
      <BattleRopes />

      {/* lockers, bench, water station by the elevator */}
      <group>
        {Array.from({ length: 5 }, (_, i) => (
          <group key={i}>
            <B p={[-11.7, 0, 3.4 + i * 0.55]} s={[0.5, 2.1, 0.52]} c={i % 2 ? "#334155" : "#3f4f66"} r={0.015} />
            <B p={[-11.44, 1.3, 3.4 + i * 0.55]} s={[0.01, 0.2, 0.3]} c="#1e293b" shadow={false} />
            <B p={[-11.44, 1.75, 3.4 + i * 0.55]} s={[0.01, 0.06, 0.18]} c="#94a3b8" shadow={false} />
          </group>
        ))}
        <B p={[-10.9, 0.38, 4.6]} s={[0.4, 0.06, 2.4]} c={C.wood} r={0.02} />
        <B p={[-10.9, 0, 3.7]} s={[0.32, 0.38, 0.06]} c="#111" />
        <B p={[-10.9, 0, 5.5]} s={[0.32, 0.38, 0.06]} c="#111" />
        <B p={[-10.85, 0.44, 4.2]} s={[0.3, 0.06, 0.4]} c="#f8fafc" shadow={false} />
      </group>
      <group position={[-11.6, 0, 7.2]}>
        <B p={[0, 0, 0]} s={[0.42, 1.0, 0.42]} c="#e5e7eb" r={0.04} />
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.5, 18]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} roughness={0.1} />
        </mesh>
      </group>
      <Plant x={11.3} z={7.3} s={1.1} />
      <Plant x={-0.5} z={-3.0} s={0.8} kind={1} />

      <Elevator position={[-11.9, 0]} label="2" />
      {/* lighting: LED battens over each zone */}
      <Batten x={-6} z={-5.6} len={6} />
      <Batten x={6} z={-5.6} len={5} />
      <Batten x={-6.4} z={1.0} len={4} color="#bae6fd" intensity={8} />
      <Batten x={-4} z={6.4} len={6} color="#d9f99d" intensity={8} />
      <Batten x={7} z={5.2} len={3} intensity={7} />
    </group>
  );
}

/* ═════════════════════════════ FLOOR 3: GAMES ═════════════════════════════ */

// Ball layout for the decorative table, in table units (x along the length).
const SNOOKER_DECOR = (() => {
  const balls = [];
  let k = 0;
  for (let row = 0; row < 5; row++)
    for (let i = 0; i <= row; i++) balls.push([0.75 + row * 0.054, (i - row / 2) * 0.062, "#b91c1c", k++]);
  return [
    ...balls,
    [-1.0, 0, "#f5f5f0"],
    [-1.05, -0.28, "#eab308"], [-1.05, 0.28, "#16a34a"], [-1.05, 0, "#92400e"],
    [0, 0, "#2563eb"], [0.68, 0, "#ec4899"], [1.45, 0, "#111"],
  ];
})();

function SnookerTable() {
  const baize = useTex(512, 256, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.6);
    grd.addColorStop(0, "#1f8a4c");
    grd.addColorStop(1, "#13663a");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,0.5)";
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(w * 0.21, 0); g.lineTo(w * 0.21, h); g.stroke();
    g.beginPath(); g.arc(w * 0.21, h / 2, h * 0.17, Math.PI / 2, -Math.PI / 2); g.stroke();
  });
  return (
    <group position={[-4.5, 0, -2.6]}>
      <B p={[0, 0.25, 0]} s={[3.7, 0.5, 2.0]} c="#3a2418" r={0.05} />
      {[[-1.6, -0.8], [1.6, -0.8], [-1.6, 0.8], [1.6, 0.8], [0, -0.8], [0, 0.8]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.18, 0.3, 0.18]} c="#2a1a12" r={0.03} />
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.79, 0]} receiveShadow>
        <planeGeometry args={[3.36, 1.66]} />
        <meshStandardMaterial map={baize} roughness={0.95} />
      </mesh>
      {/* cushions */}
      <B p={[0, 0.75, -0.9]} s={[3.7, 0.1, 0.2]} c="#4a2e1f" r={0.03} />
      <B p={[0, 0.75, 0.9]} s={[3.7, 0.1, 0.2]} c="#4a2e1f" r={0.03} />
      <B p={[-1.77, 0.75, 0]} s={[0.2, 0.1, 2.0]} c="#4a2e1f" r={0.03} />
      <B p={[1.77, 0.75, 0]} s={[0.2, 0.1, 2.0]} c="#4a2e1f" r={0.03} />
      {[[-1.68, -0.83], [1.68, -0.83], [-1.68, 0.83], [1.68, 0.83], [0, -0.85], [0, 0.85]].map(([x, z], i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[x, 0.86, z]}>
          <circleGeometry args={[0.07, 16]} />
          <meshBasicMaterial color="#050505" />
        </mesh>
      ))}
      {SNOOKER_DECOR.map(([x, z, col], i) => (
        <mesh key={i} position={[x, 0.82, z]} castShadow>
          <sphereGeometry args={[0.029, 14, 12]} />
          <meshStandardMaterial color={col} roughness={0.2} metalness={0.05} />
        </mesh>
      ))}
      {/* cue resting on the table */}
      <mesh position={[-0.2, 0.86, 0.55]} rotation={[0, 0.25, Math.PI / 2 - 0.02]}>
        <cylinderGeometry args={[0.008, 0.014, 1.45, 8]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>
      {/* three pendant lamps */}
      {[-1.1, 0, 1.1].map((x) => (
        <group key={x} position={[x, 2.05, 0]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 1.4, 4]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh>
            <coneGeometry args={[0.32, 0.22, 20, 1, true]} />
            <meshStandardMaterial color="#14532d" side={THREE.DoubleSide} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color="#fff6dc" toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.25, 0]} intensity={5} distance={4} decay={2} color="#fff1cc" />
        </group>
      ))}
    </group>
  );
}

// Low-poly chess pieces, stacked from primitives.
function Piece({ type, white }) {
  const col = white ? "#efe7d6" : "#2a2420";
  const mat = <meshStandardMaterial color={col} roughness={0.35} />;
  const base = (
    <mesh position={[0, 0.012, 0]} castShadow>
      <cylinderGeometry args={[0.032, 0.036, 0.024, 14]} />
      {mat}
    </mesh>
  );
  const t = type.toLowerCase();
  return (
    <group>
      {base}
      {t === "p" && (
        <>
          <mesh position={[0, 0.045, 0]}><cylinderGeometry args={[0.014, 0.024, 0.045, 12]} />{mat}</mesh>
          <mesh position={[0, 0.08, 0]}><sphereGeometry args={[0.02, 12, 10]} />{mat}</mesh>
        </>
      )}
      {t === "r" && (
        <>
          <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.024, 0.028, 0.07, 12]} />{mat}</mesh>
          <mesh position={[0, 0.105, 0]}><cylinderGeometry args={[0.03, 0.03, 0.022, 12]} />{mat}</mesh>
        </>
      )}
      {t === "n" && (
        <>
          <mesh position={[0, 0.055, 0]}><cylinderGeometry args={[0.02, 0.026, 0.06, 12]} />{mat}</mesh>
          <mesh position={[0, 0.1, 0.008]} rotation-x={0.5}><boxGeometry args={[0.028, 0.06, 0.05]} />{mat}</mesh>
        </>
      )}
      {t === "b" && (
        <>
          <mesh position={[0, 0.07, 0]}><coneGeometry args={[0.024, 0.09, 12]} />{mat}</mesh>
          <mesh position={[0, 0.12, 0]}><sphereGeometry args={[0.012, 10, 8]} />{mat}</mesh>
        </>
      )}
      {t === "q" && (
        <>
          <mesh position={[0, 0.075, 0]}><cylinderGeometry args={[0.016, 0.028, 0.1, 12]} />{mat}</mesh>
          <mesh position={[0, 0.135, 0]}><sphereGeometry args={[0.022, 12, 10]} />{mat}</mesh>
        </>
      )}
      {t === "k" && (
        <>
          <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.018, 0.029, 0.11, 12]} />{mat}</mesh>
          <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.012, 0.04, 0.012]} />{mat}</mesh>
          <mesh position={[0, 0.155, 0]}><boxGeometry args={[0.03, 0.01, 0.012]} />{mat}</mesh>
        </>
      )}
    </group>
  );
}

// The real board: shows the live shared game. White sits on the west side.
function ChessCorner() {
  const { fen, history } = useChess(15000);
  const pieces = useMemo(() => Object.entries(boardFromFen(fen)), [fen]);
  const last = history?.[history.length - 1];
  const board = useTex(256, 256, (g, w) => {
    const s = w / 8;
    for (let f = 0; f < 8; f++)
      for (let r = 0; r < 8; r++) {
        g.fillStyle = (f + r) % 2 ? "#e9dcc0" : "#7a5634";
        g.fillRect(f * s, r * s, s, s);
      }
  });
  const S = 0.09;
  const cx = 5.5;
  const cz = -3.5;
  // rank → x (white at the west), file a–h → z (north → south)
  const at = (sq) => [cx + (Number(sq[1]) - 4.5) * S, cz + ("abcdefgh".indexOf(sq[0]) - 3.5) * S];
  return (
    <group>
      <B p={[cx, 0.68, cz]} s={[1.0, 0.06, 1.0]} c="#2a1d14" r={0.02} />
      <B p={[cx, 0, cz]} s={[0.12, 0.68, 0.12]} c="#1a120c" />
      <B p={[cx, 0, cz]} s={[0.6, 0.04, 0.6]} c="#1a120c" r={0.02} />
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.713, cz]}>
        <planeGeometry args={[0.72, 0.72]} />
        <meshStandardMaterial map={board} roughness={0.6} />
      </mesh>
      {last && (
        <>
          {[last.from, last.to].map((sq) => {
            const [x, z] = at(sq);
            return (
              <mesh key={sq} rotation-x={-Math.PI / 2} position={[x, 0.715, z]}>
                <planeGeometry args={[S, S]} />
                <meshBasicMaterial color="#facc15" transparent opacity={0.35} />
              </mesh>
            );
          })}
        </>
      )}
      {pieces.map(([sq, p]) => {
        const [x, z] = at(sq);
        const white = p === p.toUpperCase();
        return (
          <group key={sq} position={[x, 0.714, z]} rotation-y={white ? Math.PI / 2 : -Math.PI / 2}>
            <Piece type={p} white={white} />
          </group>
        );
      })}
      {/* chess clock */}
      <B p={[cx + 0.0, 0.71, cz - 0.44]} s={[0.24, 0.1, 0.08]} c="#111" r={0.015} />
      {/* two leather armchairs — ivory for the world, oxblood for Nikshith */}
      {[-1, 1].map((sd) => {
        const col = sd < 0 ? "#d6cbb5" : "#5b1a1a";
        return (
          <group key={sd} position={[cx + sd * 1.05, 0, cz]}>
            <B p={[0, 0.1, 0]} s={[0.7, 0.32, 0.7]} c={col} r={0.08} />
            <B p={[sd * 0.28, 0.1, 0]} s={[0.16, 0.85, 0.72]} c={col} r={0.07} />
            <B p={[0, 0.1, -0.33]} s={[0.7, 0.55, 0.12]} c={col} r={0.06} />
            <B p={[0, 0.1, 0.33]} s={[0.7, 0.55, 0.12]} c={col} r={0.06} />
            <B p={[0, 0.42, 0]} s={[0.46, 0.08, 0.5]} c={col} r={0.04} />
          </group>
        );
      })}
      <Lamp position={[cx, 2.2, cz]} intensity={7} distance={5} color="#fff1cc" />
    </group>
  );
}

function PingPong() {
  const top = useTex(256, 160, (g, w, h) => {
    g.fillStyle = "#1e40af";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#fff";
    g.fillRect(0, 0, w, 3);
    g.fillRect(0, h - 3, w, 3);
    g.fillRect(0, 0, 3, h);
    g.fillRect(w - 3, 0, 3, h);
    g.fillRect(0, h / 2 - 1, w, 2);
  });
  return (
    <group position={[7.4, 0, 4.6]}>
      <B p={[0, 0.7, 0]} s={[2.74, 0.04, 1.52]} c="#1e3a8a" />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.745, 0]}>
        <planeGeometry args={[2.72, 1.5]} />
        <meshStandardMaterial map={top} roughness={0.5} />
      </mesh>
      <B p={[0, 0.745, 0]} s={[0.02, 0.15, 1.7]} c="#e5e7eb" shadow={false} />
      {[[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.06, 0.7, 0.06]} c="#111" />
      ))}
      {[[-0.8, 0.3, "#dc2626"], [0.7, -0.4, "#111"]].map(([x, z, col]) => (
        <group key={x} position={[x, 0.76, z]}>
          <mesh rotation-x={-Math.PI / 2}><circleGeometry args={[0.08, 16]} /><meshStandardMaterial color={col} /></mesh>
          <B p={[0.1, 0, 0]} s={[0.1, 0.02, 0.03]} c={C.wood} shadow={false} />
        </group>
      ))}
      <mesh position={[0.3, 0.77, 0.2]}><sphereGeometry args={[0.02, 10, 8]} /><meshStandardMaterial color="#fff" /></mesh>
    </group>
  );
}

function Foosball() {
  return (
    <group position={[-6.8, 0, 5.2]}>
      <B p={[0, 0.55, 0]} s={[1.4, 0.32, 0.8]} c="#7c2d12" r={0.03} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.72, 0]}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
      {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
        <group key={x}>
          <mesh position={[x, 0.82, 0]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.012, 0.012, 1.1, 6]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.8} />
          </mesh>
          {[-0.2, 0, 0.2].map((z) => (
            <B key={z} p={[x, 0.73, z]} s={[0.04, 0.12, 0.05]} c={i % 2 ? "#dc2626" : "#2563eb"} shadow={false} />
          ))}
        </group>
      ))}
      {[[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.08, 0.55, 0.08]} c="#3b1d0e" />
      ))}
    </group>
  );
}

// The bar: counter with stools, glowing back shelves of bottles, taps and a fridge.
function Bar() {
  const bottles = useMemo(() => {
    const cols = ["#f59e0b", "#10b981", "#ef4444", "#a78bfa", "#38bdf8", "#f472b6", "#fde68a"];
    const out = [];
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 13; i++) out.push({ x: -0.4 + i * 0.36 + (row % 2) * 0.1, y: 1.12 + row * 0.5, h: 0.24 + ((i * 7 + row) % 4) * 0.04, col: cols[(i + row * 3) % cols.length] });
    return out;
  }, []);
  return (
    <group>
      {/* back bar */}
      <B p={[1.8, 0, -7.6]} s={[4.8, 0.95, 0.5]} c="#1c1412" r={0.02} />
      {[1.05, 1.55, 2.05].map((y) => (
        <group key={y}>
          <B p={[1.8, y, -7.72]} s={[4.6, 0.04, 0.3]} c="#3b2a20" shadow={false} />
          <mesh position={[1.8, y + 0.02, -7.6]}>
            <boxGeometry args={[4.6, 0.012, 0.02]} />
            <meshBasicMaterial color={[1.6, 0.9, 0.4]} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {bottles.map((b, i) => (
        <mesh key={i} position={[b.x, b.y + b.h / 2, -7.72]}>
          <cylinderGeometry args={[0.045, 0.05, b.h, 8]} />
          <meshStandardMaterial color={b.col} emissive={b.col} emissiveIntensity={0.55} transparent opacity={0.85} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[1.8, 1.65, -7.88]}>
        <planeGeometry args={[4.8, 1.5]} />
        <meshStandardMaterial color="#7c2d12" emissive="#9a3412" emissiveIntensity={0.35} />
      </mesh>
      {/* counter */}
      <B p={[1.8, 0, -6.3]} s={[4.6, 1.0, 0.6]} c="#2a1d17" r={0.02} />
      <B p={[1.8, 1.0, -6.3]} s={[4.8, 0.06, 0.75]} c="#0f0f12" rough={0.25} />
      <mesh position={[1.8, 0.3, -5.995]}>
        <boxGeometry args={[4.6, 0.02, 0.02]} />
        <meshBasicMaterial color={[0.4, 1.4, 1.8]} toneMapped={false} />
      </mesh>
      <B p={[1.8, 0.12, -5.92]} s={[4.4, 0.04, 0.04]} c="#b8860b" metal={0.8} rough={0.3} shadow={false} />
      {/* beer taps + glasses */}
      {[0.6, 0.85, 1.1].map((x) => (
        <group key={x} position={[x, 1.06, -6.45]}>
          <B p={[0, 0, 0]} s={[0.05, 0.32, 0.05]} c="#d1d5db" metal={0.8} rough={0.2} shadow={false} />
          <B p={[0, 0.3, 0.05]} s={[0.04, 0.12, 0.04]} c={x === 0.85 ? "#facc15" : "#111"} shadow={false} />
        </group>
      ))}
      {[[2.4, -6.25, "#fbbf24"], [3.1, -6.3, "#f472b6"], [3.5, -6.2, "#a7f3d0"]].map(([x, z, col]) => (
        <mesh key={x} position={[x, 1.13, z]}>
          <cylinderGeometry args={[0.045, 0.035, 0.14, 10]} />
          <meshStandardMaterial color={col} transparent opacity={0.75} roughness={0.05} />
        </mesh>
      ))}
      {/* stools */}
      {[-0.1, 0.85, 1.8, 2.75, 3.7].map((x) => (
        <group key={x} position={[x, 0, -5.55]}>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.72, 6]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.2, 0.22, 0.04, 14]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.18, 0.08, 16]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* pendants over the bar */}
      {[0.4, 1.8, 3.2].map((x) => (
        <group key={x} position={[x, 2.35, -6.3]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 1.0, 4]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.1, 14, 12]} />
            <meshBasicMaterial color={[2.2, 1.5, 0.8]} toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.2, 0]} color="#ffcf8a" intensity={4} distance={4} decay={2} />
        </group>
      ))}
      <Neon text="THE LAST MOVE" position={[1.8, 2.75, -7.85]} width={3.0} color="#f472b6" />
    </group>
  );
}

function Jukebox() {
  const arch = useRef();
  useFrame(({ clock }) => {
    if (arch.current) arch.current.color.setHSL((clock.elapsedTime * 0.08) % 1, 0.9, 0.6);
  });
  return (
    <group position={[-1.6, 0, -7.4]}>
      <B p={[0, 0, 0]} s={[0.85, 1.25, 0.6]} c="#3b0a2a" r={0.05} />
      <mesh position={[0, 1.25, 0]} rotation-x={Math.PI / 2} scale={[1, 0.62, 1]}>
        <cylinderGeometry args={[0.425, 0.425, 0.6, 24, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#3b0a2a" />
      </mesh>
      <mesh position={[0, 1.2, 0.305]}>
        <torusGeometry args={[0.33, 0.035, 8, 28, Math.PI]} />
        <meshBasicMaterial ref={arch} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.85, 0.305]}>
        <planeGeometry args={[0.55, 0.32]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.35, 0.305]}>
        <planeGeometry args={[0.6, 0.35]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      <pointLight position={[0, 1.0, 0.7]} color="#f472b6" intensity={2.5} distance={3} decay={2} />
    </group>
  );
}

function Pinball() {
  const playfield = useTex(128, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#1e1b4b");
    grd.addColorStop(1, "#7c3aed");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    [[40, 60, "#f472b6"], [88, 70, "#facc15"], [64, 110, "#22d3ee"]].forEach(([x, y, c]) => {
      g.fillStyle = c;
      g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill();
    });
    g.fillStyle = "#f8fafc";
    g.fillRect(30, 220, 26, 6);
    g.fillRect(72, 220, 26, 6);
  });
  return (
    <group position={[-11.2, 0, 3.5]} rotation-y={Math.PI / 2}>
      {[[-0.35, -0.6], [0.35, -0.6], [-0.35, 0.6], [0.35, 0.6]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.06, 0.75, 0.06]} c="#9ca3af" />
      ))}
      <B p={[0, 0.75, 0]} s={[0.8, 0.22, 1.45]} c="#4c1d95" r={0.03} rot={[0.1, 0, 0]} />
      <mesh position={[0, 0.88, 0]} rotation-x={-Math.PI / 2 + 0.1}>
        <planeGeometry args={[0.7, 1.35]} />
        <meshStandardMaterial map={playfield} emissive="#ffffff" emissiveMap={playfield} emissiveIntensity={0.5} />
      </mesh>
      <B p={[0, 0.85, -0.72]} s={[0.8, 0.75, 0.1]} c="#4c1d95" r={0.02} />
      <mesh position={[0, 1.25, -0.66]}>
        <planeGeometry args={[0.7, 0.5]} />
        <meshStandardMaterial color="#111" emissive="#f472b6" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function RetroCab() {
  const screen = useTex(128, 112, (g, w, h) => {
    g.fillStyle = "#020617";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#facc15";
    g.beginPath(); g.arc(40, 60, 16, 0.3, Math.PI * 2 - 0.3); g.lineTo(40, 60); g.fill();
    g.fillStyle = "#f8fafc";
    for (let x = 66; x < 120; x += 14) g.fillRect(x, 58, 4, 4);
    g.fillStyle = "#ef4444";
    g.fillRect(100, 40, 16, 18);
  });
  return (
    <group position={[-11.35, 0, 5.3]} rotation-y={Math.PI / 2}>
      <B p={[0, 0, 0]} s={[0.8, 1.85, 0.8]} c="#1e3a8a" r={0.03} />
      <B p={[0, 0.85, 0.42]} s={[0.8, 0.12, 0.3]} c="#111827" rot={[0.25, 0, 0]} />
      <mesh position={[0, 1.35, 0.41]} rotation-x={-0.12}>
        <planeGeometry args={[0.62, 0.52]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.95, 0.25]}>
        <boxGeometry args={[0.8, 0.22, 0.4]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function LibraryShelves() {
  const books = useMemo(() => {
    const cols = ["#7f1d1d", "#14532d", "#1e3a8a", "#78350f", "#e7e5e4", "#3f3f46", "#a16207"];
    const out = [];
    for (let shelf = 0; shelf < 5; shelf++) {
      let z = -6.15;
      let k = shelf * 5;
      while (z < -3.05) {
        const t = 0.08 + ((k * 37) % 6) / 70;
        out.push({ y: 0.12 + shelf * 0.5, z: z + t / 2, t, h: 0.3 + ((k * 13) % 4) / 30, c: cols[k % cols.length] });
        z += t + 0.012;
        k++;
      }
    }
    return out;
  }, []);
  return (
    <group>
      <B p={[11.62, 0, -4.6]} s={[0.5, 2.6, 3.4]} c="#2a1d14" r={0.02} />
      {[0, 1, 2, 3, 4].map((i) => (
        <B key={i} p={[11.36, 0.08 + i * 0.5, -4.6]} s={[0.04, 0.04, 3.2]} c="#4a3324" shadow={false} />
      ))}
      {books.map((b, i) => (
        <B key={i} p={[11.47, b.y, b.z]} s={[0.28, b.h, b.t]} c={b.c} shadow={false} rough={0.7} />
      ))}
      {/* a ladder leaning on the shelves */}
      <group position={[11.1, 0, -3.4]} rotation-z={0.22}>
        {[-0.2, 0.2].map((z) => (
          <B key={z} p={[0, 0, z]} s={[0.05, 2.5, 0.05]} c="#8b5a2b" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <B key={i} p={[0, 0.3 + i * 0.32, 0]} s={[0.04, 0.03, 0.4]} c="#8b5a2b" shadow={false} />
        ))}
      </group>
    </group>
  );
}

export function GamesFloor() {
  const planks = useTex(512, 512, (g, w, h) => {
    g.fillStyle = "#3b2a22";
    g.fillRect(0, 0, w, h);
    for (let row = 0; row < 16; row++) {
      g.fillStyle = ["#46322a", "#3c2b22", "#423027"][row % 3];
      g.fillRect(0, row * 32, w, 30);
      g.fillStyle = "#2a1d17";
      for (let x = (row * 71) % 180; x < w; x += 180) g.fillRect(x, row * 32, 2, 30);
    }
  });
  repeatTex(planks, 4, 2.6);
  const dart = useTex(256, 256, (g, w) => {
    const c = w / 2;
    for (let i = 0; i < 20; i++) {
      g.fillStyle = i % 2 ? "#111" : "#f3ead2";
      g.beginPath(); g.moveTo(c, c); g.arc(c, c, 120, (i * Math.PI) / 10, ((i + 1) * Math.PI) / 10); g.fill();
    }
    [[100, 92], [62, 54]].forEach(([r1, r2]) => {
      for (let i = 0; i < 20; i++) {
        g.fillStyle = i % 2 ? "#16a34a" : "#dc2626";
        g.beginPath(); g.arc(c, c, r1, (i * Math.PI) / 10, ((i + 1) * Math.PI) / 10); g.arc(c, c, r2, ((i + 1) * Math.PI) / 10, (i * Math.PI) / 10, true); g.fill();
      }
    });
    g.fillStyle = "#16a34a"; g.beginPath(); g.arc(c, c, 12, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#dc2626"; g.beginPath(); g.arc(c, c, 6, 0, Math.PI * 2); g.fill();
  });
  const chalk = useTex(256, 320, (g, w, h) => {
    g.fillStyle = "#1f2a24";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#8b5a2b";
    g.lineWidth = 14;
    g.strokeRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.85)";
    g.font = `28px ${MONO}`;
    g.fillText("501", 28, 56);
    g.font = `22px ${MONO}`;
    ["NG   ||||  ||", "BYTE ||", "YOU  ?"].forEach((t, i) => g.fillText(t, 28, 110 + i * 48));
    g.fillText("high break: 47", 28, 280);
  });
  const lounge = useTex(256, 256, (g, w, h) => {
    g.fillStyle = "#3b1d4a";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#f59e0b55";
    g.lineWidth = 6;
    for (let r = 30; r < 180; r += 30) { g.beginPath(); g.arc(w / 2, h / 2, r, 0, Math.PI * 2); g.stroke(); }
  });

  return (
    <group>
      <Room id="games" floorTex={planks} cap="#22d3ee" wall="#1f2a37" />

      {/* rugs mark each zone */}
      <mesh rotation-x={-Math.PI / 2} position={[-4.5, 0.008, -2.6]} receiveShadow>
        <planeGeometry args={[6.4, 4.6]} />
        <meshStandardMaterial color="#5b1a24" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[5.5, 0.008, -3.5]} receiveShadow>
        <planeGeometry args={[3.6, 2.8]} />
        <meshStandardMaterial color="#1f3b4d" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0.4, 0.008, 4.3]} receiveShadow>
        <planeGeometry args={[4.6, 4.4]} />
        <meshStandardMaterial map={lounge} roughness={1} />
      </mesh>
      {/* green-and-white arcade tiles */}
      <mesh rotation-x={-Math.PI / 2} position={[-8.5, 0.008, 5.2]}>
        <planeGeometry args={[6, 4.6]} />
        <meshStandardMaterial color="#123c2a" roughness={0.9} />
      </mesh>

      {/* snooker hall */}
      <SnookerTable />
      <group position={[-4.5, 0, -7.86]}>
        <B p={[0, 0.9, 0]} s={[1.2, 0.08, 0.1]} c="#3a2418" />
        <B p={[0, 2.0, 0]} s={[1.2, 0.08, 0.1]} c="#3a2418" />
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[-0.45 + i * 0.22, 1.45, 0.06]}>
            <cylinderGeometry args={[0.012, 0.018, 1.4, 6]} />
            <meshStandardMaterial color={i % 2 ? "#d4a373" : "#a16207"} />
          </mesh>
        ))}
      </group>
      <group position={[-8.2, 1.7, -7.86]}>
        <B p={[0, -0.4, 0]} s={[1.5, 0.8, 0.05]} c="#3a2418" shadow={false} />
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.35, 0.68]} />
          <meshStandardMaterial map={chalk} />
        </mesh>
      </group>
      <group position={[-9.6, 0, -6.3]}>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.1, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.04, 20]} />
          <meshStandardMaterial color="#2a1d17" />
        </mesh>
        <mesh position={[0, 1.18, 0.1]}>
          <cylinderGeometry args={[0.04, 0.035, 0.12, 10]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.8} />
        </mesh>
        {[-0.6, 0.6].map((dx) => (
          <group key={dx} position={[dx, 0, 0.1]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <mesh position={[0, 0.82, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.06, 14]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          </group>
        ))}
      </group>

      {/* bar + jukebox */}
      <Bar />
      <Jukebox />

      {/* chess library */}
      <ChessCorner />
      <LibraryShelves />
      <group position={[7.3, 0, -5.4]}>
        <B p={[0, 0, 0]} s={[0.3, 0.04, 0.3]} c="#111" />
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.6, 6]} />
          <meshStandardMaterial color="#b8860b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.65, 0]}>
          <cylinderGeometry args={[0.16, 0.24, 0.26, 16, 1, true]} />
          <meshStandardMaterial color="#14532d" emissive="#fbbf24" emissiveIntensity={0.4} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 1.5, 0]} color="#ffcf8a" intensity={3} distance={4} decay={2} />
      </group>
      <mesh position={[8.6, 1.9, -7.86]}>
        <planeGeometry args={[1.4, 1.0]} />
        <meshStandardMaterial color="#1c1917" emissive="#78350f" emissiveIntensity={0.25} />
      </mesh>
      <Neon text="CHECKMATE" position={[8.6, 2.65, -7.85]} width={2.0} color="#38bdf8" />

      {/* sunken lounge: two sofas facing each other over a games table */}
      {[2.65, 5.95].map((z, i) => (
        <group key={z} position={[0.4, 0, z]} rotation-y={i ? Math.PI : 0}>
          <B p={[0, 0.05, 0]} s={[2.9, 0.4, 0.95]} c="#0f766e" r={0.08} />
          <B p={[0, 0.4, -0.35]} s={[2.9, 0.62, 0.25]} c="#0f766e" r={0.1} />
          <B p={[-1.35, 0.4, 0]} s={[0.22, 0.32, 0.95]} c="#0f766e" r={0.08} />
          <B p={[1.35, 0.4, 0]} s={[0.22, 0.32, 0.95]} c="#0f766e" r={0.08} />
          <B p={[-0.6, 0.48, -0.1]} s={[0.38, 0.36, 0.13]} c={i ? "#f59e0b" : "#f472b6"} r={0.06} rot={[-0.3, 0.2, 0]} />
        </group>
      ))}
      <group position={[0.4, 0, 4.3]}>
        <B p={[0, 0, 0]} s={[1.5, 0.38, 0.8]} c="#3b2a20" r={0.03} />
        {/* a half-played board game, dice and popcorn */}
        <B p={[-0.2, 0.38, 0]} s={[0.6, 0.02, 0.6]} c="#fde68a" shadow={false} />
        {[[-0.35, -0.15, "#dc2626"], [-0.1, 0.1, "#2563eb"], [-0.25, 0.2, "#16a34a"]].map(([x, z, col]) => (
          <mesh key={x} position={[x, 0.45, z]}>
            <coneGeometry args={[0.03, 0.1, 8]} />
            <meshStandardMaterial color={col} />
          </mesh>
        ))}
        <B p={[0.3, 0.38, -0.15]} s={[0.06, 0.06, 0.06]} c="#f8fafc" shadow={false} rot={[0, 0.5, 0]} />
        <mesh position={[0.45, 0.48, 0.15]}>
          <cylinderGeometry args={[0.1, 0.08, 0.2, 12]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0.45, 0.6, 0.15]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial color="#fef3c7" roughness={1} />
        </mesh>
      </group>
      <group position={[0.4, 2.5, 4.3]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.6, 4]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 0.06, 24]} />
          <meshStandardMaterial color="#111" emissive="#fde68a" emissiveIntensity={0.6} />
        </mesh>
        <pointLight position={[0, -0.3, 0]} color="#ffd9a8" intensity={6} distance={5} decay={2} />
      </group>

      {/* arcade corner */}
      <Pinball />
      <RetroCab />
      <Foosball />
      <Neon text="INSERT COIN" position={[-11.85, 2.5, 4.4]} width={2.2} color="#facc15" rotation={[0, Math.PI / 2, 0]} />

      {/* ping-pong + darts */}
      <PingPong />
      <group position={[11.86, 1.7, 1.2]} rotation-y={-Math.PI / 2}>
        <mesh><circleGeometry args={[0.36, 32]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[0, 0, 0.01]}><circleGeometry args={[0.3, 32]} /><meshStandardMaterial map={dart} /></mesh>
        {[[0.05, 0.08], [-0.1, -0.04], [0.02, -0.12]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.06]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.006, 0.002, 0.12, 4]} />
            <meshStandardMaterial color={i ? "#2563eb" : "#dc2626"} />
          </mesh>
        ))}
      </group>
      <group position={[11.86, 1.6, -0.6]} rotation-y={-Math.PI / 2}>
        <mesh>
          <planeGeometry args={[0.8, 1.0]} />
          <meshStandardMaterial map={chalk} />
        </mesh>
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[9.5, 0.01, 1.2]}>
        <planeGeometry args={[0.05, 1.4]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <pointLight position={[10.8, 2.4, 1.2]} color="#fff1d6" intensity={4} distance={4} decay={2} />

      {/* bean bags */}
      <mesh position={[10.5, 0.35, 6.8]} scale={[1, 0.7, 1]} castShadow>
        <sphereGeometry args={[0.55, 18, 14]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.9} />
      </mesh>
      <mesh position={[9.3, 0.3, 7.2]} scale={[1, 0.68, 1]} castShadow>
        <sphereGeometry args={[0.48, 18, 14]} />
        <meshStandardMaterial color="#6366f1" roughness={0.9} />
      </mesh>
      <Plant x={-11.2} z={7.3} s={1.1} />
      <Plant x={4.3} z={-7.3} s={0.9} kind={1} />

      <Neon text="GAMES ROOM" position={[-4.5, 2.75, -7.85]} width={2.8} color="#22d3ee" />
      <Elevator position={[-11.9, 0]} label="3" />
      <Lamp position={[0, 3.0, 0]} intensity={10} distance={12} color="#ffd9a8" />
      <Lamp position={[-8, 2.8, 4.5]} intensity={8} distance={8} color="#a7f3d0" />
      <Lamp position={[7.4, 2.8, 4.6]} intensity={9} distance={8} color="#e0f2fe" />
      <Lamp position={[5.5, 2.6, -3.5]} intensity={5} distance={6} color="#ffd9a8" />
    </group>
  );
}

/* ═════════════════════════════ ROOFTOP ═════════════════════════════ */

// The city below: a ring of towers whose roofs sit beneath ours, a grid of
// street lights far down, and our own building's lit facade dropping away.
function Skyline() {
  const ref = useRef();
  const streets = useRef();
  const windows = useTex(64, 128, (g, w, h) => {
    g.fillStyle = "#0b0f22";
    g.fillRect(0, 0, w, h);
    for (let y = 4; y < h; y += 8)
      for (let x = 4; x < w; x += 8) {
        const r = Math.abs(Math.sin(x * 13.1 + y * 7.7) * 1000) % 1;
        g.fillStyle = r > 0.7 ? (r > 0.93 ? "#a5b4fc" : "#ffd58a") : "#121833";
        g.fillRect(x, y, 4, 5);
      }
  });
  repeatTex(windows, 2, 6);
  const towers = useMemo(() => {
    const out = [];
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2 + Math.sin(i * 3.1) * 0.04;
      const d = 38 + ((i * 37) % 60);
      // nearer towers sit lower so nothing crowds the roof
      const top = -48 + ((i * 29) % 20) + (d - 38) * 0.35;
      out.push({ x: Math.sin(a) * d, z: Math.cos(a) * d, w: 5 + ((i * 13) % 7), dpt: 4 + ((i * 7) % 5), top: Math.min(top, -12), rot: a });
    }
    return out;
  }, []);
  const lamps = useMemo(() => {
    const out = [];
    for (let gx = -14; gx <= 14; gx++)
      for (let gz = -14; gz <= 14; gz++) {
        if (Math.abs(gx) < 3 && Math.abs(gz) < 3) continue;
        if ((gx + gz) % 2 === 0 || Math.abs(gx * 7 + gz * 3) % 5 === 0) out.push([gx * 7, gz * 7]);
      }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    towers.forEach((t, i) => {
      const h = t.top + 90;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), t.rot);
      m.compose(new THREE.Vector3(t.x, t.top - h / 2, t.z), q, new THREE.Vector3(t.w, h, t.dpt));
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    lamps.forEach(([x, z], i) => streets.current.setMatrixAt(i, m.makeTranslation(x, -88, z)));
    streets.current.instanceMatrix.needsUpdate = true;
  }, [towers, lamps]);
  return (
    <group>
      <instancedMesh ref={ref} args={[null, null, towers.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={windows} emissive="#ffffff" emissiveMap={windows} emissiveIntensity={0.9} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={streets} args={[null, null, lamps.length]}>
        <sphereGeometry args={[0.35, 6, 6]} />
        <meshBasicMaterial color={[2, 1.4, 0.6]} toneMapped={false} />
      </instancedMesh>
      {/* our own building's facade, falling away beneath the roof */}
      <mesh position={[0, -45.6, 0]}>
        <boxGeometry args={[24.6, 90, 16.6]} />
        <meshStandardMaterial map={windows} emissive="#ffffff" emissiveMap={windows} emissiveIntensity={0.6} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Moon() {
  const glow = useTex(128, 128, (g, w) => {
    const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grd.addColorStop(0, "rgba(255,248,220,0.55)");
    grd.addColorStop(1, "rgba(255,248,220,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, w);
  });
  return (
    <group position={[26, 26, -58]}>
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#fdf6d8" toneMapped={false} />
      </mesh>
      <sprite scale={[22, 22, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

function ShootingStars() {
  const ref = useRef();
  const st = useRef({ next: 3, t: -1, from: new THREE.Vector3(), dir: new THREE.Vector3() });
  useFrame((_, dt) => {
    const s = st.current;
    const m = ref.current;
    if (!m) return;
    if (s.t < 0) {
      s.next -= dt;
      m.visible = false;
      if (s.next <= 0) {
        s.t = 0;
        s.from.set(-30 + Math.random() * 60, 30 + Math.random() * 12, -50 - Math.random() * 10);
        s.dir.set(-1 - Math.random(), -0.45, 0.1).normalize();
      }
      return;
    }
    s.t += dt;
    m.visible = true;
    m.position.copy(s.from).addScaledVector(s.dir, s.t * 45);
    m.lookAt(m.position.clone().add(s.dir));
    m.material.opacity = Math.max(0, 1 - s.t / 0.9);
    if (s.t > 0.9) {
      s.t = -1;
      s.next = 4 + Math.random() * 7;
    }
  });
  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[0.06, 0.06, 5]} />
      <meshBasicMaterial color="#ffffff" transparent toneMapped={false} />
    </mesh>
  );
}

function FirePit() {
  const flames = useRef([]);
  const light = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flames.current.forEach((m, i) => {
      if (!m) return;
      const f = 1 + Math.sin(t * (9 + i * 2) + i) * 0.12 + Math.sin(t * 23 + i * 5) * 0.06;
      m.scale.set(1, f, 1);
      m.rotation.y = t * (0.6 + i * 0.2);
    });
    if (light.current) light.current.intensity = 9 + Math.sin(t * 13) * 1.5 + Math.sin(t * 31) * 0.8;
  });
  return (
    <group position={[0, 0, 2]}>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.72, 0.36, 18]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.37, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.52, 18]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <B key={i} p={[0, 0.36, 0]} s={[0.8, 0.07, 0.09]} c="#3f2a1d" rot={[0, (i * Math.PI) / 3, 0]} shadow={false} />
      ))}
      {[["#fde047", 0.16, 0.55], ["#fb923c", 0.24, 0.45], ["#ef4444", 0.3, 0.32]].map(([col, r, h], i) => (
        <mesh key={i} ref={(m) => (flames.current[i] = m)} position={[0, 0.4 + h / 2, 0]}>
          <coneGeometry args={[r, h, 7]} />
          <meshBasicMaterial color={col} transparent opacity={0.85 - i * 0.15} toneMapped={false} />
        </mesh>
      ))}
      <pointLight ref={light} position={[0, 1.0, 0]} color="#ff9a4a" intensity={9} distance={9} decay={2} />
      <Sparkles count={24} scale={[0.8, 2.2, 0.8]} position={[0, 1.4, 0]} size={2.4} speed={0.8} color="#ffb070" opacity={0.9} />
    </group>
  );
}

function RoofLights() {
  const ref = useRef();
  const pts = useMemo(() => {
    const out = [];
    for (const z of [-0.6, 2.2, 5.0]) {
      for (let i = 0; i <= 26; i++) {
        const f = i / 26;
        out.push([-8 + f * 12, 2.7 - Math.sin(f * Math.PI) * 0.35, z]);
      }
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    pts.forEach((p, i) => ref.current.setMatrixAt(i, m.makeTranslation(...p)));
    ref.current.instanceMatrix.needsUpdate = true;
  }, [pts]);
  return (
    <group>
      <instancedMesh ref={ref} args={[null, null, pts.length]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={[2, 1.5, 0.7]} toneMapped={false} />
      </instancedMesh>
      {[[-8, -0.6], [4, -0.6], [-8, 2.2], [4, 2.2], [-8, 5.0], [4, 5.0]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.07, 2.75, 0.07]} c="#1f2937" />
      ))}
    </group>
  );
}

function Telescope() {
  return (
    <group position={[7, 0, -5]}>
      {[0, 2.1, 4.2].map((a) => (
        <mesh key={a} position={[Math.sin(a) * 0.28, 0.6, Math.cos(a) * 0.28]} rotation={[Math.cos(a) * 0.4, 0, -Math.sin(a) * 0.4]} castShadow>
          <cylinderGeometry args={[0.02, 0.028, 1.3, 6]} />
          <meshStandardMaterial color="#b45309" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <group position={[0, 1.25, 0]} rotation={[0.75, 0.45, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.08, 1.2, 20]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.3} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.08, 20]} />
          <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 10]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    </group>
  );
}

function Radio() {
  const dial = useRef();
  useFrame(({ clock }) => {
    if (dial.current) dial.current.emissiveIntensity = 1.6 + Math.sin(clock.elapsedTime * 3) * 0.4;
  });
  return (
    <group position={[-2.7, 0, 4.3]}>
      <B p={[0, 0, 0]} s={[0.6, 0.55, 0.6]} c={C.wood} r={0.03} />
      <B p={[0, 0.55, 0]} s={[0.5, 0.28, 0.2]} c="#c2410c" r={0.04} />
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 0.69, 0.105]}>
          <circleGeometry args={[0.07, 18]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
      ))}
      <mesh position={[0, 0.79, 0.105]}>
        <planeGeometry args={[0.16, 0.04]} />
        <meshStandardMaterial ref={dial} color="#451a03" emissive="#fbbf24" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <mesh position={[0.18, 0.98, 0]} rotation-z={-0.4}>
        <cylinderGeometry args={[0.006, 0.006, 0.45, 4]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.8} />
      </mesh>
    </group>
  );
}

function Greenhouse() {
  return (
    <group position={[-4.4, 0, -6.2]}>
      <B p={[0, 0, 0]} s={[2.4, 0.12, 2.6]} c="#57534e" />
      {/* glass box with a pitched glass roof */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[2.3, 2.1, 2.5]} />
        <meshStandardMaterial color="#d1fae5" transparent opacity={0.16} roughness={0.05} depthWrite={false} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.58, 2.48, 0]} rotation-z={sd * -0.55}>
          <boxGeometry args={[1.35, 0.03, 2.5]} />
          <meshStandardMaterial color="#d1fae5" transparent opacity={0.22} roughness={0.05} depthWrite={false} />
        </mesh>
      ))}
      {[[-1.15, -1.25], [1.15, -1.25], [-1.15, 1.25], [1.15, 1.25]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.06, 2.2, 0.06]} c="#e7e5e4" />
      ))}
      <B p={[0, 2.78, 0]} s={[0.06, 0.06, 2.55]} c="#e7e5e4" shadow={false} />
      {/* shelves of seedlings inside */}
      <B p={[0, 0.7, -0.8]} s={[2.0, 0.05, 0.5]} c={C.wood} shadow={false} />
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[-0.8 + i * 0.32, 0.76, -0.8]}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.07, 0.06, 0.12, 10]} />
            <meshStandardMaterial color="#c2410c" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <icosahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial color={i % 2 ? "#4ade80" : "#16a34a"} flatShading />
          </mesh>
        </group>
      ))}
      <Plant x={0.5} z={0.5} s={0.9} />
      <pointLight position={[0, 1.8, 0]} color="#bbf7d0" intensity={3} distance={4} decay={2} />
    </group>
  );
}

function RaisedBed({ z }) {
  return (
    <group position={[-9.2, 0, z]}>
      <B p={[0, 0, 0]} s={[3.2, 0.5, 0.9]} c="#7c5a3a" r={0.02} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.51, 0]}>
        <planeGeometry args={[3.0, 0.75]} />
        <meshStandardMaterial color="#3f2a1d" roughness={1} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[-1.3 + i * 0.37, 0.5, (i % 2) * 0.16 - 0.08]}>
          <mesh position={[0, 0.16, 0]}>
            <coneGeometry args={[0.13, 0.32, 6]} />
            <meshStandardMaterial color={i % 3 ? "#22c55e" : "#65a30d"} flatShading />
          </mesh>
          {i % 3 === 0 && (
            <mesh position={[0.06, 0.22, 0.05]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={z < -6 ? "#ef4444" : "#f59e0b"} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function Picnic() {
  return (
    <group position={[-6.6, 0, -2.2]}>
      <B p={[0, 0.72, 0]} s={[2.0, 0.06, 0.85]} c="#a16207" r={0.02} />
      {[-0.75, 0.75].map((x) => (
        <B key={x} p={[x, 0, 0]} s={[0.08, 0.72, 0.7]} c="#78350f" />
      ))}
      {[-0.7, 0.7].map((z) => (
        <B key={z} p={[0, 0.42, z]} s={[2.0, 0.05, 0.3]} c="#a16207" r={0.02} />
      ))}
      {/* checked cloth, plates, a jug */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.755, 0]}>
        <planeGeometry args={[1.1, 0.75]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {[-0.55, 0.2, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.765, x > 0 ? 0.2 : -0.18]}>
          <cylinderGeometry args={[0.12, 0.12, 0.015, 16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.2, 12]} />
        <meshStandardMaterial color="#fef3c7" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function BBQ() {
  const smoke = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    smoke.current.forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.35 + i / 5) % 1;
      m.position.set(Math.sin(t + i) * 0.08, 1.1 + k * 1.6, 0);
      m.scale.setScalar(0.5 + k * 1.6);
      m.material.opacity = 0.25 * (1 - k);
    });
  });
  return (
    <group position={[-3.6, 0, -2.6]}>
      {[[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.05, 0.8, 0.05]} c="#111" />
      ))}
      <B p={[0, 0.8, 0]} s={[0.75, 0.22, 0.5]} c="#1f2937" r={0.04} />
      <mesh position={[0, 1.02, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.65, 0.4]} />
        <meshStandardMaterial color="#7c2d12" emissive="#f97316" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {[[-0.15, 0], [0.12, 0.08], [0.15, -0.1]].map(([x, z], i) => (
        <B key={i} p={[x, 1.03, z]} s={[0.16, 0.04, 0.06]} c="#7f1d1d" shadow={false} />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} ref={(m) => (smoke.current[i] = m)}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#d6d3d1" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
      <pointLight position={[0, 1.2, 0]} color="#fb923c" intensity={2.5} distance={3} decay={2} />
    </group>
  );
}

function HotTub() {
  const water = useRef();
  const steam = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (water.current) water.current.emissiveIntensity = 1.1 + Math.sin(t * 1.7) * 0.15;
    steam.current.forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.22 + i / 6) % 1;
      const a = i * 1.7;
      m.position.set(Math.sin(a) * 0.6, 0.85 + k * 1.3, Math.cos(a) * 0.6);
      m.scale.setScalar(0.6 + k * 1.8);
      m.material.opacity = 0.16 * (1 - k);
    });
  });
  return (
    <group position={[8.8, 0, 5.3]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.25, 1.3, 0.8, 32]} />
        <meshStandardMaterial color="#6b5444" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.81, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.0, 1.26, 32]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      <mesh ref={water} position={[0, 0.74, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial color="#0e7490" emissive="#22d3ee" emissiveIntensity={1.1} roughness={0.05} toneMapped={false} />
      </mesh>
      {/* bubbles */}
      <Sparkles count={30} scale={[1.6, 0.2, 1.6]} position={[0, 0.8, 0]} size={2} speed={1.2} color="#e0f2fe" opacity={0.9} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} ref={(m) => (steam.current[i] = m)}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#f0f9ff" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      ))}
      {/* steps + a towel + a rubber duck, obviously */}
      <B p={[-1.45, 0, 0.6]} s={[0.5, 0.35, 0.8]} c="#6b5444" r={0.02} />
      <B p={[1.35, 0.81, -0.2]} s={[0.5, 0.04, 0.35]} c="#f472b6" shadow={false} rot={[0, 0.3, 0]} />
      <group position={[0.3, 0.8, 0.2]}>
        <mesh>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
        <mesh position={[0.05, 0.07, 0]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
        <mesh position={[0.1, 0.07, 0]} rotation-z={-Math.PI / 2}>
          <coneGeometry args={[0.015, 0.04, 6]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
      </group>
      <pointLight position={[0, 1.2, 0]} color="#67e8f9" intensity={6} distance={5} decay={2} />
    </group>
  );
}

function StarChart() {
  const tex = useTex(256, 192, (g, w, h) => {
    g.fillStyle = "#0b1030";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(147,197,253,0.6)";
    g.lineWidth = 2;
    const pts = [[60, 40], [60, 110], [30, 75], [92, 80]];
    g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.moveTo(...pts[2]); g.lineTo(...pts[3]); g.stroke();
    g.fillStyle = "#fff";
    for (const [x, y] of [...pts, [180, 50], [200, 70], [215, 95], [170, 120]]) {
      g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = "#93c5fd";
    g.font = `14px ${MONO}`;
    g.fillText("CRUX", 40, 150);
    g.fillText("ORION", 168, 150);
  });
  return (
    <group position={[5.0, 0, -6.9]}>
      {[-0.3, 0.3].map((x) => (
        <B key={x} p={[x, 0, 0.1]} s={[0.04, 1.5, 0.04]} c={C.wood} rot={[-0.15, 0, 0]} />
      ))}
      <B p={[0, 0, -0.18]} s={[0.04, 1.4, 0.04]} c={C.wood} rot={[0.2, 0, 0]} />
      <mesh position={[0, 1.25, 0.05]} rotation-x={-0.15}>
        <planeGeometry args={[0.85, 0.64]} />
        <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export function Rooftop() {
  const deck = useTex(512, 512, (g, w, h) => {
    g.fillStyle = "#6b5444";
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < 16; x++) {
      g.fillStyle = ["#735a49", "#685140", "#6f5645"][x % 3];
      g.fillRect(x * 32, 0, 29, h);
      g.fillStyle = "#4a3a2f";
      g.fillRect(x * 32 + 29, 0, 3, h);
      for (let y = (x * 97) % 200; y < h; y += 200) g.fillRect(x * 32, y, 29, 2);
    }
  });
  repeatTex(deck, 5, 3.4);
  const blink = useRef();
  useFrame(({ clock }) => {
    if (blink.current) blink.current.emissiveIntensity = Math.sin(clock.elapsedTime * 3) > 0.6 ? 6 : 0.2;
  });

  return (
    <group>
      <Stars radius={90} depth={40} count={5000} factor={4} saturation={0.2} fade speed={0.6} />
      <Moon />
      <Skyline />
      <ShootingStars />
      <Room id="roof" floorTex={deck} cap="#a8a29e" wall="#57534e" indoor={false} />
      {/* LED strip along the top of the parapet */}
      {[[0, -7.9, 24, 0.04], [0, 7.9, 24, 0.04], [-11.9, 0, 0.04, 16], [11.9, 0, 0.04, 16]].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 1.06, z]}>
          <boxGeometry args={[w, 0.03, d]} />
          <meshBasicMaterial color={[1.2, 0.9, 2.0]} toneMapped={false} />
        </mesh>
      ))}
      {/* zone surfaces: gravel garden, slate stargazing deck, stone round the tub */}
      <mesh rotation-x={-Math.PI / 2} position={[-6.8, 0.006, -4.6]}>
        <planeGeometry args={[10, 6.6]} />
        <meshStandardMaterial color="#5f5a52" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[8, 0.006, -4.6]}>
        <planeGeometry args={[7.6, 6.6]} />
        <meshStandardMaterial color="#2b3040" roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[7.6, 0.006, 5.3]}>
        <planeGeometry args={[8.4, 4.6]} />
        <meshStandardMaterial color="#9a958c" roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-0.2, 0.008, 2.6]}>
        <circleGeometry args={[3.0, 40]} />
        <meshStandardMaterial color="#7c2d12" roughness={1} />
      </mesh>

      {/* elevator hut */}
      <group>
        <B p={[-11.25, 0, 0]} s={[1.5, 3.0, 3.2]} c="#44403c" r={0.03} />
        <B p={[-11.25, 3.0, 0]} s={[1.7, 0.12, 3.4]} c="#292524" />
        <Elevator position={[-10.52, 0]} label="R" />
        <mesh position={[-10.45, 2.75, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.35]} />
          <meshStandardMaterial color="#fff1d6" emissive="#ffb85c" emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
        <pointLight position={[-9.9, 2.6, 0]} color="#ffcf8a" intensity={3} distance={5} decay={2} />
        {/* climbing ivy on the hut */}
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[-10.48, 0.4 + (i % 7) * 0.36, i < 7 ? 1.35 : -1.35]}>
            <icosahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color={i % 2 ? "#15803d" : "#166534"} flatShading />
          </mesh>
        ))}
      </group>

      {/* garden: beds, greenhouse, picnic + BBQ */}
      <RaisedBed z={-6.9} />
      <RaisedBed z={-5.0} />
      <Greenhouse />
      <Picnic />
      <BBQ />
      <group position={[-7.9, 0, -3.8]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.3, 12]} />
          <meshStandardMaterial color="#16a34a" metalness={0.3} />
        </mesh>
        <mesh position={[0.18, 0.22, 0]} rotation-z={-0.9}>
          <cylinderGeometry args={[0.015, 0.02, 0.3, 6]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      </group>

      {/* fire-pit lounge */}
      <FirePit />
      <B p={[-1.95, 0.05, 2]} s={[0.9, 0.38, 2.4]} c="#d6d3d1" r={0.08} />
      <B p={[-2.3, 0.4, 2]} s={[0.22, 0.5, 2.4]} c="#d6d3d1" r={0.08} />
      <B p={[0, 0.05, 3.95]} s={[2.4, 0.38, 0.9]} c="#d6d3d1" r={0.08} />
      <B p={[0, 0.4, 4.3]} s={[2.4, 0.5, 0.22]} c="#d6d3d1" r={0.08} />
      <B p={[1.95, 0.05, 1.7]} s={[0.9, 0.38, 0.9]} c="#d6d3d1" r={0.08} />
      {[[-1.8, 1.4, "#f97316"], [0.6, 3.85, "#0ea5e9"], [-1.8, 2.7, "#facc15"]].map(([x, z, col], i) => (
        <B key={i} p={[x, 0.43, z]} s={[0.4, 0.35, 0.14]} c={col} r={0.06} rot={[0, i === 1 ? 0 : Math.PI / 2, 0]} />
      ))}
      {/* blankets and marshmallow sticks */}
      <B p={[0.4, 0.44, 3.8]} s={[0.7, 0.04, 0.5]} c="#7c3aed" shadow={false} rot={[0, 0.2, 0]} />
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.65, 1.2]} rotation={[0.9, 0, x]}>
          <cylinderGeometry args={[0.006, 0.006, 0.9, 4]} />
          <meshStandardMaterial color="#a16207" />
        </mesh>
      ))}
      <RoofLights />
      <Radio />
      {/* hammock between two posts */}
      <B p={[-9.2, 0, 4.6]} s={[0.18, 1.8, 0.18]} c={C.woodDark} />
      <B p={[-5.8, 0, 4.6]} s={[0.18, 1.8, 0.18]} c={C.woodDark} />
      <mesh position={[-7.5, 1.55, 4.6]} rotation-z={Math.PI} scale={[1, 0.38, 2.6]} castShadow>
        <torusGeometry args={[1.62, 0.16, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#c084fc" side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      <B p={[-8.3, 0, 6.2]} s={[0.9, 0.08, 0.6]} c="#a16207" r={0.02} />

      {/* stargazing deck */}
      <Telescope />
      <StarChart />
      {[[8.8, -3.4, "#4338ca"], [9.9, -4.8, "#be185d"]].map(([x, z, col]) => (
        <mesh key={x} position={[x, 0.32, z]} scale={[1, 0.65, 1]} castShadow>
          <sphereGeometry args={[0.5, 18, 14]} />
          <meshStandardMaterial color={col} roughness={0.9} />
        </mesh>
      ))}
      <B p={[9.3, 0, -4.1]} s={[0.4, 0.4, 0.4]} c={C.wood} r={0.03} />
      <mesh position={[9.3, 0.5, -4.1]}>
        <cylinderGeometry args={[0.05, 0.04, 0.12, 10]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <group position={[8.4, 0, -7.2]}>
        <B p={[0, 0, 0]} s={[1.3, 0.9, 0.8]} c="#9ca3af" r={0.03} />
        <mesh position={[0, 0.91, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.3, 20]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      </group>
      <group position={[10.9, 0, -7]}>
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.04, 0.07, 6, 6]} />
          <meshStandardMaterial color="#6b7280" metalness={0.7} />
        </mesh>
        <mesh position={[0, 6.05, 0]}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial ref={blink} color="#300" emissive="#ef4444" toneMapped={false} />
        </mesh>
      </group>
      {/* water tank */}
      <group position={[10.6, 0, -1.9]}>
        {[[-0.65, -0.65], [0.65, -0.65], [-0.65, 0.65], [0.65, 0.65]].map(([x, z], i) => (
          <B key={i} p={[x, 0, z]} s={[0.1, 1.2, 0.1]} c="#44403c" />
        ))}
        <mesh position={[0, 2.0, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.9, 1.6, 24]} />
          <meshStandardMaterial color="#78716c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.98, 0]}>
          <coneGeometry args={[0.95, 0.36, 24]} />
          <meshStandardMaterial color="#57534e" />
        </mesh>
      </group>

      {/* hot tub + sun loungers + umbrella */}
      <HotTub />
      {[4.8, 6.2].map((x) => (
        <group key={x} position={[x, 0, 5.9]}>
          <B p={[0, 0.25, 0.2]} s={[0.7, 0.08, 1.4]} c="#e7e5e4" r={0.03} />
          <B p={[0, 0.3, -0.55]} s={[0.7, 0.08, 0.6]} c="#e7e5e4" r={0.03} rot={[0.6, 0, 0]} />
          <B p={[0, 0.33, 0.3]} s={[0.55, 0.02, 0.9]} c={x < 5 ? "#38bdf8" : "#fb7185"} shadow={false} />
          <B p={[0, 0, 0.2]} s={[0.6, 0.25, 0.06]} c="#78716c" />
        </group>
      ))}
      <group position={[5.5, 0, 4.4]}>
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 2.2, 6]} />
          <meshStandardMaterial color="#e7e5e4" />
        </mesh>
        <mesh position={[0, 2.15, 0]}>
          <coneGeometry args={[1.2, 0.4, 8, 1, true]} />
          <meshStandardMaterial color="#f97316" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* planters along the south parapet */}
      <group>
        <B p={[-6, 0, 7.4]} s={[3.2, 0.55, 0.6]} c="#57534e" r={0.03} />
        {[-7.2, -6.4, -5.6, -4.8].map((x, i) => (
          <group key={x} position={[x, 0.55, 7.4]}>
            <mesh position={[0, 0.25 + (i % 2) * 0.1, 0]}>
              <icosahedronGeometry args={[0.28 + (i % 2) * 0.06, 0]} />
              <meshStandardMaterial color={i % 2 ? "#4a9a63" : "#2f7349"} flatShading />
            </mesh>
            {i % 2 === 0 && (
              <mesh position={[0.1, 0.55, 0]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#f472b6" />
              </mesh>
            )}
          </group>
        ))}
      </group>
      <Plant x={3.4} z={-7.3} s={1.2} />
      <Plant x={11.3} z={2.2} s={1.0} kind={1} />
      <Sparkles count={40} scale={[22, 2.5, 14]} position={[0, 1.4, 0]} size={2.2} speed={0.25} color="#fde68a" opacity={0.6} />
    </group>
  );
}
