-- Adds Arcelor Mittal's dedicated plays table and Hall of Fame RPC pair.

create table if not exists public.plays_arcelormittal (
  like public.plays including all
);

alter table public.plays_arcelormittal
  add column if not exists company_id text not null default 'arcelormittal';

create index if not exists plays_arcelormittal_created_at_idx
  on public.plays_arcelormittal (created_at desc);

alter table public.plays_arcelormittal enable row level security;

drop policy if exists "anon_insert_plays_arcelormittal" on public.plays_arcelormittal;

create policy "anon_insert_plays_arcelormittal"
  on public.plays_arcelormittal
  for insert
  to anon, authenticated
  with check (
    char_length(trim(full_name)) >= 2
    and char_length(trim(department)) >= 1
    and char_length(full_name) <= 120
    and char_length(department) <= 120
  );

grant insert on table public.plays_arcelormittal to anon, authenticated;
revoke select, update, delete on table public.plays_arcelormittal from anon, authenticated;

create schema if not exists private;
revoke all on schema private from public;

drop function if exists public.hall_of_fame_arcelormittal(int);
drop function if exists private.hall_of_fame_arcelormittal(int);

create function private.hall_of_fame_arcelormittal(limit_n int default 8)
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
  from public.plays_arcelormittal p
  where p.score is not null
  order by p.score desc nulls last, p.created_at asc
  limit greatest(1, least(coalesce(limit_n, 8), 20));
$$;

create function public.hall_of_fame_arcelormittal(limit_n int default 8)
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
  select * from private.hall_of_fame_arcelormittal(limit_n);
$$;

revoke all on function private.hall_of_fame_arcelormittal(int) from public;
revoke all on function public.hall_of_fame_arcelormittal(int) from public;

grant usage on schema private to anon, authenticated;
grant execute on function private.hall_of_fame_arcelormittal(int) to anon, authenticated;
grant execute on function public.hall_of_fame_arcelormittal(int) to anon, authenticated;
