-- Hill Climbing — Supabase schema for the cross-user CONTACT LIST + MESSAGING.
-- ADDITIVE to supabase-schema.sql. Run ONCE in the Supabase SQL editor
-- (Dashboard → SQL → New query → Run). It does not touch the sync tables.
--
-- ── Trust / safety model (READ THIS) ─────────────────────────────────────────
-- This is the suite's FIRST cross-user surface. Two things are true and must
-- stay true:
--
--  1. Messages here are PUBLIC SEED DATA, not private (see STATEMENT.md). They
--     are stored server-readable — there is NO end-to-end encryption and NO
--     confidentiality promise. The app says so plainly before you send. What is
--     kept is honesty, not secrecy.
--
--  2. RELATIONAL SAFETY is enforced HERE, in the database, not just in the UI
--     (the anon key shipped in the app is public; RLS + these RPCs are the ONLY
--     real guard). The invariants:
--        · You can only message someone you are ACCEPTED friends with.
--        · A BLOCK stops contact BOTH ways and cannot be messaged around.
--        · You cannot read a conversation you are not part of.
--        · Handles are looked up one-at-a-time (no directory enumeration), to
--          keep the invite surface from becoming a harassment surface.
--     Two-sided consent (a request must be accepted) + blocking + exit are the
--     coded floor of this layer, the analog of Govern's charter floor.
--
-- All writes go through SECURITY DEFINER functions that check auth.uid() and the
-- rules explicitly; the tables themselves grant only SELECT-your-own via RLS and
-- NO direct INSERT/UPDATE/DELETE. That way the state machine can't be driven
-- around from the client.

-- ── profiles: a handle per user, resolved one at a time (no enumeration) ──────
create table if not exists public.profiles (
  user_id      uuid        primary key references auth.users(id) on delete cascade,
  handle       text        unique not null check (handle ~ '^[a-z0-9_]{3,20}$'),
  display_name text        not null default '' check (char_length(display_name) <= 40),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;
-- You may read your OWN profile row directly. Everyone else's handle/name reaches
-- you only through hc_lookup_handle (exact match) or hc_my_contacts (people you
-- already have a relationship with) — so the directory can't be scraped.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (user_id = auth.uid());

-- ── friendships: exactly one row per unordered pair; a small state machine ────
-- status: 'pending' (requester → addressee, awaiting), 'accepted', 'blocked'.
create table if not exists public.friendships (
  id          bigserial   primary key,
  requester   uuid        not null references auth.users(id) on delete cascade,
  addressee   uuid        not null references auth.users(id) on delete cascade,
  status      text        not null default 'pending' check (status in ('pending','accepted','blocked')),
  blocked_by  uuid        references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (requester <> addressee)
);
-- One relationship per unordered pair, whoever initiated.
create unique index if not exists friendships_pair_uniq
  on public.friendships (least(requester, addressee), greatest(requester, addressee));
create index if not exists friendships_addressee_idx on public.friendships (addressee, status);
create index if not exists friendships_requester_idx on public.friendships (requester, status);
alter table public.friendships enable row level security;
-- You can READ rows you are part of. No direct writes — RPCs only.
drop policy if exists friendships_select on public.friendships;
create policy friendships_select on public.friendships for select
  using (requester = auth.uid() or addressee = auth.uid());

-- ── messages: server-readable (public seed data), readable only by the pair ──
create table if not exists public.messages (
  id         bigserial   primary key,
  sender     uuid        not null references auth.users(id) on delete cascade,
  recipient  uuid        not null references auth.users(id) on delete cascade,
  body       text        not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists messages_pair_idx on public.messages (sender, recipient, id);
create index if not exists messages_recipient_idx on public.messages (recipient, id);
alter table public.messages enable row level security;
-- You can read messages you sent or received. Inserts go through hc_send_message.
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select
  using (sender = auth.uid() or recipient = auth.uid());

-- ── helper: the single friendship row for {me, other}, in either direction ───
create or replace function public.hc_pair(p_me uuid, p_other uuid)
returns public.friendships language sql stable security definer set search_path = '' as $$
  select * from public.friendships
   where (requester = p_me and addressee = p_other)
      or (requester = p_other and addressee = p_me)
   limit 1;
$$;

-- ── set/claim your handle ────────────────────────────────────────────────────
create or replace function public.hc_set_handle(p_handle text, p_display text default '')
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); row public.profiles;
begin
  if me is null then raise exception 'not signed in'; end if;
  if p_handle !~ '^[a-z0-9_]{3,20}$' then raise exception 'handle must be 3–20 chars: a–z, 0–9, _'; end if;
  insert into public.profiles (user_id, handle, display_name)
    values (me, p_handle, coalesce(left(p_display,40),''))
    on conflict (user_id) do update
      set handle = excluded.handle, display_name = excluded.display_name, updated_at = now()
    returning * into row;
  return row;
end $$;

-- ── look up ONE handle → user_id (exact match; no enumeration) ───────────────
create or replace function public.hc_lookup_handle(p_handle text)
returns uuid language sql stable security definer set search_path = '' as $$
  select user_id from public.profiles where handle = lower(p_handle);
$$;

-- ── send a friend request (auto-accepts if they already invited you) ─────────
create or replace function public.hc_friend_request(p_to_handle text)
returns text language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); other uuid; pair public.friendships;
begin
  if me is null then raise exception 'not signed in'; end if;
  other := public.hc_lookup_handle(p_to_handle);
  if other is null then raise exception 'no one goes by that handle'; end if;
  if other = me then raise exception 'you cannot friend yourself'; end if;
  pair := public.hc_pair(me, other);
  if pair.id is not null then
    if pair.status = 'blocked' then raise exception 'that relationship is blocked'; end if;
    if pair.status = 'accepted' then return 'already_friends'; end if;
    -- pending: if THEY invited me, accept it (mutual); if I invited them, no-op.
    if pair.requester = other then
      update public.friendships set status = 'accepted', updated_at = now() where id = pair.id;
      return 'accepted';
    end if;
    return 'already_pending';
  end if;
  insert into public.friendships (requester, addressee, status) values (me, other, 'pending');
  return 'requested';
end $$;

-- ── respond to a pending request addressed to me ─────────────────────────────
create or replace function public.hc_friend_respond(p_other uuid, p_accept boolean)
returns text language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); pair public.friendships;
begin
  if me is null then raise exception 'not signed in'; end if;
  pair := public.hc_pair(me, p_other);
  if pair.id is null or pair.status <> 'pending' or pair.addressee <> me then
    raise exception 'no pending request from that person';
  end if;
  if p_accept then
    update public.friendships set status = 'accepted', updated_at = now() where id = pair.id;
    return 'accepted';
  else
    delete from public.friendships where id = pair.id;   -- decline removes it
    return 'declined';
  end if;
end $$;

-- ── block someone (both directions; survives re-requests) ────────────────────
create or replace function public.hc_block(p_other uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); pair public.friendships;
begin
  if me is null then raise exception 'not signed in'; end if;
  if p_other = me then raise exception 'cannot block yourself'; end if;
  pair := public.hc_pair(me, p_other);
  if pair.id is null then
    insert into public.friendships (requester, addressee, status, blocked_by)
      values (me, p_other, 'blocked', me);
  else
    update public.friendships set status = 'blocked', blocked_by = me, updated_at = now() where id = pair.id;
  end if;
  return 'blocked';
end $$;

-- ── unblock / unfriend: only the blocker can lift their block ────────────────
create or replace function public.hc_unfriend(p_other uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); pair public.friendships;
begin
  if me is null then raise exception 'not signed in'; end if;
  pair := public.hc_pair(me, p_other);
  if pair.id is null then return 'none'; end if;
  if pair.status = 'blocked' and pair.blocked_by <> me then
    raise exception 'the other person blocked you; only they can lift it';
  end if;
  delete from public.friendships where id = pair.id;
  return 'removed';
end $$;

-- ── send a message (enforces accepted friendship + no block) ─────────────────
create or replace function public.hc_send_message(p_to uuid, p_body text)
returns public.messages language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); pair public.friendships; row public.messages;
begin
  if me is null then raise exception 'not signed in'; end if;
  if p_to = me then raise exception 'cannot message yourself here'; end if;
  if p_body is null or char_length(btrim(p_body)) = 0 then raise exception 'empty message'; end if;
  if char_length(p_body) > 4000 then raise exception 'message too long'; end if;
  pair := public.hc_pair(me, p_to);
  if pair.id is null or pair.status <> 'accepted' then
    raise exception 'you can only message an accepted friend';
  end if;
  insert into public.messages (sender, recipient, body) values (me, p_to, left(p_body,4000)) returning * into row;
  return row;
end $$;

-- ── my contact list: friends/pending, joined to their handle + display ───────
create or replace function public.hc_my_contacts()
returns table (other_uid uuid, handle text, display_name text, status text, direction text, blocked_by uuid, updated_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select
    case when f.requester = auth.uid() then f.addressee else f.requester end as other_uid,
    p.handle, p.display_name, f.status,
    case when f.requester = auth.uid() then 'outgoing' else 'incoming' end as direction,
    f.blocked_by, f.updated_at
  from public.friendships f
  left join public.profiles p
    on p.user_id = case when f.requester = auth.uid() then f.addressee else f.requester end
  where f.requester = auth.uid() or f.addressee = auth.uid()
  order by f.updated_at desc;
$$;

-- ── grants: authenticated users may call the RPCs; anon cannot ───────────────
grant execute on function
  public.hc_set_handle(text, text),
  public.hc_lookup_handle(text),
  public.hc_friend_request(text),
  public.hc_friend_respond(uuid, boolean),
  public.hc_block(uuid),
  public.hc_unfriend(uuid),
  public.hc_send_message(uuid, text),
  public.hc_my_contacts()
to authenticated;
revoke execute on function public.hc_pair(uuid, uuid) from anon, authenticated;  -- internal helper only

-- ── self-test (optional): run as a quick sanity check, then rollback ─────────
-- Simulate two users A and B and assert the safety invariants hold. Wrap in a
-- transaction you ROLL BACK so it leaves no data. (Requires two real auth.users
-- rows to exist; adjust the UUIDs. Kept here as executable documentation.)
--
--   begin;
--   -- set request.jwt.claim.sub via set_config to impersonate; see Supabase docs.
--   -- 1) B cannot message A before acceptance  → hc_send_message raises.
--   -- 2) A requests B, B accepts               → hc_send_message succeeds both ways.
--   -- 3) A blocks B                            → B's hc_send_message raises; A's too.
--   -- 4) C (third party) selects messages A↔B  → returns 0 rows (RLS).
--   rollback;
