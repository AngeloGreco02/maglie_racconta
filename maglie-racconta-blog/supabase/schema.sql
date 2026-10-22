create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'editor' check (role in ('admin','editor'))
);
create table if not exists public.articles (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 slug text not null unique,
 excerpt text not null default '',
 body_html text not null default '',
 category text not null default 'Territorio',
 cover_url text,
 cover_alt text,
 seo_title text,
 seo_description text,
 status text not null default 'draft' check (status in ('draft','published')),
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
create policy "profile owner can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "public can read published articles" on public.articles for select to anon, authenticated using (status='published' and published_at is not null and published_at <= now());
create policy "admin can read all articles" on public.articles for select to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "admin can insert articles" on public.articles for insert to authenticated with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "admin can update articles" on public.articles for update to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "admin can delete articles" on public.articles for delete to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
insert into storage.buckets(id,name,public) values ('article-covers','article-covers',true) on conflict (id) do nothing;
create policy "public can view article covers" on storage.objects for select using (bucket_id='article-covers');
create policy "authenticated users can upload covers" on storage.objects for insert to authenticated with check (bucket_id='article-covers');
create policy "authenticated users can update own covers" on storage.objects for update to authenticated using (bucket_id='article-covers' and owner=auth.uid()) with check (bucket_id='article-covers' and owner=auth.uid());
