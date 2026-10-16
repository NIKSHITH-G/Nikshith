"use client";

// The photo booth's own little 3D set: the studio character (plus Pixel) posing
// in front of a backdrop. The booth photographs this scene, so visitors never
// have to give camera access.

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

function Part({ p, s, c, r = 0.04, rot }) {
  return (
    <RoundedBox args={s} radius={Math.min(r, Math.min(...s) / 2 - 0.002)} smoothness={3} position={p} rotation={rot}>
      <meshStandardMaterial color={c} roughness={0.7} />
    </RoundedBox>
  );
}

// Each pose sets arm rotations (z = out to the side, x = forward), head tilt and a hop.
export const POSES = {
  // left arm goes out with negative z, right arm with positive z
  idle: { lz: -0.1, rz: 0.1, lx: 0, rx: 0, head: 0, tilt: 0, hop: 0, turn: 0 },
  wave: { lz: -0.12, rz: 2.5, lx: 0, rx: 0, head: 0.15, tilt: 0.12, hop: 0, turn: 0.15, wiggle: true },
  peace: { lz: -0.1, rz: 2.0, lx: 0, rx: -0.5, head: -0.2, tilt: -0.18, hop: 0, turn: -0.25 },
  jump: { lz: -2.5, rz: 2.5, lx: 0, rx: 0, head: 0, tilt: 0, hop: 0.45, turn: 0 },
  hug: { lz: -0.4, rz: 0.4, lx: -0.9, rx: -0.9, head: 0.35, tilt: 0.25, hop: 0, turn: 0.4 },
  flex: { lz: -1.5, rz: 1.5, lx: 0, rx: 0, head: 0, tilt: 0, hop: 0, turn: 0, flex: true },
};

function Avatar({ look, poseRef }) {
  const root = useRef();
  const armL = useRef();
  const armR = useRef();
  const foreL = useRef();
  const foreR = useRef();
  const head = useRef();
  useFrame(({ clock }, dt) => {
    const p = POSES[poseRef.current] ?? POSES.idle;
    const k = 1 - Math.exp(-dt * 12);
    const t = clock.elapsedTime;
    const lerp = (obj, key, v) => obj && (obj[key] += (v - obj[key]) * k);
    lerp(armL.current?.rotation, "z", p.lz);
    lerp(armR.current?.rotation, "z", p.rz + (p.wiggle ? Math.sin(t * 10) * 0.3 : 0));
    lerp(armL.current?.rotation, "x", p.lx);
    lerp(armR.current?.rotation, "x", p.rx);
    lerp(foreL.current?.rotation, "z", p.flex ? -1.8 : 0);
    lerp(foreR.current?.rotation, "z", p.flex ? 1.8 : 0);
    lerp(head.current?.rotation, "y", p.head);
    lerp(head.current?.rotation, "z", p.tilt);
    lerp(root.current?.position, "y", p.hop);
    lerp(root.current?.rotation, "y", p.turn);
  });
  const skin = look.skin;
  const top = look.top;
  return (
    <group ref={root}>
      {/* legs */}
      {[-0.11, 0.11].map((x) => (
        <group key={x} position={[x, 0.62, 0]}>
          <Part p={[0, -0.28, 0]} s={[0.17, 0.56, 0.2]} c="#2b3150" />
          <Part p={[0, -0.585, 0.04]} s={[0.19, 0.09, 0.3]} c="#f5f5f5" r={0.03} />
        </group>
      ))}
      <Part p={[0, 0.93, 0]} s={[0.52, 0.64, 0.32]} c={top} r={0.08} />
      <Part p={[0, 0.82, 0.15]} s={[0.3, 0.16, 0.04]} c={top} r={0.02} />
      {/* arms pivot at the shoulder */}
      <group ref={armL} position={[-0.33, 1.18, 0]}>
        <Part p={[0, -0.14, 0]} s={[0.14, 0.3, 0.18]} c={top} r={0.06} />
        <group ref={foreL} position={[0, -0.28, 0]}>
          <Part p={[0, -0.13, 0]} s={[0.13, 0.28, 0.17]} c={top} r={0.06} />
          <Part p={[0, -0.32, 0]} s={[0.12, 0.11, 0.14]} c={skin} r={0.04} />
        </group>
      </group>
      <group ref={armR} position={[0.33, 1.18, 0]}>
        <Part p={[0, -0.14, 0]} s={[0.14, 0.3, 0.18]} c={top} r={0.06} />
        <group ref={foreR} position={[0, -0.28, 0]}>
          <Part p={[0, -0.13, 0]} s={[0.13, 0.28, 0.17]} c={top} r={0.06} />
          <Part p={[0, -0.32, 0]} s={[0.12, 0.11, 0.14]} c={skin} r={0.04} />
        </group>
      </group>
      <group ref={head} position={[0, 1.27, 0]}>
        <Part p={[0, 0.2, 0]} s={[0.42, 0.42, 0.4]} c={skin} r={0.09} />
        <Part p={[0, 0.43, -0.02]} s={[0.46, 0.13, 0.44]} c="#1a1410" r={0.05} />
        <Part p={[0, 0.3, -0.19]} s={[0.46, 0.3, 0.08]} c="#1a1410" r={0.03} />
        <Part p={[0.12, 0.37, 0.18]} s={[0.2, 0.08, 0.07]} c="#1a1410" r={0.03} />
        {look.prop === "shades" ? (
          <>
            <Part p={[-0.09, 0.22, 0.205]} s={[0.15, 0.09, 0.02]} c="#0a0a0a" r={0.015} />
            <Part p={[0.09, 0.22, 0.205]} s={[0.15, 0.09, 0.02]} c="#0a0a0a" r={0.015} />
            <Part p={[0, 0.24, 0.205]} s={[0.06, 0.02, 0.02]} c="#0a0a0a" r={0.005} />
          </>
        ) : (
          <>
            <Part p={[-0.09, 0.22, 0.2]} s={[0.055, 0.07, 0.02]} c="#111" r={0.009} />
            <Part p={[0.09, 0.22, 0.2]} s={[0.055, 0.07, 0.02]} c="#111" r={0.009} />
          </>
        )}
        {/* a smile */}
        <Part p={[0, 0.09, 0.2]} s={[0.12, 0.025, 0.02]} c="#7c2d12" r={0.008} />
        {look.prop === "party" && (
          <mesh position={[0.05, 0.66, 0]} rotation-z={-0.2}>
            <coneGeometry args={[0.13, 0.32, 16]} />
            <meshStandardMaterial color="#ec4899" />
          </mesh>
        )}
        {look.prop === "crown" && (
          <group position={[0, 0.53, 0]}>
            <mesh>
              <cylinderGeometry args={[0.17, 0.17, 0.1, 6, 1, true]} />
              <meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.25} side={2} />
            </mesh>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <mesh key={i} position={[Math.sin((i * Math.PI) / 3) * 0.17, 0.08, Math.cos((i * Math.PI) / 3) * 0.17]}>
                <coneGeometry args={[0.035, 0.08, 4]} />
                <meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.25} />
              </mesh>
            ))}
          </group>
        )}
        {(look.prop === "headphones" || !look.prop) && (
          <>
            <Part p={[0, 0.5, 0]} s={[0.52, 0.05, 0.08]} c="#e5e7eb" r={0.02} />
            <Part p={[-0.24, 0.22, 0]} s={[0.07, 0.2, 0.17]} c="#e5e7eb" r={0.03} />
            <Part p={[0.24, 0.22, 0]} s={[0.07, 0.2, 0.17]} c="#e5e7eb" r={0.03} />
          </>
        )}
      </group>
    </group>
  );
}

function Pixel({ poseRef }) {
  const root = useRef();
  const tail = useRef();
  useFrame(({ clock }, dt) => {
    const pose = poseRef.current;
    const k = 1 - Math.exp(-dt * 10);
    if (root.current) {
      const hop = pose === "jump" ? 0.35 : 0;
      root.current.position.y += (hop - root.current.position.y) * k;
    }
    if (tail.current) tail.current.rotation.z = Math.sin(clock.elapsedTime * 16) * 0.6;
  });
  const fur = "#c8935a";
  return (
    <group ref={root} position={[0.75, 0, 0.35]} rotation-y={-0.5}>
      <Part p={[0, 0.38, 0]} s={[0.3, 0.28, 0.62]} c={fur} />
      <Part p={[0, 0.5, 0.27]} s={[0.27, 0.06, 0.08]} c="#dc2626" />
      <group position={[0, 0.62, 0.36]} rotation-x={-0.25}>
        <Part p={[0, 0, 0]} s={[0.26, 0.24, 0.26]} c={fur} />
        <Part p={[0, -0.05, 0.17]} s={[0.15, 0.12, 0.14]} c="#f5e6d3" />
        <Part p={[0, -0.02, 0.25]} s={[0.06, 0.05, 0.03]} c="#111" r={0.01} />
        <Part p={[-0.07, 0.05, 0.135]} s={[0.04, 0.05, 0.01]} c="#111" r={0.004} />
        <Part p={[0.07, 0.05, 0.135]} s={[0.04, 0.05, 0.01]} c="#111" r={0.004} />
        <Part p={[-0.14, 0.02, -0.02]} s={[0.05, 0.16, 0.12]} c="#8b5a2b" r={0.02} />
        <Part p={[0.14, 0.02, -0.02]} s={[0.05, 0.16, 0.12]} c="#8b5a2b" r={0.02} />
        <Part p={[0, -0.11, 0.2]} s={[0.07, 0.03, 0.06]} c="#f472b6" r={0.01} />
      </group>
      {[[-0.1, 0.2], [0.1, 0.2], [-0.1, -0.2], [0.1, -0.2]].map(([x, z], i) => (
        <Part key={i} p={[x, 0.13, z]} s={[0.08, 0.26, 0.08]} c={fur} r={0.03} />
      ))}
      <group ref={tail} position={[0, 0.48, -0.32]}>
        <Part p={[0, 0.1, -0.03]} s={[0.06, 0.22, 0.06]} c={fur} r={0.025} />
      </group>
    </group>
  );
}

export default function BoothScene({ look, poseRef, onReady }) {
  return (
    <Canvas
      // keeps the last frame readable so the booth can "take" the photo
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      // measure layout size, not the on-screen size mid-zoom-animation
      resize={{ offsetSize: true }}
      dpr={[1, 2]}
      camera={{ fov: 30, position: [0, 1.25, 5.2] }}
      onCreated={({ gl, camera }) => {
        camera.lookAt(0.2, 0.95, 0);
        onReady?.(gl.domElement);
      }}
    >
      <color attach="background" args={[look.bg[0]]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[2.5, 4, 3]} intensity={2.2} />
      <directionalLight position={[-3, 2, 2]} intensity={0.8} color={look.bg[1]} />
      {/* the backdrop: a curved paper sweep in two tones */}
      <mesh position={[0, 1.6, -1.2]}>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color={look.bg[0]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial color={look.bg[1]} />
      </mesh>
      <Avatar look={look} poseRef={poseRef} />
      {look.dog && <Pixel poseRef={poseRef} />}
    </Canvas>
  );
}
