-- Multi-company split: separate plays tables + Hall of Fame RPCs per company.
-- Existing live rows are copied into plays_tarento.

create table if not exists public.plays_tarento (
  like public.plays including all
);
create table if not exists public.plays_demo (
  like public.plays including all
);
create table if not exists public.plays_partner (
  like public.plays including all
);

alter table public.plays_tarento add column if not exists company_id text not null default 'tarento';
alter table public.plays_demo add column if not exists company_id text not null default 'demo';
alter table public.plays_partner add column if not exists company_id text not null default 'partner';

create index if not exists plays_tarento_created_at_idx on public.plays_tarento (created_at desc);
create index if not exists plays_demo_created_at_idx on public.plays_demo (created_at desc);
create index if not exists plays_partner_created_at_idx on public.plays_partner (created_at desc);

alter table public.plays_tarento enable row level security;
alter table public.plays_demo enable row level security;
alter table public.plays_partner enable row level security;

drop policy if exists "anon_insert_plays_tarento" on public.plays_tarento;
drop policy if exists "anon_insert_plays_demo" on public.plays_demo;
drop policy if exists "anon_insert_plays_partner" on public.plays_partner;

create policy "anon_insert_plays_tarento"
  on public.plays_tarento
  for insert
  to anon, authenticated
  with check (
    char_length(trim(full_name)) >= 2
    and char_length(trim(department)) >= 1
    and char_length(full_name) <= 120
    and char_length(department) <= 120
  );

create policy "anon_insert_plays_demo"
  on public.plays_demo
  for insert
  to anon, authenticated
  with check (
    char_length(trim(full_name)) >= 2
    and char_length(trim(department)) >= 1
    and char_length(full_name) <= 120
    and char_length(department) <= 120
  );

create policy "anon_insert_plays_partner"
  on public.plays_partner
  for insert
  to anon, authenticated
  with check (
    char_length(trim(full_name)) >= 2
    and char_length(trim(department)) >= 1
    and char_length(full_name) <= 120
    and char_length(department) <= 120
  );

grant insert on table public.plays_tarento to anon, authenticated;
grant insert on table public.plays_demo to anon, authenticated;
grant insert on table public.plays_partner to anon, authenticated;

revoke select, update, delete on table public.plays_tarento from anon, authenticated;
revoke select, update, delete on table public.plays_demo from anon, authenticated;
revoke select, update, delete on table public.plays_partner from anon, authenticated;

insert into public.plays_tarento (
  id, created_at, full_name, department, mode, payload, score, grade, duration_sec, coins, stomps, deaths, company_id
)
select
  id, created_at, full_name, department, mode, payload, score, grade, duration_sec, coins, stomps, deaths, 'tarento'
from public.plays
on conflict (id) do nothing;

create schema if not exists private;
revoke all on schema private from public;

drop function if exists public.hall_of_fame_tarento(int);
drop function if exists public.hall_of_fame_demo(int);
drop function if exists public.hall_of_fame_partner(int);
drop function if exists private.hall_of_fame_tarento(int);
drop function if exists private.hall_of_fame_demo(int);
drop function if exists private.hall_of_fame_partner(int);

create function private.hall_of_fame_tarento(limit_n int default 8)
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
  from public.plays_tarento p
  where p.score is not null
  order by p.score desc nulls last, p.created_at asc
  limit greatest(1, least(coalesce(limit_n, 8), 20));
$$;

create function private.hall_of_fame_demo(limit_n int default 8)
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
  from public.plays_demo p
  where p.score is not null
  order by p.score desc nulls last, p.created_at asc
  limit greatest(1, least(coalesce(limit_n, 8), 20));
$$;

create function private.hall_of_fame_partner(limit_n int default 8)
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
  from public.plays_partner p
  where p.score is not null
  order by p.score desc nulls last, p.created_at asc
  limit greatest(1, least(coalesce(limit_n, 8), 20));
$$;

create function public.hall_of_fame_tarento(limit_n int default 8)
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
  select * from private.hall_of_fame_tarento(limit_n);
$$;

create function public.hall_of_fame_demo(limit_n int default 8)
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
  select * from private.hall_of_fame_demo(limit_n);
$$;

create function public.hall_of_fame_partner(limit_n int default 8)
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
  select * from private.hall_of_fame_partner(limit_n);
$$;

revoke all on function private.hall_of_fame_tarento(int) from public;
revoke all on function private.hall_of_fame_demo(int) from public;
revoke all on function private.hall_of_fame_partner(int) from public;
revoke all on function public.hall_of_fame_tarento(int) from public;
revoke all on function public.hall_of_fame_demo(int) from public;
revoke all on function public.hall_of_fame_partner(int) from public;

grant usage on schema private to anon, authenticated;
grant execute on function private.hall_of_fame_tarento(int) to anon, authenticated;
grant execute on function private.hall_of_fame_demo(int) to anon, authenticated;
grant execute on function private.hall_of_fame_partner(int) to anon, authenticated;
grant execute on function public.hall_of_fame_tarento(int) to anon, authenticated;
grant execute on function public.hall_of_fame_demo(int) to anon, authenticated;
grant execute on function public.hall_of_fame_partner(int) to anon, authenticated;
