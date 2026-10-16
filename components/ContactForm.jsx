"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_mc8ysnm";
const TEMPLATE_MAIN = "template_gedrp5l";
const TEMPLATE_AUTO = "template_rowmn13";
const PUBLIC_KEY = "UyM8c_VmTl027Xvxk";
const MAX_CHARS = 500;

const FIELD = {
  dark: "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.06]",
  // ruled-paper look for the letter at the front door
  paper: "w-full border-0 border-b border-[#c9b994] bg-transparent px-1 py-2 font-hand text-[22px] leading-tight text-[#2a2118] placeholder:text-[#a8916a] outline-none transition focus:border-[#7c2d12]",
};

export default function ContactForm({ tone = "dark" }) {
  const field = FIELD[tone];
  const paper = tone === "paper";
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const honeypot = useRef("");

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > MAX_CHARS) return;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // honeypot filled → it's a bot; pretend it worked
    if (honeypot.current) return setStatus("sent");
    if (!form.name || !form.email || !form.message) return setStatus("error");
    setStatus("sending");
    try {
      const params = {
        from_name: form.name,
        from_email: form.email,
        subject: form.subject,
        message: form.message,
      };
      await emailjs.send(SERVICE_ID, TEMPLATE_MAIN, params, PUBLIC_KEY);
      await emailjs.send(SERVICE_ID, TEMPLATE_AUTO, params, PUBLIC_KEY);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className={paper ? "rounded-lg border-2 border-dashed border-[#15803d]/40 p-5 font-hand text-2xl leading-snug text-[#14532d]" : "rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 text-sm text-emerald-200"}>
        {paper ? "Sealed and sent! I'll write back soon — keep an eye on your inbox." : "Message sent. I'll get back to you soon — check your inbox for a confirmation."}
        <button onClick={() => setStatus("idle")} className={`mt-3 block text-xs underline underline-offset-4 ${paper ? "font-mono text-[#15803d]" : "text-emerald-300/80"}`}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        onChange={(e) => (honeypot.current = e.target.value)}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Name</span>
          <input name="name" required placeholder="Name" value={form.name} onChange={onChange} className={field} />
        </label>
        <label className="block">
          <span className="sr-only">Email</span>
          <input name="email" type="email" required placeholder="Email" value={form.email} onChange={onChange} className={field} />
        </label>
      </div>
      <label className="block">
        <span className="sr-only">Subject</span>
        <input name="subject" placeholder="Subject (optional)" value={form.subject} onChange={onChange} className={field} />
      </label>
      <label className="block">
        <span className="sr-only">Message</span>
        <textarea name="message" required rows={paper ? 5 : 4} placeholder={paper ? "I'd love to chat about…" : "What's on your mind?"} value={form.message} onChange={onChange} className={`${field} resize-none`} />
      </label>
      <div className="flex items-center justify-between gap-3">
        <span className={`font-mono text-[11px] ${paper ? "text-[#a8916a]" : "text-white/35"}`}>
          {status === "error" ? (
            <span className={paper ? "text-[#b91c1c]" : "text-rose-300"}>Fill in name, email and message — or try again.</span>
          ) : (
            `${form.message.length}/${MAX_CHARS}`
          )}
        </span>
        <button
          type="submit"
          disabled={status === "sending"}
          className={paper ? "rounded-full bg-[#7c2d12] px-5 py-2 text-sm font-medium text-[#fbf6ea] shadow-[0_2px_0_#4a1a0a] transition hover:bg-[#9a3412] disabled:opacity-60" : "rounded-full bg-violet-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-60"}
        >
          {status === "sending" ? "Sending…" : paper ? "Seal & send ✉" : "Send message"}
        </button>
      </div>
    </form>
  );
}
