# Acumen Gate Academy — Website & Admin Platform

Marketing, lead-generation and enrollment website for a GATE/GPSC coaching
institute in Vadodara, Gujarat. Built to the SRS in
`Acumen_Gate_Academy_SRS (2).md`.

**Next.js 16 · React 19 · TypeScript · Tailwind CSS · Supabase · Vercel**

---

## Quick start

```bash
npm install
npm run dev
```

<http://localhost:3000> — the public site runs with no configuration, using the
SRS content as its fallback, so it can be reviewed before any accounts exist.

To enable the admin panel, lead capture and payments, follow
**[docs/SETUP.md](docs/SETUP.md)**.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run build:clean` | Wipe `.next` then build - use after adding metadata files or changing layouts (the incremental build reuses prerendered pages) |
| `npm run typecheck` | TypeScript check, no build |
| `npm run seed` | Load the starting content into an empty database |
| `npm run upload-assets` | Move bundled images into Supabase Storage |
| `npm run shots:start` | Screenshot every page at phone + desktop size into `screenshots/` (needs `npm run build` first) |

---

## Documentation

| Document | For |
|---|---|
| **[docs/SETUP.md](docs/SETUP.md)** | Developers — Supabase, environment variables, deployment |
| **[docs/PENDING.md](docs/PENDING.md)** | Project manager — what's still needed from the client, what blocks launch, and open questions |
| **[docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md)** | The client — how to run the site day to day |

---

## What's built

**Public site** — Homepage, About Us, News & Updates (with a page per post),
Results, Privacy and Terms. Six-item header, announcement banner, four-column
footer.

**Lead capture** — two distinct flows kept as two separate lists: the general
enquiry popup and the seminar-attendee popup with per-college offers.

**Batches** — a spacious modal listing all six branches (ME, CE, CSE, EE, EC, CH)
for offline and online, each with enquiry, batch detail and an inline demo video.

**Enrollment and payment** — the full flow from §11: details form, GST summary,
gateway hand-off, sequential tax invoice, paid-enrollment list, and capture of
abandoned or failed payments.

**Guided chat widget** — rule-based, button-driven, with no free-text input.

**Admin panel** — every piece of content in the SRS is editable, with plain
language labels, image upload with preview, lead management with CSV export, and
unlimited independently-hideable result years.

---

## Notes for whoever works on this next

**Payment and messaging providers are undecided** (SRS §12). Both sit behind
adapters — `src/lib/payments.ts` and `src/lib/messaging.ts` — so choosing one is
a config change plus one file, not a rewrite. The default stubs let the whole
flow be tested without moving money or spending on messages. See
[docs/PENDING.md](docs/PENDING.md).

**Popups are mounted once, in `src/app/(site)/layout.tsx`.** SRS §7.1.2 records a
real bug found in prototyping where the carousel and lightbox broke once routing
was introduced. That comes from per-page popup state, so the popup stack lives
above the routed content and survives navigation. Please keep it that way.

**All content is read through `src/lib/content.ts`,** which tries Supabase and
falls back to `src/lib/defaults.ts`. `defaults.ts` is the single copy of the SRS
text — the seeder writes the same values into the database, so the two cannot
drift apart.

**Some things are deliberately absent.** No "Download the App" button in any
state, no separate Faculty page, no AI chatbot, no address for Vidyanagar, and
exactly one headline statistic site-wide. Each is an explicit client decision in
SRS §15 — [docs/PENDING.md](docs/PENDING.md) §D lists them all.

**Mobile is a first-class requirement, not a pass at the end** (SRS §3.4). Check
every change at ~390px, not just that it "fits". The batches modal, all popups,
the chat widget, the results year tabs and the footer are called out by name in
the SRS as needing explicit verification.
