// app/page.jsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import InteractiveMeshGrid from "../components/InteractiveMeshGrid";
import Hive3D from "../components/Hive3D";

export default function Home() {
  const frameRef = useRef(null);
  const [imgStyle, setImgStyle] = useState({
    transform: "translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)",
  });
  // background parallax offsets (small)
  const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 });

  function handleMouseMove(e) {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // profile image transform (same as before)
    const rx = (dy / rect.height) * -6;
    const ry = (dx / rect.width) * 8;
    const tx = (dx / rect.width) * -8;
    const ty = (dy / rect.height) * -6;
    const transform = `translate3d(${tx}px, ${ty}px, 0px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    setImgStyle({ transform });

    // subtle background parallax - move opposite of cursor, scaled down
    const bx = -(dx / rect.width) * 4; // percent offsets
    const by = -(dy / rect.height) * 4;
    setBgOffset({ x: bx, y: by });
  }

  function handleMouseLeave() {
    setImgStyle({
      transform: "translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)",
    });
    setBgOffset({ x: 0, y: 0 });
  }

  // helper: computed background position string for slight parallax
  const bgPos = `${50 + bgOffset.x}% ${50 + bgOffset.y}%`;

  return (
    <>
      <InteractiveMeshGrid
        spacing={96}
        density={0.78}
        lineColor="rgba(255,255,255,0.03)"
        pointColor="rgba(168,85,247,0.95)"
        pointSize={1.6}
        warp={0.16}
        pointerSmoothing={0.16}
        spring={0.1}
        damping={0.84}
        disableBelow={420}
        maxPoints={1600}
      />

      <main className="min-h-screen text-foreground relative z-10 overflow-hidden">
        <Navbar />

        {/* Main Frame with Background */}
        <div
          className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] h-[82vh] rounded-2xl border border-[#635b72] bg-[#0b0014]/80 shadow-[0_0_44px_rgba(99,91,114,0.35)] transition-all duration-500 hover:shadow-[0_0_90px_rgba(99,91,114,0.6)] overflow-hidden"
          ref={frameRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            // background image placed behind everything
            backgroundImage: "url('/images/scene-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: bgPos,
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="relative w-full h-full">
            {/* neon inner border: separate element so it blends on top of bg but under content */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                // a thin inner stroke + soft outer glow
                boxShadow:
                  "inset 0 0 0 1px rgba(120,160,255,0.18), inset 0 0 40px rgba(99,91,244,0.06), 0 8px 60px rgba(10,6,18,0.6)",
                borderRadius: "12px",
                mixBlendMode: "screen",
              }}
            />

            {/* subtle vignette + grain overlays to add depth */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background:
                  "radial-gradient(1200px 600px at 10% 90%, rgba(0,0,0,0.55), rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.6) 100%)",
                opacity: 0.6,
                borderRadius: "12px",
                mixBlendMode: "multiply",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))",
                opacity: 0.6,
                borderRadius: "12px",
                mixBlendMode: "overlay",
              }}
            />

            {/* Soft glow halo behind profile */}
            <div
              aria-hidden
              className="absolute left-8 bottom-8 md:left-8 md:bottom-0 w-[360px] h-[420px] rounded-[14px] opacity-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(138,95,255,0.72), rgba(99,91,244,0.06) 55%, rgba(11,0,20,0) 80%)",
                filter: "blur(36px)",
                transform: "translateZ(0)",
              }}
            />

            {/* Profile Image (now with crisp outline + inner purple outline) */}
            <div
              className="absolute left-8 bottom-8 md:left-8 md:bottom-0 select-none"
              style={{ width: 325, height: 372 }}
            >
              <div
                className="relative w-full h-full transition-transform duration-450 ease-out will-change-transform"
                style={{
                  ...imgStyle,
                  transformOrigin: "50% 65%",
                }}
              >
                {/* outline wrapper */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[6px] pointer-events-none"
                  style={{
                    boxShadow:
                      "0 8px 30px rgba(0,0,0,0.6), 0 0 18px rgba(99,91,244,0.18)",
                    borderRadius: "6px",
                    zIndex: 18,
                  }}
                />
                <Image
                  src="/images/Profile/Profile.png"
                  alt="Profile"
                  fill
                  sizes="(min-width: 1280px) 360px, 300px"
                  style={{
                    objectFit: "contain",
                    transform: "translateZ(0)",
                  }}
                  className="relative z-20 -ml-2 drop-shadow-[0_30px_40px_rgba(0,0,0,0.65)]"
                  priority
                />
                {/* small purple rim under profile for a stronger cutout read */}
                <div
                  aria-hidden
                  className="absolute -left-3 -bottom-6 w-28 h-28 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(138,95,255,0.28), rgba(11,0,20,0) 60%)",
                    filter: "blur(18px)",
                    zIndex: 15,
                  }}
                />
              </div>
            </div>

            {/* Hive 3D Visual (kept commented per your current file; feel free to re-enable) 
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[56%] h-[76%] md:w-[50%] md:h-[72%] lg:w-[44%] lg:h-[76%] pointer-events-auto">
                <Hive3D />
              </div>
            </div> */}

            {/* subtle top-right lens glow (decorative) */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-8 top-8 w-40 h-12 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(120,95,255,0.18), rgba(78,210,255,0.06))",
                filter: "blur(20px)",
                opacity: 0.7,
                mixBlendMode: "screen",
              }}
            />

            {/* Overlay gradient for subtle fade */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#0b0014]/22 via-transparent to-transparent rounded-2xl" />
          </div>
        </div>
      </main>
    </>
  );
}
