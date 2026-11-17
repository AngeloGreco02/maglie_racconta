-- Maglie Racconta: "Mi piace" e commenti moderati sugli articoli.
-- Eseguire nel SQL Editor di Supabase DOPO schema.sql, sul progetto di Maglie Racconta.
-- Lo script è rieseguibile.
--
-- Scelte privacy (GDPR):
-- * I "mi piace" sono un semplice contatore: non si salvano IP, cookie o identificativi.
-- * I commenti chiedono solo un nome (anche di fantasia) e il testo. Niente email, niente IP.
-- * Un commento resta invisibile finché un amministratore non lo approva.

-- ---------------------------------------------------------------
-- 1. MI PIACE
-- ---------------------------------------------------------------
alter table public.articles add column if not exists like_count integer not null default 0;

-- Unico modo per modificare il contatore: +1 o -1 su un articolo pubblicato.
create or replace function public.toggle_article_like(p_article_id uuid, p_like boolean)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.articles
  set like_count = greatest(0, like_count + case when p_like then 1 else -1 end)
  where id = p_article_id
    and status = 'published'
    and published_at is not null
    and published_at <= now()
  returning like_count into v_count;

  if v_count is null then
    raise exception 'Articolo non trovato';
  end if;

  return v_count;
end;
$$;

revoke all on function public.toggle_article_like(uuid, boolean) from public;
grant execute on function public.toggle_article_like(uuid, boolean) to anon, authenticated;

-- ---------------------------------------------------------------
-- 2. COMMENTI
-- ---------------------------------------------------------------
create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_name text not null check (char_length(btrim(author_name)) between 2 and 60),
  body text not null check (char_length(btrim(body)) between 3 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create index if not exists article_comments_article_status_idx
  on public.article_comments (article_id, status, created_at);

alter table public.article_comments enable row level security;

-- Chiunque legge solo i commenti approvati.
drop policy if exists "public reads approved comments" on public.article_comments;
create policy "public reads approved comments"
on public.article_comments for select to anon, authenticated
using (status = 'approved');

-- Gli amministratori leggono tutto (anche in attesa e rifiutati).
drop policy if exists "admins read all comments" on public.article_comments;
create policy "admins read all comments"
on public.article_comments for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Chiunque può inviare un commento, ma solo "in attesa" e solo su articoli pubblicati.
drop policy if exists "anyone submits pending comments" on public.article_comments;
create policy "anyone submits pending comments"
on public.article_comments for insert to anon, authenticated
with check (
  status = 'pending'
  and reviewed_at is null
  and reviewed_by is null
  and exists (
    select 1 from public.articles a
    where a.id = article_id
      and a.status = 'published'
      and a.published_at is not null
      and a.published_at <= now()
  )
);

-- Solo gli amministratori moderano ed eliminano.
drop policy if exists "admins moderate comments" on public.article_comments;
create policy "admins moderate comments"
on public.article_comments for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "admins delete comments" on public.article_comments;
create policy "admins delete comments"
on public.article_comments for delete to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Il pubblico può solo inserire e leggere: nessun update/delete per anon.
revoke update, delete on public.article_comments from anon;
