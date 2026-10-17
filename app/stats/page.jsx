"use client";

// Private dashboard, styled like an arcade cabinet's high-score screen:
// who visits, where they go, and what they ask AI Nikshith.
// Unlocks with the same owner key as the chess board (remembered in this browser).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ownerKey, setOwnerKey } from "../../components/world/chess";

const ROOM_NAMES = {
  about: "TV", experience: "Work desk", education: "Bookshelf", projects: "Arcade projects", skills: "Whiteboard",
  certs: "Trophies", music: "Piano", photos: "Camera", contact: "Front door", github: "GitHub screen",
  library: "Kindle", now: "Now board", ask: "Talk to Nikshith", elevator: "Elevator", learning: "Training plan",
  photobooth: "Photo booth", treadmill: "Treadmill", bag: "Punching bag", snooker: "Snooker", chess: "Chess",
  arcade: "Arcade games", kanban: "Side quests", telescope: "Telescope", radio: "Radio", guestbook: "Guestbook",
};
const FLOOR_NAMES = { studio: "Ground 1F", gym: "Gym 2F", games: "Games 3F", roof: "Rooftop" };
const HOW = {
  "built-in": ["ANSWERED", "text-emerald-300 border-emerald-400"],
  ai: ["GEMINI", "text-violet-300 border-violet-400"],
  unknown: ["DIDN'T KNOW", "text-amber-300 border-amber-400"],
};
const RANK = ["1ST", "2ND", "3RD"];
const RANK_COLOR = ["text-amber-300", "text-slate-200", "text-orange-400"];

const sum = (o = {}) => Object.values(o).reduce((a, b) => a + b, 0);
const pad = (n, w = 6) => String(n).padStart(w, "0");
const ago = (t) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 60) return `${m}M`;
  if (m < 1440) return `${Math.round(m / 60)}H`;
  return `${Math.round(m / 1440)}D`;
};

const panel = "border-4 border-[#3b2f7a] bg-[#120f2b] shadow-[6px_6px_0_#000]";

function Screen({ children }) {
  return (
    <main className="relative min-h-screen bg-[#0a0820] px-4 py-8 font-pixel text-white sm:px-8">
      {children}
      {/* CRT scanlines */}
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[repeating-linear-gradient(transparent_0_3px,rgba(0,0,0,0.25)_3px_4px)]" />
    </main>
  );
}

function Score({ label, value, sub, color }) {
  return (
    <div className={`${panel} p-4`}>
      <div className="text-[11px] tracking-widest text-white/50">{label}</div>
      <div className={`mt-2 text-4xl tabular-nums ${color}`}>{pad(value)}</div>
      {sub && <div className="mt-1 font-mono text-[12px] text-white/45">{sub}</div>}
    </div>
  );
}

function HighScores({ title, data, names, limit = 99 }) {
  const all = Object.entries(data ?? {}).sort((a, b) => b[1] - a[1]);
  const rows = all.slice(0, limit);
  const unseen = all.slice(limit).filter(([, v]) => !v).length;
  const max = Math.max(1, ...rows.map(([, v]) => v));
  return (
    <div className={`${panel} p-5`}>
      <div className="text-center text-xl tracking-widest text-amber-300 [text-shadow:3px_3px_0_#7c2d12]">{title}</div>
      <ol className="mt-5 space-y-1.5">
        {rows.map(([id, v], i) => (
          <li key={id} className={`grid grid-cols-[44px_1fr_90px_56px] items-center gap-3 text-[13px] ${v ? "" : "opacity-35"}`}>
            <span className={RANK_COLOR[i] ?? "text-white/50"}>{RANK[i] ?? `${i + 1}TH`}</span>
            <span className="truncate uppercase">{names[id] ?? id}</span>
            <span className="flex h-3 gap-[2px]">
              {Array.from({ length: 10 }, (_, k) => (
                <i key={k} className={`h-full flex-1 ${k < Math.ceil((v / max) * 10) && v ? "bg-violet-400" : "bg-white/10"}`} />
              ))}
            </span>
            <span className="text-right tabular-nums text-white/80">{pad(v, 4)}</span>
          </li>
        ))}
      </ol>
      {all.length > limit && (
        <p className="mt-4 text-center text-[11px] text-white/40">
          + {all.length - limit} MORE{unseen ? ` · ${unseen} NOBODY HAS FOUND YET` : ""}
        </p>
      )}
    </div>
  );
}

// Rooftop guestbook moderation: notes stay hidden until approved here.
function Guestbook({ k }) {
  const [notes, setNotes] = useState(null);
  const [busy, setBusy] = useState(null);
  const headers = { "Content-Type": "application/json", "x-owner-key": k };

  const load = useCallback(async () => {
    const res = await fetch("/api/guestbook", { headers: { "x-owner-key": k }, cache: "no-store" });
    if (res.ok) setNotes((await res.json()).notes);
  }, [k]);
  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, action) => {
    if (action === "delete" && !window.confirm("Delete this note for good?")) return;
    setBusy(id);
    const res = await fetch("/api/guestbook", { method: "POST", headers, body: JSON.stringify({ action, id }) });
    if (res.ok) setNotes((await res.json()).notes);
    setBusy(null);
  };

  const pending = (notes ?? []).filter((n) => !n.approved);
  const live = (notes ?? []).filter((n) => n.approved);
  const Note = ({ n, waiting }) => (
    <li className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[12px]">
          <i className="inline-block h-3 w-3 shrink-0" style={{ background: n.color }} />
          <span className="text-amber-200">{n.name}</span>
          <span className="text-white/35">{ago(n.at)} AGO</span>
        </div>
        <p className="mt-1 break-words font-mono text-[14px] text-white/90">{n.message}</p>
      </div>
      <div className="flex shrink-0 gap-2 text-[11px]">
        {waiting && (
          <button disabled={busy === n.id} onClick={() => act(n.id, "approve")} className="border-2 border-emerald-400 px-2.5 py-1 text-emerald-300 hover:bg-emerald-400 hover:text-black disabled:opacity-40">
            ✓ APPROVE
          </button>
        )}
        <button disabled={busy === n.id} onClick={() => act(n.id, "delete")} className="border-2 border-rose-400/70 px-2.5 py-1 text-rose-300 hover:bg-rose-400 hover:text-black disabled:opacity-40">
          ✕ DELETE
        </button>
      </div>
    </li>
  );

  return (
    <div className={`${panel} mt-4 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13px] tracking-widest text-white/70">
          ROOFTOP GUESTBOOK {pending.length > 0 && <span className="ml-2 bg-amber-400 px-2 py-0.5 text-black">{pending.length} WAITING</span>}
        </div>
        <button onClick={load} className="border-2 border-white/20 px-2.5 py-1 text-[11px] text-white/65 hover:border-white/60">↻ RELOAD</button>
      </div>
      {notes === null ? (
        <p className="mt-6 text-[13px] text-white/45">LOADING…</p>
      ) : (
        <>
          <div className="mt-5 text-[11px] tracking-widest text-amber-300">WAITING FOR YOU · {pending.length}</div>
          {pending.length ? (
            <ul className="divide-y-2 divide-dashed divide-white/10">{pending.map((n) => <Note key={n.id} n={n} waiting />)}</ul>
          ) : (
            <p className="mt-2 font-mono text-[13px] text-white/40">Nothing to review. Approved notes show on the rooftop board.</p>
          )}
          <div className="mt-6 text-[11px] tracking-widest text-emerald-300">ON THE BOARD · {live.length}</div>
          {live.length ? (
            <ul className="divide-y-2 divide-dashed divide-white/10">{live.map((n) => <Note key={n.id} n={n} />)}</ul>
          ) : (
            <p className="mt-2 font-mono text-[13px] text-white/40">No approved notes yet.</p>
          )}
        </>
      )}
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
      setError("WRONG KEY. TRY AGAIN");
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
      <Screen>
        <div className="flex min-h-[80vh] items-center justify-center">
          <form onSubmit={(e) => { e.preventDefault(); load(key); }} className={`${panel} w-full max-w-sm p-6 text-center`}>
            <div className="text-3xl text-amber-300 [text-shadow:4px_4px_0_#7c2d12]">HOUSE STATS</div>
            <p className="mt-3 text-[12px] text-white/55">OWNER ONLY. INSERT KEY TO CONTINUE</p>
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="OWNER KEY" className="mt-6 w-full border-4 border-[#3b2f7a] bg-black px-3 py-2.5 font-mono text-sm outline-none focus:border-violet-400" />
            {error && <p className="mt-3 text-[12px] text-rose-400">{error}</p>}
            <button className="mt-5 w-full bg-violet-500 py-3 text-sm tracking-widest shadow-[4px_4px_0_#000] hover:bg-violet-400">▶ PRESS START</button>
          </form>
        </div>
      </Screen>
    );
  }

  const { counts, daily, answers, questions } = data;
  const visits = sum(counts.visit);
  const entered = counts.enter?.studio ?? 0;
  const asked = sum(answers);
  const maxDay = Math.max(1, ...daily.map((d) => d.studio + d.classic));
  const shown = questions.filter((q) => filter === "all" || q.how === filter);

  return (
    <Screen>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[12px] tracking-widest text-emerald-300">1UP · OWNER</div>
            <h1 className="mt-1 text-4xl text-amber-300 [text-shadow:4px_4px_0_#7c2d12] sm:text-5xl">HOUSE STATS</h1>
          </div>
          <div className="flex gap-2 text-[12px]">
            <button onClick={() => load(key)} className="border-4 border-[#3b2f7a] bg-[#120f2b] px-3 py-2 hover:border-violet-400">↻ REFRESH</button>
            <button onClick={() => { setOwnerKey(""); setData(null); setKey(""); }} className="border-4 border-[#3b2f7a] bg-[#120f2b] px-3 py-2 hover:border-violet-400">LOCK</button>
            <Link href="/" className="bg-violet-500 px-3 py-2.5 shadow-[4px_4px_0_#000] hover:bg-violet-400">▶ HOUSE</Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Score label="PLAYERS" value={visits} sub={`${counts.visit?.studio ?? 0} 3D house · ${counts.visit?.classic ?? 0} classic`} color="text-amber-300" />
          <Score label="PRESSED START" value={entered} sub={counts.visit?.studio ? `${Math.round((entered / counts.visit.studio) * 100)}% of 3D house visitors` : "—"} color="text-emerald-300" />
          <Score label="QUESTIONS" value={asked} sub={`${answers.unknown} he couldn't answer`} color="text-violet-300" />
          <Score label="100% CLEARS" value={counts.explored?.all ?? 0} sub="found every room" color="text-rose-300" />
        </div>

        <Guestbook k={key} />

        <div className={`${panel} mt-4 p-5`}>
          <div className="flex items-baseline justify-between text-[12px]">
            <span className="tracking-widest text-white/60">PLAYERS · LAST 30 DAYS</span>
            <span className="flex gap-4 text-white/50"><span><i className="mr-1 inline-block h-2.5 w-2.5 bg-violet-400" />3D HOUSE</span><span><i className="mr-1 inline-block h-2.5 w-2.5 bg-emerald-400" />CLASSIC</span></span>
          </div>
          <div className="mt-4 flex h-36 items-end gap-1">
            {daily.map((d) => (
              <div key={d.day} title={`${d.day}: ${d.studio} 3D house, ${d.classic} classic, ${d.entered} entered, ${d.questions} questions`} className="flex h-full flex-1 flex-col justify-end border-b-2 border-white/10">
                <div className="bg-emerald-400" style={{ height: `${(d.classic / maxDay) * 100}%` }} />
                <div className="bg-violet-400" style={{ height: `${(d.studio / maxDay) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/35"><span>{daily[0].day}</span><span>TODAY</span></div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <HighScores title="HIGH SCORES · ROOMS" data={counts.panel} names={ROOM_NAMES} limit={10} />
          <div className="space-y-4">
            <HighScores title="FLOORS" data={counts.floor} names={FLOOR_NAMES} />
            <div className={`${panel} p-4 font-mono text-[12px] leading-relaxed text-white/55`}>
              No cookies, names or IP addresses are stored. Each visit counts once per browser session.
            </div>
          </div>
        </div>

        <div className={`${panel} mt-4 p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[13px] tracking-widest text-white/70">DIALOGUE LOG · {questions.length}</div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {["all", "unknown", "ai", "built-in"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`border-2 px-2.5 py-1 ${filter === f ? "border-white bg-white text-black" : "border-white/20 text-white/65 hover:border-white/60"}`}>
                  {f === "all" ? "ALL" : HOW[f][0]}
                </button>
              ))}
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="mt-6 text-[13px] text-white/45">NO QUESTIONS YET</p>
          ) : (
            <ul className="mt-4 divide-y-2 divide-dashed divide-white/10">
              {shown.map((q, i) => (
                <li key={i} className="flex items-start justify-between gap-4 py-2.5">
                  <span className="font-mono text-[14px] text-white/90"><span className="text-violet-300">YOU:</span> {q.q}</span>
                  <span className="flex shrink-0 items-center gap-2 text-[10px]">
                    <span className={`border-2 px-1.5 py-0.5 ${HOW[q.how]?.[1] ?? ""}`}>{HOW[q.how]?.[0] ?? q.how}</span>
                    <span className="w-8 text-right text-white/40">{ago(q.t)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 font-mono text-[12px] text-white/40">Tip: the &ldquo;didn&apos;t know&rdquo; ones are worth teaching him. Send them over with your answers.</p>
        </div>
      </div>
    </Screen>
  );
}
