create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.profiles (id)
select id
from auth.users
on conflict (id) do nothing;

revoke execute
on function public.handle_new_auth_user()
from public, anon, authenticated;

grant execute
on function public.handle_new_auth_user()
to service_role;
