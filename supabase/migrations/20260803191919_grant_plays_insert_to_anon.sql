-- Insert-only for public clients. No SELECT/UPDATE/DELETE grants: admin export
-- goes through the service-role Edge Function instead.
grant insert on table public.plays to anon, authenticated;
revoke select, update, delete on table public.plays from anon, authenticated;
