-- birdr v1 initial schema
-- Tables: species_types, habitats, species, species_audio, species_regions,
--         species_illustrations, profiles, sightings, streaks, user_achievements
-- Views:  cards
-- Enums:  conservation_status, season, subscription_tier, mastery_tier, achievement_category

-- =============================================================================
-- ENUMS
-- =============================================================================

create type conservation_status as enum ('LC', 'NT', 'VU', 'EN', 'CR');

create type season as enum ('year_round', 'summer', 'winter', 'migratory', 'rare');

create type subscription_tier as enum ('free', 'weekly', 'yearly');

create type mastery_tier as enum ('spotter', 'apprentice', 'adept', 'expert', 'master');

create type achievement_category as enum (
  'collection',
  'streak',
  'family',
  'habitat'
);

-- =============================================================================
-- LOOKUP TABLES
-- =============================================================================

create table species_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- e.g. 'Songbirds'
  slug text not null unique,          -- e.g. 'songbirds'
  description text,
  created_at timestamptz not null default now()
);

create table habitats (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- e.g. 'Forests'
  slug text not null unique,          -- e.g. 'forests'
  description text,
  illustration_url text,              -- habitat scene illustration
  created_at timestamptz not null default now()
);

-- =============================================================================
-- SPECIES
-- =============================================================================

create table species (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  scientific_name text not null unique,
  family text,                        -- scientific family (not surfaced in UI)
  taxonomic_order text,               -- scientific order (not surfaced in UI)
  species_type_id uuid not null references species_types(id),
  primary_habitat_id uuid not null references habitats(id),
  conservation_status conservation_status not null default 'LC',
  size text,                          -- e.g. '12-15 cm'
  about_text text,                    -- editorial 2-3 sentence description
  distinguishing_feature text,        -- 5-8 word distinguishing feature for top-3 picker
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_species_type on species(species_type_id);
create index idx_species_habitat on species(primary_habitat_id);
create index idx_species_conservation on species(conservation_status);
create index idx_species_common_name on species(common_name);
create index idx_species_scientific_name on species(scientific_name);

-- =============================================================================
-- SPECIES ASSETS
-- =============================================================================

create table species_audio (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  audio_url text not null,
  source text,                        -- e.g. 'xeno-canto'
  license text,                       -- e.g. 'CC-BY-4.0'
  attribution text,
  created_at timestamptz not null default now()
);

create index idx_species_audio_species on species_audio(species_id);

create table species_illustrations (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  illustration_url text not null,
  variant text default 'reference',   -- 'reference', 'silhouette', etc.
  created_at timestamptz not null default now()
);

create index idx_species_illustrations_species on species_illustrations(species_id);

-- State-level presence data for Explore tab (hydrated from eBird bulk downloads)
create table species_regions (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  state_code text not null,           -- US state code, e.g. 'US-NC'
  season season not null default 'year_round',
  peak_frequency real,                -- 0.0-1.0 from eBird bar chart data
  created_at timestamptz not null default now(),
  unique (species_id, state_code)
);

create index idx_species_regions_state on species_regions(state_code);
create index idx_species_regions_species on species_regions(species_id);
create index idx_species_regions_state_season on species_regions(state_code, season);

-- =============================================================================
-- USER TABLES
-- =============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  subscription_tier subscription_tier not null default 'free',
  daily_captures_used int not null default 0,
  daily_captures_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sightings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  species_id uuid not null references species(id),
  photo_url text not null,
  captured_at timestamptz not null default now(),
  lat double precision,
  lon double precision,
  named_location text,                -- reverse-geocoded place name
  display_location text,              -- fuzzed location for future social features (v2)
  created_at timestamptz not null default now()
);

create index idx_sightings_user on sightings(user_id);
create index idx_sightings_species on sightings(species_id);
create index idx_sightings_user_species on sightings(user_id, species_id);
create index idx_sightings_user_captured on sightings(user_id, captured_at desc);
create index idx_sightings_captured on sightings(captured_at desc);

create table streaks (
  user_id uuid primary key references profiles(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_capture_date date,             -- date in user's local timezone
  updated_at timestamptz not null default now()
);

create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  achievement_id text not null,       -- e.g. 'collection_1', 'streak_7', 'family_songbirds_spotter'
  category achievement_category not null,
  unlocked_at timestamptz not null default now(),
  progress real not null default 0,   -- 0.0-1.0 for in-progress tracking
  unique (user_id, achievement_id)
);

create index idx_user_achievements_user on user_achievements(user_id);
create index idx_user_achievements_category on user_achievements(user_id, category);

-- =============================================================================
-- CARDS VIEW
-- =============================================================================
-- Per-user-per-species aggregate. Hero photo is always the first (earliest) sighting.

create view cards as
select
  s.user_id,
  s.species_id,
  min(s.captured_at) as first_seen_at,
  max(s.captured_at) as last_seen_at,
  count(*)::int as sighting_count,
  (
    select sub.photo_url
    from sightings sub
    where sub.user_id = s.user_id
      and sub.species_id = s.species_id
    order by sub.captured_at asc
    limit 1
  ) as hero_photo_url
from sightings s
group by s.user_id, s.species_id;

-- =============================================================================
-- STORAGE BUCKET RLS POLICIES
-- =============================================================================

-- Photos bucket: users can only manage their own files (path: {user_id}/*)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  false,
  10485760,  -- 10 MiB
  array['image/jpeg', 'image/png', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

-- Species assets bucket: public read, admin write
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'species-assets',
  'species-assets',
  true,
  20971520,  -- 20 MiB
  array['audio/mpeg', 'audio/ogg', 'audio/wav', 'image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
)
on conflict (id) do nothing;

-- Photos: authenticated users can upload to their own folder
create policy "Users can upload own photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Photos: users can read their own photos
create policy "Users can read own photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Photos: users can delete their own photos
create policy "Users can delete own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Species assets: public read for authenticated users
create policy "Anyone can read species assets"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'species-assets');

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

alter table profiles enable row level security;
alter table sightings enable row level security;
alter table streaks enable row level security;
alter table user_achievements enable row level security;
alter table species enable row level security;
alter table species_types enable row level security;
alter table habitats enable row level security;
alter table species_audio enable row level security;
alter table species_illustrations enable row level security;
alter table species_regions enable row level security;

-- Profiles: users can read and update their own profile
create policy "Users can read own profile"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Sightings: users can CRUD their own sightings
create policy "Users can read own sightings"
  on sightings for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own sightings"
  on sightings for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete own sightings"
  on sightings for delete
  to authenticated
  using (user_id = auth.uid());

-- Streaks: users can read and update their own streak
create policy "Users can read own streak"
  on streaks for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update own streak"
  on streaks for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- User achievements: users can read their own achievements
create policy "Users can read own achievements"
  on user_achievements for select
  to authenticated
  using (user_id = auth.uid());

-- Species + lookup tables: public read for authenticated users
create policy "Authenticated users can read species"
  on species for select
  to authenticated
  using (true);

create policy "Authenticated users can read species types"
  on species_types for select
  to authenticated
  using (true);

create policy "Authenticated users can read habitats"
  on habitats for select
  to authenticated
  using (true);

create policy "Authenticated users can read species audio"
  on species_audio for select
  to authenticated
  using (true);

create policy "Authenticated users can read species illustrations"
  on species_illustrations for select
  to authenticated
  using (true);

create policy "Authenticated users can read species regions"
  on species_regions for select
  to authenticated
  using (true);

-- =============================================================================
-- TRIGGER: handle_new_user
-- =============================================================================
-- Fires on auth.users INSERT. Creates profiles + streaks rows.
-- Pulls display_name from OAuth metadata (Google or Apple).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  _display_name text;
begin
  -- Try to extract display name from OAuth metadata
  _display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',      -- Google OAuth
    new.raw_user_meta_data ->> 'name',            -- Apple OAuth
    split_part(new.email, '@', 1)                 -- fallback to email prefix
  );

  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    _display_name,
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.streaks (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_species_updated_at
  before update on species
  for each row
  execute function public.set_updated_at();

create trigger set_profiles_updated_at
  before update on profiles
  for each row
  execute function public.set_updated_at();

create trigger set_streaks_updated_at
  before update on streaks
  for each row
  execute function public.set_updated_at();
