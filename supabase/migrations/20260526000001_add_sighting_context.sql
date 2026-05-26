-- Add photo quality and bird setting context to sightings
alter table sightings
  add column photo_quality text,
  add column setting text;

-- Validate photo_quality values
alter table sightings
  add constraint chk_photo_quality
  check (photo_quality is null or photo_quality in ('pristine', 'good', 'fair', 'poor'));
