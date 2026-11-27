# Pending from the client, and open questions

Two lists: what SRS §12 already flags as outstanding, and a few things the SRS
doesn't settle that came up while building. Items marked **BLOCKS LAUNCH** must
be resolved before the site can go live.

The admin dashboard shows a live version of the first list, so these stay
visible rather than living only in this file.

---

## A. Blocking — the site cannot launch without these

### A1. Payment gateway — Razorpay, **test mode working; live setup BLOCKS LAUNCH**
SRS §11 requires online payment live at launch.

**Status (19 Nov 2026):** Razorpay account created. Standard Checkout is
integrated and running on test keys: server-side orders, Razorpay Checkout on
`/enroll/checkout`, signature-checked confirmation (`/api/payments/verify`) and
the webhook. See the Razorpay section of [SETUP.md](./SETUP.md).

**Still needed before taking real money:**
- Razorpay account activation (KYC) and **live** API keys.
- Payment Capture set to automatic in the Razorpay dashboard.
- The live webhook, which needs the deployed domain.
- A2 (GSTIN) — otherwise a paid student gets no invoice.

### A2. ~~GSTIN and registered business details~~ — ✅ **Supplied (19 Nov 2026)**
SRS §11.3 makes a proper GST tax invoice a legal requirement.

Set in `.env.local`: legal name Rohit Suresh Chandorkar, GSTIN 24ABDPC7956K1ZI,
Subhanpura, Vadodara address. **These must also be set as environment variables
on the host when deploying**; without them the code refuses to issue an invoice.
See C2: a Gujarat GSTIN makes the CGST/SGST question more pressing.

### A3. Privacy Policy and Terms & Conditions copy — **BLOCKS LAUNCH**
Required by SRS §12 specifically because online payment is live from day one.

**Status:** both pages exist and are admin-editable. While empty they tell
visitors the page is being finalised and invite them to call. No legal text has
been invented.

**Needed:** the real wording, pasted into **Privacy Policy & Terms** in admin.

### A4. Real batch start dates and faculty — **BLOCKS LAUNCH** (fees ✅ done)
SRS §12 notes prototype values are illustrative placeholders.

**Fees — supplied 19 Nov 2026:** ₹15,000 online, ₹45,000 offline, **GST
included** (that is exactly what the student pays). Set on all 12 batches in
Supabase and in the defaults. The invoice splits GST back out, e.g. ₹15,000 =
₹12,711.86 + ₹2,288.14 GST.

**Still needed:** real start dates and faculty. The admin **Batches** screen
shows a warning while those placeholders remain.

**Course pages (Nov 2026) use SAMPLE batch details** to show the layout: batch
names, start dates, days and timings, duration, language and a weekend batch
per branch, all in `src/lib/defaults.ts`. The live database still has its
original one-offline-one-online batch per branch (no dates); the samples can be
loaded with `npm run seed -- --sample-batches` once 0004 is run (see A6). Either
way, every sample must be replaced with the real batches before launch.

**Live data check (21 Nov 2026):** the **ME online batch is priced at ₹1** in
the live database (every other batch is ₹15,000 / ₹45,000). Probably left from
payment testing. A student could currently pay ₹1 for it. Not changed - needs
the client's go-ahead: set it back to 15000 in **Batches, dates & fees**.

### A5. Rotate the Supabase service_role key — **BEFORE GOING PUBLIC**
The current `service_role` key was shared over chat during setup. It bypasses
every row-level security rule, so anyone holding it can read and change all
student leads and payment records.

Deliberately deferred by the client during local development.

**Status (21 Nov 2026):** the code is now pushed to GitHub
(`inquiries-prog/acumen-gate-academy-test`) and this folder is linked to a Vercel
project (`acumen-gate-academy-test`). A scan of the full git history found **no
keys committed**; the key exists only in `.env.local` and wherever it was pasted
(chat, and Vercel if set there). So the repo itself is safe, but the key has
still been seen outside this machine and **must be rotated before the real domain
goes live or real student data arrives.**

**To do it:** Supabase → Settings → API Keys → rotate. That invalidates the
current anon key too, so update all three values in `.env.local` (and in
Vercel's environment variables, if deployed) straight afterwards.

---

### A6. Run migration 0004 on the live database — **BLOCKS DEPLOYING the Nov 2026 changes**
The course pages, free demo and FAQ page need
`supabase/migrations/0004_courses_demo_faq.sql`, then `npm run seed` (see
SETUP 2.2 and 2.5). Not run yet - it changes the live database, so it waits for
the client's go-ahead. Until it runs: demo bookings are not saved (only emailed,
if email is set up), the FAQ page shows only the About questions, and the new
admin screens are empty.

### A7. Review the sample content added for the course pages
Added Nov 2026 as **sample data**, all admin-editable:
- **Syllabus (updated 23 Nov 2026):** subjects and topics for all six GATE
  papers now follow the official GATE 2027 syllabus PDFs from IIT Madras,
  word for word (machine-checked against the PDF text), and each course page
  links to its PDF. The **"≈ marks" per subject are still Acumen's
  estimates**, not official - the client will adjust them in admin
  (Course syllabus).
- **Course overviews, highlights and taglines** - written from what the SRS
  says about Acumen. The client should confirm they're accurate.
- **The 23 new FAQs** (GATE exam, courses, demo, fees, online). GATE facts
  reflect recent cycles and should be checked against the GATE 2027 brochure.
  Answers about Acumen's process (switching batches, paying at the centre,
  failed payments) are safe defaults the client must confirm.
- **GPSC syllabus** - a generic outline, to be replaced by the real course plan.
- **GATE 2027 exam date** for the countdown: 6 February 2027 is a placeholder
  (GATE is usually the first weekends of February). Update in admin once the
  official date is announced.
- **Demo time slots** (Sat 11 AM online, etc.) - placeholders.
- **News & Updates (Nov 2026):** five sample posts (GATE 2027 syllabus,
  GATE 2026 results, PSU recruitment via GATE, exam pattern, free demo
  classes) written only from facts already verified on the site, and four
  "Expected" dates in the important dates tracker (GATE 2027 admit cards
  7 Jan, exam 6 Feb, results 19 Mar, PSU season April) - replace with the
  official dates once IIT Madras publishes them.
- **What happens in a demo class** (live lecture + doubt slot + study plan) -
  needs the client's confirmation that this is how demos run.

### A8. Check the GATE 2026 results transcribed from the success posts
The Results page (redesigned 23 Nov 2026) is driven by 56 entries read off
the client's own posts in `public/assets/results/`: first names as printed,
the AIR where the post shows one (22 students), branch only where the post
states it. Please check them in admin -> Results page. One conflict to
resolve: Gurudutt Dave's post says **AIR 75 (EC)**, while the homepage rank
strip and the Divya Bhaskar clipping description say **AIR 73**
(`HERO_RANKS` / `defaults.ts`). Which is right?

The live `result_entries` table is still empty; the page shows these
entries from `defaults.ts` until the first entry is added in admin - at which
point only admin entries show, so add (or seed) all of them together.

## B. Non-blocking, but the site is weaker without them

| # | Item | Effect while missing |
|---|---|---|
| B1 | WhatsApp confirmations (§10) | **Built (27 Nov 2026), not switched on.** Meta Cloud API, same number as the academy's Apps Script bot (which handles replies). Waiting on: the four templates approved in WhatsApp Manager, a token + `MESSAGING_PROVIDER=meta` in Vercel, and migration 0009. See SETUP "WhatsApp confirmations". |
| B2 | Notification email address (§12) | New leads appear in the admin panel but no email alert goes out. |
| B3 | Acumen 360 / Etude 360 logo files (§3.2, §12) | Footer ecosystem badges show the names as text instead of logos. **Still needed** — the file supplied as `acumen 360 logo.png` was actually the Acumen Gate Academy logo, now in use as the main site logo. |
| B4a | ~~Result images~~ | ✅ **Supplied.** 56 curated posts in `public/assets/results/` (replaced the first set of 84 on 19 Sep 2026). 24 show in the homepage carousel, all 56 on the Results page. To swap the set again: drop the new PNGs in that folder and run `npm run sync-results`. |
| B4b | ~~5 newspaper-clipping pages~~ | ✅ **Supplied.** Sandesh, Divya Bhaskar, Gujarat Samachar and The Times of India, March 2026. They appear in both the homepage carousel and "In the News" on the About page. See C6 — one is a composite of the other four. |
| B4c | Descriptions for the 56 result images (§13) | Each has a generic description like "…success post 12". Each post names a real student, so replacing these with the student's name would help search rankings. Editable in **Result & press images**. |
| B5 | Real student testimonials (§7.1.7) | Six cards are scaffolded with the right universities but no names, quotes or photos — see C1. |
| B6 | Student result entries (§7.4) | The Results page shows year tabs with "results will be published shortly". |
| B7 | Per-branch demo videos (§7.1.6, §12) | All six branches use the one supplied placeholder video. Each batch already has its own video field. |
| B8 | Social media links (§6.3, §12) | The footer social icons are hidden rather than linking nowhere. |
| B9 | Real classroom / online-class photos (§7.1.4, §12) | Course cards show designed placeholder artwork (branded tile + line icon) so the public site does not look unfinished. An upload in admin replaces it automatically. |
| B10 | Mentor photos (§7.1.9) | Mentor cards (and student cards without a photo) show a monogram tile built from the name - "UT" for Dr. Umashankar Tripathi. Uploads replace it. |
| B11 | Google Business Profile (§13) | Not a development task, but it affects "best GATE coaching in Vadodara" rankings more than the website does. |
| B12 | Who owns News publishing (§12) | Decides whether `/news` launches with the one seed post or more. |
| B13 | Course photos | Course cards show original branch illustrations until a photo is uploaded per course (**Course pages → Card photo**). Real classroom photos would help. |

---

## C. Questions the SRS doesn't answer

These came up during the build. Each was handled in the safest way available,
but each needs a decision.

### C1. Testimonial content was not invented
**SRS §7.1.7** specifies six cards with a name, quote, university and rank, and
names the six universities — but supplies no actual student names or quotes.

Rather than fabricate testimonials attributed to real-sounding students, the six
cards are seeded with the correct universities and empty name/quote fields, for
the client to fill in. The same applies to result entries in §7.4.

**Needed:** real quotes, names, ranks and photos — ideally with the students'
permission to publish them.

### C2. GST: one 18% line, or CGST + SGST split?
**SRS §11.2** says "GST at 18% calculated and displayed as a separate line", so
that is exactly what is implemented, on both the payment summary and the invoice.

In practice an Indian tax invoice usually splits this into **CGST 9% + SGST 9%**
for a customer in Gujarat and **IGST 18%** for one outside it. The total is
identical either way, so this is a presentation question, not a pricing one.

**Needed:** confirmation from the client's accountant. If a split is required it
is a change to `src/lib/invoice.ts` only.

### C3. Seminar offer wording
**SRS §8.2** requires a distinct offer per university but gives no offer text.

Every college is seeded with a neutral message that promises a callback rather
than a specific discount, because promising a discount the client hasn't
approved would be worse than being vague.

**Needed:** the real offer per college, in **Seminar offers by college**.

### C4. "Enroll & Pay" when a batch has no fee
**SRS §7.1.6** puts an "Enroll & Pay Now" button in the batch details popup, but
§12 says fees are still pending.

When a batch has no fee set, the button is hidden and "Enquire for this batch"
takes the full width — rather than showing a payment button that cannot work.
Each batch also has its own switch to turn online payment off.

**Confirm:** that hiding, rather than disabling, is the preferred behaviour.

### C5. The homepage shows 24 of the 56 result posts
SRS §7.1.2 asks for "a curated mix" on the homepage, and §7.4 says the homepage
"only surfaces a curated handful, so this page is where the rest actually gets
used."

So the first 24 posts run in the homepage carousel, and all 56 appear on the
Results page under "Every result we've celebrated", 24 at a time. Putting all 56
in the carousel would also work against §3.5, since the 90-second loop would
eventually pull every image down.

**Confirm:** that 24 is the right number for the homepage, and whether the
client wants to hand-pick which 24 rather than taking the first 24. Both the
count and the selection are admin-controlled — each image has its own
"show in the homepage strip" switch.

### C6. One press clipping duplicates the other four
`combined-coverage-2026-03.png` is a composite page showing the Sandesh, Divya
Bhaskar, Gujarat Samachar and Times of India pieces together — all four of which
were also supplied individually.

All five are currently shown, because they were all supplied. But the composite
is hard to read at strip size and repeats content the reader has just seen.

**Suggestion:** hide the composite and keep the four individual clippings, which
are legible and each name a publication. That is one switch in **Result & press
images** — no code change.

### C8. WhatsApp number is a code constant
The WhatsApp button (sticky bar, menu, CTA band, footer, batch sheet, chat
fallback) opens `wa.me/918200035090`. The number lives in
`src/lib/defaults.ts` as `WHATSAPP_NUMBER`, not in the admin panel - putting it
in site settings would have been spread into the database seeder and broken a
fresh setup.

**If the client wants to change it himself:** one migration to add a
`whatsapp_number` column plus a field on the settings form. Until then it is a
one-line code change.

The button is WhatsApp green (#25D366), a deliberate exception to the SRS 3.1
palette on the same basis as the amber Google stars: it is another company's
mark, and the client asked for it to stand out. The colour is defined once in
`tailwind.config.ts` and used only on the WhatsApp control.

### C9. Hero rank strip is a code constant
The hero shows "Top ranks, GATE 2026" chips - AIR 52, 73, 75, 267, 306 and
333 - all taken from the supplied newspaper clippings, ranks only. They live in
`src/lib/defaults.ts` as `HERO_RANKS` / `HERO_RANKS_LABEL`; update both when
the next cycle's results are in. This is not a second headline total (§15.7).

### C7. Newsletter of record for the announcement banner link
The banner currently opens the seminar popup, per §6.2. It can also open the
enquiry form, link to any page, or be plain text — all admin-controlled, no code
change. No decision needed now; noted so the client knows the range.

---

## D. Things deliberately NOT built

Per SRS §2.2 and §15, so nobody adds them by mistake:

- **No AI chatbot.** The chat widget is rule-based with no free-text input.
  Adding AI is a separately-scoped feature (§8.3), not a quiet upgrade.
- **No "Download the App" button** anywhere, in any state — not even disabled
  (§8.4, §15.4), including on the course pages.
- **No separate Faculty page** (§2.2, §15.1). Faculty live only in the homepage
  mentors section.
- **No "Notes by Rohit Sir" annotation tool** (§2.2, §15.9).
- **No second headline number.** "10,000+ GATE Success Stories and Counting."
  is the only total used anywhere (§7.1.3, §15.7).
- **No address for Vidyanagar**, and no placeholder in its place (§6.3, §15.8).
- **No animation library.** Scroll reveals run both ways (elements animate
  out as they leave and back in as they return) using CSS transitions and
  IntersectionObserver only - see `src/components/ui/Reveal.tsx` for the
  variants. Adding GSAP or similar is not needed and would break §3.5.
- **No email field on the general enquiry form** (§8.1, §15.2). Confirmations go
  by SMS/WhatsApp. Email is collected only in the payment flow, where an invoice
  legally requires it.

---

## E. Changes from the SRS (client request, Nov 2026)

Recorded so nobody "fixes" them back to the SRS:

- **Offline/Online batches popups replaced by course pages** (§5, §7.1.6). The
  header's "Offline Courses" and "Online Courses" became one **Courses** item
  with a hover menu; `/courses` and `/courses/<slug>` replace the batches popup
  and the "Know about the batch" popup. Enroll & Pay is unchanged (§11), now
  started from a batch on the course page.
- **The header gained an FAQ tab** (still six items - two course items became
  one) and a highlighted **Free Demo Class** button.
- **Several batches per branch and mode** are allowed (the unique constraint
  on `batches (branch_id, mode)` was dropped).
- **The phone sticky bar's main button is "Free Demo"**, not "Enquire Now".
  Enquire stays in the header menu and on every page.
- **A one-time "book a free demo" reminder** appears after 25 seconds or on
  exit intent, once per visit, never after booking. Switchable in admin.
- **FAQPage structured data moved from About to /faq**, which now holds every
  question; About shows only the "About Acumen" category.
- **A GATE exam countdown** appears on course pages, the menu and the demo
  panel. It is not a statistic about Acumen, so the one-headline-number rule
  (§15.7) still holds. No new totals or counters were added.
- **Results page rank milestones** (Nov 2026): the hero shows best AIR and
  how many students placed in the top 100 / 500 / 1000 and qualified, as
  the national institutes do. These are per-year counts of the named
  students on the page, worked out live from the entries - not a new
  marketing total; "10,000+" remains the one headline number.
- **No urgency was invented**: no "seats filling fast", no fake timers. The
  batch "Small label" (e.g. "New") and "Batch size" are admin text.
