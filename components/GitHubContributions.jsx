"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const USERNAME = "NIKSHITH-G";

/* -------------------------
   Helpers
------------------------- */

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildWeeks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 371);
  start.setDate(start.getDate() - start.getDay());

  const days = [];
  const cur = new Date(start);

  while (cur <= today) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return { weeks };
}

/* -------------------------
   Color scale (clean contrast)
------------------------- */

function getColor(count) {
  if (count === 0) return "#1a1a1a";
  if (count <= 2) return "#4c1d95";
  if (count <= 5) return "#6d28d9";
  if (count <= 10) return "#8b5cf6";
  return "#c4b5fd";
}

/* -------------------------
   Component
------------------------- */

export default function GitHubContributions() {
  const [commitMap, setCommitMap] = useState({});
  const [tooltip, setTooltip] = useState(null);

  const containerRef = useRef(null);
  const { weeks } = buildWeeks();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/github");
      const data = await res.json();
      setCommitMap(data.commitMap || {});
    } catch {
      console.log("error loading github");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalCommits = Object.values(commitMap).reduce((a, b) => a + b, 0);

  return (
    <section className="mx-auto max-w-7xl px-6 pt-4 pb-2">
      <div className="rounded-2xl border border-white/10 bg-[#0b0b12] px-6 py-5">

        {/* HEADER */}
        <div className="text-xs text-white/50 mb-3 font-mono">
          @{USERNAME} — {totalCommits} commits
        </div>

        {/* GRID WRAPPER (IMPORTANT FOR TOOLTIP) */}
        <div ref={containerRef} className="relative">

          {/* GRID */}
          <div className="flex gap-[3px] overflow-x-auto">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  const key = toKey(day);
                  const count = commitMap[key] || 0;

                  return (
                    <div
                      key={di}
                      className="relative w-[13px] h-[13px] cursor-pointer"
                      onMouseEnter={(e) => {
                        const containerRect =
                          containerRef.current.getBoundingClientRect();
                        const cellRect =
                          e.currentTarget.getBoundingClientRect();

                        setTooltip({
                          x:
                            cellRect.left -
                            containerRect.left +
                            cellRect.width / 2,
                          y: cellRect.top - containerRect.top,
                          date: day.toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }),
                          count,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {/* BASE CELL */}
                      <div
                        className="absolute inset-0 rounded-[3px]"
                        style={{
                          backgroundColor: getColor(count),
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      />

                      {/* HOVER EFFECT (NO LAYOUT SHIFT) */}
                      <div
                        className="absolute inset-0 rounded-[3px] pointer-events-none transition-transform duration-150"
                        style={{
                          backgroundColor: getColor(count),
                        }}
                      />

                      {/* PURE CSS hover without shifting layout */}
                      <style jsx>{`
                        div:hover > div:last-child {
                          transform: scale(1.35);
                          box-shadow: 0 0 12px rgba(139, 92, 246, 0.8);
                          z-index: 10;
                        }
                      `}</style>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* TOOLTIP (FIXED POSITION INSIDE CONTAINER) */}
          {tooltip && (
            <div
              className="absolute z-50 px-3 py-2 rounded-lg text-xs font-mono text-white border border-white/10 pointer-events-none"
              style={{
                background: "#111",
                left: tooltip.x,
                top: tooltip.y - 8,
                transform: "translate(-50%, -100%)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
              }}
            >
              <div className="text-white/60">{tooltip.date}</div>
              <div className="text-violet-300 font-semibold">
                {tooltip.count === 0
                  ? "No commits"
                  : `${tooltip.count} commit${
                      tooltip.count > 1 ? "s" : ""
                    }`}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}