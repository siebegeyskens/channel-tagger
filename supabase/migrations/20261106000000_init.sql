create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 30),
  color text not null check (color ~ '^[a-z]+$'),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index tags_user_id_name_key on public.tags (user_id, lower(name));

create table public.channel_tags (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  channel_id text not null check (channel_id ~ '^UC[A-Za-z0-9_-]{22}$'),
  tag_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, channel_id, tag_id),
  foreign key (tag_id, user_id) references public.tags (id, user_id) on delete cascade
);

create index channel_tags_tag_id_idx on public.channel_tags (tag_id, user_id);

create table public.google_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  updated_at timestamptz not null default now()
);

alter table public.tags enable row level security;
alter table public.channel_tags enable row level security;
alter table public.google_tokens enable row level security;

revoke all on public.tags, public.channel_tags, public.google_tokens from anon, authenticated;
grant select, insert, update, delete on public.tags, public.channel_tags to authenticated;
grant select, insert, update, delete on public.tags, public.channel_tags, public.google_tokens to service_role;

create policy "Users manage their own tags"
  on public.tags for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own channel tags"
  on public.channel_tags for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
