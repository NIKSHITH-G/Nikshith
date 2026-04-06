// components/GitHubContributions.jsx
"use client";

import { useEffect, useState, useCallback } from "react";

const USERNAME = "NIKSHITH-G";

// ── date helpers ──────────────────────────────────────────────────────────────

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildWeeks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // start from 371 days ago then snap to previous Sunday
  const start = new Date(today);
  start.setDate(start.getDate() - 371);
  start.setDate(start.getDate() - start.getDay()); // snap to Sunday

  const days = [];
  const cur = new Date(start);
  while (cur <= today) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  // chunk into weeks (columns of 7)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return { weeks, start };
}

function getLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

// ── month labels ──────────────────────────────────────────────────────────────

function getMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week[0];
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
      labels.push({
        label: firstDay.toLocaleString("default", { month: "short" }),
        col: wi,
      });
      lastMonth = month;
    }
  });
  return labels;
}

// ── fetch logic ───────────────────────────────────────────────────────────────

async function fetchContributions(signal) {
  // 1. get all repos
  const reposRes = await fetch(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`,
    { signal }
  );
  if (!reposRes.ok) throw new Error("Failed to fetch repos");
  const repos = await reposRes.json();

  const since = new Date();
  since.setDate(since.getDate() - 371);
  const sinceISO = since.toISOString();

  // 2. for each repo fetch commits by this user in parallel (batched to avoid rate limit)
  const commitMap = {}; // "YYYY-MM-DD" → count

  const BATCH = 6;
  for (let i = 0; i < repos.length; i += BATCH) {
    const batch = repos.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (repo) => {
        try {
          // paginate up to 3 pages (300 commits per repo — enough for a year)
          for (let page = 1; page <= 3; page++) {
            const url = `https://api.github.com/repos/${USERNAME}/${repo.name}/commits?author=${USERNAME}&since=${sinceISO}&per_page=100&page=${page}`;
            const res = await fetch(url, { signal });
            if (!res.ok) break;
            const commits = await res.json();
            if (!Array.isArray(commits) || commits.length === 0) break;

            commits.forEach((c) => {
              const dateStr = (
                c.commit?.author?.date || c.commit?.committer?.date || ""
              ).slice(0, 10);
              if (dateStr) {
                commitMap[dateStr] = (commitMap[dateStr] || 0) + 1;
              }
            });

            if (commits.length < 100) break; // no more pages
          }
        } catch {
          // skip repos that fail (e.g. empty repos)
        }
      })
    );
  }

  return commitMap;
}

// ── cell colours ─────────────────────────────────────────────────────────────

const CELL_STYLE = [
  // level 0 — empty
  { bg: "rgba(255,255,255,0.03)", border: "rgba(218, 15, 15, 0.06)" },
  // level 1
  { bg: "rgba(79,70,229,0.35)", border: "rgba(48, 182, 54, 0.3)" },
  // level 2
  { bg: "rgba(99, 241, 132, 0.6)", border: "rgba(129,140,248,0.4)" },
  // level 3
  { bg: "rgba(92, 246, 92, 0.8)", border: "rgba(167,139,250,0.5)" },
  // level 4
  { bg: "rgba(167,139,250,1)", border: "rgba(196,181,253,0.7)" },
];

// ── component ─────────────────────────────────────────────────────────────────

export default function GitHubContributions() {
  const [commitMap, setCommitMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [tooltip, setTooltip] = useState(null); // { x, y, date, count }

  const { weeks } = buildWeeks();
  const monthLabels = getMonthLabels(weeks);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    setSpinning(true);
    const controller = new AbortController();
    try {
      const map = await fetchContributions(controller.signal);
      setCommitMap(map);
      setLastFetched(new Date());
    } catch (e) {
      if (e.name !== "AbortError") setError(true);
    } finally {
      setLoading(false);
      setSpinning(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => { load(); }, [load]);

  // total commits in the grid window
  const totalCommits = Object.values(commitMap).reduce((a, b) => a + b, 0);

  // active days
  const activeDays = Object.values(commitMap).filter((v) => v > 0).length;

  const CELL = 13; // px per cell
  const GAP = 2;   // px gap

  return (
    <section className="mx-auto max-w-7xl px-6 pt-4 pb-2">
      <div
        className="rounded-2xl border border-white/5 bg-[rgba(255,255,255,0.02)] backdrop-blur-md px-6 py-5"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
      >
        {/* header row */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {/* GitHub icon */}
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white/40" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="text-xs font-mono text-white/40">@{USERNAME}</span>
            {!loading && !error && (
              <span className="text-xs text-white/25">
                {totalCommits} commits · {activeDays} active days
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* last fetched */}
            {lastFetched && (
              <span className="text-[11px] text-white/20 font-mono">
                fetched {lastFetched.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}

            {/* refresh button */}
            <button
              onClick={load}
              disabled={loading}
              title="Refresh contribution data"
              className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1 transition"
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-3 w-3 fill-none stroke-white/60 stroke-2 ${spinning ? "animate-spin" : ""}`}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <span className="text-[11px] text-white/40 font-mono">refresh</span>
            </button>
          </div>
        </div>

        {/* graph */}
        {error ? (
          <div className="text-xs font-mono text-white/25 py-4">
            couldn't load contribution data — GitHub API rate limit may be hit. try again in a minute.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="relative" style={{ minWidth: weeks.length * (CELL + GAP) }}>

              {/* month labels */}
              <div className="relative h-5 mb-1" style={{ paddingLeft: 28 }}>
                {monthLabels.map(({ label, col }) => (
                  <span
                    key={`${label}-${col}`}
                    className="absolute text-[10px] text-white/25 font-mono"
                    style={{ left: col * (CELL + GAP) }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex gap-0" style={{ gap: GAP }}>
                {/* day labels */}
                <div
                  className="flex flex-col shrink-0"
                  style={{ gap: GAP, marginTop: 1, width: 24 }}
                >
                  {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                    <div
                      key={i}
                      className="text-[9px] text-white/20 font-mono flex items-center"
                      style={{ height: CELL }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* grid */}
                <div className="flex" style={{ gap: GAP }}>
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                      {week.map((day, di) => {
                        const key = toKey(day);
                        const count = commitMap[key] || 0;
                        const level = loading ? -1 : getLevel(count);
                        const style =
                          level === -1
                            ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
                            : {
                                background: CELL_STYLE[level].bg,
                                border: `1px solid ${CELL_STYLE[level].border}`,
                                boxShadow: level >= 3 ? `0 0 6px ${CELL_STYLE[level].bg}` : "none",
                              };

                        return (
                          <div
                            key={di}
                            className={`rounded-[3px] cursor-default transition-transform hover:scale-125 ${loading ? "animate-pulse" : ""}`}
                            style={{ width: CELL, height: CELL, ...style }}
                            onMouseEnter={(e) => {
                              if (loading) return;
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltip({
                                x: rect.left + rect.width / 2,
                                y: rect.top - 8,
                                date: day.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
                                count,
                              });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* legend */}
              <div className="flex items-center gap-1.5 mt-3 justify-end">
                <span className="text-[10px] text-white/20 font-mono mr-1">less</span>
                {CELL_STYLE.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-[3px]"
                    style={{
                      width: CELL,
                      height: CELL,
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                    }}
                  />
                ))}
                <span className="text-[10px] text-white/20 font-mono ml-1">more</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* tooltip — rendered in a portal-like fixed div */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-white/80 border border-white/10 backdrop-blur-md"
          style={{
            background: "rgba(6,5,10,0.92)",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            whiteSpace: "nowrap",
          }}
        >
          <span className="text-white/40">{tooltip.date} — </span>
          <span className={tooltip.count > 0 ? "text-violet-300" : "text-white/30"}>
            {tooltip.count === 0 ? "no commits" : `${tooltip.count} commit${tooltip.count > 1 ? "s" : ""}`}
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.15; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}