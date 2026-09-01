begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
set local test.user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local test.document_id = 'a0000000-0000-4000-8000-000000000001';

select plan(32);

insert into auth.users (id, email)
values (
  current_setting('test.user_id')::uuid,
  'schema-test@example.test'
);

-- Verifies that creating an Auth user automatically creates an application profile.
select is(
  (
    select count(*)
    from public.profiles
    where id = current_setting('test.user_id')::uuid
  ),
  1::bigint,
  'an auth user receives a profile automatically'
);

update public.profiles
set
  display_name = 'Schema Test User',
  native_language = 'es',
  learning_language = 'en'
where id = current_setting('test.user_id')::uuid;

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

-- Verifies that server-only clients can reach the public schema through the Data API.
select ok(
  has_schema_privilege('service_role', 'public', 'usage'),
  'the service role can use the public schema'
);

-- Verifies that server-only clients can manage all private application tables.
select ok(
  (
    select bool_and(
      has_table_privilege(
        'service_role',
        format('public.%I', table_name),
        privilege_name
      )
    )
    from (
      values
        ('profiles'),
        ('documents'),
        ('vocabulary_cards')
    ) as application_tables(table_name)
    cross join (
      values
        ('select'),
        ('insert'),
        ('update'),
        ('delete')
    ) as required_privileges(privilege_name)
  ),
  'the service role can manage private application tables'
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

-- Verifies that the database enforces the application meaning limit.
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
      'too-many-meanings',
      'en',
      'es',
      array['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
    )
  $$,
  23514,
  null,
  'a vocabulary card cannot contain more than ten meanings'
);

select is(
  (
    select convalidated
    from pg_constraint
    where conname = 'vocabulary_cards_translation_limit'
  ),
  false,
  'the meaning limit does not invalidate deployment because of legacy rows'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.save_vocabulary_card(text,character varying,character varying,text[],text[],text,text,text)',
    'execute'
  ),
  'authenticated users can execute the atomic vocabulary save function'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.save_vocabulary_card(text,character varying,character varying,text[],text[],text,text,text)',
    'execute'
  ),
  'anonymous users cannot execute the atomic vocabulary save function'
);

select is(
  public.normalize_vocabulary_word('  “ＤON’T!” ', 'en'),
  'don''t',
  'the database normalizes case, compatibility characters, and apostrophes'
);

select is(
  public.normalize_vocabulary_word('CAFÉ', 'fr'),
  public.normalize_vocabulary_word('café', 'fr'),
  'the database treats composed and decomposed accents equally'
);

select is(
  public.normalize_vocabulary_word('مَرْحَبًا!', 'ar'),
  'مَرْحَبًا',
  'the database preserves Arabic diacritics'
);

select is(
  array[
    public.normalize_vocabulary_word('“लड़की!”', 'hi'),
    public.normalize_vocabulary_word(U&'a\1ACF!', 'en')
  ],
  array['लड़की', U&'a\1ACF']::text[],
  'the database preserves combining marks at word edges'
);

select is(
  public.normalize_vocabulary_word('“a፩!”', 'am'),
  'a፩',
  'the database preserves non-decimal Unicode numbers at word edges'
);

select is(
  array[
    public.normalize_vocabulary_word('I', 'tr'),
    public.normalize_vocabulary_word('İ', 'tr')
  ],
  array['ı', 'i']::text[],
  'the database uses the source language for locale-sensitive casing'
);

select is(
  public.normalize_vocabulary_word(
    U&'\A7F1' || (
      select pg_catalog.string_agg(pg_catalog.chr(code_point), '')
      from pg_catalog.generate_series(117974, 118009) as code_points(code_point)
    ),
    'en'
  ),
  'sabcdefghijklmnopqrstuvwxyz0123456789',
  'the database matches Node 24 compatibility mappings added after Unicode 15.1'
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
  '  “ＣONTEXT!” ',
  'en',
  'es',
  array['contexto']
);

select is(
  (
    select word
    from public.vocabulary_cards
    where user_id = current_setting('test.user_id')::uuid
      and source_language = 'en'
      and target_language = 'es'
  ),
  'context',
  'the vocabulary card trigger stores the canonical word'
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
      'ＣＯＮＴＥＸＴ!',
      'en',
      'es',
      array['significado']
    )
  $$,
  23505,
  null,
  'normalized variants cannot be duplicated for one user and language pair'
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

update public.vocabulary_cards
set word = '  “ＢＡＮＫ!” '
where user_id = current_setting('test.user_id')::uuid
  and source_language = 'es'
  and target_language = 'en';

select is(
  (
    select word
    from public.vocabulary_cards
    where user_id = current_setting('test.user_id')::uuid
      and source_language = 'es'
      and target_language = 'en'
  ),
  'bank',
  'the vocabulary card trigger canonicalizes direct word updates'
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
