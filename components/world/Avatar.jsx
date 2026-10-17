"use client";

// The shared blocky character: Nikshith and the visitor are built from the same
// parts, dressed differently. Each piece slots into the pivots the animators move
// (legs at y 0.62, arms at y 1.18, head at y 1.27), so walking, waving and typing
// keep working as before. Toon shading + soft outlines keep them crisp against the
// rooms, and the head blinks and the chest breathes on its own.

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Outlines, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const INK = "#0e0c18";

// three-step light ramp for the toon look
const TOON = (() => {
  if (typeof document === "undefined") return null;
  const tex = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255, 185, 185, 185, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
})();

function Mat({ c }) {
  return <meshToonMaterial color={c} gradientMap={TOON} />;
}

// one outlined, rounded block — the building piece for every character (pets too)
export function P({ p, s, c, r = 0.04, rot, line = true }) {
  return (
    <RoundedBox args={s} radius={Math.min(r, Math.min(...s) / 2 - 0.002)} smoothness={3} position={p} rotation={rot} castShadow>
      <Mat c={c} />
      {line && <Outlines thickness={0.012} color={INK} />}
    </RoundedBox>
  );
}

// a flattened oval (eyes, pupils, nose)
function Oval({ p, s, c, rot }) {
  return (
    <mesh position={p} scale={s} rotation={rot}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial color={c} />
    </mesh>
  );
}

export const OUTFITS = {
  nikshith: {
    skin: "#c89878", skinDark: "#b5845f", hair: "#1a1410", hairStyle: "curly",
    top: "#7c5cd6", topDark: "#6a4cc2", strings: "#ede9fe", collar: "#f5f5f4",
    pants: "#4a5f8a", pantsDark: "#3f5278", shoes: "#f5f5f5", sole: "#3f3f46", accent: "#a78bfa",
    sleeves: "pushed",
    headphones: { band: "#e5e7eb", cup: "#f4f4f5", pad: "#7c5cd6", wear: "neck" },
  },
  visitor: {
    skin: "#c89878", skinDark: "#b5845f", hair: "#1a1410", hairStyle: "short",
    top: "#0f766e", topDark: "#0d6b64", strings: "#ccfbf1",
    pants: "#475569", pantsDark: "#3c4859", shoes: "#f97316", sole: "#fafafa", accent: "#fde68a",
    cap: { crown: "#f59e0b", brim: "#d97706", logo: "#fff7ed" },
  },
};

/* ── head (child of the head pivot) ──────────────────────────────────── */

export function Head({ o }) {
  const eyes = useRef();
  const blink = useRef({ next: 1 + Math.random() * 3, until: 0 });
  useFrame(({ clock }) => {
    // blink at random, every 3–5 seconds
    const t = clock.elapsedTime;
    const b = blink.current;
    if (t > b.next) {
      b.until = t + 0.11;
      b.next = t + 3 + Math.random() * 2;
    }
    if (eyes.current) eyes.current.scale.y = t < b.until ? 0.12 : 1;
  });

  return (
    <group>
      <P p={[0, -0.01, 0]} s={[0.17, 0.1, 0.15]} c={o.skinDark} line={false} />
      <P p={[0, 0.25, 0]} s={[0.5, 0.48, 0.46]} c={o.skin} r={0.11} />
      {/* ears */}
      {[-1, 1].map((x) => <P key={x} p={[x * 0.255, 0.22, -0.01]} s={[0.06, 0.12, 0.09]} c={o.skin} r={0.025} />)}
      {/* soft oval eyes with a small highlight in the upper corner */}
      <group ref={eyes} position={[0, 0.235, 0.233]}>
        {[-1, 1].map((x) => (
          <group key={x} position={[x * 0.1, 0, 0]}>
            <Oval p={[0, 0, 0]} s={[0.034, 0.045, 0.01]} c="#1c1410" />
            <Oval p={[0.012, 0.018, 0.008]} s={[0.009, 0.009, 0.004]} c="#ffffff" />
          </group>
        ))}
      </group>
      {/* relaxed brows: a little lower, inner ends lifted */}
      {[-1, 1].map((x) => <P key={`b${x}`} p={[x * 0.1, 0.31, 0.236]} s={[0.1, 0.024, 0.012]} c={o.hair} r={0.008} line={false} rot={[0, 0, x * -0.08]} />)}
      {/* small round nose */}
      <Oval p={[0, 0.185, 0.238]} s={[0.022, 0.018, 0.012]} c={o.skinDark} />
      {/* blush */}
      {[-1, 1].map((x) => <Oval key={`c${x}`} p={[x * 0.165, 0.165, 0.233]} s={[0.035, 0.017, 0.004]} c="#e88a7a" />)}
      {/* a wider, slightly lopsided smile */}
      <P p={[0.008, 0.112, 0.234]} s={[0.1, 0.02, 0.01]} c="#6b2a1a" r={0.008} line={false} />
      <P p={[-0.056, 0.121, 0.234]} s={[0.032, 0.017, 0.01]} c="#6b2a1a" r={0.006} line={false} rot={[0, 0, -0.5]} />
      <P p={[0.07, 0.127, 0.234]} s={[0.034, 0.017, 0.01]} c="#6b2a1a" r={0.006} line={false} rot={[0, 0, 0.7]} />

      {o.hairStyle === "curly" ? <CurlyHair o={o} /> : <ShortHair o={o} />}
      {o.headphones?.wear === "head" && <HeadphonesOn h={o.headphones} />}
      {o.headphones?.wear === "neck" && <HeadphonesNeck h={o.headphones} />}
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

function HeadphonesOn({ h }) {
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

// "focus mode, but come say hi": headphones resting around the neck
function HeadphonesNeck({ h }) {
  return (
    <group>
      <P p={[0, -0.04, -0.14]} s={[0.32, 0.045, 0.06]} c={h.band} r={0.02} />
      {[-1, 1].map((x) => (
        <group key={x}>
          <P p={[x * 0.17, -0.05, -0.02]} s={[0.045, 0.045, 0.22]} c={h.band} r={0.02} />
          <P p={[x * 0.14, -0.075, 0.175]} s={[0.12, 0.16, 0.08]} c={h.cup} r={0.04} rot={[1.15, 0, x * 0.25]} />
          <P p={[x * 0.14, -0.06, 0.215]} s={[0.08, 0.1, 0.02]} c={h.pad} r={0.008} line={false} rot={[1.15, 0, x * 0.25]} />
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
  const chest = useRef();
  const phase = useRef(Math.random() * 6);
  useFrame(({ clock }) => {
    // slow breathing: the chest swells by ~1.5%
    const k = 1 + Math.sin(clock.elapsedTime * 1.7 + phase.current) * 0.015;
    if (chest.current) chest.current.scale.set(k, 1 + (k - 1) * 0.6, k);
  });
  return (
    <group ref={chest} position={[0, 0.94, 0]}>
      <P p={[0, 0, 0]} s={[0.52, 0.62, 0.32]} c={o.top} r={0.09} />
      {/* thin ribbed hem */}
      <P p={[0, -0.285, 0]} s={[0.5, 0.05, 0.31]} c={o.topDark} r={0.022} line={false} />
      {/* kangaroo pocket */}
      <P p={[0, -0.12, 0.162]} s={[0.32, 0.15, 0.02]} c={o.topDark} r={0.02} line={false} />
      {/* hood resting behind the neck */}
      <P p={[0, 0.28, -0.13]} s={[0.44, 0.17, 0.13]} c={o.topDark} r={0.05} />
      {/* a t-shirt collar peeking out at the neck */}
      {o.collar && <P p={[0, 0.3, 0.06]} s={[0.22, 0.04, 0.12]} c={o.collar} r={0.015} line={false} />}
      {/* drawstrings */}
      {[-1, 1].map((x) => (
        <group key={x}>
          <P p={[x * 0.06, 0.16, 0.166]} s={[0.022, 0.15, 0.012]} c={o.strings} r={0.006} line={false} />
          <P p={[x * 0.06, 0.075, 0.168]} s={[0.032, 0.032, 0.016]} c={o.accent} r={0.008} line={false} />
        </group>
      ))}
    </group>
  );
}

// child of an arm pivot; `side` is -1 (left) or 1 (right). Angled out a touch so
// the arms hang naturally instead of looking glued to the sides.
export function Arm({ o, side }) {
  const pushed = o.sleeves === "pushed";
  return (
    <group rotation-z={side * 0.09}>
      {/* rounded shoulder that tucks into the torso */}
      <P p={[-side * 0.02, -0.02, 0]} s={[0.17, 0.16, 0.2]} c={o.top} r={0.07} />
      {pushed ? (
        <>
          <P p={[0, -0.17, 0]} s={[0.15, 0.3, 0.19]} c={o.top} r={0.06} />
          {/* sleeve bunched up at the elbow */}
          <P p={[0, -0.33, 0]} s={[0.165, 0.07, 0.205]} c={o.topDark} r={0.03} />
          <P p={[0, -0.45, 0.005]} s={[0.12, 0.2, 0.15]} c={o.skin} r={0.05} />
        </>
      ) : (
        <>
          <P p={[0, -0.23, 0]} s={[0.15, 0.48, 0.19]} c={o.top} r={0.06} />
          <P p={[0, -0.475, 0]} s={[0.14, 0.04, 0.18]} c={o.topDark} r={0.018} line={false} />
        </>
      )}
      {/* hand with a thumb */}
      <P p={[0, -0.575, 0.01]} s={[0.12, 0.12, 0.14]} c={o.skin} r={0.045} />
      <P p={[-side * 0.05, -0.55, 0.065]} s={[0.045, 0.06, 0.05]} c={o.skin} r={0.02} />
    </group>
  );
}

// child of a leg pivot: jeans tapering toward the ankle, sneakers with a contrasting sole
export function Leg({ o }) {
  return (
    <group>
      <P p={[0, -0.15, 0]} s={[0.19, 0.28, 0.22]} c={o.pants} r={0.045} />
      <P p={[0, -0.39, 0.005]} s={[0.165, 0.24, 0.19]} c={o.pants} r={0.04} />
      <P p={[0, -0.5, 0.005]} s={[0.17, 0.035, 0.195]} c={o.pantsDark} r={0.012} line={false} />
      <P p={[0, -0.555, 0.035]} s={[0.19, 0.08, 0.29]} c={o.shoes} r={0.035} />
      <P p={[0, -0.605, 0.04]} s={[0.2, 0.035, 0.31]} c={o.sole} r={0.012} />
      <P p={[0, -0.565, 0.17]} s={[0.17, 0.06, 0.05]} c={o.shoes} r={0.02} line={false} />
    </group>
  );
}
