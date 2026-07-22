-- Four faithful translations of the same service overview for the public demo.
insert into public.sample_documents (
  id,
  slug,
  title,
  content,
  source_language,
  target_language,
  sort_order
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    'service-overview-en',
    'Learn with context',
    'Context Vocab Reader helps you learn languages through meaningful reading. Open a text, translate a sentence when you need help, and save useful words together with their context to build your personal vocabulary.',
    'en',
    'es',
    1
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'service-overview-fr',
    'Apprendre en contexte',
    'Context Vocab Reader vous aide à apprendre des langues grâce à des lectures riches de sens. Ouvrez un texte, traduisez une phrase lorsque vous avez besoin d’aide et enregistrez les mots utiles avec leur contexte pour construire votre vocabulaire personnel.',
    'fr',
    'en',
    2
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'service-overview-es',
    'Aprende con contexto',
    'Context Vocab Reader te ayuda a aprender idiomas mediante lecturas significativas. Abre un texto, traduce una frase cuando necesites ayuda y guarda palabras útiles junto con su contexto para crear tu vocabulario personal.',
    'es',
    'en',
    3
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    'service-overview-ar',
    'تعلّم من خلال السياق',
    'يساعدك Context Vocab Reader على تعلّم اللغات من خلال القراءة الهادفة. افتح نصًا، وترجم جملة عندما تحتاج إلى المساعدة، واحفظ الكلمات المفيدة مع سياقها لبناء مفرداتك الشخصية.',
    'ar',
    'en',
    4
  )
on conflict (slug) do update
set
  title = excluded.title,
  content = excluded.content,
  source_language = excluded.source_language,
  target_language = excluded.target_language,
  sort_order = excluded.sort_order;
