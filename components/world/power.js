"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { runtime, now } from "./store";

// 0 → 1 for a light that switches on `delay` seconds after Enter, with a
// little fluorescent flicker on the way up.
export function power(delay) {
  if (runtime.powerStart == null) return 0;
  const x = now() - runtime.powerStart - delay;
  if (x <= 0) return 0;
  if (x > 0.3) return 1;
  return x < 0.05 ? 1 : x < 0.11 ? 0.08 : x < 0.16 ? 0.85 : x < 0.21 ? 0.25 : 1;
}

// Calls apply(p) whenever the power level for `delay` changes.
export function usePower(delay, apply) {
  const last = useRef(-1);
  useFrame(() => {
    const p = power(delay);
    if (p !== last.current) {
      last.current = p;
      apply(p);
    }
  });
}
