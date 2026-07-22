-- Deterministic local-only users for database development and RLS tests.
-- They intentionally have no password or identity and cannot sign in through the UI.
insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'reader-one@example.test',
    '{"display_name":"Demo Reader"}'::jsonb
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'reader-two@example.test',
    '{"display_name":"Second Reader"}'::jsonb
  )
on conflict (id) do nothing;

insert into public.profiles (
  id,
  display_name,
  native_language,
  learning_language
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Demo Reader',
    'ru',
    'en'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Second Reader',
    'ru',
    'en'
  )
on conflict (id) do nothing;

insert into public.documents (
  id,
  user_id,
  title,
  content,
  source_language,
  target_language,
  reading_position
)
values
  (
    '11111111-aaaa-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Learning from context',
    'Language learning becomes more effective when new words appear in meaningful context. This document demonstrates the reader workflow.',
    'en',
    'ru',
    0
  ),
  (
    '11111111-bbbb-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'A short story',
    'The traveler opened an old notebook and discovered a map hidden between its pages.',
    'en',
    'ru',
    18
  ),
  (
    '22222222-aaaa-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    'Private reading sample',
    'This document belongs to the second user and is useful for ownership tests.',
    'en',
    'ru',
    0
  )
on conflict (id) do nothing;

insert into public.vocabulary_cards (
  id,
  user_id,
  word,
  source_language,
  target_language,
  translation,
  usage_context,
  note
)
values
  (
    '11111111-cccc-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'context',
    'en',
    'ru',
    array['контекст'],
    'New words appear in meaningful context.',
    'Core concept of the application'
  ),
  (
    '11111111-dddd-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'traveler',
    'en',
    'ru',
    array['путешественник', 'путник'],
    'The traveler opened an old notebook.',
    null
  ),
  (
    '11111111-eeee-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'context',
    'en',
    'sr',
    array['kontekst'],
    'New words appear in meaningful context.',
    'Same word with a different target language'
  ),
  (
    '22222222-cccc-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    'ownership',
    'en',
    'ru',
    array['владение'],
    'This document is useful for ownership tests.',
    null
  )
on conflict (id) do nothing;
