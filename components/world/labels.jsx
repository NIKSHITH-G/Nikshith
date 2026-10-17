"use client";

// Speech bubbles and name tags that follow things in the 3D world, drawn as ordinary DOM
// over the canvas. (drei's <Html> mounts a separate React root per label and unmounts it
// synchronously, which React 19 flags as a race and can throw a removeChild error.)
// <LabelProjector/> lives inside the Canvas and moves every registered label each frame.

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { runtime, useWorld } from "./store";
import { activeItems } from "./layout";

const labels = new Set(); // { el, at: { current: () => [x, y, z] } }
const v = new THREE.Vector3();

export function LabelProjector() {
  useFrame(({ camera, size }) => {
    for (const l of labels) {
      if (!l.el) continue;
      v.set(...l.at.current()).project(camera);
      if (v.z > 1) {
        l.el.style.visibility = "hidden"; // behind the camera
        continue;
      }
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      l.el.style.visibility = "visible";
    }
  });
  return null;
}

// A DOM element pinned to a point in the world. `at` is read every frame, so it can follow
// something that moves.
export function WorldLabel({ at, children }) {
  const el = useRef(null);
  const atRef = useRef(at);
  atRef.current = at;
  useEffect(() => {
    const l = { el: el.current, at: atRef };
    labels.add(l);
    return () => labels.delete(l);
  }, []);
  return (
    <div ref={el} className="absolute left-0 top-0" style={{ visibility: "hidden" }}>
      {children}
    </div>
  );
}

const bubbleClass = "label-pop whitespace-nowrap rounded-2xl rounded-bl-sm border border-white/15 bg-white/90 text-[#1c1917] shadow-lg";

// Everything pinned into the world: the name tag over whatever you're next to, and
// Nikshith's and Byte's speech bubbles.
export function WorldLabels({ touch }) {
  const nearby = useWorld((s) => s.nearby);
  const live = useWorld((s) => s.phase === "playing" && !s.panel);
  const studio = useWorld((s) => s.floor === "studio");
  const npcBubble = useWorld((s) => s.npcBubble);
  const catBubble = useWorld((s) => s.catBubble);
  if (!live) return null;

  const pets = {
    cat: { name: "Byte", at: () => [runtime.cat.x, 1.25 + (runtime.cat.y ?? 0), runtime.cat.z] },
    dog: { name: "Pixel", at: () => [runtime.dog.x, 1.45, runtime.dog.z] },
    nikshith: { name: "Nikshith", at: () => [runtime.npc.x, 2.7, runtime.npc.z] },
  };
  const item = !pets[nearby] && activeItems().find((i) => i.id === nearby);
  const tag = pets[nearby] ?? (item && { name: item.name, at: () => [item.pos[0], item.h + 0.85, item.pos[1]] });

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {tag && (
        <WorldLabel key={`tag-${nearby}`} at={tag.at}>
          <div className="label-pop whitespace-nowrap rounded-full border border-white/15 bg-[#0d0f1a]/85 px-3 py-1.5 text-center shadow-lg backdrop-blur-md">
            <div className="font-display text-[15px] italic leading-none text-white">{tag.name}</div>
            <div className="mt-1 font-mono text-[10px] text-emerald-300/90">{touch ? "tap to open" : "press E"}</div>
          </div>
        </WorldLabel>
      )}
      {studio && npcBubble && nearby !== "nikshith" && (
        <WorldLabel at={() => [runtime.npc.x, 2.35, runtime.npc.z]}>
          <div key={npcBubble} className={`${bubbleClass} px-3 py-1.5 text-[12px] font-medium`}>{npcBubble}</div>
        </WorldLabel>
      )}
      {studio && catBubble && (
        <WorldLabel at={() => [runtime.cat.x, 0.95 + (runtime.cat.y ?? 0), runtime.cat.z]}>
          <div key={catBubble} className={`${bubbleClass} px-2 py-0.5 text-[15px] font-bold leading-snug`}>{catBubble}</div>
        </WorldLabel>
      )}
    </div>
  );
}
