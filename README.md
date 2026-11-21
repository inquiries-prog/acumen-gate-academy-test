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
| `npm run sync-results` | Makes the result posts in Supabase match `public/assets/results/`: uploads new files, removes ones no longer in the folder, renumbers. `-- --dry-run` previews. |
| `npm run shots:start` | Screenshot every page at phone + desktop size into `screenshots/` (needs `npm run build` first) |

---

## Documentation

| Document | For |
|---|---|
| **[docs/SETUP.md](docs/SETUP.md)** | Developers — Supabase, environment variables, deployment |
| **[docs/PENDING.md](docs/PENDING.md)** | Project manager — what's still needed from the client, what blocks launch, and open questions |
| **[docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md)** | The client — how to run the site day to day |
| `Acumen_Gate_Academy_SRS (2).md` | The original requirements. Where a later client decision changes it (e.g. Razorpay chosen, fees GST-inclusive), the decision is recorded in PENDING.md and wins over the SRS. |

Every change is also described in its git commit message (`git log`), including
the reasoning behind it.

---

## What's built

**Public site** — Homepage, About Us, Courses (a hub page plus one page per
course), FAQ, News & Updates (with a page per post), Results, Privacy and Terms.
Six-item header (About Us · Courses ▾ · Results · News & Updates · FAQ · Contact
Us) with a hover menu of every course, announcement banner, four-column footer.

**Courses** (added Nov 2026, replacing the Offline/Online batches popups) —
`/courses` lists six GATE branches (ME, CE, CSE, EE, EC, CH) and GPSC with a
Classroom / Online switch (`?mode=offline|online`), plus an "About the GATE
exam" guide. Each `/courses/<slug>` page has an overview, the syllabus with
typical marks, the GATE exam pattern, every batch of that branch (classroom and
online together, several per mode allowed) with fees and Enroll & Pay, a demo
lecture, mentors, results and FAQs. Branch artwork is original animated SVG
(`components/courses/BranchArt.tsx`), used until course photos are uploaded.

**Free demo class** — a highlighted header button, a tab on the right edge
(desktop), the main button of the phone sticky bar, and a once-per-visit
reminder all open one side panel (`components/site/DemoDrawer.tsx`). Bookings go
to their own lead list. A live countdown to the GATE exam (date set in admin)
appears on course pages, the menu and the panel.

**Lead capture** — three distinct flows kept as three separate lists: the
general enquiry popup, the seminar-attendee popup with per-college offers, and
free demo class registrations.

**FAQ page** — every question, grouped into six categories with search. The only
page carrying FAQPage structured data; About and course pages show subsets.

**Enrollment and payment** — the full flow from §11: details form, GST summary,
gateway hand-off, sequential tax invoice, paid-enrollment list, and capture of
abandoned or failed payments.

**Guided chat widget** — rule-based, button-driven, with no free-text input.

**Admin panel** — every piece of content is editable, with plain language
labels, image upload with preview, lead management with CSV export, and
unlimited independently-hideable result years. Course pages, the course
syllabus, batches (add/delete, several per branch), FAQ categories, the demo
form's time slots, the GATE countdown and the demo reminder all have screens.

---

## Notes for whoever works on this next

**Payments use Razorpay** (Standard Checkout), working on test keys. Going live
still needs KYC, live keys and the live webhook — see
[docs/PENDING.md](docs/PENDING.md) A1 and the Razorpay section of
[docs/SETUP.md](docs/SETUP.md). Batch fees are **GST-inclusive**: the fee is what
the student pays, and the invoice splits GST out of it.

**The messaging provider (SMS/WhatsApp) is still undecided** (SRS §12). Payments
and messaging both sit behind adapters — `src/lib/payments.ts` and
`src/lib/messaging.ts` — so a provider is a config change plus one file, not a
rewrite. The stubs (`PAYMENT_PROVIDER=stub`, `MESSAGING_PROVIDER=stub`) let the
whole flow be tested without moving money or spending on messages.

**The course pages replaced popups that the SRS specified** (§5, §7.1.6): the
client asked for this in Nov 2026. The stored course-card actions
`batches_offline` / `batches_online` were kept and now link to the courses page,
so no data had to change. Everything that changed from the SRS is listed in
[docs/PENDING.md](docs/PENDING.md) §E.

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
