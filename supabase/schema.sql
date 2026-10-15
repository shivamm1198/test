-- ============================================================================
-- Vidhi Ekta Sngh — database setup
--
-- Run this whole file once in Supabase → SQL Editor → New query → Run.
-- It is safe to run again: every statement checks whether it already exists.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Administrators (president and dashboard coordinators)
--    Only users listed here can use the dashboards. Signing up is not enough.
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  -- 'president' manages everything; 'coordinator' gets every website
  -- dashboard but not the Internship portal or the Team page.
  role       text not null default 'president' check (role in ('president', 'coordinator')),
  full_name  text not null default '',
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "Admins can see their own row" on public.admins;
create policy "Admins can see their own row"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on table public.admins to authenticated;

-- True when the signed-in user is an administrator. Used by every policy below.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- True only for the president (not for dashboard coordinators).
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


-- ----------------------------------------------------------------------------
-- 2. Keeps updated_at current on every edit
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ----------------------------------------------------------------------------
-- 3. Homepage content
--    One row per section (site, founder, members, …). The website validates
--    each section and falls back to its built-in default when a row is missing.
-- ----------------------------------------------------------------------------
create table if not exists public.site_content (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can add site content" on public.site_content;
create policy "Admins can add site content"
  on public.site_content for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit site content" on public.site_content;
create policy "Admins can edit site content"
  on public.site_content for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete site content" on public.site_content;
create policy "Admins can delete site content"
  on public.site_content for delete
  to authenticated
  using ((select public.is_admin()));

grant select on table public.site_content to anon, authenticated;
grant insert, update, delete on table public.site_content to authenticated;


-- ----------------------------------------------------------------------------
-- 4. Events
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 200),
  location    text not null default '',
  start_date  date not null,
  end_date    date check (end_date is null or end_date >= start_date),
  description text not null default '',
  image_url   text not null,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists events_start_date_idx on public.events (start_date desc);

drop trigger if exists events_touch on public.events;
create trigger events_touch
  before update on public.events
  for each row execute function public.touch_updated_at();

alter table public.events enable row level security;

drop policy if exists "Anyone can read published events" on public.events;
create policy "Anyone can read published events"
  on public.events for select
  to anon, authenticated
  using (published or (select public.is_admin()));

drop policy if exists "Admins can add events" on public.events;
create policy "Admins can add events"
  on public.events for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit events" on public.events;
create policy "Admins can edit events"
  on public.events for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events"
  on public.events for delete
  to authenticated
  using ((select public.is_admin()));

grant select on table public.events to anon, authenticated;
grant insert, update, delete on table public.events to authenticated;


-- ----------------------------------------------------------------------------
-- 5. Gallery
-- ----------------------------------------------------------------------------
create table if not exists public.gallery_items (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 200),
  category   text not null default 'Events',
  image_url  text not null,
  width      integer not null default 1200 check (width > 0),
  height     integer not null default 800 check (height > 0),
  created_at timestamptz not null default now()
);

create index if not exists gallery_items_created_at_idx on public.gallery_items (created_at desc);

alter table public.gallery_items enable row level security;

drop policy if exists "Anyone can read the gallery" on public.gallery_items;
create policy "Anyone can read the gallery"
  on public.gallery_items for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can add photos" on public.gallery_items;
create policy "Admins can add photos"
  on public.gallery_items for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit photos" on public.gallery_items;
create policy "Admins can edit photos"
  on public.gallery_items for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete photos" on public.gallery_items;
create policy "Admins can delete photos"
  on public.gallery_items for delete
  to authenticated
  using ((select public.is_admin()));

grant select on table public.gallery_items to anon, authenticated;
grant insert, update, delete on table public.gallery_items to authenticated;


-- ----------------------------------------------------------------------------
-- 6. Image storage
--    A public bucket: anyone can view images, only admins can change them.
--    10 MB per file; the dashboard resizes large photos before uploading.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can view media files" on storage.objects;
create policy "Admins can view media files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "Admins can upload media" on storage.objects;
create policy "Admins can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "Admins can replace media" on storage.objects;
create policy "Admins can replace media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "Admins can delete media" on storage.objects;
create policy "Admins can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));


-- ----------------------------------------------------------------------------
-- 7. Student Journal (articles + a public "documents" bucket for papers)
--    Also available on its own as journal.sql for existing projects.
-- ----------------------------------------------------------------------------
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]{3,120}$'),
  title         text not null check (char_length(title) between 1 and 250),
  author_name   text not null default '',
  author_detail text not null default '',
  category      text not null default '',
  summary       text not null default '',
  body          text not null default '',
  cover_url     text not null default '',
  document_url  text not null default '',
  document_name text not null default '',
  published     boolean not null default true,
  published_on  date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists articles_published_on_idx on public.articles (published_on desc);

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch
  before update on public.articles
  for each row execute function public.touch_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Anyone can read published articles" on public.articles;
create policy "Anyone can read published articles"
  on public.articles for select
  to anon, authenticated
  using (published or (select public.is_admin()));

drop policy if exists "Admins can add articles" on public.articles;
create policy "Admins can add articles"
  on public.articles for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit articles" on public.articles;
create policy "Admins can edit articles"
  on public.articles for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete articles" on public.articles;
create policy "Admins can delete articles"
  on public.articles for delete
  to authenticated
  using ((select public.is_admin()));

grant select on table public.articles to anon, authenticated;
grant insert, update, delete on table public.articles to authenticated;

-- Public bucket for the attached papers (PDF and Word, up to 20 MB each).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  true,
  20971520,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can view documents" on storage.objects;
create policy "Admins can view documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()));

drop policy if exists "Admins can upload documents" on storage.objects;
create policy "Admins can upload documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documents' and (select public.is_admin()));

drop policy if exists "Admins can replace documents" on storage.objects;
create policy "Admins can replace documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()))
  with check (bucket_id = 'documents' and (select public.is_admin()));

drop policy if exists "Admins can delete documents" on storage.objects;
create policy "Admins can delete documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()));


-- ============================================================================
-- 8. Internship portal: programmes, coordinators (internship admins), interns,
--    invite links, tasks and submissions, plus a private "internship-files"
--    bucket. Also available on its own as internships.sql for existing projects.
--
--    President   – rows in public.admins; sees and manages everything.
--    Coordinator – programme member with role 'admin'; manages its interns,
--                  invite links, tasks and reviews.
--    Intern      – programme member with role 'intern'; sees only their own
--                  tasks and work.
-- ============================================================================

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

-- ============================================================================
-- 9. Dashboard team (coordinator invite links) and Registered Members.
--    Also available on its own as team-and-registry.sql for existing projects.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Roles on the admins table (existing admins become presidents)
-- ----------------------------------------------------------------------------
alter table public.admins add column if not exists role text not null default 'president';
alter table public.admins add column if not exists full_name text not null default '';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'admins_role_check') then
    alter table public.admins
      add constraint admins_role_check check (role in ('president', 'coordinator'));
  end if;
end;
$$;

-- True only for the president (not for coordinators).
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

-- The president sees the whole team and can remove coordinators.
drop policy if exists "President sees the team" on public.admins;
create policy "President sees the team"
  on public.admins for select to authenticated
  using ((select public.is_president()));

drop policy if exists "President removes coordinators" on public.admins;
create policy "President removes coordinators"
  on public.admins for delete to authenticated
  using ((select public.is_president()) and role = 'coordinator');

grant select, delete on table public.admins to authenticated;


-- ----------------------------------------------------------------------------
-- Coordinator invite links (created by the president from the Team page)
-- ----------------------------------------------------------------------------
create table if not exists public.admin_invites (
  id         uuid primary key default gen_random_uuid(),
  token      text not null unique check (char_length(token) >= 20),
  role       text not null default 'coordinator' check (role = 'coordinator'),
  label      text not null default '',
  expires_at timestamptz not null,
  max_uses   integer check (max_uses is null or max_uses > 0),
  uses       integer not null default 0,
  revoked    boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.admin_invites enable row level security;

drop policy if exists "President manages team invites" on public.admin_invites;
create policy "President manages team invites"
  on public.admin_invites for all to authenticated
  using ((select public.is_president()))
  with check ((select public.is_president()));

revoke all on public.admin_invites from anon, authenticated;
grant select, insert, update, delete on public.admin_invites to authenticated;

-- What the invite page shows before someone signs in.
create or replace function public.admin_invite_preview(invite_token text)
returns table (expires_at timestamptz, usable boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select i.expires_at,
         (not i.revoked and i.expires_at > now() and (i.max_uses is null or i.uses < i.max_uses))
  from public.admin_invites i
  where i.token = invite_token;
$$;

-- Makes the signed-in user a coordinator. Returns their dashboard role.
create or replace function public.redeem_admin_invite(invite_token text, display_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  inv public.admin_invites;
  uid uuid := (select auth.uid());
  current_role_name text;
begin
  if uid is null then
    raise exception 'Please sign in first.';
  end if;

  select * into inv from public.admin_invites where token = invite_token for update;
  if not found or inv.revoked then
    raise exception 'This invite link is not valid.';
  end if;
  if inv.expires_at <= now() then
    raise exception 'This invite link has expired.';
  end if;

  select role into current_role_name from public.admins where user_id = uid;
  if found then
    return current_role_name; -- already on the team; never downgrade the president
  end if;

  if inv.max_uses is not null and inv.uses >= inv.max_uses then
    raise exception 'This invite link has already been used the maximum number of times.';
  end if;

  insert into public.admins (user_id, email, role, full_name)
  select uid, u.email, 'coordinator', left(coalesce(trim(display_name), ''), 120)
  from auth.users u where u.id = uid;

  update public.admin_invites set uses = uses + 1 where id = inv.id;
  return 'coordinator';
end;
$$;

revoke execute on function public.admin_invite_preview(text) from public;
revoke execute on function public.redeem_admin_invite(text, text) from public;
grant execute on function public.admin_invite_preview(text) to anon, authenticated;
grant execute on function public.redeem_admin_invite(text, text) to authenticated;


-- ----------------------------------------------------------------------------
-- The Internship portal is for the president only (not coordinators)
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

drop policy if exists "President manages programmes" on public.internship_programs;
create policy "President manages programmes"
  on public.internship_programs for all to authenticated
  using ((select public.is_president()))
  with check ((select public.is_president()));

drop policy if exists "Remove members" on public.internship_members;
create policy "Remove members"
  on public.internship_members for delete to authenticated
  using (
    (select public.is_president())
    or (role = 'intern' and (select public.is_program_admin(program_id)))
  );

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


-- ----------------------------------------------------------------------------
-- Registered members (the full list of members across India)
-- ----------------------------------------------------------------------------
create sequence if not exists public.registered_member_seq;

create table if not exists public.registered_members (
  id          uuid primary key default gen_random_uuid(),
  member_code text not null unique check (char_length(member_code) between 1 and 40),
  name        text not null check (char_length(name) between 1 and 200),
  location    text not null default '' check (char_length(location) <= 200),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Members without an ID get the next free one: VES-0001, VES-0002, …
create or replace function public.registered_member_code()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  candidate text;
begin
  new.member_code = upper(trim(coalesce(new.member_code, '')));
  if new.member_code = '' then
    loop
      candidate := 'VES-' || lpad(nextval('public.registered_member_seq')::text, 4, '0');
      exit when not exists (
        select 1 from public.registered_members where member_code = candidate
      );
    end loop;
    new.member_code = candidate;
  end if;
  return new;
end;
$$;

drop trigger if exists registered_members_code on public.registered_members;
create trigger registered_members_code
  before insert or update of member_code on public.registered_members
  for each row execute function public.registered_member_code();

drop trigger if exists registered_members_touch on public.registered_members;
create trigger registered_members_touch
  before update on public.registered_members
  for each row execute function public.touch_updated_at();

alter table public.registered_members enable row level security;

drop policy if exists "Anyone can read registered members" on public.registered_members;
create policy "Anyone can read registered members"
  on public.registered_members for select to anon, authenticated
  using (true);

drop policy if exists "Admins manage registered members" on public.registered_members;
create policy "Admins manage registered members"
  on public.registered_members for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on public.registered_members from anon, authenticated;
grant select on public.registered_members to anon, authenticated;
grant insert, update, delete on public.registered_members to authenticated;
grant usage, select on sequence public.registered_member_seq to authenticated;
