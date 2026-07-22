begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
set local test.user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local test.document_id = 'a0000000-0000-4000-8000-000000000001';

select plan(16);

insert into auth.users (id, email)
values (
  current_setting('test.user_id')::uuid,
  'schema-test@example.test'
);

insert into public.profiles (
  id,
  display_name,
  native_language,
  learning_language
)
values (
  current_setting('test.user_id')::uuid,
  'Schema Test User',
  'es',
  'en'
);

-- Verifies that all expected application tables were created.
select is(
  (
    select count(*)
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('profiles', 'documents', 'vocabulary_cards')
  ),
  3::bigint,
  'the application tables exist'
);

-- Verifies that documents have an index for user-scoped chronological queries.
select is(
  (
    select count(*)
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'documents_user_created_at_idx'
  ),
  1::bigint,
  'documents ownership index exists'
);

-- Verifies that vocabulary cards have an index for user-scoped chronological queries.
select is(
  (
    select count(*)
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'vocabulary_cards_user_created_at_idx'
  ),
  1::bigint,
  'vocabulary cards ownership index exists'
);

-- Verifies that a document title cannot contain only whitespace.
select throws_ok(
  $$
    insert into public.documents (
      user_id,
      title,
      content,
      source_language,
      target_language
    ) values (
      current_setting('test.user_id')::uuid,
      '   ',
      'Content',
      'en',
      'es'
    )
  $$,
  23514,
  null,
  'a blank document title is rejected'
);

-- Verifies that document content cannot contain only whitespace.
select throws_ok(
  $$
    insert into public.documents (
      user_id,
      title,
      content,
      source_language,
      target_language
    ) values (
      current_setting('test.user_id')::uuid,
      'Title',
      '   ',
      'en',
      'es'
    )
  $$,
  23514,
  null,
  'blank document content is rejected'
);

-- Verifies that a reading position cannot be negative.
select throws_ok(
  $$
    insert into public.documents (
      user_id,
      title,
      content,
      source_language,
      target_language,
      reading_position
    ) values (
      current_setting('test.user_id')::uuid,
      'Title',
      'Content',
      'en',
      'es',
      -1
    )
  $$,
  23514,
  null,
  'a negative reading position is rejected'
);

-- Verifies that every vocabulary card has at least one translation.
select throws_ok(
  $$
    insert into public.vocabulary_cards (
      user_id,
      word,
      source_language,
      target_language,
      translation
    ) values (
      current_setting('test.user_id')::uuid,
      'context',
      'en',
      'es',
      array[]::text[]
    )
  $$,
  23514,
  null,
  'an empty translation array is rejected'
);

-- Verifies that a translation array cannot contain null values.
select throws_ok(
  $$
    insert into public.vocabulary_cards (
      user_id,
      word,
      source_language,
      target_language,
      translation
    ) values (
      current_setting('test.user_id')::uuid,
      'context',
      'en',
      'es',
      array[null]::text[]
    )
  $$,
  23514,
  null,
  'a null translation is rejected'
);

-- Verifies that a translation cannot contain only whitespace.
select throws_ok(
  $$
    insert into public.vocabulary_cards (
      user_id,
      word,
      source_language,
      target_language,
      translation
    ) values (
      current_setting('test.user_id')::uuid,
      'context',
      'en',
      'es',
      array['   ']::text[]
    )
  $$,
  23514,
  null,
  'a whitespace-only translation is rejected'
);

-- Verifies that vocabulary card image URLs use HTTP or HTTPS.
select throws_ok(
  $$
    insert into public.vocabulary_cards (
      user_id,
      word,
      source_language,
      target_language,
      translation,
      image_url
    ) values (
      current_setting('test.user_id')::uuid,
      'context',
      'en',
      'es',
      array['contexto'],
      'ftp://example.test/image.png'
    )
  $$,
  23514,
  null,
  'a non-HTTP image URL is rejected'
);

insert into public.documents (
  id,
  user_id,
  title,
  content,
  source_language,
  target_language,
  updated_at
)
values (
  current_setting('test.document_id')::uuid,
  current_setting('test.user_id')::uuid,
  'Valid document',
  'Valid content',
  'en',
  'es',
  '2020-01-01 00:00:00+00'
);

insert into public.vocabulary_cards (
  user_id,
  word,
  source_language,
  target_language,
  translation
)
values (
  current_setting('test.user_id')::uuid,
  'context',
  'en',
  'es',
  array['contexto']
);

-- Verifies that a user cannot save the same word and language pair twice.
select throws_ok(
  $$
    insert into public.vocabulary_cards (
      user_id,
      word,
      source_language,
      target_language,
      translation
    ) values (
      current_setting('test.user_id')::uuid,
      'context',
      'en',
      'es',
      array['significado']
    )
  $$,
  23505,
  null,
  'the same word and language pair cannot be duplicated per user'
);

-- Verifies that the same word can be saved for the reversed language pair.
select lives_ok(
  $$
    insert into public.vocabulary_cards (
      user_id,
      word,
      source_language,
      target_language,
      translation
    ) values (
      current_setting('test.user_id')::uuid,
      'context',
      'es',
      'en',
      array['context']
    )
  $$,
  'the same word can use a different target language'
);

update public.documents
set title = 'Updated document'
where id = current_setting('test.document_id')::uuid;

-- Verifies that the update trigger refreshes the updated_at timestamp.
select ok(
  (
    select updated_at > '2020-01-01 00:00:00+00'::timestamptz
    from public.documents
    where id = current_setting('test.document_id')::uuid
  ),
  'updated_at is refreshed by the update trigger'
);

delete from auth.users
where id = current_setting('test.user_id')::uuid;

-- Verifies that deleting an auth user cascades to their profile.
select is(
  (
    select count(*)
    from public.profiles
    where id = current_setting('test.user_id')::uuid
  ),
  0::bigint,
  'deleting an auth user removes the profile'
);

-- Verifies that deleting an auth user cascades to their documents.
select is(
  (
    select count(*)
    from public.documents
    where user_id = current_setting('test.user_id')::uuid
  ),
  0::bigint,
  'deleting an auth user removes their documents'
);

-- Verifies that deleting an auth user cascades to their vocabulary cards.
select is(
  (
    select count(*)
    from public.vocabulary_cards
    where user_id = current_setting('test.user_id')::uuid
  ),
  0::bigint,
  'deleting an auth user removes their vocabulary cards'
);

select * from finish();
rollback;
