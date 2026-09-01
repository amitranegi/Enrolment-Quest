-- Adds the Expleo company's dedicated plays table + Hall of Fame RPC pair,
-- following the multi-company pattern established in
-- 20260819084306_multi_company_profiles.sql.

create table if not exists public.plays_expleo (
  like public.plays including all
);

alter table public.plays_expleo
  add column if not exists company_id text not null default 'expleo';

create index if not exists plays_expleo_created_at_idx
  on public.plays_expleo (created_at desc);

alter table public.plays_expleo enable row level security;

drop policy if exists "anon_insert_plays_expleo" on public.plays_expleo;

create policy "anon_insert_plays_expleo"
  on public.plays_expleo
  for insert
  to anon, authenticated
  with check (
    char_length(trim(full_name)) >= 2
    and char_length(trim(department)) >= 1
    and char_length(full_name) <= 120
    and char_length(department) <= 120
  );

grant insert on table public.plays_expleo to anon, authenticated;
revoke select, update, delete on table public.plays_expleo from anon, authenticated;

-- No-op if this schema already exists from the original multi-company migration.
create schema if not exists private;
revoke all on schema private from public;

drop function if exists public.hall_of_fame_expleo(int);
drop function if exists private.hall_of_fame_expleo(int);

create function private.hall_of_fame_expleo(limit_n int default 8)
returns table (
  display_name text,
  department text,
  score int,
  grade text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    left(trim(p.full_name), 16)::text as display_name,
    left(trim(p.department), 18)::text as department,
    p.score,
    p.grade
  from public.plays_expleo p
  where p.score is not null
  order by p.score desc nulls last, p.created_at asc
  limit greatest(1, least(coalesce(limit_n, 8), 20));
$$;

create function public.hall_of_fame_expleo(limit_n int default 8)
returns table (
  display_name text,
  department text,
  score int,
  grade text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.hall_of_fame_expleo(limit_n);
$$;

revoke all on function private.hall_of_fame_expleo(int) from public;
revoke all on function public.hall_of_fame_expleo(int) from public;

grant usage on schema private to anon, authenticated;
grant execute on function private.hall_of_fame_expleo(int) to anon, authenticated;
grant execute on function public.hall_of_fame_expleo(int) to anon, authenticated;
