-- ============================================================================
-- Contact form messages (readable by the president only)
--
-- Run this once in Supabase → SQL Editor → New query → Run, AFTER
-- team-and-registry.sql. Brand-new projects don't need it: schema.sql already
-- includes it. Safe to re-run.
--
-- Visitors can only submit through submit_contact_message(); they can never
-- read the table. Coordinators and internship coordinators can't read it either.
-- ============================================================================

create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  topic        text not null default 'general' check (char_length(topic) <= 60),
  name         text not null check (char_length(name) between 2 and 120),
  email        text not null check (char_length(email) between 3 and 254),
  phone        text not null default '' check (char_length(phone) <= 40),
  organisation text not null default '' check (char_length(organisation) <= 200),
  message      text not null check (char_length(message) between 10 and 5000),
  read_at      timestamptz,
  archived     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);
create index if not exists contact_messages_email_idx
  on public.contact_messages (lower(email), created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "President reads messages" on public.contact_messages;
create policy "President reads messages"
  on public.contact_messages for select to authenticated
  using ((select public.is_president()));

drop policy if exists "President updates messages" on public.contact_messages;
create policy "President updates messages"
  on public.contact_messages for update to authenticated
  using ((select public.is_president()))
  with check ((select public.is_president()));

drop policy if exists "President deletes messages" on public.contact_messages;
create policy "President deletes messages"
  on public.contact_messages for delete to authenticated
  using ((select public.is_president()));

revoke all on public.contact_messages from anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
-- Only the read / archived flags can be changed after a message arrives.
grant update (read_at, archived) on public.contact_messages to authenticated;

-- The only way in for visitors. Limits each email address to 5 messages an hour.
create or replace function public.submit_contact_message(
  topic text,
  name text,
  email text,
  phone text,
  organisation text,
  message text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_email text := lower(trim(coalesce(email, '')));
begin
  if clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email.';
  end if;
  if (
    select count(*) from public.contact_messages m
    where lower(m.email) = clean_email and m.created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'You have sent several messages already. Please wait a while and try again.';
  end if;

  insert into public.contact_messages (topic, name, email, phone, organisation, message)
  values (
    left(coalesce(trim(topic), 'general'), 60),
    trim(coalesce(name, '')),
    clean_email,
    left(trim(coalesce(phone, '')), 40),
    left(trim(coalesce(organisation, '')), 200),
    trim(coalesce(message, ''))
  );
end;
$$;

revoke execute on function public.submit_contact_message(text, text, text, text, text, text)
  from public;
grant execute on function public.submit_contact_message(text, text, text, text, text, text)
  to anon, authenticated;
