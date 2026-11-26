-- Tag the existing seven-step submissions and allow quick intakes to defer launch decisions.
alter table public.app_store_intakes
  add column submission_version smallint not null default 1
    check (submission_version in (1, 2)),
  alter column website_url drop not null,
  alter column publishing_account drop not null,
  add constraint app_store_intakes_legacy_required_fields
    check (submission_version <> 1 or (website_url is not null and publishing_account is not null));
