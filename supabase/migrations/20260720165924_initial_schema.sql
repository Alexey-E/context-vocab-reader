create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name varchar(30),
  avatar_url text,
  native_language varchar(10),
  learning_language varchar(10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_display_name_not_blank
    check (display_name is null or btrim(display_name) <> ''),

  constraint profiles_avatar_url_is_http
    check (avatar_url is null or avatar_url ~* '^https?://'),

  constraint profiles_native_language_not_blank
    check (native_language is null or btrim(native_language) <> ''),

  constraint profiles_learning_language_not_blank
    check (learning_language is null or btrim(learning_language) <> '')
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text not null,
  source_language varchar(10) not null,
  target_language varchar(10) not null,
  reading_position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint documents_title_not_blank
    check (btrim(title) <> ''),

  constraint documents_content_not_blank
    check (btrim(content) <> ''),

  constraint documents_source_language_not_blank
    check (btrim(source_language) <> ''),

  constraint documents_target_language_not_blank
    check (btrim(target_language) <> ''),

  constraint documents_reading_position_nonnegative
    check (reading_position >= 0)
);

create function public.text_array_values_are_not_blank(input_values text[])
returns boolean
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select coalesce(
    pg_catalog.bool_and(
      value is not null
      and pg_catalog.btrim(value) <> ''
    ),
    false
  )
  from pg_catalog.unnest(input_values) as elements(value);
$$;

create table public.vocabulary_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word text not null,
  source_language varchar(10) not null,
  target_language varchar(10) not null,
  translation text[] not null,
  usage_context text,
  image_url text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint vocabulary_cards_word_not_blank
    check (btrim(word) <> ''),

  constraint vocabulary_cards_source_language_not_blank
    check (btrim(source_language) <> ''),

  constraint vocabulary_cards_target_language_not_blank
    check (btrim(target_language) <> ''),

  constraint vocabulary_cards_translation_not_empty
  check (
    cardinality(translation) > 0
    and public.text_array_values_are_not_blank(translation)
  ),

  constraint vocabulary_cards_image_url_is_http
    check (image_url is null or image_url ~* '^https?://'),

  constraint vocabulary_cards_user_word_language_pair_unique
    unique (user_id, source_language, target_language, word)
);

create index documents_user_created_at_idx
  on public.documents (user_id, created_at desc);

create index vocabulary_cards_user_created_at_idx
  on public.vocabulary_cards (user_id, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create trigger vocabulary_cards_set_updated_at
before update on public.vocabulary_cards
for each row execute function public.set_updated_at();
