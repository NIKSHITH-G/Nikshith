import Link from "next/link";

export const metadata = {
  title: "404 — Not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-3 font-mono text-xs text-emerald-400">// 404</div>

        <div className="rounded-xl border border-white/10 bg-[#0b0b12] p-5 font-mono text-sm shadow-[0_18px_50px_-32px_rgba(99,102,241,0.5)]">
          <div className="flex items-center gap-2 text-white/70">
            <span className="text-green-300">$</span>
            <span>cd {"/"}this-page</span>
          </div>
          <div className="mt-2 text-white/45">
            bash: no such file or directory
          </div>
          <div className="mt-4 flex items-center gap-2 text-white/70">
            <span className="text-green-300">$</span>
            <span>
              cd ~<span className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-white/70 align-middle" />
            </span>
          </div>
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          This route doesn&apos;t exist.
        </h1>
        <p className="mt-2 text-sm text-foreground/55">
          The page you&apos;re looking for moved, or never shipped. Let&apos;s
          get you back to solid ground.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            ← Back home
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-foreground/80 transition hover:bg-white/5"
          >
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
