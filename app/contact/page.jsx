// app/page.jsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import InteractiveMeshGrid from "../components/InteractiveMeshGrid";
import DigitalHive from "../components/DigitalHive";

export default function Home() {
  const frameRef = useRef(null);
  const [imgStyle, setImgStyle] = useState({
    transform: "translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)",
  });

  function handleMouseMove(e) {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const rx = (dy / rect.height) * -6;
    const ry = (dx / rect.width) * 8;
    const tx = (dx / rect.width) * -8;
    const ty = (dy / rect.height) * -6;

    const transform = `translate3d(${tx}px, ${ty}px, 0px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    setImgStyle({ transform });
  }

  function handleMouseLeave() {
    setImgStyle({
      transform: "translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)",
    });
  }

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

        <div
          className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] h-[82vh] rounded-2xl border border-[#635b72] bg-[#0b0014]/95 shadow-[0_0_44px_rgba(99,91,114,0.35)] transition-all duration-500 hover:shadow-[0_0_70px_rgba(99,91,114,0.5)] overflow-hidden"
          ref={frameRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative w-full h-full">
            {/* halo behind profile */}
            <div
              aria-hidden
              className="absolute left-8 bottom-8 md:left-8 md:bottom-0 w-[360px] h-[420px] rounded-[14px] blur-[34px] opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(168,85,247,0.62), rgba(99,91,114,0.08) 55%, rgba(11,0,20,0) 80%)",
                filter: "blur(32px)",
                transform: "translateZ(0)",
              }}
            />

            {/* profile image */}
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
                    transform: "translateZ(0)",
                  }}
                  className="relative z-20 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                  priority
                />
              </div>
            </div>

            {/* Digital Hive container — larger and centered-right */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[52%] h-[74%] md:w-[48%] md:h-[70%] lg:w-[44%] lg:h-[72%] pointer-events-auto">
                <DigitalHive size={56} spacing={10} clusterScale={1.06} />
              </div>
            </div>

            {/* overlay gradient for blending */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#0b0014]/24 via-transparent to-transparent" />
          </div>
        </div>
      </main>
    </>
  );
}
