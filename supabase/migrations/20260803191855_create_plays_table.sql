create table if not exists public.plays (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  department text not null,
  mode text not null default 'interest',
  payload jsonb not null,
  score int,
  grade text,
  duration_sec int,
  coins int,
  stomps int,
  deaths int
);

create index if not exists plays_created_at_idx on public.plays (created_at desc);
create index if not exists plays_department_idx on public.plays (department);
create index if not exists plays_name_dept_idx on public.plays (full_name, department);

alter table public.plays enable row level security;

drop policy if exists "anon_insert_plays" on public.plays;

create policy "anon_insert_plays"
  on public.plays
  for insert
  to anon, authenticated
  with check (
    char_length(trim(full_name)) >= 2
    and char_length(trim(department)) >= 1
    and char_length(full_name) <= 120
    and char_length(department) <= 120
  );
