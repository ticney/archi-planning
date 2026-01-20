create type governance_request_status as enum ('draft', 'pending', 'validated', 'rejected');

create table governance_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  project_code text not null,
  description text,
  status governance_request_status not null default 'draft',
  created_by uuid references auth.users(id) default auth.uid() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table governance_requests enable row level security;

create policy "Users can create their own governance requests"
  on governance_requests for insert
  with check (auth.uid() = created_by);

create policy "Users can view their own governance requests"
  on governance_requests for select
  using (auth.uid() = created_by);

create policy "Users can update their own governance requests"
  on governance_requests for update
  using (auth.uid() = created_by);
