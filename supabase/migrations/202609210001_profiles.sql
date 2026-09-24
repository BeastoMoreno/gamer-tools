-- Run once in the SQL editor of your own Supabase project.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 40),
  username text unique check (username ~ '^[a-z0-9_]{3,24}$'),
  bio text not null default '' check (char_length(bio) <= 300),
  region text not null default '' check (char_length(region) <= 40),
  platform text not null default 'PC' check (platform in ('PC','PlayStation','Xbox','Nintendo','Mobile')),
  favorite_games text[] not null default '{}' check (cardinality(favorite_games) <= 8 and favorite_games <@ array['VALORANT','Counter-Strike 2','Apex Legends','PUBG PC','Overwatch 2','Fortnite','Rainbow Six Siege','Call of Duty / Warzone','Other']::text[]),
  mouse_dpi integer check (mouse_dpi between 100 and 100000),
  main_game text not null default '' check (main_game in ('','VALORANT','Counter-Strike 2','Apex Legends','PUBG PC','Overwatch 2','Fortnite','Rainbow Six Siege','Call of Duty / Warzone','Other')),
  sensitivity numeric check (sensitivity > 0 and sensitivity <= 1000),
  avatar_color text not null default 'violet' check (avatar_color in ('violet','mint','blue','amber','pink','slate')),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;
create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create function public.set_profile_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profile_updated_at before update on public.profiles for each row execute function public.set_profile_updated_at();
