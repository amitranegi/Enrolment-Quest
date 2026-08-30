-- Add the player's department to the narrow, public title-screen leaderboard RPC.
-- Names and departments are intentionally truncated before leaving the database.

drop function if exists public.hall_of_fame(int);

create function public.hall_of_fame(limit_n int default 8)
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

revoke all on function public.hall_of_fame(int) from public;
grant execute on function public.hall_of_fame(int) to anon, authenticated;

comment on function public.hall_of_fame(int) is
  'Public top scores for the title-screen Hall of Fame. Returns truncated name, department, score, and grade.';
