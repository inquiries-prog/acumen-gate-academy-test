-- ===========================================================================
-- 0007 - Result entries: photo type and review flags
--
--   photo_is_post  true  = the photo is an Acumen "Meet our Champion" post,
--                          and the page cuts the face out of its circle;
--                  false = an ordinary portrait, shown as it is.
--   review_note    a note for the team, shown as a yellow flag in admin
--                  (e.g. a possible duplicate from a bulk import). Never shown
--                  on the website. Clear it once checked.
--
-- Safe to run more than once. Existing rows keep photo_is_post = true (they
-- are all success posts).
-- ===========================================================================

alter table result_entries add column if not exists photo_is_post boolean not null default true;
alter table result_entries add column if not exists review_note   text    not null default '';
