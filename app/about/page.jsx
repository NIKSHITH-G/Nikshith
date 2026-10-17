import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import {
  profile, socials, experience, education, projects, skills, certifications, music, photography, reading, now,
} from "../../lib/content";
import GitHubStats from "../../components/GitHubStats";
import { Gallery, LocalTime, Reveal, SectionNav } from "../../components/classic/bits";

// The classic, no-3D version of the portfolio: fast, printable, recruiter-friendly.

const NAV = [
  ["about", "About"],
  ["work", "Work"],
  ["experience", "Experience"],
  ["education", "Education"],
  ["skills", "Skills"],
  ["life", "Life"],
];

function Section({ id, kicker, title, intro, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-white/10 py-16 sm:py-24">
      <Reveal>
        <div className="font-mono text-xs text-emerald-300/80">// {kicker}</div>
        <h2 className="mt-2 font-display text-4xl italic text-white sm:text-5xl">{title}</h2>
        {intro && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/55">{intro}</p>}
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  );
}

const chip = "rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/70";
const btn = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition";

export default function About() {
  const books = reading.shelves.flatMap((s) => s.books);
  const stats = [
    ["1.5", "years", "building core banking systems for HDFC Bank at TCS"],
    [String(projects.length), "projects", "shipped, from flashcards to GPT-2 circuits"],
    ["MAI", "Monash", "Master of Artificial Intelligence, 2026–28"],
    [String(certifications.length), "certs", "including AWS Cloud Practitioner"],
  ];

  return (
    <div className="min-h-screen bg-[#0b0d16] text-white">
      {/* soft colour behind the hero */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(ellipse_at_70%_10%,rgba(124,92,214,0.28),transparent_60%),radial-gradient(ellipse_at_10%_30%,rgba(16,185,129,0.10),transparent_55%)]" />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0b0d16]/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 font-mono text-[11px] font-bold text-black">NG</span>
            <span className="whitespace-nowrap font-display text-lg italic">Nikshith G</span>
          </Link>
          <SectionNav items={NAV} />
          <div className="flex items-center gap-2">
            <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="hidden rounded-full px-3 py-1.5 text-[13px] text-white/65 hover:text-white sm:inline">Résumé ↓</a>
            <Link href="/" className="whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black transition hover:bg-violet-200">
              Enter 3D studio →
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── hero ── */}
        <div className="grid grid-cols-1 items-center gap-10 py-14 sm:py-20 md:grid-cols-[minmax(0,1fr)_340px] md:gap-14">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-white/55">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
                Open to opportunities
              </span>
              <span>{profile.location} · <LocalTime timezone={profile.timezone} /> local</span>
            </div>
            <h1 className="mt-5 font-display text-6xl italic leading-[0.95] sm:text-8xl">{profile.name}</h1>
            <p className="mt-4 text-xl text-violet-200">{profile.role}</p>
            <p className="mt-2 font-display text-2xl italic text-white/80">&ldquo;{profile.tagline}&rdquo;</p>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65">{profile.bio[0]}</p>
            <div className="mt-7 flex flex-wrap gap-2.5 print:hidden">
              <a href={`mailto:${profile.email}`} className={`${btn} bg-white font-semibold text-black hover:bg-violet-100`}><Mail size={16} /> Email me</a>
              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className={`${btn} border border-white/20 text-white/90 hover:bg-white/10`}>Résumé ↓</a>
              <Link href="/" className={`${btn} border border-violet-400/40 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20`}>Walk through the 3D studio →</Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/50">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-white hover:underline">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mx-auto w-full max-w-[340px]">
            <div className="relative">
              <div aria-hidden className="absolute -inset-3 rotate-3 rounded-[32px] bg-gradient-to-br from-violet-500/40 via-fuchsia-500/20 to-emerald-400/20 blur-xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/5 shadow-2xl">
                <Image src={profile.tvPhoto} alt={`Portrait of ${profile.name}`} width={608} height={760} priority sizes="340px" className="h-auto w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-12">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-white/70">Melbourne · 2026</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── at a glance ── */}
        <Reveal>
          <div className="grid grid-cols-2 gap-3 pb-16 md:grid-cols-4">
            {stats.map(([big, unit, text]) => (
              <div key={unit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl italic">{big}</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-violet-300">{unit}</span>
                </div>
                <p className="mt-2 text-[13px] leading-snug text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── about ── */}
        <Section id="about" kicker="about" title="Hello there">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Reveal className="space-y-4 text-[16px] leading-relaxed text-white/75">
              {profile.bio.map((p) => <p key={p}>{p}</p>)}
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-white/45">
                  <span>Right now</span><span>{now.updated}</span>
                </div>
                <ul className="mt-4 space-y-4">
                  {now.items.map((n) => (
                    <li key={n.label} className="border-l-2 border-violet-400/50 pl-4">
                      <div className="font-mono text-[11px] uppercase tracking-wider text-emerald-300/80">{n.label}</div>
                      <p className="mt-0.5 text-[14px] leading-snug text-white/80">{n.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ── projects ── */}
        <Section id="work" kicker="projects" title="Things I've built" intro="A mix of shipped products, research and the projects that taught me the most.">
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((p, i) => (
              <Reveal key={p.name} delay={(i % 2) * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/25">
                  <div className="relative aspect-[16/9] overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.color}55, #0f172a)` }}>
                    {p.images[0] ? (
                      <Image src={p.images[0]} alt={`${p.name} screenshot`} fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover object-top transition duration-700 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-4xl italic text-white/70">{p.name}</div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] text-white/85 backdrop-blur">{p.year}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-semibold" style={{ color: p.color }}>{p.name}</h3>
                    <p className="mt-1 font-display text-xl italic text-white/85">{p.tagline}</p>
                    <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-white/60 marker:text-white/25">
                      {p.points.slice(0, 3).map((pt) => <li key={pt}>{pt}</li>)}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.stack.map((s) => <span key={s} className={chip}>{s}</span>)}
                    </div>
                    {(p.url || p.repo) && (
                      <div className="mt-auto flex gap-4 pt-5 text-sm">
                        {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-medium text-white underline-offset-4 hover:underline">Visit ↗</a>}
                        {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer" className="text-white/55 underline-offset-4 hover:text-white hover:underline">Source ↗</a>}
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ── experience ── */}
        <Section id="experience" kicker="experience" title="Where I've worked">
          <ol className="relative space-y-10 border-l border-white/10 pl-8">
            {experience.map((e, i) => (
              <Reveal key={e.company} delay={i * 0.05}>
                <li className="relative">
                  <span className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-2 border-violet-400 bg-[#0b0d16]" />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-lg font-medium">{e.role} · <span className="text-violet-200">{e.company}</span></h3>
                    <span className="font-mono text-xs text-white/45">{e.dates}</span>
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-white/40">{e.location}</div>
                  <ul className="mt-3 list-disc space-y-1.5 pl-4 text-[14px] leading-relaxed text-white/65 marker:text-violet-400/60">
                    {e.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                </li>
              </Reveal>
            ))}
          </ol>
        </Section>

        {/* ── education ── */}
        <Section id="education" kicker="education" title="Where I studied">
          <div className="grid gap-5 md:grid-cols-3">
            {education.map((e, i) => (
              <Reveal key={e.school} delay={i * 0.08}>
                <article className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="relative aspect-[4/3]">
                    <Image src={e.photo} alt={`${e.school} campus`} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d16] via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] text-white/85 backdrop-blur">{e.years}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-2xl italic leading-tight">{e.school}</h3>
                    <p className="mt-1 text-sm text-white/75">{e.degree}</p>
                    <p className="mt-2 font-mono text-[11px] text-white/45">{e.place}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ── skills & certs ── */}
        <Section id="skills" kicker="stack" title="Skills & certifications">
          <div className="grid gap-4 sm:grid-cols-2">
            {skills.map((g) => (
              <Reveal key={g.group}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-white/45">{g.group}</div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {g.items.map((s) => <span key={s} className={chip}>{s}</span>)}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
            {certifications.map((c) => (
              <a key={c.title} href={c.image} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/25">
                <div className="relative aspect-[4/3] bg-white">
                  <Image src={c.image} alt={c.title} fill sizes="(max-width: 768px) 50vw, 220px" className="object-cover object-top transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <div className="text-[13px] leading-snug text-white/85">{c.title}</div>
                  <div className="mt-1 font-mono text-[10px] text-white/45">{c.issuer} ↗</div>
                </div>
              </a>
            ))}
          </div>
        </Section>

        <Section id="github" kicker="currently building" title="What I've been shipping">
          <GitHubStats />
        </Section>

        {/* ── life outside code ── */}
        <Section id="life" kicker="offline" title="Life outside code" intro="I shoot photos around Melbourne, write music and read far too much fantasy.">
          <div className="space-y-10">
            <div>
              <div className="mb-4 flex items-baseline justify-between">
                <h3 className="font-display text-2xl italic">Through my lens</h3>
                <a href={photography.href} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-violet-300 hover:text-white">{photography.handle} ↗</a>
              </div>
              <Gallery photos={photography.photos} more={photography} />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
              <Reveal>
                <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/15 to-transparent p-6">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-white/45">Latest single</div>
                  <div className="mt-3 font-display text-4xl italic">{music.latest.title}</div>
                  <div className="mt-1 font-mono text-xs text-white/50">released {music.latest.released} · {music.latest.length}</div>
                  <div className="mt-5 flex gap-3 text-sm">
                    <a href={music.studio} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-4 py-2 font-medium text-black hover:bg-violet-100">Listen ↗</a>
                    <a href={music.youtube} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-white/85 hover:bg-white/10">YouTube ↗</a>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-baseline justify-between">
                    <div className="font-mono text-[11px] uppercase tracking-widest text-white/45">On my Kindle</div>
                    <div className="font-mono text-[11px] text-white/40">{books.length} books</div>
                  </div>
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {books.map((b) => (
                      <div key={b.title} className="w-[78px] shrink-0" title={`${b.title} — ${b.author}`}>
                        <div className={`relative aspect-[2/3] overflow-hidden rounded-md shadow-lg ${b.title === reading.favourite ? "ring-2 ring-amber-400" : ""}`}>
                          <Image src={b.cover} alt={b.title} fill sizes="78px" className="object-cover" />
                        </div>
                        <div className="mt-1.5 line-clamp-2 text-[10.5px] leading-tight text-white/60">{b.title}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[13px] text-white/55">
                    <span className="text-amber-300">★ {reading.favourite}</span> is my all-time favourite. Read the highlights on the Kindle in the <Link href="/" className="text-violet-300 underline-offset-4 hover:underline">3D studio</Link>.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* ── contact ── */}
        <section className="border-t border-white/10 py-20 text-center sm:py-28">
          <Reveal>
            <div className="font-mono text-xs text-emerald-300/80">// say hello</div>
            <h2 className="mx-auto mt-3 max-w-3xl font-display text-5xl italic leading-tight sm:text-6xl">Let&apos;s build something together.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">{profile.status} The fastest way to reach me is email.</p>
            <a href={`mailto:${profile.email}`} className="mt-8 inline-block break-words font-display text-2xl italic text-white underline decoration-violet-400/60 underline-offset-8 hover:decoration-violet-300 sm:text-4xl">
              {profile.email}
            </a>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5 print:hidden">
              <Link href="/contact" className={`${btn} bg-white font-semibold text-black hover:bg-violet-100`}>Send a message</Link>
              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className={`${btn} border border-white/20 text-white/90 hover:bg-white/10`}>Résumé ↓</a>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-4 py-8 font-mono text-xs text-white/40 sm:px-6">
        <span>© {new Date().getFullYear()} {profile.name} · Melbourne</span>
        <Link href="/" className="hover:text-white">Prefer the fun version? Enter the 3D studio →</Link>
      </footer>
    </div>
  );
}
