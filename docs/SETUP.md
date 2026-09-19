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

That file is the three migrations concatenated:

| File | What it does |
|---|---|
| `supabase/migrations/0001_init.sql` | All tables, indexes and row-level security |
| `supabase/migrations/0002_functions.sql` | Sequential GST invoice numbering |
| `supabase/migrations/0003_storage.sql` | The `media` image bucket and its access rules |

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
twice and can never overwrite an edit.

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

Uploading ~84 images one at a time through the admin panel is painful, so there
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

### Payment gateway

Not yet chosen. See [PENDING.md](./PENDING.md).

```
PAYMENT_PROVIDER=stub      # or: razorpay
PAYMENT_KEY_ID=
PAYMENT_KEY_SECRET=
PAYMENT_WEBHOOK_SECRET=
GST_RATE_PERCENT=18
BUSINESS_LEGAL_NAME=
BUSINESS_GSTIN=
BUSINESS_ADDRESS=
```

With `stub`, no real money can move; `/enroll/checkout` shows a clearly-labelled
simulator so the whole flow — success, failure and abandonment — can be tested.

To switch to a real gateway, set the variables above and point the gateway's
webhook at `https://yourdomain.com/api/payments/webhook`.

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
                     all popups and the chat widget.
    admin/           Admin panel. Its own shell, no public chrome.
    api/             Form handling, payments, admin upload and export.
  components/
    site/            Header, footer, popups, chat — the shared UI.
    home/ about/     Page sections.
    news/ results/
    admin/           Admin panel building blocks.
    ui/              Modal and image primitives.
  lib/
    defaults.ts      Every piece of SRS copy, in one place.
    content.ts       The single read path: Supabase, falling back to defaults.
    payments.ts      Payment provider adapter + GST calculation.
    messaging.ts     SMS/WhatsApp adapter + lead alert email.
    admin/           Auth, the content registry, and server actions.
supabase/migrations/ Database schema.
scripts/             Bulk image importer.
```

Two decisions worth knowing about:

**All popups are mounted once, in `(site)/layout.tsx`.** The SRS records a bug
found during prototyping where the carousel and lightbox stopped working after
routing was introduced. That class of bug comes from per-page popup state, so
the popup stack is owned above the routed content and survives navigation.

**Content is read through `lib/content.ts` only.** Every getter tries Supabase
and falls back to `defaults.ts` if the database is unconfigured, empty or
unreachable — so a transient database problem blanks nothing.
