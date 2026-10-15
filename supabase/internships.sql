-- ============================================================================
-- Internship portal: programmes, internship admins, interns, invite links,
-- tasks and submissions.
--
-- Run this once in Supabase → SQL Editor → New query → Run.
-- (Already included in schema.sql for brand-new projects.) Safe to re-run.
--
-- Roles
--   • President      – row in public.admins with role 'president'; sees and
--                      manages everything. Dashboard coordinators get no access.
--   • Internship admin – member of a programme with role 'admin'; manages its
--                        interns, invite links, tasks and reviews.
--   • Intern         – member of a programme with role 'intern'; sees only
--                        their own tasks and submissions.

-- ----------------------------------------------------------------------------
-- Prerequisite: president vs coordinator roles on the admins table
-- ----------------------------------------------------------------------------
alter table public.admins add column if not exists role text not null default 'president';
alter table public.admins add column if not exists full_name text not null default '';

create or replace function public.is_president()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins
    where user_id = (select auth.uid()) and role = 'president'
  );
$$;

revoke execute on function public.is_president() from public;
grant execute on function public.is_president() to anon, authenticated;
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table if not exists public.internship_programs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  start_date  date not null,
  end_date    date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.internship_members (
  program_id uuid not null references public.internship_programs (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('admin', 'intern')),
  full_name  text not null default '',
  email      text not null default '',
  joined_at  timestamptz not null default now(),
  primary key (program_id, user_id)
);

create index if not exists internship_members_user_idx on public.internship_members (user_id);

create table if not exists public.internship_invites (
  id         uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.internship_programs (id) on delete cascade,
  token      text not null unique check (char_length(token) >= 20),
  role       text not null check (role in ('admin', 'intern')),
  label      text not null default '',
  expires_at timestamptz not null,
  max_uses   integer check (max_uses is null or max_uses > 0),
  uses       integer not null default 0,
  revoked    boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.internship_tasks (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.internship_programs (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  kind         text not null default 'Article',
  instructions text not null default '',
  -- 'text' = write in the editor, 'file' = upload a file, 'both' = either/both required
  mode         text not null default 'both' check (mode in ('text', 'file', 'both')),
  due_at       timestamptz not null,
  -- null = every intern in the programme; otherwise only these interns
  assignees    uuid[],
  created_by   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists internship_tasks_program_idx on public.internship_tasks (program_id, due_at);

create table if not exists public.internship_submissions (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.internship_tasks (id) on delete cascade,
  program_id   uuid not null references public.internship_programs (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null default '',
  content      jsonb,
  content_text text not null default '',
  attachments  jsonb not null default '[]'::jsonb,
  status       text not null default 'draft' check (status in ('draft', 'submitted')),
  submitted_at timestamptz,
  feedback     text not null default '',
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (task_id, user_id)
);

create index if not exists internship_submissions_program_idx
  on public.internship_submissions (program_id, user_id);


-- ----------------------------------------------------------------------------
-- Permission helpers (used by every policy below)
-- ----------------------------------------------------------------------------
create or replace function public.is_program_member(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_president() or exists (
    select 1 from public.internship_members
    where program_id = pid and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_program_admin(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_president() or exists (
    select 1 from public.internship_members
    where program_id = pid and user_id = (select auth.uid()) and role = 'admin'
  );
$$;

-- True when the signed-in user may use the portal at all.
create or replace function public.has_portal_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_president() or exists (
    select 1 from public.internship_members where user_id = (select auth.uid())
  );
$$;

-- Programme id from a storage path "<program_id>/<user_id>/<file>", or null.
create or replace function public.storage_program_id(path text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return split_part(path, '/', 1)::uuid;
exception when others then
  return null;
end;
$$;

revoke execute on function public.is_program_member(uuid) from public;
revoke execute on function public.is_program_admin(uuid) from public;
revoke execute on function public.has_portal_access() from public;
grant execute on function public.is_program_member(uuid) to authenticated;
grant execute on function public.is_program_admin(uuid) to authenticated;
grant execute on function public.has_portal_access() to authenticated;
grant execute on function public.storage_program_id(text) to authenticated;


-- ----------------------------------------------------------------------------
-- Timestamps and submission bookkeeping
-- ----------------------------------------------------------------------------
drop trigger if exists internship_programs_touch on public.internship_programs;
create trigger internship_programs_touch
  before update on public.internship_programs
  for each row execute function public.touch_updated_at();

drop trigger if exists internship_tasks_touch on public.internship_tasks;
create trigger internship_tasks_touch
  before update on public.internship_tasks
  for each row execute function public.touch_updated_at();

-- Interns can't fake the submission time, the programme or the reviewer fields.
create or replace function public.internship_submission_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.task_id = old.task_id;
    new.user_id = old.user_id;
  end if;
  select program_id into new.program_id from public.internship_tasks where id = new.task_id;
  new.updated_at = now();
  if tg_op = 'INSERT' then
    new.feedback = '';
    new.reviewed_at = null;
  elsif not public.is_program_admin(new.program_id) then
    new.feedback = old.feedback;
    new.reviewed_at = old.reviewed_at;
  end if;
  if new.status = 'submitted' and (tg_op = 'INSERT' or old.status <> 'submitted') then
    new.submitted_at = now();
  elsif new.status = 'draft' then
    new.submitted_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists internship_submissions_guard on public.internship_submissions;
create trigger internship_submissions_guard
  before insert or update on public.internship_submissions
  for each row execute function public.internship_submission_guard();


-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.internship_programs enable row level security;
alter table public.internship_members enable row level security;
alter table public.internship_invites enable row level security;
alter table public.internship_tasks enable row level security;
alter table public.internship_submissions enable row level security;

-- Programmes: members read; only the president creates, edits or deletes.
drop policy if exists "Members can read their programmes" on public.internship_programs;
create policy "Members can read their programmes"
  on public.internship_programs for select to authenticated
  using ((select public.is_program_member(id)));

drop policy if exists "President manages programmes" on public.internship_programs;
create policy "President manages programmes"
  on public.internship_programs for all to authenticated
  using ((select public.is_president()))
  with check ((select public.is_president()));

-- Members: you see yourself; programme admins see everyone in the programme.
drop policy if exists "Read own or managed memberships" on public.internship_members;
create policy "Read own or managed memberships"
  on public.internship_members for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_program_admin(program_id)));

drop policy if exists "Update own name or managed members" on public.internship_members;
create policy "Update own name or managed members"
  on public.internship_members for update to authenticated
  using (user_id = (select auth.uid()) or (select public.is_program_admin(program_id)))
  with check (user_id = (select auth.uid()) or (select public.is_program_admin(program_id)));

-- Programme admins remove interns; only the president removes admins.
drop policy if exists "Remove members" on public.internship_members;
create policy "Remove members"
  on public.internship_members for delete to authenticated
  using (
    (select public.is_president())
    or (role = 'intern' and (select public.is_program_admin(program_id)))
  );

-- Invites: programme admins manage intern links; the president manages admin links.
drop policy if exists "Manage invites" on public.internship_invites;
create policy "Manage invites"
  on public.internship_invites for all to authenticated
  using (
    (select public.is_president())
    or (role = 'intern' and (select public.is_program_admin(program_id)))
  )
  with check (
    (select public.is_president())
    or (role = 'intern' and (select public.is_program_admin(program_id)))
  );

-- Tasks: admins see all; interns see tasks given to everyone or to them.
drop policy if exists "Read tasks" on public.internship_tasks;
create policy "Read tasks"
  on public.internship_tasks for select to authenticated
  using (
    (select public.is_program_admin(program_id))
    or (
      (select public.is_program_member(program_id))
      and (assignees is null or (select auth.uid()) = any (assignees))
    )
  );

drop policy if exists "Admins manage tasks" on public.internship_tasks;
create policy "Admins manage tasks"
  on public.internship_tasks for all to authenticated
  using ((select public.is_program_admin(program_id)))
  with check ((select public.is_program_admin(program_id)));

-- Submissions: interns work on their own; admins read everything in their
-- programme and review through review_submission().
drop policy if exists "Read submissions" on public.internship_submissions;
create policy "Read submissions"
  on public.internship_submissions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_program_admin(program_id)));

drop policy if exists "Interns start their submissions" on public.internship_submissions;
create policy "Interns start their submissions"
  on public.internship_submissions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.internship_tasks t
      join public.internship_members m
        on m.program_id = t.program_id and m.user_id = (select auth.uid()) and m.role = 'intern'
      where t.id = task_id
        and (t.assignees is null or (select auth.uid()) = any (t.assignees))
    )
  );

-- Drafts can be edited; once completed, only a "return for changes" reopens it.
drop policy if exists "Interns edit their drafts" on public.internship_submissions;
create policy "Interns edit their drafts"
  on public.internship_submissions for update to authenticated
  using (user_id = (select auth.uid()) and status = 'draft')
  with check (user_id = (select auth.uid()));

-- Start from nothing (older projects auto-grant everything to API roles), then
-- grant only what the policies above need.
revoke all on public.internship_programs, public.internship_members, public.internship_invites,
  public.internship_tasks, public.internship_submissions from anon, authenticated;

grant select, insert, update, delete on public.internship_programs to authenticated;
grant select, delete on public.internship_members to authenticated;
-- Only the display name can be edited; roles change only through invite links.
grant update (full_name) on public.internship_members to authenticated;
grant select, insert, update, delete on public.internship_invites to authenticated;
grant select, insert, update, delete on public.internship_tasks to authenticated;
grant select, insert, update on public.internship_submissions to authenticated;


-- ----------------------------------------------------------------------------
-- Invite links
-- ----------------------------------------------------------------------------

-- What the join page shows before anyone signs in. Reveals nothing else.
create or replace function public.invite_preview(invite_token text)
returns table (program_title text, role text, expires_at timestamptz, usable boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select p.title, i.role, i.expires_at,
         (not i.revoked and i.expires_at > now() and (i.max_uses is null or i.uses < i.max_uses))
  from public.internship_invites i
  join public.internship_programs p on p.id = i.program_id
  where i.token = invite_token;
$$;

-- Joins the signed-in user to the invite's programme. Returns the programme id.
create or replace function public.redeem_invite(invite_token text, display_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.internship_invites;
  uid uuid := (select auth.uid());
  existing text;
begin
  if uid is null then
    raise exception 'Please sign in first.';
  end if;

  select * into inv from public.internship_invites where token = invite_token for update;
  if not found or inv.revoked then
    raise exception 'This invite link is not valid.';
  end if;
  if inv.expires_at <= now() then
    raise exception 'This invite link has expired.';
  end if;

  select role into existing from public.internship_members
  where program_id = inv.program_id and user_id = uid;

  if existing is null then
    if inv.max_uses is not null and inv.uses >= inv.max_uses then
      raise exception 'This invite link has already been used the maximum number of times.';
    end if;
    insert into public.internship_members (program_id, user_id, role, full_name, email)
    select inv.program_id, uid, inv.role, coalesce(nullif(trim(display_name), ''), u.email), u.email
    from auth.users u where u.id = uid;
    update public.internship_invites set uses = uses + 1 where id = inv.id;
  elsif existing = 'intern' and inv.role = 'admin' then
    update public.internship_members set role = 'admin'
    where program_id = inv.program_id and user_id = uid;
    update public.internship_invites set uses = uses + 1 where id = inv.id;
  end if;

  return inv.program_id;
end;
$$;

revoke execute on function public.invite_preview(text) from public;
revoke execute on function public.redeem_invite(text, text) from public;
grant execute on function public.invite_preview(text) to anon, authenticated;
grant execute on function public.redeem_invite(text, text) to authenticated;


-- ----------------------------------------------------------------------------
-- Reviews: admins leave feedback, optionally returning work for changes.
-- ----------------------------------------------------------------------------
create or replace function public.review_submission(
  submission_id uuid,
  review_feedback text,
  return_for_changes boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  pid uuid;
begin
  select program_id into pid from public.internship_submissions where id = submission_id;
  if pid is null or not public.is_program_admin(pid) then
    raise exception 'You can''t review this submission.';
  end if;
  update public.internship_submissions
  set feedback = coalesce(review_feedback, ''),
      reviewed_at = now(),
      status = case when return_for_changes then 'draft' else status end
  where id = submission_id;
end;
$$;

revoke execute on function public.review_submission(uuid, text, boolean) from public;
grant execute on function public.review_submission(uuid, text, boolean) to authenticated;


-- ----------------------------------------------------------------------------
-- Private storage for interns' uploads: "<program_id>/<user_id>/<file>"
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'internship-files',
  'internship-files',
  false,
  26214400,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Interns upload their files" on storage.objects;
create policy "Interns upload their files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'internship-files'
    and split_part(name, '/', 2) = (select auth.uid())::text
    and (select public.is_program_member(public.storage_program_id(name)))
  );

drop policy if exists "Read own or managed internship files" on storage.objects;
create policy "Read own or managed internship files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'internship-files'
    and (
      split_part(name, '/', 2) = (select auth.uid())::text
      or (select public.is_program_admin(public.storage_program_id(name)))
    )
  );

drop policy if exists "Interns delete their files" on storage.objects;
create policy "Interns delete their files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'internship-files'
    and split_part(name, '/', 2) = (select auth.uid())::text
  );
