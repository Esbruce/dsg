-- Create feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  message text not null
);

comment on table public.feedback is 'Stores user-submitted feedback from the public form';

-- Optional: basic RLS to allow inserts from anon users if desired (we use service role here)
-- alter table public.feedback enable row level security;
-- create policy "allow inserts from anon" on public.feedback for insert to anon using (true) with check (true);

