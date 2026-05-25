-- Add customer_id column to profiles
-- A unique 7-character alphanumeric ID (e.g. 'COT0636') for external integrations (RevenueCat, support, etc.)

-- Function to generate a unique 7-char customer ID
create or replace function public.generate_customer_id()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text;
  i int;
  exists_already boolean;
begin
  loop
    result := '';
    for i in 1..7 loop
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;

    -- Check uniqueness
    select exists(select 1 from public.profiles where customer_id = result) into exists_already;
    if not exists_already then
      return result;
    end if;
  end loop;
end;
$$;

-- Add column with unique constraint
alter table public.profiles
  add column customer_id text unique;

-- Backfill existing profiles
update public.profiles
set customer_id = public.generate_customer_id()
where customer_id is null;

-- Make NOT NULL after backfill
alter table public.profiles
  alter column customer_id set not null,
  alter column customer_id set default public.generate_customer_id();

-- Update the trigger function to include customer_id
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  _display_name text;
  _customer_id text;
begin
  -- Try to extract display name from OAuth metadata
  _display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',      -- Google OAuth
    new.raw_user_meta_data ->> 'name',            -- Apple OAuth
    split_part(new.email, '@', 1)                 -- fallback to email prefix
  );

  -- Generate unique customer ID
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
