// app/contact/page.jsx
"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import InteractiveMeshGrid from "../../components/InteractiveMeshGrid";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // SIMPLE MAILTO HANDLER
    // ⚠️ Replace this with your real email address
    const targetEmail = "your@email.com";

    const mailto = new URL(`mailto:${targetEmail}`);
    if (form.subject) mailto.searchParams.set("subject", form.subject);
    const bodyLines = [
      form.name && `Name: ${form.name}`,
      form.email && `Email: ${form.email}`,
      "",
      form.message,
    ].filter(Boolean);
    mailto.searchParams.set("body", bodyLines.join("%0D%0A"));

    setStatus("sending");
    window.location.href = mailto.toString();
    setTimeout(() => setStatus("sent"), 400); // just for small UI feedback
  };

  return (
    <>
      <Navbar />

      <InteractiveMeshGrid
        spacing={96}
        density={0.78}
        lineColor="rgba(255,255,255,0.03)"
        pointColor="rgba(168,85,247,0.95)"
        pointSize={1.6}
        warp={0.16}
        pointerSmoothing={0.16}
        spring={0.1}
        damping={0.84}
        disableBelow={420}
        maxPoints={1600}
      />

      <main className="relative z-10 text-foreground">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div
            className="relative rounded-2xl border-2 border-white/10 bg-black/30 backdrop-blur-xl overflow-hidden p-6 sm:p-8 lg:p-10"
          >
            {/* subtle glow bg */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at top left, rgba(129,140,248,0.16), transparent 55%), radial-gradient(ellipse at bottom right, rgba(168,85,247,0.16), transparent 55%)",
              }}
            />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
              {/* LEFT: intro / info */}
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-indigo-300/80 mb-3">
                  CONTACT
                </p>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.7rem] font-extrabold leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                    Let&apos;s talk about{" "}
                  </span>
                  <span className="text-foreground">what you&apos;re building.</span>
                </h1>

                <p className="mt-4 text-sm sm:text-base text-foreground/70 max-w-xl">
                  Whether it&apos;s collaborating on a project, discussing an idea,
                  or just saying hi — feel free to reach out. I usually respond
                  within a day or two (unless I&apos;m debugging something wild).
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                    Open to roles & collaborations
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-foreground/70">
                    Prefer detailed messages over &quot;hi&quot;
                  </span>
                </div>

                <div className="mt-8 space-y-2 text-sm text-foreground/70">
                  {/* replace mailto + text with your real email */}
                  <div>
                    Email:{" "}
                    <a
                      href="mailto:your@email.com"
                      className="text-indigo-300 hover:text-indigo-200 underline underline-offset-4"
                    >
                      your@email.com
                    </a>
                  </div>
                  <div>
                    GitHub:{" "}
                    <a
                      href="https://github.com/NIKSHITH-G"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-300 hover:text-indigo-200 underline underline-offset-4"
                    >
                      github.com/NIKSHITH-G
                    </a>
                  </div>
                </div>
              </div>

              {/* RIGHT: form card */}
              <div className="relative">
                <div className="rounded-2xl border border-white/12 bg-black/60 px-5 py-6 sm:px-6 sm:py-7 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/60 mb-1.5"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-white/12 bg-black/60 px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/60 mb-1.5"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-white/12 bg-black/60 px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/60 mb-1.5"
                      >
                        Subject
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-white/12 bg-black/60 px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400"
                        placeholder="What would you like to talk about?"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/60 mb-1.5"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-white/12 bg-black/60 px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-400 resize-none"
                        placeholder="Tell me a bit about your project, idea, or question."
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[0.7rem] text-foreground/50 max-w-[220px] leading-relaxed">
                        No spam, no noise. Just a real human reading your message.
                      </p>

                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="
                          inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium
                          bg-gradient-to-r from-indigo-500 to-violet-500 text-white
                          shadow-[0_18px_40px_rgba(79,70,229,0.45)]
                          ring-1 ring-indigo-300/40
                          hover:from-indigo-400 hover:to-violet-400
                          active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed
                          transition-transform transition-colors
                        "
                      >
                        {status === "sending" ? "Opening mail…" : "Send message"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
