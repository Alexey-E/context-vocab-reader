create table public.sample_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null,
  source_language varchar(10) not null,
  target_language varchar(10) not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),

  constraint sample_documents_slug_not_blank
    check (btrim(slug) <> ''),

  constraint sample_documents_title_not_blank
    check (btrim(title) <> ''),

  constraint sample_documents_content_not_blank
    check (btrim(content) <> ''),

  constraint sample_documents_source_language_not_blank
    check (btrim(source_language) <> ''),

  constraint sample_documents_target_language_not_blank
    check (btrim(target_language) <> ''),

  constraint sample_documents_sort_order_nonnegative
    check (sort_order >= 0)
);

create index sample_documents_sort_order_idx
  on public.sample_documents (sort_order, created_at);

alter table public.sample_documents enable row level security;

revoke all
  on table public.sample_documents
  from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select
  on table public.sample_documents
  to anon, authenticated;

create policy sample_documents_public_read
on public.sample_documents
for select
to anon, authenticated
using (true);
