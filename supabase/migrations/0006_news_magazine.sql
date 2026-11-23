-- ===========================================================================
-- 0006 - News & Updates as a magazine, plus an important dates tracker
--
--   news_posts.category   gate | psu | results | acumen  (tabs and tags)
--   news_posts.cover_url  optional cover image (else animated cover art)
--   news_posts.featured   the big story at the top of /news
--   key_dates             upcoming deadlines shown with live countdowns
--
-- Safe to run more than once. Adds columns and a table only; existing posts
-- become category 'psu' (the one post so far is a recruitment notice).
-- ===========================================================================

alter table news_posts add column if not exists category  text    not null default 'psu';
alter table news_posts add column if not exists cover_url text    not null default '';
alter table news_posts add column if not exists featured  boolean not null default false;

create table if not exists key_dates (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date        date not null,
  detail      text not null default '',
  kind        text not null default 'exam' check (kind in ('exam','psu','acumen')),
  -- false shows an "Expected" tag: a date the official body hasn't confirmed.
  confirmed   boolean not null default false,
  link_url    text not null default '',
  link_label  text not null default '',
  visible     boolean not null default true,
  sort_order  int not null default 0
);

create index if not exists idx_key_dates_date on key_dates (date);

do $rls$
begin
  alter table key_dates enable row level security;
  drop policy if exists "public read key_dates" on key_dates;
  create policy "public read key_dates" on key_dates for select using (true);
end
$rls$;
