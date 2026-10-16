"use client";

// Talking to Nikshith: a cinematic RPG-style conversation. The camera frames him
// in the room, letterbox bars slide in, and a dialogue box types his lines out
// while he (and his portrait) talk.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollText, X } from "lucide-react";
import { profile } from "../../../lib/content";
import { SUGGESTIONS, FOLLOWUPS, matchOffline } from "../../../lib/persona";
import { runtime } from "../store";
import BlockyAvatar from "../../BlockyAvatar";
import * as sfx from "../audio";

// the conversation carries on across visits to him during one session
let history = [];
const GREETING = "Oh hey! Welcome to my place. I'm Nikshith — well, the AI version of me. Ask me anything about my work, projects or studies.";
const WELCOME_BACK = "Back again? Good — what else do you want to know?";

// type the line out a couple of characters at a time, like a game
function useTypewriter(text) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (window.__reduceMotion) return setShown(text);
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text]);
  return [shown, shown.length >= text.length];
}

export function AskChat({ portrait }) {
  const [messages, setMessages] = useState(history);
  const [opening] = useState(() => (history.length ? WELCOME_BACK : GREETING));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const logRef = useRef(null);

  const lastReply = [...messages].reverse().find((m) => m.role === "me")?.text;
  const lastQuestion = [...messages].reverse().find((m) => m.role === "visitor")?.text;
  const line = busy ? "…" : messages.at(-1)?.role === "me" ? lastReply : opening;
  const [typed, done] = useTypewriter(line);

  // he talks (mouth, gestures) while his line is typing out
  useEffect(() => {
    runtime.npc.talking = !done && !busy;
  }, [done, busy]);
  useEffect(() => () => (runtime.npc.talking = false), []);
  useEffect(() => {
    history = messages;
  }, [messages]);
  useEffect(() => {
    if (showLog) logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [showLog, messages]);

  // follow-ups for what was just asked, then the general starters
  const choices = useMemo(() => {
    const asked = new Set(messages.filter((m) => m.role === "visitor").map((m) => m.text));
    const pool = [...(FOLLOWUPS[lastQuestion] ?? []), ...SUGGESTIONS, ...Object.values(FOLLOWUPS).flat()];
    return [...new Set(pool)].filter((q) => !asked.has(q)).slice(0, 4);
  }, [messages, lastQuestion]);

  const send = async (text) => {
    const q = text.trim().slice(0, 500);
    if (!q || busy) return;
    const next = [...messages, { role: "visitor", text: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    sfx.blip(true);
    const local = matchOffline(q);
    if (local.confident) {
      // a direct question he already knows the answer to: reply right away (a short beat so it feels natural)
      await new Promise((r) => setTimeout(r, 350));
      setMessages([...next, { role: "me", text: local.answer }]);
      setBusy(false);
      return;
    }
    // open-ended: ask the LLM, but never make anyone wait more than ~5 seconds
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }), signal: ctrl.signal });
      const data = await res.json();
      setMessages([...next, { role: "me", text: data.reply || local.answer }]);
    } catch {
      setMessages([...next, { role: "me", text: local.answer }]);
    }
    clearTimeout(timer);
    setBusy(false);
  };
  const sendRef = useRef(send);
  sendRef.current = send;

  // number keys pick a choice (when you're not typing); space skips the typing
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea")) return;
      const n = Number(e.key);
      if (n >= 1 && n <= choices.length) {
        e.preventDefault();
        sendRef.current(choices[n - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices]);

  return (
    <>
      {/* cinematic letterbox */}
      <motion.div initial={{ height: 0 }} animate={{ height: "7vh" }} exit={{ height: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="pointer-events-none fixed inset-x-0 top-0 z-30 bg-black" />
      <motion.div initial={{ height: 0 }} animate={{ height: "7vh" }} exit={{ height: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-black" />
      <div className="pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(ellipse_at_50%_35%,transparent_35%,rgba(0,0,0,0.55)_100%)]" />

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.35, type: "spring", stiffness: 180, damping: 22 } }}
        exit={{ y: 80, opacity: 0 }}
        className={`pointer-events-auto fixed inset-x-0 bottom-0 z-40 mx-auto px-3 pb-3 sm:px-6 sm:pb-5 ${portrait ? "" : "max-w-[860px]"}`}
      >
        {/* conversation log */}
        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 rounded-2xl border border-white/10 bg-[#14121c]/95 backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white/45">
                conversation log
                <button onClick={() => setShowLog(false)} aria-label="Close log" className="text-white/50 hover:text-white"><X size={14} /></button>
              </div>
              <div ref={logRef} className="max-h-[32vh] space-y-2.5 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed">
                <p className="text-white/75"><span className="font-semibold text-violet-300">Nikshith:</span> {GREETING}</p>
                {messages.map((m, i) => (
                  <p key={i} className={m.role === "me" ? "text-white/75" : "text-[#e8dcc0]"}>
                    <span className="font-semibold">{m.role === "me" ? <span className="text-violet-300">Nikshith:</span> : "You:"}</span> {m.text}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative rounded-2xl border-[3px] border-[#e8dcc0] bg-[#14121c]/95 shadow-[0_0_0_3px_#14121c,0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
          {/* name plate */}
          <div className="absolute -top-5 left-5 flex items-center gap-2 rounded-lg border-2 border-[#e8dcc0] bg-violet-600 px-3 py-1 font-pixel text-[12px] tracking-wider text-white shadow">
            NIKSHITH <span className="rounded bg-white/20 px-1 text-[8px]">AI</span>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setShowLog((v) => !v)} className="absolute -top-4 right-5 flex items-center gap-1.5 rounded-lg border-2 border-[#e8dcc0]/70 bg-[#14121c] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#e8dcc0] transition hover:bg-[#e8dcc0] hover:text-black">
              <ScrollText size={12} /> log
            </button>
          )}

          <div className="flex gap-4 p-4 pt-6 sm:gap-5 sm:p-5 sm:pt-7">
            <BlockyAvatar size={portrait ? 56 : 88} className="shrink-0 rounded-xl border-2 border-[#e8dcc0]/50" />
            <div className="min-w-0 flex-1">
              {lastQuestion && <div className="mb-1.5 truncate font-mono text-[11px] text-[#e8dcc0]/60">you asked: {lastQuestion}</div>}
              <p className="min-h-[3.4em] text-[15px] leading-relaxed text-white sm:text-[16.5px]" aria-live="polite">
                {typed}
                {done && !busy && <span className="ml-1 inline-block animate-bounce text-[#e8dcc0]">▾</span>}
              </p>
            </div>
          </div>

          {/* choices + free question */}
          <div className="min-h-[124px] border-t border-white/10 px-4 pb-4 pt-3 sm:px-5">
            {!busy && done && choices.length > 0 && (
              <div className={`grid gap-2 ${portrait ? "grid-cols-1" : "grid-cols-2"}`}>
                {choices.map((c, i) => (
                  <motion.button
                    key={c}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                    onClick={() => send(c)}
                    className="group flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-[13px] text-white/85 transition hover:border-[#e8dcc0]/60 hover:bg-white/[0.08] hover:text-white"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#e8dcc0]/15 font-mono text-[10px] text-[#e8dcc0] group-hover:bg-[#e8dcc0] group-hover:text-black">{i + 1}</span>
                    {c}
                  </motion.button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="mt-2.5 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="…or ask your own question"
                className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#e8dcc0]/50"
              />
              <button disabled={busy || !input.trim()} className="rounded-lg bg-[#e8dcc0] px-4 py-2 text-sm font-semibold text-black transition hover:bg-white disabled:opacity-40">
                Ask
              </button>
            </form>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/45">AI version of Nikshith — answers come from his real résumé and can be wrong. For anything important, email {profile.email}.</p>
      </motion.div>
    </>
  );
}
