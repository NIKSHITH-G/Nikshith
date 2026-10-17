# Nikshith's House: project handoff

Everything built so far on **nikshith.dev**, how it works, how to change it, and what's still open.
Written 17 Oct 2026, at the end of a long build session. No secret values appear here, only the names of settings.

> **For a new Claude session:** read this file first. It replaces the earlier conversation history.

---

## 1. At a glance

| | |
|---|---|
| **Live site** | https://nikshith.dev (domain bought at Cloudflare, connected to Vercel) |
| **Preview site** | https://nikshith-git-studio-3d-nikshith-gs-projects.vercel.app |
| **Code** | GitHub `NIKSHITH-G/Nikshith`, this folder (`my-portfolio/`) |
| **Hosting** | Vercel project `nikshith` (team `nikshith-gs-projects`) |
| **Stack** | Next.js 16 (App Router), React 19, React Three Fiber 9 + drei 10, framer-motion, Tailwind v4, Upstash Redis |
| **What it is** | An explorable 3D four-floor house, with a classic text page at `/about` for anyone in a hurry |

### How changes go live (please keep this)
1. Work happens on the **`studio-3d`** branch. Every push there updates the **preview** site.
2. Production (`main`) is updated **only when Nikshith says "deploy" or "ship it"**: merge `studio-3d` into `main`, then push.
3. Run locally: `npm install`, then `npm run dev`. Or test a production build with `npx next build && npx next start -p 3123`.

---

## 2. The house (what visitors see)

**Title screen:** "Nikshith's House", with a **Come inside** button. Below it, a link to the classic page.

**Ground floor (1F):**
- **Study:** desk with a terminal (experience), bookshelf of page-turning education books (Monash, VIT, Narayana with campus photos), trophy case (certificates), and a GitHub "ship log" screen.
- **Lab:** arcade cabinets (projects) and a whiteboard (skills).
- **Music room:** a playable piano.
- **Living room:**
  - the **TV**, with 5 channels: About, At a glance, Right now, Featured, Contact. Flip with ←/→, keys 1–5, a swipe, or the remote.
  - a **Kindle library** of 15 books with covers, a summary, real highlighted quotes and "My takeaways".
  - the **Now board**, a coffee machine, and **Byte the cat**.
  - the front door, which opens a letter-style contact form.
- **Nikshith himself (AI):** walks between activities (desk, books, board, arcade, piano, library, coffee, TV, window). Walk up to him and talk.

**Floor 2: Gym & Photo studio.** Treadmill sprint, punching bag, a training plan board, a character **photo booth** (no webcam), a camera "viewfinder" photo gallery (←/→ or A/D), and **Pixel the dog**.

**Floor 3: Games room.** Snooker, **live chess** (all visitors play White together, Nikshith plays Black), arcade games (Snake, Breakout, Pong) and a side-quests board.

**Rooftop.** Telescope (find constellations), radio stations, and a **guestbook** where notes stay hidden until approved.

**Other pages:**
- `/about`: the classic, recruiter-friendly page. It has a photo hero, live Melbourne clock, stats, project cards, timeline, campus cards, certificate thumbnails, a photo gallery with a viewer, the Kindle shelf, music, and a contact section.
- `/contact`: contact form.
- `/stats`: private owner dashboard (section 5).

**Your 11 photos** hang around the building and appear on `/about`.

---

## 3. Where to change things

| To change… | Edit |
|---|---|
| Any text: bio, experience, education pages, projects, skills, certs, Now board, training plan, side quests, books, music, photos | **`lib/content.js`**, the single source of all content |
| What AI Nikshith says | **`lib/persona.js`** (built-in answers, keywords, follow-up questions) |
| Floor layouts, room positions, Nikshith's daily routine (`ACTIVITIES`) | `components/world/layout.js` |
| Character looks (Nikshith, visitor, pets) | `components/world/Avatar.jsx` (`OUTFITS`), plus `Characters.jsx`, `Nikshith.jsx` and `floors.jsx` (dog) |
| 3D furniture and rooms | `components/world/Apartment.jsx` (ground floor), `floors.jsx` (other floors) |
| Pop-up panels | `components/world/panels/*.jsx` (`screens.jsx` holds the TV, terminal, arcade and whiteboard) |
| Classic page | `app/about/page.jsx` + `components/classic/bits.jsx` |
| Share card (link preview image) | `public/og-house.jpg`. **When you replace it, give it a new filename** and update `app/layout.jsx`, `app/about/layout.jsx` and `app/contact/layout.jsx`, otherwise LinkedIn keeps showing the old one |
| Résumé | `public/resume.pdf` (the CGPA line was removed from this copy; update your original too) |

**Images:** `public/images/photos/` (gallery), `public/images/books/` (covers), `public/images/education/` (campuses), `public/images/tv.jpg` (your photo, used on the TV, `/about` and the share card). Raw photo drops go in `photos/`, which is not uploaded to git.

---

## 4. AI Nikshith (the chat)

- **Free only.** There are no paid Claude credits; don't add paid APIs.
- **Most questions are answered instantly on the visitor's device** by the built-in engine in `lib/persona.js` (keyword intents, stemming, phrase overrides). There's no network call for these.
- **Only unusual questions go to `/api/ask`**, which tries the **Gemini free tier**: models `gemini-3.5-flash` then `gemini-flash-lite-latest`, with a 4 s budget, 400 calls/day and 40 messages per visitor per hour. It falls back to built-in answers and pauses Gemini for 5 minutes after failures.
- **Answers Claude wrote that Nikshith should review:** why hire you, approach, fun facts, goals, weakness, teamwork, deadlines.
- **Grades:** CGPA is removed everywhere. Asked about grades, he deflects to projects.

---

## 5. Private owner tools

All of these use the **owner key**: the `CHESS_OWNER_KEY` setting in `.env.local` and in Vercel. The browser remembers it after first use.

- **`/stats`** (arcade "HOUSE STATS" screen):
  - visitors (3D house vs classic page), how many pressed start, questions asked, and "100% clears"
  - a 30-day chart
  - top rooms and floors
  - every question asked to AI Nikshith, tagged ANSWERED / GEMINI / DIDN'T KNOW
  - **rooftop guestbook moderation** (approve or delete notes)
- **What's stored:** anonymous counters and the question log only (`lib/stats.js`, `app/api/track`, `app/api/stats`). No cookies, names or IPs.
- **Chess:** the owner key lets Nikshith play Black and reset the board.
- **Vercel Analytics:** enabled. View it in the Vercel dashboard under project → Analytics.

---

## 6. Settings, by name only (values are in `.env.local` and Vercel)

| Name | Used for |
|---|---|
| `CHESS_OWNER_KEY` | Owner key: chess, guestbook moderation, `/stats` |
| `GEMINI_API_KEY` | AI Nikshith's free-tier Gemini answers |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis (`studio-kv`, Sydney): chess, coffee count, guestbook, stats. **Only set on Vercel**; locally the site uses a temporary in-memory store, so local testing never touches real data |
| `GITHUB_TOKEN` | GitHub screen, including the contribution graph (which needs a valid token). Replaced 17 Oct 2026 with a classic token; if the graph goes empty, the token has expired |

---

## 7. Nikshith's preferences (decided during the build)

- The name is **"Nikshith's House"**, not "Studio". Exceptions: "Photo studio" (a room on floor 2), the music site link labelled "Studio", and "IBM Watson Studio".
- **His personal photo appears only** on the TV, the `/about` hero and the share card. Elsewhere the blocky character stands in.
- **Characters:**
  - **Nikshith:** curly dark hair, white headphones **on his head**, purple hoodie with a white collar peeking out, washed-denim jeans, white sneakers.
  - **Face:** oval eyes, relaxed brows, a **subtle** small smile (he didn't like a big one), small round nose, blush.
  - **Hands:** nothing, ever. No mug, no book.
  - **Animation:** no mouth animation and no typing sounds. Random blinks, breathing, head glance and a nod on chat are in.
  - **Rejected:** neck headphones, puffy shoulders, pushed-up sleeves.
- **Share card:** pixel-art game title screen ("NIKSHITH'S HOUSE", PRESS START, pixel Nikshith, Byte and the 4-floor building). He rejected a 3D-scene card and a plain photo card.
- **Stats page:** arcade high-score style.
- **Removed or rejected earlier:** the boxing ring, the webcam photo booth, a floating chat button (replaced by the roaming NPC), and the photography section (replaced by the library).
- **Mobile matters:** tested at 390×844, 360×640 and landscape 844×390. Landscape phones show screen panels as cards.

---

## 8. Testing tricks

- `?touch`: shows the phone joystick and tap buttons on a laptop.
- `?debug`: enables `window.dispatchEvent(new CustomEvent("studio:view", { detail: [floor, x, z, zoom, yaw] }))` to jump the camera, and turns tracking off.
- `window.dispatchEvent(new CustomEvent("world:go", { detail: "<panel id>" }))` opens any panel. Panel ids are in `components/world/panels/index.jsx` (`PANEL_META`).
- Walking routes can be simulated with a planner check against `layout.js`. All routes passed at last check.

---

## 9. Open items / next steps

1. **Vercel security checkpoint (check first).** Right after the last deploy, automated checks (and one from another network) got a "Vercel Security Checkpoint" (403, retry-after 30). The project has **no** Attack Challenge Mode and no firewall rules, so it's probably Vercel's automatic protection reacting to many automated requests.
   - Open nikshith.dev in a normal browser and confirm it loads.
   - Re-inspect it in the LinkedIn Post Inspector and confirm the "NIKSHITH'S HOUSE" card shows.
   - If the checkpoint persists, review Vercel → Firewall / Bot protection, because it would block link previews and search engines.
2. **Confirm the last deploy** (guestbook moderation in `/stats`) is live: unlock `/stats` and look for "ROOFTOP GUESTBOOK".
3. **LinkedIn launch post:** draft the post plus a 20–30 s screen-recording plan (Come inside, then TV channels, asking AI Nikshith a question, Kindle, elevator to the rooftop).
4. **Teach AI Nikshith:** after a week, check `/stats` for DIDN'T KNOW questions and add answers in `lib/persona.js`.
5. **Review the answers Claude wrote** (listed in section 4) and the Kindle "My takeaways".
6. **Optional ideas:**
   - day/night that follows Melbourne time
   - a free Groq key for smarter answers
   - `hi@nikshith.dev` via Cloudflare Email Routing
   - rotate the Gemini key (it once appeared in a tool log)
   - more photos, projects and Kindle highlights

---

## 10. Recent history (newest first)

- Security update: Next.js 16.0.10 → 16.4.2 plus patched sharp/postcss/nanoid (0 production audit issues); new working `GITHUB_TOKEN`, so the ship-log contribution graph is back.
- Guestbook moderation in `/stats`.
- Share-card filename changed to `og-house.jpg` so LinkedIn refetches it.
- Character polish and clean-up (subtle smile, headphones on head, no props).
- Rename Studio → House everywhere; pixel share card updated.
- Detailed shared character model with toon shading and outlines, plus polished cat and dog.
- Visitor analytics (`/stats`) and Vercel Analytics; pixel-art share card.
- Classic `/about` page redesign with photo.
- TV turned into a 5-channel set; CGPA removed (site, AI, résumé PDF).
- Kindle: summaries + real quotes for all 15 books.
- Mobile pass (landscape cards, bookshelf/training plan fixes, compact chat).
- AI Nikshith: instant built-in answers, 53-question interview fixes.
- Earlier: the 4-floor building, roaming NPC, chess with Redis, guestbook, library, photo hangs, domain move to nikshith.dev.
