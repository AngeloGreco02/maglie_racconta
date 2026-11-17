-- Maglie Racconta: contatore delle visualizzazioni degli articoli.
-- Eseguire nel SQL Editor di Supabase DOPO schema.sql, sul progetto di Maglie Racconta.
-- Lo script è rieseguibile.
--
-- Scelte privacy (GDPR):
-- * È un semplice contatore per articolo: non si salvano IP, cookie, orari o identificativi dei lettori.
-- * Il sito conta al massimo una visualizzazione per articolo per scheda del browser
--   (lo ricorda il browser stesso in sessionStorage, che si cancella chiudendo la scheda).

create table if not exists public.article_views (
  article_id uuid primary key references public.articles(id) on delete cascade,
  view_count bigint not null default 0 check (view_count >= 0)
);

alter table public.article_views enable row level security;

-- Chiunque può leggere i contatori (sono numeri pubblici mostrati sul sito).
drop policy if exists "public reads article views" on public.article_views;
create policy "public reads article views"
on public.article_views for select to anon, authenticated
using (true);

-- Nessuno scrive direttamente nella tabella: solo tramite la funzione qui sotto.
revoke insert, update, delete on public.article_views from anon, authenticated;

-- Unico modo per modificare il contatore: +1 su un articolo pubblicato.
create or replace function public.register_article_view(p_article_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count bigint;
begin
  if not exists (
    select 1 from public.articles a
    where a.id = p_article_id
      and a.status = 'published'
      and a.published_at is not null
      and a.published_at <= now()
  ) then
    raise exception 'Articolo non trovato';
  end if;

  insert into public.article_views as v (article_id, view_count)
  values (p_article_id, 1)
  on conflict (article_id) do update set view_count = v.view_count + 1
  returning v.view_count into v_count;

  return v_count;
end;
$$;

revoke all on function public.register_article_view(uuid) from public;
grant execute on function public.register_article_view(uuid) to anon, authenticated;
