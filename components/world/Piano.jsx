"use client";

import { useEffect, useRef, useState } from "react";
import { WHITE, BLACK, ALL_NOTES } from "./notes";
import { runtime } from "./store";
import * as sfx from "./audio";

export default function Piano({ tall = false }) {
  const [down, setDown] = useState(() => new Set());
  const held = useRef(new Set());

  const press = (note) => {
    sfx.init();
    sfx.note(note.f);
    // the 3D piano in the room presses the same key
    runtime.piano.add(note.n);
    setDown((s) => new Set(s).add(note.n));
    setTimeout(() => {
      runtime.piano.delete(note.n);
      setDown((s) => {
        const c = new Set(s);
        c.delete(note.n);
        return c;
      });
    }, 200);
  };

  useEffect(() => {
    const onDown = (e) => {
      if (e.target.closest?.("input, textarea") || e.metaKey || e.ctrlKey) return;
      const note = ALL_NOTES.find((n) => n.k === e.key.toLowerCase());
      if (!note || held.current.has(note.k)) return;
      held.current.add(note.k);
      e.stopPropagation();
      press(note);
    };
    const onUp = (e) => held.current.delete(e.key.toLowerCase());
    // capture phase so the piano gets keys before the world's handlers
    window.addEventListener("keydown", onDown, true);
    window.addEventListener("keyup", onUp, true);
    return () => {
      window.removeEventListener("keydown", onDown, true);
      window.removeEventListener("keyup", onUp, true);
    };
  }, []);

  const w = 100 / WHITE.length;
  return (
    <div>
      <div className={`relative select-none ${tall ? "h-52" : "h-40"} overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-black to-[#121218] p-1.5 pt-3`} role="group" aria-label="Playable piano">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500/0 via-violet-500/70 to-violet-500/0" />
        <div className="flex h-full gap-[3px]">
          {WHITE.map((n) => (
            <button
              key={n.n}
              onPointerDown={() => press(n)}
              aria-label={n.n}
              className={`relative flex-1 rounded-b-lg shadow-[inset_0_-6px_0_rgba(0,0,0,0.12)] transition-all duration-75 ${down.has(n.n) ? "translate-y-0.5 bg-violet-200 shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)]" : "bg-[#f6f5f0] hover:bg-white"}`}
            >
              <span className="absolute bottom-2 left-0 right-0 hidden text-center font-mono text-[10px] uppercase text-black/35 sm:block">{n.k}</span>
            </button>
          ))}
        </div>
        {BLACK.map((n) => (
          <button
            key={n.n}
            onPointerDown={() => press(n)}
            aria-label={n.n}
            style={{ left: `calc(6px + ${(n.after + 1) * w}% - ${w * 0.3}%)`, width: `${w * 0.6}%` }}
            className={`absolute top-3 h-[56%] rounded-b-md shadow-[inset_0_-4px_0_rgba(255,255,255,0.06)] transition-colors duration-75 ${down.has(n.n) ? "bg-violet-500" : "bg-[#16161c] hover:bg-[#2a2a35]"}`}
          >
            <span className="absolute bottom-1 left-0 right-0 hidden text-center font-mono text-[9px] uppercase text-white/40 sm:block">{n.k}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-[11px] text-white/40">
        Click the keys or use your keyboard: <span className="text-white/60">A S D F G H J K L ;</span> and <span className="text-white/60">W E T Y U O P</span>. The piano in the room plays along.
      </p>
    </div>
  );
}
