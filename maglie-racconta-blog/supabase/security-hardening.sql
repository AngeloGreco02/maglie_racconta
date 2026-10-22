-- Maglie Racconta security hardening
-- Run in Supabase SQL Editor for the Maglie Racconta project only.

-- Restrict cover uploads to common web image types and 5 MB.
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id = 'article-covers';

-- Remove the original broad upload policies.
drop policy if exists "authenticated users can upload covers" on storage.objects;
drop policy if exists "authenticated users can update own covers" on storage.objects;
drop policy if exists "admin can upload article covers" on storage.objects;
drop policy if exists "admin can update article covers" on storage.objects;
drop policy if exists "admin can delete article covers" on storage.objects;

-- Only users with an admin profile can add, replace, or delete cover files.
create policy "admin can upload article covers"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'article-covers'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "admin can update article covers"
on storage.objects for update to authenticated
using (
  bucket_id = 'article-covers'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  bucket_id = 'article-covers'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "admin can delete article covers"
on storage.objects for delete to authenticated
using (
  bucket_id = 'article-covers'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
