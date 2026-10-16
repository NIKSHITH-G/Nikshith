"use client";

import { EffectComposer, Bloom, Vignette, N8AO, TiltShift2, SMAA } from "@react-three/postprocessing";
import { useWorld } from "./store";

export default function Effects() {
  const quality = useWorld((s) => s.quality);
  if (quality === "low") return null;
  const high = quality === "high";
  return (
    <EffectComposer multisampling={0}>
      {high && <N8AO aoRadius={0.6} intensity={2.2} distanceFalloff={0.8} halfRes />}
      <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.85} luminanceSmoothing={0.25} />
      {high && <TiltShift2 blur={0.12} taper={0.6} />}
      <Vignette offset={0.25} darkness={0.65} />
      <SMAA />
    </EffectComposer>
  );
}

