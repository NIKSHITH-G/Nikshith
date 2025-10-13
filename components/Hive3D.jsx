"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

/* Tool list */
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

const COORDS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

/* --------- Compute Node + Connection Positions ---------- */
function computePositions({ radius = 0.65, spacing = 0.25, scale = 1 }) {
  const nodes = TOOLS.slice(0, 9).map((t, i) => {
    const [col, row] = COORDS[i];
    const horiz = radius * 2.0 + spacing;
    const vert = Math.sqrt(3) * radius * 0.5 + spacing;
    const x = (col * horiz) * 1.1;
    const y = (row * vert * 1.9);
    const z = (Math.random() - 0.5) * 0.08;
    return { ...t, x: x * scale, y: y * scale, z, r: radius * scale };
  });

  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < radius * 4.2) edges.push({ aIdx: i, bIdx: j });
    }
  }
  return { nodes, edges };
}

/* --------- Curved Connectors ---------- */
function makeConnectorCurve(a, b) {
  const mid = new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, 0.05);
  return new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(a.x, a.y, 0),
    mid,
    new THREE.Vector3(b.x, b.y, 0)
  );
}

/* --------- Floating Particles ---------- */
function FloatingParticles() {
  const group = useRef();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 80; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 2,
        ],
        size: Math.random() * 0.015 + 0.005,
      });
    }
    return temp;
  }, []);

  useFrame(() => {
    group.current.rotation.y += 0.0008;
  });

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshBasicMaterial
            color={"#a855f7"}
            transparent
            opacity={Math.random() * 0.5 + 0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/* --------- Node (Hex Plate) ---------- */
function HexNode({ node, idx, hoveredId, setHoveredId }) {
  const meshRef = useRef();
  const offset = useMemo(() => Math.random() * 1000, []);
  const isHovered = hoveredId === node.id;

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.3 + offset;
    if (!meshRef.current) return;
    meshRef.current.position.z = Math.sin(t + idx) * 0.12;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[node.x, node.y, node.z]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredId(node.id); }}
        onPointerOut={(e) => { e.stopPropagation(); setHoveredId(null); }}
      >
        <cylinderGeometry args={[node.r, node.r, 0.04, 6]} />
        <meshStandardMaterial
          color={node.color}
          emissive={isHovered ? node.color : new THREE.Color(node.color).multiplyScalar(0.5)}
          emissiveIntensity={isHovered ? 2 : 0.6}
          transparent
          opacity={0.22}
          roughness={0.05}
          metalness={1}
          side={THREE.DoubleSide}
        />
        <Edges threshold={15} color={isHovered ? node.color : "#444"} />
      </mesh>

      {isHovered && (
        <Html distanceFactor={6} style={{ pointerEvents: "none", transform: "translateY(-25px)" }}>
          <div style={{
            padding: "8px 12px",
            background: "linear-gradient(180deg, rgba(30,16,50,0.9), rgba(14,10,20,0.75))",
            color: "#e9eef7",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 10px 30px rgba(8,6,12,0.6)",
            fontSize: 13,
            fontWeight: 700,
            textAlign: "center",
            backdropFilter: "blur(6px)",
          }}>
            <div>{node.name}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#bfc8d6", marginTop: 6 }}>{node.caption}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* --------- Connectors ---------- */
function ConnectorLine({ a, b }) {
  const curve = useMemo(() => makeConnectorCurve(a, b), [a, b]);
  const tubeGeometry = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.01, 8, false), [curve]);
  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color={"#a855f7"} transparent opacity={0.25} />
      </mesh>
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color={"#6be7ff"} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

/* --------- Main Hive Scene ---------- */
function HiveScene() {
  const { nodes, edges } = useMemo(() => computePositions({ radius: 0.65, spacing: 0.25, scale: 1 }), []);
  const [hoveredId, setHoveredId] = useState(null);
  const groupRef = useRef();
  const pulseRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.6;
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(t) * 0.2;
    if (pulseRef.current) {
      const s = Math.sin(t * 3) * 0.3 + 1.2;
      pulseRef.current.scale.set(s, s, s);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 6]} intensity={0.25} color={0xa855f7} />
      <pointLight position={[2, -3, 5]} intensity={0.2} color={0x38bdf8} />

      {/* Group */}
      <group ref={groupRef} scale={[1.2, 1.2, 1.2]}>
        {edges.map((edge, i) => {
          const a = nodes[edge.aIdx];
          const b = nodes[edge.bIdx];
          return <ConnectorLine key={`c-${i}`} a={a} b={b} />;
        })}
        {nodes.map((node, idx) => (
          <HexNode key={node.id} node={node} idx={idx} hoveredId={hoveredId} setHoveredId={setHoveredId} />
        ))}
        <FloatingParticles />
      </group>

      {/* Central Pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial
          emissive="#a855f7"
          emissiveIntensity={1.8}
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>

      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
}

/* --------- Exported Component ---------- */
export default function Hive3D({ className = "" }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ touchAction: "none" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ antialias: true }}>
        <color attach="background" args={["#0b0014"]} />
        <fog attach="fog" args={["#0b0014", 6, 14]} />
        <HiveScene />
        <EffectComposer>
          <Bloom intensity={1.3} luminanceThreshold={0.15} luminanceSmoothing={0.25} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
