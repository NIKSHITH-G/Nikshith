"use client";

import dynamic from "next/dynamic";

// three.js can't render on the server, so the world only loads in the browser.
const World = dynamic(() => import("./World"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#07080d] px-6">
      <div className="w-full max-w-sm font-mono text-[12px] text-white/80">
        nikshith-os <span className="text-white/35">v2.6</span> — booting studio
        <div className="mt-4 flex gap-2 text-white/55">
          <span className="animate-pulse text-amber-300">[ .. ]</span> downloading the studio
        </div>
      </div>
    </div>
  ),
});

export default function StudioLoader() {
  return <World />;
}
