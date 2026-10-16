"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import HUD from "./HUD";
import { runtime, getState, setState, interact, closePanel, goToPanel, enter, enterInstantly, useWorld } from "./store";
import { setActiveFloor } from "./layout";
import { PANEL_META, preloadPanels } from "./panels";
import * as sfx from "./audio";

const MOVE_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function World() {
  const [ready, setReady] = useState(false);
  const [touch, setTouch] = useState(false);
  const drag = useRef(null);
  const phase = useWorld((s) => s.phase);

  // once you're in (the lights-on cinematic hides it), quietly fetch the panels and other floors
  useEffect(() => {
    if (phase !== "entering" && phase !== "playing") return;
    const idle = window.requestIdleCallback ?? ((f) => setTimeout(f, 300));
    idle(() => {
      preloadPanels();
      import("./floors");
    });
  }, [phase]);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.__reduceMotion = reduce;
    setTouch(coarse);
    if (coarse || reduce) setState({ quality: "medium" });

    // the command palette (⌘K) asks the world to travel via this event
    const onGo = (e) => PANEL_META[e.detail] && goToPanel(e.detail);
    window.addEventListener("world:go", onGo);
    return () => window.removeEventListener("world:go", onGo);
  }, []);

  // deep links: /?go=projects drops you straight into a section once the scene is up
  useEffect(() => {
    if (!ready) return;
    // ?debug exposes a tiny camera/floor control for inspecting the building
    if (new URLSearchParams(window.location.search).has("debug")) {
      // dispatch new CustomEvent("studio:view", { detail: [floor, x, z, zoom, yaw] })
      window.addEventListener("studio:view", ({ detail: [floor, x, z, zoom = 1, yaw = 0] }) => {
        enterInstantly();
        setActiveFloor(floor);
        setState({ floor, panel: null, moved: true });
        Object.assign(runtime, { x, z, zoom, yaw, path: [] });
      });
    }
    const go = new URLSearchParams(window.location.search).get("go");
    if (go && PANEL_META[go]) goToPanel(go);
  }, [ready]);

  useEffect(() => {
    const typing = (e) => e.target.closest?.("input, textarea, select, [contenteditable]");
    const onDown = (e) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const s = getState();
      if (k === "escape") {
        if (s.map) setState({ map: false });
        else if (s.panel) closePanel();
        return;
      }
      if (s.phase === "title" && k === "enter") {
        e.preventDefault();
        enter();
        return;
      }
      if (s.phase !== "playing" || s.panel) return;
      if (MOVE_KEYS.has(k)) {
        e.preventDefault();
        runtime.keys.add(k);
      } else if ((k === "e" || k === "enter" || k === " ") && s.nearby && !s.map) {
        e.preventDefault();
        interact(s.nearby);
      } else if (k === "m") {
        sfx.blip(!s.map);
        setState({ map: !s.map });
      }
    };
    const onUp = (e) => runtime.keys.delete(e.key.toLowerCase());
    const clear = () => runtime.keys.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
    };
  }, []);

  // drag to orbit the camera a little, scroll to zoom
  const canLook = () => {
    const s = getState();
    return s.phase === "playing" && !s.panel && !s.map;
  };
  const onPointerDown = (e) => {
    if (!canLook()) return;
    drag.current = { x: e.clientX, yaw: runtime.yaw, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    if (d.moved) runtime.yaw = clamp(d.yaw - dx * 0.004, -0.8, 0.8);
  };
  const onPointerUp = () => {
    if (drag.current?.moved) {
      // swallow the click that follows a drag so it doesn't also walk you somewhere
      runtime.justDragged = true;
      setTimeout(() => (runtime.justDragged = false), 0);
    }
    drag.current = null;
  };
  const onWheel = (e) => {
    if (!canLook()) return;
    runtime.zoom = clamp(runtime.zoom * (1 + e.deltaY * 0.0012), 0.65, 1.5);
  };

  return (
    <div
      className="fixed inset-0 touch-none overflow-hidden bg-[#0b0d16]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <Canvas
        shadows
        dpr={touch ? [1, 1.5] : [1, 1.75]}
        camera={{ fov: 36, position: [0, 19, 21], near: 0.3, far: 140 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))}
      >
        <Suspense fallback={null}>
          <Scene touch={touch} />
        </Suspense>
      </Canvas>
      <HUD ready={ready} touch={touch} />
    </div>
  );
}
