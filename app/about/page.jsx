import Image from "next/image";
import Link from "next/link";
import {
  profile, socials, experience, education, projects, skills, certifications, music, photography,
} from "../../lib/content";
import GitHubStats from "../../components/GitHubStats";
import BlockyAvatar from "../../components/BlockyAvatar";

// The classic, no-3D version of the portfolio: fast, printable, recruiter-friendly.

function Section({ id, kicker, title, children }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-white/10 py-12 sm:py-16">
      <div className="grid gap-6 md:grid-cols-[200px_1fr] md:gap-10">
        <div>
          <div className="font-mono text-xs text-emerald-300/80">// {kicker}</div>
          <h2 className="mt-1 font-display text-3xl italic text-white sm:text-4xl">{title}</h2>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

const chip = "rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/70";

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between bg-[#0b0d16]/85 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <Link href="/" className="font-display text-xl italic text-white">Nikshith&apos;s Studio</Link>
        <nav className="flex items-center gap-4 text-sm text-white/60">
          <a href="#projects" className="hidden hover:text-white sm:inline">Projects</a>
          <a href="#experience" className="hidden hover:text-white sm:inline">Experience</a>
          <Link href="/contact" className="hover:text-white">Contact</Link>
          <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="hover:text-white">Résumé</a>
          <Link href="/" className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black transition hover:bg-violet-200">
            Enter 3D studio →
          </Link>
        </nav>
      </header>

      <main>
        <div className="flex flex-col gap-8 py-14 sm:flex-row sm:items-center sm:py-20">
          <BlockyAvatar size={128} className="shrink-0 rounded-3xl ring-1 ring-white/15" />
          <div>
            <div className="font-mono text-xs tracking-widest text-emerald-300/80">{profile.location.toUpperCase()}</div>
            <h1 className="mt-2 font-display text-5xl italic leading-none text-white sm:text-7xl">{profile.name}</h1>
            <p className="mt-3 text-lg text-white/70">{profile.role} — {profile.tagline.toLowerCase()}</p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/55">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-white hover:underline">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        <Section id="about" kicker="about" title="Hello">
          <div className="space-y-4 text-[15px] leading-relaxed text-white/75">
            {profile.bio.map((p) => <p key={p}>{p}</p>)}
            <p className="text-emerald-200/90">{profile.status}</p>
          </div>
        </Section>

        <Section id="projects" kicker="projects" title="Things I've built">
          <div className="space-y-8">
            {projects.map((p) => (
              <article key={p.name}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-semibold" style={{ color: p.color }}>
                    {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.name} ↗</a> : p.name}
                    {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer" className="ml-3 font-mono text-xs font-normal text-white/45 hover:text-white">source ↗</a>}
                  </h3>
                  <span className="font-mono text-xs text-white/40">{p.year}</span>
                </div>
                <p className="font-display text-xl italic text-white/85">{p.tagline}</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-white/65 marker:text-white/30">
                  {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => <span key={s} className={chip}>{s}</span>)}
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="experience" kicker="experience" title="Where I've worked">
          <div className="space-y-8">
            {experience.map((e) => (
              <article key={e.company}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-medium text-white">{e.role} · <span className="text-violet-200/90">{e.company}</span></h3>
                  <span className="font-mono text-xs text-white/40">{e.dates}</span>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-white/65 marker:text-violet-400/60">
                  {e.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        <Section id="education" kicker="education" title="Where I studied">
          <div className="space-y-4">
            {education.map((e) => (
              <div key={e.school} className="flex flex-wrap items-baseline justify-between gap-x-4">
                <div>
                  <div className="font-medium text-white">{e.school}</div>
                  <div className="text-sm text-white/60">{e.degree}</div>
                </div>
                <span className="font-mono text-xs text-white/40">{e.years}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="skills" kicker="stack" title="Skills & certifications">
          <div className="space-y-4">
            {skills.map((g) => (
              <div key={g.group} className="flex flex-wrap items-center gap-1.5">
                <span className="mr-2 w-20 font-mono text-xs text-white/45">{g.group}</span>
                {g.items.map((s) => <span key={s} className={chip}>{s}</span>)}
              </div>
            ))}
          </div>
          <ul className="mt-8 divide-y divide-white/5 rounded-xl border border-white/10">
            {certifications.map((c) => (
              <li key={c.title}>
                <a href={c.image} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition hover:bg-white/[0.03]">
                  <span className="text-white/85">{c.title}</span>
                  <span className="font-mono text-xs text-white/40">{c.issuer} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="github" kicker="currently building" title="What I've been shipping">
          <GitHubStats />
        </Section>

        <Section id="offline" kicker="offline" title="Music & photos">
          <p className="text-[15px] leading-relaxed text-white/75">
            I write and release music — the latest single is <em className="font-display text-lg text-white">{music.latest.title}</em> ({music.latest.released}).
            I also shoot photos as <a href={photography.href} className="text-violet-300 underline underline-offset-4" target="_blank" rel="noopener noreferrer">{photography.handle}</a>.
            Both live on my <a href={music.studio} className="text-violet-300 underline underline-offset-4" target="_blank" rel="noopener noreferrer">studio site</a>.
          </p>
        </Section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-8 font-mono text-xs text-white/40">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <a href={`mailto:${profile.email}`} className="hover:text-white">{profile.email}</a>
      </footer>
    </div>
  );
}
