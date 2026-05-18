-- Run in Supabase SQL Editor
create table if not exists public.pdfs (
  id bigserial primary key,
  file_name text not null,
  file_size bigint not null,
  storage_path text not null,
  download_url text not null,
  created_at timestamptz not null default now()
);

alter table public.pdfs enable row level security;

create policy "public read pdfs" on public.pdfs
for select to anon, authenticated using (true);

create policy "public insert pdfs" on public.pdfs
for insert to anon, authenticated with check (true);

create policy "public delete pdfs" on public.pdfs
for delete to anon, authenticated using (true);
