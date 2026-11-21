-- ===========================================================================
-- 0004 - Course pages, free demo registrations, FAQ page
--
-- Replaces the Offline/Online batches popups with real course pages:
--   * courses           one row per course page (/courses/<slug>)
--   * course_subjects   the syllabus on each course page
--   * batches           may now have SEVERAL batches per branch and mode
--                       (e.g. a weekday and a weekend batch), plus a title,
--                       schedule, teaching language and an optional badge
--   * faqs.category     groups questions on the new /faq page
--   * demo_registrations  the free demo class list - a third lead list, kept
--                       separate from enquiries and seminar leads (SRS 10)
--   * site_settings     GATE exam date (for the countdown) and the free demo
--                       panel's wording and auto-prompt
--
-- Safe to run more than once. Adds columns and tables only; existing rows are
-- kept. After running it, `npm run seed` fills the new tables with the
-- starting content from src/lib/defaults.ts (it never overwrites edits).
-- ===========================================================================

-- --- Course pages ----------------------------------------------------------
create table if not exists courses (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,          -- web address: /courses/<slug>
  title            text not null,
  short_title      text not null default '',      -- used in menus and cards
  category         text not null default 'gate' check (category in ('gate','gpsc')),
  -- Links the course to its batches: batches belong to a branch, and a GATE
  -- course page shows every visible batch of the branch with this code.
  branch_code      text not null default '',
  tagline          text not null default '',
  overview         text not null default '',
  highlights       text not null default '',      -- one per line
  who_should_join  text not null default '',      -- one per line
  image_url        text not null default '',
  alt_text         text not null default '',
  meta_title       text not null default '',
  meta_description text not null default '',
  visible          boolean not null default true,
  sort_order       int not null default 0
);

create table if not exists course_subjects (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references courses(id) on delete cascade,
  subject    text not null,
  topics     text not null default '',            -- one per line
  weightage  text not null default '',            -- free text, e.g. "8-10 marks"
  visible    boolean not null default true,
  sort_order int not null default 0
);

create index if not exists idx_course_subjects_course on course_subjects (course_id, sort_order);

-- --- Batches: more than one per branch and mode ---------------------------
alter table batches drop constraint if exists batches_branch_id_mode_key;
alter table batches add column if not exists title    text not null default '';
alter table batches add column if not exists schedule text not null default '';
alter table batches add column if not exists medium   text not null default '';
alter table batches add column if not exists badge    text not null default '';

-- --- FAQ page categories ---------------------------------------------------
-- Existing questions are the About-page set, so they default to 'about'.
alter table faqs add column if not exists category text not null default 'about';

-- --- Site settings: GATE countdown + free demo panel -----------------------
alter table site_settings add column if not exists gate_exam_label     text    not null default '';
alter table site_settings add column if not exists gate_exam_date      text    not null default '';
alter table site_settings add column if not exists demo_heading        text    not null default '';
alter table site_settings add column if not exists demo_subtext        text    not null default '';
alter table site_settings add column if not exists demo_nudge_enabled  boolean not null default true;
alter table site_settings add column if not exists demo_nudge_seconds  text    not null default '25';

-- --- Free demo class registrations (a lead list) ---------------------------
create table if not exists demo_registrations (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  phone          text not null,
  branch         text not null default '',
  mode           text not null default '',        -- Online / Offline at Vadodara / ...
  preferred_slot text not null default '',
  source         text not null default '',        -- which button opened the form
  contacted      boolean not null default false,
  notes          text not null default '',
  created_at     timestamptz not null default now()
);

create index if not exists idx_demo_registrations_created on demo_registrations (created_at desc);

-- --- Row level security ----------------------------------------------------
do $rls$
declare t text;
begin
  foreach t in array array['courses','course_subjects'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read %1$s" on %1$I', t);
    execute format('create policy "public read %1$s" on %1$I for select using (true)', t);
  end loop;

  -- A lead table: no policies, so only the server (service role) can touch it.
  alter table demo_registrations enable row level security;
end
$rls$;
