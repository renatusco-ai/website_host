begin;

alter table public.app_store_intakes rename to intake_app_store_submissions;
alter table public.intake_app_store_submissions
  rename constraint app_store_intakes_pkey to intake_app_store_submissions_pkey;
alter table public.intake_app_store_submissions
  rename constraint app_store_intakes_session_id_key to intake_app_store_submissions_session_id_key;
alter table public.intake_app_store_submissions
  rename constraint app_store_intakes_status_check to intake_app_store_submissions_status_check;
alter table public.intake_app_store_submissions
  rename constraint app_store_intakes_submission_version_check to intake_app_store_submissions_submission_version_check;
alter table public.intake_app_store_submissions
  rename constraint app_store_intakes_legacy_required_fields to intake_legacy_required_fields;
alter index public.idx_app_store_intakes_created_at rename to intake_app_store_submissions_created_at_idx;

-- PostgreSQL 18 also stores named NOT NULL constraints in pg_constraint.
do $$
declare
  previous_name text;
begin
  for previous_name in
    select conname from pg_catalog.pg_constraint
    where conrelid = 'public.intake_app_store_submissions'::regclass and contype = 'n'
      and starts_with(conname, 'app_store_intakes_')
  loop
    execute format('alter table public.intake_app_store_submissions rename constraint %I to %I',
      previous_name, replace(previous_name, 'app_store_intakes_', 'intake_app_store_submissions_'));
  end loop;
end;
$$;

-- Compatibility for an API instance serving a request while the migration deploys.
-- Both names address the same physical table and the same uniqueness constraints.
create view public.app_store_intakes with (security_invoker = true) as
  select * from public.intake_app_store_submissions;
revoke all on public.app_store_intakes from public, anon, authenticated;
grant select, insert on public.app_store_intakes to service_role;
grant select, insert, update on public.intake_app_store_submissions to service_role;

alter function public.check_and_increment_rate_limit(text, text, int, int)
  rename to intake_check_and_increment_rate_limit;
create function public.check_and_increment_rate_limit(
  p_key_hash text, p_action text, p_window_seconds int, p_max_hits int
) returns boolean
language sql
set search_path = ''
as $$
  select public.intake_check_and_increment_rate_limit(p_key_hash, p_action, p_window_seconds, p_max_hits);
$$;
revoke all on function public.check_and_increment_rate_limit(text, text, int, int)
  from public, anon, authenticated;
grant execute on function public.check_and_increment_rate_limit(text, text, int, int) to service_role;

create table public.intake_upload_activity (
  session_id uuid primary key,
  touched_at timestamptz not null default now()
);
create table public.intake_asset_removals (
  session_id uuid not null,
  object_name text not null check (object_name ~ '^[a-zA-Z0-9._-]+$' and strpos(object_name, '..') = 0),
  primary key (session_id, object_name)
);
alter table public.intake_upload_activity enable row level security;
alter table public.intake_asset_removals enable row level security;
revoke all on public.intake_upload_activity, public.intake_asset_removals from public, anon, authenticated;
grant select on public.intake_asset_removals to service_role;

create function public.intake_touch_upload_session(p_session_id uuid)
returns boolean language plpgsql security definer set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_session_id::text, 0));
  if exists (select 1 from public.intake_app_store_submissions where session_id = p_session_id) then
    return false;
  end if;
  insert into public.intake_upload_activity (session_id) values (p_session_id)
    on conflict (session_id) do update set touched_at = now();
  return true;
end;
$$;

create function public.intake_mark_asset_removed(p_session_id uuid, p_object_name text)
returns boolean language plpgsql security definer set search_path = ''
as $$
begin
  -- Serialize the deletion intent with submission, then delete both Storage aliases via the API.
  if not public.intake_touch_upload_session(p_session_id) then
    return false;
  end if;
  insert into public.intake_asset_removals (session_id, object_name)
    values (p_session_id, p_object_name)
    on conflict do nothing;
  return true;
end;
$$;

create function public.intake_guard_submission_assets()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.session_id::text, 0));
  if exists (
    select 1 from public.intake_asset_removals removal
    join pg_catalog.jsonb_array_elements(new.assets) as asset
      on removal.object_name = pg_catalog.regexp_replace(asset->>'path', '^.*/', '')
    where removal.session_id = new.session_id
  ) then
    raise check_violation using message = 'An intake asset was removed.', constraint = 'intake_removed_asset';
  end if;
  return new;
end;
$$;
create trigger intake_guard_submission_assets
  before insert on public.intake_app_store_submissions
  for each row execute function public.intake_guard_submission_assets();

create function public.intake_list_orphan_assets(
  p_max_age_hours int default 48,
  p_legacy_bucket text default 'app-store-intake-assets'
) returns table(bucket_id text, name text)
language sql security definer set search_path = ''
as $$
  with intake_objects as materialized (
    select o.bucket_id, o.name, o.created_at,
      lower(case when split_part(o.name, '/', 1) = 'intake'
        then split_part(o.name, '/', 2)
        else split_part(o.name, '/', 1)
      end) as session
    from storage.objects o
    where
      (o.bucket_id = 'intake-app-store-assets' and o.name ~ '^intake/[[:xdigit:]]{8}-[[:xdigit:]]{4}-4[[:xdigit:]]{3}-[89abAB][[:xdigit:]]{3}-[[:xdigit:]]{12}/[^/]+$')
      or (o.bucket_id = p_legacy_bucket and o.name ~ '^[[:xdigit:]]{8}-[[:xdigit:]]{4}-4[[:xdigit:]]{3}-[89abAB][[:xdigit:]]{3}-[[:xdigit:]]{12}/[^/]+$')
  ),
  inactive as (
    select session from intake_objects group by session
    having max(created_at) < now() - make_interval(hours => p_max_age_hours)
  )
  select o.bucket_id, o.name
  from intake_objects o
  join inactive i using (session)
  where not exists (
    select 1 from public.intake_app_store_submissions s where s.session_id = o.session::uuid
  )
  and not exists (
    select 1 from public.intake_upload_activity a
    where a.session_id = o.session::uuid and a.touched_at >= now() - make_interval(hours => p_max_age_hours)
  );
$$;

-- Preserve the old scheduled-job interface during the transition.
create or replace function public.list_orphan_intake_assets(p_max_age_hours int default 48)
returns table(name text)
language sql security definer set search_path = ''
as $$
  select o.name from public.intake_list_orphan_assets(p_max_age_hours) o
  where o.bucket_id = 'app-store-intake-assets';
$$;
revoke all on function public.intake_touch_upload_session(uuid),
  public.intake_mark_asset_removed(uuid, text), public.intake_guard_submission_assets(),
  public.intake_list_orphan_assets(int, text) from public, anon, authenticated;
grant execute on function public.intake_touch_upload_session(uuid),
  public.intake_mark_asset_removed(uuid, text), public.intake_list_orphan_assets(int, text) to service_role;

notify pgrst, 'reload schema';

commit;
