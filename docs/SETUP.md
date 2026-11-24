# Setup

Everything needed to get this running locally and deployed.

---

## 1. Run it locally (no database needed)

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The public site works with **no configuration at all** — it falls back to the
starting content in `src/lib/defaults.ts`, which is the copy agreed in the SRS.
This exists so the site can be reviewed before any accounts are created.

What does **not** work without a database:

- the admin panel
- saving leads from the enquiry and seminar forms
- online enrollment and payment

---

## 2. Connect Supabase

### 2.1 Create the project

1. Create a project at <https://supabase.com>.
2. Choose a region close to Gujarat — **Mumbai (ap-south-1)** — so page loads and
   image delivery are fast for students in India.

### 2.2 Run the migrations

In the Supabase dashboard, open **SQL Editor → New query**, paste the whole of
`supabase/RUN-THIS-IN-SUPABASE.sql`, and press **Run**.

That file is the seven migrations concatenated:

| File | What it does |
|---|---|
| `supabase/migrations/0001_init.sql` | All tables, indexes and row-level security |
| `supabase/migrations/0002_functions.sql` | Sequential GST invoice numbering |
| `supabase/migrations/0003_storage.sql` | The `media` image bucket and its access rules |
| `supabase/migrations/0004_courses_demo_faq.sql` | Course pages, course syllabus, several batches per branch, FAQ categories, free demo registrations, GATE countdown and demo settings |
| `supabase/migrations/0005_syllabus_pdf.sql` | Official syllabus PDF link per course (fills the six GATE 2027 links) |
| `supabase/migrations/0007_result_review.sql` | Result entries: photo type (success post or plain portrait) and a team-only review flag |
| `supabase/migrations/0006_news_magazine.sql` | News categories, cover images and featured flag; the `key_dates` table for the important dates tracker |

**Upgrading a database set up before 0004?** Run only
`supabase/migrations/0004_courses_demo_faq.sql`, then `npm run seed` (2.5). It
only adds tables and columns; existing rows are kept. Until it runs, the site
still works - course pages and FAQs fall back to the starting content in
`defaults.ts` - but the FAQ page shows only the About questions, new admin
screens are empty, saving **Banner, hero, demo & contact** fails (unknown
columns), and demo bookings can't be stored (the team alert email still goes
out).

**Supabase will warn about "destructive operations" and "tables without RLS".
Choose "Run without RLS".** Both warnings are false positives from its static
analyser:

- The only "destructive" statements are `drop policy if exists`, which remove
  policies, never data, and do nothing at all on a fresh database.
- RLS *is* enabled — on all 23 tables — but inside a `DO` block using
  `execute format(...)`. That is dynamic SQL the analyser cannot read.
  "Run without RLS" means "run my script unmodified", not "skip security".

`Success. No rows returned` is the expected result.

### 2.3 Add the keys

Copy `.env.example` to `.env.local` and fill in, from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> The service role key bypasses all security rules. It is server-only — never
> put it in a `NEXT_PUBLIC_` variable, and never commit `.env.local`.

Restart the dev server after editing `.env.local`.

### 2.4 Create the admin login

In Supabase: **Authentication → Users → Add user**. Enter the client's email and
a password, and tick *Auto Confirm User*.

Turn **off** public sign-ups so nobody else can create an account:
**Authentication → Providers → Email → Disable "Enable sign ups"**.

### 2.5 Load the starting content

Either sign in at `/admin` and use **First-time setup → Load starting content**,
or run it from the terminal before any admin user exists:

```bash
npm run seed
```

Both call the same `runSeed()` in `src/lib/admin/seed-core.ts`, so they cannot
drift. It only fills sections that are completely empty, so it is safe to run
twice and can never overwrite an edit. Lists split into groups - FAQ categories,
form dropdowns, SEO rows - are filled per group, so a new release can add a new
FAQ category, the demo form's time slots, or the SEO rows for `/courses` and
`/faq` to a database seeded long ago.

```bash
npm run seed -- --sample-batches
```

also loads the **sample** batch details (titles, schedules, start dates,
language, plus a weekend batch per branch) from `defaults.ts` into an existing
database. It fills only fields that are blank or still the starting
placeholder, and never touches fees, demo videos or visibility. Sample data must
be replaced with the client's real details before launch.

### 2.6 Move the bundled images into Supabase Storage

```bash
npm run upload-assets
```

Seeding points the logo and the 89 supplied images at files in `public/assets`.
Those render fine, but the client cannot replace or remove them without a code
deploy, which SRS 9.3 forbids. This uploads each one to the `media` bucket and
repoints the database at the uploaded copy.

The files in `public/assets` stay where they are on purpose — they remain the
fallback the site renders if the database is ever unreachable.

---

## 3. Bulk-import the result and press images

Uploading dozens of images one at a time through the admin panel is painful, so there
is an importer:

```bash
# Student result images -> homepage scrolling strip
node scripts/import-images.mjs --dir ./incoming/results --kind result

# Newspaper clippings -> homepage strip AND "In the News" on the About page
node scripts/import-images.mjs --dir ./incoming/press --kind press --news-strip

# See what would happen first
node scripts/import-images.mjs --dir ./incoming/results --dry-run
```

Afterwards, open **Result & press images** in the admin panel to improve the
descriptions — they matter for search engines and screen readers.

### Replacing the whole set of result posts

When a new batch of success posts replaces the old one, put the PNGs in
`public/assets/results/` (numbered, e.g. `1.png`, `2.png` … gaps are fine),
update `RESULT_POST_FILES` in `src/lib/defaults.ts` to list the numbers, then:

```bash
npm run sync-results -- --dry-run   # shows what will change
npm run sync-results                # uploads new, removes old, renumbers
```

Rows the admin has already described keep their text; only images that are no
longer in the folder are removed.

---

## 4. Optional services

Each of these is optional; the site degrades gracefully without them, and the
admin dashboard shows which are still missing.

### Lead alert emails and invoice delivery (SMTP)

```
LEAD_NOTIFICATION_EMAIL=office@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM="Acumen Gate Academy <office@example.com>"
```

Without these, leads are still saved and visible in the admin panel — the team
just doesn't get an email.

### Payment gateway (Razorpay)

```
PAYMENT_PROVIDER=razorpay  # or: stub
PAYMENT_KEY_ID=rzp_test_...       # Razorpay Key ID (rzp_live_... in production)
PAYMENT_KEY_SECRET=...            # Razorpay Key Secret - server only
PAYMENT_WEBHOOK_SECRET=...        # any long random string you also enter in Razorpay
GST_RATE_PERCENT=18
BUSINESS_LEGAL_NAME=
BUSINESS_GSTIN=
BUSINESS_ADDRESS=
```

Keys come from Razorpay Dashboard → Account & Settings → API Keys. Test-mode and
live-mode keys are separate; test keys start `rzp_test_` and never move real money.

Values are trimmed and unquoted before use, so stray spaces, line breaks or quote
marks picked up when pasting into a hosting dashboard don't break anything.

**Fees are GST-inclusive.** The fee on a batch is the total the student pays.
`calculateFees` in `src/lib/payments.ts` splits it into base
(total × 100 / (100 + `GST_RATE_PERCENT`), i.e. × 100/118 at 18%) and GST (the
remainder), so the two always add up to the fee exactly. ₹15,000 = ₹12,711.86 +
₹2,288.14 GST.

**Checking a deployment's payment settings:** open
`https://<domain>/api/payments/verify` in a browser. It returns something like

```json
{ "provider": "razorpay", "keyMode": "live", "keySecretSet": true,
  "webhookSecretSet": true, "gstDetailsSet": true }
```

It never shows a secret, only whether each is set. Before launch, every field
should read as above. `"provider": "stub"` or `"keyMode": "test"` on the live
site means students would not actually be charged.

**How a payment flows** (Razorpay Standard Checkout):

1. `/api/enroll` saves the enrollment as `initiated`, reads the fee from the
   batch record (never from the browser) and creates a Razorpay Order.
2. `/enroll/checkout` opens Razorpay Checkout for that order. Card and UPI
   details go straight to Razorpay.
3. On success the browser posts the signed response to `/api/payments/verify`,
   which checks the signature against the stored order id, reads the payment
   back from Razorpay, checks the amount, and marks the enrollment paid.
4. `/api/payments/webhook` is the backstop for a student who closes the tab
   right after paying. Both paths share one function, and only one of them can
   mark an enrollment paid, so nobody gets two invoices.

**Testing locally (test keys):** `npm run dev`, open a course page, and under
*Batches & fees* click Enroll & Pay on a batch with a fee. In Checkout use UPI `success@razorpay` (or `failure@razorpay`), or
card `4100 2800 0000 1007` with any future expiry and any CVV. Test-mode OTP
prompts accept `754081`. Webhooks cannot reach `localhost`; step 3 covers
local testing on its own.

**Before going live:**

- Razorpay → Account & Settings → **Payment Capture**: automatic. Without it
  payments sit "authorized" and Razorpay refunds them.
- Razorpay → Account & Settings → **Webhooks** → Add New Webhook (live mode):
  URL `https://<domain>/api/payments/webhook`, events `order.paid`,
  `payment.captured`, `payment.failed`, and a secret that matches
  `PAYMENT_WEBHOOK_SECRET`.
- Swap in the **live** Key ID and Secret. Leaving test keys in production shows
  students a success screen while no money is collected.
- After deploying, open `/api/payments/verify` (above) and confirm it shows
  `razorpay`, `live` and `true` everywhere.
- Run one real low-value payment end to end, then refund it from the dashboard.

`PAYMENT_PROVIDER=stub` brings back the local simulator on `/enroll/checkout`
(no money moves), which is handy for testing the admin side without Razorpay.

### SMS / WhatsApp confirmations

Not yet chosen. See [PENDING.md](./PENDING.md).

```
MESSAGING_PROVIDER=stub    # or: msg91, twilio
MESSAGING_API_KEY=
MESSAGING_SENDER_ID=
MESSAGING_ACCOUNT_SID=     # Twilio only
```

With `stub`, messages are logged, not sent — and the site does **not** tell the
student a confirmation was sent, because it wasn't.

> Indian SMS requires **DLT template registration** with TRAI before anything
> will deliver, whichever provider is chosen. Approval takes days — start early.

---

## 5. Deploy to Vercel

1. Push this repository to GitHub.
2. Import it at <https://vercel.com>. The framework is detected automatically.
3. Add every variable from `.env.local` under **Settings → Environment
   Variables**, and set `NEXT_PUBLIC_SITE_URL` to the real domain.
4. Connect the client's domain under **Settings → Domains** and follow the DNS
   instructions.
5. After go-live, submit `https://yourdomain.com/sitemap.xml` to Google Search
   Console.

---

## 6. Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript check with no build |
| `npm run shots:start` | Build first, then: starts the server, screenshots every route at 390×844 and 1280×800 (plus the mobile enquiry sheet, menu, a card rail and the footer) into `screenshots/`. First run needs `npx playwright install chromium` (~200 MB, dev-only). |
| `node scripts/e2e-mobile-lead.mjs` | Submits ONE labelled test enquiry through the real mobile flow and checks reduced-motion rendering. Deletes nothing - remove the test row from General Enquiries afterwards. |

---

## 7. How the code is laid out

```
src/
  app/
    (site)/          Public pages. The layout here owns the header, footer,
                     all popups, the free demo panel and the chat widget.
      courses/       /courses and /courses/[slug].
      faq/           /faq.
    admin/           Admin panel. Its own shell, no public chrome.
    api/             Form handling (enquiry, seminar, demo), payments,
                     admin upload and export.
  components/
    site/            Header (+ CoursesMenu), footer, popups, free demo panel
                     and prompts (DemoDrawer, DemoHooks), chat.
    courses/         Course pages: BranchArt, syllabus, batches, exam
                     pattern, countdown, GATE guide.
    faq/             FAQ accordion and the searchable FAQ page.
    art/             Animated line illustrations (LineArt + Icons + Scenes):
                     strokes draw in on scroll, then one gentle loop. Used
                     in the hero, Why Choose, course cards, About, Results,
                     success screens and the 404. Rules in globals.css (.la).
    home/ about/     Page sections.
    news/ results/
    admin/           Admin panel building blocks.
    ui/              Modal and image primitives.
  lib/
    defaults.ts      Every piece of starting copy, in one place - including
                     the sample courses, syllabus, batches and FAQs.
    gate-info.ts     Facts about the GATE exam itself (pattern, timeline).
    content.ts       The single read path: Supabase, falling back to defaults.
    payments.ts      Payment provider adapter + GST calculation.
    messaging.ts     SMS/WhatsApp adapter + lead alert email.
    admin/           Auth, the content registry, and server actions.
supabase/migrations/ Database schema.
scripts/             Seeder, bulk image importer, screenshots.
```

Two decisions worth knowing about:

**All popups are mounted once, in `(site)/layout.tsx`.** The SRS records a bug
found during prototyping where the carousel and lightbox stopped working after
routing was introduced. That class of bug comes from per-page popup state, so
the popup stack is owned above the routed content and survives navigation.

**Content is read through `lib/content.ts` only.** Every getter tries Supabase
and falls back to `defaults.ts` if the database is unconfigured, empty or
unreachable — so a transient database problem blanks nothing.
