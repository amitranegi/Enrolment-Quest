-- Keep privileged table access outside the exposed public schema.
-- The public RPC is an invoker wrapper; PostgREST cannot expose private helpers.

create schema if not exists private;
revoke all on schema private from public;

drop function if exists public.hall_of_fame(int);
drop function if exists private.hall_of_fame(int);

create function private.hall_of_fame(limit_n int default 8)
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
  from public.plays p
  where p.score is not null
  order by p.score desc nulls last, p.created_at asc
  limit greatest(1, least(coalesce(limit_n, 8), 20));
$$;

create function public.hall_of_fame(limit_n int default 8)
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
  select * from private.hall_of_fame(limit_n);
$$;

revoke all on function private.hall_of_fame(int) from public;
revoke all on function public.hall_of_fame(int) from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.hall_of_fame(int) to anon, authenticated;
grant execute on function public.hall_of_fame(int) to anon, authenticated;

comment on function private.hall_of_fame(int) is
  'Privileged helper for the public title-screen leaderboard wrapper.';
comment on function public.hall_of_fame(int) is
  'Public invoker RPC returning truncated name, department, score, and grade.';
