"use client";

// Private dashboard: who visits, where they go, and what they ask AI Nikshith.
// Unlocks with the same owner key as the chess board (remembered in this browser).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ownerKey, setOwnerKey } from "../../components/world/chess";

const ROOM_NAMES = {
  about: "TV (about)", experience: "Work desk", education: "Bookshelf", projects: "Arcade projects", skills: "Whiteboard",
  certs: "Trophies", music: "Piano", photos: "Camera / photos", contact: "Front door letter", github: "GitHub screen",
  library: "Kindle", now: "Now board", ask: "Talked to Nikshith", elevator: "Elevator", learning: "Training plan",
  photobooth: "Photo booth", treadmill: "Treadmill", bag: "Punching bag", snooker: "Snooker", chess: "Chess",
  arcade: "Arcade games", kanban: "Side quests", telescope: "Telescope", radio: "Radio", guestbook: "Guestbook",
};
const FLOOR_NAMES = { studio: "Studio (1F)", gym: "Gym & photo (2F)", games: "Games room (3F)", roof: "Rooftop" };
const HOW = {
  "built-in": ["answered", "bg-emerald-400/15 text-emerald-300"],
  ai: ["Gemini", "bg-violet-400/15 text-violet-300"],
  unknown: ["didn't know", "bg-amber-400/15 text-amber-300"],
};

const sum = (o = {}) => Object.values(o).reduce((a, b) => a + b, 0);
const ago = (t) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
};

function Card({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="font-mono text-[11px] uppercase tracking-widest text-white/45">{label}</div>
      <div className="mt-2 font-display text-5xl italic">{value}</div>
      {sub && <div className="mt-1 text-[13px] text-white/50">{sub}</div>}
    </div>
  );
}

function Bars({ title, data, names }) {
  const rows = Object.entries(data ?? {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(([, v]) => v));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="font-mono text-[11px] uppercase tracking-widest text-white/45">{title}</div>
      <ul className="mt-4 space-y-2">
        {rows.map(([id, v]) => (
          <li key={id} className="grid grid-cols-[140px_1fr_40px] items-center gap-3 text-[13px]">
            <span className="truncate text-white/75">{names[id] ?? id}</span>
            <span className="h-2 overflow-hidden rounded-full bg-white/5">
              <span className="block h-full rounded-full bg-violet-400/80" style={{ width: `${(v / max) * 100}%` }} />
            </span>
            <span className="text-right font-mono text-white/60">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Stats() {
  const [key, setKey] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async (k) => {
    setError("");
    const res = await fetch("/api/stats", { headers: { "x-owner-key": k } });
    if (res.status === 401) {
      setError("That key didn't work.");
      setData(null);
      return;
    }
    setOwnerKey(k);
    setData(await res.json());
  }, []);

  useEffect(() => {
    const k = ownerKey();
    if (k) {
      setKey(k);
      load(k);
    }
  }, [load]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d16] px-4 text-white">
        <form onSubmit={(e) => { e.preventDefault(); load(key); }} className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h1 className="font-display text-3xl italic">Studio stats</h1>
          <p className="mt-1 text-sm text-white/55">Private. Enter your owner key (the same one as the chess board).</p>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Owner key" className="mt-5 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-violet-400/60" />
          {error && <p className="mt-2 text-sm text-amber-300">{error}</p>}
          <button className="mt-4 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-black hover:bg-violet-100">Unlock</button>
        </form>
      </main>
    );
  }

  const { counts, daily, answers, questions } = data;
  const visits = sum(counts.visit);
  const entered = counts.enter?.studio ?? 0;
  const asked = sum(answers);
  const maxDay = Math.max(1, ...daily.map((d) => d.studio + d.classic));
  const shown = questions.filter((q) => filter === "all" || q.how === filter);

  return (
    <main className="min-h-screen bg-[#0b0d16] px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-emerald-300/80">// private</div>
            <h1 className="font-display text-5xl italic">Studio stats</h1>
          </div>
          <div className="flex gap-2 text-sm">
            <button onClick={() => load(key)} className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10">Refresh</button>
            <button onClick={() => { setOwnerKey(""); setData(null); setKey(""); }} className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10">Lock</button>
            <Link href="/" className="rounded-full bg-white px-4 py-2 font-medium text-black">Studio →</Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card label="Visits" value={visits} sub={`${counts.visit?.studio ?? 0} studio · ${counts.visit?.classic ?? 0} classic page`} />
          <Card label="Entered the studio" value={entered} sub={counts.visit?.studio ? `${Math.round((entered / counts.visit.studio) * 100)}% of studio visitors` : "—"} />
          <Card label="Questions asked" value={asked} sub={`${answers.unknown} he couldn't answer`} />
          <Card label="Explored everything" value={counts.explored?.all ?? 0} sub="found all the rooms" />
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-[11px] uppercase tracking-widest text-white/45">Visits · last 30 days</div>
            <div className="flex gap-4 font-mono text-[11px] text-white/45"><span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-violet-400" />studio</span><span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-emerald-400" />classic</span></div>
          </div>
          <div className="mt-4 flex h-36 items-end gap-1">
            {daily.map((d) => (
              <div key={d.day} title={`${d.day}: ${d.studio} studio, ${d.classic} classic, ${d.entered} entered, ${d.questions} questions`} className="flex h-full flex-1 flex-col justify-end">
                <div className="rounded-t-sm bg-emerald-400/80" style={{ height: `${(d.classic / maxDay) * 100}%` }} />
                <div className="bg-violet-400/80" style={{ height: `${(d.studio / maxDay) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-white/35"><span>{daily[0].day}</span><span>today</span></div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Bars title="Rooms opened" data={counts.panel} names={ROOM_NAMES} />
          <div className="space-y-3">
            <Bars title="Floors visited by elevator" data={counts.floor} names={FLOOR_NAMES} />
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-[13px] text-white/55">
              Counts are anonymous: no cookies, names or IP addresses are stored. Each visit is counted once per browser session.
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-[11px] uppercase tracking-widest text-white/45">What people asked Nikshith · latest {questions.length}</div>
            <div className="flex gap-1.5 text-[12px]">
              {["all", "unknown", "ai", "built-in"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 ${filter === f ? "bg-white text-black" : "border border-white/15 text-white/65 hover:text-white"}`}>
                  {f === "all" ? "All" : HOW[f][0]}
                </button>
              ))}
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="mt-6 text-sm text-white/45">No questions yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/5">
              {shown.map((q, i) => (
                <li key={i} className="flex items-start justify-between gap-4 py-2.5">
                  <span className="text-[14px] text-white/85">{q.q}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${HOW[q.how]?.[1] ?? ""}`}>{HOW[q.how]?.[0] ?? q.how}</span>
                    <span className="w-14 text-right font-mono text-[11px] text-white/35">{ago(q.t)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[12px] text-white/40">Tip: the &ldquo;didn&apos;t know&rdquo; ones are the questions worth teaching him — send them to me with your answers.</p>
        </div>
      </div>
    </main>
  );
}
