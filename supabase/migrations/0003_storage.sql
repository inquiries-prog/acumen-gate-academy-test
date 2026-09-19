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
