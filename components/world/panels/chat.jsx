"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { profile } from "../../../lib/content";
import { SUGGESTIONS } from "../../../lib/persona";
import * as sfx from "../audio";

// the conversation survives closing and reopening the window during a visit
let history = [];

function Backdrop() {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-30 bg-black/60" />;
}

export function AskChat({ portrait }) {
  const [messages, setMessages] = useState(history);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef(null);
  const field = useRef(null);

  useEffect(() => {
    history = messages;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);
  useEffect(() => {
    const t = setTimeout(() => field.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const send = async (text) => {
    const q = text.trim().slice(0, 500);
    if (!q || busy) return;
    const next = [...messages, { role: "visitor", text: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    sfx.blip(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "me", text: data.reply || data.error || "Hmm, something went wrong." }]);
    } catch {
      setMessages([...next, { role: "me", text: `I can't reach my brain right now. Email ${profile.email} instead!` }]);
    }
    setBusy(false);
    sfx.hover();
  };

  return (
    <>
      <Backdrop />
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-3 pb-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.15, type: "spring", stiffness: 200, damping: 24 } }}
          exit={{ opacity: 0, y: 30 }}
          className={`pointer-events-auto flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0e0f17] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)] ${portrait ? "h-[calc(100vh-110px)] w-[96vw]" : "h-[min(640px,78vh)] w-[440px]"}`}
        >
          {/* header */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3.5">
            <div className="relative">
              <Image src={profile.photo} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-400/50" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0e0f17] bg-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">AI {profile.name.split(" ")[0]}</div>
              <div className="text-[11px] text-white/45">An AI version of me · answers from my real résumé</div>
            </div>
          </div>

          {/* messages */}
          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-5">
            <Bubble role="me">
              Hey! I&apos;m the AI version of {profile.name.split(" ")[0]}. Ask me about my work, projects, studies or what I&apos;m looking for next.
            </Bubble>
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>{m.text}</Bubble>
            ))}
            {busy && (
              <div className="flex gap-1 px-2 py-2" aria-label="Typing">
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} className="h-2 w-2 rounded-full bg-white/40" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }} />
                ))}
              </div>
            )}
            {messages.length === 0 && !busy && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1.5 text-xs text-violet-100 transition hover:bg-violet-400/20">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
          >
            <input
              ref={field}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Ask me anything…"
              className="flex-1 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-400/50"
            />
            <button disabled={busy || !input.trim()} aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 text-white transition hover:bg-violet-400 disabled:opacity-40">
              <ArrowUp size={18} />
            </button>
          </form>
          <p className="pb-3 text-center text-[10px] text-white/30">AI answers can be wrong — for anything important, email {profile.email}.</p>
        </motion.div>
      </div>
    </>
  );
}

function Bubble({ role, children }) {
  const mine = role === "visitor";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${mine ? "rounded-br-md bg-violet-500 text-white" : "rounded-bl-md bg-white/[0.07] text-white/90"}`}>
        {children}
      </div>
    </motion.div>
  );
}
