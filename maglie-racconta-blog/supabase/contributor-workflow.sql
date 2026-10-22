-- Maglie Racconta: contributi inviati dai collaboratori e approvati dall'amministratore.
-- Eseguire nel SQL Editor di Supabase dopo aver verificato il progetto corretto.

create table if not exists public.contributor_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  title text not null,
  slug text not null,
  excerpt text not null default '',
  body_html text not null,
  category text not null default 'Cronaca',
  cover_url text,
  cover_alt text,
  seo_title text,
  seo_description text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  article_id uuid references public.articles(id) on delete set null
);

alter table public.articles add column if not exists author_name text;

alter table public.contributor_submissions enable row level security;

drop policy if exists "Contributors submit their own articles" on public.contributor_submissions;
create policy "Contributors submit their own articles"
on public.contributor_submissions for insert to authenticated
with check (user_id = auth.uid() and status = 'pending');

drop policy if exists "Contributors read own submissions or admins read all" on public.contributor_submissions;
create policy "Contributors read own submissions or admins read all"
on public.contributor_submissions for select to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "Admins review submissions" on public.contributor_submissions;
create policy "Admins review submissions"
on public.contributor_submissions for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create or replace function public.approve_contribution(submission_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission public.contributor_submissions%rowtype;
  v_article_id uuid;
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'Solo un amministratore può approvare i contributi';
  end if;

  select * into v_submission
  from public.contributor_submissions
  where id = submission_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Contributo non trovato o già revisionato';
  end if;

  insert into public.articles
    (title, slug, excerpt, body_html, category, cover_url, cover_alt, seo_title, seo_description, author_name, status, published_at, updated_at)
  values
    (v_submission.title, v_submission.slug, v_submission.excerpt, v_submission.body_html,
     v_submission.category, v_submission.cover_url, v_submission.cover_alt,
     v_submission.seo_title, v_submission.seo_description, v_submission.author_name, 'published', now(), now())
  returning id into v_article_id;

  update public.contributor_submissions
  set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid(), article_id = v_article_id
  where id = v_submission.id;

  return v_article_id;
end;
$$;

revoke all on function public.approve_contribution(uuid) from public;
grant execute on function public.approve_contribution(uuid) to authenticated;

-- Collaborators should not publish or change review status themselves.
-- Create their Supabase Auth accounts manually and add a public.profiles row with role='contributor'.
