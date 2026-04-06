"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const USERNAME = "NIKSHITH-G";
const CACHE_KEY = "github_commits_cache";
const ONE_DAY = 1000 * 60 * 60 * 24;

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

function getColor(count) {
  if (count === 0) return "#1a1a1a";
  if (count <= 2) return "#4c1d95";
  if (count <= 5) return "#6d28d9";
  if (count <= 10) return "#8b5cf6";
  return "#c4b5fd";
}

export default function GitHubContributions() {
  const [commitMap, setCommitMap] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const containerRef = useRef(null);
  const { weeks } = buildWeeks();

  const fetchFromAPI = async (force = false) => {
    setLoading(true);

    try {
      const url = force ? "/api/github?refresh=true" : "/api/github";
      const res = await fetch(url);
      const data = await res.json();

      const payload = {
        data: data.commitMap || {},
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));

      setCommitMap(payload.data);
      setLastUpdated(new Date(payload.timestamp));
    } catch {
      console.log("fetch failed");
    }

    setLoading(false);
  };

  const loadData = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);

        if (Date.now() - parsed.timestamp < ONE_DAY) {
          setCommitMap(parsed.data);
          setLastUpdated(new Date(parsed.timestamp));
          setLoading(false);
          return;
        }
      }
    } catch {}

    fetchFromAPI();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    await fetchFromAPI(true);
  };

  const totalCommits = Object.values(commitMap).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(commitMap).filter((c) => c > 0).length;

  return (
    <section className="mx-auto max-w-7xl px-6 pt-4 pb-2">
      <div className="rounded-2xl border border-white/10 bg-[#0b0b12] px-6 py-5">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs text-white/50 font-mono">
            Total Commits — {totalCommits}
          </div>

          <div className="flex items-center gap-3">

            {lastUpdated && (
              <span className="text-[10px] text-white/30 font-mono">
                updated {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-mono border border-white/10 px-3 py-1.5 rounded-md transition 
                         text-white/40 hover:text-white hover:border-white/20
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                className={loading ? "animate-spin" : ""}
                style={{ width: "14px", height: "14px" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-6.2-8.6" />
              </svg>

              <span>{loading ? "refreshing..." : "refresh"}</span>
            </button>
          </div>
        </div>

        <div className="flex gap-6">

          <div
            ref={containerRef}
            className="relative flex-1"
            style={{ height: "110px" }}
          >
            {loading ? (
              <div className="text-white/30 text-xs font-mono">
                loading commits...
              </div>
            ) : (
              <div className="flex gap-[3px] overflow-x-auto overflow-y-hidden">

                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day, di) => {
                      const key = toKey(day);
                      const count = commitMap[key] || 0;

                      return (
                        <div
                          key={di}
                          className="relative w-[13px] h-[13px] cursor-pointer group"
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
                          <div
                            className="absolute inset-0 rounded-[3px] transition-transform group-hover:scale-125"
                            style={{
                              backgroundColor: getColor(count),
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {tooltip && (
              <div
                className="absolute z-50 px-3 py-2 rounded-lg text-xs font-mono text-white border border-white/10 pointer-events-none"
                style={{
                  background: "#111",
                  left: tooltip.x,
                  top: tooltip.y - 8,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="text-white/60">{tooltip.date}</div>
                <div className="text-violet-300 font-semibold">
                  {tooltip.count === 0
                    ? "No commits"
                    : `${tooltip.count} commit${tooltip.count > 1 ? "s" : ""}`}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col justify-between min-w-[180px]">
            <div>
              <div className="text-xs text-white/40 mb-2 font-mono">
                Activity
              </div>

              <div className="flex gap-1">
                {[0, 1, 3, 7, 12].map((v, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-[3px]"
                    style={{
                      backgroundColor: getColor(v),
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-between text-[10px] text-white/30 mt-1">
                <span>less</span>
                <span>more</span>
              </div>
            </div>

            <div className="mt-6 text-xs text-white/50 font-mono">
              Active days: {activeDays}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}