-- ===========================================================================
-- ACUMEN GATE ACADEMY - COMPLETE DATABASE SETUP
--
-- Copy this ENTIRE file and paste it into the Supabase SQL Editor, then
-- press Run. It is safe to run more than once.
--
-- This is migrations 0001 + 0002 + 0003 combined for convenience.
-- ===========================================================================


-- >>>>>>>>>>>>>>>>>>>> 0001_init.sql >>>>>>>>>>>>>>>>>>>>

-- ===========================================================================
-- Acumen Gate Academy - initial schema
-- Every table here exists so that SRS 9.3 holds: no content change on this
-- site should ever require a code edit or redeploy.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --- Singleton site settings (SRS 6.1, 6.2, 6.3, 7.1.1) --------------------
create table if not exists site_settings (
  id                    boolean primary key default true check (id),
  -- Announcement banner (SRS 6.2)
  banner_enabled        boolean not null default true,
  banner_text           text    not null default '',
  banner_link_label     text    not null default '',
  banner_link_action    text    not null default 'seminar',   -- seminar | enquiry | url | none
  banner_link_url       text    not null default '',
  -- Hero (SRS 7.1.1)
  hero_headline         text    not null default '',
  hero_tagline          text    not null default '',
  hero_primary_cta      text    not null default 'Enquire now',
  hero_secondary_cta    text    not null default 'Explore courses',
  -- Stat line (SRS 7.1.3) - the ONLY headline number on the site.
  stat_line             text    not null default '',
  -- Contact / footer (SRS 6.3)
  phone                 text    not null default '',
  email                 text    not null default '',
  footer_tagline        text    not null default '',
  instagram_url         text    not null default '',
  youtube_url           text    not null default '',
  facebook_url          text    not null default '',
  google_rating         text    not null default '',
  google_reviews_count  text    not null default '',
  google_reviews_url    text    not null default '',
  logo_url              text    not null default '',
  acumen360_logo_url    text    not null default '',
  etude360_logo_url     text    not null default '',
  final_cta_heading     text    not null default '',
  final_cta_button      text    not null default '',
  updated_at            timestamptz not null default now()
);

-- --- Homepage carousel + About "In the News" strip (SRS 7.1.2, 7.2.7) ------
-- One library, two placements, so the client uploads a clipping once.
create table if not exists gallery_images (
  id                  uuid primary key default gen_random_uuid(),
  image_url           text not null,
  alt_text            text not null default '',          -- SRS 13: alt text required
  kind                text not null default 'result' check (kind in ('result','press')),
  show_in_carousel    boolean not null default true,
  show_in_news_strip  boolean not null default false,
  sort_order          int  not null default 0,
  created_at          timestamptz not null default now()
);

-- --- Our Courses cards (SRS 7.1.4) -----------------------------------------
create table if not exists course_cards (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  banner_label text not null default '',
  description  text not null default '',
  image_url    text not null default '',
  alt_text     text not null default '',
  -- What the card button opens. Keeps SRS 7.1.4 behaviour admin-switchable.
  action       text not null default 'enquiry'
               check (action in ('batches_offline','batches_online','enquiry')),
  button_label text not null default '',
  visible      boolean not null default true,
  sort_order   int not null default 0
);

-- --- Branches + batches (SRS 7.1.6, 9.2) -----------------------------------
create table if not exists branches (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,            -- ME, CE, CSE, EE, EC, CH
  name       text not null,
  visible    boolean not null default true,
  sort_order int not null default 0
);

create table if not exists batches (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid not null references branches(id) on delete cascade,
  mode           text not null check (mode in ('offline','online')),
  start_date     text not null default '',     -- free text: client writes "12 Jan 2026" etc.
  duration       text not null default '',
  faculty        text not null default '',
  fees           numeric(10,2),                -- used by the Enroll & Pay flow (SRS 11)
  fees_note      text not null default '',
  seats          text not null default '',
  -- Per-branch demo video (SRS 7.1.6 / 9.2) - explicitly NOT a global video.
  video_id       text not null default '',
  video_start    int  not null default 0,
  enroll_enabled boolean not null default true,
  visible        boolean not null default true,
  sort_order     int not null default 0,
  unique (branch_id, mode)
);

-- --- 9-point pedagogy checklist (SRS 7.1.6, 7.2.4) -------------------------
create table if not exists pedagogy_points (
  id         uuid primary key default gen_random_uuid(),
  text       text not null,
  sort_order int not null default 0
);

-- --- Why Choose Acumen (SRS 7.1.5) -----------------------------------------
create table if not exists why_choose_cards (
  id         uuid primary key default gen_random_uuid(),
  heading    text not null,
  body       text not null,
  sort_order int not null default 0
);

-- --- Testimonials (SRS 7.1.7 homepage, 7.4 results page) -------------------
create table if not exists testimonials (
  id           uuid primary key default gen_random_uuid(),
  scope        text not null default 'home' check (scope in ('home','results')),
  media_type   text not null default 'photo' check (media_type in ('photo','video')),
  image_url    text not null default '',
  alt_text     text not null default '',
  video_id     text not null default '',
  student_name text not null,
  university   text not null default '',
  rank_branch  text not null default '',
  quote        text not null default '',
  visible      boolean not null default true,
  sort_order   int not null default 0
);

-- --- Mentors (SRS 7.1.9) ---------------------------------------------------
create table if not exists mentors (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  title      text not null default 'Lead Mentor',
  bio        text not null default '',
  image_url  text not null default '',
  alt_text   text not null default '',
  visible    boolean not null default true,
  sort_order int not null default 0
);

-- --- Results page (SRS 7.4) ------------------------------------------------
-- Years are rows, never a hardcoded list, and each is independently hideable.
create table if not exists result_years (
  id         uuid primary key default gen_random_uuid(),
  label      text not null unique,             -- "GATE 2026"
  year       int  not null,
  visible    boolean not null default true,
  sort_order int not null default 0
);

create table if not exists result_entries (
  id           uuid primary key default gen_random_uuid(),
  year_id      uuid not null references result_years(id) on delete cascade,
  student_name text not null,
  image_url    text not null default '',
  alt_text     text not null default '',
  university   text not null default '',
  branch       text not null default '',
  air          text not null default '',
  visible      boolean not null default true,
  sort_order   int not null default 0
);

-- --- News & Updates (SRS 7.3) ----------------------------------------------
create table if not exists news_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text not null default '',
  content      text not null default '',
  published_at date not null default current_date,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- --- About Us editable copy (SRS 7.2, 9.2) ---------------------------------
create table if not exists about_blocks (
  key     text primary key,                    -- opening | story | different
  heading text not null default '',
  body    text not null default ''
);

create table if not exists ecosystem_cards (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  year        text not null default '',
  description text not null default '',
  logo_url    text not null default '',
  -- Acumen Gate Academy must read as the lead entity (SRS 1.2, 7.2.3).
  highlighted boolean not null default false,
  sort_order  int not null default 0
);

create table if not exists centers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  label        text not null default '',
  address      text not null default '',
  -- Vidyanagar has NO address anywhere on the site (SRS 6.3, 15.8).
  show_address boolean not null default true,
  description  text not null default '',
  phone        text not null default '',
  sort_order   int not null default 0
);

create table if not exists faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  visible    boolean not null default true,
  sort_order int not null default 0
);

-- --- Form dropdown options, admin-editable (SRS 9.2) -----------------------
create table if not exists form_options (
  id         uuid primary key default gen_random_uuid(),
  field_key  text not null,             -- branch | enquiry_for | heard_about | interested_for
  label      text not null,
  visible    boolean not null default true,
  sort_order int not null default 0
);

-- --- Seminar universities + per-university offer (SRS 8.2, 9.2) ------------
create table if not exists universities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  offer_text text not null default '',
  visible    boolean not null default true,
  sort_order int not null default 0
);

-- --- Per-page SEO (SRS 13) -------------------------------------------------
create table if not exists page_seo (
  path             text primary key,           -- "/", "/about", "/news", "/results"
  meta_title       text not null default '',
  meta_description text not null default ''
);

-- --- Legal pages (SRS 12: copy pending, but the container must exist) ------
create table if not exists legal_pages (
  slug    text primary key,                    -- privacy | terms
  title   text not null default '',
  content text not null default ''
);

-- ===========================================================================
-- LEADS - two separate lists, never merged (SRS 10)
-- ===========================================================================
create table if not exists general_enquiries (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text not null,
  branch      text not null default '',
  enquiry_for text not null default '',
  heard_about text not null default '',
  source      text not null default '',        -- which CTA opened the form
  contacted   boolean not null default false,
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists seminar_leads (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  mobile         text not null,
  branch         text not null default '',
  university     text not null default '',
  city           text not null default '',
  interested_for text not null default '',
  offer_shown    text not null default '',     -- snapshot of the offer at submit time
  contacted      boolean not null default false,
  notes          text not null default '',
  created_at     timestamptz not null default now()
);

-- --- Paid enrollments, kept distinct from leads (SRS 11.4) -----------------
create table if not exists enrollments (
  id              uuid primary key default gen_random_uuid(),
  batch_id        uuid references batches(id) on delete set null,
  batch_label     text not null default '',    -- snapshot, survives batch deletion
  full_name       text not null,
  phone           text not null,
  email           text not null,
  billing_address text not null default '',
  fee_amount      numeric(10,2) not null default 0,
  gst_amount      numeric(10,2) not null default 0,
  total_amount    numeric(10,2) not null default 0,
  gst_rate        numeric(5,2)  not null default 18,
  -- initiated -> paid | failed | abandoned. Failed/abandoned rows are kept on
  -- purpose so the team can follow up manually (SRS 11.5).
  status          text not null default 'initiated'
                  check (status in ('initiated','paid','failed','abandoned')),
  provider        text not null default '',
  payment_ref     text not null default '',
  invoice_number  text not null default '',
  contacted       boolean not null default false,
  created_at      timestamptz not null default now(),
  paid_at         timestamptz
);

-- Invoice numbers must be sequential for GST (SRS 11.3).
create sequence if not exists invoice_number_seq start 1;

create index if not exists idx_general_enquiries_created on general_enquiries (created_at desc);
create index if not exists idx_seminar_leads_created     on seminar_leads (created_at desc);
create index if not exists idx_enrollments_created       on enrollments (created_at desc);
create index if not exists idx_enrollments_status        on enrollments (status);
create index if not exists idx_result_entries_year       on result_entries (year_id, sort_order);
create index if not exists idx_batches_branch            on batches (branch_id);
create index if not exists idx_news_published            on news_posts (published, published_at desc);

-- ===========================================================================
-- ROW LEVEL SECURITY
-- Public content is readable by anyone. Nothing public is writable, and lead
-- tables are not publicly readable at all - writes go through the server with
-- the service role key so bots cannot enumerate or forge leads.
-- ===========================================================================
do $rls$
declare t text;
begin
  foreach t in array array[
    'site_settings','gallery_images','course_cards','branches','batches',
    'pedagogy_points','why_choose_cards','testimonials','mentors',
    'result_years','result_entries','news_posts','about_blocks',
    'ecosystem_cards','centers','faqs','form_options','universities',
    'page_seo','legal_pages'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read %1$s" on %1$I', t);
    execute format('create policy "public read %1$s" on %1$I for select using (true)', t);
  end loop;

  -- No policies at all on lead tables => anon/authenticated clients get
  -- nothing. Only the service role (which bypasses RLS) can touch them.
  foreach t in array array['general_enquiries','seminar_leads','enrollments'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end
$rls$;


-- >>>>>>>>>>>>>>>>>>>> 0002_functions.sql >>>>>>>>>>>>>>>>>>>>

-- ===========================================================================
-- Helper functions
-- ===========================================================================

-- GST invoice numbers must be sequential and must not repeat, even if two
-- payments are confirmed at the same instant. A sequence gives that guarantee
-- where a "max(invoice_number) + 1" query would not.
--
-- security definer so it can be called with the service role from the payment
-- webhook without granting sequence rights more broadly.
create or replace function next_invoice_number()
returns bigint
language sql
security definer
set search_path = public
as $fn$
  select nextval('invoice_number_seq');
$fn$;

revoke execute on function next_invoice_number() from anon, authenticated;


-- >>>>>>>>>>>>>>>>>>>> 0003_storage.sql >>>>>>>>>>>>>>>>>>>>

-- ===========================================================================
-- Image storage (SRS 9.1: image fields are an upload control, never a URL box)
-- ===========================================================================

-- Public bucket: everything in it is site imagery meant to be seen by visitors.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Anyone may read (the site is public); only a signed-in admin may change.
drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media');

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media');

