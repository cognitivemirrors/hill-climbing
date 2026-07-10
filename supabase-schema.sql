-- Hill Climbing — Supabase schema for end-to-end-encrypted cross-device sync.
-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL → New query → Run).
--
-- Trust model: zero-knowledge. The server stores only ciphertext plus two
-- wrapped-DEK blobs. It can never read content. Row-Level Security is the ONLY
-- guard on the data (the anon key shipped in the app is public by design), so
-- every table below MUST have RLS enabled with the policies given here.
--
-- Companion client: hc-sync.js. Doc-key convention:
--   blob rows: 'ls:hill-climbing-climb'
--   log rows:  'idb:climb:events/<eventId>'

-- ── encrypted documents (blob rows + append-only log rows share this table) ──
create table if not exists public.sync_docs (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  doc_key     text        not null,           -- 'ls:...' (blob) | 'idb:.../<id>' (log record)
  ciphertext  text        not null,           -- base64(AES-GCM ciphertext incl. auth tag)
  iv          text        not null,           -- base64(12-byte AES-GCM IV)
  updated_at  bigint      not null,           -- logical clock (ms) — LWW for blobs; record ts for logs
  device_id   text        not null,           -- LWW tiebreak
  server_seq  bigserial,                      -- monotonic; incremental pull cursor for log rows
  created_at  timestamptz not null default now(),
  primary key (user_id, doc_key)
);
create index if not exists sync_docs_seq_idx on public.sync_docs (user_id, server_seq);

alter table public.sync_docs enable row level security;
drop policy if exists sync_docs_select on public.sync_docs;
drop policy if exists sync_docs_insert on public.sync_docs;
drop policy if exists sync_docs_update on public.sync_docs;
drop policy if exists sync_docs_delete on public.sync_docs;
create policy sync_docs_select on public.sync_docs for select using  (user_id = auth.uid());
create policy sync_docs_insert on public.sync_docs for insert with check (user_id = auth.uid());
create policy sync_docs_update on public.sync_docs for update using  (user_id = auth.uid())
                                                          with check (user_id = auth.uid());
create policy sync_docs_delete on public.sync_docs for delete using  (user_id = auth.uid());

-- ── wrapped-key bundle (exactly one row per user) ────────────────────────────
create table if not exists public.sync_keybundle (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  kdf          text        not null default 'PBKDF2-SHA256-600000',
  pass_salt    text        not null,          -- base64
  pass_iv      text        not null,
  pass_wrapped text        not null,          -- base64(AES-GCM(rawDEK) under passphrase-derived key)
  rec_salt     text        not null,
  rec_iv       text        not null,
  rec_wrapped  text        not null,          -- base64(AES-GCM(rawDEK) under recovery-code-derived key)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id)
);
alter table public.sync_keybundle enable row level security;
drop policy if exists kb_select on public.sync_keybundle;
drop policy if exists kb_insert on public.sync_keybundle;
drop policy if exists kb_update on public.sync_keybundle;
drop policy if exists kb_delete on public.sync_keybundle;
create policy kb_select on public.sync_keybundle for select using  (user_id = auth.uid());
create policy kb_insert on public.sync_keybundle for insert with check (user_id = auth.uid());
create policy kb_update on public.sync_keybundle for update using  (user_id = auth.uid())
                                                        with check (user_id = auth.uid());
create policy kb_delete on public.sync_keybundle for delete using  (user_id = auth.uid());

-- ── merge RPCs (server-enforced; security invoker keeps RLS in force) ────────
-- Blob: last-write-wins. Overwrite only if the incoming clock is strictly newer
-- (equal clock → higher device_id wins the tiebreak). A stale push is a no-op.
create or replace function public.sync_put_blob(
  p_doc_key text, p_ct text, p_iv text, p_updated_at bigint, p_device text
) returns void language sql security invoker set search_path = '' as $$
  insert into public.sync_docs (user_id, doc_key, ciphertext, iv, updated_at, device_id)
  values (auth.uid(), p_doc_key, p_ct, p_iv, p_updated_at, p_device)
  on conflict (user_id, doc_key) do update
    set ciphertext = excluded.ciphertext, iv = excluded.iv,
        updated_at = excluded.updated_at, device_id = excluded.device_id
    where excluded.updated_at > public.sync_docs.updated_at
       or (excluded.updated_at = public.sync_docs.updated_at
           and excluded.device_id > public.sync_docs.device_id);
$$;

-- Log: append-only, immutable. Insert-if-absent (union-by-id).
create or replace function public.sync_put_log(
  p_doc_key text, p_ct text, p_iv text, p_updated_at bigint, p_device text
) returns void language sql security invoker set search_path = '' as $$
  insert into public.sync_docs (user_id, doc_key, ciphertext, iv, updated_at, device_id)
  values (auth.uid(), p_doc_key, p_ct, p_iv, p_updated_at, p_device)
  on conflict (user_id, doc_key) do nothing;
$$;

-- ── after running this ────────────────────────────────────────────────────────
-- 1. Authentication → Providers → Email is ON by default (nothing to do). For the
--    smoothest pilot, turn OFF "Confirm email" — otherwise sign-up sends a link you
--    must click once before the first sign-in (the app handles both paths).
-- 2. Once your own account exists, consider disabling open sign-ups
--    (Authentication → Sign In / Providers → "Allow new users to sign up")
--    since the publishable key is public. RLS still isolates each user's rows.
-- 3. Put the project URL + publishable key (Project Settings → API) into
--    climb.html's SUPABASE_URL / SUPABASE_ANON_KEY constants.
