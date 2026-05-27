-- Add source, license, and attribution columns to species_illustrations
-- Mirrors the pattern from species_audio table
alter table species_illustrations
  add column if not exists source text,
  add column if not exists license text,
  add column if not exists attribution text;

-- Unique constraint for upsert on (species_id, variant)
create unique index if not exists idx_species_illustrations_species_variant
  on species_illustrations(species_id, variant);
