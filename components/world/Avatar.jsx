"use client";

// The shared blocky character: Nikshith and the visitor are built from the same
// parts, dressed differently. Each piece slots into the pivots the animators move
// (legs at y 0.62, arms at y 1.18, head at y 1.27), so walking, waving and typing
// keep working as before.

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines, RoundedBox } from "@react-three/drei";

const INK = "#0e0c18";

// one outlined, rounded block — the building piece for every character (pets too)
export function P({ p, s, c, r = 0.04, rough = 0.72, rot, line = true }) {
  return (
    <RoundedBox args={s} radius={Math.min(r, Math.min(...s) / 2 - 0.002)} smoothness={3} position={p} rotation={rot} castShadow>
      <meshStandardMaterial color={c} roughness={rough} />
      {line && <Outlines thickness={0.012} color={INK} />}
    </RoundedBox>
  );
}

export const OUTFITS = {
  nikshith: {
    skin: "#c89878", skinDark: "#b5845f", hair: "#1a1410", hairStyle: "curly",
    top: "#7c5cd6", topDark: "#6346bd", strings: "#ede9fe",
    pants: "#2b3150", shoes: "#f5f5f5", sole: "#d4d4d8", accent: "#a78bfa",
    headphones: { band: "#e5e7eb", cup: "#f4f4f5", pad: "#7c5cd6" },
  },
  visitor: {
    skin: "#c89878", skinDark: "#b5845f", hair: "#1a1410", hairStyle: "short",
    top: "#0f766e", topDark: "#0b5d57", strings: "#ccfbf1",
    pants: "#1e293b", shoes: "#f97316", sole: "#fafafa", accent: "#fde68a",
    cap: { crown: "#f59e0b", brim: "#d97706", logo: "#fff7ed" },
  },
};

/* ── head (child of the head pivot) ──────────────────────────────────── */

export function Head({ o }) {
  const eyes = useRef();
  const offset = useRef(Math.random() * 4);
  useFrame(({ clock }) => {
    // blink every few seconds
    const t = (clock.elapsedTime + offset.current) % 4.2;
    if (eyes.current) eyes.current.scale.y = t < 0.12 ? 0.15 : 1;
  });

  return (
    <group>
      <P p={[0, -0.01, 0]} s={[0.17, 0.1, 0.15]} c={o.skinDark} line={false} />
      <P p={[0, 0.25, 0]} s={[0.5, 0.48, 0.46]} c={o.skin} r={0.11} />
      {/* ears */}
      {[-1, 1].map((x) => <P key={x} p={[x * 0.255, 0.22, -0.01]} s={[0.06, 0.12, 0.09]} c={o.skin} r={0.025} />)}
      {/* eyes: white, pupil and a little shine */}
      <group ref={eyes} position={[0, 0.24, 0]}>
        {[-1, 1].map((x) => (
          <group key={x} position={[x * 0.11, 0, 0.232]}>
            <P p={[0, 0, 0]} s={[0.1, 0.1, 0.02]} c="#fafafa" r={0.02} line={false} />
            <P p={[x * -0.008, -0.006, 0.011]} s={[0.062, 0.078, 0.012]} c="#1c1410" r={0.015} line={false} />
            <P p={[x * -0.022, 0.018, 0.019]} s={[0.02, 0.02, 0.006]} c="#ffffff" r={0.005} line={false} />
          </group>
        ))}
      </group>
      {/* brows, nose, cheeks and a small smile */}
      {[-1, 1].map((x) => <P key={`b${x}`} p={[x * 0.11, 0.335, 0.236]} s={[0.11, 0.028, 0.014]} c={o.hair} r={0.008} line={false} rot={[0, 0, x * -0.08]} />)}
      <P p={[0, 0.19, 0.245]} s={[0.05, 0.055, 0.03]} c={o.skinDark} r={0.012} line={false} />
      {[-1, 1].map((x) => <P key={`c${x}`} p={[x * 0.165, 0.165, 0.232]} s={[0.07, 0.032, 0.008]} c="#e88a7a" r={0.008} line={false} />)}
      <P p={[0, 0.112, 0.234]} s={[0.07, 0.022, 0.01]} c="#6b2a1a" r={0.008} line={false} />
      {[-1, 1].map((x) => <P key={`m${x}`} p={[x * 0.043, 0.12, 0.234]} s={[0.03, 0.018, 0.01]} c="#6b2a1a" r={0.006} line={false} rot={[0, 0, x * 0.55]} />)}

      {o.hairStyle === "curly" ? <CurlyHair o={o} /> : <ShortHair o={o} />}
      {o.headphones && <Headphones h={o.headphones} />}
      {o.cap && <Cap c={o.cap} />}
    </group>
  );
}

// Nikshith's hair: dark and curly, with volume on top
const CURLS = [
  [-0.17, 0.58, -0.08, 0.17], [0.0, 0.6, -0.1, 0.18], [0.17, 0.58, -0.06, 0.17],
  [-0.1, 0.59, 0.09, 0.16], [0.1, 0.6, 0.1, 0.16], [-0.2, 0.55, 0.13, 0.13],
  [0.21, 0.55, 0.14, 0.13], [0.0, 0.57, 0.19, 0.12], [-0.08, 0.56, -0.2, 0.15], [0.12, 0.56, -0.2, 0.15],
];
function CurlyHair({ o }) {
  return (
    <group>
      <P p={[0, 0.47, -0.02]} s={[0.54, 0.14, 0.5]} c={o.hair} r={0.06} />
      <P p={[0, 0.3, -0.215]} s={[0.54, 0.38, 0.1]} c={o.hair} r={0.04} />
      {[-1, 1].map((x) => <P key={x} p={[x * 0.262, 0.37, -0.06]} s={[0.05, 0.22, 0.34]} c={o.hair} r={0.02} />)}
      {CURLS.map(([x, y, z, s], i) => <P key={i} p={[x, y, z]} s={[s, s * 0.85, s]} c={o.hair} r={s * 0.45} />)}
      {/* a fringe falling over the forehead */}
      <P p={[-0.1, 0.43, 0.225]} s={[0.2, 0.09, 0.07]} c={o.hair} r={0.035} rot={[0, 0, 0.15]} />
      <P p={[0.11, 0.445, 0.225]} s={[0.17, 0.07, 0.07]} c={o.hair} r={0.03} rot={[0, 0, -0.1]} />
    </group>
  );
}

// The visitor's hair, mostly under the cap
function ShortHair({ o }) {
  return (
    <group>
      <P p={[0, 0.36, -0.22]} s={[0.5, 0.2, 0.07]} c={o.hair} r={0.03} />
      {[-1, 1].map((x) => <P key={x} p={[x * 0.258, 0.37, -0.13]} s={[0.03, 0.1, 0.12]} c={o.hair} r={0.012} line={false} />)}
      <P p={[0.06, 0.435, 0.232]} s={[0.26, 0.04, 0.03]} c={o.hair} r={0.012} line={false} />
    </group>
  );
}

function Headphones({ h }) {
  return (
    <group>
      <P p={[0, 0.66, -0.02]} s={[0.4, 0.05, 0.09]} c={h.band} r={0.022} />
      {[-1, 1].map((x) => (
        <group key={x}>
          <P p={[x * 0.235, 0.62, -0.02]} s={[0.1, 0.05, 0.09]} c={h.band} r={0.022} rot={[0, 0, x * -0.6]} />
          <P p={[x * 0.285, 0.47, -0.02]} s={[0.05, 0.22, 0.08]} c={h.band} r={0.02} />
          <P p={[x * 0.3, 0.26, -0.02]} s={[0.09, 0.22, 0.2]} c={h.cup} r={0.045} />
          <P p={[x * 0.35, 0.26, -0.02]} s={[0.02, 0.12, 0.12]} c={h.pad} r={0.008} line={false} />
        </group>
      ))}
    </group>
  );
}

function Cap({ c }) {
  return (
    <group>
      <P p={[0, 0.52, -0.01]} s={[0.54, 0.17, 0.5]} c={c.crown} r={0.08} />
      <P p={[0, 0.46, 0.31]} s={[0.46, 0.035, 0.22]} c={c.brim} r={0.015} />
      <P p={[0, 0.615, -0.01]} s={[0.06, 0.03, 0.06]} c={c.brim} r={0.012} line={false} />
      <P p={[0, 0.54, 0.25]} s={[0.12, 0.08, 0.012]} c={c.logo} r={0.01} line={false} />
    </group>
  );
}

/* ── body (child of the body group) ──────────────────────────────────── */

export function Torso({ o }) {
  return (
    <group>
      <P p={[0, 0.94, 0]} s={[0.52, 0.62, 0.32]} c={o.top} r={0.08} />
      <P p={[0, 0.65, 0]} s={[0.535, 0.08, 0.335]} c={o.topDark} r={0.03} />
      {/* kangaroo pocket */}
      <P p={[0, 0.82, 0.162]} s={[0.32, 0.15, 0.02]} c={o.topDark} r={0.02} line={false} />
      {/* hood resting behind the neck */}
      <P p={[0, 1.22, -0.13]} s={[0.44, 0.17, 0.13]} c={o.topDark} r={0.05} />
      {/* drawstrings */}
      {[-1, 1].map((x) => (
        <group key={x}>
          <P p={[x * 0.06, 1.1, 0.166]} s={[0.022, 0.15, 0.012]} c={o.strings} r={0.006} line={false} />
          <P p={[x * 0.06, 1.015, 0.168]} s={[0.032, 0.032, 0.016]} c={o.accent} r={0.008} line={false} />
        </group>
      ))}
    </group>
  );
}

// child of an arm pivot
export function Arm({ o }) {
  return (
    <group>
      <P p={[0, -0.23, 0]} s={[0.15, 0.48, 0.19]} c={o.top} r={0.06} />
      <P p={[0, -0.49, 0]} s={[0.155, 0.06, 0.195]} c={o.topDark} r={0.02} />
      <P p={[0, -0.585, 0.01]} s={[0.12, 0.12, 0.14]} c={o.skin} r={0.045} />
    </group>
  );
}

// child of a leg pivot
export function Leg({ o }) {
  return (
    <group>
      <P p={[0, -0.27, 0]} s={[0.18, 0.5, 0.21]} c={o.pants} r={0.04} />
      <P p={[0, -0.555, 0.035]} s={[0.19, 0.08, 0.29]} c={o.shoes} r={0.035} />
      <P p={[0, -0.605, 0.04]} s={[0.2, 0.035, 0.31]} c={o.sole} r={0.012} />
      <P p={[0, -0.565, 0.17]} s={[0.17, 0.06, 0.05]} c={o.sole} r={0.02} line={false} />
    </group>
  );
}
