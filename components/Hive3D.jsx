// hive3d.jsx
"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

/* Tools (labels/colors) */
const TOOLS = [
  { id: "react", name: "React", color: "#61dafb", caption: "UI" },
  { id: "next", name: "Next.js", color: "#ffffff", caption: "SSR / SSG" },
  { id: "tailwind", name: "Tailwind", color: "#38bdf8", caption: "Styling" },
  { id: "node", name: "Node.js", color: "#22c55e", caption: "Backend" },
  { id: "figma", name: "Figma", color: "#a855f7", caption: "Design" },
  { id: "github", name: "GitHub", color: "#c9d1d9", caption: "Versioning" },
  { id: "vscode", name: "VS Code", color: "#0078d7", caption: "IDE" },
  { id: "docker", name: "Docker", color: "#0db7ed", caption: "Containers" },
  { id: "aws", name: "AWS", color: "#f59e0b", caption: "Cloud" },
  { id: "vercel", name: "Vercel", color: "#ffffff", caption: "Deploy" },
  { id: "mongodb", name: "MongoDB", color: "#10b981", caption: "Database" },
  { id: "notion", name: "Notion", color: "#ffffff", caption: "Docs" },
  { id: "chatgpt", name: "ChatGPT", color: "#00a67e", caption: "AI" },
];

/* ---------- helpers ---------- */
function fibonacciSpherePoints(samples = 48, radius = 2.0) {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    pts.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return pts;
}
function projectToTangent(vec, normal) {
  const n = normal.clone().normalize();
  return vec.clone().sub(n.multiplyScalar(vec.dot(n)));
}
function relaxSpherePoints(points, radius = 2.0, iters = 120, minSeparation = 1.15) {
  const pts = points.map((p) => p.clone());
  const n = pts.length;
  const strength = 0.08;
  for (let iter = 0; iter < iters; iter++) {
    for (let i = 0; i < n; i++) {
      const jitter = new THREE.Vector3((Math.random() - 0.5) * 1e-5, (Math.random() - 0.5) * 1e-5, (Math.random() - 0.5) * 1e-5);
      pts[i].add(jitter);
    }
    for (let i = 0; i < n; i++) {
      let shift = new THREE.Vector3(0, 0, 0);
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const a = pts[i], b = pts[j];
        const diff = a.clone().sub(b);
        const dist = diff.length();
        if (dist === 0) continue;
        if (dist < minSeparation) {
          const push = diff.normalize().multiplyScalar((minSeparation - dist) / minSeparation);
          shift.add(push);
        }
      }
      if (shift.lengthSq() > 0) {
        const normal = pts[i].clone().normalize();
        const tangentShift = projectToTangent(shift, normal).multiplyScalar(strength);
        pts[i].add(tangentShift);
        pts[i].setLength(radius);
      }
    }
  }
  for (let i = 0; i < n; i++) pts[i].setLength(radius);
  return pts;
}
function alignYToNormal(normal) {
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(up, normal.clone().normalize());
  return q;
}

/* ---------- Floating particles ---------- */
function FloatingParticles({ count = 60, radius = 3.6 }) {
  const group = useRef();
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      arr.push({
        pos: dir.multiplyScalar(radius * (0.86 + Math.random() * 0.4)),
        size: Math.random() * 0.01 + 0.004,
        opacity: Math.random() * 0.35 + 0.12,
      });
    }
    return arr;
  }, [count, radius]);

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y += 0.0009;
    group.current.rotation.x += 0.00018;
  });

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial transparent opacity={p.opacity} color={"#a855f7"} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- HexPlate (unchanged) ---------- */
function HexPlate({ idx, pos, radius, color = "#8b5cf6", hoveredId, setHoveredId }) {
  const meshRef = useRef();
  const normal = useMemo(() => pos.clone().normalize(), [pos]);
  const isHovered = hoveredId === idx;
  const plateRadius = 0.45;
  const plateThickness = 0.052;
  const outwardGap = 0.12;

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.quaternion.copy(alignYToNormal(normal));
    meshRef.current.position.copy(pos.clone().add(normal.clone().multiplyScalar(outwardGap)));
  }, [normal, pos]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 1.05 + idx * 0.08;
    const bob = Math.sin(t * 1.4) * 0.01;
    meshRef.current.position.copy(pos.clone().add(normal.clone().multiplyScalar(outwardGap + bob)));
    const s = isHovered ? 1.12 : 1.0;
    meshRef.current.scale.set(s, s, s * 0.98);
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredId(idx); }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredId(null); }}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[plateRadius, plateRadius, plateThickness, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={isHovered ? color : new THREE.Color(color).multiplyScalar(0.16)}
          emissiveIntensity={isHovered ? 1.4 : 0.42}
          transparent
          opacity={0.36}
          roughness={0.12}
          metalness={0.9}
          side={THREE.DoubleSide}
        />
        <Edges threshold={15} color={isHovered ? color : "#111"} />
      </mesh>

      {isHovered && (
        <Html distanceFactor={6} style={{ pointerEvents: "none", transform: "translateY(-12px)" }}>
          <div style={{
            padding: "6px 10px",
            background: "linear-gradient(180deg, rgba(30,16,50,0.96), rgba(12,8,18,0.8))",
            color: "#e9eef7",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 8px 28px rgba(8,6,12,0.6)",
            fontSize: 12,
            fontWeight: 700,
            textAlign: "center",
            backdropFilter: "blur(6px)",
            minWidth: 72
          }}>
            <div style={{ fontSize: 13 }}>{TOOLS[idx % TOOLS.length].name}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#bfc8d6", marginTop: 4 }}>
              {TOOLS[idx % TOOLS.length].caption}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ---------- New: Tube connectors ---------- */
function makeConnectorPath(a, b) {
  // Slight outward bulge for a pleasant curve: control point halfway, pushed outward by normal
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const out = mid.clone().normalize().multiplyScalar(0.25); // bulge amount
  mid.add(out);
  const curve = new THREE.CatmullRomCurve3([a.clone(), mid, b.clone()]);
  return curve;
}

function ConnectorsTubes({ nodePositions, threshold = 0.82 }) {
  const tubes = useMemo(() => {
    const list = [];
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        const a = nodePositions[i];
        const b = nodePositions[j];
        const d = a.distanceTo(b);
        if (d < threshold) {
          const curve = makeConnectorPath(a, b);
          // push a low-poly tube descriptor
          list.push({ curve, color: "#a78bfa", glow: "#7c3aed" });
        }
      }
    }
    return list;
  }, [nodePositions, threshold]);

  return (
    <group>
      {tubes.map((t, idx) => {
        // geometry: segments small for perf
        const tubeGeo = new THREE.TubeGeometry(t.curve, 12, 0.02, 6, false);
        const tubeGlowGeo = new THREE.TubeGeometry(t.curve, 12, 0.04, 6, false);
        return (
          <group key={idx}>
            <mesh geometry={tubeGlowGeo}>
              <meshBasicMaterial
                color={t.glow}
                transparent
                opacity={0.09}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            <mesh geometry={tubeGeo}>
              <meshStandardMaterial
                color={t.color}
                emissive={t.color}
                emissiveIntensity={0.9}
                metalness={0.2}
                roughness={0.1}
                transparent
                opacity={0.95}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ---------- Main scene ---------- */
function SphereHiveScene({ numNodes = 48 }) {
  const radius = 2.05;
  const base = useMemo(() => fibonacciSpherePoints(numNodes, radius), [numNodes, radius]);
  const plateRadius = 0.45;
  const minSeparation = 1.1 * plateRadius * 2.0;
  const nodePositions = useMemo(() => relaxSpherePoints(base, radius, 120, minSeparation), [base, radius]);

  const [hoveredId, setHoveredId] = useState(null);
  const groupRef = useRef();
  const pulseRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.28;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.55;
      groupRef.current.rotation.x = Math.sin(t * 0.12) * 0.035;
    }
    if (pulseRef.current) {
      const s = Math.sin(state.clock.getElapsedTime() * 2.6) * 0.16 + 1.04;
      pulseRef.current.scale.set(s, s, s);
    }
  });

  return (
    <>
      <hemisphereLight skyColor={0x3a3240} groundColor={0x06030a} intensity={0.42} />
      <ambientLight intensity={0.22} />
      <pointLight position={[0, 0, 6]} intensity={0.36} color={0xa855f7} />
      <pointLight position={[4, -3, 5]} intensity={0.12} color={0x38bdf8} />

      <group ref={groupRef}>
        {/* Tubular connectors */}
        <ConnectorsTubes nodePositions={nodePositions} threshold={0.82} />

        {/* Tiles */}
        {nodePositions.map((p, idx) => (
          <HexPlate
            key={idx}
            idx={idx}
            pos={p}
            radius={radius}
            color={TOOLS[idx % TOOLS.length].color}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        ))}

        <FloatingParticles count={60} radius={3.6} />
      </group>

      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshStandardMaterial
          emissive="#a855f7"
          emissiveIntensity={1.6}
          color="#ffffff"
          transparent
          opacity={0.98}
        />
      </mesh>

      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
}

/* ---------- Export ---------- */
export default function Hive3D({ className = "" }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ touchAction: "none" }}>
      <Canvas camera={{ position: [0, 0, 6.2], fov: 56 }} gl={{ antialias: true }}>
        <color attach="background" args={["#0b0014"]} />
        <fog attach="fog" args={["#0b0014", 4, 10]} />
        <SphereHiveScene numNodes={48} />
        <EffectComposer>
          <Bloom intensity={1.25} luminanceThreshold={0.12} luminanceSmoothing={0.25} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
