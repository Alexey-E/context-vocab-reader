begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
set local test.user_a_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local test.user_b_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
set local test.document_a_id = 'a0000000-0000-4000-8000-000000000001';
set local test.document_b_id = 'b0000000-0000-4000-8000-000000000001';
set local test.card_a_id = 'a0000000-0000-4000-8000-000000000002';
set local test.card_b_id = 'b0000000-0000-4000-8000-000000000002';
set local test.new_document_a_id = 'a0000000-0000-4000-8000-000000000003';
set local test.new_card_a_id = 'a0000000-0000-4000-8000-000000000004';

select plan(17);

insert into auth.users (id, email)
values
  (
    current_setting('test.user_a_id')::uuid,
    'rls-user-a@example.test'
  ),
  (
    current_setting('test.user_b_id')::uuid,
    'rls-user-b@example.test'
  );

insert into public.profiles (id, display_name)
values
  (current_setting('test.user_a_id')::uuid, 'RLS User A'),
  (current_setting('test.user_b_id')::uuid, 'RLS User B');

insert into public.documents (
  id,
  user_id,
  title,
  content,
  source_language,
  target_language
)
values
  (
    current_setting('test.document_a_id')::uuid,
    current_setting('test.user_a_id')::uuid,
    'User A document',
    'Private content for user A',
    'en',
    'es'
  ),
  (
    current_setting('test.document_b_id')::uuid,
    current_setting('test.user_b_id')::uuid,
    'User B document',
    'Private content for user B',
    'en',
    'es'
  );

insert into public.vocabulary_cards (
  id,
  user_id,
  word,
  source_language,
  target_language,
  translation
)
values
  (
    current_setting('test.card_a_id')::uuid,
    current_setting('test.user_a_id')::uuid,
    'private-a',
    'en',
    'es',
    array['privado-a']
  ),
  (
    current_setting('test.card_b_id')::uuid,
    current_setting('test.user_b_id')::uuid,
    'private-b',
    'en',
    'es',
    array['privado-b']
  );

set local role authenticated;

do $set_claim$
begin
  perform set_config(
    'request.jwt.claim.sub',
    current_setting('test.user_a_id'),
    true
  );
end
$set_claim$;

-- Verifies that an authenticated user can read only their own profile.
select is(
  (select count(*) from public.profiles),
  1::bigint,
  'an authenticated user sees only their profile'
);

-- Verifies that an authenticated user can read only their own documents.
select is(
  (select count(*) from public.documents),
  1::bigint,
  'an authenticated user sees only their documents'
);

-- Verifies that an authenticated user can read only their own vocabulary cards.
select is(
  (select count(*) from public.vocabulary_cards),
  1::bigint,
  'an authenticated user sees only their vocabulary cards'
);

-- Verifies that an authenticated user can create a document they own.
select lives_ok(
  $$
    insert into public.documents (
      id,
      user_id,
      title,
      content,
      source_language,
      target_language
    ) values (
      current_setting('test.new_document_a_id')::uuid,
      current_setting('test.user_a_id')::uuid,
      'Another user A document',
      'Owned by user A',
      'en',
      'es'
    )
  $$,
  'a user can insert their own document'
);

-- Verifies that an authenticated user can create a vocabulary card they own.
select lives_ok(
  $$
    insert into public.vocabulary_cards (
      id,
      user_id,
      word,
      source_language,
      target_language,
      translation
    ) values (
      current_setting('test.new_card_a_id')::uuid,
      current_setting('test.user_a_id')::uuid,
      'owned',
      'en',
      'es',
      array['propio']
    )
  $$,
  'a user can insert their own vocabulary card'
);

-- Verifies that a user cannot create a document owned by another user.
select throws_ok(
  $$
    insert into public.documents (
      user_id,
      title,
      content,
      source_language,
      target_language
    ) values (
      current_setting('test.user_b_id')::uuid,
      'Forbidden document',
      'Must not be inserted',
      'en',
      'es'
    )
  $$,
  42501,
  null,
  'a user cannot insert a document for another user'
);

-- Verifies that a user cannot create a vocabulary card owned by another user.
select throws_ok(
  $$
    insert into public.vocabulary_cards (
      user_id,
      word,
      source_language,
      target_language,
      translation
    ) values (
      current_setting('test.user_b_id')::uuid,
      'forbidden',
      'en',
      'es',
      array['prohibido']
    )
  $$,
  42501,
  null,
  'a user cannot insert a vocabulary card for another user'
);

-- Verifies that updating another user's document affects no rows.
select results_eq(
  $$
    with updated as (
      update public.documents
      set title = 'Unauthorized update'
      where id = current_setting('test.document_b_id')::uuid
      returning 1
    )
    select count(*)::bigint from updated
  $$,
  array[0::bigint],
  'another user document cannot be updated'
);

-- Verifies that deleting another user's vocabulary card affects no rows.
select results_eq(
  $$
    with deleted as (
      delete from public.vocabulary_cards
      where id = current_setting('test.card_b_id')::uuid
      returning 1
    )
    select count(*)::bigint from deleted
  $$,
  array[0::bigint],
  'another user vocabulary card cannot be deleted'
);

do $set_claim$
begin
  perform set_config(
    'request.jwt.claim.sub',
    current_setting('test.user_b_id'),
    true
  );
end
$set_claim$;

-- Verifies that changing the JWT subject exposes only the second user's profile.
select is(
  (select count(*) from public.profiles),
  1::bigint,
  'switching the JWT subject reveals only the second profile'
);

-- Verifies that the second user cannot read the first user's documents.
select is(
  (select count(*) from public.documents),
  1::bigint,
  'the second user cannot see the first user documents'
);

-- Verifies that the second user cannot read the first user's vocabulary cards.
select is(
  (select count(*) from public.vocabulary_cards),
  1::bigint,
  'the second user cannot see the first user vocabulary cards'
);

-- Verifies that a user can update their own document.
select results_eq(
  $$
    with updated as (
      update public.documents
      set title = 'Authorized update'
      where id = current_setting('test.document_b_id')::uuid
      returning 1
    )
    select count(*)::bigint from updated
  $$,
  array[1::bigint],
  'a user can update their own document'
);

-- Verifies that a user can delete their own vocabulary card.
select results_eq(
  $$
    with deleted as (
      delete from public.vocabulary_cards
      where id = current_setting('test.card_b_id')::uuid
      returning 1
    )
    select count(*)::bigint from deleted
  $$,
  array[1::bigint],
  'a user can delete their own vocabulary card'
);

set local role anon;
set local request.jwt.claim.sub = '';

-- Verifies that anonymous users cannot read profiles.
select throws_ok(
  $$select * from public.profiles$$,
  42501,
  null,
  'anonymous users cannot read profiles'
);

-- Verifies that anonymous users cannot read documents.
select throws_ok(
  $$select * from public.documents$$,
  42501,
  null,
  'anonymous users cannot read documents'
);

-- Verifies that anonymous users cannot read vocabulary cards.
select throws_ok(
  $$select * from public.vocabulary_cards$$,
  42501,
  null,
  'anonymous users cannot read vocabulary cards'
);

select * from finish();
rollback;
