alter table public.vocabulary_cards
add constraint vocabulary_cards_translation_limit
check (cardinality(translation) <= 10)
not valid;

create function public.save_vocabulary_card(
  input_word text,
  input_source_language varchar(10),
  input_target_language varchar(10),
  input_translation text[],
  input_previous_translation text[] default array[]::text[],
  input_usage_context text default null,
  input_image_url text default null,
  input_note text default null
)
returns public.vocabulary_cards
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_card public.vocabulary_cards;
  submitted_translation text[];
begin
  select pg_catalog.array_agg(
    values_by_key.display_value
    order by values_by_key.first_position
  )
  into submitted_translation
  from (
    select
      (pg_catalog.array_agg(pg_catalog.btrim(items.value) order by items.position))[1] as display_value,
      pg_catalog.min(items.position) as first_position
    from pg_catalog.unnest(input_translation)
      with ordinality as items(value, position)
    where pg_catalog.btrim(items.value) <> ''
    group by pg_catalog.lower(pg_catalog.btrim(items.value))
  ) as values_by_key;

  insert into public.vocabulary_cards (
    user_id,
    word,
    source_language,
    target_language,
    translation,
    usage_context,
    image_url,
    note
  )
  values (
    (select auth.uid()),
    input_word,
    input_source_language,
    input_target_language,
    submitted_translation,
    input_usage_context,
    input_image_url,
    input_note
  )
  on conflict (user_id, source_language, target_language, word)
  do update set
    translation = (
      select pg_catalog.array_agg(values_by_key.display_value order by values_by_key.first_position)
      from (
        select
          (
            pg_catalog.array_agg(
              pg_catalog.btrim(items.value)
              order by items.is_submitted desc, items.position
            )
          )[1] as display_value,
          pg_catalog.min(items.position) as first_position
        from (
          select
            current_values.value,
            current_values.position,
            false as is_submitted
          from pg_catalog.unnest(vocabulary_cards.translation)
            with ordinality as current_values(value, position)
          where not (
            exists (
              select 1
              from pg_catalog.unnest(input_previous_translation) as previous_values(value)
              where pg_catalog.lower(pg_catalog.btrim(previous_values.value)) =
                pg_catalog.lower(pg_catalog.btrim(current_values.value))
            )
            and not exists (
              select 1
              from pg_catalog.unnest(excluded.translation) as submitted_values(value)
              where pg_catalog.lower(pg_catalog.btrim(submitted_values.value)) =
                pg_catalog.lower(pg_catalog.btrim(current_values.value))
            )
          )

          union all

          select
            submitted_values.value,
            pg_catalog.cardinality(vocabulary_cards.translation) + submitted_values.position,
            true as is_submitted
          from pg_catalog.unnest(excluded.translation)
            with ordinality as submitted_values(value, position)
        ) as items
        where pg_catalog.btrim(items.value) <> ''
        group by pg_catalog.lower(pg_catalog.btrim(items.value))
      ) as values_by_key
    ),
    usage_context = excluded.usage_context,
    image_url = excluded.image_url,
    note = excluded.note
  returning * into saved_card;

  return saved_card;
end;
$$;

revoke execute
on function public.save_vocabulary_card(
  text,
  varchar,
  varchar,
  text[],
  text[],
  text,
  text,
  text
)
from public, anon;

grant execute
on function public.save_vocabulary_card(
  text,
  varchar,
  varchar,
  text[],
  text[],
  text,
  text,
  text
)
to authenticated;
