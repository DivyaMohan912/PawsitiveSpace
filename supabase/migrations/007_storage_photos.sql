-- Storage policies for the "photos" bucket used by adoption/rescue uploads.
-- Without these, anonymous fosters uploading a photo hit an RLS error and the
-- form silently keeps the "please add a photo" state.

-- Ensure the bucket exists and is public so getPublicUrl() resolves.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

-- Allow anyone (anon + authenticated) to upload into the photos bucket.
drop policy if exists "photos anon upload" on storage.objects;
create policy "photos anon upload"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'photos');

-- Allow public read of objects in the photos bucket.
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'photos');
