// app/page.jsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import InteractiveMeshGrid from "../components/InteractiveMeshGrid";

export default function Home() {
  const frameRef = useRef(null);
  const [imgStyle, setImgStyle] = useState({
    transform: "translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)",
  });

  // small helper to compute a subtle tilt/parallax based on mouse position
  function handleMouseMove(e) {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // normalized - limit strength
    const rx = (dy / rect.height) * -6; // rotateX (tilt toward cursor)
    const ry = (dx / rect.width) * 8; // rotateY
    const tx = (dx / rect.width) * -8; // translateX
    const ty = (dy / rect.height) * -6; // translateY

    // smooth transform string
    const transform = `translate3d(${tx}px, ${ty}px, 0px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    setImgStyle({ transform });
  }

  function handleMouseLeave() {
    // reset smoothly
    setImgStyle({
      transform: "translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)",
    });
  }

  return (
    <>
      {/* Background mesh */}
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

        {/* Centered bordered div (frame) */}
        <div
          className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-[92vw] h-[82vh] rounded-2xl
                     border border-[#635b72]
                     bg-[#0b0014]/95
                     shadow-[0_0_44px_rgba(99,91,114,0.35)]
                     transition-all duration-500
                     hover:shadow-[0_0_70px_rgba(99,91,114,0.5)]
                     overflow-hidden"
          ref={frameRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* inner padding area to keep image away from edges on small screens */}
          <div className="relative w-full h-full">
            {/* soft halo behind the profile (absolute so it won't shift layout) */}
            <div
              aria-hidden
              className="absolute left-8 bottom-8 md:left-8 md:bottom-0 w-[360px] h-[420px] rounded-[14px]
                         blur-[34px] opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(168,85,247,0.62), rgba(99,91,114,0.08) 55%, rgba(11,0,20,0) 80%)",
                filter: "blur(32px)",
                transform: "translateZ(0)",
              }}
            />

            {/* Profile image container (absolute for pixel perfect positioning) */}
            <div
              className="absolute left-8 bottom-8 md:left-8 md:bottom-0 select-none"
              style={{ width: 300, height: 400 }}
            >
              <div
                className="relative w-full h-full transition-transform duration-450 ease-out will-change-transform"
                style={{
                  ...imgStyle,
                  transformOrigin: "50% 65%",
                }}
              >
                <Image
                  src="/images/Profile/Profile.png"
                  alt="Profile"
                  fill
                  sizes="(min-width: 1280px) 360px, 300px"
                  style={{
                    objectFit: "contain",
                    // preserve crisp cutout and allow subtle shadow
                    transform: "translateZ(0)",
                  }}
                  className="relative z-20 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                  priority
                />
              </div>
            </div>

            {/* content placeholder (you can add hero text / CTA here later) */}
            <div className="pointer-events-none absolute inset-0"></div>
          </div>
        </div>
      </main>
    </>
  );
}
