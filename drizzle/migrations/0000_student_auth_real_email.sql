create or replace function public.auth_email_for_register_number(_register_number text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email from public.profiles
  where upper(register_number) = upper(trim(_register_number))
    and email is not null and email <> ''
  limit 1
$$;

revoke all on function public.auth_email_for_register_number(text) from public;
grant execute on function public.auth_email_for_register_number(text) to anon, authenticated;

update auth.users u
set email = p.email,
    email_change = '',
    email_change_confirm_status = 0,
    updated_at = now()
from public.profiles p
where p.user_id = u.id
  and p.email is not null and p.email <> ''
  and u.email like '%@bdms.local';

update auth.identities i
set provider_id = u.email,
    identity_data = jsonb_set(identity_data, '{email}', to_jsonb(u.email)),
    updated_at = now()
from auth.users u
where i.user_id = u.id and i.provider = 'email';