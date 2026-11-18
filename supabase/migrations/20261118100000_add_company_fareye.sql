-- Adds Fareye's dedicated plays table and Hall of Fame RPC pair.

create table if not exists public.plays_fareye (
  like public.plays including all
);

alter table public.plays_fareye
  add column if not exists company_id text not null default 'fareye';

create index if not exists plays_fareye_created_at_idx
  on public.plays_fareye (created_at desc);

alter table public.plays_fareye enable row level security;

drop policy if exists "anon_insert_plays_fareye" on public.plays_fareye;

create policy "anon_insert_plays_fareye"
  on public.plays_fareye
  for insert
  to anon, authenticated
  with check (
    char_length(trim(full_name)) >= 2
    and char_length(trim(department)) >= 1
    and char_length(full_name) <= 120
    and char_length(department) <= 120
  );

grant insert on table public.plays_fareye to anon, authenticated;
revoke select, update, delete on public.plays_fareye from anon, authenticated;

create schema if not exists private;
revoke all on schema private from public;

drop function if exists public.hall_of_fame_fareye(int);
drop function if exists private.hall_of_fame_fareye(int);

create function private.hall_of_fame_fareye(limit_n int default 8)
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
  from public.plays_fareye p
  where p.score is not null
  order by p.score desc nulls last, p.created_at asc
  limit greatest(1, least(coalesce(limit_n, 8), 20));
$$;

create function public.hall_of_fame_fareye(limit_n int default 8)
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
  select * from private.hall_of_fame_fareye(limit_n);
$$;

revoke all on function private.hall_of_fame_fareye(int) from public;
revoke all on function public.hall_of_fame_fareye(int) from public;

grant usage on schema private to anon, authenticated;
grant execute on function private.hall_of_fame_fareye(int) to anon, authenticated;
grant execute on function public.hall_of_fame_fareye(int) to anon, authenticated;
