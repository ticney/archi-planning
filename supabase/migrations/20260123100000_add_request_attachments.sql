-- Create the request_attachments table
create type attachment_type as enum ('dat_sheet', 'architecture_diagram', 'security_signoff', 'finops_approval', 'other');

create table request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references governance_requests(id) on delete cascade,
  document_type text not null, -- using text to be flexible but validated by app, or use enum if strict
  storage_path text not null,
  filename text not null,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid not null default auth.uid()
);

-- RLS Policies for request_attachments
alter table request_attachments enable row level security;

create policy "Users can view attachments for their requests"
  on request_attachments for select
  using (
    exists (
      select 1 from governance_requests
      where id = request_attachments.request_id
      and created_by = auth.uid()
    )
  );

create policy "Reviewers can view all attachments"
  on request_attachments for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'reviewer'
    )
  );

create policy "Users can insert attachments for their requests"
  on request_attachments for insert
  with check (
    exists (
      select 1 from governance_requests
      where id = request_attachments.request_id
      and created_by = auth.uid()
    )
  );

create policy "Users can delete their own attachments"
  on request_attachments for delete
  using (
    uploaded_by = auth.uid()
  );

-- Create Storage Bucket 'governance-proofs'
insert into storage.buckets (id, name, public)
values ('governance-proofs', 'governance-proofs', false)
on conflict (id) do nothing;

-- Storage Policies
create policy "Authenticated users can upload proofs"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'governance-proofs' and auth.uid() = owner );

create policy "Users can view their own proofs"
on storage.objects for select
to authenticated
using ( bucket_id = 'governance-proofs' and auth.uid() = owner );

create policy "Reviewers can view all proofs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'governance-proofs'
  and exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'reviewer'
  )
);

create policy "Users can delete their own proofs"
on storage.objects for delete
to authenticated
using ( bucket_id = 'governance-proofs' and auth.uid() = owner );
