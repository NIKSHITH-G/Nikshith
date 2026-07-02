"use client";

import { useEffect, useState } from "react";
import { Star, GitFork } from "lucide-react";
import GitHubContributions from "./GitHubContributions";

// A handful of common language dot colours (mirrors github.com); anything
// unlisted falls back to a neutral grey so the layout never breaks.
const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Shell: "#89e051",
  "Jupyter Notebook": "#DA5B0B",
  Dart: "#00B4AB",
  Kotlin: "#A97BFF",
  Ruby: "#701516",
  PHP: "#4F5D95",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const day = 86400000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function RepoCard({ repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 sm:p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-white/[0.05]"
    >
      <div className="flex items-center gap-1.5">
        <span className="truncate font-mono text-sm text-indigo-200 group-hover:text-indigo-100">
          {repo.name}
        </span>
        <svg
          className="h-3 w-3 shrink-0 text-white/30 opacity-0 transition-opacity group-hover:opacity-100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 17 17 7M7 7h10v10" />
        </svg>
      </div>

      {repo.description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-white/55">
          {repo.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-mono text-[11px] text-white/45">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: LANG_COLORS[repo.language] || "#8b8b8b" }}
            />
            {repo.language}
          </span>
        )}
        {repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {repo.stars}
          </span>
        )}
        {repo.forks > 0 && (
          <span className="flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            {repo.forks}
          </span>
        )}
        <span className="ml-auto whitespace-nowrap">
          updated {timeAgo(repo.pushedAt)}
        </span>
      </div>
    </a>
  );
}

export default function GitHubStats() {
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/github");
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        if (!alive) return;
        setStats(data.stats);
        setRepos(Array.isArray(data.repos) ? data.repos : []);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const statItems = stats
    ? [
        { label: "Repositories", value: stats.publicRepos },
        { label: "Followers", value: stats.followers },
        { label: "Stars earned", value: stats.totalStars },
      ]
    : [];

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
          {loading && (
            <div className="text-white/30 text-xs sm:text-sm">Loading...</div>
          )}
          {error && (
            <div className="text-white/30 text-xs sm:text-sm">
              GitHub stats unavailable
            </div>
          )}
          {statItems.map((s) => (
            <div
              key={s.label}
              className="px-2 sm:px-3 py-1 bg-white/5 rounded-full text-xs sm:text-sm whitespace-nowrap"
            >
              {s.value} {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="h-px bg-white/6 my-3 sm:my-4" />

      {/* CONTRIBUTIONS */}
      <GitHubContributions />

      {/* RECENTLY PUSHED REPOS */}
      {repos.length > 0 && (
        <div className="mt-4 sm:mt-5">
          <div className="mb-3 font-mono text-xs text-white/40">
            // recently pushed
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {repos.map((r) => (
              <RepoCard key={r.name} repo={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
