# Pending from the client, and open questions

Two lists: what SRS §12 already flags as outstanding, and a few things the SRS
doesn't settle that came up while building. Items marked **BLOCKS LAUNCH** must
be resolved before the site can go live.

The admin dashboard shows a live version of the first list, so these stay
visible rather than living only in this file.

---

## A. Blocking — the site cannot launch without these

### A1. Payment gateway account — **BLOCKS LAUNCH**
SRS §11 requires online payment live at launch; §12 flags the provider as
undecided and as a blocking dependency.

**Status:** built behind an adapter (`src/lib/payments.ts`). The whole flow —
form, GST summary, invoice numbering, paid-enrollment list, abandoned-payment
capture — is complete and testable against a stub. A Razorpay adapter is
written but has never run against real credentials.

**Needed:** the chosen provider, plus API key, secret and webhook secret. Then
set `PAYMENT_PROVIDER` and point the gateway's webhook at
`/api/payments/webhook`.

### A2. GSTIN and registered business details — **BLOCKS LAUNCH**
SRS §11.3 makes a proper GST tax invoice a legal requirement.

**Needed:** `BUSINESS_LEGAL_NAME`, `BUSINESS_GSTIN`, `BUSINESS_ADDRESS`.

Until these are set the code **refuses to issue an invoice** rather than issuing
an invalid one. The payment is still recorded and the team is alerted, but a
student would not receive their invoice — so this must be done before taking any
real money.

### A3. Privacy Policy and Terms & Conditions copy — **BLOCKS LAUNCH**
Required by SRS §12 specifically because online payment is live from day one.

**Status:** both pages exist and are admin-editable. While empty they tell
visitors the page is being finalised and invite them to call. No legal text has
been invented.

**Needed:** the real wording, pasted into **Privacy Policy & Terms** in admin.

### A4. Real batch fees, start dates and faculty — **BLOCKS LAUNCH**
SRS §12 notes prototype values are illustrative placeholders.

**Status:** batches are seeded with a placeholder fee of ₹45,000 and no real
dates. The admin **Batches** screen shows a warning while placeholders remain.

**This matters more than the other content gaps:** the fee in that screen is the
amount a student is actually charged online.

### A5. Rotate the Supabase service_role key — **BEFORE GOING PUBLIC**
The current `service_role` key was shared over chat during setup. It bypasses
every row-level security rule, so anyone holding it can read and change all
student leads and payment records.

Deliberately deferred by the client while the site runs only on a local machine,
which is a reasonable call at that stage. It must be rotated before the site is
deployed or the repository is pushed anywhere.

**To do it:** Supabase → Settings → API Keys → rotate. That invalidates the
current anon key too, so update all three values in `.env.local` (and in
Vercel's environment variables, if deployed) straight afterwards.

---

## B. Non-blocking, but the site is weaker without them

| # | Item | Effect while missing |
|---|---|---|
| B1 | SMS/WhatsApp provider (§10, §12) | Students get no confirmation message. The site correctly does *not* claim one was sent. Ongoing per-message cost — SRS §12 asks the client to confirm budget first. |
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
  (§8.4, §15.4). The batch row layout can take a fourth action when the time
  comes.
- **No separate Faculty page** (§2.2, §15.1). Faculty live only in the homepage
  mentors section.
- **No "Notes by Rohit Sir" annotation tool** (§2.2, §15.9).
- **No second headline number.** "10,000+ GATE Success Stories and Counting."
  is the only total used anywhere (§7.1.3, §15.7).
- **No address for Vidyanagar**, and no placeholder in its place (§6.3, §15.8).
- **No email field on the general enquiry form** (§8.1, §15.2). Confirmations go
  by SMS/WhatsApp. Email is collected only in the payment flow, where an invoice
  legally requires it.
