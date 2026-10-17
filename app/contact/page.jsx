import Link from "next/link";
import ContactForm from "../../components/ContactForm";
import { profile, socials } from "../../lib/content";

export default function Contact() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-16 sm:px-6">
      <Link href="/" className="font-mono text-xs text-white/45 transition hover:text-white">← back to the house</Link>
      <div className="mt-8 font-mono text-xs text-emerald-300/80">// front door</div>
      <h1 className="mt-1 font-display text-5xl italic text-white sm:text-6xl">Let&apos;s talk.</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-white/70">
        {profile.status} Send a message, or email{" "}
        <a href={`mailto:${profile.email}`} className="text-violet-300 underline underline-offset-4">{profile.email}</a>.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
      <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-5 text-sm text-white/55">
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
            {s.label} ↗
          </a>
        ))}
      </div>
    </main>
  );
}
