-- Standalone iOS App Store Client Intake Form
-- Tables, atomic serverless rate-limit RPC, strict RLS/REVOKE hardening, and private Storage bucket.

create extension if not exists pgcrypto;

-- 1. Submissions table
create table if not exists public.app_store_intakes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'in_progress', 'submitted', 'approved')),
  brand_name text not null,
  legal_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  website_url text not null,
  app_name text not null,
  publishing_account text not null,
  answers jsonb not null,
  assets jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  client_ip_hash text
);

create index if not exists idx_app_store_intakes_created_at
  on public.app_store_intakes (created_at desc);

alter table public.app_store_intakes enable row level security;
revoke all on table public.app_store_intakes from public, anon, authenticated;

-- 2. Persistent serverless rate-limit table & atomic RPC
create table if not exists public.intake_rate_limits (
  key_hash text not null,
  action text not null,
  window_start timestamptz not null,
  hits int not null default 1,
  primary key (key_hash, action, window_start)
);

alter table public.intake_rate_limits enable row level security;
revoke all on table public.intake_rate_limits from public, anon, authenticated;

create or replace function public.check_and_increment_rate_limit(
  p_key_hash text,
  p_action text,
  p_window_seconds int,
  p_max_hits int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bucket timestamptz;
  v_hits int;
begin
  v_bucket := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.intake_rate_limits (key_hash, action, window_start, hits)
  values (p_key_hash, p_action, v_bucket, 1)
  on conflict (key_hash, action, window_start)
  do update set hits = public.intake_rate_limits.hits + 1
  returning hits into v_hits;

  -- Prune expired buckets opportunistically
  delete from public.intake_rate_limits
  where window_start < now() - interval '24 hours';

  return v_hits <= p_max_hits;
end;
$$;

revoke all on function public.check_and_increment_rate_limit(text, text, int, int)
  from public, anon, authenticated;
grant execute on function public.check_and_increment_rate_limit(text, text, int, int)
  to service_role;

-- 3. Private Storage bucket for uploaded brand assets (no anon/authenticated policies)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'app-store-intake-assets',
  'app-store-intake-assets',
  false,
  26214400, -- 25 MB per file
  array[
    'image/png',
    'image/svg+xml',
    'image/jpeg',
    'image/webp',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/postscript',
    'application/eps',
    'image/x-eps',
    'font/ttf',
    'font/otf',
    'font/woff2',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 4. Orphan upload discovery RPC (for scheduled cron to delete via Supabase Storage API:
--    supabase.storage.from('app-store-intake-assets').remove(paths)
--    Hosted Supabase blocks direct DELETE FROM storage.objects via protect_objects_delete.)
create or replace function public.list_orphan_intake_assets(p_max_age_hours int default 48)
returns table(name text)
language sql
security definer
set search_path = public, storage
as $$
  select o.name
  from storage.objects o
  where o.bucket_id = 'app-store-intake-assets'
    and o.created_at < now() - make_interval(hours => p_max_age_hours)
    and not exists (
      select 1
      from public.app_store_intakes i
      where split_part(o.name, '/', 1) = i.session_id::text
    );
$$;

revoke all on function public.list_orphan_intake_assets(int)
  from public, anon, authenticated;
grant execute on function public.list_orphan_intake_assets(int)
  to service_role;
