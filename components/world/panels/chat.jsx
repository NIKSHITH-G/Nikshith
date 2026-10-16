"use client";

// Talking to Nikshith: an RPG-style dialogue box at the bottom of the screen
// while the camera frames him in the room.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { profile } from "../../../lib/content";
import { SUGGESTIONS } from "../../../lib/persona";
import * as sfx from "../audio";

// the conversation carries on across visits to him during one session
let history = [];
const GREETING = "Oh hey! Welcome to my place. I'm Nikshith — well, the AI version of me. Ask me anything about my work, projects or studies.";

// type the line out a few characters at a time, like a game
function useTypewriter(text) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (window.__reduceMotion) return setShown(text);
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i % 8 === 0) sfx.beep?.(880 + Math.random() * 120, 0.012);
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text]);
  return [shown, shown.length >= text.length];
}

export function AskChat({ portrait }) {
  const [messages, setMessages] = useState(history);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState(() => new Set(history.filter((m) => m.role === "visitor").map((m) => m.text)));
  const field = useRef(null);

  const lastReply = [...messages].reverse().find((m) => m.role === "me")?.text ?? GREETING;
  const lastQuestion = [...messages].reverse().find((m) => m.role === "visitor")?.text;
  const [line, done] = useTypewriter(busy ? "…" : lastReply);
  const choices = SUGGESTIONS.filter((s) => !asked.has(s)).slice(0, 4);

  useEffect(() => {
    history = messages;
  }, [messages]);

  const send = async (text) => {
    const q = text.trim().slice(0, 500);
    if (!q || busy) return;
    const next = [...messages, { role: "visitor", text: q }];
    setMessages(next);
    setAsked((a) => new Set(a).add(q));
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await res.json();
      setMessages([...next, { role: "me", text: data.reply || data.error || "Hmm, I lost my train of thought." }]);
    } catch {
      setMessages([...next, { role: "me", text: `My brain's offline for a sec — email ${profile.email} instead!` }]);
    }
    setBusy(false);
  };
  const sendRef = useRef(send);
  sendRef.current = send;

  // number keys pick a choice (when you're not typing)
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
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.35, type: "spring", stiffness: 180, damping: 22 } }}
      exit={{ y: 60, opacity: 0 }}
      className={`pointer-events-auto fixed inset-x-0 bottom-0 z-40 mx-auto px-3 pb-3 sm:px-6 sm:pb-6 ${portrait ? "" : "max-w-4xl"}`}
    >
      <div className="relative rounded-2xl border-[3px] border-[#e8dcc0] bg-[#14121c]/95 shadow-[0_0_0_3px_#14121c,0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
        {/* name plate */}
        <div className="absolute -top-5 left-5 flex items-center gap-2 rounded-lg border-2 border-[#e8dcc0] bg-violet-600 px-3 py-1 font-pixel text-[12px] tracking-wider text-white shadow">
          NIKSHITH <span className="rounded bg-white/20 px-1 text-[8px]">AI</span>
        </div>

        <div className={`flex gap-4 p-4 pt-6 sm:gap-5 sm:p-5 sm:pt-7 ${portrait ? "flex-col" : ""}`}>
          {!portrait && (
            <div className="shrink-0">
              <Image src={profile.photo} alt="Nikshith" width={92} height={92} className="h-[92px] w-[92px] rounded-xl border-2 border-[#e8dcc0]/60 object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {lastQuestion && <div className="mb-1.5 truncate font-mono text-[11px] text-white/40">you: {lastQuestion}</div>}
            <p className="min-h-[3.2em] text-[15px] leading-relaxed text-white sm:text-[16px]" aria-live="polite">
              {line}
              {done && !busy && <span className="ml-1 inline-block animate-bounce text-[#e8dcc0]">▾</span>}
            </p>

            {/* choices */}
            {!busy && done && choices.length > 0 && (
              <div className={`mt-4 grid gap-2 ${portrait ? "grid-cols-1" : "grid-cols-2"}`}>
                {choices.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="group flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-[13px] text-white/85 transition hover:border-[#e8dcc0]/60 hover:bg-white/[0.08] hover:text-white"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#e8dcc0]/15 font-mono text-[10px] text-[#e8dcc0] group-hover:bg-[#e8dcc0] group-hover:text-black">{i + 1}</span>
                    {c}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="mt-3 flex items-center gap-2"
            >
              <input
                ref={field}
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
      </div>
      <p className="mt-2 text-center text-[10px] text-white/40">AI version of Nikshith — answers come from his real résumé and can be wrong. For anything important, email {profile.email}.</p>
    </motion.div>
  );
}
