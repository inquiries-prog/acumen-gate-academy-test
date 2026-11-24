-- ===========================================================================
-- 0008 - "Download the syllabus" buttons on a news post
--
-- news_posts.syllabus_links: when true, the post page shows a row of buttons,
-- one per GATE course, each opening that course's syllabus section (where the
-- official PDF download is). Turned on for the GATE 2027 syllabus post.
-- Safe to run more than once.
-- ===========================================================================

alter table news_posts add column if not exists syllabus_links boolean not null default false;

update news_posts set syllabus_links = true
  where slug = 'gate-2027-syllabus-released-download-official-pdfs';
