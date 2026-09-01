create function public.normalize_vocabulary_word(
  input_word text,
  input_source_language text
)
returns text
language plpgsql
stable
strict
set search_path = ''
as $$
declare
  collation_name name;
  normalized_word text;
  primary_language text;
begin
  normalized_word := normalize(pg_catalog.btrim(input_word), NFKC);
  normalized_word := pg_catalog.translate(
    normalized_word,
    U&'\2018\2019\02BC',
    U&'\0027\0027\0027'
  );
  normalized_word := pg_catalog.regexp_replace(
    normalized_word,
    '^[^[:alnum:]]+|[^[:alnum:]]+$',
    '',
    'g'
  );
  primary_language := pg_catalog.split_part(
    pg_catalog.lower(pg_catalog.btrim(input_source_language)),
    '-',
    1
  );

  select collations.collname
  into collation_name
  from pg_catalog.pg_collation as collations
  where collations.collprovider = 'i'
    and collations.collname = primary_language || '-x-icu'
  limit 1;

  if collation_name is null then
    collation_name := 'und-x-icu';
  end if;

  execute pg_catalog.format(
    'select pg_catalog.lower($1 collate pg_catalog.%I)',
    collation_name
  )
  into normalized_word
  using normalized_word;

  return normalize(normalized_word, NFC);
end;
$$;

revoke execute
on function public.normalize_vocabulary_word(text, text)
from public, anon;

grant execute
on function public.normalize_vocabulary_word(text, text)
to authenticated, service_role;

create temporary table vocabulary_card_normalization_plan
on commit drop
as
with normalized_cards as (
  select
    cards.*,
    public.normalize_vocabulary_word(
      cards.word,
      cards.source_language
    ) as normalized_word
  from public.vocabulary_cards as cards
)
select
  normalized_cards.id,
  normalized_cards.normalized_word,
  pg_catalog.first_value(normalized_cards.id) over card_group as survivor_id,
  pg_catalog.row_number() over card_group as card_priority,
  pg_catalog.min(normalized_cards.created_at) over card_group as earliest_created_at
from normalized_cards
window card_group as (
  partition by
    normalized_cards.user_id,
    normalized_cards.source_language,
    normalized_cards.target_language,
    normalized_cards.normalized_word
  order by
    normalized_cards.updated_at desc,
    normalized_cards.created_at desc,
    normalized_cards.id desc
  rows between unbounded preceding and unbounded following
);

do $$
begin
  if exists (
    select 1
    from vocabulary_card_normalization_plan as normalization_plan
    where normalization_plan.normalized_word = ''
  ) then
    raise exception using
      errcode = '23514',
      message = 'A vocabulary card cannot normalize to an empty word.';
  end if;

  if exists (
    select 1
    from vocabulary_card_normalization_plan as normalization_plan
    join public.vocabulary_cards as cards
      on cards.id = normalization_plan.id
    cross join lateral pg_catalog.unnest(cards.translation) as meanings(value)
    group by normalization_plan.survivor_id
    having pg_catalog.count(
      distinct pg_catalog.lower(pg_catalog.btrim(meanings.value))
    ) > 10
  ) then
    raise exception using
      errcode = '23514',
      message = 'Normalized vocabulary card duplicates exceed the ten-meaning limit.';
  end if;
end;
$$;

create temporary table vocabulary_card_merged_translations
on commit drop
as
select
  meanings_by_key.survivor_id,
  pg_catalog.array_agg(
    meanings_by_key.display_value
    order by
      meanings_by_key.first_card_priority,
      meanings_by_key.first_position
  ) as translation
from (
  select
    normalization_plan.survivor_id,
    (
      pg_catalog.array_agg(
        pg_catalog.btrim(meanings.value)
        order by normalization_plan.card_priority, meanings.position
      )
    )[1] as display_value,
    pg_catalog.min(normalization_plan.card_priority) as first_card_priority,
    (
      pg_catalog.array_agg(
        meanings.position
        order by normalization_plan.card_priority, meanings.position
      )
    )[1] as first_position
  from vocabulary_card_normalization_plan as normalization_plan
  join public.vocabulary_cards as cards
    on cards.id = normalization_plan.id
  cross join lateral pg_catalog.unnest(cards.translation)
    with ordinality as meanings(value, position)
  group by
    normalization_plan.survivor_id,
    pg_catalog.lower(pg_catalog.btrim(meanings.value))
) as meanings_by_key
group by meanings_by_key.survivor_id;

delete from public.vocabulary_cards as cards
using vocabulary_card_normalization_plan as normalization_plan
where cards.id = normalization_plan.id
  and normalization_plan.id <> normalization_plan.survivor_id;

update public.vocabulary_cards as cards
set
  word = normalization_plan.normalized_word,
  translation = merged_translations.translation,
  created_at = normalization_plan.earliest_created_at
from vocabulary_card_normalization_plan as normalization_plan
join vocabulary_card_merged_translations as merged_translations
  on merged_translations.survivor_id = normalization_plan.survivor_id
where cards.id = normalization_plan.survivor_id
  and normalization_plan.id = normalization_plan.survivor_id
  and (
    cards.word is distinct from normalization_plan.normalized_word
    or cards.translation is distinct from merged_translations.translation
    or cards.created_at is distinct from normalization_plan.earliest_created_at
  );

create function public.normalize_vocabulary_card_word()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.word := public.normalize_vocabulary_word(
    new.word,
    new.source_language
  );

  return new;
end;
$$;

revoke execute
on function public.normalize_vocabulary_card_word()
from public;

create trigger vocabulary_cards_normalize_word
before insert or update of word, source_language
on public.vocabulary_cards
for each row
execute function public.normalize_vocabulary_card_word();
