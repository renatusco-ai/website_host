begin;

-- Additive staff draft columns and atomic revision-checked save RPC on public.intake_app_store_submissions.
-- Existing submissions open with staff_draft = null and staff_revision = 0 until their first staff save.

alter table public.intake_app_store_submissions
  add column if not exists staff_draft jsonb,
  add column if not exists staff_revision bigint not null default 0,
  add column if not exists staff_saved_at timestamptz,
  add column if not exists staff_saved_by uuid;

alter table public.intake_app_store_submissions
  drop constraint if exists intake_app_store_submissions_staff_draft_object,
  add constraint intake_app_store_submissions_staff_draft_object
    check (staff_draft is null or pg_catalog.jsonb_typeof(staff_draft) = 'object');

alter table public.intake_app_store_submissions
  drop constraint if exists intake_app_store_submissions_staff_revision_nonneg,
  add constraint intake_app_store_submissions_staff_revision_nonneg
    check (staff_revision >= 0);

alter table public.intake_app_store_submissions
  drop constraint if exists intake_app_store_submissions_staff_save_consistency,
  add constraint intake_app_store_submissions_staff_save_consistency
    check (
      (staff_revision = 0 and staff_draft is null and staff_saved_at is null and staff_saved_by is null)
      or (staff_revision > 0 and staff_draft is not null and staff_saved_at is not null and staff_saved_by is not null)
    );

-- Ensure row-level security and restricted table grants remain active.
alter table public.intake_app_store_submissions enable row level security;
revoke all on table public.intake_app_store_submissions from public, anon, authenticated;
grant select, insert, update on table public.intake_app_store_submissions to service_role;

-- Atomic revision-checked update for Step 2 staff drafts.
-- Updates only the four staff columns so client answers, assets, and gaps cannot be modified.
create or replace function public.intake_save_staff_draft(
  p_id uuid,
  p_expected_revision bigint,
  p_staff_draft jsonb,
  p_staff_saved_by uuid
)
returns table(
  outcome text,
  id uuid,
  staff_draft jsonb,
  staff_revision bigint,
  staff_saved_at timestamptz,
  staff_saved_by uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.intake_app_store_submissions%rowtype;
begin
  if p_id is null then
    raise check_violation using message = 'Intake reference is required.';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise check_violation using message = 'Expected staff revision must be a non-negative integer.';
  end if;
  if p_staff_draft is null or pg_catalog.jsonb_typeof(p_staff_draft) <> 'object' then
    raise check_violation using message = 'Staff draft must be a JSON object.';
  end if;
  if p_staff_saved_by is null then
    raise check_violation using message = 'Authenticated staff user ID is required.';
  end if;

  update public.intake_app_store_submissions s
  set
    staff_draft = p_staff_draft,
    staff_revision = s.staff_revision + 1,
    staff_saved_at = pg_catalog.now(),
    staff_saved_by = p_staff_saved_by
  where s.id = p_id
    and s.staff_revision = p_expected_revision
  returning s.* into v_row;

  if found then
    return query
    select
      'updated'::text,
      v_row.id,
      v_row.staff_draft,
      v_row.staff_revision,
      v_row.staff_saved_at,
      v_row.staff_saved_by;
    return;
  end if;

  select s.* into v_row
  from public.intake_app_store_submissions s
  where s.id = p_id;

  if found then
    return query
    select
      'conflict'::text,
      v_row.id,
      v_row.staff_draft,
      v_row.staff_revision,
      v_row.staff_saved_at,
      v_row.staff_saved_by;
    return;
  end if;

  return query
  select
    'not_found'::text,
    null::uuid,
    null::jsonb,
    null::bigint,
    null::timestamptz,
    null::uuid;
end;
$$;

revoke all on function public.intake_save_staff_draft(uuid, bigint, jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.intake_save_staff_draft(uuid, bigint, jsonb, uuid)
  to service_role;

notify pgrst, 'reload schema';

commit;
