"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";

const FORM_ENDPOINT = "https://formspree.io/f/your-form-id"; // <- replace with your Formspree endpoint or your API

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  const update = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    // basic email regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.message.trim()) return "Please enter a message.";
    if (form.message.length < 10) return "Message should be at least 10 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus({ loading: false, ok: false, msg: err });
      return;
    }

    setStatus({ loading: true, ok: null, msg: "" });

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus({ loading: false, ok: true, msg: "Thanks — your message was sent!" });
        setForm({ name: "", email: "", message: "" });
      } else {
        const data = await res.json().catch(() => null);
        const message = (data && data.error) || "Something went wrong — please try again later.";
        setStatus({ loading: false, ok: false, msg: message });
      }
    } catch (err) {
      setStatus({ loading: false, ok: false, msg: "Network error — check your connection." });
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-20">
        <section className="w-full max-w-3xl rounded-2xl border border-white/12 bg-[#0b0b0d]/70 p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Contact</h1>
          <p className="text-sm text-foreground/70 mb-6">
            Want to work together or have a question? Send me a message and I&apos;ll get back to you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-foreground/60">Name</span>
                <input
                  required
                  value={form.name}
                  onChange={update("name")}
                  className="mt-1 block w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  placeholder="Your name"
                />
              </label>

              <label className="block">
                <span className="text-xs text-foreground/60">Email</span>
                <input
                  required
                  value={form.email}
                  onChange={update("email")}
                  type="email"
                  className="mt-1 block w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs text-foreground/60">Message</span>
              <textarea
                required
                value={form.message}
                onChange={update("message")}
                rows={6}
                className="mt-1 block w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-y"
                placeholder="Tell me about your project, collaboration idea, or any questions..."
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={status.loading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status.loading ? "Sending…" : "Send Message"}
              </button>

              <div className="text-sm">
                {status.ok === true && <span className="text-green-400">{status.msg}</span>}
                {status.ok === false && <span className="text-rose-400">{status.msg}</span>}
              </div>
            </div>
          </form>

          <hr className="my-6 border-white/6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-foreground/70">
            <div>
              <h4 className="font-semibold mb-1">Email</h4>
              <a href="mailto:your.email@example.com" className="underline hover:text-white">your.email@example.com</a>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Find me</h4>
              <div className="flex gap-3">
                <a className="underline hover:text-white" href="https://github.com/your-username" target="_blank" rel="noreferrer">GitHub</a>
                <a className="underline hover:text-white" href="https://www.linkedin.com/in/your-username" target="_blank" rel="noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}