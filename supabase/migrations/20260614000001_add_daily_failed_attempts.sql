-- Add shadow limit counter for low-confidence (retry) identification attempts.
-- These do not consume a user's daily capture quota but are capped at 10/day
-- to prevent API abuse.
alter table public.profiles
  add column daily_failed_attempts int not null default 0;
