-- ============================================================================
-- Dashboard team (president + coordinators) and the Registered Members list
--
-- Run this once in Supabase → SQL Editor → New query → Run, AFTER schema.sql
-- (and internships.sql if you added that separately). Brand-new projects don't
-- need it: schema.sql already includes everything here. Safe to re-run.
--
-- Roles
--   • President   – row in public.admins with role 'president'. Everything,
--                   including the Internship portal and appointing coordinators.
--   • Coordinator – row in public.admins with role 'coordinator'. Every
--                   website dashboard, but no Internship portal and no Team page.
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
