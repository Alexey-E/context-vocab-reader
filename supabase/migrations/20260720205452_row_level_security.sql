alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.vocabulary_cards enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.documents from anon;
revoke all on table public.vocabulary_cards from anon;

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete
  on table public.profiles
  to authenticated, service_role;

grant select, insert, update, delete
  on table public.documents
  to authenticated, service_role;

grant select, insert, update, delete
  on table public.vocabulary_cards
  to authenticated, service_role;

create policy profiles_own_rows
on public.profiles
for all
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy documents_own_rows
on public.documents
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy vocabulary_cards_own_rows
on public.vocabulary_cards
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke execute
on function public.set_updated_at()
from public;

revoke execute
on function public.text_array_values_are_not_blank(text[])
from public;

grant execute
on function public.text_array_values_are_not_blank(text[])
to authenticated, service_role;
