import Link from "next/link";
import StudioLoader from "../components/world/StudioLoader";
import { profile, experience, projects } from "../lib/content";

export const metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* Crawlers and screen readers get a plain summary; the 3D studio is visual. */}
      <section className="sr-only">
        <h1>{profile.name} — {profile.role}</h1>
        {profile.bio.map((p) => <p key={p}>{p}</p>)}
        <h2>Experience</h2>
        <ul>
          {experience.map((e) => <li key={e.company}>{e.role}, {e.company} ({e.dates})</li>)}
        </ul>
        <h2>Projects</h2>
        <ul>
          {projects.map((p) => <li key={p.name}>{p.name}: {p.tagline}</li>)}
        </ul>
        <Link href="/about">Read the full portfolio as a text page</Link>
      </section>
      <main>
        <StudioLoader />
      </main>
    </>
  );
}
