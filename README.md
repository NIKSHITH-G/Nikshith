# Nikshith G — Portfolio

My personal portfolio, live at **[nikshith.dev](https://nikshith.dev)**.

Built with Next.js 16 (App Router) and a focus on interactive, hand-built motion
— an animated mesh-grid background (React Three Fiber), a typing micro-terminal,
magnetic skill chips, and a live GitHub contribution graph.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4
- **Motion / 3D:** Framer Motion, anime.js, React Three Fiber + drei + postprocessing
- **Email:** EmailJS (contact form, client-side)
- **Data:** GitHub REST + GraphQL APIs (stats + contribution calendar)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env.local` (not committed):

```bash
# Fine-grained, READ-ONLY token (public repos + read:user) for GitHub stats
GITHUB_TOKEN=your_token_here
```

The EmailJS service/template/public keys live in `app/contact/page.jsx`
(the public key is safe to expose by design).

## Project structure

```
app/
  page.jsx          # Home — hero, terminal, GitHub stats
  about/            # Experience, education, projects, skills & certs
  contact/          # Contact form (EmailJS) + animations
  api/github/       # GitHub stats + contribution calendar (cached daily)
components/         # Navbar, mesh grid, timeline, project cards, contributions
```

## Deployment

Deployed on Vercel with `nikshith.dev` as the custom domain. Pushes to `main`
trigger a production deploy.
