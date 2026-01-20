-- 1. Create Enum
create type public.user_role as enum ('project_leader', 'reviewer', 'organizer', 'admin');

-- 2. Create Profiles Table
create table public.profiles (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade not null unique,
  role public.user_role not null default 'project_leader'::public.user_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Enable RLS
alter table public.profiles enable row level security;

-- 4. Create RLS Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = user_id );

-- 5. Create Trigger for New Users
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, role)
  values (new.id, 'project_leader'); -- Default role
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
