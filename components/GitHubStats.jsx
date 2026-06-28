"use client";

import { useEffect, useState } from "react";
import GitHubContributions from "./GitHubContributions";

function StatsRow() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/github");
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        setStats(data.stats);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading)
    return <div className="text-white/30 text-xs sm:text-sm">Loading...</div>;
  if (error)
    return (
      <div className="text-white/30 text-xs sm:text-sm">
        GitHub stats unavailable
      </div>
    );

  const statItems = [
    { label: "Repositories", value: stats.publicRepos },
    { label: "Followers", value: stats.followers },
    { label: "Stars earned", value: stats.totalStars },
  ];

  return (
    <>
      {statItems.map((s) => (
        <div
          key={s.label}
          className="px-2 sm:px-3 py-1 bg-white/5 rounded-full text-xs sm:text-sm whitespace-nowrap"
        >
          {s.value} {s.label}
        </div>
      ))}
    </>
  );
}

export default function GitHubStats() {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-white/5 bg-[rgba(255,255,255,0.02)] backdrop-blur-md px-4 sm:px-6 py-4 sm:py-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <a
          href="https://github.com/NIKSHITH-G"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-mono text-white/40 hover:text-white/70 transition-colors"
        >
          @NIKSHITH-G
        </a>

        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <StatsRow />
        </div>
      </div>

      {/* DIVIDER */}
      <div className="h-px bg-white/6 my-3 sm:my-4" />

      {/* CONTRIBUTIONS */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <GitHubContributions />
      </div>
    </div>
  );
}
