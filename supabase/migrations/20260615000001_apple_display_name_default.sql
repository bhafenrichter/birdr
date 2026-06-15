-- Apple only provides a usable name on first sign-in and the value is often
-- absent or messy on subsequent logins. Default Apple users to 'Birdr User'
-- and keep the clean full_name for Google OAuth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  _display_name text;
  _customer_id text;
begin
  _display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',      -- Google OAuth
    'Birdr User'                                  -- Apple OAuth + any other fallback
  );

  _customer_id := public.generate_customer_id();

  insert into public.profiles (id, display_name, avatar_url, customer_id)
  values (
    new.id,
    _display_name,
    new.raw_user_meta_data ->> 'avatar_url',
    _customer_id
  );

  insert into public.streaks (user_id)
  values (new.id);

  return new;
end;
$$;
