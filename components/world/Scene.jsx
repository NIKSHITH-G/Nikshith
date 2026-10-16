"use client";

import { lazy, Suspense, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import Apartment from "./Apartment";
import { Player, Cat } from "./Characters";
import { Nikshith, ACTIVITIES } from "./Nikshith";

// clicking Nikshith from across the room walks you to a free spot beside him
const ACTIVITY_VISIT = () => (ACTIVITIES.find((a) => a.id === runtime.npc.activity) ?? ACTIVITIES[0]).visit;
import { POWER, activeItems, floorById } from "./layout";
// the other floors are only downloaded when you first ride the elevator to them
const GymFloor = lazy(() => import("./floors").then((m) => ({ default: m.GymFloor })));
const GamesFloor = lazy(() => import("./floors").then((m) => ({ default: m.GamesFloor })));
// post-processing is polish, not structure — it streams in after the first frame
const Effects = lazy(() => import("./Effects"));
const Rooftop = lazy(() => import("./floors").then((m) => ({ default: m.Rooftop })));
import { runtime, getState, setState, walkTo, interact, now, useWorld } from "./store";
import { power } from "./power";
import * as sfx from "./audio";

const focus = new THREE.Vector3(0, 0, 0.5);
const camGoal = new THREE.Vector3();
const lookGoal = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const corner = new THREE.Vector3();
const sRight = new THREE.Vector3();
const sUp = new THREE.Vector3();
const sN = new THREE.Vector3();
const damp = (lambda, dt) => 1 - Math.exp(-lambda * dt);

function CameraRig() {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, 0.5));
  const lead = useRef(new THREE.Vector3());

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const portrait = size.width / size.height < 0.9;
    const s = getState();
    const t = clock.elapsedTime;
    const sinceEnter = runtime.powerStart ? now() - runtime.powerStart : 0;
    let lambda = 3;

    const establishing = s.phase === "boot" || s.phase === "title" || (s.phase === "entering" && sinceEnter < 2.7);
    if (establishing) {
      // wide shot of the whole model, drifting slowly; pushes in a touch as the lights come on
      const push = s.phase === "entering" ? Math.min(1, sinceEnter / 2.7) : 0;
      const r = (portrait ? 1.7 : 1) * (1 - push * 0.12);
      const sway = Math.sin(t * 0.07) * 0.35;
      camGoal.set(Math.sin(sway) * 24 * r, 19 * r, Math.cos(sway) * 21 * r);
      lookGoal.set(portrait ? 0 : -2.5 * (1 - push), 0, 0.5);
      lambda = 1.2;
    } else if (s.panel?.id === "ask") {
      // a conversation: over the visitor's shoulder, Nikshith framed above the dialogue box
      const n = runtime.npc;
      const dx = runtime.x - n.x;
      const dz = runtime.z - n.z;
      const d = Math.hypot(dx, dz) || 1;
      const ux = dx / d;
      const uz = dz / d;
      const side = portrait ? 0 : 0.9;
      const back = portrait ? 5.2 : 4.4;
      camGoal.set(n.x + ux * back - uz * side, 2.6, n.z + uz * back + ux * side);
      // aim low so he stands in the top half, clear of the dialogue box
      lookGoal.set(n.x - uz * side * 0.3, portrait ? 0.2 : 0.45, n.z + ux * side * 0.3);
      lambda = 3;
    } else if (s.panel?.from) {
      const it = activeItems().find((i) => i.id === s.panel.from);
      if (it.surface && !portrait) {
        // screens: square-on to the surface, close enough that it fills most of the view
        const { c, n, w, h } = it.surface;
        const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const fill = 0.84;
        const d = Math.max(h / 2 / tanHalf, w / 2 / (tanHalf * camera.aspect)) / fill;
        lookGoal.fromArray(c);
        camGoal.fromArray(n).multiplyScalar(d).add(lookGoal);
      } else {
        // everything else: a cinematic three-quarter shot (the overlay sits on top)
        camGoal.fromArray(it.shot[0]);
        lookGoal.fromArray(it.shot[1]);
        if (portrait) camGoal.sub(lookGoal).multiplyScalar(1.5).add(lookGoal);
      }
      lambda = 3.4;
    } else {
      // follow cam: lead a little in the direction you're walking
      const v = runtime.speed;
      lead.current.lerp(new THREE.Vector3(Math.sin(runtime.heading) * v * 0.28, 0, Math.cos(runtime.heading) * v * 0.28), damp(2, dt));
      // keep the framing over the flat rather than the void around it
      focus.set(
        THREE.MathUtils.clamp(runtime.x + lead.current.x, portrait ? -9.6 : -6.5, portrait ? 9.6 : 6.5),
        0.7,
        THREE.MathUtils.clamp(runtime.z + lead.current.z, portrait ? -6 : -4.4, portrait ? 5.6 : 4.2)
      );
      const k = (portrait ? 1.6 : 1) * runtime.zoom * (1 + Math.min(v, 4) * 0.015);
      const h = 11.5 * k;
      camGoal.set(focus.x + Math.sin(runtime.yaw) * h, focus.y + 12 * k, focus.z + Math.cos(runtime.yaw) * h);
      lookGoal.copy(focus);
      lambda = s.phase === "entering" ? 1.6 : 4;
    }

    if (window.__reduceMotion) lambda = 30;
    camera.position.lerp(camGoal, damp(lambda, dt));
    look.current.lerp(lookGoal, damp(lambda * 1.2, dt));
    camera.lookAt(look.current);
  });
  return null;
}

function Marker({ it }) {
  const ref = useRef();
  const mat = useRef();
  const ring = useRef();
  const visited = useWorld((s) => s.visited.includes(it.panel));

  useFrame(({ clock }) => {
    const s = getState();
    const near = s.nearby === it.id;
    const t = clock.elapsedTime;
    const on = power(POWER.living);
    if (ref.current) {
      ref.current.position.y = it.h + 0.38 + Math.sin(t * 2.2 + it.pos[0]) * 0.08;
      ref.current.rotation.y = t * 1.4;
      // markers step aside while a view is open so they don't poke through it
      const sc = s.panel ? 0 : (near ? 1.4 : visited ? 0.7 : 1) * on;
      ref.current.scale.setScalar(ref.current.scale.x + (sc - ref.current.scale.x) * 0.2);
    }
    if (mat.current) {
      mat.current.color.set(near ? "#86efac" : visited ? "#64748b" : "#c4b5fd");
      mat.current.emissive.set(near ? "#22c55e" : visited ? "#334155" : "#8b5cf6");
    }
    if (ring.current) {
      const target = near && !s.panel ? 1 : 0;
      ring.current.material.opacity += (target * 0.55 - ring.current.material.opacity) * 0.15;
      ring.current.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
    }
  });

  const onClick = (e) => {
    e.stopPropagation();
    if (runtime.justDragged) return;
    const s = getState();
    if (s.phase !== "playing" || s.panel || s.map) return;
    if (s.nearby === it.id) interact(it.id);
    else walkTo(it.stand[0], it.stand[1], it.id);
  };

  return (
    <group>
      <mesh ref={ref} position={[it.pos[0], it.h + 0.38, it.pos[1]]} scale={0}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial ref={mat} color="#c4b5fd" emissive="#8b5cf6" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[it.stand[0], 0.02, it.stand[1]]}>
        <ringGeometry args={[0.42, 0.5, 40]} />
        <meshBasicMaterial color="#86efac" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* invisible hit box over the whole object so it's easy to click */}
      <mesh
        position={[it.pos[0], it.h / 2, it.pos[1]]}
        onClick={onClick}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
          if (getState().phase === "playing" && !getState().panel) sfx.hover();
        }}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <boxGeometry args={[1.4, it.h, 1.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Projects the focused screen's corners to pixels every frame and pins the
// HTML overlay (runtime.surfaceEl) exactly over it.
function SurfaceProjector() {
  const { camera, size } = useThree();
  useFrame(() => {
    const el = runtime.surfaceEl;
    if (!el) return;
    const s = getState();
    const it = s.panel?.from && activeItems().find((i) => i.id === s.panel.from);
    if (!it?.surface) return;
    const { c, n, w, h } = it.surface;
    sN.fromArray(n);
    sRight.crossVectors(UP, sN).normalize();
    sUp.crossVectors(sN, sRight).normalize();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      corner.fromArray(c).addScaledVector(sRight, (a * w) / 2).addScaledVector(sUp, (b * h) / 2).project(camera);
      const px = (corner.x * 0.5 + 0.5) * size.width;
      const py = (-corner.y * 0.5 + 0.5) * size.height;
      minX = Math.min(minX, px); maxX = Math.max(maxX, px);
      minY = Math.min(minY, py); maxY = Math.max(maxY, py);
    }
    el.style.setProperty("--sx", `${minX}px`);
    el.style.setProperty("--sy", `${minY}px`);
    el.style.setProperty("--sw", `${maxX - minX}px`);
    el.style.setProperty("--sh", `${maxY - minY}px`);
    el.style.setProperty("--sk", String((maxX - minX) / Number(el.dataset.base || 1000)));
  });
  return null;
}

// Floating name tag over the thing you're standing next to.
function NearbyLabel({ touch }) {
  const nearby = useWorld((s) => s.nearby);
  const panel = useWorld((s) => s.panel);
  const phase = useWorld((s) => s.phase);
  if (!nearby || panel || phase !== "playing") return null;
  const pets = {
    cat: { name: "Byte", label: "Pet the cat", pos: [runtime.cat.x, runtime.cat.z], h: 0.4 },
    dog: { name: "Pixel", label: "Pet the dog", pos: [runtime.dog.x, runtime.dog.z], h: 0.6 },
    nikshith: { name: "Nikshith", label: "Talk to Nikshith", pos: [runtime.npc.x, runtime.npc.z], h: 1.85 },
  };
  const it = pets[nearby] ?? activeItems().find((i) => i.id === nearby);
  if (!it) return null;
  return (
    <Html position={[it.pos[0], it.h + 0.85, it.pos[1]]} center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <div key={nearby} className="label-pop whitespace-nowrap rounded-full border border-white/15 bg-[#0d0f1a]/85 px-3 py-1.5 text-center shadow-lg backdrop-blur-md">
        <div className="font-display text-[15px] italic leading-none text-white">{it.name}</div>
        <div className="mt-1 font-mono text-[10px] text-emerald-300/90">{touch ? "tap to open" : "press E"}</div>
      </div>
    </Html>
  );
}

// Works out what's within reach each frame and tells the HUD when it changes.
function Proximity() {
  useFrame(() => {
    let best = null;
    let bestD = Infinity;
    for (const it of activeItems()) {
      const dStand = Math.hypot(runtime.x - it.stand[0], runtime.z - it.stand[1]);
      const dObj = Math.hypot(runtime.x - it.pos[0], runtime.z - it.pos[1]);
      const d = Math.min(dStand + 0.3, dObj);
      if ((dStand < 1.3 || dObj < 1.9) && d < bestD) {
        best = it.id;
        bestD = d;
      }
    }
    const floor = getState().floor;
    // Nikshith beats furniture when you're standing by him
    if (floor === "studio") {
      const dN = Math.hypot(runtime.x - runtime.npc.x, runtime.z - runtime.npc.z);
      if (dN < 1.7 && (!best || dN < bestD + 0.4)) best = "nikshith";
    }
    if (!best && floor === "studio" && Math.hypot(runtime.x - runtime.cat.x, runtime.z - runtime.cat.z) < 1.3) best = "cat";
    if (!best && floor === "gym" && Math.hypot(runtime.x - runtime.dog.x, runtime.z - runtime.dog.z) < 1.4) best = "dog";
    if (getState().nearby !== best) setState({ nearby: best });
  });
  return null;
}

function FloorClick() {
  const onClick = (e) => {
    if (runtime.justDragged) return;
    const s = getState();
    if (s.phase !== "playing" || s.panel || s.map) return;
    walkTo(e.point.x, e.point.z);
  };
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0]} onClick={onClick}>
      <planeGeometry args={[24, 16]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

// Moonlight is always on; the warm fill rises as the lights come on.
function Lighting() {
  const hemi = useRef();
  useFrame(() => {
    const p = power(POWER.living);
    if (hemi.current) hemi.current.intensity = 0.55 + p * 0.35;
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#8189e0", "#2a1e2e", 0.55]} />
      <ambientLight intensity={0.18} color="#a5b4fc" />
      <directionalLight
        position={[9, 16, -6]}
        intensity={1.1}
        color="#c7d2fe"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={45}
      />
      {/* soft rim light from the camera side so silhouettes read */}
      <directionalLight position={[-6, 8, 14]} intensity={0.35} color="#ffd9b0" />
    </>
  );
}

export default function Scene({ touch }) {
  const floor = useWorld((s) => s.floor);
  const items = floorById(floor).items;
  const roof = floor === "roof";
  return (
    <>
      <color attach="background" args={[roof ? "#060818" : "#0b0d16"]} />
      <fog attach="fog" args={roof ? ["#0a0d24", 45, 140] : ["#0b0d16", 30, 70]} />
      <PerformanceMonitor
        onDecline={() => {
          const q = getState().quality;
          setState({ quality: q === "high" ? "medium" : "low" });
        }}
      />
      <Lighting />
      {floor === "studio" && (
        <>
          <Apartment />
          <group
            onClick={(e) => {
              e.stopPropagation();
              const s = getState();
              if (s.phase === "playing" && !s.panel && !runtime.justDragged) interact("cat");
            }}
          >
            <Cat />
          </group>
          <group
            onClick={(e) => {
              e.stopPropagation();
              const s = getState();
              if (s.phase !== "playing" || s.panel || runtime.justDragged) return;
              if (s.nearby === "nikshith") interact("nikshith");
              else walkTo(...ACTIVITY_VISIT(), null);
            }}
          >
            <Nikshith />
          </group>
        </>
      )}
      <Suspense fallback={null}>
        {floor === "gym" && <GymFloor />}
        {floor === "games" && <GamesFloor />}
        {roof && <Rooftop />}
      </Suspense>
      <Player />
      {items.map((it) => (
        <Marker key={`${floor}-${it.id}`} it={it} />
      ))}
      <NearbyLabel touch={touch} />
      <SurfaceProjector />
      <FloorClick />
      <Proximity />
      <CameraRig />
      <Suspense fallback={null}>
        <Effects />
      </Suspense>
    </>
  );
}
