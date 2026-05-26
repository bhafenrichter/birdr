-- Feedback table for user-submitted feedback from the app
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Index for querying feedback by user
create index idx_feedback_user_id on public.feedback(user_id);
create index idx_feedback_created_at on public.feedback(created_at desc);

-- RLS: users can only insert their own feedback
alter table public.feedback enable row level security;

create policy "Users can insert own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);

create policy "Users can read own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);
