begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
set local test.sample_id = 'c0000000-0000-4000-8000-000000000001';

select plan(11);

-- Verifies that the public sample documents table exists.
select is(
  (
    select count(*)
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'sample_documents'
  ),
  1::bigint,
  'the sample documents table exists'
);

insert into public.sample_documents (
  id,
  slug,
  title,
  content,
  source_language,
  target_language,
  sort_order
)
values (
  current_setting('test.sample_id')::uuid,
  'test-public-sample',
  'Test public sample',
  'A public paragraph used only inside this transaction.',
  'en',
  'es',
  100
);

-- Verifies that stable sample slugs cannot be duplicated.
select throws_ok(
  $$
    insert into public.sample_documents (
      slug,
      title,
      content,
      source_language,
      target_language
    ) values (
      'test-public-sample',
      'Duplicate sample',
      'This insert must fail.',
      'en',
      'es'
    )
  $$,
  23505,
  null,
  'sample slugs are unique'
);

-- Verifies that a public sample cannot have blank content.
select throws_ok(
  $$
    insert into public.sample_documents (
      slug,
      title,
      content,
      source_language,
      target_language
    ) values (
      'blank-public-sample',
      'Blank sample',
      '   ',
      'en',
      'es'
    )
  $$,
  23514,
  null,
  'sample content cannot be blank'
);

set local role authenticated;

-- Verifies that authenticated users can read a public sample.
select is(
  (
    select count(*)
    from public.sample_documents
    where id = current_setting('test.sample_id')::uuid
  ),
  1::bigint,
  'authenticated users can read public samples'
);

-- Verifies that authenticated users cannot create public samples.
select throws_ok(
  $$
    insert into public.sample_documents (
      slug,
      title,
      content,
      source_language,
      target_language
    ) values (
      'authenticated-insert',
      'Forbidden sample',
      'Authenticated clients must not create samples.',
      'en',
      'es'
    )
  $$,
  42501,
  null,
  'authenticated users cannot create public samples'
);

-- Verifies that authenticated users cannot update public samples.
select throws_ok(
  $$
    update public.sample_documents
    set title = 'Forbidden update'
    where id = current_setting('test.sample_id')::uuid
  $$,
  42501,
  null,
  'authenticated users cannot update public samples'
);

-- Verifies that authenticated users cannot delete public samples.
select throws_ok(
  $$
    delete from public.sample_documents
    where id = current_setting('test.sample_id')::uuid
  $$,
  42501,
  null,
  'authenticated users cannot delete public samples'
);

set local role anon;

-- Verifies that unauthenticated visitors can read a public sample.
select is(
  (
    select count(*)
    from public.sample_documents
    where id = current_setting('test.sample_id')::uuid
  ),
  1::bigint,
  'anonymous visitors can read public samples'
);

-- Verifies that anonymous visitors cannot create public samples.
select throws_ok(
  $$
    insert into public.sample_documents (
      slug,
      title,
      content,
      source_language,
      target_language
    ) values (
      'anonymous-insert',
      'Forbidden sample',
      'Anonymous clients must not create samples.',
      'en',
      'es'
    )
  $$,
  42501,
  null,
  'anonymous visitors cannot create public samples'
);

-- Verifies that anonymous visitors cannot update public samples.
select throws_ok(
  $$
    update public.sample_documents
    set title = 'Forbidden update'
    where id = current_setting('test.sample_id')::uuid
  $$,
  42501,
  null,
  'anonymous visitors cannot update public samples'
);

-- Verifies that anonymous visitors cannot delete public samples.
select throws_ok(
  $$
    delete from public.sample_documents
    where id = current_setting('test.sample_id')::uuid
  $$,
  42501,
  null,
  'anonymous visitors cannot delete public samples'
);

select * from finish();
rollback;
